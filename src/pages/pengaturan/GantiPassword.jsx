import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function GantiPassword() {
  const { user, logout } = useAuth();

  // BUG FIX: form keys sebelumnya adalah { old_password, new_password, confirm }
  // tapi InputPass dipanggil dengan field="old" dan field="new" sehingga
  // form['old'] dan form['new'] selalu undefined → nilai tidak pernah tersimpan
  // → request ke backend selalu kirim string kosong → "password lama salah"
  const [form, setForm]       = useState({ old: '', new: '', confirm: '' });
  const [show, setShow]       = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const strength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p))  score++;
    if (/[0-9]/.test(p))  score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { label: '', color: '' },
      { label: 'Lemah',       color: 'bg-red-400' },
      { label: 'Cukup',       color: 'bg-orange-400' },
      { label: 'Sedang',      color: 'bg-yellow-400' },
      { label: 'Kuat',        color: 'bg-teal-500' },
      { label: 'Sangat Kuat', color: 'bg-green-500' },
    ];
    return { score, ...levels[Math.min(score, 5)] };
  };

  const pw = strength(form.new);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new !== form.confirm)  { toast.error('Konfirmasi password tidak cocok'); return; }
    if (form.new.length < 6)        { toast.error('Password baru minimal 6 karakter'); return; }
    if (form.old === form.new)      { toast.error('Password baru harus berbeda dari password lama'); return; }

    setLoading(true);
    try {
      // Kirim dengan key yang benar sesuai backend Oromid
      await api.put('/api/admin/users/me/change-password', {
        old_password: form.old,
        new_password: form.new,
      });
      toast.success('Password berhasil diubah! Silakan login ulang.');
      setForm({ old: '', new: '', confirm: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  // Komponen input password reusable
  const InputPass = ({ label, field, placeholder }) => (
    <div>
      <label className="label">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          className="input-field pr-10"
          placeholder={placeholder}
          required
        />
        <button type="button" onClick={() => toggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Ganti Password" subtitle="Ubah password akun Anda sendiri" />

      <div className="max-w-lg">
        {/* Info akun */}
        <div className="card mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name || user?.username}</p>
            <p className="text-sm text-slate-500">@{user?.username} · {user?.role}</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputPass label="Password Lama" field="old" placeholder="Masukkan password saat ini" />

            <div className="border-t border-slate-100 pt-4">
              <InputPass label="Password Baru" field="new" placeholder="Minimal 6 karakter" />

              {/* Strength indicator */}
              {form.new && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pw.score ? pw.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    pw.score <= 1 ? 'text-red-500' : pw.score <= 2 ? 'text-orange-500' :
                    pw.score <= 3 ? 'text-yellow-600' : 'text-teal-600'
                  }`}>{pw.label}</p>
                </div>
              )}
            </div>

            <div>
              <InputPass label="Konfirmasi Password Baru" field="confirm" placeholder="Ulangi password baru" />
              {form.confirm && form.confirm !== form.new && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
              {form.confirm && form.confirm === form.new && form.confirm.length >= 6 && (
                <p className="text-xs text-teal-600 mt-1">✓ Password cocok</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              ⚠️ Setelah password diubah, Anda akan otomatis logout dan perlu login ulang.
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading || form.new !== form.confirm || !form.new || !form.old}
                className="btn-primary px-8"
              >
                {loading
                  ? <><Spinner size="sm" /> Menyimpan...</>
                  : <><Save className="w-4 h-4" /> Simpan Password</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
