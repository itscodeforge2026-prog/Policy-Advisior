import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

// POST /api/documents/upload (Authenticated)
router.post('/upload', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, fileBase64 } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Document name and type are required' });
    }

    const profile = await db.customerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Mock upload URL generation.
    // In production, fileBase64 would be uploaded to Cloudinary, returning a secure URL.
    const mockUrl = `https://res.cloudinary.com/Policy Advisor/image/upload/v12345/${type.toLowerCase()}_mock_file.pdf`;
    
    const doc = await db.document.create({
      data: {
        customerId: profile.id,
        name,
        type,
        url: mockUrl,
        secureUrl: mockUrl,
        cloudinaryPublicId: `mock_${Date.now()}`,
        status: 'PENDING'
      }
    });

    // Notify advisors
    const adminAdvisors = await db.user.findMany({
      where: { role: { in: ['ADVISOR', 'ADMIN'] } }
    });
    for (const user of adminAdvisors) {
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'DOCUMENT_UPLOADED',
          message: `Client ${req.user!.name} uploaded a new document: ${name} (${type})`
        }
      });
    }

    return res.status(201).json(doc);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/documents (Authenticated: customers see their own, advisors/admins can fetch by customerId query)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Advisors / Admins can inspect files for a specific client
    if (['ADVISOR', 'ADMIN'].includes(req.user.role)) {
      const { customerId } = req.query;
      if (!customerId) {
        return res.status(400).json({ message: 'customerId query parameter is required for advisors' });
      }
      
      const list = await db.document.findMany({
        where: { customerId: customerId as string },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(list);
    }

    // Regular customers fetch their own uploads
    const profile = await db.customerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.json([]);
    }

    const list = await db.document.findMany({
      where: { customerId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(list);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/documents/:id/status (Advisor/Admin only)
router.put('/:id/status', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // VERIFIED | REJECTED
    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (VERIFIED or REJECTED) is required' });
    }

    const doc = await db.document.findUnique({
      where: { id: req.params.id },
      include: { customer: { include: { user: true } } }
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedDoc = await db.document.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Notify customer in the system
    await db.notification.create({
      data: {
        userId: doc.customer.userId,
        type: `DOCUMENT_${status}`,
        message: `Your document "${doc.name}" has been ${status.toLowerCase()} by your advisor.`
      }
    });

    return res.json(updatedDoc);
  } catch (error) {
    console.error('Error updating document status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
