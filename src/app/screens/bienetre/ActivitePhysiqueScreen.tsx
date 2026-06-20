import { ArrowLeft, Activity, Footprints, Flame, Trophy, Play, Home, Droplet, Heart, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

const PROGRAMS = [
  { name: 'Marche rapide', duration: '30 min', kcal: 180, progress: 60, distance: '3.8 km', steps: '5 000', goal: '7 000' },
  { name: 'HIIT', duration: '15 min', kcal: 220, progress: 45, distance: ', ', steps: ', ', goal: ', ' },
  { name: 'Vélo', duration: '45 min', kcal: 380, progress: 80, distance: '12 km', steps: ', ', goal: '15 km' }
];

const PREVIOUS = [
  { pct: 70, label: '12 séances complétées', sub: '12/20 cette semaine' },
  { pct: 92, label: 'Objectif pas atteint', sub: '6/7 jours' }
];

export default function ActivitePhysiqueScreen({ onBack }: Props) {
  const active = PROGRAMS[0];
  return (
    <div className="space-y-5 -mx-4 -my-4 px-4 py-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white">
      <div className="relative rounded-3xl overflow-hidden h-72 shadow-2xl">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="absolute bottom-5 left-5">
          <p className="text-sm text-cyan-100/80">Salut Dany,</p>
          <h2 className="text-3xl text-white">Bienvenue !</h2>
        </div>
      </div>

      <div>
        <h3 className="text-base text-white mb-3">Ma forme</h3>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/80">Stats hebdo</p>
            <button className="w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center">+</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Footprints, label: 'Pas', value: '7,2k' },
              { icon: Flame, label: 'Kcal', value: '312' },
              { icon: Heart, label: 'BPM', value: '72' },
              { icon: Zap, label: 'Énergie', value: '8.4' }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="text-[10px] text-white/60">{s.label}</span>
                  <span className="text-xs text-white">{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base text-white mb-3">Tâche active</h3>
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur border border-cyan-400/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-white/70">{active.duration}</p>
              <h4 className="text-2xl text-white mt-0.5">{active.name}</h4>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 text-[10px] flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Série 60%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px]">
                  Progression {active.progress}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-white/60 text-[10px]">Distance</p>
                  <p className="text-white">{active.distance} extérieur</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-white/60 text-[10px]">Objectif pas</p>
                  <p className="text-white">{active.steps}/{active.goal}</p>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-cyan-400/40 flex flex-col items-center justify-center">
              <span className="text-xl text-white">{active.progress}%</span>
              <span className="text-[9px] text-white/60">Progrès</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base text-white">Tâches précédentes</h3>
          <button className="text-xs text-cyan-300">Voir tout</button>
        </div>
        <div className="space-y-2">
          {PREVIOUS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray={`${(p.pct / 100) * 94} 94`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">{p.pct}%</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{p.label}</p>
                <p className="text-xs text-white/60">{p.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base text-white">Programmes recommandés</h3>
        {PROGRAMS.slice(1).map((p) => (
          <button key={p.name} className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center">
              <Play className="w-4 h-4 text-cyan-300 fill-cyan-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{p.name}</p>
              <p className="text-[11px] text-white/60">{p.duration} · {p.kcal} kcal</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-white/40 pt-2 flex items-center justify-center gap-1">
        <Activity className="w-3 h-3" /> Tracking santé · données locales
        <Droplet className="w-3 h-3 ml-1" /> <Trophy className="w-3 h-3" />
      </p>
    </div>
  );
}
