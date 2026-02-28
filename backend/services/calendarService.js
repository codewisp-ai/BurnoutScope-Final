import { parse } from 'csv-parse/sync';
import ical from 'node-ical';

// ─── Shared: compute metrics from a normalized array of { start, end } ────────
function computeMetrics(meetings) {
  if (!meetings.length) {
    return {
      totalMeetings: 0,
      totalMeetingHours: 0,
      averageMeetingDuration: 0,
      daysWithMoreThan4Meetings: 0,
      daysWithMoreThan6HoursOfMeetings: 0,
      consecutiveMeetingBlocks: 0
    };
  }

  const sorted = meetings
    .filter(m => m.start instanceof Date && m.end instanceof Date
                 && !isNaN(m.start) && !isNaN(m.end))
    .sort((a, b) => a.start - b.start);

  const meetingsByDay = {};
  let totalDurationMinutes = 0;
  let consecutiveBlocks = 0;

  sorted.forEach((meeting, index) => {
    const dateKey = meeting.start.toISOString().split('T')[0];
    const durationMin = (meeting.end - meeting.start) / (1000 * 60);

    totalDurationMinutes += durationMin;

    if (!meetingsByDay[dateKey]) meetingsByDay[dateKey] = { count: 0, totalMinutes: 0 };
    meetingsByDay[dateKey].count += 1;
    meetingsByDay[dateKey].totalMinutes += durationMin;

    if (index > 0) {
      const prev = sorted[index - 1];
      const isSameDay = prev.start.toDateString() === meeting.start.toDateString();
      const gapMinutes = (meeting.start - prev.end) / (1000 * 60);
      if (isSameDay && gapMinutes >= 0 && gapMinutes < 15) consecutiveBlocks++;
    }
  });

  const dailyStats = Object.values(meetingsByDay);

  return {
    totalMeetings: sorted.length,
    totalMeetingHours: Number((totalDurationMinutes / 60).toFixed(2)),
    averageMeetingDuration: Number((totalDurationMinutes / sorted.length).toFixed(2)),
    daysWithMoreThan4Meetings: dailyStats.filter(d => d.count > 4).length,
    daysWithMoreThan6HoursOfMeetings: dailyStats.filter(d => d.totalMinutes > 360).length,
    consecutiveMeetingBlocks: consecutiveBlocks
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const meetings = records.map(m => ({
    start: new Date(m.startTime),
    end: new Date(m.endTime)
  }));

  return computeMetrics(meetings);
}

// ─── ICS Parser ───────────────────────────────────────────────────────────────
function parseICS(buffer) {
  const icsString = buffer.toString('utf-8');
  const parsed = ical.parseICS(icsString);

  const meetings = Object.values(parsed)
    .filter(event => event.type === 'VEVENT' && event.start && event.end)
    .map(event => ({
      start: new Date(event.start),
      end: new Date(event.end)
    }));

  return computeMetrics(meetings);
}

// ─── Main export: auto-detects format from mimetype or filename ───────────────
/**
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalname - Original filename (e.g. "calendar.ics")
 * @param {string} mimetype - MIME type from multer
 */
export function analyzeCalendarData(buffer, originalname = '', mimetype = '') {
  try {
    const isICS =
      mimetype === 'text/calendar' ||
      originalname.toLowerCase().endsWith('.ics');

    return isICS ? parseICS(buffer) : parseCSV(buffer);
  } catch (error) {
    console.error('Error parsing calendar file:', error);
    throw new Error(
      'Failed to parse calendar file. For CSV: ensure columns are startTime, endTime, title. For ICS: ensure it is a valid iCalendar file.'
    );
  }
}