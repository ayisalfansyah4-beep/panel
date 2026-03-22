import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle, XCircle, Download, QrCode, Clock, Filter } from 'lucide-react';
import tteService from '../../services/tteService';
import { PageHeader, Pagination, Spinner, EmptyState, ConfirmDialog } from '../../components/UI';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  menunggu          : { label: 'Menunggu',         color: 'bg-slate-100 text-slate-600',    icon: Clock },
  proses_ketua      : { label: 'Proses Ketua',      color: 'bg-blue-100 text-blue-700',      icon: Clock },
  proses_sekretaris : { label: 'Proses Sekretaris', color: 'bg-amber-100 text-amber-700',    icon: Clock },
  selesai           : { label: 'Selesai ✓',         color: 'bg-emerald-100 text-emerald-700',icon: CheckCircle },
  ditolak           : { label: 'Ditolak',           color: 'bg-red-100 text-red-700',        icon: XCircle },
};

export default function TTEDaftar() {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      const res = await tteService.getAll(params);
      const d = res.data?.data || [];
      setData(Array.isArray(d) ? d : []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch { toast.error('Gagal memuat data TTE'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { setPage(1); fetchData(1); }, [filterStatus]);
  useEffect(() => { fetchData(page); }, [page]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await tteService.remove(deleteTarget.id);
      toast.success('Dokumen dihapus');
      setDeleteTarget(null);
      fetchData(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus');
    } finally { setDeleteLoading(false); }
  };

  const pendingCount = data.filter(d => ['menunggu','proses_ketua','proses_sekretaris'].includes(d.status)).length;

  return (
    <div>
      <PageHeader
        title="Tanda Tangan Elektronik (TTE)"
        subtitle={`Alur persetujuan dokumen digital dua penandatangan`}
        action={
          <button onClick={() => navigate('/tte/upload')} className="btn-primary">
            <Plus className="w-4 h-4" /> Upload Dokumen
          </button>
        }
      />

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[{ val: '', label: 'Semua' }, ...Object.entries(STATUS_CONFIG).map(([val, c]) => ({ val, label: c.label }))].map(s => (
          <button key={s.val} onClick={() => setFilterStatus(s.val)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filterStatus === s.val ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
            }`}>
            {s.label}
            {s.val === '' && pendingCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">Kode</th>
                <th className="table-header text-left">Judul</th>
                <th className="table-header text-left hidden md:table-cell">Pemohon</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center hidden lg:table-cell">TTD 1 (Ketua)</th>
                <th className="table-header text-center hidden lg:table-cell">TTD 2 (Sekretaris)</th>
                <th className="table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Spinner size="lg" className="mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState icon={QrCode} title="Belum ada dokumen TTE"
                    description="Upload dokumen PDF untuk memulai proses tanda tangan elektronik" />
                </td></tr>
              ) : data.map(dok => {
                const sc = STATUS_CONFIG[dok.status] || STATUS_CONFIG.menunggu;
                return (
                  <tr key={dok.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-mono text-xs font-semibold text-teal-700">{dok.kode}</td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-800 text-sm max-w-xs truncate">{dok.judul}</p>
                      {dok.jenis && <p className="text-xs text-slate-400">{dok.jenis}</p>}
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-500 text-sm">{dok.nama_pemohon || '—'}</td>
                    <td className="table-cell text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>
                        {dok.status === 'selesai' ? '✓' : dok.status === 'ditolak' ? '✗' : '⏳'} {sc.label}
                      </span>
                    </td>
                    <td className="table-cell text-center hidden lg:table-cell">
                      {dok.penandatangan1_at ? (
                        <div>
                          <p className="text-xs font-medium text-emerald-600">✓ {dok.penandatangan1_nama}</p>
                          <p className="text-xs text-slate-400">{new Date(dok.penandatangan1_at).toLocaleDateString('id')}</p>
                        </div>
                      ) : <span className="text-xs text-slate-300">Belum</span>}
                    </td>
                    <td className="table-cell text-center hidden lg:table-cell">
                      {dok.penandatangan2_at ? (
                        <div>
                          <p className="text-xs font-medium text-emerald-600">✓ {dok.penandatangan2_nama}</p>
                          <p className="text-xs text-slate-400">{new Date(dok.penandatangan2_at).toLocaleDateString('id')}</p>
                        </div>
                      ) : <span className="text-xs text-slate-300">Belum</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => navigate(`/tte/${dok.id}`)} title="Detail"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {dok.status === 'selesai' && dok.download_url && (
                          <a href={dok.download_url} target="_blank" rel="noreferrer" title="Download PDF"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {dok.status !== 'selesai' && (
                          <button onClick={() => setDeleteTarget(dok)} title="Hapus"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
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
        {!loading && data.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Hapus Dokumen TTE"
        message={`Hapus dokumen "${deleteTarget?.judul}"? File PDF akan ikut dihapus.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
