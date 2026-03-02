import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// POST /api/pulse/log — save a mood check-in
router.post("/log", requireAuth, async (req, res) => {
  try {
    const { mood, burnoutScore } = req.body;
    const validMoods = ["exhausted", "stressed", "okay", "good", "energized"];
    if (!mood || !validMoods.includes(mood)) {
      return res.status(400).json({ error: "Invalid mood value." });
    }
    const entry = { mood, burnoutScore: burnoutScore || 0, date: new Date() };
    await User.findByIdAndUpdate(req.userId, {
      $push: { pulseHistory: { $each: [entry], $slice: -30 } }, // keep last 30
    });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pulse/history — fetch mood history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("pulseHistory");
    res.json({ history: user?.pulseHistory || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;