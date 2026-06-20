import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, Clock, Filter, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { HAPPY } from '../images';
import { GAMES, CATEGORIES, COLLECTIONS, GameCategory } from '../data';

export default function CatalogueScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const cat = (params.get('cat') as GameCategory | null) ?? null;
  const col = params.get('col');
  const [q, setQ] = useState('');

  const collection = COLLECTIONS.find((c) => c.id === col);
  const baseGames = collection ? GAMES.filter((g) => collection.games.includes(g.id)) : GAMES;

  const games = useMemo(() => {
    return baseGames.filter((g) => {
      if (cat && g.category !== cat) return false;
      if (q && !`${g.name} ${g.tagline} ${g.desc}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [baseGames, cat, q]);

  const setCat = (c: GameCategory | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set('cat', c);
    else next.delete('cat');
    setParams(next, { replace: true });
  };

  return (
    <div className="px-5 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          {collection ? collection.label : 'Catalogue Happy'}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {collection ? `${games.length} jeux dans cette sélection.` : 'Explore les 12 expériences à ton rythme.'}
        </p>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un jeu, une humeur..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-stone-200 text-sm placeholder:text-stone-400 focus:outline-none focus:border-rose-300"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto -mx-5 px-5 pb-1">
        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-stone-500">
          <Filter className="w-3.5 h-3.5" /> Filtrer
        </span>
        <button
          onClick={() => setCat(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            cat === null ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-700'
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition inline-flex items-center gap-1 ${
              cat === c.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white border-stone-200 text-stone-700'
            }`}
          >
            <c.icon className="w-3.5 h-3.5" strokeWidth={2} /> {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {games.length === 0 ? (
        <div className="mt-10 text-center text-stone-500 text-sm">Aucun jeu trouvé. Essaie une autre recherche.</div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/jeux-bien-etre/jeu/${g.id}`)}
              className="rounded-3xl overflow-hidden bg-white border border-stone-100 text-left hover:shadow-md transition"
            >
              <div className="relative h-32">
                <ImageWithFallback src={HAPPY[g.cover]} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${g.accent} opacity-65 mix-blend-multiply`} />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold inline-flex items-center gap-1">
                  <g.icon className="w-3 h-3 text-stone-800" strokeWidth={2} /> {CATEGORIES.find((c) => c.id === g.category)?.label}
                </div>
                {!g.playable && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-semibold">
                    Bientôt
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-bold text-sm text-stone-900 truncate">{g.name}</div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">{g.tagline}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-stone-500">
                  <Clock className="w-3 h-3" /> {g.duration}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
