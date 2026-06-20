import { PodcastEpisode } from '../components/podcasts';
import { PodcastHistoryEntry } from '../components/usePodcastState';

export type Reason = 'unfinished' | 'category' | 'host' | 'language' | 'fresh' | 'popular';

export type Recommendation = {
  ep: PodcastEpisode;
  score: number;
  reasons: Reason[];
  reasonLabel: string;
};

type Args = {
  episodes: PodcastEpisode[];
  history: PodcastHistoryEntry[];
  favs: string[];
  preferredLang?: string;
};

const REASON_LABEL: Record<Reason, string> = {
  unfinished: 'À reprendre',
  category: 'Vous aimez ce sujet',
  host: 'Avec un expert que vous suivez',
  language: 'Dans votre langue',
  fresh: 'Nouveauté',
  popular: 'Populaire',
};

export function buildRecommendations({ episodes, history, favs, preferredLang }: Args): Recommendation[] {
  const now = Date.now();
  const byId = new Map(episodes.map((e) => [e.id, e] as const));

  const catScore = new Map<string, number>();
  const hostScore = new Map<string, number>();
  const listenedIds = new Set<string>();

  for (const h of history) {
    const ep = byId.get(h.id); if (!ep) continue;
    listenedIds.add(ep.id);
    const total = h.duration ?? ep.durationSec;
    const ratio = Math.min(1, h.pos / Math.max(total, 1));
    const w = 0.3 + ratio * 0.7;
    catScore.set(ep.cat, (catScore.get(ep.cat) ?? 0) + w);
    hostScore.set(ep.host, (hostScore.get(ep.host) ?? 0) + w);
  }
  for (const id of favs) {
    const ep = byId.get(id); if (!ep) continue;
    catScore.set(ep.cat, (catScore.get(ep.cat) ?? 0) + 1.5);
    hostScore.set(ep.host, (hostScore.get(ep.host) ?? 0) + 1.5);
  }

  const recs: Recommendation[] = [];

  for (const h of history) {
    const ep = byId.get(h.id); if (!ep) continue;
    const total = h.duration ?? ep.durationSec;
    if (h.pos > 30 && h.pos < total - 30) {
      const ratio = h.pos / total;
      recs.push({
        ep,
        score: 5 + (1 - ratio) * 2,
        reasons: ['unfinished'],
        reasonLabel: `Reprendre à ${Math.floor(h.pos / 60)} min`,
      });
    }
  }
  const unfinishedIds = new Set(recs.map((r) => r.ep.id));

  for (const ep of episodes) {
    if (unfinishedIds.has(ep.id)) continue;
    if (listenedIds.has(ep.id) && !favs.includes(ep.id)) continue;

    let score = 0;
    const reasons: Reason[] = [];

    const cs = catScore.get(ep.cat) ?? 0;
    if (cs > 0) { score += cs * 1.5; reasons.push('category'); }

    const hs = hostScore.get(ep.host) ?? 0;
    if (hs > 0 && ep.host) { score += hs * 0.8; reasons.push('host'); }

    if (preferredLang && ep.lang === preferredLang) { score += 1.2; reasons.push('language'); }

    const ageDays = Math.max(0, (now - ep.publishedAt) / 86_400_000);
    if (ageDays < 7) { score += 1.5; reasons.push('fresh'); }
    else if (ageDays < 30) score += 0.5;

    if (score === 0 && history.length === 0) { score = 0.4; reasons.push('popular'); }
    if (score <= 0) continue;

    const label = reasons.includes('category') && cs > 0
      ? `Parce que vous écoutez « ${ep.cat} »`
      : reasons.includes('host')
      ? `Parce que vous suivez ${ep.host}`
      : reasons.includes('fresh')
      ? 'Nouveauté de la semaine'
      : reasons.includes('language')
      ? 'Dans votre langue préférée'
      : REASON_LABEL[reasons[0] ?? 'popular'];

    recs.push({ ep, score, reasons, reasonLabel: label });
  }

  recs.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: Recommendation[] = [];
  for (const r of recs) {
    if (seen.has(r.ep.id)) continue;
    seen.add(r.ep.id);
    out.push(r);
    if (out.length >= 12) break;
  }
  return out;
}

export function groupByReason(recs: Recommendation[]): { key: Reason; label: string; items: Recommendation[] }[] {
  const groups = new Map<Reason, Recommendation[]>();
  for (const r of recs) {
    const k = r.reasons[0] ?? 'popular';
    const arr = groups.get(k) ?? [];
    arr.push(r);
    groups.set(k, arr);
  }
  const order: Reason[] = ['unfinished', 'category', 'language', 'host', 'fresh', 'popular'];
  return order
    .filter((k) => groups.has(k))
    .map((k) => ({ key: k, label: REASON_LABEL[k], items: groups.get(k)! }));
}
