import { motion } from 'motion/react';
import { Droplet, Footprints, Flame, Apple, Dumbbell, Plus, Minus, Sparkles, Trophy, ChevronRight, Star, Hand } from 'lucide-react';
import { useStore, dailyTargets, todayKey, ensureToday, setState, addXP, type State } from '../store';
import { programs, foods } from '../data';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function Dashboard({ onGo }: { onGo: (tab: 'train' | 'nutrition' | 'stats' | 'profile') => void }) {
  const profile = useStore((s) => s.profile)!;
  const metrics = useStore((s) => s.metrics[todayKey()]) || { date: todayKey(), waterMl: 0, steps: 0 };
  const workouts = useStore((s) => s.workouts);
  const foodEntries = useStore((s) => s.foods.filter((f) => f.date === todayKey()));
  const streak = useStore((s) => s.streak);
  const xp = useStore((s) => s.xp);
  const activeId = useStore((s) => s.activeProgramId);

  const targets = dailyTargets(profile);
  const program = programs.find((p) => p.id === activeId);

  const kcalEaten = foodEntries.reduce((sum, e) => {
    const f = foods.find((x) => x.id === e.foodId);
    return sum + (f ? (f.per100.kcal * e.grams) / 100 : 0);
  }, 0);
  const kcalLeft = Math.max(0, Math.round(targets.kcal - kcalEaten));

  const trainingDoneToday = workouts.some((w) => w.date.slice(0, 10) === todayKey());

  const adjustWater = (delta: number) => {
    ensureToday();
    setState((s) => {
      const k = todayKey();
      const m = s.metrics[k] || { date: k, waterMl: 0, steps: 0 };
      return { ...s, metrics: { ...s.metrics, [k]: { ...m, waterMl: Math.max(0, m.waterMl + delta) } } };
    });
  };

  const addSteps = (delta: number) => {
    ensureToday();
    setState((s) => {
      const k = todayKey();
      const m = s.metrics[k] || { date: k, waterMl: 0, steps: 0 };
      return { ...s, metrics: { ...s.metrics, [k]: { ...m, steps: Math.max(0, m.steps + delta) } } };
    });
    addXP(2);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bel après-midi' : 'Bonsoir';

  return (
    <div className="pb-28">
      <header className="relative px-5 pt-12 pb-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1628257088739-3abca4744d8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/70 to-teal-700/80" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/85 text-sm">{greeting},</p>
            <h1 className="tracking-tight inline-flex items-center gap-2" style={{ fontSize: 26, fontWeight: 800 }}>
              {profile.name}
              <Hand className="w-6 h-6 text-amber-200" />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-200" /> {streak}j</div>
            <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-200 fill-amber-200" /> {xp} XP</div>
          </div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mt-6 bg-white/15 backdrop-blur rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/75">Aujourd’hui</div>
              <div className="mt-1 font-semibold">{program?.title || 'Aucun programme'}</div>
              {program && <div className="text-sm text-white/80">{program.days[0].name} · {profile.minutesPerDay} min</div>}
            </div>
            <button
              onClick={() => onGo('train')}
              className="px-4 h-11 rounded-xl bg-white text-emerald-700 font-semibold text-sm inline-flex items-center gap-1"
            >
              {trainingDoneToday ? 'Voir' : 'Démarrer'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </header>

      <div className="px-5 mt-6 space-y-4">
        <div>
          <SectionTitle>Objectifs du jour</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <RingCard
              icon={<Flame className="w-5 h-5" />}
              label="Calories"
              value={kcalLeft}
              suffix=" kcal"
              caption={`${Math.round(kcalEaten)} / ${targets.kcal}`}
              progress={Math.min(1, kcalEaten / targets.kcal)}
              color="from-orange-500 to-rose-500"
              onClick={() => onGo('nutrition')}
            />
            <RingCard
              icon={<Dumbbell className="w-5 h-5" />}
              label="Séance"
              value={trainingDoneToday ? 'OK' : 'À faire'}
              caption={program?.days[0].name}
              progress={trainingDoneToday ? 1 : 0}
              color="from-emerald-500 to-teal-500"
              onClick={() => onGo('train')}
            />
            <Tracker
              icon={<Droplet className="w-5 h-5 text-sky-500" />}
              label="Hydratation"
              value={`${(metrics.waterMl / 1000).toFixed(1)} / ${(targets.waterMl / 1000).toFixed(1)} L`}
              progress={Math.min(1, metrics.waterMl / targets.waterMl)}
              onMinus={() => adjustWater(-250)}
              onPlus={() => adjustWater(250)}
              barColor="bg-sky-500"
            />
            <Tracker
              icon={<Footprints className="w-5 h-5 text-violet-500" />}
              label="Pas"
              value={`${metrics.steps.toLocaleString()} / ${targets.steps.toLocaleString()}`}
              progress={Math.min(1, metrics.steps / targets.steps)}
              onMinus={() => addSteps(-500)}
              onPlus={() => addSteps(500)}
              barColor="bg-violet-500"
            />
          </div>
        </div>

        <InsightCard profile={profile} streak={streak} />

        <div>
          <SectionTitle right={<button onClick={() => onGo('train')} className="text-xs text-emerald-600 font-medium">Voir tout</button>}>Programme actif</SectionTitle>
          {program ? (
            <div className="mt-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{program.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{program.weeks} sem. · {program.daysPerWeek}j/sem · {program.level === 'beginner' ? 'Débutant' : program.level === 'intermediate' ? 'Inter.' : 'Avancé'}</div>
                </div>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (workouts.length / (program.weeks * program.daysPerWeek)) * 100)}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-2">{workouts.length} / {program.weeks * program.daysPerWeek} séances</div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-500">Choisis un programme dans l’onglet Entraînement.</div>
          )}
        </div>

        <div>
          <SectionTitle right={<button onClick={() => onGo('nutrition')} className="text-xs text-emerald-600 font-medium">Ajouter</button>}>
            Repas du jour
          </SectionTitle>
          {foodEntries.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-5 text-center text-sm text-slate-500">
              <Apple className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              Pas encore de repas. Ajoutes-en pour suivre tes macros.
            </div>
          ) : (
            <div className="mt-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {foodEntries.slice(0, 4).map((e) => {
                const f = foods.find((x) => x.id === e.foodId);
                if (!f) return null;
                return (
                  <div key={e.id} className="flex justify-between items-center px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-slate-500">{e.grams} g · {Math.round((f.per100.kcal * e.grams) / 100)} kcal</div>
                    </div>
                    <div className="text-xs text-slate-400 capitalize">{e.meal === 'breakfast' ? 'Petit-déj' : e.meal === 'lunch' ? 'Déj.' : e.meal === 'dinner' ? 'Dîner' : 'Snack'}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="tracking-tight text-slate-900 dark:text-white" style={{ fontSize: 16, fontWeight: 700 }}>{children}</h3>
      {right}
    </div>
  );
}

function RingCard({ icon, label, value, suffix, caption, progress, color, onClick }: { icon: React.ReactNode; label: string; value: React.ReactNode; suffix?: string; caption?: string; progress: number; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${color}`} style={{ opacity: progress }} />
      <div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div>
      <div className="mt-2 font-bold tracking-tight" style={{ fontSize: 22 }}>{value}{suffix}</div>
      {caption && <div className="text-xs text-slate-500 mt-0.5">{caption}</div>}
    </button>
  );
}

function Tracker({ icon, label, value, progress, onMinus, onPlus, barColor }: { icon: React.ReactNode; label: string; value: string; progress: number; onMinus: () => void; onPlus: () => void; barColor: string }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div>
        <div className="flex gap-1">
          <button onClick={onMinus} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={onPlus} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="mt-2 font-bold tracking-tight" style={{ fontSize: 16 }}>{value}</div>
      <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function InsightCard({ profile, streak }: { profile: State['profile']; streak: number }) {
  const messages: string[] = [];
  if (streak >= 3) messages.push(`Belle régularité : ${streak} jours d’affilée.`);
  if (profile && profile.constraints.length > 0) messages.push(`Adaptations actives pour : ${profile.constraints.join(', ')}.`);
  if (messages.length === 0) messages.push('Garde le cap : un effort par jour et la progression suivra.');
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-90"><Sparkles className="w-4 h-4" /> Coach IA</div>
      <div className="mt-2 text-sm">{messages[0]}</div>
    </div>
  );
}
