import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { getPatientId } from './usePatientId';

export type PodcastHistoryEntry = { id: string; at: number; pos: number; duration?: number };
export type PodcastState = {
  favs: string[];
  downloads: string[];
  history: PodcastHistoryEntry[];
};

const STORAGE_KEY = 'healthy-page:podcast';
const EMPTY: PodcastState = { favs: [], downloads: [], history: [] };

const readLocal = (): PodcastState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      favs: Array.isArray(parsed.favs) ? parsed.favs : [],
      downloads: Array.isArray(parsed.downloads) ? parsed.downloads : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch { return EMPTY; }
};
const writeLocal = (s: PodcastState) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
};

const subs = new Set<(s: PodcastState) => void>();
let memo: PodcastState = readLocal();

const broadcast = () => {
  writeLocal(memo);
  subs.forEach((fn) => fn(memo));
  const pid = getPatientId();
  if (pid) { api.savePodcastState(pid, memo); }
};

export function usePodcastState() {
  const [state, setState] = useState<PodcastState>(memo);
  const hydrated = useRef(false);

  useEffect(() => {
    const fn = (s: PodcastState) => setState(s);
    subs.add(fn);
    return () => { subs.delete(fn); };
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const pid = getPatientId();
    if (!pid) return;
    api.getPodcastState(pid).then((remote) => {
      if (!remote) return;
      const merged: PodcastState = {
        favs: Array.from(new Set([...(remote.favs ?? []), ...memo.favs])),
        downloads: Array.from(new Set([...(remote.downloads ?? []), ...memo.downloads])),
        history: dedupeHistory([...(remote.history ?? []), ...memo.history]),
      };
      memo = merged;
      writeLocal(memo);
      subs.forEach((s) => s(memo));
    }).catch(() => {});
  }, []);

  return {
    state,
    toggleFav: (id: string) => {
      const has = memo.favs.includes(id);
      memo = { ...memo, favs: has ? memo.favs.filter((x) => x !== id) : [...memo.favs, id] };
      broadcast();
    },
    toggleDownload: (id: string) => {
      const has = memo.downloads.includes(id);
      memo = { ...memo, downloads: has ? memo.downloads.filter((x) => x !== id) : [...memo.downloads, id] };
      broadcast();
    },
    recordHistory: (id: string, pos: number, duration?: number) => {
      const filtered = memo.history.filter((e) => e.id !== id);
      memo = { ...memo, history: [{ id, at: Date.now(), pos, duration }, ...filtered].slice(0, 50) };
      broadcast();
    },
    clearHistory: () => {
      memo = { ...memo, history: [] };
      broadcast();
    },
  };
}

function dedupeHistory(list: PodcastHistoryEntry[]): PodcastHistoryEntry[] {
  const map = new Map<string, PodcastHistoryEntry>();
  for (const e of list) {
    const cur = map.get(e.id);
    if (!cur || cur.at < e.at) map.set(e.id, e);
  }
  return Array.from(map.values()).sort((a, b) => b.at - a.at).slice(0, 50);
}
