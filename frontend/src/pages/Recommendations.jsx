/**
 * Recommendations.jsx
 * AI-Powered Health Recommendation Dashboard (Masterclass Feature 3).
 * Receives analysis data via React Router location.state from Dashboard.
 */

import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecommendationCard from "../components/RecommendationCard";
import FilterPanel        from "../components/FilterPanel";
import CalendarOverlay    from "../components/CalendarOverlay";

// ─── Recommendation Engine ───────────────────────────────────────────────────
/**
 * Generate personalized recommendations from GitHub + calendar analysis data.
 * Returns an array of recommendation objects.
 */
function generateRecommendations(githubData, calendarData, behaviorData) {
  const recs = [];

  if (!githubData) return recs;

  const {
    lateNightCommits = 0,
    earlyMorningCommits = 0,
    weekendCommits = 0,
    totalCommits = 0,
    spikeDetected = false,
    crashDetected = false,
  } = githubData;

  // ── GitHub-based ─────────────────────────────────────────────────────────

  if (lateNightCommits >= 5) {
    recs.push({
      id: "late-night-1",
      title: "Stop Coding After 11 PM",
      category: "GitHub",
      urgency: lateNightCommits >= 10 ? "High" : "Medium",
      description: `You've pushed ${lateNightCommits} commits after 11 PM. Late-night coding disrupts sleep cycles and compounds fatigue.`,
      detail: "Sustained late-night work degrades code quality, increases bug rates, and elevates cortisol. Even a 30-minute wind-down routine before sleep can measurably improve next-day cognitive performance.",
      actions: [
        "Set a hard calendar block: no code after 10:30 PM",
        "Use macOS Screen Time or Windows Focus Assist to block your IDE after a set hour",
        "Review late-night commits for errors the following morning",
        "Move ambitious tasks to your peak morning hours instead",
      ],
      impact: "Sleep quality improves within 3–5 days of consistent cutoff",
    });
  }

  if (earlyMorningCommits >= 5) {
    recs.push({
      id: "early-morning-1",
      title: "Protect Your Morning Recovery Time",
      category: "Wellness",
      urgency: earlyMorningCommits >= 10 ? "High" : "Medium",
      description: `${earlyMorningCommits} commits before 7 AM indicates very early-start days. Starting too early without rest compounds burnout risk.`,
      detail: "Early morning coding is fine if you're a natural early bird, but if it's paired with late-night work, you're compressing your recovery window dangerously. Aim for 7+ hours between your last commit and first commit.",
      actions: [
        "Track your average sleep window using a health app",
        "Delay morning sessions to 8:00 AM if late-night work occurred the previous day",
        "Build a 15-minute non-screen morning ritual before opening your laptop",
      ],
      impact: "Cognitive performance improves significantly with consistent 7h+ sleep",
    });
  }

  if (weekendCommits >= 5) {
    recs.push({
      id: "weekend-1",
      title: "Reclaim Your Weekends",
      category: "Wellness",
      urgency: weekendCommits >= 10 ? "High" : "Medium",
      description: `${weekendCommits} weekend commits in the last 30 days. Consistent weekend work removes the recovery buffer you need to sustain performance.`,
      detail: "Weekends are not optional recovery time — they are a biological requirement. Without full-day breaks, prefrontal cortex function degrades, creativity drops, and the risk of burnout triples within 6 weeks.",
      actions: [
        "Declare at least one full weekend day as code-free",
        "Batch urgent weekend tasks into a 2-hour focused Saturday morning block — then stop",
        "Communicate boundaries with team: weekend Slack notifications turned off",
      ],
      impact: "Reduces burnout risk by ~40% within 4 weeks",
    });
  }

  if (spikeDetected && !crashDetected) {
    recs.push({
      id: "spike-1",
      title: "You're in a Workload Spike — Pace Yourself",
      category: "Productivity",
      urgency: "High",
      description: "A significant surge in commits was detected. Maintaining spike-level intensity is unsustainable and typically precedes a crash.",
      detail: "Workload spikes are often caused by deadlines, launches, or crunch periods. The danger is not the spike itself — it's the recovery debt that accumulates. Proactive decompression prevents the post-spike crash.",
      actions: [
        "Schedule lighter task days immediately after the peak",
        "Communicate timeline expectations with your manager — proactively",
        "Use Pomodoro (25/5) during the spike to maintain output without exhausting reserves",
        "After the spike ends, take 2 full low-intensity days before resuming normal pace",
      ],
      impact: "Prevents 70% of post-spike productivity crashes",
    });
  }

  if (crashDetected) {
    recs.push({
      id: "crash-1",
      title: "Post-Spike Crash Detected — Recovery Protocol",
      category: "Wellness",
      urgency: "High",
      description: "Your commit activity dropped sharply after a spike. This is a classic burnout pattern. Prioritize structured recovery now.",
      detail: "A post-spike crash is your nervous system signaling that reserves are depleted. Pushing through without recovery extends the crash and deepens long-term burnout. The fastest path out is intentional rest, not pushing harder.",
      actions: [
        "Declare a 3-day 'maintenance mode': only critical, pre-scoped tasks",
        "Remove all non-essential meetings this week",
        "Do one 20-minute walk per day — shown to restore cognitive baseline faster than rest alone",
        "Sleep before midnight for at least 5 consecutive days",
      ],
      impact: "Full cognitive recovery typically takes 5–7 days of structured rest",
    });
  }

  if (totalCommits > 50) {
    recs.push({
      id: "total-1",
      title: "Very High Output — Track Your Energy Not Just Your Tasks",
      category: "Productivity",
      urgency: "Medium",
      description: `${totalCommits} commits in 30 days is very high activity. High output is a strength, but it needs energy monitoring to stay sustainable.`,
      detail: "Tracking velocity (commits, tasks done) without tracking energy (sleep quality, mood, focus) creates a blind spot. You may be running on borrowed time without knowing it.",
      actions: [
        "Add a daily 1-minute energy check: rate 1–10 before opening your IDE",
        "If energy is below 5, switch to documentation or code review — not new features",
        "Use tools like Exist.io or Apple Health to correlate commit output with sleep data",
      ],
      impact: "Prevents silent burnout accumulation over 60+ day periods",
    });
  }

  // ── Calendar-based ───────────────────────────────────────────────────────

  if (calendarData) {
    const {
      totalMeetingHours = 0,
      daysWithMoreThan4Meetings = 0,
      daysWithMoreThan6HoursOfMeetings = 0,
      consecutiveMeetingBlocks = 0,
      averageMeetingDuration = 0,
    } = calendarData;

    if (totalMeetingHours > 20) {
      recs.push({
        id: "meetings-1",
        title: "Cut Meeting Hours by 20%",
        category: "Meetings",
        urgency: totalMeetingHours > 30 ? "High" : "Medium",
        description: `${totalMeetingHours.toFixed(1)} total hours in meetings leaves minimal time for deep work. Research shows knowledge workers need 4h+ of uninterrupted focus daily.`,
        detail: "Meeting overload is one of the top 3 causes of developer burnout. Every meeting under 30 minutes creates more cognitive switching cost than value. Audit your calendar for recurring meetings with vague outcomes.",
        actions: [
          "Audit all recurring meetings: cancel any without a clear decision-making agenda",
          "Switch all status-update meetings to async (Loom video or written update)",
          "Batch your meetings into 2 back-to-back blocks (morning and afternoon) to protect deep work time",
          "Propose a 'no-meeting Wednesday' policy with your team",
        ],
        impact: "Recovering 2h/day of deep work increases output quality by ~35%",
      });
    }

    if (daysWithMoreThan6HoursOfMeetings >= 2) {
      recs.push({
        id: "meetings-2",
        title: "Your Schedule Has No Recovery Days",
        category: "Meetings",
        urgency: "High",
        description: `${daysWithMoreThan6HoursOfMeetings} days with 6+ hours of meetings detected. Days like this are cognitively equivalent to all-nighters.`,
        detail: "Six or more hours of meetings in a single day produces a phenomenon called 'meeting hangover' — reduced focus, irritability, and decision fatigue that carries into the following day. These days leave no time for the work your meetings generate.",
        actions: [
          "Hard-cap meetings at 4 hours per day — treat it like a budget",
          "Build 30-minute recovery blocks after every 2 hours of consecutive meetings",
          "Decline or delegate any meeting where your input is not decision-critical",
        ],
        impact: "Restores cognitive availability and reduces multi-day fatigue cascades",
      });
    }

    if (consecutiveMeetingBlocks >= 4) {
      recs.push({
        id: "meetings-3",
        title: "Break Up Back-to-Back Meeting Chains",
        category: "Meetings",
        urgency: "Medium",
        description: `${consecutiveMeetingBlocks} back-to-back meeting blocks detected. Context switching between continuous meetings is cognitively exhausting.`,
        detail: "Each meeting context switch costs 15–23 minutes of refocusing time. Back-to-back meetings eliminate this recovery entirely, leaving you in a perpetual shallow-attention state.",
        actions: [
          "Add a minimum 15-minute buffer between all meetings in your calendar",
          "Use the buffer for 3-line meeting notes before the next one begins",
          "Try 25-minute and 50-minute meetings instead of 30 and 60 to build natural buffers",
        ],
        impact: "Reduces afternoon mental fatigue by ~30%",
      });
    }

    if (averageMeetingDuration > 60) {
      recs.push({
        id: "meetings-4",
        title: "Shorten Your Average Meeting Duration",
        category: "Meetings",
        urgency: "Low",
        description: `Average meeting duration is ${Math.round(averageMeetingDuration)} minutes. Shorter, focused meetings with written pre-reads are consistently more effective.`,
        detail: "Research by Harvard Business Review shows meetings longer than 45 minutes see a steep drop in attention and decision quality. Most 60-minute meetings can be 30 minutes with a pre-read agenda.",
        actions: [
          "Send a 3-bullet written agenda 24 hours before every meeting you own",
          "Default all recurring meetings to 30 minutes and extend only if needed",
          "End meetings with a 2-minute written summary of decisions made",
        ],
        impact: "Reduces total calendar load by 15–25% over a month",
      });
    }
  }

  // ── Behavioral patterns ──────────────────────────────────────────────────

  if (behaviorData?.patternsDetected?.includes("Burnout Signal")) {
    recs.push({
      id: "burnout-signal-1",
      title: "Consecutive High-Load Days — Mandatory Decompression",
      category: "Wellness",
      urgency: "High",
      description: "5+ consecutive heavy workload days detected. This pattern is the strongest predictor of acute burnout in the next 2 weeks.",
      detail: "Consecutive high-output days create cumulative stress debt that compounds exponentially, not linearly. By day 7, productivity per hour is typically below 40% of baseline, but subjective confidence remains high — making it a 'hidden' depletion.",
      actions: [
        "Schedule a mandatory low-intensity day within the next 2 days — no exceptions",
        "On recovery days: only code review, documentation, or learning tasks",
        "Set an out-of-office on Slack for the recovery afternoon",
        "Talk to your manager about adjusting sprint scope proactively",
      ],
      impact: "Prevents acute burnout event with ~80% reliability when actioned within 48h",
    });
  }

  // ── Universal wellness recommendations ───────────────────────────────────
  recs.push({
    id: "wellness-hydration",
    title: "Optimize Your Deep Work Environment",
    category: "Productivity",
    urgency: "Low",
    description: "Regardless of workload, your physical environment and habits directly amplify or drain cognitive capacity.",
    detail: "Even 2% dehydration reduces working memory by up to 20%. Poor ergonomics add constant background stress. These are easy wins that compound over months.",
    actions: [
      "Keep a 500ml water bottle visible at your desk — refill every 2 hours",
      "Take a 5-minute standing break every 45 minutes (set a recurring timer)",
      "Position your monitor at eye level — chronic neck strain elevates cortisol",
      "Add one 20-minute outdoor walk into your daily routine (not optional)",
    ],
    impact: "Boosts sustained focus capacity by 15–25% within 2 weeks",
  });

  recs.push({
    id: "wellness-async",
    title: "Build an Async-First Communication Habit",
    category: "Productivity",
    urgency: "Low",
    description: "Reactive, interrupt-driven communication (Slack, email) is a hidden burnout amplifier that fragments deep work and inflates perceived busyness.",
    detail: "Studies show the average developer is interrupted every 13 minutes. Each interruption takes 23 minutes to fully recover from. Switching to async-first communication is the highest-leverage productivity change available.",
    actions: [
      "Set Slack/Teams to 'Do Not Disturb' during your focused work blocks",
      "Respond to non-urgent messages in two scheduled batches: late morning and end-of-day",
      "Use thread replies instead of DMs to reduce 1-on-1 interrupt volume",
      "Communicate your response time policy to your team (e.g. 'I respond within 2h during work hours')",
    ],
    impact: "Recovers 90+ minutes of deep work per day for most knowledge workers",
  });

  return recs;
}

// ─── AI Insight Panel ────────────────────────────────────────────────────────
function InsightPanel({ githubData, calendarData, behaviorData, recCount }) {
  const riskLevel = useMemo(() => {
    if (!githubData) return "Unknown";
    const score = (githubData.spikeDetected ? 30 : 0)
      + (githubData.crashDetected ? 25 : 0)
      + (githubData.lateNightCommits > 5 ? 15 : 0)
      + (githubData.weekendCommits > 5 ? 10 : 0)
      + ((calendarData?.totalMeetingHours || 0) > 20 ? 20 : 0);
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  }, [githubData, calendarData]);

  const riskCfg = {
    High:    { color: "text-red-400",     bg: "bg-red-500/8",     border: "border-red-500/20",     label: "⚠ High Risk" },
    Medium:  { color: "text-amber-400",   bg: "bg-amber-500/8",   border: "border-amber-500/20",   label: "◑ Moderate Risk" },
    Low:     { color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", label: "✓ Low Risk" },
    Unknown: { color: "text-white/40",    bg: "bg-white/4",       border: "border-white/10",       label: "? Unknown" },
  }[riskLevel];

  const patterns = behaviorData?.patternsDetected || [];

  const summary = useMemo(() => {
    if (!githubData) return "No analysis data available. Please run a burnout analysis on the Dashboard first.";

    const parts = [];
    if (githubData.totalCommits > 0) parts.push(`${githubData.totalCommits} commits in the last 30 days`);
    if (githubData.lateNightCommits > 0) parts.push(`${githubData.lateNightCommits} late-night sessions`);
    if (githubData.weekendCommits > 0) parts.push(`${githubData.weekendCommits} weekend commits`);
    if (calendarData?.totalMeetingHours > 0) parts.push(`${calendarData.totalMeetingHours.toFixed(1)}h in meetings`);
    if (githubData.spikeDetected) parts.push("a detected workload spike");
    if (githubData.crashDetected) parts.push("a post-spike crash");

    if (parts.length === 0) return "No significant activity detected in the analysis window.";

    return `Your 30-day profile shows ${parts.join(", ")}. Based on these patterns, ${recCount} personalized recommendations have been generated to help optimize your performance and protect your health.`;
  }, [githubData, calendarData, recCount]);

  return (
    <div className={`rounded-2xl border ${riskCfg.border} ${riskCfg.bg} backdrop-blur-xl p-6 relative overflow-hidden`}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start gap-4">
        {/* Brain icon */}
        <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🧠</span>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-sm font-bold text-white tracking-wide">AI Health Insight</h2>
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${riskCfg.color} ${riskCfg.bg} ${riskCfg.border}`}>
              {riskCfg.label}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{summary}</p>

          {/* Pattern badges */}
          {patterns.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mr-1 self-center">
                Patterns:
              </span>
              {patterns.map(p => (
                <span
                  key={p}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/8 border border-white/12 text-white/40"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
function triggerPrint() { window.print(); }

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Recommendations() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Data passed from Dashboard via router state
  const {
    username     = "unknown",
    githubData   = null,
    calendarData = null,
    behaviorData = null,
  } = location.state || {};

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter,  setUrgencyFilter]  = useState("All");
  const [selectedDate,   setSelectedDate]   = useState(null);

  // Generate all recommendations
  const allRecs = useMemo(
    () => generateRecommendations(githubData, calendarData, behaviorData),
    [githubData, calendarData, behaviorData]
  );

  // Filtered recs
  const filteredRecs = useMemo(() => {
    return allRecs.filter(r => {
      const catOk = categoryFilter === "All" || r.category === categoryFilter;
      const urgOk = urgencyFilter  === "All" || r.urgency  === urgencyFilter;
      return catOk && urgOk;
    });
  }, [allRecs, categoryFilter, urgencyFilter]);

  // Count per category for badges
  const counts = useMemo(() => {
    const c = { GitHub: 0, Meetings: 0, Productivity: 0, Wellness: 0 };
    allRecs.forEach(r => { if (c[r.category] !== undefined) c[r.category]++; });
    return c;
  }, [allRecs]);

  // Per-day recs for calendar click
  const dayRecs = useMemo(() => {
    if (!selectedDate) return [];
    const dow = new Date(selectedDate + "T12:00:00").getDay();
    const isWeekend = dow === 0 || dow === 6;
    const commits = githubData?.dailyActivity?.[selectedDate] || 0;
    const subset = [];
    if (isWeekend && commits > 0) subset.push(...allRecs.filter(r => r.id === "weekend-1"));
    if (commits > 0) subset.push(...allRecs.filter(r => r.id === "late-night-1" || r.id === "total-1"));
    return subset.length > 0 ? subset : allRecs.slice(0, 2);
  }, [selectedDate, allRecs, githubData]);

  // No data guard
  if (!githubData) {
    return (
      <div className="min-h-screen bg-[#080a0e] flex items-center justify-center font-['Syne',sans-serif]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-3xl mb-6">
            🧠
          </div>
          <h2 className="text-2xl font-black text-white">No analysis data</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Run a burnout analysis on the Dashboard first. Your personalized recommendations will appear here.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-3 rounded-xl bg-amber-400 text-black font-bold text-sm font-mono hover:bg-amber-300 transition-all"
          >
            ← Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0e] text-white font-['Syne',sans-serif] relative overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @media print { .no-print { display:none!important; } body { background:white!important; color:black!important; } }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none no-print">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/4 rounded-full blur-[110px]" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-sky-500/3 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-10">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-white/40
                hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase">Recommendations</span>
                <span className="text-white/20">·</span>
                <span className="text-xs font-mono text-amber-400/70">@{username}</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white mt-0.5">
                Personalized Health Recommendations
              </h1>
            </div>
          </div>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400
              text-xs font-mono hover:bg-amber-400/20 hover:border-amber-400/40 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* ── AI Insight Panel ─────────────────────────────────────────────── */}
        <div className="mb-6 animate-[fadeIn_0.3s_ease-out]">
          <InsightPanel
            githubData={githubData}
            calendarData={calendarData}
            behaviorData={behaviorData}
            recCount={allRecs.length}
          />
        </div>

        {/* ── Main grid: left = recs, right = calendar ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: filters + cards */}
          <div className="lg:col-span-2 space-y-5">

            {/* Filter Panel */}
            <div className="animate-[fadeIn_0.35s_ease-out] no-print">
              <FilterPanel
                categoryFilter={categoryFilter}
                urgencyFilter={urgencyFilter}
                onCategoryChange={setCategoryFilter}
                onUrgencyChange={setUrgencyFilter}
                counts={counts}
              />
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
                {filteredRecs.length} recommendation{filteredRecs.length !== 1 ? "s" : ""}
                {(categoryFilter !== "All" || urgencyFilter !== "All") && (
                  <span className="text-amber-400/60 ml-1">· filtered</span>
                )}
              </p>
              {(categoryFilter !== "All" || urgencyFilter !== "All") && (
                <button
                  onClick={() => { setCategoryFilter("All"); setUrgencyFilter("All"); }}
                  className="text-[10px] font-mono text-white/25 hover:text-white/50 transition-colors underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Recommendation cards */}
            {filteredRecs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-12 text-center">
                <p className="text-white/30 font-mono text-sm">No recommendations match this filter.</p>
                <button
                  onClick={() => { setCategoryFilter("All"); setUrgencyFilter("All"); }}
                  className="mt-3 text-xs text-amber-400/60 hover:text-amber-400 transition-colors font-mono underline underline-offset-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecs.map((rec, i) => (
                  <RecommendationCard key={rec.id} rec={rec} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Right: calendar + day detail */}
          <div className="space-y-5">

            {/* Calendar Overlay */}
            <div className="animate-[fadeIn_0.45s_ease-out] sticky top-4">
              <CalendarOverlay
                dailyActivity={githubData?.dailyActivity || {}}
                calendarData={calendarData}
                onDateClick={setSelectedDate}
                selectedDate={selectedDate}
              />

              {/* Day detail panel */}
              {selectedDate && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono text-white/35 uppercase tracking-widest">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric"
                      })}
                    </p>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-white/25 hover:text-white/60 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Day stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-lg border border-white/8 bg-white/4 p-2.5 text-center">
                      <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Commits</p>
                      <p className="text-lg font-black font-mono text-amber-400">
                        {githubData?.dailyActivity?.[selectedDate] || 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/8 bg-white/4 p-2.5 text-center">
                      <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Day</p>
                      <p className="text-sm font-bold text-white/70">
                        {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                    </div>
                  </div>

                  {/* Related recs */}
                  <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">
                    Relevant Tips
                  </p>
                  <div className="space-y-2">
                    {dayRecs.slice(0, 2).map(rec => (
                      <div key={rec.id} className="rounded-xl border border-white/8 bg-white/3 p-3">
                        <p className="text-xs font-bold text-white/80 mb-0.5">{rec.title}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats summary */}
              <div className="mt-4 grid grid-cols-2 gap-2 animate-[fadeIn_0.55s_ease-out]">
                {[
                  { label: "High Priority", value: allRecs.filter(r => r.urgency === "High").length,   color: "text-red-400" },
                  { label: "Medium",        value: allRecs.filter(r => r.urgency === "Medium").length, color: "text-orange-400" },
                  { label: "Low Priority",  value: allRecs.filter(r => r.urgency === "Low").length,    color: "text-emerald-400" },
                  { label: "Total",         value: allRecs.length,                                     color: "text-amber-400" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-3 text-center">
                    <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer back button ──────────────────────────────────────────── */}
        <div className="mt-10 flex justify-center no-print">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-mono
              hover:bg-white/8 hover:border-white/20 hover:text-white/70 transition-all duration-200"
          >
            ← Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}