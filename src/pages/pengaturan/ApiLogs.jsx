import { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import adminService from '../../services/adminService';
import { PageHeader, Pagination, EmptyState, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

const METHOD_COLORS = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
};

export default function ApiLogs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getApiLogs({ page: pg, limit: 25 });
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : (d?.rows || d?.logs || []));
      const meta = res.data?.meta || res.data?.pagination;
      setTotalPages(meta?.totalPages || meta?.last_page || 1);
    } catch {
      toast.error('Gagal memuat log API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(page); }, [page]);

  return (
    <div>
      <PageHeader
        title="Log Akses API Publik"
        subtitle="Riwayat permintaan ke API menggunakan API Key"
        action={
          <button onClick={() => fetchData(page)} className="btn-secondary">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-center">Method</th>
                <th className="table-header text-left">Path</th>
                <th className="table-header text-left hidden md:table-cell">API Key ID</th>
                <th className="table-header text-center hidden lg:table-cell">Status</th>
                <th className="table-header text-left hidden lg:table-cell">IP</th>
                <th className="table-header text-left">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState icon={BarChart3} title="Belum ada log API" description="Log akses API akan muncul di sini" />
                </td></tr>
              ) : data.map((log, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="table-cell text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-semibold ${METHOD_COLORS[log.method] || 'bg-slate-100 text-slate-600'}`}>
                      {log.method || 'GET'}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-700 max-w-xs truncate">{log.path || log.endpoint || '-'}</td>
                  <td className="table-cell hidden md:table-cell font-mono text-xs text-slate-500">{log.api_key_id || '-'}</td>
                  <td className="table-cell text-center hidden lg:table-cell">
                    {log.status_code && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        log.status_code < 300 ? 'bg-green-100 text-green-700' :
                        log.status_code < 400 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{log.status_code}</span>
                    )}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-xs text-slate-500 font-mono">{log.ip || '-'}</td>
                  <td className="table-cell text-xs text-slate-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString('id') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && data.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
