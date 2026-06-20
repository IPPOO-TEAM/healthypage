import { useEffect, useState } from 'react';
import { ArrowLeft, Brain, Moon, Activity, Apple, Droplets, Smile, Sparkles, AlertTriangle, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

type Key = 'stress' | 'sommeil' | 'douleurs' | 'nutrition' | 'hydratation' | 'humeur';

const FIELDS: { id: Key; label: string; icon: any; color: string; low: string; high: string }[] = [
  { id: 'stress', label: 'Stress', icon: Brain, color: 'rose', low: 'Calme', high: 'Très tendu' },
  { id: 'sommeil', label: 'Sommeil', icon: Moon, color: 'indigo', low: 'Mauvais', high: 'Excellent' },
  { id: 'douleurs', label: 'Douleurs', icon: Activity, color: 'orange', low: 'Aucune', high: 'Intenses' },
  { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'emerald', low: 'Pauvre', high: 'Équilibrée' },
  { id: 'hydratation', label: 'Hydratation', icon: Droplets, color: 'cyan', low: 'Faible', high: 'Suffisante' },
  { id: 'humeur', label: 'Humeur', icon: Smile, color: 'amber', low: 'Triste', high: 'Joyeux' }
];

export default function MesRessentisScreen({ onBack, onNavigate }: Props) {
  const [values, setValues] = useState<Record<Key, number>>({
    stress: 5, sommeil: 7, douleurs: 2, nutrition: 6, hydratation: 5, humeur: 7
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    const today = new Date().toISOString().slice(0, 10);
    api.listRessenti(pid)
      .then((items) => {
        const todayItem = items.find((i: any) => i.date === today);
        if (todayItem?.values) setValues(todayItem.values);
      })
      .catch((e) => console.error('Load ressenti:', e));
  }, []);

  const save = async () => {
    const pid = getPatientId();
    if (!pid) { setSubmitted(true); return; }
    setSaving(true);
    setError(null);
    try {
      await api.saveRessenti(pid, { values, score: Math.round(((10, values.stress) + values.sommeil + (10, values.douleurs) + values.nutrition + values.hydratation + values.humeur) / 6 * 10) });
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const score = Math.round(
    ((10, values.stress) + values.sommeil + (10, values.douleurs) + values.nutrition + values.hydratation + values.humeur) / 6 * 10
  );

  const alerts: string[] = [];
  if (values.stress >= 8) alerts.push('Niveau de stress élevé, pensez à une séance de respiration guidée.');
  if (values.sommeil <= 3) alerts.push('Sommeil insuffisant, un suivi sommeil est recommandé.');
  if (values.douleurs >= 7) alerts.push('Douleurs importantes, une consultation est conseillée.');
  if (values.hydratation <= 3) alerts.push('Hydratation faible, buvez de l\'eau régulièrement.');

  const advice = score >= 70
    ? 'Votre bien-être est bon, continuez ainsi.'
    : score >= 50
      ? 'Bien-être moyen, quelques ajustements peuvent aider.'
      : 'Bien-être à améliorer, suivez nos conseils ou parlez à un pro.';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1665781665870-3364a8b5626f?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Sparkles className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Mes ressentis</h2>
            <p className="text-sm text-white/85">Comment vous sentez-vous aujourd'hui ?</p>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
        {FIELDS.map(({ id, label, icon: Icon, color, low, high }) => (
          <div key={id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`bg-${color}-50 p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <span className={`text-sm font-semibold text-${color}-700`}>{values[id]}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={values[id]}
              onChange={(e) => setValues((v) => ({ ...v, [id]: Number(e.target.value) }))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{low}</span><span>{high}</span>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-5 shadow-sm"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h3 className="font-semibold text-teal-900">Score IA bien-être</h3>
          </div>
          <span className="text-3xl font-bold text-teal-700">{score}</span>
        </div>
        <p className="text-sm text-teal-800">{advice}</p>
      </motion.div>

      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-amber-900">Signaux d'alerte</h3>
          </div>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span>•</span><span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
        >
          {saving ? 'Enregistrement…' : submitted ? '✓ Enregistré' : 'Enregistrer mon ressenti'}
        </button>
        {error && <p className="text-sm text-red-700 col-span-full">{error}</p>}
        <button
          onClick={() => onNavigate?.('rdv')}
          className="bg-white border border-gray-200 py-4 rounded-2xl font-semibold text-gray-800 hover:border-teal-400 inline-flex items-center justify-center gap-2"
        >
          <Stethoscope className="w-5 h-5 text-teal-600" /> Consulter un professionnel
        </button>
      </div>
    </div>
  );
}
