/**
 * Calculates burnout score and risk level based on GitHub and Calendar data.
 * @param {Object} githubData - Data returned from GitHub analysis.
 * @param {Object|null} calendarData - Data returned from calendar analysis (optional).
 * @returns {Object} Burnout evaluation result.
 */
export function calculateBurnout(githubData, calendarData = null) {
  let score = 0;
  const insights = [];

  // --- GitHub Scoring Logic (Maintained) ---
  const {
    lateNightCommits,
    earlyMorningCommits,
    weekendCommits,
    totalCommits,
    spikeDetected,
    crashDetected
  } = githubData;

  // 1. Late night activity weight
  if (lateNightCommits > 5) {
    score += 15;
    insights.push("Frequent late-night coding detected.");
  } else if (lateNightCommits > 0) {
    score += 5;
  }

  // 2. Early morning activity weight
  if (earlyMorningCommits > 10) {
    score += 20;
    insights.push("High early-morning activity detected.");
  } else if (earlyMorningCommits > 3) {
    score += 10;
  }

  // 3. Weekend work weight
  if (weekendCommits > 8) {
    score += 15;
    insights.push("Heavy weekend workload detected.");
  } else if (weekendCommits > 2) {
    score += 8;
  }

  // 4. Spike detection
  if (spikeDetected) {
    score += 20;
    insights.push("Recent workload spike detected.");
  }

  // 5. Crash after spike
  if (crashDetected) {
    score += 15;
    insights.push("Activity crash after spike detected.");
  }

  // 6. Overall workload intensity
  if (totalCommits > 50) {
    score += 15;
    insights.push("Very high overall activity level.");
  } else if (totalCommits > 25) {
    score += 8;
  }

  // --- Calendar Scoring Logic (New) ---
  if (calendarData) {
    const {
      totalMeetingHours,
      daysWithMoreThan4Meetings,
      daysWithMoreThan6HoursOfMeetings,
      consecutiveMeetingBlocks,
      averageMeetingDuration
    } = calendarData;

    // 1. Excessive meeting hours
    if (totalMeetingHours > 20) {
      score += 15;
      insights.push("Excessive total meeting hours detected.");
    }

    // 2. Frequent high-meeting days
    if (daysWithMoreThan4Meetings >= 3) {
      score += 10;
      insights.push("Frequent high-meeting days detected.");
    }

    // 3. Days overloaded with meetings
    if (daysWithMoreThan6HoursOfMeetings >= 2) {
      score += 15;
      insights.push("Multiple days overloaded with meetings.");
    }

    // 4. Back-to-back meeting patterns
    if (consecutiveMeetingBlocks >= 5) {
      score += 10;
      insights.push("Back-to-back meeting patterns detected.");
    }

    // 5. Long meeting duration
    if (averageMeetingDuration > 90) {
      score += 5;
      insights.push("Long average meeting duration detected.");
    }
  }

  // Cap score at 100
  if (score > 100) score = 100;

  // Determine risk level
  let riskLevel = "Low";
  if (score >= 60) {
    riskLevel = "High";
  } else if (score >= 30) {
    riskLevel = "Medium";
  }

  return {
    burnoutScore: score,
    riskLevel,
    insight: insights.length > 0
      ? insights.join(" ")
      : "No major burnout signals detected."
  };
}