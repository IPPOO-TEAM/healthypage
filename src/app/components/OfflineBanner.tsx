import { useEffect, useState } from 'react';
import { WifiOff, CloudUpload, CheckCircle2 } from 'lucide-react';
import { pendingCount } from './offlineQueue';

/**
 * Bandeau global : indique l'état réseau ET le nombre d'actions en attente
 * dans la file offline. À la reconnexion, on affiche brièvement un état
 * "Synchronisation…" pendant que `installAutoFlush` rejoue les mutations.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [pending, setPending] = useState<number>(() => pendingCount());
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const refresh = () => setPending(pendingCount());
    const goOnline = () => { setOnline(true); refresh(); };
    const goOffline = () => { setOnline(false); refresh(); };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // Sondage léger : le rejeu se fait en arrière-plan, sans event dédié.
    const t = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.clearInterval(t);
    };
  }, []);

  // Petit pulse "Tout est synchronisé" quand la file passe de >0 à 0 en ligne.
  const [lastPending, setLastPending] = useState(pending);
  useEffect(() => {
    if (online && lastPending > 0 && pending === 0) {
      setJustSynced(true);
      const t = window.setTimeout(() => setJustSynced(false), 2500);
      return () => window.clearTimeout(t);
    }
    setLastPending(pending);
  }, [pending, online, lastPending]);

  if (!online) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold shadow"
      >
        <WifiOff className="w-4 h-4" aria-hidden="true" />
        <span>
          Connexion perdue — vos modifications seront enregistrées dès le retour en ligne.
          {pending > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20">
              {pending} en attente
            </span>
          )}
        </span>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-bold shadow"
      >
        <CloudUpload className="w-4 h-4 animate-pulse" aria-hidden="true" />
        <span>Synchronisation… {pending} action{pending > 1 ? 's' : ''} en attente</span>
      </div>
    );
  }

  if (justSynced) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold shadow"
      >
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        <span>Tout est synchronisé</span>
      </div>
    );
  }

  return null;
}

export default OfflineBanner;
