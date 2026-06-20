import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, Phone, KeyRound, ArrowRight, ArrowLeft, Lock, Mail,
  FileCheck, Clock, Building2, CreditCard, Shield, Camera, Check,
  Upload, MessageCircle, Globe2
} from 'lucide-react';
import { api } from '../../components/api';
import { compressImage } from '../../components/imageCompress';

interface Props { onComplete: (proId: string) => void; onBack: () => void; }

const SPECIALTIES = [
  'Médecin généraliste', 'Cardiologue', 'Pédiatre', 'Dermatologue', 'Gynécologue',
  'Psychiatre', 'Neurologue', 'Ophtalmologue', 'ORL', 'Rhumatologue',
  'Endocrinologue', 'Pneumologue', 'Gastro-entérologue', 'Urologue', 'Chirurgien',
  'Infirmier(e)', 'Sage-femme', 'Kinésithérapeute', 'Pharmacien', 'Dentiste', 'Autre'
];

const ACTIVITY_TYPES = ['Clinique', 'Hôpital', 'Cabinet', 'Mobile', 'Téléconsultation seulement'];
const ROLES_STRUCTURE = ['Médecin titulaire', 'Médecin vacataire', 'Chef de service', 'Interne', 'Externe', 'Consultant', 'Autre'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Doc = { name: string; size: number; uploadedAt: string } | null;

type Form = {
  // A. Pro
  lastName: string; firstName: string; photo: string | null;
  specialty: string; licence: string; country: string; city: string; address: string;
  activity: string;
  // B. Docs
  docDiplome: Doc; docOrdre: Doc; docCarte: Doc; docSpecialisation: Doc;
  // C. Dispo
  openHours: string; closeHours: string;
  days: string[];
  teleSlots: string;
  breaks: { from: string; to: string; label: string }[];
  // D. Structure
  estabName: string; estabRole: string; estabMatricule: string;
  // E. Contact
  phonePro: string; emailPro: string; whatsapp: string;
  // F. Tarif
  feeCabinet: string; feeTele: string; insurance: 'oui' | 'non' | '';
  // G. Sécurité
  password: string; password2: string; twoFA: boolean;
  // Engagement
  certifyAuthentic: boolean; ethics: boolean; authorizeCheck: boolean;
};

const INITIAL: Form = {
  lastName: '', firstName: '', photo: null,
  specialty: '', licence: '', country: 'Bénin', city: '', address: '',
  activity: '',
  docDiplome: null, docOrdre: null, docCarte: null, docSpecialisation: null,
  openHours: '08:00', closeHours: '18:00', days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
  teleSlots: '',
  breaks: [{ from: '12:00', to: '13:00', label: 'Déjeuner' }],
  estabName: '', estabRole: '', estabMatricule: '',
  phonePro: '', emailPro: '', whatsapp: '',
  feeCabinet: '', feeTele: '', insurance: '',
  password: '', password2: '', twoFA: true,
  certifyAuthentic: false, ethics: false, authorizeCheck: false
};

export default function LoginProScreen({ onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<'phone' | 'otp' | 'form' | 'signin'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [signinPhone, setSigninPhone] = useState('');
  const [signinBusy, setSigninBusy] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [pendingProId, setPendingProId] = useState<string | null>(null);
  const [expectedOtp, setExpectedOtp] = useState('');
  const [otpMode, setOtpMode] = useState<'signup' | 'signin'>('signup');
  const [otpError, setOtpError] = useState<string | null>(null);

  const [otpBusy, setOtpBusy] = useState(false);
  const [otpDemoCode, setOtpDemoCode] = useState<string | null>(null);

  const sendOtpForSignup = async () => {
    if (otpBusy || phone.length < 6) return;
    setOtpBusy(true); setOtpError(null);
    try {
      const res = await api.otpSend(phone, 'pro');
      setExpectedOtp('');
      setOtp('');
      setOtpDemoCode(res.demoCode);
      setOtpMode('signup');
      setPhase('otp');
    } catch (e: any) {
      setOtpError(e?.message ?? "Envoi du code impossible.");
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (otpBusy || otp.length !== 6) return;
    const targetPhone = otpMode === 'signin' ? signinPhone : phone;
    setOtpBusy(true); setOtpError(null);
    try {
      await api.otpVerify(targetPhone, otp);
      if (otpMode === 'signin' && pendingProId) {
        try {
          window.localStorage.setItem('healthy-page:proId', pendingProId);
        } catch {}
        onComplete(pendingProId);
      } else {
        setPhase('form');
      }
    } catch (e: any) {
      setOtpError(e?.message ?? 'Code incorrect ou expiré.');
    } finally {
      setOtpBusy(false);
    }
  };

  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (s: string) => s.replace(/[\s\-+().]/g, '');

  const signin = async () => {
    setSigninBusy(true); setSigninError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setSigninError("Vous êtes hors ligne. Reconnectez-vous à Internet pour vous identifier.");
        return;
      }
      const list = await api.listPros();
      const target = normalize(signinPhone);
      const match = (list ?? []).find((p: any) => {
        const candidates = [p.phone, p.contact?.phonePro, p.licence].filter(Boolean).map(normalize);
        return candidates.some((c) => c === target);
      });
      if (!match) {
        if (!list || list.length === 0) {
          setSigninError("Service temporairement indisponible. Réessayez dans un instant.");
        } else {
          setSigninError("Aucun compte trouvé pour ce numéro ou cette licence.");
        }
        return;
      }
      if (match.disabled) {
        setSigninError("Ce compte a été désactivé. Contactez l'administrateur.");
        return;
      }
      const res = await api.otpSend(signinPhone, 'pro');
      setExpectedOtp('');
      setOtp('');
      setOtpError(null);
      setOtpMode('signin');
      setPendingProId(match.id);
      setOtpDemoCode(res.demoCode);
      setPhase('otp');
    } catch (e: any) {
      setSigninError(e?.message ?? 'Erreur lors de la connexion.');
    } finally {
      setSigninBusy(false);
    }
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez choisir une image.');
      return;
    }
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxBytes: 1.5 * 1024 * 1024, maxDimension: 1024 });
      set('photo', dataUrl);
    } catch (err: any) {
      setPhotoError(err?.message ?? 'Compression impossible.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const onDoc = (key: 'docDiplome' | 'docOrdre' | 'docCarte' | 'docSpecialisation') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      set(key, { name: file.name, size: file.size, uploadedAt: new Date().toISOString() });
    };

  const toggleDay = (d: string) => {
    set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d]);
  };

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      const res: any = await api.createPro({
        name: `${f.firstName} ${f.lastName}`.trim(),
        firstName: f.firstName, lastName: f.lastName, photo: null,
        specialty: f.specialty, licence: f.licence,
        country: f.country, city: f.city, address: f.address,
        activity: f.activity, phone: phone || f.phonePro,
        documents: {
          diplome: f.docDiplome, ordre: f.docOrdre,
          carte: f.docCarte, specialisation: f.docSpecialisation
        },
        availability: {
          openHours: f.openHours, closeHours: f.closeHours,
          days: f.days, teleSlots: f.teleSlots,
          breaks: f.breaks.filter((b) => b.from && b.to)
        },
        structure: { name: f.estabName, role: f.estabRole, matricule: f.estabMatricule },
        contact: { phonePro: f.phonePro, emailPro: f.emailPro, whatsapp: f.whatsapp },
        tarification: { feeCabinet: f.feeCabinet, feeTele: f.feeTele, insurance: f.insurance },
        security: { hasPassword: !!f.password, twoFA: f.twoFA },
        engagement: {
          certifyAuthentic: f.certifyAuthentic,
          ethics: f.ethics,
          authorizeCheck: f.authorizeCheck,
          signedAt: new Date().toISOString()
        },
        verificationStatus: 'pending',
        role: 'pro'
      });
      if (f.photo && f.photo.startsWith('data:')) {
        try {
          const { url } = await api.uploadPhoto('pro', res.id, f.photo);
          await api.updatePro(res.id, { photo: url });
        } catch (uploadErr) {
          console.error('Pro photo upload after signup failed:', uploadErr);
        }
      }
      try {
        window.localStorage.setItem('healthy-page:proId', res.id);
        window.localStorage.setItem('healthy-page:demo-pro', 'false');
      } catch {}
      onComplete(res.id);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur création compte praticien');
      setSubmitting(false);
    }
  };

  if (phase === 'phone') {
    return (
      <Wrapper onBack={onBack}>
        <Hero />
        <div className="text-center mt-8">
          <Phone className="w-10 h-10 text-blue-700 mx-auto" />
          <h3 className="text-lg font-semibold mt-3">Numéro professionnel</h3>
          <p className="text-sm text-gray-600 mt-1">Pour la vérification SMS OTP</p>
        </div>
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="+229 01 00 00 00 00"
          className="w-full mt-6 px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
        />
        <button
          onClick={sendOtpForSignup} disabled={phone.length < 8}
          className="w-full mt-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          Recevoir le code <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPhase('signin')}
          className="w-full mt-3 text-sm text-blue-700 font-medium py-2"
        >
          J'ai déjà un compte, Se connecter
        </button>
      </Wrapper>
    );
  }

  if (phase === 'signin') {
    return (
      <Wrapper onBack={() => setPhase('phone')}>
        <Hero />
        <div className="text-center mt-8">
          <Lock className="w-10 h-10 text-blue-700 mx-auto" />
          <h3 className="text-lg font-semibold mt-3">Connexion praticien</h3>
          <p className="text-sm text-gray-600 mt-1">Numéro pro ou licence pour retrouver votre compte</p>
        </div>
        <input
          type="text" value={signinPhone} onChange={(e) => setSigninPhone(e.target.value)}
          placeholder="+229 01 21 30 30 30 ou ORD-BJ-2026-0001"
          className="w-full mt-6 px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        {signinError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{signinError}</div>
        )}
        <button
          onClick={signin}
          disabled={signinPhone.trim().length < 4 || signinBusy}
          className="w-full mt-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {signinBusy ? 'Vérification…' : <>Recevoir le code <ArrowRight className="w-5 h-5" /></>}
        </button>
        <button
          onClick={() => setPhase('phone')}
          className="w-full mt-3 text-sm text-gray-600 py-2"
        >
          Pas encore de compte ? Créer un compte
        </button>
      </Wrapper>
    );
  }

  if (phase === 'otp') {
    return (
      <Wrapper onBack={() => setPhase(otpMode === 'signin' ? 'signin' : 'phone')}>
        <Hero />
        <div className="text-center mt-8">
          <KeyRound className="w-10 h-10 text-blue-700 mx-auto" />
          <h3 className="text-lg font-semibold mt-3">Code de vérification</h3>
          <p className="text-sm text-gray-600 mt-1">Saisissez le code à 6 chiffres reçu par SMS</p>
        </div>
        {otpDemoCode && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-[11px] uppercase tracking-widest text-amber-700">Code de test (DEMO_OTP)</p>
            <p className="text-2xl font-bold tracking-[0.4em] text-amber-900">{otpDemoCode}</p>
            <p className="text-[11px] text-amber-700/80 mt-1">Variable serveur DEMO_OTP=1 active. À désactiver en production.</p>
          </div>
        )}
        <input
          type="text" inputMode="numeric" maxLength={6}
          value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(null); }}
          placeholder="• • • • • •"
          className="w-full mt-4 px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-2xl text-center tracking-[0.5em]"
        />
        {otpError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{otpError}</div>
        )}
        <button
          onClick={verifyOtp} disabled={otp.length !== 6}
          className="w-full mt-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-semibold disabled:opacity-50"
        >Vérifier</button>
        <button
          onClick={async () => {
            const targetPhone = otpMode === 'signin' ? signinPhone : phone;
            try {
              const res = await api.otpSend(targetPhone, 'pro');
              setOtp('');
              setOtpError(null);
              setOtpDemoCode(res.demoCode);
            } catch (e: any) {
              setOtpError(e?.message ?? "Renvoi impossible.");
            }
          }}
          className="w-full mt-2 text-xs text-gray-500 py-2"
        >Renvoyer un code</button>
      </Wrapper>
    );
  }

  // === FORM ===
  const SECTIONS = [
    { id: 'A', label: 'Informations professionnelles', icon: Stethoscope, color: 'blue' },
    { id: 'B', label: 'Pièces justificatives', icon: FileCheck, color: 'indigo' },
    { id: 'C', label: 'Disponibilités & organisation', icon: Clock, color: 'cyan' },
    { id: 'D', label: 'Structure / établissement', icon: Building2, color: 'teal' },
    { id: 'E', label: 'Contacts professionnels', icon: Phone, color: 'emerald' },
    { id: 'F', label: 'Tarification', icon: CreditCard, color: 'amber' },
    { id: 'G', label: 'Sécurité du compte', icon: Lock, color: 'rose' },
    { id: 'V', label: 'Validation & engagement', icon: Shield, color: 'green' }
  ];
  const sec = SECTIONS[step];
  const SecIcon = sec.icon;

  const aOk = f.lastName && f.firstName && f.specialty && f.licence && f.city && f.activity;
  const bOk = f.docDiplome && f.docOrdre && f.docCarte;
  const cOk = f.days.length > 0 && f.openHours && f.closeHours;
  const eOk = f.phonePro && f.emailPro;
  const gOk = f.password.length >= 6 && f.password === f.password2;
  const vOk = f.certifyAuthentic && f.ethics && f.authorizeCheck;

  const canNext =
    step === 0 ? aOk :
    step === 1 ? bOk :
    step === 2 ? cOk :
    step === 4 ? eOk :
    step === 6 ? gOk :
    step === 7 ? vOk :
    true;

  return (
    <div className="min-h-[80vh] max-w-md mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => setPhase('otp')} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs text-gray-500">Étape {step + 1} / {SECTIONS.length}</p>
          <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={false}
              animate={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`bg-${sec.color}-50 p-3 rounded-2xl`}>
          <SecIcon className={`w-6 h-6 text-${sec.color}-600`} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Section {sec.id}</p>
          <h2 className="text-xl font-bold text-gray-900">{sec.label}</h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          {step === 0 && (
            <>
              <div className="flex justify-center">
                <label className="relative cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    {f.photo ? <img src={f.photo} alt="" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-blue-700" />}
                  </div>
                  <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                  <span className="absolute -bottom-1 right-0 bg-blue-700 text-white text-xs px-2 py-1 rounded-full">{photoBusy ? '…' : '+'}</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center -mt-2">Photo professionnelle{photoBusy ? ' (optimisation…)' : ''}</p>
              {photoError && <p className="text-xs text-red-600 text-center">{photoError}</p>}
              <Field label="Nom *">
                <input value={f.lastName} onChange={(e) => set('lastName', e.target.value)} className={inp} placeholder="HOUNKPATIN" />
              </Field>
              <Field label="Prénoms *">
                <input value={f.firstName} onChange={(e) => set('firstName', e.target.value)} className={inp} placeholder="Aïcha" />
              </Field>
              <Field label="Spécialité médicale *">
                <select value={f.specialty} onChange={(e) => set('specialty', e.target.value)} className={inp}>
                  <option value="">,  Sélectionnez , </option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Numéro de licence / matricule professionnel *">
                <input value={f.licence} onChange={(e) => set('licence', e.target.value)} className={inp} placeholder="ORD-BJ-2026-0001" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pays d'exercice">
                  <input value={f.country} onChange={(e) => set('country', e.target.value)} className={inp} />
                </Field>
                <Field label="Ville *">
                  <input value={f.city} onChange={(e) => set('city', e.target.value)} className={inp} placeholder="Cotonou" />
                </Field>
              </div>
              <Field label="Adresse du cabinet">
                <textarea value={f.address} onChange={(e) => set('address', e.target.value)} className={`${inp} min-h-[60px]`} placeholder="Rue, immeuble, quartier…" />
              </Field>
              <Field label="Type d'activité *">
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_TYPES.map((a) => (
                    <button
                      key={a}
                      onClick={() => set('activity', a)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm text-left ${
                        f.activity === a ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-700'
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-gray-600">Tous les documents marqués * sont obligatoires pour la validation.</p>
              <DocUpload label="Diplôme médical *" doc={f.docDiplome} onChange={onDoc('docDiplome')} />
              <DocUpload label="Inscription Ordre / Conseil *" doc={f.docOrdre} onChange={onDoc('docOrdre')} />
              <DocUpload label="Carte professionnelle / Badge *" doc={f.docCarte} onChange={onDoc('docCarte')} />
              <DocUpload label="Diplôme de spécialisation (si applicable)" doc={f.docSpecialisation} onChange={onDoc('docSpecialisation')} />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-900">
                  Vos documents sont chiffrés et ne servent qu'à la vérification par l'équipe Healthy Page.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Jours disponibles">
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d) => {
                    const on = f.days.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`py-2 rounded-xl border-2 text-xs font-medium ${
                          on ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                        }`}
                      >{d}</button>
                    );
                  })}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ouverture">
                  <input type="time" value={f.openHours} onChange={(e) => set('openHours', e.target.value)} className={inp} />
                </Field>
                <Field label="Fermeture">
                  <input type="time" value={f.closeHours} onChange={(e) => set('closeHours', e.target.value)} className={inp} />
                </Field>
              </div>
              <Field label="Plages de pause (exclues de l'agenda)">
                <div className="space-y-2">
                  {f.breaks.map((b, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                      <input
                        value={b.label}
                        onChange={(e) => set('breaks', f.breaks.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                        className={inp}
                        placeholder="Pause"
                      />
                      <input
                        type="time"
                        value={b.from}
                        onChange={(e) => set('breaks', f.breaks.map((x, idx) => idx === i ? { ...x, from: e.target.value } : x))}
                        className={inp}
                      />
                      <input
                        type="time"
                        value={b.to}
                        onChange={(e) => set('breaks', f.breaks.map((x, idx) => idx === i ? { ...x, to: e.target.value } : x))}
                        className={inp}
                      />
                      <button
                        onClick={() => set('breaks', f.breaks.filter((_, idx) => idx !== i))}
                        className="text-red-600 px-2"
                        aria-label="Retirer"
                      >×</button>
                    </div>
                  ))}
                  <button
                    onClick={() => set('breaks', [...f.breaks, { from: '', to: '', label: 'Pause' }])}
                    className="w-full text-blue-700 py-2 text-sm font-medium border-2 border-dashed border-blue-200 rounded-xl"
                  >+ Ajouter une plage</button>
                </div>
              </Field>
              <Field label="Plages horaires de téléconsultation">
                <input value={f.teleSlots} onChange={(e) => set('teleSlots', e.target.value)} className={inp} placeholder="Ex: 12h-14h en semaine" />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-gray-600">À remplir si vous travaillez dans un établissement partenaire.</p>
              <Field label="Nom de l'établissement">
                <input value={f.estabName} onChange={(e) => set('estabName', e.target.value)} className={inp} placeholder="Centre Médical de Ganhi" />
              </Field>
              <Field label="Rôle dans l'établissement">
                <select value={f.estabRole} onChange={(e) => set('estabRole', e.target.value)} className={inp}>
                  <option value="">,  Sélectionnez , </option>
                  {ROLES_STRUCTURE.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Matricule interne (optionnel)">
                <input value={f.estabMatricule} onChange={(e) => set('estabMatricule', e.target.value)} className={inp} />
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field label="Téléphone professionnel *">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={f.phonePro} onChange={(e) => set('phonePro', e.target.value)} className={`${inp} pl-10`} placeholder="+229 01 21 30 30 30" />
                </div>
              </Field>
              <Field label="Email professionnel *">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={f.emailPro} onChange={(e) => set('emailPro', e.target.value)} className={`${inp} pl-10`} placeholder="praticien@cabinet.bj" />
                </div>
              </Field>
              <Field label="WhatsApp (optionnel)">
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={`${inp} pl-10`} placeholder="+229 01 00 00 00 00" />
                </div>
              </Field>
            </>
          )}

          {step === 5 && (
            <>
              <Field label="Tarif consultation cabinet (FCFA)">
                <input type="number" value={f.feeCabinet} onChange={(e) => set('feeCabinet', e.target.value)} className={inp} placeholder="15000" />
              </Field>
              <Field label="Tarif téléconsultation (FCFA)">
                <input type="number" value={f.feeTele} onChange={(e) => set('feeTele', e.target.value)} className={inp} placeholder="10000" />
              </Field>
              <Field label="Accord avec assurance ?">
                <div className="grid grid-cols-2 gap-2">
                  {(['oui', 'non'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => set('insurance', v)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium ${
                        f.insurance === v ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-700'
                      }`}
                    >{v.toUpperCase()}</button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 6 && (
            <>
              <Field label="Mot de passe (6+ caractères)">
                <input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} className={inp} />
              </Field>
              <Field label="Confirmation mot de passe">
                <input type="password" value={f.password2} onChange={(e) => set('password2', e.target.value)} className={inp} />
                {f.password2 && f.password !== f.password2 && (
                  <p className="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </Field>
              <label className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer">
                <input type="checkbox" checked={f.twoFA} onChange={(e) => set('twoFA', e.target.checked)} className="mt-1 w-5 h-5 accent-rose-600" />
                <div>
                  <p className="text-sm font-semibold text-rose-900">Activer la double authentification (2FA)</p>
                  <p className="text-xs text-rose-800 mt-0.5">Fortement recommandé : code SMS à chaque connexion.</p>
                </div>
              </label>
            </>
          )}

          {step === 7 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{f.firstName} {f.lastName}</span>, {f.specialty}
                  {f.city && ` • ${f.city}`}
                </p>
                <p className="text-xs text-blue-800 mt-1">Licence : {f.licence}</p>
              </div>
              <Engage label="Je certifie l'authenticité de mes documents." checked={f.certifyAuthentic} onChange={(v) => set('certifyAuthentic', v)} />
              <Engage label="J'accepte les règles d'éthique de Healthy Page." checked={f.ethics} onChange={(v) => set('ethics', v)} />
              <Engage label="J'autorise la vérification auprès des autorités médicales." checked={f.authorizeCheck} onChange={(v) => set('authorizeCheck', v)} />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-900">
                  Votre compte sera marqué <span className="font-semibold">en attente de vérification</span> jusqu'à validation par notre équipe.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{error}</div>
      )}

      <button
        onClick={() => step === SECTIONS.length - 1 ? submit() : setStep((s) => s + 1)}
        disabled={!canNext || submitting}
        className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-semibold shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {step === SECTIONS.length - 1
          ? (submitting ? 'Création en cours…' : <>Soumettre pour vérification <Check className="w-5 h-5" /></>)
          : <>Continuer <ArrowRight className="w-5 h-5" /></>}
      </button>
    </div>
  );
}

const inp = 'w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100';

function Wrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-[80vh] max-w-md mx-auto px-4 py-8 flex flex-col">
      <button onClick={onBack} className="self-start inline-flex items-center gap-2 text-gray-600 mb-6">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>
      {children}
    </div>
  );
}

function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-lg"
    >
      <div className="bg-white/20 p-3 rounded-2xl w-fit"><Stethoscope className="w-7 h-7" /></div>
      <h2 className="text-2xl font-bold mt-3">Espace Praticien</h2>
      <p className="text-sm text-white/85 mt-1">Inscription sécurisée pour les professionnels de santé</p>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function DocUpload({ label, doc, onChange }: { label: string; doc: Doc; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
      doc ? 'border-emerald-400 bg-emerald-50' : 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${doc ? 'bg-emerald-100' : 'bg-white'}`}>
          {doc ? <Check className="w-5 h-5 text-emerald-700" /> : <Upload className="w-5 h-5 text-blue-700" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${doc ? 'text-emerald-900' : 'text-gray-900'}`}>{label}</p>
          {doc ? (
            <p className="text-xs text-emerald-700 truncate">{doc.name} • {(doc.size / 1024).toFixed(0)} Ko</p>
          ) : (
            <p className="text-xs text-gray-500">Cliquez pour téléverser (PDF / image)</p>
          )}
        </div>
      </div>
      <input type="file" accept="application/pdf,image/*" onChange={onChange} className="hidden" />
    </label>
  );
}

function Engage({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-200 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-5 h-5 accent-blue-700" />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
