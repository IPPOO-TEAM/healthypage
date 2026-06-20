import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { PODCAST_EPISODES, PodcastLang } from '../components/podcasts';

const PREF_KEY = 'healthy-page:podcast:notifs';
const POLL_MS = 5 * 60_000;

type NotifPrefs = {
  enabled: boolean;
  lang: PodcastLang;
  lastSeenAt: number;
};

const loadPrefs = (): NotifPrefs => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || '') as NotifPrefs; }
  catch { return { enabled: false, lang: 'fr', lastSeenAt: Date.now() }; }
};
const savePrefs = (p: NotifPrefs) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch {} };

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePodcastNotifications(currentLang: PodcastLang) {
  const [permission, setPermission] = useState<PermissionState>(() =>
    typeof window === 'undefined' || !('Notification' in window)
      ? 'unsupported'
      : (Notification.permission as PermissionState)
  );
  const [prefs, setPrefsState] = useState<NotifPrefs>(() => {
    const cur = loadPrefs();
    return { ...cur, lang: cur.lang || currentLang };
  });
  const [recent, setRecent] = useState<{ id: string; title: string; at: number }[]>([]);
  const timer = useRef<number | null>(null);
  const seenInSession = useRef<Set<string>>(new Set());

  const persist = useCallback((p: NotifPrefs) => {
    setPrefsState(p);
    savePrefs(p);
    const pid = getPatientId();
    if (pid) api.savePodcastNotif(pid, { enabled: p.enabled, lang: p.lang, lastSeenAt: p.lastSeenAt });
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (permission === 'unsupported') return 'unsupported';
    try {
      const r = await Notification.requestPermission();
      setPermission(r as PermissionState);
      return r as PermissionState;
    } catch { return permission; }
  }, [permission]);

  const enable = useCallback(async () => {
    let p = permission;
    if (p === 'default') p = await requestPermission();
    if (p !== 'granted') return false;
    persist({ ...prefs, enabled: true, lastSeenAt: Date.now() });
    return true;
  }, [permission, prefs, persist, requestPermission]);

  const disable = useCallback(() => {
    persist({ ...prefs, enabled: false });
  }, [prefs, persist]);

  const setLang = useCallback((lang: PodcastLang) => {
    persist({ ...prefs, lang, lastSeenAt: Date.now() });
  }, [prefs, persist]);

  const sendTest = useCallback(() => {
    if (permission !== 'granted') return;
    new Notification('HEALTHY PAGE Podcast', {
      body: 'Les notifications sont activées. Vous serez averti·e des nouveaux épisodes.',
      icon: PODCAST_EPISODES[0]?.cover,
      tag: 'podcast-test',
    });
  }, [permission]);

  const fireFor = useCallback((items: { id: string; title: string; cover?: string; cat?: string }[]) => {
    if (permission !== 'granted' || !prefs.enabled) return;
    for (const it of items) {
      if (seenInSession.current.has(it.id)) continue;
      seenInSession.current.add(it.id);
      try {
        new Notification('Nouvel épisode podcast', {
          body: it.title,
          icon: it.cover,
          tag: `podcast-${it.id}`,
          data: { episodeId: it.id },
        });
      } catch {}
    }
    setRecent((cur) => [
      ...items.map((i) => ({ id: i.id, title: i.title, at: Date.now() })),
      ...cur,
    ].slice(0, 10));
  }, [permission, prefs.enabled]);

  const checkNow = useCallback(async () => {
    if (!prefs.enabled || permission !== 'granted') return [];
    const since = prefs.lastSeenAt;

    const remote = await api.podcastFeed(prefs.lang, since);
    const localFresh = PODCAST_EPISODES
      .filter((e) => e.lang === prefs.lang && e.publishedAt > since)
      .map((e) => ({ id: e.id, title: e.title, cover: e.cover, cat: e.cat }));
    const remoteMapped = (remote ?? []).map((e) => ({ id: e.id, title: e.title, cover: e.cover, cat: e.cat }));
    const merged = [...remoteMapped, ...localFresh].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);

    if (merged.length) {
      fireFor(merged);
      persist({ ...prefs, lastSeenAt: Date.now() });
    }
    return merged;
  }, [prefs, permission, fireFor, persist]);

  useEffect(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    if (!prefs.enabled || permission !== 'granted') return;
    checkNow();
    timer.current = window.setInterval(() => { checkNow(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') checkNow(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [prefs.enabled, permission, prefs.lang, checkNow]);

  return { permission, prefs, enable, disable, setLang, sendTest, recent, checkNow, requestPermission };
}
