import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Gamepad2, Trophy, User, ArrowLeft, Sparkles, Star } from 'lucide-react';

const TABS = [
  { id: 'accueil', path: '/jeux-bien-etre/accueil', label: 'Accueil', Icon: Home },
  { id: 'catalogue', path: '/jeux-bien-etre/catalogue', label: 'Catalogue', Icon: Gamepad2 },
  { id: 'recompenses', path: '/jeux-bien-etre/recompenses', label: 'Récompenses', Icon: Trophy },
  { id: 'profil', path: '/jeux-bien-etre/profil', label: 'Profil', Icon: User },
];

export default function HappyShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isGameDetail = /\/jeux-bien-etre\/jeu\//.test(location.pathname);

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/30 flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 px-4 py-3 bg-white/85 backdrop-blur border-b border-stone-200 flex items-center gap-3">
        {isGameDetail ? (
          <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate('/landing')} aria-label="Quitter" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight leading-none">HAPPY PAGE</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Détente & évasion</div>
          </div>
        </div>
        <span className="ml-auto text-[11px] text-amber-800 font-semibold uppercase tracking-wide inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> HappyStars</span>
      </header>

      {/* Main */}
      <main id="happy-scroll" className="flex-1 overflow-y-auto pb-[5.5rem]">
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

      {/* Bottom tab bar */}
      {!isGameDetail && (
        <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-2xl mx-auto px-2 grid grid-cols-4">
            {TABS.map(({ id, path, label, Icon }) => (
              <NavLink
                key={id}
                to={path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium transition ${
                    isActive ? 'text-rose-600' : 'text-stone-500 hover:text-stone-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="happy-tab-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-rose-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-rose-100' : ''}`} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
