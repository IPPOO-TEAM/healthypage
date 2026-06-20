import { useMemo, useState } from 'react';
import { ArrowLeft, Hotel, MapPin, Star, Calendar, Users, Sparkles, Sun, Heart, Leaf, Music, X, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useLockBodyScroll } from '../components/useLockBodyScroll';

type Theme = 'spirituel' | 'detox' | 'yoga' | 'thalasso' | 'silence';

type Retreat = {
  id: string;
  name: string;
  location: string;
  city: string;
  theme: Theme;
  durationDays: number;
  pricePerNight: number;
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  practices: string[];
  image: string;
  guide: string;
  capacity: number;
  startDates: string[];
};

const THEMES: Record<Theme, { label: string; color: string; icon: typeof Sparkles }> = {
  spirituel: { label: 'Spirituel', color: 'bg-violet-100 text-violet-800', icon: Sparkles },
  detox: { label: 'Détox', color: 'bg-emerald-100 text-emerald-800', icon: Leaf },
  yoga: { label: 'Yoga', color: 'bg-rose-100 text-rose-800', icon: Heart },
  thalasso: { label: 'Thalasso', color: 'bg-sky-100 text-sky-800', icon: Sun },
  silence: { label: 'Silence', color: 'bg-amber-100 text-amber-800', icon: Music }
};

const RETREATS: Retreat[] = [
  {
    id: 'r1',
    name: 'Sanctuaire de Ouidah',
    location: 'Bord de mer',
    city: 'Ouidah, Bénin',
    theme: 'spirituel',
    durationDays: 5,
    pricePerNight: 35000,
    rating: 4.8,
    reviews: 142,
    description: 'Retraite spirituelle face à l\'Atlantique mêlant traditions vodoun, méditation et rituels de purification au bord de la Porte du Non-Retour.',
    highlights: ['Cérémonie d\'accueil au lever du soleil', 'Marche sacrée le long de la plage', 'Rituels de purification à l\'eau de mer', 'Veillée des ancêtres'],
    practices: ['Méditation guidée', 'Rituels traditionnels', 'Yoga doux', 'Cuisine locale bio'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    guide: 'Maître Hounon Aïdégbé',
    capacity: 20,
    startDates: ['2026-05-12', '2026-06-09', '2026-07-07']
  },
  {
    id: 'r2',
    name: 'Hôtel Bien-Être Possotomé',
    location: 'Source thermale',
    city: 'Possotomé, Bénin',
    theme: 'thalasso',
    durationDays: 4,
    pricePerNight: 48000,
    rating: 4.6,
    reviews: 89,
    description: 'Cure thermale au bord du lac Ahémé, avec eaux sulfureuses naturelles, hammam traditionnel et soins corporels aux plantes locales.',
    highlights: ['Bains thermaux quotidiens', 'Massage aux huiles essentielles', 'Sauna aux feuilles de neem', 'Promenade en pirogue'],
    practices: ['Hydrothérapie', 'Massages traditionnels', 'Marche méditative', 'Régime alcalin'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    guide: 'Équipe Dr. Atinkpahoun',
    capacity: 30,
    startDates: ['2026-05-05', '2026-05-26', '2026-06-16']
  },
  {
    id: 'r3',
    name: 'Refuge des Collines de Dassa',
    location: 'Massif rocheux',
    city: 'Dassa, Bénin',
    theme: 'silence',
    durationDays: 7,
    pricePerNight: 28000,
    rating: 4.9,
    reviews: 67,
    description: 'Retraite silencieuse de 7 jours au cœur des collines sacrées de Dassa. Reconnexion intérieure, écoute du corps et lâcher-prise.',
    highlights: ['Silence intégral après J2', 'Marches contemplatives', 'Journal de bord guidé', 'Entretiens individuels avec le guide'],
    practices: ['Méditation Vipassana', 'Pleine conscience', 'Yoga Nidra', 'Repas en silence'],
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
    guide: 'Sœur Marie-Joseph + équipe',
    capacity: 15,
    startDates: ['2026-05-19', '2026-06-23', '2026-08-04']
  },
  {
    id: 'r4',
    name: 'Yoga Lodge Grand-Popo',
    location: 'Plage privée',
    city: 'Grand-Popo, Bénin',
    theme: 'yoga',
    durationDays: 6,
    pricePerNight: 42000,
    rating: 4.7,
    reviews: 124,
    description: 'Retraite yoga en bord de mer avec deux sessions quotidiennes, alimentation ayurvédique et soins ayurvédiques personnalisés.',
    highlights: ['Yoga matinal au lever du soleil', 'Yin yoga au coucher du soleil', 'Cuisine ayurvédique', 'Bilan dosha individuel'],
    practices: ['Hatha yoga', 'Yin yoga', 'Pranayama', 'Méditation'],
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
    guide: 'Yogi Adékambi',
    capacity: 18,
    startDates: ['2026-05-15', '2026-06-12', '2026-07-10']
  },
  {
    id: 'r5',
    name: 'Centre Détox Abomey',
    location: 'Domaine forestier',
    city: 'Abomey, Bénin',
    theme: 'detox',
    durationDays: 5,
    pricePerNight: 32000,
    rating: 4.5,
    reviews: 53,
    description: 'Cure de jeûne intermittent, jus verts et plantes médicinales locales. Encadrement médical par naturopathe certifié.',
    highlights: ['Bilan naturopathique', 'Jus pressés à froid 3×/jour', 'Hydrothérapie du côlon', 'Atelier cuisine vivante'],
    practices: ['Jeûne intermittent', 'Phytothérapie', 'Yoga doux', 'Marche en forêt'],
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    guide: 'Dr. Sossou (naturopathe)',
    capacity: 12,
    startDates: ['2026-05-20', '2026-06-17', '2026-07-15']
  },
  {
    id: 'r6',
    name: 'Hôtel Spirituel Assinie',
    location: 'Lagune & océan',
    city: 'Assinie, Côte d\'Ivoire',
    theme: 'spirituel',
    durationDays: 6,
    pricePerNight: 55000,
    rating: 4.7,
    reviews: 178,
    description: 'Séjour de reconnexion entre lagune et océan, intégrant traditions akan, soins du sanctuaire et accompagnement psycho-spirituel.',
    highlights: ['Cérémonie akan d\'ouverture', 'Bain de purification lagunaire', 'Thérapie par les sons traditionnels', 'Veillée aux étoiles'],
    practices: ['Méditation guidée', 'Sound healing', 'Soins traditionnels', 'Coaching de vie'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    guide: 'Nana Akoua + équipe',
    capacity: 24,
    startDates: ['2026-05-25', '2026-06-22', '2026-07-20']
  }
];

interface Props { onBack: () => void }

export default function HotelBienEtreScreen({ onBack }: Props) {
  const [theme, setTheme] = useState<Theme | 'all'>('all');
  const [maxBudget, setMaxBudget] = useState(60000);
  const [selected, setSelected] = useState<Retreat | null>(null);
  const [bookedDate, setBookedDate] = useState<string | null>(null);
  useLockBodyScroll(!!selected || !!bookedDate);
  const [participants, setParticipants] = useState(1);

  const filtered = useMemo(() => {
    return RETREATS.filter((r) => {
      if (theme !== 'all' && r.theme !== theme) return false;
      if (r.pricePerNight > maxBudget) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating);
  }, [theme, maxBudget]);

  const book = (date: string) => {
    setBookedDate(date);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080" alt="Hôtel bien-être" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Hotel className="w-5 h-5" /> Hôtels Bien-Être
          </div>
          <h2 className="text-2xl font-bold mt-1">Retraites & ressourcement</h2>
          <p className="text-sm text-white/85 mt-1">Pôle spirituel · soin du corps et de l'esprit</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['all', ...Object.keys(THEMES)] as (Theme | 'all')[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                theme === t
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {t === 'all' ? 'Toutes thématiques' : THEMES[t].label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-slate-300 font-medium mb-1.5">
            <span>Budget max / nuit</span>
            <span className="text-teal-700 dark:text-teal-300 font-semibold">{maxBudget.toLocaleString('fr-FR')} F CFA</span>
          </div>
          <input
            type="range"
            min={20000}
            max={60000}
            step={5000}
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400 text-sm">
            <Hotel className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Aucun séjour pour ces critères.
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {filtered.map((r) => {
              const meta = THEMES[r.theme];
              const Icon = meta.icon;
              return (
                <motion.button
                  key={r.id}
                  onClick={() => { setSelected(r); setBookedDate(null); setParticipants(1); }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-teal-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <ImageWithFallback src={r.image} alt={r.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color} shadow`}>
                        <Icon className="w-3.5 h-3.5" /> {meta.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {r.rating}
                      <span className="text-gray-500 font-normal">({r.reviews})</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">{r.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {r.city} · {r.location}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 line-clamp-2">{r.description}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">{r.durationDays} jours · {r.capacity} places</p>
                      </div>
                      <p className="text-teal-700 dark:text-teal-300 font-bold">
                        {r.pricePerNight.toLocaleString('fr-FR')} <span className="text-xs font-normal">F CFA / nuit</span>
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 w-full">
                <ImageWithFallback src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white" aria-label="Fermer">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h2 className="font-bold text-lg">{selected.name}</h2>
                  <p className="text-xs flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selected.city}</p>
                </div>
              </div>

              {bookedDate ? (
                <div className="p-6 text-center">
                  <div className="mx-auto mb-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">Demande envoyée !</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                    Votre réservation pour le <span className="font-semibold">{formatDate(bookedDate)}</span> a été enregistrée.<br />
                    {participants} participant{participants > 1 ? 's' : ''} · {selected.durationDays} jours
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
                    Le centre vous contactera sous 24h pour confirmer.
                  </p>
                  <p className="mt-4 text-xl font-bold text-teal-700 dark:text-teal-300">
                    {(selected.pricePerNight * selected.durationDays * participants).toLocaleString('fr-FR')} F CFA
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-4 text-sm">
                  <p className="text-gray-700 dark:text-slate-300">{selected.description}</p>

                  <Section title="Au programme">
                    <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-0.5">
                      {selected.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  </Section>

                  <Section title="Pratiques">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.practices.map((p) => (
                        <span key={p} className="text-xs px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 rounded-full">{p}</span>
                      ))}
                    </div>
                  </Section>

                  <div className="grid grid-cols-2 gap-3">
                    <Info icon={<Users className="w-4 h-4" />} label="Encadrement" value={selected.guide} />
                    <Info icon={<BookOpen className="w-4 h-4" />} label="Capacité" value={`${selected.capacity} places`} />
                  </div>

                  <Section title="Dates de départ">
                    <div className="space-y-1.5">
                      {selected.startDates.map((d) => (
                        <button
                          key={d}
                          onClick={() => book(d)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-900/20 transition"
                        >
                          <span className="flex items-center gap-2 text-sm text-gray-800 dark:text-slate-200">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            {formatDate(d)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">→ {formatDate(addDays(d, selected.durationDays, 1))}</span>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Participants</label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <button
                        onClick={() => setParticipants(Math.max(1, participants - 1))}
                        className="w-9 h-9 rounded-full border border-gray-300 dark:border-slate-600 text-lg"
                      >−</button>
                      <span className="font-semibold text-gray-900 dark:text-slate-100 text-lg">{participants}</span>
                      <button
                        onClick={() => setParticipants(Math.min(6, participants + 1))}
                        className="w-9 h-9 rounded-full border border-gray-300 dark:border-slate-600 text-lg"
                      >+</button>
                    </div>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 flex justify-between items-center">
                    <div className="text-xs text-gray-600 dark:text-slate-300">
                      Total estimé ({selected.durationDays} jours)
                    </div>
                    <div className="text-teal-700 dark:text-teal-300 font-bold">
                      {(selected.pricePerNight * selected.durationDays * participants).toLocaleString('fr-FR')} F CFA
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-teal-700 dark:text-teal-300 font-semibold mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-[11px] font-semibold uppercase tracking-wide">
        {icon}<span>{label}</span>
      </div>
      <p className="text-sm text-gray-800 dark:text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
