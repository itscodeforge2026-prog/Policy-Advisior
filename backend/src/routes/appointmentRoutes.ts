import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { appointmentBookSchema } from 'shared';
import { sendAppointmentConfirmation, sendAppointmentStatusUpdate, sendAdvisorNotification, sendSpecificAdvisorNotification } from '../services/emailService';

const router = Router();

// Middleware helper to make auth optional on booking
const optionalAuth = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.access_token;
  const tokenToVerify = token || cookieToken;

  if (tokenToVerify) {
    authenticateJWT(req, res, next);
  } else {
    next();
  }
};

// POST /api/appointments/book (Public or Authenticated)
router.post('/book', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = appointmentBookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.errors });
    }

    const { name, email, phone, type, date, timeSlot, purpose, notes } = parsed.data;

    let customerId: string | null = null;
    let targetUserId: string | null = null;

    if (req.user) {
      targetUserId = req.user.id;
      const profile = await db.customerProfile.findUnique({ where: { userId: req.user.id } });
      if (profile) {
        customerId = profile.id;
      }
    }

    // Smart CRM flow: check if this is an existing customer/lead. If not, create a Lead!
    let leadId = null;
    const existingCustomer = await db.user.findUnique({ where: { email } });
    if (!existingCustomer) {
      const existingLead = await db.lead.findFirst({ where: { email } });
      if (!existingLead) {
        const newLead = await db.lead.create({
          data: {
            name,
            email,
            phone,
            city: 'Unknown',
            insuranceType: purpose,
            status: 'INTERESTED',
            notes: `Auto-created from appointment booking. Purpose: ${purpose}. Notes: ${notes || ''}`
          }
        });
        leadId = newLead.id;
      } else {
        leadId = existingLead.id;
      }
    }

    // Determine Advisor
    const requestedAdvisor = parsed.data.advisor;
    const advisorName = requestedAdvisor || (purpose.toLowerCase().includes('lic') || purpose.toLowerCase().includes('pension') 
      ? 'Bharat Shah' 
      : 'Dimple Shah');
    const advisorEmail = advisorName === 'Bharat Shah' ? 'bharatshah_1969@yahoo.in' : 'dimple_shah@yahoo.in';

    // Find the Advisor user id in the database
    let advisorId: string | null = null;
    try {
      const advisorUser = await db.user.findFirst({
        where: { email: advisorEmail }
      });
      if (advisorUser) {
        advisorId = advisorUser.id;
      }
    } catch (dbErr) {
      console.error('Advisor lookup error:', dbErr);
    }

    // Create the appointment
    const parsedDate = new Date(date);
    const appointment = await db.appointment.create({
      data: {
        customerId,
        advisorId,
        name,
        email,
        phone,
        type,
        status: 'PENDING',
        date: parsedDate,
        timeSlot,
        purpose,
        notes
      }
    });

    // Create a follow-up or lead activity log if lead exists
    if (leadId) {
      await db.followUp.create({
        data: {
          leadId,
          appointmentId: appointment.id,
          scheduledAt: parsedDate,
          notes: `Meeting scheduled: ${timeSlot} (${type})`
        }
      });
    }

    // Send confirmation email
    await sendAppointmentConfirmation(email, name, date, timeSlot, type, advisorName);

    // Send specific advisor notification (as requested, Bharat Shah/Dimple Shah gets direct email)
    await sendSpecificAdvisorNotification(
      advisorEmail,
      advisorName,
      `New Appointment Booked - ${name}`,
      `
      <h3>New Consultation Scheduled</h3>
      <p>Someone had booked a slot with you. Here are the details:</p>
      <p><strong>Client Name:</strong> ${name}</p>
      <p><strong>Email Address:</strong> ${email}</p>
      <p><strong>Mobile Number:</strong> ${phone}</p>
      <p><strong>Meeting Mode:</strong> ${type}</p>
      <p><strong>Scheduled Date:</strong> ${date}</p>
      <p><strong>Time Slot:</strong> ${timeSlot}</p>
      <p><strong>Purpose of Meeting:</strong> ${purpose}</p>
      <p><strong>Client Notes:</strong> ${notes || 'None'}</p>
      `
    );

    // Send notification email to both advisors as fallback for portal sync
    await sendAdvisorNotification(
      `New Appointment Booked - ${name}`,
      `
      <h3>New Consultation Scheduled</h3>
      <p><strong>Client Name:</strong> ${name}</p>
      <p><strong>Email Address:</strong> ${email}</p>
      <p><strong>Mobile Number:</strong> ${phone}</p>
      <p><strong>Meeting Mode:</strong> ${type}</p>
      <p><strong>Scheduled Date:</strong> ${date}</p>
      <p><strong>Time Slot:</strong> ${timeSlot}</p>
      <p><strong>Purpose of Meeting:</strong> ${purpose}</p>
      <p><strong>Client Notes:</strong> ${notes || 'None'}</p>
      `
    );

    // Create system notification for advisor/admin
    const notificationMessage = `New appointment booked by ${name} for ${date} at ${timeSlot} (${type}). Purpose: ${purpose}`;
    const adminAdvisors = await db.user.findMany({
      where: { role: { in: ['ADVISOR', 'ADMIN'] } }
    });
    for (const adminUser of adminAdvisors) {
      await db.notification.create({
        data: {
          userId: adminUser.id,
          type: 'APPOINTMENT_NEW',
          message: notificationMessage
        }
      });
    }

    // Create notification for customer if logged in
    if (targetUserId) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: 'APPOINTMENT_PENDING',
          message: `Your appointment request for ${date} at ${timeSlot} is pending confirmation.`
        }
      });
    }

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/appointments (Authenticated)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Customer: see their own appointments
    if (req.user.role === 'CUSTOMER') {
      const profile = await db.customerProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) return res.json([]);

      const list = await db.appointment.findMany({
        where: { customerId: profile.id },
        orderBy: { date: 'asc' }
      });
      return res.json(list);
    }

    // Advisor / Admin: see all appointments
    const list = await db.appointment.findMany({
      orderBy: { date: 'asc' },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return res.json(list);
  } catch (error) {
    console.error('Error listing appointments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/appointments/:id (Authenticated)
router.put('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { status, feedback } = req.body;
    const appointmentId = req.params.id;

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization checks:
    // Customers can only cancel their own appointments.
    if (req.user.role === 'CUSTOMER') {
      if (status !== 'CANCELLED') {
        return res.status(403).json({ message: 'Customers are only permitted to cancel appointments' });
      }
      if (appointment.customer?.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: Cannot cancel another user\'s appointment' });
      }
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: status || undefined,
        feedback: feedback || undefined
      }
    });

    // Notify user of update via email
    const emailToNotify = appointment.email;
    const nameToNotify = appointment.name;
    const formattedDate = appointment.date.toISOString().split('T')[0];

    await sendAppointmentStatusUpdate(emailToNotify, nameToNotify, formattedDate, appointment.timeSlot, status);

    // Notify user in system if linked
    if (appointment.customer?.userId) {
      await db.notification.create({
        data: {
          userId: appointment.customer.userId,
          type: `APPOINTMENT_${status}`,
          message: `Your appointment on ${formattedDate} at ${appointment.timeSlot} is now ${status.toLowerCase()}.`
        }
      });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
