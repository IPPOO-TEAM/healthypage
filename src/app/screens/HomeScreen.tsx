import {
  Bell,
  Calendar,
  Activity,
  Heart,
  MapPin,
  AlertCircle,
  TrendingUp,
  Droplet,
  Moon,
  Smile,
  Sparkles,
  Map as MapIcon,
  Leaf,
  PhoneCall,
  Bus,
  Ambulance,
  Hotel,
  Baby,
  Globe,
  Building2,
  Heart as HeartIcon,
  FlaskConical,
  Wallet,
  Pill,
  Trees,
  Activity as ActivityIcon,
  User as UserIcon,
  Headphones,
  Radio,
  Plane,
  Siren,
  Gamepad2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { CmsBanner } from '../components/CmsBanner';
import { useCms } from '../components/cms';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [firstName, setFirstName] = useState<string>('');
  const cms = useCms();
  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    api.getPatient(pid).then((res: any) => {
      setFirstName(res?.patient?.firstName ?? '');
    }).catch(() => {});
  }, []);
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (cms.maintenanceMode) {
    return (
      <div className="bg-amber-50 ring-1 ring-amber-200 rounded-2xl p-6 text-center">
        <p className="text-2xl">🛠️</p>
        <h2 className="font-bold text-amber-900 mt-2">Maintenance en cours</h2>
        <p className="text-sm text-amber-800 mt-1">
          L'application est temporairement indisponible. Merci de réessayer dans quelques minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CmsBanner />
      {cms.hero.active && (cms.hero.title || cms.hero.subtitle) && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-6 shadow-lg">
          {cms.hero.eyebrow && <p className="text-xs uppercase tracking-widest text-white/80">{cms.hero.eyebrow}</p>}
          {cms.hero.title && <h2 className="text-2xl font-bold mt-1">{cms.hero.title}</h2>}
          {cms.hero.subtitle && <p className="text-sm text-white/85 mt-1">{cms.hero.subtitle}</p>}
        </div>
      )}
      {/* Hero Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1751580471264-7f8cd53d82d8?w=1080&q=80"
          alt="Bien-être au quotidien"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/75 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Bonjour{firstName ? `, ${firstName}` : ''} 👋</h2>
              <p className="text-sm text-teal-50 mt-1 capitalize">{today}</p>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors ring-1 ring-white/30"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 ring-1 ring-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white text-teal-700 rounded-full p-2">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">État de santé global</h3>
                <p className="text-xs text-teal-50">Score quotidien IA</p>
              </div>
              <span className="ml-auto text-2xl font-bold">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <span className="text-xs font-semibold bg-emerald-400/30 px-2 py-0.5 rounded-full">Bien</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Droplet className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-600">Hydratation</span>
          </div>
          <p className="text-xl font-bold text-gray-900">6/8</p>
          <p className="text-xs text-gray-500">verres</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-50 p-2 rounded-lg">
              <Moon className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">Sommeil</span>
          </div>
          <p className="text-xl font-bold text-gray-900">7h30</p>
          <p className="text-xs text-gray-500">cette nuit</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Activité</span>
          </div>
          <p className="text-xl font-bold text-gray-900">5,200</p>
          <p className="text-xs text-gray-500">pas</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-50 p-2 rounded-lg">
              <Smile className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs text-gray-600">Humeur</span>
          </div>
          <p className="text-xl font-bold text-gray-900">8/10</p>
          <p className="text-xs text-gray-500">positive</p>
        </div>
      </div>

      {/* Prochain RDV */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-teal-600">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-teal-50 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Prochain rendez-vous</h3>
              <p className="text-sm text-gray-600">Dr. Camara, Médecin généraliste</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
                  Mardi 6 Mai, 14:30
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Centre Médical d'Akpakpa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes & Rappels */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">Rappel important</h3>
            <p className="text-sm text-amber-800">
              Prise de médicament : Amoxicilline 500mg à 20h00
            </p>
            <button className="mt-2 text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
              Confirmer la prise
            </button>
          </div>
        </div>
      </div>

      {/* Conseils IA */}
      <div className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1 h-56 md:h-auto relative">
            <ImageWithFallback
              src={IMAGES.homeAdvice}
              alt="Conseils personnalisés"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
          <div className="md:col-span-2 p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-teal-600 text-white p-2 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Conseils personnalisés</h3>
            <p className="text-xs text-gray-600">Générés par IA</p>
          </div>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-teal-600 font-bold">•</span>
            <span>Votre sommeil s'améliore ! Continuez à vous coucher avant 23h.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-teal-600 font-bold">•</span>
            <span>Pensez à augmenter votre hydratation, objectif : 2L par jour.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-teal-600 font-bold">•</span>
            <span>Vaccin contre la grippe recommandé ce mois-ci.</span>
          </li>
        </ul>
          </div>
        </div>
      </div>

      {/* Family Wellness Banner */}
      <div className="relative overflow-hidden rounded-2xl shadow-sm h-60 sm:h-44">
        <ImageWithFallback
          src={IMAGES.homeFamily}
          alt="Famille en bonne santé"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-800/40 to-transparent"></div>
        <div className="relative h-full p-6 flex flex-col justify-end text-white">
          <h3 className="text-xl font-bold">Une santé pour toute la famille</h3>
          <p className="text-sm text-teal-50 mt-1 max-w-xs">
            Suivez le bien-être de vos proches dans une seule application.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
          className="grid grid-cols-2 gap-3">
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-2">
          <button
            onClick={() => onNavigate('profilSante')}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow hover:opacity-95 transition"
          >
            <UserIcon className="w-6 h-6" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Mon profil santé</p>
              <p className="text-[11px] opacity-90">Documents, antécédents, allergies, vaccins…</p>
            </div>
            <span className="text-lg">›</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('rdv')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
          >
            <MapPin className="w-6 h-6 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">Trouver un centre</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('examens')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Mes examens</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('ressentis')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
          >
            <Smile className="w-6 h-6 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">Mes ressentis</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('chat')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors"
          >
            <Heart className="w-6 h-6 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-900">Chat médical</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('alertes')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <span className="text-sm font-medium text-rose-900">Alertes</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('assistance')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Assistance</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button
            onClick={() => onNavigate('assurances')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Assurances</span>
          </button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onNavigate('conseils')}
            className="w-full flex flex-col items-center gap-2 p-4 bg-fuchsia-50 rounded-xl hover:bg-fuchsia-100 transition-colors"
          >
            <Sparkles className="w-6 h-6 text-fuchsia-600" />
            <span className="text-sm font-medium text-fuchsia-900">Conseils IA personnalisés</span>
          </motion.button>
          </motion.div>
        </motion.div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">Découvrir</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'carte', label: 'Carte des centres', icon: MapIcon, bg: 'bg-cyan-50 hover:bg-cyan-100', color: 'text-cyan-700' },
              { id: 'triage', label: 'Cellule triage', icon: PhoneCall, bg: 'bg-rose-50 hover:bg-rose-100', color: 'text-rose-700' },
              { id: 'pharmacopee', label: 'Pharmacopée', icon: Leaf, bg: 'bg-emerald-50 hover:bg-emerald-100', color: 'text-emerald-700' },
              { id: 'cars', label: 'Cars Helfy', icon: Bus, bg: 'bg-amber-50 hover:bg-amber-100', color: 'text-amber-700' },
              { id: 'mobilite', label: 'Mobilité sanitaire', icon: Ambulance, bg: 'bg-teal-50 hover:bg-teal-100', color: 'text-teal-700' },
              { id: 'hotel', label: 'Hôtels Bien-Être', icon: Hotel, bg: 'bg-violet-50 hover:bg-violet-100', color: 'text-violet-700' },
              { id: 'pedo', label: 'Pédo-suivi', icon: Baby, bg: 'bg-pink-50 hover:bg-pink-100', color: 'text-pink-700' },
              { id: 'diaspora', label: 'Diaspora', icon: Globe, bg: 'bg-indigo-50 hover:bg-indigo-100', color: 'text-indigo-700' },
              { id: 'entreprise', label: 'Entreprise', icon: Building2, bg: 'bg-blue-50 hover:bg-blue-100', color: 'text-blue-700' },
              { id: 'femmes', label: 'Carnet femmes', icon: HeartIcon, bg: 'bg-rose-50 hover:bg-rose-100', color: 'text-rose-700' },
              { id: 'laboratoire', label: 'Laboratoire', icon: FlaskConical, bg: 'bg-cyan-50 hover:bg-cyan-100', color: 'text-cyan-700' },
              { id: 'metaphysique', label: 'Métaphysique', icon: Sparkles, bg: 'bg-violet-50 hover:bg-violet-100', color: 'text-violet-700' },
              { id: 'fonds', label: 'Fonds & cotis.', icon: Wallet, bg: 'bg-emerald-50 hover:bg-emerald-100', color: 'text-emerald-700' },
              { id: 'pharmacie', label: 'Pharmacie', icon: Pill, bg: 'bg-teal-50 hover:bg-teal-100', color: 'text-teal-700' },
              { id: 'rural', label: 'Zones rurales', icon: Trees, bg: 'bg-amber-50 hover:bg-amber-100', color: 'text-amber-700' },
              { id: 'microcabine', label: 'Micro-cabine', icon: ActivityIcon, bg: 'bg-slate-100 hover:bg-slate-200', color: 'text-slate-700' },
              { id: 'voyage', label: 'Voyage & Loisirs', icon: Plane, bg: 'bg-sky-50 hover:bg-sky-100', color: 'text-sky-700' },
              { id: 'urgences', label: 'Urgences', icon: Siren, bg: 'bg-red-50 hover:bg-red-100', color: 'text-red-700' },
              { id: 'jeux', label: 'Jeux & Concours', icon: Gamepad2, bg: 'bg-fuchsia-50 hover:bg-fuchsia-100', color: 'text-fuchsia-700' },
              { id: 'categorie', label: 'Mon profil', icon: UserIcon, bg: 'bg-indigo-50 hover:bg-indigo-100', color: 'text-indigo-700' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex flex-col items-center gap-2 p-4 ${item.bg} rounded-xl transition-colors`}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                  <span className={`text-xs font-medium ${item.color} text-center`}>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
