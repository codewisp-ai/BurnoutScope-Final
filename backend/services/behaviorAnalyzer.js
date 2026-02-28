/**
 * Analyzes GitHub and calendar data to detect behavioral patterns and burnout risk.
 * @param {Object} githubData - Output from analyzeGithubActivity
 * @param {Object|null} calendarData - Output from analyzeCalendarData (optional)
 * @returns {Object} { patternsDetected, severityScore, patternInsights }
 */
export default function analyzeBehaviorPatterns(githubData, calendarData = null) {
  if (!githubData || typeof githubData !== 'object') {
    throw new Error('Invalid githubData: must be a non-null object.');
  }

  const patternsDetected = [];
  const patternInsights = [];
  let severityScore = 0;

  const {
    lateNightCommits = 0,
    earlyMorningCommits = 0,
    weekendCommits = 0,
    totalCommits = 0,
    spikeDetected = false,
    crashDetected = false,
    dailyActivity = {}
  } = githubData;

  // ── 1. Night Owl ──────────────────────────────────────────────
  if (lateNightCommits >= 5) {
    patternsDetected.push('Night Owl');
    patternInsights.push(`You made ${lateNightCommits} commits after 11 PM — consistent late-night coding detected.`);
    severityScore += 20;
  }

  // ── 2. Early Bird ─────────────────────────────────────────────
  if (earlyMorningCommits >= 5) {
    patternsDetected.push('Early Bird');
    patternInsights.push(`${earlyMorningCommits} commits before 7 AM suggest very early morning work sessions.`);
    severityScore += 15;
  }

  // ── 3. Weekend Warrior ────────────────────────────────────────
  if (weekendCommits >= 5) {
    patternsDetected.push('Weekend Warrior');
    patternInsights.push(`${weekendCommits} weekend commits indicate you regularly work on Saturdays/Sundays.`);
    severityScore += 15;
  }

  // ── 4. Workload Spike ─────────────────────────────────────────
  if (spikeDetected) {
    patternsDetected.push('Workload Spike');
    patternInsights.push('A sudden surge in commits was detected — workload spiked significantly above your average.');
    severityScore += 20;
  }

  // ── 5. Post-Spike Crash ───────────────────────────────────────
  if (crashDetected) {
    patternsDetected.push('Post-Spike Crash');
    patternInsights.push('Commit activity dropped sharply after a spike, which is a classic burnout warning pattern.');
    severityScore += 15;
  }

  // ── 6. Consecutive Heavy Days ─────────────────────────────────
  const dailyCounts = Object.values(dailyActivity);
  const avgDaily = dailyCounts.length > 0 ? totalCommits / dailyCounts.length : 0;
  const heavyThreshold = Math.max(avgDaily * 1.5, 3);
  let maxConsecutiveHeavy = 0;
  let currentStreak = 0;

  // Sort days and check streaks
  const sortedDays = Object.keys(dailyActivity).sort();
  sortedDays.forEach(day => {
    if (dailyActivity[day] >= heavyThreshold) {
      currentStreak++;
      maxConsecutiveHeavy = Math.max(maxConsecutiveHeavy, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  if (maxConsecutiveHeavy >= 5) {
    patternsDetected.push('Burnout Signal');
    patternInsights.push(`${maxConsecutiveHeavy} consecutive high-activity days detected — sustained overwork without recovery is a strong burnout signal.`);
    severityScore += 25;
  }

  // ── 7. Calendar: Meeting Overload ─────────────────────────────
  if (calendarData) {
    const {
      totalMeetingHours = 0,
      daysWithMoreThan4Meetings = 0,
      daysWithMoreThan6HoursOfMeetings = 0,
      consecutiveMeetingBlocks = 0
    } = calendarData;

    if (totalMeetingHours > 20) {
      patternsDetected.push('Meeting Overload');
      patternInsights.push(`${totalMeetingHours.toFixed(1)} hours in meetings this period — excessive meeting load leaves little time for deep work.`);
      severityScore += 15;
    }

    if (daysWithMoreThan6HoursOfMeetings >= 2) {
      patternsDetected.push('Schedule Collapse');
      patternInsights.push(`${daysWithMoreThan6HoursOfMeetings} days had 6+ hours of meetings — almost no focus time available.`);
      severityScore += 15;
    }

    if (consecutiveMeetingBlocks >= 5) {
      patternsDetected.push('Back-to-Back Meetings');
      patternInsights.push(`${consecutiveMeetingBlocks} back-to-back meeting blocks detected — no recovery time between meetings.`);
      severityScore += 10;
    }
  }

  // Cap at 100
  severityScore = Math.min(100, severityScore);

  return {
    patternsDetected,
    severityScore,
    patternInsights
  };
}