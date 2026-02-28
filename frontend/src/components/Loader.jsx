export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-amber-400/50 border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-red-500/60 border-l-red-500 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
        <div className="absolute inset-[28%] rounded-full bg-amber-400/20 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm font-mono tracking-[0.3em] text-amber-400/80 uppercase">Analyzing</p>
        <p className="text-xs text-white/30 mt-1 tracking-wider">Scanning commit patterns...</p>
      </div>
    </div>
  );
}