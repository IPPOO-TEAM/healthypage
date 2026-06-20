import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Home, BookOpen, FolderClosed, User, ArrowLeft, Scale } from 'lucide-react';

const TABS = [
  { id: 'accueil', path: '/assistance-juridique/accueil', label: 'Accueil', Icon: Home },
  { id: 'domaines', path: '/assistance-juridique/domaines', label: 'Domaines', Icon: BookOpen },
  { id: 'dossiers', path: '/assistance-juridique/dossiers', label: 'Mes dossiers', Icon: FolderClosed },
  { id: 'profil', path: '/assistance-juridique/profil', label: 'Profil', Icon: User },
];

export default function LegalShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = /\/assistance-juridique\/(domaine|centre)\//.test(location.pathname);

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-blue-50/30 flex flex-col">
      <header className="flex-shrink-0 px-4 py-3 bg-white/85 backdrop-blur border-b border-stone-200 flex items-center gap-3">
        {isDetail ? (
          <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate('/landing')} aria-label="Quitter" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 via-stone-700 to-blue-800 flex items-center justify-center shadow-md">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight leading-none">JUSTICE PAGE</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Tes droits, expliqués</div>
          </div>
        </div>
        <span className="ml-auto text-[11px] text-amber-800 font-semibold uppercase tracking-wide">🇧🇯 Bénin</span>
      </header>

      <main id="legal-scroll" className="flex-1 overflow-y-auto pb-[5.5rem]">
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

      {!isDetail && (
        <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-2xl mx-auto px-2 grid grid-cols-4">
            {TABS.map(({ id, path, label, Icon }) => (
              <NavLink
                key={id}
                to={path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium transition ${
                    isActive ? 'text-amber-700' : 'text-stone-500 hover:text-stone-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="legal-tab-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-amber-600"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-amber-100' : ''}`} />
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
