import { parse } from 'csv-parse/sync';
import ical from 'node-ical';

// ─── Shared: compute metrics from normalized { start, end } array ─────────────
function computeMetrics(meetings) {
  if (!meetings.length) {
    return {
      totalMeetings: 0,
      totalMeetingHours: 0,
      meetingHours: 0,
      focusHours: 0,
      overloadDays: 0,
      averageMeetingDuration: 0,
      daysWithMoreThan4Meetings: 0,
      daysWithMoreThan6HoursOfMeetings: 0,
      consecutiveMeetingBlocks: 0,
    };
  }

  const sorted = meetings
    .filter(m => m.start instanceof Date && m.end instanceof Date
                 && !isNaN(m.start) && !isNaN(m.end)
                 && m.end > m.start)
    .sort((a, b) => a.start - b.start);

  // BUG FIX: was `if (!sorted.length) return computeMetrics([])` which caused
  // infinite-ish recursion and masked parse failures — now returns zeros directly.
  if (!sorted.length) {
    return {
      totalMeetings: 0,
      totalMeetingHours: 0,
      meetingHours: 0,
      focusHours: 0,
      overloadDays: 0,
      averageMeetingDuration: 0,
      daysWithMoreThan4Meetings: 0,
      daysWithMoreThan6HoursOfMeetings: 0,
      consecutiveMeetingBlocks: 0,
    };
  }

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
  const totalMeetingHours = Number((totalDurationMinutes / 60).toFixed(1));

  const totalFocusHours = Number(
    dailyStats.reduce((acc, d) => {
      const meetH = d.totalMinutes / 60;
      const focusH = Math.max(0, 8 - meetH);
      return acc + focusH;
    }, 0).toFixed(1)
  );

  const overloadDays = dailyStats.filter(d => d.totalMinutes > 360).length;

  return {
    totalMeetings: sorted.length,
    totalMeetingHours,
    meetingHours: totalMeetingHours,
    focusHours: totalFocusHours,
    overloadDays,
    averageMeetingDuration: Number((totalDurationMinutes / sorted.length).toFixed(1)),
    daysWithMoreThan4Meetings: dailyStats.filter(d => d.count > 4).length,
    daysWithMoreThan6HoursOfMeetings: overloadDays,
    consecutiveMeetingBlocks: consecutiveBlocks,
  };
}

// ─── Robust date builder — handles HH:MM, HH:MM:SS, H:MM, and various date formats ──
function buildDate(dateStr, timeStr) {
  if (!dateStr) return null;

  let dateNorm = dateStr.trim();

  if (timeStr) {
    let t = timeStr.trim();

    // Strip AM/PM and handle 12-hour format
    let isPM = false;
    let isAM = false;
    if (/am$/i.test(t)) { isAM = true;  t = t.replace(/\s*am$/i, '').trim(); }
    if (/pm$/i.test(t)) { isPM = true;  t = t.replace(/\s*pm$/i, '').trim(); }

    // Split into parts and normalize
    const parts = t.split(':');
    let hours   = parseInt(parts[0], 10) || 0;
    const mins  = parts[1] ? parts[1].padStart(2, '0') : '00';
    const secs  = parts[2] ? parts[2].padStart(2, '0') : '00';

    // Convert 12-hour to 24-hour
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const normalizedTime = `${String(hours).padStart(2, '0')}:${mins}:${secs}`;
    const combined = `${dateNorm}T${normalizedTime}`;
    const d = new Date(combined);
    return isNaN(d) ? null : d;
  }

  const d = new Date(dateNorm);
  return isNaN(d) ? null : d;
}

// ─── CSV Parser — handles multiple column naming conventions ──────────────────
function parseCSV(buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

   // ADD THIS TEMPORARILY
  console.log('=== CSV DEBUG ===');
  console.log('Record count:', records.length);
  if (records.length > 0) {
    console.log('First record:', JSON.stringify(records[0]));
    console.log('Keys:', Object.keys(records[0]));
  }
  // END DEBUG
  if (!records.length) return computeMetrics([]);

  const meetings = records.map(row => {
    // Build a lowercase-keyed version for flexible lookup
    const r = {};
    Object.keys(row).forEach(k => { r[k.toLowerCase().trim()] = row[k]; });

    let start = null;
    let end   = null;

    // ── Format 1: starttime / endtime (single column, e.g. "2026-02-01 09:00") ──
    if (r['starttime']) start = new Date(r['starttime']);
    if (r['endtime'])   end   = new Date(r['endtime']);

    // ── Format 2: start date + start time (separate columns) ───────────────────
    if (!start && r['start date']) {
      start = buildDate(r['start date'], r['start time'] || null);
    }
    if (!end && r['end date']) {
      end = buildDate(r['end date'], r['end time'] || null);
    }

    // ── Format 3: dtstart / dtend ───────────────────────────────────────────────
    if (!start && r['dtstart']) start = new Date(r['dtstart']);
    if (!end   && r['dtend'])   end   = new Date(r['dtend']);

    // ── Format 4: single "date" column + separate time columns ─────────────────
    if (!start && r['date']) {
      start = buildDate(r['date'], r['start time'] || null);
    }
    if (!end && r['date']) {
      end = buildDate(r['date'], r['end time'] || null);
    }

    // ── Format 5: use duration if end is still missing ─────────────────────────
    if (start && (!end || isNaN(end)) && r['duration']) {
      // Handles "1:30", "0:30", "2:00" formats
      const parts = r['duration'].split(':').map(Number);
      const totalMinutes = (parts[0] || 0) * 60 + (parts[1] || 0);
      if (!isNaN(totalMinutes) && totalMinutes > 0) {
        end = new Date(start.getTime() + totalMinutes * 60 * 1000);
      }
    }

    return { start, end };
  });

  // Debug: log how many meetings parsed successfully
  const validCount = meetings.filter(m =>
    m.start instanceof Date && !isNaN(m.start) &&
    m.end instanceof Date && !isNaN(m.end) &&
    m.end > m.start
  ).length;
  console.log(`CSV: ${records.length} records → ${validCount} valid meetings`);

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
      end:   new Date(event.end),
    }));

  console.log(`ICS: ${meetings.length} VEVENT entries found`);
  return computeMetrics(meetings);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function analyzeCalendarData(buffer, originalname = '', mimetype = '') {
  try {
    const isICS =
      mimetype === 'text/calendar' ||
      originalname.toLowerCase().endsWith('.ics');

    console.log(`analyzeCalendarData: file="${originalname}", mime="${mimetype}", isICS=${isICS}, bufferLen=${buffer?.length}`);

    const result = isICS ? parseICS(buffer) : parseCSV(buffer);
    console.log('Calendar result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error parsing calendar file:', error);
    throw new Error(
      'Failed to parse calendar file. For CSV: use columns startTime/endTime or "Start Date"/"Start Time"/"End Date"/"End Time". For ICS: ensure valid iCalendar format.'
    );
  }
}