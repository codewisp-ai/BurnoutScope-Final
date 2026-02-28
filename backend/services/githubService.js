import axios from 'axios';

/**
 * Fetches and analyzes GitHub events for burnout signals.
 * @param {string} username - The GitHub username to analyze.
 * @returns {Promise<Object>} Analyzed commit data.
 */
export async function analyzeGithubActivity(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/events`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Optional: Add a Personal Access Token in production to avoid rate limits
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Filter for PushEvents within the last 30 days
    const pushEvents = response.data.filter(event => {
      const eventDate = new Date(event.created_at);
      return event.type === 'PushEvent' && eventDate >= thirtyDaysAgo;
    });

    let lateNightCommits = 0;
    let earlyMorningCommits = 0;
    let weekendCommits = 0;
    const dailyActivity = {};
    const weeklyCounts = [0, 0, 0, 0, 0]; // 5 weeks to cover a 30-day span

pushEvents.forEach(event => {
  const commitCount = event.payload?.commits?.length || 1;

  const date = new Date(event.created_at);
  const hour = date.getHours();
  const day = date.getDay();
  const dateString = date.toISOString().split('T')[0];

  // Late Night
  if (hour >= 23) lateNightCommits += commitCount;

  // Early Morning
  if (hour < 7) earlyMorningCommits += commitCount;

  // Weekend
  if (day === 0 || day === 6) weekendCommits += commitCount;

  // Daily Activity
  dailyActivity[dateString] = (dailyActivity[dateString] || 0) + commitCount;

  // Weekly tracking
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffDays / 7);

  if (weekIndex < 5) weeklyCounts[weekIndex] += commitCount;
});

  const totalCommits = Object.values(dailyActivity).reduce((a, b) => a + b, 0);

    // 5. Spike and Crash Detection
    // Average weekly commits (excluding current partial week if necessary, but here we use simple 30-day avg)
    const avgWeekly = totalCommits / 4;
    let spikeDetected = false;
    let crashDetected = false;

    for (let i = 0; i < weeklyCounts.length; i++) {
      // Spike: One week is > 2x average
      if (avgWeekly > 0 && weeklyCounts[i] > (avgWeekly * 2)) {
        spikeDetected = true;
        
        // Crash: After a spike (moving towards the present, i-1 is a more recent week), 
        // commits drop by more than 50% compared to the spike week.
        if (i > 0 && weeklyCounts[i - 1] < (weeklyCounts[i] * 0.5)) {
          crashDetected = true;
        }
      }
    }

    return {
      lateNightCommits,
      earlyMorningCommits,
      weekendCommits,
      totalCommits,
      spikeDetected,
      crashDetected,
      dailyActivity
    };

  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('User not found on GitHub');
    }
    throw new Error(`GitHub API Error: ${error.message}`);
  }
}