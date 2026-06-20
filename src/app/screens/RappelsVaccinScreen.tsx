import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Syringe, Plus, Calendar, AlertTriangle, CheckCircle2, Clock, Trash2, Loader2, Bell, Globe2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface Vaccin {
  id: string;
  name: string;
  doseLabel?: string;
  doseDate: string;
  nextDueDate?: string | null;
  lot?: string;
  site?: string;
  notes?: string;
  createdAt: string;
}

interface Props { onBack: () => void }

type ScheduleEntry = {
  name: string;
  group: 'Enfant (PEV Bénin)' | 'Adulte / rappel' | 'Voyage / saisonnier';
  doses: { label: string; offsetMonths?: number; recurrenceMonths?: number; description?: string }[];
};

const SCHEDULE: ScheduleEntry[] = [
  { name: 'BCG', group: 'Enfant (PEV Bénin)', doses: [{ label: 'Naissance', offsetMonths: 0 }] },
  { name: 'Hépatite B', group: 'Enfant (PEV Bénin)', doses: [{ label: 'Naissance + 6, 10, 14 sem.', offsetMonths: 0 }] },
  { name: 'Polio (VPO/VPI)', group: 'Enfant (PEV Bénin)', doses: [{ label: '6, 10, 14 sem.', offsetMonths: 1.5 }] },
  { name: 'Pentavalent (DTC-HepB-Hib)', group: 'Enfant (PEV Bénin)', doses: [{ label: '6, 10, 14 sem.', offsetMonths: 1.5 }] },
  { name: 'Pneumocoque (PCV)', group: 'Enfant (PEV Bénin)', doses: [{ label: '6, 10, 14 sem.', offsetMonths: 1.5 }] },
  { name: 'Rotavirus', group: 'Enfant (PEV Bénin)', doses: [{ label: '6 et 10 sem.', offsetMonths: 1.5 }] },
  { name: 'Rougeole-Rubéole (RR)', group: 'Enfant (PEV Bénin)', doses: [{ label: '9 et 15 mois', offsetMonths: 9 }] },
  { name: 'Fièvre jaune', group: 'Enfant (PEV Bénin)', doses: [{ label: '9 mois (à vie)', offsetMonths: 9 }] },
  { name: 'HPV', group: 'Enfant (PEV Bénin)', doses: [{ label: '9-14 ans', offsetMonths: 108 }] },
  { name: 'dTP (rappel adulte)', group: 'Adulte / rappel', doses: [{ label: 'Tous les 10 ans', recurrenceMonths: 120 }] },
  { name: 'Grippe saisonnière', group: 'Adulte / rappel', doses: [{ label: 'Annuel', recurrenceMonths: 12 }] },
  { name: 'COVID-19 (rappel)', group: 'Adulte / rappel', doses: [{ label: 'Selon recommandation', recurrenceMonths: 12 }] },
  { name: 'Méningite ACYW', group: 'Voyage / saisonnier', doses: [{ label: 'Sahel / pèlerinage' }] },
  { name: 'Typhoïde', group: 'Voyage / saisonnier', doses: [{ label: 'Tous les 3 ans', recurrenceMonths: 36 }] },
  { name: 'Rage', group: 'Voyage / saisonnier', doses: [{ label: 'Pré-exposition' }] },
  { name: 'Choléra', group: 'Voyage / saisonnier', doses: [{ label: 'Zones à risque' }] },
];

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const daysUntil = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  return Math.round((d - Date.now()) / (24 * 3600 * 1000));
};

const statusOf = (v: Vaccin): 'overdue' | 'soon' | 'ok' | 'done' => {
  const d = daysUntil(v.nextDueDate);
  if (d === null) return 'done';
  if (d < 0) return 'overdue';
  if (d <= 30) return 'soon';
  return 'ok';
};

export default function RappelsVaccinScreen({ onBack }: Props) {
  const pid = getPatientId() ?? '';
  const [list, setList] = useState<Vaccin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<null | { editing?: Vaccin; preset?: string }>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    if (!pid) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await api.listVaccins(pid);
      setList((r ?? []).sort((a, b) => (a.nextDueDate ?? '9999').localeCompare(b.nextDueDate ?? '9999')));
    } catch (e: any) {
      setError(e?.message ?? 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [pid]);

  const counts = useMemo(() => {
    let overdue = 0, soon = 0;
    for (const v of list) {
      const s = statusOf(v);
      if (s === 'overdue') overdue++;
      else if (s === 'soon') soon++;
    }
    return { overdue, soon, total: list.length };
  }, [list]);

  const remove = async (v: Vaccin) => {
    if (!confirm(`Supprimer « ${v.name} » ?`)) return;
    try {
      await api.deleteVaccin(pid, v.id);
      setList((l) => l.filter((x) => x.id !== v.id));
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const save = async (body: { id?: string; name: string; doseLabel?: string; doseDate: string; nextDueDate?: string | null; notes?: string; lot?: string }) => {
    setSaving(true);
    setError(null);
    try {
      await api.upsertVaccin(pid, body);
      const due = body.nextDueDate ? daysUntil(body.nextDueDate) : null;
      if (due !== null && due >= 0 && due <= 60) {
        await api.createNotification(pid, {
          title: `Rappel vaccin ${body.name}`,
          message: `Votre rappel ${body.doseLabel ?? ''} est prévu le ${fmtDate(body.nextDueDate)}.`,
          type: 'vaccin',
          icon: 'syringe',
          read: false,
          dueAt: body.nextDueDate,
        }).catch(() => null);
      }
      setShowForm(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-80">Prévention</p>
            <h1 className="font-bold text-lg">Rappels vaccinaux</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/15 rounded-xl p-2.5 text-center">
            <p className="text-[10px] uppercase opacity-80">Total</p>
            <p className="font-bold text-lg">{counts.total}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center">
            <p className="text-[10px] uppercase opacity-80">À venir</p>
            <p className="font-bold text-lg">{counts.soon}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center">
            <p className="text-[10px] uppercase opacity-80">En retard</p>
            <p className="font-bold text-lg">{counts.overdue}</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <button
          onClick={() => setShowForm({})}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold inline-flex items-center justify-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Enregistrer une dose
        </button>
        <p className="text-[11px] text-slate-500 text-center">Notifications créées automatiquement 60 jours avant le rappel.</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Chargement…</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          <Syringe className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm">Aucun vaccin enregistré.</p>
          <p className="text-xs mt-1">Choisissez un vaccin du calendrier ci-dessous pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((v) => {
            const s = statusOf(v);
            const dl = daysUntil(v.nextDueDate);
            const cfg = s === 'overdue' ? { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertTriangle, label: `En retard de ${Math.abs(dl ?? 0)}j` }
              : s === 'soon' ? { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Bell, label: `Dans ${dl}j` }
              : s === 'done' ? { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', icon: CheckCircle2, label: 'À jour' }
              : { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Clock, label: `Dans ${dl}j` };
            const Icon = cfg.icon;
            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-3 flex items-center gap-3 ${cfg.bg}`}
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <Syringe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{v.name}{v.doseLabel ? ` · ${v.doseLabel}` : ''}</p>
                  <p className="text-[11px] text-slate-600">Dose : {fmtDate(v.doseDate)}{v.nextDueDate ? ` · Rappel : ${fmtDate(v.nextDueDate)}` : ''}</p>
                  <p className={`text-[11px] font-medium ${cfg.text} inline-flex items-center gap-1 mt-0.5`}><Icon className="w-3 h-3" /> {cfg.label}</p>
                </div>
                <button onClick={() => setShowForm({ editing: v })} className="p-2 rounded-lg bg-white text-slate-700 hover:bg-emerald-50 text-xs">Modifier</button>
                <button onClick={() => remove(v)} className="p-2 rounded-lg bg-white text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2"><Globe2 className="w-4 h-4 text-emerald-600" /> Calendrier de référence</h3>
        <p className="text-[11px] text-slate-500 mt-1">PEV Bénin · OMS · voyage. Touchez un vaccin pour pré-remplir le formulaire.</p>
        {(['Enfant (PEV Bénin)', 'Adulte / rappel', 'Voyage / saisonnier'] as const).map((g) => (
          <div key={g} className="mt-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">{g}</p>
            <div className="flex flex-wrap gap-1.5">
              {SCHEDULE.filter((s) => s.group === g).map((s) => (
                <button
                  key={s.name}
                  onClick={() => setShowForm({ preset: s.name })}
                  className="px-2.5 py-1.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100"
                  title={s.doses.map((d) => d.label).join(' / ')}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <VaccinForm
            initial={showForm.editing}
            preset={showForm.preset}
            saving={saving}
            onClose={() => setShowForm(null)}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VaccinForm({
  initial,
  preset,
  saving,
  onClose,
  onSave,
}: {
  initial?: Vaccin;
  preset?: string;
  saving: boolean;
  onClose: () => void;
  onSave: (b: { id?: string; name: string; doseLabel?: string; doseDate: string; nextDueDate?: string | null; notes?: string; lot?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? preset ?? '');
  const [doseLabel, setDoseLabel] = useState(initial?.doseLabel ?? '');
  const [doseDate, setDoseDate] = useState(initial?.doseDate ?? today());
  const [nextDueDate, setNextDueDate] = useState(initial?.nextDueDate ?? '');
  const [lot, setLot] = useState(initial?.lot ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const submit = () => {
    if (!name || !doseDate) return;
    onSave({ id: initial?.id, name, doseLabel: doseLabel || undefined, doseDate, nextDueDate: nextDueDate || null, lot: lot || undefined, notes: notes || undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
      >
        <header className="px-5 py-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <p className="text-[11px] uppercase tracking-widest font-semibold">Vaccin</p>
          <h2 className="font-bold">{initial ? 'Modifier la dose' : 'Nouvelle dose'}</h2>
        </header>
        <div className="p-5 space-y-3">
          <Field label="Vaccin">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Rougeole-Rubéole" className={cls} />
          </Field>
          <Field label="Dose / numéro (optionnel)">
            <input value={doseLabel} onChange={(e) => setDoseLabel(e.target.value)} placeholder="Ex : 2e dose, rappel" className={cls} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date de la dose">
              <input type="date" value={doseDate} onChange={(e) => setDoseDate(e.target.value)} className={cls} />
            </Field>
            <Field label="Prochain rappel">
              <input type="date" value={nextDueDate ?? ''} onChange={(e) => setNextDueDate(e.target.value)} className={cls} />
            </Field>
          </div>
          <Field label="N° de lot (optionnel)">
            <input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="Ex : ABC1234" className={cls} />
          </Field>
          <Field label="Notes (optionnel)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={cls} placeholder="Centre, médecin, effets…" />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold disabled:opacity-60">Annuler</button>
            <button onClick={submit} disabled={saving || !name || !doseDate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : <><Calendar className="w-4 h-4" /> Enregistrer</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const cls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
