import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, RouteOff, Loader2 } from 'lucide-react';
import { HomeService } from '../services/HomeService';

export function ControlPanel({ searchTerm, setSearchTerm, onSearch, onClear, hasSelection }) {
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const debounceRef               = useRef(null);
  const panelRef                  = useRef(null);

  // ── Fecha dropdown ao clicar fora ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Busca com debounce de 350ms ──────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await HomeService.search(searchTerm);
        // Limita a 5 resultados no front (API já limita a 10)
        setResults((data ?? []).slice(0, 5));
        setOpen(true);
      } catch (e) {
        console.warn('Search error:', e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // ── Seleciona um resultado do dropdown ──────────────────────────────────
  const handleSelect = useCallback((clergy) => {
    setOpen(false);
    setResults([]);
    setSearchTerm('');
    // Repassa para o ApostolicTree tratar o trace
    onSearch(clergy);
  }, [onSearch, setSearchTerm]);

  // ── Limpa campo ─────────────────────────────────────────────────────────
  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div
      ref={panelRef}
      className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 flex flex-col items-center gap-3"
    >
      {/* ── Barra de busca ── */}
      <div className="relative group w-full">

        {/* Ícone esquerdo: loader ou lupa */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading
            ? <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            : <Search className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          }
        </div>

        <input
          type="text"
          className="block w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-medium"
          placeholder="Buscar na Linhagem..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setOpen(false); }
          }}
          autoComplete="off"
        />

        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* ── Dropdown de resultados ── */}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30">
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Resultados
            </p>
            <ul>
              {results.map((clergy, idx) => (
                <li key={clergy.hash ?? idx}>
                  <button
                    onClick={() => handleSelect(clergy)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left group/item"
                  >
                    {/* Avatar / foto */}
                    {clergy.imgUrl ? (
                      <img
                        src={clergy.imgUrl}
                        alt={clergy.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-sm font-bold">
                          {clergy.name?.charAt(0) ?? '?'}
                        </span>
                      </div>
                    )}

                    {/* Nome + data */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate group-hover/item:text-amber-700 transition-colors">
                        {clergy.name}
                      </p>
                      {clergy.startDate && (
                        <p className="text-slate-400 text-xs">
                          {clergy.startDate}
                        </p>
                      )}
                    </div>

                    {/* Seta indicativa */}
                    <span className="text-slate-300 group-hover/item:text-amber-400 transition-colors text-lg">›</span>
                  </button>

                  {/* Divider entre itens */}
                  {idx < results.length - 1 && (
                    <div className="mx-4 h-px bg-slate-100" />
                  )}
                </li>
              ))}
            </ul>
            <p className="px-4 py-2 text-[10px] text-slate-300 text-right">
              Clique para rastrear a linhagem
            </p>
          </div>
        )}

        {/* Mensagem de "nenhum resultado" */}
        {open && !loading && searchTerm.trim() && results.length === 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl px-4 py-4 z-30 text-center">
            <p className="text-slate-400 text-sm">Nenhum resultado encontrado.</p>
          </div>
        )}
      </div>

      {/* ── Botão cancelar seleção ── */}
      {hasSelection && (
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-xl border border-red-200 rounded-full text-red-500 text-sm font-semibold shadow-lg hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all"
        >
          <RouteOff className="h-4 w-4" />
          Cancelar seleção
        </button>
      )}
    </div>
  );
}