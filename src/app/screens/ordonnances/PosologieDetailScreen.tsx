import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pill, Clock, AlertTriangle, Info, CheckCircle2, TrendingUp, Apple, Sun, Bell, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { api } from '../../components/api';
import { getPatientId } from '../../components/usePatientId';
import { isDemoPatient } from '../../components/demo';

interface Props { onBack: () => void; }

interface Traitement {
  id: string;
  nom: string;
  posologie: string;
  horaires: string[];
  duree: string;
  debutTraitement?: string;
  finTraitement?: string;
  takenLog?: Record<string, boolean[]>;
}

const DEFAULTS = {
  laboratoire: 'Générique',
  forme: 'Comprimé',
  indication: 'Voir prescription du médecin',
  effets: ['Maux de tête légers', 'Troubles digestifs passagers', 'Fatigue'],
  interactions: ['Alcool (à éviter)', 'Anti-inflammatoires non stéroïdiens (espacer)'],
  conseils: ['À prendre avec un grand verre d\'eau', 'Ne pas écraser le comprimé', 'Conserver à température ambiante']
};

const RULES_INDICATION: { match: RegExp; indication: string; effets?: string[]; interactions?: string[] }[] = [
  { match: /amoxicillin|amoxicilline/i, indication: 'Infection bactérienne', effets: ['Diarrhée', 'Éruption cutanée', 'Nausées'], interactions: ['Méthotrexate', 'Contraceptifs oraux'] },
  { match: /paracetamol|paracétamol|doliprane/i, indication: 'Douleur, fièvre', effets: ['Très rares aux doses recommandées'], interactions: ['Warfarine', 'Alcool (foie)'] },
  { match: /ibuprof[èe]ne/i, indication: 'Douleur, inflammation, fièvre', effets: ['Brûlures gastriques', 'Vertiges'], interactions: ['Aspirine', 'Anticoagulants'] },
  { match: /vitamin/i, indication: 'Supplémentation', effets: ['Bien toléré'], interactions: ['Aucune significative'] },
  { match: /amlodipine/i, indication: 'Hypertension artérielle', effets: ['Œdèmes des chevilles', 'Maux de tête'], interactions: ['Pamplemousse', 'AINS'] },
];

const READ_KEY = (id: string) => `healthy-page:posologie-read:${id}`;

export default function PosologieDetailScreen({ onBack }: Props) {
  const [traitements, setTraitements] = useState<Traitement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const [acked, setAcked] = useState(false);

  useEffect(() => {
    const pid = getPatientId();
    const demo = isDemoPatient();
    if (!pid) {
      if (demo) {
        const seed: Traitement = { id: 'demo', nom: 'Amlodipine 5mg', posologie: '1 comprimé par jour, le matin', horaires: ['08:00'], duree: '3 mois' };
        setTraitements([seed]); setSelectedId('demo');
      }
      return;
    }
    api.listTraitement(pid).then(arr => {
      const list = (arr as any[]).filter(x => !x?._deleted) as Traitement[];
      setTraitements(list);
      if (list.length > 0) setSelectedId(list[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) { setAcked(false); return; }
    try { setAcked(localStorage.getItem(READ_KEY(selectedId)) === '1'); } catch { setAcked(false); }
  }, [selectedId]);

  const med = useMemo(() => traitements.find(t => t.id === selectedId), [traitements, selectedId]);
  const enrich = useMemo(() => {
    if (!med) return null;
    const rule = RULES_INDICATION.find(r => r.match.test(med.nom));
    return {
      indication: rule?.indication ?? DEFAULTS.indication,
      effets: rule?.effets ?? DEFAULTS.effets,
      interactions: rule?.interactions ?? DEFAULTS.interactions
    };
  }, [med]);

  const adherence = useMemo(() => {
    if (!med?.takenLog) return null;
    const slots = med.horaires.filter(h => /^\d{1,2}:\d{2}$/.test(h)).length;
    if (slots === 0) return null;
    let taken = 0, total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const log = med.takenLog[k] ?? [];
      total += slots;
      taken += log.filter(Boolean).length;
    }
    return total === 0 ? null : Math.round((taken / total) * 100);
  }, [med]);

  const ack = () => {
    if (!selectedId) return;
    setAcked(true);
    try { localStorage.setItem(READ_KEY(selectedId), '1'); } catch {}
  };

  if (!med) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-700"><ArrowLeft className="w-5 h-5" /> Retour</button>
        <div className="bg-white rounded-2xl p-8 text-center">
          <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 font-medium">Aucun traitement enregistré</p>
          <p className="text-sm text-gray-500 mt-1">Ajoutez un médicament depuis l'écran Médicaments pour consulter sa posologie détaillée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          {traitements.length > 1 && (
            <button onClick={() => setShowSwitch(s => !s)} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1">
              Changer <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Pill className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">{med.nom}</h2>
            <p className="text-sm text-white/85">{DEFAULTS.laboratoire} • {DEFAULTS.forme}</p>
          </div>
        </div>
        {showSwitch && (
          <div className="mt-3 bg-white/95 rounded-xl p-2 space-y-1">
            {traitements.map(t => (
              <button key={t.id} onClick={() => { setSelectedId(t.id); setShowSwitch(false); }}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg ${t.id === selectedId ? 'bg-teal-100 text-teal-900' : 'text-gray-800 hover:bg-gray-100'}`}>
                {t.nom}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative h-32 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1080" alt="Posologie" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Bien comprendre son traitement · doses & horaires</p>
        </div>
      </div>

      {adherence !== null && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-teal-600" /> Adhérence (7 j)</h3>
            <span className={`text-lg font-bold ${adherence >= 80 ? 'text-emerald-600' : adherence >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{adherence}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${adherence >= 80 ? 'bg-emerald-500' : adherence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${adherence}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {adherence >= 80 ? 'Excellente régularité, continuez ainsi.' : adherence >= 50 ? 'Pensez à respecter chaque prise pour optimiser l\'effet.' : 'Adhérence faible, programmez des rappels et parlez-en à votre médecin.'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /> Posologie</h3>
        <p className="text-gray-700">{med.posologie}</p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Durée</p><p className="font-semibold">{med.duree}</p></div>
          <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Indication</p><p className="font-semibold text-sm">{enrich!.indication}</p></div>
        </div>
        {(med.debutTraitement || med.finTraitement) && (
          <p className="text-xs text-gray-500">Du {med.debutTraitement || ', '} {med.finTraitement ? `au ${med.finTraitement}` : ''}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Clock className="w-5 h-5 text-teal-600" /> Horaires de prise</h3>
        {med.horaires.map((h, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg mb-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span className="text-teal-900 font-medium">{h}</span>
          </div>
        ))}
        <button className="w-full mt-1 py-2 rounded-lg border border-teal-200 text-teal-700 text-sm inline-flex items-center justify-center gap-1 hover:bg-teal-50">
          <Bell className="w-4 h-4" /> Activer les rappels
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
        <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-3"><Apple className="w-5 h-5" /> Conseils & alimentation</h3>
        <ul className="text-sm text-emerald-900 space-y-1.5">
          {DEFAULTS.conseils.map(c => <li key={c} className="flex gap-2"><Sun className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</li>)}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Effets indésirables possibles</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          {enrich!.effets.map(e => <li key={e}>• {e}</li>)}
        </ul>
        <p className="text-xs text-amber-700 mt-2 italic">Liste indicative, consultez la notice fournie.</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <h3 className="font-semibold text-red-900 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Interactions à éviter</h3>
        <ul className="text-sm text-red-900 space-y-1.5">
          {enrich!.interactions.map(i => <li key={i}>• {i}</li>)}
        </ul>
      </div>

      <button onClick={ack} disabled={acked}
        className={`w-full py-3.5 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 ${acked ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'}`}>
        <CheckCircle2 className="w-5 h-5" /> {acked ? 'Posologie comprise ✓' : 'J\'ai compris ma posologie'}
      </button>
    </div>
  );
}
