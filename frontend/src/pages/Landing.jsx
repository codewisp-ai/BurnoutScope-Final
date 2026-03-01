import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "⚡",
    title: "Smart Burnout Scoring",
    desc: "A composite 0–100 score computed from late-night commits, weekend overwork, and activity spikes — giving you a single, actionable number to track your health over time.",
    num: "01",
    color: "#FBBF24",
  },
  {
    icon: "🧠",
    title: "Behavioral Pattern Detection",
    desc: "Detects irregular commit cadences, erratic push schedules, and calendar overload patterns — surfacing the invisible warning signs that precede burnout crashes.",
    num: "02",
    color: "#38BDF8",
  },
  {
    icon: "📈",
    title: "Predictive Risk Trend",
    desc: "Classifies your current trajectory into Low, Medium, or High risk tiers with AI-generated insight — so you can course-correct before performance and wellbeing degrade.",
    num: "03",
    color: "#FB7185",
  },
];

function useScramble(target, trigger) {
  const [text, setText] = useState(target);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const total = 18;
    const id = setInterval(() => {
      setText(
        target
          .split("")
          .map((c, i) =>
            c === " " ? " " : frame / total > i / target.length
              ? c
              : chars[Math.floor(Math.random() * chars.length)]
          )
          .join("")
      );
      frame++;
      if (frame > total) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [trigger]);
  return text;
}

function MagneticButton({ children, onClick, className, style }) {
  const ref = useRef(null);
  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  }
  function onLeave() {
    ref.current.style.transform = "translate(0,0)";
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: "transform 0.35s cubic-bezier(.23,1,.32,1), box-shadow 0.3s", ...style }}
    >
      {children}
    </button>
  );
}

function FeatureCard({ f, i }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  function onMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
  }

  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateZ(0)";
    setHovered(false);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        transition: "transform 0.2s ease, box-shadow 0.3s ease",
        animationDelay: `${0.5 + i * 0.15}s`,
        "--card-color": f.color,
      }}
      className="feature-card group relative rounded-2xl p-px overflow-hidden animate-fadeUp opacity-0"
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at var(--mx,50%) var(--my,50%), ${f.color}40 0%, transparent 60%)` }}
      />
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${f.color}18 0%, transparent 50%, ${f.color}08 100%)`, border: `1px solid ${f.color}20` }}
      />

      <div className="relative rounded-[15px] bg-[#060608] p-8 h-full z-10">
        <div
          className="absolute inset-0 rounded-[15px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(circle at var(--mx,50%) var(--my,50%), ${f.color}12 0%, transparent 55%)` }}
        />

        <span
          className="font-mono text-[80px] font-black leading-none absolute top-4 right-6 select-none"
          style={{ color: `${f.color}08`, fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {f.num}
        </span>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-2xl relative"
          style={{
            background: `${f.color}12`,
            border: `1px solid ${f.color}25`,
            boxShadow: hovered ? `0 0 20px ${f.color}30` : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          {f.icon}
        </div>

        <h3 className="text-white font-bold text-lg mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          {f.title}
        </h3>
        <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>

        <div
          className="absolute bottom-0 left-8 right-8 h-px transition-all duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${f.color}${hovered ? "80" : "20"}, transparent)` }}
        />
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const headline = useScramble("AI-Powered Developer", mounted);
  const canvasRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="min-h-screen text-white relative overflow-x-hidden"
      style={{ background: "#040406", fontFamily: "'Syne', sans-serif" }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      {/* Background blobs + grain */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[30%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute top-[45%] right-[5%] w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,113,133,0.05) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-[5%] left-[5%] w-[380px] h-[380px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 80px)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* ── NAV ── */}
        <nav className="pt-8 pb-4 flex items-center justify-between"
          style={{ animation: "fadeDown 0.8s ease forwards", opacity: 0 }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-black text-sm tracking-wider">
              <span className="text-white/50">Burnout</span>
              <span style={{ color: "#FBBF24" }}>Scope</span>
            </span>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="pt-16 pb-20 flex flex-col items-center text-center">

          <h1
            className="animate-fadeUp opacity-0 leading-[1.0] mb-6 tracking-tight"
            style={{ animationDelay: "0.1s", fontFamily: "'Syne', sans-serif", fontWeight: 900 }}
          >
            <span
              className="block text-5xl md:text-[82px] mb-2"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em",
              }}
            >
              {headline}
            </span>
            <span
              className="block text-5xl md:text-[82px]"
              style={{
                background: "linear-gradient(135deg, #FBBF24 0%, #FB923C 45%, #FB7185 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em",
                filter: "drop-shadow(0 0 40px rgba(251,191,36,0.4))",
              }}
            >
              Burnout Intelligence
            </span>
          </h1>

          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed mb-12 animate-fadeUp opacity-0"
            style={{ color: "rgba(255,255,255,0.38)", animationDelay: "0.25s" }}
          >
            Analyze GitHub activity and meeting load to detect burnout risk before it happens.
            Get actionable insights in seconds — not after the breakdown.
          </p>

          <div className="animate-fadeUp opacity-0" style={{ animationDelay: "0.38s" }}>
            <MagneticButton
              onClick={() => navigate("/dashboard")}
              className="relative px-9 py-4 rounded-xl text-black font-bold text-sm tracking-[0.2em] uppercase font-mono overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #FBBF24, #FB923C)",
                boxShadow: "0 0 50px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Analyze My Burnout
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #FCD34D, #FB923C)" }}
              />
            </MagneticButton>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-4 mb-20 opacity-30">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12))" }} />
          <span className="text-xs font-mono tracking-widest text-white/30">✦</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)" }} />
        </div>

        {/* ── FEATURES ── */}
        <section className="pb-28">
          <div className="text-center mb-16">
            <p
              className="text-xs font-mono tracking-[0.35em] uppercase mb-3 animate-fadeUp opacity-0"
              style={{ color: "rgba(251,191,36,0.5)", animationDelay: "0.2s" }}
            >
              What We Analyze
            </p>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight text-white animate-fadeUp opacity-0"
              style={{ animationDelay: "0.3s", letterSpacing: "-0.025em" }}
            >
              Three Pillars of
              <br />
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Burnout Detection</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} f={f} i={i} />
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="pb-28">
          <div
            className="relative overflow-hidden rounded-3xl p-14 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(0,0,0,0) 40%, rgba(251,113,133,0.05) 100%)",
              border: "1px solid rgba(251,191,36,0.14)",
              boxShadow: "inset 0 1px 0 rgba(251,191,36,0.15), 0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)" }} />

            {[["top-4 left-4", 0], ["top-4 right-4", 1], ["bottom-4 left-4", 2], ["bottom-4 right-4", 3]].map(([pos, i]) => (
              <div key={i} className={`absolute ${pos} w-5 h-5 opacity-30`}
                style={{
                  borderTop: i < 2 ? "1px solid rgba(251,191,36,0.6)" : "none",
                  borderBottom: i >= 2 ? "1px solid rgba(251,191,36,0.6)" : "none",
                  borderLeft: (i === 0 || i === 2) ? "1px solid rgba(251,191,36,0.6)" : "none",
                  borderRight: (i === 1 || i === 3) ? "1px solid rgba(251,191,36,0.6)" : "none",
                }}
              />
            ))}

            <p className="text-xs font-mono tracking-[0.35em] uppercase mb-4"
              style={{ color: "rgba(251,191,36,0.6)" }}>
              Ready to check in?
            </p>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Know before
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>it's too late.</span>
            </h2>
            <p className="max-w-md mx-auto mb-10 text-base" style={{ color: "rgba(255,255,255,0.32)" }}>
              Paste your GitHub username and get a full burnout report in under 3 seconds.
            </p>

            <MagneticButton
              onClick={() => navigate("/dashboard")}
              className="relative inline-flex items-center gap-3 px-10 py-4 rounded-xl text-black font-bold text-sm tracking-[0.18em] uppercase font-mono overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #FBBF24, #FB923C)",
                boxShadow: "0 0 50px rgba(251,191,36,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Analysis
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #FCD34D, #FBBF24)" }}
              />
            </MagneticButton>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black tracking-wider">
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Burnout</span>
              <span style={{ color: "rgba(251,191,36,0.5)" }}>Scope</span>
            </span>
          </div>
          <p className="text-xs font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>
            Built for Hackathon 2026
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.75s cubic-bezier(.23,1,.32,1) forwards;
        }
        .feature-card {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}