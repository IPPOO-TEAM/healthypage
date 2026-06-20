import { motion } from 'motion/react';
import { User, Stethoscope, Shield, ChevronRight } from 'lucide-react';
import logo from '../../imports/1.png';

export type Role = 'patient' | 'pro' | 'admin';

interface Props { onSelect: (role: Role) => void; }

const ROLES: { id: Role; label: string; desc: string; icon: any; gradient: string }[] = [
  { id: 'patient', label: 'Compte Patient', desc: 'Suivez votre santé, prenez RDV, consultez votre carnet.', icon: User, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'pro', label: 'Médecin / Praticien / Personnel de santé', desc: 'Accédez à vos patients, agenda et dossiers médicaux.', icon: Stethoscope, gradient: 'from-emerald-700 to-teal-800' },
  { id: 'admin', label: 'Administrateur', desc: 'Back-office : statistiques, comptes, centres et professionnels.', icon: Shield, gradient: 'from-slate-800 to-slate-600' }
];

export default function RoleSelectScreen({ onSelect }: Props) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <BackgroundIllustration />
      <div className="relative z-10 min-h-[100dvh] max-w-md mx-auto px-5 py-8 flex flex-col">
        <header className="flex flex-col items-center text-center pt-6">
          <motion.img
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            src={logo}
            alt="Healthy Page"
            className="w-[180px] h-[180px] drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Bienvenue sur Healthy Page</h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-xs">Choisissez le type de compte pour continuer</p>
        </header>

        <div className="flex-1 flex flex-col justify-center gap-3 py-8">
          {ROLES.filter((r) => r.id !== 'admin').map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(r.id)}
                className={`relative overflow-hidden rounded-2xl p-5 text-white text-left bg-gradient-to-br ${r.gradient} shadow-lg`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{r.label}</p>
                    <p className="text-xs text-white/85 mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-80" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <footer className="text-center text-xs text-gray-400 pt-2">
          <p>Healthy Page v1.0</p>
          <p className="mt-0.5">© 2026, Votre santé, en confiance.</p>
        </footer>
      </div>
    </div>
  );
}

function BackgroundIllustration() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hp-bg-blob1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hp-bg-blob2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hp-bg-blob3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="120" r="180" fill="url(#hp-bg-blob1)" />
      <circle cx="380" cy="320" r="220" fill="url(#hp-bg-blob2)" />
      <circle cx="80" cy="700" r="200" fill="url(#hp-bg-blob3)" />

      <g stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.18">
        <path d="M -10 460 L 60 460 L 80 430 L 110 500 L 140 410 L 170 470 L 200 460 L 410 460" />
      </g>

      <g fill="#0d9488" opacity="0.12">
        <path d="M 320 90 h 14 v 14 h 14 v 14 h -14 v 14 h -14 v -14 h -14 v -14 h 14 z" />
        <path d="M 40 560 h 10 v 10 h 10 v 10 h -10 v 10 h -10 v -10 h -10 v -10 h 10 z" />
      </g>

      <g fill="none" stroke="#0891b2" strokeWidth="2" opacity="0.22">
        <path d="M 280 640 c 0 -22 -18 -40 -40 -40 c -22 0 -40 18 -40 40 c 0 30 40 60 40 60 s 40 -30 40 -60 z" />
      </g>

      <g fill="#14b8a6" opacity="0.08">
        <circle cx="350" cy="180" r="6" />
        <circle cx="50" cy="320" r="5" />
        <circle cx="300" cy="540" r="4" />
        <circle cx="160" cy="720" r="5" />
        <circle cx="220" cy="60" r="4" />
      </g>
    </svg>
  );
}
