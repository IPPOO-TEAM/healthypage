import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, X, Loader2, Save, AlertCircle } from 'lucide-react';
import { api } from './api';

interface Questionnaire {
  motif?: string;
  symptoms?: string[];
  duration?: string;
  pain?: number;
  fever?: boolean;
  allergies?: string;
  treatments?: string;
  pregnancy?: 'no' | 'yes' | 'unknown' | 'na';
  notes?: string;
  filledAt?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  rdv: { id: string | number; doctor?: string; specialty?: string; date?: string; time?: string; questionnaire?: Questionnaire };
  patientId: string;
  onSaved?: (q: Questionnaire) => void;
}

const SYMPTOMS = ['Fièvre', 'Toux', 'Maux de tête', 'Fatigue', 'Douleur', 'Nausée', 'Vertiges', 'Essoufflement', 'Éruption', 'Perte d\'appétit'];
const DURATIONS = ['< 24h', '1-3 jours', '3-7 jours', '1-4 sem.', '> 1 mois'];

export default function PreRdvQuestionnaireModal({ open, onClose, rdv, patientId, onSaved }: Props) {
  const [q, setQ] = useState<Questionnaire>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setQ(rdv.questionnaire ?? {});
  }, [open, rdv.questionnaire]);

  if (!open) return null;

  const toggleSymptom = (s: string) => {
    setQ((prev) => {
      const list = prev.symptoms ?? [];
      return { ...prev, symptoms: list.includes(s) ? list.filter((x) => x !== s) : [...list, s] };
    });
  };

  const save = async () => {
    if (!q.motif?.trim()) {
      setError('Indiquez le motif de la consultation.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Questionnaire = { ...q, filledAt: Date.now() };
      await api.updateRdv(patientId, String(rdv.id), { questionnaire: payload });
      onSaved?.(payload);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <header className="px-5 py-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest font-semibold">Questionnaire pré-RDV</p>
                <h2 className="font-bold truncate">{rdv.doctor ?? 'Préparez votre consultation'}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/15"><X className="w-5 h-5" /></button>
          </header>

          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="bg-indigo-50 rounded-xl p-3 flex gap-2 text-xs text-indigo-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Vos réponses aident le praticien à préparer la consultation. Confidentielles.</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Motif principal *</label>
              <textarea
                value={q.motif ?? ''}
                onChange={(e) => setQ({ ...q, motif: e.target.value })}
                rows={2}
                placeholder="Ex. mal de tête persistant depuis 3 jours…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={300}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Symptômes</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {SYMPTOMS.map((s) => {
                  const active = (q.symptoms ?? []).includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >{s}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Depuis quand ?</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setQ({ ...q, duration: d })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      q.duration === d ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Niveau de douleur : <span className="text-indigo-700 font-bold">{q.pain ?? 0}/10</span>
              </label>
              <input
                type="range" min={0} max={10} value={q.pain ?? 0}
                onChange={(e) => setQ({ ...q, pain: parseInt(e.target.value, 10) })}
                className="w-full mt-1 accent-indigo-600"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox" checked={!!q.fever}
                onChange={(e) => setQ({ ...q, fever: e.target.checked })}
                className="w-4 h-4 accent-indigo-600"
              />
              Fièvre {'>'} 38°C
            </label>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Allergies connues</label>
              <input
                value={q.allergies ?? ''}
                onChange={(e) => setQ({ ...q, allergies: e.target.value })}
                placeholder="Aucune / pénicilline, arachide…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Traitements en cours</label>
              <input
                value={q.treatments ?? ''}
                onChange={(e) => setQ({ ...q, treatments: e.target.value })}
                placeholder="Médicaments, posologie…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Grossesse</label>
              <div className="flex gap-1.5 mt-1.5">
                {([['na', 'N/A'], ['no', 'Non'], ['yes', 'Oui'], ['unknown', 'Possible']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setQ({ ...q, pregnancy: v })}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                      q.pregnancy === v ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes complémentaires</label>
              <textarea
                value={q.notes ?? ''}
                onChange={(e) => setQ({ ...q, notes: e.target.value })}
                rows={2}
                placeholder="Tout ce que le praticien doit savoir…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={500}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold">Plus tard</button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : <><Save className="w-4 h-4" /> Envoyer au praticien</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
