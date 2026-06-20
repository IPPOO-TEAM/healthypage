// Wrapper localStorage robuste pour Healthy Page.
// Pourquoi ce module :
//  - localStorage peut throw (Safari mode privé, quota dépassé, SSR).
//  - JSON.parse peut throw sur données corrompues.
//  - Le namespacing évite les collisions entre features.
//  - Centralise les lectures/écritures pour faciliter une migration future
//    (IndexedDB, chiffrement, sync backend, etc.).

const NS = 'healthy-page:';
const MEMORY_FALLBACK = new Map<string, string>();

function available(): boolean {
  try {
    const k = `${NS}__probe__`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
const HAS_LS = typeof window !== 'undefined' && available();

function fullKey(key: string): string {
  return key.startsWith(NS) ? key : `${NS}${key}`;
}

export const safeStorage = {
  /** Lit une chaîne brute ou null. */
  get(key: string): string | null {
    const k = fullKey(key);
    if (!HAS_LS) return MEMORY_FALLBACK.get(k) ?? null;
    try { return window.localStorage.getItem(k); } catch { return MEMORY_FALLBACK.get(k) ?? null; }
  },

  /** Écrit une chaîne brute. Retourne false si l'écriture a échoué (quota, etc.). */
  set(key: string, value: string): boolean {
    const k = fullKey(key);
    if (!HAS_LS) { MEMORY_FALLBACK.set(k, value); return true; }
    try {
      window.localStorage.setItem(k, value);
      return true;
    } catch (e) {
      // Note : on garde console.warn ici car logger.ts dépend de safeStorage (cycle).
      console.warn(`safeStorage: écriture impossible pour "${k}"`, e);
      MEMORY_FALLBACK.set(k, value);
      return false;
    }
  },

  del(key: string): void {
    const k = fullKey(key);
    MEMORY_FALLBACK.delete(k);
    if (!HAS_LS) return;
    try { window.localStorage.removeItem(k); } catch {}
  },

  /** Lecture JSON avec fallback typé. */
  getJSON<T>(key: string, fallback: T): T {
    const raw = this.get(key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  },

  /** Écriture JSON avec sérialisation sûre. */
  setJSON<T>(key: string, value: T): boolean {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`safeStorage: sérialisation impossible pour "${key}"`, e);
      return false;
    }
  },

  /** Supprime toutes les clés Healthy Page (ne touche pas aux autres apps). */
  clearNamespace(): void {
    MEMORY_FALLBACK.clear();
    if (!HAS_LS) return;
    try {
      const toDelete: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(NS)) toDelete.push(k);
      }
      toDelete.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  },

  /** Indique si le vrai localStorage est utilisable (sinon on retombe en mémoire). */
  isPersistent(): boolean { return HAS_LS; },
};
