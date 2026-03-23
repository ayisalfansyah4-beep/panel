import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Bot, Paperclip, List, Shield, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, PageLoading, Modal, ConfirmDialog, EmptyState, Spinner } from '../../components/UI';
import botService from '../../services/botService';

const CATS = ['all', 'umum', 'surat', 'info', 'admin'];
const CAT_LABELS = { all: 'Semua', umum: 'Umum', surat: 'Surat', info: 'Info', admin: 'Admin' };

// Response type yang didukung bot baru
const RESPONSE_TYPES = [
  { value: 'text',       label: 'Text — balasan teks biasa' },
  { value: 'template',   label: 'Template — pakai {nama}, {nik}' },
  { value: 'surat',      label: '📄 Surat — flow generate surat' },
  { value: 'penduduk',   label: '👤 Penduduk — cari data penduduk' },
  { value: 'statistik',  label: '📊 Statistik — ringkasan penduduk' },
  { value: 'pengumuman', label: '📢 Pengumuman — berita terbaru' },
  { value: 'apbdes',     label: '💰 APBDes — anggaran desa' },
  { value: 'submenu',    label: '📋 Sub-menu — menu bertingkat' },
  { value: 'function',   label: '⚙️ Function — fungsi custom di bot' },
];

// Akses yang bisa dipilih
const AKSES_OPTIONS = [
  { value: '',           label: 'Publik — semua bisa akses' },
  { value: 'surat',      label: 'Surat — Kaur ke atas' },
  { value: 'penduduk',   label: 'Penduduk — Kadus ke atas' },
  { value: 'statistik',  label: 'Statistik — Kadus ke atas' },
  { value: 'pengumuman', label: 'Pengumuman — Sekretaris ke atas' },
  { value: 'apbdes',     label: 'APBDes — Kepala Desa' },
  { value: 'broadcast',  label: 'Broadcast — Kepala Desa' },
];

const AKSES_COLORS = {
  surat: 'bg-blue-50 text-blue-600', penduduk: 'bg-teal-50 text-teal-600',
  statistik: 'bg-purple-50 text-purple-600', pengumuman: 'bg-orange-50 text-orange-600',
  apbdes: 'bg-yellow-50 text-yellow-700', broadcast: 'bg-red-50 text-red-600',
};

const TYPE_COLOR = {
  text: 'bg-slate-100 text-slate-600', template: 'bg-blue-50 text-blue-600',
  surat: 'bg-teal-50 text-teal-700', penduduk: 'bg-indigo-50 text-indigo-700',
  statistik: 'bg-purple-50 text-purple-700', pengumuman: 'bg-orange-50 text-orange-700',
  apbdes: 'bg-yellow-50 text-yellow-700', submenu: 'bg-pink-50 text-pink-700',
  function: 'bg-red-50 text-red-700',
};

const EMPTY_FORM = {
  category: 'umum', sort_order: 0, label: '', keyword: '', emoji: '',
  response_type: 'text', function_name: '', response: '', deskripsi: '',
  media_url: '', use_ai: '0', is_active: '1', notes: '',
  required_akses: '', // akses role yang diperlukan
};

export default function BotMenu() {
  const [menu, setMenu]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState('all');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState({ open: false, id: null, label: '' });
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    try {
      const res = await botService.getMenu();
      setMenu(res.data?.menu || res.data?.data || []);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = cat === 'all' ? menu : menu.filter(m => m.category === cat);
  const activeCount = menu.filter(m => m.is_active).length;

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, category: cat === 'all' ? 'umum' : cat, sort_order: menu.length * 10 });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (m) => {
    setForm({
      category      : m.category      || 'umum',
      sort_order    : m.sort_order     ?? 0,
      label         : m.label          || '',
      keyword       : m.keyword        || '',
      emoji         : m.emoji          || '',
      deskripsi     : m.deskripsi      || '',
      response_type : m.response_type  || 'text',
      function_name : m.function_name  || '',
      response      : m.response       || '',
      media_url     : m.media_url      || '',
      use_ai        : m.use_ai ? '1' : '0',
      is_active     : m.is_active ? '1' : '0',
      notes         : m.notes          || '',
      required_akses: m.required_akses || '',
    });
    setEditId(m.id);
    setModal(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.keyword.trim()) {
      toast.warn('Label dan keyword wajib diisi'); return;
    }
    const needsResponse = !['function', 'surat', 'penduduk', 'statistik', 'pengumuman', 'apbdes', 'submenu'].includes(form.response_type);
    if (needsResponse && !form.response.trim()) {
      toast.warn('Isi balasan wajib diisi'); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      sort_order    : parseInt(form.sort_order) || 0,
      use_ai        : form.use_ai    === '1' ? 1 : 0,
      is_active     : form.is_active === '1' ? 1 : 0,
      function_name : form.function_name.trim() || null,
      media_url     : form.media_url.trim()     || null,
      notes         : form.notes.trim()         || null,
      emoji         : form.emoji.trim()         || null,
      deskripsi     : form.deskripsi.trim()     || null,
      required_akses: form.required_akses       || null,
    };
    try {
      if (editId) {
        await botService.updateMenu(editId, payload);
        toast.success('Menu diperbarui');
      } else {
        await botService.createMenu(payload);
        toast.success('Menu ditambahkan');
      }
      setModal(false);
      load();
    } catch { /* handled */ }
    finally { setSaving(false); }
  };

  const toggle = async (id) => {
    setToggling(id);
    try {
      await botService.toggleMenu(id);
      setMenu(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
    } catch { /* handled */ }
    finally { setToggling(null); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await botService.deleteMenu(confirm.id);
      toast.success('Menu dihapus');
      setConfirm({ open: false });
      load();
    } catch { /* handled */ }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Menu Bot"
        subtitle={`${menu.length} item · ${activeCount} aktif — dikonfigurasi dari panel, auto-sync ke bot`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Menu
          </button>
        }
      />

      {/* Category Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              cat === c
                ? 'bg-teal-600 text-white border-teal-600'
                : 'text-slate-500 border-slate-200 hover:border-teal-400 hover:text-slate-700'
            }`}>
            {CAT_LABELS[c]}
            {c !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({menu.filter(m => m.category === c).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={List}
          title="Belum ada menu"
          description="Klik Tambah Menu untuk membuat menu balasan otomatis bot."
          action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Tambah Menu</button>}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(m => {
            const kws = (m.keyword || '').split(',').map(k => k.trim()).filter(Boolean);
            const typeColor = TYPE_COLOR[m.response_type] || 'bg-slate-100 text-slate-600';
            return (
              <div key={m.id}
                className={`card flex flex-col gap-3 transition-opacity ${!m.is_active ? 'opacity-50' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {m.emoji && <span className="text-xl">{m.emoji}</span>}
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{m.label}</p>
                      {m.deskripsi && <p className="text-xs text-slate-400 mt-0.5">{m.deskripsi}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {m.category}
                    </span>
                    <button onClick={() => toggle(m.id)} disabled={toggling === m.id}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title={m.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {toggling === m.id
                        ? <Spinner size="sm" />
                        : m.is_active
                          ? <ToggleRight className="w-5 h-5 text-teal-500" />
                          : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1.5">
                  {kws.slice(0, 5).map((k, i) => (
                    <span key={i} className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                      {k}
                    </span>
                  ))}
                  {kws.length > 5 && <span className="text-xs text-slate-400">+{kws.length - 5} lagi</span>}
                </div>

                {/* Response preview */}
                {m.response && (
                  <p className="text-sm text-slate-500 line-clamp-2 whitespace-pre-wrap leading-relaxed">
                    {m.response}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
                    {m.response_type}
                  </span>
                  {m.required_akses && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${AKSES_COLORS[m.required_akses] || 'bg-slate-100 text-slate-500'}`}>
                      <Shield className="w-3 h-3" /> {m.required_akses}
                    </span>
                  )}
                  {m.use_ai && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                      <Bot className="w-3 h-3" /> AI
                    </span>
                  )}
                  {m.media_url && (
                    <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                      <Paperclip className="w-3 h-3" /> media
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button onClick={() => openEdit(m)} className="btn-secondary text-xs py-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, id: m.id, label: m.label })}
                    className="text-xs py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-50 border border-red-200 transition-colors ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editId ? 'Edit Menu Bot' : 'Tambah Menu Bot'} size="xl">
        <div className="space-y-4">

          {/* Baris 1 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Kategori</label>
              <select className="input-field" value={form.category} onChange={e => f('category', e.target.value)}>
                <option value="umum">umum</option>
                <option value="surat">surat</option>
                <option value="info">info</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <label className="label">Emoji</label>
              <input className="input-field text-xl" value={form.emoji}
                onChange={e => f('emoji', e.target.value)} placeholder="📄" maxLength={4} />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input-field" value={form.sort_order}
                onChange={e => f('sort_order', e.target.value)} min="0" />
            </div>
          </div>

          {/* Label & Deskripsi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Label / Nama Menu <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.label}
                onChange={e => f('label', e.target.value)} placeholder="Surat Keterangan Domisili" />
            </div>
            <div>
              <label className="label">Deskripsi Singkat</label>
              <input className="input-field" value={form.deskripsi}
                onChange={e => f('deskripsi', e.target.value)} placeholder="Untuk keperluan dokumen..." />
            </div>
          </div>

          {/* Keyword */}
          <div>
            <label className="label">
              Kata Kunci Pemicu <span className="text-red-500">*</span>
              <span className="text-slate-400 normal-case font-normal ml-1">(pisahkan dengan koma)</span>
            </label>
            <input className="input-field" value={form.keyword}
              onChange={e => f('keyword', e.target.value)}
              placeholder="domisili, surat domisili, 1" />
            <p className="text-xs text-slate-400 mt-1">Bisa berupa kata atau angka menu</p>
          </div>

          {/* Response Type & Required Akses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Jenis Respons</label>
              <select className="input-field" value={form.response_type}
                onChange={e => f('response_type', e.target.value)}>
                {RESPONSE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                Akses Role <Shield className="w-3.5 h-3.5 inline ml-1 text-slate-400" />
              </label>
              <select className="input-field" value={form.required_akses}
                onChange={e => f('required_akses', e.target.value)}>
                {AKSES_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Function name — hanya jika type=function */}
          {form.response_type === 'function' && (
            <div>
              <label className="label">Nama Fungsi di Bot</label>
              <input className="input-field font-mono" value={form.function_name}
                onChange={e => f('function_name', e.target.value)} placeholder="handleSuratDomisili" />
            </div>
          )}

          {/* Isi Balasan — hanya untuk text/template */}
          {['text', 'template'].includes(form.response_type) && (
            <div>
              <label className="label">
                Isi Balasan
                {form.response_type === 'template' && (
                  <span className="text-slate-400 normal-case font-normal ml-1">
                    — variabel: {'{nama}'}, {'{nik}'}, {'{jabatan}'}, {'{wilayah}'}
                  </span>
                )}
              </label>
              <textarea className="input-field font-mono text-xs" rows={5}
                value={form.response} onChange={e => f('response', e.target.value)}
                placeholder={'📄 *Judul*\n\nSyarat:\n• Item 1\n• Item 2'} />
            </div>
          )}

          {/* Hint untuk built-in types */}
          {!['text', 'template', 'function'].includes(form.response_type) && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
              <p className="font-medium mb-1">ℹ️ Tipe <code className="bg-teal-100 px-1 rounded">{form.response_type}</code> menggunakan flow bawaan bot.</p>
              <p className="text-teal-700 text-xs">
                {form.response_type === 'surat' && 'Bot akan menampilkan daftar jenis surat, meminta NIK, konfirmasi, lalu generate PDF.'}
                {form.response_type === 'penduduk' && 'Bot akan meminta input NIK atau nama, lalu menampilkan data penduduk.'}
                {form.response_type === 'statistik' && 'Bot akan menampilkan ringkasan statistik penduduk secara real-time.'}
                {form.response_type === 'pengumuman' && 'Bot akan menampilkan 5 pengumuman terbaru dari panel.'}
                {form.response_type === 'apbdes' && 'Bot akan menampilkan data APBDes tahun berjalan.'}
                {form.response_type === 'submenu' && 'Menu ini bisa memiliki sub-menu (konfigurasi via API).'}
              </p>
              <div className="mt-2">
                <label className="label text-teal-700">Teks Intro (opsional)</label>
                <input className="input-field text-sm" value={form.response}
                  onChange={e => f('response', e.target.value)}
                  placeholder="Pesan pengantar sebelum flow dimulai..." />
              </div>
            </div>
          )}

          {/* URL Media */}
          <div>
            <label className="label">URL Media <span className="text-slate-400 normal-case font-normal">(opsional — gambar/PDF dikirim bersama balasan)</span></label>
            <input className="input-field" value={form.media_url}
              onChange={e => f('media_url', e.target.value)} placeholder="https://..." />
          </div>

          {/* Baris bawah */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Teruskan ke AI?</label>
              <select className="input-field" value={form.use_ai} onChange={e => f('use_ai', e.target.value)}>
                <option value="0">Tidak</option>
                <option value="1">Ya — teruskan ke AI</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.is_active} onChange={e => f('is_active', e.target.value)}>
                <option value="1">✅ Aktif</option>
                <option value="0">⛔ Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="label">Catatan Internal</label>
              <input className="input-field" value={form.notes}
                onChange={e => f('notes', e.target.value)} placeholder="..." />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setModal(false)} className="btn-secondary" disabled={saving}>Batal</button>
            <button onClick={save} className="btn-primary" disabled={saving}>
              {saving && <Spinner size="sm" />} Simpan Menu
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Hapus Menu?"
        message={`Menu "${confirm.label}" akan dihapus permanen.`}
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}
