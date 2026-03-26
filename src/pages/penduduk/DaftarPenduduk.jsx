import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Filter, X } from 'lucide-react';
import pendudukService from '../../services/pendudukService';
import { PageHeader, Pagination, ConfirmDialog, Spinner, EmptyState } from '../../components/UI';
import { normPendudukList } from '../../utils/normalize';
import { toast } from 'react-toastify';

const DUSUN_OPTIONS = ['', 'Dusun Sudimoro', 'Dusun Sumberagung', 'Dusun Tambak'];
const AGAMA_OPTIONS = ['', 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const JK_OPTIONS = [{ val: '', label: 'Semua JK' }, { val: 'L', label: 'Laki-laki' }, { val: 'P', label: 'Perempuan' }];
const KAWIN_OPTIONS = ['', 'Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

export default function DaftarPenduduk() {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter]     = useState({ rt: '', rw: '', dusun: '', agama: '', jk: '', st_kawin: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15, ...filter };
      if (search.trim()) params.q = search.trim();
      const res = search.trim()
        ? await pendudukService.search({ q: search.trim(), page: pg, limit: 15 })
        : await pendudukService.getAll(params);
      const d = res.data?.data || res.data;
      setData(normPendudukList(Array.isArray(d) ? d : (d?.rows || d?.penduduk || [])));
      const meta = res.data?.meta || res.data?.pagination;
      setTotal(meta?.total || res.data?.total || 0);
      setTotalPages(meta?.totalPages || meta?.last_page || Math.ceil((meta?.total || 0) / 15) || 1);
    } catch {
      toast.error('Gagal memuat data penduduk');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  // FIX: satu useEffect yang jelas — hindari double fetch
  // fetchData berubah referensi ketika search/filter berubah → reset ke hal 1
  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Saat user klik pagination — fetch halaman yang diminta
  const handlePageChange = (pg) => {
    setPage(pg);
    fetchData(pg);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await pendudukService.delete(deleteTarget.NIK);
      toast.success(`Penduduk ${deleteTarget.NAMA} berhasil dihapus`);
      setDeleteTarget(null);
      fetchData(page);
    } catch {
      toast.error('Gagal menghapus data');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilter = () => setFilter({ rt: '', rw: '', dusun: '', agama: '', jk: '', st_kawin: '' });
  const hasFilter = Object.values(filter).some(v => v !== '');

  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        subtitle={`${total.toLocaleString('id')} jiwa terdaftar`}
        action={
          <button onClick={() => navigate('/penduduk/tambah')} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Penduduk
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="card mb-4">
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIK, atau No. KK..."
                className="input-field pl-9" />
            </div>
            <button type="submit" className="btn-primary">Cari</button>
          </form>
          <button onClick={() => setShowFilter(!showFilter)}
            className={`btn-secondary ${hasFilter ? 'text-teal-600' : ''}`}>
            <Filter className="w-4 h-4" />
            Filter {hasFilter && <span className="w-2 h-2 bg-teal-500 rounded-full" />}
          </button>
        </div>

        {showFilter && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select value={filter.jk} onChange={e => setFilter({ ...filter, jk: e.target.value })} className="input-field">
              {JK_OPTIONS.map(j => <option key={j.val} value={j.val}>{j.label}</option>)}
            </select>
            <input type="text" value={filter.rt} onChange={e => setFilter({ ...filter, rt: e.target.value })}
              placeholder="RT" className="input-field" />
            <input type="text" value={filter.rw} onChange={e => setFilter({ ...filter, rw: e.target.value })}
              placeholder="RW" className="input-field" />
            <select value={filter.dusun} onChange={e => setFilter({ ...filter, dusun: e.target.value })} className="input-field">
              <option value="">Semua Dusun</option>
              {DUSUN_OPTIONS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filter.agama} onChange={e => setFilter({ ...filter, agama: e.target.value })} className="input-field">
              <option value="">Semua Agama</option>
              {AGAMA_OPTIONS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filter.st_kawin} onChange={e => setFilter({ ...filter, st_kawin: e.target.value })} className="input-field">
              <option value="">Status Kawin</option>
              {KAWIN_OPTIONS.filter(Boolean).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            {hasFilter && (
              <button onClick={clearFilter} className="btn-secondary col-span-full md:col-span-1 text-red-500">
                <X className="w-4 h-4" /> Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-header text-left">NIK</th>
                <th className="table-header text-left">Nama</th>
                <th className="table-header text-left hidden md:table-cell">JK</th>
                <th className="table-header text-left hidden lg:table-cell">Tgl. Lahir</th>
                <th className="table-header text-left hidden md:table-cell">Dusun</th>
                <th className="table-header text-left hidden lg:table-cell">RT/RW</th>
                <th className="table-header text-left hidden xl:table-cell">Agama</th>
                <th className="table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={Search} title="Data tidak ditemukan" description="Coba ubah filter atau kata kunci pencarian" />
                </td></tr>
              ) : data.map((p, i) => (
                <tr key={p.NIK || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-slate-600">{p.NIK}</td>
                  <td className="table-cell font-medium text-slate-900">{p.NAMA}</td>
                  <td className="table-cell hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.JK === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {p.JK === 'L' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-slate-500">
                    {p.TGL_LAHIR ? new Date(p.TGL_LAHIR).toLocaleDateString('id') : '-'}
                  </td>
                  <td className="table-cell hidden md:table-cell text-slate-500 text-xs">{p.DUSUN || '-'}</td>
                  <td className="table-cell hidden lg:table-cell text-slate-500 font-mono text-xs">{p.RT}/{p.RW}</td>
                  <td className="table-cell hidden xl:table-cell text-slate-500 text-xs">{p.AGAMA || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => navigate(`/penduduk/${p.NIK}`)} title="Detail"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => navigate(`/penduduk/${p.NIK}/edit`)} title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} title="Hapus"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && data.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Penduduk"
        message={`Hapus data ${deleteTarget?.NAMA} (${deleteTarget?.NIK})? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
