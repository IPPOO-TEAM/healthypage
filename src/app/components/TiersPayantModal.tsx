import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Wallet, Building2, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import PaymentModal from './PaymentModal';

export interface TPPolicy {
  id: string;
  name: string;
  insurer: string;
  ratePct: number;
  ceilingCents: number;
  cardNumber: string;
}

export interface TPCategory { id: string; label: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  policies: TPPolicy[];
  categories: TPCategory[];
  usedCentsByPolicy: Record<string, number>;
  onAccepted: (claim: {
    policyId: string;
    category: string;
    type: string;
    provider: string;
    amountCents: number;
    insurerCents: number;
    patientCents: number;
    paymentRef?: string;
  }) => void;
}

const fmt = (cents: number) => `${Math.round(cents / 100).toLocaleString('fr-FR')} FCFA`;

export default function TiersPayantModal({ open, onClose, policies, categories, usedCentsByPolicy, onAccepted }: Props) {
  const [step, setStep] = useState<'form' | 'split' | 'done'>('form');
  const [policyId, setPolicyId] = useState(policies[0]?.id ?? '');
  const [category, setCategory] = useState(categories[0]?.id ?? '');
  const [type, setType] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [payOpen, setPayOpen] = useState(false);

  const policy = policies.find((p) => p.id === policyId);
  const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100) || 0;

  const split = useMemo(() => {
    if (!policy || amountCents <= 0) return null;
    const used = usedCentsByPolicy[policy.id] ?? 0;
    const remainingCeiling = Math.max(0, policy.ceilingCents - used);
    const naive = Math.round((amountCents * policy.ratePct) / 100);
    const insurerCents = Math.min(naive, remainingCeiling);
    const patientCents = amountCents - insurerCents;
    return { insurerCents, patientCents, ratePct: policy.ratePct, capped: insurerCents < naive, remainingCeiling };
  }, [policy, amountCents, usedCentsByPolicy]);

  const reset = () => {
    setStep('form'); setType(''); setProvider(''); setAmount('');
  };
  const close = () => { onClose(); setTimeout(reset, 250); };

  const valid = !!policy && type.trim() && provider.trim() && amountCents > 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tp"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={close}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          <header className="px-5 py-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest opacity-90">Tiers-payant automatisé</p>
                <h2 className="font-bold">Payer uniquement votre part</h2>
              </div>
            </div>
            <button onClick={close} className="p-2 rounded-lg hover:bg-white/15"><X className="w-5 h-5" /></button>
          </header>

          <div className="overflow-y-auto p-5 space-y-4">
            {step === 'form' && (
              <>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 flex gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>L'assureur règle directement la part couverte au prestataire. Vous ne payez que le reste à charge.</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Police</label>
                  <select value={policyId} onChange={(e) => setPolicyId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {policies.map((p) => <option key={p.id} value={p.id}>{p.insurer} — {p.name} ({p.ratePct}%)</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Catégorie</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Montant (FCFA)</label>
                    <input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Intitulé de la prestation</label>
                  <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex. Consultation pédiatre" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Prestataire conventionné</label>
                  <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Ex. Clinique Atlantique" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <button
                  disabled={!valid}
                  onClick={() => setStep('split')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Calculer le partage <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'split' && policy && split && (
              <>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Répartition automatique</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-emerald-800"><Building2 className="w-4 h-4" /> {policy.insurer} ({split.ratePct}%)</span>
                    <span className="font-bold text-emerald-800">{fmt(split.insurerCents)}</span>
                  </div>
                  <div className="h-px bg-emerald-100"></div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-gray-700"><Wallet className="w-4 h-4" /> Reste à votre charge</span>
                    <span className="font-bold text-gray-900">{fmt(split.patientCents)}</span>
                  </div>
                  <div className="h-px bg-emerald-100"></div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total prestation</span>
                    <span className="font-medium text-gray-700">{fmt(amountCents)}</span>
                  </div>
                  {split.capped && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2">
                      Plafond annuel partiellement atteint, l'assureur couvre {fmt(split.insurerCents)} sur cette prestation.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setStep('form')} className="py-3 rounded-xl border border-gray-200 text-sm font-medium">Modifier</button>
                  <button
                    onClick={() => setPayOpen(true)}
                    disabled={split.patientCents <= 0}
                    className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {split.patientCents > 0 ? <>Payer ma part ({fmt(split.patientCents)})</> : 'Couvert à 100%'}
                  </button>
                </div>

                {split.patientCents <= 0 && (
                  <button
                    onClick={() => {
                      onAccepted({
                        policyId: policy.id, category, type: type.trim(), provider: provider.trim(),
                        amountCents, insurerCents: split.insurerCents, patientCents: 0,
                      });
                      setStep('done');
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                  >
                    Valider sans paiement <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {step === 'done' && (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <p className="font-semibold text-gray-900">Tiers-payant validé</p>
                <p className="text-sm text-gray-600">L'assureur règle sa part directement au prestataire.</p>
                <button onClick={close} className="mt-2 px-5 py-2.5 rounded-xl bg-gray-100 text-sm font-medium">Fermer</button>
              </div>
            )}
          </div>
        </motion.div>

        {policy && split && (
          <PaymentModal
            open={payOpen}
            onClose={() => setPayOpen(false)}
            amount={Math.round(split.patientCents / 100)}
            purpose={`Tiers-payant · ${type || 'prestation'}`}
            ref={`tp-${policy.cardNumber}`}
            onSettled={(status, record) => {
              if (status === 'succeeded' || status === 'pending') {
                onAccepted({
                  policyId: policy.id, category, type: type.trim(), provider: provider.trim(),
                  amountCents, insurerCents: split.insurerCents, patientCents: split.patientCents,
                  paymentRef: record?.id ?? record?.ref,
                });
                setPayOpen(false);
                setStep('done');
              }
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
