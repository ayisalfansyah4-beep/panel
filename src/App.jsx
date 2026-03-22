import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import DaftarPenduduk from './pages/penduduk/DaftarPenduduk';
import FormPenduduk from './pages/penduduk/FormPenduduk';
import DetailPenduduk from './pages/penduduk/DetailPenduduk';

import JenisSurat from './pages/surat/JenisSurat';
import GenerateSurat from './pages/surat/GenerateSurat';
import RiwayatSurat from './pages/surat/RiwayatSurat';

import UploadPrint from './pages/cetak/UploadPrint';
import LogCetak from './pages/cetak/LogCetak';

import ApiKeys from './pages/pengaturan/ApiKeys';
import ApiLogs from './pages/pengaturan/ApiLogs';
import NomorSurat from './pages/pengaturan/NomorSurat';

// TTE pages
import AntrianTTE from './pages/tte/AntrianTTE';
import RiwayatTTE from './pages/tte/RiwayatTTE';

// Bot pages
import BotDashboard from './pages/bot/BotDashboard';
import BotMessages  from './pages/bot/BotMessages';
import BotContacts  from './pages/bot/BotContacts';
import BotMenu      from './pages/bot/BotMenu';
import BotBroadcast from './pages/bot/BotBroadcast';
import BotSettings  from './pages/bot/BotSettings';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="penduduk" element={<DaftarPenduduk />} />
        <Route path="penduduk/tambah" element={<FormPenduduk />} />
        <Route path="penduduk/:nik" element={<DetailPenduduk />} />
        <Route path="penduduk/:nik/edit" element={<FormPenduduk />} />
        <Route path="surat/jenis" element={<JenisSurat />} />
        <Route path="surat/generate" element={<GenerateSurat />} />
        <Route path="surat/riwayat" element={<RiwayatSurat />} />
        <Route path="cetak/upload" element={<UploadPrint />} />
        <Route path="cetak/log" element={<LogCetak />} />
        <Route path="pengaturan/api-keys" element={<ApiKeys />} />
        <Route path="pengaturan/api-logs" element={<ApiLogs />} />
        <Route path="pengaturan/nomor-surat" element={<NomorSurat />} />

        {/* ── TTE ── */}
        <Route path="tte/antrian" element={<AntrianTTE />} />
        <Route path="tte/riwayat" element={<RiwayatTTE />} />

        {/* ── WhatsApp Bot ── */}
        <Route path="bot"               element={<BotDashboard />} />
        <Route path="bot/messages"      element={<BotMessages />} />
        <Route path="bot/contacts"      element={<BotContacts />} />
        <Route path="bot/menu"          element={<BotMenu />} />
        <Route path="bot/broadcast"     element={<BotBroadcast />} />
        <Route path="bot/settings"      element={<BotSettings />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
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
