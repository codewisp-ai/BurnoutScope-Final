/**
 * RecoveryMode.jsx
 * Triggered when burnoutScore >= 70.
 * Transforms the dashboard into a calm, recovery-focused view.
 * No fake AI labels — all data-driven from real GitHub analysis.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Recovery priorities based on what's actually detected ───────────────────
function buildRecoveryPlan(githubData, result) {
  const plan = [];
  const g = githubData || {};

  if (g.lateNightCommits >= 5) {
    plan.push({
      id: "sleep",
      icon: "🌙",
      title: "No code after 10 PM tonight",
      detail: `You've pushed ${g.lateNightCommits} times after 11 PM. Tonight, close the laptop by 10.`,
      urgency: "high",
    });
  }

  if (g.weekendCommits >= 5) {
    plan.push({
      id: "weekend",
      icon: "📅",
      title: "Block this weekend as code-free",
      detail: `${g.weekendCommits} weekend commits in 30 days. Your brain needs two full days without a terminal.`,
      urgency: "high",
    });
  }

  if (g.crashDetected) {
    plan.push({
      id: "crash",
      icon: "⚡",
      title: "You're in a crash — maintenance tasks only",
      detail: "Only handle critical, pre-scoped work today. No new features. No ambition. Just keep the lights on.",
      urgency: "high",
    });
  }

  if (g.spikeDetected && !g.crashDetected) {
    plan.push({
      id: "spike",
      icon: "📈",
      title: "You're spiking — pace yourself now",
      detail: "A surge is detected. Use 25/5 Pomodoro today. Schedule a lighter day tomorrow before you crash.",
      urgency: "medium",
    });
  }

  if (g.totalCommits > 50) {
    plan.push({
      id: "output",
      icon: "🔋",
      title: "Switch to review-only for 2 hours",
      detail: "Very high output detected. Spend 2 hours reviewing code instead of writing new features. Same value, less drain.",
      urgency: "medium",
    });
  }

  // Always include these two baseline recovery actions
  plan.push({
    id: "walk",
    icon: "🚶",
    title: "Take a 20-minute walk — no phone",
    detail: "Not optional. A short walk restores focus faster than any technique. Go now or schedule it within 2 hours.",
    urgency: "medium",
  });

  plan.push({
    id: "water",
    icon: "💧",
    title: "Drink water and step away from the screen",
    detail: "2% dehydration cuts working memory by 20%. Fill your bottle. Take 5 minutes away from every screen.",
    urgency: "low",
  });

  return plan;
}

// ─── Sabbath countdown — next upcoming Saturday midnight ─────────────────────
function getNextWeekendMs() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = day === 6 ? 7 : (6 - day);
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilSat);
  target.setHours(18, 0, 0, 0); // Friday 6pm = start of weekend
  if (target <= now) target.setDate(target.getDate() + 7);
  return target.getTime() - now.getTime();
}

function formatCountdown(ms) {
  if (ms <= 0) return { d: "00", h: "00", m: "00" };
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
  };
}

// ─── Burnout stage label ──────────────────────────────────────────────────────
function getBurnoutStage(score) {
  if (score >= 90) return { label: "Critical", sub: "Immediate rest required", color: "#f87171", glow: "rgba(248,113,113,0.2)" };
  if (score >= 80) return { label: "Severe",   sub: "Recovery protocol active", color: "#fb923c", glow: "rgba(251,146,60,0.2)" };
  return             { label: "High",     sub: "Intervention recommended", color: "#fbbf24", glow: "rgba(251,191,36,0.15)" };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecoveryMode({ burnoutScore, riskLevel, insight, githubData, result, username, onDismiss }) {
  const navigate = useNavigate();
  const [entered, setEntered]           = useState(false);
  const [countdown, setCountdown]       = useState(getNextWeekendMs());
  const [checked, setChecked]           = useState({});
  const [activeStep, setActiveStep]     = useState(null);

  const plan  = buildRecoveryPlan(githubData, result);
  const stage = getBurnoutStage(burnoutScore);

  // Entry animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(getNextWeekendMs()), 60000);
    return () => clearInterval(t);
  }, []);

  const ct = formatCountdown(countdown);
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        fontFamily: "'Syne', sans-serif",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "scale(0.98)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        overflowY: "auto",
        background: "radial-gradient(ellipse at 30% 20%, #0a0f0a 0%, #050805 50%, #020302 100%)",
      }}
    >
      {/* ── Ambient glow ─────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 800px 600px at 20% 30%, ${stage.glow} 0%, transparent 70%)`,
      }} />

      {/* ── Noise texture ────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* ── Grid lines ───────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: stage.color,
              boxShadow: `0 0 12px ${stage.color}`,
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
              Recovery Mode · @{username}
            </span>
          </div>
          <button
            onClick={onDismiss}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "10px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.25)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}
          >
            ✕ Exit Recovery Mode
          </button>
        </div>

        {/* ── Hero Score ───────────────────────────────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", marginBottom: "56px",
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both",
        }}>
          {/* Score ring */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <svg width="160" height="160" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={stage.color} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - burnoutScore / 100)}
                style={{ filter: `drop-shadow(0 0 8px ${stage.color})`, transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "42px", fontWeight: "900", color: stage.color, lineHeight: 1, fontFamily: "monospace" }}>{burnoutScore}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.15em" }}>/100</span>
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "999px",
            border: `1px solid ${stage.color}40`,
            background: `${stage.color}12`,
            marginBottom: "16px",
          }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: stage.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {stage.label} Burnout
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: "900", color: "rgba(255,255,255,0.9)", marginBottom: "12px", lineHeight: 1.2 }}>
            You need to slow down.
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", maxWidth: "520px", lineHeight: 1.7 }}>
            {insight}
          </p>
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>

          {/* ── Today's Recovery Plan ────────────────────────────────── */}
          <div style={{
            gridColumn: "1 / -1",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            padding: "28px",
            animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <p style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "4px" }}>
                  Based on your data
                </p>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "rgba(255,255,255,0.9)" }}>
                  Today's Recovery Plan
                </h2>
              </div>
              {completedCount > 0 && (
                <div style={{
                  padding: "4px 12px", borderRadius: "999px",
                  background: "rgba(52,211,153,0.12)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  fontSize: "11px", fontFamily: "monospace",
                  color: "#34d399",
                }}>
                  {completedCount}/{plan.length} done
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {plan.map((step, i) => {
                const isDone   = checked[step.id];
                const isActive = activeStep === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      borderRadius: "14px",
                      border: isDone
                        ? "1px solid rgba(52,211,153,0.25)"
                        : isActive
                        ? `1px solid ${stage.color}40`
                        : "1px solid rgba(255,255,255,0.06)",
                      background: isDone
                        ? "rgba(52,211,153,0.06)"
                        : isActive
                        ? `${stage.color}08`
                        : "rgba(255,255,255,0.02)",
                      padding: "14px 18px",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.07}s both`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      {/* Checkbox */}
                      <button
                        onClick={e => { e.stopPropagation(); setChecked(c => ({ ...c, [step.id]: !c[step.id] })); }}
                        style={{
                          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                          border: isDone ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(255,255,255,0.15)",
                          background: isDone ? "rgba(52,211,153,0.2)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.2s ease",
                          color: "#34d399", fontSize: "12px", marginTop: "1px",
                        }}
                      >
                        {isDone ? "✓" : ""}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "16px" }}>{step.icon}</span>
                          <span style={{
                            fontSize: "14px", fontWeight: "700",
                            color: isDone ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
                            textDecoration: isDone ? "line-through" : "none",
                            transition: "all 0.2s",
                          }}>
                            {step.title}
                          </span>
                          <span style={{
                            fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.15em",
                            textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px",
                            background: step.urgency === "high" ? "rgba(248,113,113,0.12)" : step.urgency === "medium" ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
                            border: step.urgency === "high" ? "1px solid rgba(248,113,113,0.25)" : step.urgency === "medium" ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(52,211,153,0.2)",
                            color: step.urgency === "high" ? "#f87171" : step.urgency === "medium" ? "#fbbf24" : "#34d399",
                          }}>
                            {step.urgency}
                          </span>
                        </div>

                        {isActive && (
                          <p style={{
                            fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65,
                            marginTop: "8px", paddingLeft: "2px",
                            animation: "fadeUp 0.3s ease both",
                          }}>
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Code Sabbath Countdown ───────────────────────────────── */}
          <div style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "20px",
            animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both",
          }}>
            <div>
              <p style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "4px" }}>
                Code Sabbath
              </p>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "rgba(255,255,255,0.85)" }}>
                Weekend Recovery
              </h2>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {[{ val: ct.d, label: "Days" }, { val: ct.h, label: "Hours" }, { val: ct.m, label: "Min" }].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{
                    fontSize: "38px", fontWeight: "900", fontFamily: "monospace",
                    color: stage.color, lineHeight: 1,
                    textShadow: `0 0 20px ${stage.color}60`,
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginTop: "4px" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "12px 16px", borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.65,
            }}>
              When the timer hits zero — close every work tab, silence notifications, and give your brain a full 48 hours offline.
            </div>
          </div>

          {/* ── Commit Pattern Warning ───────────────────────────────── */}
          <div style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.42s both",
          }}>
            <div>
              <p style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "4px" }}>
                What got you here
              </p>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "rgba(255,255,255,0.85)" }}>
                Pattern Breakdown
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                {
                  label: "Late nights",
                  value: githubData?.lateNightCommits || 0,
                  max: 20,
                  color: "#f87171",
                  suffix: "commits after 11PM",
                },
                {
                  label: "Weekend work",
                  value: githubData?.weekendCommits || 0,
                  max: 20,
                  color: "#fb923c",
                  suffix: "weekend commits",
                },
                {
                  label: "Total output",
                  value: githubData?.totalCommits || 0,
                  max: 80,
                  color: stage.color,
                  suffix: "commits / 30d",
                },
              ].map(({ label, value, max, color, suffix }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>{label}</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color, fontFamily: "monospace" }}>{value} <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: "400" }}>{suffix}</span></span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "2px",
                      width: `${Math.min(100, (value / max) * 100)}%`,
                      background: color,
                      boxShadow: `0 0 8px ${color}60`,
                      transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom action row ─────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: "12px", flexWrap: "wrap",
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both",
        }}>
          <button
            onClick={() => navigate("/recommendations", {
              state: {
                username,
                githubData,
                calendarData: result?.calendarData,
                behaviorData: null,
              }
            })}
            style={{
              flex: 1, minWidth: "200px",
              padding: "16px 24px", borderRadius: "14px",
              background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}08)`,
              border: `1px solid ${stage.color}35`,
              color: stage.color,
              fontSize: "13px", fontWeight: "700",
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${stage.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ fontSize: "18px" }}>📋</span>
            View Full Recovery Plan
          </button>

          <button
            onClick={onDismiss}
            style={{
              flex: 1, minWidth: "200px",
              padding: "16px 24px", borderRadius: "14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px", fontWeight: "600",
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}