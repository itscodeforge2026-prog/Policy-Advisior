import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { sendAdvisorNotification } from '../services/emailService';

const router = Router();

// ================= FAQS =================

// GET /api/support/faqs (Public)
router.get('/faqs', async (req, res) => {
  try {
    const { category, search } = req.query;

    const whereClause: any = {};
    if (category) {
      whereClause.category = category as string;
    }
    if (search) {
      whereClause.OR = [
        { question: { contains: search as string } },
        { answer: { contains: search as string } }
      ];
    }

    const list = await db.fAQ.findMany({
      where: whereClause,
      orderBy: { order: 'asc' }
    });

    return res.json(list);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/support/faqs (Admin only)
router.post('/faqs', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { category, question, answer, order } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ message: 'Category, question and answer are required' });
    }

    const faq = await db.fAQ.create({
      data: {
        category,
        question,
        answer,
        order: Number(order) || 0
      }
    });

    return res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/support/faqs/:id (Admin only)
router.delete('/faqs/:id', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    await db.fAQ.delete({ where: { id: req.params.id } });
    return res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// ================= TESTIMONIALS =================

// GET /api/support/testimonials (Public - Approved only)
router.get('/testimonials', async (req, res) => {
  try {
    const list = await db.testimonial.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/support/testimonials/all (Admin only - Lists pending & approved)
router.get('/testimonials/all', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const list = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/support/testimonials (Authenticated Customer)
router.post('/testimonials', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { review, rating, role } = req.body;
    if (!review || !rating) {
      return res.status(400).json({ message: 'Review content and rating are required' });
    }

    const profile = await db.customerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    const testimonial = await db.testimonial.create({
      data: {
        customerId: profile?.id || null,
        name: req.user!.name,
        role: role || 'Client',
        review,
        rating: Number(rating),
        status: 'PENDING'
      }
    });

    return res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/support/testimonials/:id/status (Admin only)
router.put('/testimonials/:id/status', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { status } = req.body; // APPROVED | REJECTED
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (APPROVED or REJECTED) is required' });
    }

    const updated = await db.testimonial.update({
      where: { id: req.params.id },
      data: { status }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// ================= CONTACT FORM =================

// POST /api/support/contact (Public contact form)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save as CRM Lead immediately!
    let lead = await db.lead.findFirst({ where: { email } });
    if (!lead) {
      await db.lead.create({
        data: {
          name,
          email,
          phone,
          city: 'Unknown',
          insuranceType: 'General Advisory Inquiry',
          notes: `Contact Form Message:\n${message}`,
          status: 'INTERESTED'
        }
      });
    } else {
      await db.lead.update({
        where: { id: lead.id },
        data: {
          phone,
          notes: `${lead.notes || ''}\n[Contact Query]: ${message}`
        }
      });
    }

    // Create system notification
    const adminAdvisors = await db.user.findMany({
      where: { role: { in: ['ADVISOR', 'ADMIN'] } }
    });
    for (const user of adminAdvisors) {
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'CONTACT_MESSAGE',
          message: `New message from ${name} (${email}): "${message.substring(0, 60)}..."`
        }
      });
    }
    // Send email alert to advisors
    await sendAdvisorNotification(
      `New Website Contact Form Message - ${name}`,
      `
      <h3>New Lead Message Details</h3>
      <p><strong>Lead Name:</strong> ${name}</p>
      <p><strong>Email Address:</strong> ${email}</p>
      <p><strong>Mobile Number:</strong> ${phone}</p>
      <p><strong>Message / Inquiry:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
      `
    );

    return res.json({ message: 'Message sent successfully. Our team will get back to you shortly!' });
  } catch (error) {
    console.error('Contact submit error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// ================= SETTINGS =================

// GET /api/support/settings (Public)
router.get('/settings', async (req, res) => {
  try {
    const list = await db.setting.findMany();
    const settingsMap = list.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return res.json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/support/settings (Admin only)
router.put('/settings', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { settings } = req.body; // Object: { key: value }
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object required' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.setting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string, description: 'User updated setting' }
      });
    }

    return res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
