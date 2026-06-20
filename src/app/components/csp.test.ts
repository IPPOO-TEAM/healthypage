import { describe, it, expect, afterEach, vi } from 'vitest';
import { __cspInternal } from './csp';

describe('csp – buildPolicy', () => {
  const policy = __cspInternal.buildPolicy();

  it('contient default-src self', () => {
    expect(policy).toMatch(/default-src 'self'/);
  });
  it('autorise les connexions HTTPS et WebSocket', () => {
    expect(policy).toMatch(/connect-src[^;]*https:/);
    expect(policy).toMatch(/connect-src[^;]*wss:/);
  });
  it('interdit frame-src et object-src', () => {
    expect(policy).toMatch(/frame-src 'none'/);
    expect(policy).toMatch(/object-src 'none'/);
  });
  it('durcit base-uri et form-action', () => {
    expect(policy).toMatch(/base-uri 'self'/);
    expect(policy).toMatch(/form-action 'self'/);
  });
  it('autorise data: + blob: pour les images (avatars/uploads)', () => {
    expect(policy).toMatch(/img-src[^;]*data:/);
    expect(policy).toMatch(/img-src[^;]*blob:/);
  });
});

describe('csp – installCSP', () => {
  afterEach(() => {
    // @ts-expect-error nettoyage entre tests
    delete globalThis.document;
    vi.resetModules();
  });

  it('est idempotent : ne crée pas deux balises', async () => {
    const headChildren: HTMLElement[] = [];
    // @ts-expect-error stub minimal
    globalThis.document = {
      querySelector: () => null,
      createElement: () => ({ setAttribute: () => {} } as unknown as HTMLElement),
      head: { prepend: (el: HTMLElement) => headChildren.push(el) },
    };
    // @ts-expect-error force l'install en env de test (sinon DEV=true => no-op)
    globalThis.window = { __HP_FORCE_CSP__: true };
    const mod = await import('./csp');
    mod.installCSP();
    mod.installCSP();
    expect(headChildren.length).toBe(1);
    // @ts-expect-error cleanup
    delete globalThis.window;
  });

  it('no-op si une CSP existe déjà', async () => {
    const headChildren: HTMLElement[] = [];
    // @ts-expect-error stub minimal
    globalThis.document = {
      querySelector: () => ({} as HTMLElement),
      createElement: () => ({ setAttribute: () => {} } as unknown as HTMLElement),
      head: { prepend: (el: HTMLElement) => headChildren.push(el) },
    };
    // @ts-expect-error force l'install en env de test
    globalThis.window = { __HP_FORCE_CSP__: true };
    const mod = await import('./csp');
    mod.installCSP();
    expect(headChildren.length).toBe(0);
    // @ts-expect-error cleanup
    delete globalThis.window;
  });
});
