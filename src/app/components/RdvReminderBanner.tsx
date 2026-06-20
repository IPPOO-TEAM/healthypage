import { useEffect, useMemo, useState } from 'react';
import { Bell, Clock, BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Rdv {
  id: string | number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: 'cabinet' | 'tele';
  status: string;
}

const FR_MONTHS: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11,
};
function parseWhen(date: string, time: string): Date | null {
  const m = String(date || '').trim().toLowerCase().match(/^(\d{1,2})\s+([a-zéûô]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = FR_MONTHS[m[2]];
  if (month === undefined) return null;
  const [hh, mm] = String(time || '00:00').split(':').map((x) => parseInt(x, 10));
  return new Date(parseInt(m[3], 10), month, parseInt(m[1], 10), hh || 0, mm || 0);
}

export default function RdvReminderBanner({ rdvs }: { rdvs: Rdv[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('healthy-page:reminders-dismissed') || '[]')); } catch { return new Set(); }
  });

  const persistDismissed = (next: Set<string>) => {
    try { localStorage.setItem('healthy-page:reminders-dismissed', JSON.stringify(Array.from(next))); } catch {}
  };

  const reminder = useMemo(() => {
    const now = Date.now();
    const candidates = (rdvs || [])
      .filter((r) => r.status === 'upcoming')
      .map((r) => {
        const when = parseWhen(r.date, r.time);
        if (!when) return null;
        const ms = when.getTime() - now;
        if (ms <= 0) return null;
        const minutes = ms / 60000;
        let kind: 'J1' | 'H2' | 'SOON' | null = null;
        if (minutes <= 150 && minutes > 0) kind = minutes <= 30 ? 'SOON' : 'H2';
        else if (minutes <= 26 * 60 && minutes > 0) kind = 'J1';
        if (!kind) return null;
        return { r, when, kind, ms };
      })
      .filter(Boolean) as Array<{ r: Rdv; when: Date; kind: 'J1' | 'H2' | 'SOON'; ms: number }>;
    candidates.sort((a, b) => a.ms - b.ms);
    const next = candidates[0];
    if (!next) return null;
    const key = `${next.r.id}:${next.kind}`;
    if (dismissed.has(key)) return null;
    return { ...next, key };
  }, [rdvs, dismissed]);

  useEffect(() => {
    if (!reminder) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const ackKey = `healthy-page:notif-shown:${reminder.key}`;
    try { if (localStorage.getItem(ackKey)) return; } catch {}
    const title = reminder.kind === 'SOON' ? 'RDV imminent' : reminder.kind === 'H2' ? 'RDV dans 2 heures' : 'RDV demain';
    const body = `${reminder.r.doctor} · ${reminder.r.date} à ${reminder.r.time}`;
    try {
      new Notification(title, { body, icon: '/favicon.ico', tag: reminder.key });
      localStorage.setItem(ackKey, '1');
    } catch {}
  }, [reminder]);

  if (!reminder) return null;

  const labelFor = (kind: 'J1' | 'H2' | 'SOON') =>
    kind === 'SOON' ? 'Imminent' : kind === 'H2' ? 'Dans 2 heures' : 'Demain';
  const colorFor = (kind: 'J1' | 'H2' | 'SOON') =>
    kind === 'SOON' ? 'from-rose-500 to-orange-500' : kind === 'H2' ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500';

  const dismiss = () => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(reminder.key);
      persistDismissed(next);
      return next;
    });
  };

  const askPermission = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={reminder.key}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-gradient-to-r ${colorFor(reminder.kind)} text-white`}
      >
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            {reminder.kind === 'SOON' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-white/25 rounded-full px-2 py-0.5">
                Rappel · {labelFor(reminder.kind)}
              </span>
            </div>
            <p className="font-bold mt-1 truncate">{reminder.r.doctor}</p>
            <p className="text-xs opacity-90 truncate flex items-center gap-1">
              <Clock className="w-3 h-3" /> {reminder.r.date} à {reminder.r.time} · {reminder.r.location}
            </p>
            {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
              <button onClick={askPermission} className="mt-2 text-[11px] underline underline-offset-2 opacity-90 hover:opacity-100">
                Activer les notifications
              </button>
            )}
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg hover:bg-white/20" aria-label="Masquer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
