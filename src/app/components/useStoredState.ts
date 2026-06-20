import { useCallback, useEffect, useState } from 'react';

function readKey<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readKey(key, initial));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('hp-storage-changed', { detail: { key } }));
    } catch {}
  }, [key, value]);

  useEffect(() => {
    const sync = () => {
      setValue((prev) => {
        const next = readKey(key, initial);
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    };
    const onStorage = (e: StorageEvent) => { if (e.key === key) sync(); };
    const onCustom = (e: Event) => {
      const k = (e as CustomEvent).detail?.key;
      if (k === key) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('hp-storage-changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hp-storage-changed', onCustom as EventListener);
    };
  }, [key]);

  const reset = useCallback(() => {
    try { window.localStorage.removeItem(key); } catch {}
    setValue(initial);
  }, [key, initial]);

  return [value, setValue, reset] as const;
}

export interface PatientPreferences {
  preferredDestination?: string;
  preferredFormule?: string;
  preferredDuration?: number;
  notificationsEmail?: boolean;
  notificationsSms?: boolean;
  language?: string;
  reducedMotion?: boolean;
  lastBooking?: { sejourId: string; startISO: string; nights: number; guests: number } | null;
  sejourFavorites?: string[];
}

const PREF_KEY = 'healthy-page:preferences';
const PREF_DEFAULTS: PatientPreferences = {
  notificationsEmail: true,
  notificationsSms: false,
  reducedMotion: false,
  sejourFavorites: [],
};

export function usePatientPreferences() {
  const [prefs, setPrefs] = useStoredState<PatientPreferences>(PREF_KEY, PREF_DEFAULTS);

  const update = useCallback((patch: Partial<PatientPreferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, [setPrefs]);

  const toggleSejourFavorite = useCallback((sejourId: string) => {
    setPrefs((p) => {
      const list = p.sejourFavorites ?? [];
      const next = list.includes(sejourId) ? list.filter((x) => x !== sejourId) : [...list, sejourId];
      return { ...p, sejourFavorites: next };
    });
  }, [setPrefs]);

  const isSejourFavorite = useCallback(
    (sejourId: string) => (prefs.sejourFavorites ?? []).includes(sejourId),
    [prefs.sejourFavorites]
  );

  return { prefs, update, toggleSejourFavorite, isSejourFavorite };
}
