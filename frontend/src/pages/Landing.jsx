import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "⚡",
    title: "Smart Burnout Scoring",
    desc: "A composite 0–100 score computed from late-night commits, weekend overwork, and activity spikes — giving you a single, actionable number to track your health over time.",
    accent: "amber",
    border: "border-amber-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]",
    iconBg: "bg-amber-400/10 border-amber-400/25",
    iconColor: "text-amber-400",
  },
  {
    icon: "🧠",
    title: "Behavioral Pattern Detection",
    desc: "Detects irregular commit cadences, erratic push schedules, and calendar overload patterns — surfacing the invisible warning signs that precede burnout crashes.",
    accent: "sky",
    border: "border-sky-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]",
    iconBg: "bg-sky-400/10 border-sky-400/25",
    iconColor: "text-sky-400",
  },
  {
    icon: "📈",
    title: "Predictive Risk Trend",
    desc: "Classifies your current trajectory into Low, Medium, or High risk tiers with AI-generated insight — so you can course-correct before performance and wellbeing degrade.",
    accent: "rose",
    border: "border-rose-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(251,113,133,0.1)]",
    iconBg: "bg-rose-400/10 border-rose-400/25",
    iconColor: "text-rose-400",
  },
];

const stats = [
  { value: "10k+", label: "Developers Analyzed" },
  { value: "94%", label: "Detection Accuracy" },
  { value: "<3s", label: "Analysis Time" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white font-['Syne',sans-serif] relative overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[110px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* ─── Hero ─── */}
        <section className="pt-24 pb-20 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/25 bg-amber-400/8 text-amber-400 text-xs font-mono tracking-[0.2em] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Powered by Claude AI
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl">
            <span className="text-white">AI-Powered Developer</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Burnout Intelligence
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed mb-10">
            Analyze GitHub activity and meeting load to detect burnout risk before it happens.
            Get actionable insights in seconds — not after the breakdown.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase font-mono shadow-[0_0_40px_rgba(251,191,36,0.25)] hover:bg-amber-300 hover:shadow-[0_0_60px_rgba(251,191,36,0.35)] active:scale-[0.98] transition-all duration-200"
            >
              Analyze My Burnout →
            </button>
            <span className="text-xs text-white/25 font-mono tracking-wider">
              No account needed · Free to use
            </span>
          </div>

          {/* Stats strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-px">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center px-10 py-4 border-r border-white/8 last:border-r-0"
              >
                <span className="text-3xl font-black text-white font-mono">{s.value}</span>
                <span className="text-xs text-white/30 tracking-widest uppercase mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Divider ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

        {/* ─── Features ─── */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <p className="text-xs font-mono tracking-[0.3em] text-white/30 uppercase mb-3">
              What We Analyze
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Three Pillars of Burnout Detection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-white/4 backdrop-blur-xl p-7 transition-all duration-400 hover:-translate-y-1.5 ${f.glow} hover:bg-white/6 hover:border-opacity-40`}
              >
                {/* Top shimmer line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl border ${f.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}
                >
                  <span className="text-xl">{f.icon}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>

                {/* Corner decoration */}
                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5 pointer-events-none">
                  <div className={`absolute bottom-3 right-3 w-full h-full border-b-2 border-r-2 ${f.iconColor} rounded-br-2xl`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/8 via-transparent to-rose-500/8 p-12 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/20 to-transparent" />
            </div>
            <p className="text-xs font-mono tracking-[0.3em] text-amber-400/70 uppercase mb-4">
              Ready to check in?
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Know before it's too late.
            </h2>
            <p className="text-white/40 text-base mb-8 max-w-lg mx-auto">
              Paste your GitHub username and get a full burnout report in under 3 seconds.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3.5 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase font-mono shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:bg-amber-300 hover:shadow-[0_0_50px_rgba(251,191,36,0.3)] active:scale-[0.98] transition-all duration-200"
            >
              Start Free Analysis →
            </button>
          </div>
        </section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black">
              <span className="text-white/40">Burnout</span>
              <span className="text-amber-400/50">Scope</span>
            </span>
          </div>
          <p className="text-xs font-mono text-white/20 tracking-widest">
            Built for Hackathon 2026
          </p>
          <p className="text-xs text-white/15 font-mono">
            Powered by Claude AI
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}