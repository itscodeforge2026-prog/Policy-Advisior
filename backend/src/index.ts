import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import aiRoutes from './routes/aiRoutes';
import calculatorRoutes from './routes/calculatorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import crmRoutes from './routes/crmRoutes';
import blogRoutes from './routes/blogRoutes';
import documentRoutes from './routes/documentRoutes';
import supportRoutes from './routes/supportRoutes';

import { errorHandler } from './middleware/errorMiddleware';

// Initialize dotenv manually just in case
import * as dotenvConfig from 'dotenv';
dotenvConfig.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://policy-advisior-frontend.vercel.app'
];
if (process.env.FRONTEND_URL) {
  const extra = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...extra);
}

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      // Match explicit origins or any vercel.app subdomain
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.substring(origin.indexOf('://') + 3).endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Support base64 file payloads

// Rate Limiter to prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/support', supportRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Policy Advisor API Service',
    status: 'online',
    health: '/health'
  });
});

// Base route for health checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Policy Advisor API', timestamp: new Date() });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`[Server] Policy Advisor API running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});
