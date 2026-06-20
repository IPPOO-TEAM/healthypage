import { useEffect, useState } from 'react';
import { ArrowLeft, Wind, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

const PHASES: { name: string; sec: number; scale: number }[] = [
  { name: 'Inspirez', sec: 4, scale: 1.4 },
  { name: 'Retenez', sec: 4, scale: 1.4 },
  { name: 'Expirez', sec: 6, scale: 0.7 }
];

export default function ExercicesRespirationScreen({ onBack }: Props) {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(PHASES[0].sec);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => {
            const next = (p + 1) % PHASES.length;
            if (next === 0) setCycles((x) => x + 1);
            return next;
          });
          return PHASES[(phase + 1) % PHASES.length].sec;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase]);

  const reset = () => { setRunning(false); setPhase(0); setCount(PHASES[0].sec); setCycles(0); };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-cyan-700 to-teal-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Wind className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Respiration guidée</h2>
            <p className="text-sm text-white/85">Cycle 4-4-6 pour la cohérence cardiaque</p>
          </div>
        </div>
      </div>

      <div className="relative h-36 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080" alt="Respiration" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Cohérence cardiaque · l'air comme remède</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center">
        <motion.div
          className="w-56 h-56 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-2xl"
          animate={{ scale: running ? PHASES[phase].scale : 1 }}
          transition={{ duration: PHASES[phase].sec, ease: 'easeInOut' }}
        >
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-white/85">{PHASES[phase].name}</p>
            <p className="text-6xl font-bold mt-1">{count}</p>
          </div>
        </motion.div>

        <p className="mt-5 text-gray-500 text-sm">Cycles complétés : <span className="font-semibold text-teal-700">{cycles}</span></p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setRunning((r) => !r)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 shadow"
          >
            {running ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Démarrer</>}
          </button>
          <button onClick={reset} className="bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl inline-flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5">
        <h3 className="font-semibold text-cyan-900 mb-2">Bénéfices</h3>
        <ul className="text-sm text-cyan-800 space-y-1.5">
          <li>• Réduit le cortisol (hormone du stress)</li>
          <li>• Améliore la concentration</li>
          <li>• Stabilise la fréquence cardiaque</li>
          <li>• Favorise un meilleur sommeil</li>
        </ul>
      </div>
    </div>
  );
}
