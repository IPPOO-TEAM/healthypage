import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Apple, Brain, Activity, Baby, Stethoscope, Leaf, Sparkles, Globe2, Play, ChevronDown, Compass, ListMusic, Zap, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import EpisodeCard from '../components/EpisodeCard';
import { CAT_BANNERS, COLLECTIONS, SHORTS, SERIES, AGE_GROUPS, CIRCLES } from '../editorial';

const CATS = [
  { id: 'all', label: 'Tous', Icon: Sparkles, fg: 'text-[#1E5BFF]', bg: 'bg-[#E2ECFF]' },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple, fg: 'text-[#0F8A4F]', bg: 'bg-[#E6F8EE]' },
  { id: 'mental', label: 'Santé mentale', Icon: Brain, fg: 'text-[#3046C7]', bg: 'bg-[#E4E8FF]' },
  { id: 'sport', label: 'Sport', Icon: Activity, fg: 'text-[#A85800]', bg: 'bg-[#FFEFD9]' },
  { id: 'maternite', label: 'Maternité', Icon: Baby, fg: 'text-[#B0285E]', bg: 'bg-[#FFE0EC]' },
  { id: 'prevention', label: 'Prévention', Icon: Stethoscope, fg: 'text-[#1240C7]', bg: 'bg-[#E2ECFF]' },
  { id: 'tradition', label: 'Pharmacopée', Icon: Leaf, fg: 'text-[#8A6A00]', bg: 'bg-[#FFF6CC]' },
];

const LANGS: { id: 'all' | 'fr' | 'fon' | 'yor' | 'wol' | 'hau' | 'ibo' | 'lin' | 'bam' | 'ful' | 'dyu' | 'sen' | 'zar'; label: string }[] = [
  { id: 'all', label: 'Toutes langues' },
  { id: 'fr', label: 'Français' },
  { id: 'fon', label: 'Fon' },
  { id: 'yor', label: 'Yoruba' },
  { id: 'wol', label: 'Wolof' },
  { id: 'hau', label: 'Haoussa' },
  { id: 'ibo', label: 'Igbo' },
  { id: 'lin', label: 'Lingala' },
  { id: 'bam', label: 'Bambara' },
  { id: 'ful', label: 'Peul' },
  { id: 'dyu', label: 'Dioula' },
  { id: 'sen', label: 'Sénoufo' },
  { id: 'zar', label: 'Djerma' },
];

export default function PodcastDiscoverScreen() {
  const { episodes, play } = usePodcastPlayer();
  const [params] = useSearchParams();
  const initial = params.get('cat') ?? 'all';
  const [active, setActive] = useState<string>(initial);
  const [lang, setLang] = useState<typeof LANGS[number]['id']>('all');
  const [sort, setSort] = useState<'recent' | 'long' | 'short'>('recent');
  const [openCats, setOpenCats] = useState(true);

  const filtered = useMemo(() => {
    let arr = active === 'all' ? episodes : episodes.filter((e) => e.cat === active);
    if (lang !== 'all') arr = arr.filter((e) => e.lang === lang);
    arr = [...arr];
    if (sort === 'recent') arr.sort((a, b) => b.publishedAt - a.publishedAt);
    if (sort === 'long') arr.sort((a, b) => b.durationSec - a.durationSec);
    if (sort === 'short') arr.sort((a, b) => a.durationSec - b.durationSec);
    return arr;
  }, [active, lang, sort, episodes]);

  const featured = filtered[0];

  return (
    <div className="pb-2">
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1632800237110-f9c87acc2222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/55 to-transparent" />
        <div className="relative h-full px-4 flex flex-col justify-end pb-4 text-white">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFD400]">
            <Compass className="w-3.5 h-3.5" /> Découvrir
          </div>
          <h1 className="font-black mt-1" style={{ fontSize: 'clamp(1.5rem, 5.2vw, 2rem)' }}>Explorez les voix de la santé</h1>
          <p className="text-sm text-white/80 mt-1">Catégories, langues et durées.</p>
        </div>
      </section>

      <section className="px-4 pt-5">
        <button onClick={() => setOpenCats((v) => !v)} className="w-full flex items-center justify-between bg-white ring-1 ring-[#E6EAF2] rounded-xl px-4 py-3">
          <span className="font-bold text-sm">Catégories</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition ${openCats ? 'rotate-180' : ''}`} />
        </button>
        {openCats && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CATS.map(({ id, label, Icon, fg, bg }) => {
              const count = id === 'all' ? episodes.length : episodes.filter((e) => e.cat === id).length;
              const isActive = active === id;
              return (
                <button key={id} onClick={() => setActive(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg ring-1 text-xs font-bold transition ${
                    isActive ? 'bg-[#1E5BFF] text-white ring-transparent shadow-sm' : `${bg} ${fg} ring-[#E6EAF2]`
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/70'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-4 pt-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
          <Globe2 className="w-3.5 h-3.5" /> Langue
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {LANGS.map((l) => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 transition ${
                lang === l.id ? 'bg-[#0B1220] text-white ring-transparent' : 'bg-white text-slate-700 ring-[#E6EAF2]'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="flex gap-2">
          {(['recent', 'long', 'short'] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ring-1 ${
                sort === s ? 'bg-[#1E5BFF] text-white ring-transparent' : 'bg-white ring-[#E6EAF2] text-slate-700'
              }`}>
              {s === 'recent' ? 'Plus récents' : s === 'long' ? 'Plus longs' : 'Plus courts'}
            </button>
          ))}
        </div>
      </section>

      {featured && (
        <section className="px-4 pt-5">
          <button onClick={() => play(featured)} className="w-full text-left rounded-2xl overflow-hidden relative h-44 active:scale-[0.99] transition shadow-md">
            <ImageWithFallback src={featured.cover} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-[#FFD400]">Sélection de l'éditeur</div>
                <div className="font-black text-base leading-tight line-clamp-2 mt-1">{featured.title}</div>
                <div className="text-[11px] text-white/75 mt-1">{featured.host} • {featured.duration}</div>
              </div>
              <span className="w-12 h-12 rounded-full bg-[#1E5BFF] grid place-items-center shrink-0 shadow-md">
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              </span>
            </div>
          </button>
        </section>
      )}

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3">Bannières par rubrique</h2>
        <div className="grid grid-cols-2 gap-3">
          {CAT_BANNERS.map((b) => (
            <button key={b.id} onClick={() => setActive(b.id)} className="relative h-32 rounded-xl overflow-hidden text-left text-white">
              <ImageWithFallback src={b.img} alt={b.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${b.tint} via-[#0B1220]/40 to-transparent`} />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="font-black text-sm leading-tight">{b.label}</div>
                <div className="text-[11px] opacity-90">{episodes.filter((e) => e.cat === b.id).length} épisodes</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <ListMusic className="w-4 h-4 text-[#12C76F]" /> Playlists du week-end
          </h2>
          <span className="text-xs text-slate-500">{COLLECTIONS.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {COLLECTIONS.map((c) => (
            <button key={c.id} onClick={() => play(episodes[0])} className="shrink-0 w-52 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2]">
              <div className="relative h-28">
                <ImageWithFallback src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.tone} opacity-60`} />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-[#0B1220]">{c.episodes} ép.</div>
              </div>
              <div className="p-2.5">
                <div className="font-bold text-sm leading-tight line-clamp-1 text-[#0B1220]">{c.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3 inline-flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#FFD400]" /> Capsules express
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {SHORTS.map((s) => (
            <button key={s.id} onClick={() => play(episodes[0])} className="shrink-0 w-40 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2]">
              <div className="relative h-40">
                <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/85 via-[#0B1220]/20 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FFD400] text-[#0B1220] text-[10px] font-black">{s.min} min</div>
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                  <div className="font-bold text-[12px] leading-tight line-clamp-2">{s.title}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3 inline-flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#1E5BFF]" /> Programmes guidés
        </h2>
        <div className="space-y-3">
          {SERIES.map((s) => (
            <button key={s.id} onClick={() => play(episodes[0])} className="w-full text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
              <div className="relative w-28 shrink-0">
                <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${s.tone} opacity-55`} />
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/95 text-[#0B1220] text-[10px] font-black">{s.days}j</div>
              </div>
              <div className="flex-1 p-3 min-w-0">
                <div className="font-black text-sm leading-tight line-clamp-1 text-[#0B1220]">{s.title}</div>
                <div className="text-[12px] text-slate-500 mt-1 line-clamp-2">{s.subtitle}</div>
                <div className="text-[11px] text-[#1E5BFF] font-bold mt-1.5">{s.episodes} épisodes</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3 inline-flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#FF4D8D]" /> Cercles & communautés
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {CIRCLES.map((c) => (
            <button key={c.id} onClick={() => play(episodes[0])} className="relative rounded-xl overflow-hidden h-32 text-left text-white">
              <ImageWithFallback src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${c.tint} via-[#0B1220]/40 to-transparent`} />
              <div className="relative h-full p-2.5 flex flex-col justify-end">
                <div className="font-black text-sm leading-tight">{c.title}</div>
                <div className="text-[11px] opacity-90">{c.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3">Pour chaque âge</h2>
        <div className="grid grid-cols-2 gap-3">
          {AGE_GROUPS.map((a) => (
            <button key={a.id} className="relative rounded-xl overflow-hidden h-28 text-left text-white">
              <ImageWithFallback src={a.img} alt={a.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${a.tint} via-[#0B1220]/40 to-transparent`} />
              <div className="relative h-full p-2.5 flex flex-col justify-end">
                <div className="font-black text-sm leading-tight">{a.label}</div>
                <div className="text-[11px] opacity-90">{a.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base">{filtered.length} épisode{filtered.length > 1 ? 's' : ''}</h2>
        </div>
        <div className="space-y-3">
          {filtered.map((e) => <EpisodeCard key={e.id} ep={e} variant="wide" />)}
          {filtered.length === 0 && (
            <div className="rounded-xl bg-white ring-1 ring-[#E6EAF2] p-8 text-center text-sm text-slate-500">
              Aucun épisode dans cette sélection.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
