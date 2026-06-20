import { ArrowLeft, Sparkles, Clock, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface Props { onBack: () => void; }

const SESSIONS = [
  { title: 'Réveil énergique', duration: '15 min', level: 'Débutant', poses: 8, color: 'amber' },
  { title: 'Relaxation profonde', duration: '20 min', level: 'Tous niveaux', poses: 6, color: 'indigo' },
  { title: 'Salutation au soleil', duration: '12 min', level: 'Intermédiaire', poses: 12, color: 'orange' },
  { title: 'Yoga doux du soir', duration: '25 min', level: 'Débutant', poses: 7, color: 'purple' },
  { title: 'Hatha posture', duration: '30 min', level: 'Intermédiaire', poses: 10, color: 'teal' }
];

export default function YogaScreen({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Sparkles className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Yoga</h2>
            <p className="text-sm text-white/85">Séances guidées pour corps et esprit</p>
          </div>
        </div>
      </div>

      <div className="relative h-36 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1080" alt="Yoga" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Postures, souffle, présence · alignement du corps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SESSIONS.map((s, i) => (
          <motion.button
            key={s.title}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`bg-${s.color}-50 p-3 rounded-xl`}>
                <Sparkles className={`w-5 h-5 text-${s.color}-600`} />
              </div>
              <button className={`bg-${s.color}-600 text-white p-2 rounded-xl`}>
                <Play className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-semibold text-gray-900">{s.title}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
              <span>•</span>
              <span>{s.poses} postures</span>
              <span>•</span>
              <span>{s.level}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
