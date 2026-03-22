import { useState, useEffect } from 'react';
import { Users, FileText, Printer, Activity } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend
} from 'chart.js';
import adminService from '../services/adminService';
import pendudukService from '../services/pendudukService';
import { StatCard, PageLoading } from '../components/UI';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } },
  cutout: '65%',
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [statistik, setStatistik] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading]     = useState(true);

  // FIX 3: Hanya satu useEffect, tidak ada double fetch
=======
  const [loading, setLoading] = useState(true);

>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, statRes] = await Promise.allSettled([
          adminService.getDashboard(),
          pendudukService.getStatistik(),
        ]);
        if (dashRes.status === 'fulfilled') {
          setDashboard(dashRes.value.data?.data || dashRes.value.data);
        }
        if (statRes.status === 'fulfilled') {
          setStatistik(statRes.value.data?.data || statRes.value.data);
        }
      } catch {
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoading />;

<<<<<<< HEAD
  // FIX 3: Pakai field yang benar sesuai backend:
  //   per_pkrjaan  (bukan per_pekerjaan)
  //   laki_laki / perempuan langsung dari statistik (bukan per_jk array)
  const agamaData = statistik?.per_agama ? {
    labels: statistik.per_agama.map(a => a.label || a.AGAMA),
    datasets: [{
      data: statistik.per_agama.map(a => a.jumlah),
=======
  // Chart data
  const agamaData = statistik?.per_agama ? {
    labels: statistik.per_agama.map(a => a.AGAMA || a.label),
    datasets: [{
      data: statistik.per_agama.map(a => a.jumlah || a.count),
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
      backgroundColor: ['#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'],
    }]
  } : null;

<<<<<<< HEAD
  // Bangun jenis kelamin dari field summary langsung (bukan per_jk yang tidak ada)
  const jkData = (statistik?.laki_laki != null && statistik?.perempuan != null) ? {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [{
      data: [statistik.laki_laki, statistik.perempuan],
=======
  const jkData = statistik?.per_jk ? {
    labels: statistik.per_jk.map(j => j.JK === 'L' ? 'Laki-laki' : j.JK === 'P' ? 'Perempuan' : j.JK),
    datasets: [{
      data: statistik.per_jk.map(j => j.jumlah || j.count),
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
      backgroundColor: ['#3B82F6', '#EC4899'],
    }]
  } : null;

<<<<<<< HEAD
  // FIX 3: per_pkrjaan (bukan per_pekerjaan)
  const pkrjaanData = statistik?.per_pkrjaan ? {
    labels: statistik.per_pkrjaan.slice(0, 8).map(p => p.label),
    datasets: [{
      label: 'Penduduk',
      data: statistik.per_pkrjaan.slice(0, 8).map(p => p.jumlah),
=======
  const pkrjaanData = statistik?.per_pekerjaan ? {
    labels: statistik.per_pekerjaan.slice(0, 8).map(p => p.PKRJAAN || p.label),
    datasets: [{
      label: 'Penduduk',
      data: statistik.per_pekerjaan.slice(0, 8).map(p => p.jumlah || p.count),
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
      backgroundColor: '#14B8A6',
      borderRadius: 6,
    }]
  } : null;

<<<<<<< HEAD
  // FIX 3: Backend return log_surat_terbaru (bukan log_terbaru)
  const logs = dashboard?.log_surat_terbaru || dashboard?.log_terbaru || [];

  // FIX 3: "Log Hari Ini" → pakai panjang array surat_hari_ini
  const logHariIni = Array.isArray(dashboard?.surat_hari_ini)
    ? dashboard.surat_hari_ini.reduce((acc, s) => acc + (s.jumlah || 0), 0)
    : logs.length;
=======
  const logs = dashboard?.log_terbaru || dashboard?.recent_logs || [];
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ringkasan Sistem Informasi Desa Sudimoro</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
<<<<<<< HEAD
        <StatCard icon={Users}    label="Total Penduduk" value={dashboard?.total_penduduk?.toLocaleString('id')} color="teal"   sub="Jiwa terdaftar" />
        <StatCard icon={FileText} label="Total Surat"    value={dashboard?.total_surat?.toLocaleString('id')}    color="blue"   sub="Surat diproses" />
        <StatCard icon={Printer}  label="Total Cetak"    value={dashboard?.total_cetak?.toLocaleString('id')}    color="purple" sub="Dokumen dicetak" />
        <StatCard icon={Activity} label="Surat Hari Ini" value={logHariIni}                                       color="orange" sub="Aktivitas hari ini" />
=======
        <StatCard icon={Users} label="Total Penduduk" value={dashboard?.total_penduduk?.toLocaleString('id')} color="teal" sub="Jiwa terdaftar" />
        <StatCard icon={FileText} label="Total Surat" value={dashboard?.total_surat?.toLocaleString('id')} color="blue" sub="Surat diproses" />
        <StatCard icon={Printer} label="Total Cetak" value={dashboard?.total_cetak?.toLocaleString('id')} color="purple" sub="Dokumen dicetak" />
        <StatCard icon={Activity} label="Log Hari Ini" value={dashboard?.log_hari_ini ?? logs.length} color="orange" sub="Aktivitas sistem" />
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
<<<<<<< HEAD
=======
        {/* Pekerjaan Bar Chart */}
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Penduduk per Pekerjaan</h3>
          {pkrjaanData ? (
            <div style={{ height: 220 }}>
              <Bar data={pkrjaanData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Data tidak tersedia</div>
          )}
        </div>

<<<<<<< HEAD
=======
        {/* Per Agama Doughnut */}
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Agama</h3>
          {agamaData ? (
            <div style={{ height: 220 }}>
              <Doughnut data={agamaData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Data tidak tersedia</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
<<<<<<< HEAD
=======
        {/* Jenis Kelamin */}
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Jenis Kelamin</h3>
          {jkData ? (
            <div style={{ height: 180 }}>
              <Doughnut data={jkData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">Data tidak tersedia</div>
          )}
        </div>

<<<<<<< HEAD
=======
        {/* Log Terbaru */}
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Log Aktivitas Terbaru</h3>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 8).map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium flex-shrink-0 ${
<<<<<<< HEAD
                    log.method === 'GET'    ? 'bg-blue-50 text-blue-700' :
                    log.method === 'POST'   ? 'bg-green-50 text-green-700' :
=======
                    log.method === 'GET' ? 'bg-blue-50 text-blue-700' :
                    log.method === 'POST' ? 'bg-green-50 text-green-700' :
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
                    log.method === 'DELETE' ? 'bg-red-50 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{log.method || 'GET'}</span>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <p className="text-sm text-slate-700 font-mono truncate">{log.path || log.endpoint || log.jenis || log.action || '-'}</p>
=======
                    <p className="text-sm text-slate-700 font-mono truncate">{log.path || log.endpoint || log.action || '-'}</p>
>>>>>>> d5aa4670c415cdab5784b897c9b42241aaf74851
                    <p className="text-xs text-slate-400 mt-0.5">{log.created_at ? new Date(log.created_at).toLocaleString('id') : '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">Belum ada log aktivitas</div>
          )}
        </div>
      </div>
    </div>
  );
}
