import { useState } from 'react';
import { ArrowLeft, Shirt, WashingMachine, Accessibility, Gamepad2, Palette, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  initial?: ServiceKey;
}

type ServiceKey = 'vestimentaire' | 'linge' | 'mobilite' | 'ludiques' | 'creatifs';

const SERVICES: { key: ServiceKey; icon: any; color: string; title: string; desc: string; fields: string[] }[] = [
  { key: 'vestimentaire', icon: Shirt, color: 'rose', title: 'Assistance vestimentaire', desc: 'Vêtements adaptés et propres pour votre séjour', fields: ['Taille', 'Préférence couleur', 'Quantité'] },
  { key: 'linge', icon: WashingMachine, color: 'cyan', title: 'Entretien du linge', desc: 'Lavage, repassage et retour de votre linge personnel', fields: ['Nombre de pièces', 'Délai souhaité', 'Instructions spéciales'] },
  { key: 'mobilite', icon: Accessibility, color: 'amber', title: 'Accompagnement mobilité', desc: 'Aide pour vos déplacements et examens', fields: ['Type d\'aide', 'Date / heure', 'Lieu de RDV'] },
  { key: 'ludiques', icon: Gamepad2, color: 'emerald', title: 'Activités ludiques', desc: 'Jeux et loisirs adaptés (lecture, jeux de société, musique)', fields: ['Type d\'activité', 'Durée', 'Personnes concernées'] },
  { key: 'creatifs', icon: Palette, color: 'purple', title: 'Ateliers créatifs', desc: 'Peinture, dessin, écriture, art-thérapie', fields: ['Atelier souhaité', 'Niveau', 'Matériel à fournir'] }
];

const COLORS: Record<string, { bg: string; tint: string; text: string; from: string; to: string }> = {
  rose: { bg: 'bg-rose-50', tint: 'bg-rose-50', text: 'text-rose-600', from: 'from-rose-700', to: 'to-rose-500' },
  cyan: { bg: 'bg-cyan-50', tint: 'bg-cyan-50', text: 'text-cyan-600', from: 'from-cyan-700', to: 'to-cyan-500' },
  amber: { bg: 'bg-amber-50', tint: 'bg-amber-50', text: 'text-amber-600', from: 'from-amber-700', to: 'to-amber-500' },
  emerald: { bg: 'bg-emerald-50', tint: 'bg-emerald-50', text: 'text-emerald-600', from: 'from-emerald-700', to: 'to-emerald-500' },
  purple: { bg: 'bg-purple-50', tint: 'bg-purple-50', text: 'text-purple-600', from: 'from-purple-700', to: 'to-purple-500' }
};

export default function AssistanceScreen({ onBack, initial }: Props) {
  const [active, setActive] = useState<ServiceKey | null>(initial ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = SERVICES.find((s) => s.key === active);

  const submit = async () => {
    if (!service || busy) return;
    const pid = getPatientId();
    if (!pid) { setError('Aucun compte patient actif. Connectez-vous pour envoyer une demande.'); return; }
    setBusy(true); setError(null);
    try {
      await api.createAssistance(pid, {
        service: service.key,
        title: service.title,
        fields: values,
        comment,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setValues({}); setComment('');
    } catch (e: any) {
      setError(`Échec de l'envoi : ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  if (!active) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white">
          <ImageWithFallback src="https://images.unsplash.com/photo-1609945168638-5465dc07f1be?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
          <div className="relative">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <h2 className="text-2xl font-bold">Assistance & services</h2>
          <p className="text-sm text-white/85">Demandez une aide adaptée pendant votre séjour</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActive(s.key)}
                className="bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className={`${COLORS[s.color]?.tint ?? 'bg-gray-50'} p-3 rounded-xl w-fit`}>
                  <Icon className={`w-6 h-6 ${COLORS[s.color]?.text ?? 'text-gray-600'}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mt-3">{s.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-3" />
          <h3 className="text-xl font-bold text-green-900">Demande enregistrée</h3>
          <p className="text-sm text-green-800 mt-2">
            Le centre de santé a été notifié. Suivi en temps réel disponible.
          </p>
          <button
            onClick={() => { setSubmitted(false); setActive(null); }}
            className="mt-5 bg-green-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            Retour aux services
          </button>
        </motion.div>
      </div>
    );
  }

  const Icon = service!.icon;
  return (
    <div className="space-y-6">
      <div className={`rounded-3xl shadow-lg bg-gradient-to-br ${COLORS[service!.color]?.from ?? 'from-gray-700'} ${COLORS[service!.color]?.to ?? 'to-gray-500'} p-6 text-white`}>
        <button onClick={() => setActive(null)} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Icon className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">{service!.title}</h2>
            <p className="text-sm text-white/85">{service!.desc}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        {service!.fields.map((f) => (
          <div key={f}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{f}</label>
            <input
              type="text"
              value={values[f] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
              placeholder={f}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Commentaires</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Précisions complémentaires..."
          />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send className="w-5 h-5" /> {busy ? 'Envoi…' : 'Envoyer la demande'}
      </button>
    </div>
  );
}
