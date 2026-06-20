import { ArrowLeft, Brain, Headphones, Sparkles, Wind, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const TECHNIQUES = [
  { icon: Wind, color: 'cyan', title: 'Cohérence cardiaque', desc: '5 min · 6 respirations/min', target: 'respiration' },
  { icon: Sparkles, color: 'purple', title: 'Méditation guidée', desc: '10 min · pleine conscience' },
  { icon: Music, color: 'rose', title: 'Sons relaxants', desc: '15 min · ambiance nature' },
  { icon: Headphones, color: 'amber', title: 'Hypnose douce', desc: '20 min · détente profonde' }
];

export default function GestionStressScreen({ onBack, onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Brain className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Gestion du stress</h2>
            <p className="text-sm text-white/85">Techniques pour retrouver le calme</p>
          </div>
        </div>
      </div>

      <div className="relative h-36 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1080" alt="Sérénité" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Respirer, ralentir · retrouver le calme intérieur</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">Niveau de stress aujourd'hui</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
              initial={{ width: 0 }} animate={{ width: '55%' }}
              transition={{ duration: 0.9 }}
            />
          </div>
          <span className="font-semibold text-amber-700">Modéré</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TECHNIQUES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.title}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => t.target && onNavigate?.(t.target)}
              className="bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
            >
              <div className={`bg-${t.color}-50 p-3 rounded-xl w-fit`}>
                <Icon className={`w-6 h-6 text-${t.color}-600`} />
              </div>
              <h4 className="font-semibold text-gray-900 mt-3">{t.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
