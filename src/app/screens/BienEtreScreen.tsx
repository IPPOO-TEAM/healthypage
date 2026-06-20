import {
  Heart,
  Moon,
  Activity,
  Apple,
  Brain,
  Wind,
  Target,
  TrendingUp,
  Play,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';

interface BienEtreProps { onNavigate?: (screen: string) => void; }

export default function BienEtreScreen({ onNavigate }: BienEtreProps = {}) {
  const sommeilData = [
    { jour: 'Lun', heures: 7 },
    { jour: 'Mar', heures: 6.5 },
    { jour: 'Mer', heures: 7.5 },
    { jour: 'Jeu', heures: 8 },
    { jour: 'Ven', heures: 7 },
    { jour: 'Sam', heures: 8.5 },
    { jour: 'Dim', heures: 7.5 }
  ];

  const modules = [
    {
      id: 'nutrition',
      titre: 'Nutrition',
      icon: Apple,
      color: 'green',
      stats: '1,850 cal',
      objectif: '2,000 cal',
      progression: 92,
      description: 'Suivi alimentaire quotidien'
    },
    {
      id: 'activite',
      titre: 'Activité physique',
      icon: Activity,
      color: 'orange',
      stats: '5,200 pas',
      objectif: '8,000 pas',
      progression: 65,
      description: 'Restez actif au quotidien'
    },
    {
      id: 'stress',
      titre: 'Gestion du stress',
      icon: Brain,
      color: 'purple',
      stats: '3/5',
      objectif: 'Niveau modéré',
      progression: 60,
      description: 'Techniques de relaxation'
    },
    {
      id: 'respiration',
      titre: 'Exercices de respiration',
      icon: Wind,
      color: 'cyan',
      stats: '2 séances',
      objectif: 'aujourd\'hui',
      progression: 100,
      description: 'Cohérence cardiaque'
    }
  ];

  const programmes = [
    {
      id: 1,
      titre: 'Programme anti-stress',
      duree: '21 jours',
      progression: 45,
      sessions: '10/21',
      icone: Brain,
      color: 'purple'
    },
    {
      id: 2,
      titre: 'Yoga pour débutants',
      duree: '30 jours',
      progression: 20,
      sessions: '6/30',
      icone: Activity,
      color: 'pink'
    },
    {
      id: 3,
      titre: 'Améliorer son sommeil',
      duree: '14 jours',
      progression: 70,
      sessions: '10/14',
      icone: Moon,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg h-64 sm:h-52">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1668780984466-d169e9e84b53?w=1080&q=80"
          alt="Yoga et bien-être"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/85 via-teal-800/60 to-cyan-700/30"></div>
        <div className="relative h-full p-6 text-white flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs uppercase tracking-widest text-teal-100">Bien-être</span>
            <div className="bg-white/20 backdrop-blur p-2 rounded-xl ring-1 ring-white/30">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Cultivez votre équilibre</h2>
            <p className="text-sm text-teal-50 mt-1 max-w-md">
              Prenez soin de votre santé mentale et physique au quotidien
            </p>
          </div>
        </div>
      </motion.div>

      {/* Score bien-être global */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Score bien-être</h3>
            <p className="text-teal-100 text-sm">Moyenne hebdomadaire</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold">78</span>
          <span className="text-2xl text-teal-100 mb-2">/100</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <TrendingUp className="w-4 h-4 text-teal-100" />
          <span className="text-sm text-teal-100">+5 points cette semaine</span>
        </div>
      </div>

      {/* Thematic visual cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl shadow-sm h-56 sm:h-40 group cursor-pointer">
          <ImageWithFallback
            src={IMAGES.bienetreNutrition}
            alt="Nutrition saine"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-xs uppercase tracking-wider text-emerald-100">Nutrition</p>
            <h4 className="font-bold">Manger coloré</h4>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-sm h-56 sm:h-40 group cursor-pointer">
          <ImageWithFallback
            src={IMAGES.bienetreRunning}
            alt="Activité physique"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-800/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-xs uppercase tracking-wider text-orange-100">Fitness</p>
            <h4 className="font-bold">Bouger chaque jour</h4>
          </div>
        </div>
      </div>

      {/* Modules principaux */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              onClick={() => onNavigate?.(module.id)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-600 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`bg-${module.color}-50 p-3 rounded-xl`}>
                    <Icon className={`w-5 h-5 text-${module.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{module.titre}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aujourd'hui</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {module.stats} <span className="text-gray-500">/ {module.objectif}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`bg-${module.color}-600 h-2 rounded-full transition-all`}
                    style={{ width: `${module.progression}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Graphique sommeil */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Moon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Suivi du sommeil</h3>
              <p className="text-xs text-gray-500">7 derniers jours</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">7h30</span>
        </div>

        <motion.div
          className="h-48"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sommeilData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis key="x" dataKey="jour" stroke="#9ca3af" fontSize={12} />
              <YAxis key="y" stroke="#9ca3af" fontSize={12} domain={[0, 10]} />
              <Tooltip
                key="tooltip"
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}h`, 'Sommeil']}
              />
              <Bar
                key="bar"
                dataKey="heures"
                fill="#06b6d4"
                radius={[8, 8, 0, 0]}
                isAnimationActive
                animationBegin={200}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-900">
            💡 Objectif atteint ! Maintenez cette routine de sommeil.
          </p>
        </div>
      </div>

      {/* Programmes en cours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Mes programmes</h3>
          <button className="text-sm text-teal-600 font-medium hover:text-teal-700">
            Explorer +
          </button>
        </div>

        {programmes.map((programme) => {
          const Icon = programme.icone;
          return (
            <div
              key={programme.id}
              onClick={() => {
                const t = programme.titre.toLowerCase();
                if (t.includes('yoga')) onNavigate?.('yoga');
                else if (t.includes('sommeil')) onNavigate?.('sommeil');
                else if (t.includes('stress')) onNavigate?.('stress');
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md"
            >
              <div className={`h-1 bg-${programme.color}-600`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`bg-${programme.color}-50 p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${programme.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{programme.titre}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{programme.duree}</span>
                        <span>•</span>
                        <span>{programme.sessions} séances</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                    <Play className="w-5 h-5 text-teal-600" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-semibold text-gray-900">{programme.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`bg-${programme.color}-600 h-2 rounded-full transition-all`}
                      style={{ width: `${programme.progression}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercices rapides */}
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <ImageWithFallback
          src={IMAGES.bienetreMeditation}
          alt="Méditation"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/95 via-cyan-800/90 to-blue-900/85"></div>
        <div className="relative p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur ring-1 ring-white/30 p-2 rounded-lg">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Exercice de respiration</h3>
            <p className="text-xs text-cyan-100">5 minutes de cohérence cardiaque</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/15 backdrop-blur ring-1 ring-white/20 p-3 rounded-lg text-center">
            <p className="text-xs text-cyan-100 mb-1">Inspirer</p>
            <p className="text-lg font-bold">5s</p>
          </div>
          <div className="bg-white/15 backdrop-blur ring-1 ring-white/20 p-3 rounded-lg text-center">
            <p className="text-xs text-cyan-100 mb-1">Retenir</p>
            <p className="text-lg font-bold">5s</p>
          </div>
          <div className="bg-white/15 backdrop-blur ring-1 ring-white/20 p-3 rounded-lg text-center">
            <p className="text-xs text-cyan-100 mb-1">Expirer</p>
            <p className="text-lg font-bold">5s</p>
          </div>
        </div>

        <button className="w-full bg-white text-cyan-700 py-3 rounded-xl hover:bg-cyan-50 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg">
          <Play className="w-5 h-5" />
          Commencer la séance
        </button>
        </div>
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Conseils personnalisés</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Apple className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Nutrition équilibrée</p>
              <p className="text-sm text-gray-600">
                Ajoutez plus de fruits et légumes à votre alimentation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Activité physique</p>
              <p className="text-sm text-gray-600">
                30 minutes de marche quotidienne recommandées
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Santé mentale</p>
              <p className="text-sm text-gray-600">
                Pratiquez la méditation 10 minutes par jour
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
