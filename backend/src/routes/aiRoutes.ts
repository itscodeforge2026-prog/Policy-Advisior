import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { chatWithGemini, generateNeedsAnalysisReport, generateAdvisorTools } from '../services/aiService';
import { needsAnalysisSchema } from 'shared';

const router = Router();

// Middleware helper to make auth optional on chat and quiz endpoints
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

// POST /api/ai/chat
router.post('/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || !conversationId) {
      return res.status(400).json({ message: 'message and conversationId are required' });
    }

    const userId = req.user?.id || null;
    const responseText = await chatWithGemini(conversationId, userId, message);

    return res.json({ reply: responseText });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// GET /api/ai/chat-history/:conversationId
router.get('/chat-history/:conversationId', async (req, res) => {
  try {
    const list = await db.aIChatHistory.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' }
    });
    return res.json(list);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/ai/quiz-report
router.post('/quiz-report', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = needsAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid quiz inputs', errors: parsed.error.errors });
    }

    const answers = parsed.data;

    // Generate AI recommendations
    const reportData = await generateNeedsAnalysisReport(answers);

    // If user is authenticated, link to their CustomerProfile
    let customerProfileId = null;
    if (req.user) {
      const profile = await db.customerProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (profile) {
        customerProfileId = profile.id;
      }
    }

    // Save report in database
    const savedReport = await db.needsAnalysisReport.create({
      data: {
        customerId: customerProfileId,
        answers: JSON.stringify(answers),
        reportData: JSON.stringify(reportData)
      }
    });

    return res.status(201).json({
      id: savedReport.id,
      answers,
      reportData,
      createdAt: savedReport.createdAt
    });
  } catch (error: any) {
    console.error('Quiz report generation failed:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// POST /api/ai/advisor-tools (Advisor/Admin only)
router.post('/advisor-tools', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { action, data } = req.body; // action: 'meeting_notes' | 'whatsapp_followup' | 'email_followup'
    if (!action || !data || !data.name) {
      return res.status(400).json({ message: 'action, data, and client name are required' });
    }

    const draft = await generateAdvisorTools(action, data);
    return res.json({ draft });
  } catch (error: any) {
    console.error('Advisor tool error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
