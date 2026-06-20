import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Users, Stethoscope, FileCheck, Activity, Plus, X, CheckCircle2, AlertTriangle, Calendar, TrendingUp, Mail, Phone, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPatientId } from '../components/usePatientId';
import { api } from '../components/api';
import { useLockBodyScroll } from '../components/useLockBodyScroll';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CONTACTS, telHref, hasContact } from '../components/contacts';

type Plan = 'starter' | 'pro' | 'premium';

type Service = 'visite_embauche' | 'visite_periodique' | 'campagne_vaccination' | 'depistage' | 'ergonomie' | 'sante_mentale' | 'urgences' | 'teleconsultation';

type Booking = {
  id: string;
  service: Service;
  date: string;
  participants: number;
  status: 'pending' | 'confirmed' | 'done';
  notes?: string;
};

const PLANS: Record<Plan, {
  label: string;
  price: number;
  perEmployee: boolean;
  features: string[];
  color: string;
}> = {
  starter: {
    label: 'Starter',
    price: 5000,
    perEmployee: true,
    features: ['Visite d\'embauche', 'Téléconsultation 24/7', 'Carnet de santé numérique', 'Hotline médicale'],
    color: 'from-teal-500 to-cyan-500'
  },
  pro: {
    label: 'Pro',
    price: 9500,
    perEmployee: true,
    features: ['Tout Starter', 'Visite périodique annuelle', 'Campagnes de vaccination', 'Dépistage paludisme/diabète', 'Ergonomie poste de travail'],
    color: 'from-teal-600 to-cyan-600'
  },
  premium: {
    label: 'Premium',
    price: 18000,
    perEmployee: true,
    features: ['Tout Pro', 'Médecin référent dédié', 'Cellule santé mentale', 'Audit de risques psychosociaux', 'Reporting trimestriel', 'Urgences sur site'],
    color: 'from-teal-700 to-cyan-700'
  }
};

const SERVICES: Record<Service, { label: string; icon: typeof Stethoscope; color: string }> = {
  visite_embauche: { label: 'Visite d\'embauche', icon: FileCheck, color: 'bg-teal-100 text-teal-800' },
  visite_periodique: { label: 'Visite périodique', icon: Calendar, color: 'bg-sky-100 text-sky-800' },
  campagne_vaccination: { label: 'Campagne vaccination', icon: Activity, color: 'bg-emerald-100 text-emerald-800' },
  depistage: { label: 'Dépistage groupé', icon: Activity, color: 'bg-rose-100 text-rose-800' },
  ergonomie: { label: 'Ergonomie postes', icon: Briefcase, color: 'bg-amber-100 text-amber-800' },
  sante_mentale: { label: 'Cellule santé mentale', icon: Stethoscope, color: 'bg-violet-100 text-violet-800' },
  urgences: { label: 'Urgences sur site', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
  teleconsultation: { label: 'Téléconsultation', icon: Stethoscope, color: 'bg-indigo-100 text-indigo-800' }
};

interface Props { onBack: () => void }

export default function EntrepriseScreen({ onBack }: Props) {
  const pid = getPatientId();
  const [company, setCompany] = useState({ name: '', employees: 0, sector: '', contact: '', email: '', phone: '' });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBook, setShowBook] = useState<Service | null>(null);
  const [showSubscribe, setShowSubscribe] = useState<Plan | null>(null);
  useLockBodyScroll(!!plan || !!showBook || !!showSubscribe);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('healthy-page:entreprise');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.company) setCompany(data.company);
        if (data.plan) setPlan(data.plan);
        if (data.bookings) setBookings(data.bookings);
      }
    } catch {}
  }, []);

  const persist = (next: Partial<{ company: any; plan: Plan | null; bookings: Booking[] }>) => {
    const data = { company, plan, bookings, ...next };
    setCompany(data.company);
    setPlan(data.plan);
    setBookings(data.bookings);
    try { window.localStorage.setItem('healthy-page:entreprise', JSON.stringify(data)); } catch {}
  };

  const subscribe = async (p: Plan) => {
    persist({ plan: p });
    setShowSubscribe(null);
    if (pid) {
      try {
        await api.createNotification(pid, {
          type: 'general',
          title: `Abonnement entreprise ${PLANS[p].label}`,
          message: `${company.name || 'Votre entreprise'} · ${company.employees} employés`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch {}
    }
  };

  const addBooking = async (service: Service, date: string, participants: number, notes: string) => {
    const b: Booking = { id: `b_${Date.now()}`, service, date, participants, notes: notes || undefined, status: 'pending' };
    persist({ bookings: [...bookings, b] });
    setShowBook(null);
    if (pid) {
      try {
        await api.createNotification(pid, {
          type: 'rdv',
          title: `RDV entreprise, ${SERVICES[service].label}`,
          message: `${formatDate(date)} · ${participants} participants`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch {}
    }
  };

  const cancelBooking = (id: string) => {
    persist({ bookings: bookings.filter((b) => b.id !== id) });
  };

  const monthlyTotal = useMemo(() => {
    if (!plan || !company.employees) return 0;
    return PLANS[plan].price * company.employees;
  }, [plan, company.employees]);

  const availableServices = useMemo<Service[]>(() => {
    if (plan === 'premium') return Object.keys(SERVICES) as Service[];
    if (plan === 'pro') return ['visite_embauche', 'visite_periodique', 'campagne_vaccination', 'depistage', 'ergonomie', 'teleconsultation'];
    if (plan === 'starter') return ['visite_embauche', 'teleconsultation'];
    return [];
  }, [plan]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1666885181287-004f7ccfc0ae?w=1080" alt="Équipe professionnelle" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Building2 className="w-5 h-5" /> Cellule Entreprise
          </div>
          <h2 className="text-2xl font-bold mt-1">Santé au travail</h2>
          <p className="text-sm text-white/85 mt-1">Contrats employeurs · entreprises en mouvement</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-blue-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" /> Profil entreprise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Raison sociale"><input value={company.name} onChange={(e) => persist({ company: { ...company, name: e.target.value } })} className={inputCls} /></Field>
            <Field label="Secteur"><input value={company.sector} onChange={(e) => persist({ company: { ...company, sector: e.target.value } })} className={inputCls} placeholder="BTP, IT, Hôtellerie…" /></Field>
            <Field label="Effectif"><input type="number" value={company.employees || ''} onChange={(e) => persist({ company: { ...company, employees: Number(e.target.value) } })} className={inputCls} /></Field>
            <Field label="Contact RH"><input value={company.contact} onChange={(e) => persist({ company: { ...company, contact: e.target.value } })} className={inputCls} /></Field>
            <Field label="Email"><input type="email" value={company.email} onChange={(e) => persist({ company: { ...company, email: e.target.value } })} className={inputCls} /></Field>
            <Field label="Téléphone"><input value={company.phone} onChange={(e) => persist({ company: { ...company, phone: e.target.value } })} className={inputCls} /></Field>
          </div>
        </div>

        {plan && (
          <div className={`bg-gradient-to-r ${PLANS[plan].color} text-white rounded-2xl p-4 shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">Abonnement actif</p>
                <p className="text-xl font-bold">Healthy Entreprise {PLANS[plan].label}</p>
                <p className="text-sm opacity-90 mt-1">{company.employees} employé{company.employees > 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{monthlyTotal.toLocaleString('fr-FR')}</p>
                <p className="text-xs opacity-90">F CFA / mois</p>
              </div>
            </div>
            <button onClick={() => persist({ plan: null })} className="mt-3 text-xs underline opacity-80 hover:opacity-100">
              Changer d'offre
            </button>
          </div>
        )}

        {!plan && (
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Choisissez une offre</h2>
            <div className="space-y-3">
              {(Object.keys(PLANS) as Plan[]).map((p) => {
                const meta = PLANS[p];
                return (
                  <div key={p} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`bg-gradient-to-r ${meta.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {meta.label}
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {meta.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">F CFA / employé / mois</span>
                      </p>
                    </div>
                    <ul className="text-sm space-y-1 text-gray-700 dark:text-slate-300 mb-3">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowSubscribe(p)}
                      disabled={!company.name || !company.employees}
                      className={`w-full bg-gradient-to-r ${meta.color} disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm`}
                    >
                      {!company.name || !company.employees ? 'Renseignez le profil d\'abord' : 'Souscrire'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {plan && (
          <>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Services disponibles</h2>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((s) => {
                  const meta = SERVICES[s];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => setShowBook(s)}
                      className="bg-white dark:bg-slate-800 hover:shadow-md transition rounded-xl p-3 border border-gray-100 dark:border-slate-700 text-left"
                    >
                      <div className={`inline-flex p-2 rounded-lg ${meta.color} mb-2`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{meta.label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Programmer →</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" /> Mes interventions
              </h2>
              {bookings.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-700">
                  Aucune intervention programmée.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...bookings].reverse().map((b) => {
                    const meta = SERVICES[b.service];
                    const Icon = meta.icon;
                    return (
                      <div key={b.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${meta.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{meta.label}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {formatDate(b.date)} · {b.participants} participants
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          b.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status === 'done' ? 'Réalisée' : b.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                        </span>
                        <button onClick={() => cancelBooking(b.id)} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full" aria-label="Annuler">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-blue-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Indicateurs santé (mock)
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <Indicator label="Adhésion" value="78%" color="text-emerald-600" />
                <Indicator label="Téléconsult." value="42" color="text-indigo-600" />
                <Indicator label="Absentéisme" value="-18%" color="text-rose-600" />
              </div>
            </div>
          </>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200 flex gap-2">
          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Une question RH ? Contactez la cellule entreprise
            {hasContact(CONTACTS.enterpriseEmail) && <> : <a href={`mailto:${CONTACTS.enterpriseEmail}`} className="underline font-semibold">{CONTACTS.enterpriseEmail}</a></>}
            {hasContact(CONTACTS.supportPhone) && <> · <a href={telHref(CONTACTS.supportPhone)} className="underline font-semibold">{CONTACTS.supportPhone}</a></>}
            {!hasContact(CONTACTS.enterpriseEmail) && !hasContact(CONTACTS.supportPhone) && <> via l'espace administrateur.</>}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showSubscribe && (
          <ConfirmModal
            title={`Souscrire à ${PLANS[showSubscribe].label}`}
            message={`Pour ${company.employees} employés à ${PLANS[showSubscribe].price.toLocaleString('fr-FR')} F CFA/mois chacun, soit ${(PLANS[showSubscribe].price * company.employees).toLocaleString('fr-FR')} F CFA/mois au total.`}
            confirmLabel="Confirmer la souscription"
            onConfirm={() => subscribe(showSubscribe)}
            onClose={() => setShowSubscribe(null)}
          />
        )}
        {showBook && (
          <BookingModal
            service={showBook}
            maxParticipants={company.employees || 100}
            onSubmit={(date, participants, notes) => addBooking(showBook, date, participants, notes)}
            onClose={() => setShowBook(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Indicator({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }: { title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">{message}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-sm font-medium">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">{confirmLabel}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BookingModal({ service, maxParticipants, onSubmit, onClose }: { service: Service; maxParticipants: number; onSubmit: (date: string, participants: number, notes: string) => void; onClose: () => void }) {
  const [date, setDate] = useState('');
  const [participants, setParticipants] = useState(Math.min(10, maxParticipants));
  const [notes, setNotes] = useState('');
  const meta = SERVICES[service];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">{meta.label}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Date souhaitée"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className={inputCls} /></Field>
          <Field label={`Participants (max ${maxParticipants})`}>
            <input type="number" value={participants} onChange={(e) => setParticipants(Math.min(maxParticipants, Math.max(1, Number(e.target.value))))} className={inputCls} />
          </Field>
          <Field label="Notes (optionnel)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Précisions logistiques, lieu, contacts…" /></Field>
          <button onClick={() => date && onSubmit(date, participants, notes)} disabled={!date} className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl mt-2">
            Programmer l'intervention
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function formatDate(iso: string): string {
  try { return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return iso; }
}
