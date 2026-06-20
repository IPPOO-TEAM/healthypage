import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Brain, Wind, Sparkles, Hand, Music, Palette, Calendar, Star, MapPin, Clock, Play, Pause, CheckCircle2, Heart, Users, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type DisciplineId = 'sophro' | 'hypnose' | 'meditation' | 'kine' | 'osteo' | 'arttherapie';
type Session = { id: string; discipline: DisciplineId; date: string; mode: 'cabinet' | 'visio' | 'domicile'; practitioner: string; status: 'prévue' | 'terminée' };

const DISCIPLINES: { id: DisciplineId; label: string; tagline: string; icon: typeof Brain; color: string; goal: string }[] = [
  { id: 'sophro', label: 'Sophrologie', tagline: 'Détente corps-esprit guidée', icon: Wind, color: 'from-teal-500 to-cyan-500', goal: 'Stress, sommeil, préparation' },
  { id: 'hypnose', label: 'Hypnose thérapeutique', tagline: 'Reprogrammation profonde', icon: Sparkles, color: 'from-cyan-500 to-blue-500', goal: 'Phobies, addictions, douleurs' },
  { id: 'meditation', label: 'Méditation guidée', tagline: 'Pleine conscience quotidienne', icon: Brain, color: 'from-emerald-500 to-teal-500', goal: 'Anxiété, concentration' },
  { id: 'kine', label: 'Kinésithérapie', tagline: 'Mobilité & rééducation', icon: Hand, color: 'from-teal-600 to-emerald-500', goal: 'Douleurs, post-opératoire' },
  { id: 'osteo', label: 'Ostéopathie', tagline: 'Manipulations douces', icon: Hand, color: 'from-blue-500 to-cyan-500', goal: 'Tensions, blocages, troubles fonctionnels' },
  { id: 'arttherapie', label: 'Art-thérapie', tagline: 'Expression créative & émotions', icon: Palette, color: 'from-pink-500 to-rose-500', goal: 'Trauma, expression, enfance' }
];

const PRACTITIONERS = [
  { id: 'p1', name: 'Mme Coffi Dossou', disciplines: ['sophro', 'meditation'] as DisciplineId[], rating: 4.9, city: 'Cotonou', mode: ['cabinet', 'visio'] as const, photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
  { id: 'p2', name: 'Dr. Kouamé Yao', disciplines: ['hypnose'] as DisciplineId[], rating: 4.8, city: 'Abidjan', mode: ['cabinet', 'visio'] as const, photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400' },
  { id: 'p3', name: 'M. Sissoko', disciplines: ['kine', 'osteo'] as DisciplineId[], rating: 4.9, city: 'Bamako', mode: ['cabinet', 'domicile'] as const, photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400' },
  { id: 'p4', name: 'Mme Sarr', disciplines: ['arttherapie', 'meditation'] as DisciplineId[], rating: 4.7, city: 'Dakar', mode: ['cabinet'] as const, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' }
];

const GUIDED_AUDIOS: { id: string; title: string; duration: number; discipline: DisciplineId; image: string }[] = [
  { id: 'a1', title: 'Respiration 4-7-8 pour s\'endormir', duration: 480, discipline: 'sophro', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400' },
  { id: 'a2', title: 'Body-scan du matin', duration: 600, discipline: 'meditation', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400' },
  { id: 'a3', title: 'Ancrage anti-stress (5 min)', duration: 300, discipline: 'sophro', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400' },
  { id: 'a4', title: 'Visualisation positive', duration: 720, discipline: 'hypnose', image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400' }
];

const STORAGE = 'healthy-page:psychocorporel';
const loadS = (): Session[] => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } };
const saveS = (s: Session[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(s)); } catch {} };

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function PsychocorporelScreen({ onBack }: Props) {
  const [tab, setTab] = useState<'disciplines' | 'pratiquer' | 'rdv'>('disciplines');
  const [selDiscipline, setSelDiscipline] = useState<DisciplineId | null>(null);
  const [sessions, setSessions] = useState<Session[]>(() => loadS());
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [streakDays] = useState(4);

  useEffect(() => { saveS(sessions); }, [sessions]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setProgress((p) => {
        const cur = p[playing] ?? 0;
        const audio = GUIDED_AUDIOS.find((a) => a.id === playing);
        if (!audio) return p;
        if (cur + 1 >= audio.duration) { setPlaying(null); return { ...p, [playing]: 0 }; }
        return { ...p, [playing]: cur + 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const filteredPracts = useMemo(() => {
    if (!selDiscipline) return PRACTITIONERS;
    return PRACTITIONERS.filter((p) => p.disciplines.includes(selDiscipline));
  }, [selDiscipline]);

  const book = (practName: string, discipline: DisciplineId, mode: 'cabinet' | 'visio' | 'domicile') => {
    const s: Session = {
      id: Date.now().toString(),
      discipline,
      date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      mode,
      practitioner: practName,
      status: 'prévue'
    };
    setSessions((arr) => [s, ...arr]);
    setTab('rdv');
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080" alt="Psychocorporel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Brain className="w-5 h-5" /> Pôle psychocorporel
          </div>
          <h2 className="text-2xl font-bold mt-1">Soigner le corps & l'esprit ensemble</h2>
          <p className="text-sm text-white/85 mt-1">Sophrologie · hypnose · kiné · ostéo · art-thérapie</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800/40 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-2.5 rounded-xl shadow"><Flame className="w-5 h-5" /></div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Vous pratiquez depuis {streakDays} jours d'affilée</p>
          <p className="text-xs text-gray-600 dark:text-slate-400">Continuez ! 3 jours pour atteindre votre objectif hebdomadaire.</p>
        </div>
        <CheckCircle2 className="w-6 h-6 text-teal-600" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-1 grid grid-cols-3 gap-1">
        {[
          { id: 'disciplines' as const, label: 'Disciplines' },
          { id: 'pratiquer' as const, label: 'Pratiquer' },
          { id: 'rdv' as const, label: `Mes séances${sessions.length ? ` (${sessions.length})` : ''}` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold py-2 rounded-xl transition ${
              tab === t.id ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'disciplines' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DISCIPLINES.map((d) => {
              const Icon = d.icon;
              const sel = selDiscipline === d.id;
              return (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelDiscipline(sel ? null : d.id)}
                  className={`text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 p-4 transition ${
                    sel ? 'border-teal-500' : 'border-transparent hover:border-teal-200'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${d.color} text-white p-3 rounded-xl w-fit shadow-sm`}><Icon className="w-5 h-5" /></div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100 mt-3">{d.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{d.tagline}</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-2 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {d.goal}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selDiscipline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">Praticiens en {DISCIPLINES.find((d) => d.id === selDiscipline)?.label.toLowerCase()}</h3>
                  <button onClick={() => setSelDiscipline(null)} className="text-xs text-teal-700 dark:text-teal-300">Tout voir</button>
                </div>
                {filteredPracts.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 flex items-center gap-3">
                    <ImageWithFallback src={p.photo} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</p>
                      <p className="text-xs text-amber-600 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" />{p.rating}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {p.mode.map((m) => (
                        <button key={m} onClick={() => book(p.name, selDiscipline, m)} className="text-[10px] uppercase font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 px-2 py-1 rounded-md hover:bg-teal-100">
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {tab === 'pratiquer' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 px-1 flex items-center gap-1">
            <Music className="w-3.5 h-3.5" /> Séances guidées audio
          </p>
          {GUIDED_AUDIOS.map((a) => {
            const Icon = DISCIPLINES.find((d) => d.id === a.discipline)?.icon ?? Brain;
            const isPlaying = playing === a.id;
            const cur = progress[a.id] ?? 0;
            const pct = (cur / a.duration) * 100;
            return (
              <div key={a.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={a.image} alt={a.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-slate-100 text-sm truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {fmt(a.duration)} {isPlaying && `· ${fmt(cur)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setPlaying(isPlaying ? null : a.id)}
                    className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white p-3 rounded-full shadow-md hover:shadow-lg transition"
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
                {isPlaying && (
                  <div className="h-1 bg-gray-100 dark:bg-slate-700">
                    <motion.div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            );
          })}
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border border-cyan-100 dark:border-cyan-800/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-700 dark:text-cyan-300" />
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Cercles de pratique en visio</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">Rejoignez des séances collectives chaque semaine, animées par un praticien.</p>
            <button className="w-full bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/40 text-teal-700 dark:text-teal-300 font-semibold py-2 rounded-xl text-sm">
              Voir le calendrier
            </button>
          </div>
        </div>
      )}

      {tab === 'rdv' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Aucune séance prévue.</p>
              <button onClick={() => setTab('disciplines')} className="mt-3 text-xs text-teal-700 dark:text-teal-300 font-medium">Réserver une discipline →</button>
            </div>
          ) : sessions.map((s) => {
            const d = DISCIPLINES.find((x) => x.id === s.discipline)!;
            const Icon = d.icon;
            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-start gap-3">
                <div className={`bg-gradient-to-br ${d.color} text-white p-2.5 rounded-xl shadow-sm`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">{d.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{s.practitioner} · {s.mode}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-300 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(s.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">{s.status}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <Brain className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Approche complémentaire et non-substitutive : ces pratiques s'intègrent à votre suivi médical, sans le remplacer.</span>
      </div>
    </div>
  );
}
