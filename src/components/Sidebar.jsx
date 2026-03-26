import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FilePlus, FileText, Clock,
  Printer, Key, BarChart3, Hash, LogOut, ChevronDown,
  ChevronRight, Building2, Camera, Bell, Wallet, MapPin,
  Bot, MessageSquare, BookOpen, Megaphone, Settings2,
  Newspaper
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* =========================
   CONFIG MENU (SCALABLE)
========================= */
const MENU = [
  { type: 'item', to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },

  { type: 'divider', label: 'Kependudukan' },
  {
    type: 'group',
    icon: Users,
    label: 'Penduduk',
    children: [
      { to: '/penduduk', icon: Users, label: 'Daftar Penduduk' },
      { to: '/penduduk/tambah', icon: FilePlus, label: 'Tambah Penduduk' },
    ],
  },

  { type: 'divider', label: 'Persuratan' },
  {
    type: 'group',
    icon: FileText,
    label: 'Surat',
    children: [
      { to: '/surat/jenis', icon: FileText, label: 'Jenis Surat' },
      { to: '/surat/generate', icon: FilePlus, label: 'Generate Surat' },
      { to: '/surat/riwayat', icon: Clock, label: 'Riwayat Surat' },
    ],
  },

  { type: 'divider', label: 'Anjungan' },
  {
    type: 'group',
    icon: Printer,
    label: 'Cetak Dokumen',
    children: [
      { to: '/cetak/upload', icon: FilePlus, label: 'Upload PDF' },
      { to: '/cetak/log', icon: Clock, label: 'Log Cetak' },
    ],
  },

  { type: 'divider', label: 'Konten Oromid' },
  { type: 'item', to: '/kegiatan', icon: Camera, label: 'Kegiatan Desa' },
  { type: 'item', to: '/pengumuman', icon: Bell, label: 'Pengumuman' },
  { type: 'item', to: '/apbdes', icon: Wallet, label: 'APBDes' },
  { type: 'item', to: '/profil', icon: MapPin, label: 'Profil Desa' },
  { type: 'item', to: '/berita', icon: Newspaper, label: 'Berita Desa' },

  { type: 'divider', label: 'WhatsApp Bot' },
  { type: 'item', to: '/bot', icon: Bot, label: 'Dashboard Bot', end: true },
  {
    type: 'group',
    icon: MessageSquare,
    label: 'Pesan & Kontak',
    children: [
      { to: '/bot/messages', icon: MessageSquare, label: 'Log Pesan' },
      { to: '/bot/contacts', icon: Users, label: 'Kontak' },
    ],
  },
  { type: 'item', to: '/bot/menu', icon: BookOpen, label: 'Menu Bot' },
  { type: 'item', to: '/bot/broadcast', icon: Megaphone, label: 'Broadcast' },
  { type: 'item', to: '/bot/settings', icon: Settings2, label: 'Pengaturan Bot' },

  { type: 'divider', label: 'Pengaturan' },
  {
    type: 'group',
    icon: Key,
    label: 'API & Akses',
    children: [
      { to: '/pengaturan/api-keys', icon: Key, label: 'API Keys' },
      { to: '/pengaturan/api-logs', icon: BarChart3, label: 'Log API' },
      { to: '/pengaturan/nomor-surat', icon: Hash, label: 'Nomor Surat' },
    ],
  },
];

/* =========================
   COMPONENTS
========================= */

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? 'active bg-teal-500/20 text-teal-400' : ''}`
    }
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const NavGroup = ({ icon: Icon, label, children = [] }) => {
  const location = useLocation();

  const isActive = children.some((c) =>
    location.pathname.startsWith(c.to)
  );

  const [open, setOpen] = useState(isActive);

  // ? FIX: hanya auto-open (tidak auto-close)
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`sidebar-link w-full justify-between ${
          isActive ? 'bg-teal-500/20 text-teal-400' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {open && (
        <div className="ml-4 pl-3 border-l border-white/10 mt-1 space-y-0.5">
          {children?.map((c) => (
            <NavItem key={c.to} {...c} />
          ))}
        </div>
      )}
    </div>
  );
};

const Divider = ({ label }) => (
  <div className="pt-3 pb-1 px-1">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </p>
  </div>
);

/* =========================
   MAIN SIDEBAR
========================= */

export default function Sidebar() {
  // ? FIX: fallback kalau context gagal
  const auth = useAuth() || {};
  const { user, logout } = auth;

  const getInitial = () => {
    const name = user?.username || user?.name || 'A';
    return name?.charAt(0)?.toUpperCase() || 'A';
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">
              Oromid Smart Village
            </p>
            <p className="text-xs text-slate-400">Desa Sudimoro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scroll">
        {MENU.map((item) => {
          if (!item?.type) return null;

          if (item.type === 'divider') {
            return <Divider key={item.label} label={item.label} />;
          }

          if (item.type === 'group') {
            return (
              <NavGroup
                key={item.label}
                icon={item.icon}
                label={item.label}
                children={item.children}
              />
            );
          }

          return <NavItem key={item.to} {...item} />;
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {getInitial()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || user?.name || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout?.()}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}