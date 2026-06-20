import { ArrowLeft, Sparkles, Brain, Heart, Apple, Moon, Activity, Droplets, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const CONSEILS = [
  { icon: Moon, color: 'indigo', title: 'Améliorer votre sommeil', text: 'Vos données indiquent un sommeil irrégulier. Essayez de vous coucher avant 23h pendant 7 jours.', tag: 'Sommeil', target: 'sommeil' },
  { icon: Apple, color: 'emerald', title: 'Variez vos protéines', text: 'Augmentez votre consommation de poisson et de légumineuses pour mieux équilibrer vos repas.', tag: 'Nutrition', target: 'nutrition' },
  { icon: Activity, color: 'orange', title: '30 minutes de marche', text: 'Une marche quotidienne stabiliserait votre tension. À privilégier en fin de journée.', tag: 'Activité', target: 'activite' },
  { icon: Droplets, color: 'cyan', title: 'Buvez plus d\'eau', text: 'Objectif 1,8 L par jour. Activez les rappels d\'hydratation dans les paramètres.', tag: 'Hydratation' },
  { icon: Brain, color: 'rose', title: 'Cohérence cardiaque', text: '3 séances de 5 minutes par jour pour réduire votre stress.', tag: 'Stress', target: 'respiration' },
  { icon: Heart, color: 'pink', title: 'Suivi tension', text: 'Mesurez votre tension matin et soir pendant 7 jours pour confirmer la tendance.', tag: 'Cardio' }
];

export default function ConseilsPersonnalisesScreen({ onBack, onNavigate }: Props) {
  const list = isDemoPatient() ? CONSEILS : [];
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1758885428976-dd612a7f3046?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Sparkles className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Conseils personnalisés</h2>
            <p className="text-sm text-white/85">Recommandations IA basées sur vos données</p>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-xl"><Sparkles className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-teal-900 font-semibold">{list.length} conseils pour vous aujourd'hui</p>
            <p className="text-xs text-teal-700">Mis à jour ce matin</p>
          </div>
        </div>
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucun conseil disponible pour le moment.</p>
          <p className="text-xs text-gray-400 mt-1">Renseignez vos données de santé pour des conseils personnalisés.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`bg-${c.color}-50 p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 text-${c.color}-600`} />
                </div>
                <div className="flex-1">
                  <span className={`bg-${c.color}-50 text-${c.color}-700 text-xs px-2 py-0.5 rounded-full`}>{c.tag}</span>
                  <h4 className="font-semibold text-gray-900 mt-1">{c.title}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600">{c.text}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                {c.target && (
                  <button
                    onClick={() => onNavigate?.(c.target!)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium py-2 rounded-lg"
                  >
                    En savoir plus
                  </button>
                )}
                <button className="bg-teal-600 text-white p-2 rounded-lg" aria-label="Utile">
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
