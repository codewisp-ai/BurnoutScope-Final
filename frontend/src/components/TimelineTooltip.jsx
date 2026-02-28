/**
 * TimelineTooltip.jsx
 * Floating tooltip shown on hover over a timeline day column.
 * Props: { data, x, y, visible }
 */

const riskColor = {
  High:   'text-red-400 bg-red-500/10 border-red-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

export default function TimelineTooltip({ data, x, y, visible }) {
  if (!visible || !data) return null;

  const { date, commits, isWeekend, isSpike, isCrash, meetingHours, risk } = data;

  // Format date nicely
  const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  return (
    <div
      className="pointer-events-none fixed z-50 transition-opacity duration-150"
      style={{ left: x, top: y, transform: 'translate(-50%, -110%)' }}
    >
      <div className="relative rounded-xl border border-white/15 bg-[#0d0f14]/95 backdrop-blur-xl p-3.5 shadow-2xl min-w-[180px]">
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/15" />
        </div>

        <p className="text-xs font-mono text-white/50 mb-2 tracking-widest uppercase">{formatted}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white/40">Commits</span>
            <span className="text-sm font-black font-mono text-amber-400">{commits}</span>
          </div>

          {meetingHours > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/40">Meetings</span>
              <span className="text-sm font-black font-mono text-sky-400">{meetingHours.toFixed(1)}h</span>
            </div>
          )}

          {risk && (
            <div className={`mt-2 text-xs px-2 py-0.5 rounded-full border text-center font-mono ${riskColor[risk] || riskColor.Low}`}>
              {risk} Risk
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {isWeekend && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Weekend
              </span>
            )}
            {isSpike && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                Spike
              </span>
            )}
            {isCrash && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                Crash
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}