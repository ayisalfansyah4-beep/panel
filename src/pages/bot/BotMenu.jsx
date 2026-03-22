import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Bot, Paperclip, List } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, PageLoading, Modal, ConfirmDialog, EmptyState, Spinner } from '../../components/UI';
import botService from '../../services/botService';

const CATS = ['all', 'umum', 'surat', 'info', 'admin'];
const CAT_LABELS = { all: 'Semua', umum: 'Umum', surat: 'Surat', info: 'Info', admin: 'Admin' };

const EMPTY_FORM = {
  category: 'umum', sort_order: 0, label: '', keyword: '',
  response_type: 'text', function_name: '', response: '',
  media_url: '', use_ai: '0', is_active: '1', notes: '',
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
      setMenu(res.data?.menu || []);
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
      category: m.category || 'umum',
      sort_order: m.sort_order ?? 0,
      label: m.label || '',
      keyword: m.keyword || '',
      response_type: m.response_type || 'text',
      function_name: m.function_name || '',
      response: m.response || '',
      media_url: m.media_url || '',
      use_ai: m.use_ai ? '1' : '0',
      is_active: m.is_active ? '1' : '0',
      notes: m.notes || '',
    });
    setEditId(m.id);
    setModal(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.keyword.trim()) {
      toast.warn('Label dan keyword wajib diisi');
      return;
    }
    if (!form.response.trim() && form.response_type !== 'function') {
      toast.warn('Isi balasan wajib diisi');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
      use_ai: form.use_ai === '1' ? 1 : 0,
      is_active: form.is_active === '1' ? 1 : 0,
      function_name: form.function_name.trim() || null,
      media_url: form.media_url.trim() || null,
      notes: form.notes.trim() || null,
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
        subtitle={`${menu.length} item · ${activeCount} aktif`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Menu
          </button>
        }
      />

      {/* Category Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              cat === c
                ? 'bg-teal-600 text-white border-teal-600'
                : 'text-slate-500 border-slate-200 hover:border-teal-400 hover:text-slate-700'
            }`}
          >
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
            return (
              <div
                key={m.id}
                className={`card flex flex-col gap-3 transition-opacity ${!m.is_active ? 'opacity-50' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 leading-tight">{m.label}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {m.category}
                    </span>
                    <button
                      onClick={() => toggle(m.id)}
                      disabled={toggling === m.id}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title={m.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
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
                  {kws.length > 5 && (
                    <span className="text-xs text-slate-400">+{kws.length - 5} lagi</span>
                  )}
                </div>

                {/* Response preview */}
                <p className="text-sm text-slate-500 line-clamp-2 whitespace-pre-wrap leading-relaxed">
                  {m.response || <span className="italic">— fungsi: {m.function_name} —</span>}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`badge-${m.is_active ? 'active' : 'inactive'}`}>
                    {m.is_active ? '✅ Aktif' : '⛔ Nonaktif'}
                  </span>
                  {m.use_ai && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                      <Bot className="w-3 h-3" /> AI
                    </span>
                  )}
                  {m.response_type !== 'text' && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                      {m.response_type}
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
                    className="btn-danger text-xs py-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Menu' : 'Tambah Menu Baru'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Sort Order</label>
              <input type="number" className="input-field" value={form.sort_order} onChange={e => f('sort_order', e.target.value)} min="0" />
            </div>
          </div>

          <div>
            <label className="label">Label / Nama Menu</label>
            <input className="input-field" value={form.label} onChange={e => f('label', e.target.value)} placeholder="Surat Keterangan Domisili" />
          </div>

          <div>
            <label className="label">Kata Kunci Pemicu <span className="text-slate-400 normal-case font-normal">(pisahkan dengan koma)</span></label>
            <input className="input-field" value={form.keyword} onChange={e => f('keyword', e.target.value)} placeholder="domisili, surat domisili, ket domisili" />
          </div>

          <div>
            <label className="label">Jenis Respons</label>
            <select className="input-field" value={form.response_type} onChange={e => f('response_type', e.target.value)}>
              <option value="text">text — balasan teks biasa</option>
              <option value="template">template — pakai {'{nama}'}, {'{nik}'}</option>
              <option value="function">function — jalankan fungsi di bot</option>
            </select>
          </div>

          {form.response_type === 'function' && (
            <div>
              <label className="label">Nama Fungsi di Bot</label>
              <input className="input-field font-mono" value={form.function_name} onChange={e => f('function_name', e.target.value)} placeholder="handleSuratDomisili" />
            </div>
          )}

          <div>
            <label className="label">Isi Balasan <span className="text-slate-400 normal-case font-normal">(emoji & newline didukung)</span></label>
            <textarea
              className="input-field font-mono text-xs"
              rows={5}
              value={form.response}
              onChange={e => f('response', e.target.value)}
              placeholder={'📄 *Judul*\n\nSyarat:\n• Item 1\n• Item 2'}
            />
          </div>

          <div>
            <label className="label">URL Media <span className="text-slate-400 normal-case font-normal">(opsional — gambar/PDF)</span></label>
            <input className="input-field" value={form.media_url} onChange={e => f('media_url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teruskan ke AI?</label>
              <select className="input-field" value={form.use_ai} onChange={e => f('use_ai', e.target.value)}>
                <option value="0">Tidak — kirim balasan ini saja</option>
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
          </div>

          <div>
            <label className="label">Catatan Internal <span className="text-slate-400 normal-case font-normal">(tidak tampil ke pengguna)</span></label>
            <input className="input-field" value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="..." />
          </div>

          <div className="flex gap-3 justify-end pt-2">
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
