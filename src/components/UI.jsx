import { useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, X, Loader2, Search } from 'lucide-react';
import pendudukService from '../services/pendudukService';
import { normPendudukList } from '../utils/normalize';

/* =========================
   SPINNER
========================= */
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size] || 'w-6 h-6';
  return <Loader2 className={`animate-spin text-teal-600 ${s} ${className}`} />;
}

/* =========================
   PAGE LOADING
========================= */
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

/* =========================
   CONFIRM DIALOG
========================= */
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Batal
          </button>
          <button
            onClick={() => onConfirm?.()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Spinner size="sm" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODAL
========================= */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-slate-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
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

/* =========================
   STAT CARD
========================= */
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
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* =========================
   PAGINATION
========================= */
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;

  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1 justify-center mt-4">
      <button onClick={() => onPageChange?.(page - 1)} disabled={page === 1}>
        ← Prev
      </button>

      {pages.map(p => (
        <button key={p} onClick={() => onPageChange?.(p)}>
          {p}
        </button>
      ))}

      <button onClick={() => onPageChange?.(page + 1)} disabled={page === totalPages}>
        Next →
      </button>
    </div>
  );
}

/* =========================
   NIK SEARCH (FIXED)
========================= */
export function NikSearch({ onSelect, label = "Cari NIK / Nama Penduduk" }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [show, setShow] = useState(false);

  const timeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 3) {
      setResults([]);
      setShow(false);
      return;
    }

    const currentId = ++requestIdRef.current;
    setSearching(true);

    try {
      const res = await pendudukService.search({ q, limit: 8 });

      // ⛔ cegah race condition
      if (currentId !== requestIdRef.current) return;

      const raw = res?.data?.data ?? res?.data ?? [];
      setResults(normPendudukList(raw));
      setShow(true);
    } catch {
      setResults([]);
    } finally {
      if (currentId === requestIdRef.current) {
        setSearching(false);
      }
    }
  }, []);

  // ✅ debounce manual (AMAN)
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      doSearch(query);
    }, 400);

    return () => clearTimeout(timeoutRef.current);
  }, [query, doSearch]);

  const handleSelect = (p) => {
    onSelect?.(p);
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
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setShow(false), 300)}
          onFocus={() => results.length > 0 && setShow(true)}
          placeholder="Ketik NIK atau nama..."
          className="input-field pl-9"
        />

        {searching && (
          <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {show && (
        <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
          {results.length > 0 ? (
            results.map(p => (
              <button
                key={p.NIK || p.id}
                type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b last:border-0"
              >
                <p className="font-medium text-sm">{p.NAMA}</p>
                <p className="text-xs text-slate-500">
                  {p.NIK} · {p.DUSUN} RT {p.RT}/RW {p.RW}
                </p>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-slate-400">
              Tidak ditemukan
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   PAGE HEADER
========================= */
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