import { useState, useEffect, useCallback } from 'react';
import { History, Search, Download, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import tteService from '../../services/tteService';
import { PageHeader, Spinner, EmptyState, Pagination, Modal } from '../../components/UI';
import { toast } from 'react-toastify';

const STATUS_BADGE = {
  selesai : { label: 'Selesai',  cls: 'bg-green-50 text-green-700 ring-green-200', Icon: CheckCircle },
  ditolak : { label: 'Ditolak',  cls: 'bg-red-50   text-red-700   ring-red-200',   Icon: XCircle    },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { label: status || '—', cls: 'bg-slate-50 text-slate-600 ring-slate-200', Icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${s.cls}`}>
      {s.Icon && <s.Icon className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

export default function RiwayatTTE() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter]       = useState({ q: '', status: '', dari: '', sampai: '' });
  const [detail, setDetail]       = useState(null);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pg, limit: 15,
        ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)),
      };
      const res = await tteService.getRiwayat(params);
      const d   = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : (d?.rows || []));
      const meta = res.data?.meta || res.data?.pagination;
      setTotalPages(meta?.totalPages || meta?.last_page || 1);
    } catch {
      toast.error('Gagal memuat riwayat TTE');
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
      <PageHeader
        title="Riwayat TTE"
        subtitle="Dokumen yang sudah selesai diproses tanda tangan elektronik"
      />

      {/* Filter */}
      <div className="card mb-4">
        <form onSubmit={handleFilter} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={filter.q}
            onChange={e => setFilter({ ...filter, q: e.target.value })}
            placeholder="Cari dokumen / pemohon..."
            className="input-field"
          />
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="input-field"
          >
            <option value="">Semua Status</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <input
            type="date"
            value={filter.dari}
            onChange={e => setFilter({ ...filter, dari: e.target.value })}
            className="input-field"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={filter.sampai}
              onChange={e => setFilter({ ...filter, sampai: e.target.value })}
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary flex-shrink-0">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">Dokumen</th>
                <th className="table-header text-left hidden md:table-cell">Pemohon</th>
                <th className="table-header text-left hidden lg:table-cell">Tanggal Selesai</th>
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
                      icon={History}
                      title="Belum ada riwayat TTE"
                      description="Dokumen yang sudah selesai diproses akan muncul di sini"
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
                  <td className="table-cell hidden md:table-cell text-sm text-slate-600">
                    {item.nama_pemohon || item.pemohon || '—'}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-xs text-slate-500">
                    {item.updated_at ? new Date(item.updated_at).toLocaleString('id') : '—'}
                  </td>
                  <td className="table-cell text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Lihat Detail"
                        onClick={() => setDetail(item)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.pdf_url && (
                        <a
                          href={item.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Download PDF"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-teal-600 hover:bg-teal-50 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
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

      {/* Modal Detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Riwayat TTE" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Judul Dokumen', detail.judul || detail.nama_dokumen],
                ['Nomor Surat',   detail.nomor_surat || detail.kode],
                ['Pemohon',       detail.nama_pemohon || detail.pemohon],
                ['Status',        <StatusBadge key="s" status={detail.status} />],
                ['Tanggal Masuk', detail.created_at ? new Date(detail.created_at).toLocaleString('id') : '—'],
                ['Tanggal Selesai', detail.updated_at ? new Date(detail.updated_at).toLocaleString('id') : '—'],
                ['TTD Ketua',     detail.ttd_ketua     ? '✅ Sudah' : '❌ Belum/Tidak'],
                ['TTD Sekretaris',detail.ttd_sekretaris ? '✅ Sudah' : '❌ Belum/Tidak'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="font-medium text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {detail.catatan && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Catatan</p>
                <p className="text-sm text-slate-700">{detail.catatan}</p>
              </div>
            )}
            {detail.pdf_url && (
              <a href={detail.pdf_url} target="_blank" rel="noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Download PDF Bertanda Tangan
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
