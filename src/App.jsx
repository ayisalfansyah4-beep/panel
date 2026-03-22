import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Penduduk
import DaftarPenduduk from './pages/penduduk/DaftarPenduduk';
import FormPenduduk   from './pages/penduduk/FormPenduduk';
import DetailPenduduk from './pages/penduduk/DetailPenduduk';

// Surat
import JenisSurat    from './pages/surat/JenisSurat';
import GenerateSurat from './pages/surat/GenerateSurat';
import RiwayatSurat  from './pages/surat/RiwayatSurat';

// Cetak
import UploadPrint from './pages/cetak/UploadPrint';
import LogCetak    from './pages/cetak/LogCetak';

// Konten Oromid (v3)
import Kegiatan   from './pages/kegiatan/Kegiatan';
import Pengumuman from './pages/pengumuman/Pengumuman';
import APBDes     from './pages/apbdes/APBDes';
import ProfilDesa from './pages/profil/ProfilDesa';

// Pengaturan
import ApiKeys    from './pages/pengaturan/ApiKeys';
import ApiLogs    from './pages/pengaturan/ApiLogs';
import NomorSurat    from './pages/pengaturan/NomorSurat';
import ManajemenUser from './pages/pengaturan/ManajemenUser';

// TTE
import TTEDaftar from './pages/tte/TTEDaftar';
import { TTEUpload, TTEDetail } from './pages/tte/TTEForm';
import TTEConfig  from './pages/tte/TTEConfig';
import GantiPassword from './pages/pengaturan/GantiPassword';

// WhatsApp Bot
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

        {/* Penduduk */}
        <Route path="penduduk"           element={<DaftarPenduduk />} />
        <Route path="penduduk/tambah"    element={<FormPenduduk />} />
        <Route path="penduduk/:nik"      element={<DetailPenduduk />} />
        <Route path="penduduk/:nik/edit" element={<FormPenduduk />} />

        {/* Surat */}
        <Route path="surat/jenis"    element={<JenisSurat />} />
        <Route path="surat/generate" element={<GenerateSurat />} />
        <Route path="surat/riwayat"  element={<RiwayatSurat />} />

        {/* Cetak */}
        <Route path="cetak/upload" element={<UploadPrint />} />
        <Route path="cetak/log"    element={<LogCetak />} />

        {/* Konten Oromid */}
        <Route path="kegiatan"   element={<Kegiatan />} />
        <Route path="pengumuman" element={<Pengumuman />} />
        <Route path="apbdes"     element={<APBDes />} />
        <Route path="profil"     element={<ProfilDesa />} />

        {/* Pengaturan */}
        <Route path="pengaturan/api-keys"    element={<ApiKeys />} />
        <Route path="pengaturan/api-logs"    element={<ApiLogs />} />
        <Route path="pengaturan/nomor-surat" element={<NomorSurat />} />
        <Route path="pengaturan/users"       element={<ManajemenUser />} />
        <Route path="pengaturan/password"    element={<GantiPassword />} />

        {/* TTE */}
        <Route path="tte"           element={<TTEDaftar />} />
        <Route path="tte/upload"    element={<TTEUpload />} />
        <Route path="tte/config"    element={<TTEConfig />} />
        <Route path="tte/:id"       element={<TTEDetail />} />

        {/* WhatsApp Bot */}
        <Route path="bot"           element={<BotDashboard />} />
        <Route path="bot/messages"  element={<BotMessages />} />
        <Route path="bot/contacts"  element={<BotContacts />} />
        <Route path="bot/menu"      element={<BotMenu />} />
        <Route path="bot/broadcast" element={<BotBroadcast />} />
        <Route path="bot/settings"  element={<BotSettings />} />

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
