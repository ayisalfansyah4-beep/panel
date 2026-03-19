import { useState, useEffect } from 'react';
import { Send, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, ConfirmDialog, Spinner } from '../../components/UI';
import botService from '../../services/botService';

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const statusBadge = {
  done:    'badge-active',
  running: 'bg-blue-50 text-blue-600 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex',
  pending: 'bg-amber-50 text-amber-600 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex',
  failed:  'badge-inactive',
};

export default function BotBroadcast() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState('');
  const [msg, setMsg]         = useState('');
  const [delay, setDelay]     = useState(2000);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await botService.getBroadcasts();
      setList(res.data?.broadcasts || []);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    const rows = targets.split('\n').map(s => s.trim()).filter(Boolean);
    if (!rows.length || !msg.trim()) { toast.warn('Isi nomor tujuan dan pesan'); return; }
    if (!window.confirm(`Kirim broadcast ke ${rows.length} nomor?`)) return;
    setSending(true);
    try {
      const res = await botService.sendBroadcast({ targets: rows, message: msg, delay_ms: delay });
      toast.success(`Broadcast dijadwalkan (ID: ${res.data?.id})`);
      setTargets('');
      setMsg('');
      load();
    } catch { /* handled */ }
    finally { setSending(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await botService.deleteBroadcast(confirm.id);
      toast.success('Broadcast dihapus');
      setConfirm({ open: false });
      load();
    } catch { /* handled */ }
    finally { setDeleting(false); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Broadcast Pesan"
        subtitle="Kirim pesan massal ke banyak nomor WhatsApp"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-600" /> Kirim Broadcast Baru
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Nomor Tujuan <span className="text-slate-400 normal-case font-normal">(satu per baris, format: 628xxxx)</span></label>
              <textarea
                className="input-field font-mono text-xs"
                rows={7}
                value={targets}
                onChange={e => setTargets(e.target.value)}
                placeholder={'6281234567890\n6287654321098\n628999000111'}
              />
              {targets && (
                <p className="text-xs text-slate-400 mt-1">
                  {targets.split('\n').filter(s => s.trim()).length} nomor dimasukkan
                </p>
              )}
            </div>
            <div>
              <label className="label">Isi Pesan</label>
              <textarea
                className="input-field"
                rows={4}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Tulis pesan broadcast di sini..."
              />
            </div>
            <div>
              <label className="label">Jeda Antar Pesan (ms)</label>
              <input
                type="number"
                className="input-field"
                value={delay}
                onChange={e => setDelay(parseInt(e.target.value) || 2000)}
                min={1000}
                max={10000}
                step={500}
              />
              <p className="text-xs text-slate-400 mt-1">Disarankan minimal 2000ms untuk menghindari ban</p>
            </div>
            <button onClick={send} className="btn-primary w-full justify-center" disabled={sending}>
              {sending ? <Spinner size="sm" /> : <Megaphone className="w-4 h-4" />}
              {sending ? 'Mengirim...' : 'Kirim Broadcast'}
            </button>
          </div>
        </div>

        {/* History */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-4">Riwayat Broadcast</p>
          {loading ? (
            <div className="card flex justify-center py-12"><Spinner size="lg" /></div>
          ) : list.length === 0 ? (
            <div className="card text-center py-12 text-slate-400 text-sm">Belum ada riwayat broadcast</div>
          ) : (
            <div className="space-y-3">
              {list.map(b => (
                <div key={b.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className={statusBadge[b.status] || statusBadge.pending}>{b.status}</span>
                    <span className="text-xs text-slate-400 font-mono">{fmtDate(b.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 truncate mb-2">{b.message}</p>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500">Total: {b.total}</span>
                    <span className="text-emerald-600">Terkirim: {b.sent}</span>
                    <span className="text-red-500">Gagal: {b.failed}</span>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {/* Progress bar */}
                    {b.total > 0 && (
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-2">
                        <div
                          className="h-1.5 bg-teal-500 rounded-full transition-all"
                          style={{ width: `${Math.round((b.sent / b.total) * 100)}%` }}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => setConfirm({ open: true, id: b.id })}
                      className="btn-danger text-xs py-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Hapus Broadcast?"
        message="Riwayat broadcast ini akan dihapus."
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}
