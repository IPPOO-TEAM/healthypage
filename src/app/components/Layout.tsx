import { ReactNode } from 'react';
import {
  Home,
  User,
  Calendar,
  FileText,
  Pill,
  Heart,
  Bookmark,
  Menu,
  Sun,
  Moon,
  Bell,
  X,
  Settings,
  Stethoscope,
  Bot,
  ShieldCheck,
  HandHeart,
  Map as MapIcon,
  Leaf,
  PhoneCall,
  Bus,
  Ambulance,
  ShoppingBasket,
  Users,
  BookOpen,
  Brain,
  CalendarHeart,
  Hotel,
  Baby,
  Globe,
  Building2,
  FlaskConical,
  Sparkles,
  Wallet,
  Trees,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoSquare from '../../imports/1.png';
import { useNavigate } from 'react-router';
import { api } from './api';
import { getPatientId } from './usePatientId';
import { SOSButton } from './SOSButton';
import { LanguagePicker } from './LanguagePicker';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export default function Layout({ children, activeTab, onTabChange, darkMode, onToggleDark }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [rdvUnread, setRdvUnread] = useState(0);

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    let cancelled = false;
    const load = () => api.listNotification(pid)
      .then((list) => {
        if (cancelled) return;
        setRdvUnread((list ?? []).filter((n: any) => !n.read && n.type === 'rdv').length);
      })
      .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'rdv', label: 'RDV', icon: Calendar },
    { id: 'examens', label: 'Examens', icon: FileText },
    { id: 'medicaments', label: 'Médic.', icon: Pill },
    { id: 'bienetre', label: 'Bien-être', icon: Heart },
    { id: 'favorites', label: 'Favoris', icon: Bookmark }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 shadow-xl sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1.5 shadow-lg ring-2 ring-white/40 flex items-center justify-center">
              <img src={logoSquare} alt="Healthy Page" className="w-9 h-9 object-contain" />
            </div>
            <div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguagePicker compact />
            <button
              onClick={() => navigate('/patient/notifications')}
              aria-label="Notifications"
              className="relative p-2 hover:bg-white/20 rounded-full transition-colors ring-1 ring-white/20"
            >
              <Bell className="w-5 h-5" />
              {rdvUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-teal-700">
                  {rdvUnread}
                </span>
              )}
            </button>
            <button
              onClick={onToggleDark}
              aria-label="Basculer le thème"
              className="p-2 hover:bg-white/20 rounded-full transition-colors ring-1 ring-white/20"
            >
              <motion.div
                key={darkMode ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ring-1 ring-white/20"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="hp-scroll-area" className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 py-4">
          {children}
        </div>
      </main>

      {/* Side Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 dark:text-slate-100 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-700 to-cyan-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-xl p-1.5 shadow ring-2 ring-white/40">
                    <img src={logoSquare} alt="Healthy Page" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight">HEALTHY PAGE</p>
                    <p className="text-xs text-teal-50">Menu</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} aria-label="Fermer" className="p-2 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                {[
                  {
                    section: 'Soins & téléconsultation',
                    items: [
                      { label: 'Carte des centres', icon: MapIcon, path: '/patient/carte' },
                      { label: 'Cellule d\'appel (triage)', icon: PhoneCall, path: '/patient/triage' },
                      { label: 'Téléconsultation', icon: Stethoscope, path: '/patient/teleconsultation' },
                      { label: 'Cars Helfy (santé mobile)', icon: Bus, path: '/patient/cars' },
                      { label: 'Mobilité sanitaire', icon: Ambulance, path: '/patient/mobilite' },
                      { label: 'Laboratoire', icon: FlaskConical, path: '/patient/laboratoire' },
                      { label: 'Pharmacie & dépôt', icon: Pill, path: '/patient/pharmacie' },
                      { label: 'Guichet hospitalier', icon: Building2, path: '/patient/guichet' },
                      { label: 'Plateau co-diagnostic', icon: Users, path: '/patient/codiag' },
                      { label: 'Semaine Santé pour Tous', icon: CalendarHeart, path: '/patient/sas' }
                    ]
                  },
                  {
                    section: 'Bien-être & traditions',
                    items: [
                      { label: 'Pharmacopée traditionnelle', icon: Leaf, path: '/patient/pharmacopee' },
                      { label: 'Box & e-paniers', icon: ShoppingBasket, path: '/patient/box' },
                      { label: 'Hôtels Bien-Être', icon: Hotel, path: '/patient/hotel' },
                      { label: 'Santé métaphysique', icon: Sparkles, path: '/patient/metaphysique' },
                      { label: 'Bibliothèque éducative', icon: BookOpen, path: '/patient/bibliotheque' },
                      { label: 'Pôle psychocorporel', icon: Brain, path: '/patient/psychocorporel' }
                    ]
                  },
                  {
                    section: 'Famille & proches',
                    items: [
                      { label: 'Carnet familial (5 membres)', icon: Users, path: '/patient/famille' },
                      { label: 'Personnes de Compagnie', icon: HandHeart, path: '/patient/compagnie' },
                      { label: 'Pédo-suivi (enfants)', icon: Baby, path: '/patient/pedo' },
                      { label: 'Diaspora (proches au pays)', icon: Globe, path: '/patient/diaspora' },
                      { label: 'Parrainage solidaire', icon: HandHeart, path: '/patient/parrainage' },
                      { label: 'Carnet femmes & jeunes filles', icon: Heart, path: '/patient/femmes' },
                      { label: 'Zones rurales & relais', icon: Trees, path: '/patient/rural' }
                    ]
                  },
                  {
                    section: 'Services & comptes',
                    items: [
                      { label: 'Assistant IA', icon: Bot, path: '/patient/assistance' },
                      { label: 'Assurances', icon: ShieldCheck, path: '/patient/assurances' },
                      { label: 'Cellule entreprise', icon: Building2, path: '/patient/entreprise' },
                      { label: 'Micro-cabine sanitaire', icon: Activity, path: '/patient/microcabine' },
                      { label: 'Fonds & cotisations', icon: Wallet, path: '/patient/fonds' },
                      { label: 'Mon profil adhérent', icon: User, path: '/patient/categorie' },
                      { label: 'Paramètres', icon: Settings, path: '/patient/parametres' }
                    ]
                  }
                ].map((group) => (
                  <div key={group.section} className="mb-2">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">{group.section}</p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => { setMenuOpen(false); navigate(item.path); }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SOSButton />

      {/* Bottom Navigation */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-2xl sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid grid-cols-7 gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  whileTap={{ scale: 0.92 }}
                  className={`relative flex flex-col items-center py-3 px-2 transition-all ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-300'
                      : 'text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40' : ''
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  </div>
                  <span className={`text-xs truncate w-full text-center mt-0.5 ${
                    isActive ? 'font-semibold' : 'font-medium'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
