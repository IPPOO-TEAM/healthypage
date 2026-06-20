import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Flame, HeartPulse, Sparkles, ChevronRight, ChevronLeft, Check, Zap, Heart, Trophy } from 'lucide-react';
import { setState, type Goal, type Level, type Place, type Sex, type Profile } from '../store';

const slides = [
  { icon: Dumbbell, title: 'Ton coach personnel', text: 'Programmes adaptés à ton niveau, ton matériel et ton temps.', color: 'from-emerald-500 to-teal-600' },
  { icon: Flame, title: 'Brûle, gagne, progresse', text: 'Suivi complet : entraînement, nutrition, récupération.', color: 'from-orange-500 to-rose-600' },
  { icon: HeartPulse, title: 'En sécurité, à ton rythme', text: 'Adaptations selon tes contraintes et ressentis.', color: 'from-fuchsia-500 to-violet-600' },
];

type Form = Partial<Profile> & { equipment: string[]; constraints: string[]; diet: string[]; allergies: string[] };

const equipmentOptions = ['Poids du corps', 'Haltères', 'Élastiques', 'Barre', 'Machines'];
const constraintOptions = ['Genoux', 'Dos', 'Épaules', 'Hypertension', 'Diabète', 'Post-partum'];
const dietOptions = ['Omnivore', 'Végé', 'Vegan', 'Sans gluten', 'Halal'];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState(0);
  const [form, setForm] = useState<Form>({
    name: '',
    sex: 'na', age: 28, heightCm: 170, weightKg: 70,
    goal: 'health', level: 'beginner',
    daysPerWeek: 3, minutesPerDay: 30, place: 'home',
    equipment: ['Poids du corps'], constraints: [], diet: ['Omnivore'], allergies: [],
  });

  const total = 6;
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const toggle = (key: 'equipment' | 'constraints' | 'diet') => (v: string) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  };

  const finish = () => {
    const profile: Profile = {
      name: form.name || 'Athlète',
      sex: form.sex as Sex, age: form.age!, heightCm: form.heightCm!, weightKg: form.weightKg!,
      targetWeightKg: form.targetWeightKg,
      goal: form.goal as Goal, level: form.level as Level,
      daysPerWeek: form.daysPerWeek!, minutesPerDay: form.minutesPerDay!, place: form.place as Place,
      equipment: form.equipment, constraints: form.constraints, diet: form.diet, allergies: form.allergies,
    };
    setState((s) => ({ ...s, profile, onboarded: true, activeProgramId: 'home-starter', programStartDate: new Date().toISOString() }));
  };

  if (step === 0) {
    const S = slides[slide];
    const Icon = S.icon;
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <div className={`flex-1 bg-gradient-to-br ${S.color} flex items-center justify-center p-8`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Icon className="w-12 h-12" />
              </div>
              <h1 className="mt-8 tracking-tight" style={{ fontSize: 32, fontWeight: 800 }}>{S.title}</h1>
              <p className="mt-3 text-white/85">{S.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="p-6 bg-slate-950 space-y-4">
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          <button
            onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : next()}
            className="w-full h-14 rounded-2xl bg-white text-slate-900 font-semibold inline-flex items-center justify-center gap-2"
          >
            {slide < slides.length - 1 ? 'Suivant' : 'Commencer'} <ChevronRight className="w-5 h-5" />
          </button>
          {slide < slides.length - 1 && (
            <button onClick={next} className="w-full text-white/70 text-sm">Passer</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-emerald-950 flex flex-col">
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={back} className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Étape {step}/{total - 1}</span>
              <span>{Math.round((step / (total - 1)) * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                animate={{ width: `${(step / (total - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 1 && (
              <Section title="Comment t’appeler ?" subtitle="Pour personnaliser ton expérience.">
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ton prénom"
                  className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </Section>
            )}

            {step === 2 && (
              <Section title="Quel est ton objectif principal ?">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'lose', label: 'Perdre du poids', Icon: Flame, tint: 'text-orange-500' },
                    { id: 'gain', label: 'Prendre du muscle', Icon: Dumbbell, tint: 'text-emerald-500' },
                    { id: 'tone', label: 'Me tonifier', Icon: Zap, tint: 'text-amber-500' },
                    { id: 'health', label: 'Forme & santé', Icon: Heart, tint: 'text-rose-500' },
                    { id: 'perf', label: 'Performance', Icon: Trophy, tint: 'text-violet-500' },
                  ] as { id: Goal; label: string; Icon: typeof Flame; tint: string }[]).map((o) => (
                    <Tile key={o.id} active={form.goal === o.id} onClick={() => setForm({ ...form, goal: o.id })}>
                      <o.Icon className={`w-7 h-7 mx-auto ${form.goal === o.id ? 'text-white' : o.tint}`} />
                      <div className="mt-2 font-medium">{o.label}</div>
                    </Tile>
                  ))}
                </div>
              </Section>
            )}

            {step === 3 && (
              <Section title="Parle-nous de toi">
                <div className="space-y-4">
                  <Field label="Sexe">
                    <div className="grid grid-cols-3 gap-2">
                      {(['f', 'm', 'na'] as Sex[]).map((s) => (
                        <Tile key={s} active={form.sex === s} onClick={() => setForm({ ...form, sex: s })}>
                          <div className="font-medium">{s === 'f' ? 'Femme' : s === 'm' ? 'Homme' : 'Autre'}</div>
                        </Tile>
                      ))}
                    </div>
                  </Field>
                  <Field label={`Âge : ${form.age} ans`}>
                    <input type="range" min={14} max={80} value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} className="w-full accent-emerald-600" />
                  </Field>
                  <Field label={`Taille : ${form.heightCm} cm`}>
                    <input type="range" min={140} max={210} value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: +e.target.value })} className="w-full accent-emerald-600" />
                  </Field>
                  <Field label={`Poids : ${form.weightKg} kg`}>
                    <input type="range" min={40} max={160} value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: +e.target.value })} className="w-full accent-emerald-600" />
                  </Field>
                  <Field label="Niveau">
                    <div className="grid grid-cols-3 gap-2">
                      {(['beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
                        <Tile key={l} active={form.level === l} onClick={() => setForm({ ...form, level: l })}>
                          <div className="font-medium">{l === 'beginner' ? 'Débutant' : l === 'intermediate' ? 'Inter.' : 'Avancé'}</div>
                        </Tile>
                      ))}
                    </div>
                  </Field>
                </div>
              </Section>
            )}

            {step === 4 && (
              <Section title="Disponibilité & lieu">
                <div className="space-y-4">
                  <Field label={`${form.daysPerWeek} jours / semaine`}>
                    <input type="range" min={1} max={7} value={form.daysPerWeek} onChange={(e) => setForm({ ...form, daysPerWeek: +e.target.value })} className="w-full accent-emerald-600" />
                  </Field>
                  <Field label={`${form.minutesPerDay} minutes / séance`}>
                    <input type="range" min={10} max={90} step={5} value={form.minutesPerDay} onChange={(e) => setForm({ ...form, minutesPerDay: +e.target.value })} className="w-full accent-emerald-600" />
                  </Field>
                  <Field label="Lieu">
                    <div className="grid grid-cols-3 gap-2">
                      {(['home', 'gym', 'both'] as Place[]).map((p) => (
                        <Tile key={p} active={form.place === p} onClick={() => setForm({ ...form, place: p })}>
                          <div className="font-medium">{p === 'home' ? 'Maison' : p === 'gym' ? 'Salle' : 'Les deux'}</div>
                        </Tile>
                      ))}
                    </div>
                  </Field>
                  <Field label="Matériel disponible">
                    <Chips options={equipmentOptions} values={form.equipment} onToggle={toggle('equipment')} />
                  </Field>
                </div>
              </Section>
            )}

            {step === 5 && (
              <Section title="Santé & nutrition" subtitle="Pour adapter en sécurité.">
                <div className="space-y-4">
                  <Field label="Contraintes (optionnel)">
                    <Chips options={constraintOptions} values={form.constraints} onToggle={toggle('constraints')} />
                  </Field>
                  <Field label="Régime">
                    <Chips options={dietOptions} values={form.diet} onToggle={toggle('diet')} />
                  </Field>
                  <Field label="Allergies (séparées par virgule)">
                    <input
                      value={form.allergies.join(', ')}
                      onChange={(e) => setForm({ ...form, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      placeholder="ex : arachides, lactose"
                      className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                  </Field>
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Les conseils sont à but bien-être. En cas de pathologie, consulte un professionnel de santé.
                  </div>
                </div>
              </Section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-50 dark:from-slate-950 to-transparent">
        <button
          onClick={step === total - 1 ? finish : next}
          disabled={step === 1 && !form.name}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {step === total - 1 ? <>Créer mon plan <Check className="w-5 h-5" /></> : <>Continuer <ChevronRight className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="pt-4">
      <h2 className="tracking-tight text-slate-900 dark:text-white" style={{ fontSize: 24, fontWeight: 700 }}>{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</div>
      {children}
    </div>
  );
}

function Tile({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl text-center border transition-all ${active ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'}`}
    >
      {children}
    </button>
  );
}

function Chips({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = values.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`px-4 h-10 rounded-full text-sm border transition-all ${active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
