import express from 'express';
import multer from 'multer';
import { analyzeGithubActivity } from '../services/githubService.js';
import { analyzeCalendarData } from '../services/calendarService.js';
import { calculateBurnout } from '../services/burnoutCalculator.js';
import analyzeBehaviorPatterns from '../services/behaviorAnalyzer.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── Existing: POST /api/analyze ───────────────────────────────────────────────
router.post('/', upload.single('calendar'), async (req, res) => {
  try {
    const { githubUsername } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    const githubData = await analyzeGithubActivity(githubUsername);

    let calendarData = null;
    if (req.file) {
      calendarData = analyzeCalendarData(req.file.buffer);
    }

    const burnoutResult = calculateBurnout(githubData, calendarData);

    res.status(200).json({
      githubData,
      calendarData,
      ...burnoutResult
    });
  } catch (error) {
    console.error('Error in analyze route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── New: GET /api/analyze/:username/patterns ──────────────────────────────────
router.get('/:username/patterns', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    const githubData = await analyzeGithubActivity(username.trim());

    // Calendar data is optional — passed as JSON query param for GET requests
    let calendarData = null;
    if (req.query.calendarData) {
      try {
        calendarData = JSON.parse(req.query.calendarData);
      } catch {
        return res.status(400).json({ error: 'Invalid calendarData JSON in query params.' });
      }
    }

    const { patternsDetected, severityScore, patternInsights } =
      analyzeBehaviorPatterns(githubData, calendarData);

    res.status(200).json({
      githubData,
      calendarData,
      patternsDetected,
      severityScore,
      patternInsights
    });
  } catch (error) {
    console.error('Error in patterns route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;