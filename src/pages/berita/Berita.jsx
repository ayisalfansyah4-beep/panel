import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Newspaper, Image, X, Upload } from 'lucide-react';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const KATEGORI = ['Informasi', 'Kegiatan', 'Pengumuman', 'Sosial', 'Pembangunan', 'Lainnya'];
const KAT_COLORS = {
  Informasi:   'bg-blue-100 text-blue-700',
  Kegiatan:    'bg-teal-100 text-teal-700',
  Pengumuman:  'bg-orange-100 text-orange-700',
  Sosial:      'bg-purple-100 text-purple-700',
  Pembangunan: 'bg-yellow-100 text-yellow-700',
  Lainnya:     'bg-slate-100 text-slate-700',
};
const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-yellow-100 text-yellow-700',
  archived:  'bg-slate-100 text-slate-500',
};
const STATUS_LABEL = { published: 'Published', draft: 'Draft', archived: 'Arsip' };

const INIT = { judul: '', ringkasan: '', konten: '', kategori: 'Informasi', status: 'draft' };

// ── Service ────────────────────────────────────────────────────────────────
const beritaService = {
  getAll:  (params = {}) => api.get('/api/berita', { params }),
  create:  (fd)          => api.post('/api/berita', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, fd)      => api.put(`/api/berita/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)          => api.delete(`/api/berita/${id}`),
  hapusFoto: (id)        => api.delete(`/api/berita/${id}/foto`),
};

export default function Berita() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKat, setFilterKat]     = useState('');
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [form, setForm]               = useState(INIT);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [preview, setPreview]         = useState(null);   // URL preview foto
  const [fotoFile, setFotoFile]       = useState(null);   // File object baru
  const [hapusFoto, setHapusFoto]     = useState(false);  // flag hapus foto lama
  const fileRef = useRef();
  const debounceRef = useRef();

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10, status: filterStatus };
      if (filterKat) params.kategori = filterKat;
      if (search)    params.search   = search;
      const res  = await beritaService.getAll(params);
      const body = res.data;
      setData(body.data || []);
      setTotal(body.total || 0);
      setTotalPages(body.total_pages || 1);
      setPage(pg);
    } catch {
      toast.error('Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterKat, search]);

  useEffect(() => { fetchData(1); }, [filterStatus, filterKat]);

  // debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(1), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null); setForm(INIT);
    setPreview(null); setFotoFile(null); setHapusFoto(false);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ judul: item.judul, ringkasan: item.ringkasan || '', konten: item.konten || '', kategori: item.kategori || 'Informasi', status: item.status });
    setPreview(item.foto_url || null);
    setFotoFile(null); setHapusFoto(false);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); };

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar yang diperbolehkan'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Ukuran foto maksimal 5 MB'); return; }
    setFotoFile(file);
    setHapusFoto(false);
    setPreview(URL.createObjectURL(file));
  };

  const clearFoto = () => {
    setFotoFile(null);
    setPreview(null);
    setHapusFoto(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.konten) { toast.error('Judul dan konten wajib diisi'); return; }

    const fd = new FormData();
    fd.append('judul',     form.judul);
    fd.append('ringkasan', form.ringkasan || '');
    fd.append('konten',    form.konten);
    fd.append('kategori',  form.kategori);
    fd.append('status',    form.status);
    if (fotoFile)  fd.append('foto', fotoFile);
    if (hapusFoto) fd.append('_deleteFoto', '1');

    setFormLoading(true);
    try {
      if (editItem) {
        await beritaService.update(editItem.id, fd);
        toast.success('Berita berhasil diperbarui');
      } else {
        await beritaService.create(fd);
        toast.success('Berita berhasil ditambahkan');
      }
      closeModal();
      fetchData(editItem ? page : 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan berita');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await beritaService.delete(deleteTarget.id);
      toast.success('Berita berhasil dihapus');
      setDeleteTarget(null);
      fetchData(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus berita');
    } finally {
      setDeleteLoading(false);
    }
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <PageHeader
        title="Berita Desa"
        subtitle={`${total} berita tersimpan`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Berita
          </button>
        }
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Cari judul berita..."
          className="input-field flex-1 min-w-[180px] max-w-xs"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Arsip</option>
        </select>
        <select value={filterKat} onChange={e => setFilterKat(e.target.value)} className="input-field w-auto">
          <option value="">Semua Kategori</option>
          {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* ── Tabel ── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Spinner className="mx-auto" size="lg" /></div>
        ) : data.length === 0 ? (
          <EmptyState icon={Newspaper} title="Belum ada berita" description="Klik Tambah Berita untuk membuat berita pertama" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header text-left w-16">Foto</th>
                  <th className="table-header text-left">Judul</th>
                  <th className="table-header text-center">Kategori</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-center hidden md:table-cell">Dibaca</th>
                  <th className="table-header text-left hidden lg:table-cell">Tanggal</th>
                  <th className="table-header text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      {item.foto_url
                        ? <img src={item.foto_url} alt={item.judul} className="w-12 h-9 object-cover rounded-lg" onError={e => e.target.style.display='none'} />
                        : <div className="w-12 h-9 bg-slate-100 rounded-lg flex items-center justify-center"><Image className="w-4 h-4 text-slate-300" /></div>
                      }
                    </td>
                    <td className="table-cell">
                      <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.judul}</p>
                      {item.ringkasan && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.ringkasan}</p>}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${KAT_COLORS[item.kategori] || 'bg-slate-100 text-slate-600'}`}>
                        {item.kategori || '—'}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] || ''}`}>
                        {STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>
                    <td className="table-cell text-center text-slate-500 text-sm hidden md:table-cell">
                      {item.jumlah_baca ?? 0}
                    </td>
                    <td className="table-cell text-slate-400 text-xs hidden lg:table-cell">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(item)} title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} title="Hapus"
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => fetchData(page - 1)} disabled={page <= 1} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-40">‹ Prev</button>
          <span className="text-sm text-slate-500">Hal {page} / {totalPages}</span>
          <button onClick={() => fetchData(page + 1)} disabled={page >= totalPages} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-40">Next ›</button>
        </div>
      )}

      {/* ══════════════ MODAL FORM ══════════════ */}
      <Modal open={showModal} onClose={closeModal} title={editItem ? '✏️ Edit Berita' : '➕ Tambah Berita'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul */}
          <div>
            <label className="label">Judul <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={e => f('judul', e.target.value)} className="input-field" placeholder="Judul berita" required />
          </div>

          {/* Ringkasan */}
          <div>
            <label className="label">Ringkasan <span className="text-slate-400 font-normal">(opsional)</span></label>
            <textarea value={form.ringkasan} onChange={e => f('ringkasan', e.target.value)} className="input-field resize-none" rows={2} placeholder="Deskripsi singkat..." />
          </div>

          {/* Konten */}
          <div>
            <label className="label">Konten <span className="text-red-500">*</span></label>
            <textarea value={form.konten} onChange={e => f('konten', e.target.value)} className="input-field resize-y" rows={5} placeholder="Isi berita lengkap..." required />
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori</label>
              <select value={form.kategori} onChange={e => f('kategori', e.target.value)} className="input-field">
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className="input-field">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="label">Foto Berita <span className="text-slate-400 font-normal">(JPG/PNG/WebP, maks 5 MB)</span></label>

            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="preview" className="h-36 rounded-xl object-cover border border-slate-200" />
                <button type="button" onClick={clearFoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
              >
                <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Klik atau drag foto ke sini</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files?.[0])} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : editItem ? 'Simpan Perubahan' : 'Tambah Berita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ══════════════ CONFIRM DELETE ══════════════ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Berita"
        message={`Hapus berita "${deleteTarget?.judul}"? Foto terkait juga akan dihapus.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
