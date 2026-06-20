import { useMemo, useState } from 'react';
import { ArrowLeft, Search, Stethoscope, Brain, Baby, Scissors, Eye, Activity, Pill, HeartPulse, Smile, Bone, FlaskConical, Ambulance, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onSelect?: (specialty: string) => void;
}

interface Group {
  id: string;
  label: string;
  icon: any;
  color: string;
  items: string[];
}

const GROUPS: Group[] = [
  {
    id: 'gen', label: 'Médecins généralistes', icon: Stethoscope, color: 'teal',
    items: ['Médecin généraliste', 'Médecin de famille', 'Médecin communautaire', 'Urgentiste']
  },
  {
    id: 'adulte', label: 'Spécialités adultes', icon: HeartPulse, color: 'rose',
    items: ['Cardiologue', 'Pneumologue', 'Gastro-entérologue', 'Néphrologue', 'Endocrinologue / Diabétologue', 'Neurologue', 'Dermatologue', 'Rhumatologue', 'Infectiologue', 'Interniste', 'Allergologue', 'Gériatre', 'Oncologue', 'Hématologue', 'Médecin du travail', 'Médecin en santé publique']
  },
  {
    id: 'mere', label: 'Mère & enfant', icon: Baby, color: 'pink',
    items: ['Pédiatre', 'Néonatologue', 'Gynécologue', 'Obstétricien', 'Sage-femme']
  },
  {
    id: 'chir', label: 'Chirurgie', icon: Scissors, color: 'red',
    items: ['Chirurgien général', 'Chirurgien orthopédiste', 'Chirurgien viscéral', 'Chirurgien cardio-vasculaire', 'Neurochirurgien', 'Chirurgien maxillo-facial', 'Chirurgien ORL', 'Chirurgien urologue', 'Chirurgien plastique et reconstructeur']
  },
  {
    id: 'sens', label: 'Sensoriel & tête-cou', icon: Eye, color: 'indigo',
    items: ['ORL', 'Ophtalmologue', 'Stomatologue', 'Audiologiste', 'Orthophoniste']
  },
  {
    id: 'tech', label: 'Imagerie & examens', icon: FlaskConical, color: 'cyan',
    items: ['Radiologue', 'Médecin d\'imagerie (Échographie/Scanner)', 'Médecin nucléariste', 'Anatomo-pathologiste']
  },
  {
    id: 'chronique', label: 'Maladies chroniques', icon: Pill, color: 'amber',
    items: ['Diabétologue', 'Cardiologue', 'Pneumologue (asthme)', 'Rhumatologue (arthrose)', 'Néphrologue', 'Endocrinologue']
  },
  {
    id: 'mental', label: 'Santé mentale & bien-être', icon: Brain, color: 'purple',
    items: ['Psychiatre', 'Psychologue', 'Neuropsychologue', 'Thérapeute comportemental (TCC)', 'Conseiller en gestion du stress']
  },
  {
    id: 'dentaire', label: 'Métiers dentaires', icon: Smile, color: 'sky',
    items: ['Chirurgien-dentiste', 'Orthodontiste', 'Parodontiste', 'Endodontiste']
  },
  {
    id: 'reeduc', label: 'Rééducation & physiologie', icon: Bone, color: 'orange',
    items: ['Kinésithérapeute', 'Physiothérapeute', 'Ergothérapeute', 'Orthoprothésiste', 'Podologue', 'Diététicien / Nutritionniste', 'Coach en activité physique adaptée']
  },
  {
    id: 'labo', label: 'Laboratoires & diagnostics', icon: Activity, color: 'emerald',
    items: ['Biologiste médical', 'Technicien de laboratoire', 'Préleveur mobile']
  },
  {
    id: 'mobile', label: 'Unités mobiles & terrain', icon: Ambulance, color: 'slate',
    items: ['Médecin mobile', 'Infirmier communautaire', 'Agent de santé communautaire', 'Préleveur itinérant']
  }
];

export default function ChoixSpecialisteScreen({ onBack, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>('gen');

  const filtered = useMemo(() => {
    if (!query.trim()) return GROUPS;
    const q = query.toLowerCase();
    return GROUPS
      .map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-cyan-600 to-blue-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Stethoscope className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Choisir un spécialiste</h2>
            <p className="text-sm text-white/85">Tous les professionnels de santé en un coup d'œil</p>
          </div>
        </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une spécialité..."
          className="flex-1 bg-transparent outline-none text-sm py-2"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-xs text-gray-500 px-2">Effacer</button>
        )}
      </div>

      {!query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mt-2 px-1">
          <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
          {['Cardiologue', 'Pédiatre', 'Gynécologue', 'Dermatologue', 'Ophtalmologue', 'Dentiste', 'Kinésithérapeute'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((g, idx) => {
          const Icon = g.icon;
          const open = query ? true : openGroup === g.id;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenGroup(open ? null : g.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left"
              >
                <div className={`bg-${g.color}-50 p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 text-${g.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{g.label}</p>
                  <p className="text-xs text-gray-500">{g.items.length} spécialité{g.items.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
              </button>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-100 divide-y divide-gray-100"
                >
                  {g.items.map((it) => (
                    <button
                      key={it}
                      onClick={() => onSelect?.(it)}
                      className="w-full text-left px-5 py-3 hover:bg-teal-50 text-sm text-gray-800 flex items-center justify-between"
                    >
                      <span>{it}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">Aucune spécialité trouvée pour « {query} »</p>
          </div>
        )}
      </div>
    </div>
  );
}
