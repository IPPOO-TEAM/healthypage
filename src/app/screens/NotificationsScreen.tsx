import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, BellOff, Pill, Calendar, FileText, Heart, CheckCircle2, AlertCircle, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

interface Notif {
  id: string | number;
  type: 'rdv' | 'medic' | 'examen' | 'bienetre' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

const ICONS = {
  rdv: Calendar, medic: Pill, examen: FileText, bienetre: Heart, system: Bell
};
const COLORS = {
  rdv: 'teal', medic: 'rose', examen: 'cyan', bienetre: 'pink', system: 'gray'
};

const INITIAL: Notif[] = [
  { id: 1, type: 'rdv', title: 'Rappel de rendez-vous', body: 'Consultation avec Dr. Diop demain à 10h30', time: 'Il y a 2h', read: false, urgent: true },
  { id: 2, type: 'medic', title: 'Prise de médicament', body: 'N\'oubliez pas votre Doliprane (12h)', time: 'Il y a 3h', read: false },
  { id: 3, type: 'examen', title: 'Résultat disponible', body: 'Vos analyses de sang sont prêtes', time: 'Hier', read: false },
  { id: 4, type: 'bienetre', title: 'Conseil personnalisé', body: 'Une marche de 30 min améliorerait votre sommeil', time: 'Hier', read: true },
  { id: 5, type: 'system', title: 'Mise à jour du carnet', body: 'Votre carnet de santé a été synchronisé', time: 'Il y a 2 jours', read: true }
];

type FilterType = 'all' | Notif['type'];
type Prefs = Record<Notif['type'], boolean>;
const PREFS_KEY = 'healthy-page:notif-prefs';
const DEFAULT_PREFS: Prefs = { rdv: true, medic: true, examen: true, bienetre: true, system: true };
const loadPrefs = (): Prefs => { try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return DEFAULT_PREFS; } };

export default function NotificationsScreen({ onBack }: Props) {
  const [list, setList] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  useEffect(() => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} }, [prefs]);

  const filtered = list.filter(n => (filter === 'all' || n.type === filter) && prefs[n.type]);
  const unread = filtered.filter(n => !n.read).length;
  const rdvProposed = list.filter(n => !n.read && n.type === 'rdv').length;

  const enablePush = async () => {
    if (typeof Notification === 'undefined') return;
    const r = await Notification.requestPermission();
    setPushPerm(r);
    if (r === 'granted') new Notification('Healthy Page', { body: 'Notifications activées ✓' });
  };

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) { setList([]); return; }
    api.listNotification(pid)
      .then((items) => setList(items ?? []))
      .catch((e) => { console.error('Load notifications:', e); setList([]); });
  }, []);

  const markRead = (id: string | number) => {
    setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const pid = getPatientId();
    if (pid) api.updateNotification(pid, String(id), { read: true }).catch((e) => console.error('Mark read:', e));
  };
  const markAll = () => {
    const pid = getPatientId();
    setList((l) => {
      const updated = l.map((n) => ({ ...n, read: true }));
      if (pid) {
        for (const n of l) {
          if (!n.read) api.updateNotification(pid, String(n.id), { read: true }).catch((e) => console.error('Mark all:', e));
        }
      }
      return updated;
    });
  };
  const remove = (id: string | number) => {
    setList((l) => l.filter((n) => n.id !== id));
    const pid = getPatientId();
    if (pid) api.deleteNotification(pid, String(id)).catch((e) => console.error('Delete notif:', e));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl relative">
              <Bell className="w-7 h-7" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-sm text-white/85">{unread} non lues</p>
              {rdvProposed > 0 && (
                <span className="mt-1 inline-flex items-center gap-1 bg-amber-400/30 border border-amber-200 text-amber-50 text-xs px-2 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3" /> {rdvProposed} RDV à confirmer
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowPrefs(true)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl" title="Préférences">
              <Settings className="w-4 h-4" />
            </button>
            {unread > 0 && (
              <button onClick={markAll} className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-medium">
                Tout marquer lu
              </button>
            )}
          </div>
        </div>
        </div>
      </motion.div>

      {pushPerm !== 'granted' && (
        <button onClick={enablePush} className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-900 inline-flex items-center justify-center gap-2 hover:bg-amber-100">
          <Bell className="w-4 h-4" /> {pushPerm === 'denied' ? 'Notifications bloquées, autorisez-les dans les réglages du navigateur' : 'Activer les notifications navigateur'}
        </button>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          { id: 'all', label: 'Toutes' },
          { id: 'rdv', label: 'RDV' },
          { id: 'medic', label: 'Médicaments' },
          { id: 'examen', label: 'Examens' },
          { id: 'bienetre', label: 'Bien-être' },
          { id: 'system', label: 'Système' }
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as FilterType)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${filter === f.id ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((n) => {
            const Icon = ICONS[n.type];
            const color = COLORS[n.type];
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                onClick={() => markRead(n.id)}
                className={`relative bg-white rounded-2xl p-4 shadow-sm border cursor-pointer ${
                  n.read ? 'border-gray-100' : 'border-teal-200 ring-1 ring-teal-100'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`bg-${color}-50 p-2.5 rounded-xl h-fit`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold text-gray-900 ${!n.read ? '' : 'opacity-80'}`}>{n.title}</h4>
                      {n.urgent && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {!n.read && n.type === 'rdv' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          À confirmer
                        </span>
                      )}
                      {!n.read && <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                    className="text-gray-400 hover:text-red-600 p-1 h-fit"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-300 mb-3" />
            <p className="text-gray-500">{filter === 'all' ? 'Aucune notification' : 'Rien dans cette catégorie'}</p>
          </div>
        )}
      </div>

      {showPrefs && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPrefs(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-md p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Préférences de notifications</h3>
              <button onClick={() => setShowPrefs(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <p className="text-xs text-gray-500">Activez les catégories que vous souhaitez recevoir.</p>
            {(Object.keys(DEFAULT_PREFS) as (keyof Prefs)[]).map(k => {
              const Icon = ICONS[k];
              const labels: Record<keyof Prefs, string> = { rdv: 'Rendez-vous', medic: 'Médicaments', examen: 'Examens', bienetre: 'Bien-être', system: 'Système' };
              return (
                <label key={k} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="inline-flex items-center gap-2 text-sm text-gray-800"><Icon className="w-4 h-4 text-teal-600" /> {labels[k]}</span>
                  <button onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))} className={`w-10 h-6 rounded-full relative transition ${prefs[k] ? 'bg-teal-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${prefs[k] ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </label>
              );
            })}
            <button onClick={() => { setList([]); list.forEach(n => { const pid = getPatientId(); if (pid) api.deleteNotification(pid, String(n.id)).catch(() => {}); }); setShowPrefs(false); }}
              className="w-full mt-2 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200 inline-flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
