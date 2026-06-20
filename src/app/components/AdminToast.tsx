import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: string; kind: ToastKind; message: string };

const Ctx = createContext<{ push: (kind: ToastKind, message: string) => void }>({ push: () => {} });

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((p) => [...p, { id, kind, message }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] space-y-2 pointer-events-none">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertTriangle : Info;
            const bg = t.kind === 'success' ? 'bg-emerald-600' : t.kind === 'error' ? 'bg-red-600' : 'bg-slate-900';
            return (
              <motion.div
                key={t.id}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`${bg} text-white rounded-2xl shadow-xl p-3 pl-4 pr-3 flex items-start gap-3 max-w-sm pointer-events-auto`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm flex-1 leading-relaxed">{t.message}</p>
                <button
                  onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))}
                  className="p-0.5 rounded hover:bg-white/15"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

export function useSessionWatchdog(onExpired: () => void) {
  useEffect(() => {
    const tick = () => {
      try {
        const raw = window.localStorage.getItem('healthy-page:admin-session');
        if (!raw) return onExpired();
        const s = JSON.parse(raw);
        if (Date.now() > new Date(s.expiresAt).getTime()) onExpired();
      } catch {}
    };
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [onExpired]);
}
