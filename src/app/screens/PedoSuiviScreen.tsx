import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Baby, Plus, Trash2, X, TrendingUp, Ruler, Weight, Brain, Calendar, CheckCircle2, Circle, Syringe, Sparkles, GraduationCap, ShieldCheck, Heart, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getPatientId } from '../components/usePatientId';
import { api } from '../components/api';
import { useLockBodyScroll } from '../components/useLockBodyScroll';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type Measurement = {
  id: string;
  date: string;
  ageMonths: number;
  weight: number; // kg
  height: number; // cm
  headCirc?: number; // cm
  notes?: string;
  childId: string;
};

type Child = {
  id: string;
  name: string;
  dob: string;
  gender: 'M' | 'F';
};

const MILESTONES: { age: number; label: string; category: 'moteur' | 'social' | 'langage' }[] = [
  { age: 1, label: 'Suit du regard', category: 'moteur' },
  { age: 2, label: 'Sourit, gazouille', category: 'social' },
  { age: 4, label: 'Tient sa tête', category: 'moteur' },
  { age: 6, label: 'Se retourne', category: 'moteur' },
  { age: 6, label: 'Réagit à son prénom', category: 'social' },
  { age: 9, label: 'S\'assied seul', category: 'moteur' },
  { age: 12, label: 'Premiers mots', category: 'langage' },
  { age: 12, label: 'Marche aidé', category: 'moteur' },
  { age: 18, label: 'Marche seul', category: 'moteur' },
  { age: 24, label: 'Phrases de 2 mots', category: 'langage' },
  { age: 36, label: 'Propreté diurne', category: 'social' },
  { age: 48, label: 'Compte jusqu\'à 10', category: 'langage' }
];

const VACCINS = [
  { age: 0, label: 'BCG + VPO0' },
  { age: 1.5, label: 'Pentavalent 1 + VPO1 + Rota 1' },
  { age: 2.5, label: 'Pentavalent 2 + VPO2 + Rota 2' },
  { age: 3.5, label: 'Pentavalent 3 + VPO3 + VPI' },
  { age: 9, label: 'Rougeole + Fièvre jaune' },
  { age: 15, label: 'Rougeole rappel' }
];

// Approximation OMS courbes médianes (P50) pour visualisation simplifiée
const REF_WEIGHT_M = [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 10.0, 10.4, 10.8, 11.3, 11.8, 12.2, 12.7, 13.3, 14.3, 15.3, 16.3, 17.3];
const REF_HEIGHT_M = [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7, 78.0, 80.3, 82.4, 84.4, 86.4, 88.3, 90.0, 92.4, 95.7, 98.7, 101.7, 104.5];
const REF_HEAD_M = [34.5, 37.1, 39.1, 40.5, 41.6, 42.6, 43.3, 44.0, 44.5, 45.0, 45.4, 45.8, 46.1, 46.6, 47.1, 47.5, 47.9, 48.3, 48.6, 48.9, 49.2, 49.7, 50.1, 50.5, 50.8];

interface Props { onBack: () => void }

export default function PedoSuiviScreen({ onBack }: Props) {
  const pid = getPatientId();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  useLockBodyScroll(!!activeChildId);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddMeas, setShowAddMeas] = useState(false);
  const [milestones, setMilestones] = useState<Record<string, true>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('healthy-page:pedo:children');
      if (raw) {
        const list: Child[] = JSON.parse(raw);
        setChildren(list);
        if (list[0]) setActiveChildId(list[0].id);
      }
      const ms = window.localStorage.getItem('healthy-page:pedo:milestones');
      if (ms) setMilestones(JSON.parse(ms));
    } catch {}
  }, []);

  useEffect(() => {
    if (!pid || !activeChildId) return;
    api.listGrowth(pid).then((list) => {
      setMeasurements((list ?? []).filter((m: Measurement) => m.childId === activeChildId));
    }).catch(() => {});
  }, [pid, activeChildId]);

  const persistChildren = (list: Child[]) => {
    setChildren(list);
    try { window.localStorage.setItem('healthy-page:pedo:children', JSON.stringify(list)); } catch {}
  };

  const persistMilestones = (m: Record<string, true>) => {
    setMilestones(m);
    try { window.localStorage.setItem('healthy-page:pedo:milestones', JSON.stringify(m)); } catch {}
  };

  const addChild = (c: Omit<Child, 'id'>) => {
    const child: Child = { ...c, id: `c_${Date.now()}` };
    const list = [...children, child];
    persistChildren(list);
    setActiveChildId(child.id);
    setShowAddChild(false);
  };

  const removeChild = (id: string) => {
    const list = children.filter((c) => c.id !== id);
    persistChildren(list);
    if (activeChildId === id) setActiveChildId(list[0]?.id ?? null);
  };

  const activeChild = children.find((c) => c.id === activeChildId);
  const ageMonths = activeChild ? monthsSince(activeChild.dob) : 0;

  const addMeasurement = async (data: { weight: number; height: number; headCirc?: number; notes?: string }) => {
    if (!pid || !activeChild) return;
    const m: Measurement = {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ageMonths: monthsSince(activeChild.dob),
      childId: activeChild.id,
      ...data
    };
    try {
      await api.createGrowth(pid, m);
      setMeasurements([...measurements, m].sort((a, b) => a.ageMonths - b.ageMonths));
    } catch {}
    setShowAddMeas(false);
  };

  const removeMeasurement = async (id: string) => {
    if (!pid) return;
    try {
      await api.deleteGrowth(pid, id);
      setMeasurements(measurements.filter((m) => m.id !== id));
    } catch {}
  };

  const chartData = useMemo(() => {
    const max = Math.max(ageMonths + 2, ...measurements.map((m) => m.ageMonths), 12);
    const months = Array.from({ length: Math.min(25, max + 1) }, (_, i) => i);
    return months.map((mo) => {
      const meas = measurements.find((m) => m.ageMonths === mo);
      return {
        age: mo,
        weight: meas?.weight ?? null,
        height: meas?.height ?? null,
        head: meas?.headCirc ?? null,
        refW: REF_WEIGHT_M[Math.min(mo, REF_WEIGHT_M.length - 1)],
        refH: REF_HEIGHT_M[Math.min(mo, REF_HEIGHT_M.length - 1)],
        refHead: REF_HEAD_M[Math.min(mo, REF_HEAD_M.length - 1)]
      };
    });
  }, [measurements, ageMonths]);

  return (
    <div className="space-y-4">
      <div className="">
        <div className="relative h-44 rounded-3xl overflow-hidden mb-4 shadow-lg">
          <ImageWithFallback src="https://images.unsplash.com/photo-1617056239820-8ce90ba48193?w=1080" alt="Enfant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-full" aria-label="Retour">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setShowAddChild(true)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full" aria-label="Ajouter un enfant">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5" />
                <h1 className="text-xl font-bold">Pédo-suivi</h1>
              </div>
              <p className="text-xs text-teal-50/95 mt-0.5">Croissance, vaccins, jalons · de la naissance à 5 ans</p>
            </div>
          </div>
        </div>
        {children.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-slate-400">
            <Baby className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm mb-3">Aucun enfant suivi pour le moment.</p>
            <button onClick={() => setShowAddChild(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              + Ajouter un enfant
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChildId(c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                    activeChildId === c.id
                      ? 'bg-teal-600 text-white shadow'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <span>{c.gender === 'F' ? '👧' : '👦'}</span>
                  <span className="font-medium">{c.name}</span>
                  <span className={`text-[10px] ${activeChildId === c.id ? 'text-teal-100' : 'text-gray-500 dark:text-slate-400'}`}>
                    {monthsSince(c.dob)} mois
                  </span>
                </button>
              ))}
            </div>

            {activeChild && (
              <div className="space-y-4 mt-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{activeChild.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Né(e) le {formatDate(activeChild.dob)} · {ageMonths} mois</p>
                  </div>
                  <button onClick={() => removeChild(activeChild.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-full" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" /> Courbes de croissance
                    </h3>
                    <button onClick={() => setShowAddMeas(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                      + Mesure
                    </button>
                  </div>

                  {measurements.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">
                      Aucune mesure enregistrée. Ajoutez la première pour démarrer le suivi.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <ChartBlock data={chartData} dataKey="weight" refKey="refW" color="#0d9488" label="Poids (kg)" current={ageMonths} />
                      <ChartBlock data={chartData} dataKey="height" refKey="refH" color="#0891b2" label="Taille (cm)" current={ageMonths} />
                      {measurements.some((m) => m.headCirc) && (
                        <ChartBlock data={chartData} dataKey="head" refKey="refHead" color="#0ea5e9" label="Périmètre crânien (cm)" current={ageMonths} />
                      )}
                    </div>
                  )}
                </div>

                {measurements.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Historique</h3>
                    <div className="space-y-1.5">
                      {[...measurements].reverse().map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 dark:text-slate-200">{m.ageMonths} mois</span>
                            <span className="text-gray-500 dark:text-slate-400">{formatDate(m.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700 dark:text-slate-200">
                            <span><Weight className="w-3 h-3 inline" /> {m.weight}kg</span>
                            <span><Ruler className="w-3 h-3 inline" /> {m.height}cm</span>
                            {m.headCirc && <span><Brain className="w-3 h-3 inline" /> {m.headCirc}cm</span>}
                            <button onClick={() => removeMeasurement(m.id)} className="text-rose-500" aria-label="Supprimer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-sky-600" /> Calendrier vaccinal (PEV)
                  </h3>
                  <div className="space-y-1.5">
                    {VACCINS.map((v, i) => {
                      const due = ageMonths >= v.age;
                      const key = `${activeChild.id}_v${i}`;
                      const done = !!milestones[key];
                      return (
                        <button
                          key={i}
                          onClick={() => persistMilestones({ ...milestones, [key]: !done as any } as any)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${
                            done
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                              : due
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                              : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          <span className="font-medium flex-1">{v.label}</span>
                          <span className="text-xs">{v.age === 0 ? 'Naissance' : `${v.age} mois`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" /> Jalons de développement
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MILESTONES.map((m, i) => {
                      const key = `${activeChild.id}_ms${i}`;
                      const done = !!milestones[key];
                      const due = ageMonths >= m.age;
                      return (
                        <button
                          key={i}
                          onClick={() => persistMilestones({ ...milestones, [key]: !done as any } as any)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition ${
                            done
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                              : due
                              ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200'
                              : 'bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                          <span className="font-medium flex-1">{m.label}</span>
                          <span className="text-[10px] opacity-70">{m.age}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <PlanificationDeVie ageMonths={ageMonths} childName={activeChild.name} />
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showAddChild && (
          <ChildModal onSubmit={addChild} onClose={() => setShowAddChild(false)} />
        )}
        {showAddMeas && activeChild && (
          <MeasurementModal onSubmit={addMeasurement} onClose={() => setShowAddMeas(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const LIFE_STAGES: { id: string; minM: number; maxM: number; icon: any; title: string; window: string; checkpoints: string[]; provision: number }[] = [
  { id: 'petite', minM: 0, maxM: 35, icon: Baby, title: 'Petite enfance', window: '0, 2 ans',
    checkpoints: ['Vaccins PEV complets', 'Suivi croissance trimestriel', 'Allaitement & diversification', 'Éveil sensoriel & moteur'], provision: 5000 },
  { id: 'prescol', minM: 36, maxM: 71, icon: Sparkles, title: 'Préscolaire', window: '3, 5 ans',
    checkpoints: ['Bilan ophtalmo & audition', 'Rappel DTC-Polio', 'Acquisition langage', 'Socialisation & motricité fine'], provision: 7500 },
  { id: 'primaire', minM: 72, maxM: 143, icon: GraduationCap, title: 'École primaire', window: '6, 11 ans',
    checkpoints: ['Visite scolaire annuelle', 'Hygiène bucco-dentaire', 'Vue & posture', 'Activité physique régulière'], provision: 10000 },
  { id: 'ado', minM: 144, maxM: 215, icon: ShieldCheck, title: 'Adolescence', window: '12, 17 ans',
    checkpoints: ['Vaccin HPV', 'Santé mentale & bien-être', 'Éducation à la sexualité', 'Prévention addictions'], provision: 12500 },
  { id: 'adulte', minM: 216, maxM: 9999, icon: Heart, title: 'Transition adulte', window: '18 ans +',
    checkpoints: ['Bilan complet majorité', 'Carnet santé adulte', 'Mutuelle & couverture', 'Autonomie médicale'], provision: 15000 }
];

function PlanificationDeVie({ ageMonths, childName }: { ageMonths: number; childName: string }) {
  const currentStage = LIFE_STAGES.find(s => ageMonths >= s.minM && ageMonths <= s.maxM) ?? LIFE_STAGES[0];
  const monthsToNext = currentStage.maxM === 9999 ? 0 : (currentStage.maxM + 1, ageMonths);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-slate-700">
      <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-teal-600" /> Planification de Vie
      </h3>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Parcours santé & étapes clés pour {childName}</p>

      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-3 text-white mb-3">
        <div className="flex items-center gap-2 text-xs opacity-90">
          <currentStage.icon className="w-4 h-4" /> Étape actuelle
        </div>
        <div className="font-semibold mt-0.5">{currentStage.title} · {currentStage.window}</div>
        {monthsToNext > 0 && (
          <div className="text-[11px] opacity-85 mt-1">Transition vers l'étape suivante dans ~{monthsToNext} mois</div>
        )}
      </div>

      <ol className="space-y-2">
        {LIFE_STAGES.map(s => {
          const Icon = s.icon;
          const isCurrent = s.id === currentStage.id;
          const isPast = ageMonths > s.maxM;
          return (
            <li key={s.id} className={`p-3 rounded-xl border ${isCurrent ? 'border-teal-300 bg-teal-50/60 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-teal-600 text-white' : isPast ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-900 dark:text-slate-100">{s.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.window}</div>
                  </div>
                </div>
                {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {s.checkpoints.map(c => (
                  <li key={c} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <Circle className="w-2.5 h-2.5 mt-1 text-teal-500 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 p-3 bg-cyan-50/60 dark:bg-cyan-900/20 rounded-xl flex items-start gap-2">
        <Wallet className="w-4 h-4 text-cyan-700 dark:text-cyan-300 mt-0.5" />
        <div className="text-xs text-cyan-900 dark:text-cyan-100">
          <div className="font-semibold">Provision médicale recommandée</div>
          <div className="opacity-90">~{currentStage.provision.toLocaleString('fr-FR')} FCFA / mois pour cette étape (consultations, vaccins, imprévus).</div>
        </div>
      </div>
    </div>
  );
}

function ChartBlock({ data, dataKey, refKey, color, label, current }: { data: any[]; dataKey: string; refKey: string; color: string; label: string; current: number }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">{label}</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: 'mois', position: 'insideBottomRight', offset: -2, style: { fontSize: 10 } }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <ReferenceLine x={current} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'auj.', fontSize: 9, fill: '#64748b' }} />
            <Line type="monotone" dataKey={refKey} stroke="#cbd5e1" strokeWidth={1.5} dot={false} name="Référence OMS P50" />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} connectNulls name="Enfant" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChildModal({ onSubmit, onClose }: { onSubmit: (c: Omit<Child, 'id'>) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('F');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Ajouter un enfant</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Prénom"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Date de naissance"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} /></Field>
          <Field label="Sexe">
            <div className="flex gap-2">
              {(['F', 'M'] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border ${gender === g ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200'}`}>
                  {g === 'F' ? '👧 Fille' : '👦 Garçon'}
                </button>
              ))}
            </div>
          </Field>
          <button onClick={() => name && dob && onSubmit({ name, dob, gender })} disabled={!name || !dob} className="w-full bg-teal-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl mt-2">
            Enregistrer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MeasurementModal({ onSubmit, onClose }: { onSubmit: (d: { weight: number; height: number; headCirc?: number; notes?: string }) => void; onClose: () => void }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Nouvelle mesure</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Poids (kg)"><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} /></Field>
          <Field label="Taille (cm)"><input type="number" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} /></Field>
          <Field label="Périmètre crânien (cm), optionnel"><input type="number" step="0.5" value={headCirc} onChange={(e) => setHeadCirc(e.target.value)} className={inputCls} /></Field>
          <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} /></Field>
          <button
            onClick={() => weight && height && onSubmit({ weight: Number(weight), height: Number(height), headCirc: headCirc ? Number(headCirc) : undefined, notes: notes || undefined })}
            disabled={!weight || !height}
            className="w-full bg-teal-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl mt-2"
          >
            Enregistrer
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

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

function monthsSince(dob: string): number {
  if (!dob) return 0;
  const d = new Date(dob);
  const now = new Date();
  return Math.max(0, (now.getFullYear(), d.getFullYear()) * 12 + (now.getMonth(), d.getMonth()));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}
