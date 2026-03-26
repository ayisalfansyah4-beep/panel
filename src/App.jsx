import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Penduduk
import DaftarPenduduk from './pages/penduduk/DaftarPenduduk';
import FormPenduduk from './pages/penduduk/FormPenduduk';
import DetailPenduduk from './pages/penduduk/DetailPenduduk';

// Surat
import JenisSurat from './pages/surat/JenisSurat';
import GenerateSurat from './pages/surat/GenerateSurat';
import RiwayatSurat from './pages/surat/RiwayatSurat';

// Cetak
import UploadPrint from './pages/cetak/UploadPrint';
import LogCetak from './pages/cetak/LogCetak';

// Konten
import Kegiatan from './pages/kegiatan/Kegiatan';
import Pengumuman from './pages/pengumuman/Pengumuman';
import APBDes from './pages/apbdes/APBDes';
import ProfilDesa from './pages/profil/ProfilDesa';
import Berita from './pages/berita/Berita';

// Pengaturan
import ApiKeys from './pages/pengaturan/ApiKeys';
import ApiLogs from './pages/pengaturan/ApiLogs';
import NomorSurat from './pages/pengaturan/NomorSurat';

// Bot
import BotDashboard from './pages/bot/BotDashboard';
import BotMessages from './pages/bot/BotMessages';
import BotContacts from './pages/bot/BotContacts';
import BotMenu from './pages/bot/BotMenu';
import BotBroadcast from './pages/bot/BotBroadcast';
import BotSettings from './pages/bot/BotSettings';

/* ========================
   LOADING COMPONENT
======================== */
function AppLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-500">Memuat aplikasi...</p>
    </div>
  );
}

/* ========================
   ROUTE GUARDS (FIXED)
======================== */

function PrivateRoute() {
  const auth = useAuth() || {};
  const { isAuthenticated, loading } = auth;

  if (loading) return <AppLoading />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const auth = useAuth() || {};
  const { isAuthenticated, loading } = auth;

  if (loading) return <AppLoading />;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

/* ========================
   404 PAGE
======================== */
function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-semibold text-slate-600">
        404 - Halaman tidak ditemukan
      </h1>
    </div>
  );
}

/* ========================
   ROUTES
======================== */

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* PRIVATE */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Penduduk */}
          <Route path="penduduk">
            <Route index element={<DaftarPenduduk />} />
            <Route path="tambah" element={<FormPenduduk />} />
            <Route path=":nik" element={<DetailPenduduk />} />
            <Route path=":nik/edit" element={<FormPenduduk />} />
          </Route>

          {/* Surat */}
          <Route path="surat">
            <Route path="jenis" element={<JenisSurat />} />
            <Route path="generate" element={<GenerateSurat />} />
            <Route path="riwayat" element={<RiwayatSurat />} />
          </Route>

          {/* Cetak */}
          <Route path="cetak">
            <Route path="upload" element={<UploadPrint />} />
            <Route path="log" element={<LogCetak />} />
          </Route>

          {/* Konten */}
          <Route path="kegiatan" element={<Kegiatan />} />
          <Route path="pengumuman" element={<Pengumuman />} />
          <Route path="apbdes" element={<APBDes />} />
          <Route path="profil" element={<ProfilDesa />} />
          <Route path="berita" element={<Berita />} />

          {/* Pengaturan */}
          <Route path="pengaturan">
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="api-logs" element={<ApiLogs />} />
            <Route path="nomor-surat" element={<NomorSurat />} />
          </Route>

          {/* Bot */}
          <Route path="bot">
            <Route index element={<BotDashboard />} />
            <Route path="messages" element={<BotMessages />} />
            <Route path="contacts" element={<BotContacts />} />
            <Route path="menu" element={<BotMenu />} />
            <Route path="broadcast" element={<BotBroadcast />} />
            <Route path="settings" element={<BotSettings />} />
          </Route>

          {/* 404 inside layout */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* fallback global */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

/* ========================
   APP ROOT
======================== */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          toastClassName="!font-sans !text-sm"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}