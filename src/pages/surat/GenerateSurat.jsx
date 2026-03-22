import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Download, QrCode, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import suratService from '../../services/suratService';
import { NikSearch, PageHeader, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

// Field tambahan per jenis surat (bisa dikustomisasi sesuai API)
const EXTRA_FIELDS = {
  SKTM: [
    { name: 'keterangan', label: 'Keterangan Tidak Mampu', type: 'textarea' },
    { name: 'keperluan', label: 'Keperluan', type: 'text' },
  ],
  SKD: [],
  SKCK: [
    { name: 'keperluan', label: 'Keperluan SKCK', type: 'text' },
  ],
  SKPINDAH: [
    { name: 'alamat_tujuan', label: 'Alamat Tujuan', type: 'text' },
    { name: 'alasan_pindah', label: 'Alasan Pindah', type: 'textarea' },
  ],
};

export default function GenerateSurat() {
  const location = useLocation();
  const selectedJenis = location.state?.jenis || null;

  const [jenisList, setJenisList] = useState([]);
  const [selectedKode, setSelectedKode] = useState(selectedJenis?.kode || selectedJenis?.code || '');
  const [selectedPenduduk, setSelectedPenduduk] = useState(null);
  const [extraForm, setExtraForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // SKTM — semua state harus dideklarasikan sebelum useEffect yang menggunakannya
  const [anakList, setAnakList] = useState([{ nama: '', usia: '' }]);
  const [showAnak, setShowAnak] = useState(false);

  // Reset extra form & data anak saat jenis surat berganti
  useEffect(() => {
    setExtraForm({});
    setAnakList([{ nama: '', usia: '' }]);
    setShowAnak(false);
  }, [selectedKode]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await suratService.getJenis();
        const d = res.data?.data || res.data;
        setJenisList(Array.isArray(d) ? d : []);
      } catch { /* ok */ }
    };
    load();
  }, []);

  const selectedJenisObj = jenisList.find(j => (j.kode || j.code) === selectedKode) || selectedJenis;
  const extraFields = EXTRA_FIELDS[selectedKode] || [];
  const isSKTM = selectedKode === 'SKTM';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKode) { toast.error('Pilih jenis surat terlebih dahulu'); return; }
    if (!selectedPenduduk) { toast.error('Pilih penduduk terlebih dahulu'); return; }
    setLoading(true);
    try {
      const payload = {
        jenis: selectedKode,
        nik: selectedPenduduk.NIK,
        ...extraForm,
      };
      if (isSKTM && showAnak) {
        payload.anak = anakList.filter(a => a.nama);
      }
      const res = await suratService.generate(payload);
      const d = res.data?.data || res.data;
      setResult(d);
      toast.success('Surat berhasil digenerate!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal generate surat');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedPenduduk(null);
    setExtraForm({});
    setAnakList([{ nama: '', usia: '' }]);
  };

  return (
    <div>
      <PageHeader
        title="Generate Surat"
        subtitle="Buat surat keterangan untuk penduduk"
      />

      {result ? (
        /* Result Panel */
        <div className="card max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-lg mb-1">Surat Berhasil Dibuat!</h2>
          <p className="text-sm text-slate-500 mb-6">
            {selectedJenisObj?.nama || selectedKode} untuk <strong>{selectedPenduduk?.NAMA}</strong>
          </p>

          {result.nomor_surat && (
            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 font-mono text-sm font-semibold text-slate-800">
              {result.nomor_surat}
            </div>
          )}

          {result.qr_base64 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> QR Code Verifikasi
              </p>
              <img src={`data:image/png;base64,${result.qr_base64}`}
                alt="QR Code" className="w-36 h-36 mx-auto border border-slate-200 rounded-lg" />
              {result.qr_token && (
                <p className="text-xs text-slate-400 font-mono mt-1">{result.qr_token}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {result.pdf_url && (
              <a href={result.pdf_url} target="_blank" rel="noreferrer" className="btn-primary">
                <Download className="w-4 h-4" /> Unduh PDF
              </a>
            )}
            <button onClick={handleReset} className="btn-secondary">
              Buat Surat Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Jenis Surat */}
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">1. Pilih Jenis Surat</h3>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {jenisList.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-2 text-center py-4">Memuat jenis surat...</p>
                )}
                {jenisList.map((j, i) => {
                  const kode = j.kode || j.code || j.id;
                  return (
                    <button key={i} type="button" onClick={() => setSelectedKode(kode)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        selectedKode === kode
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}>
                      <p className="font-semibold text-xs text-slate-700 leading-tight">{j.nama || j.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{kode}</p>
                    </button>
                  );
                })}
              </div>
              {/* Manual input if list empty */}
              {jenisList.length === 0 && (
                <div className="mt-3">
                  <label className="label">Kode Jenis Surat</label>
                  <input type="text" value={selectedKode} onChange={e => setSelectedKode(e.target.value)}
                    placeholder="Contoh: SKD, SKTM, SKCK..." className="input-field" />
                </div>
              )}
            </div>

            {/* Penduduk + Extra Fields */}
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">2. Pilih Penduduk</h3>
                <NikSearch onSelect={setSelectedPenduduk} />
                {selectedPenduduk && (
                  <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="font-semibold text-teal-900 text-sm">{selectedPenduduk.NAMA}</p>
                    <p className="text-xs text-teal-700 font-mono mt-0.5">{selectedPenduduk.NIK}</p>
                    <p className="text-xs text-teal-600 mt-0.5">{selectedPenduduk.DUSUN} RT {selectedPenduduk.RT}/RW {selectedPenduduk.RW}</p>
                  </div>
                )}
              </div>

              {/* Extra fields */}
              {extraFields.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">3. Data Tambahan</h3>
                  <div className="space-y-3">
                    {extraFields.map(f => (
                      <div key={f.name}>
                        <label className="label">{f.label}</label>
                        {f.type === 'textarea' ? (
                          <textarea name={f.name} value={extraForm[f.name] || ''}
                            onChange={e => setExtraForm({ ...extraForm, [f.name]: e.target.value })}
                            rows={3} className="input-field resize-none" />
                        ) : (
                          <input type={f.type} name={f.name} value={extraForm[f.name] || ''}
                            onChange={e => setExtraForm({ ...extraForm, [f.name]: e.target.value })}
                            className="input-field" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKTM Anak Section */}
              {isSKTM && (
                <div className="card">
                  <button type="button" onClick={() => setShowAnak(!showAnak)}
                    className="flex items-center justify-between w-full">
                    <span className="font-semibold text-slate-800 text-sm">Data Anak (opsional)</span>
                    {showAnak ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showAnak && (
                    <div className="mt-3 space-y-2">
                      {anakList.map((anak, i) => (
                        <div key={i} className="flex gap-2">
                          <input placeholder="Nama anak" value={anak.nama}
                            onChange={e => { const a = [...anakList]; a[i].nama = e.target.value; setAnakList(a); }}
                            className="input-field flex-1" />
                          <input placeholder="Usia" value={anak.usia} type="number"
                            onChange={e => { const a = [...anakList]; a[i].usia = e.target.value; setAnakList(a); }}
                            className="input-field w-20" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setAnakList([...anakList, { nama: '', usia: '' }])}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium">+ Tambah Anak</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={loading || !selectedKode || !selectedPenduduk} className="btn-primary px-8">
              {loading ? <><Spinner size="sm" /> Membuat Surat...</> : <><FileText className="w-4 h-4" /> Generate Surat</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
