export function HUD() {
  return (
    <div className="absolute top-6 left-6 z-10 pointer-events-none">
      <h1 className="text-3xl font-serif text-amber-600 tracking-widest uppercase">
        Linhagem Sagrada
      </h1>
      <p className="text-sm font-serif text-slate-500 italic mt-1 pointer-events-auto">
        Arraste, dê zoom e clique nos Papas para revelar os Bispos.
      </p>
    </div>
  );
}