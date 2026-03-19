import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, FileText, User } from 'lucide-react';
import pendudukService from '../../services/pendudukService';
import suratService from '../../services/suratService';
import { PageLoading, PageHeader } from '../../components/UI';
import { normPenduduk } from '../../utils/normalize';
import { toast } from 'react-toastify';

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    <p className="text-sm text-slate-900 font-medium mt-0.5">{value || '—'}</p>
  </div>
);

export default function DetailPenduduk() {
  const { nik } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.allSettled([
          pendudukService.getByNik(nik),
          suratService.getRiwayat({ nik }),
        ]);
        if (pRes.status === 'fulfilled') setData(normPenduduk(pRes.value.data?.data || pRes.value.data));
        if (rRes.status === 'fulfilled') {
          const d = rRes.value.data?.data || rRes.value.data;
          setRiwayat(Array.isArray(d) ? d : (d?.rows || d?.riwayat || []));
        }
      } catch {
        toast.error('Gagal memuat data penduduk');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nik]);

  if (loading) return <PageLoading />;
  if (!data) return <div className="card text-center py-12 text-slate-500">Data tidak ditemukan</div>;

  return (
    <div>
      <PageHeader
        title={data.NAMA}
        subtitle={`NIK: ${data.NIK}`}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate('/penduduk')} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button onClick={() => navigate(`/penduduk/${nik}/edit`)} className="btn-primary">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Avatar & Identitas Singkat */}
        <div className="card flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-lg">{data.NAMA}</h2>
          <p className="text-sm text-slate-500 font-mono mt-1">{data.NIK}</p>
          <div className="flex gap-2 mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data.JK === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
            }`}>
              {data.JK === 'L' ? 'Laki-laki' : 'Perempuan'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {data.AGAMA}
            </span>
          </div>
          <div className="w-full mt-6 pt-4 border-t border-slate-100 space-y-2 text-left">
            <InfoItem label="Status Kawin" value={data.ST_KAWIN} />
            <InfoItem label="Hub. dalam KK" value={data.SHDRT} />
            <InfoItem label="Pekerjaan" value={data.PKRJAAN} />
            <InfoItem label="Pendidikan" value={data.PDDKN} />
          </div>
        </div>

        {/* Detail Data */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Data Kelahiran</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tempat Lahir" value={data.TMP_LAHIR} />
              <InfoItem label="Tanggal Lahir" value={data.TGL_LAHIR ? new Date(data.TGL_LAHIR).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
              <InfoItem label="Golongan Darah" value={data.GDR || 'Tidak Diketahui'} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Data Keluarga</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="No. Kartu Keluarga" value={data.NOKK} />
              <InfoItem label="Nama Kepala KK" value={data.NMKK} />
              <InfoItem label="Nama Ibu" value={data.IBU} />
              <InfoItem label="Nama Ayah" value={data.AYAH} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Alamat</h3>
            <div className="grid grid-cols-3 gap-4">
              <InfoItem label="Dusun" value={data.DUSUN} />
              <InfoItem label="RT" value={data.RT} />
              <InfoItem label="RW" value={data.RW} />
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Surat */}
      <div className="card mt-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <FileText className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-slate-800">Riwayat Surat ({riwayat.length})</h3>
        </div>
        {riwayat.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">Belum ada surat yang dibuat untuk penduduk ini</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header text-left">No. Surat</th>
                  <th className="table-header text-left">Jenis</th>
                  <th className="table-header text-left">Tanggal</th>
                  <th className="table-header text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs">{s.nomor_surat || '-'}</td>
                    <td className="table-cell">{s.jenis_surat || s.jenis || '-'}</td>
                    <td className="table-cell text-slate-500">{s.created_at ? new Date(s.created_at).toLocaleDateString('id') : '-'}</td>
                    <td className="table-cell text-center">
                      {s.pdf_url && (
                        <a href={s.pdf_url} target="_blank" rel="noreferrer"
                          className="text-teal-600 hover:text-teal-700 text-xs font-medium">
                          Unduh PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
