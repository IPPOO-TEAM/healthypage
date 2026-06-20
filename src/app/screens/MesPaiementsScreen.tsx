import { useEffect, useState } from 'react';
import { ArrowLeft, Wallet, CheckCircle2, Clock, AlertTriangle, RefreshCw, Smartphone, CreditCard, Building2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface Props { onBack: () => void; }

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  purpose: string;
  createdAt: string;
  providerUrl?: string;
  mocked?: boolean;
}

const methodIcon = (m: string) => {
  if (m === 'card') return CreditCard;
  if (m === 'bank_transfer') return Building2;
  return Smartphone;
};

const methodLabel = (m: string) => ({
  mtn_momo: 'MTN Mobile Money',
  orange_money: 'Orange Money',
  moov_money: 'Moov Money',
  wave: 'Wave',
  card: 'Carte bancaire',
  bank_transfer: 'Virement bancaire',
} as Record<string, string>)[m] ?? m;

const statusBadge = (s: Payment['status']) => {
  const map: Record<Payment['status'], { label: string; cls: string; Icon: any }> = {
    succeeded: { label: 'Payé', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: CheckCircle2 },
    processing: { label: 'En cours', cls: 'bg-amber-50 text-amber-700 ring-amber-200', Icon: Clock },
    pending: { label: 'En attente', cls: 'bg-slate-50 text-slate-700 ring-slate-200', Icon: Clock },
    failed: { label: 'Échoué', cls: 'bg-rose-50 text-rose-700 ring-rose-200', Icon: AlertTriangle },
    cancelled: { label: 'Annulé', cls: 'bg-slate-50 text-slate-500 ring-slate-200', Icon: AlertTriangle },
    refunded: { label: 'Remboursé', cls: 'bg-blue-50 text-blue-700 ring-blue-200', Icon: RefreshCw },
  };
  return map[s] ?? map.pending;
};

const fmtAmount = (n: number, ccy: string) => `${new Intl.NumberFormat('fr-FR').format(n)} ${ccy}`;
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};

export default function MesPaiementsScreen({ onBack }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const pid = getPatientId();
    if (!pid) { setPayments([]); setLoading(false); return; }
    try {
      const list = await api.listPayments(pid);
      setPayments((list ?? []) as Payment[]);
    } catch (e) {
      console.error('listPayments failed', e);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, []);

  const totalPaid = payments.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0);

  const downloadReceipt = (p: Payment) => {
    const txt = [
      'HEALTHY PAGE — Reçu de paiement',
      '================================',
      `Référence  : ${p.id}`,
      `Date       : ${fmtDate(p.createdAt)}`,
      `Motif      : ${p.purpose}`,
      `Méthode    : ${methodLabel(p.method)}`,
      `Montant    : ${fmtAmount(p.amount, p.currency)}`,
      `Statut     : ${statusBadge(p.status).label}`,
      '',
      p.mocked ? '(Transaction de démonstration)' : '',
    ].filter(Boolean).join('\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `recu-${p.id.slice(0, 8)}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mes paiements</h2>
            <p className="text-sm text-white/80">Consultations, ordonnances, abonnements</p>
          </div>
          <div className="bg-white/15 p-3 rounded-2xl"><Wallet className="w-6 h-6" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3">
            <p className="text-[11px] uppercase tracking-widest text-white/70">Payé</p>
            <p className="font-bold text-lg">{fmtAmount(totalPaid, 'XOF')}</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3">
            <p className="text-[11px] uppercase tracking-widest text-white/70">En attente</p>
            <p className="font-bold text-lg">{fmtAmount(totalPending, 'XOF')}</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-sm text-slate-500 py-6">Chargement…</p>}

      {!loading && payments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-700">Aucun paiement pour le moment.</p>
          <p className="text-xs text-slate-500 mt-1">Vos consultations et ordonnances apparaîtront ici.</p>
        </div>
      )}

      <div className="space-y-3">
        {payments.map((p) => {
          const Icon = methodIcon(p.method);
          const badge = statusBadge(p.status);
          const Badge = badge.Icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{p.purpose}</p>
                  <p className="text-xs text-slate-500 truncate">{methodLabel(p.method)} · {fmtDate(p.createdAt)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${badge.cls}`}>
                      <Badge className="w-3 h-3" /> {badge.label}
                    </span>
                    {p.mocked && (
                      <span className="text-[10px] text-slate-400 italic">(démo)</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{fmtAmount(p.amount, p.currency)}</p>
                  {p.status === 'succeeded' && (
                    <button onClick={() => downloadReceipt(p)} className="mt-1 text-xs text-emerald-700 hover:underline inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> Reçu
                    </button>
                  )}
                  {(p.status === 'processing' || p.status === 'pending') && p.providerUrl && (
                    <a href={p.providerUrl} target="_blank" rel="noreferrer" className="mt-1 text-xs text-emerald-700 hover:underline">
                      Reprendre →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
