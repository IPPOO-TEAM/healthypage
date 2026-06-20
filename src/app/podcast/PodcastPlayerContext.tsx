import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from 'react';
import { PodcastEpisode, PODCAST_EPISODES } from '../components/podcasts';
import { usePodcastState } from '../components/usePodcastState';
import { loadTranscript, TimedWord } from '../components/podcastTranscript';
import { downloadEpisode, getPlayableUrl, removeOffline } from '../components/offlineAudio';

export type PodcastPrefs = {
  rate: number;
  lang: 'fr' | 'fon' | 'yor' | 'wol' | 'hau' | 'ibo' | 'lin' | 'bam' | 'ful' | 'dyu' | 'sen' | 'zar';
  autoplay: boolean;
  sleepMin: number | null;
  shuffle: boolean;
  repeat: boolean;
};

const PREFS_KEY = 'healthy-page:podcast:prefs';
const defaultPrefs: PodcastPrefs = { rate: 1, lang: 'fr', autoplay: false, sleepMin: null, shuffle: false, repeat: false };
const loadPrefs = (): PodcastPrefs => {
  try { return { ...defaultPrefs, ...(JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') ?? {}) }; }
  catch { return defaultPrefs; }
};
const savePrefs = (p: PodcastPrefs) => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {} };

type PlayerContextValue = {
  episodes: PodcastEpisode[];
  current: PodcastEpisode | null;
  playing: boolean;
  time: number;
  duration: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  play: (ep: PodcastEpisode) => void;
  toggle: () => void;
  stop: () => void;
  seek: (delta: number) => void;
  seekTo: (t: number) => void;

  state: ReturnType<typeof usePodcastState>['state'];
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;
  isDownloaded: (id: string) => boolean;
  toggleDownload: (ep: PodcastEpisode) => Promise<void>;
  downloadingId: string | null;
  downloadPct: number;
  clearHistory: () => void;

  transcript: TimedWord[];
  transcriptLoading: boolean;
  loadCurrentTranscript: () => void;

  prefs: PodcastPrefs;
  setPrefs: (p: Partial<PodcastPrefs>) => void;
};

const Ctx = createContext<PlayerContextValue | null>(null);
export const usePodcastPlayer = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePodcastPlayer must be used within PodcastPlayerProvider');
  return v;
};

export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const podcastState = usePodcastState();
  const { state, toggleFav, toggleDownload: toggleDownloadFlag, recordHistory, clearHistory } = podcastState;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PodcastEpisode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playableSrc, setPlayableSrc] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadPct, setDownloadPct] = useState(0);
  const [transcript, setTranscript] = useState<TimedWord[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [prefs, setPrefsState] = useState<PodcastPrefs>(() => loadPrefs());
  const sleepTimer = useRef<number | null>(null);
  const lastRecordedSecond = useRef(0);

  useEffect(() => { savePrefs(prefs); }, [prefs]);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'metadata';
      audioRef.current = a;
    }
    const a = audioRef.current!;
    const onTime = () => {
      setTime(a.currentTime);
      const sec = Math.floor(a.currentTime);
      if (current && sec !== lastRecordedSecond.current && sec % 10 === 0) {
        lastRecordedSecond.current = sec;
        recordHistory(current.id, a.currentTime, a.duration || current.durationSec);
      }
    };
    const onMeta = () => setDuration(a.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (current) recordHistory(current.id, a.duration || 0, a.duration || current.durationSec);
      if (!current) return;
      if (prefs.repeat) {
        a.currentTime = 0;
        a.play().catch(() => {});
        return;
      }
      let next: PodcastEpisode | undefined;
      if (prefs.shuffle) {
        const pool = PODCAST_EPISODES.filter((e) => e.id !== current.id);
        next = pool[Math.floor(Math.random() * pool.length)];
      } else if (prefs.autoplay) {
        const idx = PODCAST_EPISODES.findIndex((e) => e.id === current.id);
        next = PODCAST_EPISODES[idx + 1];
      }
      if (next) play(next);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
    };
  }, [current?.id, prefs.autoplay, prefs.shuffle, prefs.repeat]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    a.playbackRate = prefs.rate;
  }, [prefs.rate, current?.id]);

  useEffect(() => {
    if (sleepTimer.current) { clearTimeout(sleepTimer.current); sleepTimer.current = null; }
    if (prefs.sleepMin && playing) {
      sleepTimer.current = window.setTimeout(() => {
        audioRef.current?.pause();
        setPrefsState((p) => ({ ...p, sleepMin: null }));
      }, prefs.sleepMin * 60_000);
    }
    return () => { if (sleepTimer.current) clearTimeout(sleepTimer.current); };
  }, [prefs.sleepMin, playing]);

  useEffect(() => {
    if (!current) { setPlayableSrc(''); return; }
    let cancelled = false;
    getPlayableUrl(current.src).then((url) => {
      if (cancelled) return;
      setPlayableSrc(url);
      const a = audioRef.current; if (!a) return;
      a.src = url;
      const last = state.history.find((h) => h.id === current.id);
      const startPos = last && last.pos > 5 && (!last.duration || last.pos < last.duration - 5) ? last.pos : 0;
      a.currentTime = startPos;
      setTime(startPos);
      a.play().catch(() => setPlaying(false));
    });
    return () => { cancelled = true; };
  }, [current?.id]);

  const play = useCallback((ep: PodcastEpisode) => {
    if (current?.id === ep.id) {
      const a = audioRef.current; if (!a) return;
      if (a.paused) { a.play().catch(() => {}); } else { a.pause(); }
      return;
    }
    setCurrent(ep);
    setTranscript([]);
    setExpanded(true);
  }, [current?.id]);

  const toggle = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) a.play().catch(() => {}); else a.pause();
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current; if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
    setCurrent(null);
    setPlaying(false);
    setExpanded(false);
  }, []);

  const seek = useCallback((delta: number) => {
    const a = audioRef.current; if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  }, []);

  const seekTo = useCallback((t: number) => {
    const a = audioRef.current; if (!a) return;
    a.currentTime = Math.max(0, t);
    if (a.paused) a.play().catch(() => {});
  }, []);

  const toggleDownload = useCallback(async (ep: PodcastEpisode) => {
    if (state.downloads.includes(ep.id)) {
      await removeOffline(ep.src);
      toggleDownloadFlag(ep.id);
      return;
    }
    setDownloadingId(ep.id);
    setDownloadPct(0);
    const ok = await downloadEpisode(ep.src, (loaded, total) => {
      setDownloadPct(total > 0 ? Math.round((loaded / total) * 100) : 0);
    });
    setDownloadingId(null);
    setDownloadPct(0);
    if (ok) toggleDownloadFlag(ep.id);
  }, [state.downloads, toggleDownloadFlag]);

  const loadCurrentTranscript = useCallback(() => {
    if (!current) return;
    setTranscriptLoading(true);
    loadTranscript(current).then((w) => { setTranscript(w); setTranscriptLoading(false); });
  }, [current?.id]);

  const setPrefs = useCallback((p: Partial<PodcastPrefs>) => setPrefsState((cur) => ({ ...cur, ...p })), []);

  const value = useMemo<PlayerContextValue>(() => ({
    episodes: PODCAST_EPISODES,
    current, playing, time, duration, expanded, setExpanded,
    play, toggle, stop, seek, seekTo,
    state, toggleFav,
    isFav: (id) => state.favs.includes(id),
    isDownloaded: (id) => state.downloads.includes(id),
    toggleDownload, downloadingId, downloadPct,
    clearHistory,
    transcript, transcriptLoading, loadCurrentTranscript,
    prefs, setPrefs,
  }), [current, playing, time, duration, expanded, state, toggleFav, toggleDownload, downloadingId, downloadPct, clearHistory, transcript, transcriptLoading, loadCurrentTranscript, prefs, setPrefs, play, toggle, stop, seek, seekTo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
