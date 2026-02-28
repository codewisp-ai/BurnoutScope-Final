/**
 * TimelineChart.jsx
 * Horizontal scrollable, zoomable 30-day commit + meeting timeline.
 * Props: { days, zoom, onDayClick, selectedDate }
 *
 * `days` is an array of day objects:
 * { date, commits, meetingHours, isWeekend, isLateNight, isSpike, isCrash, risk }
 */

import { useRef, useState, useCallback } from 'react';
import TimelineTooltip from './TimelineTooltip';

// ─── Bar Color logic ─────────────────────────────────────────────────────────
function barColor(day) {
  if (day.isCrash)   return 'from-red-600 to-red-400';
  if (day.isSpike)   return 'from-orange-500 to-amber-400';
  if (day.isWeekend) return 'from-purple-600 to-purple-400';
  if (day.commits === 0) return 'from-white/5 to-white/10';
  // Intensity-based amber gradient
  return 'from-amber-700 to-amber-400';
}

function barOpacity(commits, maxCommits) {
  if (commits === 0) return 0.2;
  return 0.4 + (commits / maxCommits) * 0.6;
}

// ─── Day Label ────────────────────────────────────────────────────────────────
function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day:  d.toLocaleDateString('en-US', { day: 'numeric' }),
    week: d.toLocaleDateString('en-US', { weekday: 'short' }),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
  };
}

export default function TimelineChart({ days = [], zoom = 1, onDayClick, selectedDate }) {
  const scrollRef   = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, data: null, x: 0, y: 0 });

  const maxCommits     = Math.max(...days.map(d => d.commits), 1);
  const maxMeetingHrs  = Math.max(...days.map(d => d.meetingHours || 0), 0.1);
  const COL_BASE       = 48; // px per column at zoom=1
  const colWidth       = Math.round(COL_BASE * zoom);
  const CHART_HEIGHT   = 160; // px for commit bars
  const MEETING_HEIGHT = 48;  // px for meeting bars

  const handleMouseEnter = useCallback((e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      data: day,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(t => ({ ...t, visible: false }));
  }, []);

  // Show month label only when month changes
  let lastMonth = null;

  return (
    <div className="relative w-full select-none">
      {/* ── Tooltip ─────────────────────────────────────────────────────────── */}
      <TimelineTooltip {...tooltip} />

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 px-1">
        {[
          { color: 'bg-amber-400',   label: 'Normal Day' },
          { color: 'bg-purple-400',  label: 'Weekend' },
          { color: 'bg-orange-400',  label: 'Spike' },
          { color: 'bg-red-500',     label: 'Crash' },
          { color: 'bg-sky-400',     label: 'Meetings' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${color} opacity-80`} />
            <span className="text-[11px] font-mono text-white/40">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Scrollable chart area ───────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className="relative flex items-end gap-px"
          style={{ width: `${days.length * (colWidth + 2)}px`, minWidth: '100%' }}
        >
          {days.map((day, i) => {
            const label      = dayLabel(day.date);
            const showMonth  = label.month !== lastMonth;
            if (showMonth) lastMonth = label.month;
            const isSelected = day.date === selectedDate;
            const barH       = day.commits === 0
              ? 4
              : Math.max(8, Math.round((day.commits / maxCommits) * CHART_HEIGHT));
            const meetH      = day.meetingHours > 0
              ? Math.max(4, Math.round((day.meetingHours / maxMeetingHrs) * MEETING_HEIGHT))
              : 0;

            return (
              <div
                key={day.date}
                className="relative flex flex-col items-center cursor-pointer group"
                style={{ width: colWidth, flexShrink: 0 }}
                onClick={() => onDayClick?.(day)}
                onMouseEnter={e => handleMouseEnter(e, day)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Month label */}
                {showMonth && (
                  <div
                    className="absolute -top-6 left-0 text-[9px] font-mono text-white/25 uppercase tracking-widest whitespace-nowrap"
                  >
                    {label.month}
                  </div>
                )}

                {/* Spike / Crash zone highlight */}
                {(day.isSpike || day.isCrash) && (
                  <div
                    className={`absolute inset-x-0 rounded-t ${
                      day.isCrash ? 'bg-red-500/8' : 'bg-orange-500/8'
                    }`}
                    style={{ bottom: 0, top: -24 }}
                  />
                )}

                {/* Weekend background */}
                {day.isWeekend && (
                  <div className="absolute inset-x-0 bottom-0 bg-purple-500/6 rounded" style={{ top: -24 }} />
                )}

                {/* Commit bar */}
                <div className="relative w-full flex items-end justify-center" style={{ height: CHART_HEIGHT }}>
                  <div
                    className={`w-full max-w-[36px] rounded-t bg-gradient-to-t ${barColor(day)} transition-all duration-300 group-hover:brightness-125`}
                    style={{
                      height: barH,
                      opacity: barOpacity(day.commits, maxCommits),
                      boxShadow: isSelected ? '0 0 12px rgba(251,191,36,0.5)' : undefined,
                      outline: isSelected ? '1px solid rgba(251,191,36,0.6)' : undefined,
                    }}
                  />
                </div>

                {/* Meeting bar (below commit bar) */}
                <div className="relative w-full flex items-end justify-center mt-0.5" style={{ height: MEETING_HEIGHT }}>
                  {meetH > 0 && (
                    <div
                      className="w-full max-w-[36px] rounded bg-gradient-to-t from-sky-700 to-sky-400 transition-all duration-300 group-hover:brightness-125"
                      style={{ height: meetH, opacity: 0.7 }}
                    />
                  )}
                </div>

                {/* Date labels */}
                <div className="mt-1.5 flex flex-col items-center gap-0.5">
                  {zoom >= 0.8 && (
                    <span className="text-[9px] font-mono text-white/50 leading-none">{label.week}</span>
                  )}
                  <span className={`text-[10px] font-mono leading-none ${isSelected ? 'text-amber-400' : 'text-white/30'}`}>
                    {label.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels (absolute left) */}
        <div className="absolute left-0 top-0 flex flex-col justify-between pointer-events-none"
             style={{ height: CHART_HEIGHT }}>
          {[maxCommits, Math.round(maxCommits / 2), 0].map((v, i) => (
  <span key={i} className="text-[9px] font-mono text-white/20 -translate-x-full pr-1">{v}</span>
))}
        </div>
      </div>

      {/* ── Chart axis labels ────────────────────────────────────────────────── */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] font-mono text-white/20">← Older</span>
        <span className="text-[10px] font-mono text-white/20">Today →</span>
      </div>
    </div>
  );
}