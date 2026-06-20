import { ArrowLeft, AlertTriangle, Syringe, Pill, Activity, Calendar, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  icon: any;
  title: string;
  desc: string;
  due: string;
  action?: string;
}

const ALERTS: Alert[] = [
  { id: 1, level: 'critical', icon: ShieldAlert, title: 'Tension artérielle élevée', desc: 'Dernières mesures au-dessus de 14/9. Une consultation rapide est recommandée.', due: 'À traiter sous 48h', action: 'Prendre RDV' },
  { id: 2, level: 'warning', icon: Syringe, title: 'Rappel vaccinal', desc: 'Vaccin antitétanique à renouveler.', due: 'Avant Juin 2026', action: 'Planifier' },
  { id: 3, level: 'warning', icon: Pill, title: 'Traitement à renouveler', desc: 'Votre ordonnance d\'antihypertenseur expire dans 5 jours.', due: 'Avant 5 Mai 2026', action: 'Renouveler' },
  { id: 4, level: 'info', icon: Activity, title: 'Bilan annuel', desc: 'Votre bilan de santé annuel approche.', due: 'Recommandé en Juin', action: 'Voir détails' },
  { id: 5, level: 'info', icon: Calendar, title: 'Contrôle dentaire', desc: 'Visite de contrôle 6 mois.', due: 'Juillet 2026', action: 'Programmer' }
];

const LEVELS = {
  critical: { bg: 'from-red-600 to-rose-600', tag: 'bg-red-100 text-red-800', icon: 'bg-red-100 text-red-700', label: 'Urgent' },
  warning: { bg: 'from-amber-500 to-orange-500', tag: 'bg-amber-100 text-amber-800', icon: 'bg-amber-100 text-amber-700', label: 'Important' },
  info: { bg: 'from-blue-500 to-cyan-500', tag: 'bg-blue-100 text-blue-800', icon: 'bg-blue-100 text-blue-700', label: 'Info' }
};

export default function AlertesMedicalesScreen({ onBack, onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1666887360369-1901f341fdad?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><AlertTriangle className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Alertes médicales</h2>
            <p className="text-sm text-white/85">Rappels et signaux importants</p>
          </div>
        </div>
        </div>
      </div>

      <a
        href="tel:185"
        className="flex items-center justify-between bg-gradient-to-r from-red-700 to-red-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl"><Phone className="w-6 h-6" /></div>
          <div>
            <p className="font-bold">Urgence médicale</p>
            <p className="text-sm text-red-100">Appeler le SAMU 185</p>
          </div>
        </div>
        <span className="text-2xl">→</span>
      </a>

      {(() => { const items = isDemoPatient() ? ALERTS : []; return items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-300 mb-3" />
          <p className="text-gray-500">Aucune alerte médicale active.</p>
        </div>
      ) : (
      <div className="space-y-3">
        {items.map((a, idx) => {
          const Icon = a.icon;
          const lv = LEVELS[a.level];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex gap-3">
                <div className={`${lv.icon} p-2.5 rounded-xl h-fit`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{a.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lv.tag}`}>{lv.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{a.desc}</p>
                  <p className="text-xs text-gray-500 mt-2">⏱ {a.due}</p>
                  {a.action && (
                    <button
                      onClick={() => onNavigate?.('rdv')}
                      className={`mt-3 bg-gradient-to-r ${lv.bg} text-white text-sm font-medium px-4 py-2 rounded-lg`}
                    >
                      {a.action}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      ); })()}
    </div>
  );
}
