import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarHeart, MapPin, Clock, Users, CheckCircle2, Syringe, Activity, Heart, Eye, Brain, Baby, Stethoscope, Trophy, Share2, Bell, Filter, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type EventType = 'depistage' | 'vaccin' | 'atelier' | 'don' | 'conference';
type Event = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  city: string;
  venue: string;
  capacity: number;
  registered: number;
  free: boolean;
  description: string;
  image: string;
  badges?: string[];
};

const TYPES: { id: EventType | 'all'; label: string; icon: typeof Activity; color: string }[] = [
  { id: 'all', label: 'Tout', icon: Sparkles, color: 'from-teal-500 to-cyan-500' },
  { id: 'depistage', label: 'Dépistage', icon: Stethoscope, color: 'from-emerald-500 to-teal-500' },
  { id: 'vaccin', label: 'Vaccination', icon: Syringe, color: 'from-blue-500 to-cyan-500' },
  { id: 'atelier', label: 'Atelier', icon: Activity, color: 'from-amber-500 to-orange-500' },
  { id: 'don', label: 'Don du sang', icon: Heart, color: 'from-red-500 to-rose-500' },
  { id: 'conference', label: 'Conférence', icon: Brain, color: 'from-purple-500 to-fuchsia-500' }
];

const EVENTS: Event[] = [
  { id: 'e1', title: 'Dépistage diabète & hypertension', type: 'depistage', date: new Date(Date.now() + 1 * 86400000).toISOString(), city: 'Cotonou', venue: 'Place Lénine', capacity: 200, registered: 142, free: true, description: 'Glycémie capillaire, tension artérielle, conseils nutritionnels. Sans rendez-vous.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', badges: ['Sans RDV', 'Tout public'] },
  { id: 'e2', title: 'Vaccination Hépatite B, adultes', type: 'vaccin', date: new Date(Date.now() + 2 * 86400000).toISOString(), city: 'Cotonou', venue: 'Centre de santé Cadjèhoun', capacity: 150, registered: 88, free: true, description: 'Première dose offerte. Apporter pièce d\'identité.', image: 'https://images.unsplash.com/photo-1632053002439-fa39ed79b8a4?w=800', badges: ['Adultes'] },
  { id: 'e3', title: 'Atelier nutrition locale', type: 'atelier', date: new Date(Date.now() + 3 * 86400000).toISOString(), city: 'Abidjan', venue: 'Maison des jeunes Treichville', capacity: 50, registered: 50, free: true, description: 'Préparer des repas équilibrés avec produits du marché. Animé par une diététicienne.', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800', badges: ['Complet'] },
  { id: 'e4', title: 'Collecte de sang solidaire', type: 'don', date: new Date(Date.now() + 4 * 86400000).toISOString(), city: 'Dakar', venue: 'CHU Le Dantec', capacity: 300, registered: 215, free: true, description: 'Don à partir de 18 ans. Petit-déjeuner offert.', image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800', badges: ['18+'] },
  { id: 'e5', title: 'Dépistage visuel des écoliers', type: 'depistage', date: new Date(Date.now() + 5 * 86400000).toISOString(), city: 'Bamako', venue: 'École Mamadou Konaté', capacity: 120, registered: 67, free: true, description: 'Pour enfants de 6 à 12 ans. Lunettes offertes si besoin.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', badges: ['Enfants'] },
  { id: 'e6', title: 'Conférence : santé mentale au travail', type: 'conference', date: new Date(Date.now() + 6 * 86400000).toISOString(), city: 'Lomé', venue: 'Hôtel 2 Février', capacity: 200, registered: 134, free: false, description: 'Avec des psychologues du travail. Inscription en ligne.', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', badges: ['Professionnels'] },
  { id: 'e7', title: 'Vaccination enfants 0-5 ans', type: 'vaccin', date: new Date(Date.now() + 7 * 86400000).toISOString(), city: 'Cotonou', venue: 'CSCom Vodjè', capacity: 100, registered: 41, free: true, description: 'Mise à jour du calendrier vaccinal. Carnet de vaccination requis.', image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800', badges: ['Enfants'] },
  { id: 'e8', title: 'Atelier premiers secours', type: 'atelier', date: new Date(Date.now() + 8 * 86400000).toISOString(), city: 'Abidjan', venue: 'Croix-Rouge Cocody', capacity: 30, registered: 22, free: true, description: 'Gestes qui sauvent : étouffement, hémorragie, RCP. Attestation remise.', image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800', badges: ['Tout public'] }
];

const STORAGE_REG = 'healthy-page:sas-registrations';
const STORAGE_NOTIF = 'healthy-page:sas-notif';
const loadReg = (): string[] => { try { return JSON.parse(localStorage.getItem(STORAGE_REG) || '[]'); } catch { return []; } };
const saveReg = (r: string[]) => { try { localStorage.setItem(STORAGE_REG, JSON.stringify(r)); } catch {} };

export default function SemaineSanteScreen({ onBack }: Props) {
  const [type, setType] = useState<EventType | 'all'>('all');
  const [city, setCity] = useState<string>('Toutes');
  const [open, setOpen] = useState<Event | null>(null);
  const [regs, setRegs] = useState<string[]>(() => loadReg());
  const [notif, setNotif] = useState<boolean>(() => localStorage.getItem(STORAGE_NOTIF) === 'true');

  useEffect(() => { saveReg(regs); }, [regs]);
  useEffect(() => { try { localStorage.setItem(STORAGE_NOTIF, String(notif)); } catch {} }, [notif]);

  const cities = useMemo(() => ['Toutes', ...Array.from(new Set(EVENTS.map((e) => e.city)))], []);
  const filtered = useMemo(() => EVENTS.filter((e) => (type === 'all' || e.type === type) && (city === 'Toutes' || e.city === city)), [type, city]);

  const total = EVENTS.length;
  const reachable = EVENTS.reduce((s, e) => s + e.capacity, 0);

  const isReg = (id: string) => regs.includes(id);
  const toggleReg = (id: string) => setRegs((r) => r.includes(id) ? r.filter((x) => x !== id) : [...r, id]);

  const startISO = new Date(Date.now() + 86400000).toISOString();
  const endISO = new Date(Date.now() + 8 * 86400000).toISOString();

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1080" alt="SAS" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <CalendarHeart className="w-5 h-5" /> Semaine Santé pour Tous
          </div>
          <h2 className="text-2xl font-bold mt-1">SAS · 8 jours, 8 villes, 1 mission</h2>
          <p className="text-sm text-white/85 mt-1">Du {new Date(startISO).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {new Date(endISO).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <CalendarHeart className="w-4 h-4 text-teal-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{total}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">événements</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Users className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{reachable.toLocaleString('fr-FR')}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">places offertes</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{regs.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">mes inscriptions</p>
        </div>
      </div>

      <button
        onClick={() => setNotif((v) => !v)}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition ${
          notif ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }`}
      >
        <Bell className={`w-5 h-5 ${notif ? 'text-teal-600' : 'text-gray-400'}`} />
        <span className="flex-1 text-left text-sm text-gray-700 dark:text-slate-300">
          {notif ? 'Notifications activées : vous recevrez un rappel la veille' : 'Recevoir des rappels avant chaque événement'}
        </span>
        <span className={`w-9 h-5 rounded-full relative transition ${notif ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${notif ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const sel = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1 transition ${
                    sel ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-3 h-3" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1.5">Ville</p>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  city === c ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((e) => {
          const tcfg = TYPES.find((t) => t.id === e.type)!;
          const Icon = tcfg.icon;
          const full = e.registered >= e.capacity;
          const reg = isReg(e.id);
          const pct = Math.round((e.registered / e.capacity) * 100);
          return (
            <motion.article
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col"
            >
              <div className="relative h-32">
                <ImageWithFallback src={e.image} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className={`absolute top-2 left-2 bg-gradient-to-br ${tcfg.color} text-white px-2 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1`}>
                  <Icon className="w-3 h-3" /> {tcfg.label}
                </div>
                {e.free && <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold">GRATUIT</div>}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="font-semibold leading-tight line-clamp-2">{e.title}</p>
                  <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{e.city} · {e.venue}
                  </p>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{e.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{e.registered}/{e.capacity}</span>
                </div>
                <div className="mt-1.5 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${full ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                </div>
                {e.badges && e.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.badges.map((b) => (
                      <span key={b} className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded">{b}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOpen(e)}
                    className="text-xs font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/40"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => toggleReg(e.id)}
                    disabled={full && !reg}
                    className={`text-xs font-semibold py-2 rounded-xl shadow-sm flex items-center justify-center gap-1 transition ${
                      reg ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200' :
                      full ? 'bg-gray-200 dark:bg-slate-700 text-gray-500 cursor-not-allowed' :
                      'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-md'
                    }`}
                  >
                    {reg ? <><CheckCircle2 className="w-3.5 h-3.5" /> Inscrit</> : full ? 'Complet' : 'M\'inscrire'}
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
          <CalendarHeart className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Aucun événement ne correspond à vos filtres.</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800/40 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white p-2.5 rounded-xl shadow"><Heart className="w-5 h-5" /></div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-slate-100">Devenir bénévole SAS</p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">Médecins, infirmiers, étudiants, citoyens : rejoignez l'équipe terrain.</p>
            <button className="mt-2 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline">Postuler →</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>SAS est organisé chaque trimestre en partenariat avec les ministères de la santé et des ONG locales. Tous les services médicaux sont gratuits sauf mention contraire.</span>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-44">
                <ImageWithFallback src={open.image} alt={open.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <button onClick={() => setOpen(null)} className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-2 rounded-full">
                  <X className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-[10px] uppercase tracking-widest text-white/80">{TYPES.find((t) => t.id === open.type)?.label}</p>
                  <p className="text-lg font-bold leading-tight">{open.title}</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Quand</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" /> {new Date(open.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Où</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-600" /> {open.venue}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300">{open.description}</p>
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/40 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-teal-700 dark:text-teal-300">
                    <span>Places restantes</span>
                    <span className="font-bold">{Math.max(0, open.capacity - open.registered)} / {open.capacity}</span>
                  </div>
                  <div className="mt-2 h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${Math.round((open.registered / open.capacity) * 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-1">
                    <Share2 className="w-4 h-4" /> Partager
                  </button>
                  <button
                    onClick={() => { toggleReg(open.id); }}
                    className={`text-sm font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1 ${
                      isReg(open.id) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200' : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                    }`}
                  >
                    {isReg(open.id) ? <><CheckCircle2 className="w-4 h-4" /> Inscrit</> : <>M'inscrire</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
