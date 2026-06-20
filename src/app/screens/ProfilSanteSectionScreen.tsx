import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, Stethoscope, Bug, HeartPulse, Dna, ClipboardPlus, Ruler, FileQuestion, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface Item {
  id: string;
  section: string;
  label: string;
  detail?: string;
  date?: string;
  createdAt: string;
}

interface Props { onBack: () => void }

const SECTIONS: Record<string, { title: string; subtitle: string; placeholder: string; icon: typeof Stethoscope; color: string; presets?: string[] }> = {
  antecedents: {
    title: 'Antécédents médicaux',
    subtitle: 'Maladies passées ou chroniques diagnostiquées.',
    placeholder: 'Ex : Hypertension, Asthme, Drépanocytose…',
    icon: Stethoscope,
    color: 'from-pink-500 to-rose-500',
    presets: ['Hypertension', 'Diabète', 'Asthme', 'Drépanocytose', 'Paludisme récurrent', 'Hépatite B', 'Tuberculose'],
  },
  allergies: {
    title: 'Allergies',
    subtitle: 'Médicaments, aliments, environnement.',
    placeholder: 'Ex : Pénicilline, Arachides, Pollen…',
    icon: Bug,
    color: 'from-red-500 to-rose-600',
    presets: ['Pénicilline', 'Aspirine', 'Arachides', 'Fruits de mer', 'Lactose', 'Pollen', 'Poussière', 'Latex'],
  },
  habitudes: {
    title: 'Habitudes de vie',
    subtitle: 'Alimentation, activité, tabac, alcool, sommeil.',
    placeholder: 'Ex : Non-fumeur, sport 3x/sem, sommeil 7h…',
    icon: HeartPulse,
    color: 'from-amber-500 to-orange-500',
    presets: ['Non-fumeur', 'Fumeur', 'Alcool occasionnel', 'Activité physique régulière', 'Sédentaire', 'Régime végétarien', 'Sommeil 7-8h'],
  },
  familiaux: {
    title: 'Antécédents familiaux',
    subtitle: 'Maladies présentes chez les parents proches.',
    placeholder: 'Ex : HTA père, Diabète mère, AVC grand-père…',
    icon: Dna,
    color: 'from-teal-500 to-emerald-600',
    presets: ['HTA père', 'HTA mère', 'Diabète père', 'Diabète mère', 'Cancer du sein famille', 'AVC famille', 'Drépanocytose famille'],
  },
  chirurgie: {
    title: 'Opérations chirurgicales',
    subtitle: 'Interventions subies (avec date si possible).',
    placeholder: 'Ex : Appendicectomie, Césarienne…',
    icon: ClipboardPlus,
    color: 'from-rose-500 to-pink-600',
    presets: ['Appendicectomie', 'Césarienne', 'Hernie', 'Amygdalectomie', 'Vésicule biliaire', 'Fracture - ostéosynthèse'],
  },
  mesures: {
    title: 'Mesures',
    subtitle: 'Taille, poids, tension, glycémie, IMC.',
    placeholder: 'Ex : Taille 172cm, Poids 70kg, TA 12/8…',
    icon: Ruler,
    color: 'from-blue-500 to-indigo-600',
    presets: ['Taille', 'Poids', 'Tension artérielle', 'Glycémie à jeun', 'Tour de taille', 'Fréquence cardiaque'],
  },
  autres: {
    title: 'Autres informations',
    subtitle: 'Tout élément utile pour vos soignants.',
    placeholder: 'Ex : Don de sang O+, port de lentilles…',
    icon: FileQuestion,
    color: 'from-indigo-500 to-purple-600',
  },
};

export default function ProfilSanteSectionScreen({ onBack }: Props) {
  const params = useParams<{ section: string }>();
  const sectionId = params.section ?? 'autres';
  const cfg = SECTIONS[sectionId] ?? SECTIONS.autres;
  const Icon = cfg.icon;
  const pid = getPatientId() ?? '';

  const [all, setAll] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<null | Item | { new: true }>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    if (!pid) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await api.listProfilSante(pid);
      setAll(r ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [pid]);

  const items = useMemo(() => all.filter((i) => i.section === sectionId).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')), [all, sectionId]);

  const remove = async (it: Item) => {
    if (!confirm(`Supprimer « ${it.label} » ?`)) return;
    try {
      await api.deleteProfilSante(pid, it.id);
      setAll((l) => l.filter((x) => x.id !== it.id));
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const save = async (body: { id?: string; label: string; detail?: string; date?: string }) => {
    if (!body.label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.upsertProfilSante(pid, { ...body, section: sectionId });
      setEditing(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className={`bg-gradient-to-br ${cfg.color} text-white rounded-3xl p-5 shadow-lg`}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-80">Profil santé</p>
            <h1 className="font-bold text-lg">{cfg.title}</h1>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs">
          <Icon className="w-4 h-4" /> {cfg.subtitle}
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <button
          onClick={() => setEditing({ new: true })}
          className={`w-full py-3 rounded-2xl bg-gradient-to-r ${cfg.color} text-white font-semibold inline-flex items-center justify-center gap-2 shadow`}
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
        {cfg.presets && cfg.presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cfg.presets.map((p) => (
              <button
                key={p}
                onClick={() => setEditing({ new: true } as any)}
                className="px-2.5 py-1.5 rounded-full text-[11px] bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                onMouseDown={() => {/* preset filled via separate mechanism */}}
                onClickCapture={() => setEditing({ new: true, _preset: p } as any)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Chargement…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          <Icon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm">Aucun élément pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900">{it.label}</p>
                {it.detail && <p className="text-[12px] text-slate-600 mt-0.5">{it.detail}</p>}
                {it.date && <p className="text-[11px] text-slate-400 mt-0.5">{new Date(it.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
              </div>
              <button onClick={() => setEditing(it)} className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100" aria-label="Modifier"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(it)} className="p-2 rounded-lg bg-slate-50 text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <SectionForm
            placeholder={cfg.placeholder}
            initial={'id' in (editing as any) ? (editing as Item) : undefined}
            preset={(editing as any)?._preset}
            saving={saving}
            onClose={() => setEditing(null)}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionForm({
  placeholder,
  initial,
  preset,
  saving,
  onClose,
  onSave,
}: {
  placeholder: string;
  initial?: Item;
  preset?: string;
  saving: boolean;
  onClose: () => void;
  onSave: (b: { id?: string; label: string; detail?: string; date?: string }) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? preset ?? '');
  const [detail, setDetail] = useState(initial?.detail ?? '');
  const [date, setDate] = useState(initial?.date ?? '');

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
        <header className="px-5 py-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <p className="text-[11px] uppercase tracking-widest font-semibold">Profil santé</p>
          <h2 className="font-bold">{initial ? 'Modifier' : 'Ajouter'}</h2>
        </header>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 block">Intitulé</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 block">Détail (optionnel)</span>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} placeholder="Précisions, valeur, contexte…" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 block">Date (optionnel)</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold disabled:opacity-60">Annuler</button>
            <button onClick={() => onSave({ id: initial?.id, label, detail: detail || undefined, date: date || undefined })} disabled={saving || !label.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
