/**
 * BurnoutPulse.jsx — Mood check-in widget with burnout correlation chart
 *
 * USAGE in Dashboard.jsx — add above the input form:
 *   import BurnoutPulse from "../components/BurnoutPulse";
 *   <BurnoutPulse burnoutScore={result?.burnoutScore} />
 */

import { useState, useEffect, useMemo } from "react";
import { getToken } from "../utils/auth";
const DEMO_MODE = true;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MOODS = [
    { id: "exhausted", emoji: "😴", label: "Exhausted", score: 1, color: "#FB7185" },
    { id: "stressed", emoji: "😤", label: "Stressed", score: 2, color: "#FB923C" },
    { id: "okay", emoji: "😐", label: "Okay", score: 3, color: "#FBBF24" },
    { id: "good", emoji: "🙂", label: "Good", score: 4, color: "#34D399" },
    { id: "energized", emoji: "⚡", label: "Energized", score: 5, color: "#38BDF8" },
];

const STORAGE_KEY = "embermind_pulse_history";
const SESSION_KEY = "embermind_pulse_done";

async function logMoodToBackend(moodId, burnoutScore) {
    const token = getToken();
    if (!token) return null;
    try {
        const res = await fetch(`${API_URL}/api/pulse/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ mood: moodId, burnoutScore }),
        });
        return res.ok ? await res.json() : null;
    } catch { return null; }
}

async function fetchMoodHistory() {
    const token = getToken();
    if (!token) return null;
    try {
        const res = await fetch(`${API_URL}/api/pulse/history`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.ok ? await res.json() : null;
    } catch { return null; }
}

function getLocalHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveLocalEntry(moodId, burnoutScore) {
    const history = getLocalHistory();
    history.push({ mood: moodId, burnoutScore, date: new Date().toISOString() });
    if (history.length > 30) history.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
}

function Sparkline({ entries }) {
    if (!entries || entries.length < 2) return null;
    const W = 280, H = 70, PAD = 8;
    const n = entries.length;

    const moodPoints = entries.map((e, i) => {
        const x = PAD + (i / (n - 1)) * (W - PAD * 2);
        const y = H - PAD - ((e.moodScore - 1) / 4) * (H - PAD * 2);
        return `${x},${y}`;
    });
    const burnoutPoints = entries.map((e, i) => {
        const x = PAD + (i / (n - 1)) * (W - PAD * 2);
        const y = H - PAD - (e.burnoutScore / 100) * (H - PAD * 2);
        return `${x},${y}`;
    });

    const lastMood = entries[entries.length - 1].moodScore;
    const lastBurnout = entries[entries.length - 1].burnoutScore;
    const corr =
        lastBurnout > 60 && lastMood <= 2 ? "Your data and how you feel are aligned — high burnout, low energy." :
            lastBurnout < 40 && lastMood >= 4 ? "Great alignment — low burnout and you feel it too." :
                lastBurnout > 60 && lastMood >= 4 ? "Interesting — you feel okay but your data shows high burnout risk." :
                    lastBurnout < 40 && lastMood <= 2 ? "Your data looks healthy but you're feeling drained — rest matters too." :
                        "Tracking your mood helps spot patterns your data alone can't show.";

    return (
        <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Mood vs Burnout — last {entries.length} sessions
                </span>
                <div style={{ display: "flex", gap: "12px" }}>
                    {[{ color: "#38BDF8", label: "Mood" }, { color: "#FB7185", label: "Burnout" }].map(({ color, label }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ width: "16px", height: "2px", background: color, borderRadius: "1px" }} />
                            <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <svg width={W} height={H} style={{ overflow: "visible", display: "block" }}>
                {[0.25, 0.5, 0.75].map((t) => (
                    <line key={t} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)}
                        stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                <path d={`M ${burnoutPoints.join(" L ")}`} fill="none" stroke="#FB7185" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 2" />
                <path d={`M ${moodPoints.join(" L ")}`} fill="none" stroke="#38BDF8" strokeWidth="2" strokeOpacity="0.8" />
                {entries.map((e, i) => {
                    const x = PAD + (i / (n - 1)) * (W - PAD * 2);
                    const y = H - PAD - ((e.moodScore - 1) / 4) * (H - PAD * 2);
                    return <circle key={i} cx={x} cy={y} r={i === n - 1 ? 4 : 2.5}
                        fill={i === n - 1 ? "#38BDF8" : "rgba(56,189,248,0.5)"}
                        stroke={i === n - 1 ? "rgba(56,189,248,0.3)" : "none"} strokeWidth={i === n - 1 ? 4 : 0} />;
                })}
            </svg>
            <p style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", marginTop: "8px", lineHeight: 1.6, letterSpacing: "0.04em" }}>
                {corr}
            </p>
        </div>
    );
}

export default function BurnoutPulse({ burnoutScore }) {
    const [phase, setPhase] = useState("idle");
    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState([]);
    const [hoveredId, setHoveredId] = useState(null);
    const isLoggedIn = !!getToken();

    useEffect(() => {
        async function load() {
            if (isLoggedIn) {
                const data = await fetchMoodHistory();
                if (data?.history) setHistory(data.history);
            } else {
                setHistory(getLocalHistory());
            }
            const done = sessionStorage.getItem(SESSION_KEY);
            if (DEMO_MODE || !done) setTimeout(() => setPhase("asking"), 600);
            else setPhase("done");
        }
        load();
    }, []);

    const chartEntries = useMemo(() =>
        history.slice(-12).map((e) => ({
            moodScore: MOODS.find((m) => m.id === e.mood)?.score || 3,
            burnoutScore: e.burnoutScore || 0,
            date: e.date,
        })), [history]);

    async function handleSelect(mood) {
        setSelected(mood.id);
        setPhase("submitting");
        if (isLoggedIn) {
            await logMoodToBackend(mood.id, burnoutScore || 0);
            const data = await fetchMoodHistory();
            if (data?.history) setHistory(data.history);
        } else {
            setHistory(saveLocalEntry(mood.id, burnoutScore || 0));
        }
        sessionStorage.setItem(SESSION_KEY, "true");
        setTimeout(() => setPhase("done"), 400);
    }

    if (phase === "idle") return null;
    const selectedMood = MOODS.find((m) => m.id === selected);

    return (
        <div style={{
            borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(6,8,12,0.7)", backdropFilter: "blur(20px)",
            overflow: "hidden", fontFamily: "'Syne', sans-serif",
            position: "relative", marginBottom: "8px",
        }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)" }} />
            <div style={{ padding: "20px 24px" }}>

                {phase === "asking" && (
                    <div style={{ animation: "bsPulseIn 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 8px #38BDF8", animation: "bsFcPulse 2s ease-in-out infinite" }} />
                            <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(56,189,248,0.7)", textTransform: "uppercase" }}>
                                Burnout Pulse · Check-in
                            </span>
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.85)", marginBottom: "18px", lineHeight: 1.3 }}>
                            Before we show your data — how are you feeling right now?
                        </p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {MOODS.map((mood) => (
                                <button key={mood.id} onClick={() => handleSelect(mood)}
                                    onMouseEnter={() => setHoveredId(mood.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        flex: 1, minWidth: "80px", padding: "12px 8px", borderRadius: "14px",
                                        background: hoveredId === mood.id ? `${mood.color}15` : "rgba(255,255,255,0.04)",
                                        border: hoveredId === mood.id ? `1px solid ${mood.color}40` : "1px solid rgba(255,255,255,0.08)",
                                        cursor: "pointer", transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                                        transform: hoveredId === mood.id ? "translateY(-2px)" : "translateY(0)",
                                        boxShadow: hoveredId === mood.id ? `0 8px 24px ${mood.color}15` : "none",
                                    }}>
                                    <span style={{ fontSize: "22px", lineHeight: 1 }}>{mood.emoji}</span>
                                    <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", color: hoveredId === mood.id ? mood.color : "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: "700", transition: "color 0.2s" }}>
                                        {mood.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", marginTop: "12px", letterSpacing: "0.1em" }}>
                            {isLoggedIn ? "Saved to your profile · builds correlation over time" : "Saved locally · create an account to track trends"}
                        </p>
                    </div>
                )}

                {phase === "submitting" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
                        <span style={{ fontSize: "20px" }}>{selectedMood?.emoji}</span>
                        <span style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>Logging your check-in…</span>
                    </div>
                )}

                {phase === "done" && (
                    <div style={{ animation: "bsPulseIn 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: chartEntries.length >= 2 ? "4px" : "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 6px #38BDF8" }} />
                                    <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(56,189,248,0.6)", textTransform: "uppercase" }}>Burnout Pulse</span>
                                </div>
                                {selectedMood && (
                                    <>
                                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>·</span>
                                        <span style={{ fontSize: "16px" }}>{selectedMood.emoji}</span>
                                        <span style={{ fontSize: "11px", fontFamily: "monospace", color: selectedMood.color, letterSpacing: "0.08em", fontWeight: "700" }}>{selectedMood.label}</span>
                                        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>logged</span>
                                    </>
                                )}
                            </div>
                            {chartEntries.length >= 2 && (
                                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{chartEntries.length} sessions tracked</span>
                            )}
                        </div>
                        {chartEntries.length >= 2 && <Sparkline entries={chartEntries} />}
                        {chartEntries.length < 2 && (
                            <p style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", marginTop: "6px", letterSpacing: "0.08em" }}>
                                Check in next session to start seeing mood vs burnout trends.
                            </p>
                        )}
                    </div>
                )}
            </div>
            <style>{`
        @keyframes bsPulseIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bsFcPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
        </div>
    );
}