import { useEffect, useState } from 'react';

export type CmsBannerSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface CmsBanner {
  active: boolean;
  severity: CmsBannerSeverity;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface CmsHomeHero {
  active: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface CmsContactBlock {
  active: boolean;
  emergencyPhone: string;
  supportEmail: string;
  supportHours: string;
}

export interface CmsConfig {
  banner: CmsBanner;
  hero: CmsHomeHero;
  contact: CmsContactBlock;
  maintenanceMode: boolean;
  updatedAt?: string;
}

export const CMS_KEY = 'healthy-page:cms';

export const DEFAULT_CMS: CmsConfig = {
  banner: {
    active: false,
    severity: 'info',
    title: '',
    message: '',
    ctaLabel: '',
    ctaHref: '',
  },
  hero: {
    active: false,
    eyebrow: '',
    title: '',
    subtitle: '',
  },
  contact: {
    active: false,
    emergencyPhone: '112',
    supportEmail: 'support@healthypage.com',
    supportHours: '7j/7 · 8h–20h',
  },
  maintenanceMode: false,
};

export function loadCms(): CmsConfig {
  if (typeof window === 'undefined') return DEFAULT_CMS;
  try {
    const raw = window.localStorage.getItem(CMS_KEY);
    if (!raw) return DEFAULT_CMS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CMS,
      ...parsed,
      banner: { ...DEFAULT_CMS.banner, ...(parsed?.banner ?? {}) },
      hero: { ...DEFAULT_CMS.hero, ...(parsed?.hero ?? {}) },
      contact: { ...DEFAULT_CMS.contact, ...(parsed?.contact ?? {}) },
    };
  } catch {
    return DEFAULT_CMS;
  }
}

export function saveCms(cfg: CmsConfig) {
  if (typeof window === 'undefined') return;
  const next = { ...cfg, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(CMS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('healthy-page:cms-update'));
}

export function useCms(): CmsConfig {
  const [cfg, setCfg] = useState<CmsConfig>(() => loadCms());
  useEffect(() => {
    const refresh = () => setCfg(loadCms());
    const onStorage = (e: StorageEvent) => { if (e.key === CMS_KEY) refresh(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('healthy-page:cms-update', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('healthy-page:cms-update', refresh as EventListener);
    };
  }, []);
  return cfg;
}
