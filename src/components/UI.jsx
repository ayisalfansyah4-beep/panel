import { useState, useCallback } from 'react';
import { AlertTriangle, X, Loader2, Search } from 'lucide-react';
import pendudukService from '../services/pendudukService';
import { normPendudukList } from '../utils/normalize';
import { useDebounce } from '../hooks/useDebounce';
// ── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return <Loader2 className={`animate-spin text-teal-600 ${s} ${className}`} />;
}

// ── Full Page Loading ────────────────────────────────────────────────────────
export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Memuat data...</p>
      </div>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>Batal</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50" disabled={loading}>
            {loading && <Spinner size="sm" />} Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Wrapper ────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-slide-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, color = 'teal', sub }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }
  return (
    <div className="flex items-center gap-1 justify-center mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        ← Prev
      </button>
      {pages[0] > 1 && <>
        <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">1</button>
        {pages[0] > 2 && <span className="px-2 text-slate-400">…</span>}
      </>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && <>
        {pages[pages.length - 1] < totalPages - 1 && <span className="px-2 text-slate-400">…</span>}
        <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">{totalPages}</button>
      </>}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Next →
      </button>
    </div>
  );
}

// ── NIK Search Component ─────────────────────────────────────────────────────

export function NikSearch({ onSelect, label = "Cari NIK / Nama Penduduk" }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [show, setShow] = useState(false);

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 3) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await pendudukService.search({ q, limit: 8 });
      setResults(normPendudukList(res.data?.data || res.data || []));
      setShow(true);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  const debouncedSearch = useDebounce(doSearch, 400);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSelect = (p) => {
    onSelect(p);
    setQuery(`${p.NIK} — ${p.NAMA}`);
    setShow(false);
  };

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          onFocus={() => results.length > 0 && setShow(true)}
          placeholder="Ketik NIK atau nama..."
          className="input-field pl-9"
        />
        {searching && <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />}
      </div>
      {show && results.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {results.map(p => (
            <button key={p.NIK} type="button" onMouseDown={() => handleSelect(p)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <p className="font-medium text-slate-800 text-sm">{p.NAMA}</p>
              <p className="text-xs text-slate-500 font-mono">{p.NIK} · {p.DUSUN} RT {p.RT}/RW {p.RW}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
