import { AfricanImageKey } from './images';

export interface Experience {
  id: string;
  title: string;
  category: 'Soin' | 'Nature' | 'Cuisine' | 'Sport' | 'Bien-être';
  country: string;
  durationHours: number;
  pricePerPerson: number;
  rating: number;
  reviews: number;
  hero: AfricanImageKey;
  gallery: AfricanImageKey[];
  description: string;
  highlights: string[];
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'hammam-medina',
    title: 'Hammam traditionnel à la médina',
    category: 'Soin',
    country: 'Maroc',
    durationHours: 2,
    pricePerPerson: 35000,
    rating: 4.9,
    reviews: 312,
    hero: 'expHammam',
    gallery: ['expHammamRoom', 'expHammamStone', 'spaOceanRoom'],
    description: 'Un rituel ancestral au cœur de la médina : vapeur d’eucalyptus, gommage au savon noir, modelage à l’huile d’argan.',
    highlights: ['Savon noir & gant kessa', 'Vapeur d’eucalyptus', 'Modelage à l’argan', 'Thé à la menthe offert'],
  },
  {
    id: 'cuisine-marrakech',
    title: 'Cours de cuisine marocaine',
    category: 'Cuisine',
    country: 'Maroc',
    durationHours: 4,
    pricePerPerson: 28000,
    rating: 4.8,
    reviews: 184,
    hero: 'expCookingTagine',
    gallery: ['expCookingClass', 'expCookingMarket'],
    description: 'Visite du marché aux épices puis cours de cuisine en petit comité : tagine, pastilla et thé à la menthe.',
    highlights: ['Marché aux épices', 'Préparation du tagine', 'Repas convivial', 'Recettes à emporter'],
  },
  {
    id: 'safari-kenya',
    title: 'Safari photo au lever du soleil',
    category: 'Nature',
    country: 'Kenya',
    durationHours: 6,
    pricePerPerson: 95000,
    rating: 4.9,
    reviews: 256,
    hero: 'expSafari',
    gallery: ['expSafariJeep', 'expSafariElephant'],
    description: 'Départ avant l’aube en 4x4 ouvert. Observation des Big Five, accompagné par un guide naturaliste.',
    highlights: ['Guide naturaliste', '4x4 ouvert', 'Petit-déjeuner brousse', 'Big Five'],
  },
  {
    id: 'surf-taghazout',
    title: 'Initiation surf à Taghazout',
    category: 'Sport',
    country: 'Maroc',
    durationHours: 3,
    pricePerPerson: 22000,
    rating: 4.7,
    reviews: 142,
    hero: 'expSurf',
    gallery: ['expSurfBoard', 'expSurfWave'],
    description: 'Cours collectif sur la plage de Panorama, parfait pour débutants et intermédiaires.',
    highlights: ['Combinaison & planche', 'Moniteur breveté', 'Vagues douces', 'Photo offerte'],
  },
  {
    id: 'yoga-zanzibar',
    title: 'Retraite yoga face à l’océan',
    category: 'Bien-être',
    country: 'Tanzanie',
    durationHours: 2,
    pricePerPerson: 18000,
    rating: 4.9,
    reviews: 98,
    hero: 'expYogaGroup',
    gallery: ['expYogaCircle', 'expYogaSunrise'],
    description: 'Vinyasa doux au lever du soleil, suivi d’une méditation guidée et d’un petit-déjeuner détox.',
    highlights: ['Vinyasa doux', 'Méditation guidée', 'Petit-déjeuner détox', 'Tapis fournis'],
  },
  {
    id: 'massage-saly',
    title: 'Massage 4 mains à Saly',
    category: 'Soin',
    country: 'Sénégal',
    durationHours: 1,
    pricePerPerson: 30000,
    rating: 4.8,
    reviews: 167,
    hero: 'spaBackMassage',
    gallery: ['spaAfro', 'spaOceanRoom'],
    description: 'Une chorégraphie à 4 mains pour relâcher complètement le dos et la nuque.',
    highlights: ['2 thérapeutes', 'Huiles bio', 'Cabine océan', 'Tisane offerte'],
  },
];

export interface GuideCountry {
  country: string;
  flag: string;
  hero: AfricanImageKey;
  capital: string;
  bestSeason: string;
  language: string;
  currency: string;
  visa: string;
  intro: string;
  tips: { title: string; body: string }[];
  highlights: string[];
}

export const GUIDES: GuideCountry[] = [
  {
    country: 'Sénégal',
    flag: '🇸🇳',
    hero: 'salyPalmBeach',
    capital: 'Dakar',
    bestSeason: 'Novembre — Mai',
    language: 'Français, Wolof',
    currency: 'FCFA (XOF)',
    visa: 'Sans visa pour CEDEAO et UE (≤ 90j)',
    intro: 'La Téranga, hospitalité sénégalaise, se vit autant à Dakar qu’en Casamance ou sur la Petite Côte.',
    tips: [
      { title: 'Mobilité', body: 'Yango et Heetch couvrent Dakar. Pour Saly, comptez 90 min de route depuis l’aéroport AIBD.' },
      { title: 'Santé', body: 'Pas de vaccin obligatoire pour l’UE. Prévoir traitement antipaludéen en saison des pluies.' },
      { title: 'Étiquette', body: 'Salutations longues appréciées. La main droite pour manger et donner.' },
    ],
    highlights: ['Île de Gorée', 'Lac Rose', 'Delta du Saloum', 'Casamance'],
  },
  {
    country: 'Maroc',
    flag: '🇲🇦',
    hero: 'marrakechRiad',
    capital: 'Rabat',
    bestSeason: 'Mars — Mai, Septembre — Novembre',
    language: 'Arabe, Berbère, Français',
    currency: 'Dirham (MAD)',
    visa: 'Sans visa pour UE et CEDEAO (≤ 90j)',
    intro: 'Riads, médinas, désert et océan : le Maroc se découvre avec lenteur, par les sens.',
    tips: [
      { title: 'Climat', body: 'Évitez juillet/août à Marrakech (>40°C). Côte atlantique tempérée toute l’année.' },
      { title: 'Pourboires', body: '10% au restaurant, 10–20 MAD pour porteurs.' },
      { title: 'Hammam', body: 'Choisissez un hammam de quartier pour l’authenticité, un riad-spa pour le confort.' },
    ],
    highlights: ['Médina de Marrakech', 'Essaouira', 'Désert d’Agafay', 'Atlas'],
  },
  {
    country: 'Tanzanie',
    flag: '🇹🇿',
    hero: 'zanzibarHouse',
    capital: 'Dodoma',
    bestSeason: 'Juin — Octobre',
    language: 'Swahili, Anglais',
    currency: 'Shilling tanzanien (TZS)',
    visa: 'eVisa en ligne (~50 USD)',
    intro: 'De Zanzibar à Serengeti, la Tanzanie offre un saisissant contraste entre océan turquoise et savane.',
    tips: [
      { title: 'Vaccins', body: 'Fièvre jaune obligatoire si transit. Antipaludéens recommandés.' },
      { title: 'Argent', body: 'USD acceptés partout, billets postérieurs à 2009 uniquement.' },
      { title: 'Code vestimentaire', body: 'Tenues couvrantes à Stone Town (Zanzibar musulman).' },
    ],
    highlights: ['Stone Town', 'Nungwi', 'Serengeti', 'Kilimandjaro'],
  },
  {
    country: 'Kenya',
    flag: '🇰🇪',
    hero: 'expSafari',
    capital: 'Nairobi',
    bestSeason: 'Juillet — Octobre (grande migration)',
    language: 'Swahili, Anglais',
    currency: 'Shilling kényan (KES)',
    visa: 'eTA en ligne obligatoire',
    intro: 'Berceau du safari moderne, le Kenya combine réserves mythiques et plages de l’océan Indien.',
    tips: [
      { title: 'Safari', body: 'Réservez Masai Mara 6 mois à l’avance pour la migration (juillet-octobre).' },
      { title: 'Sécurité', body: 'Évitez les déplacements de nuit hors lodges sécurisés.' },
      { title: 'Pourboires', body: '~10 USD/jour pour le guide, 5 USD pour le chauffeur.' },
    ],
    highlights: ['Masai Mara', 'Diani Beach', 'Mont Kenya', 'Lac Naivasha'],
  },
  {
    country: 'Afrique du Sud',
    flag: '🇿🇦',
    hero: 'capeTownMountain',
    capital: 'Pretoria',
    bestSeason: 'Octobre — Avril',
    language: 'Anglais, Afrikaans, Zoulou',
    currency: 'Rand (ZAR)',
    visa: 'Sans visa pour UE (≤ 90j)',
    intro: 'Cape Town, Garden Route, vignobles et Big Five : un condensé d’Afrique aux couleurs européennes.',
    tips: [
      { title: 'Conduite', body: 'À gauche. Permis international utile.' },
      { title: 'Devises', body: 'Cartes acceptées partout. Pourboire 10-15%.' },
      { title: 'Sécurité', body: 'Évitez les townships sans guide.' },
    ],
    highlights: ['Table Mountain', 'Cap de Bonne-Espérance', 'Stellenbosch', 'Kruger'],
  },
];

export interface VoyageEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  country: string;
  type: 'Festival' | 'Retraite' | 'Atelier' | 'Marché';
  hero: AfricanImageKey;
  description: string;
  pricePerPerson?: number;
}

export const EVENTS: VoyageEvent[] = [
  {
    id: 'festival-gnaoua',
    title: 'Festival Gnaoua d’Essaouira',
    date: '2026-06-18',
    location: 'Essaouira',
    country: 'Maroc',
    type: 'Festival',
    hero: 'eventFestival',
    description: 'Trois jours de musique gnaoua et fusion, scènes ouvertes sur l’océan.',
  },
  {
    id: 'retraite-yoga-saly',
    title: 'Retraite yoga & silence',
    date: '2026-05-22',
    location: 'Saly',
    country: 'Sénégal',
    type: 'Retraite',
    hero: 'expYogaSunrise',
    description: 'Cinq jours immersifs : pratique matinale, méditation guidée, repas vivants.',
    pricePerPerson: 320000,
  },
  {
    id: 'marche-marrakech',
    title: 'Marché aux épices nocturne',
    date: '2026-05-30',
    location: 'Marrakech',
    country: 'Maroc',
    type: 'Marché',
    hero: 'expCookingMarket',
    description: 'Découverte sensorielle des épices, dégustation et atelier accord-tagine.',
    pricePerPerson: 25000,
  },
  {
    id: 'atelier-cuisine-dakar',
    title: 'Atelier cuisine sénégalaise',
    date: '2026-06-05',
    location: 'Dakar',
    country: 'Sénégal',
    type: 'Atelier',
    hero: 'foodPlateRice',
    description: 'Préparation collective d’un thieboudienne avec une cheffe locale.',
    pricePerPerson: 18000,
  },
  {
    id: 'festival-stone-town',
    title: 'Sauti za Busara',
    date: '2026-06-12',
    location: 'Stone Town',
    country: 'Tanzanie',
    type: 'Festival',
    hero: 'zanzibarHouse',
    description: 'Le rendez-vous incontournable des musiques d’Afrique de l’Est.',
  },
];

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  lieu: string;
  avatar: AfricanImageKey;
}

export const TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'Aïssatou', age: 34, city: 'Dakar', rating: 5, quote: 'Le séjour à Saly m’a remise sur pied après une année très chargée. L’équipe sait écouter.', lieu: 'Saly Renaissance', avatar: 'commWoman1' },
  { id: 't2', name: 'Mamadou', age: 41, city: 'Paris', rating: 5, quote: 'Une parenthèse vraiment apaisante. Je reviendrai avec ma famille l’année prochaine.', lieu: 'Riad Marrakech', avatar: 'commMan1' },
  { id: 't3', name: 'Nadia', age: 29, city: 'Casablanca', rating: 4, quote: 'Le hammam est un voyage à lui tout seul. La chambre océan est un coup de cœur.', lieu: 'Spa Essaouira', avatar: 'commWoman2' },
  { id: 't4', name: 'Ibrahima', age: 52, city: 'Bruxelles', rating: 5, quote: 'Service impeccable, lieux choisis avec goût. La conciergerie a tout fluidifié.', lieu: 'Zanzibar House', avatar: 'commMan2' },
  { id: 't5', name: 'Fatou', age: 27, city: 'Abidjan', rating: 5, quote: 'La retraite yoga m’a transformée. Petit groupe, ambiance bienveillante.', lieu: 'Retraite yoga & silence', avatar: 'commWoman3' },
  { id: 't6', name: 'Cheikh', age: 38, city: 'Saint-Louis', rating: 4, quote: 'Le safari au Kenya était un rêve d’enfant. Guides très pédagogiques.', lieu: 'Safari Masai Mara', avatar: 'commMan3' },
];

export interface ConciergeService {
  id: string;
  title: string;
  description: string;
  price?: string;
  icon: 'plane' | 'car' | 'utensils' | 'sparkles' | 'shield' | 'bell';
}

export const CONCIERGE_SERVICES: ConciergeService[] = [
  { id: 'transfert', title: 'Transfert privé aéroport', description: 'Chauffeur à votre nom dès votre arrivée, eau et lingettes fraîches.', price: 'Inclus Or', icon: 'car' },
  { id: 'vol', title: 'Réservation de vol', description: 'Notre équipe trouve la meilleure combinaison tarif/horaire et gère le check-in.', icon: 'plane' },
  { id: 'restaurant', title: 'Tables prisées', description: 'Réservations dans les meilleures adresses, sans la queue.', icon: 'utensils' },
  { id: 'expe', title: 'Expériences sur-mesure', description: 'Cours privé, retraite individuelle, activités exclusives.', icon: 'sparkles' },
  { id: 'assistance', title: 'Assistance médicale 24/7', description: 'Médecin francophone joignable à toute heure pendant votre séjour.', icon: 'shield' },
  { id: 'rappel', title: 'Rappel personnalisé', description: 'Un conseiller vous rappelle dans les 30 minutes pour affiner votre projet.', icon: 'bell' },
];
