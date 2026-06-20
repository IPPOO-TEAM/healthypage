import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Globe, Plus, X, Heart, Pill, Stethoscope, Calendar, Trash2, CheckCircle2, CreditCard, Send, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPatientId } from '../components/usePatientId';
import { api } from '../components/api';
import { useLockBodyScroll } from '../components/useLockBodyScroll';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type Beneficiary = {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;
  city: string;
  country: string;
  phone: string;
  dob?: string;
};

type SponsorshipType = 'consultation' | 'medicaments' | 'examens' | 'hospitalisation' | 'mensuel';

type Sponsorship = {
  id: string;
  beneficiaryId: string;
  type: SponsorshipType;
  amount: number;
  currency: 'EUR' | 'USD' | 'XOF';
  recurring: boolean;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  notes?: string;
};

const TYPE_META: Record<SponsorshipType, { label: string; icon: typeof Heart; color: string; defaultAmount: number }> = {
  consultation: { label: 'Consultation', icon: Stethoscope, color: 'bg-teal-100 text-teal-800', defaultAmount: 25 },
  medicaments: { label: 'Médicaments', icon: Pill, color: 'bg-rose-100 text-rose-800', defaultAmount: 40 },
  examens: { label: 'Examens', icon: Heart, color: 'bg-violet-100 text-violet-800', defaultAmount: 60 },
  hospitalisation: { label: 'Hospitalisation', icon: Heart, color: 'bg-red-100 text-red-800', defaultAmount: 250 },
  mensuel: { label: 'Forfait mensuel', icon: Calendar, color: 'bg-amber-100 text-amber-800', defaultAmount: 50 }
};

const RELATIONS = ['Mère', 'Père', 'Sœur', 'Frère', 'Tante', 'Oncle', 'Grand-mère', 'Grand-père', 'Cousin(e)', 'Enfant', 'Conjoint(e)', 'Ami(e)', 'Autre'];

interface Props { onBack: () => void }

export default function DiasporaScreen({ onBack }: Props) {
  const pid = getPatientId();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [showAddBen, setShowAddBen] = useState(false);
  const [sponsoring, setSponsoring] = useState<Beneficiary | null>(null);
  useLockBodyScroll(!!sponsoring);

  useEffect(() => {
    if (!pid) return;
    api.listFamille(pid).then((list: any[]) => {
      const diaspora = (list ?? []).filter((f: any) => f.diaspora === true);
      setBeneficiaries(diaspora);
    }).catch(() => {});
    try {
      const raw = window.localStorage.getItem('healthy-page:diaspora:sponsorships');
      if (raw) setSponsorships(JSON.parse(raw));
    } catch {}
  }, [pid]);

  const persist = (next: Sponsorship[]) => {
    setSponsorships(next);
    try { window.localStorage.setItem('healthy-page:diaspora:sponsorships', JSON.stringify(next)); } catch {}
  };

  const addBeneficiary = async (b: Omit<Beneficiary, 'id'>) => {
    if (!pid) return;
    try {
      const created: any = await api.createFamille(pid, { ...b, diaspora: true });
      setBeneficiaries([...beneficiaries, { ...b, id: created?.id ?? `ben_${Date.now()}` }]);
    } catch {}
    setShowAddBen(false);
  };

  const removeBeneficiary = async (id: string) => {
    if (!pid) return;
    try { await api.deleteFamille(pid, id); } catch {}
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
    persist(sponsorships.filter((s) => s.beneficiaryId !== id));
  };

  const addSponsorship = async (data: Omit<Sponsorship, 'id' | 'createdAt' | 'status'>) => {
    const s: Sponsorship = {
      ...data,
      id: `sp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: data.recurring ? 'active' : 'pending'
    };
    persist([...sponsorships, s]);
    if (pid) {
      try {
        const ben = beneficiaries.find((b) => b.id === s.beneficiaryId);
        await api.createNotification(pid, {
          type: 'general',
          title: `Parrainage ${TYPE_META[s.type].label}`,
          message: `${s.amount} ${s.currency} envoyé pour ${ben?.firstName} ${ben?.lastName}`,
          read: false,
          createdAt: s.createdAt
        });
      } catch {}
    }
    setSponsoring(null);
  };

  const stats = useMemo(() => {
    const total = sponsorships.reduce((acc, s) => acc + (s.currency === 'XOF' ? s.amount / 655 : s.amount), 0);
    const active = sponsorships.filter((s) => s.status === 'active').length;
    return { totalEUR: total, active, count: sponsorships.length };
  }, [sponsorships]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-4">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback src="https://images.unsplash.com/photo-1728957493294-bf4fc62c7c98?w=1080" alt="Famille au pays" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-full" aria-label="Retour">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setShowAddBen(true)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full" aria-label="Ajouter un proche">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <h1 className="text-xl font-bold">Diaspora</h1>
              </div>
              <p className="text-xs text-teal-50/95 mt-0.5">Le lien qui soigne · soutenir les siens à distance</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Proches" value={String(beneficiaries.length)} icon={<User className="w-4 h-4" />} color="text-teal-600" />
          <Stat label="Parrainages" value={String(stats.count)} icon={<Heart className="w-4 h-4" />} color="text-rose-600" />
          <Stat label="Actifs" value={String(stats.active)} icon={<CheckCircle2 className="w-4 h-4" />} color="text-emerald-600" />
        </div>

        {stats.totalEUR > 0 && (
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl p-4 shadow">
            <p className="text-xs text-teal-100 uppercase tracking-wide font-semibold">Total contribué</p>
            <p className="text-2xl font-bold mt-1">{stats.totalEUR.toFixed(2)} €</p>
            <p className="text-xs text-teal-100 mt-1">Soit ≈ {(stats.totalEUR * 655).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F CFA</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-2">Mes proches au pays</h2>
          {beneficiaries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-teal-100 dark:border-slate-700">
              <Globe className="w-10 h-10 mx-auto mb-2 text-teal-300" />
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                Ajoutez un proche pour commencer à parrainer ses soins.
              </p>
              <button onClick={() => setShowAddBen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                + Ajouter un proche
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {beneficiaries.map((b) => {
                const benSponsors = sponsorships.filter((s) => s.beneficiaryId === b.id);
                return (
                  <div key={b.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100">{b.firstName} {b.lastName}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {b.relation} · <MapPin className="w-3 h-3 inline" /> {b.city}, {b.country}
                        </p>
                        {b.phone && <p className="text-xs text-gray-500 dark:text-slate-400">{b.phone}</p>}
                      </div>
                      <button onClick={() => removeBeneficiary(b.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 rounded-full" aria-label="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {benSponsors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold mb-1.5">Parrainages</p>
                        <div className="space-y-1">
                          {benSponsors.slice(-3).reverse().map((s) => {
                            const meta = TYPE_META[s.type];
                            const Icon = meta.icon;
                            return (
                              <div key={s.id} className="flex items-center gap-2 text-xs">
                                <Icon className="w-3.5 h-3.5 text-teal-600" />
                                <span className="flex-1 text-gray-700 dark:text-slate-300">{meta.label}</span>
                                <span className="font-semibold text-gray-800 dark:text-slate-200">{s.amount} {s.currency}</span>
                                {s.recurring && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 rounded">/mois</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSponsoring(b)}
                      className="mt-3 w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" /> Parrainer un soin
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold mb-1">💡 Comment ça marche</p>
          <p>1. Ajoutez un proche au pays · 2. Choisissez le type de soin à parrainer · 3. Le centre partenaire prend en charge votre proche, sans qu'il avance d'argent.</p>
        </div>
      </div>

      <AnimatePresence>
        {showAddBen && <BeneficiaryModal onSubmit={addBeneficiary} onClose={() => setShowAddBen(false)} />}
        {sponsoring && <SponsorModal beneficiary={sponsoring} onSubmit={addSponsorship} onClose={() => setSponsoring(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-teal-100 dark:border-slate-700 text-center">
      <div className={`flex items-center justify-center mb-1 ${color}`}>{icon}</div>
      <p className="font-bold text-gray-900 dark:text-slate-100 text-lg">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function BeneficiaryModal({ onSubmit, onClose }: { onSubmit: (b: Omit<Beneficiary, 'id'>) => void; onClose: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Bénin');
  const [phone, setPhone] = useState('');
  const valid = firstName && lastName && city;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Ajouter un proche</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prénom"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} /></Field>
            <Field label="Nom"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Lien">
            <select value={relation} onChange={(e) => setRelation(e.target.value)} className={inputCls}>
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Ville"><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></Field>
            <Field label="Pays">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                <option>Bénin</option>
                <option>Côte d'Ivoire</option>
                <option>Togo</option>
                <option>Burkina Faso</option>
                <option>Sénégal</option>
                <option>Mali</option>
                <option>Autre</option>
              </select>
            </Field>
          </div>
          <Field label="Téléphone (optionnel)"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+229 …" /></Field>
          <button onClick={() => valid && onSubmit({ firstName, lastName, relation, city, country, phone })} disabled={!valid} className="w-full bg-indigo-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl mt-2">
            Ajouter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SponsorModal({ beneficiary, onSubmit, onClose }: { beneficiary: Beneficiary; onSubmit: (d: Omit<Sponsorship, 'id' | 'createdAt' | 'status'>) => void; onClose: () => void }) {
  const [type, setType] = useState<SponsorshipType>('consultation');
  const [amount, setAmount] = useState(TYPE_META.consultation.defaultAmount);
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF'>('EUR');
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selectType = (t: SponsorshipType) => { setType(t); setAmount(TYPE_META[t].defaultAmount); };

  if (confirmed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-bold text-lg">Parrainage envoyé !</h3>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
            {amount} {currency} pour {beneficiary.firstName} ({TYPE_META[type].label.toLowerCase()})
            {recurring && ', renouvelé chaque mois'}.
          </p>
          <button onClick={onClose} className="mt-5 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">Fermer</button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Parrainer un soin</h2>
            <p className="text-xs text-gray-500">pour {beneficiary.firstName} {beneficiary.lastName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300 mb-2">Type de soin</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_META) as SponsorshipType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                return (
                  <button
                    key={t}
                    onClick={() => selectType(t)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition ${
                      type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-xs">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Montant"><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputCls} /></Field>
            <Field label="Devise">
              <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className={inputCls}>
                <option>EUR</option>
                <option>USD</option>
                <option>XOF</option>
              </select>
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-indigo-600" />
                /mois
              </label>
            </div>
          </div>

          <Field label="Note (optionnel)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Spécialiste, médicament précis, etc." /></Field>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-xs text-indigo-900 dark:text-indigo-200 flex gap-2">
            <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Paiement sécurisé via Mobile Money, carte bancaire ou virement. Le centre partenaire facture directement Healthy Page.</p>
          </div>

          <button
            onClick={() => { onSubmit({ beneficiaryId: beneficiary.id, type, amount, currency, recurring, notes: notes || undefined }); setConfirmed(true); }}
            disabled={!amount}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Confirmer {amount} {currency}{recurring ? '/mois' : ''}
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

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
