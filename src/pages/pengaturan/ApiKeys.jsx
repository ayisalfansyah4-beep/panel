import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Eye, EyeOff } from 'lucide-react';
import adminService from '../../services/adminService';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';

export default function ApiKeys() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [showKeys, setShowKeys] = useState({});
  const [form, setForm] = useState({ nama_app: '', scopes: '', rate_limit: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getApiKeys();
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Gagal memuat API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nama_app.trim()) { toast.error('Nama aplikasi harus diisi'); return; }
    setFormLoading(true);
    try {
      await adminService.createApiKey({
        nama_app: form.nama_app,
        scopes: form.scopes ? form.scopes.split(',').map(s => s.trim()) : [],
        ...(form.rate_limit && { rate_limit: parseInt(form.rate_limit) }),
      });
      toast.success('API Key berhasil dibuat');
      setShowModal(false);
      setForm({ nama_app: '', scopes: '', rate_limit: '' });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal membuat API Key');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (item) => {
    setToggleLoading(item.id);
    try {
      await adminService.updateApiKey(item.id, { is_active: !item.is_active });
      toast.success(`API Key ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      fetchData();
    } catch {
      toast.error('Gagal mengubah status');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminService.deleteApiKey(deleteTarget.id);
      toast.success('API Key dihapus');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Gagal menghapus API Key');
    } finally {
      setDeleteLoading(false);
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key disalin ke clipboard');
  };

  return (
    <div>
      <PageHeader
        title="Manajemen API Keys"
        subtitle="Kelola akses API untuk layanan publik"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah API Key
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Spinner className="mx-auto" /></div>
        ) : data.length === 0 ? (
          <EmptyState icon={Key} title="Belum ada API Key" description="Buat API Key untuk mengizinkan akses layanan publik"
            action={<button onClick={() => setShowModal(true)} className="btn-primary">Tambah API Key</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header text-left">Nama Aplikasi</th>
                  <th className="table-header text-left">API Key</th>
                  <th className="table-header text-left hidden md:table-cell">Scopes</th>
                  <th className="table-header text-center hidden lg:table-cell">Rate Limit</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-semibold text-slate-800">{item.nama_app || item.name}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {showKeys[item.id] ? item.api_key : '••••••••••••••••'}
                        </code>
                        <button onClick={() => setShowKeys({ ...showKeys, [item.id]: !showKeys[item.id] })}
                          className="text-slate-400 hover:text-slate-600 transition-colors">
                          {showKeys[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => copyKey(item.api_key)}
                          className="text-slate-400 hover:text-teal-600 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(item.scopes) ? item.scopes : (item.scopes || '').split(',')).filter(Boolean).map((s, si) => (
                          <span key={si} className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">{s.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-center hidden lg:table-cell text-slate-500 text-sm">
                      {item.rate_limit || '—'} req/min
                    </td>
                    <td className="table-cell text-center">
                      <span className={item.is_active ? 'badge-active' : 'badge-inactive'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleToggle(item)} disabled={toggleLoading === item.id}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            item.is_active ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:bg-slate-100'
                          }`}>
                          {toggleLoading === item.id
                            ? <Spinner size="sm" />
                            : item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />
                          }
                        </button>
                        <button onClick={() => setDeleteTarget(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Nama Aplikasi <span className="text-red-500">*</span></label>
            <input type="text" value={form.nama_app} onChange={e => setForm({ ...form, nama_app: e.target.value })}
              placeholder="Contoh: Website Desa, Bot WhatsApp..." className="input-field" required />
          </div>
          <div>
            <label className="label">Scopes</label>
            <input type="text" value={form.scopes} onChange={e => setForm({ ...form, scopes: e.target.value })}
              placeholder="penduduk:read, surat:read (pisah dengan koma)" className="input-field" />
            <p className="text-xs text-slate-400 mt-1">Kosongkan untuk semua akses</p>
          </div>
          <div>
            <label className="label">Rate Limit (req/menit)</label>
            <input type="number" value={form.rate_limit} onChange={e => setForm({ ...form, rate_limit: e.target.value })}
              placeholder="Contoh: 60" className="input-field w-32" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Membuat...</> : <><Key className="w-4 h-4" /> Buat API Key</>}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus API Key"
        message={`Hapus API Key untuk "${deleteTarget?.nama_app || deleteTarget?.name}"? Semua akses menggunakan key ini akan berhenti.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
