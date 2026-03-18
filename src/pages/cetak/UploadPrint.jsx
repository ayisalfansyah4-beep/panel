import { useState, useRef } from 'react';
import { Upload, QrCode, Download, FileUp, X } from 'lucide-react';
import printService from '../../services/printService';
import { PageHeader, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

export default function UploadPrint() {
  const [form, setForm] = useState({ judul: '', max_print: 1 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Hanya file PDF yang diizinkan'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('Ukuran file maks 20MB'); return; }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Pilih file PDF terlebih dahulu'); return; }
    if (!form.judul.trim()) { toast.error('Judul harus diisi'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      fd.append('judul', form.judul);
      fd.append('max_print', form.max_print);
      const res = await printService.upload(fd);
      const d = res.data?.data || res.data;
      setResult(d);
      toast.success('PDF berhasil diupload untuk cetak!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setForm({ judul: '', max_print: 1 });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <PageHeader title="Upload PDF untuk Anjungan" subtitle="Upload dokumen PDF yang dapat dicetak di anjungan desa" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Upload Dokumen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Judul Dokumen <span className="text-red-500">*</span></label>
              <input type="text" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Surat Keterangan Domisili" className="input-field" required />
            </div>

            <div>
              <label className="label">Maksimum Cetak <span className="text-red-500">*</span></label>
              <input type="number" value={form.max_print} min={1} max={100}
                onChange={e => setForm({ ...form, max_print: parseInt(e.target.value) || 1 })}
                className="input-field w-32" />
              <p className="text-xs text-slate-400 mt-1">Jumlah maksimum cetak yang diizinkan</p>
            </div>

            <div>
              <label className="label">File PDF <span className="text-red-500">*</span></label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  file ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileUp className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Klik untuk pilih file PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Maks. 20MB</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
            </div>

            <button type="submit" disabled={loading || !file} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><Spinner size="sm" /> Mengupload...</> : <><Upload className="w-4 h-4" /> Upload & Generate Token</>}
            </button>
          </form>
        </div>

        {result ? (
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">✅ Token Berhasil Dibuat</h3>
            <div className="space-y-4">
              <div>
                <p className="label">Token Cetak</p>
                <div className="bg-slate-900 text-teal-400 font-mono text-lg px-4 py-3 rounded-lg tracking-widest text-center">
                  {result.token}
                </div>
              </div>

              {result.qr_base64 && (
                <div className="text-center">
                  <p className="label flex items-center justify-center gap-1.5 mb-2">
                    <QrCode className="w-4 h-4" /> QR Code
                  </p>
                  <img src={`data:image/png;base64,${result.qr_base64}`}
                    alt="QR Code" className="w-44 h-44 mx-auto border border-slate-200 rounded-xl shadow-sm" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Judul</p>
                  <p className="font-medium text-slate-800 mt-0.5">{result.judul || form.judul}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Maks Cetak</p>
                  <p className="font-medium text-slate-800 mt-0.5">{result.max_print ?? form.max_print} kali</p>
                </div>
              </div>

              {result.download_url && (
                <a href={result.download_url} target="_blank" rel="noreferrer" className="btn-secondary justify-center w-full">
                  <Download className="w-4 h-4" /> Unduh PDF
                </a>
              )}

              <button onClick={handleReset} className="btn-primary w-full justify-center">
                Upload Dokumen Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="card bg-slate-50 border-dashed">
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <QrCode className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-500">Token & QR Code</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Setelah upload, token dan QR code untuk anjungan akan tampil di sini
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
