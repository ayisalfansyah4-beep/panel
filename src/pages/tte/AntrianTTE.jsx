import { useState, useEffect, useCallback } from 'react';
import { Stamp, CheckCircle, XCircle, Eye, Clock, User, FileText } from 'lucide-react';
import tteService from '../../services/tteService';
import { PageHeader, Spinner, EmptyState, Modal } from '../../components/UI';
import { toast } from 'react-toastify';

const STATUS_BADGE = {
  menunggu_ketua    : { label: 'Menunggu Ketua',     cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  menunggu_sekretaris: { label: 'Menunggu Sekretaris', cls: 'bg-blue-50   text-blue-700   ring-blue-200'   },
  selesai           : { label: 'Selesai',              cls: 'bg-green-50  text-green-700  ring-green-200'  },
  ditolak           : { label: 'Ditolak',              cls: 'bg-red-50    text-red-700    ring-red-200'    },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { label: status || '—', cls: 'bg-slate-50 text-slate-600 ring-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function AntrianTTE() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // { mode: 'detail'|'approve'|'reject', item }
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving]   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tteService.getAntrian();
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Gagal memuat antrian TTE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = (mode, item) => {
    setCatatan('');
    setModal({ mode, item });
  };

  const closeModal = () => setModal(null);

  const handleApprove = async () => {
    setSaving(true);
    try {
      await tteService.approve(modal.item.id, { catatan });
      toast.success('Dokumen berhasil disetujui & ditandatangani');
      closeModal();
      fetchData();
    } catch {
      toast.error('Gagal menyetujui dokumen');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!catatan.trim()) {
      toast.warning('Alasan penolakan wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await tteService.reject(modal.item.id, { catatan });
      toast.success('Dokumen ditolak');
      closeModal();
      fetchData();
    } catch {
      toast.error('Gagal menolak dokumen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Antrian TTE"
        subtitle="Dokumen yang menunggu tanda tangan elektronik"
        action={
          <button onClick={fetchData} className="btn-secondary text-sm">
            Refresh
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">Dokumen</th>
                <th className="table-header text-left hidden md:table-cell">Pemohon</th>
                <th className="table-header text-left hidden lg:table-cell">Tanggal</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Stamp}
                      title="Tidak ada antrian TTE"
                      description="Dokumen yang membutuhkan tanda tangan akan muncul di sini"
                    />
                  </td>
                </tr>
              ) : data.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.judul || item.nama_dokumen || '—'}</p>
                        <p className="text-xs text-slate-500 font-mono">{item.nomor_surat || item.kode || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.nama_pemohon || item.pemohon || '—'}
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.created_at ? new Date(item.created_at).toLocaleString('id') : '—'}
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {/* Detail */}
                      <button
                        title="Lihat Detail"
                        onClick={() => openModal('detail', item)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* Approve — hanya jika masih menunggu */}
                      {(item.status === 'menunggu_ketua' || item.status === 'menunggu_sekretaris') && (
                        <>
                          <button
                            title="Setujui & Tandatangani"
                            onClick={() => openModal('approve', item)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Tolak"
                            onClick={() => openModal('reject', item)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      <Modal
        open={modal?.mode === 'detail'}
        onClose={closeModal}
        title="Detail Dokumen TTE"
        size="lg"
      >
        {modal?.item && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Judul Dokumen', modal.item.judul || modal.item.nama_dokumen],
                ['Nomor Surat',   modal.item.nomor_surat || modal.item.kode],
                ['Pemohon',       modal.item.nama_pemohon || modal.item.pemohon],
                ['Status',        <StatusBadge key="s" status={modal.item.status} />],
                ['Tanggal Masuk', modal.item.created_at ? new Date(modal.item.created_at).toLocaleString('id') : '—'],
                ['TTD Ketua',     modal.item.ttd_ketua ? '✅ Sudah' : '⏳ Belum'],
                ['TTD Sekretaris',modal.item.ttd_sekretaris ? '✅ Sudah' : '⏳ Belum'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="font-medium text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {modal.item.catatan && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Catatan</p>
                <p className="text-sm text-slate-700">{modal.item.catatan}</p>
              </div>
            )}
            {modal.item.pdf_url && (
              <a href={modal.item.pdf_url} target="_blank" rel="noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                Buka PDF
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Approve */}
      <Modal
        open={modal?.mode === 'approve'}
        onClose={closeModal}
        title="Setujui & Tandatangani Dokumen"
      >
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Konfirmasi Persetujuan</p>
              <p className="text-sm text-green-700 mt-0.5">
                Anda akan menandatangani dokumen <strong>{modal?.item?.judul || modal?.item?.nama_dokumen}</strong>.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="btn-secondary" disabled={saving}>Batal</button>
            <button onClick={handleApprove} disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
              {saving && <Spinner size="sm" />}
              <CheckCircle className="w-4 h-4" />
              Setujui & Tandatangani
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Reject */}
      <Modal
        open={modal?.mode === 'reject'}
        onClose={closeModal}
        title="Tolak Dokumen"
      >
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4 flex gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Konfirmasi Penolakan</p>
              <p className="text-sm text-red-700 mt-0.5">
                Anda akan menolak dokumen <strong>{modal?.item?.judul || modal?.item?.nama_dokumen}</strong>.
              </p>
            </div>
          </div>
          <div>
            <label className="label">Alasan Penolakan <span className="text-red-500">*</span></label>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={3}
              placeholder="Tuliskan alasan penolakan..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="btn-secondary" disabled={saving}>Batal</button>
            <button onClick={handleReject} disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
              {saving && <Spinner size="sm" />}
              <XCircle className="w-4 h-4" />
              Tolak Dokumen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
