import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2, Smartphone, CreditCard, Building2, ShieldCheck, Phone, AlertTriangle, Copy } from 'lucide-react';
import { api } from './api';
import { getPatientId } from './usePatientId';
import { usePatientPreferences } from './useStoredState';

export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'moov_money' | 'wave' | 'card' | 'bank_transfer';

interface Props {
  open: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  purpose: string;
  rdvId?: string;
  ordonnanceId?: string;
  proId?: string;
  ref?: string;
  onSettled?: (status: 'succeeded' | 'failed' | 'cancelled' | 'pending', record: any) => void;
}

const METHODS: Array<{ id: PaymentMethod; label: string; sub: string; tone: string; icon: any }> = [
  { id: 'mtn_momo',     label: 'MTN Mobile Money', sub: 'Numéro MoMo · USSD',     tone: 'amber',   icon: Smartphone },
  { id: 'orange_money', label: 'Orange Money',     sub: 'Numéro OM · USSD',       tone: 'orange',  icon: Smartphone },
  { id: 'moov_money',   label: 'Moov Money',       sub: 'Numéro Moov · USSD',     tone: 'sky',     icon: Smartphone },
  { id: 'wave',         label: 'Wave',             sub: 'Sans frais · code PIN',  tone: 'blue',    icon: Smartphone },
  { id: 'card',         label: 'Carte bancaire',   sub: 'Visa / Mastercard',      tone: 'slate',   icon: CreditCard },
  { id: 'bank_transfer',label: 'Virement bancaire',sub: 'IBAN · 1-3 jours',       tone: 'emerald', icon: Building2 },
];

const TONE: Record<string, string> = {
  amber: 'from-amber-500 to-yellow-500',
  orange: 'from-orange-500 to-rose-500',
  sky: 'from-sky-500 to-blue-500',
  blue: 'from-blue-600 to-indigo-600',
  slate: 'from-slate-600 to-slate-800',
  emerald: 'from-emerald-500 to-teal-600',
};

const fmtAmount = (n: number, ccy: string) => `${new Intl.NumberFormat('fr-FR').format(n)} ${ccy}`;

export default function PaymentModal({ open, onClose, amount, currency = 'XOF', purpose, rdvId, ordonnanceId, proId, ref, onSettled }: Props) {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'failed' | 'bank'>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { prefs, update: updatePrefs } = usePatientPreferences();

  useEffect(() => {
    if (!open) return;
    setStep('method');
    setMethod(null);
    setRecord(null);
    setError(null);
    setCopied(false);
  }, [open]);

  useEffect(() => {
    if (open && (prefs as any).momoNumber && !phone) setPhone((prefs as any).momoNumber);
  }, [open, prefs]);

  const polling = step === 'processing' && !!record?.id;
  useEffect(() => {
    if (!polling) return;
    const pid = getPatientId();
    if (!pid) return;
    let stopped = false;
    const tick = async () => {
      try {
        const r = await api.getPayment(pid, record.id);
        if (stopped) return;
        setRecord(r);
        if (r?.status === 'succeeded') { setStep('success'); onSettled?.('succeeded', r); }
        else if (r?.status === 'failed' || r?.status === 'cancelled') {
          setStep('failed');
          setError(r?.failureReason || 'Paiement non abouti.');
          onSettled?.(r.status, r);
        }
      } catch {}
    };
    const t = setInterval(tick, 2000);
    return () => { stopped = true; clearInterval(t); };
  }, [polling, record?.id]);

  const submit = async () => {
    if (!method) return;
    const pid = getPatientId();
    if (!pid) { setError('Vous devez être connecté.'); return; }
    setError(null);
    try {
      const isMomo = method === 'mtn_momo' || method === 'orange_money' || method === 'moov_money' || method === 'wave';
      if (isMomo && (!phone || phone.replace(/\D/g, '').length < 8)) {
        setError('Numéro de téléphone invalide.');
        return;
      }
      if (method === 'card' && cardNumber.replace(/\s/g, '').length < 12) {
        setError('Numéro de carte invalide.');
        return;
      }
      if (isMomo) {
        try { updatePrefs({ ...(prefs as any), momoNumber: phone } as any); } catch {}
      }
      setStep('processing');
      const rec = await api.initiatePayment({
        patientId: pid, amount, currency, method, purpose,
        phone: isMomo ? phone : undefined,
        cardLast4: method === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        rdvId, ordonnanceId, proId, ref,
      });
      setRecord(rec);
      if (method === 'bank_transfer') {
        setStep('bank');
      } else if (rec?.providerUrl) {
        window.open(rec.providerUrl, '_blank', 'noopener');
      }
    } catch (e: any) {
      setError(e?.message || 'Initialisation du paiement impossible.');
      setStep('details');
    }
  };

  const copyIban = async () => {
    try { await navigator.clipboard.writeText('BJ66 0000 0142 0033 7841 5687 13'); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  if (!open) return null;
  const requiresPhone = method === 'mtn_momo' || method === 'orange_money' || method === 'moov_money' || method === 'wave';

  return (
    <AnimatePresence>
      <motion.div
        key="payment-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col"
        >
          <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-semibold">Paiement</p>
              <h2 className="font-bold text-slate-900">{purpose}</h2>
              <p className="text-sm text-slate-700 mt-0.5">{fmtAmount(amount, currency)}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {step === 'method' && (
              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-600 mb-2">Choisissez votre moyen de paiement</p>
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setStep(m.id === 'bank_transfer' ? 'details' : 'details'); }}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition text-left"
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${TONE[m.tone]} text-white flex items-center justify-center shadow-md`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-500">{m.sub}</p>
                    </div>
                    <div className="text-emerald-600 text-xs font-semibold">Choisir →</div>
                  </button>
                ))}
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Paiements sécurisés via FedaPay (PCI-DSS) · aucune donnée stockée en clair.
                </p>
              </div>
            )}

            {step === 'details' && method && (
              <div className="p-5 space-y-4">
                <button onClick={() => setStep('method')} className="text-xs text-slate-500 hover:text-slate-700">← Changer de moyen</button>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-200">
                  <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Récapitulatif</p>
                  <p className="font-bold text-slate-900 mt-1">{fmtAmount(amount, currency)}</p>
                  <p className="text-sm text-slate-700">{purpose}</p>
                  <p className="text-xs text-slate-500 mt-1">{METHODS.find((m) => m.id === method)?.label}</p>
                </div>

                {requiresPhone && (
                  <div>
                    <label className="text-xs font-medium text-slate-700">Numéro {method === 'wave' ? 'Wave' : 'Mobile Money'}</label>
                    <div className="relative mt-1">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+229 XX XX XX XX"
                        inputMode="tel"
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Vous recevrez une notification {method === 'wave' ? 'Wave' : 'USSD'} pour valider avec votre code PIN.
                    </p>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Numéro de carte</label>
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ''))}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        className="mt-1 w-full px-3 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={cardExp} onChange={(e) => setCardExp(e.target.value)} placeholder="MM/AA" className="px-3 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="CVC" className="px-3 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <p className="text-[11px] text-slate-500">3D Secure activé. Aucune donnée carte n'est stockée par Healthy Page.</p>
                  </div>
                )}

                {method === 'bank_transfer' && (
                  <div className="text-sm text-slate-700 space-y-2">
                    <p>Vous recevrez un IBAN dédié et une référence à indiquer dans le motif du virement.</p>
                    <p className="text-xs text-slate-500">Délai d'encaissement : 1 à 3 jours ouvrés.</p>
                  </div>
                )}

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 ring-1 ring-red-100">{error}</p>}

                <button
                  onClick={submit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 inline-flex items-center justify-center gap-2"
                >
                  Payer {fmtAmount(amount, currency)}
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  En continuant, vous acceptez les conditions générales de Healthy Page et de votre fournisseur de paiement.
                </p>
              </div>
            )}

            {step === 'processing' && (
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
                <h3 className="font-bold text-slate-900">Paiement en cours…</h3>
                {requiresPhone && (
                  <p className="text-sm text-slate-600">
                    Validez la demande sur votre téléphone (PIN {method === 'wave' ? 'Wave' : 'Mobile Money'}).
                  </p>
                )}
                {method === 'card' && record?.providerUrl && (
                  <a href={record.providerUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline">
                    Ouvrir la page sécurisée 3D Secure
                  </a>
                )}
                <p className="text-[11px] text-slate-500">
                  Réf. {record?.id?.slice(0, 8) ?? '—'}
                </p>
              </div>
            )}

            {step === 'bank' && record && (
              <div className="p-5 space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                  <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Coordonnées bancaires</p>
                  <p className="font-mono text-sm text-slate-900 mt-2">Bénéficiaire : Healthy Page SA</p>
                  <div className="flex items-center justify-between mt-1 bg-white rounded-lg p-2 ring-1 ring-emerald-200">
                    <p className="font-mono text-sm">BJ66 0000 0142 0033 7841 5687 13</p>
                    <button onClick={copyIban} className="p-1.5 rounded hover:bg-emerald-50">
                      <Copy className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-emerald-700 mt-1">IBAN copié !</p>}
                  <p className="font-mono text-xs text-slate-700 mt-2">BIC : ECOCBJBJ</p>
                  <p className="text-sm mt-3">Référence à indiquer : <span className="font-mono font-bold">HP-{record.id?.slice(0, 8).toUpperCase()}</span></p>
                </div>
                <p className="text-xs text-slate-600">
                  Le paiement sera marqué comme "en attente" jusqu'à réception. Vous pouvez fermer cette fenêtre.
                </p>
                <button onClick={onClose} className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold">J'ai effectué le virement</button>
              </div>
            )}

            {step === 'success' && (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Paiement confirmé</h3>
                  <p className="text-sm text-slate-600 mt-1">{fmtAmount(amount, currency)} · {purpose}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Reçu disponible dans Mes paiements.</p>
                </div>
                <button onClick={onClose} className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold">Fermer</button>
              </div>
            )}

            {step === 'failed' && (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <AlertTriangle className="w-9 h-9 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Paiement non abouti</h3>
                  <p className="text-sm text-slate-600 mt-1">{error || 'Vous pouvez réessayer avec un autre moyen.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={onClose} className="py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold">Fermer</button>
                  <button onClick={() => setStep('method')} className="py-3 rounded-2xl bg-emerald-600 text-white font-semibold">Réessayer</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
