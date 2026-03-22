import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, RotateCcw, UserCog } from 'lucide-react';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'admin',    label: 'Admin',    desc: 'Akses penuh ke semua fitur',         color: 'bg-purple-100 text-purple-700' },
  { value: 'operator', label: 'Operator', desc: 'Akses penduduk & surat, tanpa pengaturan', color: 'bg-blue-100 text-blue-700' },
];

const INIT_FORM    = { username: '', password: '', name: '', role: 'operator' };
const INIT_RESET   = { new_password: '', confirm: '' };

export default function ManajemenUser() {
  const { user: me } = useAuth();
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showReset, setShowReset]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [form, setForm]               = useState(INIT_FORM);
  const [resetForm, setResetForm]     = useState(INIT_RESET);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setData(res.data?.data || []);
    } catch { toast.error('Gagal memuat data user'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Username dan password wajib diisi'); return; }
    setFormLoading(true);
    try {
      await api.post('/api/admin/users', form);
      toast.success('User berhasil ditambahkan');
      setShowAdd(false);
      setForm(INIT_FORM);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menambahkan user');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.put(`/api/admin/users/${editItem.id}`, {
        name: form.name, role: form.role, is_active: form.is_active,
      });
      toast.success('User berhasil diperbarui');
      setShowEdit(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui user');
    } finally { setFormLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetForm.new_password !== resetForm.confirm) { toast.error('Konfirmasi password tidak cocok'); return; }
    if (resetForm.new_password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setFormLoading(true);
    try {
      await api.put(`/api/admin/users/${editItem.id}/reset-password`, { new_password: resetForm.new_password });
      toast.success('Password berhasil direset');
      setShowReset(false);
      setResetForm(INIT_RESET);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal reset password');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/admin/users/${deleteTarget.id}`);
      toast.success('User dihapus');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus user');
    } finally { setDeleteLoading(false); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name || '', role: item.role, is_active: item.is_active });
    setShowEdit(true);
  };

  const openReset = (item) => {
    setEditItem(item);
    setResetForm(INIT_RESET);
    setShowReset(true);
  };

  const roleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[1];

  return (
    <div>
      <PageHeader
        title="Manajemen User Admin"
        subtitle="Kelola akun dan hak akses perangkat desa"
        action={
          <button onClick={() => { setForm(INIT_FORM); setShowAdd(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah User
          </button>
        }
      />

      {/* Role info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {ROLES.map(r => (
          <div key={r.value} className="card flex items-center gap-3 py-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${r.color}`}>{r.label}</div>
            <p className="text-sm text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Spinner className="mx-auto" size="lg" /></div>
        ) : data.length === 0 ? (
          <EmptyState icon={UserCog} title="Belum ada user" description="Tambahkan user untuk mengakses admin panel" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header text-left">Username</th>
                  <th className="table-header text-left">Nama</th>
                  <th className="table-header text-center">Role</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-left hidden lg:table-cell">Dibuat</th>
                  <th className="table-header text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => {
                  const r = roleInfo(item.role);
                  const isMe = item.username === me?.username;
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                            {(item.username || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.username}</p>
                            {isMe && <p className="text-xs text-teal-600 font-medium">← Akun Anda</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-slate-600">{item.name || '—'}</td>
                      <td className="table-cell text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.color}`}>
                          <Shield className="w-3 h-3" /> {r.label}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className={item.is_active ? 'badge-active' : 'badge-inactive'}>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-slate-400 text-xs">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openEdit(item)} title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openReset(item)} title="Reset Password"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          {!isMe && (
                            <button onClick={() => setDeleteTarget(item)} title="Hapus"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah User Admin" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Username <span className="text-red-500">*</span></label>
            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              className="input-field" placeholder="Contoh: operator1" required />
          </div>
          <div>
            <label className="label">Nama Lengkap</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="input-field" placeholder="Nama tampilan" />
          </div>
          <div>
            <label className="label">Password <span className="text-red-500">*</span></label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="input-field" placeholder="Minimal 6 karakter" required />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : <><Plus className="w-4 h-4" /> Tambah User</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={`Edit User — ${editItem?.username}`} size="sm">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="input-field" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field"
              disabled={editItem?.username === me?.username}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
            </select>
            {editItem?.username === me?.username && (
              <p className="text-xs text-slate-400 mt-1">Tidak bisa mengubah role akun sendiri</p>
            )}
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.is_active ? '1' : '0'} onChange={e => setForm({...form, is_active: e.target.value === '1'})}
              className="input-field" disabled={editItem?.username === me?.username}>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title={`Reset Password — ${editItem?.username}`} size="sm">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            ⚠️ Password lama akan langsung diganti. User perlu login ulang setelahnya.
          </div>
          <div>
            <label className="label">Password Baru <span className="text-red-500">*</span></label>
            <input type="password" value={resetForm.new_password}
              onChange={e => setResetForm({...resetForm, new_password: e.target.value})}
              className="input-field" placeholder="Minimal 6 karakter" required />
          </div>
          <div>
            <label className="label">Konfirmasi Password <span className="text-red-500">*</span></label>
            <input type="password" value={resetForm.confirm}
              onChange={e => setResetForm({...resetForm, confirm: e.target.value})}
              className={`input-field ${resetForm.confirm && resetForm.confirm !== resetForm.new_password ? 'border-red-400' : ''}`}
              placeholder="Ulangi password baru" required />
            {resetForm.confirm && resetForm.confirm !== resetForm.new_password && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowReset(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading || resetForm.new_password !== resetForm.confirm} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Mereset...</> : <><RotateCcw className="w-4 h-4" /> Reset Password</>}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} title="Hapus User"
        message={`Hapus user "${deleteTarget?.username}"? Akun ini tidak akan bisa login lagi.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading}
      />
    </div>
  );
}
