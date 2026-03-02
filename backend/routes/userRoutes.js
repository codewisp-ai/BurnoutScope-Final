import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import { analyzeGithubActivity } from '../services/githubService.js';
import { analyzeCalendarData } from '../services/calendarService.js';
import { calculateBurnout } from '../services/burnoutCalculator.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'text/calendar', 'application/octet-stream'];
    const extOk = file.originalname.match(/\.(csv|ics)$/i);
    if (allowed.includes(file.mimetype) || extOk) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and ICS files are allowed.'));
    }
  },
});

// ─── GET /api/user/profile ─────────────────────────────────────────────────────
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.status(200).json({
      email:          user.email,
      githubUsername: user.githubUsername,
      createdAt:      user.createdAt,
      lastAnalysis:   user.lastAnalysis,
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── PUT /api/user/github ──────────────────────────────────────────────────────
router.put('/github', requireAuth, async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername?.trim()) {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { githubUsername: githubUsername.trim() },
      { new: true }
    ).select('-password');

    res.status(200).json({ githubUsername: user.githubUsername });
  } catch (error) {
    console.error('Update github error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/user/analyze ────────────────────────────────────────────────────
// Authenticated analysis: uses stored githubUsername + optional calendar upload.
router.post('/analyze', requireAuth, upload.single('calendar'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Use body override first, then stored username
    const usernameToUse = req.body.githubUsername?.trim() || user.githubUsername;
    if (!usernameToUse) {
      return res.status(400).json({
        error: 'No GitHub username found. Please add one to your profile.',
      });
    }

    // 1️⃣ GitHub Analysis
    const githubData = await analyzeGithubActivity(usernameToUse);

    // 2️⃣ Calendar Analysis (optional)
    // let calendarData = null;
    // if (req.file) {
    //   calendarData = analyzeCalendarData(
    //     req.file.buffer,
    //     req.file.originalname,
    //     req.file.mimetype
    //   );
    // }

    let calendarData = null;
if (req.file) {
  console.log('FILE RECEIVED:', req.file.originalname, req.file.mimetype, req.file.size, 'bytes');
  try {
    calendarData = analyzeCalendarData(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    console.log('CALENDAR PARSED:', JSON.stringify(calendarData));
  } catch (e) {
    console.error('CALENDAR PARSE ERROR:', e.message);
  }
} else {
  console.log('NO FILE IN REQUEST');
}

    // 3️⃣ Burnout Calculation
    const burnoutResult = calculateBurnout(githubData, calendarData);

    // 4️⃣ If the user overrode the username, persist it
    if (req.body.githubUsername?.trim() && req.body.githubUsername.trim() !== user.githubUsername) {
      await User.findByIdAndUpdate(req.userId, {
        githubUsername: req.body.githubUsername.trim(),
        lastAnalysis: new Date(),
      });
    } else {
      await User.findByIdAndUpdate(req.userId, { lastAnalysis: new Date() });
    }

    res.status(200).json({ githubData, calendarData, ...burnoutResult });
  } catch (error) {
    console.error('Authenticated analyze error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;