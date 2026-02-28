function StatTile({ label, value, accent = false, subtext }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/8 bg-white/4 backdrop-blur p-4 hover:bg-white/8 hover:border-white/15 transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="text-xs font-mono tracking-widest text-white/35 uppercase mb-2">{label}</p>
      <p
        className={`text-2xl font-black font-mono leading-none ${
          accent ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-white/25 mt-1">{subtext}</p>}
    </div>
  );
}

function BoolTile({ label, value }) {
  const isYes = value === true;
  return (
    <div
      className={`relative overflow-hidden rounded-xl border backdrop-blur p-4 transition-all duration-300 ${
        isYes
          ? "border-red-500/30 bg-red-500/8 hover:bg-red-500/12"
          : "border-emerald-500/25 bg-emerald-500/6 hover:bg-emerald-500/10"
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent ${
          isYes ? "via-red-400/30" : "via-emerald-400/25"
        } to-transparent`}
      />
      <p className="text-xs font-mono tracking-widest text-white/35 uppercase mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isYes ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
        <span
          className={`text-lg font-black font-mono ${isYes ? "text-red-400" : "text-emerald-400"}`}
        >
          {isYes ? "YES" : "NO"}
        </span>
      </div>
    </div>
  );
}

export default function GithubStats({ githubData }) {
  const {
    totalCommits,
    lateNightCommits,
    earlyMorningCommits,
    weekendCommits,
    spikeDetected,
    crashDetected,
  } = githubData;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">GitHub Activity</h3>
          <p className="text-xs text-white/30 font-mono">Commit pattern analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatTile label="Total Commits" value={totalCommits} accent />
        <StatTile label="Late Night" value={lateNightCommits} subtext="10pm – 3am" />
        <StatTile label="Early Morning" value={earlyMorningCommits} subtext="4am – 7am" />
        <StatTile label="Weekend" value={weekendCommits} subtext="Sat & Sun" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BoolTile label="Activity Spike" value={spikeDetected} />
        <BoolTile label="Crash Detected" value={crashDetected} />
      </div>
    </div>
  );
}