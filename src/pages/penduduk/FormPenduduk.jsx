import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import pendudukService from '../../services/pendudukService';
import { PageHeader, Spinner } from '../../components/UI';
import { toast } from 'react-toastify';
import { normPenduduk } from '../../utils/normalize';

const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const KAWIN = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];
const SHDRT = ['Kepala Keluarga', 'Suami', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Pembantu', 'Lainnya'];
const PDDKN = ['Tidak/Belum Sekolah', 'Belum Tamat SD/Sederajat', 'Tamat SD/Sederajat', 'SLTP/Sederajat', 'SLTA/Sederajat', 'Diploma I/II', 'Akademi/Diploma III/S. Muda', 'Diploma IV/Strata I', 'Strata II', 'Strata III'];

const INIT = {
  NIK: '', NOKK: '', NMKK: '', NAMA: '', JK: 'L', TMP_LAHIR: '', TGL_LAHIR: '',
  GDR: '', AGAMA: 'Islam', ST_KAWIN: 'Belum Kawin', SHDRT: 'Kepala Keluarga',
  PDDKN: 'Tamat SD/Sederajat', PKRJAAN: '', IBU: '', AYAH: '',
  DUSUN: '', RT: '', RW: '',
};

export default function FormPenduduk() {
  const navigate = useNavigate();
  const { nik } = useParams();
  const isEdit = !!nik;
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await pendudukService.getByNik(nik);
        const d = res.data?.data || res.data;
        if (d) setForm({ ...INIT, ...normPenduduk(d) });
      } catch {
        toast.error('Gagal memuat data penduduk');
        navigate('/penduduk');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [nik]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.NIK || form.NIK.length !== 16) { toast.error('NIK harus 16 digit'); return; }
    if (!form.NOKK || !form.NAMA) { toast.error('NOKK dan Nama wajib diisi'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await pendudukService.update(nik, form);
        toast.success('Data penduduk berhasil diperbarui');
      } else {
        await pendudukService.create(form);
        toast.success('Penduduk berhasil ditambahkan');
      }
      navigate('/penduduk');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, name, type = 'text', required, children, className = '' }) => (
    <div className={className}>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children || (
        <input type={type} name={name} value={form[name] || ''} onChange={handleChange}
          required={required} className="input-field" />
      )}
    </div>
  );

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit Penduduk — ${form.NAMA}` : 'Tambah Penduduk'}
        subtitle={isEdit ? `NIK: ${nik}` : 'Isi semua data penduduk dengan lengkap dan benar'}
        action={
          <button onClick={() => navigate('/penduduk')} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* Identitas Utama */}
        <div className="card mb-4">
          <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Identitas Utama</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <F label="NIK" name="NIK" required>
              <input type="text" name="NIK" value={form.NIK} onChange={handleChange} maxLength={16}
                pattern="\d{16}" placeholder="16 digit" disabled={isEdit}
                className={`input-field font-mono ${isEdit ? 'bg-slate-50 text-slate-500' : ''}`} />
            </F>
            <F label="No. Kartu Keluarga" name="NOKK" required>
              <input type="text" name="NOKK" value={form.NOKK} onChange={handleChange} maxLength={16}
                pattern="\d{16}" placeholder="16 digit" className="input-field font-mono" />
            </F>
            <F label="Nama Kepala KK" name="NMKK">
              <input type="text" name="NMKK" value={form.NMKK} onChange={handleChange} className="input-field" />
            </F>
            <F label="Nama Lengkap" name="NAMA" required>
              <input type="text" name="NAMA" value={form.NAMA} onChange={handleChange}
                className="input-field uppercase" required />
            </F>
            <F label="Jenis Kelamin" name="JK">
              <select name="JK" value={form.JK} onChange={handleChange} className="input-field">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </F>
            <F label="Golongan Darah" name="GDR">
              <select name="GDR" value={form.GDR} onChange={handleChange} className="input-field">
                <option value="">Tidak Tahu</option>
                {['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </F>
            <F label="Tempat Lahir" name="TMP_LAHIR" required>
              <input type="text" name="TMP_LAHIR" value={form.TMP_LAHIR} onChange={handleChange} className="input-field" />
            </F>
            <F label="Tanggal Lahir" name="TGL_LAHIR" type="date" required />
            <F label="Agama" name="AGAMA">
              <select name="AGAMA" value={form.AGAMA} onChange={handleChange} className="input-field">
                {AGAMA.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </F>
          </div>
        </div>

        {/* Status & Pendidikan */}
        <div className="card mb-4">
          <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Status & Pendidikan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <F label="Status Perkawinan" name="ST_KAWIN">
              <select name="ST_KAWIN" value={form.ST_KAWIN} onChange={handleChange} className="input-field">
                {KAWIN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </F>
            <F label="Status Hubungan dalam RT" name="SHDRT">
              <select name="SHDRT" value={form.SHDRT} onChange={handleChange} className="input-field">
                {SHDRT.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <F label="Pendidikan Terakhir" name="PDDKN">
              <select name="PDDKN" value={form.PDDKN} onChange={handleChange} className="input-field">
                {PDDKN.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </F>
            <F label="Pekerjaan" name="PKRJAAN">
              <input type="text" name="PKRJAAN" value={form.PKRJAAN} onChange={handleChange} className="input-field" />
            </F>
            <F label="Nama Ibu" name="IBU">
              <input type="text" name="IBU" value={form.IBU} onChange={handleChange} className="input-field uppercase" />
            </F>
            <F label="Nama Ayah" name="AYAH">
              <input type="text" name="AYAH" value={form.AYAH} onChange={handleChange} className="input-field uppercase" />
            </F>
          </div>
        </div>

        {/* Alamat */}
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Alamat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <F label="Dusun" name="DUSUN" required>
              <input type="text" name="DUSUN" value={form.DUSUN} onChange={handleChange} className="input-field" />
            </F>
            <F label="RT" name="RT" required>
              <input type="text" name="RT" value={form.RT} onChange={handleChange} maxLength={3} className="input-field" />
            </F>
            <F label="RW" name="RW" required>
              <input type="text" name="RW" value={form.RW} onChange={handleChange} maxLength={3} className="input-field" />
            </F>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/penduduk')} className="btn-secondary">Batal</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Spinner size="sm" /> Menyimpan...</> : <><Save className="w-4 h-4" /> {isEdit ? 'Simpan Perubahan' : 'Tambah Penduduk'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
