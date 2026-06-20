import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bus, MapPin, Calendar, Clock, Users, CheckCircle2, X, Stethoscope, Syringe, HeartPulse, Baby, Activity } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { getPatientId } from '../components/usePatientId';
import { api } from '../components/api';
import { useLockBodyScroll } from '../components/useLockBodyScroll';

type Service = 'consultation' | 'vaccination' | 'depistage' | 'maternite' | 'pediatrie';

type Tour = {
  id: string;
  city: string;
  district: string;
  date: string;
  startTime: string;
  endTime: string;
  services: Service[];
  capacity: number;
  registered: number;
  team: string;
  notes?: string;
};

const SERVICE_META: Record<Service, { label: string; icon: typeof Stethoscope; color: string }> = {
  consultation: { label: 'Consultation', icon: Stethoscope, color: 'bg-teal-100 text-teal-800' },
  vaccination: { label: 'Vaccination', icon: Syringe, color: 'bg-sky-100 text-sky-800' },
  depistage: { label: 'Dépistage', icon: HeartPulse, color: 'bg-rose-100 text-rose-800' },
  maternite: { label: 'Maternité', icon: Baby, color: 'bg-pink-100 text-pink-800' },
  pediatrie: { label: 'Pédiatrie', icon: Activity, color: 'bg-violet-100 text-violet-800' }
};

const SEED_TOURS: Tour[] = [
  { id: 't1', city: 'Cotonou', district: 'Akpakpa', date: '2026-05-08', startTime: '08:00', endTime: '16:00', services: ['consultation', 'vaccination', 'depistage'], capacity: 80, registered: 42, team: 'Dr. Adjovi + 2 IDE', notes: 'Devant la mairie d\'arrondissement' },
  { id: 't2', city: 'Porto-Novo', district: 'Ouando', date: '2026-05-10', startTime: '09:00', endTime: '15:00', services: ['consultation', 'maternite'], capacity: 60, registered: 28, team: 'Dr. Houenou + sage-femme' },
  { id: 't3', city: 'Abomey-Calavi', district: 'Godomey', date: '2026-05-13', startTime: '08:30', endTime: '17:00', services: ['vaccination', 'pediatrie'], capacity: 100, registered: 71, team: '2 médecins + 3 IDE' },
  { id: 't4', city: 'Parakou', district: 'Banikanni', date: '2026-05-17', startTime: '08:00', endTime: '16:00', services: ['consultation', 'depistage', 'pediatrie'], capacity: 90, registered: 33, team: 'Équipe mobile Nord' },
  { id: 't5', city: 'Bohicon', district: 'Centre', date: '2026-05-22', startTime: '09:00', endTime: '14:00', services: ['consultation', 'vaccination'], capacity: 50, registered: 19, team: 'Dr. Toléba + IDE' },
  { id: 't6', city: 'Abidjan', district: 'Yopougon', date: '2026-05-24', startTime: '08:00', endTime: '17:00', services: ['consultation', 'depistage', 'maternite'], capacity: 120, registered: 86, team: 'Équipe Helfy CI' }
];

interface Props { onBack: () => void }

export default function CarsHelfyScreen({ onBack }: Props) {
  const [serviceFilter, setServiceFilter] = useState<Service | 'all'>('all');
  const [city, setCity] = useState<string>('all');
  const [registered, setRegistered] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<Tour | null>(null);
  useLockBodyScroll(!!selected);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('healthy-page:carshelfy:registered');
      if (raw) setRegistered(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Record<string, true>) => {
    setRegistered(next);
    try { window.localStorage.setItem('healthy-page:carshelfy:registered', JSON.stringify(next)); } catch {}
  };

  const cities = useMemo(() => Array.from(new Set(SEED_TOURS.map((t) => t.city))).sort(), []);

  const filtered = useMemo(() => {
    return SEED_TOURS
      .filter((t) => serviceFilter === 'all' || t.services.includes(serviceFilter))
      .filter((t) => city === 'all' || t.city === city)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [serviceFilter, city]);

  const register = async (tour: Tour) => {
    const next = { ...registered, [tour.id]: true as const };
    persist(next);
    setSelected(null);
    const pid = getPatientId();
    if (pid) {
      try {
        await api.createNotification(pid, {
          type: 'rdv',
          title: `Inscription Cars Helfy, ${tour.city}`,
          message: `Tournée du ${formatDate(tour.date)} à ${tour.startTime} (${tour.district})`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch {}
    }
  };

  const unregister = (tour: Tour) => {
    const next = { ...registered };
    delete next[tour.id];
    persist(next);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=1080" alt="Unité mobile de santé" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Bus className="w-5 h-5" /> Cars Helfy
          </div>
          <h2 className="text-2xl font-bold mt-1">Santé mobile</h2>
          <p className="text-sm text-white/85 mt-1">Tournées de proximité près de chez vous</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['all', ...Object.keys(SERVICE_META)] as (Service | 'all')[]).map((s) => (
            <button
              key={s}
              onClick={() => setServiceFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                serviceFilter === s
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {s === 'all' ? 'Tous services' : SERVICE_META[s].label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCity('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              city === 'all' ? 'bg-cyan-600 text-white shadow' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
            }`}
          >
            Toutes villes
          </button>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                city === c ? 'bg-cyan-600 text-white shadow' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400 text-sm">
            <Bus className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Aucune tournée pour ces filtres.
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {filtered.map((t) => {
              const isReg = !!registered[t.id];
              const fillPct = Math.min(100, Math.round((t.registered / t.capacity) * 100));
              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-teal-100 dark:border-slate-700 overflow-hidden"
                >
                  <button onClick={() => setSelected(t)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-300 font-semibold uppercase tracking-wide">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(t.date)}
                          <Clock className="w-3.5 h-3.5 ml-2" />
                          {t.startTime}-{t.endTime}
                        </div>
                        <h3 className="mt-1 font-semibold text-gray-900 dark:text-slate-100">
                          {t.city} · <span className="font-normal text-gray-600 dark:text-slate-300">{t.district}</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {t.team}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {t.services.map((s) => {
                            const meta = SERVICE_META[s];
                            return (
                              <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full ${meta.color}`}>
                                {meta.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {isReg && (
                        <div className="text-emerald-600 dark:text-emerald-400 flex flex-col items-center text-[10px] font-semibold">
                          <CheckCircle2 className="w-6 h-6" />
                          Inscrit
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400 mb-1">
                        <span>{t.registered}/{t.capacity} inscrits</span>
                        <span>{fillPct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillPct > 85 ? 'bg-rose-500' : fillPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white px-5 py-4 flex items-center justify-between">
                <h2 className="font-bold">Détails de la tournée</h2>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/20 rounded-full" aria-label="Fermer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <Row icon={<MapPin className="w-4 h-4" />} label="Lieu" value={`${selected.city}, ${selected.district}`} />
                <Row icon={<Calendar className="w-4 h-4" />} label="Date" value={formatDate(selected.date)} />
                <Row icon={<Clock className="w-4 h-4" />} label="Horaires" value={`${selected.startTime}, ${selected.endTime}`} />
                <Row icon={<Users className="w-4 h-4" />} label="Équipe" value={selected.team} />
                {selected.notes && <Row icon={<MapPin className="w-4 h-4" />} label="Notes" value={selected.notes} />}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold mb-1.5">Services proposés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.services.map((s) => {
                      const meta = SERVICE_META[s];
                      const Icon = meta.icon;
                      return (
                        <span key={s} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" /> {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {registered[selected.id] ? (
                  <button
                    onClick={() => { unregister(selected); setSelected(null); }}
                    className="w-full mt-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 font-semibold py-3 rounded-xl"
                  >
                    Annuler l'inscription
                  </button>
                ) : (
                  <button
                    onClick={() => register(selected)}
                    disabled={selected.registered >= selected.capacity}
                    className="w-full mt-2 bg-gradient-to-r from-teal-700 to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl shadow"
                  >
                    {selected.registered >= selected.capacity ? 'Complet' : 'M\'inscrire à cette tournée'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-teal-600 dark:text-teal-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold">{label}</p>
        <p className="text-gray-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}
