import { useState, useEffect, useCallback } from 'react';
import { Hash, RotateCcw } from 'lucide-react';
import adminService from '../../services/adminService';
import { PageHeader, ConfirmDialog, EmptyState, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

export default function NomorSurat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getNomorSurat();
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Gagal memuat data nomor surat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await adminService.resetNomorSurat(resetTarget.jenis, resetTarget.tahun);
      toast.success(`Counter nomor surat ${resetTarget.jenis}/${resetTarget.tahun} berhasil direset`);
      setResetTarget(null);
      fetchData();
    } catch {
      toast.error('Gagal mereset nomor surat');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Nomor Surat"
        subtitle="Counter penomoran surat otomatis per jenis dan tahun"
      />

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Spinner className="mx-auto" /></div>
        ) : data.length === 0 ? (
          <EmptyState icon={Hash} title="Belum ada counter nomor surat"
            description="Counter akan muncul setelah surat pertama digenerate" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header text-left">Jenis Surat</th>
                  <th className="table-header text-center">Tahun</th>
                  <th className="table-header text-center">Counter Saat Ini</th>
                  <th className="table-header text-left hidden md:table-cell">Format Terakhir</th>
                  <th className="table-header text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-mono font-semibold">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="table-cell text-center font-semibold text-slate-700">{item.tahun}</td>
                    <td className="table-cell text-center">
                      <span className="text-2xl font-bold text-slate-900">{item.counter || item.nomor || 0}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell font-mono text-xs text-slate-500">
                      {item.format_terakhir || item.last_number || '-'}
                    </td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => setResetTarget(item)}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!resetTarget}
        title="Reset Counter Nomor Surat"
        message={`Reset counter nomor surat jenis "${resetTarget?.jenis}" tahun ${resetTarget?.tahun}? Penomoran akan dimulai dari 1 lagi.`}
        onConfirm={handleReset}
        onCancel={() => setResetTarget(null)}
        loading={resetLoading}
      />
    </div>
  );
}
