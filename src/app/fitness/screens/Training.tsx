import { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Clock, Filter, Search, ChevronRight, Heart, X, Check, AlertTriangle } from 'lucide-react';
import { exercises, programs, type Exercise, type Program } from '../data';
import { useStore, setState } from '../store';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

const exerciseImageByGroup: Record<string, string> = {
  legs: 'https://images.unsplash.com/photo-1574679626212-7d11aa571832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  chest: 'https://images.unsplash.com/photo-1662386392891-688364c5a5d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  back: 'https://images.unsplash.com/photo-1775993699105-4d18bcac7e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  shoulders: 'https://images.unsplash.com/photo-1628257088739-3abca4744d8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  arms: 'https://images.unsplash.com/photo-1770493895453-4f758c40d11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  core: 'https://images.unsplash.com/photo-1640262653851-103cbaf802d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  cardio: 'https://images.unsplash.com/photo-1758274525958-4a7e209a1e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  mobility: 'https://images.unsplash.com/photo-1758599879927-f60878034fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  fullbody: 'https://images.unsplash.com/photo-1574679626212-7d11aa571832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
};

type Tab = 'today' | 'programs' | 'library';

export function Training({ onPlay }: { onPlay: (program: Program, dayIndex: number) => void }) {
  const [tab, setTab] = useState<Tab>('today');
  const activeId = useStore((s) => s.activeProgramId);
  const program = programs.find((p) => p.id === activeId) || programs[0];

  return (
    <div className="pb-28">
      <header className="px-5 pt-12 pb-4">
        <h1 className="tracking-tight" style={{ fontSize: 28, fontWeight: 800 }}>Entraînement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Choisis ta séance ou explore les exercices.</p>
      </header>

      <div className="px-5">
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 text-sm">
          {(['today', 'programs', 'library'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-10 rounded-xl font-medium ${tab === t ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600' : 'text-slate-500'}`}
            >
              {t === 'today' ? 'Aujourd’hui' : t === 'programs' ? 'Programmes' : 'Bibliothèque'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        {tab === 'today' && <TodayView program={program} onPlay={onPlay} />}
        {tab === 'programs' && <ProgramsView />}
        {tab === 'library' && <LibraryView />}
      </div>
    </div>
  );
}

function TodayView({ program, onPlay }: { program: Program; onPlay: (p: Program, d: number) => void }) {
  const workouts = useStore((s) => s.workouts);
  const dayIndex = workouts.length % program.days.length;
  const day = program.days[dayIndex];

  const totalEx = day.blocks.reduce((sum, b) => sum + b.exercises.length, 0);
  const estMin = day.blocks.reduce((sum, b) => sum + b.exercises.reduce((s, e) => s + ((e.sets || 1) * ((e.durationSec || 30) + e.restSec)) / 60, 0), 0);

  return (
    <div className="space-y-4">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5">
        <div className="text-xs uppercase tracking-wide opacity-80">Séance du jour</div>
        <h2 className="mt-1 tracking-tight" style={{ fontSize: 24, fontWeight: 800 }}>{day.name}</h2>
        <div className="mt-3 flex gap-3 text-sm">
          <span className="inline-flex items-center gap-1"><Dumbbell className="w-4 h-4" /> {totalEx} exercices</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> ~{Math.round(estMin)} min</span>
        </div>
        <button
          onClick={() => onPlay(program, dayIndex)}
          className="mt-5 w-full h-12 rounded-2xl bg-white text-emerald-700 font-semibold"
        >
          Commencer la séance
        </button>
      </motion.div>

      <div>
        <h3 className="font-semibold mb-3">Au programme</h3>
        <div className="space-y-2">
          {day.blocks.map((b, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>{b.type === 'warmup' ? 'Échauffement' : b.type === 'main' ? 'Principal' : b.type === 'finisher' ? 'Finisher' : 'Retour au calme'}</span>
                <span>{b.exercises.length} ex.</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {b.exercises.map((e, j) => {
                  const ex = exercises.find((x) => x.id === e.id);
                  if (!ex) return null;
                  return (
                    <li key={j} className="flex justify-between">
                      <span>{ex.name}</span>
                      <span className="text-slate-500">{e.sets ? `${e.sets}×${e.reps || `${e.durationSec}s`}` : `${e.durationSec}s`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramsView() {
  const activeId = useStore((s) => s.activeProgramId);
  const setActive = (id: string) => setState((s) => ({ ...s, activeProgramId: id, programStartDate: new Date().toISOString() }));

  const programImgs = [
    'https://images.unsplash.com/photo-1758274525958-4a7e209a1e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1574679626212-7d11aa571832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1758599879927-f60878034fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1662386392891-688364c5a5d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  ];

  return (
    <div className="space-y-3">
      {programs.map((p, i) => (
        <button key={p.id} onClick={() => setActive(p.id)} className="w-full text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="relative aspect-[16/8]">
            <ImageWithFallback src={programImgs[i % programImgs.length]} alt={p.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-emerald-700">
              <Dumbbell className="w-3 h-3" /> {p.level === 'beginner' ? 'Débutant' : p.level === 'intermediate' ? 'Inter.' : 'Avancé'}
            </div>
            {activeId === p.id && (
              <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-semibold shadow-sm">Actif</span>
            )}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="font-semibold tracking-tight" style={{ fontSize: 16 }}>{p.title}</div>
              <div className="text-xs text-white/85">{p.weeks} sem · {p.daysPerWeek}j/sem</div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function LibraryView() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [open, setOpen] = useState<Exercise | null>(null);
  const favorites = useStore((s) => s.favorites);

  const list = exercises.filter((e) =>
    (group ? e.group === group : true) &&
    (q ? e.name.toLowerCase().includes(q.toLowerCase()) : true)
  );

  const groups = ['legs', 'chest', 'back', 'shoulders', 'arms', 'core', 'cardio', 'mobility', 'fullbody'];

  const toggleFav = (id: string) => setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }));

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher" className="w-full h-11 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" />
        </div>
        <button className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center"><Filter className="w-4 h-4" /></button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Chip active={!group} onClick={() => setGroup(null)}>Tous</Chip>
        {groups.map((g) => <Chip key={g} active={group === g} onClick={() => setGroup(g)}>{labelGroup(g)}</Chip>)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {list.map((e) => (
          <button key={e.id} onClick={() => setOpen(e)} className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
              <ImageWithFallback
                src={exerciseImageByGroup[e.group] || exerciseImageByGroup.fullbody}
                alt={e.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{e.name}</div>
              <div className="text-xs text-slate-500">{labelGroup(e.group)} · {labelEquip(e.equipment)} · {'•'.repeat(e.difficulty)}</div>
            </div>
            <button onClick={(ev) => { ev.stopPropagation(); toggleFav(e.id); }} className="p-2 -mr-1">
              <Heart className={`w-5 h-5 ${favorites.includes(e.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
            </button>
          </button>
        ))}
      </div>

      {open && <ExerciseSheet exercise={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function ExerciseSheet({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="relative w-full max-h-[85vh] bg-white dark:bg-slate-950 rounded-t-3xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="tracking-tight" style={{ fontSize: 22, fontWeight: 800 }}>{exercise.name}</h2>
              <div className="text-xs text-slate-500 mt-1">{labelGroup(exercise.group)} · {labelEquip(exercise.equipment)}</div>
            </div>
            <button onClick={onClose} className="p-2 -m-2"><X className="w-5 h-5" /></button>
          </div>
          <div className="mt-4 aspect-video rounded-2xl overflow-hidden relative">
            <ImageWithFallback
              src={exerciseImageByGroup[exercise.group] || exerciseImageByGroup.fullbody}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> {labelGroup(exercise.group)}
            </div>
          </div>
          <div className="mt-5">
            <h3 className="font-semibold text-sm mb-2">Points clés</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {exercise.cues.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          {exercise.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2">Erreurs fréquentes</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {exercise.errors.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 h-8 rounded-full text-xs whitespace-nowrap border ${active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>{children}</button>
  );
}

function labelGroup(g: string) {
  const m: Record<string, string> = { legs: 'Jambes', chest: 'Pecs', back: 'Dos', shoulders: 'Épaules', arms: 'Bras', core: 'Abdos', cardio: 'Cardio', mobility: 'Mobilité', fullbody: 'Full body' };
  return m[g] || g;
}
function labelEquip(e: string) {
  const m: Record<string, string> = { bodyweight: 'Sans matériel', dumbbell: 'Haltères', band: 'Élastique', machine: 'Machine', barbell: 'Barre', mat: 'Tapis' };
  return m[e] || e;
}
