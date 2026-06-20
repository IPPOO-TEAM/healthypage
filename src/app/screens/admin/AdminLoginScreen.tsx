import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { startAdminSession } from '../../components/adminSession';

interface Props { onLogin: () => void; onBack: () => void; }

const ADMIN_EMAIL = 'admin@healthypage.com';
const ADMIN_PASSWORD = 'admin2026';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function AdminLoginScreen({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    try { return Number(window.localStorage.getItem('healthy-page:admin-attempts') ?? '0'); } catch { return 0; }
  });
  const [lockedUntil, setLockedUntil] = useState<number>(() => {
    try { return Number(window.localStorage.getItem('healthy-page:admin-lockout') ?? '0'); } catch { return 0; }
  });

  const isLocked = lockedUntil > Date.now();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      const wait = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Trop de tentatives. Réessayez dans ${wait}s.`);
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          window.localStorage.removeItem('healthy-page:admin-attempts');
          window.localStorage.removeItem('healthy-page:admin-lockout');
        } catch {}
        startAdminSession(ADMIN_EMAIL);
        onLogin();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        try { window.localStorage.setItem('healthy-page:admin-attempts', String(next)); } catch {}
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS;
          setLockedUntil(until);
          try { window.localStorage.setItem('healthy-page:admin-lockout', String(until)); } catch {}
          setError(`Compte verrouillé pendant 1 minute (${MAX_ATTEMPTS} tentatives échouées).`);
        } else {
          setError(`Identifiants invalides. ${MAX_ATTEMPTS - next} tentative(s) restante(s).`);
        }
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="mt-5 text-2xl tracking-tight font-bold">Back-office HEALTHY PAGE</h1>
            <p className="mt-1 text-sm text-white/80">Accès réservé à l'administration.</p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-5">
            <div>
              <label className="text-xs text-slate-500 tracking-[0.15em] uppercase">Email</label>
              <div className="mt-2 relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthypage.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 tracking-[0.15em] uppercase">Mot de passe</label>
              <div className="mt-2 relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                  aria-label={show ? 'Masquer' : 'Afficher'}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? 'Connexion…' : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Retour à l'accueil
            </button>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400 text-center">
                Démo : <span className="font-mono text-slate-600">admin@healthypage.com</span> / <span className="font-mono text-slate-600">admin2026</span>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
