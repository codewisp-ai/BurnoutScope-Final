/**
 * CalendarOverlay.jsx
 * Mini 30-day calendar with workload hotspot overlays.
 * Props: { dailyActivity, calendarData, recommendations, onDateClick, selectedDate }
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLast30Days() {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function buildMonthGrid(days) {
  // Group into weeks (rows of 7, padded)
  if (!days.length) return [];
  const first = new Date(days[0] + "T12:00:00");
  const startDow = first.getDay(); // 0=Sun
  const padded = [...Array(startDow).fill(null), ...days];
  const rows = [];
  for (let i = 0; i < padded.length; i += 7) {
    rows.push(padded.slice(i, i + 7));
  }
  return rows;
}

function intensityClass(commits, max) {
  if (!commits || commits === 0) return "";
  const ratio = commits / max;
  if (ratio > 0.75) return "bg-amber-400/70";
  if (ratio > 0.5)  return "bg-amber-400/45";
  if (ratio > 0.25) return "bg-amber-400/25";
  return "bg-amber-400/12";
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────
function DayCell({ date, commits, maxCommits, hasLateNight, hasMeeting, isSelected, isToday, isWeekend, onClick }) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const dayNum = new Date(date + "T12:00:00").getDate();
  const bg     = intensityClass(commits, maxCommits);
  const hasMarker = hasLateNight || hasMeeting;

  return (
    <button
      onClick={() => onClick(date)}
      title={`${date}: ${commits} commits`}
      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-[10px] font-mono
        transition-all duration-150 hover:scale-110 hover:z-10
        ${isSelected ? "ring-1 ring-amber-400/60 bg-amber-400/20 text-amber-300" :
          isToday    ? "ring-1 ring-white/20 text-white" :
          isWeekend  ? "text-purple-300/60" : "text-white/40"}
        ${bg || "hover:bg-white/6"}
      `}
    >
      <span className="leading-none">{dayNum}</span>

      {/* Marker dots */}
      {hasMarker && (
        <div className="absolute bottom-0.5 flex gap-0.5 items-center">
          {hasLateNight && <span className="w-1 h-1 rounded-full bg-red-400" />}
          {hasMeeting   && <span className="w-1 h-1 rounded-full bg-sky-400" />}
        </div>
      )}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CalendarOverlay({
  dailyActivity = {},
  calendarData  = null,
  onDateClick,
  selectedDate,
}) {
  const days     = getLast30Days();
  const rows     = buildMonthGrid(days);
  const today    = new Date().toISOString().split("T")[0];
  const maxCommits = Math.max(...days.map(d => dailyActivity[d] || 0), 1);

  // Estimate which days have high meetings (using aggregate — best we can do without per-day calendar)
  const highMeetingDays = new Set();
  if (calendarData?.daysWithMoreThan4Meetings > 0) {
    // Mark the most recent N working days as having meetings (approximation)
    let marked = 0;
    for (let i = days.length - 1; i >= 0 && marked < calendarData.daysWithMoreThan4Meetings; i--) {
      const dow = new Date(days[i] + "T12:00:00").getDay();
      if (dow !== 0 && dow !== 6) {
        highMeetingDays.add(days[i]);
        marked++;
      }
    }
  }

  // Late night days: days with high commit counts (proxy for late-night)
  const lateNightDays = new Set(
    days.filter(d => (dailyActivity[d] || 0) > 0 && new Date(d + "T12:00:00").getHours?.() >= 22)
  );
  // Fallback: mark recent high-activity days
  if (lateNightDays.size === 0 && calendarData) {
    const sorted = [...days].sort((a, b) => (dailyActivity[b] || 0) - (dailyActivity[a] || 0));
    sorted.slice(0, 3).forEach(d => { if (dailyActivity[d] > 0) lateNightDays.add(d); });
  }

  // Get the month labels for display
  const monthsSeen = [];
  days.forEach(d => {
    const m = new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short" });
    if (!monthsSeen.includes(m)) monthsSeen.push(m);
  });

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/12 border border-amber-400/20 flex items-center justify-center">
            <span className="text-sm">📆</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Activity Calendar</h3>
            <p className="text-[10px] text-white/30 font-mono">Last 30 days · Click a date</p>
          </div>
        </div>
        <p className="text-xs font-mono text-white/25">{monthsSeen.join(" · ")}</p>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[9px] font-mono text-white/20 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-0.5">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-0.5">
            {row.map((date, ci) => {
              if (!date) return <div key={ci} className="aspect-square" />;
              const dow = new Date(date + "T12:00:00").getDay();
              return (
                <DayCell
                  key={date}
                  date={date}
                  commits={dailyActivity[date] || 0}
                  maxCommits={maxCommits}
                  hasLateNight={lateNightDays.has(date)}
                  hasMeeting={highMeetingDays.has(date)}
                  isSelected={date === selectedDate}
                  isToday={date === today}
                  isWeekend={dow === 0 || dow === 6}
                  onClick={onDateClick}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/6 flex flex-wrap gap-x-4 gap-y-1.5">
        {[
          { color: "bg-amber-400/60", label: "High activity" },
          { color: "bg-red-400",      label: "Late-night" },
          { color: "bg-sky-400",      label: "Meeting-heavy" },
          { color: "bg-purple-400/40",label: "Weekend" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[9px] font-mono text-white/30">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}