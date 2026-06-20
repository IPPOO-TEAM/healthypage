import { useMemo, useState } from 'react';
import { Heart, Download, Clock, Library, Play, Trash2, Search, Headphones, ListMusic, Quote, Mic2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { removeOffline } from '../../components/offlineAudio';
import { PodcastEpisode } from '../../components/podcasts';
import { fmtTime } from '../components/EpisodeCard';
import { COLLECTIONS, STORIES, EXPERTS } from '../editorial';

type Tab = 'favoris' | 'telecharges' | 'historique';

const relTime = (at: number) => {
  const d = (Date.now() - at) / 1000;
  if (d < 60) return "à l'instant";
  if (d < 3600) return `il y a ${Math.floor(d / 60)} min`;
  if (d < 86400) return `il y a ${Math.floor(d / 3600)} h`;
  return `il y a ${Math.floor(d / 86400)} j`;
};

export default function PodcastLibraryScreen() {
  const { episodes, state, play, toggleFav, toggleDownload, clearHistory } = usePodcastPlayer();
  const [tab, setTab] = useState<Tab>('favoris');
  const [query, setQuery] = useState('');

  const favs = useMemo(() => episodes.filter((e) => state.favs.includes(e.id)), [episodes, state.favs]);
  const dls = useMemo(() => episodes.filter((e) => state.downloads.includes(e.id)), [episodes, state.downloads]);
  const history = useMemo(
    () => state.history.map((h) => ({ entry: h, ep: episodes.find((e) => e.id === h.id) }))
                      .filter((x): x is { entry: typeof state.history[number]; ep: PodcastEpisode } => !!x.ep),
    [state.history, episodes]
  );

  const totalMin = useMemo(() => Math.round(state.history.reduce((s, h) => s + (h.pos / 60), 0)), [state.history]);

  const filterEps = (arr: PodcastEpisode[]) => {
    if (!query.trim()) return arr;
    const q = query.toLowerCase();
    return arr.filter((ep) => ep.title.toLowerCase().includes(q) || ep.host.toLowerCase().includes(q) || ep.cat.toLowerCase().includes(q));
  };

  return (
    <div className="pb-2">
      <section className="relative text-white px-4 pt-7 pb-7 overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1688420764064-ef0dfa672cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220]/95 via-[#0B1220]/80 to-[#1E5BFF]/70" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FFD400]">
            <Library className="w-3.5 h-3.5" /> Bibliothèque
          </div>
          <h1 className="font-black mt-1.5" style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.1rem)' }}>Vos écoutes</h1>
          <p className="text-white/75 text-sm mt-1">Synchronisé sur tous vos appareils.</p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <Stat label="Favoris" value={favs.length} />
            <Stat label="Téléchargés" value={dls.length} />
            <Stat label="Écoutes" value={history.length} />
            <Stat label="Minutes" value={totalMin} />
          </div>

          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrer la bibliothèque…"
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/15 ring-1 ring-white/20 placeholder:text-white/70 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD400]" />
          </div>
        </div>
      </section>

      <div className="sticky top-12 z-10 bg-[#F7F9FF]/95 backdrop-blur-md border-b border-[#E6EAF2]">
        <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <TabBtn active={tab === 'favoris'} onClick={() => setTab('favoris')} icon={<Heart className="w-3.5 h-3.5" />} label={`Favoris (${favs.length})`} />
          <TabBtn active={tab === 'telecharges'} onClick={() => setTab('telecharges')} icon={<Download className="w-3.5 h-3.5" />} label={`Téléchargés (${dls.length})`} />
          <TabBtn active={tab === 'historique'} onClick={() => setTab('historique')} icon={<Clock className="w-3.5 h-3.5" />} label={`Historique (${history.length})`} />
        </div>
      </div>

      <section className="px-4 pt-5 space-y-3">
        {tab === 'favoris' && (
          filterEps(favs).length === 0
            ? <Empty icon={<Heart className="w-6 h-6" />} title="Aucun favori" desc="Marquez un épisode avec le cœur pour le retrouver ici." />
            : filterEps(favs).map((ep) => (
                <Row key={ep.id} ep={ep} onPlay={() => play(ep)}
                  right={<button onClick={() => toggleFav(ep.id)} className="p-2 rounded-md bg-rose-50 text-[#FF4D8D]"><Heart className="w-4 h-4 fill-current" /></button>} />
              ))
        )}

        {tab === 'telecharges' && (
          filterEps(dls).length === 0
            ? <Empty icon={<Download className="w-6 h-6" />} title="Aucun téléchargement" desc="Téléchargez un épisode pour l'écouter hors-ligne." />
            : filterEps(dls).map((ep) => (
                <Row key={ep.id} ep={ep} onPlay={() => play(ep)} badge="Hors-ligne"
                  right={<button onClick={async () => { await removeOffline(ep.src); toggleDownload(ep); }} className="p-2 rounded-md bg-emerald-50 text-[#12C76F]"><Download className="w-4 h-4" /></button>} />
              ))
        )}

        {tab === 'historique' && (
          <>
            {history.length > 0 && (
              <div className="flex justify-end">
                <button onClick={clearHistory} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#FF2D2D]">
                  <Trash2 className="w-3.5 h-3.5" /> Effacer l'historique
                </button>
              </div>
            )}
            {history.length === 0
              ? <Empty icon={<Clock className="w-6 h-6" />} title="Historique vide" desc="Vos épisodes écoutés apparaîtront ici." />
              : history.filter(({ ep }) => filterEps([ep]).length).map(({ ep, entry }) => {
                  const total = entry.duration ?? ep.durationSec;
                  const pct = Math.min((entry.pos / Math.max(total, 1)) * 100, 100);
                  return (
                    <Row key={ep.id + entry.at} ep={ep} onPlay={() => play(ep)}
                      meta={`${relTime(entry.at)} • à ${fmtTime(entry.pos)}`} progress={pct} />
                  );
                })}
          </>
        )}
      </section>

      <section className="px-4 pt-8">
        <h2 className="font-black text-base mb-3 flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#12C76F]" /> À sauvegarder
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {COLLECTIONS.map((c) => (
            <button key={c.id} onClick={() => play(episodes[0])} className="shrink-0 w-52 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] shadow-sm">
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
        <h2 className="font-black text-base mb-3 flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-[#1E5BFF]" /> Experts à suivre
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {EXPERTS.map((x) => (
            <button key={x.id} className="shrink-0 w-40 text-left rounded-xl overflow-hidden ring-1 ring-[#E6EAF2] bg-white">
              <div className="relative h-40">
                <ImageWithFallback src={x.img} alt={x.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/85 via-[#0B1220]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                  <div className="font-black text-sm leading-tight line-clamp-1">{x.name}</div>
                  <div className="text-[11px] opacity-90">{x.role}</div>
                </div>
              </div>
              <div className="px-2.5 py-2 text-[11px] text-slate-500">{x.episodes} épisodes</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3 flex items-center gap-2">
          <Quote className="w-4 h-4 text-[#FF4D8D]" /> Témoignages d'auditeurs
        </h2>
        <div className="space-y-3">
          {STORIES.slice(0, 3).map((s) => (
            <article key={s.id} className="rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
              <ImageWithFallback src={s.img} alt={s.name} className="w-24 object-cover" />
              <div className="flex-1 p-3 min-w-0">
                <div className="text-[10px] font-bold text-[#1E5BFF]">{s.cat}</div>
                <p className="text-[13px] text-[#0B1220] leading-snug mt-1 line-clamp-3 italic">"{s.quote}"</p>
                <div className="text-[11px] text-slate-500 mt-1.5">— {s.name}, {s.age} ans</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 ring-1 ring-white/15 px-2 py-2 text-center backdrop-blur">
      <div className="font-black text-lg leading-none">{value}</div>
      <div className="text-[10px] text-white/80 mt-1">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold ring-1 transition ${
        active ? 'bg-[#1E5BFF] text-white ring-transparent shadow-sm' : 'bg-white text-slate-700 ring-[#E6EAF2] hover:bg-slate-50'
      }`}>
      {icon} {label}
    </button>
  );
}

function Empty({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-[#E6EAF2] p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-xl bg-[#E2ECFF] grid place-items-center text-[#1E5BFF]">{icon}</div>
      <div className="font-black mt-4">{title}</div>
      <div className="text-sm text-slate-500 mt-1.5 max-w-[260px] mx-auto">{desc}</div>
    </div>
  );
}

function Row({ ep, onPlay, right, meta, badge, progress }: {
  ep: PodcastEpisode; onPlay: () => void; right?: React.ReactNode; meta?: string; badge?: string; progress?: number;
}) {
  return (
    <motion.article layout className="rounded-xl bg-white ring-1 ring-[#E6EAF2] overflow-hidden">
      <div className="flex gap-3 p-3">
        <button onClick={onPlay} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
          <ImageWithFallback src={ep.cover} alt={ep.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 grid place-items-center">
            <Play className="w-6 h-6 text-white fill-current ml-0.5" />
          </div>
          {progress != null && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/30">
              <div className="h-full bg-[#FFD400]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#1E5BFF]">{ep.cat}</span>
            {badge && <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F8EE] text-[#0F8A4F]">{badge}</span>}
          </div>
          <div className="font-bold text-sm leading-tight mt-0.5 line-clamp-2 text-[#0B1220]">{ep.title}</div>
          <div className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1">
            <Headphones className="w-3 h-3" /> {ep.host} • {ep.duration}
          </div>
          {meta && <div className="text-[11px] text-slate-500 mt-1">{meta}</div>}
        </div>
        {right && <div className="self-start">{right}</div>}
      </div>
    </motion.article>
  );
}
