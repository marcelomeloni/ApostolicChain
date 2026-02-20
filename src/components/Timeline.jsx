export function Timeline({ availableCenturies, onSelectCentury }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-4 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-2 pointer-events-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Séculos
        </span>
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        {availableCenturies.map(century => (
          <button
            key={century}
            onClick={() => onSelectCentury(century)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-amber-100 hover:text-amber-700 transition-all border border-transparent hover:border-amber-200"
          >
            {century}
          </button>
        ))}
      </div>
    </div>
  );
}