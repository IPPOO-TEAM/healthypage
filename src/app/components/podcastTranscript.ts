import { api } from './api';
import { PodcastEpisode } from './podcasts';

export type TimedWord = { w: string; t: number };

const cache = new Map<string, TimedWord[]>();

const normalize = (w: string) =>
  w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function fallbackFromText(text: string, durationSec: number): TimedWord[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const step = durationSec / tokens.length;
  return tokens.map((w, i) => ({ w, t: Math.round((i * step) * 10) / 10 }));
}

export async function loadTranscript(ep: PodcastEpisode): Promise<TimedWord[]> {
  if (cache.has(ep.id)) return cache.get(ep.id)!;
  let words: TimedWord[] | null = null;
  try {
    const remote = await api.transcribeEpisode(ep.id, ep.src);
    if (remote && Array.isArray(remote.words) && remote.words.length) {
      words = remote.words;
    }
  } catch {}
  if (!words) {
    words = fallbackFromText(ep.transcript ?? '', ep.durationSec);
  }
  cache.set(ep.id, words);
  return words;
}

export function searchWords(words: TimedWord[], query: string): Set<number> {
  const q = normalize(query);
  if (!q) return new Set();
  const hits = new Set<number>();
  words.forEach((tw, idx) => { if (normalize(tw.w).includes(q)) hits.add(idx); });
  return hits;
}
