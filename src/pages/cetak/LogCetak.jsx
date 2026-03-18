import { useState, useEffect, useCallback } from 'react';
import { Printer, Trash2, Search, Eye } from 'lucide-react';
import printService from '../../services/printService';
import { PageHeader, Pagination, ConfirmDialog, EmptyState, Spinner, Modal } from '../../components/UI';
import { toast } from 'react-toastify';

export default function LogCetak() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await printService.getLogs({ page: pg, limit: 15 });
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : (d?.rows || d?.logs || []));
      const meta = res.data?.meta || res.data?.pagination;
      setTotalPages(meta?.totalPages || meta?.last_page || 1);
    } catch {
      toast.error('Gagal memuat log cetak');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(page); }, [page]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await printService.deleteToken(deleteTarget.token);
      toast.success('Token berhasil dihapus');
      setDeleteTarget(null);
      fetchData(page);
    } catch {
      toast.error('Gagal menghapus token');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyToken.trim()) return;
    setVerifyLoading(true);
    try {
      const res = await printService.getByToken(verifyToken.trim());
      setVerifyResult(res.data?.data || res.data);
    } catch (err) {
      setVerifyResult({ error: err?.response?.data?.message || 'Token tidak ditemukan' });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Log Cetak Anjungan"
        subtitle="Riwayat dokumen yang tersedia di anjungan"
        action={
          <button onClick={() => setShowVerifyModal(true)} className="btn-secondary">
            <Search className="w-4 h-4" /> Verifikasi Token
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">Token</th>
                <th className="table-header text-left">Judul</th>
                <th className="table-header text-center hidden md:table-cell">Sudah Cetak</th>
                <th className="table-header text-center hidden md:table-cell">Maks. Cetak</th>
                <th className="table-header text-left hidden lg:table-cell">Dibuat</th>
                <th className="table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState icon={Printer} title="Belum ada log cetak" description="Upload PDF untuk membuat token cetak anjungan" />
                </td></tr>
              ) : data.map((d, i) => {
                const ratio = (d.printed_count || d.print_count || 0) / (d.max_print || 1);
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-mono text-xs font-semibold text-slate-700 bg-slate-50">
                      {d.token}
                    </td>
                    <td className="table-cell font-medium">{d.judul || d.title || '-'}</td>
                    <td className="table-cell text-center hidden md:table-cell">
                      <span className={`font-bold ${ratio >= 1 ? 'text-red-600' : 'text-slate-700'}`}>
                        {d.printed_count || d.print_count || 0}
                      </span>
                    </td>
                    <td className="table-cell text-center hidden md:table-cell text-slate-500">
                      {d.max_print || '∞'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-500 text-xs">
                      {d.created_at ? new Date(d.created_at).toLocaleString('id') : '-'}
                    </td>
                    <td className="table-cell text-center">
                      <button onClick={() => setDeleteTarget(d)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

      {/* Verify Modal */}
      <Modal open={showVerifyModal} onClose={() => { setShowVerifyModal(false); setVerifyResult(null); setVerifyToken(''); }}
        title="Verifikasi Token Cetak">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="label">Token</label>
            <div className="flex gap-2">
              <input type="text" value={verifyToken} onChange={e => setVerifyToken(e.target.value)}
                placeholder="Masukkan token cetak..." className="input-field flex-1 font-mono" />
              <button type="submit" disabled={verifyLoading} className="btn-primary">
                {verifyLoading ? <Spinner size="sm" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {verifyResult && (
            verifyResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{verifyResult.error}</div>
            ) : (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-medium text-slate-600">Judul:</span> {verifyResult.judul || '-'}</p>
                <p><span className="font-medium text-slate-600">Token:</span> <span className="font-mono">{verifyResult.token}</span></p>
                <p><span className="font-medium text-slate-600">Sudah Cetak:</span> {verifyResult.printed_count || 0} / {verifyResult.max_print || '∞'}</p>
                <p><span className="font-medium text-slate-600">Status:</span>{' '}
                  <span className={verifyResult.is_active !== false ? 'text-teal-600 font-medium' : 'text-red-600 font-medium'}>
                    {verifyResult.is_active !== false ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </p>
              </div>
            )
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Token"
        message={`Hapus token ${deleteTarget?.token} (${deleteTarget?.judul})? Anjungan tidak akan dapat mencetak dokumen ini lagi.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
