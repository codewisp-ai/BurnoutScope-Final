import { parse } from 'csv-parse/sync';

/**
 * Analyzes meeting data from a CSV buffer to identify burnout signals.
 * Expects CSV columns: startTime, endTime, title
 * @param {Buffer} buffer - The file buffer from multer.
 * @returns {Object} Calculated meeting metrics.
 */
export function analyzeCalendarData(buffer) {
  try {
    // 1. Parse CSV Data
    // columns: true returns objects using headers as keys
    // skip_empty_lines: true prevents processing of trailing newlines
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!records.length) {
      return {
        totalMeetings: 0,
        totalMeetingHours: 0,
        averageMeetingDuration: 0,
        daysWithMoreThan4Meetings: 0,
        daysWithMoreThan6HoursOfMeetings: 0,
        consecutiveMeetingBlocks: 0
      };
    }

    // 2. Data Processing
    const meetingsByDay = {};
    let totalDurationMinutes = 0;
    let consecutiveBlocks = 0;

    // Sort records by startTime to accurately calculate gaps between meetings
    const sortedMeetings = records
      .map(m => ({
        ...m,
        start: new Date(m.startTime),
        end: new Date(m.endTime)
      }))
      .filter(m => !isNaN(m.start) && !isNaN(m.end))
      .sort((a, b) => a.start - b.start);

    sortedMeetings.forEach((meeting, index) => {
      const dateKey = meeting.start.toISOString().split('T')[0];
      const durationMin = (meeting.end - meeting.start) / (1000 * 60);
      
      totalDurationMinutes += durationMin;

      // Group by day
      if (!meetingsByDay[dateKey]) {
        meetingsByDay[dateKey] = { count: 0, totalMinutes: 0 };
      }
      meetingsByDay[dateKey].count += 1;
      meetingsByDay[dateKey].totalMinutes += durationMin;

      // 3. Detect Consecutive Blocks (Gap < 15 minutes)
      if (index > 0) {
        const previousMeeting = sortedMeetings[index - 1];
        // Only check if they are on the same day
        const isSameDay = previousMeeting.start.toDateString() === meeting.start.toDateString();
        const gapMinutes = (meeting.start - previousMeeting.end) / (1000 * 60);

        if (isSameDay && gapMinutes >= 0 && gapMinutes < 15) {
          consecutiveBlocks += 1;
        }
      }
    });

    // 4. Aggregate Daily Metrics
    const dailyStats = Object.values(meetingsByDay);
    const daysWithMoreThan4Meetings = dailyStats.filter(d => d.count > 4).length;
    const daysWithMoreThan6HoursOfMeetings = dailyStats.filter(d => d.totalMinutes > 360).length;

    const totalMeetings = sortedMeetings.length;
    const totalHours = totalDurationMinutes / 60;

    return {
      totalMeetings,
      totalMeetingHours: Number(totalHours.toFixed(2)),
      averageMeetingDuration: totalMeetings > 0 ? Number((totalDurationMinutes / totalMeetings).toFixed(2)) : 0,
      daysWithMoreThan4Meetings,
      daysWithMoreThan6HoursOfMeetings,
      consecutiveMeetingBlocks: consecutiveBlocks
    };

  } catch (error) {
    console.error('Error parsing calendar CSV:', error);
    throw new Error('Failed to parse calendar data. Ensure the CSV format is correct (startTime, endTime, title).');
  }
}