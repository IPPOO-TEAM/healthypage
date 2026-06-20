import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function installLocalStorage() {
  const store = new Map<string, string>();
  // @ts-expect-error stub
  globalThis.window = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => { store.set(k, String(v)); },
      removeItem: (k: string) => { store.delete(k); },
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    },
  };
}

beforeEach(() => {
  installLocalStorage();
  vi.resetModules();
});
afterEach(() => {
  // @ts-expect-error cleanup
  delete globalThis.window;
});

describe('offlineQueue', () => {
  it('enqueue + listPending + pendingCount', async () => {
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'createRdv', url: '/x', method: 'POST', body: { a: 1 } });
    expect(m.pendingCount()).toBe(1);
    expect(m.listPending()[0]).toMatchObject({ kind: 'createRdv', attempts: 0 });
  });

  it('flush vide la file en cas de succès', async () => {
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'a', url: '/a', method: 'POST' });
    m.enqueue({ kind: 'b', url: '/b', method: 'POST' });
    const res = await m.flush(async () => {});
    expect(res).toEqual({ flushed: 2, failed: 0, dropped: 0 });
    expect(m.pendingCount()).toBe(0);
  });

  it('flush stoppe sur erreur et incrémente attempts', async () => {
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'a', url: '/a', method: 'POST' });
    m.enqueue({ kind: 'b', url: '/b', method: 'POST' });
    const res = await m.flush(async () => { throw new Error('net'); });
    expect(res.flushed).toBe(0);
    expect(res.failed).toBe(1);
    expect(m.pendingCount()).toBe(2);
    expect(m.listPending()[0].attempts).toBe(1);
  });

  it('drop après MAX_ATTEMPTS', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'a', url: '/a', method: 'POST' });
    for (let i = 0; i < 5; i++) {
      await m.flush(async () => { throw new Error('net'); });
    }
    // À la 5e tentative, attempts atteint MAX_ATTEMPTS et la mutation est droppée.
    expect(m.pendingCount()).toBe(0);
  });

  it('clearQueue vide tout', async () => {
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'a', url: '/a', method: 'POST' });
    m.clearQueue();
    expect(m.pendingCount()).toBe(0);
  });

  it('flush continue avec la 2e mutation après succès de la 1ère', async () => {
    const m = await import('./offlineQueue');
    m.enqueue({ kind: 'a', url: '/a', method: 'POST' });
    m.enqueue({ kind: 'b', url: '/b', method: 'POST' });
    const order: string[] = [];
    const res = await m.flush(async (q) => { order.push(q.kind); });
    expect(order).toEqual(['a', 'b']);
    expect(res.flushed).toBe(2);
  });
});
