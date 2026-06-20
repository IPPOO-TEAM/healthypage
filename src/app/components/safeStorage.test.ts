import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function installLocalStorage(opts?: { throwOnSet?: boolean }) {
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      if (opts?.throwOnSet) throw new Error('QuotaExceeded');
      store.set(k, String(v));
    },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
  // @ts-expect-error stub
  globalThis.window = { localStorage: ls };
  return store;
}

afterEach(() => {
  // @ts-expect-error nettoyage
  delete globalThis.window;
  vi.resetModules();
});

describe('safeStorage', () => {
  beforeEach(() => installLocalStorage());

  it('namespace les clés sous healthy-page:', async () => {
    const { safeStorage } = await import('./safeStorage');
    safeStorage.set('foo', 'bar');
    expect(window.localStorage.getItem('healthy-page:foo')).toBe('bar');
  });

  it('get retourne null si absent', async () => {
    const { safeStorage } = await import('./safeStorage');
    expect(safeStorage.get('absent')).toBeNull();
  });

  it('getJSON renvoie le fallback en cas de JSON corrompu', async () => {
    const { safeStorage } = await import('./safeStorage');
    safeStorage.set('k', 'not-json{');
    expect(safeStorage.getJSON('k', { ok: true })).toEqual({ ok: true });
  });

  it('setJSON + getJSON round-trip un objet', async () => {
    const { safeStorage } = await import('./safeStorage');
    safeStorage.setJSON('cfg', { a: 1, b: 'x' });
    expect(safeStorage.getJSON('cfg', null)).toEqual({ a: 1, b: 'x' });
  });

  it('del supprime la clé', async () => {
    const { safeStorage } = await import('./safeStorage');
    safeStorage.set('k', 'v');
    safeStorage.del('k');
    expect(safeStorage.get('k')).toBeNull();
  });

  it('clearNamespace ne touche que healthy-page:*', async () => {
    const { safeStorage } = await import('./safeStorage');
    safeStorage.set('mine', 'v');
    window.localStorage.setItem('autre-app:x', 'keep');
    safeStorage.clearNamespace();
    expect(safeStorage.get('mine')).toBeNull();
    expect(window.localStorage.getItem('autre-app:x')).toBe('keep');
  });
});

describe('safeStorage – fallback mémoire si localStorage indispo', () => {
  beforeEach(() => {
    installLocalStorage({ throwOnSet: true });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('isPersistent renvoie false et set/get utilisent le fallback', async () => {
    const { safeStorage } = await import('./safeStorage');
    expect(safeStorage.isPersistent()).toBe(false);
    expect(safeStorage.set('k', 'v')).toBe(true);
    expect(safeStorage.get('k')).toBe('v');
  });
});
