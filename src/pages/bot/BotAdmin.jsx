import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Shield, ShieldCheck, ShieldOff,
  Phone, User, Crown, ChevronDown, Search, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  PageHeader, Spinner, EmptyState, Modal, ConfirmDialog,
} from '../../components/UI';
import api from '../../api/axios';

// ── Hierarki Role ──────────────────────────────────────────────────────────
const ROLES = [
  { value: 'kepala_desa',    label: 'Kepala Desa',      level: 1, color: 'bg-purple-100 text-purple-700 ring-purple-300' },
  { value: 'sekretaris',     label: 'Sekretaris Desa',  level: 2, color: 'bg-blue-100   text-blue-700   ring-blue-300'   },
  { value: 'kaur',           label: 'Kaur',             level: 3, color: 'bg-teal-100   text-teal-700   ring-teal-300'   },
  { value: 'kasi',           label: 'Kasi',             level: 3, color: 'bg-cyan-100   text-cyan-700   ring-cyan-300'   },
  { value: 'kadus',          label: 'Kadus',            level: 4, color: 'bg-green-100  text-green-700  ring-green-300'  },
  { value: 'rw',             label: 'RW',               level: 5, color: 'bg-yellow-100 text-yellow-700 ring-yellow-300' },
  { value: 'rt',             label: 'RT',               level: 6, color: 'bg-orange-100 text-orange-700 ring-orange-300' },
];

// Akses per role
const AKSES_LABELS = {
  surat      : 'Generate Surat',
  penduduk   : 'Data Penduduk',
  statistik  : 'Statistik',
  pengumuman : 'Pengumuman',
  apbdes     : 'APBDes',
  broadcast  : 'Broadcast',
};

const AKSES_DEFAULT = {
  kepala_desa : ['surat','penduduk','statistik','pengumuman','apbdes','broadcast'],
  sekretaris  : ['surat','penduduk','statistik','pengumuman'],
  kaur        : ['surat','penduduk','statistik'],
  kasi        : ['surat','penduduk','statistik'],
  kadus       : ['penduduk','statistik'],
  rw          : ['penduduk'],
  rt          : ['penduduk'],
};

const roleInfo = (val) => ROLES.find(r => r.value === val) || { label: val, color: 'bg-slate-100 text-slate-600 ring-slate-200' };

function RoleBadge({ role }) {
  const r = roleInfo(role);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${r.color}`}>
      {r.level === 1 && <Crown className="w-3 h-3" />}
      {r.label}
    </span>
  );
}

function AksesBadges({ akses = [] }) {
  if (!akses.length) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {akses.map(a => (
        <span key={a} className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-xs rounded ring-1 ring-teal-200">
          {AKSES_LABELS[a] || a}
        </span>
      ))}
    </div>
  );
}

const EMPTY_FORM = { nama: '', no_wa: '', role: 'rt', wilayah: '', akses: [], is_active: true };

export default function BotAdmin() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null); // null | 'add' | 'edit'
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bot-admin');
      setData(res.data?.data || res.data || []);
    } catch {
      toast.error('Gagal memuat data admin bot');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-set akses default saat role berubah
  const setRole = (role) => {
    setForm(f => ({ ...f, role, akses: AKSES_DEFAULT[role] || [] }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal('add');
  };

  const openEdit = (item) => {
    setForm({
      id       : item.id,
      nama     : item.nama     || '',
      no_wa    : item.no_wa    || '',
      role     : item.role     || 'rt',
      wilayah  : item.wilayah  || '',
      akses    : Array.isArray(item.akses) ? item.akses : (item.akses ? item.akses.split(',') : []),
      is_active: item.is_active !== false,
    });
    setModal('edit');
  };

  const toggleAkses = (key) => {
    setForm(f => ({
      ...f,
      akses: f.akses.includes(key) ? f.akses.filter(a => a !== key) : [...f.akses, key],
    }));
  };

  const handleSave = async () => {
    if (!form.no_wa.trim()) { toast.warning('Nomor WA wajib diisi'); return; }
    if (!form.nama.trim())  { toast.warning('Nama wajib diisi'); return; }

    // Normalisasi nomor WA: 08xxx → 628xxx
    let no_wa = form.no_wa.replace(/\D/g, '');
    if (no_wa.startsWith('0')) no_wa = '62' + no_wa.slice(1);
    if (!no_wa.startsWith('62')) no_wa = '62' + no_wa;

    setSaving(true);
    try {
      const payload = { ...form, no_wa, akses: form.akses.join(',') };
      if (modal === 'add') {
        await api.post('/api/bot-admin', payload);
        toast.success('Admin bot berhasil ditambahkan');
      } else {
        await api.put(`/api/bot-admin/${form.id}`, payload);
        toast.success('Admin bot berhasil diperbarui');
      }
      setModal(null);
      load();
    } catch {
      toast.error('Gagal menyimpan admin bot');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.patch(`/api/bot-admin/${item.id}/toggle`);
      toast.success(`Admin ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      load();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/bot-admin/${confirm.id}`);
      toast.success('Admin bot dihapus');
      setConfirm({ open: false, id: null });
      load();
    } catch {
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = data.filter(d =>
    !search || d.nama?.toLowerCase().includes(search.toLowerCase()) ||
    d.no_wa?.includes(search) || d.role?.includes(search.toLowerCase())
  );

  // Group by level untuk tampilan
  const grouped = ROLES.map(r => ({
    ...r,
    items: filtered.filter(d => d.role === r.value),
  })).filter(g => g.items.length > 0 || !search);

  return (
    <div>
      <PageHeader
        title="Admin Bot WA"
        subtitle="Kelola akses perangkat desa ke WhatsApp bot berdasarkan jabatan"
        action={
          <div className="flex gap-2">
            <button onClick={load} className="btn-secondary text-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={openAdd} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Tambah Admin
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="card mb-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, nomor WA, atau role..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Tabel per Hierarki */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Shield} title="Belum ada admin bot" description="Tambahkan perangkat desa yang bisa menggunakan bot WA" />
        </div>
      ) : (
        <div className="space-y-4">
          {ROLES.map(role => {
            const items = filtered.filter(d => d.role === role.value);
            if (!items.length && search) return null;
            return (
              <div key={role.value} className="card p-0 overflow-hidden">
                {/* Header role */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  {role.level === 1 ? <Crown className="w-4 h-4 text-purple-500" /> : <Shield className="w-4 h-4 text-slate-400" />}
                  <span className="font-semibold text-slate-700 text-sm">{role.label}</span>
                  <span className="text-xs text-slate-400">Level {role.level}</span>
                  <span className="ml-auto text-xs font-medium text-slate-500">{items.length} admin</span>
                </div>

                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    Belum ada admin {role.label} —{' '}
                    <button onClick={openAdd} className="text-teal-600 hover:underline">Tambah</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="table-header text-left">Nama</th>
                          <th className="table-header text-left">Nomor WA</th>
                          <th className="table-header text-left hidden md:table-cell">Wilayah</th>
                          <th className="table-header text-left hidden lg:table-cell">Akses Fitur</th>
                          <th className="table-header text-center">Status</th>
                          <th className="table-header text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} className={`border-b border-slate-100 transition-colors ${item.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50/50'}`}>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${role.color}`}>
                                  <span className="text-xs font-bold">{(item.nama||'?')[0].toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-sm text-slate-800">{item.nama}</span>
                              </div>
                            </td>
                            <td className="table-cell font-mono text-xs text-slate-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {item.no_wa}
                              </div>
                            </td>
                            <td className="table-cell hidden md:table-cell text-sm text-slate-600">
                              {item.wilayah || <span className="text-slate-300">—</span>}
                            </td>
                            <td className="table-cell hidden lg:table-cell">
                              <AksesBadges akses={Array.isArray(item.akses) ? item.akses : (item.akses ? item.akses.split(',') : [])} />
                            </td>
                            <td className="table-cell text-center">
                              <button
                                onClick={() => handleToggle(item)}
                                title={item.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  item.is_active
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}>
                                {item.is_active ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                              </button>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => openEdit(item)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setConfirm({ open: true, id: item.id })}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors">
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
            );
          })}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Tambah Admin Bot' : 'Edit Admin Bot'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <label className="label">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <input
                className="input-field font-mono"
                value={form.no_wa}
                onChange={e => setForm(f => ({ ...f, no_wa: e.target.value }))}
                placeholder="08123456789"
              />
              <p className="text-xs text-slate-400 mt-1">Format 08xxx atau 628xxx</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jabatan / Role <span className="text-red-500">*</span></label>
              <select
                className="input-field"
                value={form.role}
                onChange={e => setRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Wilayah</label>
              <input
                className="input-field"
                value={form.wilayah}
                onChange={e => setForm(f => ({ ...f, wilayah: e.target.value }))}
                placeholder="Contoh: Dusun Krajan / RW 02 / RT 03"
              />
            </div>
          </div>

          {/* Akses Fitur */}
          <div>
            <label className="label">Akses Fitur Bot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {Object.entries(AKSES_LABELS).map(([key, label]) => (
                <label key={key}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                    form.akses.includes(key)
                      ? 'border-teal-400 bg-teal-50 text-teal-800'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}>
                  <input
                    type="checkbox"
                    checked={form.akses.includes(key)}
                    onChange={() => toggleAkses(key)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="rounded text-teal-600"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">Admin aktif (bisa menggunakan bot)</label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setModal(null)} className="btn-secondary" disabled={saving}>Batal</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Hapus Admin Bot"
        message="Admin ini akan dihapus dan tidak bisa menggunakan bot lagi. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  );
}