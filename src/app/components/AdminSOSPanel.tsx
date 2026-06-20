import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, MapPin, Phone, X, Bell, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'healthy-page:sos-alerts';

type SOSAlert = {
  id: string;
  patientId: string | null;
  patient: any;
  location: { lat: number; lng: number; accuracy: number } | null;
  createdAt: string;
  status: 'sent' | 'acknowledged';
};

function readAlerts(): SOSAlert[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeAlerts(list: SOSAlert[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function chime() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1000, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.45);
    setTimeout(() => ctx.close(), 600);
  } catch {}
}

export function AdminSOSPanel() {
  const [alerts, setAlerts] = useState<SOSAlert[]>(() => readAlerts());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onSos = (e: Event) => {
      const detail = (e as CustomEvent<SOSAlert>).detail;
      setAlerts((prev) => [detail, ...prev].slice(0, 200));
      chime();
      setOpen(true);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setAlerts(readAlerts());
    };
    window.addEventListener('healthy-page:sos', onSos as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('healthy-page:sos', onSos as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const pending = alerts.filter((a) => a.status === 'sent');

  const acknowledge = (id: string) => {
    const next = alerts.map((a) => a.id === id ? { ...a, status: 'acknowledged' as const } : a);
    setAlerts(next);
    writeAlerts(next);
  };
  const dismissAll = () => {
    const next = alerts.map((a) => ({ ...a, status: 'acknowledged' as const }));
    setAlerts(next);
    writeAlerts(next);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center"
        aria-label="Alertes SOS"
      >
        {pending.length > 0 && <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />}
        <Bell className="w-6 h-6 relative" />
        {pending.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-yellow-300 text-red-900 text-xs font-bold flex items-center justify-center">
            {pending.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      <h2 className="text-xl font-bold tracking-tight">Alertes SOS</h2>
                    </div>
                    <p className="mt-1 text-sm text-white/85">
                      {pending.length} en attente · {alerts.length} au total
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20" aria-label="Fermer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {pending.length > 0 && (
                  <button onClick={dismissAll} className="mt-4 w-full py-2 rounded-full bg-white/15 hover:bg-white/25 text-sm font-medium">
                    Tout marquer comme traité
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {alerts.length === 0 && (
                  <div className="text-center text-slate-500 py-12">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    Aucune alerte SOS pour le moment.
                  </div>
                )}
                {alerts.map((a) => {
                  const p = a.patient ?? {};
                  const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Patient inconnu';
                  const isPending = a.status === 'sent';
                  return (
                    <div key={a.id} className={`rounded-2xl border p-4 ${isPending ? 'bg-white border-red-300 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${isPending ? 'bg-red-600 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="font-semibold text-slate-900">{name}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {new Date(a.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        {!isPending && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-slate-500">Téléphone</div>
                          <div className="font-medium text-slate-900 truncate">{p.phone ?? '—'}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-slate-500">Groupe sanguin</div>
                          <div className="font-medium text-slate-900">{p.blood ?? '—'}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 col-span-2">
                          <div className="text-slate-500">Lieu</div>
                          <div className="font-medium text-slate-900">
                            {a.location ? `${a.location.lat.toFixed(5)}, ${a.location.lng.toFixed(5)} (±${Math.round(a.location.accuracy)} m)` : 'Non disponible'}
                          </div>
                        </div>
                        {p.address && (
                          <div className="bg-slate-50 rounded-lg p-2 col-span-2">
                            <div className="text-slate-500">Adresse déclarée</div>
                            <div className="font-medium text-slate-900">{[p.address, p.city, p.country].filter(Boolean).join(', ')}</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {a.location && (
                          <a
                            href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900 text-white text-xs font-medium"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Localiser
                          </a>
                        )}
                        {p.phone && (
                          <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 text-white text-xs font-medium">
                            <Phone className="w-3.5 h-3.5" /> Appeler
                          </a>
                        )}
                        {isPending && (
                          <button
                            onClick={() => acknowledge(a.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300 text-xs font-medium ml-auto"
                          >
                            Marquer traité
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
