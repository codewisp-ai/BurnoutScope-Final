/**
 * FilterPanel.jsx
 * Category + urgency filter bar for the recommendations page.
 * Props: { categoryFilter, urgencyFilter, onCategoryChange, onUrgencyChange, counts }
 */

const CATEGORIES = ["All", "GitHub", "Meetings", "Productivity", "Wellness"];
const URGENCIES  = ["All", "High", "Medium", "Low"];

const URGENCY_STYLES = {
  All:    "text-white/50  border-white/15  bg-white/4   hover:border-white/25  hover:text-white/70",
  High:   "text-red-300   border-red-500/25   bg-red-500/8   hover:border-red-500/40   hover:bg-red-500/12",
  Medium: "text-orange-300 border-orange-500/25 bg-orange-500/8 hover:border-orange-500/40 hover:bg-orange-500/12",
  Low:    "text-emerald-300 border-emerald-500/25 bg-emerald-500/8 hover:border-emerald-500/40 hover:bg-emerald-500/12",
};

const URGENCY_ACTIVE = {
  All:    "!border-white/30  !bg-white/10  !text-white",
  High:   "!border-red-500/50   !bg-red-500/20   !text-red-200",
  Medium: "!border-orange-500/50 !bg-orange-500/20 !text-orange-200",
  Low:    "!border-emerald-500/50 !bg-emerald-500/20 !text-emerald-200",
};

const CAT_ICONS = {
  All: "✦", GitHub: "⚡", Meetings: "📅", Productivity: "🎯", Wellness: "💚",
};

export default function FilterPanel({
  categoryFilter,
  urgencyFilter,
  onCategoryChange,
  onUrgencyChange,
  counts = {},
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-4 space-y-4">
      {/* Category row */}
      <div>
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.25em] mb-2.5">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const isActive = categoryFilter === cat;
            const count = cat === "All"
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[cat] || 0);

            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border transition-all duration-200
                  ${isActive
                    ? "bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.1)]"
                    : "bg-white/4 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60 hover:bg-white/6"
                  }`}
              >
                <span>{CAT_ICONS[cat]}</span>
                <span>{cat}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold
                    ${isActive ? "bg-amber-400/30 text-amber-200" : "bg-white/8 text-white/30"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/6" />

      {/* Urgency row */}
      <div>
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.25em] mb-2.5">
          Urgency
        </p>
        <div className="flex flex-wrap gap-2">
          {URGENCIES.map(urg => {
            const isActive = urgencyFilter === urg;
            return (
              <button
                key={urg}
                onClick={() => onUrgencyChange(urg)}
                className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all duration-200
                  ${isActive ? URGENCY_ACTIVE[urg] : URGENCY_STYLES[urg]}`}
              >
                {urg === "High"   && "🔴 "}
                {urg === "Medium" && "🟠 "}
                {urg === "Low"    && "🟢 "}
                {urg}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}