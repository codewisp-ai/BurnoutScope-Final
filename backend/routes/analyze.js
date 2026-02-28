import express from 'express';
import multer from 'multer';
import { analyzeGithubActivity } from '../services/githubService.js';
import { analyzeCalendarData } from '../services/calendarService.js';
import { calculateBurnout } from '../services/burnoutCalculator.js';

const router = express.Router();

// Configure multer (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/analyze
router.post('/', upload.single('calendar'), async (req, res) => {
  try {
    const { githubUsername } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    // 1️⃣ GitHub Analysis
    const githubData = await analyzeGithubActivity(githubUsername);

    // 2️⃣ Calendar Analysis (Optional)
    let calendarData = null;

    if (req.file) {
      calendarData = analyzeCalendarData(req.file.buffer);
    }

    // 3️⃣ Unified Burnout Calculation
    const burnoutResult = calculateBurnout(githubData, calendarData);

    // 4️⃣ Final Response
    res.status(200).json({
      githubData,
      calendarData,
      ...burnoutResult
    });

  } catch (error) {
    console.error("Error in analyze route:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;