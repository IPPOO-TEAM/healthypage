import { useEffect, useState } from 'react';
import { ArrowLeft, Pill, CheckCircle2, Clock, ScanLine } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { api } from '../../components/api';
import { getPatientId } from '../../components/usePatientId';
import { isDemoPatient } from '../../components/demo';
import OcrOrdonnanceModal from '../../components/OcrOrdonnanceModal';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface Med {
  id: string | number;
  name: string;
  dosage: string;
  schedule: string[];
  taken: boolean[];
}

const INITIAL: Med[] = [
  { id: 1, name: 'Amlodipine 5mg', dosage: '1 cp/jour', schedule: ['08:00'], taken: [true] },
  { id: 2, name: 'Vitamine D', dosage: '1 goutte/jour', schedule: ['12:00'], taken: [false] },
  { id: 3, name: 'Doliprane 500mg', dosage: 'si douleur', schedule: ['08:00', '14:00', '20:00'], taken: [true, true, false] }
];

export default function TraitementsEnCoursScreen({ onBack, onNavigate }: Props) {
  const [meds, setMeds] = useState<Med[]>([]);
  const [ocrOpen, setOcrOpen] = useState(false);

  const reload = () => {
    const pid = getPatientId();
    if (!pid) return;
    api.listTraitement(pid).then(setMeds).catch(() => {});
  };

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) { setMeds([]); return; }
    api.listTraitement(pid)
      .then((items) => setMeds(items ?? []))
      .catch((e) => { console.error('Load traitement:', e); setMeds([]); });
  }, []);

  const toggle = (mid: string | number, idx: number) => {
    setMeds((list) => {
      const updated = list.map((m) =>
        m.id === mid ? { ...m, taken: m.taken.map((t, i) => (i === idx ? !t : t)) } : m
      );
      const pid = getPatientId();
      const med = updated.find((m) => m.id === mid);
      if (pid && med) {
        api.upsertTraitement(pid, String(mid), med).catch((e) => console.error('Save traitement:', e));
      }
      return updated;
    });
  };

  const total = meds.reduce((s, m) => s + m.taken.length, 0);
  const done = meds.reduce((s, m) => s + m.taken.filter(Boolean).length, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl"><Pill className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Traitements en cours</h2>
              <p className="text-sm text-white/85">Validation quotidienne</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{done}/{total}</p>
            <p className="text-xs text-white/80">prises aujourd'hui</p>
          </div>
        </div>
      </div>

      <div className="relative h-32 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1080" alt="Traitements" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Suivi quotidien · respecter chaque prise</p>
        </div>
      </div>

      <div className="space-y-3">
        {meds.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{m.name}</h4>
                <p className="text-sm text-gray-500">{m.dosage}</p>
              </div>
              <button
                onClick={() => onNavigate?.('posologie')}
                className="text-xs text-teal-700 underline"
              >
                Détails
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {m.schedule.map((time, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggle(m.id, idx)}
                  className={`p-3 rounded-xl border-2 transition ${
                    m.taken[idx]
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {m.taken[idx] ? (
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
                  ) : (
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                  )}
                  <p className="text-sm font-semibold">{time}</p>
                  <p className="text-xs">{m.taken[idx] ? 'Pris' : 'À prendre'}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOcrOpen(true)}
        className="w-full bg-white border-2 border-emerald-600 text-emerald-700 py-3.5 rounded-2xl font-semibold shadow-sm inline-flex items-center justify-center gap-2 hover:bg-emerald-50"
      >
        <ScanLine className="w-5 h-5" /> Scanner une ordonnance papier
      </button>

      <button
        onClick={() => onNavigate?.('renouvellement')}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md"
      >
        Demander un renouvellement
      </button>

      <OcrOrdonnanceModal
        open={ocrOpen}
        onClose={() => setOcrOpen(false)}
        onSaved={() => reload()}
      />
    </div>
  );
}
