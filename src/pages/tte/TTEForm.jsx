import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, FileUp, X, CheckCircle, XCircle, Download,
  QrCode, Clock, ArrowLeft, Shield, AlertTriangle, Loader2
} from 'lucide-react';
import tteService from '../../services/tteService';
import { PageHeader, Modal, Spinner, PageLoading } from '../../components/UI';
import { NikSearch } from '../../components/UI';
import { toast } from 'react-toastify';

// ══════════════════════════════════════════════════════════════
// UPLOAD PAGE
// ══════════════════════════════════════════════════════════════
export function TTEUpload() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [file, setFile]     = useState(null);
  const [form, setForm]     = useState({ judul: '', jenis: '', catatan: '' });
  const [penduduk, setPenduduk] = useState(null);
  const [loading, setLoading]  = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Hanya file PDF'); return; }
    if (f.size > 20 * 1024 * 1024)   { toast.error('Maks 20MB'); return; }
    setFile(f);
    if (!form.judul) setForm(f => ({ ...f, judul: e.target.files[0].name.replace('.pdf','') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)       { toast.error('Pilih file PDF'); return; }
    if (!form.judul) { toast.error('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      fd.append('judul', form.judul);
      fd.append('jenis', form.jenis);
      fd.append('catatan', form.catatan);
      if (penduduk) {
        fd.append('nik_pemohon',  penduduk.NIK);
        fd.append('nama_pemohon', penduduk.NAMA);
      }
      const res = await tteService.upload(fd);
      toast.success('Dokumen berhasil diupload!');
      navigate(`/tte/${res.data?.data?.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal upload');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Upload Dokumen TTE"
        subtitle="Upload PDF untuk diproses tanda tangan elektronik dua penandatangan"
        action={<button onClick={() => navigate('/tte')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Kembali</button>}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag area */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">File Dokumen</h3>
            <div onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
              }`}>
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileUp className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if(fileRef.current) fileRef.current.value=''; }}
                    className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-600 text-sm">Klik untuk pilih file PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Maksimal 20MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          </div>

          {/* Info dokumen */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Informasi Dokumen</h3>
            <div>
              <label className="label">Judul Dokumen <span className="text-red-500">*</span></label>
              <input value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
                className="input-field" placeholder="Contoh: SK Domisili a.n. Budi Santoso" required />
            </div>
            <div>
              <label className="label">Jenis Dokumen</label>
              <input value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})}
                className="input-field" placeholder="Contoh: Surat Keterangan, SK Kepala Desa..." />
            </div>
            <NikSearch onSelect={setPenduduk} label="Pemohon (opsional — cari NIK)" />
            {penduduk && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-teal-900">{penduduk.NAMA}</p>
                <p className="text-xs text-teal-600 font-mono mt-0.5">{penduduk.NIK}</p>
              </div>
            )}
            <div>
              <label className="label">Catatan</label>
              <textarea value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})}
                rows={2} className="input-field resize-none" placeholder="Catatan tambahan (opsional)" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/tte')} className="btn-secondary">Batal</button>
            <button type="submit" disabled={loading || !file} className="btn-primary px-8">
              {loading ? <><Spinner size="sm" /> Mengupload...</> : <><Upload className="w-4 h-4" /> Upload & Mulai TTE</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DETAIL + APPROVAL PAGE
// ══════════════════════════════════════════════════════════════
const STATUS_STEP = ['menunggu','proses_ketua','proses_sekretaris','selesai'];
const STATUS_LABEL = {
  menunggu:'Menunggu', proses_ketua:'Proses Ketua',
  proses_sekretaris:'Proses Sekretaris', selesai:'Selesai', ditolak:'Ditolak'
};

export function TTEDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [dok, setDok]           = useState(null);
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showTolak, setShowTolak]     = useState(false);
  const [peran, setPeran]       = useState('ketua');
  const [catatan, setCatatan]   = useState('');
  const [alasan, setAlasan]     = useState('');
  const [acting, setActing]     = useState(false);

  const load = async () => {
    try {
      const [dRes, lRes] = await Promise.allSettled([
        tteService.getById(id),
        tteService.getLogs(id),
      ]);
      if (dRes.status === 'fulfilled') setDok(dRes.value.data?.data);
      if (lRes.status === 'fulfilled') setLogs(lRes.value.data?.data || []);
    } catch { toast.error('Gagal memuat detail TTE'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      const res = await tteService.approve(id, { peran, catatan });
      toast.success(res.data?.message || 'Berhasil');
      setShowApprove(false);
      setCatatan('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal approve');
    } finally { setActing(false); }
  };

  const handleTolak = async () => {
    if (!alasan) { toast.error('Alasan wajib diisi'); return; }
    setActing(true);
    try {
      await tteService.tolak(id, { alasan });
      toast.success('Dokumen ditolak');
      setShowTolak(false);
      setAlasan('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menolak');
    } finally { setActing(false); }
  };

  if (loading) return <PageLoading />;
  if (!dok)    return <div className="card text-center py-12 text-slate-400">Dokumen tidak ditemukan</div>;

  const stepIdx     = STATUS_STEP.indexOf(dok.status);
  const isDitolak   = dok.status === 'ditolak';
  const isSelesai   = dok.status === 'selesai';
  const canApprove  = !isSelesai && !isDitolak;

  return (
    <div>
      <PageHeader title={dok.kode} subtitle={dok.judul}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate('/tte')} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            {isSelesai && dok.download_url && (
              <a href={dok.download_url} target="_blank" rel="noreferrer" className="btn-primary">
                <Download className="w-4 h-4" /> Download PDF Final
              </a>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kiri: Detail + Alur */}
        <div className="lg:col-span-2 space-y-4">

          {/* Stepper */}
          {!isDitolak && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm">Alur Persetujuan</h3>
              <div className="flex items-center">
                {STATUS_STEP.map((s, i) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex flex-col items-center ${i < STATUS_STEP.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        i < stepIdx ? 'bg-teal-500 text-white' :
                        i === stepIdx ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                        'bg-slate-200 text-slate-400'
                      }`}>
                        {i < stepIdx ? '✓' : i + 1}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-center w-20">{STATUS_LABEL[s]}</p>
                    </div>
                    {i < STATUS_STEP.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 -mt-5 transition-colors ${i < stepIdx ? 'bg-teal-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDitolak && (
            <div className="card border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Dokumen Ditolak</p>
                  {dok.ditolak_note && <p className="text-sm text-red-600 mt-0.5">Alasan: {dok.ditolak_note}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Info Dokumen */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Informasi Dokumen</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Kode', dok.kode],
                ['Status', STATUS_LABEL[dok.status]],
                ['Jenis', dok.jenis || '—'],
                ['Pemohon', dok.nama_pemohon || '—'],
                ['NIK', dok.nik_pemohon || '—'],
                ['Tanggal Upload', dok.created_at ? new Date(dok.created_at).toLocaleString('id') : '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500 font-medium uppercase tracking-wide">{k}</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{v}</dd>
                </div>
              ))}
              {dok.catatan && (
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500 font-medium uppercase tracking-wide">Catatan</dt>
                  <dd className="text-slate-600 mt-0.5">{dok.catatan}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Status TTD */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Status Tanda Tangan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TTD Ketua */}
              <div className={`rounded-xl p-4 border-2 ${dok.penandatangan1_at ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {dok.penandatangan1_at
                    ? <CheckCircle className="w-5 h-5 text-teal-600" />
                    : <Clock className="w-5 h-5 text-slate-400" />
                  }
                  <span className="font-bold text-sm">TTD Ketua</span>
                </div>
                {dok.penandatangan1_at ? (
                  <>
                    <p className="text-sm font-medium text-teal-800">{dok.penandatangan1_nama}</p>
                    <p className="text-xs text-teal-600">{new Date(dok.penandatangan1_at).toLocaleString('id')}</p>
                    {dok.penandatangan1_note && <p className="text-xs text-slate-500 mt-1 italic">"{dok.penandatangan1_note}"</p>}
                  </>
                ) : <p className="text-xs text-slate-400">Menunggu persetujuan</p>}
              </div>
              {/* TTD Sekretaris */}
              <div className={`rounded-xl p-4 border-2 ${dok.penandatangan2_at ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {dok.penandatangan2_at
                    ? <CheckCircle className="w-5 h-5 text-teal-600" />
                    : <Clock className="w-5 h-5 text-slate-400" />
                  }
                  <span className="font-bold text-sm">TTD Sekretaris</span>
                </div>
                {dok.penandatangan2_at ? (
                  <>
                    <p className="text-sm font-medium text-teal-800">{dok.penandatangan2_nama}</p>
                    <p className="text-xs text-teal-600">{new Date(dok.penandatangan2_at).toLocaleString('id')}</p>
                    {dok.penandatangan2_note && <p className="text-xs text-slate-500 mt-1 italic">"{dok.penandatangan2_note}"</p>}
                  </>
                ) : <p className="text-xs text-slate-400">Menunggu setelah Ketua menyetujui</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canApprove && (
            <div className="flex gap-3">
              <button onClick={() => { setPeran(!dok.penandatangan1_at ? 'ketua' : 'sekretaris'); setShowApprove(true); }}
                className="btn-primary flex-1 justify-center py-3">
                <Shield className="w-4 h-4" />
                {!dok.penandatangan1_at ? 'Setujui sebagai Ketua' : 'Setujui sebagai Sekretaris'}
              </button>
              <button onClick={() => setShowTolak(true)} className="btn-danger py-3 px-6">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
            </div>
          )}
        </div>

        {/* Kanan: Log + QR */}
        <div className="space-y-4">
          {/* QR Code */}
          {isSelesai && dok.qr_token && (
            <div className="card text-center">
              <p className="font-semibold text-slate-800 mb-3 flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-teal-600" /> QR Verifikasi
              </p>
              <div className="bg-slate-50 rounded-xl p-4 inline-block mb-3">
                <img
                  src={dok.qr_base64 || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(dok.verify_url || dok.qr_token)}&size=160x160`}
                  alt="QR Verifikasi TTE" className="w-40 h-40 mx-auto" />
              </div>
              <p className="font-mono text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-block border border-teal-200">
                {dok.qr_token}
              </p>
              <p className="text-xs text-slate-400 mt-2">Scan untuk verifikasi keaslian dokumen</p>
            </div>
          )}

          {/* Log Aktivitas */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Log Aktivitas</h3>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      log.aksi.includes('approve') ? 'bg-teal-500' :
                      log.aksi === 'tolak' ? 'bg-red-500' : 'bg-slate-300'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-700 capitalize">{log.aksi.replace('_', ' ')}</p>
                      <p className="text-slate-400">{log.admin_nama} · {new Date(log.created_at).toLocaleString('id')}</p>
                      {log.catatan && <p className="text-slate-500 italic mt-0.5">"{log.catatan}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Approve */}
      <Modal open={showApprove} onClose={() => setShowApprove(false)}
        title={`Setujui sebagai ${peran === 'ketua' ? 'Ketua' : 'Sekretaris'}`} size="sm">
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
            <p className="font-semibold mb-1">Dokumen: {dok.judul}</p>
            <p className="text-xs">Tanda tangan Anda akan ditempatkan di dokumen ini secara elektronik.</p>
          </div>
          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
              rows={2} className="input-field resize-none" placeholder="Catatan persetujuan..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowApprove(false)} className="btn-secondary">Batal</button>
            <button onClick={handleApprove} disabled={acting} className="btn-primary">
              {acting ? <><Spinner size="sm" /> Memproses...</> : <><Shield className="w-4 h-4" /> Setujui & Tanda Tangani</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Tolak */}
      <Modal open={showTolak} onClose={() => setShowTolak(false)} title="Tolak Dokumen" size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Dokumen yang ditolak tidak bisa diproses kembali.
          </div>
          <div>
            <label className="label">Alasan Penolakan <span className="text-red-500">*</span></label>
            <textarea value={alasan} onChange={e => setAlasan(e.target.value)}
              rows={3} className="input-field resize-none" placeholder="Jelaskan alasan penolakan..." required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowTolak(false)} className="btn-secondary">Batal</button>
            <button onClick={handleTolak} disabled={acting || !alasan}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
              {acting ? <><Spinner size="sm" /> Memproses...</> : <><XCircle className="w-4 h-4" /> Tolak Dokumen</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
