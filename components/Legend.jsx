export function Legend() {
  return (
    <div className="absolute bottom-8 left-8 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 pointer-events-none select-none">
      <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm"></div> Jesus Cristo
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div> Bispo / Papa
        </div>
       
      </div>
    </div>
  );
}