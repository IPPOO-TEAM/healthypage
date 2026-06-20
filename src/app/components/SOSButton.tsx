import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, MapPin, Phone, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import { api } from './api';
import { getPatientId } from './usePatientId';

const HOLD_MS = 1500;
const STORAGE_KEY = 'healthy-page:sos-alerts';

type SmsRecipient = { name: string; relation?: string; phone: string; status: 'sent' | 'failed'; sentAt: string };

type SOSAlert = {
  id: string;
  patientId: string | null;
  patient: any;
  emergency?: any;
  location: { lat: number; lng: number; accuracy: number } | null;
  locationHistory?: { lat: number; lng: number; accuracy: number; t: string }[];
  locationError?: string;
  smsRecipients?: SmsRecipient[];
  createdAt: string;
  status: 'sent' | 'acknowledged';
};

function playLoudBeeps(count = 5) {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const dur = 2.0;
    const gap = 0.25;
    for (let i = 0; i < count; i++) {
      const start = now + i * (dur + gap);
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o2.type = 'sine';
      o.frequency.value = 1000;
      o2.frequency.value = 2000;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.9, start + 0.015);
      g.gain.setValueAtTime(0.9, start + dur - 0.04);
      g.gain.linearRampToValueAtTime(0, start + dur);
      o.connect(g);
      o2.connect(g);
      g.connect(ctx.destination);
      o.start(start); o2.start(start);
      o.stop(start + dur); o2.stop(start + dur);
    }
    setTimeout(() => { try { ctx.close(); } catch {} }, count * (dur + gap) * 1000 + 300);
  } catch {}
}

function playSiren() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return null;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(620, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.5);
    o.frequency.linearRampToValueAtTime(620, ctx.currentTime + 1);
    g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination);
    o.start();
    return () => { try { o.stop(); ctx.close(); } catch {} };
  } catch {
    return null;
  }
}

function getLocation(): Promise<SOSAlert['location']> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

export function SOSButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SOSAlert | null>(null);
  const holdTimer = useRef<number | null>(null);
  const progressTimer = useRef<number | null>(null);
  const stopSiren = useRef<null | (() => void)>(null);
  const watchId = useRef<number | null>(null);
  const alertIdRef = useRef<string | null>(null);

  const stopWatch = () => {
    if (watchId.current != null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  useEffect(() => () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    stopSiren.current?.();
    stopWatch();
  }, []);

  // Déclenchement externe (IA, raccourci clavier, etc.) — ouvre la modale et lance l'alerte.
  useEffect(() => {
    const onExternalTrigger = () => {
      setOpen(true);
      setTimeout(() => { try { trigger(); } catch {} }, 50);
    };
    window.addEventListener('hp:sos:trigger', onExternalTrigger);
    return () => window.removeEventListener('hp:sos:trigger', onExternalTrigger);
  }, []);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    const startedAt = Date.now();
    progressTimer.current = window.setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - startedAt) / HOLD_MS) * 100));
    }, 30);
    holdTimer.current = window.setTimeout(() => trigger(), HOLD_MS);
  };

  const cancelHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    setHolding(false);
    setProgress(0);
  };

  const persistAlert = (alert: SOSAlert) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list: SOSAlert[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((a) => a.id === alert.id);
      if (idx >= 0) list[idx] = alert; else list.unshift(alert);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
      window.dispatchEvent(new CustomEvent('healthy-page:sos', { detail: alert }));
    } catch {}
  };

  const startLiveTracking = (alert: SOSAlert) => {
    if (!navigator.geolocation) return;
    alertIdRef.current = alert.id;
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        const next: SOSAlert = {
          ...alert,
          location: loc,
          locationHistory: [...(alert.locationHistory ?? []), { ...loc, t: new Date().toISOString() }].slice(-50),
        };
        Object.assign(alert, next);
        persistAlert(next);
        setSent((cur) => (cur && cur.id === next.id ? next : cur));
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  };

  const sendSmsToContacts = (alert: SOSAlert): SmsRecipient[] => {
    const recipients: { name: string; relation?: string; phone: string }[] = [];
    const em = alert.emergency;
    if (em?.phone) recipients.push({ name: em.name || 'Contact', relation: em.relation, phone: em.phone });
    const extra = (alert.patient?.contacts || alert.patient?.emergencyContacts || []) as any[];
    if (Array.isArray(extra)) {
      for (const c of extra) if (c?.phone) recipients.push({ name: c.name || 'Contact', relation: c.relation, phone: c.phone });
    }
    const loc = alert.location ? `https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}` : 'position en cours…';
    const name = alert.patient?.firstName ? `${alert.patient.firstName} ${alert.patient.lastName ?? ''}`.trim() : 'un proche';
    const body = `🚨 ALERTE SOS HEALTHY PAGE — ${name} a déclenché une alerte d'urgence. Position: ${loc}`;
    const sentAt = new Date().toISOString();
    const out: SmsRecipient[] = recipients.map((r) => {
      // Mock SMS gateway — log payload (replace with real provider e.g. Twilio in production)
      console.info('[SOS][SMS]', { to: r.phone, body });
      return { ...r, status: 'sent' as const, sentAt };
    });
    return out;
  };

  const trigger = async () => {
    cancelHold();
    setSending(true);
    stopSiren.current = playSiren();

    const patientId = getPatientId();
    let patient: any = null;
    let emergency: any = null;
    if (patientId) {
      try { const r: any = await api.getPatient(patientId); patient = r.patient; emergency = r.emergency; } catch {}
    }
    const location = await getLocation();

    const alert: SOSAlert = {
      id: `sos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      patientId,
      patient,
      emergency,
      location,
      locationHistory: location ? [{ ...location, t: new Date().toISOString() }] : [],
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    alert.smsRecipients = sendSmsToContacts(alert);
    persistAlert(alert);

    setTimeout(() => { stopSiren.current?.(); stopSiren.current = null; }, 600);
    playLoudBeeps(5);
    if ('vibrate' in navigator) {
      try { navigator.vibrate([300, 120, 300, 120, 300, 120, 300, 120, 300]); } catch {}
    }
    startLiveTracking(alert);
    setSending(false);
    setSent(alert);
  };

  const close = () => {
    setOpen(false);
    setSent(null);
    setSending(false);
    cancelHold();
    stopWatch();
  };

  return (
    <>
      {/* Floating SOS button (above bottom nav) */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Bouton d'urgence SOS"
        className="fixed left-4 bottom-24 z-30 w-16 h-16 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
      >
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
        <span className="absolute -inset-1 rounded-full ring-4 ring-red-500/30" />
        <span className="relative font-bold tracking-wider">SOS</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sending && close()} />

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md mx-2 mb-2 sm:mb-0 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              {!sent ? (
                <>
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 text-white relative">
                    <button onClick={close} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20" aria-label="Fermer">
                      <X className="w-5 h-5" />
                    </button>
                    <AlertTriangle className="w-10 h-10" />
                    <h2 className="mt-3 text-2xl font-bold tracking-tight">Alerte SOS</h2>
                    <p className="mt-1 text-white/90 text-sm">
                      Maintenez le bouton pour envoyer une alerte d'urgence à l'administration HEALTHY PAGE avec votre position en temps réel.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" /> Votre localisation GPS sera transmise</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" /> Vos informations médicales seront partagées</li>
                      <li className="flex items-start gap-2"><Phone className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" /> L'équipe d'urgence sera notifiée immédiatement</li>
                    </ul>

                    <button
                      onMouseDown={startHold}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={startHold}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      disabled={sending}
                      className="relative w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider overflow-hidden select-none disabled:opacity-60"
                    >
                      <span
                        className="absolute inset-y-0 left-0 bg-red-900/40 transition-[width] ease-linear"
                        style={{ width: `${progress}%`, transitionDuration: holding ? '30ms' : '300ms' }}
                      />
                      <span className="relative inline-flex items-center gap-2 justify-center">
                        {sending ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours…</>
                          : holding ? 'Maintenez…'
                          : <><AlertTriangle className="w-5 h-5" /> MAINTENIR POUR DÉCLENCHER</>}
                      </span>
                    </button>

                    <a href="tel:112" className="block w-full text-center py-3 rounded-2xl border border-red-200 text-red-700 font-medium hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40">
                      Appeler les secours (112)
                    </a>

                    <button
                      onClick={() => { close(); navigate('/patient/urgences'); }}
                      className="block w-full text-center py-2.5 rounded-2xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                    >
                      <span className="inline-flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> Voir toutes les urgences (Pompiers, Police, Ambulance)</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Alerte envoyée</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    L'administration HEALTHY PAGE a été notifiée. Une équipe va vous contacter dans les plus brefs délais.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-left text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="text-slate-500">Référence</div>
                      <div className="mt-1 font-mono text-slate-900 dark:text-white truncate">{sent.id.slice(-10)}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Position en direct
                      </div>
                      <div className="mt-1 font-mono text-slate-900 dark:text-white">
                        {sent.location ? `${sent.location.lat.toFixed(4)}, ${sent.location.lng.toFixed(4)}` : 'Recherche…'}
                      </div>
                    </div>
                  </div>

                  {sent.smsRecipients && sent.smsRecipients.length > 0 && (
                    <div className="mt-4 text-left bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        <MessageSquare className="w-4 h-4" />
                        SMS envoyés à vos contacts ({sent.smsRecipients.length})
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                        {sent.smsRecipients.map((r) => (
                          <li key={r.phone} className="flex justify-between gap-2">
                            <span className="truncate">{r.name}{r.relation ? ` · ${r.relation}` : ''}</span>
                            <span className="font-mono">{r.phone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {sent.smsRecipients && sent.smsRecipients.length === 0 && (
                    <div className="mt-4 text-left text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
                      Aucun contact d'urgence renseigné dans votre profil. Ajoutez-en un pour recevoir des SMS lors d'un SOS.
                    </div>
                  )}
                  <button onClick={close} className="mt-6 w-full py-3 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold">
                    Fermer
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
