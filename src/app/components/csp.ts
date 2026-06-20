// Content-Security-Policy runtime pour Healthy Page.
//
// Pourquoi : ce setup Figma Make ne nous donne pas la main sur `index.html` ni
// sur les headers HTTP. On injecte donc la CSP via une balise <meta http-equiv>
// le plus tôt possible (au boot de App). Limitations connues du meta-CSP :
//  - `frame-ancestors`, `report-uri`, `sandbox` sont ignorés en meta.
//  - La balise doit être posée AVANT toute requête déclenchée par le HTML.
// Pour la prod, doubler avec un header HTTP côté CDN/edge (Cloudflare, Vercel).

const DIRECTIVES: Record<string, string[]> = {
  // Par défaut : tout ce qui n'est pas explicité passe par self.
  'default-src': ["'self'"],

  // Vite (dev + chargement de chunks Make) + libs qui évaluent (recharts, motion).
  // En prod stricte on retirera 'unsafe-eval' et idéalement 'unsafe-inline'.
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],

  // Tailwind v4 injecte des styles inline + Radix peut faire pareil.
  'style-src': ["'self'", "'unsafe-inline'", 'https:'],

  // Images : assets locaux + data: (avatars base64) + blob: (uploads) + https:.
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],

  // Fonts Google + data:.
  'font-src': ["'self'", 'data:', 'https:'],

  // API Supabase + WebSocket (Realtime) + Unsplash + tout endpoint HTTPS.
  // On garde large pour ne pas casser les fetches dans des environnements où
  // le projectId Supabase est résolu dynamiquement (Figma Make preview, etc.).
  // Le durcissement fin se fera côté header HTTP en prod.
  'connect-src': ["'self'", 'https:', 'wss:', 'data:', 'blob:'],

  // Audio/vidéo : podcasts + uploads + blob:.
  'media-src': ["'self'", 'blob:', 'https:'],

  // Pas d'iframe externe ni d'objet/embed.
  'frame-src': ["'none'"],
  'object-src': ["'none'"],

  // Durcissement standard.
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

function buildPolicy(): string {
  return Object.entries(DIRECTIVES)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');
}

let installed = false;

/**
 * Injecte la CSP en <head>. Idempotent ; safe en SSR/Node (no-op).
 * Ne s'active qu'en build de prod : en dev / preview Figma Make, la CSP via
 * <meta> peut entrer en conflit avec le runtime du parent frame et bloquer
 * des fetches légitimes. Forcable via window.__HP_FORCE_CSP__ = true.
 */
export function installCSP(): void {
  if (installed) return;
  if (typeof document === 'undefined') return;
  installed = true;
  const isDev = !!(import.meta as { env?: { DEV?: boolean } }).env?.DEV;
  const forced = typeof window !== 'undefined' && (window as unknown as { __HP_FORCE_CSP__?: boolean }).__HP_FORCE_CSP__ === true;
  if (isDev && !forced) return;
  // Si une CSP existe déjà (ex. injectée par l'hébergeur), on ne double pas.
  const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existing) return;
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', buildPolicy());
  document.head.prepend(meta);
}

/** Exposé pour les tests. */
export const __cspInternal = { buildPolicy };
