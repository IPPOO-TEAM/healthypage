import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, MapPin, Heart, Sparkles, Mountain, Waves, Leaf, Sun,
  Users, Baby, Wind, Flame, ChevronRight, Star, Coins, Gift, Ticket,
  Compass, Map as MapIcon, User, Filter, Calendar, ListChecks, X, Bell,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { usePoints } from '../components/usePoints';

interface Props { onBack: () => void; }

type BottomTab = 'explorer' | 'carte' | 'favoris' | 'avantages' | 'profil';
type View = 'home' | 'collection' | 'fiche' | 'sejour' | 'results';

// ---------- Données : esthétique africaine moderne ----------
const PLACES = [
  {
    id: 'p1', name: 'Lagune & Mangrove – Saly Retreat', country: 'Sénégal', region: 'Petite Côte',
    price: 420, rating: 4.9, reviews: 184, calm: 5, nature: 5, soins: 4,
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
    tags: ['Calme', 'Nature', 'Spa'], collection: 'lagunes',
    intentions: ['Souffler', 'Récupérer', 'Couper avec le stress'],
    feel: 'L\'air salé qui apaise, le silence ponctué d\'oiseaux, le sable doux sous les pieds au lever du jour.',
    forces: ['Cadre apaisant', 'Confort de sommeil exceptionnel', 'Spa marin', 'Accès direct lagune'],
    equip: ['Spa', 'Sauna', 'Bain nordique', 'Sentiers', 'Yoga shala', 'Cuisine locale saine'],
  },
  {
    id: 'p2', name: 'Baobab Lodge – Bandia', country: 'Sénégal', region: 'Réserve nature',
    price: 285, rating: 4.7, reviews: 92, calm: 5, nature: 5, soins: 2,
    img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    tags: ['Nature', 'Silence', 'Famille'], collection: 'savanes',
    intentions: ['Se reconnecter', 'Ralentir', 'Respirer'],
    feel: 'L\'ombre des baobabs millénaires, la lumière dorée sur la savane, le silence habité.',
    forces: ['Immersion nature totale', 'Architecture en terre crue', 'Silence préservé', 'Cuisine du terroir'],
    equip: ['Sentiers', 'Espaces calmes', 'Restauration locale', 'Bibliothèque'],
  },
  {
    id: 'p3', name: 'Atlas Hammam – Ourika Valley', country: 'Maroc', region: 'Atlas',
    price: 540, rating: 4.8, reviews: 211, calm: 4, nature: 4, soins: 5,
    img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&q=80',
    tags: ['Spa', 'Soins', 'Montagne'], collection: 'montagnes',
    intentions: ['Récupérer', 'Soigner le corps', 'Couper avec le stress'],
    feel: 'La vapeur du hammam, l\'argile chaude, le thé à la menthe, le souffle frais des montagnes.',
    forces: ['Hammam traditionnel', 'Soins berbères', 'Air pur de l\'Atlas', 'Architecture en pisé'],
    equip: ['Hammam', 'Spa', 'Sauna', 'Piscine', 'Yoga', 'Sentiers de montagne'],
  },
  {
    id: 'p4', name: 'Île aux Aigrettes – Sun Lodge', country: 'Maurice', region: 'Océan Indien',
    price: 720, rating: 4.9, reviews: 312, calm: 5, nature: 5, soins: 5,
    img: 'https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=1200&q=80',
    tags: ['Mer', 'Spa', 'Premium'], collection: 'mers',
    intentions: ['Souffler', 'Se ressourcer', 'Célébrer une étape'],
    feel: 'Le rythme de l\'océan, la douceur des alizés, les couleurs du lagon à toutes les heures.',
    forces: ['Plage privée', 'Spa face à l\'océan', 'Cuisine créole bien-être', 'Massages ayurvédiques'],
    equip: ['Spa', 'Piscine à débordement', 'Yoga', 'Snorkeling', 'Bain nordique'],
  },
  {
    id: 'p5', name: 'Désert & Silence – Erg Chebbi', country: 'Maroc', region: 'Sahara',
    price: 380, rating: 4.6, reviews: 78, calm: 5, nature: 4, soins: 2,
    img: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=80',
    tags: ['Désert', 'Silence', 'Méditation'], collection: 'desert',
    intentions: ['Méditer', 'Se reconnecter à l\'essentiel', 'Couper le numérique'],
    feel: 'L\'immensité, le silence absolu, les étoiles innombrables, la chaleur du sable au coucher.',
    forces: ['Camp éco-responsable', 'Méditation guidée', 'Détox numérique', 'Astronomie'],
    equip: ['Tentes berbères', 'Espaces calmes', 'Cuisine locale', 'Astronomie'],
  },
  {
    id: 'p6', name: 'Forêt tropicale – Korhogo Eco', country: 'Côte d\'Ivoire', region: 'Nord',
    price: 295, rating: 4.5, reviews: 64, calm: 4, nature: 5, soins: 3,
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80',
    tags: ['Forêt', 'Culture', 'Artisanat'], collection: 'forets',
    intentions: ['S\'ouvrir', 'Se reconnecter', 'Apprendre'],
    feel: 'L\'humidité douce, les chants d\'oiseaux à l\'aube, l\'odeur de la terre après la pluie.',
    forces: ['Immersion culturelle', 'Ateliers artisanat', 'Cuisine locale vivante', 'Sentiers forestiers'],
    equip: ['Cases traditionnelles', 'Espaces calmes', 'Ateliers', 'Sentiers'],
  },
];

const COLLECTIONS = [
  {
    id: 'lagunes', title: 'Escapades lagunes & mangroves',
    hook: 'Ici, le calme devient une habitude.',
    desc: 'Des séjours au bord de l\'eau, entre lagunes douces et mangroves protégées.',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  },
  {
    id: 'savanes', title: 'Savanes & grandes respirations',
    hook: 'L\'horizon comme thérapie.',
    desc: 'Lieux choisis pour leur immensité, leur calme et leur lumière.',
    img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80',
  },
  {
    id: 'montagnes', title: 'Montagnes & air frais',
    hook: 'Respirer plus haut, dormir plus profond.',
    desc: 'Des refuges en altitude, hammams berbères et sentiers d\'altitude.',
    img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1600&q=80',
  },
  {
    id: 'desert', title: 'Désert & silence',
    hook: 'Le silence comme luxe absolu.',
    desc: 'Camps éco-responsables, méditation, ciels étoilés.',
    img: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80',
  },
  {
    id: 'mers', title: 'Bords de mer & respiration',
    hook: 'Le rythme des vagues, le rythme du repos.',
    desc: 'Côtes Atlantique et Océan Indien, spas face à la mer.',
    img: 'https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=1600&q=80',
  },
  {
    id: 'forets', title: 'Forêts tropicales & culture',
    hook: 'L\'authentique sans sacrifier le confort.',
    desc: 'Immersion culturelle, artisanat contemporain, cuisine vivante.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&q=80',
  },
];

const SHORTCUTS = [
  { id: 'weekend', label: 'Week-end détente', icon: Sun },
  { id: 'meditation', label: 'Retraite méditation', icon: Sparkles },
  { id: 'detox', label: 'Détox douce', icon: Leaf },
  { id: 'senior', label: 'Séjour sénior', icon: Heart },
  { id: 'partum', label: 'Post-partum', icon: Baby },
  { id: 'nature', label: 'Nature & rando', icon: Mountain },
  { id: 'thermes', label: 'Cures thermales', icon: Waves },
  { id: 'famille', label: 'Famille', icon: Users },
];

const FILTER_GROUPS = [
  {
    title: 'Intention',
    options: ['Souffler', 'Récupérer', 'Bouger doucement', 'Couper avec le stress', 'Méditer'],
  },
  {
    title: 'Type de lieu',
    options: ['Lodge', 'Hôtel bien-être', 'Camp éco', 'Riad', 'Maison d\'hôtes'],
  },
  {
    title: 'Niveau de calme',
    options: ['Très calme', 'Calme', 'Animé'],
  },
  {
    title: 'Confort & soins',
    options: ['Spa & soins', 'Hammam', 'Yoga & méditation', 'Piscine', 'Bain nordique', 'Sauna'],
  },
  {
    title: 'Adapté à',
    options: ['Familles', 'Seniors', 'Post-partum', 'Animaux acceptés', 'Accessibilité PMR'],
  },
  {
    title: 'Restauration',
    options: ['Repas inclus', 'Cuisine locale', 'Végétarien', 'Sans gluten'],
  },
];

const WHEEL_PRIZES = [
  { label: '20 pts', kind: 'points', value: 20, color: '#0d9488' },
  { label: '-10% séjour', kind: 'discount', value: 10, color: '#d97706' },
  { label: '50 pts', kind: 'points', value: 50, color: '#0891b2' },
  { label: 'Ticket cadeau', kind: 'ticket', value: 1, color: '#9333ea' },
  { label: '10 pts', kind: 'points', value: 10, color: '#10b981' },
  { label: '-5% activité', kind: 'discount', value: 5, color: '#dc2626' },
  { label: '100 pts', kind: 'points', value: 100, color: '#0ea5e9' },
  { label: 'Re-tente', kind: 'retry', value: 0, color: '#94a3b8' },
];

const AROUND = [
  { id: 'a1', title: 'Randonnée mangrove', dur: '2h30', niveau: 'Modéré', dist: '1 km', when: 'Matin', icon: Mountain },
  { id: 'a2', title: 'Yoga lever du soleil', dur: '1h', niveau: 'Doux', dist: 'Sur place', when: '6h30', icon: Sparkles },
  { id: 'a3', title: 'Marché artisanal', dur: '2h', niveau: 'Doux', dist: '4 km', when: 'Matin', icon: Leaf },
  { id: 'a4', title: 'Hammam traditionnel', dur: '1h30', niveau: 'Doux', dist: 'Sur place', when: 'Après-midi', icon: Flame },
  { id: 'a5', title: 'Méditation au coucher', dur: '45 min', niveau: 'Doux', dist: 'Sur place', when: '19h', icon: Wind },
];

// ---------- Composant principal ----------
export default function VoyageLoisirsScreen({ onBack }: Props) {
  const [tab, setTab] = useState<BottomTab>('explorer');
  const [view, setView] = useState<View>('home');
  const [activePlace, setActivePlace] = useState<typeof PLACES[number] | null>(null);
  const [activeCollection, setActiveCollection] = useState<typeof COLLECTIONS[number] | null>(null);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const points = usePoints();

  const toggleFav = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const toggleFilter = (opt: string) =>
    setActiveFilters((f) => (f.includes(opt) ? f.filter((x) => x !== opt) : [...f, opt]));

  const filteredPlaces = useMemo(() => {
    let list = PLACES;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeFilters.length > 0) {
      list = list.filter((p) =>
        activeFilters.some(
          (f) => p.tags.includes(f) || p.intentions.includes(f) || p.equip.includes(f)
        )
      );
    }
    return list;
  }, [search, activeFilters]);

  const openPlace = (p: typeof PLACES[number]) => {
    setActivePlace(p);
    setView('fiche');
  };
  const openCollection = (c: typeof COLLECTIONS[number]) => {
    setActiveCollection(c);
    setView('collection');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* TOP BAR */}
      <TopBar onBack={onBack} balance={points.balance} />

      {/* CONTENT par onglet */}
      <div className="px-4 pt-3">
        {tab === 'explorer' && (
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ExplorerHome
                  search={search}
                  setSearch={setSearch}
                  onSearch={() => setView('results')}
                  onShortcut={(id) => {
                    const map: Record<string, string> = {
                      weekend: 'Souffler', meditation: 'Méditer', detox: 'Récupérer',
                      senior: 'Seniors', partum: 'Post-partum', nature: 'Nature',
                      thermes: 'Spa & soins', famille: 'Familles',
                    };
                    setActiveFilters([map[id] ?? '']);
                    setView('results');
                  }}
                  onOpenCollection={openCollection}
                  onOpenPlace={openPlace}
                  onOpenFilters={() => setFiltersOpen(true)}
                />
              </motion.div>
            )}
            {view === 'collection' && activeCollection && (
              <motion.div key="coll" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <CollectionPage
                  collection={activeCollection}
                  places={PLACES.filter((p) => p.collection === activeCollection.id)}
                  onBack={() => setView('home')}
                  onOpenPlace={openPlace}
                  favorites={favorites}
                  onToggleFav={toggleFav}
                />
              </motion.div>
            )}
            {view === 'results' && (
              <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <ResultsPage
                  places={filteredPlaces}
                  search={search}
                  setSearch={setSearch}
                  activeFilters={activeFilters}
                  onClearFilter={(f) => setActiveFilters((x) => x.filter((y) => y !== f))}
                  onOpenFilters={() => setFiltersOpen(true)}
                  onBack={() => setView('home')}
                  onOpenPlace={openPlace}
                  favorites={favorites}
                  onToggleFav={toggleFav}
                />
              </motion.div>
            )}
            {view === 'fiche' && activePlace && (
              <motion.div key="fiche" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <PlaceDetail
                  place={activePlace}
                  onBack={() => setView(activeCollection ? 'collection' : 'home')}
                  onReserve={() => {
                    points.award(20, `Réservation initiée : ${activePlace.name}`, 'voyage');
                    alert('Demande de disponibilités envoyée. +20 pts !');
                  }}
                  isFav={favorites.includes(activePlace.id)}
                  onToggleFav={() => toggleFav(activePlace.id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {tab === 'carte' && (
          <CartePage places={PLACES} onOpenPlace={openPlace} onOpenFilters={() => setFiltersOpen(true)} />
        )}

        {tab === 'favoris' && (
          <FavorisPage
            places={PLACES.filter((p) => favorites.includes(p.id))}
            onOpenPlace={openPlace}
            onToggleFav={toggleFav}
          />
        )}

        {tab === 'avantages' && (
          <AvantagesPage
            balance={points.balance}
            onUseTicket={(label) => points.award(15, `Ticket utilisé : ${label}`, 'voyage')}
            onWin={(p) => {
              if (p.kind === 'points' && p.value > 0)
                points.award(p.value, `Roue Voyage : ${p.label}`, 'wheel');
              if (p.kind === 'ticket')
                points.award(50, `Roue Voyage : ${p.label}`, 'wheel', { kind: 'ticket' });
            }}
            onSpend={(amt) => points.spend(amt, 'Tour de roue Voyage', 'wheel')}
            prizes={WHEEL_PRIZES}
          />
        )}

        {tab === 'profil' && <ProfilPage favoritesCount={favorites.length} />}
      </div>

      {/* FILTRES MODAL */}
      <AnimatePresence>
        {filtersOpen && (
          <FiltersDrawer
            active={activeFilters}
            onToggle={toggleFilter}
            onClose={() => setFiltersOpen(false)}
            onClear={() => setActiveFilters([])}
            onApply={() => {
              setFiltersOpen(false);
              setView('results');
              setTab('explorer');
            }}
          />
        )}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      <BottomNav active={tab} onChange={(t) => { setTab(t); setView('home'); }} />
    </div>
  );
}

// ---------- Top bar ----------
function TopBar({ onBack, balance }: { onBack: () => void; balance: number }) {
  return (
    <div className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/70">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm bg-white px-3 py-1.5 rounded-full ring-1 ring-stone-200 hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
            HEALTHY · Voyage
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-white ring-1 ring-stone-200 hover:bg-stone-100">
            <Bell className="w-4 h-4 text-stone-700" />
          </button>
          <div className="bg-white px-3 py-1.5 rounded-full ring-1 ring-stone-200 inline-flex items-center gap-1 text-sm font-bold text-amber-700">
            <Coins className="w-4 h-4" /> {balance}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Explorer Home (hero + collections) ----------
function ExplorerHome({
  search, setSearch, onSearch, onShortcut, onOpenCollection, onOpenPlace, onOpenFilters,
}: {
  search: string; setSearch: (v: string) => void; onSearch: () => void;
  onShortcut: (id: string) => void;
  onOpenCollection: (c: typeof COLLECTIONS[number]) => void;
  onOpenPlace: (p: typeof PLACES[number]) => void;
  onOpenFilters: () => void;
}) {
  const featured = PLACES.slice(0, 3);
  const topRated = [...PLACES].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative h-[420px] rounded-3xl overflow-hidden -mx-1">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=85"
          alt="Voyage bien-être"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Motif subtil africain */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/30 to-stone-900/20" />
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(217,119,6,0.6), transparent 30%), radial-gradient(circle at 80% 70%, rgba(180,83,9,0.4), transparent 35%)',
          }}
        />

        <div className="relative h-full flex flex-col justify-end p-6">
          <span className="inline-flex items-center gap-1.5 self-start bg-amber-50/90 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-amber-200/50 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Sélection HEALTHY PAGE
          </span>
          <h1 className="text-white font-bold text-3xl leading-tight max-w-md">
            Où souhaitez-vous respirer, ralentir, vous ressourcer ?
          </h1>
          <p className="text-stone-100/90 text-sm mt-2 max-w-lg">
            Une sélection de séjours bien-être choisie pour leur calme,
            leur lumière et leur authenticité.
          </p>

          {/* Barre de recherche */}
          <div className="mt-5 bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder="Destination, séjour, intention..."
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-stone-800 placeholder-stone-400"
              />
            </div>
            <button
              onClick={onOpenFilters}
              className="px-3 py-2.5 rounded-xl text-stone-700 hover:bg-stone-100 ring-1 ring-stone-200 inline-flex items-center gap-1 text-sm"
            >
              <Filter className="w-4 h-4" /> Filtres
            </button>
            <button
              onClick={onSearch}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* RACCOURCIS */}
      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => onShortcut(s.id)}
                className="shrink-0 inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full ring-1 ring-stone-200 hover:bg-amber-50 hover:ring-amber-300 transition-colors text-sm font-medium text-stone-700"
              >
                <Icon className="w-4 h-4 text-amber-700" /> {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PEPITES */}
      <section>
        <SectionTitle
          eyebrow="Édito"
          title="Nos pépites africaines du moment"
          hook="Des lieux qui respirent, des séjours qui apaisent."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {featured.map((p) => (
            <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p)} large />
          ))}
        </div>
      </section>

      {/* COLLECTIONS éditoriales */}
      <section>
        <SectionTitle
          eyebrow="Collections"
          title="Choisissez votre univers"
          hook="L'image décide, le texte rassure, le bouton réserve."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {COLLECTIONS.map((c) => (
            <CollectionCard key={c.id} collection={c} onClick={() => onOpenCollection(c)} />
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section>
        <SectionTitle
          eyebrow="Les mieux notés"
          title="Une sélection qui respecte votre énergie"
          hook="Avis qui parlent du ressenti, pas seulement du décor."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {topRated.map((p) => (
            <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p)} />
          ))}
        </div>
      </section>

      {/* VOYAGER SEREINEMENT */}
      <SantéVoyageBlock />
    </div>
  );
}

// ---------- Collection page ----------
function CollectionPage({
  collection, places, onBack, onOpenPlace, favorites, onToggleFav,
}: {
  collection: typeof COLLECTIONS[number];
  places: typeof PLACES; onBack: () => void;
  onOpenPlace: (p: typeof PLACES[number]) => void;
  favorites: string[]; onToggleFav: (id: string) => void;
}) {
  return (
    <div className="space-y-5 -mx-4">
      <div className="relative h-[320px] overflow-hidden">
        <ImageWithFallback src={collection.img} alt={collection.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 inline-flex items-center gap-1 text-sm bg-white/90 px-3 py-1.5 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="absolute bottom-0 p-6 text-white max-w-2xl">
          <span className="inline-block bg-amber-50/90 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold mb-3">Collection</span>
          <h1 className="text-3xl font-bold">{collection.title}</h1>
          <p className="italic text-amber-100 mt-2">{collection.hook}</p>
          <p className="text-stone-100/90 mt-1 text-sm">{collection.desc}</p>
        </div>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((p) => (
            <PlaceCard
              key={p.id}
              place={p}
              onClick={() => onOpenPlace(p)}
              isFav={favorites.includes(p.id)}
              onFav={() => onToggleFav(p.id)}
            />
          ))}
          {places.length === 0 && (
            <p className="text-stone-500 text-sm">Cette collection sera enrichie prochainement.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Results ----------
function ResultsPage({
  places, search, setSearch, activeFilters, onClearFilter, onOpenFilters, onBack, onOpenPlace, favorites, onToggleFav,
}: {
  places: typeof PLACES; search: string; setSearch: (s: string) => void;
  activeFilters: string[]; onClearFilter: (f: string) => void;
  onOpenFilters: () => void; onBack: () => void;
  onOpenPlace: (p: typeof PLACES[number]) => void;
  favorites: string[]; onToggleFav: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm bg-white px-3 py-1.5 rounded-full ring-1 ring-stone-200">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </button>
        <div className="flex-1 bg-white rounded-full ring-1 ring-stone-200 px-3 py-2 inline-flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Affiner..." className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <button onClick={onOpenFilters} className="p-2 rounded-full bg-white ring-1 ring-stone-200">
          <Filter className="w-4 h-4 text-stone-700" />
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <button
              key={f}
              onClick={() => onClearFilter(f)}
              className="inline-flex items-center gap-1 bg-stone-900 text-white px-3 py-1 rounded-full text-xs"
            >
              {f} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-stone-600">
        <span className="font-semibold text-stone-800">{places.length} lieux</span> · Une sélection pensée pour votre bien-être.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((p) => (
          <PlaceCard
            key={p.id}
            place={p}
            onClick={() => onOpenPlace(p)}
            isFav={favorites.includes(p.id)}
            onFav={() => onToggleFav(p.id)}
          />
        ))}
        {places.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-500 text-sm">
            Aucun résultat. Essayez d'élargir vos filtres.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Place detail ----------
function PlaceDetail({
  place, onBack, onReserve, isFav, onToggleFav,
}: {
  place: typeof PLACES[number]; onBack: () => void; onReserve: () => void;
  isFav: boolean; onToggleFav: () => void;
}) {
  return (
    <div className="space-y-5 -mx-4 pb-32">
      <div className="relative h-[380px] overflow-hidden">
        <ImageWithFallback src={place.img} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-stone-900/20" />
        <button onClick={onBack} className="absolute top-4 left-4 inline-flex items-center gap-1 text-sm bg-white/90 px-3 py-1.5 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <button onClick={onToggleFav} className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white">
          <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-700'}`} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5" /> {place.region} · {place.country}
          </div>
          <h1 className="text-3xl font-bold mt-1">{place.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {place.rating} <span className="opacity-80">({place.reviews} avis)</span></span>
            <span className="opacity-50">·</span>
            <span className="font-semibold">{place.price} € / nuit</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Idéal pour */}
        <div className="bg-amber-50 rounded-2xl p-4 ring-1 ring-amber-200/60">
          <h3 className="text-sm font-semibold text-amber-900 mb-2 inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Ce lieu est idéal pour
          </h3>
          <div className="flex flex-wrap gap-2">
            {place.intentions.map((i) => (
              <span key={i} className="bg-white text-amber-900 px-3 py-1 rounded-full text-xs font-medium ring-1 ring-amber-200">{i}</span>
            ))}
          </div>
        </div>

        {/* Ressenti */}
        <section>
          <h2 className="font-bold text-stone-900">Ce que vous allez ressentir</h2>
          <p className="text-stone-700 mt-2 italic leading-relaxed">"{place.feel}"</p>
        </section>

        {/* Forces */}
        <section>
          <h2 className="font-bold text-stone-900">Points forts HEALTHY PAGE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {place.forces.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-3 ring-1 ring-stone-200 text-sm text-stone-700 inline-flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-700 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </section>

        {/* Indicateurs bien-être */}
        <section className="bg-white rounded-2xl p-4 ring-1 ring-stone-200">
          <h3 className="font-bold text-stone-900 mb-3">Indicateurs bien-être</h3>
          <div className="space-y-2">
            <Indic label="Calme" value={place.calm} />
            <Indic label="Nature" value={place.nature} />
            <Indic label="Soins" value={place.soins} />
          </div>
        </section>

        {/* Équipements */}
        <section>
          <h2 className="font-bold text-stone-900">Équipements</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {place.equip.map((e) => (
              <span key={e} className="bg-white px-3 py-1.5 rounded-full text-xs ring-1 ring-stone-200 text-stone-700">{e}</span>
            ))}
          </div>
        </section>

        {/* Activités autour */}
        <section>
          <h2 className="font-bold text-stone-900">À faire autour</h2>
          <p className="text-sm text-stone-600 mt-1">Des activités qui prolongent l'effet bien-être sans surcharger vos journées.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {AROUND.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="bg-white rounded-xl p-3 ring-1 ring-stone-200 flex items-center gap-3">
                  <div className="bg-emerald-50 p-2 rounded-lg"><Icon className="w-5 h-5 text-emerald-700" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-stone-900 truncate">{a.title}</h4>
                    <p className="text-xs text-stone-500">{a.dur} · {a.niveau} · {a.dist}</p>
                  </div>
                  <span className="text-xs text-stone-400">{a.when}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Infos pratiques */}
        <section className="bg-stone-100 rounded-2xl p-4">
          <h3 className="font-bold text-stone-900 mb-2">Infos pratiques</h3>
          <ul className="text-sm text-stone-700 space-y-1">
            <li>• Arrivée à partir de 15h, départ 11h</li>
            <li>• Stationnement gratuit sur place</li>
            <li>• Accès PMR pour les espaces communs</li>
            <li>• Animaux non admis · Non-fumeur</li>
          </ul>
        </section>
      </div>

      {/* CTA fixe */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-200 p-3 flex items-center gap-3 max-w-lg mx-auto">
          <div>
            <div className="text-xs text-stone-500">à partir de</div>
            <div className="font-bold text-stone-900">{place.price} € <span className="text-xs font-normal text-stone-500">/ nuit</span></div>
          </div>
          <button onClick={onReserve} className="flex-1 py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 inline-flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Voir les disponibilités
          </button>
        </div>
      </div>
    </div>
  );
}

function Indic({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs text-stone-600">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${value * 20}%` }} />
      </div>
      <div className="text-xs font-semibold text-stone-700 w-8 text-right">{value}/5</div>
    </div>
  );
}

// ---------- Carte Page ----------
function CartePage({
  places, onOpenPlace, onOpenFilters,
}: { places: typeof PLACES; onOpenPlace: (p: typeof PLACES[number]) => void; onOpenFilters: () => void }) {
  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Carte" title="Explorez par région" hook="Repérez le lieu qui correspond à votre rythme." />

      <div className="relative h-[420px] rounded-2xl overflow-hidden ring-1 ring-stone-200 bg-stone-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #d6e6c5 50%, #ade2dd 75%, #91d5e0 100%)',
          }}
        />
        {/* Pseudo continent africain */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-50">
          <path d="M180 60 Q220 50 260 80 Q300 120 290 180 Q300 240 260 300 Q220 360 180 350 Q140 340 130 280 Q100 240 110 180 Q120 100 180 60 Z" fill="#a8a29e" stroke="#78716c" strokeWidth="2"/>
        </svg>

        {/* Pins */}
        {places.map((p, i) => {
          const positions = [
            { left: '40%', top: '35%' }, { left: '45%', top: '45%' }, { left: '38%', top: '20%' },
            { left: '70%', top: '60%' }, { left: '42%', top: '15%' }, { left: '35%', top: '50%' },
          ];
          const pos = positions[i % positions.length];
          return (
            <button
              key={p.id}
              onClick={() => onOpenPlace(p)}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="bg-stone-900 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                {p.price} €
              </div>
              <div className="w-3 h-3 bg-stone-900 rotate-45 mx-auto -mt-1 shadow" />
            </button>
          );
        })}

        <button onClick={onOpenFilters} className="absolute top-3 right-3 bg-white px-3 py-2 rounded-full shadow-md text-sm font-medium inline-flex items-center gap-1">
          <Filter className="w-4 h-4" /> Filtres
        </button>
      </div>

      {/* Carrousel cartes */}
      <div className="-mx-4 overflow-x-auto pb-2">
        <div className="flex gap-3 px-4">
          {places.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPlace(p)}
              className="shrink-0 w-72 bg-white rounded-2xl overflow-hidden ring-1 ring-stone-200 text-left"
            >
              <div className="relative h-32">
                <ImageWithFallback src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-stone-900 truncate">{p.name}</h3>
                <p className="text-xs text-stone-500 truncate">{p.region}, {p.country}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs inline-flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating}</span>
                  <span className="font-bold text-sm">{p.price} €</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Favoris ----------
function FavorisPage({
  places, onOpenPlace, onToggleFav,
}: { places: typeof PLACES; onOpenPlace: (p: typeof PLACES[number]) => void; onToggleFav: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow="Favoris"
        title="Vos plus belles idées d'évasion"
        hook="Gardez vos coups de cœur à portée de main."
      />
      {places.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center ring-1 ring-stone-200">
          <Heart className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-600">Aucun favori pour l'instant. Touchez le cœur sur un lieu pour le retrouver ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((p) => (
            <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p)} isFav onFav={() => onToggleFav(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Avantages (promos + cartes cadeaux + roue) ----------
function AvantagesPage({
  balance, onUseTicket, onWin, onSpend, prizes,
}: {
  balance: number; onUseTicket: (label: string) => void;
  onWin: (p: any) => void; onSpend: (amt: number) => boolean;
  prizes: typeof WHEEL_PRIZES;
}) {
  const promos = [
    { id: 'p1', title: 'Pack duo détox -20%', sub: 'Valable jusqu\'au 30/06', color: 'from-rose-500 to-amber-600' },
    { id: 'p2', title: 'Famille +1 enfant offert', sub: 'Sur séjours sélectionnés', color: 'from-amber-500 to-orange-600' },
    { id: 'p3', title: 'Carte cadeau 100 €', sub: 'À offrir à un proche', color: 'from-emerald-600 to-teal-700' },
    { id: 'p4', title: 'Code partenaire fidélité', sub: '-15% au panier', color: 'from-indigo-700 to-purple-700' },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Avantages" title="Offrez du repos, offrez une vraie pause" hook="Des avantages qui transforment l'envie en réservation." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {promos.map((p) => (
          <div key={p.id} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${p.color} text-white shadow-md`}>
            <Ticket className="w-7 h-7 mb-2 opacity-90" />
            <h3 className="font-bold text-lg">{p.title}</h3>
            <p className="text-xs text-white/85 mt-1">{p.sub}</p>
            <button onClick={() => onUseTicket(p.title)} className="mt-3 inline-flex items-center gap-1 bg-white text-stone-900 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-stone-50">
              Activer <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <Wheel prizes={prizes} balance={balance} onWin={onWin} onSpend={onSpend} />
    </div>
  );
}

function Wheel({
  prizes, balance, onWin, onSpend,
}: { prizes: typeof WHEEL_PRIZES; balance: number; onWin: (p: any) => void; onSpend: (amt: number) => boolean }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const seg = 360 / prizes.length;
  const COST = 5;

  const spin = () => {
    if (spinning) return;
    if (balance < COST) { setResult({ kind: 'error', label: `${COST} pts requis` }); return; }
    if (!onSpend(COST)) { setResult({ kind: 'error', label: 'Solde insuffisant' }); return; }
    setSpinning(true); setResult(null);
    const idx = Math.floor(Math.random() * prizes.length);
    setAngle(360 * 6 + (360 - idx * seg - seg / 2));
    setTimeout(() => {
      setSpinning(false);
      const prize = prizes[idx];
      setResult(prize);
      if (prize.kind !== 'retry') onWin(prize);
    }, 4200);
  };

  return (
    <section className="bg-white rounded-2xl p-5 ring-1 ring-stone-200">
      <h2 className="font-bold text-stone-900">Roue de la fortune</h2>
      <p className="text-sm text-stone-600 mt-1">Un tour, un avantage, une raison de partir plus vite.</p>
      <div className="flex flex-col items-center mt-4">
        <div className="relative w-72 h-72">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-stone-900" />
          </div>
          <motion.div
            animate={{ rotate: angle }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.32, 1.27] }}
            className="w-full h-full rounded-full shadow-xl ring-4 ring-amber-50 relative overflow-hidden"
            style={{ background: `conic-gradient(${prizes.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ')})` }}
          >
            {prizes.map((p, i) => (
              <div key={i} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${i * seg + seg / 2}deg)` }}>
                <span className="mt-3 text-[10px] font-bold text-white drop-shadow">{p.label}</span>
              </div>
            ))}
          </motion.div>
          <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white shadow-md ring-4 ring-amber-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <button onClick={spin} disabled={spinning} className="mt-6 px-6 py-3 rounded-2xl bg-stone-900 text-white font-semibold hover:bg-stone-800 disabled:opacity-60">
          {spinning ? 'La roue tourne…' : `Tourner (${COST} pts)`}
        </button>
        {result && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-stone-800">
            🎉 {result.kind === 'error' ? result.label : `Gain : ${result.label}`}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Profil ----------
function ProfilPage({ favoritesCount }: { favoritesCount: number }) {
  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Profil" title="Votre espace voyage" hook="Vos préférences, vos outils, vos avantages." />

      <div className="bg-white rounded-2xl p-5 ring-1 ring-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-stone-900 font-bold text-xl">A</div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-900">Voyageur HEALTHY PAGE</h3>
            <p className="text-xs text-stone-500">Profil santé voyage actif</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Favoris" value={favoritesCount} />
          <Stat label="Réservations" value={0} />
          <Stat label="Tickets" value={0} />
        </div>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-stone-200 divide-y divide-stone-100">
        {[
          { icon: ListChecks, label: 'Mon profil santé voyage', sub: 'Allergies, traitements, contacts urgence' },
          { icon: Heart, label: 'Mes préférences bien-être', sub: 'Calme, nature, soins, alimentation' },
          { icon: Calendar, label: 'Mes réservations' },
          { icon: Gift, label: 'Mes cartes & tickets cadeaux' },
        ].map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} className="w-full p-4 flex items-center gap-3 hover:bg-stone-50 text-left">
              <div className="bg-amber-50 p-2 rounded-lg"><Icon className="w-5 h-5 text-amber-700" /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-stone-900">{it.label}</h4>
                {it.sub && <p className="text-xs text-stone-500">{it.sub}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-stone-50 rounded-xl p-3 text-center">
      <div className="font-bold text-xl text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}

// ---------- Filtres drawer ----------
function FiltersDrawer({
  active, onToggle, onClose, onClear, onApply,
}: { active: string[]; onToggle: (o: string) => void; onClose: () => void; onClear: () => void; onApply: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Affinez en quelques gestes</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <p className="text-xs text-stone-500">Choisissez votre intention et nous ajustons la sélection.</p>
          {FILTER_GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="font-semibold text-sm text-stone-900 mb-2">{g.title}</h4>
              <div className="flex flex-wrap gap-2">
                {g.options.map((opt) => {
                  const on = active.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => onToggle(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        on ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-stone-100 flex gap-2">
          <button onClick={onClear} className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200">Effacer</button>
          <button onClick={onApply} className="flex-1 py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800">Voir les résultats</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Bottom nav ----------
function BottomNav({ active, onChange }: { active: BottomTab; onChange: (t: BottomTab) => void }) {
  const items: { id: BottomTab; label: string; icon: any }[] = [
    { id: 'explorer', label: 'Explorer', icon: Compass },
    { id: 'carte', label: 'Carte', icon: MapIcon },
    { id: 'favoris', label: 'Favoris', icon: Heart },
    { id: 'avantages', label: 'Avantages', icon: Gift },
    { id: 'profil', label: 'Profil', icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const on = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={`py-3 flex flex-col items-center gap-1 text-xs ${on ? 'text-stone-900' : 'text-stone-400'}`}
            >
              <Icon className={`w-5 h-5 ${on ? 'fill-amber-100' : ''}`} strokeWidth={on ? 2.4 : 1.8} />
              <span className={on ? 'font-semibold' : ''}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------- Cartes & blocs réutilisables ----------
function PlaceCard({
  place, onClick, large, isFav, onFav,
}: {
  place: typeof PLACES[number]; onClick: () => void; large?: boolean;
  isFav?: boolean; onFav?: () => void;
}) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className={`relative overflow-hidden rounded-2xl ${large ? 'h-64' : 'h-48'}`}>
        <ImageWithFallback src={place.img} alt={place.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
        {onFav && (
          <button
            onClick={(e) => { e.stopPropagation(); onFav(); }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-700'}`} />
          </button>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {place.tags.slice(0, 2).map((t) => (
            <span key={t} className="bg-white/90 text-stone-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">{t}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 truncate">{place.name}</h3>
            <p className="text-xs text-stone-500 inline-flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {place.region}, {place.country}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {place.rating}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-stone-500">{place.reviews} avis</span>
          <span className="font-bold text-stone-900">{place.price} <span className="text-xs font-normal text-stone-500">€/nuit</span></span>
        </div>
      </div>
    </article>
  );
}

function CollectionCard({
  collection, onClick,
}: { collection: typeof COLLECTIONS[number]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group relative h-56 rounded-2xl overflow-hidden text-left">
      <ImageWithFallback src={collection.img} alt={collection.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/40 to-transparent" />
      <div className="absolute bottom-0 p-4 text-white">
        <h3 className="font-bold text-lg leading-tight">{collection.title}</h3>
        <p className="text-xs italic text-amber-100 mt-1">{collection.hook}</p>
      </div>
    </button>
  );
}

function SectionTitle({ eyebrow, title, hook }: { eyebrow: string; title: string; hook?: string }) {
  return (
    <div>
      <span className="text-[11px] font-bold tracking-widest uppercase text-amber-700">{eyebrow}</span>
      <h2 className="font-bold text-2xl text-stone-900 mt-1 leading-tight">{title}</h2>
      {hook && <p className="text-sm text-stone-600 mt-1 italic">{hook}</p>}
    </div>
  );
}

function SantéVoyageBlock() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 via-amber-50 to-stone-50 rounded-2xl p-5 ring-1 ring-amber-200/40">
      <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-700">Voyager sereinement</span>
      <h2 className="font-bold text-xl text-stone-900 mt-1">Préparez votre santé avant le départ</h2>
      <p className="text-sm text-stone-600 mt-1">Gardez les bons réflexes sur place et au retour.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {['Avant', 'Pendant', 'Sur place', 'Retour'].map((s) => (
          <div key={s} className="bg-white/70 rounded-xl py-3 text-center text-xs font-semibold text-stone-700 ring-1 ring-stone-200/60">{s}</div>
        ))}
      </div>
      <button className="mt-4 inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-stone-800">
        Générer ma check-list <ChevronRight className="w-4 h-4" />
      </button>
    </section>
  );
}
