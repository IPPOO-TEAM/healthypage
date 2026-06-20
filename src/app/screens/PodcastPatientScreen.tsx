import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Headphones, Search, Play, Pause, Heart, Download, Share2,
  SkipBack, SkipForward, X, Apple, Brain, Activity, Baby, Stethoscope, Leaf,
  Mic, ListMusic, Sparkles, Library, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PODCAST_EPISODES, PodcastEpisode } from '../components/podcasts';
import { usePodcastState } from '../components/usePodcastState';
import { loadTranscript, searchWords, TimedWord } from '../components/podcastTranscript';
import { downloadEpisode, removeOffline, getPlayableUrl } from '../components/offlineAudio';

interface Props { onBack: () => void; onOpenBibliotheque?: () => void; initialEpisodeId?: string }

const CATEGORIES = [
  { id: 'all', label: 'Tous', Icon: Sparkles, color: 'bg-[#1E5BFF] text-white' },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple, color: 'bg-emerald-500 text-white' },
  { id: 'mental', label: 'Santé mentale', Icon: Brain, color: 'bg-indigo-500 text-white' },
  { id: 'sport', label: 'Sport', Icon: Activity, color: 'bg-orange-500 text-white' },
  { id: 'maternite', label: 'Maternité', Icon: Baby, color: 'bg-pink-500 text-white' },
  { id: 'prevention', label: 'Prévention', Icon: Stethoscope, color: 'bg-sky-500 text-white' },
  { id: 'tradition', label: 'Pharmacopée', Icon: Leaf, color: 'bg-lime-500 text-white' },
];

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

export default function PodcastPatientScreen({ onBack, onOpenBibliotheque, initialEpisodeId }: Props) {
  const { state, toggleFav, toggleDownload, recordHistory } = usePodcastState();
  const favs = state.favs;
  const downloads = state.downloads;
  const history = state.history;

  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<PodcastEpisode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<TimedWord[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptQuery, setTranscriptQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRecordedSecond = useRef(0);
  const [playableSrc, setPlayableSrc] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadPct, setDownloadPct] = useState(0);

  useEffect(() => {
    if (!current) { setPlayableSrc(''); return; }
    let cancelled = false;
    getPlayableUrl(current.src).then((url) => { if (!cancelled) setPlayableSrc(url); });
    return () => { cancelled = true; };
  }, [current?.id]);

  const handleToggleDownload = async (ep: PodcastEpisode) => {
    if (downloads.includes(ep.id)) {
      await removeOffline(ep.src);
      toggleDownload(ep.id);
      return;
    }
    setDownloadingId(ep.id);
    setDownloadPct(0);
    const ok = await downloadEpisode(ep.src, (loaded, total) => {
      setDownloadPct(total > 0 ? Math.round((loaded / total) * 100) : 0);
    });
    setDownloadingId(null);
    setDownloadPct(0);
    if (ok) toggleDownload(ep.id);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setTime(a.currentTime);
      const sec = Math.floor(a.currentTime);
      if (current && sec !== lastRecordedSecond.current && sec % 10 === 0) {
        lastRecordedSecond.current = sec;
        recordHistory(current.id, a.currentTime, a.duration || current.durationSec);
      }
    };
    const onMeta = () => setDur(a.duration);
    const onEnd = () => {
      setPlaying(false);
      if (current) recordHistory(current.id, a.duration || 0, a.duration || current.durationSec);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, [current?.id, recordHistory]);

  useEffect(() => {
    if (!current || !showTranscript) return;
    setTranscriptLoading(true);
    let cancelled = false;
    loadTranscript(current).then((w) => {
      if (!cancelled) { setTranscript(w); setTranscriptLoading(false); }
    });
    return () => { cancelled = true; };
  }, [current?.id, showTranscript]);

  useEffect(() => {
    if (!initialEpisodeId) return;
    const ep = PODCAST_EPISODES.find((e) => e.id === initialEpisodeId);
    if (ep) playEpisode(ep);
  }, [initialEpisodeId]);

  const filtered = useMemo(() => PODCAST_EPISODES.filter((e) =>
    (active === 'all' || e.cat === active) &&
    (query === '' || e.title.toLowerCase().includes(query.toLowerCase()) || e.host.toLowerCase().includes(query.toLowerCase()))
  ), [active, query]);

  const playEpisode = (ep: PodcastEpisode) => {
    if (current?.id === ep.id) { togglePlay(); return; }
    setCurrent(ep);
    const last = history.find((h) => h.id === ep.id);
    const startPos = last && last.pos > 5 && (!last.duration || last.pos < last.duration - 5) ? last.pos : 0;
    setTime(startPos);
    setPlaying(true);
    recordHistory(ep.id, startPos, ep.durationSec);
    setTranscript([]);
    setTimeout(() => {
      const a = audioRef.current; if (!a) return;
      if (startPos) a.currentTime = startPos;
      a.play().catch(() => setPlaying(false));
    }, 50);
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().catch(() => setPlaying(false)); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  const seek = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  };

  const seekTo = (t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, t);
    if (a.paused) { a.play().catch(() => {}); setPlaying(true); }
  };

  const transcriptHits = useMemo(() => searchWords(transcript, transcriptQuery), [transcript, transcriptQuery]);
  const activeWordIdx = useMemo(() => {
    if (!transcript.length) return -1;
    let idx = -1;
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i].t <= time) idx = i; else break;
    }
    return idx;
  }, [transcript, time]);

  return (
    <div className="min-h-full bg-[#F7F9FF] text-[#0B1220] pb-32">
      <div className="relative bg-gradient-to-br from-[#1E5BFF] via-[#3a6dff] to-[#12C76F] text-white">
        <div className="absolute -top-16 -right-10 w-60 h-60 rounded-full bg-[#FFD400]/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full bg-[#FF4D8D]/30 blur-3xl" />
        <div className="relative px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} aria-label="Retour" className="p-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 hover:bg-white/25">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
              <Headphones className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">PODCAST SANTÉ</span>
            </div>
            <button onClick={onOpenBibliotheque} aria-label="Bibliothèque" className="p-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 hover:bg-white/25 relative">
              <Library className="w-5 h-5" />
              {(favs.length + downloads.length) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFD400] text-[#0B1220] text-[10px] font-black grid place-items-center">{favs.length + downloads.length}</span>
              )}
            </button>
          </div>

          <h1 className="mt-5 font-black leading-tight" style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)' }}>
            La santé africaine,<br /><span className="text-[#FFD400]">à hauteur d'oreille.</span>
          </h1>
          <p className="mt-3 text-white/90 leading-relaxed">
            Écoutez des médecins, sages-femmes et thérapeutes parler simplement des sujets qui comptent. Un épisode, un sujet, des conseils prêts à appliquer.
          </p>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un épisode, un expert…"
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 placeholder:text-white/70 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-[#F7F9FF]/95 backdrop-blur-md border-b border-slate-100">
        <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(({ id, label, Icon, color }) => {
            const isActive = active === id;
            return (
              <button key={id} onClick={() => setActive(id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold ring-1 transition ${isActive ? `${color} ring-transparent shadow-md` : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <section className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg flex items-center gap-2"><Play className="w-4 h-4 text-[#12C76F]" /> Reprendre l'écoute</h2>
            <button onClick={onOpenBibliotheque} className="text-xs font-bold text-[#1E5BFF] inline-flex items-center gap-1 hover:underline">
              <Library className="w-3.5 h-3.5" /> Bibliothèque
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {history.slice(0, 6).map((h) => {
              const ep = PODCAST_EPISODES.find((e) => e.id === h.id);
              if (!ep) return null;
              const total = h.duration ?? ep.durationSec;
              const pct = current?.id === ep.id && dur ? (time / dur) * 100 : (h.pos / total) * 100;
              return (
                <button key={ep.id + h.at} onClick={() => playEpisode(ep)} className="shrink-0 w-44 text-left rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100 shadow-sm">
                  <div className="relative h-24">
                    <ImageWithFallback src={ep.cover} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20"><div className="h-full bg-[#FFD400]" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                  </div>
                  <div className="p-2.5">
                    <div className="font-bold text-xs leading-tight line-clamp-2">{ep.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1">à {fmt(h.pos)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#FF8A00]" /> À la une</h2>
          <span className="text-xs text-slate-500">{PODCAST_EPISODES.length} épisodes</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {PODCAST_EPISODES.slice(0, 4).map((e) => (
            <button key={e.id} onClick={() => playEpisode(e)} className="shrink-0 w-56 text-left rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100 shadow-sm">
              <div className="relative h-32">
                <ImageWithFallback src={e.cover} alt={e.title} className="w-full h-full object-cover" />
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${e.tag}`}>{e.cat}</span>
                <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white grid place-items-center shadow-md">
                  <Play className="w-4 h-4 fill-current text-[#0B1220] ml-0.5" />
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm leading-tight line-clamp-2">{e.title}</div>
                <div className="text-xs text-slate-500 mt-1">{e.host} • {e.duration}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <button onClick={onOpenBibliotheque} className="w-full rounded-2xl p-4 bg-gradient-to-r from-[#FFD400] via-[#FF8A00] to-[#FF4D8D] text-[#0B1220] shadow-md text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Votre espace</span>
          <div className="font-black text-lg mt-1 leading-tight flex items-center gap-2">
            <Library className="w-5 h-5" /> Bibliothèque podcast
          </div>
          <p className="text-sm mt-1 opacity-90">{favs.length} favoris · {downloads.length} téléchargés · {history.length} écoutes — synchronisés sur tous vos appareils.</p>
        </button>
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2"><ListMusic className="w-4 h-4 text-[#1E5BFF]" /> Épisodes</h2>
        <div className="space-y-3">
          {filtered.map((e) => {
            const isCurrent = current?.id === e.id;
            const isFav = favs.includes(e.id);
            const isDl = downloads.includes(e.id);
            return (
              <article key={e.id} className={`rounded-2xl bg-white ring-1 transition overflow-hidden ${isCurrent ? 'ring-[#1E5BFF] shadow-md' : 'ring-slate-100'}`}>
                <div className="flex gap-3 p-3">
                  <button onClick={() => playEpisode(e)} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                    <ImageWithFallback src={e.cover} alt={e.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 grid place-items-center">
                      {isCurrent && playing
                        ? <Pause className="w-6 h-6 text-white fill-current" />
                        : <Play className="w-6 h-6 text-white fill-current ml-0.5" />}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${e.tag}`}>{e.cat}</span>
                    <div className="font-bold text-sm leading-tight mt-1 line-clamp-2">{e.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{e.host} • {e.duration}</div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">{e.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-3 pb-3">
                  <button onClick={() => toggleFav(e.id)} aria-label="Favori" className={`p-2 rounded-full ${isFav ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => handleToggleDownload(e)} aria-label="Télécharger" disabled={downloadingId === e.id} className={`p-2 rounded-full relative ${isDl ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'} disabled:opacity-60`}>
                    {downloadingId === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className={`w-4 h-4 ${isDl ? 'fill-current' : ''}`} />}
                    {downloadingId === e.id && downloadPct > 0 && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500">{downloadPct}%</span>
                    )}
                  </button>
                  <button aria-label="Partager" className="p-2 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Share2 className="w-4 h-4" /></button>
                  <button aria-label="Question" className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#1E5BFF] px-3 py-1.5 rounded-full hover:bg-blue-50">
                    <Mic className="w-3.5 h-3.5" /> Poser une question
                  </button>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-12">Aucun épisode trouvé.</div>
          )}
        </div>
      </section>

      {current && playableSrc && <audio ref={audioRef} src={playableSrc} preload="metadata" />}

      <AnimatePresence>
        {current && !expanded && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-16 left-2 right-2 z-30">
            <div onClick={() => setExpanded(true)} className="rounded-2xl bg-[#0B1220] text-white shadow-2xl ring-1 ring-white/10 overflow-hidden cursor-pointer">
              <div className="h-1 bg-white/10">
                <div className="h-full bg-[#FFD400]" style={{ width: `${(time / (dur || 1)) * 100}%` }} />
              </div>
              <div className="flex items-center gap-3 p-3">
                <ImageWithFallback src={current.cover} alt="" className="w-11 h-11 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{current.title}</div>
                  <div className="text-[11px] text-white/70 truncate">{current.host} • {fmt(time)} / {fmt(dur)}</div>
                </div>
                <button onClick={(ev) => { ev.stopPropagation(); togglePlay(); }} className="w-10 h-10 rounded-full bg-[#FFD400] text-[#0B1220] grid place-items-center shadow">
                  {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button onClick={(ev) => { ev.stopPropagation(); setCurrent(null); setPlaying(false); }} aria-label="Fermer" className="p-1.5 rounded-full hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {current && expanded && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 32 }} className="fixed inset-0 z-40 bg-gradient-to-br from-[#0B1220] via-[#1E5BFF]/90 to-[#12C76F]/80 text-white">
            <div className="h-full overflow-y-auto px-5 pt-5 pb-10 flex flex-col">
              <div className="flex items-center justify-between">
                <button onClick={() => setExpanded(false)} className="p-2 rounded-full bg-white/15 hover:bg-white/25"><ArrowLeft className="w-5 h-5" /></button>
                <span className="text-xs font-bold tracking-widest uppercase opacity-80">En lecture</span>
                <button onClick={() => { setCurrent(null); setPlaying(false); setExpanded(false); }} className="p-2 rounded-full bg-white/15 hover:bg-white/25"><X className="w-5 h-5" /></button>
              </div>

              <div className="mt-6 mx-auto w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                <ImageWithFallback src={current.cover} alt={current.title} className="w-full h-full object-cover" />
              </div>

              <div className="mt-6 text-center">
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${current.tag}`}>{current.cat}</span>
                <h3 className="mt-3 font-black text-2xl leading-tight">{current.title}</h3>
                <p className="text-white/80 text-sm mt-1">{current.host} • {current.duration}</p>
              </div>

              <div className="mt-6">
                <input type="range" min={0} max={dur || 0} value={time}
                  onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
                  className="w-full accent-[#FFD400]" />
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{fmt(time)}</span><span>{fmt(dur)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6">
                <button onClick={() => seek(-15)} className="p-3 rounded-full bg-white/10 hover:bg-white/20"><SkipBack className="w-6 h-6" /></button>
                <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-[#FFD400] text-[#0B1220] grid place-items-center shadow-xl">
                  {playing ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                </button>
                <button onClick={() => seek(15)} className="p-3 rounded-full bg-white/10 hover:bg-white/20"><SkipForward className="w-6 h-6" /></button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                <button onClick={() => toggleFav(current.id)} className={`px-4 py-2 rounded-full text-sm font-bold ${favs.includes(current.id) ? 'bg-rose-500 text-white' : 'bg-white/15 text-white'}`}>
                  <Heart className={`w-4 h-4 inline mr-1 ${favs.includes(current.id) ? 'fill-current' : ''}`} /> Favori
                </button>
                <button onClick={() => handleToggleDownload(current)} disabled={downloadingId === current.id} className={`px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60 ${downloads.includes(current.id) ? 'bg-emerald-500 text-white' : 'bg-white/15 text-white'}`}>
                  {downloadingId === current.id
                    ? <><Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> {downloadPct}%</>
                    : <><Download className={`w-4 h-4 inline mr-1 ${downloads.includes(current.id) ? 'fill-current' : ''}`} /> {downloads.includes(current.id) ? 'Hors-ligne' : 'Télécharger'}</>}
                </button>
                <button className="px-4 py-2 rounded-full text-sm font-bold bg-white/15"><Share2 className="w-4 h-4 inline mr-1" /> Partager</button>
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 ring-1 ring-white/20 p-4">
                <div className="font-bold mb-1">Résumé</div>
                <p className="text-sm text-white/90 leading-relaxed">{current.desc}</p>
              </div>

              <button onClick={() => setShowTranscript((v) => !v)} className="mt-4 w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition">
                <span className="font-bold">Transcription cherchable</span>
                <span className="text-xs opacity-80">{showTranscript ? 'Masquer' : 'Afficher'}</span>
              </button>

              {showTranscript && (
                <div className="mt-3 rounded-2xl bg-white/10 ring-1 ring-white/20 p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input value={transcriptQuery} onChange={(e) => setTranscriptQuery(e.target.value)}
                      placeholder="Chercher un mot dans la transcription…"
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white/15 ring-1 ring-white/30 text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]" />
                  </div>
                  {transcriptLoading && (
                    <div className="flex items-center gap-2 text-sm text-white/80 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Génération via Whisper…
                    </div>
                  )}
                  {!transcriptLoading && transcript.length === 0 && (
                    <div className="text-sm text-white/70 py-2">Transcription indisponible pour cet épisode.</div>
                  )}
                  {!transcriptLoading && transcript.length > 0 && (
                    <>
                      {transcriptQuery && (
                        <div className="text-xs text-white/70 mb-2">{transcriptHits.size} résultat{transcriptHits.size > 1 ? 's' : ''}</div>
                      )}
                      <div className="text-sm leading-relaxed max-h-72 overflow-y-auto pr-1">
                        {transcript.map((tw, i) => {
                          const isHit = transcriptHits.has(i);
                          const isActive = i === activeWordIdx;
                          return (
                            <button key={i} onClick={() => seekTo(tw.t)}
                              title={fmt(tw.t)}
                              className={`px-0.5 rounded transition ${
                                isActive ? 'bg-[#FFD400] text-[#0B1220] font-bold' :
                                isHit ? 'bg-white/30 text-white font-bold' :
                                'text-white/90 hover:bg-white/15'
                              }`}>
                              {tw.w}{' '}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
