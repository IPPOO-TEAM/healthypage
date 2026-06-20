import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, X, TrendingUp, Mic2, Sparkles, Quote, ListMusic, Play } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import EpisodeCard, { fmtTime } from '../components/EpisodeCard';
import { loadTranscript, searchWords, TimedWord } from '../../components/podcastTranscript';
import { PodcastEpisode } from '../../components/podcasts';
import { COLLECTIONS, STORIES, MOODS, CAT_BANNERS } from '../editorial';

type TranscriptHit = { ep: PodcastEpisode; t: number; snippet: string };

const SUGGESTIONS = ['anxiété', 'tension', 'allaitement', 'moringa', 'sport dos', 'budget'];

export default function PodcastSearchScreen() {
  const { episodes, seekTo, play, current } = usePodcastPlayer();
  const [query, setQuery] = useState('');
  const [transcripts, setTranscripts] = useState<Record<string, TimedWord[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.all(episodes.map(async (ep) => {
      if (transcripts[ep.id]) return [ep.id, transcripts[ep.id]] as const;
      const w = await loadTranscript(ep);
      return [ep.id, w] as const;
    })).then((rows) => {
      setTranscripts((cur) => {
        const n = { ...cur };
        for (const [id, words] of rows) n[id] = words;
        return n;
      });
      setLoading(false);
    });
  }, [query, episodes]);

  const epHits = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return episodes.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.host.toLowerCase().includes(q) ||
      e.cat.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q)
    );
  }, [query, episodes]);

  const transcriptHits = useMemo<TranscriptHit[]>(() => {
    if (!query.trim()) return [];
    const out: TranscriptHit[] = [];
    for (const ep of episodes) {
      const words = transcripts[ep.id];
      if (!words) continue;
      const hits = searchWords(words, query);
      hits.forEach((idx) => {
        const start = Math.max(0, idx - 4);
        const end = Math.min(words.length, idx + 5);
        const snippet = words.slice(start, end).map((w) => w.w).join(' ');
        out.push({ ep, t: words[idx].t, snippet });
      });
    }
    return out.slice(0, 25);
  }, [query, transcripts, episodes]);

  const popularHosts = useMemo(() => Array.from(new Map(episodes.map((e) => [e.host, e])).values()).slice(0, 4), [episodes]);

  return (
    <div className="pb-2">
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1662858557337-48c9ecf07ee0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/55 to-transparent" />
        <div className="relative h-full px-4 flex flex-col justify-end pb-4 text-white">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFD400]">
            <Search className="w-3.5 h-3.5" /> Recherche
          </div>
          <h1 className="font-black mt-1" style={{ fontSize: 'clamp(1.5rem, 5.2vw, 2rem)' }}>Trouvez la bonne voix</h1>
          <p className="text-sm text-white/80 mt-1">Titres, invités et transcriptions complètes.</p>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
            placeholder="Tapez un mot, un nom, un thème…"
            className="w-full pl-11 pr-11 py-3 rounded-lg bg-white ring-1 ring-[#E6EAF2] focus:outline-none focus:ring-2 focus:ring-[#1E5BFF] shadow-sm" />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-[#F1F4FB] grid place-items-center">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>
      </section>

      {!query.trim() && (
        <>
          <section className="px-4 pt-6">
            <div className="flex items-center gap-1.5 text-sm font-black mb-3">
              <TrendingUp className="w-4 h-4 text-[#FF8A00]" /> Recherches populaires
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-lg bg-white ring-1 ring-[#E6EAF2] text-sm font-bold text-slate-700 active:scale-95 transition">
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="flex items-center gap-1.5 text-sm font-black mb-3">
              <Mic2 className="w-4 h-4 text-[#1E5BFF]" /> Voix populaires
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularHosts.map((ep) => (
                <button key={ep.host} onClick={() => setQuery(ep.host.split(' ')[1] ?? ep.host)}
                  className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-[#E6EAF2] p-3 text-left">
                  <ImageWithFallback src={ep.cover} alt={ep.host} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] leading-tight line-clamp-1 text-[#0B1220]">{ep.host}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{ep.cat}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <h2 className="font-black text-base mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD400]" /> Parcourir par thème
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {CAT_BANNERS.map((b) => (
                <button key={b.id} onClick={() => setQuery(b.label)} className="relative h-24 rounded-xl overflow-hidden text-left text-white">
                  <ImageWithFallback src={b.img} alt={b.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${b.tint} via-[#0B1220]/40 to-transparent`} />
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <div className="font-black text-sm leading-tight">{b.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <h2 className="font-black text-base mb-3 flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#12C76F]" /> Collections à découvrir
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
              {COLLECTIONS.map((c) => (
                <button key={c.id} onClick={() => play(episodes[0])} className="shrink-0 w-52 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] shadow-sm">
                  <div className="relative h-28">
                    <ImageWithFallback src={c.img} alt={c.title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${c.tone} opacity-60`} />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-[#0B1220]">{c.episodes} ép.</div>
                    <div className="absolute bottom-2 left-2 w-9 h-9 rounded-full bg-white grid place-items-center shadow-md">
                      <Play className="w-4 h-4 text-[#1E5BFF] fill-current ml-0.5" />
                    </div>
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
            <h2 className="font-black text-base mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF8A00]" /> Selon l'humeur
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m) => (
                <button key={m.id} onClick={() => setQuery(m.title)} className="relative rounded-xl overflow-hidden h-24 text-left text-white">
                  <ImageWithFallback src={m.img} alt={m.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${m.tint} opacity-75`} />
                  <div className="relative h-full p-2.5 flex flex-col justify-end">
                    <div className="font-black text-sm leading-tight">{m.title}</div>
                    <div className="text-[11px] opacity-90">{m.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <h2 className="font-black text-base mb-3 flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#FF4D8D]" /> Ils en parlent
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
              {STORIES.map((s) => (
                <article key={s.id} className="shrink-0 w-72 rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
                  <ImageWithFallback src={s.img} alt={s.name} className="w-24 object-cover" />
                  <div className="flex-1 p-3 min-w-0">
                    <div className="text-[10px] font-bold text-[#1E5BFF]">{s.cat}</div>
                    <p className="text-[12px] text-[#0B1220] leading-snug mt-1 line-clamp-3 italic">"{s.quote}"</p>
                    <div className="text-[11px] text-slate-500 mt-1.5">— {s.name}, {s.age} ans</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="text-sm font-black mb-3">Sélection à explorer</div>
            <div className="space-y-3">
              {episodes.slice(0, 3).map((e) => <EpisodeCard key={e.id} ep={e} variant="wide" />)}
            </div>
          </section>
        </>
      )}

      {query.trim() && (
        <>
          <section className="px-4 pt-5">
            <h2 className="font-bold text-sm text-slate-700 mb-3">{epHits.length} épisode{epHits.length > 1 ? 's' : ''}</h2>
            <div className="space-y-3">
              {epHits.map((e) => <EpisodeCard key={e.id} ep={e} variant="wide" />)}
              {epHits.length === 0 && (
                <div className="rounded-xl bg-white ring-1 ring-[#E6EAF2] p-6 text-center text-sm text-slate-500">
                  Aucun épisode correspondant.
                </div>
              )}
            </div>
          </section>

          <section className="px-4 pt-6">
            <h2 className="font-bold text-sm text-slate-700 mb-3 inline-flex items-center gap-2">
              Dans les transcriptions
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </h2>
            <div className="space-y-2">
              {transcriptHits.map((h, i) => (
                <button key={h.ep.id + i} onClick={() => { if (current?.id !== h.ep.id) play(h.ep); setTimeout(() => seekTo(h.t), 200); }}
                  className="w-full text-left rounded-xl bg-white ring-1 ring-[#E6EAF2] p-3 active:scale-[0.99] transition flex gap-3">
                  <ImageWithFallback src={h.ep.cover} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1E5BFF] line-clamp-1">{h.ep.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">à {fmtTime(h.t)} • {h.ep.host}</div>
                    <div className="text-sm text-slate-700 mt-1 italic line-clamp-2">…{h.snippet}…</div>
                  </div>
                </button>
              ))}
              {!loading && transcriptHits.length === 0 && (
                <div className="rounded-xl bg-white ring-1 ring-[#E6EAF2] p-6 text-center text-sm text-slate-500">
                  Aucune occurrence dans les transcriptions.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
