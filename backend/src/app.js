import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middlewares/error.js';
import ApiError from './utils/ApiError.js';

const app = express(); app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || '').split(',').map(v => v.trim()), credentials: true, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '1mb' })); app.use(express.urlencoded({ extended: true, limit: '1mb' })); app.use(cookieParser());
// Express 5 exposes req.query as a read-only getter. Reject MongoDB operator
// keys instead of using express-mongo-sanitize's incompatible assignment.
app.use((req, _res, next) => {
  if ([req.body, req.query, req.params].some(value => value && mongoSanitize.has(value))) {
    return next(new ApiError(400, 'Request contains prohibited field names'));
  }
  next();
});
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: true, legacyHeaders: false }));
app.use('/api/v1/auth', rateLimit({ windowMs: 10 * 60 * 1000, limit: 50 }), authRoutes);
app.use('/api/v1/exams', examRoutes); app.use('/api/v1/results', resultRoutes); app.use('/api/v1/admin', adminRoutes);
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'online-examination-api', timestamp: new Date().toISOString() }));
app.use('/uploads', express.static('uploads')); app.use(notFound); app.use(errorHandler);
export default app;
