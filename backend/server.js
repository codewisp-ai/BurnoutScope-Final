import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import analyzeRouter from './routes/analyze.js';
import authRouter    from './routes/authRoutes.js';
import userRouter    from './routes/userRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MongoDB Connection ───────────────────────────────────────────────
if (!process.env.MONGODB_URI) {
  console.warn('⚠  MONGODB_URI not set — database features will not work.');
} else {
  mongoose
    .connect(process.env.MONGODB_URI) // removed deprecated options
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

// ─── Middleware ────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/auth',    authRouter);
app.use('/api/user',    userRouter);

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('🚀 Burnout Analyzer API is running.'));

// ─── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));