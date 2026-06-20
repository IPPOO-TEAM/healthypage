import { useState } from 'react';
import { ArrowLeft, Bell, Globe, Shield, Eye, Moon, Smartphone, LogOut, Lock, Trash2, ChevronRight, MessageSquare, Wallet } from 'lucide-react';
import { api } from '../components/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { usePatientPreferences } from '../components/useStoredState';

interface Props { onBack: () => void; }

const KEYS_TO_CLEAR = [
  'healthy-page:role',
  'healthy-page:patientId',
  'healthy-page:proId',
  'healthy-page:onboarded',
  'healthy-page:demo-patient',
  'healthy-page:demo-pro',
  'healthy-page:demo-patientId',
  'healthy-page:demo-proId',
];

const PREF_KEY = 'healthy-page:prefs';
const loadPrefs = () => {
  try { return JSON.parse(window.localStorage.getItem(PREF_KEY) ?? '{}'); } catch { return {}; }
};
const savePref = (patch: Record<string, any>) => {
  try {
    const cur = loadPrefs();
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch {}
};

export default function ParametresScreen({ onBack }: Props) {
  const initial = loadPrefs();
  const [notif, setNotif] = useState<boolean>(initial.notif ?? true);
  const [emailNotif, setEmailNotif] = useState<boolean>(initial.emailNotif ?? false);
  const [biom, setBiom] = useState<boolean>(initial.biom ?? true);
  const [share, setShare] = useState<boolean>(initial.share ?? false);
  const [lang, setLang] = useState<string>(initial.lang ?? 'fr');
  const [busy, setBusy] = useState(false);
  const { prefs: typedPrefs, update: updateTypedPrefs } = usePatientPreferences();
  const smsOn = typedPrefs.notificationsSms ?? false;

  const askPushPermission = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
  };

  const logout = () => {
    if (busy) return;
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return;
    try { KEYS_TO_CLEAR.forEach((k) => window.localStorage.removeItem(k)); } catch {}
    window.location.href = '/';
  };

  const deleteAccount = async () => {
    if (busy) return;
    if (!window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    setBusy(true);
    try {
      const pid = window.localStorage.getItem('healthy-page:patientId');
      const proId = window.localStorage.getItem('healthy-page:proId');
      if (pid) {
        try { await api.deletePatient(pid); } catch (e) { console.error('deletePatient failed:', e); }
      }
      if (proId) {
        try { await api.deletePro(proId); } catch (e) { console.error('deletePro failed:', e); }
      }
    } finally {
      try { KEYS_TO_CLEAR.forEach((k) => window.localStorage.removeItem(k)); } catch {}
      window.location.href = '/';
    }
  };

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition ${on ? 'bg-teal-600' : 'bg-gray-300'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 ${on ? 'left-5' : 'left-0.5'} w-6 h-6 bg-white rounded-full shadow transition-all`} />
    </button>
  );

  const Row = ({ icon: Icon, label, sub, right, onClick }: any) => (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`w-full flex items-center gap-3 p-4 transition text-left ${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
    >
      <div className="bg-gray-100 p-2 rounded-lg"><Icon className="w-5 h-5 text-gray-700" /></div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1683111124427-650aff5592a8?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <p className="text-sm text-white/80">Personnalisez votre expérience</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2"><p className="text-xs font-semibold text-gray-500 uppercase">Notifications & rappels</p></div>
        <Row icon={Bell} label="Notifications push" sub="Rappels J-1 et H-2 dans le navigateur" right={<Toggle on={notif} onChange={() => { const v = !notif; setNotif(v); savePref({ notif: v }); if (v) askPushPermission(); }} />} />
        <Row icon={MessageSquare} label="Rappels SMS" sub="J-1 et H-2 sur votre téléphone" right={<Toggle on={smsOn} onChange={() => updateTypedPrefs({ notificationsSms: !smsOn })} />} />
        <Row icon={Smartphone} label="Notifications email" right={<Toggle on={emailNotif} onChange={() => { const v = !emailNotif; setEmailNotif(v); savePref({ emailNotif: v }); updateTypedPrefs({ notificationsEmail: v }); }} />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2"><p className="text-xs font-semibold text-gray-500 uppercase">Confidentialité</p></div>
        <Row icon={Lock} label="Authentification biométrique" sub="Face ID / empreinte" right={<Toggle on={biom} onChange={() => { const v = !biom; setBiom(v); savePref({ biom: v }); }} />} />
        <Row icon={Eye} label="Partage anonyme de données" sub="Aider la recherche médicale" right={<Toggle on={share} onChange={() => { const v = !share; setShare(v); savePref({ share: v }); }} />} />
        <Row icon={Shield} label="Politique de confidentialité" right={<ChevronRight className="w-5 h-5 text-gray-400" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2"><p className="text-xs font-semibold text-gray-500 uppercase">Préférences</p></div>
        <div className="p-4 flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg"><Globe className="w-5 h-5 text-gray-700" /></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Langue</p>
          </div>
          <select value={lang} onChange={(e) => { setLang(e.target.value); savePref({ lang: e.target.value }); }} className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="dy">Dioula</option>
            <option value="bm">Bambara</option>
          </select>
        </div>
        <Row icon={Moon} label="Thème" sub="Géré dans l'en-tête" right={<ChevronRight className="w-5 h-5 text-gray-400" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <Row icon={Wallet} label="Mes paiements" sub="Historique, reçus, virements" onClick={() => { window.location.href = '/patient/paiements'; }} right={<ChevronRight className="w-5 h-5 text-gray-400" />} />
        <Row icon={LogOut} label="Se déconnecter" onClick={logout} right={<ChevronRight className="w-5 h-5 text-gray-400" />} />
        <button onClick={deleteAccount} disabled={busy} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-left disabled:opacity-60">
          <div className="bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></div>
          <span className="font-medium text-red-700 flex-1">{busy ? 'Suppression…' : 'Supprimer mon compte'}</span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">Healthy Page v1.0 • © 2026</p>
    </div>
  );
}
