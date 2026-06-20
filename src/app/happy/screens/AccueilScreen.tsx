import { useNavigate } from 'react-router';
import { Sparkles, Play, ArrowRight, Star, Clock } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { HAPPY } from '../images';
import { GAMES, COLLECTIONS, CATEGORIES, Game } from '../data';

export default function AccueilScreen() {
  const navigate = useNavigate();
  const featured = GAMES.filter((g) => g.featured);
  const top3 = COLLECTIONS[0];
  const top3Games = top3.games.map((id) => GAMES.find((g) => g.id === id)!);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[52vh] min-h-[400px] overflow-hidden">
        <ImageWithFallback src={HAPPY[featured[0].hero]} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />
        <div className="absolute inset-0 px-5 pb-7 flex flex-col justify-end text-white">
          <p className="inline-flex items-center gap-2 self-start text-xs text-white/90 font-medium uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Bienvenue sur Happy Page
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            Détends-toi.<br />Évade-toi. Joue.
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-md">12 jeux pensés pour le bien-être, l'évasion et le plaisir simple.</p>
          <button
            onClick={() => navigate(`/jeux-bien-etre/jeu/${featured[0].id}`)}
            className="mt-5 self-start inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-stone-900 font-semibold hover:bg-amber-50"
          >
            <Play className="w-4 h-4 fill-stone-900" /> Commencer par {featured[0].name}
          </button>
        </div>
      </section>

      {/* Catégories */}
      <section className="px-5 pt-5">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 snap-x">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/jeux-bien-etre/catalogue?cat=${c.id}`)}
              className="flex-shrink-0 snap-start px-4 py-2 rounded-full bg-white border border-stone-200 text-sm font-medium hover:border-rose-300 inline-flex items-center gap-1.5"
            >
              <c.icon className="w-4 h-4 text-stone-700" strokeWidth={1.75} /> {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Top 3 */}
      <Section title={top3.label} subtitle="Les trois jeux à essayer en premier.">
        <div className="space-y-3">
          {top3Games.map((g, i) => (
            <button
              key={g.id}
              onClick={() => navigate(`/jeux-bien-etre/jeu/${g.id}`)}
              className="w-full flex bg-white rounded-3xl border border-stone-100 overflow-hidden text-left shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-32 h-32 flex-shrink-0">
                <ImageWithFallback src={HAPPY[g.hero]} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${g.accent} opacity-70 mix-blend-multiply`} />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/95 text-stone-900 font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <g.icon className="w-3.5 h-3.5 text-stone-500" strokeWidth={1.75} /> {g.tagline}
                </div>
                <div className="font-bold text-stone-900 mt-0.5">{g.name}</div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{g.desc}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-600">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {g.duration}</span>
                  <Intensity n={g.intensity} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Vedettes */}
      <Section title="À l'affiche" subtitle="Les jeux mis en avant cette semaine.">
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 snap-x scroll-smooth pb-1">
          {featured.map((g) => (
            <FeatureCard key={g.id} game={g} onClick={() => navigate(`/jeux-bien-etre/jeu/${g.id}`)} />
          ))}
        </div>
      </Section>

      {/* Collections */}
      <Section title="Collections Happy" subtitle="Des sélections pour ton humeur du moment.">
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.slice(1).map((c) => {
            const sample = GAMES.find((g) => g.id === c.games[0])!;
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/jeux-bien-etre/catalogue?col=${c.id}`)}
                className="relative h-36 rounded-3xl overflow-hidden text-left group"
              >
                <ImageWithFallback src={HAPPY[sample.cover]} alt={c.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200">{c.games.length} jeux</div>
                  <div className="font-bold leading-tight mt-0.5">{c.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Tous les jeux */}
      <Section title="Tous les jeux" subtitle="Découvre les 12 expériences Happy Page.">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/jeux-bien-etre/jeu/${g.id}`)}
              className="rounded-2xl overflow-hidden bg-white border border-stone-100 text-left hover:shadow-md transition"
            >
              <div className="relative h-28">
                <ImageWithFallback src={HAPPY[g.cover]} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${g.accent} opacity-60 mix-blend-multiply`} />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold inline-flex items-center gap-1">
                  <g.icon className="w-3 h-3 text-stone-800" strokeWidth={2} /> {CATEGORIES.find((c) => c.id === g.category)?.label}
                </div>
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-sm text-stone-900 truncate">{g.name}</div>
                <div className="text-[11px] text-stone-500 truncate">{g.tagline}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="h-6" />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 px-5">
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function FeatureCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 snap-start w-64 rounded-3xl overflow-hidden text-left relative h-72 shadow-md group"
    >
      <ImageWithFallback src={HAPPY[game.cover]} alt={game.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      <div className={`absolute inset-0 bg-gradient-to-br ${game.accent} opacity-65 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-semibold inline-flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Vedette
        </span>
        <span className="bg-white/90 rounded-lg p-1.5 shadow"><game.icon className="w-5 h-5 text-stone-800" strokeWidth={1.75} /></span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="text-[11px] text-white/80">{game.tagline}</div>
        <div className="text-xl font-bold leading-tight tracking-tight mt-0.5">{game.name}</div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs">
          Jouer <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}

function Intensity({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? 'bg-rose-500' : 'bg-stone-200'}`} />
      ))}
      <span className="ml-1 text-stone-500">{n === 1 ? 'Très doux' : n === 2 ? 'Doux' : 'Dynamique'}</span>
    </span>
  );
}
