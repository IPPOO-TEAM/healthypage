import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Search, Leaf, AlertTriangle, Sparkles, Info, X, BookOpen, CupSoda, Wheat, Sprout, TreeDeciduous, Citrus, Flower, Apple, Carrot, Nut } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useLockBodyScroll } from '../components/useLockBodyScroll';

type Plant = {
  id: string;
  name: string;
  latin: string;
  localNames: string[];
  category: 'digestif' | 'respiratoire' | 'fievre' | 'douleur' | 'peau' | 'feminin' | 'enfant' | 'general';
  parts: string[];
  usages: string[];
  preparation: string;
  posologie: string;
  warnings: string[];
  icon: LucideIcon;
};

const PLANTS: Plant[] = [
  {
    id: 'kinkeliba',
    name: 'Kinkéliba',
    latin: 'Combretum micranthum',
    localNames: ['Sékhew (wolof)', 'Quinquéliba'],
    category: 'digestif',
    parts: ['Feuilles séchées'],
    usages: ['Digestion difficile', 'Drainage hépatique', 'Fatigue générale', 'Légère fièvre'],
    preparation: 'Décoction : 1 poignée de feuilles séchées dans 1 L d\'eau, bouillir 10 min, laisser infuser 5 min.',
    posologie: '2 à 3 tasses par jour, après les repas, pendant 7 à 10 jours.',
    warnings: ['Éviter en cas de grossesse au 1er trimestre', 'Ne pas dépasser 3 semaines en continu'],
    icon: CupSoda
  },
  {
    id: 'moringa',
    name: 'Moringa',
    latin: 'Moringa oleifera',
    localNames: ['Yovokpatin (fon)', 'Arbre de vie'],
    category: 'general',
    parts: ['Feuilles fraîches ou en poudre', 'Graines'],
    usages: ['Apport nutritionnel (fer, calcium, protéines)', 'Anémie légère', 'Renforcement immunitaire', 'Allaitement'],
    preparation: 'Poudre : 1 cuillère à café diluée dans bouillie, jus, ou sauce. Feuilles fraîches en sauce verte.',
    posologie: '1 à 2 cuillères à café/jour. Pour enfants > 6 mois : ½ cuillère.',
    warnings: ['Éviter les graines pendant la grossesse (effet utérotonique)', 'Démarrer progressivement (effet laxatif possible)']
  ,
    icon: Leaf
  },
  {
    id: 'citronnelle',
    name: 'Citronnelle',
    latin: 'Cymbopogon citratus',
    localNames: ['Tê-citron', 'Verveine des Indes'],
    category: 'fievre',
    parts: ['Feuilles fraîches'],
    usages: ['Fièvre légère', 'Rhume', 'Maux de ventre', 'Insomnie légère', 'Répulsif moustiques'],
    preparation: 'Infusion : 5 à 6 feuilles découpées dans 250 ml d\'eau bouillante, infuser 10 min.',
    posologie: '2 à 3 tasses par jour. Pour enfants : ½ tasse, max 2/jour.',
    warnings: ['Éviter à fortes doses chez la femme enceinte'],
    icon: Wheat
  },
  {
    id: 'gingembre',
    name: 'Gingembre',
    latin: 'Zingiber officinale',
    localNames: ['Dougbé (fon)'],
    category: 'digestif',
    parts: ['Rhizome frais'],
    usages: ['Nausées', 'Mal des transports', 'Digestion lente', 'Rhume débutant', 'Douleurs articulaires'],
    preparation: 'Décoction : 2-3 rondelles fraîches dans 250 ml d\'eau, bouillir 5 min. Possible avec citron + miel.',
    posologie: '2 à 3 tasses/jour. Limiter à 4 g/jour de rhizome frais.',
    warnings: ['Prudence si traitement anticoagulant', 'Éviter à forte dose en fin de grossesse', 'Reflux gastrique'],
    icon: Sprout
  },
  {
    id: 'neem',
    name: 'Neem',
    latin: 'Azadirachta indica',
    localNames: ['Kinin (fon)', 'Margousier'],
    category: 'peau',
    parts: ['Feuilles', 'Écorce'],
    usages: ['Démangeaisons', 'Affections cutanées', 'Hygiène buccale', 'Répulsif insectes'],
    preparation: 'Décoction de feuilles : 1 poignée dans 1 L d\'eau, bouillir 15 min. Usage externe en bain ou compresse.',
    posologie: 'Externe uniquement : 1 à 2 fois/jour sur la zone concernée.',
    warnings: ['Ne pas ingérer pendant la grossesse', 'Ne pas donner aux enfants < 5 ans par voie orale'],
    icon: TreeDeciduous
  },
  {
    id: 'ail',
    name: 'Ail',
    latin: 'Allium sativum',
    localNames: ['Ayo (yoruba)'],
    category: 'general',
    parts: ['Bulbe (gousses)'],
    usages: ['Hypertension légère', 'Cholestérol', 'Vermifuge léger', 'Renforcement immunitaire'],
    preparation: 'Cru : 1 à 2 gousses émincées avec un repas. Macérat : 3 gousses dans 200 ml d\'eau tiède 6h.',
    posologie: '1 à 2 gousses/jour. Cure de 3 semaines max.',
    warnings: ['Anticoagulants', 'Avant chirurgie (arrêt 7 jours avant)', 'Brûlures gastriques à jeun'],
    icon: Sprout
  },
  {
    id: 'hibiscus',
    name: 'Bissap (Hibiscus)',
    latin: 'Hibiscus sabdariffa',
    localNames: ['Bissap', 'Folere', 'Karkadé'],
    category: 'general',
    parts: ['Calices séchés (fleurs)'],
    usages: ['Hypertension légère', 'Hydratation', 'Diurétique léger', 'Antioxydant'],
    preparation: 'Infusion : 1 cuillère à soupe de calices dans 250 ml d\'eau, 10 min. Froid ou chaud.',
    posologie: '2 tasses/jour pendant 2 à 3 semaines.',
    warnings: ['Éviter en cas d\'hypotension', 'Précaution durant la grossesse'],
    icon: Flower
  },
  {
    id: 'baobab',
    name: 'Baobab',
    latin: 'Adansonia digitata',
    localNames: ['Pain de singe', 'Bui (fon)'],
    category: 'digestif',
    parts: ['Pulpe du fruit', 'Feuilles'],
    usages: ['Diarrhée', 'Apport en vitamine C', 'Fortifiant convalescence', 'Fièvre'],
    preparation: 'Pulpe : 2 cuillères à soupe dans 250 ml d\'eau froide, mixer ; sucrer modérément.',
    posologie: '1 à 2 verres/jour. Adapté aux enfants > 1 an.',
    warnings: ['Hyperkaliémie : prudence si insuffisance rénale'],
    icon: Apple
  },
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    latin: 'Eucalyptus globulus',
    localNames: ['Gommier bleu'],
    category: 'respiratoire',
    parts: ['Feuilles'],
    usages: ['Toux', 'Congestion nasale', 'Bronchite légère'],
    preparation: 'Inhalation : 1 poignée de feuilles dans bol d\'eau bouillante, inhaler 10 min sous une serviette.',
    posologie: '1 à 2 inhalations/jour pendant 5 jours.',
    warnings: ['Interdit en inhalation chez l\'enfant < 6 ans', 'Asthme : risque de bronchospasme'],
    icon: Leaf
  },
  {
    id: 'papaye',
    name: 'Papaye (graines)',
    latin: 'Carica papaya',
    localNames: ['Papayer'],
    category: 'digestif',
    parts: ['Graines noires', 'Feuilles'],
    usages: ['Vermifuge traditionnel', 'Digestion difficile'],
    preparation: 'Graines séchées broyées : 1 cuillère à café avec miel, à jeun.',
    posologie: 'Cure de 7 jours, 1 fois/jour. Enfants > 5 ans : ½ dose.',
    warnings: ['Contre-indication grossesse', 'Allergies au latex'],
    icon: Sprout
  },
  {
    id: 'aloe',
    name: 'Aloe vera',
    latin: 'Aloe barbadensis',
    localNames: ['Aloès'],
    category: 'peau',
    parts: ['Gel des feuilles'],
    usages: ['Brûlures légères', 'Coup de soleil', 'Cicatrisation', 'Hydratation cutanée'],
    preparation: 'Couper une feuille, retirer l\'écorce et la sève jaune, appliquer le gel transparent sur la peau.',
    posologie: 'Externe : 2 à 3 applications/jour sur peau propre.',
    warnings: ['La sève jaune (latex) est laxative et toxique en interne', 'Éviter en interne pendant la grossesse'],
    icon: Sprout
  },
  {
    id: 'goyave',
    name: 'Goyavier (feuilles)',
    latin: 'Psidium guajava',
    localNames: ['Gôyavier'],
    category: 'digestif',
    parts: ['Feuilles jeunes'],
    usages: ['Diarrhée', 'Maux de ventre', 'Aphtes', 'Hygiène buccale'],
    preparation: 'Décoction : 7 à 10 feuilles dans 500 ml d\'eau, bouillir 10 min.',
    posologie: '1 tasse 3 fois/jour pendant 2-3 jours, ou en bain de bouche.',
    warnings: ['Constipation possible si usage prolongé'],
    icon: Apple
  },
  {
    id: 'gombo',
    name: 'Gombo',
    latin: 'Abelmoschus esculentus',
    localNames: ['Okra'],
    category: 'feminin',
    parts: ['Fruits jeunes'],
    usages: ['Constipation', 'Diabète léger (régulation glycémie)', 'Fortifiant en post-partum'],
    preparation: 'Eau de gombo : 4 fruits coupés dans 500 ml d\'eau, macérer toute la nuit.',
    posologie: '1 verre à jeun pendant 2 semaines.',
    warnings: ['Possibles interactions avec antidiabétiques'],
    icon: Carrot
  },
  {
    id: 'tamarin',
    name: 'Tamarin',
    latin: 'Tamarindus indica',
    localNames: ['Tamarinier'],
    category: 'enfant',
    parts: ['Pulpe du fruit'],
    usages: ['Constipation douce', 'Fièvre', 'Boisson rafraîchissante'],
    preparation: 'Pulpe : 50 g dans 500 ml d\'eau tiède, dissoudre puis filtrer.',
    posologie: '1 verre/jour. Adapté aux enfants > 2 ans (½ verre).',
    warnings: ['Interactions possibles avec aspirine et ibuprofène'],
    icon: Nut
  }
];

const CATS: { id: Plant['category'] | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Toutes', color: 'bg-teal-600 text-white' },
  { id: 'digestif', label: 'Digestif', color: 'bg-amber-100 text-amber-800' },
  { id: 'respiratoire', label: 'Respiratoire', color: 'bg-sky-100 text-sky-800' },
  { id: 'fievre', label: 'Fièvre', color: 'bg-red-100 text-red-800' },
  { id: 'douleur', label: 'Douleur', color: 'bg-rose-100 text-rose-800' },
  { id: 'peau', label: 'Peau', color: 'bg-pink-100 text-pink-800' },
  { id: 'feminin', label: 'Féminin', color: 'bg-fuchsia-100 text-fuchsia-800' },
  { id: 'enfant', label: 'Enfant', color: 'bg-violet-100 text-violet-800' },
  { id: 'general', label: 'Général', color: 'bg-teal-100 text-teal-800' }
];

interface Props { onBack: () => void }

export default function PharmacopeeScreen({ onBack }: Props) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Plant['category'] | 'all'>('all');
  const [selected, setSelected] = useState<Plant | null>(null);
  useLockBodyScroll(!!selected);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return PLANTS.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.latin} ${p.localNames.join(' ')} ${p.usages.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, cat]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1474904200416-6b2b7926f26f?w=1080" alt="Plantes médicinales" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Leaf className="w-5 h-5" /> Pharmacopée traditionnelle
          </div>
          <h2 className="text-2xl font-bold mt-1">Savoirs ancestraux</h2>
          <p className="text-sm text-white/85 mt-1">Plantes médicinales d'Afrique de l'Ouest</p>
        </div>
      </div>

      <div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 flex gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Information à titre éducatif. Toujours consulter un professionnel de santé avant un traitement à base de plantes, surtout en cas de grossesse, d'allaitement, ou si vous prenez des médicaments.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une plante, un usage…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 w-max">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                cat === c.id ? c.color + ' shadow' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400 text-sm">
            <Leaf className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Aucune plante trouvée pour cette recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {filtered.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => setSelected(p)}
                whileTap={{ scale: 0.98 }}
                className="text-left bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition"
              >
                <div className="flex items-start gap-3">
                  <p.icon className="w-7 h-7 text-emerald-700" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">{p.name}</h3>
                    <p className="text-[11px] italic text-gray-500 dark:text-slate-400 truncate">{p.latin}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                      {p.usages.slice(0, 2).join(' · ')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(CATS.find((c) => c.id === p.category)?.color ?? 'bg-gray-100') && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${CATS.find((c) => c.id === p.category)?.color}`}>
                          {CATS.find((c) => c.id === p.category)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-teal-700 to-cyan-600 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selected.icon className="w-7 h-7 text-emerald-700" strokeWidth={1.75} />
                  <div>
                    <h2 className="font-bold text-lg">{selected.name}</h2>
                    <p className="text-xs italic text-teal-50">{selected.latin}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/20 rounded-full" aria-label="Fermer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-sm">
                {selected.localNames.length > 0 && (
                  <Section icon={<BookOpen className="w-4 h-4" />} title="Noms locaux">
                    <p className="text-gray-700 dark:text-slate-300">{selected.localNames.join(' · ')}</p>
                  </Section>
                )}

                <Section icon={<Leaf className="w-4 h-4" />} title="Parties utilisées">
                  <p className="text-gray-700 dark:text-slate-300">{selected.parts.join(', ')}</p>
                </Section>

                <Section icon={<Sparkles className="w-4 h-4" />} title="Usages traditionnels">
                  <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-0.5">
                    {selected.usages.map((u) => <li key={u}>{u}</li>)}
                  </ul>
                </Section>

                <Section icon={<Info className="w-4 h-4" />} title="Préparation">
                  <p className="text-gray-700 dark:text-slate-300">{selected.preparation}</p>
                </Section>

                <Section icon={<Info className="w-4 h-4" />} title="Posologie">
                  <p className="text-gray-700 dark:text-slate-300">{selected.posologie}</p>
                </Section>

                {selected.warnings.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-semibold mb-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Précautions</span>
                    </div>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-200 space-y-0.5 text-xs">
                      {selected.warnings.map((w) => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold text-xs uppercase tracking-wide mb-1">
        {icon}<span>{title}</span>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}
