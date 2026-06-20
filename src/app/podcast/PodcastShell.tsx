import { Outlet, NavLink, useNavigate } from 'react-router';
import { Home, Compass, Search, Library, User, Headphones, Sparkles } from 'lucide-react';
import { PodcastPlayerProvider, usePodcastPlayer } from './PodcastPlayerContext';
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';
import { usePodcastNotifications } from './usePodcastNotifications';
import { useT } from '../i18n';
import { LanguagePicker } from '../components/LanguagePicker';

function useTabs() {
  const { t } = useT();
  return [
    { to: '/podcast', label: t('nav.home'), Icon: Home, end: true },
    { to: '/podcast/pour-vous', label: t('nav.foryou'), Icon: Sparkles },
    { to: '/podcast/decouvrir', label: t('nav.discover'), Icon: Compass },
    { to: '/podcast/recherche', label: t('nav.search'), Icon: Search },
    { to: '/podcast/bibliotheque', label: t('nav.library'), Icon: Library },
    { to: '/podcast/profil', label: t('nav.profile'), Icon: User },
  ];
}

function NotificationPoller() {
  const { prefs } = usePodcastPlayer();
  usePodcastNotifications(prefs.lang);
  return null;
}

export default function PodcastShell() {
  const navigate = useNavigate();
  const TABS = useTabs();
  return (
    <PodcastPlayerProvider>
      <div className="min-h-screen bg-[#F7F9FF] text-[#0B1220]">
        <div className="sticky top-0 z-20 bg-white border-b border-[#E6EAF2]">
          <div className="px-4 h-12 flex items-center justify-between gap-2">
            <button onClick={() => navigate('/patient/home')} className="text-xs font-bold tracking-widest text-slate-500 hover:text-[#0B1220] shrink-0">← HEALTHY PAGE</button>
            <div className="inline-flex items-center gap-1.5 text-[#1E5BFF]">
              <Headphones className="w-4 h-4" />
              <span className="font-black tracking-wide">PODCAST</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LanguagePicker compact />
            </div>
          </div>
        </div>

        <main className="pb-32">
          <Outlet />
        </main>

        <NotificationPoller />
        <MiniPlayer />

        <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6EAF2]">
          <div className="grid grid-cols-6 max-w-xl mx-auto">
            {TABS.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition ${
                    isActive ? 'text-[#1E5BFF]' : 'text-slate-500 hover:text-slate-700'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-current/0' : ''}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <FullPlayer />
      </div>
    </PodcastPlayerProvider>
  );
}
