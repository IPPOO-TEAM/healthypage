import { ArrowLeft, FileText, Stethoscope, Pill, Bug, HeartPulse, Dna, ClipboardPlus, Syringe, Ruler, FileQuestion, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Props { onBack: () => void }

type Row = {
  key: string;
  label: string;
  icon: typeof FileText;
  color: string;
  bg: string;
  to: string;
};

const ROWS: Row[] = [
  { key: 'documents', label: 'Documents', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50', to: '/patient/coffre' },
  { key: 'antecedents', label: 'Antécédents médicaux', icon: Stethoscope, color: 'text-pink-600', bg: 'bg-pink-50', to: '/patient/profil-sante/antecedents' },
  { key: 'traitements', label: 'Traitements réguliers', icon: Pill, color: 'text-orange-500', bg: 'bg-orange-50', to: '/patient/traitements' },
  { key: 'allergies', label: 'Allergies', icon: Bug, color: 'text-red-600', bg: 'bg-red-50', to: '/patient/profil-sante/allergies' },
  { key: 'habitudes', label: 'Habitudes de vie', icon: HeartPulse, color: 'text-amber-500', bg: 'bg-amber-50', to: '/patient/profil-sante/habitudes' },
  { key: 'familiaux', label: 'Antécédents familiaux', icon: Dna, color: 'text-teal-600', bg: 'bg-teal-50', to: '/patient/profil-sante/familiaux' },
  { key: 'chirurgie', label: 'Opérations chirurgicales', icon: ClipboardPlus, color: 'text-rose-500', bg: 'bg-rose-50', to: '/patient/profil-sante/chirurgie' },
  { key: 'vaccins', label: 'Vaccins', icon: Syringe, color: 'text-sky-600', bg: 'bg-sky-50', to: '/patient/vaccins' },
  { key: 'mesures', label: 'Mesures', icon: Ruler, color: 'text-blue-600', bg: 'bg-blue-50', to: '/patient/profil-sante/mesures' },
  { key: 'autres', label: 'Autres informations', icon: FileQuestion, color: 'text-indigo-500', bg: 'bg-indigo-50', to: '/patient/profil-sante/autres' },
];

export default function ProfilSanteScreen({ onBack }: Props) {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <header className="flex items-center gap-3 pt-1">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Profil santé</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.key}
              onClick={() => navigate(r.to)}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition text-left"
            >
              <span className={`w-12 h-12 rounded-2xl ${r.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${r.color}`} />
              </span>
              <span className="flex-1 font-semibold text-slate-800">{r.label}</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
