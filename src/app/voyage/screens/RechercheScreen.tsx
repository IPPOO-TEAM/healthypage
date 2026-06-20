import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Search, Star, MapPin, Wind, X, Globe2, Wallet } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX, INTENT_LABEL, Intent } from '../data';

const SUGGESTIONS = ['Saly', 'Casamance', 'Marrakech', 'Zanzibar', 'Sahara', 'Cape Town', 'Spa', 'Yoga'];
const INTENTS: Intent[] = ['souffler', 'nature', 'spa', 'meditation', 'detox', 'famille', 'senior', 'cure'];
const COUNTRIES = Array.from(new Set(LIEUX.map((l) => l.country)));

const PRICE_MIN = 30000;
const PRICE_MAX = 120000;
const PRICE_STEP = 1000;

export default function RechercheScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const intent = (params.get('intent') as Intent | null) || null;
  const country = params.get('country');
  const priceMin = Number(params.get('pmin') ?? PRICE_MIN);
  const priceMax = Number(params.get('pmax') ?? PRICE_MAX);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const setRange = (lo: number, hi: number) => {
    const next = new URLSearchParams(params);
    if (lo === PRICE_MIN) next.delete('pmin'); else next.set('pmin', String(lo));
    if (hi === PRICE_MAX) next.delete('pmax'); else next.set('pmax', String(hi));
    setParams(next, { replace: true });
  };

  // Garde-fou : si min > max suite à manipulation manuelle de l'URL
  useEffect(() => {
    if (priceMin > priceMax) setRange(Math.min(priceMin, priceMax), Math.max(priceMin, priceMax));
  }, [priceMin, priceMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const norm = q.trim().toLowerCase();
    return LIEUX.filter((l) => {
      if (intent && !l.intents.includes(intent)) return false;
      if (country && l.country !== country) return false;
      if (l.pricePerNight < priceMin || l.pricePerNight > priceMax) return false;
      if (!norm) return true;
      return (
        l.name.toLowerCase().includes(norm) ||
        l.region.toLowerCase().includes(norm) ||
        l.country.toLowerCase().includes(norm) ||
        l.tags.some((t) => t.toLowerCase().includes(norm))
      );
    });
  }, [q, intent, country, priceMin, priceMax]);

  const priceActive = priceMin !== PRICE_MIN || priceMax !== PRICE_MAX;
  const activeFilters = (intent ? 1 : 0) + (country ? 1 : 0) + (priceActive ? 1 : 0);
  const reset = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    setParams(next, { replace: true });
  };

  const pctLo = ((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const pctHi = ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="px-6 sm:px-8 pt-4 pb-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Destination, ressenti, ambiance…"
            className="w-full pl-9 pr-9 py-3 rounded-xl bg-stone-100 border border-stone-200 focus:border-rose-300 focus:bg-white outline-none text-sm"
          />
          {q && (
            <button onClick={() => setParam('q', null)} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-stone-400" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Suggestions</div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setParam('q', s)} className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs hover:bg-rose-50 hover:text-rose-700">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-2 inline-flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5" /> Pays</div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const active = country === c;
            return (
              <button
                key={c}
                onClick={() => setParam('country', active ? null : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  active ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider de prix continu */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-stone-500 inline-flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Budget par nuit (FCFA)
          </div>
          <div className="text-xs font-semibold text-stone-700">
            {priceMin.toLocaleString('fr-FR')} – {priceMax.toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="relative h-9 select-none">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-stone-200" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-amber-500"
            style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={priceMin}
            onChange={(e) => setRange(Math.min(Number(e.target.value), priceMax - PRICE_STEP), priceMax)}
            aria-label="Prix minimum"
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={priceMax}
            onChange={(e) => setRange(priceMin, Math.max(Number(e.target.value), priceMin + PRICE_STEP))}
            aria-label="Prix maximum"
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500"
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-stone-400">
          <span>{PRICE_MIN.toLocaleString('fr-FR')}</span>
          <span>{PRICE_MAX.toLocaleString('fr-FR')}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Intentions</div>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => {
            const active = intent === i;
            return (
              <button
                key={i}
                onClick={() => setParam('intent', active ? null : i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  active ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                {INTENT_LABEL[i]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm font-semibold text-stone-700">{results.length} résultat{results.length > 1 ? 's' : ''}</div>
        {activeFilters > 0 && (
          <button onClick={reset} className="text-xs text-rose-600 font-semibold inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Réinitialiser ({activeFilters})
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {results.map((l) => (
          <button
            key={l.id}
            onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
            className="w-full flex bg-white rounded-xl border border-stone-100 overflow-hidden text-left hover:shadow-md transition"
          >
            <ImageWithFallback src={AFR[l.hero]} alt={l.name} className="w-24 h-24 object-cover flex-shrink-0" />
            <div className="flex-1 p-3">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <MapPin className="w-3 h-3" /> {l.region}, {l.country}
              </div>
              <div className="font-semibold text-sm text-stone-900 mt-0.5">{l.name}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {l.rating}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Wind className="w-3 h-3" /> Calme {l.calmLevel}/5
                </span>
                <span className="text-stone-700">{l.pricePerNight.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </button>
        ))}
        {results.length === 0 && (
          <div className="text-center text-sm text-stone-500 py-8">Aucun résultat. Essayez un autre mot-clé ou élargissez le budget.</div>
        )}
      </div>
    </div>
  );
}
