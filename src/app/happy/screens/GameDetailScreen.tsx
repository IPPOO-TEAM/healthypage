import { useParams } from 'react-router';
import { Clock, Sparkles, Star, Bell } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { HAPPY } from '../images';
import { GAMES, CATEGORIES } from '../data';
import ZenGardenGame from './games/ZenGardenGame';
import PuzzleGame from './games/PuzzleGame';
import SkyRunnerGame from './games/SkyRunnerGame';

export default function GameDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const game = GAMES.find((g) => g.id === id);
  if (!game) return <div className="p-8 text-center text-stone-500">Jeu introuvable.</div>;

  const cat = CATEGORIES.find((c) => c.id === game.category);

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="relative h-72 overflow-hidden">
        <ImageWithFallback src={HAPPY[game.hero]} alt={game.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br ${game.accent} opacity-70 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
        <div className="absolute inset-0 px-5 pb-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur inline-flex items-center gap-1">
              {cat ? <cat.icon className="w-3.5 h-3.5" strokeWidth={2} /> : null} {cat?.label}
            </span>
            <span className="inline-flex items-center gap-1 text-white/85"><Clock className="w-3 h-3" /> {game.duration}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{game.name}</h1>
          <p className="text-sm text-white/85 mt-1">{game.tagline}</p>
        </div>
      </section>

      {/* Description */}
      <section className="px-5 mt-5">
        <p className="text-sm text-stone-700 leading-relaxed">{game.desc}</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> +50 par session
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-700">
            <Sparkles className="w-3.5 h-3.5" /> Médailles à débloquer
          </span>
        </div>
      </section>

      {/* Playable area */}
      <section className="px-5 mt-6">
        {game.playable ? (
          game.id === 'zengarden' ? <ZenGardenGame /> :
          game.id === 'puzzle' ? <PuzzleGame /> :
          game.id === 'skyrunner' ? <SkyRunnerGame /> :
          <ComingSoon />
        ) : (
          <ComingSoon />
        )}
      </section>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-stone-100 to-stone-50 border border-stone-200 p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow flex items-center justify-center">
        <Bell className="w-6 h-6 text-rose-500" />
      </div>
      <div className="mt-4 font-bold text-stone-900">Bientôt jouable</div>
      <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">Ce jeu arrive très bientôt sur Happy Page. On te prévient dès qu'il est prêt à être essayé.</p>
      <button className="mt-4 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold">
        Me prévenir
      </button>
    </div>
  );
}
