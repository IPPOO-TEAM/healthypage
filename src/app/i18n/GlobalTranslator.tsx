import { useEffect, useRef } from 'react';
import { useT } from './index';
import { translateBatch, isMachineTranslatable, getCached } from './translator';

const SKIP_TAGS = new Set([
  'SCRIPT','STYLE','NOSCRIPT','CODE','PRE','KBD','SAMP','TEXTAREA','INPUT','SELECT','OPTION','SVG','PATH','CANVAS','IFRAME',
]);

function isSkippable(node: Node): boolean {
  let p: Node | null = node.parentNode;
  while (p && p.nodeType === 1) {
    const el = p as HTMLElement;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.getAttribute && el.getAttribute('data-no-translate') === 'true') return true;
    if (el.isContentEditable) return true;
    p = el.parentNode;
  }
  return false;
}

const TEXT_RE = /[A-Za-zÀ-ÿ]{2,}/;

function collectTexts(root: Node, acc: Text[]): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    const raw = t.nodeValue ?? '';
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length < 2) continue;
    if (!TEXT_RE.test(trimmed)) continue;
    if (isSkippable(t)) continue;
    acc.push(t);
  }
}

const ORIG = new WeakMap<Text, string>();
const TRANSLATED = new WeakSet<Text>();

export function GlobalTranslator() {
  const { locale } = useT();
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const pendingRef = useRef<Set<Text>>(new Set());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = async () => {
    flushTimerRef.current = null;
    const target = localeRef.current;
    const nodes = Array.from(pendingRef.current);
    pendingRef.current.clear();
    if (target === 'fr' || !isMachineTranslatable(target)) {
      // restore originals
      for (const t of nodes) {
        const orig = ORIG.get(t);
        if (orig != null && t.nodeValue !== orig) {
          TRANSLATED.delete(t);
          t.nodeValue = orig;
        }
      }
      return;
    }
    // collect originals
    const items: { node: Text; src: string }[] = [];
    for (const t of nodes) {
      if (!t.isConnected) continue;
      const cur = t.nodeValue ?? '';
      const src = ORIG.get(t) ?? cur;
      if (!ORIG.has(t)) ORIG.set(t, cur);
      if (!src.trim()) continue;
      items.push({ node: t, src });
    }
    if (!items.length) return;

    // Use cache first
    const need: { node: Text; src: string }[] = [];
    for (const it of items) {
      const cached = getCached(target, it.src);
      if (cached) {
        if (it.node.isConnected && it.node.nodeValue !== cached) {
          it.node.nodeValue = cached;
          TRANSLATED.add(it.node);
        }
      } else {
        need.push(it);
      }
    }
    if (!need.length) return;

    // Batch in chunks
    const CHUNK = 30;
    for (let i = 0; i < need.length; i += CHUNK) {
      const slice = need.slice(i, i + CHUNK);
      try {
        const out = await translateBatch(slice.map(s => s.src), target);
        slice.forEach((it, idx) => {
          const tr = out[idx];
          if (tr && it.node.isConnected && localeRef.current === target) {
            it.node.nodeValue = tr;
            TRANSLATED.add(it.node);
          }
        });
      } catch {
        // swallow — keep originals
      }
    }
  };

  const schedule = (nodes: Text[]) => {
    for (const n of nodes) pendingRef.current.add(n);
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(flush, 180);
  };

  // On locale change: re-translate everything currently visible
  useEffect(() => {
    try {
      if (typeof document === 'undefined' || !document.body) return;
      const all: Text[] = [];
      collectTexts(document.body, all);
      schedule(all);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Observe DOM mutations to translate new content
  useEffect(() => {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    if (locale === 'fr') return;
    const obs = new MutationObserver((muts) => {
      try {
      const fresh: Text[] = [];
      for (const m of muts) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 3) {
              const t = n as Text;
              if (!isSkippable(t) && (t.nodeValue ?? '').trim().length > 1 && TEXT_RE.test(t.nodeValue ?? '')) {
                fresh.push(t);
              }
            } else if (n.nodeType === 1) {
              collectTexts(n, fresh);
            }
          });
        } else if (m.type === 'characterData') {
          const t = m.target as Text;
          if (t.nodeType === 3 && !isSkippable(t)) {
            // If our own translation set this value, ignore
            if (TRANSLATED.has(t)) {
              const tr = t.nodeValue ?? '';
              const orig = ORIG.get(t);
              if (orig === tr) TRANSLATED.delete(t);
              continue;
            }
            // External update → reset original cache
            ORIG.delete(t);
            const v = t.nodeValue ?? '';
            if (v.trim().length > 1 && TEXT_RE.test(v)) fresh.push(t);
          }
        }
      }
      if (fresh.length) schedule(fresh);
      } catch {}
    });
    try { obs.observe(document.body, { childList: true, characterData: true, subtree: true }); } catch {}
    return () => { try { obs.disconnect(); } catch {} };
  }, [locale]);

  return null;
}

export default GlobalTranslator;
