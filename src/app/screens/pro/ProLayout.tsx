import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Home, Calendar, Users, MessageSquare, User, Stethoscope, ChevronDown, RefreshCw } from 'lucide-react';
import { LanguagePicker } from '../../components/LanguagePicker';
import { api } from '../../components/api';

export type ProTab = 'home' | 'agenda' | 'patients' | 'messages' | 'profil';

interface Props {
  active: ProTab;
  onChange: (t: ProTab) => void;
  children: ReactNode;
}

const TABS: { id: ProTab; label: string; icon: any }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profil', label: 'Profil', icon: User }
];

const OWNER_KEY = 'healthy-page:proOwnerId';
const ACTIVE_KEY = 'healthy-page:proId';

export default function ProLayout({ active, onChange, children }: Props) {
  const [managed, setManaged] = useState<Array<{ proId: string; name: string; specialty: string; role: string }>>([]);
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem(ACTIVE_KEY) ?? '');
  const [ownerId, setOwnerId] = useState<string>(() => localStorage.getItem(OWNER_KEY) ?? localStorage.getItem(ACTIVE_KEY) ?? '');
  const [open, setOpen] = useState(false);
  const [activeName, setActiveName] = useState<string>('');

  useEffect(() => {
    if (!ownerId && activeId) {
      localStorage.setItem(OWNER_KEY, activeId);
      setOwnerId(activeId);
    }
  }, [ownerId, activeId]);

  useEffect(() => {
    if (!ownerId) return;
    api.listManagedPros(ownerId).then((list) => setManaged(list ?? [])).catch(() => setManaged([]));
  }, [ownerId]);

  useEffect(() => {
    if (!activeId) return;
    api.getPro(activeId).then((p: any) => {
      const n = p?.name?.trim() || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'Praticien';
      setActiveName(n);
    }).catch(() => setActiveName(''));
  }, [activeId]);

  const switchTo = (proId: string) => {
    localStorage.setItem(ACTIVE_KEY, proId);
    setActiveId(proId);
    setOpen(false);
    window.location.reload();
  };

  const showSwitcher = managed.length > 0;
  const isDelegated = activeId && ownerId && activeId !== ownerId;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-3 h-12 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-blue-700 font-bold tracking-wide text-sm">
            <Stethoscope className="w-4 h-4" /> Espace pro
          </div>
          <div className="flex items-center gap-1.5">
            {showSwitcher && (
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                    isDelegated ? 'bg-fuchsia-100 text-fuchsia-800' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <span className="max-w-[120px] truncate">{activeName || 'Praticien'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {open && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white shadow-2xl rounded-xl border border-slate-200 z-40 overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 px-3 pt-2 pb-1">Mon compte</p>
                    <button
                      onClick={() => switchTo(ownerId)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${activeId === ownerId ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}
                    >
                      <span className="truncate">Moi-même</span>
                      {activeId === ownerId && <RefreshCw className="w-3 h-3" />}
                    </button>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 px-3 pt-2 pb-1 border-t border-slate-100">Praticiens gérés</p>
                    {managed.map((m) => (
                      <button
                        key={m.proId}
                        onClick={() => switchTo(m.proId)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-fuchsia-50 ${activeId === m.proId ? 'bg-fuchsia-50 text-fuchsia-800 font-semibold' : 'text-slate-700'}`}
                      >
                        <div className="truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.specialty} · {m.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <LanguagePicker compact />
          </div>
        </div>
        {isDelegated && (
          <div className="bg-fuchsia-100 text-fuchsia-900 text-[11px] text-center py-1 px-2">
            Délégation active : vous gérez l'agenda de <strong>{activeName}</strong>
          </div>
        )}
      </header>
      {children}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-gray-500 hover:text-blue-700'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="pro-tab-indicator"
                    className="absolute top-0 inset-x-6 h-0.5 bg-blue-700 rounded-full"
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
