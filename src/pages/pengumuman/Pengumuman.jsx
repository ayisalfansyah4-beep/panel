import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Bell, AlertTriangle } from 'lucide-react';
import { pengumumanService } from '../../services/contentService';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';

const INIT = { judul: '', isi: '', tanggal: new Date().toISOString().slice(0,10), is_urgent: false };

export default function Pengumuman() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pengumumanService.getAll({ limit: 50 });
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      judul: item.judul || '', isi: item.isi || '',
      tanggal: item.tanggal?.slice(0,10) || '',
      is_urgent: !!item.is_urgent,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.isi) { toast.error('Judul dan isi wajib diisi'); return; }
    setFormLoading(true);
    try {
      if (editItem) {
        await pengumumanService.update(editItem.id, form);
        toast.success('Pengumuman berhasil diperbarui');
      } else {
        await pengumumanService.create(form);
        toast.success('Pengumuman berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await pengumumanService.delete(deleteTarget.id);
      toast.success('Pengumuman dihapus');
      setDeleteTarget(null);
      fetchData();
    } catch { toast.error('Gagal menghapus pengumuman'); }
    finally { setDeleteLoading(false); }
  };

  const urgent = data.filter(d => d.is_urgent);
  const normal = data.filter(d => !d.is_urgent);

  return (
    <div>
      <PageHeader
        title="Pengumuman Desa"
        subtitle={`${data.length} pengumuman · ${urgent.length} darurat`}
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Tambah Pengumuman</button>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="Belum ada pengumuman"
            description="Tambahkan pengumuman atau informasi untuk warga desa"
            action={<button onClick={openAdd} className="btn-primary">Tambah Pengumuman</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Darurat dulu */}
          {urgent.map(item => <PengCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} />)}
          {normal.map(item => <PengCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} />)}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Pengumuman' : 'Tambah Pengumuman'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Judul <span className="text-red-500">*</span></label>
            <input type="text" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
              placeholder="Judul pengumuman..." className="input-field" required />
          </div>
          <div>
            <label className="label">Isi Pengumuman <span className="text-red-500">*</span></label>
            <textarea value={form.isi} onChange={e => setForm({...form, isi: e.target.value})}
              rows={5} placeholder="Isi pengumuman lengkap..." className="input-field resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})}
                className="input-field" />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({...form, is_urgent: !form.is_urgent})}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_urgent ? 'bg-red-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_urgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm font-semibold ${form.is_urgent ? 'text-red-600' : 'text-slate-600'}`}>
                  {form.is_urgent ? '🚨 Darurat' : 'Informasi Biasa'}
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : editItem ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Hapus Pengumuman"
        message={`Hapus pengumuman "${deleteTarget?.judul}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}

function PengCard({ item, onEdit, onDelete }) {
  return (
    <div className={`card border-l-4 ${item.is_urgent ? 'border-l-red-500' : 'border-l-teal-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              item.is_urgent ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
            }`}>
              {item.is_urgent ? <><AlertTriangle className="w-3 h-3" /> Darurat</> : <><Bell className="w-3 h-3" /> Informasi</>}
            </span>
            {item.tanggal && (
              <span className="text-xs text-slate-400">
                📅 {new Date(item.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900">{item.judul}</h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.isi}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
