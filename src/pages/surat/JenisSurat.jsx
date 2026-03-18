import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import suratService from '../../services/suratService';
import { PageHeader, PageLoading, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';

const CATEGORY_COLORS = {
  'Keterangan': 'teal',
  'Rekomendasi': 'blue',
  'Izin': 'purple',
  'Lainnya': 'orange',
};

const colorMap = {
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', btn: 'bg-teal-600 hover:bg-teal-700 text-white' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700 text-white' },
};

export default function JenisSurat() {
  const navigate = useNavigate();
  const [jenis, setJenis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await suratService.getJenis();
        const d = res.data?.data || res.data;
        setJenis(Array.isArray(d) ? d : []);
      } catch {
        toast.error('Gagal memuat jenis surat');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoading />;

  // Group by kategori
  const grouped = jenis.reduce((acc, j) => {
    const cat = j.kategori || j.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(j);
    return acc;
  }, {});

  if (jenis.length === 0) {
    return (
      <div>
        <PageHeader title="Jenis Surat" />
        <div className="card">
          <EmptyState icon={FileText} title="Belum ada jenis surat" description="Hubungi administrator untuk menambahkan jenis surat" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Jenis Surat"
        subtitle={`${jenis.length} jenis surat tersedia`}
        action={
          <button onClick={() => navigate('/surat/generate')} className="btn-primary">
            <FileText className="w-4 h-4" /> Generate Surat
          </button>
        }
      />

      {Object.entries(grouped).map(([cat, items]) => {
        const color = colorMap[CATEGORY_COLORS[cat] || 'teal'];
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {cat} ({items.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((s, i) => (
                <div key={i} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
                      <FileText className={`w-5 h-5 ${color.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                        {s.nama || s.name || s.jenis}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{s.kode || s.code || s.id}</p>
                      {s.deskripsi && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.deskripsi}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/surat/generate', { state: { jenis: s } })}
                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${color.btn}`}
                  >
                    Generate <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
