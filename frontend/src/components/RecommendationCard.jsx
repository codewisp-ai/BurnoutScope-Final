/**
 * RecommendationCard.jsx
 * Individual recommendation card with expand/collapse, urgency color coding,
 * category badge, and hover animations.
 */

import { useState } from "react";

const URGENCY_CFG = {
  High: {
    bar:    "bg-red-500",
    badge:  "bg-red-500/15 border-red-500/30 text-red-300",
    glow:   "hover:shadow-[0_4px_32px_rgba(239,68,68,0.15)]",
    dot:    "bg-red-400 animate-pulse",
    border: "hover:border-red-500/30",
    icon:   "🔴",
  },
  Medium: {
    bar:    "bg-orange-400",
    badge:  "bg-orange-500/15 border-orange-500/30 text-orange-300",
    glow:   "hover:shadow-[0_4px_32px_rgba(251,146,60,0.15)]",
    dot:    "bg-orange-400",
    border: "hover:border-orange-500/25",
    icon:   "🟠",
  },
  Low: {
    bar:    "bg-emerald-500",
    badge:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    glow:   "hover:shadow-[0_4px_32px_rgba(52,211,153,0.1)]",
    dot:    "bg-emerald-400",
    border: "hover:border-emerald-500/25",
    icon:   "🟢",
  },
};

const CATEGORY_CFG = {
  GitHub:       { icon: "⚡", color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
  Meetings:     { icon: "📅", color: "text-sky-400",    bg: "bg-sky-400/10 border-sky-400/20" },
  Productivity: { icon: "🎯", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  Wellness:     { icon: "💚", color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20" },
};

export default function RecommendationCard({ rec, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const urgency  = URGENCY_CFG[rec.urgency]  || URGENCY_CFG.Low;
  const category = CATEGORY_CFG[rec.category] || CATEGORY_CFG.Productivity;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl
        transition-all duration-300 hover:-translate-y-1 hover:bg-white/6 hover:border-white/15
        ${urgency.glow} ${urgency.border}
        animate-[fadeIn_0.4s_ease-out_both]`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Urgency top bar */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${urgency.bar} opacity-70`} />

      {/* Shimmer line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Urgency dot */}
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${urgency.dot}`} />

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white leading-snug mb-1.5 group-hover:text-white/95 transition-colors">
                {rec.title}
              </h3>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${category.bg} ${category.color}`}>
                  {category.icon} {rec.category}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${urgency.badge}`}>
                  {urgency.icon} {rec.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-white/30
              hover:text-white/70 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Short description */}
        <p className="text-xs text-white/50 leading-relaxed pl-5">{rec.description}</p>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pl-5 animate-[fadeIn_0.25s_ease-out]">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-3">
              {/* Detail text */}
              {rec.detail && (
                <p className="text-xs text-white/60 leading-relaxed">{rec.detail}</p>
              )}

              {/* Action steps */}
              {rec.actions && rec.actions.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                    Suggested Actions
                  </p>
                  <ul className="space-y-1.5">
                    {rec.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="text-amber-400/60 mt-0.5 flex-shrink-0">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Impact tag */}
              {rec.impact && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Impact:</span>
                  <span className="text-[10px] font-mono text-white/50">{rec.impact}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}