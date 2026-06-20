import { Trophy, Star, Sparkles, Lock, Crown, Medal, Flame, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { HAPPY } from '../images';

const STARS = 1240;
const LEVEL = 7;
const NEXT = 1500;

const MEDALS = [
  { id: 'first', label: 'Première session', desc: 'Tu as joué ton premier jeu Happy.', icon: Sparkles, unlocked: true, color: 'from-amber-400 to-orange-500' },
  { id: 'zen', label: 'Maître du calme', desc: '10 sessions ZenGarden complétées.', icon: Heart, unlocked: true, color: 'from-emerald-400 to-teal-600' },
  { id: 'puzzle50', label: 'Puzzle x50', desc: 'Recompose 50 puzzles.', icon: Trophy, unlocked: true, color: 'from-blue-400 to-indigo-600' },
  { id: 'streak7', label: 'Série de 7 jours', desc: 'Joue 7 jours d\'affilée.', icon: Flame, unlocked: false, color: 'from-rose-400 to-fuchsia-600' },
  { id: 'all12', label: 'Touche-à-tout', desc: 'Essaie les 12 jeux.', icon: Crown, unlocked: false, color: 'from-violet-400 to-purple-700' },
  { id: 'sky100', label: 'Ciel sans limite', desc: 'Score 100k au SkyRunner.', icon: Star, unlocked: false, color: 'from-cyan-400 to-sky-600' },
];

const THEMES = [
  { id: 'sunset', label: 'Coucher Sahel', cost: 200, img: 'starsClouds', unlocked: true },
  { id: 'lagune', label: 'Lagune Ganvié', cost: 400, img: 'zenLines', unlocked: true },
  { id: 'wax', label: 'Wax Festif', cost: 600, img: 'waxBright', unlocked: false },
  { id: 'nuit', label: 'Nuit Cotonou', cost: 900, img: 'starSky', unlocked: false },
] as const;

const LEADERBOARD = [
  { rank: 1, name: 'Awa K.', stars: 3210, avatar: 'kidStripes' },
  { rank: 2, name: 'Toi', stars: STARS, avatar: 'manDenim', me: true },
  { rank: 3, name: 'Komla', stars: 1080, avatar: 'manBandana' },
  { rank: 4, name: 'Fatou', stars: 920, avatar: 'girlHands' },
  { rank: 5, name: 'Edem', stars: 740, avatar: 'manJacket' },
] as const;

export default function RecompensesScreen() {
  const progress = Math.min(100, Math.round((STARS / NEXT) * 100));

  return (
    <div className="pb-6">
      {/* Hero stats */}
      <section className="relative h-56 overflow-hidden">
        <ImageWithFallback src={HAPPY.bigStar} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/85 via-rose-500/80 to-fuchsia-700/85" />
        <div className="absolute inset-0 px-5 py-6 text-white flex flex-col justify-center">
          <div className="text-xs font-medium opacity-90 inline-flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Mes récompenses
          </div>
          <div className="mt-1 text-3xl font-bold tracking-tight inline-flex items-center gap-2">{STARS.toLocaleString('fr-FR')} <Star className="w-6 h-6 fill-white" strokeWidth={1.5} /></div>
          <div className="text-sm text-white/85 mt-0.5">Niveau {LEVEL} · plus que {NEXT - STARS} étoiles pour le niveau {LEVEL + 1}</div>
          <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {/* Médailles */}
      <section className="px-5 mt-7">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-stone-900">Médailles</h2>
          <span className="text-xs text-stone-500">{MEDALS.filter((m) => m.unlocked).length}/{MEDALS.length}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {MEDALS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`relative aspect-square rounded-3xl p-3 flex flex-col justify-between text-white overflow-hidden ${
                  m.unlocked ? '' : 'grayscale opacity-60'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color}`} />
                <Icon className="relative w-6 h-6" />
                <div className="relative">
                  <div className="text-[11px] font-bold leading-tight">{m.label}</div>
                  <div className="text-[10px] opacity-85 mt-0.5 line-clamp-2">{m.desc}</div>
                </div>
                {!m.unlocked && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-900/60 flex items-center justify-center">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Thèmes */}
      <section className="px-5 mt-8">
        <h2 className="text-base font-bold text-stone-900">Thèmes à débloquer</h2>
        <p className="text-xs text-stone-500 mt-0.5">Personnalise l'ambiance visuelle des jeux.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className="relative h-32 rounded-3xl overflow-hidden text-left group disabled:cursor-not-allowed"
              disabled={!t.unlocked}
            >
              <ImageWithFallback src={HAPPY[t.img]} alt={t.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 to-stone-950/10" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="font-bold leading-tight">{t.label}</div>
                <div className="mt-1 text-[11px] inline-flex items-center gap-1">
                  {t.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 font-semibold">Activé</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {t.cost} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Classement */}
      <section className="px-5 mt-8">
        <h2 className="text-base font-bold text-stone-900">Classement amical</h2>
        <p className="text-xs text-stone-500 mt-0.5">Tes amis Happy de la semaine.</p>
        <div className="mt-3 bg-white rounded-3xl border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {LEADERBOARD.map((p) => (
            <div key={p.rank} className={`flex items-center gap-3 px-4 py-3 ${p.me ? 'bg-rose-50' : ''}`}>
              <div className={`w-7 text-center font-bold ${p.rank === 1 ? 'text-amber-500' : 'text-stone-400'}`}>
                {p.rank === 1 ? <Crown className="w-5 h-5 mx-auto" /> : `#${p.rank}`}
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <ImageWithFallback src={HAPPY[p.avatar]} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-900">{p.name}{p.me && ' (toi)'}</div>
                <div className="text-[11px] text-stone-500">{p.stars.toLocaleString('fr-FR')} étoiles</div>
              </div>
              {p.rank <= 3 && <Medal className={`w-5 h-5 ${p.rank === 1 ? 'text-amber-500' : p.rank === 2 ? 'text-stone-400' : 'text-orange-400'}`} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
