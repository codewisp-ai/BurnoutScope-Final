import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import analyzeRouter from './routes/analyze.js';
import authRouter    from './routes/authRoutes.js';
import userRouter    from './routes/userRoutes.js';
import supportRouter from './routes/supportRoutes.js';

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
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/auth',    authRouter);
app.use('/api/user',    userRouter);
app.use('/api/support', supportRouter);

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('🚀 Burnout Analyzer API is running.'));

// ─── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 