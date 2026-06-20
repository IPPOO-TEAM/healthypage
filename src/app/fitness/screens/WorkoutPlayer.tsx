import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, SkipForward, X, Check, ChevronLeft, Dumbbell, Sparkles } from 'lucide-react';
import { exercises, type Program } from '../data';
import { addXP, bumpStreakOnActivity, setState, type LoggedExercise, type LoggedSet } from '../store';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

const exerciseImageByGroup: Record<string, string> = {
  legs: 'https://images.unsplash.com/photo-1574679626212-7d11aa571832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  chest: 'https://images.unsplash.com/photo-1662386392891-688364c5a5d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  back: 'https://images.unsplash.com/photo-1775993699105-4d18bcac7e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  shoulders: 'https://images.unsplash.com/photo-1628257088739-3abca4744d8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  arms: 'https://images.unsplash.com/photo-1770493895453-4f758c40d11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  core: 'https://images.unsplash.com/photo-1640262653851-103cbaf802d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  cardio: 'https://images.unsplash.com/photo-1758274525958-4a7e209a1e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  mobility: 'https://images.unsplash.com/photo-1758599879927-f60878034fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  fullbody: 'https://images.unsplash.com/photo-1574679626212-7d11aa571832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
};

type FlatItem = {
  exerciseId: string;
  sets: number;
  repsLabel?: string;
  durationSec?: number;
  restSec: number;
  blockType: string;
};

export function WorkoutPlayer({ program, dayIndex, onClose }: { program: Program; dayIndex: number; onClose: () => void }) {
  const day = program.days[dayIndex];

  const items: FlatItem[] = useMemo(() => {
    const out: FlatItem[] = [];
    for (const block of day.blocks) {
      for (const e of block.exercises) {
        out.push({
          exerciseId: e.id,
          sets: e.sets || 1,
          repsLabel: e.reps,
          durationSec: e.durationSec,
          restSec: e.restSec,
          blockType: block.type,
        });
      }
    }
    return out;
  }, [day]);

  const [idx, setIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [resting, setResting] = useState(false);
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(items[0]?.durationSec ?? 0);
  const [logged, setLogged] = useState<Record<string, LoggedSet[]>>({});
  const [done, setDone] = useState(false);
  const [rpe, setRpe] = useState(7);
  const startRef = useRef(Date.now());

  const cur = items[idx];
  const ex = exercises.find((x) => x.id === cur?.exerciseId);

  useEffect(() => {
    if (!running || done) return;
    if (!resting && !cur?.durationSec) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          beep();
          if (resting) {
            advance();
            return 0;
          }
          if (cur?.durationSec) {
            advance();
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, resting, idx, setNum, done]);

  function beep() {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 400);
    } catch {}
  }

  function logCurrentSet(reps?: number, weight?: number) {
    if (!cur) return;
    setLogged((m) => {
      const arr = m[cur.exerciseId] ? [...m[cur.exerciseId]] : [];
      arr.push({ reps: reps ?? (parseInt(cur.repsLabel || '0', 10) || 0), weightKg: weight });
      return { ...m, [cur.exerciseId]: arr };
    });
  }

  function advance() {
    if (!cur) return;
    if (resting) {
      setResting(false);
      if (setNum < cur.sets) {
        setSetNum(setNum + 1);
        setSeconds(cur.durationSec ?? 0);
      } else {
        if (idx + 1 >= items.length) {
          finish();
          return;
        }
        setIdx(idx + 1);
        setSetNum(1);
        const nx = items[idx + 1];
        setSeconds(nx?.durationSec ?? 0);
      }
    } else {
      logCurrentSet();
      if (cur.restSec > 0 && (setNum < cur.sets || idx + 1 < items.length)) {
        setResting(true);
        setSeconds(cur.restSec);
      } else if (setNum < cur.sets) {
        setSetNum(setNum + 1);
        setSeconds(cur.durationSec ?? 0);
      } else if (idx + 1 < items.length) {
        setIdx(idx + 1);
        setSetNum(1);
        const nx = items[idx + 1];
        setSeconds(nx?.durationSec ?? 0);
      } else {
        finish();
      }
    }
  }

  function skip() { advance(); }

  function finish() {
    setDone(true);
  }

  function save() {
    const durationMin = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
    const exList: LoggedExercise[] = Object.entries(logged).map(([exerciseId, sets]) => ({ exerciseId, sets }));
    setState((s) => ({
      ...s,
      workouts: [
        { id: `w-${Date.now()}`, date: new Date().toISOString(), programId: program.id, dayIndex, durationMin, rpe, exercises: exList },
        ...s.workouts,
      ],
    }));
    bumpStreakOnActivity();
    addXP(50 + Math.min(50, exList.length * 5));
    onClose();
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Check className="w-12 h-12" />
          </motion.div>
          <h2 className="mt-6 tracking-tight" style={{ fontSize: 30, fontWeight: 800 }}>Bien joué !</h2>
          <p className="mt-2 text-white/85">Séance terminée. Comment t’es-tu senti ?</p>
          <div className="mt-8 w-full max-w-xs">
            <div className="text-xs uppercase tracking-wide text-white/75 mb-2">RPE — Effort perçu</div>
            <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(+e.target.value)} className="w-full accent-white" />
            <div className="flex justify-between text-xs text-white/75 mt-1"><span>Facile</span><span className="font-semibold">{rpe}/10</span><span>Très dur</span></div>
          </div>
        </div>
        <div className="p-5 space-y-2">
          <button onClick={save} className="w-full h-14 rounded-2xl bg-white text-emerald-700 font-semibold">Enregistrer la séance</button>
          <button onClick={onClose} className="w-full h-12 text-white/80 text-sm">Fermer sans enregistrer</button>
        </div>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.sets, 0);
  const passed = items.slice(0, idx).reduce((s, i) => s + i.sets, 0) + (setNum - 1);
  const progress = total ? passed / total : 0;

  const heroImg = ex ? exerciseImageByGroup[ex.group] || exerciseImageByGroup.fullbody : exerciseImageByGroup.fullbody;
  const totalSec = resting ? cur?.restSec || 0 : cur?.durationSec || 0;
  const timerProgress = totalSec ? 1 - seconds / totalSec : 0;
  const RING_R = 108;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <AnimatePresence mode="wait">
          <motion.div key={heroImg} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.35, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
            <ImageWithFallback src={heroImg} alt="" className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-400/25 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <header className="relative z-10 px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onClose} className="p-2 -ml-2"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-white/60">{day.name}</div>
          <div className="h-1.5 bg-white/10 rounded-full mt-1">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <button onClick={onClose} className="p-2 -mr-2"><X className="w-5 h-5" /></button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={`${idx}-${setNum}-${resting}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs uppercase tracking-wide text-white/80"
          >
            {resting ? <Sparkles className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
            {resting ? 'Repos' : labelBlock(cur?.blockType)}
          </motion.div>
          <h2 className="mt-3 tracking-tight" style={{ fontSize: 28, fontWeight: 800 }}>{resting ? 'Respire & récupère' : ex?.name}</h2>
          {!resting && (
            <div className="mt-1 text-white/70 text-sm">Série {setNum} / {cur?.sets} {cur?.repsLabel ? `· ${cur.repsLabel} reps` : ''}</div>
          )}

          <div className="mt-8 relative w-64 h-64 flex items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.35), rgba(20,184,166,0.0) 70%)' }}
              animate={resting ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } : { scale: [1, 1.04, 1], opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: resting ? 4 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-4 rounded-full border border-white/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            {(resting || cur?.durationSec) ? (
              <>
                <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="120" cy="120" r={RING_R} stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                  <motion.circle
                    cx="120" cy="120" r={RING_R}
                    stroke="url(#timerGrad)" strokeWidth="6" strokeLinecap="round" fill="none"
                    strokeDasharray={RING_C}
                    initial={false}
                    animate={{ strokeDashoffset: RING_C * (1 - timerProgress) }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                  />
                  <defs>
                    <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative">
                  <motion.div
                    key={seconds}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-bold tracking-tight tabular-nums"
                    style={{ fontSize: 64 }}
                  >
                    {seconds}
                  </motion.div>
                  <div className="text-white/70 text-sm">secondes</div>
                </div>
              </>
            ) : (
              <motion.div
                className="relative text-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-3">
                  <Dumbbell className="w-9 h-9 text-emerald-300" />
                </div>
                <div className="font-bold" style={{ fontSize: 38 }}>{cur?.repsLabel}</div>
                <div className="text-white/70 text-sm">répétitions</div>
              </motion.div>
            )}
          </div>

          {ex && !resting && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 max-w-xs text-sm text-white/80 px-4 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10"
            >
              {ex.cues[0]}
            </motion.div>
          )}
          {resting && (
            <div className="mt-6 max-w-xs text-sm text-white/70">Inspire profondément, relâche les épaules.</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 p-5 space-y-3">
        <div className="flex gap-3">
          <button onClick={() => setRunning((r) => !r)} className="flex-1 h-14 rounded-2xl bg-white/10 backdrop-blur font-semibold inline-flex items-center justify-center gap-2">
            {running ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Reprendre</>}
          </button>
          <button onClick={skip} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center"><SkipForward className="w-5 h-5" /></button>
        </div>
        {!resting && !cur?.durationSec && (
          <button onClick={advance} className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold">
            Série terminée <Check className="w-5 h-5 inline ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}

function labelBlock(b?: string) {
  const m: Record<string, string> = { warmup: 'Échauffement', main: 'Principal', finisher: 'Finisher', cooldown: 'Retour au calme' };
  return b ? m[b] || b : '';
}
