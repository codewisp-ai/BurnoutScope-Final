const PATTERN_META = {
  'Night Owl':           { icon: '🦉', color: 'indigo' },
  'Early Bird':          { icon: '🌅', color: 'sky' },
  'Weekend Warrior':     { icon: '⚔️',  color: 'amber' },
  'Workload Spike':      { icon: '📈', color: 'orange' },
  'Post-Spike Crash':    { icon: '📉', color: 'red' },
  'Burnout Signal':      { icon: '🔥', color: 'red' },
  'Meeting Overload':    { icon: '📅', color: 'purple' },
  'Schedule Collapse':   { icon: '💥', color: 'rose' },
  'Back-to-Back Meetings': { icon: '🔗', color: 'pink' },
};

const colorMap = {
  indigo: { badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300', dot: 'bg-indigo-400', bar: 'bg-indigo-400' },
  sky:    { badge: 'bg-sky-500/15 border-sky-500/30 text-sky-300',         dot: 'bg-sky-400',    bar: 'bg-sky-400' },
  amber:  { badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',   dot: 'bg-amber-400',  bar: 'bg-amber-400' },
  orange: { badge: 'bg-orange-500/15 border-orange-500/30 text-orange-300',dot: 'bg-orange-400', bar: 'bg-orange-400' },
  red:    { badge: 'bg-red-500/15 border-red-500/30 text-red-300',         dot: 'bg-red-400',    bar: 'bg-red-400' },
  purple: { badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',dot: 'bg-purple-400', bar: 'bg-purple-400' },
  rose:   { badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300',      dot: 'bg-rose-400',   bar: 'bg-rose-400' },
  pink:   { badge: 'bg-pink-500/15 border-pink-500/30 text-pink-300',      dot: 'bg-pink-400',   bar: 'bg-pink-400' },
};

function severityColor(score) {
  if (score >= 60) return { label: 'High Risk', bar: 'bg-red-400', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]' };
  if (score >= 30) return { label: 'Moderate', bar: 'bg-amber-400', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]' };
  return { label: 'Low Risk', bar: 'bg-emerald-400', text: 'text-emerald-400', glow: '' };
}

export default function BehaviorPatternsCard({ patternsDetected = [], severityScore = 0, patternInsights = [] }) {
  const sev = severityColor(severityScore);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 ${sev.glow}`}>
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-400/15 border border-violet-400/25 flex items-center justify-center">
            <span className="text-base">🧠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Behavioral Patterns</h3>
            <p className="text-xs text-white/30 font-mono">Predictive pattern analysis</p>
          </div>
        </div>
        <span className={`text-xs font-mono px-3 py-1 rounded-full border ${sev.text} bg-white/5 border-white/10 uppercase tracking-widest`}>
          {sev.label}
        </span>
      </div>

      {/* Severity bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-mono text-white/35 tracking-widest uppercase">Pattern Severity</span>
          <span className={`text-sm font-black font-mono ${sev.text}`}>{severityScore}<span className="text-white/30 text-xs">/100</span></span>
        </div>
        <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${sev.bar} transition-all duration-1000 ease-out`}
            style={{ width: `${severityScore}%` }}
          />
        </div>
      </div>

      {/* Patterns list */}
      {patternsDetected.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 border border-dashed border-white/10 rounded-xl">
          <span className="text-2xl">✅</span>
          <p className="text-sm text-white/40 font-mono">No behavioral patterns detected</p>
          <p className="text-xs text-white/20">Your coding habits look healthy!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {patternsDetected.map((pattern, i) => {
            const meta = PATTERN_META[pattern] || { icon: '⚠️', color: 'amber' };
            const colors = colorMap[meta.color] || colorMap.amber;
            const insight = patternInsights[i] || '';

            return (
              <div
                key={pattern}
                className="group rounded-xl border border-white/8 bg-white/4 p-4 hover:bg-white/7 hover:border-white/15 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                        {pattern}
                      </span>
                    </div>
                    {insight && (
                      <p className="text-xs text-white/50 leading-relaxed">{insight}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}