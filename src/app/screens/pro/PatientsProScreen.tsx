import { useEffect, useState } from 'react';
import { Users, Search, ChevronRight } from 'lucide-react';
import { api } from '../../components/api';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props {
  proId: string;
  onOpenPatient: (id: string) => void;
}

export default function PatientsProScreen({ proId, onOpenPatient }: Props) {
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proId) { setLoading(false); setPatients([]); return; }
    api.listProPatients(proId)
      .then((list) => setPatients(list ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [proId]);

  const filtered = patients.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(q)
      || (p.phone ?? '').includes(q);
  });

  return (
    <div>
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-white/80 uppercase tracking-widest">Patients</p>
            <h1 className="font-bold text-lg">Mes patients</h1>
            <p className="text-xs text-white/80">{patients.length} dossier(s)</p>
          </div>
        </div>
      </header>

      <main className="px-5 mt-5 space-y-4">
        <div className="relative h-32 rounded-2xl overflow-hidden">
          <ImageWithFallback src="https://images.unsplash.com/photo-1616694554985-a93b1cab6f60?w=1080" alt="Consultation" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 to-transparent flex items-end p-4">
            <p className="text-white text-sm">Vos patients · une relation de confiance</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un patient…"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {!query && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
              {['Diabète', 'Hypertension', 'Aïcha', 'Kouamé', 'Marie', 'Suivi', 'Chronique'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500 text-center py-6">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucun patient.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpenPatient(p.id)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center font-semibold">
                    {(p.firstName?.[0] ?? '?')}{(p.lastName?.[0] ?? '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.phone ?? ', '} • {p.dob ?? ', '} • {p.blood || 'GS ?'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
