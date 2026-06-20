import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Users, Video, Plus, FileText, Stethoscope, Brain, Heart, Baby, Bone, Eye, Calendar, Clock, CheckCircle2, MessageSquare, Paperclip, ChevronRight, Sparkles, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type SpecialtyId = 'cardio' | 'neuro' | 'pediatrie' | 'ortho' | 'ophtalmo' | 'oncologie' | 'general' | 'psy';
type Status = 'brouillon' | 'planifié' | 'en cours' | 'terminé';
type Case = {
  id: string;
  title: string;
  symptom: string;
  patient: string;
  specialties: SpecialtyId[];
  proposedDate: string;
  status: Status;
  attachments: number;
  messages: number;
  conclusion?: string;
};

const SPECIALTIES: { id: SpecialtyId; label: string; icon: typeof Stethoscope }[] = [
  { id: 'general', label: 'Médecin généraliste', icon: Stethoscope },
  { id: 'cardio', label: 'Cardiologie', icon: Heart },
  { id: 'neuro', label: 'Neurologie', icon: Brain },
  { id: 'pediatrie', label: 'Pédiatrie', icon: Baby },
  { id: 'ortho', label: 'Orthopédie', icon: Bone },
  { id: 'ophtalmo', label: 'Ophtalmologie', icon: Eye },
  { id: 'oncologie', label: 'Oncologie', icon: Sparkles },
  { id: 'psy', label: 'Psychiatrie', icon: Brain }
];

const PROS = [
  { id: 'pr1', name: 'Dr. Adékunlé', specialty: 'cardio' as SpecialtyId, photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200' },
  { id: 'pr2', name: 'Dr. Mensah', specialty: 'neuro' as SpecialtyId, photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
  { id: 'pr3', name: 'Dr. Diallo', specialty: 'pediatrie' as SpecialtyId, photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200' },
  { id: 'pr4', name: 'Dr. Konaté', specialty: 'general' as SpecialtyId, photo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200' },
  { id: 'pr5', name: 'Dr. Sagbo', specialty: 'oncologie' as SpecialtyId, photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200' }
];

const STORAGE = 'healthy-page:codiag';
const load = (): Case[] => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } };
const save = (c: Case[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(c)); } catch {} };

const SAMPLE: Case[] = [
  {
    id: 's1', title: 'Douleurs thoraciques inhabituelles', patient: 'Jean K.',
    symptom: 'Patient 58 ans, douleurs thoraciques irradiantes, ECG limite, antécédents diabète type 2.',
    specialties: ['cardio', 'general'], proposedDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    status: 'planifié', attachments: 3, messages: 4
  },
  {
    id: 's2', title: 'Suspicion masse mammaire', patient: 'Aïssatou D.',
    symptom: 'Mammographie BI-RADS 4, biopsie en cours. Discussion plan thérapeutique.',
    specialties: ['oncologie', 'general'], proposedDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    status: 'terminé', attachments: 5, messages: 12,
    conclusion: 'Avis convergent : exérèse + radiothérapie adjuvante. Présentation au RCP de centre oncologique pour confirmation.'
  }
];

export default function CoDiagnosticScreen({ onBack }: Props) {
  const [cases, setCases] = useState<Case[]>(() => {
    const stored = load();
    return stored.length ? stored : SAMPLE;
  });
  const [creating, setCreating] = useState(false);
  const [openCase, setOpenCase] = useState<Case | null>(null);
  const [draft, setDraft] = useState({ title: '', symptom: '', patient: '', specialties: [] as SpecialtyId[], date: '' });

  useEffect(() => { save(cases); }, [cases]);

  const toggleSpec = (s: SpecialtyId) => {
    setDraft((d) => d.specialties.includes(s) ? { ...d, specialties: d.specialties.filter((x) => x !== s) } : { ...d, specialties: [...d.specialties, s] });
  };

  const submit = () => {
    if (!draft.title.trim() || !draft.symptom.trim() || draft.specialties.length < 2 || !draft.date) return;
    const c: Case = {
      id: Date.now().toString(),
      title: draft.title, patient: draft.patient || 'Anonyme',
      symptom: draft.symptom, specialties: draft.specialties,
      proposedDate: new Date(draft.date).toISOString(),
      status: 'planifié', attachments: 0, messages: 0
    };
    setCases((arr) => [c, ...arr]);
    setCreating(false);
    setDraft({ title: '', symptom: '', patient: '', specialties: [], date: '' });
  };

  const stats = useMemo(() => ({
    planned: cases.filter((c) => c.status === 'planifié').length,
    done: cases.filter((c) => c.status === 'terminé').length,
    inflight: cases.filter((c) => c.status === 'en cours').length
  }), [cases]);

  const statusBadge = (s: Status) => {
    const map: Record<Status, string> = {
      brouillon: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
      planifié: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
      'en cours': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
      terminé: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
    };
    return map[s];
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=1080" alt="Co-diagnostic" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Users className="w-5 h-5" /> Plateau co-diagnostic
          </div>
          <h2 className="text-2xl font-bold mt-1">Plusieurs spécialistes, un seul avis</h2>
          <p className="text-sm text-white/85 mt-1">Réunions de concertation pluridisciplinaire en visio</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Calendar className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{stats.planned}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">planifiés</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <Video className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{stats.inflight}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">en cours</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm text-center">
          <CheckCircle2 className="w-4 h-4 text-teal-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{stats.done}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">terminés</p>
        </div>
      </div>

      <button
        onClick={() => setCreating(true)}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Demander une concertation
      </button>

      <div className="space-y-3">
        {cases.map((c) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setOpenCase(c)}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-slate-100">{c.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Patient : {c.patient}</p>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{c.symptom}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {c.specialties.slice(0, 4).map((s) => {
                  const sp = SPECIALTIES.find((x) => x.id === s)!;
                  const Icon = sp.icon;
                  return (
                    <div key={s} title={sp.label} className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  );
                })}
                {c.specialties.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                    +{c.specialties.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><Paperclip className="w-3 h-3" />{c.attachments}</span>
                <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{c.messages}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(c.proposedDate).toLocaleDateString('fr-FR')}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Échanges chiffrés de bout en bout. Consentement patient obligatoire avant partage du dossier. Conclusion finale archivée dans le carnet de santé.</span>
      </div>

      <AnimatePresence>
        {creating && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreating(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Nouvelle concertation</h3>
                <button onClick={() => setCreating(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Titre du cas</span>
                  <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex. Tachycardie persistante" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Patient (initiales)</span>
                  <input value={draft.patient} onChange={(e) => setDraft({ ...draft, patient: e.target.value })} placeholder="Ex. M. K." className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Résumé clinique</span>
                  <textarea value={draft.symptom} onChange={(e) => setDraft({ ...draft, symptom: e.target.value })} rows={4} placeholder="Symptômes, antécédents, examens réalisés…" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </label>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">Spécialités à convoquer (≥ 2)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALTIES.map((s) => {
                      const Icon = s.icon;
                      const sel = draft.specialties.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSpec(s.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition ${
                            sel ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Date proposée</span>
                  <input type="datetime-local" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </label>
                <button
                  onClick={submit}
                  disabled={!draft.title.trim() || !draft.symptom.trim() || draft.specialties.length < 2 || !draft.date}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" /> Programmer la concertation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openCase && (() => {
          const inviteds = openCase.specialties.flatMap((sp) => PROS.filter((p) => p.specialty === sp));
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenCase(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{openCase.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Patient : {openCase.patient}</p>
                  </div>
                  <button onClick={() => setOpenCase(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">Résumé clinique</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 rounded-xl p-3">{openCase.symptom}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-2">Participants</p>
                    <div className="space-y-2">
                      {inviteds.length === 0 ? (
                        <p className="text-xs text-gray-500">Aucun praticien identifié pour ces spécialités.</p>
                      ) : inviteds.map((p) => {
                        const sp = SPECIALTIES.find((s) => s.id === p.specialty)!;
                        return (
                          <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                            <ImageWithFallback src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{p.name}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{sp.label}</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800/40 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Visio programmée</p>
                      <p className="text-sm font-bold text-teal-900 dark:text-teal-100">{new Date(openCase.proposedDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    {openCase.status !== 'terminé' && (
                      <button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md inline-flex items-center gap-1">
                        <Video className="w-4 h-4" /> Rejoindre
                      </button>
                    )}
                  </div>

                  {openCase.conclusion && (
                    <div className="border-l-4 border-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-r-xl p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-1">Conclusion du plateau</p>
                      <p className="text-sm text-teal-900 dark:text-teal-100">{openCase.conclusion}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300">
                      <Paperclip className="w-4 h-4 text-teal-600" /> Pièces ({openCase.attachments})
                    </button>
                    <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4 text-cyan-600" /> Messages ({openCase.messages})
                    </button>
                    <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300">
                      <FileText className="w-4 h-4 text-emerald-600" /> Compte-rendu
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
