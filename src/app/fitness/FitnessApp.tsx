import { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Dumbbell, Apple, BarChart3, User, ArrowLeft } from 'lucide-react';
import { useStore } from './store';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Training } from './screens/Training';
import { WorkoutPlayer } from './screens/WorkoutPlayer';
import { Nutrition } from './screens/Nutrition';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';
import type { Program } from './data';

type Tab = 'home' | 'train' | 'nutrition' | 'stats' | 'profile';

export default function FitnessApp() {
  const onboarded = useStore((s) => s.onboarded);
  const [tab, setTab] = useState<Tab>('home');
  const [player, setPlayer] = useState<{ program: Program; dayIndex: number } | null>(null);

  if (!onboarded) return <Onboarding />;

  const goTab = (t: 'train' | 'nutrition' | 'stats' | 'profile') => setTab(t);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <a
        href="/landing"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-1 px-3 h-9 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm"
        aria-label="Retour à HEALTHY PAGE"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> HEALTHY PAGE
      </a>
      <main>
        {tab === 'home' && <Dashboard onGo={goTab} />}
        {tab === 'train' && <Training onPlay={(p, d) => setPlayer({ program: p, dayIndex: d })} />}
        {tab === 'nutrition' && <Nutrition />}
        {tab === 'stats' && <Stats />}
        {tab === 'profile' && <Profile />}
      </main>

      <BottomNav tab={tab} onChange={setTab} />

      {player && <WorkoutPlayer program={player.program} dayIndex={player.dayIndex} onClose={() => setPlayer(null)} />}
    </div>
  );
}

function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'train', icon: Dumbbell, label: 'Entraînement' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} className="relative flex-1 flex flex-col items-center gap-0.5 py-2">
              {active && <motion.span layoutId="navpill" className="absolute inset-x-3 top-0 h-0.5 bg-emerald-500 rounded-full" />}
              <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] ${active ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
