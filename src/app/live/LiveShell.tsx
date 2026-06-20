import { Outlet, NavLink, useNavigate } from 'react-router';
import { Home, Radio as RadioIcon, Tv, Calendar, Heart, Tv2 } from 'lucide-react';
import { LivePlayerProvider } from './LivePlayerContext';
import { LiveMiniPlayer, LiveFullPlayer } from './components/LivePlayer';
import { LanguagePicker } from '../components/LanguagePicker';

const TABS = [
  { to: '/live', label: 'Accueil', Icon: Home, end: true },
  { to: '/live/radio', label: 'Radio', Icon: RadioIcon },
  { to: '/live/tv', label: 'TV', Icon: Tv },
  { to: '/live/grille', label: 'Grille', Icon: Calendar },
  { to: '/live/favoris', label: 'Favoris', Icon: Heart },
];

export default function LiveShell() {
  const navigate = useNavigate();
  return (
    <LivePlayerProvider>
      <div className="min-h-screen bg-[#0B1220] text-white">
        <div className="sticky top-0 z-20 bg-[#0B1220]/95 backdrop-blur border-b border-white/10">
          <div className="px-4 h-12 flex items-center justify-between gap-2">
            <button onClick={() => navigate('/patient/home')} className="text-xs font-bold tracking-widest text-white/60 hover:text-white shrink-0">← HEALTHY PAGE</button>
            <div className="inline-flex items-center gap-1.5 text-rose-400">
              <Tv2 className="w-4 h-4" />
              <span className="font-black tracking-wide">LIVE</span>
              <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> ON AIR
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <LanguagePicker compact />
            </div>
          </div>
        </div>

        <main className="pb-32">
          <Outlet />
        </main>

        <LiveMiniPlayer />

        <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#0B1220]/95 backdrop-blur-md border-t border-white/10">
          <div className="grid grid-cols-5 max-w-xl mx-auto">
            {TABS.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition ${
                    isActive ? 'text-rose-400' : 'text-white/50 hover:text-white/80'
                  }`
                }>
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <LiveFullPlayer />
      </div>
    </LivePlayerProvider>
  );
}
