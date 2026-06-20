import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, Download, Clock, Library, Play, Trash2, Search, Headphones } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PODCAST_EPISODES, PodcastEpisode } from '../components/podcasts';
import { usePodcastState, PodcastHistoryEntry } from '../components/usePodcastState';
import { removeOffline } from '../components/offlineAudio';

interface Props { onBack: () => void; onOpenEpisode?: (id: string) => void }

type Tab = 'favoris' | 'telecharges' | 'historique';

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const relTime = (at: number) => {
  const diff = (Date.now() - at) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
};

export default function BibliothequePodcastScreen({ onBack, onOpenEpisode }: Props) {
  const { state, toggleFav, toggleDownload, recordHistory, clearHistory } = usePodcastState();
  const [tab, setTab] = useState<Tab>('favoris');
  const [query, setQuery] = useState('');

  const favs = useMemo(() => PODCAST_EPISODES.filter((e) => state.favs.includes(e.id)), [state.favs]);
  const dls = useMemo(() => PODCAST_EPISODES.filter((e) => state.downloads.includes(e.id)), [state.downloads]);
  const history = useMemo(
    () => state.history
      .map((h) => ({ entry: h, ep: PODCAST_EPISODES.find((e) => e.id === h.id) }))
      .filter((x): x is { entry: PodcastHistoryEntry; ep: PodcastEpisode } => !!x.ep),
    [state.history]
  );

  const filterList = <T extends { ep: PodcastEpisode } | PodcastEpisode>(arr: T[]): T[] => {
    if (!query.trim()) return arr;
    const q = query.toLowerCase();
    return arr.filter((item) => {
      const ep = (item as any).ep ?? (item as PodcastEpisode);
      return ep.title.toLowerCase().includes(q) || ep.host.toLowerCase().includes(q) || ep.cat.toLowerCase().includes(q);
    });
  };

  const counts = { favoris: favs.length, telecharges: dls.length, historique: history.length };

  return (
    <div className="min-h-full bg-[#F7F9FF] text-[#0B1220] pb-24">
      <div className="relative bg-gradient-to-br from-[#1E5BFF] via-[#3a6dff] to-[#12C76F] text-white">
        <div className="absolute -top-16 -right-10 w-60 h-60 rounded-full bg-[#FFD400]/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full bg-[#FF4D8D]/30 blur-3xl" />
        <div className="relative px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} aria-label="Retour" className="p-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 hover:bg-white/25">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
              <Library className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">BIBLIOTHÈQUE PODCAST</span>
            </div>
            <div className="w-9" />
          </div>

          <h1 className="mt-5 font-black leading-tight" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>
            Vos écoutes,<br /><span className="text-[#FFD400]">à portée de main.</span>
          </h1>
          <p className="mt-2 text-white/85 text-sm">Synchronisé sur tous vos appareils.</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Favoris" value={counts.favoris} />
            <Stat label="Téléchargés" value={counts.telecharges} />
            <Stat label="Historique" value={counts.historique} />
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer la bibliothèque…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 placeholder:text-white/70 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-[#F7F9FF]/95 backdrop-blur-md border-b border-slate-100">
        <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <TabBtn active={tab === 'favoris'} onClick={() => setTab('favoris')} icon={<Heart className="w-3.5 h-3.5" />} label={`Favoris (${counts.favoris})`} />
          <TabBtn active={tab === 'telecharges'} onClick={() => setTab('telecharges')} icon={<Download className="w-3.5 h-3.5" />} label={`Téléchargés (${counts.telecharges})`} />
          <TabBtn active={tab === 'historique'} onClick={() => setTab('historique')} icon={<Clock className="w-3.5 h-3.5" />} label={`Historique (${counts.historique})`} />
        </div>
      </div>

      <section className="px-4 pt-5 space-y-3">
        {tab === 'favoris' && (
          filterList(favs).length === 0
            ? <Empty icon={<Heart className="w-6 h-6" />} title="Aucun favori" desc="Marquez un épisode avec le cœur pour le retrouver ici." />
            : filterList(favs).map((ep) => (
                <EpisodeRow key={ep.id} ep={ep}
                  onPlay={() => onOpenEpisode?.(ep.id)}
                  right={
                    <button onClick={() => toggleFav(ep.id)} className="p-2 rounded-full bg-rose-50 text-rose-600">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  }
                />
              ))
        )}

        {tab === 'telecharges' && (
          filterList(dls).length === 0
            ? <Empty icon={<Download className="w-6 h-6" />} title="Aucun téléchargement" desc="Téléchargez un épisode pour l'écouter hors-ligne." />
            : filterList(dls).map((ep) => (
                <EpisodeRow key={ep.id} ep={ep}
                  onPlay={() => onOpenEpisode?.(ep.id)}
                  badge="Hors-ligne"
                  right={
                    <button onClick={async () => { await removeOffline(ep.src); toggleDownload(ep.id); }} className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                      <Download className="w-4 h-4" />
                    </button>
                  }
                />
              ))
        )}

        {tab === 'historique' && (
          <>
            {history.length > 0 && (
              <div className="flex justify-end">
                <button onClick={clearHistory} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" /> Effacer l'historique
                </button>
              </div>
            )}
            {filterList(history).length === 0
              ? <Empty icon={<Clock className="w-6 h-6" />} title="Historique vide" desc="Vos épisodes écoutés apparaîtront ici." />
              : filterList(history).map(({ ep, entry }) => {
                  const total = entry.duration ?? ep.durationSec;
                  const pct = Math.min((entry.pos / Math.max(total, 1)) * 100, 100);
                  return (
                    <EpisodeRow key={ep.id + entry.at} ep={ep}
                      onPlay={() => { recordHistory(ep.id, entry.pos, total); onOpenEpisode?.(ep.id); }}
                      meta={`${relTime(entry.at)} • à ${fmt(entry.pos)}`}
                      progress={pct}
                    />
                  );
                })}
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 px-3 py-2 text-center">
      <div className="font-black text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/80">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold ring-1 transition ${
        active ? 'bg-[#1E5BFF] text-white ring-transparent shadow-md' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
      }`}>
      {icon} {label}
    </button>
  );
}

function Empty({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 p-8 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 grid place-items-center text-slate-400">{icon}</div>
      <div className="font-bold mt-3">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{desc}</div>
    </div>
  );
}

function EpisodeRow({ ep, onPlay, right, meta, badge, progress }: {
  ep: PodcastEpisode; onPlay: () => void; right?: React.ReactNode; meta?: string; badge?: string; progress?: number;
}) {
  return (
    <motion.article layout className="rounded-2xl bg-white ring-1 ring-slate-100 overflow-hidden">
      <div className="flex gap-3 p-3">
        <button onClick={onPlay} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
          <ImageWithFallback src={ep.cover} alt={ep.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/25 grid place-items-center">
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
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${ep.tag}`}>{ep.cat}</span>
            {badge && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{badge}</span>}
          </div>
          <div className="font-bold text-sm leading-tight mt-1 line-clamp-2">{ep.title}</div>
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
