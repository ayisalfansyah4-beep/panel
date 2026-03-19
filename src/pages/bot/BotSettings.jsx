import { useState, useEffect } from 'react';
import { Save, Key, Bot, Settings, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, PageLoading, Spinner } from '../../components/UI';
import botService from '../../services/botService';

const AI_PROVIDERS = ['gemini', 'groq', 'ollama'];

export default function BotSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Bot API key (local)
  const [apiKey, setApiKey]     = useState(localStorage.getItem('bot_api_key') || '');
  const [showKey, setShowKey]   = useState(false);

  const load = async () => {
    try {
      const res = await botService.getSettings();
      const raw = res.data?.settings || {};
      // normalise: each entry may be {value:...} or scalar
      const norm = {};
      for (const [k, v] of Object.entries(raw)) {
        norm[k] = typeof v === 'object' && v !== null ? (v.value ?? '') : v;
      }
      setSettings(norm);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const s = (k) => settings[k] ?? '';
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const saveAll = async () => {
    setSaving(true);
    try {
      await botService.updateSettings(settings);
      toast.success('Pengaturan disimpan & sinyal reload dikirim ke bot');
    } catch { /* handled */ }
    finally { setSaving(false); }
  };

  const saveApiKey = () => {
    localStorage.setItem('bot_api_key', apiKey.trim());
    toast.success('API Key bot disimpan di browser ini');
  };

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pengaturan Bot"
        subtitle="Konfigurasi AI, perilaku bot, dan kredensial akses"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel API Key */}
        <div className="card border-amber-200 bg-amber-50/30">
          <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" /> API Key Bot (Panel)
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Key ini digunakan panel untuk berkomunikasi dengan server bot (<code className="bg-slate-100 px-1 py-0.5 rounded">X-Api-Key</code>).
            Disimpan di localStorage browser Anda.
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">X-Api-Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input-field pr-10 font-mono text-xs"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Masukkan API key dari server bot..."
                />
                <button
                  type="button"
                  onClick={() => setShowKey(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button onClick={saveApiKey} className="btn-secondary w-full justify-center">
              <Save className="w-4 h-4" /> Simpan API Key
            </button>
          </div>
        </div>

        {/* AI Provider */}
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-500" /> Konfigurasi AI Provider
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">Provider Aktif</label>
              <select className="input-field" value={s('ai_provider')} onChange={e => set('ai_provider', e.target.value)}>
                {AI_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Nama Model</label>
              <input className="input-field font-mono text-sm" value={s('ai_model')} onChange={e => set('ai_model', e.target.value)} placeholder="gemini-2.5-flash-lite" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Temperature (0–1)</label>
                <input type="number" className="input-field" value={s('ai_temperature')} onChange={e => set('ai_temperature', e.target.value)} step="0.1" min="0" max="1" />
              </div>
              <div>
                <label className="label">Max Tokens</label>
                <input type="number" className="input-field" value={s('ai_max_tokens')} onChange={e => set('ai_max_tokens', e.target.value)} min="100" max="8192" />
              </div>
            </div>
          </div>
        </div>

        {/* Bot Behaviour */}
        <div className="card lg:col-span-2">
          <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-600" /> Perilaku Bot
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Bot</label>
              <input className="input-field" value={s('bot_name')} onChange={e => set('bot_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Timeout Sesi (detik)</label>
                <input type="number" className="input-field" value={s('session_timeout')} onChange={e => set('session_timeout', e.target.value)} />
              </div>
              <div>
                <label className="label">Rate Limit (msg/menit)</label>
                <input type="number" className="input-field" value={s('rate_limit')} onChange={e => set('rate_limit', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Pesan Sambutan</label>
              <textarea className="input-field" rows={3} value={s('greeting_msg')} onChange={e => set('greeting_msg', e.target.value)} />
            </div>
            <div>
              <label className="label">Pesan Fallback (tidak dikenali)</label>
              <textarea className="input-field" rows={3} value={s('unknown_msg')} onChange={e => set('unknown_msg', e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={saveAll} className="btn-primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan & Reload Bot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
