import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Users, Plus, Trash2, Heart, Baby, User as UserIcon, UserCog, Pill, Calendar, AlertCircle, ShieldCheck, Phone, Edit3, Syringe, Stethoscope, Bell, X, Download, ChevronDown, ChevronUp, Activity, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type Relation = 'conjoint' | 'enfant' | 'parent' | 'fratrie' | 'autre';
type Sex = 'F' | 'M' | ', ';

type Vaccination = { id: string; label: string; date: string; nextAt?: string };
type Appointment = { id: string; label: string; at: string; provider?: string };
type Medication = { id: string; label: string; dose: string; freq: string; until?: string };
type Measure = { id: string; date: string; weightKg?: number; heightCm?: number; tempC?: number; note?: string };

type Member = {
  id: string;
  name: string;
  relation: Relation;
  sex: Sex;
  dob: string;
  blood?: string;
  allergies?: string;
  conditions?: string;
  phone?: string;
  shareRdv: boolean;
  shareMeds: boolean;
  shareAlerts: boolean;
  vaccinations: Vaccination[];
  appointments: Appointment[];
  medications: Medication[];
  measures: Measure[];
};

const STORAGE = 'healthy-page:famille';
const MAX_MEMBERS = 8;

const RELATIONS: { id: Relation; label: string; icon: typeof UserIcon }[] = [
  { id: 'conjoint', label: 'Conjoint·e', icon: Heart },
  { id: 'enfant', label: 'Enfant', icon: Baby },
  { id: 'parent', label: 'Parent (âgé)', icon: UserCog },
  { id: 'fratrie', label: 'Fratrie', icon: UserIcon },
  { id: 'autre', label: 'Autre proche', icon: UserIcon }
];

const blankMember = (): Omit<Member, 'id'> => ({
  name: '', relation: 'enfant', sex: ', ', dob: '', blood: '', allergies: '', conditions: '', phone: '',
  shareRdv: true, shareMeds: true, shareAlerts: true,
  vaccinations: [], appointments: [], medications: [], measures: []
});

const load = (): Member[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || '[]') as Member[];
    return raw.map((m) => ({
      ...blankMember(),
      ...m,
      vaccinations: m.vaccinations || [],
      appointments: m.appointments || [],
      medications: m.medications || [],
      measures: m.measures || []
    }));
  } catch { return []; }
};
const save = (m: Member[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(m)); } catch {} };

const today = () => new Date().toISOString().slice(0, 10);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const ageOf = (dob: string) => {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  if (years < 1) {
    const months = Math.floor(diff / (30.44 * 24 * 3600 * 1000));
    return `${months} mois`;
  }
  return `${years} ans`;
};

const daysUntil = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.ceil((d.getTime() - Date.now()) / (24 * 3600 * 1000));
};

export default function CarnetFamilialScreen({ onBack }: Props) {
  const [members, setMembers] = useState<Member[]>(() => load());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Member, 'id'>>(blankMember());
  const [openId, setOpenId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<string, 'vac' | 'rdv' | 'med' | 'mes' | null>>({});
  const [emergencyId, setEmergencyId] = useState<string | null>(null);

  useEffect(() => { save(members); }, [members]);

  const slotsLeft = MAX_MEMBERS - members.length;

  const openCreate = () => {
    setDraft(blankMember());
    setEditingId(null);
    setEditorOpen(true);
  };

  const openEdit = (m: Member) => {
    const { id, ...rest } = m;
    setDraft(rest);
    setEditingId(id);
    setEditorOpen(true);
  };

  const submit = () => {
    if (!draft.name.trim() || !draft.dob.trim()) return;
    if (editingId) {
      setMembers((arr) => arr.map((x) => x.id === editingId ? { ...draft, id: editingId } : x));
    } else {
      setMembers((arr) => [{ ...draft, id: newId() }, ...arr]);
    }
    setEditorOpen(false);
    setEditingId(null);
    setDraft(blankMember());
  };

  const remove = (id: string) => {
    if (!confirm('Retirer ce membre du carnet familial ?')) return;
    setMembers((arr) => arr.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, patch: Partial<Member>) => {
    setMembers((arr) => arr.map((m) => m.id === id ? { ...m, ...patch } : m));
  };

  const addVaccination = (m: Member, label: string, date: string, nextAt?: string) => {
    if (!label.trim() || !date) return;
    updateMember(m.id, { vaccinations: [{ id: newId(), label: label.trim(), date, nextAt: nextAt || undefined }, ...m.vaccinations] });
  };
  const addAppointment = (m: Member, label: string, at: string, provider?: string) => {
    if (!label.trim() || !at) return;
    updateMember(m.id, { appointments: [{ id: newId(), label: label.trim(), at, provider }, ...m.appointments] });
  };
  const addMedication = (m: Member, label: string, dose: string, freq: string, until?: string) => {
    if (!label.trim()) return;
    updateMember(m.id, { medications: [{ id: newId(), label: label.trim(), dose, freq, until }, ...m.medications] });
  };
  const addMeasure = (m: Member, mes: Omit<Measure, 'id'>) => {
    updateMember(m.id, { measures: [{ id: newId(), ...mes }, ...m.measures] });
  };

  const removeFromList = <K extends 'vaccinations' | 'appointments' | 'medications' | 'measures'>(m: Member, key: K, id: string) => {
    updateMember(m.id, { [key]: (m[key] as any[]).filter((x) => x.id !== id) } as Partial<Member>);
  };

  const stats = useMemo(() => ({
    total: members.length,
    enfants: members.filter((m) => m.relation === 'enfant').length,
    seniors: members.filter((m) => m.relation === 'parent').length
  }), [members]);

  const upcoming = useMemo(() => {
    type Item = { id: string; member: Member; kind: 'vaccin' | 'rdv'; label: string; date: string; days: number };
    const items: Item[] = [];
    for (const m of members) {
      for (const v of m.vaccinations) if (v.nextAt) {
        items.push({ id: `${m.id}-${v.id}`, member: m, kind: 'vaccin', label: `Rappel ${v.label}`, date: v.nextAt, days: daysUntil(v.nextAt) });
      }
      for (const r of m.appointments) {
        items.push({ id: `${m.id}-${r.id}`, member: m, kind: 'rdv', label: r.label, date: r.at, days: daysUntil(r.at) });
      }
    }
    return items.filter((x) => x.days >= -1 && x.days <= 60).sort((a, b) => a.days - b.days).slice(0, 6);
  }, [members]);

  const exportCard = (m: Member) => {
    const lines = [
      `FICHE D'URGENCE, ${m.name}`,
      `Lien : ${RELATIONS.find((r) => r.id === m.relation)?.label}`,
      `Naissance : ${m.dob} (${ageOf(m.dob)})`,
      `Sexe : ${m.sex}`,
      `Groupe sanguin : ${m.blood || ', '}`,
      `Allergies : ${m.allergies || 'aucune connue'}`,
      `Pathologies : ${m.conditions || 'aucune'}`,
      `Contact urgence : ${m.phone || ', '}`,
      '',
      'Traitements en cours :',
      ...(m.medications.length ? m.medications.map((x) => `, ${x.label} ${x.dose} (${x.freq})`) : ['  aucun']),
      '',
      'Vaccinations :',
      ...(m.vaccinations.length ? m.vaccinations.map((v) => `, ${v.label} (${v.date})`) : ['  non renseigné'])
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `urgence-${m.name.replace(/\s+/g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1080" alt="Famille" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Users className="w-5 h-5" /> Carnet familial unifié
          </div>
          <h2 className="text-2xl font-bold mt-1">Ma famille santé</h2>
          <p className="text-sm text-white/85 mt-1">Jusqu'à {MAX_MEMBERS} proches · suivi & alertes partagés</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Membres</p>
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{stats.total}<span className="text-sm text-gray-400">/{MAX_MEMBERS}</span></p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Enfants</p>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.enfants}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Aînés</p>
          <p className="text-2xl font-bold text-amber-600">{stats.seniors}</p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2 flex items-center gap-1"><Bell className="w-3 h-3" /> Échéances à venir</p>
          <ul className="space-y-1.5">
            {upcoming.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${u.days < 0 ? 'bg-red-500' : u.days <= 7 ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
                <span className="font-medium text-gray-800">{u.member.name}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-700 truncate flex-1">{u.kind === 'vaccin' ? <Syringe className="inline w-3 h-3 mr-0.5" /> : <Calendar className="inline w-3 h-3 mr-0.5" />}{u.label}</span>
                <span className={`text-xs ${u.days < 0 ? 'text-red-600' : u.days <= 7 ? 'text-amber-700' : 'text-gray-500'}`}>
                  {u.days < 0 ? `en retard de ${-u.days}j` : u.days === 0 ? "aujourd'hui" : `dans ${u.days}j`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {slotsLeft > 0 && (
        <button onClick={openCreate} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Ajouter un proche ({slotsLeft} place{slotsLeft > 1 ? 's' : ''})
        </button>
      )}

      {slotsLeft === 0 && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Carnet plein ({MAX_MEMBERS} membres). Retirez un proche pour en ajouter un nouveau.
        </div>
      )}

      {members.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Aucun proche dans votre carnet pour l'instant.</p>
          <p className="text-xs text-gray-400 mt-1">Ajoutez vos enfants, conjoint·e ou parents âgés pour suivre leur santé.</p>
        </div>
      )}

      <ul className="space-y-3">
        {members.map((m) => {
          const rel = RELATIONS.find((r) => r.id === m.relation) ?? RELATIONS[RELATIONS.length - 1];
          const Icon = rel.icon;
          const open = openId === m.id;
          const sec = openSection[m.id] || null;
          const last = m.measures[0];
          return (
            <motion.li key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setOpenId(open ? null : m.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white p-2.5 rounded-xl shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{rel.label} · {ageOf(m.dob)}{m.sex !== ', ' ? ` · ${m.sex}` : ''}{m.blood ? ` · ${m.blood}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  {m.shareRdv && <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 p-1 rounded-md"><Calendar className="w-3 h-3" /></span>}
                  {m.shareMeds && <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 p-1 rounded-md"><Pill className="w-3 h-3" /></span>}
                  {m.shareAlerts && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 p-1 rounded-md"><AlertCircle className="w-3 h-3" /></span>}
                  {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 dark:border-slate-700">
                    <div className="px-4 py-3 space-y-2 text-sm">
                      {m.allergies && (
                        <div className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div><span className="text-xs text-gray-500 dark:text-slate-400">Allergies</span><p className="text-gray-800 dark:text-slate-200">{m.allergies}</p></div>
                        </div>
                      )}
                      {m.conditions && (
                        <div className="flex items-start gap-2"><Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                          <div><span className="text-xs text-gray-500 dark:text-slate-400">Suivi</span><p className="text-gray-800 dark:text-slate-200">{m.conditions}</p></div>
                        </div>
                      )}
                      {last && (
                        <div className="flex items-start gap-2"><Activity className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <div><span className="text-xs text-gray-500">Dernière mesure ({last.date})</span>
                            <p className="text-gray-800 dark:text-slate-200">
                              {last.weightKg ? `${last.weightKg} kg ` : ''}{last.heightCm ? `· ${last.heightCm} cm ` : ''}{last.tempC ? `· ${last.tempC} °C` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><Phone className="w-4 h-4" /> {m.phone}</a>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {([['vac', 'Vaccins', Syringe, m.vaccinations.length], ['rdv', 'RDV', Calendar, m.appointments.length], ['med', 'Traitements', Pill, m.medications.length], ['mes', 'Mesures', Activity, m.measures.length]] as const).map(([k, lbl, IIcon, n]) => (
                          <button key={k} onClick={() => setOpenSection((s) => ({ ...s, [m.id]: s[m.id] === k ? null : k }))}
                            className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${sec === k ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-600'}`}>
                            <IIcon className="w-3 h-3" /> {lbl} ({n})
                          </button>
                        ))}
                      </div>

                      {sec === 'vac' && <VacSection m={m} onAdd={addVaccination} onRemove={(id) => removeFromList(m, 'vaccinations', id)} />}
                      {sec === 'rdv' && <RdvSection m={m} onAdd={addAppointment} onRemove={(id) => removeFromList(m, 'appointments', id)} />}
                      {sec === 'med' && <MedSection m={m} onAdd={addMedication} onRemove={(id) => removeFromList(m, 'medications', id)} />}
                      {sec === 'mes' && <MesSection m={m} onAdd={addMeasure} onRemove={(id) => removeFromList(m, 'measures', id)} />}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => openEdit(m)} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 inline-flex items-center gap-1 text-gray-700"><Edit3 className="w-3 h-3" /> Modifier</button>
                        <button onClick={() => setEmergencyId(m.id)} className="text-xs px-3 py-1.5 rounded-full border border-red-200 inline-flex items-center gap-1 text-red-700"><BookOpen className="w-3 h-3" /> Fiche urgence</button>
                        <button onClick={() => exportCard(m)} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 inline-flex items-center gap-1 text-gray-700"><Download className="w-3 h-3" /> Exporter</button>
                        <button onClick={() => remove(m.id)} className="ml-auto text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1 text-red-600"><Trash2 className="w-3 h-3" /> Retirer</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Les données partagées sont chiffrées. Vous pouvez modifier ou retirer un membre à tout moment.</span>
      </div>

      <AnimatePresence>
        {editorOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditorOpen(false)}>
            <motion.div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{editingId ? 'Modifier le membre' : 'Nouveau membre'}</h3>
                <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="px-5 py-4 overflow-y-auto space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Lien de parenté</p>
                  <div className="grid grid-cols-5 gap-2">
                    {RELATIONS.map((r) => {
                      const RIcon = r.icon;
                      const sel = draft.relation === r.id;
                      return (
                        <button key={r.id} onClick={() => setDraft({ ...draft, relation: r.id })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition ${sel ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
                          <RIcon className="w-4 h-4" />
                          <span className="leading-tight text-center">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Nom complet</span>
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ex. Aïssatou Diallo" />
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">Naissance</span>
                    <input type="date" value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">Sexe</span>
                    <select value={draft.sex} onChange={(e) => setDraft({ ...draft, sex: e.target.value as Sex })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                      <option value=", ">, </option><option value="F">F</option><option value="M">M</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">Sang</span>
                    <select value={draft.blood} onChange={(e) => setDraft({ ...draft, blood: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                      <option value="">, </option>
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Allergies connues</span>
                  <input value={draft.allergies} onChange={(e) => setDraft({ ...draft, allergies: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" placeholder="Ex. pénicilline, arachides" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Pathologies / suivi</span>
                  <input value={draft.conditions} onChange={(e) => setDraft({ ...draft, conditions: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" placeholder="Ex. asthme, drépanocytose" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Téléphone d'urgence</span>
                  <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" placeholder="+229 …" />
                </label>

                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-teal-600" /> Partage des données</p>
                  {[
                    { key: 'shareRdv' as const, label: 'Voir et gérer ses rendez-vous', icon: Calendar },
                    { key: 'shareMeds' as const, label: 'Suivre ses traitements', icon: Pill },
                    { key: 'shareAlerts' as const, label: 'Recevoir ses alertes médicales', icon: AlertCircle }
                  ].map(({ key, label, icon: SIcon }) => (
                    <label key={key} className="flex items-center justify-between gap-2 text-sm text-gray-700">
                      <span className="flex items-center gap-2"><SIcon className="w-4 h-4 text-gray-500" />{label}</span>
                      <input type="checkbox" checked={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })} className="accent-teal-600 w-4 h-4" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <button onClick={() => setEditorOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Annuler</button>
                <button onClick={submit} disabled={!draft.name.trim() || !draft.dob.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-sm disabled:opacity-50">{editingId ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emergencyId && (() => {
          const m = members.find((x) => x.id === emergencyId);
          if (!m) return null;
          return (
            <motion.div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEmergencyId(null)}>
              <motion.div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-5 relative">
                  <button onClick={() => setEmergencyId(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
                  <p className="text-xs uppercase tracking-wide opacity-90">Fiche d'urgence</p>
                  <h3 className="font-bold text-xl mt-0.5">{m.name}</h3>
                  <p className="text-sm opacity-90">{ageOf(m.dob)} · {m.sex} · {m.blood || 'sang ?'}</p>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Allergies</p><p className="text-gray-900 font-semibold">{m.allergies || 'Aucune connue'}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Pathologies</p><p className="text-gray-900">{m.conditions || ', '}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Traitements en cours</p>
                    {m.medications.length === 0 ? <p className="text-gray-500 text-xs">Aucun</p> : (
                      <ul className="text-gray-800 text-xs space-y-0.5">{m.medications.map((x) => <li key={x.id}>• {x.label} {x.dose} ({x.freq})</li>)}</ul>
                    )}
                  </div>
                  {m.phone && <a href={`tel:${m.phone}`} className="block w-full py-3 rounded-xl bg-red-600 text-white text-center font-semibold inline-flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Appeler {m.phone}</a>}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function VacSection({ m, onAdd, onRemove }: { m: Member; onAdd: (m: Member, label: string, date: string, nextAt?: string) => void; onRemove: (id: string) => void }) {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(today());
  const [nextAt, setNextAt] = useState('');
  return (
    <div className="bg-teal-50/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Vaccin (BCG, ROR…)" className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input type="date" value={nextAt} onChange={(e) => setNextAt(e.target.value)} placeholder="rappel" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <button onClick={() => { onAdd(m, label, date, nextAt); setLabel(''); setNextAt(''); }} className="px-2 py-1.5 rounded-lg bg-teal-600 text-white text-xs">Ajouter</button>
      </div>
      <ul className="space-y-1">
        {m.vaccinations.length === 0 && <p className="text-xs text-gray-500">Aucun vaccin enregistré.</p>}
        {m.vaccinations.map((v) => (
          <li key={v.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5">
            <Syringe className="w-3 h-3 text-teal-600" />
            <span className="flex-1 text-gray-800">{v.label} · {v.date}{v.nextAt ? ` · rappel ${v.nextAt}` : ''}</span>
            <button onClick={() => onRemove(v.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RdvSection({ m, onAdd, onRemove }: { m: Member; onAdd: (m: Member, label: string, at: string, provider?: string) => void; onRemove: (id: string) => void }) {
  const [label, setLabel] = useState('');
  const [at, setAt] = useState(today());
  const [provider, setProvider] = useState('');
  return (
    <div className="bg-cyan-50/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Motif (ex. pédiatre)" className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input type="date" value={at} onChange={(e) => setAt(e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Praticien / lieu" className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <button onClick={() => { onAdd(m, label, at, provider); setLabel(''); setProvider(''); }} className="px-2 py-1.5 rounded-lg bg-cyan-600 text-white text-xs">Ajouter</button>
      </div>
      <ul className="space-y-1">
        {m.appointments.length === 0 && <p className="text-xs text-gray-500">Aucun rendez-vous.</p>}
        {m.appointments.map((r) => (
          <li key={r.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5">
            <Calendar className="w-3 h-3 text-cyan-600" />
            <span className="flex-1 text-gray-800">{r.at} · {r.label}{r.provider ? ` · ${r.provider}` : ''}</span>
            <button onClick={() => onRemove(r.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MedSection({ m, onAdd, onRemove }: { m: Member; onAdd: (m: Member, label: string, dose: string, freq: string, until?: string) => void; onRemove: (id: string) => void }) {
  const [label, setLabel] = useState('');
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');
  const [until, setUntil] = useState('');
  return (
    <div className="bg-amber-50/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Médicament" className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dose (5ml, 500mg…)" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={freq} onChange={(e) => setFreq(e.target.value)} placeholder="Fréquence (3x/j)" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} placeholder="Jusqu'au" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <button onClick={() => { onAdd(m, label, dose, freq, until || undefined); setLabel(''); setDose(''); setFreq(''); setUntil(''); }} className="px-2 py-1.5 rounded-lg bg-amber-600 text-white text-xs">Ajouter</button>
      </div>
      <ul className="space-y-1">
        {m.medications.length === 0 && <p className="text-xs text-gray-500">Aucun traitement.</p>}
        {m.medications.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5">
            <Pill className="w-3 h-3 text-amber-600" />
            <span className="flex-1 text-gray-800">{p.label} {p.dose} · {p.freq}{p.until ? ` · jusqu'au ${p.until}` : ''}</span>
            <button onClick={() => onRemove(p.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MesSection({ m, onAdd, onRemove }: { m: Member; onAdd: (m: Member, mes: Omit<Measure, 'id'>) => void; onRemove: (id: string) => void }) {
  const [date, setDate] = useState(today());
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [t, setT] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="bg-violet-50/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={w} onChange={(e) => setW(e.target.value)} placeholder="kg" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={h} onChange={(e) => setH(e.target.value)} placeholder="cm" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="°C" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
        <button onClick={() => { onAdd(m, { date, weightKg: w ? parseFloat(w) : undefined, heightCm: h ? parseFloat(h) : undefined, tempC: t ? parseFloat(t) : undefined, note: note || undefined }); setW(''); setH(''); setT(''); setNote(''); }} className="px-2 py-1.5 rounded-lg bg-violet-600 text-white text-xs">Ajouter</button>
      </div>
      <ul className="space-y-1">
        {m.measures.length === 0 && <p className="text-xs text-gray-500">Aucune mesure.</p>}
        {m.measures.map((mes) => (
          <li key={mes.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5">
            <Activity className="w-3 h-3 text-violet-600" />
            <span className="flex-1 text-gray-800">{mes.date} · {mes.weightKg ? `${mes.weightKg}kg ` : ''}{mes.heightCm ? `${mes.heightCm}cm ` : ''}{mes.tempC ? `${mes.tempC}°C ` : ''}{mes.note ? `· ${mes.note}` : ''}</span>
            <button onClick={() => onRemove(mes.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
