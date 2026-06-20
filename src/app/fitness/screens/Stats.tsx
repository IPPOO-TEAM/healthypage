import { useMemo } from 'react';
import { TrendingUp, Award, Flame, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { challenges } from '../data';

export function Stats() {
  const workouts = useStore((s) => s.workouts);
  const metrics = useStore((s) => s.metrics);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const badges = useStore((s) => s.badges);

  const last7 = useMemo(() => {
    const days: { key: string; label: string; sessions: number; kcal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const sessions = workouts.filter((w) => w.date.slice(0, 10) === key).length;
      days.push({ key, label: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()], sessions, kcal: 0 });
    }
    return days;
  }, [workouts]);

  const max = Math.max(1, ...last7.map((d) => d.sessions));

  return (
    <div className="pb-28">
      <header className="px-5 pt-12 pb-4">
        <h1 className="tracking-tight" style={{ fontSize: 28, fontWeight: 800 }}>Statistiques</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visualise ta progression.</p>
      </header>

      <div className="px-5 grid grid-cols-3 gap-2">
        <Stat icon={<Flame className="w-4 h-4 text-orange-500" />} label="Streak" value={`${streak} j`} />
        <Stat icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} label="Séances" value={String(workouts.length)} />
        <Stat icon={<Award className="w-4 h-4 text-amber-500" />} label="XP" value={String(xp)} />
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3">7 derniers jours</h3>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {last7.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: `${(d.sessions / max) * 100}%`, minHeight: d.sessions ? 6 : 0 }} />
                </div>
                <div className="text-xs text-slate-500">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Séances par jour</div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3">Défis</h3>
        <div className="space-y-2">
          {challenges.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-sm">{c.title}</div>
                <div className="text-xs text-slate-500">{c.description}</div>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">+{c.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3">Badges</h3>
        {badges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-5 text-center text-sm text-slate-500">
            Continue de t’entraîner pour débloquer tes premiers badges.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {badges.map((b) => (
              <div key={b} className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/50 dark:border-amber-900/40 p-3 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs mt-2 font-medium">{b}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3">Historique</h3>
        {workouts.length === 0 ? (
          <div className="text-sm text-slate-500">Tes séances enregistrées s’afficheront ici.</div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {workouts.slice(0, 8).map((w) => (
              <div key={w.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium">Séance {new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>
                  <div className="text-xs text-slate-500">{w.durationMin} min · RPE {w.rpe ?? '-'}/10 · {w.exercises.length} ex.</div>
                </div>
                <div className="text-xs text-emerald-600 font-semibold">+{50 + w.exercises.length * 5} XP</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mt-6">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white p-5">
          <div className="text-xs uppercase tracking-wide text-white/80">Insight</div>
          <p className="mt-1 text-sm">{workouts.length >= 3 ? `À ce rythme (${(workouts.length / Math.max(1, last7.filter(d => d.sessions > 0).length || 1)).toFixed(1)} séances/jour actif), tu es sur une trajectoire régulière. Continue !` : 'Vise 3 séances cette semaine pour débloquer tes premiers insights de progression.'}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3">
      <div className="flex items-center gap-1 text-xs text-slate-500">{icon}{label}</div>
      <div className="mt-1 font-bold tracking-tight" style={{ fontSize: 20 }}>{value}</div>
    </div>
  );
}
