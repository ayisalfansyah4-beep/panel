import { useState, useEffect } from 'react';
import { Search, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, PageLoading, Modal, ConfirmDialog, EmptyState } from '../../components/UI';
import botService from '../../services/botService';

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const LABELS = ['', 'warga', 'petugas', 'vip', 'spam'];

const labelColor = {
  warga:   'bg-blue-50 text-blue-600',
  petugas: 'bg-purple-50 text-purple-600',
  vip:     'bg-amber-50 text-amber-600',
  spam:    'bg-red-50 text-red-600',
};

export default function BotContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [form, setForm]         = useState({ id: null, name: '', label: '', is_blocked: '0' });

  const load = async () => {
    try {
      const res = await botService.getContacts();
      setContacts(res.data?.contacts || []);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = search
    ? contacts.filter(c =>
        (c.phone || '').includes(search) ||
        (c.name || '').toLowerCase().includes(search.toLowerCase()))
    : contacts;

  const openEdit = (c) => {
    setForm({ id: c.id, name: c.name || '', label: c.label || '', is_blocked: c.is_blocked ? '1' : '0' });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await botService.updateContact(form.id, {
        name: form.name,
        label: form.label,
        is_blocked: form.is_blocked,
      });
      toast.success('Kontak diperbarui');
      setModal(false);
      load();
    } catch { /* handled */ }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await botService.deleteContact(confirm.id);
      toast.success('Kontak dihapus');
      setConfirm({ open: false });
      load();
    } catch { /* handled */ }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Kontak Bot"
        subtitle={`${contacts.length} kontak terdaftar`}
      />

      <div className="card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Cari nomor atau nama..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada kontak" description="Kontak akan muncul saat pengguna pertama kali menghubungi bot." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Nomor</th>
                  <th className="table-header">Nama</th>
                  <th className="table-header">Label</th>
                  <th className="table-header">Pesan</th>
                  <th className="table-header">Terakhir Aktif</th>
                  <th className="table-header">Status</th>
                  <th className="table-header w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-mono text-xs">
                      {(c.phone || '').replace('@s.whatsapp.net', '')}
                    </td>
                    <td className="table-cell font-medium text-slate-700">{c.name || '—'}</td>
                    <td className="table-cell">
                      {c.label
                        ? <span className={`text-xs px-2 py-0.5 rounded-full ${labelColor[c.label] || 'bg-slate-100 text-slate-600'}`}>{c.label}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-cell font-mono text-xs">{c.message_cnt ?? 0}</td>
                    <td className="table-cell text-xs text-slate-400">{fmtDate(c.last_seen)}</td>
                    <td className="table-cell">
                      {c.is_blocked
                        ? <span className="badge-inactive">Diblokir</span>
                        : <span className="badge-active">Aktif</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirm({ open: true, id: c.id })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Edit Kontak">
        <div className="space-y-4">
          <div>
            <label className="label">Nama</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Label</label>
            <select
              className="input-field"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            >
              {LABELS.map(l => <option key={l} value={l}>{l || '— Tidak ada —'}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status Blokir</label>
            <select
              className="input-field"
              value={form.is_blocked}
              onChange={e => setForm(f => ({ ...f, is_blocked: e.target.value }))}
            >
              <option value="0">Tidak diblokir</option>
              <option value="1">Diblokir</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            <button onClick={save} className="btn-primary" disabled={saving}>Simpan</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Hapus Kontak?"
        message="Data kontak ini akan dihapus permanen."
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}
