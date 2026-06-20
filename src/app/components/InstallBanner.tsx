import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { canInstall, dismissInstall, promptInstall, subscribeInstall, isInstalled, isIos, hasNativePrompt } from './pwa';

export function InstallBanner() {
  const [visible, setVisible] = useState<boolean>(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(canInstall() && !isInstalled());
    sync();
    return subscribeInstall(sync);
  }, []);

  const onInstall = async () => {
    if (isIos() && !hasNativePrompt()) {
      setShowIosHelp(true);
      return;
    }
    setBusy(true);
    try { await promptInstall(); } finally { setBusy(false); }
  };

  const onDismiss = () => {
    dismissInstall();
    setShowIosHelp(false);
    setVisible(false);
  };

  const ios = isIos();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Installer Healthy Page"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed left-4 right-4 bottom-4 z-[9999] mx-auto max-w-md bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 sm:left-auto sm:right-4"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white p-2.5 rounded-xl shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Installer Healthy Page</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {ios && !hasNativePrompt()
                  ? "Ajoutez l'app à votre écran d'accueil iPhone."
                  : "Ajoutez l'app à votre écran d'accueil pour un accès rapide hors-ligne."}
              </p>
            </div>
            <button
              onClick={onInstall}
              disabled={busy}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-2 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {ios && !hasNativePrompt() ? 'Comment ?' : 'Installer'}
            </button>
            <button
              onClick={onDismiss}
              aria-label="Fermer"
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {showIosHelp && ios && (
            <motion.ol
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-2"
            >
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px] shrink-0">1</span>
                <span className="inline-flex items-center gap-1">Appuyez sur <Share className="w-4 h-4 text-blue-600 inline" aria-hidden="true" /> <span className="font-medium">Partager</span> en bas de Safari.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px] shrink-0">2</span>
                <span className="inline-flex items-center gap-1">Choisissez <Plus className="w-4 h-4 text-slate-700 inline" aria-hidden="true" /> <span className="font-medium">Sur l'écran d'accueil</span>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px] shrink-0">3</span>
                <span>Validez avec <span className="font-medium">Ajouter</span>.</span>
              </li>
            </motion.ol>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
