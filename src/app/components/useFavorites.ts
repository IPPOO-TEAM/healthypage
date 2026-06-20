import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'healthy-page:favorites';

function read(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<number[]>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids]);

  // Sync across tabs / multiple hook instances
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(read());
    };
    window.addEventListener('storage', onStorage);
    const onCustom = () => setIds(read());
    window.addEventListener('hp-favorites-changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hp-favorites-changed', onCustom);
    };
  }, []);

  const toggle = useCallback((id: number) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id];
      window.dispatchEvent(new Event('hp-favorites-changed'));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);

  return { ids, isFavorite, toggle };
}
