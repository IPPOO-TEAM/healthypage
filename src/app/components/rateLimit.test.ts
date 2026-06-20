import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stub localStorage + window avant d'importer le module sous test.
function installLocalStorage() {
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
  // @ts-expect-error stub
  globalThis.window = { localStorage: ls };
  return store;
}

let store: Map<string, string>;

beforeEach(() => {
  store = installLocalStorage();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-07T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error nettoyage
  delete globalThis.window;
});

describe('rateLimit', () => {
  it('autorise tant que le quota n\'est pas atteint', async () => {
    const { assertAllowed, recordFailure } = await import('./rateLimit');
    for (let i = 0; i < 4; i++) {
      expect(() => assertAllowed('login', 'a@b.co')).not.toThrow();
      recordFailure('login', 'a@b.co');
    }
    // 5e tentative : encore autorisée car le lock n'est posé qu'après l'enregistrement
    expect(() => assertAllowed('login', 'a@b.co')).not.toThrow();
  });

  it('verrouille après max tentatives', async () => {
    const { assertAllowed, recordFailure } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) recordFailure('login', 'a@b.co');
    expect(() => assertAllowed('login', 'a@b.co')).toThrow(/Trop de tentatives/);
  });

  it('lockoutRemaining renvoie un délai > 0 puis 0 après expiration', async () => {
    const { recordFailure, lockoutRemaining } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) recordFailure('login', 'a@b.co');
    expect(lockoutRemaining('login', 'a@b.co')).toBeGreaterThan(0);
    vi.advanceTimersByTime(15 * 60_000 + 1);
    expect(lockoutRemaining('login', 'a@b.co')).toBe(0);
  });

  it('isole les buckets par scope et par identifiant', async () => {
    const { recordFailure, lockoutRemaining } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) recordFailure('login', 'a@b.co');
    expect(lockoutRemaining('login', 'a@b.co')).toBeGreaterThan(0);
    expect(lockoutRemaining('login', 'autre@b.co')).toBe(0);
    expect(lockoutRemaining('otpVerify', 'a@b.co')).toBe(0);
  });

  it('clearBucket libère immédiatement', async () => {
    const { recordFailure, clearBucket, lockoutRemaining } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) recordFailure('login', 'a@b.co');
    clearBucket('login', 'a@b.co');
    expect(lockoutRemaining('login', 'a@b.co')).toBe(0);
  });

  it('normalise l\'identifiant (case + trim)', async () => {
    const { recordFailure, lockoutRemaining } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) recordFailure('login', '  A@B.CO  ');
    expect(lockoutRemaining('login', 'a@b.co')).toBeGreaterThan(0);
  });

  it('la fenêtre glissante oublie les tentatives anciennes', async () => {
    const { recordFailure } = await import('./rateLimit');
    for (let i = 0; i < 4; i++) recordFailure('login', 'a@b.co');
    vi.advanceTimersByTime(15 * 60_000 + 1);
    // Après la fenêtre, on repart à 1 tentative et il en reste 4.
    expect(recordFailure('login', 'a@b.co')).toBe(4);
  });
});
