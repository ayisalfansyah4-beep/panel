import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Users, ArrowDownLeft, ArrowUpRight,
  Wifi, WifiOff, RotateCcw, Unplug, Bot, TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { StatCard, PageLoading, PageHeader } from '../../components/UI';
import { ConfirmDialog } from '../../components/UI';
import botService from '../../services/botService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATE_MAP = {
  connected:    { label: 'Terhubung',       color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: <Wifi className="w-5 h-5" /> },
  connecting:   { label: 'Menghubungkan…',  color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400 animate-pulse', icon: <Wifi className="w-5 h-5" /> },
  qr_pending:   { label: 'Perlu Scan QR',   color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400 animate-pulse', icon: <Bot className="w-5 h-5" /> },
  disconnected: { label: 'Terputus',         color: 'bg-red-100 text-red-700',       dot: 'bg-red-500', icon: <WifiOff className="w-5 h-5" /> },
  error:        { label: 'Error',            color: 'bg-red-100 text-red-700',       dot: 'bg-red-500', icon: <WifiOff className="w-5 h-5" /> },
};

export default function BotDashboard() {
  const [status, setStatus]   = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, action: null });
  const [acting, setActing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const [stRes, stStats] = await Promise.allSettled([
        botService.getStatus(),
        botService.getStats(),
      ]);
      if (stRes.status === 'fulfilled')   setStatus(stRes.value.data);
      if (stStats.status === 'fulfilled') setStats(stStats.value.data);
    } catch {
      toast.error('Gagal memuat data bot');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const handleControl = async (action) => {
    setActing(true);
    try {
      if (action === 'restart') await botService.restartBot();
      else await botService.disconnectBot();
      toast.success(`Sinyal ${action} berhasil dikirim`);
      setTimeout(load, 2000);
    } catch {
      // interceptor handles toast
    } finally {
      setActing(false);
      setConfirm({ open: false, action: null });
    }
  };

  if (loading) return <PageLoading />;

  const bot   = status?.bot || {};
  const daily = status?.daily || {};
  const state = STATE_MAP[bot.state] || STATE_MAP.disconnected;

  // Daily chart
  const dailyData = stats?.daily || [];
  const chartData = {
    labels: dailyData.map(d => (d.date || '').slice(5)),
    datasets: [{
      label: 'Pesan',
      data: dailyData.map(d => d.total || 0),
      backgroundColor: 'rgba(20,184,166,0.8)',
      borderRadius: 4,
    }],
  };
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const intents = stats?.intentStats || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard Bot"
        subtitle="Monitor status dan statistik WhatsApp Bot Desa Sudimoro"
        action={
          <button onClick={load} className="btn-secondary">
            <RotateCcw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* Status Card */}
      <div className="card mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${state.color}`}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${state.dot}`} />
          {state.icon}
          {state.label}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">
            {bot.phone ? `Nomor: ${bot.phone}` : 'Nomor belum terdeteksi'}
          </p>
          {(bot.ai_provider || bot.ai_model) && (
            <p className="text-sm text-slate-500 mt-0.5 font-mono">
              AI: {bot.ai_provider || '—'} / {bot.ai_model || '—'}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setConfirm({ open: true, action: 'disconnect' })}
            className="btn-danger text-sm"
          >
            <Unplug className="w-4 h-4" /> Putuskan
          </button>
          <button
            onClick={() => setConfirm({ open: true, action: 'restart' })}
            className="btn-primary text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Restart Bot
          </button>
        </div>
      </div>

      {/* QR Code */}
      {bot.state === 'qr_pending' && bot.qr_code && (
        <div className="card mb-6 text-center">
          <p className="font-semibold text-slate-700 mb-3">Scan QR untuk Login Ulang</p>
          <div className="flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bot.qr_code)}&size=200x200`}
              alt="QR Code"
              className="border-2 border-teal-400 rounded-xl"
            />
          </div>
          <p className="text-sm text-slate-400 mt-3">WhatsApp → Perangkat Tertaut → Tautkan Perangkat</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={MessageSquare} label="Pesan Hari Ini" value={daily.today_messages ?? '—'} color="teal"  sub="Masuk + Keluar" />
        <StatCard icon={ArrowDownLeft} label="Pesan Masuk"   value={daily.today_in      ?? '—'} color="blue"   sub="Dari pengguna" />
        <StatCard icon={ArrowUpRight}  label="Pesan Keluar"  value={daily.today_out     ?? '—'} color="purple" sub="Balasan bot" />
        <StatCard icon={Users}         label="Pengguna Aktif" value={daily.active_users ?? '—'} color="orange" sub="Nomor unik hari ini" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-4">Aktivitas 7 Hari Terakhir</p>
          {dailyData.length > 0
            ? <div className="h-48"><Bar data={chartData} options={chartOpts} /></div>
            : <p className="text-sm text-slate-400 py-12 text-center">Belum ada data</p>
          }
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" /> Top Intent
          </p>
          {intents.length > 0 ? (
            <div className="space-y-3">
              {intents.slice(0, 7).map((item, i) => {
                const pct = intents[0]?.cnt ? Math.round(item.cnt / intents[0].cnt * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 min-w-[140px] truncate">{item.intent || '—'}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full">
                      <div className="h-2 bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-8 text-right">{item.cnt}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-12 text-center">Belum ada data intent</p>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.action === 'restart' ? 'Restart Bot?' : 'Putuskan Bot?'}
        message={confirm.action === 'restart'
          ? 'Bot akan di-restart. Proses ini memerlukan beberapa detik.'
          : 'Bot akan diputus dari WhatsApp. Anda perlu scan QR ulang untuk terhubung kembali.'}
        loading={acting}
        onConfirm={() => handleControl(confirm.action)}
        onCancel={() => setConfirm({ open: false, action: null })}
      />
    </div>
  );
}
