import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, Search, Star, MapPin, Clock, Calendar, MessageCircle, Phone, Languages, ShieldCheck, Users, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type Service = 'visite' | 'rdv' | 'lecture' | 'marche' | 'courses' | 'nuit';
type Booking = {
  id: string;
  companionId: string;
  companionName: string;
  service: Service;
  date: string;
  hours: number;
  status: 'confirmé' | 'en attente' | 'terminé';
  recipient: string;
};

type Companion = {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: number;
  reviews: number;
  hourly: number;
  bio: string;
  langs: string[];
  services: Service[];
  verified: boolean;
  available: boolean;
  photo: string;
};

const SERVICES: { id: Service; label: string; desc: string }[] = [
  { id: 'visite', label: 'Visite à domicile', desc: 'Présence, conversation, partage' },
  { id: 'rdv', label: 'Accompagnement RDV', desc: 'Transport et présence en consultation' },
  { id: 'lecture', label: 'Lecture / écriture', desc: 'Journaux, courriers, prières' },
  { id: 'marche', label: 'Promenade', desc: 'Activité douce en extérieur' },
  { id: 'courses', label: 'Courses & pharmacie', desc: 'Achats, retrait d\'ordonnance' },
  { id: 'nuit', label: 'Veille de nuit', desc: 'Présence rassurante nocturne' }
];

const COMPANIONS: Companion[] = [
  { id: 'c1', name: 'Esther Adjovi', age: 34, city: 'Cotonou', rating: 4.9, reviews: 87, hourly: 2500, bio: 'Aide-soignante diplômée, douce et patiente avec les aînés. 10 ans d\'expérience.', langs: ['Français', 'Fon'], services: ['visite', 'rdv', 'lecture', 'nuit'], verified: true, available: true, photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400' },
  { id: 'c2', name: 'Yves Kouassi', age: 42, city: 'Abidjan', rating: 4.8, reviews: 64, hourly: 2200, bio: 'Ancien infirmier auxiliaire. Spécialisé dans l\'accompagnement de personnes à mobilité réduite.', langs: ['Français', 'Baoulé'], services: ['visite', 'rdv', 'marche', 'courses'], verified: true, available: true, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { id: 'c3', name: 'Awa Diallo', age: 29, city: 'Dakar', rating: 4.7, reviews: 41, hourly: 2000, bio: 'Étudiante en gérontologie. Passionnée par la transmission entre générations.', langs: ['Français', 'Wolof'], services: ['visite', 'lecture', 'marche'], verified: true, available: false, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
  { id: 'c4', name: 'Boubacar Touré', age: 51, city: 'Bamako', rating: 4.9, reviews: 112, hourly: 2300, bio: 'Père de famille, posé et fiable. Référent des aînés du quartier.', langs: ['Français', 'Bambara'], services: ['visite', 'rdv', 'courses', 'nuit'], verified: true, available: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { id: 'c5', name: 'Fatou Mensah', age: 38, city: 'Lomé', rating: 4.6, reviews: 53, hourly: 2100, bio: 'Auxiliaire de vie, formée aux gestes de premiers secours.', langs: ['Français', 'Éwé'], services: ['visite', 'rdv', 'lecture', 'marche', 'courses'], verified: true, available: true, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
  { id: 'c6', name: 'Jean-Marc Tossou', age: 26, city: 'Cotonou', rating: 4.5, reviews: 18, hourly: 1800, bio: 'Étudiant en travail social. Disponible week-ends.', langs: ['Français'], services: ['marche', 'courses', 'lecture'], verified: false, available: true, photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400' }
];

const STORAGE = 'healthy-page:compagnie';
const loadBk = (): Booking[] => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } };
const saveBk = (b: Booking[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(b)); } catch {} };

export default function CompagnieScreen({ onBack }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string>('Toutes');
  const [service, setService] = useState<Service | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<Companion | null>(null);
  const [bookSvc, setBookSvc] = useState<Service>('visite');
  const [bookDate, setBookDate] = useState('');
  const [bookHours, setBookHours] = useState(2);
  const [recipient, setRecipient] = useState('');
  const [bookings, setBookings] = useState<Booking[]>(() => loadBk());

  useEffect(() => { saveBk(bookings); }, [bookings]);

  const cities = useMemo(() => ['Toutes', ...Array.from(new Set(COMPANIONS.map((c) => c.city)))], []);

  const filtered = useMemo(() => COMPANIONS.filter((c) => {
    if (city !== 'Toutes' && c.city !== city) return false;
    if (service !== 'all' && !c.services.includes(service)) return false;
    if (verifiedOnly && !c.verified) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [city, service, verifiedOnly, query]);

  const submit = () => {
    if (!selected || !bookDate || !recipient.trim()) return;
    const b: Booking = {
      id: Date.now().toString(),
      companionId: selected.id,
      companionName: selected.name,
      service: bookSvc,
      date: bookDate,
      hours: bookHours,
      status: 'en attente',
      recipient: recipient.trim()
    };
    setBookings((arr) => [b, ...arr]);
    setSelected(null);
    setBookDate('');
    setRecipient('');
    setBookHours(2);
  };

  const total = selected ? selected.hourly * bookHours : 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=1080" alt="Compagnie" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Heart className="w-5 h-5" /> Personnes de Compagnie
          </div>
          <h2 className="text-2xl font-bold mt-1">De la présence pour vos proches</h2>
          <p className="text-sm text-white/85 mt-1">Aînés, isolés, convalescents, accompagnés avec dignité</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Users className="w-4 h-4 text-teal-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{COMPANIONS.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">accompagnants</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <ShieldCheck className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{COMPANIONS.filter((c) => c.verified).length}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">vérifiés</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Calendar className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{bookings.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">réservations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                city === c ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setService('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              service === 'all' ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
            }`}
          >
            Tous services
          </button>
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => setService(s.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                service === s.id ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between text-xs text-gray-700 dark:text-slate-300">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-600" /> Profils vérifiés uniquement</span>
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-teal-600 w-4 h-4" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex gap-3 p-4">
              <div className="relative flex-shrink-0">
                <ImageWithFallback src={c.photo} alt={c.name} className="w-16 h-16 rounded-2xl object-cover" />
                {c.verified && <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-0.5 rounded-full ring-2 ring-white"><CheckCircle2 className="w-3 h-3" /></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{c.name}</p>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${c.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.available ? 'Dispo' : 'Occupé'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {c.city} · {c.age} ans
                </p>
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400" /> {c.rating} · {c.reviews} avis
                </p>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mt-1">{c.hourly.toLocaleString('fr-FR')} F CFA/h</p>
              </div>
            </div>
            <p className="px-4 pb-2 text-xs text-gray-600 dark:text-slate-300 line-clamp-2">{c.bio}</p>
            <div className="px-4 pb-3 flex flex-wrap gap-1">
              {c.langs.map((l) => (
                <span key={l} className="text-[10px] inline-flex items-center gap-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  <Languages className="w-2.5 h-2.5" /> {l}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-slate-700 grid grid-cols-3">
              <button className="py-2.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/40 inline-flex items-center justify-center gap-1">
                <MessageCircle className="w-4 h-4" /> Message
              </button>
              <button className="py-2.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/40 inline-flex items-center justify-center gap-1 border-x border-gray-100 dark:border-slate-700">
                <Phone className="w-4 h-4" /> Appeler
              </button>
              <button
                onClick={() => { setSelected(c); setBookSvc(c.services[0]); }}
                disabled={!c.available}
                className="py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 inline-flex items-center justify-center gap-1"
              >
                <Calendar className="w-4 h-4" /> Réserver
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {bookings.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Mes réservations</h3>
          <ul className="space-y-2">
            {bookings.map((b) => {
              const sv = SERVICES.find((s) => s.id === b.service)!;
              return (
                <li key={b.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg">
                    <Heart className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{b.companionName} · {sv.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Pour {b.recipient} · {b.date} · {b.hours}h</p>
                  </div>
                  <span className="text-[10px] uppercase font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 rounded-full">{b.status}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Tous les profils vérifiés ont fourni un casier judiciaire vierge, des références et suivi une formation aux gestes de premiers secours.</span>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageWithFallback src={selected.photo} alt={selected.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{selected.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{selected.hourly.toLocaleString('fr-FR')} F CFA/h</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Bénéficiaire</span>
                  <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Ex. ma mère, M. Konan…" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </label>
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Service</span>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {selected.services.map((sid) => {
                      const s = SERVICES.find((x) => x.id === sid)!;
                      const sel = bookSvc === sid;
                      return (
                        <button
                          key={sid}
                          onClick={() => setBookSvc(sid)}
                          className={`text-left p-2.5 rounded-xl border transition ${
                            sel ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">{s.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Date</span>
                    <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300 flex justify-between">
                      <span>Durée</span><span className="text-teal-700 dark:text-teal-300 font-semibold">{bookHours}h</span>
                    </span>
                    <input type="range" min={1} max={12} value={bookHours} onChange={(e) => setBookHours(Number(e.target.value))} className="w-full accent-teal-600 mt-2" />
                  </label>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">Total estimé</p>
                  <p className="text-lg font-bold text-teal-900 dark:text-teal-100 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {total.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <button
                  onClick={submit}
                  disabled={!bookDate || !recipient.trim()}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" /> Confirmer la réservation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
