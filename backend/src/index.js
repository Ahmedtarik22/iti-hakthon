import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import membersRoutes from './routes/members.js';
import transactionsRoutes from './routes/transactions.js';
import categoriesRoutes from './routes/categories.js';
import adminUsersRoutes from './routes/admin/users.js';
import fineConfigRoutes from './routes/admin/fineConfig.js';
import auditLogRoutes from './routes/admin/auditLog.js';
import reportsRoutes from './routes/reports.js';
import localeRoutes from './routes/locale.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(authenticate);

app.get('/api/v1/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/members', membersRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/admin/users', adminUsersRoutes);
app.use('/api/v1/admin/fine-config', fineConfigRoutes);
app.use('/api/v1/admin/audit-log', auditLogRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/locale', localeRoutes);

app.use(errorHandler);

await connectDB();
app.listen(PORT, () => {
  console.log(`Nebras LMS API running on http://localhost:${PORT}/api/v1`);
});
