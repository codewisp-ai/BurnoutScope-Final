/**
 * BurnoutForecast.jsx
 * 7-day predictive burnout forecast based on commit pattern trends.
 *
 * USAGE — add to Dashboard.jsx inside your results section, after BurnoutCard:
 *
 *   import BurnoutForecast from "../components/BurnoutForecast";
 *
 *   <BurnoutForecast
 *     dailyActivity={result.githubData.dailyActivity}
 *     burnoutScore={result.burnoutScore}
 *   />
 *
 * PROPS:
 *   dailyActivity  — { "2026-02-01": 4, "2026-02-02": 7, ... }
 *                    already returned by your existing analyzeGithubActivity()
 *   burnoutScore   — number 0–100, your existing burnout score
 *
 * NO new backend changes needed. Uses your existing dailyActivity data.
 */

import { useMemo } from "react";

// ─── Forecast Math ────────────────────────────────────────────────────────────
function computeForecast(dailyActivity, burnoutScore) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build ordered 30-day history array
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    history.push({ date: key, commits: dailyActivity[key] || 0 });
  }

  // Linear regression on last 14 days to find trend slope
  const recent = history.slice(-14);
  const n = recent.length;
  const xs = recent.map((_, i) => i);
  const ys = recent.map((d) => d.commits);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const denom = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0) || 1;
  const slope = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0) / denom;
  const intercept = meanY - slope * meanX;

  // Last 7 days average for baseline intensity
  const last7avg = history.slice(-7).reduce((s, d) => s + d.commits, 0) / 7 || 1;

  // Generate 7 forecast days
  const forecast = [];
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    const dayOfWeek = futureDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const rawPredicted = Math.max(0, intercept + slope * (n - 1 + i));
    const intensityFactor = last7avg > 0 ? rawPredicted / last7avg : 0;
    const trendBoost = slope > 0 ? Math.min(slope * 8, 20) : 0;
    const weekendDamp = isWeekend ? 0.6 : 1;

    let riskScore = Math.round(
      burnoutScore * 0.5 +
      intensityFactor * 30 * weekendDamp +
      trendBoost
    );
    riskScore = Math.max(0, Math.min(100, riskScore));

    const level =
      riskScore >= 70 ? "critical" :
      riskScore >= 45 ? "warning"  : "safe";

    forecast.push({
      date: futureDate.toISOString().split("T")[0],
      label: futureDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      shortLabel: futureDate.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: futureDate.getDate(),
      riskScore,
      level,
      predictedCommits: Math.round(rawPredicted),
      isWeekend,
    });
  }

  const criticalDays = forecast.filter((d) => d.level === "critical");
  const peakDay      = forecast.reduce((a, b) => (a.riskScore > b.riskScore ? a : b));
  const trendDir     = slope > 0.3 ? "rising" : slope < -0.3 ? "falling" : "stable";

  return { forecast, criticalDays, peakDay, trendDir };
}

// ─── Color helpers ────────────────────────────────────────────────────────────
const COLORS = {
  critical: { solid: "rgba(251,113,133,1)", faint: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.25)" },
  warning:  { solid: "rgba(251,191,36,1)",  faint: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
  safe:     { solid: "rgba(52,211,153,1)",  faint: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.2)"   },
};

const rc  = (level, a = 1) => COLORS[level].solid.replace(",1)", `,${a})`);
const rbg = (level)        => COLORS[level].faint;
const rbd = (level)        => COLORS[level].border;

// ─── Single Bar ───────────────────────────────────────────────────────────────
function ForecastBar({ day, maxRisk, isPeak }) {
  const heightPct = maxRisk > 0 ? (day.riskScore / maxRisk) * 100 : 4;
  const color     = rc(day.level);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
      {/* Score */}
      <div style={{
        fontSize: "11px", fontFamily: "monospace", fontWeight: "700",
        color: isPeak ? color : "rgba(255,255,255,0.25)",
        letterSpacing: "0.05em",
      }}>
        {day.riskScore}
      </div>

      {/* Bar */}
      <div style={{ width: "100%", height: "110px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{
          width: "100%", maxWidth: "34px",
          height: `${Math.max(4, heightPct)}%`,
          borderRadius: "6px 6px 3px 3px",
          background: isPeak
            ? `linear-gradient(180deg, ${color}, ${rc(day.level, 0.5)})`
            : rc(day.level, 0.12),
          border: isPeak
            ? `1px solid ${rc(day.level, 0.45)}`
            : "1px solid rgba(255,255,255,0.05)",
          boxShadow: isPeak
            ? `0 0 18px ${rc(day.level, 0.3)}, 0 0 40px ${rc(day.level, 0.1)}`
            : "none",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          position: "relative", overflow: "hidden",
        }}>
          {isPeak && (
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 50%)",
            }} />
          )}
        </div>
      </div>

      {/* Day */}
      <div style={{
        fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase",
        color: isPeak ? color : "rgba(255,255,255,0.28)",
        letterSpacing: "0.08em", fontWeight: isPeak ? "700" : "400",
      }}>
        {day.shortLabel}
      </div>

      {/* Date number */}
      <div style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>
        {day.dayNum}
      </div>

      {/* Weekend dot */}
      {day.isWeekend && (
        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(251,191,36,0.4)" }} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BurnoutForecast({ dailyActivity, burnoutScore }) {
  const { forecast, criticalDays, peakDay, trendDir } = useMemo(
    () => computeForecast(dailyActivity || {}, burnoutScore || 0),
    [dailyActivity, burnoutScore]
  );

  const maxRisk = Math.max(...forecast.map((d) => d.riskScore));

  const overallLevel =
    criticalDays.length >= 3 ? "critical" :
    criticalDays.length >= 1 ? "warning"  : "safe";

  const headline = {
    critical: `High burnout risk expected — peak on ${peakDay.label}`,
    warning:  `Elevated risk ahead — monitor closely around ${peakDay.label}`,
    safe:     `Next 7 days look manageable — keep your current pace`,
  }[overallLevel];

  const trendLabel = { rising: "↑ Workload trending up", falling: "↓ Workload easing off", stable: "→ Workload holding steady" }[trendDir];
  const trendColor = { rising: "rgba(251,113,133,0.7)", falling: "rgba(52,211,153,0.7)", stable: "rgba(255,255,255,0.3)" }[trendDir];

  return (
    <div style={{
      borderRadius: "20px",
      border: `1px solid ${rbd(overallLevel)}`,
      background: "rgba(6,8,12,0.8)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      fontFamily: "'Syne', sans-serif",
      position: "relative",
    }}>
      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${rc(overallLevel, 0.6)}, transparent)`,
      }} />

      {/* ── Header ── */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: "12px", flexWrap: "wrap",
      }}>
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "3px 10px", borderRadius: "999px",
            background: rbg(overallLevel), border: `1px solid ${rbd(overallLevel)}`,
            marginBottom: "10px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: rc(overallLevel),
              boxShadow: `0 0 6px ${rc(overallLevel)}`,
              animation: overallLevel === "critical" ? "bsFcPulse 1.5s ease-in-out infinite" : "none",
            }} />
            <span style={{
              fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.2em",
              color: rc(overallLevel), textTransform: "uppercase", fontWeight: "700",
            }}>
              7-Day Burnout Forecast
            </span>
          </div>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5, fontWeight: "600", maxWidth: "380px" }}>
            {headline}
          </p>
        </div>

        {/* Right pills */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
          <div style={{ padding: "6px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: trendColor, letterSpacing: "0.08em" }}>
              {trendLabel}
            </span>
          </div>
          {criticalDays.length > 0 && (
            <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)" }}>
              <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(251,113,133,0.8)", letterSpacing: "0.1em" }}>
                {criticalDays.length} high-risk {criticalDays.length === 1 ? "day" : "days"} ahead
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ padding: "24px 24px 20px" }}>
        <div style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
          {/* Y axis labels */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: "56px", paddingRight: "10px", flexShrink: 0 }}>
            {[100, 70, 45, 0].map((v) => (
              <span key={v} style={{
                fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.05em",
                color: v === 70 ? "rgba(251,113,133,0.4)" : v === 45 ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.15)",
              }}>
                {v}
              </span>
            ))}
          </div>

          {/* Bars + gridlines */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* Dashed threshold lines */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", paddingBottom: "56px" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: "30%", borderTop: "1px dashed rgba(251,113,133,0.18)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "55%", borderTop: "1px dashed rgba(251,191,36,0.14)" }} />
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              {forecast.map((day) => (
                <ForecastBar
                  key={day.date}
                  day={day}
                  maxRisk={maxRisk}
                  isPeak={day.date === peakDay.date}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: "16px", marginTop: "16px",
          paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)",
          flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { label: "Low (< 45)",      color: "rgba(52,211,153,0.7)"  },
            { label: "Elevated (45–69)", color: "rgba(251,191,36,0.7)" },
            { label: "High (≥ 70)",     color: "rgba(251,113,133,0.7)" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
                {label}
              </span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "4px", borderRadius: "1px", background: "rgba(251,191,36,0.4)" }} />
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>Weekend</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ marginTop: "12px", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", lineHeight: 1.6 }}>
          Forecast based on your 30-day commit trend using linear regression. Adjust your workload to change this trajectory.
        </p>
      </div>

      <style>{`
        @keyframes bsFcPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}