import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Mail, Phone, Fingerprint, QrCode, Lock, ArrowLeft, CheckCircle2, Loader2, ChevronDown, Search, KeyRound } from 'lucide-react';
import {
  PatientAccount,
  listAccounts,
  saveAccounts,
  findAccountByLogin,
  authenticate,
  setCurrentAccount,
  getCurrentAccount,
  logoutAccount,
  touchSession,
  isSessionExpired,
} from '../components/accounts';
import { assertAllowed, recordFailure, recordAttempt, clearBucket } from '../components/rateLimit';
import { validateLoginIdentifier, validatePassword, validateName, validateDob, validatePhoneE164 } from '../components/validators';
import { COUNTRIES, Country } from './countries';
import { QRCode } from './QRCode';
import logoBrand from '../../imports/1.png';

// ---------------- Types ----------------
type AuthMethod = 'email' | 'google' | 'phone' | 'biometric' | 'qr';

type OpenOptions = {
  /** Where the auth was triggered from — purely informational. */
  from?: string;
  /** Default tab to display. */
  method?: AuthMethod;
  /** Called once authentication completes. */
  onSuccess?: (account: PatientAccount) => void;
};

type Ctx = {
  user: PatientAccount | null;
  isAuthenticated: boolean;
  open: (opts?: OpenOptions) => void;
  close: () => void;
  signOut: () => void;
};

const UniversalAuthContext = createContext<Ctx | null>(null);

// ---------------- Helpers (universal sign-in providers) ----------------
const ls = {
  get: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { window.localStorage.removeItem(k); } catch {} },
};

function uniqId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Insère un compte minimal ou réutilise l'existant (login = email ou téléphone). */
function upsertMinimalAccount(login: string, fields: Partial<PatientAccount>): PatientAccount {
  const existing = findAccountByLogin(login);
  if (existing) return existing;
  const list = listAccounts();
  const acc: PatientAccount = {
    id: uniqId('acc'),
    email: fields.email ?? '',
    phone: fields.phone ?? '',
    firstName: fields.firstName ?? '',
    lastName: fields.lastName ?? '',
    passwordHash: '',
    createdAt: Date.now(),
    ...fields,
  } as PatientAccount;
  list.push(acc);
  saveAccounts(list);
  return acc;
}

/** Connexion Google simulée — en production remplacer par GIS / OAuth Google réel. */
async function signInWithGoogleMock(): Promise<PatientAccount> {
  // Simule un délai réseau + retour profil Google.
  await new Promise((r) => setTimeout(r, 700));
  const seed = Math.random().toString(36).slice(2, 8);
  const email = `user.${seed}@gmail.com`;
  return upsertMinimalAccount(email, {
    email,
    firstName: 'Utilisateur',
    lastName: 'Google',
    phone: '',
  });
}

/** Génère et "envoie" un code OTP. Stocké en mémoire le temps de la session. */
const otpStore = new Map<string, { code: string; expires: number }>();
function sendOtp(phoneE164: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phoneE164, { code, expires: Date.now() + 5 * 60_000 });
  return code; // En production : appel SMS provider, pas de retour.
}
function verifyOtp(phoneE164: string, code: string): boolean {
  const entry = otpStore.get(phoneE164);
  if (!entry) return false;
  if (entry.expires < Date.now()) { otpStore.delete(phoneE164); return false; }
  if (entry.code !== code) return false;
  otpStore.delete(phoneE164);
  return true;
}

// ---------------- Biométrie : WebAuthn + fallback démo ----------------
// La preview Figma Make tourne en iframe HTTPS, où WebAuthn est souvent bloqué
// par la politique du navigateur. On essaie l'API native, et à défaut on
// enregistre un "verrou biométrique" local couplé au compte (démo crédible).
const BIO_KEY = 'healthy-page:biometric-credential';

function webauthnAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).PublicKeyCredential && window.isSecureContext;
}

function isLikelyIframeBlocked(): boolean {
  try { return typeof window !== 'undefined' && window.self !== window.top; } catch { return true; }
}

async function tryWebAuthnRegister(account: PatientAccount): Promise<string | null> {
  if (!webauthnAvailable()) return null;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = new TextEncoder().encode(account.id);
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Healthy Page' },
        user: {
          id: userId,
          name: account.email || account.phone || account.id,
          displayName: `${account.firstName} ${account.lastName}`.trim() || 'Patient',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { userVerification: 'preferred', residentKey: 'preferred' },
        timeout: 60_000,
        attestation: 'none',
      },
    } as any);
    if (!cred) return null;
    return btoa(String.fromCharCode(...new Uint8Array((cred as PublicKeyCredential).rawId)));
  } catch {
    return null;
  }
}

async function tryWebAuthnAssert(credId: string): Promise<boolean> {
  if (!webauthnAvailable()) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credIdBytes = Uint8Array.from(atob(credId), (c) => c.charCodeAt(0));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: 'public-key', id: credIdBytes }],
        timeout: 60_000,
        userVerification: 'preferred',
      },
    } as any);
    return !!assertion;
  } catch {
    return false;
  }
}

async function registerBiometric(account: PatientAccount): Promise<boolean> {
  const credId = await tryWebAuthnRegister(account);
  if (credId) {
    ls.set(BIO_KEY, JSON.stringify({ accountId: account.id, credId, mode: 'webauthn' }));
    return true;
  }
  // Fallback démo : verrou local lié au compte. Idéal pour la preview iframe.
  ls.set(BIO_KEY, JSON.stringify({ accountId: account.id, mode: 'demo' }));
  return true;
}

async function authenticateBiometric(): Promise<PatientAccount | null> {
  const raw = ls.get(BIO_KEY);
  if (!raw) return null;
  try {
    const { accountId, credId, mode } = JSON.parse(raw);
    if (mode === 'webauthn' && credId) {
      const ok = await tryWebAuthnAssert(credId);
      if (!ok) return null;
    } else {
      // Démo : confirmation utilisateur (équivalent UX à un prompt biométrique).
      const ok = window.confirm('Confirmer votre identité biométriquement ?');
      if (!ok) return null;
    }
    return listAccounts().find((a) => a.id === accountId) ?? null;
  } catch {
    return null;
  }
}

function biometricBoundAccountId(): string | null {
  try { return JSON.parse(ls.get(BIO_KEY) ?? 'null')?.accountId ?? null; } catch { return null; }
}

// ---------------- QR pairing (cross-device) ----------------
const QR_KEY = 'healthy-page:qr-pair';
type QrPair = { token: string; createdAt: number; accountId?: string };
function createQrToken(): string {
  const token = uniqId('qr');
  const pair: QrPair = { token, createdAt: Date.now() };
  ls.set(`${QR_KEY}:${token}`, JSON.stringify(pair));
  return token;
}
function consumeQrToken(token: string): PatientAccount | null {
  const raw = ls.get(`${QR_KEY}:${token}`);
  if (!raw) return null;
  const pair = JSON.parse(raw) as QrPair;
  if (Date.now() - pair.createdAt > 5 * 60_000) { ls.del(`${QR_KEY}:${token}`); return null; }
  if (!pair.accountId) return null;
  ls.del(`${QR_KEY}:${token}`);
  return listAccounts().find((a) => a.id === pair.accountId) ?? null;
}
/** Marque un token QR comme validé par un autre appareil déjà connecté. */
export function approveQrToken(token: string, accountId: string): boolean {
  const raw = ls.get(`${QR_KEY}:${token}`);
  if (!raw) return false;
  const pair = JSON.parse(raw) as QrPair;
  pair.accountId = accountId;
  ls.set(`${QR_KEY}:${token}`, JSON.stringify(pair));
  return true;
}

// ---------------- Provider ----------------
export function UniversalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PatientAccount | null>(() => getCurrentAccount());

  useEffect(() => {
    const refresh = () => setUser(getCurrentAccount());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Session expiration: rafraîchit l'activité sur interaction et déconnecte
  // automatiquement après inactivité (30 min) ou délai absolu (7 jours).
  useEffect(() => {
    if (!user) return;
    let throttle = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - throttle < 30_000) return;
      throttle = now;
      touchSession();
    };
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'scroll', 'focus'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const check = () => {
      if (isSessionExpired()) {
        logoutAccount();
        setUser(null);
      }
    };
    const interval = window.setInterval(check, 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('qr');
      if (!token) return;
      const cur = getCurrentAccount();
      if (cur) {
        approveQrToken(token, cur.id);
        url.searchParams.delete('qr');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, [user]);

  // L'auth est désormais une vraie page (/auth) — plus d'overlay.
  const open = useCallback((o?: OpenOptions) => {
    const params = new URLSearchParams();
    if (o?.from) params.set('from', o.from);
    if (o?.method) params.set('method', o.method);
    const qs = params.toString();
    window.location.href = `/auth${qs ? `?${qs}` : ''}`;
  }, []);
  const close = useCallback(() => { /* no-op : page route */ }, []);

  const signOut = useCallback(() => {
    logoutAccount();
    setUser(null);
  }, []);

  const ctx = useMemo<Ctx>(() => ({
    user,
    isAuthenticated: !!user,
    open,
    close,
    signOut,
  }), [user, open, close, signOut]);

  return (
    <UniversalAuthContext.Provider value={ctx}>
      {children}
    </UniversalAuthContext.Provider>
  );
}

// Hook réutilisable par la page /auth pour finaliser la session.
// Crée (ou récupère) le patient backend avant de pointer `patientId` dessus,
// pour éviter un 404 sur les API patient au premier chargement.
export async function completeAuthSession(acc: PatientAccount) {
  setCurrentAccount(acc.id);
  try {
    const { ensureBackendPatient } = await import('../components/accounts');
    await ensureBackendPatient(acc.id);
  } catch (e) {
    console.warn('completeAuthSession: ensureBackendPatient failed', e);
  }
}

export function useUniversalAuth(): Ctx {
  const ctx = useContext(UniversalAuthContext);
  if (!ctx) {
    return {
      user: null, isAuthenticated: false,
      open: () => console.warn('UniversalAuthProvider missing'),
      close: () => {}, signOut: () => {},
    };
  }
  return ctx;
}

// ---------------- Page (route /auth) ----------------
export function UniversalAuthScreen({
  initialMethod = 'email', from, onSuccess, onBack,
}: {
  initialMethod?: AuthMethod;
  from?: string;
  onSuccess: (acc: PatientAccount) => void;
  onBack?: () => void;
}) {
  const [method, setMethod] = useState<AuthMethod>(initialMethod);
  const [error, setError] = useState<string | null>(null);
  const [pendingAccount, setPendingAccount] = useState<PatientAccount | null>(null);
  const [bioBusy, setBioBusy] = useState(false);

  const tabs: { id: AuthMethod; label: string; Icon: typeof Mail }[] = [
    { id: 'email', label: 'Email', Icon: Mail },
    { id: 'google', label: 'Google', Icon: KeyRound },
    { id: 'phone', label: 'Téléphone', Icon: Phone },
    { id: 'biometric', label: 'Biométrie', Icon: Fingerprint },
    { id: 'qr', label: 'QR', Icon: QrCode },
  ];

  // Après une auth réussie via Email/Google/Téléphone/QR : on propose la biométrie
  // (sauf si l'utilisateur s'est déjà authentifié via biométrie ou si le compte est
  // déjà lié biométriquement à cet appareil).
  const handlePanelSuccess = (acc: PatientAccount, viaBiometric = false) => {
    const alreadyBound = biometricBoundAccountId() === acc.id;
    if (viaBiometric || alreadyBound) {
      onSuccess(acc);
      return;
    }
    setPendingAccount(acc);
  };

  const enableBiometricNow = async () => {
    if (!pendingAccount) return;
    setBioBusy(true);
    try {
      await registerBiometric(pendingAccount);
    } finally {
      setBioBusy(false);
      onSuccess(pendingAccount);
    }
  };
  const skipBiometric = () => { if (pendingAccount) onSuccess(pendingAccount); };

  if (pendingAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/50 flex flex-col">
        <header className="px-4 h-14 flex items-center justify-between max-w-3xl w-full mx-auto">
          <span />
          <img src={logoBrand} alt="Healthy Page" className="w-10 h-10 object-contain" />
        </header>
        <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 via-fuchsia-50 to-amber-50 flex items-center justify-center mb-4">
                <Fingerprint className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Activer la biométrie ?</h2>
              <p className="text-sm text-slate-600 mt-2">
                Bienvenue {pendingAccount.firstName || pendingAccount.email || pendingAccount.phone}. Voulez-vous vous reconnecter d'un simple regard ou empreinte (Face ID, Touch ID, Windows Hello) la prochaine fois ?
              </p>
              <p className="text-[11px] text-slate-400 mt-3">
                Vous pouvez modifier cette préférence depuis vos paramètres à tout moment.
              </p>

              <div className="mt-6 space-y-2">
                <button
                  disabled={bioBusy}
                  onClick={enableBiometricNow}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {bioBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  Autoriser la biométrie
                </button>
                <button
                  onClick={skipBiometric}
                  className="w-full h-10 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/50 flex flex-col">
      <header className="px-4 h-14 flex items-center justify-between max-w-3xl w-full mx-auto">
        {onBack ? (
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        ) : <span />}
        <img src={logoBrand} alt="Healthy Page" className="w-10 h-10 object-contain" />
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Connexion / Inscription</h1>
            <p className="text-sm text-slate-500 mt-1">
              {from ? `Depuis ${from} · ` : ''}Un compte unique pour toute la plateforme.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-4 pt-4">
              <div className="flex gap-1 overflow-x-auto pb-3 -mx-1 px-1">
                {tabs.map(({ id, label, Icon }) => {
                  const active = method === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setError(null); setMethod(id); }}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition ${
                        active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 pb-6 pt-2">
              {error && (
                <div role="alert" aria-live="assertive" className="mb-3 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold">{error}</div>
              )}
              {method === 'email' && <EmailPanel onError={setError} onSuccess={(a) => handlePanelSuccess(a)} />}
              {method === 'google' && <GooglePanel onError={setError} onSuccess={(a) => handlePanelSuccess(a)} />}
              {method === 'phone' && <PhonePanel onError={setError} onSuccess={(a) => handlePanelSuccess(a)} />}
              {method === 'biometric' && <BiometricPanel onError={setError} onSuccess={(a) => handlePanelSuccess(a, true)} />}
              {method === 'qr' && <QrPanel onError={setError} onSuccess={(a) => handlePanelSuccess(a)} />}
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            En continuant, vous acceptez les conditions d'utilisation et la politique de confidentialité.
          </p>
        </div>
      </main>
    </div>
  );
}

// ---------------- Panels ----------------
function ModeSwitch({ mode, setMode }: { mode: 'login' | 'signup'; setMode: (m: 'login' | 'signup') => void }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-full text-xs font-bold">
      <button onClick={() => setMode('login')} className={`flex-1 py-1.5 rounded-full ${mode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Connexion</button>
      <button onClick={() => setMode('signup')} className={`flex-1 py-1.5 rounded-full ${mode === 'signup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Inscription</button>
    </div>
  );
}

function EmailPanel({ onError, onSuccess }: { onError: (m: string | null) => void; onSuccess: (a: PatientAccount) => void }) {
  const [view, setView] = useState<'auth' | 'forgot'>('auth');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotStep, setForgotStep] = useState<'ask' | 'verify'>('ask');
  const [forgotCode, setForgotCode] = useState<string | null>(null);
  const [forgotInput, setForgotInput] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [forgotInfo, setForgotInfo] = useState<string | null>(null);

  const requestReset = async () => {
    onError(null); setForgotInfo(null);
    const id = identifier.trim();
    if (!id) { onError('Saisissez votre email ou téléphone.'); return; }
    try { assertAllowed('otpSend', id); } catch (e: any) { onError(e.message); return; }
    const acc = findAccountByLogin(id);
    if (!acc) { onError("Aucun compte trouvé pour cet identifiant."); return; }
    recordAttempt('otpSend', id);
    const code = sendOtp(id.toLowerCase());
    setForgotCode(code);
    setForgotStep('verify');
    setForgotInfo(`Démo Figma Make : votre code de réinitialisation est ${code}. En production, il arrive par email/SMS.`);
  };

  const confirmReset = async () => {
    onError(null);
    const id = identifier.trim();
    try { assertAllowed('passwordReset', id); } catch (e: any) { onError(e.message); return; }
    if (!verifyOtp(id.toLowerCase(), forgotInput.trim())) {
      const left = recordFailure('passwordReset', id);
      onError(left > 0 ? `Code invalide ou expiré. ${left} tentative(s) restante(s).` : 'Code invalide. Réessayez plus tard.');
      return;
    }
    clearBucket('passwordReset', id);
    clearBucket('login', id);
    const pwdCheck = validatePassword(newPwd);
    if (!pwdCheck.ok) { onError(pwdCheck.error); return; }
    setBusy(true);
    try {
      const { resetPassword } = await import('../components/accounts');
      const acc = resetPassword(id, newPwd);
      if (!acc) { onError('Réinitialisation impossible.'); return; }
      // Reset state, retour en mode login pré-rempli
      setForgotStep('ask'); setForgotCode(null); setForgotInput(''); setNewPwd('');
      setPwd(''); setForgotInfo(null);
      setView('auth'); setMode('login');
      onError(null);
      // Petit feedback temporaire
      setForgotInfo('Mot de passe mis à jour. Vous pouvez vous connecter.');
      setTimeout(() => setForgotInfo(null), 3500);
    } finally { setBusy(false); }
  };

  const submit = async () => {
    onError(null);
    const id = identifier.trim();
    if (!id || !pwd) { onError('Identifiant et mot de passe requis.'); return; }
    const idCheck = validateLoginIdentifier(id);
    if (!idCheck.ok) { onError(idCheck.error); return; }
    setBusy(true);
    try {
      if (mode === 'login') {
        try { assertAllowed('login', id); } catch (e: any) { onError(e.message); return; }
        const found = findAccountByLogin(id);
        if (!found) { onError("Aucun compte trouvé pour cet identifiant. Vérifiez l'orthographe ou créez votre compte."); return; }
        const acc = authenticate(id, pwd);
        if (!acc) {
          const left = recordFailure('login', id);
          onError(left > 0 ? `Mot de passe incorrect. ${left} tentative(s) restante(s).` : 'Mot de passe incorrect. Compte temporairement verrouillé.');
          return;
        }
        clearBucket('login', id);
        onSuccess(acc);
        return;
      }
      const firstCheck = validateName(first, 'Prénom');
      if (!firstCheck.ok) { onError(firstCheck.error); return; }
      const lastCheck = validateName(last, 'Nom');
      if (!lastCheck.ok) { onError(lastCheck.error); return; }
      const dobCheck = validateDob(dob);
      if (!dobCheck.ok) { onError(dobCheck.error); return; }
      const pwdCheck = validatePassword(pwd);
      if (!pwdCheck.ok) { onError(pwdCheck.error); return; }
      const looksLikeEmail = id.includes('@');
      if (findAccountByLogin(id)) { onError(`Un compte existe déjà avec ${looksLikeEmail ? 'cet email' : 'ce numéro'}.`); return; }
      const { createAccount } = await import('../components/accounts');
      const acc = createAccount({
        email: looksLikeEmail ? id.toLowerCase() : '',
        phone: looksLikeEmail ? '' : id,
        firstName: first.trim(), lastName: last.trim(), dob,
        password: pwd,
      });
      onSuccess(acc);
    } finally { setBusy(false); }
  };

  if (view === 'forgot') {
    return (
      <div className="space-y-3">
        <button onClick={() => { setView('auth'); setForgotStep('ask'); setForgotCode(null); setForgotInput(''); setNewPwd(''); setForgotInfo(null); onError(null); }}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
        </button>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 ring-1 ring-emerald-100 px-4 py-3">
          <div className="font-bold text-emerald-900 text-sm">Mot de passe oublié</div>
          <div className="text-[12px] text-emerald-900/80 mt-0.5">
            Recevez un code à usage unique par email/SMS pour définir un nouveau mot de passe.
          </div>
        </div>

        {forgotStep === 'ask' && (
          <>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-emerald-600" />
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email ou téléphone du compte"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
            </div>
            <button onClick={requestReset}
              className="w-full h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-sm hover:brightness-105">
              Envoyer le code
            </button>
          </>
        )}

        {forgotStep === 'verify' && (
          <>
            {forgotInfo && <div className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-[11px]">{forgotInfo}</div>}
            <input value={forgotInput} onChange={(e) => setForgotInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" placeholder="Code à 6 chiffres" autoFocus
              className="w-full h-12 px-3 rounded-xl bg-slate-100 outline-none text-center text-xl tracking-[0.4em] font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-emerald-600" />
              <input value={newPwd} onChange={(e) => setNewPwd(e.target.value)} type="password"
                placeholder="Nouveau mot de passe"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
            </div>
            <button disabled={busy || forgotInput.length !== 6} onClick={confirmReset}
              className="w-full h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-sm disabled:opacity-60 inline-flex items-center justify-center gap-2 hover:brightness-105">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Définir le nouveau mot de passe
            </button>
            <button onClick={() => { setForgotStep('ask'); setForgotCode(null); setForgotInput(''); setForgotInfo(null); }}
              className="w-full h-9 rounded-xl text-xs text-slate-600 hover:bg-slate-50">
              Renvoyer un code
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ModeSwitch mode={mode} setMode={setMode} />

      {forgotInfo && (
        <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-[12px] inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {forgotInfo}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 ring-1 ring-emerald-100 px-4 py-3 flex items-center gap-3">
        <svg viewBox="0 0 96 96" className="w-16 h-16 shrink-0" aria-hidden="true">
          <circle cx="48" cy="48" r="44" fill="#d1fae5" />
          <path d="M22 56c8-12 18-12 26 0s18 12 26 0" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="48" cy="36" r="10" fill="#10b981" />
          <path d="M44 36l3 3 6-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="text-[12px] leading-snug text-emerald-900">
          <div className="font-bold">{mode === 'login' ? 'Bon retour 👋' : 'Bienvenue !'}</div>
          <div className="opacity-80">{mode === 'login' ? 'Connectez-vous avec votre email ou téléphone.' : 'Créez votre compte santé en moins d\'une minute.'}</div>
        </div>
      </div>

      {mode === 'signup' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Prénom" className="h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Nom" className="h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
          </div>
          <label className="block">
            <span className="text-[11px] text-slate-500 ml-1">Date de naissance</span>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
          </label>
        </>
      )}
      <div className="relative">
        <Mail className="w-4 h-4 absolute left-3 top-3.5 text-emerald-600" />
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          type="text"
          autoComplete="username"
          placeholder="Email ou téléphone (+229…)"
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
      </div>
      <div className="relative">
        <Lock className="w-4 h-4 absolute left-3 top-3.5 text-emerald-600" />
        <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Mot de passe"
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" />
      </div>
      <button disabled={busy} onClick={submit}
        className="w-full h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-sm hover:shadow-md hover:brightness-105 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
      </button>
      {mode === 'login' && (
        <button
          type="button"
          onClick={() => { onError(null); setForgotInfo(null); setView('forgot'); }}
          className="w-full text-xs text-emerald-700 hover:text-emerald-900 font-bold pt-1"
        >
          Mot de passe oublié ?
        </button>
      )}
    </div>
  );
}

function GooglePanel({ onError, onSuccess }: { onError: (m: string | null) => void; onSuccess: (a: PatientAccount) => void }) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    onError(null); setBusy(true);
    try {
      const acc = await signInWithGoogleMock();
      onSuccess(acc);
    } catch (e: any) { onError(e?.message ?? 'Erreur Google'); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">Connexion via votre compte Google. Démo Figma Make — en production, OAuth Google Identity Services.</p>
      <button disabled={busy} onClick={go}
        className="w-full h-11 rounded-xl bg-white ring-1 ring-slate-300 hover:bg-slate-50 font-bold inline-flex items-center justify-center gap-2 text-slate-800">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <span aria-hidden="true" className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400" />
        )}
        Continuer avec Google
      </button>
    </div>
  );
}

function PhonePanel({ onError, onSuccess }: { onError: (m: string | null) => void; onSuccess: (a: PatientAccount) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [country, setCountry] = useState<Country>(() => COUNTRIES[0]);
  const [number, setNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile' | 'login-pwd'>('phone');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState('');
  // Champs profil pour l'inscription téléphone
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState('');
  const [pwd, setPwd] = useState('');

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(f) || c.dial.includes(f));
  }, [filter]);

  const e164 = `${country.dial}${number.replace(/\D/g, '')}`;

  const sendCode = () => {
    onError(null);
    if (number.replace(/\D/g, '').length < 5) { onError('Numéro invalide.'); return; }
    if (mode === 'login') {
      const existing = findAccountByLogin(e164);
      if (!existing) { onError('Aucun compte trouvé pour ce numéro. Inscrivez-vous d\'abord.'); return; }
      setStep('login-pwd');
      return;
    }
    try { assertAllowed('otpSend', e164); } catch (e: any) { onError(e.message); return; }
    recordAttempt('otpSend', e164);
    const code = sendOtp(e164);
    setSent(code);
    setStep('otp');
  };

  const verify = async () => {
    onError(null); setBusy(true);
    try {
      try { assertAllowed('otpVerify', e164); } catch (e: any) { onError(e.message); return; }
      if (!verifyOtp(e164, otp)) {
        const left = recordFailure('otpVerify', e164);
        onError(left > 0 ? `Code OTP invalide. ${left} tentative(s) restante(s).` : 'Code OTP invalide. Réessayez plus tard.');
        return;
      }
      clearBucket('otpVerify', e164);
      const existing = findAccountByLogin(e164);
      if (existing) { onSuccess(existing); return; }
      // Nouveau numéro → on demande le profil + mot de passe.
      setStep('profile');
    } finally { setBusy(false); }
  };

  const finalizeSignup = async () => {
    onError(null);
    const phoneCheck = validatePhoneE164(e164);
    if (!phoneCheck.ok) { onError(phoneCheck.error); return; }
    const firstCheck = validateName(first, 'Prénom');
    if (!firstCheck.ok) { onError(firstCheck.error); return; }
    const lastCheck = validateName(last, 'Nom');
    if (!lastCheck.ok) { onError(lastCheck.error); return; }
    const dobCheck = validateDob(dob);
    if (!dobCheck.ok) { onError(dobCheck.error); return; }
    const pwdCheck = validatePassword(pwd);
    if (!pwdCheck.ok) { onError(pwdCheck.error); return; }
    setBusy(true);
    try {
      const { createAccount } = await import('../components/accounts');
      const acc = createAccount({
        email: '', phone: e164, country: country.name,
        firstName: first.trim(), lastName: last.trim(), dob,
        password: pwd,
      });
      onSuccess(acc);
    } catch (e: any) {
      onError(e?.message ?? 'Création impossible.');
    } finally { setBusy(false); }
  };

  const loginWithPwd = () => {
    onError(null);
    try { assertAllowed('login', e164); } catch (e: any) { onError(e.message); return; }
    const acc = authenticate(e164, pwd);
    if (!acc) {
      const left = recordFailure('login', e164);
      onError(left > 0 ? `Mot de passe incorrect. ${left} tentative(s) restante(s).` : 'Mot de passe incorrect. Compte temporairement verrouillé.');
      return;
    }
    clearBucket('login', e164);
    onSuccess(acc);
  };

  return (
    <div className="space-y-3">
      {step === 'phone' && (
        <>
          <ModeSwitch mode={mode} setMode={(m) => { setMode(m); }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setPickerOpen((v) => !v)}
              className="h-11 px-3 rounded-xl bg-slate-100 inline-flex items-center gap-1.5 text-sm font-bold">
              <span>{country.flag}</span>
              <span>{country.dial}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <input value={number} onChange={(e) => setNumber(e.target.value)} inputMode="tel" placeholder="Numéro"
              className="flex-1 h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm" />
          </div>
          {pickerOpen && (
            <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Rechercher un pays"
                  className="w-full h-9 pl-8 pr-3 text-sm bg-slate-50 outline-none" />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filtered.map((c) => (
                  <button key={c.iso2} onClick={() => { setCountry(c); setPickerOpen(false); setFilter(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${c.iso2 === country.iso2 ? 'bg-emerald-50' : ''}`}>
                    <span>{c.flag}</span>
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.dial}</span>
                  </button>
                ))}
                {filtered.length === 0 && <div className="px-3 py-4 text-xs text-slate-500">Aucun pays</div>}
              </div>
            </div>
          )}
          <button onClick={sendCode}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold">
            {mode === 'login' ? 'Continuer' : 'Envoyer le code par SMS'}
          </button>
          <p className="text-[11px] text-slate-500">Disponible dans tous les pays via votre indicatif international.</p>
        </>
      )}

      {step === 'login-pwd' && (
        <>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <button onClick={() => setStep('phone')} className="text-emerald-600 inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> changer</button>
            <span>Connexion au compte <strong>{e164}</strong></span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" placeholder="Mot de passe" autoFocus
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm" />
          </div>
          <button onClick={loginWithPwd}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold">
            Se connecter
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Mot de passe oublié ? Utilisez « Email → Mot de passe oublié » avec ce numéro.
          </p>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <button onClick={() => setStep('phone')} className="text-emerald-600 inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> changer</button>
            <span>Code envoyé au <strong>{e164}</strong></span>
          </div>
          {sent && (
            <div className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-[11px]">
              Démo Figma Make : votre code est <strong>{sent}</strong>. En production, il arrive uniquement par SMS.
            </div>
          )}
          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" placeholder="123456" autoFocus
            className="w-full h-12 px-3 rounded-xl bg-slate-100 outline-none text-center text-xl tracking-[0.4em] font-bold" />
          <button disabled={busy || otp.length !== 6} onClick={verify}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Valider le code
          </button>
        </>
      )}

      {step === 'profile' && (
        <>
          <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Numéro vérifié — complétez votre profil.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Prénom" className="h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm" />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Nom" className="h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm" />
          </div>
          <label className="block">
            <span className="text-[11px] text-slate-500 ml-1">Date de naissance</span>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl bg-slate-100 outline-none text-sm" />
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" placeholder="Mot de passe"
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm" />
          </div>
          <button disabled={busy} onClick={finalizeSignup}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Créer mon compte
          </button>
        </>
      )}
    </div>
  );
}

function BiometricPanel({ onError, onSuccess }: { onError: (m: string | null) => void; onSuccess: (a: PatientAccount) => void }) {
  const has = !!ls.get(BIO_KEY);
  const boundId = biometricBoundAccountId();
  const boundAcc = boundId ? listAccounts().find((a) => a.id === boundId) ?? null : null;
  const current = getCurrentAccount();
  const native = webauthnAvailable() && !isLikelyIframeBlocked();
  const [busy, setBusy] = useState(false);
  const [identifier, setIdentifier] = useState('');

  const enroll = async () => {
    onError(null);
    let target = current;
    if (!target) {
      const id = identifier.trim();
      if (!id) { onError('Renseignez votre email ou téléphone pour lier la biométrie à votre compte.'); return; }
      target = findAccountByLogin(id);
      if (!target) { onError('Aucun compte trouvé avec cet identifiant. Inscrivez-vous via Email, Google ou Téléphone d\'abord.'); return; }
    }
    setBusy(true);
    try {
      const ok = await registerBiometric(target);
      if (!ok) onError('Activation biométrique refusée.');
    } finally { setBusy(false); }
  };

  const useBio = async () => {
    onError(null); setBusy(true);
    try {
      const acc = await authenticateBiometric();
      if (!acc) { onError('Authentification biométrique annulée.'); return; }
      onSuccess(acc);
    } finally { setBusy(false); }
  };

  const reset = () => { ls.del(BIO_KEY); onError('Biométrie réinitialisée.'); };

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 py-5 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-amber-50 rounded-2xl">
        <Fingerprint className="w-12 h-12 text-emerald-600" />
        <p className="text-xs text-slate-600 text-center px-4">
          Face ID, Touch ID, Windows Hello…{' '}
          {has
            ? `Authentification liée à ${boundAcc?.email || boundAcc?.phone || 'votre compte'}.`
            : 'Activez la biométrie pour vous reconnecter en un geste.'}
        </p>
        {!native && (
          <p className="text-[10px] text-slate-500 px-4 text-center">
            Mode démo activé : la confirmation se fait via un prompt navigateur (les API natives WebAuthn sont restreintes en preview iframe).
          </p>
        )}
      </div>

      {has ? (
        <>
          <button disabled={busy} onClick={useBio}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            S'authentifier
          </button>
          <button onClick={reset} className="w-full h-9 rounded-xl text-xs text-slate-600 hover:bg-slate-50">
            Réinitialiser la biométrie
          </button>
        </>
      ) : (
        <>
          {!current && (
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email ou téléphone (compte existant)"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-100 outline-none text-sm"
              />
            </div>
          )}
          <button disabled={busy} onClick={enroll}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            Activer la biométrie
          </button>
        </>
      )}
    </div>
  );
}

function QrPanel({ onError, onSuccess }: { onError: (m: string | null) => void; onSuccess: (a: PatientAccount) => void }) {
  const [token] = useState<string>(() => createQrToken());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      const acc = consumeQrToken(token);
      if (acc) {
        if (pollRef.current) clearInterval(pollRef.current);
        onSuccess(acc);
      }
    }, 1500);
    const tick = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearInterval(tick);
    };
  }, [token, onSuccess]);

  const pairUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?qr=${token}`;
  const expired = seconds <= 0;

  const approveSelf = () => {
    const cur = getCurrentAccount();
    if (!cur) { onError('Aucun compte connecté sur cet appareil pour valider le QR.'); return; }
    approveQrToken(token, cur.id);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Scannez ce QR avec un appareil déjà connecté pour ouvrir votre session ici. Le code expire dans {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}.
      </p>
      <div className="flex justify-center py-2">
        {expired ? (
          <div className="text-sm text-rose-600">Code expiré. Recharger la fenêtre.</div>
        ) : (
          <div className="p-3 bg-white ring-1 ring-slate-200 rounded-2xl">
            <QRCode value={pairUrl} size={192} />
          </div>
        )}
      </div>
      <div className="text-[11px] text-slate-500 text-center break-all">{pairUrl}</div>
      <button onClick={approveSelf}
        className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-4 h-4" /> Valider depuis cet appareil (démo)
      </button>
    </div>
  );
}

// ---------------- Bouton réutilisable ----------------
export function UniversalAuthButton({ from, label = 'Se connecter', className = '' }: { from?: string; label?: string; className?: string }) {
  const { isAuthenticated, user, open, signOut } = useUniversalAuth();
  if (isAuthenticated && user) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">
          {user.firstName || user.email || user.phone || 'Connecté'}
        </span>
        <button onClick={signOut} className="text-[11px] text-slate-500 hover:text-rose-600 underline">Déconnexion</button>
      </div>
    );
  }
  return (
    <button onClick={() => open({ from })}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:opacity-90 ${className}`}>
      <Lock className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
