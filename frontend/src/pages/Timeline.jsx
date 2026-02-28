/**
 * Timeline.jsx
 * Full interactive 30-day burnout timeline page.
 * Receives data via React Router location.state from Dashboard.
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TimelineChart from '../components/TimelineChart';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateDateRange(days = 30) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

function dayRisk(commits, avg) {
  if (commits === 0) return 'Low';
  if (commits > avg * 2.5) return 'High';
  if (commits > avg * 1.5) return 'Medium';
  return 'Low';
}

function buildSpikeSet(dailyActivity) {
  const dates = Object.keys(dailyActivity).sort();
  const counts = dates.map(d => dailyActivity[d] || 0);
  const avg = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  const spikeDates = new Set();
  const crashDates = new Set();
  counts.forEach((c, i) => {
    if (c > avg * 2) spikeDates.add(dates[i]);
    if (i > 0 && spikeDates.has(dates[i - 1]) && c < counts[i - 1] * 0.5) {
      crashDates.add(dates[i]);
    }
  });
  return { spikeDates, crashDates, avg };
}

function estimateDailyMeetingHours(calendarData, dateRange) {
  if (!calendarData || !calendarData.totalMeetingHours) return {};
  const workDays = dateRange.filter(d => {
    const day = new Date(d + 'T12:00:00').getDay();
    return day !== 0 && day !== 6;
  });
  const hrsPerDay = calendarData.totalMeetingHours / (workDays.length || 1);
  const result = {};
  workDays.forEach(d => { result[d] = hrsPerDay; });
  return result;
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
function DayDetailPanel({ day, onClose }) {
  if (!day) return null;
  const riskCfg = {
    High:   { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30' },
    Medium: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
    Low:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  };
  const cfg = riskCfg[day.risk] || riskCfg.Low;
  const formatted = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 animate-[fadeIn_0.25s_ease-out] relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent rounded-t-2xl" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-white/35 uppercase tracking-widest mb-1">Day Detail</p>
          <h3 className="text-base font-bold text-white">{formatted}</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/12 transition-all">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Commits',       value: day.commits,                          unit: '',  accent: 'text-amber-400' },
          { label: 'Meeting Hours', value: day.meetingHours?.toFixed(1) || '0', unit: 'h', accent: 'text-sky-400' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-2xl font-black font-mono ${m.accent}`}>
              {m.value}<span className="text-white/30 text-sm">{m.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${cfg.color} ${cfg.bg} ${cfg.border}`}>{day.risk} Risk</span>
        {day.isWeekend && <span className="text-xs px-2.5 py-1 rounded-full border font-mono text-purple-300 bg-purple-500/10 border-purple-500/30">Weekend Work</span>}
        {day.isSpike   && <span className="text-xs px-2.5 py-1 rounded-full border font-mono text-orange-300 bg-orange-500/10 border-orange-500/30">🔺 Workload Spike</span>}
        {day.isCrash   && <span className="text-xs px-2.5 py-1 rounded-full border font-mono text-red-300 bg-red-500/10 border-red-500/30">📉 Post-Spike Crash</span>}
      </div>
      {day.commits === 0 && <p className="text-xs text-white/30 font-mono italic">No commit activity on this day.</p>}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ active, onChange }) {
  const filters = [
    { key: 'all',     label: 'All Days' },
    { key: 'weekend', label: 'Weekends' },
    { key: 'spike',   label: 'Spikes' },
    { key: 'crash',   label: 'Crashes' },
    { key: 'active',  label: 'Active Only' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            active === f.key
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              : 'bg-white/4 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
          }`}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────
function StatStrip({ days }) {
  const activeDays   = days.filter(d => d.commits > 0).length;
  const weekendDays  = days.filter(d => d.isWeekend && d.commits > 0).length;
  const spikeDays    = days.filter(d => d.isSpike).length;
  const totalCommits = days.reduce((a, d) => a + d.commits, 0);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Commits',  value: totalCommits, accent: 'text-amber-400' },
        { label: 'Active Days',    value: activeDays,   accent: 'text-emerald-400' },
        { label: 'Weekend Active', value: weekendDays,  accent: 'text-purple-400' },
        { label: 'Spike Days',     value: spikeDays,    accent: 'text-orange-400' },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 backdrop-blur p-4">
          <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-1">{s.label}</p>
          <p className={`text-2xl font-black font-mono ${s.accent}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Timeline() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const printRef  = useRef();

  const { username, githubData, calendarData } = location.state || {};

  const [zoom, setZoom]           = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter]       = useState('all');
  const [exporting, setExporting] = useState(false);

  // ── PDF Export using html2canvas + jsPDF ─────────────────────────────────
  async function handleExportPDF() {
    if (!printRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const el = printRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#080a0e',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth:  el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfW    = canvas.width  / 2;
      const pdfH    = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: pdfW > pdfH ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfW, pdfH],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`burnoutscope-timeline-${username || 'report'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  // ── Build day data ────────────────────────────────────────────────────────
  const allDays = useMemo(() => {
    if (!githubData?.dailyActivity) return [];
    const dateRange = generateDateRange(30);
    const { spikeDates, crashDates, avg } = buildSpikeSet(githubData.dailyActivity);
    const meetingMap = estimateDailyMeetingHours(calendarData, dateRange);
    return dateRange.map(date => {
      const commits   = githubData.dailyActivity[date] || 0;
      const d         = new Date(date + 'T12:00:00');
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      return { date, commits, meetingHours: meetingMap[date] || 0, isWeekend, isSpike: spikeDates.has(date), isCrash: crashDates.has(date), risk: dayRisk(commits, avg) };
    });
  }, [githubData, calendarData]);

  // ── Filtered days ─────────────────────────────────────────────────────────
  const visibleDays = useMemo(() => {
    switch (filter) {
      case 'weekend': return allDays.map(d => d.isWeekend ? d : { ...d, commits: 0, meetingHours: 0 });
      case 'spike':   return allDays.map(d => d.isSpike   ? d : { ...d, commits: 0, meetingHours: 0 });
      case 'crash':   return allDays.map(d => d.isCrash   ? d : { ...d, commits: 0, meetingHours: 0 });
      case 'active':  return allDays.map(d => d.commits > 0 ? d : { ...d, meetingHours: 0 });
      default:        return allDays;
    }
  }, [allDays, filter]);

  const handleDayClick = useCallback((day) => {
    setSelectedDay(prev => prev?.date === day.date ? null : day);
  }, []);

  // ── No data guard ─────────────────────────────────────────────────────────
  if (!githubData) {
    return (
      <div className="min-h-screen bg-[#080a0e] flex items-center justify-center font-['Syne',sans-serif]">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-white">No timeline data available.</p>
          <p className="text-white/40 text-sm">Please run an analysis on the Dashboard first.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-3 rounded-xl bg-amber-400 text-black font-bold text-sm font-mono hover:bg-amber-300 transition-all">
            ← Back to Dashboard
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
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-600/4 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Capturable area — ref here so html2canvas gets the full content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-10" ref={printRef}>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              ←
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase">Timeline</span>
                <span className="text-white/20">·</span>
                <span className="text-xs font-mono text-amber-400/70">@{username}</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white mt-0.5">Interactive Activity Timeline</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/4 p-1">
              <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all text-sm font-mono">−</button>
              <span className="text-xs font-mono text-white/30 px-1 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all text-sm font-mono">+</button>
            </div>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400
                text-xs font-mono hover:bg-amber-400/20 hover:border-amber-400/40 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mb-6 animate-[fadeIn_0.4s_ease-out]"><StatStrip days={allDays} /></div>

        {/* Calendar notice */}
        {!calendarData && (
          <div className="mb-5 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-xs text-sky-300/80 font-mono">No calendar data — showing GitHub commits only. Upload a CSV or ICS on the Dashboard to include meeting data.</p>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-5"><FilterBar active={filter} onChange={setFilter} /></div>

        {/* Main chart card */}
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-6 mb-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-white">30-Day Activity Chart</h2>
              <p className="text-xs text-white/30 font-mono">Commits (amber bars) · Meetings (blue bars) · Scroll horizontally · Click any day</p>
            </div>
          </div>
          <TimelineChart days={visibleDays} zoom={zoom} onDayClick={handleDayClick} selectedDate={selectedDay?.date} />
        </div>

        {/* Day detail panel */}
        {selectedDay && (
          <div className="mb-6 animate-[fadeIn_0.25s_ease-out]">
            <DayDetailPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
          </div>
        )}

        {/* Summary insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.6s_ease-out]">
          {/* GitHub summary */}
          <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📊</span>
              <h3 className="text-sm font-bold text-white">Commit Behavior</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Late Night (after 11pm)',    value: githubData.lateNightCommits,    color: 'text-red-400' },
                { label: 'Early Morning (before 7am)', value: githubData.earlyMorningCommits, color: 'text-orange-400' },
                { label: 'Weekend Commits',            value: githubData.weekendCommits,      color: 'text-purple-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-mono">{item.label}</span>
                  <span className={`text-sm font-black font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
              <div className="h-px bg-white/6 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-mono">Activity Spike</span>
                <span className={`text-xs font-mono font-bold ${githubData.spikeDetected ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {githubData.spikeDetected ? '⚠ YES' : '✓ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-mono">Post-Spike Crash</span>
                <span className={`text-xs font-mono font-bold ${githubData.crashDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                  {githubData.crashDetected ? '⚠ YES' : '✓ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar summary */}
          <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📅</span>
              <h3 className="text-sm font-bold text-white">Meeting Load</h3>
            </div>
            {!calendarData ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 border border-dashed border-white/8 rounded-xl">
                <p className="text-xs text-white/25 font-mono">No calendar data uploaded</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Total Meeting Hours',    value: `${calendarData.totalMeetingHours}h`,           color: 'text-sky-400' },
                  { label: 'Total Meetings',         value: calendarData.totalMeetings,                     color: 'text-sky-300' },
                  { label: 'Days with 4+ Meetings',  value: calendarData.daysWithMoreThan4Meetings,         color: 'text-amber-400' },
                  { label: 'Days with 6h+ Meetings', value: calendarData.daysWithMoreThan6HoursOfMeetings,  color: 'text-orange-400' },
                  { label: 'Back-to-Back Blocks',    value: calendarData.consecutiveMeetingBlocks,          color: 'text-red-400' },
                  { label: 'Avg Meeting Duration',   value: `${calendarData.averageMeetingDuration}m`,      color: 'text-white/60' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/40 font-mono">{item.label}</span>
                    <span className={`text-sm font-black font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-mono hover:bg-white/8 hover:border-white/20 hover:text-white/70 transition-all duration-200">
            ← Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}