import { useState, useEffect } from 'react';
import { Save, Plus, Pencil, Trash2, Building2, Users } from 'lucide-react';
import { profilService } from '../../services/contentService';
import { PageHeader, ConfirmDialog, Modal, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

const PROFIL_INIT = {
  nama_desa: '', kecamatan: '', kabupaten: '', provinsi: '',
  kode_desa: '', luas_wilayah: '', jumlah_dusun: '',
  sejarah: '', visi: '', misi: '',
};

const PERANGKAT_INIT = { jabatan: '', nama: '', emoji: '👤', urutan: 0 };

export default function ProfilDesa() {
  const [profil, setProfil]       = useState(PROFIL_INIT);
  const [perangkat, setPerangkat] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showPerModal, setShowPerModal] = useState(false);
  const [editPer, setEditPer]     = useState(null);
  const [perForm, setPerForm]     = useState(PERANGKAT_INIT);
  const [perLoading, setPerLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, perRes] = await Promise.allSettled([
          profilService.get(),
          profilService.getPerangkat(),
        ]);
        if (pRes.status === 'fulfilled') {
          const d = pRes.value.data?.data || pRes.value.data;
          if (d) setProfil(prev => ({ ...prev, ...d }));
        }
        if (perRes.status === 'fulfilled') {
          const d = perRes.value.data?.data || perRes.value.data;
          setPerangkat(Array.isArray(d) ? d : []);
        }
      } catch {
        toast.error('Gagal memuat profil desa');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await profilService.update(profil);
      toast.success('Profil desa berhasil disimpan');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaveLoading(false);
    }
  };

  const openAddPer  = () => { setEditPer(null); setPerForm({...PERANGKAT_INIT, urutan: perangkat.length + 1}); setShowPerModal(true); };
  const openEditPer = (p)  => { setEditPer(p); setPerForm({ jabatan: p.jabatan, nama: p.nama, emoji: p.emoji || '👤', urutan: p.urutan || 0 }); setShowPerModal(true); };

  const handleSavePer = async (e) => {
    e.preventDefault();
    if (!perForm.jabatan || !perForm.nama) { toast.error('Jabatan dan nama wajib diisi'); return; }
    setPerLoading(true);
    try {
      if (editPer) { await profilService.updatePerangkat(editPer.id, perForm); toast.success('Data perangkat diperbarui'); }
      else         { await profilService.createPerangkat(perForm); toast.success('Perangkat ditambahkan'); }
      setShowPerModal(false);
      const res = await profilService.getPerangkat();
      const d = res.data?.data || res.data;
      setPerangkat(Array.isArray(d) ? d : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setPerLoading(false);
    }
  };

  const handleDeletePer = async () => {
    setDeleteLoading(true);
    try {
      await profilService.deletePerangkat(deleteTarget.id);
      toast.success('Perangkat dihapus');
      setDeleteTarget(null);
      const res = await profilService.getPerangkat();
      setPerangkat(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
    } catch { toast.error('Gagal menghapus'); }
    finally { setDeleteLoading(false); }
  };

  const F = ({ label, name, type = 'text', half }) => (
    <div className={half ? '' : 'md:col-span-2'}>
      <label className="label">{label}</label>
      <input type={type} value={profil[name] || ''} onChange={e => setProfil({...profil, [name]: e.target.value})} className="input-field" />
    </div>
  );

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Profil Desa" subtitle="Informasi umum dan perangkat desa" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form Profil */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSaveProfil}>
            <div className="card mb-4">
              <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" /> Identitas Desa
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Nama Desa</label>
                  <input value={profil.nama_desa} onChange={e => setProfil({...profil, nama_desa: e.target.value})} className="input-field" />
                </div>
                <div><label className="label">Kecamatan</label><input value={profil.kecamatan} onChange={e => setProfil({...profil, kecamatan: e.target.value})} className="input-field" /></div>
                <div><label className="label">Kabupaten</label><input value={profil.kabupaten} onChange={e => setProfil({...profil, kabupaten: e.target.value})} className="input-field" /></div>
                <div><label className="label">Provinsi</label><input value={profil.provinsi} onChange={e => setProfil({...profil, provinsi: e.target.value})} className="input-field" /></div>
                <div><label className="label">Kode Desa</label><input value={profil.kode_desa} onChange={e => setProfil({...profil, kode_desa: e.target.value})} className="input-field font-mono" /></div>
                <div><label className="label">Luas Wilayah</label><input value={profil.luas_wilayah} onChange={e => setProfil({...profil, luas_wilayah: e.target.value})} placeholder="Contoh: 320 ha" className="input-field" /></div>
                <div><label className="label">Jumlah Dusun</label><input type="number" value={profil.jumlah_dusun} onChange={e => setProfil({...profil, jumlah_dusun: e.target.value})} className="input-field" /></div>
              </div>
            </div>

            <div className="card mb-4">
              <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Visi, Misi & Sejarah</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Visi Desa</label>
                  <textarea value={profil.visi} onChange={e => setProfil({...profil, visi: e.target.value})}
                    rows={2} className="input-field resize-none" placeholder="Visi desa..." />
                </div>
                <div>
                  <label className="label">Misi Desa</label>
                  <textarea value={profil.misi} onChange={e => setProfil({...profil, misi: e.target.value})}
                    rows={3} className="input-field resize-none" placeholder="Misi desa..." />
                </div>
                <div>
                  <label className="label">Sejarah Desa</label>
                  <textarea value={profil.sejarah} onChange={e => setProfil({...profil, sejarah: e.target.value})}
                    rows={5} className="input-field resize-none" placeholder="Sejarah singkat desa..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saveLoading} className="btn-primary px-8">
                {saveLoading ? <><Spinner size="sm" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Profil</>}
              </button>
            </div>
          </form>
        </div>

        {/* Perangkat Desa */}
        <div className="card self-start">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Perangkat Desa
            </h3>
            <button onClick={openAddPer} className="w-7 h-7 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {perangkat.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">Belum ada data perangkat</div>
          ) : (
            <div className="space-y-2">
              {perangkat.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 group">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-lg flex-shrink-0">
                    {p.emoji || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium">{p.jabatan}</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{p.nama}</p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditPer(p)} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Perangkat Modal */}
      <Modal open={showPerModal} onClose={() => setShowPerModal(false)}
        title={editPer ? 'Edit Perangkat' : 'Tambah Perangkat'} size="sm">
        <form onSubmit={handleSavePer} className="space-y-4">
          <div>
            <label className="label">Jabatan <span className="text-red-500">*</span></label>
            <input value={perForm.jabatan} onChange={e => setPerForm({...perForm, jabatan: e.target.value})}
              placeholder="Contoh: Kepala Desa..." className="input-field" required />
          </div>
          <div>
            <label className="label">Nama <span className="text-red-500">*</span></label>
            <input value={perForm.nama} onChange={e => setPerForm({...perForm, nama: e.target.value})}
              placeholder="Nama lengkap..." className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emoji</label>
              <input value={perForm.emoji} onChange={e => setPerForm({...perForm, emoji: e.target.value})}
                placeholder="👤" className="input-field" />
            </div>
            <div>
              <label className="label">Urutan</label>
              <input type="number" value={perForm.urutan} onChange={e => setPerForm({...perForm, urutan: parseInt(e.target.value) || 0})}
                className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowPerModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={perLoading} className="btn-primary">
              {perLoading ? <><Spinner size="sm" /> Menyimpan...</> : editPer ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Hapus Perangkat"
        message={`Hapus data perangkat "${deleteTarget?.nama}" (${deleteTarget?.jabatan})?`}
        onConfirm={handleDeletePer} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
