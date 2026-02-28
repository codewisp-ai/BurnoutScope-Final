const riskConfig = {
  Low: {
    color: "text-emerald-400",
    ring: "border-emerald-400/60",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.25)]",
    bg: "from-emerald-500/10 to-transparent",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    bar: "bg-emerald-400",
  },
  Medium: {
    color: "text-amber-400",
    ring: "border-amber-400/60",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]",
    bg: "from-amber-500/10 to-transparent",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    bar: "bg-amber-400",
  },
  High: {
    color: "text-red-400",
    ring: "border-red-400/60",
    glow: "shadow-[0_0_40px_rgba(248,113,113,0.35)]",
    bg: "from-red-500/10 to-transparent",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    bar: "bg-red-400",
  },
};

export default function BurnoutCard({ burnoutScore, riskLevel, insight }) {
  const cfg = riskConfig[riskLevel] || riskConfig.Low;
  const scorePercent = Math.min(100, Math.max(0, burnoutScore));
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-1 ${cfg.glow} hover:border-white/20`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bg} opacity-60 pointer-events-none`} />
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <div className="absolute top-4 right-4 w-full h-full border-t-2 border-r-2 border-white rounded-tr-2xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Label */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-mono tracking-[0.25em] text-white/40 uppercase">Burnout Index</span>
          <span className={`text-xs font-mono tracking-widest px-3 py-1 rounded-full border ${cfg.badge} uppercase`}>
            {riskLevel} Risk
          </span>
        </div>

        {/* Circular Score */}
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={`${cfg.color} transition-all duration-1000 ease-out`}
              style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-5xl font-black font-mono ${cfg.color} leading-none`}>{scorePercent}</span>
            <span className="text-xs text-white/30 mt-1 tracking-widest">/ 100</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${cfg.bar} transition-all duration-1000 ease-out`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Insight */}
        <div className="w-full bg-black/30 rounded-xl p-4 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">AI Insight</p>
          <p className="text-sm text-white/80 leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}