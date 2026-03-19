import { useState, useEffect } from 'react';
import { Search, Trash2, ArrowDownLeft, ArrowUpRight, Bot } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, Pagination, ConfirmDialog, Spinner } from '../../components/UI';
import botService from '../../services/botService';

const LIMIT = 50;

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function shortNum(s) {
  return (s || '').replace('@s.whatsapp.net', '').replace('@g.us', ' (grup)');
}

export default function BotMessages() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [typeF, setTypeF]     = useState('all');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, mode: null, id: null });
  const [deleting, setDeleting] = useState(false);

  const load = async (pg = page) => {
    setLoading(true);
    try {
      const res = await botService.getMessages({ page: pg, limit: LIMIT, search, type: typeF });
      const d = res.data;
      setRows(d.messages || []);
      setTotal(d.total || 0);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); setPage(1); }, [search, typeF]); // eslint-disable-line
  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  const doDelete = async () => {
    setDeleting(true);
    try {
      if (confirm.mode === 'all') {
        await botService.clearMessages();
        toast.success('Semua log pesan dihapus');
      } else {
        await botService.deleteMessage(confirm.id);
        toast.success('Pesan dihapus');
      }
      setConfirm({ open: false });
      load(1); setPage(1);
    } catch { /* handled */ }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Log Pesan Bot"
        subtitle={`${total} pesan tersimpan`}
        action={
          <button
            onClick={() => setConfirm({ open: true, mode: 'all' })}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4" /> Hapus Semua
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Cari nomor atau isi pesan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-36"
          value={typeF}
          onChange={e => setTypeF(e.target.value)}
        >
          <option value="all">Semua Arah</option>
          <option value="in">↓ Masuk</option>
          <option value="out">↑ Keluar</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-header">Waktu</th>
                <th className="table-header">Nomor</th>
                <th className="table-header">Arah</th>
                <th className="table-header">Tipe</th>
                <th className="table-header">Isi Pesan</th>
                <th className="table-header">Intent</th>
                <th className="table-header">AI / ms</th>
                <th className="table-header w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Spinner size="lg" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">Tidak ada pesan</td></tr>
              ) : rows.map(m => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-slate-500">{fmtDate(m.created_at)}</td>
                  <td className="table-cell font-mono text-xs">{shortNum(m.sender)}</td>
                  <td className="table-cell">
                    {m.direction === 'in'
                      ? <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          <ArrowDownLeft className="w-3 h-3" /> Masuk
                        </span>
                      : <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> Keluar
                        </span>
                    }
                  </td>
                  <td className="table-cell text-xs text-slate-400">{m.type || 'text'}</td>
                  <td className="table-cell max-w-[220px]">
                    <span className="truncate block text-sm" title={m.body || ''}>{m.body || '—'}</span>
                  </td>
                  <td className="table-cell">
                    {m.intent && (
                      <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {m.intent}
                      </span>
                    )}
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-400">
                    {m.ai_provider && (
                      <span className="inline-flex items-center gap-1">
                        <Bot className="w-3 h-3 text-purple-400" />
                        {m.ai_provider}
                        {m.response_ms ? ` / ${m.response_ms}ms` : ''}
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => setConfirm({ open: true, mode: 'one', id: m.id })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">{total} total pesan | Halaman {page} / {totalPages || 1}</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === 'all' ? 'Hapus Semua Log?' : 'Hapus Pesan?'}
        message={confirm.mode === 'all'
          ? 'Semua log pesan akan dihapus permanen dan tidak bisa dikembalikan.'
          : 'Pesan ini akan dihapus permanen.'}
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}
