import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from 'react';
import Hls from 'hls.js';
import { RADIO_STATIONS, TV_CHANNELS, RadioStation, TVChannel } from './data';

type CurrentRadio = { kind: 'radio'; station: RadioStation };
type CurrentTV = { kind: 'tv'; channel: TVChannel };
export type Current = CurrentRadio | CurrentTV | null;
export type LiveStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type Ctx = {
  current: Current;
  status: LiveStatus;
  playing: boolean;
  volume: number;
  muted: boolean;
  expanded: boolean;
  errorMessage: string | null;
  favoritesRadio: string[];
  favoritesTV: string[];
  history: { kind: 'radio' | 'tv'; id: string; at: number }[];
  audioRef: React.RefObject<HTMLAudioElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  playRadio: (s: RadioStation) => void;
  playTV: (c: TVChannel) => void;
  stop: () => void;
  toggle: () => void;
  retry: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setExpanded: (e: boolean) => void;
  toggleFav: (kind: 'radio' | 'tv', id: string) => void;
};

const LiveCtx = createContext<Ctx | null>(null);
const FAV_R = 'hp.live.fav.radio';
const FAV_T = 'hp.live.fav.tv';
const HIST = 'hp.live.history';
const LAST = 'hp.live.last';

type LastSession = { kind: 'radio' | 'tv'; id: string };

function isHlsUrl(url: string) {
  return /\.m3u8(\?|$)/i.test(url);
}

export function LivePlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current>(null);
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [favoritesRadio, setFavoritesRadio] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAV_R) ?? '[]'); } catch { return []; }
  });
  const [favoritesTV, setFavoritesTV] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAV_T) ?? '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState<{ kind: 'radio' | 'tv'; id: string; at: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem(HIST) ?? '[]'); } catch { return []; }
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsAudioRef = useRef<Hls | null>(null);
  const hlsVideoRef = useRef<Hls | null>(null);
  const skipAutoPlayRef = useRef(false);

  useEffect(() => { localStorage.setItem(FAV_R, JSON.stringify(favoritesRadio)); }, [favoritesRadio]);
  useEffect(() => { localStorage.setItem(FAV_T, JSON.stringify(favoritesTV)); }, [favoritesTV]);
  useEffect(() => { localStorage.setItem(HIST, JSON.stringify(history.slice(0, 30))); }, [history]);

  useEffect(() => {
    const a = audioRef.current; const v = videoRef.current;
    if (a) { a.volume = volume; a.muted = muted; }
    if (v) { v.volume = volume; v.muted = muted; }
  }, [volume, muted, current]);

  // Wire audio events for radio
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlaying = () => { setStatus('playing'); setErrorMessage(null); };
    const onWaiting = () => setStatus((s) => (s === 'idle' ? s : 'loading'));
    const onPause = () => setStatus((s) => (s === 'error' ? s : 'paused'));
    const onError = () => { setStatus('error'); setErrorMessage('Flux radio indisponible'); };
    a.addEventListener('playing', onPlaying);
    a.addEventListener('waiting', onWaiting);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onError);
    return () => {
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('waiting', onWaiting);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onError);
    };
  }, []);

  // Wire video events when video element is mounted (only when expanded TV)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlaying = () => { setStatus('playing'); setErrorMessage(null); };
    const onWaiting = () => setStatus((s) => (s === 'idle' ? s : 'loading'));
    const onPause = () => setStatus((s) => (s === 'error' ? s : 'paused'));
    const onError = () => { setStatus('error'); setErrorMessage('Flux TV indisponible'); };
    v.addEventListener('playing', onPlaying);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('pause', onPause);
    v.addEventListener('error', onError);
    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('error', onError);
    };
  }, [current, expanded]);

  const attachStream = useCallback((el: HTMLMediaElement, url: string, kind: 'radio' | 'tv') => {
    const slot = kind === 'radio' ? hlsAudioRef : hlsVideoRef;
    if (slot.current) { slot.current.destroy(); slot.current = null; }
    if (isHlsUrl(url)) {
      if (el.canPlayType('application/vnd.apple.mpegurl')) {
        if (el.src !== url) el.src = url;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setStatus('error');
            setErrorMessage(kind === 'radio' ? 'Flux radio indisponible' : 'Flux TV indisponible');
          }
        });
        hls.loadSource(url);
        hls.attachMedia(el as HTMLVideoElement);
        slot.current = hls;
      } else {
        if (el.src !== url) el.src = url;
      }
    } else {
      if (el.src !== url) el.src = url;
    }
  }, []);

  // Drive playback when current changes
  useEffect(() => {
    if (!current) return;
    if (skipAutoPlayRef.current) { skipAutoPlayRef.current = false; return; }
    if (current.kind === 'radio') {
      const a = audioRef.current;
      if (!a) return;
      videoRef.current?.pause();
      attachStream(a, current.station.streamUrl, 'radio');
      setStatus('loading');
      a.play().catch((err) => {
        setStatus('error');
        setErrorMessage(err?.message?.includes('user') ? 'Touchez Lecture pour démarrer' : 'Lecture impossible');
      });
    } else {
      const v = videoRef.current;
      if (!v) return; // video element appears once expanded — effect re-runs when ref mounts
      audioRef.current?.pause();
      attachStream(v, current.channel.streamUrl, 'tv');
      setStatus('loading');
      v.play().catch((err) => {
        setStatus('error');
        setErrorMessage(err?.message?.includes('user') ? 'Touchez Lecture pour démarrer' : 'Lecture impossible');
      });
    }
  }, [current, expanded, attachStream]);

  // Persist last station/channel for resume on next launch
  useEffect(() => {
    if (!current) return;
    const last: LastSession = current.kind === 'radio'
      ? { kind: 'radio', id: current.station.id }
      : { kind: 'tv', id: current.channel.id };
    try { localStorage.setItem(LAST, JSON.stringify(last)); } catch {}
  }, [current]);

  // Restore last session (paused, ready to resume) on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST);
      if (!raw) return;
      const last = JSON.parse(raw) as LastSession;
      if (last.kind === 'radio') {
        const s = RADIO_STATIONS.find((x) => x.id === last.id);
        if (s) { skipAutoPlayRef.current = true; setCurrent({ kind: 'radio', station: s }); setStatus('paused'); }
      } else {
        const c = TV_CHANNELS.find((x) => x.id === last.id);
        if (c) { skipAutoPlayRef.current = true; setCurrent({ kind: 'tv', channel: c }); setStatus('paused'); }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup hls instances on unmount
  useEffect(() => () => {
    hlsAudioRef.current?.destroy();
    hlsVideoRef.current?.destroy();
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    hlsAudioRef.current?.destroy(); hlsAudioRef.current = null;
    hlsVideoRef.current?.destroy(); hlsVideoRef.current = null;
    if (audioRef.current) audioRef.current.removeAttribute('src');
    if (videoRef.current) videoRef.current.removeAttribute('src');
    setCurrent(null);
    setStatus('idle');
    setExpanded(false);
    setErrorMessage(null);
    try { localStorage.removeItem(LAST); } catch {}
  }, []);

  const playRadio = useCallback((station: RadioStation) => {
    setCurrent({ kind: 'radio', station });
    setHistory((h) => [{ kind: 'radio', id: station.id, at: Date.now() }, ...h.filter((x) => !(x.kind === 'radio' && x.id === station.id))].slice(0, 30));
  }, []);

  const playTV = useCallback((channel: TVChannel) => {
    setCurrent({ kind: 'tv', channel });
    setExpanded(true);
    setHistory((h) => [{ kind: 'tv', id: channel.id, at: Date.now() }, ...h.filter((x) => !(x.kind === 'tv' && x.id === channel.id))].slice(0, 30));
  }, []);

  const toggle = useCallback(() => {
    if (!current) return;
    const el = current.kind === 'radio' ? audioRef.current : videoRef.current;
    if (!el) return;
    if (el.paused) {
      const url = current.kind === 'radio' ? current.station.streamUrl : current.channel.streamUrl;
      if (!el.src) attachStream(el, url, current.kind);
      setStatus('loading');
      el.play().catch((err) => {
        setStatus('error');
        setErrorMessage(err?.message ?? 'Lecture impossible');
      });
    } else {
      el.pause();
    }
  }, [current, attachStream]);

  const retry = useCallback(() => {
    if (!current) return;
    setErrorMessage(null);
    const el = current.kind === 'radio' ? audioRef.current : videoRef.current;
    const url = current.kind === 'radio' ? current.station.streamUrl : current.channel.streamUrl;
    if (!el) return;
    attachStream(el, url, current.kind);
    setStatus('loading');
    el.play().catch((err) => {
      setStatus('error');
      setErrorMessage(err?.message ?? 'Lecture impossible');
    });
  }, [current, attachStream]);

  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);

  const toggleFav = useCallback((kind: 'radio' | 'tv', id: string) => {
    if (kind === 'radio') setFavoritesRadio((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
    else setFavoritesTV((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
  }, []);

  const playing = status === 'playing';

  const value = useMemo<Ctx>(() => ({
    current, status, playing, volume, muted, expanded, errorMessage,
    favoritesRadio, favoritesTV, history,
    audioRef, videoRef,
    playRadio, playTV, stop, toggle, retry, setVolume, setMuted, setExpanded, toggleFav,
  }), [current, status, playing, volume, muted, expanded, errorMessage, favoritesRadio, favoritesTV, history, playRadio, playTV, stop, toggle, retry, setVolume, toggleFav]);

  return (
    <LiveCtx.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
    </LiveCtx.Provider>
  );
}

export function useLivePlayer() {
  const ctx = useContext(LiveCtx);
  if (!ctx) throw new Error('useLivePlayer must be used inside LivePlayerProvider');
  return ctx;
}

export { RADIO_STATIONS, TV_CHANNELS };
