import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Shield, User } from 'lucide-react';
import tteService from '../../services/tteService';
import { PageHeader, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

const PERAN_LABEL = { ketua: 'Ketua / Kepala Desa', sekretaris: 'Sekretaris Desa' };

function ConfigCard({ config, onSave }) {
  const [form, setForm]       = useState({ ...config });
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(config.ttd_image || null);
  const fileRef               = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Pilih file gambar'); return; }
    if (f.size > 2 * 1024 * 1024)    { toast.error('Maks 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm(f => ({ ...f, ttd_image: ev.target.result }));
    };
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await tteService.updateConfig(form);
      toast.success(`Konfigurasi ${PERAN_LABEL[config.peran]} disimpan`);
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
          <User className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{PERAN_LABEL[config.peran]}</h3>
          <p className="text-xs text-slate-500 capitalize">Peran: {config.peran}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">Nama Jabatan</label>
          <input value={form.nama_jabatan || ''} onChange={e => setForm({...form, nama_jabatan: e.target.value})}
            className="input-field" placeholder="Contoh: Kepala Desa" />
        </div>
        <div>
          <label className="label">Nama Pejabat</label>
          <input value={form.nama_pejabat || ''} onChange={e => setForm({...form, nama_pejabat: e.target.value})}
            className="input-field" placeholder="Nama lengkap + gelar" />
        </div>
        <div>
          <label className="label">NIP (opsional)</label>
          <input value={form.nip || ''} onChange={e => setForm({...form, nip: e.target.value})}
            className="input-field font-mono" placeholder="19xxxxxx xxxx x xxx" />
        </div>

        {/* Upload Gambar TTD */}
        <div>
          <label className="label">Gambar Tanda Tangan</label>
          <p className="text-xs text-slate-400 mb-2">Upload PNG transparan (latar belakang putih/transparan, maks 2MB)</p>
          <div className="flex items-start gap-3">
            {preview ? (
              <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50">
                <img src={preview} alt="TTD Preview" className="h-16 w-auto max-w-36 object-contain" />
                <button type="button"
                  onClick={() => { setPreview(null); setForm(f => ({ ...f, ttd_image: null })); if(fileRef.current) fileRef.current.value=''; }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-lg p-4 cursor-pointer hover:border-teal-400 hover:bg-slate-50 transition-colors flex flex-col items-center gap-1 min-w-32">
                <Upload className="w-5 h-5 text-slate-400" />
                <p className="text-xs text-slate-400">Upload TTD</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center mt-2">
          {saving ? <><Spinner size="sm" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Konfigurasi</>}
        </button>
      </div>
    </div>
  );
}

export default function TTEConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await tteService.getConfig();
      setConfigs(res.data?.data || []);
    } catch { toast.error('Gagal memuat konfigurasi TTE'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div>
      <PageHeader title="Konfigurasi TTE" subtitle="Pengaturan tanda tangan pejabat" />
      <div className="flex justify-center py-16"><Spinner size="lg" /></div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Konfigurasi TTE" subtitle="Atur nama, jabatan, dan gambar tanda tangan pejabat" />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Alur Tanda Tangan Elektronik (TTE)</p>
          <ol className="list-decimal ml-4 space-y-0.5 text-xs">
            <li>Admin upload dokumen PDF → sistem assign token unik + QR</li>
            <li><strong>Ketua</strong> menyetujui dokumen di panel</li>
            <li><strong>Sekretaris</strong> menyetujui → sistem otomatis embed kedua TTD ke PDF</li>
            <li>PDF final siap didownload + QR verifikasi keaslian</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map(cfg => (
          <ConfigCard key={cfg.peran} config={cfg} onSave={load} />
        ))}
        {configs.length === 0 && (
          <div className="card col-span-2 text-center py-12 text-slate-400">
            Konfigurasi TTE belum tersedia. Pastikan migration sudah dijalankan.
          </div>
        )}
      </div>
    </div>
  );
}
