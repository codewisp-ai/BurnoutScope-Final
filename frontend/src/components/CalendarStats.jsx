function CalendarMetric({ label, value, unit, color, icon }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/4 backdrop-blur p-4 hover:bg-white/8 hover:border-white/15 transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent ${color} to-transparent`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-mono tracking-widest text-white/35 uppercase">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black font-mono text-white">{value ?? "—"}</span>
        {unit && <span className="text-xs text-white/30 font-mono">{unit}</span>}
      </div>
    </div>
  );
}

export default function CalendarStats({ calendarData }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/25 flex items-center justify-center">
          <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Calendar Load</h3>
          <p className="text-xs text-white/30 font-mono">Schedule intensity metrics</p>
        </div>
      </div>

      {!calendarData ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-white/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-white/30 font-mono">No calendar data uploaded.</p>
          <p className="text-xs text-white/20">Upload a CSV to unlock schedule analysis</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <CalendarMetric
            label="Overload Days"
            value={calendarData.overloadDays}
            unit="days"
            color="via-red-400/30"
            icon="🔥"
          />
          <div className="grid grid-cols-2 gap-3">
            <CalendarMetric
              label="Meeting Hours"
              value={calendarData.meetingHours}
              unit="hrs"
              color="via-amber-400/30"
              icon="🎙️"
            />
            <CalendarMetric
              label="Focus Hours"
              value={calendarData.focusHours}
              unit="hrs"
              color="via-sky-400/30"
              icon="🎯"
            />
          </div>
        </div>
      )}
    </div>
  );
}