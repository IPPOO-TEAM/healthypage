import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Clock, FileText, Camera, X, Plus, TrendingUp, AlertCircle, Trash2, Download, Building2, Calendar, Wallet, Receipt, Search, Stethoscope, FlaskConical, Scan, Pill, Hospital, Smile, Glasses, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import TiersPayantModal from '../components/TiersPayantModal';

interface Props { onBack: () => void; }

type Status = 'pending' | 'verified' | 'reimbursed' | 'rejected';
type ClaimType = 'consultation' | 'analyse' | 'imagerie' | 'pharmacie' | 'hospitalisation' | 'dentaire' | 'optique' | 'autre';

interface Demande {
  id: number;
  type: string;
  category: ClaimType;
  date: string;
  amountCents: number;
  reimbursedCents?: number;
  status: Status;
  provider?: string;
  policyId: string;
  notes?: string;
  fileName?: string;
  fileDataUrl?: string;
  tiersPayant?: boolean;
  patientShareCents?: number;
  history: { at: string; label: string }[];
}

interface Policy {
  id: string;
  name: string;
  insurer: string;
  ratePct: number;
  ceilingCents: number;
  validUntil: string;
  cardNumber: string;
}

const CATEGORIES: { id: ClaimType; label: string; icon: LucideIcon }[] = [
  { id: 'consultation', label: 'Consultation', icon: Stethoscope },
  { id: 'analyse', label: 'Analyses', icon: FlaskConical },
  { id: 'imagerie', label: 'Imagerie', icon: Scan },
  { id: 'pharmacie', label: 'Pharmacie', icon: Pill },
  { id: 'hospitalisation', label: 'Hospitalisation', icon: Hospital },
  { id: 'dentaire', label: 'Dentaire', icon: Smile },
  { id: 'optique', label: 'Optique', icon: Glasses },
  { id: 'autre', label: 'Autre', icon: FileText }
];

const DEFAULT_POLICIES: Policy[] = [
  { id: 'p1', name: 'Famille Confort', insurer: 'NSIA Assurances', ratePct: 80, ceilingCents: 250000000, validUntil: '2026-12-31', cardNumber: 'NSIA-2026-04481' },
  { id: 'p2', name: 'Hospi Plus', insurer: 'Saham', ratePct: 100, ceilingCents: 500000000, validUntil: '2026-09-30', cardNumber: 'SAH-AX-77821' }
];

const INITIAL: Demande[] = [
  { id: 1, type: 'Consultation cardiologue', category: 'consultation', date: '2026-03-15', amountCents: 2500000, reimbursedCents: 2000000, status: 'reimbursed', provider: 'Clinique Atlantique', policyId: 'p1',
    history: [
      { at: '2026-03-15', label: 'Demande déposée' },
      { at: '2026-03-17', label: 'Pièce vérifiée' },
      { at: '2026-03-21', label: 'Remboursement de 20 000 FCFA (80%)' }
    ] },
  { id: 2, type: 'Analyses sanguines (NFS, glycémie)', category: 'analyse', date: '2026-03-28', amountCents: 1850000, status: 'verified', provider: 'Laboratoire Pasteur', policyId: 'p1',
    history: [
      { at: '2026-03-28', label: 'Demande déposée' },
      { at: '2026-03-30', label: 'Pièce vérifiée, virement programmé' }
    ] },
  { id: 3, type: 'Radiographie thoracique', category: 'imagerie', date: '2026-02-15', amountCents: 3200000, status: 'pending', provider: 'CHU Cotonou', policyId: 'p1',
    history: [{ at: '2026-02-15', label: 'Demande déposée, en attente de vérification' }] }
];

const STATUS_META: Record<Status, { label: string; tone: string; bar: string; icon: typeof Clock }> = {
  pending: { label: 'En vérification', tone: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', icon: Clock },
  verified: { label: 'Vérifiée', tone: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', icon: CheckCircle2 },
  reimbursed: { label: 'Remboursée', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Rejetée', tone: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', icon: AlertCircle }
};

const STORAGE_DEM = 'healthy-page:assurances-demandes';
const STORAGE_POL = 'healthy-page:assurances-policies';

const fmtFCFA = (cents: number) => `${Math.round(cents / 100).toLocaleString('fr-FR')} FCFA`;
const today = () => new Date().toISOString().slice(0, 10);

const loadJSON = <T,>(k: string, fb: T): T => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const saveJSON = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default function AssurancesScreen({ onBack }: Props) {
  const [list, setList] = useState<Demande[]>(() => loadJSON<Demande[]>(STORAGE_DEM, isDemoPatient() ? INITIAL : []));
  const [policies, setPolicies] = useState<Policy[]>(() => loadJSON<Policy[]>(STORAGE_POL, DEFAULT_POLICIES));
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showTP, setShowTP] = useState(false);
  const [detail, setDetail] = useState<Demande | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState({
    type: '', category: 'consultation' as ClaimType, date: today(), amount: '', provider: '', policyId: policies[0]?.id || '', notes: '',
    fileName: '' as string | undefined, fileDataUrl: '' as string | undefined
  });

  useEffect(() => saveJSON(STORAGE_DEM, list), [list]);
  useEffect(() => saveJSON(STORAGE_POL, policies), [policies]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, fileName: f.name, fileDataUrl: typeof reader.result === 'string' ? reader.result : '' }));
      setUploading(false);
      setShowForm(true);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const submitClaim = () => {
    const amountCents = Math.round(parseFloat(draft.amount.replace(',', '.')) * 100) || 0;
    if (!draft.type.trim() || amountCents <= 0 || !draft.policyId) return;
    const cat = CATEGORIES.find((c) => c.id === draft.category)!;
    const newOne: Demande = {
      id: Date.now(),
      type: draft.type.trim(),
      category: draft.category,
      date: draft.date,
      amountCents,
      status: 'pending',
      provider: draft.provider.trim() || undefined,
      policyId: draft.policyId,
      notes: draft.notes.trim() || undefined,
      fileName: draft.fileName,
      fileDataUrl: draft.fileDataUrl,
      history: [{ at: today(), label: `Demande déposée, ${cat.label}` }]
    };
    setList((l) => [newOne, ...l]);
    setDraft({ type: '', category: 'consultation', date: today(), amount: '', provider: '', policyId: policies[0]?.id || '', notes: '', fileName: undefined, fileDataUrl: undefined });
    setShowForm(false);
  };

  const advance = (d: Demande) => {
    const policy = policies.find((p) => p.id === d.policyId);
    setList((l) => l.map((x) => {
      if (x.id !== d.id) return x;
      if (x.status === 'pending') return { ...x, status: 'verified', history: [...x.history, { at: today(), label: 'Pièce vérifiée, paiement programmé' }] };
      if (x.status === 'verified') {
        const reimbursedCents = Math.round((x.amountCents * (policy?.ratePct ?? 70)) / 100);
        return { ...x, status: 'reimbursed', reimbursedCents, history: [...x.history, { at: today(), label: `Remboursement de ${fmtFCFA(reimbursedCents)} (${policy?.ratePct ?? 70}%)` }] };
      }
      return x;
    }));
  };

  const rejectOne = (d: Demande) => {
    setList((l) => l.map((x) => x.id === d.id ? { ...x, status: 'rejected', history: [...x.history, { at: today(), label: 'Demande rejetée, pièce illisible' }] } : x));
  };

  const removeOne = (id: number) => setList((l) => l.filter((x) => x.id !== id));

  const counts = useMemo(() => {
    const c: Record<Status, number> = { pending: 0, verified: 0, reimbursed: 0, rejected: 0 };
    list.forEach((d) => { c[d.status]++; });
    return c;
  }, [list]);

  const totals = useMemo(() => {
    const submitted = list.reduce((s, d) => s + d.amountCents, 0);
    const reimbursed = list.reduce((s, d) => s + (d.reimbursedCents || 0), 0);
    const pending = list.filter((d) => d.status !== 'rejected' && d.status !== 'reimbursed').reduce((s, d) => s + d.amountCents, 0);
    return { submitted, reimbursed, pending };
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (filter !== 'all' && d.status !== filter) return false;
      if (query && !(d.type.toLowerCase().includes(query.toLowerCase()) || (d.provider || '').toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [list, filter, query]);

  const exportCsv = () => {
    const header = 'Date;Type;Catégorie;Prestataire;Montant FCFA;Remboursé FCFA;Statut\n';
    const rows = list.map((d) => [d.date, d.type, d.category, d.provider || '', Math.round(d.amountCents / 100), Math.round((d.reimbursedCents || 0) / 100), STATUS_META[d.status].label].join(';')).join('\n');
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'demandes-assurance.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1643818650011-93880bbe1ec2?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl"><ShieldCheck className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Assurances & remboursements</h2>
              <p className="text-sm text-white/85">Suivez vos demandes en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {policies.map((p) => {
          const usedCents = list.filter((d) => d.policyId === p.id && d.status === 'reimbursed').reduce((s, d) => s + (d.reimbursedCents || 0), 0);
          const pct = Math.min(100, Math.round((usedCents / p.ceilingCents) * 100));
          return (
            <div key={p.id} className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/80 flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.insurer}</p>
                  <p className="font-bold text-lg mt-0.5">{p.name}</p>
                  <p className="text-[11px] text-white/80 mt-0.5">N° {p.cardNumber} · valable jusqu'au {p.validUntil}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-white/80">Taux</p>
                  <p className="font-bold text-2xl">{p.ratePct}%</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-white/85 mb-1">
                  <span>Plafond utilisé</span>
                  <span>{fmtFCFA(usedCents)} / {fmtFCFA(p.ceilingCents)}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 flex items-center gap-1"><Receipt className="w-3 h-3" /> Soumis</p>
          <p className="font-bold text-gray-900 mt-0.5">{fmtFCFA(totals.submitted)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3" /> Remboursé</p>
          <p className="font-bold text-emerald-700 mt-0.5">{fmtFCFA(totals.reimbursed)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</p>
          <p className="font-bold text-amber-700 mt-0.5">{fmtFCFA(totals.pending)}</p>
        </div>
      </div>

      <button
        onClick={() => setShowTP(true)}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3.5 rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" /> Tiers-payant automatisé
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
          {uploading ? <><Clock className="w-5 h-5 animate-spin" /> Chargement…</> : <><Camera className="w-5 h-5" /> Photo / scan</>}
        </button>
        <button onClick={() => setShowForm(true)} className="bg-white border border-teal-200 text-teal-700 py-3 rounded-2xl font-semibold shadow-sm flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Saisie manuelle
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPickFile} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par type ou prestataire" className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'verified', 'reimbursed', 'rejected'] as const).map((s) => {
            const sel = filter === s;
            const lbl = s === 'all' ? `Toutes (${list.length})` : `${STATUS_META[s].label} (${counts[s]})`;
            return (
              <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full border transition ${sel ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>{lbl}</button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Mes demandes</h3>
          {list.length > 0 && (
            <button onClick={exportCsv} className="text-xs text-teal-700 font-medium inline-flex items-center gap-1"><Download className="w-3 h-3" /> Exporter CSV</button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{list.length === 0 ? 'Aucune demande pour le moment.' : 'Aucun résultat avec ces filtres.'}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((d) => {
              const st = STATUS_META[d.status];
              const Icon = st.icon;
              const cat = CATEGORIES.find((c) => c.id === d.category);
              const policy = policies.find((p) => p.id === d.policyId);
              const pct = d.reimbursedCents ? Math.round((d.reimbursedCents / d.amountCents) * 100) : 0;
              return (
                <motion.button
                  key={d.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setDetail(d)}
                  className="w-full text-left bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:border-teal-200 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-50 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">{cat ? <cat.icon className="w-5 h-5 text-teal-700" strokeWidth={1.75} /> : null}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {d.type}
                          {d.tiersPayant && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                              <Sparkles className="w-2.5 h-2.5" /> TP
                            </span>
                          )}
                        </p>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 border text-[10px] px-2 py-0.5 rounded-full ${st.tone}`}>
                          <Icon className="w-3 h-3" />{st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{d.date}{d.provider ? ` · ${d.provider}` : ''}{policy ? ` · ${policy.insurer}` : ''}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-sm font-bold text-gray-900">{fmtFCFA(d.amountCents)}</p>
                        {d.reimbursedCents != null && d.reimbursedCents > 0 && (
                          <p className="text-xs text-emerald-700 font-semibold">+{fmtFCFA(d.reimbursedCents)} ({pct}%)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Nouvelle demande</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="px-5 py-4 overflow-y-auto space-y-3">
                {draft.fileDataUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 relative">
                    {draft.fileDataUrl.startsWith('data:image') ? (
                      <img src={draft.fileDataUrl} alt="aperçu" className="w-full max-h-48 object-cover" />
                    ) : (
                      <div className="p-4 bg-gray-50 text-sm text-gray-600 inline-flex items-center gap-2"><FileText className="w-4 h-4" /> {draft.fileName}</div>
                    )}
                    <button onClick={() => setDraft((d) => ({ ...d, fileDataUrl: undefined, fileName: undefined }))} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Catégorie</label>
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setDraft((d) => ({ ...d, category: c.id }))} className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl border text-[10px] ${draft.category === c.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
                        <c.icon className="w-5 h-5" strokeWidth={1.75} />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Intitulé</label>
                  <input value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} placeholder="Ex. Consultation pédiatre" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</label>
                    <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Montant (FCFA)</label>
                    <input type="number" inputMode="numeric" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} placeholder="25000" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Prestataire</label>
                  <input value={draft.provider} onChange={(e) => setDraft((d) => ({ ...d, provider: e.target.value }))} placeholder="Ex. Clinique Atlantique" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Police</label>
                  <select value={draft.policyId} onChange={(e) => setDraft((d) => ({ ...d, policyId: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {policies.map((p) => <option key={p.id} value={p.id}>{p.insurer}, {p.name} ({p.ratePct}%)</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Notes</label>
                  <textarea value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="Précisions, médecin référent…" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {!draft.fileDataUrl && (
                  <button onClick={() => fileRef.current?.click()} className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-300 text-teal-700 text-sm font-medium inline-flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Joindre un justificatif
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Annuler</button>
                <button onClick={submitClaim} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-sm">Déposer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detail && (() => {
          const st = STATUS_META[detail.status];
          const Icon = st.icon;
          const cat = CATEGORIES.find((c) => c.id === detail.category);
          const policy = policies.find((p) => p.id === detail.policyId);
          return (
            <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)}>
              <motion.div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-5 relative">
                  <button onClick={() => setDetail(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                  <p className="text-xs uppercase tracking-wide opacity-90">{cat?.label}</p>
                  <h3 className="font-bold text-lg mt-0.5">{detail.type}</h3>
                  <span className={`mt-2 inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full`}>
                    <Icon className="w-3 h-3" /> {st.label}
                  </span>
                </div>
                <div className="px-5 py-4 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-[10px] uppercase text-gray-500">Date</p><p className="font-medium text-gray-900">{detail.date}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-500">Montant</p><p className="font-medium text-gray-900">{fmtFCFA(detail.amountCents)}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-500">Prestataire</p><p className="font-medium text-gray-900">{detail.provider || ', '}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-500">Police</p><p className="font-medium text-gray-900">{policy?.name || ', '}</p></div>
                  </div>

                  {detail.reimbursedCents != null && detail.reimbursedCents > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Remboursé</span>
                        <span className="font-bold text-emerald-800">{fmtFCFA(detail.reimbursedCents)}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.round((detail.reimbursedCents / detail.amountCents) * 100)}%` }}></div>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">Reste à charge : {fmtFCFA(detail.amountCents, detail.reimbursedCents)}</p>
                    </div>
                  )}

                  {detail.notes && (
                    <div className="bg-gray-50 rounded-2xl p-3 text-sm text-gray-700">{detail.notes}</div>
                  )}

                  {detail.fileDataUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      {detail.fileDataUrl.startsWith('data:image') ? (
                        <img src={detail.fileDataUrl} alt={detail.fileName} className="w-full max-h-72 object-contain bg-gray-50" />
                      ) : (
                        <a href={detail.fileDataUrl} download={detail.fileName} className="flex items-center gap-2 p-3 text-sm text-teal-700"><FileText className="w-4 h-4" /> {detail.fileName}</a>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Suivi</p>
                    <ol className="space-y-2">
                      {detail.history.map((h, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5"></div>
                            {i < detail.history.length - 1 && <div className="w-0.5 flex-1 bg-teal-100 my-1"></div>}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{h.at}</p>
                            <p className="text-sm text-gray-800">{h.label}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {detail.status !== 'reimbursed' && detail.status !== 'rejected' && (
                      <button onClick={() => { advance(detail); setDetail(null); }} className="text-xs px-3 py-1.5 rounded-full bg-teal-600 text-white inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {detail.status === 'pending' ? 'Marquer vérifiée' : 'Marquer remboursée'}
                      </button>
                    )}
                    {detail.status === 'pending' && (
                      <button onClick={() => { rejectOne(detail); setDetail(null); }} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-700 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Rejeter
                      </button>
                    )}
                    <button onClick={() => { removeOne(detail.id); setDetail(null); }} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 inline-flex items-center gap-1 ml-auto">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <TiersPayantModal
        open={showTP}
        onClose={() => setShowTP(false)}
        policies={policies.map((p) => ({ id: p.id, name: p.name, insurer: p.insurer, ratePct: p.ratePct, ceilingCents: p.ceilingCents, cardNumber: p.cardNumber }))}
        categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        usedCentsByPolicy={policies.reduce((acc, p) => {
          acc[p.id] = list.filter((d) => d.policyId === p.id && (d.status === 'reimbursed' || d.tiersPayant)).reduce((s, d) => s + (d.reimbursedCents ?? 0), 0);
          return acc;
        }, {} as Record<string, number>)}
        onAccepted={({ policyId, category, type, provider, amountCents, insurerCents, patientCents, paymentRef }) => {
          const t = today();
          const newOne: Demande = {
            id: Date.now(),
            type,
            category: category as ClaimType,
            date: t,
            amountCents,
            reimbursedCents: insurerCents,
            status: 'reimbursed',
            provider,
            policyId,
            tiersPayant: true,
            patientShareCents: patientCents,
            history: [
              { at: t, label: `Tiers-payant accepté · ${fmtFCFA(amountCents)}` },
              { at: t, label: `Part patient ${fmtFCFA(patientCents)}${paymentRef ? ` · ref ${paymentRef}` : ''}` },
              { at: t, label: `Assureur règle directement ${fmtFCFA(insurerCents)} au prestataire` }
            ]
          };
          setList((l) => [newOne, ...l]);
        }}
      />
    </div>
  );
}
