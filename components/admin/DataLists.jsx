import { useState, useEffect, useCallback, useRef } from 'react';
import { MoreHorizontal, Loader2, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminService } from '../../services/AdminService';

// ── Hook genérico de paginação ────────────────────────────────────────────────
function usePaginated(fetchFn, pageSize) {
  const [items, setItems]           = useState([]);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ✅ Ref estável — não entra no dep array, não causa loop
  const fetchRef = useRef(fetchFn);

  const load = useCallback(async (p) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRef.current({ page: p, size: pageSize });

      if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
      } else {
        setItems(data.content ?? data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
      }
      setPage(p);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]); // ✅ só pageSize aqui

  useEffect(() => { load(0); }, [load]);

  return { items, page, totalPages, loading, error, goTo: load };
}

// ── Paginador reutilizável ────────────────────────────────────────────────────
function Paginator({ page, totalPages, goTo, loading }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-sm text-slate-500">
      <span>Página {page + 1} de {totalPages}</span>
      <div className="flex gap-2">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 0 || loading}
          className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages - 1 || loading}
          className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Copy helper ───────────────────────────────────────────────────────────────
function CopyButton({ value, copiedHash, onCopy }) {
  if (!value || value === 'N/A') return null;
  return (
    <button onClick={() => onCopy(value)} className="text-slate-400 hover:text-indigo-600 transition-colors">
      {copiedHash === value ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function formatHash(hash, start = 6, end = 4) {
  if (!hash || hash === 'N/A') return 'N/A';
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

// ── BishopList ────────────────────────────────────────────────────────────────
export function BishopList() {
  const [copiedHash, setCopiedHash] = useState(null);
  const { items, page, totalPages, loading, error, goTo } =
    usePaginated(AdminService.getBishops, 30); // ✅ sem .bind()

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (error) return (
    <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Hash do Religioso</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Consagrado Por</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center">
                  <Loader2 className="animate-spin h-6 w-6 text-slate-400 mx-auto" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  Nenhum bispo encontrado.
                </td>
              </tr>
            ) : items.map((b) => (
              <tr key={b.hash} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span title={b.hash}>{formatHash(b.hash)}</span>
                    <CopyButton value={b.hash} copiedHash={copiedHash} onCopy={handleCopy} />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  <div className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1 w-fit">
                    <span title={b.parentHash}>{formatHash(b.parentHash)}</span>
                    <CopyButton value={b.parentHash} copiedHash={copiedHash} onCopy={handleCopy} />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{b.startDate || b.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginator page={page} totalPages={totalPages} goTo={goTo} loading={loading} />
    </div>
  );
}

// ── PopeList ──────────────────────────────────────────────────────────────────
export function PopeList() {
  const [copiedHash, setCopiedHash] = useState(null);
  const { items, page, totalPages, loading, error, goTo } =
    usePaginated(AdminService.getPopes, 20); // ✅ sem .bind()

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (error) return (
    <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {loading ? (
        <div className="flex justify-center items-center p-12 text-slate-400">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 p-4 border border-slate-200 rounded-xl bg-white text-center">
          Nenhum papa encontrado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.hash} className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                  <span className="font-bold">P</span>
                </div>
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {p.papacyStartDate ? `Início: ${p.papacyStartDate}` : p.period}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400" title={p.hash}>
                    {formatHash(p.hash, 8, 6)}
                  </span>
                  <CopyButton value={p.hash} copiedHash={copiedHash} onCopy={handleCopy} />
                </div>
                <span className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer">
                  Detalhes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Paginator page={page} totalPages={totalPages} goTo={goTo} loading={loading} />
      </div>
    </div>
  );
}