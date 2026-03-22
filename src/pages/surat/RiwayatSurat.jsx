import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';
import suratService from '../../services/suratService';
import { PageHeader, Pagination, EmptyState, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';

export default function RiwayatSurat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ nik: '', jenis: '', dari: '', sampai: '' });

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15, ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) };
      const res = await suratService.getRiwayat(params);
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : (d?.rows || d?.riwayat || []));
      const meta = res.data?.meta || res.data?.pagination;
      setTotalPages(meta?.totalPages || meta?.last_page || 1);
    } catch {
      toast.error('Gagal memuat riwayat surat');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(page); }, [page]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1);
  };

  return (
    <div>
      <PageHeader title="Riwayat Surat" subtitle="Semua surat yang pernah digenerate" />

      <div className="card mb-4">
        <form onSubmit={handleFilter} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="text" value={filter.nik} onChange={e => setFilter({ ...filter, nik: e.target.value })}
            placeholder="Filter NIK..." className="input-field font-mono" />
          <input type="text" value={filter.jenis} onChange={e => setFilter({ ...filter, jenis: e.target.value })}
            placeholder="Jenis surat..." className="input-field" />
          <input type="date" value={filter.dari} onChange={e => setFilter({ ...filter, dari: e.target.value })} className="input-field" />
          <div className="flex gap-2">
            <input type="date" value={filter.sampai} onChange={e => setFilter({ ...filter, sampai: e.target.value })} className="input-field flex-1" />
            <button type="submit" className="btn-primary flex-shrink-0"><Search className="w-4 h-4" /></button>
          </div>
        </form>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">No. Surat</th>
                <th className="table-header text-left">Jenis</th>
                <th className="table-header text-left">NIK</th>
                <th className="table-header text-left hidden md:table-cell">Nama</th>
                <th className="table-header text-left hidden lg:table-cell">Tanggal</th>
                <th className="table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState icon={FileText} title="Belum ada riwayat surat" description="Surat yang digenerate akan muncul di sini" />
                </td></tr>
              ) : data.map((s, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-xs">{s.nomor_surat || '-'}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {s.jenis_surat || s.jenis || '-'}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-600">{s.nik || '-'}</td>
                  <td className="table-cell hidden md:table-cell font-medium">{s.nama || '-'}</td>
                  <td className="table-cell hidden lg:table-cell text-slate-500 text-xs">
                    {s.created_at ? new Date(s.created_at).toLocaleString('id') : '-'}
                  </td>
                  <td className="table-cell text-center">
                    {s.pdf_url ? (
                      <a href={s.pdf_url} target="_blank" rel="noreferrer"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-teal-600 hover:bg-teal-50 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    ) : <span className="text-slate-300">—</span>}
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
