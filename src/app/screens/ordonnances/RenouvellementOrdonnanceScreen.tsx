import { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, FileUp, Stethoscope } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { motion } from 'motion/react';

interface Props { onBack: () => void; }

const ORDS = [
  { id: 1, name: 'Amlodipine 5mg', issued: 'Dr. Diop', expires: '5 Mai 2026' },
  { id: 2, name: 'Vitamine D', issued: 'Dr. Konan', expires: '20 Juillet 2026' }
];

export default function RenouvellementOrdonnanceScreen({ onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<'doc' | 'photo'>('doc');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><RefreshCw className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Renouvellement</h2>
            <p className="text-sm text-white/85">Demander une nouvelle ordonnance</p>
          </div>
        </div>
      </div>

      <div className="relative h-32 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1080" alt="Ordonnance" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Continuité des soins · renouveler en quelques clics</p>
        </div>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-3" />
          <h3 className="text-xl font-bold text-green-900">Demande envoyée</h3>
          <p className="text-sm text-green-800 mt-2">Vous recevrez une réponse sous 48h.</p>
          <button
            onClick={onBack}
            className="mt-5 bg-green-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            Retour
          </button>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">1. Choisir une ordonnance</h3>
            <div className="space-y-2">
              {ORDS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selected === o.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{o.name}</p>
                      <p className="text-xs text-gray-500">{o.issued} • Expire {o.expires}</p>
                    </div>
                    {selected === o.id && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">2. Mode d'envoi</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('doc')}
                className={`p-4 rounded-xl border-2 ${mode === 'doc' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
              >
                <Stethoscope className="w-6 h-6 mx-auto text-teal-700 mb-2" />
                <p className="text-sm font-medium">Demande au médecin</p>
              </button>
              <button
                onClick={() => setMode('photo')}
                className={`p-4 rounded-xl border-2 ${mode === 'photo' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
              >
                <FileUp className="w-6 h-6 mx-auto text-teal-700 mb-2" />
                <p className="text-sm font-medium">Photo de l'ordonnance</p>
              </button>
            </div>
          </div>

          <button
            disabled={!selected}
            onClick={() => setSubmitted(true)}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md disabled:opacity-50"
          >
            Envoyer la demande
          </button>
        </>
      )}
    </div>
  );
}
