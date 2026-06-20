import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Activity, Stethoscope, ChevronRight, LogOut, Search, Clock, Video, CreditCard } from 'lucide-react';
import { api } from '../../components/api';
import MaCarteScreen from '../MaCarteScreen';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props {
  proId: string;
  onLogout: () => void;
  onOpenPatient: (patientId: string) => void;
}

type AgendaEntry = { time: string; name: string; motif: string; type: 'cabinet' | 'tele' };

export default function DashboardProScreen({ proId, onLogout, onOpenPatient }: Props) {
  const [pro, setPro] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const TODAY_AGENDA: AgendaEntry[] = [];

  useEffect(() => {
    Promise.all([
      api.getPro(proId).catch(() => null),
      api.listProPatients(proId).catch(() => [])
    ])
      .then(([p, list]) => {
        setPro(p);
        setPatients(list ?? []);
      })
      .finally(() => setLoading(false));
  }, [proId]);

  const filtered = patients.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(q)
      || (p.phone ?? '').includes(q);
  });

  if (showCard && pro) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <MaCarteScreen
          subject={{
            id: pro.id, fullName: pro.name ?? 'Praticien', role: 'Praticien', photo: pro.photo ?? null,
            subtitle: pro.specialty,
            meta: {
              'Licence': pro.licence,
              'Activité': pro.activity,
              'Ville': pro.city,
              'Téléphone': pro.contact?.phonePro ?? pro.phone
            }
          }}
          onBack={() => setShowCard(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pro?.photo ? (
              <img src={pro.photo} alt={pro?.name ?? 'Praticien'} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/40" />
            ) : (
              <div className="bg-white/20 p-2.5 rounded-2xl"><Stethoscope className="w-6 h-6" /></div>
            )}
            <div>
              <p className="text-xs text-white/80 uppercase tracking-widest">Espace Praticien</p>
              <h1 className="font-bold text-lg">{pro?.name ?? 'Praticien'}</h1>
              <p className="text-xs text-white/80">{pro?.specialty ?? ', '}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCard(true)} className="bg-white/15 hover:bg-white/25 p-2 rounded-xl" aria-label="Ma carte">
              <CreditCard className="w-5 h-5" />
            </button>
            <button onClick={onLogout} className="bg-white/15 hover:bg-white/25 p-2 rounded-xl">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 mt-5 space-y-5">
        <div className="relative h-32 rounded-2xl overflow-hidden">
          <ImageWithFallback src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=1080" alt="Médecin africain" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 to-transparent flex items-end p-4">
            <p className="text-white text-sm">Au service de vos patients · tableau de bord praticien</p>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Patients', value: patients.length, color: 'teal' },
            { icon: Calendar, label: 'RDV jour', value: TODAY_AGENDA.length, color: 'blue' },
            { icon: Activity, label: 'En cours', value: 2, color: 'rose' }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-4 rounded-2xl shadow-sm"
              >
                <div className={`bg-${s.color}-50 p-2 rounded-lg w-fit`}>
                  <Icon className={`w-4 h-4 text-${s.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Today agenda */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" /> Agenda du jour
          </h2>
          <div className="space-y-2">
            {TODAY_AGENDA.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="bg-white p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{a.time}</span>
                    <span className="text-sm text-gray-900">{a.name}</span>
                    {a.type === 'tele' && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Video className="w-3 h-3" /> Tele
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{a.motif}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </section>

        {/* Patients list */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" /> Mes patients
          </h2>
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
              {['Diabète', 'Hypertension', 'Aïcha', 'Kouamé', 'Téléconsultation', 'Suivi', 'Cotonou'].map((s) => (
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
            <p className="text-sm text-gray-500 text-center py-6">Aucun patient enregistré.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpenPatient(p.id)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center font-semibold">
                    {(p.firstName?.[0] ?? '?')}{(p.lastName?.[0] ?? '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.phone ?? ', '} • {p.dob ?? ', '} • {p.blood || 'GS ?'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
