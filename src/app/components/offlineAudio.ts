const CACHE_NAME = 'podcast-audio-v1';
const supportsCache = typeof caches !== 'undefined' && typeof Request !== 'undefined';

const blobUrlCache = new Map<string, string>();

async function openCache(): Promise<Cache | null> {
  if (!supportsCache) return null;
  try { return await caches.open(CACHE_NAME); } catch { return null; }
}

export async function isEpisodeCached(audioUrl: string): Promise<boolean> {
  const cache = await openCache();
  if (!cache) return false;
  const hit = await cache.match(audioUrl, { ignoreVary: true, ignoreSearch: false });
  return !!hit;
}

export async function listCachedUrls(): Promise<string[]> {
  const cache = await openCache();
  if (!cache) return [];
  const reqs = await cache.keys();
  return reqs.map((r) => r.url);
}

export async function downloadEpisode(
  audioUrl: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<boolean> {
  const cache = await openCache();
  if (!cache) return false;

  const existing = await cache.match(audioUrl);
  if (existing) return true;

  try {
    const res = await fetch(audioUrl, { mode: 'cors' });
    if (!res.ok || !res.body) return false;

    const total = Number(res.headers.get('Content-Length')) || 0;
    if (onProgress && total > 0) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.byteLength;
          onProgress(loaded, total);
        }
      }
      const blob = new Blob(chunks as BlobPart[], { type: res.headers.get('Content-Type') || 'audio/mpeg' });
      const headers = new Headers(res.headers);
      headers.set('Content-Length', String(blob.size));
      const cached = new Response(blob, { status: 200, headers });
      await cache.put(audioUrl, cached);
    } else {
      await cache.put(audioUrl, res.clone());
    }
    return true;
  } catch (e) {
    console.error('downloadEpisode failed', e);
    return false;
  }
}

export async function removeOffline(audioUrl: string): Promise<boolean> {
  const cache = await openCache();
  if (!cache) return false;
  const url = blobUrlCache.get(audioUrl);
  if (url) { try { URL.revokeObjectURL(url); } catch {} blobUrlCache.delete(audioUrl); }
  return cache.delete(audioUrl);
}

export async function getPlayableUrl(audioUrl: string): Promise<string> {
  const cache = await openCache();
  if (!cache) return audioUrl;
  const cached = blobUrlCache.get(audioUrl);
  if (cached) return cached;
  const hit = await cache.match(audioUrl);
  if (!hit) return audioUrl;
  try {
    const blob = await hit.blob();
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(audioUrl, url);
    return url;
  } catch {
    return audioUrl;
  }
}

export function clearBlobUrls() {
  blobUrlCache.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
  blobUrlCache.clear();
}
