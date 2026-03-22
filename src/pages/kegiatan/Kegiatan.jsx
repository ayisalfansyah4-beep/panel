import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Camera } from 'lucide-react';
import { kegiatanService } from '../../services/contentService';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState, Pagination } from '../../components/UI';
import { toast } from 'react-toastify';

const KATEGORI = ['Infrastruktur', 'Sosial', 'Kesehatan', 'Pendidikan', 'Ekonomi', 'Lingkungan', 'Lainnya'];
const KAT_COLORS = {
  Infrastruktur: 'bg-orange-100 text-orange-700',
  Sosial: 'bg-blue-100 text-blue-700',
  Kesehatan: 'bg-green-100 text-green-700',
  Pendidikan: 'bg-purple-100 text-purple-700',
  Ekonomi: 'bg-yellow-100 text-yellow-700',
  Lingkungan: 'bg-teal-100 text-teal-700',
  Lainnya: 'bg-slate-100 text-slate-700',
};
const KAT_EMOJI = {
  Infrastruktur:'🏗️', Sosial:'👥', Kesehatan:'🏥',
  Pendidikan:'📚', Ekonomi:'💰', Lingkungan:'🌿', Lainnya:'📌',
};

const INIT = { judul: '', kategori: 'Sosial', tanggal: '', deskripsi: '', emoji: '', lokasi: '' };

export default function Kegiatan() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterKat, setFilterKat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12 };
      if (filterKat) params.kategori = filterKat;
      const res = await kegiatanService.getAll(params);
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : (d?.rows || []));
      const meta = res.data?.meta || res.data?.pagination;
      setTotalPages(meta?.totalPages || 1);
    } catch {
      toast.error('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  }, [filterKat]);

  useEffect(() => { setPage(1); fetchData(1); }, [filterKat]);
  useEffect(() => { fetchData(page); }, [page]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      judul: item.judul || '', kategori: item.kategori || 'Sosial',
      tanggal: item.tanggal?.slice(0,10) || '', deskripsi: item.deskripsi || '',
      emoji: item.emoji || '', lokasi: item.lokasi || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.tanggal) { toast.error('Judul dan tanggal wajib diisi'); return; }
    setFormLoading(true);
    try {
      const payload = { ...form, emoji: form.emoji || KAT_EMOJI[form.kategori] || '📌' };
      if (editItem) {
        await kegiatanService.update(editItem.id, payload);
        toast.success('Kegiatan berhasil diperbarui');
      } else {
        await kegiatanService.create(payload);
        toast.success('Kegiatan berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan kegiatan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await kegiatanService.delete(deleteTarget.id);
      toast.success('Kegiatan dihapus');
      setDeleteTarget(null);
      fetchData(page);
    } catch { toast.error('Gagal menghapus kegiatan'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Program Kegiatan Desa"
        subtitle="Dokumentasi kegiatan dan program pembangunan desa"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Tambah Kegiatan</button>}
      />

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['', ...KATEGORI].map(k => (
          <button key={k} onClick={() => setFilterKat(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filterKat === k ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
            }`}>
            {k ? `${KAT_EMOJI[k]} ${k}` : 'Semua'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState icon={Camera} title="Belum ada kegiatan" description="Tambahkan program kegiatan desa"
            action={<button onClick={openAdd} className="btn-primary">Tambah Kegiatan</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="card p-0 overflow-hidden group hover:shadow-md transition-shadow">
              {/* Image / Emoji header */}
              <div className="h-32 bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center relative">
                {item.gambar ? (
                  <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{item.emoji || KAT_EMOJI[item.kategori] || '📌'}</span>
                )}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${KAT_COLORS[item.kategori] || 'bg-slate-100 text-slate-700'}`}>
                  {item.kategori}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.judul}</h3>
                {item.tanggal && (
                  <p className="text-xs text-slate-400 mt-1">
                    📅 {new Date(item.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                )}
                {item.lokasi && <p className="text-xs text-slate-400 mt-0.5">📍 {item.lokasi}</p>}
                {item.deskripsi && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.deskripsi}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => openEdit(item)} className="flex-1 btn-secondary text-xs py-1.5 justify-center">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="btn-danger text-xs py-1.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      )}

      {/* Form Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Kegiatan' : 'Tambah Kegiatan'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Judul Kegiatan <span className="text-red-500">*</span></label>
            <input type="text" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
              placeholder="Contoh: Pembangunan Jalan Dusun..." className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kategori</label>
              <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="input-field">
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})}
                className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Lokasi</label>
              <input type="text" value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})}
                placeholder="Contoh: Balai Desa..." className="input-field" />
            </div>
            <div>
              <label className="label">Emoji (opsional)</label>
              <input type="text" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})}
                placeholder={KAT_EMOJI[form.kategori] || '📌'} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})}
              rows={3} placeholder="Deskripsi kegiatan..." className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : editItem ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Hapus Kegiatan"
        message={`Hapus kegiatan "${deleteTarget?.judul}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
