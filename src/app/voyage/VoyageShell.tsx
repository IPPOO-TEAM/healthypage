import { Outlet, useLocation, useNavigate, NavLink } from 'react-router';
import { Compass, Map, Heart, Gift, User, Search, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const TABS = [
  { id: 'explorer', path: '/voyage-loisirs/explorer', label: 'Explorer', Icon: Compass },
  { id: 'carte', path: '/voyage-loisirs/carte', label: 'Carte', Icon: Map },
  { id: 'favoris', path: '/voyage-loisirs/favoris', label: 'Favoris', Icon: Heart },
  { id: 'avantages', path: '/voyage-loisirs/avantages', label: 'Avantages', Icon: Gift },
  { id: 'profil', path: '/voyage-loisirs/profil', label: 'Profil', Icon: User },
] as const;

export default function VoyageShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const showFab = location.pathname.endsWith('/explorer') || location.pathname.endsWith('/carte');

  return (
    <div className="h-screen w-full flex flex-col bg-amber-50/40">
      {/* Top app bar — verre dépoli */}
      <header className="flex-shrink-0 bg-white/70 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 h-14 flex items-center justify-between z-30">
        <button
          onClick={() => navigate('/landing')}
          className="px-3 py-1.5 rounded-full hover:bg-stone-100 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-700"
        >
          <ArrowLeft className="w-4 h-4" /> HEALTHY PAGE
        </button>
        <div className="inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="font-semibold text-stone-900 text-sm tracking-tight">Voyage & Loisirs</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-rose-300 ring-2 ring-white shadow-sm" />
      </header>

      {/* Scrollable content */}
      <main id="voyage-scroll" className="flex-1 overflow-y-auto pb-24 relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Search FAB */}
      {showFab && (
        <button
          onClick={() => navigate('/voyage-loisirs/recherche')}
          aria-label="Rechercher"
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-rose-500 text-white shadow-2xl shadow-rose-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition"
        >
          <Search className="w-6 h-6" />
        </button>
      )}

      {/* Bottom tab bar */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-3 bottom-3 z-40 bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0_0_0/0.08)] pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="max-w-xl mx-auto grid grid-cols-5">
          {TABS.map(({ id, path, label, Icon }) => (
            <li key={id}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  [
                    'group flex flex-col items-center justify-center gap-1 py-2.5 transition relative',
                    isActive ? 'text-rose-600' : 'text-stone-500 hover:text-stone-800',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="voyage-tab-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-rose-500"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-[22px] h-[22px] transition ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
