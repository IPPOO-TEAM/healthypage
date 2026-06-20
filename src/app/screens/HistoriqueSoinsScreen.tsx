import { ArrowLeft, FileText, Stethoscope, Pill, Syringe, Activity, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

const HISTORY = [
  { id: 1, date: '28 Mars 2026', icon: Stethoscope, color: 'teal', type: 'Consultation', title: 'Bilan général', doctor: 'Dr. Aïcha Hounkpatin', notes: 'Tension légèrement élevée, suivi recommandé.' },
  { id: 2, date: '20 Mars 2026', icon: Pill, color: 'rose', type: 'Ordonnance', title: 'Antihypertenseur', doctor: 'Dr. Aïcha Hounkpatin', notes: 'Renouvellement 3 mois.' },
  { id: 3, date: '15 Février 2026', icon: FileText, color: 'cyan', type: 'Examen', title: 'Radiographie thoracique', doctor: 'Centre Imagerie Ganhi', notes: 'Examen normal.' },
  { id: 4, date: '10 Janvier 2026', icon: Activity, color: 'amber', type: 'Hospitalisation', title: 'Observation 24h', doctor: 'Clinique Louis Pasteur Cotonou', notes: 'Suite à malaise vagal, sortie sans complication.' },
  { id: 5, date: '5 Décembre 2025', icon: Syringe, color: 'emerald', type: 'Vaccination', title: 'Rappel grippe', doctor: 'Centre Médical Ganhi' },
  { id: 6, date: '12 Novembre 2025', icon: Stethoscope, color: 'teal', type: 'Consultation', title: 'Maux de tête persistants', doctor: 'Dr. Agbodjan Dossou', notes: 'Stress identifié, conseils donnés.' }
];

export default function HistoriqueSoinsScreen({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-r from-cyan-700 to-blue-700 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1631815589600-85ee48945ce1?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <h2 className="text-2xl font-bold">Historique des soins</h2>
        <p className="text-sm text-white/85">Frise chronologique de votre suivi</p>
        </div>
      </motion.div>

      {(() => { const list = isDemoPatient() ? HISTORY : []; return (
      list.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucun soin enregistré pour le moment.</p>
        </div>
      ) : (
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 via-cyan-400 to-blue-400" />
        {list.map((h, i) => {
          const Icon = h.icon;
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pb-5"
            >
              <div className={`absolute -left-5 top-1 bg-${h.color}-500 ring-4 ring-white w-4 h-4 rounded-full shadow`} />
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ml-2">
                <div className="flex items-start gap-3">
                  <div className={`bg-${h.color}-50 p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${h.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`bg-${h.color}-50 text-${h.color}-700 text-xs px-2 py-0.5 rounded-full`}>{h.type}</span>
                      <span className="text-xs text-gray-500">{h.date}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{h.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{h.doctor}</p>
                    {h.notes && <p className="text-sm text-gray-600 mt-2">{h.notes}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )); })()}
    </div>
  );
}
