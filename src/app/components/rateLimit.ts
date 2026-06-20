// Rate limiter persistant (localStorage) pour protéger les surfaces sensibles
// (login mot de passe, vérification OTP, envoi OTP, reset de mot de passe).
// Stratégie : fenêtre glissante + verrouillage temporaire après dépassement.

type Bucket = { fails: number[]; lockedUntil?: number };

const STORE_KEY = 'healthy-page:ratelimit';

function readAll(): Record<string, Bucket> {
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function writeAll(data: Record<string, Bucket>) {
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

export type LimiterConfig = {
  /** Nombre max de tentatives dans la fenêtre. */
  max: number;
  /** Fenêtre glissante en ms. */
  windowMs: number;
  /** Durée du verrouillage après dépassement. */
  lockoutMs: number;
};

export const LIMITS = {
  login: { max: 5, windowMs: 15 * 60_000, lockoutMs: 15 * 60_000 },
  otpVerify: { max: 5, windowMs: 10 * 60_000, lockoutMs: 15 * 60_000 },
  otpSend: { max: 3, windowMs: 10 * 60_000, lockoutMs: 10 * 60_000 },
  passwordReset: { max: 5, windowMs: 30 * 60_000, lockoutMs: 30 * 60_000 },
} satisfies Record<string, LimiterConfig>;

function bucketKey(scope: string, id: string) { return `${scope}::${id.trim().toLowerCase()}`; }

/** Retourne le temps de verrouillage restant en ms, ou 0 si non verrouillé. */
export function lockoutRemaining(scope: keyof typeof LIMITS, id: string): number {
  const all = readAll();
  const b = all[bucketKey(scope, id)];
  if (!b?.lockedUntil) return 0;
  const left = b.lockedUntil - Date.now();
  return left > 0 ? left : 0;
}

/** Vérifie si l'action est autorisée. Lève si verrouillée. */
export function assertAllowed(scope: keyof typeof LIMITS, id: string): void {
  const left = lockoutRemaining(scope, id);
  if (left > 0) {
    const mins = Math.ceil(left / 60_000);
    throw new Error(`Trop de tentatives. Réessayez dans ${mins} min.`);
  }
}

/** Enregistre un échec et verrouille au besoin. Retourne le nb de tentatives restantes. */
export function recordFailure(scope: keyof typeof LIMITS, id: string): number {
  const cfg = LIMITS[scope];
  const all = readAll();
  const key = bucketKey(scope, id);
  const now = Date.now();
  const prev = all[key] ?? { fails: [] };
  const fails = prev.fails.filter((t) => now - t < cfg.windowMs);
  fails.push(now);
  const next: Bucket = { fails };
  if (fails.length >= cfg.max) next.lockedUntil = now + cfg.lockoutMs;
  all[key] = next;
  writeAll(all);
  return Math.max(0, cfg.max - fails.length);
}

/** Enregistre une consommation réussie (pour les quotas type otpSend). */
export function recordAttempt(scope: keyof typeof LIMITS, id: string): number {
  return recordFailure(scope, id);
}

/** Reset complet (succès) : libère le bucket. */
export function clearBucket(scope: keyof typeof LIMITS, id: string): void {
  const all = readAll();
  delete all[bucketKey(scope, id)];
  writeAll(all);
}
