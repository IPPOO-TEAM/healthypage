import { AFR, AfricanImageKey } from './images';

export type Intent = 'souffler' | 'nature' | 'spa' | 'meditation' | 'detox' | 'famille' | 'senior' | 'cure';

export const INTENT_LABEL: Record<Intent, string> = {
  souffler: 'Souffler',
  nature: 'Nature',
  spa: 'Spa & soins',
  meditation: 'Méditation',
  detox: 'Détox douce',
  famille: 'Famille',
  senior: 'Senior',
  cure: 'Cure',
};

export interface Lieu {
  id: string;
  name: string;
  region: string;
  country: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  calmLevel: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  intents: Intent[];
  hero: AfricanImageKey;
  gallery: AfricanImageKey[];
  short: string;
  feel: string;
  lat: number;
  lng: number;
}

// Chaque image n'apparaît qu'une seule fois sur l'ensemble du catalogue.
export const LIEUX: Lieu[] = [
  {
    id: 'saly-renaissance',
    name: 'Saly Renaissance',
    region: 'Petite Côte',
    country: 'Sénégal',
    pricePerNight: 65000,
    rating: 4.9,
    reviews: 218,
    calmLevel: 4,
    tags: ['Bord de mer', 'Thalasso', 'Bilan santé'],
    intents: ['souffler', 'spa', 'detox', 'cure'],
    hero: 'salyPalmBeach',
    gallery: ['salyUmbrellas', 'salyBoatsRestaurant', 'spaBackMassage', 'foodPlateRice'],
    short: 'Thalasso et bilan santé en bord de mer.',
    feel: 'Le bruit des vagues et le sel sur la peau apaisent profondément. Un rythme volontairement lent.',
    lat: 14.4499, lng: -17.0023,
  },
  {
    id: 'casamance-zen',
    name: 'Casamance Zen',
    region: 'Casamance',
    country: 'Sénégal',
    pricePerNight: 55000,
    rating: 4.8,
    reviews: 142,
    calmLevel: 5,
    tags: ['Mangroves', 'Éco-lodge', 'Pharmacopée'],
    intents: ['nature', 'meditation', 'detox'],
    hero: 'saloumPirogue',
    gallery: ['piroguesColor', 'spaTreeGroup', 'yogaRiver', 'foodFruits'],
    short: 'Forêts, bolongs et soins traditionnels diolas.',
    feel: 'Le silence des bolongs et la lumière dorée invitent à un retour profond à soi.',
    lat: 12.5667, lng: -16.6667,
  },
  {
    id: 'lompoul-desert',
    name: 'Lompoul Désert',
    region: 'Niayes',
    country: 'Sénégal',
    pricePerNight: 48000,
    rating: 4.7,
    reviews: 96,
    calmLevel: 5,
    tags: ['Désert', 'Méditation', 'Étoiles'],
    intents: ['meditation', 'souffler', 'nature'],
    hero: 'desertSunset',
    gallery: ['desertWoman', 'desertCamels', 'desertWhiteDress', 'spaOceanRoom'],
    short: 'Dunes orangées, ciels étoilés et silence absolu.',
    feel: 'Le sable absorbe les pensées. On dort sous des bivouacs nomades, le cœur ralentit.',
    lat: 15.4500, lng: -16.7167,
  },
  {
    id: 'saint-louis-fleuve',
    name: 'Saint-Louis Fleuve',
    region: 'Nord',
    country: 'Sénégal',
    pricePerNight: 42000,
    rating: 4.6,
    reviews: 134,
    calmLevel: 3,
    tags: ['Patrimoine', 'Pirogue', 'Gastronomie'],
    intents: ['souffler', 'famille', 'senior'],
    hero: 'saintLouisCity',
    gallery: ['saintLouisBoat', 'saintLouisShop', 'saintLouisRiver', 'saintLouisHarbor'],
    short: 'Patrimoine UNESCO et balades sur le fleuve.',
    feel: 'Les balcons en fer forgé et la brise du fleuve installent une douce nostalgie apaisante.',
    lat: 16.0179, lng: -16.4896,
  },
  {
    id: 'goree-respire',
    name: 'Gorée Respire',
    region: 'Île de Gorée',
    country: 'Sénégal',
    pricePerNight: 58000,
    rating: 4.8,
    reviews: 87,
    calmLevel: 4,
    tags: ['Île', 'Marche', 'Mémoire'],
    intents: ['meditation', 'souffler', 'senior'],
    hero: 'goreeWaterEdge',
    gallery: ['piroguePink', 'beachBike', 'caleche', 'patternSurface'],
    short: 'Une île hors du temps, des ruelles colorées.',
    feel: 'Pas de voitures, juste les pas sur les pierres et le vent atlantique.',
    lat: 14.6671, lng: -17.4017,
  },
  {
    id: 'marrakech-medina',
    name: 'Riad Médina',
    region: 'Marrakech',
    country: 'Maroc',
    pricePerNight: 72000,
    rating: 4.9,
    reviews: 312,
    calmLevel: 4,
    tags: ['Riad', 'Hammam', 'Patio'],
    intents: ['spa', 'detox', 'souffler'],
    hero: 'marrakechRiad',
    gallery: ['riadPool', 'riadHall', 'riadFacade', 'spaAfro'],
    short: 'Patio fleuri, hammam traditionnel, cuisine raffinée.',
    feel: 'Au cœur de la médina, le riad est une bulle de fraîcheur et d\'odeurs d\'eau de fleur d\'oranger.',
    lat: 31.6295, lng: -7.9811,
  },
  {
    id: 'essaouira-souffle',
    name: 'Essaouira Souffle',
    region: 'Atlantique',
    country: 'Maroc',
    pricePerNight: 58000,
    rating: 4.7,
    reviews: 198,
    calmLevel: 4,
    tags: ['Vent', 'Surf doux', 'Médina blanche'],
    intents: ['nature', 'famille', 'souffler'],
    hero: 'essaouiraBoats',
    gallery: ['essaouiraAlley', 'essaouiraDocks', 'essaouiraBlueBoat', 'foodBowl'],
    short: 'Médina blanche battue par les alizés.',
    feel: 'L\'air iodé et les remparts portugais offrent une parenthèse vibrante.',
    lat: 31.5085, lng: -9.7595,
  },
  {
    id: 'desert-sahara',
    name: 'Sahara Bivouac',
    region: 'Merzouga',
    country: 'Maroc',
    pricePerNight: 88000,
    rating: 4.9,
    reviews: 256,
    calmLevel: 5,
    tags: ['Dunes', 'Bivouac luxe', 'Chameaux'],
    intents: ['meditation', 'nature', 'souffler'],
    hero: 'desertGroup',
    gallery: ['riadPink', 'riadOpenPool', 'marrakechSquare', 'riadBlueDoor'],
    short: 'Tentes berbères haut de gamme, étoiles infinies.',
    feel: 'Le coucher de soleil sur l\'erg coupe le souffle. Le silence devient musique.',
    lat: 31.0801, lng: -3.9870,
  },
  {
    id: 'zanzibar-stone',
    name: 'Zanzibar Stone Town',
    region: 'Unguja',
    country: 'Tanzanie',
    pricePerNight: 95000,
    rating: 4.8,
    reviews: 410,
    calmLevel: 3,
    tags: ['Swahili', 'Épices', 'Plage'],
    intents: ['souffler', 'famille', 'spa'],
    hero: 'zanzibarHouse',
    gallery: ['zanzibarChairs', 'zanzibarHut', 'zanzibarPier', 'zanzibarResort'],
    short: 'Architecture swahilie, ruelles parfumées, plages turquoise.',
    feel: 'On marche pieds nus dans Stone Town, le soir on plonge dans une eau tiède turquoise.',
    lat: -6.1659, lng: 39.2026,
  },
  {
    id: 'lamu-island',
    name: 'Lamu Island',
    region: 'Lamu',
    country: 'Kenya',
    pricePerNight: 78000,
    rating: 4.8,
    reviews: 189,
    calmLevel: 5,
    tags: ['Île sans voitures', 'Boutiques-hôtels', 'Voile'],
    intents: ['souffler', 'meditation', 'nature'],
    hero: 'lamuBoat',
    gallery: ['lamuLoungers', 'zanzibarPath', 'spaProneMassage', 'foodPumpkinWoman'],
    short: 'Île classée UNESCO, dhows et silence.',
    feel: 'Lamu vit au rythme des marées et des ânes. Une parenthèse hors du temps.',
    lat: -2.2680, lng: 40.9020,
  },
  {
    id: 'cape-town-mountain',
    name: 'Cape Town Skyline',
    region: 'Western Cape',
    country: 'Afrique du Sud',
    pricePerNight: 105000,
    rating: 4.8,
    reviews: 521,
    calmLevel: 3,
    tags: ['Ville design', 'Vins', 'Montagne'],
    intents: ['souffler', 'famille', 'detox'],
    hero: 'capeTownMountain',
    gallery: ['capeTownYellow', 'capeTownStreet', 'capeTownRoad', 'capeTownAerial'],
    short: 'Design contemporain au pied de Table Mountain.',
    feel: 'La ville respire entre océan et montagne, l\'énergie est claire et vibrante.',
    lat: -33.9249, lng: 18.4241,
  },
  {
    id: 'lalibela-altitude',
    name: 'Lalibela Altitude',
    region: 'Amhara',
    country: 'Éthiopie',
    pricePerNight: 68000,
    rating: 4.7,
    reviews: 102,
    calmLevel: 5,
    tags: ['Hauts plateaux', 'Spirituel', 'Air pur'],
    intents: ['meditation', 'nature', 'souffler'],
    hero: 'ethiopiaMountains',
    gallery: ['ethiopiaWaterfall', 'ethiopiaValley', 'ethiopiaClouds', 'capeTownClock'],
    short: 'Hauts plateaux mystiques et air d\'altitude.',
    feel: 'L\'altitude clarifie l\'esprit, les chants liturgiques portent loin.',
    lat: 12.0319, lng: 39.0473,
  },
];

export const COLLECTIONS = [
  { id: 'mer', title: 'Bord de mer & respiration', cover: AFR.salyEmptyBeach, lieuIds: ['saly-renaissance', 'essaouira-souffle', 'zanzibar-stone'] },
  { id: 'desert', title: 'Désert & déconnexion', cover: AFR.desertCamels, lieuIds: ['lompoul-desert', 'desert-sahara'] },
  { id: 'spa', title: 'Spa & bains', cover: AFR.spaBackMassage, lieuIds: ['marrakech-medina', 'saly-renaissance'] },
  { id: 'nature', title: 'Nature & silence', cover: AFR.spaTreeGroup, lieuIds: ['casamance-zen', 'lalibela-altitude'] },
  { id: 'culture', title: 'Villes culture & détente', cover: AFR.capeTownMountain, lieuIds: ['cape-town-mountain', 'saint-louis-fleuve', 'goree-respire'] },
  { id: 'isle', title: 'Îles sans voitures', cover: AFR.zanzibarPath, lieuIds: ['lamu-island', 'goree-respire'] },
];

export interface Avantage {
  id: string;
  title: string;
  desc: string;
  expires?: string;
  type: 'flash' | 'gift' | 'ticket' | 'wheel';
  value: string;
  cover: AfricanImageKey;
}

export const AVANTAGES: Avantage[] = [
  { id: 'flash-saly', title: 'Saly -25% sur 3 nuits', desc: 'Offre flash valable 48h sur le séjour Saly Renaissance.', expires: '2026-05-09', type: 'flash', value: '-25%', cover: 'salyHuts' },
  { id: 'flash-marrakech', title: 'Riad Médina inclut le hammam', desc: 'Hammam offert à chaque nuit réservée cette semaine.', expires: '2026-05-12', type: 'flash', value: 'Hammam offert', cover: 'riadOpenPool' },
  { id: 'gift-50k', title: 'Carte cadeau 50 000 FCFA', desc: 'À offrir avec un message personnalisé et une date d\'envoi.', type: 'gift', value: '50 000 FCFA', cover: 'indigoWall' },
  { id: 'gift-spa', title: 'Carte cadeau Spa & soins', desc: 'Modelage 60 min dans un riad partenaire.', type: 'gift', value: 'Spa 60 min', cover: 'spaAfro' },
  { id: 'ticket-yoga', title: 'Ticket Yoga sur la plage', desc: 'À utiliser sur tout séjour Petite Côte.', type: 'ticket', value: '1 séance', cover: 'yogaRiver' },
  { id: 'wheel', title: 'Roue de la fortune', desc: 'Tournez et gagnez réduction, points ou activité offerte.', type: 'wheel', value: 'Surprise', cover: 'patternSurface' },
];
