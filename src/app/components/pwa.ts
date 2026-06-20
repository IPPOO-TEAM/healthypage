// PWA install + auto-update plumbing.
// - injecte le manifest dynamiquement (fonctionne en preview Make et en prod)
// - capture beforeinstallprompt pour proposer une installation native
// - enregistre le service worker et déclenche l'auto-update (poll toutes 15 min
//   + écoute online/visibilitychange), avec rechargement automatique au switch.

import { log } from './logger';

const DISMISSED_KEY = 'healthy-page:install-dismissed';
const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

type DeferredPromptLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: DeferredPromptLike | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) {
    try { l(); } catch { /* ignore */ }
  }
}

export function subscribeInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function canInstall(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInstalled()) return false;
  try {
    if (window.localStorage.getItem(DISMISSED_KEY) === '1') return false;
  } catch { /* noop */ }
  return deferredPrompt !== null || isIos();
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iPadOS = /Mac/i.test(ua) && (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints! > 1;
  return /iPhone|iPad|iPod/i.test(ua) || iPadOS;
}

export function hasNativePrompt(): boolean {
  return deferredPrompt !== null;
}

export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(standalone || iosStandalone);
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    emit();
    return outcome;
  } catch {
    return 'unavailable';
  }
}

export function dismissInstall(): void {
  try { window.localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* noop */ }
  emit();
}

function injectManifest() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[rel="manifest"]')) return;
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = '/manifest.webmanifest';
  document.head.appendChild(link);

  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#0f766e';
    document.head.appendChild(meta);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-status-bar-style';
    meta.content = 'black-translucent';
    document.head.appendChild(meta);
  }
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.mjs', { scope: '/', type: 'module' });
    return reg;
  } catch (e) {
    log.warn?.('SW register failed', e);
    return null;
  }
}

function activateWaitingWorker(reg: ServiceWorkerRegistration) {
  if (reg.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

function shouldRegisterSW(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.top !== window.self) return false;
  } catch { return false; }
  const proto = window.location.protocol;
  const host = window.location.hostname;
  if (proto !== 'https:' && host !== 'localhost' && host !== '127.0.0.1') return false;
  return true;
}

export function installPWA(): void {
  if (typeof window === 'undefined') return;

  try { injectManifest(); } catch { /* noop */ }

  try {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as DeferredPromptLike;
      emit();
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      try { window.localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* noop */ }
      emit();
    });
  } catch { /* noop */ }

  if (!shouldRegisterSW()) return;

  registerServiceWorker().then((reg) => {
    if (!reg) return;

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          activateWaitingWorker(reg);
        }
      });
    });

    const check = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      reg.update().catch(() => { /* silencieux */ });
    };
    window.setInterval(check, UPDATE_CHECK_INTERVAL_MS);
    window.addEventListener('online', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  });
}
