import type { Locale } from './dictionaries';

// Traduction 100% gratuite via MyMemory Translated.
// Aucune clé requise. Quota généreux (~5000 mots/jour/IP, ~50 000 avec email anonyme).
// Pour augmenter le quota, on peut ajouter `de=<email>` dans la requête.
const ENDPOINT = 'https://api.mymemory.translated.net/get';
const ANON_EMAIL = ''; // optionnel : 'votre-email@exemple.com' pour étendre le quota

// Mapping vers codes ISO gérés par MyMemory.
// Les langues sans code stable retombent silencieusement sur le français source.
const MM_CODE: Record<Locale, string | null> = {
  fr: 'fr',
  en: 'en',
  yor: 'yo',
  hau: 'ha',
  ibo: 'ig',
  lin: 'ln',
  ful: 'ff',
  bam: 'bm',
  wol: 'wo',
  fon: null,
  dyu: null,
  sen: null,
  zar: null,
};

export function isMachineTranslatable(locale: Locale): boolean {
  return locale === 'fr' || MM_CODE[locale] != null;
}

const STORE = 'hp.tx.cache.v2';
type Store = Record<string, Record<string, string>>;

function loadStore(): Store {
  try { return JSON.parse(localStorage.getItem(STORE) ?? '{}') as Store; } catch { return {}; }
}
let memStore: Store = loadStore();
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE, JSON.stringify(memStore)); } catch {}
    saveTimer = null;
  }, 250);
}

export function getCached(target: Locale, text: string): string | null {
  return memStore[target]?.[text] ?? null;
}
function setCached(target: Locale, text: string, translated: string) {
  if (!memStore[target]) memStore[target] = {};
  memStore[target][text] = translated;
  persist();
}

export class TranslatorUnavailableError extends Error {
  constructor(msg: string) { super(msg); this.name = 'TranslatorUnavailableError'; }
}

function decodeEntities(html: string): string {
  if (typeof document === 'undefined') return html;
  const el = document.createElement('textarea');
  el.innerHTML = html;
  return el.value;
}

async function translateOne(text: string, targetCode: string): Promise<string> {
  const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent('fr|' + targetCode)}${ANON_EMAIL ? `&de=${encodeURIComponent(ANON_EMAIL)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated !== 'string' || !translated.trim()) throw new Error('Réponse de traduction vide');
  // MyMemory renvoie parfois "MYMEMORY WARNING: ..." en cas de quota dépassé.
  if (/^MYMEMORY WARNING/i.test(translated)) throw new Error('Quota MyMemory dépassé');
  return decodeEntities(translated);
}

// Petit limiteur pour ne pas saturer le service public.
async function inPool<T, R>(items: T[], poolSize: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const result: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(poolSize, items.length) }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        try { result[idx] = await worker(items[idx]); }
        catch { result[idx] = items[idx] as unknown as R; }
      }
    })
  );
  return result;
}

export async function translateBatch(texts: string[], target: Locale): Promise<string[]> {
  if (target === 'fr') return texts;
  const code = MM_CODE[target];
  // Langue sans code → on retourne le FR source au lieu de bloquer (jamais d'erreur visible).
  if (!code) return texts;

  const out: string[] = new Array(texts.length);
  const todoIdx: number[] = [];
  const todoTexts: string[] = [];
  texts.forEach((t, i) => {
    const c = getCached(target, t);
    if (c != null) out[i] = c;
    else if (!t) out[i] = t;
    else { todoIdx.push(i); todoTexts.push(t); }
  });

  if (todoTexts.length) {
    const translated = await inPool(todoTexts, 4, (t) => translateOne(t, code));
    translated.forEach((tr, k) => {
      const idx = todoIdx[k];
      out[idx] = tr;
      if (tr && tr !== todoTexts[k]) setCached(target, todoTexts[k], tr);
    });
  }
  return out;
}
