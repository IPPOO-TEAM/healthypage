// Couche analytics Healthy Page.
// Objectifs :
//  - Une seule API (`track`, `pageView`) à appeler depuis le code feature.
//  - Respect par défaut du Do-Not-Track navigateur + opt-out utilisateur.
//  - Aucune donnée santé / PII envoyée : whitelist stricte des propriétés.
//  - Backend "console" en dev, swap facile vers un provider réel plus tard.

import { safeStorage } from './safeStorage';

const OPTOUT_KEY = 'analytics-optout';

type Primitive = string | number | boolean | null;
export type EventProps = Record<string, Primitive>;

/** Champs autorisés — tout le reste est ignoré pour éviter la fuite de PII. */
const ALLOWED_KEYS = new Set<string>([
  'screen', 'module', 'feature', 'action', 'role', 'lang', 'platform',
  'method', 'durationMs', 'statusCode', 'count', 'index', 'success',
  'errorCode', 'variant', 'source',
]);

function dntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  // navigator.doNotTrack === '1', msDoNotTrack legacy, globalPrivacyControl
  const dnt = (navigator as any).doNotTrack ?? (window as any).doNotTrack ?? (navigator as any).msDoNotTrack;
  const gpc = (navigator as any).globalPrivacyControl;
  return dnt === '1' || dnt === 'yes' || gpc === true;
}

function userOptedOut(): boolean {
  return safeStorage.get(OPTOUT_KEY) === '1';
}

function enabled(): boolean {
  return !dntEnabled() && !userOptedOut();
}

function sanitize(props?: EventProps): EventProps {
  if (!props) return {};
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (v === null) { out[k] = null; continue; }
    if (typeof v === 'string') { out[k] = v.slice(0, 80); continue; }
    if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; continue; }
  }
  return out;
}

type AnalyticsBackend = (event: string, props: EventProps) => void;

let backend: AnalyticsBackend = (event, props) => {
  // Par défaut : log console en dev, no-op en prod.
  if (import.meta.env?.DEV) console.debug('[analytics]', event, props);
};

/** Branche un provider réel (Plausible, PostHog, etc.) à l'init de l'app. */
export function setAnalyticsBackend(fn: AnalyticsBackend) { backend = fn; }

export const analytics = {
  track(event: string, props?: EventProps) {
    if (!enabled()) return;
    try { backend(event, sanitize(props)); } catch (e) { console.warn('analytics.track failed', e); }
  },
  pageView(screen: string, props?: EventProps) {
    this.track('page_view', { screen, ...(props ?? {}) });
  },
  /** Permet à l'utilisateur de désactiver la télémétrie (paramètres > confidentialité). */
  optOut() { safeStorage.set(OPTOUT_KEY, '1'); },
  optIn()  { safeStorage.del(OPTOUT_KEY); },
  isEnabled(): boolean { return enabled(); },
};
