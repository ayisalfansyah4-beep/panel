import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { apbdesService } from '../../services/contentService';
import { PageHeader, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';

const JENIS   = ['Pendapatan', 'Belanja'];
const KATEGORI_MAP = {
  Pendapatan: ['Dana Desa', 'ADD', 'PAD', 'Bagi Hasil Pajak', 'Bantuan Provinsi', 'Bantuan Kabupaten', 'Lainnya'],
  Belanja:    ['Bidang Penyelenggaraan Pemerintahan', 'Bidang Pembangunan', 'Bidang Pemberdayaan Masyarakat', 'Bidang Pembinaan', 'Bidang Penanggulangan Bencana', 'Lainnya'],
};
const INIT = { jenis: 'Pendapatan', kategori: 'Dana Desa', uraian: '', anggaran: '', realisasi: '', tahun: new Date().getFullYear() };

function fRp(n) {
  if (!n && n !== 0) return '—';
  const num = parseFloat(n);
  if (num >= 1e9) return 'Rp ' + (num/1e9).toFixed(2) + 'M';
  if (num >= 1e6) return 'Rp ' + (num/1e6).toFixed(1) + 'jt';
  return 'Rp ' + num.toLocaleString('id');
}

export default function APBDes() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tahunList, setTahunList] = useState([]);
  const [tahun, setTahun]         = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dataRes, tahunRes] = await Promise.allSettled([
        apbdesService.getAll({ tahun }),
        apbdesService.getTahun(),
      ]);
      if (dataRes.status === 'fulfilled') {
        const d = dataRes.value.data?.data || dataRes.value.data;
        setData(Array.isArray(d) ? d : []);
      }
      if (tahunRes.status === 'fulfilled') {
        const t = tahunRes.value.data?.data || tahunRes.value.data;
        setTahunList(Array.isArray(t) ? t : [tahun]);
      }
    } catch {
      toast.error('Gagal memuat data APBDes');
    } finally {
      setLoading(false);
    }
  }, [tahun]);

  useEffect(() => { fetchData(); }, [tahun]);

  const openAdd  = () => { setEditItem(null); setForm({...INIT, tahun}); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ jenis: item.jenis, kategori: item.kategori, uraian: item.uraian || '',
              anggaran: item.anggaran || '', realisasi: item.realisasi || '', tahun: item.tahun || tahun });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.uraian || !form.anggaran) { toast.error('Uraian dan anggaran wajib diisi'); return; }
    setFormLoading(true);
    try {
      const payload = { ...form, anggaran: parseFloat(form.anggaran), realisasi: parseFloat(form.realisasi || 0) };
      if (editItem) { await apbdesService.update(editItem.id, payload); toast.success('Data APBDes diperbarui'); }
      else          { await apbdesService.create(payload); toast.success('Data APBDes ditambahkan'); }
      setShowModal(false); fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await apbdesService.delete(deleteTarget.id); toast.success('Data dihapus'); setDeleteTarget(null); fetchData(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleteLoading(false); }
  };

  // Summary
  const pendapatan = data.filter(d => d.jenis === 'Pendapatan');
  const belanja    = data.filter(d => d.jenis === 'Belanja');
  const totPend    = pendapatan.reduce((s, d) => s + parseFloat(d.anggaran || 0), 0);
  const totBel     = belanja.reduce((s, d) => s + parseFloat(d.anggaran || 0), 0);
  const totRealPend = pendapatan.reduce((s, d) => s + parseFloat(d.realisasi || 0), 0);
  const totRealBel  = belanja.reduce((s, d) => s + parseFloat(d.realisasi || 0), 0);

  return (
    <div>
      <PageHeader
        title="Anggaran Pendapatan & Belanja Desa"
        subtitle="Transparansi keuangan desa"
        action={
          <div className="flex gap-2">
            <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="input-field w-28">
              {(tahunList.length ? tahunList : [tahun]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Tambah</button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Pendapatan</p>
            <p className="text-lg font-bold text-slate-900">{fRp(totPend)}</p>
            <p className="text-xs text-slate-400">Realisasi: {fRp(totRealPend)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Belanja</p>
            <p className="text-lg font-bold text-slate-900">{fRp(totBel)}</p>
            <p className="text-xs text-slate-400">Realisasi: {fRp(totRealBel)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${totPend - totBel >= 0 ? 'bg-teal-50' : 'bg-red-50'}`}>
            <Wallet className={`w-6 h-6 ${totPend - totBel >= 0 ? 'text-teal-600' : 'text-red-600'}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Saldo</p>
            <p className={`text-lg font-bold ${totPend - totBel >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{fRp(totPend - totBel)}</p>
            <p className="text-xs text-slate-400">Tahun {tahun}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wallet} title="Belum ada data APBDes"
            description={`Tambahkan data anggaran tahun ${tahun}`}
            action={<button onClick={openAdd} className="btn-primary">Tambah Data</button>} />
        </div>
      ) : (
        ['Pendapatan', 'Belanja'].map(jenis => {
          const items = data.filter(d => d.jenis === jenis);
          if (!items.length) return null;
          const totalAng = items.reduce((s, d) => s + parseFloat(d.anggaran || 0), 0);
          return (
            <div key={jenis} className="card p-0 overflow-hidden mb-4">
              <div className={`px-5 py-3 flex items-center justify-between ${jenis === 'Pendapatan' ? 'bg-green-50 border-b border-green-100' : 'bg-orange-50 border-b border-orange-100'}`}>
                <h3 className={`font-bold text-sm ${jenis === 'Pendapatan' ? 'text-green-800' : 'text-orange-800'}`}>
                  {jenis === 'Pendapatan' ? '📈' : '📉'} {jenis}
                </h3>
                <span className={`text-sm font-bold ${jenis === 'Pendapatan' ? 'text-green-700' : 'text-orange-700'}`}>{fRp(totalAng)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="table-header text-left">Uraian</th>
                      <th className="table-header text-left hidden md:table-cell">Kategori</th>
                      <th className="table-header text-right">Anggaran</th>
                      <th className="table-header text-right hidden lg:table-cell">Realisasi</th>
                      <th className="table-header text-right hidden lg:table-cell">%</th>
                      <th className="table-header text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const pct = item.anggaran > 0 ? Math.round((item.realisasi / item.anggaran) * 100) : 0;
                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="table-cell font-medium">{item.uraian}</td>
                          <td className="table-cell hidden md:table-cell text-slate-500 text-xs">{item.kategori}</td>
                          <td className="table-cell text-right font-mono text-sm">{fRp(item.anggaran)}</td>
                          <td className="table-cell text-right hidden lg:table-cell font-mono text-sm text-slate-500">{fRp(item.realisasi)}</td>
                          <td className="table-cell text-right hidden lg:table-cell">
                            <span className={`text-xs font-bold ${pct >= 100 ? 'text-green-600' : pct >= 50 ? 'text-blue-600' : 'text-slate-500'}`}>{pct}%</span>
                          </td>
                          <td className="table-cell text-center">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTarget(item)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Form Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Data APBDes' : 'Tambah Data APBDes'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Jenis</label>
              <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value, kategori: KATEGORI_MAP[e.target.value][0]})} className="input-field">
                {JENIS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tahun</label>
              <input type="number" value={form.tahun} onChange={e => setForm({...form, tahun: parseInt(e.target.value)})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="input-field">
              {(KATEGORI_MAP[form.jenis] || []).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Uraian <span className="text-red-500">*</span></label>
            <input type="text" value={form.uraian} onChange={e => setForm({...form, uraian: e.target.value})}
              placeholder="Contoh: Dana Desa Reguler..." className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Anggaran (Rp) <span className="text-red-500">*</span></label>
              <input type="number" value={form.anggaran} onChange={e => setForm({...form, anggaran: e.target.value})}
                placeholder="0" className="input-field" required />
            </div>
            <div>
              <label className="label">Realisasi (Rp)</label>
              <input type="number" value={form.realisasi} onChange={e => setForm({...form, realisasi: e.target.value})}
                placeholder="0" className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? <><Spinner size="sm" /> Menyimpan...</> : editItem ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Hapus Data APBDes"
        message={`Hapus data "${deleteTarget?.uraian}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
