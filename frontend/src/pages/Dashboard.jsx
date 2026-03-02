import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyzeBurnout,
  analyzeBurnoutAuth,
  analyzeBehaviorPatterns,
  getUserProfile,
  updateGithubUsername,
} from "../services/api";
import { isLoggedIn, getUser, getToken } from "../utils/auth"; // ← added getToken
import BurnoutCard from "../components/BurnoutCard";
import GithubStats from "../components/GithubStats";
import CalendarStats from "../components/CalendarStats";
import BehaviorPatternsCard from "../components/BehaviorPatternsCard";
import Loader from "../components/Loader";
import SupportMode from "../components/SupportMode";
import RecoveryMode from "../components/RecoveryMode";
import BurnoutForecast from "../components/BurnoutForecast";

export default function Dashboard() {
  const navigate = useNavigate();

  // ── Auth state ─────────────────────────────────────────────────────────────
  const loggedIn = isLoggedIn();
  const localUser = getUser();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [calendarFile, setCalendarFile] = useState(null);
  const [result, setResult] = useState(null);
  const [behaviorData, setBehaviorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingGithub, setSavingGithub] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [supportOpen, setSupportOpen] = useState(false);

  const fileRef = useRef();
  const resultsRef = useRef();

  // ── On mount: fetch profile if logged in, then auto-run analysis ───────────
  // FIX: read getToken() directly inside the effect instead of relying on the
  // render-time loggedIn snapshot — fixes cold-load auth race condition.
  useEffect(() => {
    async function init() {
      const token = getToken(); // ← read fresh from localStorage, not render snapshot
      if (!token) return;
      setProfileLoading(true);
      try {
        const p = await getUserProfile();
        setProfile(p);
        if (p.githubUsername) {
          setUsername(p.githubUsername);
          await runAnalysis(p.githubUsername, null, true);
        }
      } catch {
        // Profile fetch failed silently — user can still use dashboard manually
      } finally {
        setProfileLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core analysis runner ───────────────────────────────────────────────────
  async function runAnalysis(usernameToUse, calFile, isAutoRun = false) {
    setError(null);
    if (!isAutoRun) setResult(null);
    setBehaviorData(null);
    setLoading(true);

    try {
      const formData = new FormData();

      if (loggedIn) {
        formData.append("githubUsername", usernameToUse);
        if (calFile) formData.append("calendar", calFile);

        const [data, patterns] = await Promise.all([
          analyzeBurnoutAuth(formData),
          analyzeBehaviorPatterns(usernameToUse),
        ]);
        setResult(data);
        setBehaviorData(patterns);
        if (data.burnoutScore >= 70) {
          setTimeout(() => setRecoveryOpen(true), 800);
        }
      } else {
        formData.append("githubUsername", usernameToUse);
        if (calFile) formData.append("calendar", calFile);

        const [data, patterns] = await Promise.all([
          analyzeBurnout(formData),
          analyzeBehaviorPatterns(usernameToUse),
        ]);
        setResult(data);
        setBehaviorData(patterns);
        if (data.burnoutScore >= 70) {
          setTimeout(() => setRecoveryOpen(true), 800);
        }
      }

      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Failed to connect to the backend. Is it running on port 5000?"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;
    await runAnalysis(username.trim(), calendarFile);
  }

  // ── Save GitHub username to profile ───────────────────────────────────────
  async function handleSaveGithub() {
    if (!username.trim() || !loggedIn) return;
    setSavingGithub(true);
    try {
      await updateGithubUsername(username.trim());
      setProfile(p => ({ ...p, githubUsername: username.trim() }));
      setSavedMsg("Saved!");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch {
      setSavedMsg("Failed to save.");
      setTimeout(() => setSavedMsg(""), 2500);
    } finally {
      setSavingGithub(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setCalendarFile(file);
  }

  function handleViewTimeline() {
    navigate("/timeline", {
      state: {
        username: username.trim(),
        githubData: result.githubData,
        calendarData: result.calendarData,
      },
    });
  }

  function handleViewRecommendations() {
    navigate("/recommendations", {
      state: {
        username: username.trim(),
        githubData: result.githubData,
        calendarData: result.calendarData,
        behaviorData,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#080a0e] text-white font-['Syne',sans-serif] relative overflow-x-hidden">
      {supportOpen && (
        <SupportMode
          onClose={() => setSupportOpen(false)}
          burnoutContext={result ? {
            burnoutScore: result.burnoutScore,
            riskLevel: result.riskLevel,
            insight: result.insight,
            lateNightCommits: result.githubData?.lateNightCommits,
            weekendCommits: result.githubData?.weekendCommits,
            totalCommits: result.githubData?.totalCommits,
            longestStreak: result.githubData?.longestStreak,
            overloadDays: result.calendarData?.overloadDays,
            meetingHours: result.calendarData?.meetingHours,
            focusHours: result.calendarData?.focusHours,
          } : null}
        />
      )}

      {recoveryOpen && (
        <RecoveryMode
          burnoutScore={result?.burnoutScore}
          riskLevel={result?.riskLevel}
          insight={result?.insight}
          githubData={result?.githubData}
          result={result}
          username={username}
          onDismiss={() => setRecoveryOpen(false)}
        />
      )}

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-600/3 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/8
            text-amber-400 text-xs font-mono tracking-[0.2em] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Analysis Dashboard
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none">
            <span className="text-white">Burnout</span>
            <span className="text-amber-400">Scope</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Detect developer burnout before it breaks you. Analyze your commit patterns and schedule intensity in seconds.
          </p>
        </div>

        {/* ── Logged-in welcome banner ─────────────────────────────────────── */}
        {loggedIn && (
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/6 px-5 py-3.5
            flex items-center justify-between gap-3 animate-[fadeIn_0.4s_ease-out]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-mono text-emerald-300">
                  Welcome back, <span className="font-bold">{localUser?.email}</span>
                </p>
                {profile?.lastAnalysis && (
                  <p className="text-[10px] text-white/25 font-mono mt-0.5">
                    Last analysis: {new Date(profile.lastAnalysis).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                )}
              </div>
            </div>
            {profileLoading && (
              <span className="text-[10px] font-mono text-white/30 animate-pulse">Loading profile…</span>
            )}
          </div>
        )}

        {/* ── Not logged in nudge ───────────────────────────────────────────── */}
        {!loggedIn && (
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-white/8 bg-white/3 px-5 py-3
            flex items-center justify-between gap-3">
            <p className="text-xs font-mono text-white/30">
              💡 <span className="text-white/50">Create a free account</span> to save your GitHub username and auto-sync on every visit.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-400/12 border border-amber-400/25
                text-amber-400 hover:bg-amber-400/20 transition-all duration-200 flex-shrink-0"
            >
              Register free →
            </button>
          </div>
        )}

        {/* ── Input Form ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-8 mb-8
          hover:border-white/15 transition-all duration-300 max-w-2xl mx-auto">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent rounded-t-2xl" />

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── TOUR TARGET 1: GitHub Username ── */}
            <div data-tour="github-input">
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                GitHub Username
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white
                      placeholder-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-black/60
                      transition-all duration-200 font-mono"
                  />
                </div>

                {loggedIn && username.trim() && username.trim() !== profile?.githubUsername && (
                  <button
                    type="button"
                    onClick={handleSaveGithub}
                    disabled={savingGithub}
                    className="px-4 py-2 rounded-xl bg-white/6 border border-white/12 text-xs font-mono text-white/50
                      hover:bg-white/10 hover:border-white/20 hover:text-white/70 transition-all duration-200
                      disabled:opacity-40 flex-shrink-0 self-center"
                    title="Save this GitHub username to your profile"
                  >
                    {savingGithub ? "Saving…" : savedMsg || "Save ↑"}
                  </button>
                )}
                {savedMsg && username.trim() === profile?.githubUsername && (
                  <span className="text-xs font-mono text-emerald-400/70 self-center flex-shrink-0">{savedMsg}</span>
                )}
              </div>
            </div>

            {/* ── TOUR TARGET 2: Calendar Upload ── */}
            <div data-tour="calendar-upload">
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                Calendar File{" "}
                <span className="text-white/20 normal-case font-sans not-italic">(CSV or ICS · optional)</span>
              </label>
              <div
                className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${dragOver
                  ? "border-amber-400/50 bg-amber-400/5"
                  : calendarFile
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/3"
                  }`}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.ics"
                  className="hidden"
                  onChange={(e) => setCalendarFile(e.target.files[0])}
                />
                {calendarFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/15 border border-emerald-400/25 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-emerald-300 font-mono">{calendarFile.name}</p>
                      <button
                        type="button"
                        className="text-xs text-white/30 hover:text-white/60 transition-colors mt-0.5"
                        onClick={(e) => { e.stopPropagation(); setCalendarFile(null); }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-white/30">
                      Drop your <span className="text-amber-400/70">CSV or ICS</span> or{" "}
                      <span className="text-amber-400/70">click to browse</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase
                font-mono disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300
                active:scale-[0.99] transition-all duration-200 shadow-[0_0_30px_rgba(251,191,36,0.2)]
                hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]"
            >
              {loading ? "Analyzing..." : "Run Analysis →"}
            </button>
          </form>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-300">Analysis Failed</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loader ────────────────────────────────────────────────────────── */}
        {loading && <Loader />}

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {result && !loading && (
          <div ref={resultsRef} className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-xs font-mono tracking-[0.3em] text-white/30 uppercase">
                Results for @{username}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {/* ── TOUR TARGET 3: Burnout Score Card ── */}
            <div data-tour="burnout-card">
              <BurnoutCard
                burnoutScore={result.burnoutScore}
                riskLevel={result.riskLevel}
                insight={result.insight}
              />
            </div>

            <BurnoutForecast
              dailyActivity={result.githubData.dailyActivity}
              burnoutScore={result.burnoutScore}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── TOUR TARGET 4: GitHub Stats ── */}
              <div data-tour="github-stats">
                <GithubStats githubData={result.githubData} />
              </div>

              <CalendarStats calendarData={result.calendarData} />
            </div>

            {behaviorData && (
              <BehaviorPatternsCard
                patternsDetected={behaviorData.patternsDetected}
                severityScore={behaviorData.severityScore}
                patternInsights={behaviorData.patternInsights}
              />
            )}

            {/* ── Action buttons ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">

              {/* ── TOUR TARGET 5: Timeline button ── */}
              <button
                data-tour="timeline-btn"
                onClick={handleViewTimeline}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/15 bg-white/5
                  backdrop-blur-xl hover:bg-white/8 hover:border-white/25 transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center
                  justify-center group-hover:bg-amber-400/25 transition-all duration-300">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white tracking-wide">View Interactive Timeline</p>
                  <p className="text-xs text-white/35 font-mono">30-day scrollable activity chart →</p>
                </div>
              </button>

              {/* ── TOUR TARGET 6: Recommendations button ── */}
              <button
                data-tour="recs-btn"
                onClick={handleViewRecommendations}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-emerald-500/20
                  bg-emerald-500/5 backdrop-blur-xl hover:bg-emerald-500/10 hover:border-emerald-500/35
                  transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(52,211,153,0.1)]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-400/15 border border-emerald-400/25 flex items-center
                  justify-center group-hover:bg-emerald-400/25 transition-all duration-300">
                  <span className="text-base">🧠</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white tracking-wide">View Recommendations</p>
                  <p className="text-xs text-white/35 font-mono">Health action plan →</p>
                </div>
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ── TOUR TARGET 7: Support Mode button ── */}
      <button
        data-tour="support-btn"
        onClick={() => setSupportOpen(true)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 22px",
          borderRadius: "50px",
          background: "linear-gradient(135deg, rgba(125,211,252,0.12), rgba(99,102,241,0.1))",
          border: "1px solid rgba(125,211,252,0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#bae6fd",
          fontSize: "13px",
          fontFamily: "'Syne', sans-serif",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(125,211,252,0.08), 0 2px 8px rgba(0,0,0,0.4)",
          letterSpacing: "0.02em",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(125,211,252,0.18), 0 4px 12px rgba(0,0,0,0.4)";
          e.currentTarget.style.borderColor = "rgba(125,211,252,0.45)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(125,211,252,0.08), 0 2px 8px rgba(0,0,0,0.4)";
          e.currentTarget.style.borderColor = "rgba(125,211,252,0.25)";
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>🌙</span>
        I need support right now
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}