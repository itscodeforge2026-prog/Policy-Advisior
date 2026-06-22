import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { quoteRequestSchema } from 'shared';
import { sendQuoteConfirmation, sendAdvisorNotification } from '../services/emailService';

const router = Router();

// Middleware helper to make auth optional on quote requests
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

// POST /api/crm/quote-request (Public or Authenticated)
router.post('/quote-request', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = quoteRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.errors });
    }

    const { name, email, phone, city, occupation, income, insuranceType, coverageRequired, preferredContactTime, notes } = parsed.data;

    // Check if this lead already exists or create new one
    let lead = await db.lead.findFirst({ where: { email } });
    if (!lead) {
      lead = await db.lead.create({
        data: {
          name,
          email,
          phone,
          city,
          occupation,
          income,
          insuranceType,
          coverageRequired,
          preferredContactTime,
          notes,
          status: 'INTERESTED'
        }
      });
    } else {
      // Update existing lead status and details
      lead = await db.lead.update({
        where: { id: lead.id },
        data: {
          phone,
          city,
          occupation: occupation || lead.occupation,
          income: income || lead.income,
          insuranceType,
          coverageRequired: coverageRequired || lead.coverageRequired,
          notes: `${lead.notes || ''}\n[New Quote Request]: ${notes || ''}`
        }
      });
    }

    // Record the specific Quote Request
    const quote = await db.quoteRequest.create({
      data: {
        leadId: lead.id,
        name,
        email,
        phone,
        city,
        occupation,
        income,
        insuranceType,
        coverageRequired,
        preferredContactTime,
        notes
      }
    });

    // Send confirmation email
    await sendQuoteConfirmation(email, name, insuranceType);

    // Send notification email to both advisors
    await sendAdvisorNotification(
      `New Quote Request Submitted - ${name}`,
      `
      <h3>New Lead Quote Request Details</h3>
      <p><strong>Lead Name:</strong> ${name}</p>
      <p><strong>Email Address:</strong> ${email}</p>
      <p><strong>Mobile Number:</strong> ${phone}</p>
      <p><strong>City / Location:</strong> ${city}</p>
      <p><strong>Occupation:</strong> ${occupation || 'N/A'}</p>
      <p><strong>Annual Income:</strong> ₹${income?.toLocaleString('en-IN') || 'N/A'}</p>
      <p><strong>Insurance Segment:</strong> ${insuranceType}</p>
      <p><strong>Requested Sum Assured:</strong> ₹${coverageRequired?.toLocaleString('en-IN') || 'N/A'}</p>
      <p><strong>Best Contact Time:</strong> ${preferredContactTime || 'Anytime'}</p>
      <p><strong>Client Notes:</strong> ${notes || 'None'}</p>
      `
    );

    // Notify advisors/admin
    const adminAdvisors = await db.user.findMany({
      where: { role: { in: ['ADVISOR', 'ADMIN'] } }
    });
    for (const user of adminAdvisors) {
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'CRM_LEAD_NEW',
          message: `New Quote Request for ${insuranceType} by ${name} (${phone})`
        }
      });
    }

    return res.status(201).json({ message: 'Quote request submitted', quoteId: quote.id });
  } catch (error) {
    console.error('Error submitting quote request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/crm/leads (Advisor/Admin only)
router.get('/leads', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req, res) => {
  try {
    const { status, search } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status as string;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } }
      ];
    }

    const list = await db.lead.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(list);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/crm/leads/:id (Advisor/Admin only)
router.get('/leads/:id', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req, res) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: req.params.id },
      include: {
        quoteRequests: true,
        followUps: true,
        notesHistory: true
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return res.json(lead);
  } catch (error) {
    console.error('Error fetching lead details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/crm/leads/:id (Advisor/Admin only)
router.put('/leads/:id', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req, res) => {
  try {
    const { status, notes, occupation, income, city, phone } = req.body;
    const lead = await db.lead.update({
      where: { id: req.params.id },
      data: {
        status,
        notes,
        occupation,
        income: income ? Number(income) : undefined,
        city,
        phone
      }
    });
    return res.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/crm/notes (Advisor/Admin only)
router.post('/notes', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, leadId, note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const newNote = await db.advisorNote.create({
      data: {
        customerId: customerId || null,
        leadId: leadId || null,
        authorId: req.user!.id,
        note
      }
    });

    return res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating advisor note:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/crm/customers (Advisor/Admin only)
router.get('/customers', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req, res) => {
  try {
    const customers = await db.customerProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(customers);
  } catch (error) {
    console.error('Error fetching customers list:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/crm/customers/:id (Advisor/Admin only)
router.get('/customers/:id', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req, res) => {
  try {
    const customer = await db.customerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        appointments: true,
        reports: true,
        calculations: true,
        documents: true,
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Parse JSON columns in reports and calculations before returning
    const parsedCustomer = {
      ...customer,
      reports: customer.reports.map((r: any) => ({
        ...r,
        answers: JSON.parse(r.answers as string),
        reportData: JSON.parse(r.reportData as string)
      })),
      calculations: customer.calculations.map((c: any) => ({
        ...c,
        inputs: JSON.parse(c.inputs as string),
        results: JSON.parse(c.results as string)
      }))
    };

    return res.json(parsedCustomer);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
