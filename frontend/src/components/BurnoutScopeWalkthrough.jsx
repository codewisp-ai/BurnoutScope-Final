/**
 * BurnoutScopeWalkthrough.jsx
 * 7-step walkthrough — centered modal style, hackathon-aligned content.
 * Auto-launches on first visit only.
 *
 * data-tour attributes needed in Dashboard.jsx:
 *   data-tour="github-input"
 *   data-tour="calendar-upload"
 *   data-tour="burnout-card"
 *   data-tour="github-stats"
 *   data-tour="timeline-btn"
 *   data-tour="recs-btn"
 *   data-tour="support-btn"
 *
 * Reset tour: localStorage.removeItem("burnoutscope_tour_seen")
 */

import { useState, useEffect, useCallback } from "react";

// ─── 7 Steps — MINDCODE 2026 aligned ─────────────────────────────────────────
const STEPS = [
  {
    target: "github-input",
    title: "Start With Your GitHub Username",
    description:
      "Enter your GitHub username and we'll analyse your last 30 days of commits — looking at timing, frequency, and intensity to understand your real working patterns.",
    icon: "🐙",
    tag: "Step 1 · Input",
    accent: "#FBBF24",
  },
  {
    target: "calendar-upload",
    title: "Add Your Calendar (Optional)",
    description:
      "Upload a CSV or ICS export of your calendar to layer in your meeting load. We look for overloaded days, back-to-back blocks, and stolen focus time — the hidden drivers of exhaustion.",
    icon: "📅",
    tag: "Step 2 · Calendar",
    accent: "#38BDF8",
  },
  {
    target: "burnout-card",
    title: "Your Burnout Score",
    description:
      "A clear 0–100 score built from your actual data — late nights, weekend work, activity spikes. Not a diagnosis. A signal. One number that tells you where you stand today.",
    icon: "📊",
    tag: "Step 3 · Score",
    accent: "#FB7185",
  },
  {
    target: "github-stats",
    title: "See What's Actually Happening",
    description:
      "Late-night sessions, early mornings, weekend commits, workload spikes — all broken down so you can see exactly which habits are costing you your wellbeing.",
    icon: "📈",
    tag: "Step 4 · Patterns",
    accent: "#FBBF24",
  },
  {
    target: "timeline-btn",
    title: "30-Day Activity Timeline",
    description:
      "A scrollable, day-by-day chart of your work intensity. Zoom in, filter by spikes or weekends, click any day for details. See your burnout building — before it breaks you.",
    icon: "📉",
    tag: "Step 5 · Timeline",
    accent: "#38BDF8",
  },
  {
    target: "recs-btn",
    title: "Personalised Recovery Steps",
    description:
      "Concrete, data-driven actions based on what's actually detected in your patterns. Not generic advice — specific steps for your situation. Filter by urgency. Export and act.",
    icon: "🧾",
    tag: "Step 6 · Recovery",
    accent: "#34D399",
  },
  {
    target: "support-btn",
    title: "Support Mode — Always Here 🌙",
    description:
      "When work stress becomes too much, this is your space. Guided box-breathing and a calm chat — available any time, no questions asked. Because code that cares starts with caring for the coder.",
    icon: "🌙",
    tag: "Step 7 · Support",
    accent: "#818CF8",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTargetRect(target) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { viewTop: r.top, viewLeft: r.left, width: r.width, height: r.height };
}

// ─── Spotlight ────────────────────────────────────────────────────────────────
function Spotlight({ rect, accent }) {
  const P = 10;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9997, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${rect.viewTop - P}px`, background: "rgba(2,3,6,0.88)" }} />
      <div style={{ position: "absolute", top: `${rect.viewTop + rect.height + P}px`, left: 0, right: 0, bottom: 0, background: "rgba(2,3,6,0.88)" }} />
      <div style={{ position: "absolute", top: `${rect.viewTop - P}px`, left: 0, width: `${rect.viewLeft - P}px`, height: `${rect.height + P * 2}px`, background: "rgba(2,3,6,0.88)" }} />
      <div style={{ position: "absolute", top: `${rect.viewTop - P}px`, left: `${rect.viewLeft + rect.width + P}px`, right: 0, height: `${rect.height + P * 2}px`, background: "rgba(2,3,6,0.88)" }} />
      <div style={{
        position: "absolute",
        top: `${rect.viewTop - P}px`, left: `${rect.viewLeft - P}px`,
        width: `${rect.width + P * 2}px`, height: `${rect.height + P * 2}px`,
        border: `1.5px solid ${accent}80`,
        borderRadius: "14px",
        boxShadow: `0 0 0 4px ${accent}10, 0 0 32px ${accent}25`,
        animation: "bsGlow 2s ease-in-out infinite",
      }} />
    </div>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ current, total, accent }) {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: "5px", borderRadius: "3px",
          width: i === current ? "28px" : "8px",
          background: i < current
            ? `${accent}60`
            : i === current
            ? accent
            : "rgba(255,255,255,0.1)",
          boxShadow: i === current ? `0 0 10px ${accent}60` : "none",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      ))}
    </div>
  );
}

// ─── Big centered modal card ──────────────────────────────────────────────────
function WalkthroughModal({ step, stepIndex, total, onNext, onPrev, onSkip }) {
  const isLast  = stepIndex === total - 1;
  const isFirst = stepIndex === 0;
  const { accent } = step;

  return (
    <>
      {/* Full dim backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(2,3,6,0.75)", backdropFilter: "blur(8px)" }} />

      {/* Centered modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        width: "min(580px, 92vw)",
        fontFamily: "'Syne', sans-serif",
        animation: "bsSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, rgba(10,12,18,0.99) 0%, rgba(6,8,12,0.99) 100%)",
          border: `1px solid ${accent}25`,
          borderRadius: "24px",
          padding: "36px 36px 28px",
          boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px ${accent}08`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />

          {/* Corner glow */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}08, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}05, transparent 70%)`, pointerEvents: "none" }} />

          {/* Top row: tag + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "14px", flexShrink: 0,
                background: `${accent}12`, border: `1px solid ${accent}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
                boxShadow: `0 0 20px ${accent}15`,
              }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.22em", color: `${accent}90`, textTransform: "uppercase", marginBottom: "3px" }}>
                  {step.tag}
                </div>
                {/* Hackathon badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px", borderRadius: "999px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34D399", display: "inline-block", boxShadow: "0 0 6px #34D399" }} />
                  <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>MINDCODE 2026</span>
                </div>
              </div>
            </div>
            <button
              onClick={onSkip}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "14px", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
              title="Skip tour"
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "rgba(255,255,255,0.95)", marginBottom: "12px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.52)", lineHeight: 1.75, marginBottom: "28px" }}>
            {step.description}
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "22px" }} />

          {/* Bottom row: progress + buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <ProgressDots current={stepIndex} total={total} accent={accent} />
              <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
                {stepIndex + 1} of {total}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!isFirst && (
                <button
                  onClick={onPrev}
                  style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={onNext}
                style={{
                  padding: "10px 28px", borderRadius: "12px",
                  background: isLast ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : `${accent}18`,
                  border: isLast ? "1px solid transparent" : `1px solid ${accent}35`,
                  fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.12em",
                  color: isLast ? "#000" : accent,
                  fontWeight: "800", cursor: "pointer", transition: "all 0.2s",
                  boxShadow: isLast ? `0 0 24px ${accent}35` : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {isLast ? "Let's Go ✓" : "Next →"}
              </button>
            </div>
          </div>

          {/* Hackathon motto at bottom — only on last step */}
          {isLast && (
            <div style={{ marginTop: "18px", padding: "12px 16px", borderRadius: "12px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", textAlign: "center", animation: "bsSlideUp 0.4s ease 0.1s both" }}>
              <p style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(52,211,153,0.7)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                🏆 MINDCODE 2026 · Code That Cares
              </p>
            </div>
          )}
        </div>

        {/* Keyboard hint below card */}
        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>
          ← → keys · ESC to exit · click backdrop to advance
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BurnoutScopeWalkthrough() {
  const [active,   setActive]   = useState(false);
  const [stepIdx,  setStepIdx]  = useState(0);
  const [rect,     setRect]     = useState(null);
  const [visible,  setVisible]  = useState(false);

  const step = STEPS[stepIdx];

  // Auto-launch on first visit
 useEffect(() => {
    const t = setTimeout(() => setActive(true), 900);
    return () => clearTimeout(t);
  }, []);

  const updateRect = useCallback(() => {
    setRect(getTargetRect(step.target));
  }, [step]);

  // Scroll element into view + measure
  useEffect(() => {
    if (!active) return;
    setVisible(false);
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => { updateRect(); setVisible(true); }, el ? 420 : 80);
    return () => clearTimeout(t);
  }, [active, stepIdx, updateRect, step.target]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [active, updateRect]);

  // Keyboard nav
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  function next()  { stepIdx < STEPS.length - 1 ? setStepIdx(i => i + 1) : close(); }
  function prev()  { if (stepIdx > 0) setStepIdx(i => i - 1); }
  function close() {
    setActive(false); setRect(null); setVisible(false);
  }
  if (!active || !visible) return null;

  return (
    <>
      {/* Spotlight on target element (shown behind modal) */}
      {rect && <Spotlight rect={rect} accent={step.accent} />}

      {/* Click backdrop to advance */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9997, cursor: "pointer" }}
        onClick={next}
      />

      {/* Big centered modal */}
      <WalkthroughModal
        step={step}
        stepIndex={stepIdx}
        total={STEPS.length}
        onNext={next}
        onPrev={prev}
        onSkip={close}
      />

      <style>{`
        @keyframes bsSlideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes bsGlow {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
      `}</style>
    </>
  );
}