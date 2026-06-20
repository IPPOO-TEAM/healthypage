import { useEffect } from 'react';

export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add('sheet-open');
    return () => document.body.classList.remove('sheet-open');
  }, [active]);
}
