import imgNutrition from '../../imports/photo_1_2026-05-05_09-08-48-1.jpg';
import imgElderEating from '../../imports/photo_6_2026-05-05_09-08-48-1.jpg';
import imgBP from '../../imports/photo_1_2026-05-05_08-48-04-1.jpg';
import imgNurseElder from '../../imports/photo_3_2026-05-05_08-48-04-1.jpg';
import imgNurseSmile from '../../imports/photo_5_2026-05-05_08-48-04-1.jpg';
import imgNurseHomeBP from '../../imports/photo_7_2026-05-05_08-48-04-1.jpg';
import imgFitnessPink from '../../imports/photo_24_2026-05-03_18-43-34.jpg';
import imgAnatomyVeggies from '../../imports/photo_25_2026-05-03_18-43-34-1.jpg';
import imgWomenJoy from '../../imports/photo_15_2026-04-30_21-36-08-2.jpg';

export const LIVE_IMAGES = {
  nutrition: imgNutrition,
  elderEating: imgElderEating,
  bp: imgBP,
  nurseElder: imgNurseElder,
  nurseSmile: imgNurseSmile,
  nurseHomeBP: imgNurseHomeBP,
  fitness: imgFitnessPink,
  anatomy: imgAnatomyVeggies,
  joy: imgWomenJoy,
};

export type LiveLang = 'fr' | 'fon' | 'yor' | 'wol' | 'hau' | 'ibo' | 'lin' | 'bam' | 'ful' | 'dyu' | 'sen' | 'zar' | 'en';

export type RadioStation = {
  id: string;
  name: string;
  tagline: string;
  city: string;
  country: string;
  lang: LiveLang;
  category: 'sante' | 'bien-etre' | 'famille' | 'jeunesse' | 'tradition' | 'info';
  cover: string;
  streamUrl: string;
  listeners: number;
  hosts: string[];
  schedule: { time: string; show: string; host: string }[];
};

export type TVChannel = {
  id: string;
  name: string;
  tagline: string;
  country: string;
  lang: LiveLang;
  category: 'sante' | 'documentaire' | 'fitness' | 'enfants' | 'cuisine' | 'info';
  cover: string;
  streamUrl: string;
  poster: string;
  viewers: number;
  nowPlaying: { title: string; until: string; type: string };
  schedule: { time: string; show: string; type: string }[];
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'sante-fm',
    name: 'Santé FM',
    tagline: 'La radio de votre bien-être quotidien',
    city: 'Cotonou',
    country: 'Bénin',
    lang: 'fr',
    category: 'sante',
    cover: imgBP,
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    listeners: 4280,
    hosts: ['Dr. Aïcha Diop', 'Sévérin Adjovi'],
    schedule: [
      { time: '06:00', show: 'Matin Santé', host: 'Dr. Aïcha Diop' },
      { time: '09:00', show: 'Mamans & Bébés', host: 'Mariama Sow' },
      { time: '12:00', show: 'Pause Bien-être', host: 'Sévérin Adjovi' },
      { time: '17:00', show: 'Questions Médecin', host: 'Dr. Bah' },
      { time: '20:00', show: 'Nuit Sereine', host: 'Awa Sané' },
    ],
  },
  {
    id: 'radio-bien-etre',
    name: 'Radio Bien-Être',
    tagline: 'Méditations, sommeil et sérénité',
    city: 'Dakar',
    country: 'Sénégal',
    lang: 'wol',
    category: 'bien-etre',
    cover: imgWomenJoy,
    streamUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
    listeners: 2150,
    hosts: ['Fatou Ndiaye', 'Coach Yann'],
    schedule: [
      { time: '07:00', show: 'Yoga sonore', host: 'Fatou Ndiaye' },
      { time: '10:30', show: 'Respirations', host: 'Coach Yann' },
      { time: '15:00', show: 'Mantras', host: 'Awa Diop' },
      { time: '21:00', show: 'Sommeil profond', host: 'Coach Yann' },
    ],
  },
  {
    id: 'mama-radio',
    name: 'Mama Radio',
    tagline: 'Les voix qui veillent sur la famille',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    lang: 'dyu',
    category: 'famille',
    cover: imgNurseSmile,
    streamUrl: 'https://ice4.somafm.com/seventies-128-mp3',
    listeners: 6720,
    hosts: ['Adjoa Kouamé', 'Sage-femme Mariam'],
    schedule: [
      { time: '08:00', show: 'Allaitement & nutrition', host: 'Sage-femme Mariam' },
      { time: '11:00', show: 'Vaccination du jour', host: 'Dr. Yao' },
      { time: '14:00', show: 'Maman parle à maman', host: 'Adjoa Kouamé' },
      { time: '18:00', show: 'Devoirs & santé scolaire', host: 'Adjoa Kouamé' },
    ],
  },
  {
    id: 'pulse-fm',
    name: 'Pulse FM',
    tagline: 'Énergie, sport et jeunesse',
    city: 'Lagos',
    country: 'Nigeria',
    lang: 'en',
    category: 'jeunesse',
    cover: imgFitnessPink,
    streamUrl: 'https://ice6.somafm.com/beatblender-128-mp3',
    listeners: 9430,
    hosts: ['DJ Folake', 'Coach Tunde'],
    schedule: [
      { time: '06:30', show: 'Wake & Move', host: 'Coach Tunde' },
      { time: '12:00', show: 'Lunch Break', host: 'DJ Folake' },
      { time: '17:30', show: 'After Work Run', host: 'Coach Tunde' },
      { time: '22:00', show: 'Late Night Vibes', host: 'DJ Folake' },
    ],
  },
  {
    id: 'voix-sahel',
    name: 'Voix du Sahel Santé',
    tagline: 'Médecine, traditions et prévention',
    city: 'Niamey',
    country: 'Niger',
    lang: 'zar',
    category: 'tradition',
    cover: imgElderEating,
    streamUrl: 'https://ice2.somafm.com/sonicuniverse-128-mp3',
    listeners: 1840,
    hosts: ['Hadiza Garba', 'Tradithérapeute Ali'],
    schedule: [
      { time: '07:00', show: 'Plantes & remèdes', host: 'Tradithérapeute Ali' },
      { time: '10:00', show: 'Conseils paludisme', host: 'Dr. Kone' },
      { time: '16:00', show: 'Femmes du Sahel', host: 'Hadiza Garba' },
    ],
  },
  {
    id: 'tamtam-sante',
    name: 'Tam-Tam Santé',
    tagline: 'Le rythme africain au service du corps',
    city: 'Bamako',
    country: 'Mali',
    lang: 'bam',
    category: 'bien-etre',
    cover: imgWomenJoy,
    streamUrl: 'https://ice4.somafm.com/secretagent-128-mp3',
    listeners: 3260,
    hosts: ['Salif Traoré', 'Aminata Coulibaly'],
    schedule: [
      { time: '08:00', show: 'Danse & cardio', host: 'Aminata Coulibaly' },
      { time: '13:00', show: 'Cuisine Bambara saine', host: 'Chef Sékou' },
      { time: '19:00', show: 'Tam-tam du soir', host: 'Salif Traoré' },
    ],
  },
  {
    id: 'carrefour-fm',
    name: 'Carrefour FM',
    tagline: 'Info santé et urgences locales',
    city: 'Kinshasa',
    country: 'RDC',
    lang: 'lin',
    category: 'info',
    cover: imgNurseHomeBP,
    streamUrl: 'https://ice6.somafm.com/defcon-128-mp3',
    listeners: 5910,
    hosts: ['Mbuyi Tshibanga', 'Dr. Lukusa'],
    schedule: [
      { time: '06:00', show: 'Flash santé', host: 'Mbuyi Tshibanga' },
      { time: '09:30', show: 'Hôpital en direct', host: 'Dr. Lukusa' },
      { time: '15:00', show: 'Choléra alerte', host: 'Dr. Lukusa' },
    ],
  },
  {
    id: 'cuisine-mama',
    name: 'Cuisine Mama Radio',
    tagline: 'Recettes africaines et conseils nutrition',
    city: 'Lomé',
    country: 'Togo',
    lang: 'fr',
    category: 'famille',
    cover: imgElderEating,
    streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
    listeners: 3580,
    hosts: ['Mama Akossiwa', 'Diététicienne Léa'],
    schedule: [
      { time: '07:00', show: 'Petit-déj des aïeules', host: 'Mama Akossiwa' },
      { time: '11:30', show: 'Marché de saison', host: 'Diététicienne Léa' },
      { time: '17:00', show: 'Repas équilibré du soir', host: 'Mama Akossiwa' },
    ],
  },
  {
    id: 'tension-soin',
    name: 'Tension & Soin FM',
    tagline: 'Hypertension, diabète : prévention quotidienne',
    city: 'Yaoundé',
    country: 'Cameroun',
    lang: 'fr',
    category: 'sante',
    cover: imgNurseHomeBP,
    streamUrl: 'https://ice2.somafm.com/lush-128-mp3',
    listeners: 2440,
    hosts: ['Dr. Ngoma', 'Infirmière Bisseck'],
    schedule: [
      { time: '08:00', show: 'Tension du matin', host: 'Dr. Ngoma' },
      { time: '14:00', show: 'Aînés en forme', host: 'Infirmière Bisseck' },
      { time: '19:00', show: 'Sommeil & cœur', host: 'Dr. Ngoma' },
    ],
  },
  {
    id: 'forme-elles',
    name: 'Forme & Elles',
    tagline: 'Sport, énergie et confiance au féminin',
    city: 'Accra',
    country: 'Ghana',
    lang: 'en',
    category: 'jeunesse',
    cover: imgFitnessPink,
    streamUrl: 'https://ice4.somafm.com/poptron-128-mp3',
    listeners: 7820,
    hosts: ['Coach Ama', 'DJ Naa'],
    schedule: [
      { time: '06:30', show: 'Réveil musclé', host: 'Coach Ama' },
      { time: '12:30', show: 'Pause Power', host: 'DJ Naa' },
      { time: '18:00', show: 'After-work HIIT', host: 'Coach Ama' },
    ],
  },
  {
    id: 'sourires-femmes',
    name: 'Sourires de Femmes',
    tagline: 'Santé mentale, sororité et joie',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    lang: 'fr',
    category: 'bien-etre',
    cover: imgWomenJoy,
    streamUrl: 'https://ice6.somafm.com/fluid-128-mp3',
    listeners: 5120,
    hosts: ['Psy. Adjoa', 'Animatrice Kady'],
    schedule: [
      { time: '09:00', show: 'Cercle de parole', host: 'Psy. Adjoa' },
      { time: '15:00', show: 'Confidences', host: 'Animatrice Kady' },
      { time: '21:30', show: 'Méditation du soir', host: 'Psy. Adjoa' },
    ],
  },
  {
    id: 'onde-verte',
    name: 'Onde Verte',
    tagline: 'Nutrition, agriculture et santé',
    city: 'Ouagadougou',
    country: 'Burkina Faso',
    lang: 'fr',
    category: 'sante',
    cover: imgNutrition,
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    listeners: 2080,
    hosts: ['Diététicienne Kadi', 'Agronome Boukary'],
    schedule: [
      { time: '07:30', show: 'Petit-déj équilibré', host: 'Diététicienne Kadi' },
      { time: '11:00', show: 'Du champ à l\'assiette', host: 'Agronome Boukary' },
      { time: '17:00', show: 'Recettes locales', host: 'Diététicienne Kadi' },
    ],
  },
];

export const TV_CHANNELS: TVChannel[] = [
  {
    id: 'sante-plus-tv',
    name: 'Santé+ TV',
    tagline: 'La chaîne santé n°1 en Afrique de l\'Ouest',
    country: 'Bénin',
    lang: 'fr',
    category: 'sante',
    cover: imgNurseSmile,
    poster: imgNurseElder,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    viewers: 28400,
    nowPlaying: { title: 'Le journal de la santé', until: '11:30', type: 'Magazine' },
    schedule: [
      { time: '08:00', show: 'Réveil santé', type: 'Magazine' },
      { time: '11:00', show: 'Le journal de la santé', type: 'Magazine' },
      { time: '13:00', show: 'Cuisine équilibrée', type: 'Cuisine' },
      { time: '15:00', show: 'Documentaire : le diabète en Afrique', type: 'Documentaire' },
      { time: '18:00', show: 'Questions au médecin', type: 'Talk' },
      { time: '21:00', show: 'Soirée prévention', type: 'Talk' },
    ],
  },
  {
    id: 'wellness-tv',
    name: 'Wellness TV',
    tagline: 'Yoga, méditation et bien-être',
    country: 'Sénégal',
    lang: 'fr',
    category: 'fitness',
    cover: imgFitnessPink,
    poster: imgFitnessPink,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    viewers: 12100,
    nowPlaying: { title: 'Yoga matinal', until: '09:00', type: 'Fitness' },
    schedule: [
      { time: '07:00', show: 'Yoga matinal', type: 'Fitness' },
      { time: '09:30', show: 'Pilates pour tous', type: 'Fitness' },
      { time: '12:00', show: 'Méditation guidée', type: 'Bien-être' },
      { time: '17:00', show: 'Cardio dance', type: 'Fitness' },
      { time: '20:00', show: 'Sommeil profond', type: 'Bien-être' },
    ],
  },
  {
    id: 'africa-health',
    name: 'Africa Health TV',
    tagline: 'L\'actualité médicale du continent',
    country: 'Côte d\'Ivoire',
    lang: 'fr',
    category: 'info',
    cover: imgBP,
    poster: imgNurseHomeBP,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    viewers: 19800,
    nowPlaying: { title: 'Direct CHU Yopougon', until: '11:00', type: 'Reportage' },
    schedule: [
      { time: '07:30', show: 'Africa Health Morning', type: 'Magazine' },
      { time: '10:30', show: 'Direct CHU Yopougon', type: 'Reportage' },
      { time: '14:00', show: 'Vaccins sans frontières', type: 'Documentaire' },
      { time: '19:00', show: 'Débat épidémies', type: 'Talk' },
    ],
  },
  {
    id: 'pulse-tv',
    name: 'Pulse TV',
    tagline: 'Sport, énergie et nutrition',
    country: 'Nigeria',
    lang: 'en',
    category: 'fitness',
    cover: imgFitnessPink,
    poster: imgFitnessPink,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    viewers: 35200,
    nowPlaying: { title: 'HIIT 20 min', until: '10:00', type: 'Fitness' },
    schedule: [
      { time: '06:30', show: 'Morning Run Live', type: 'Fitness' },
      { time: '09:30', show: 'HIIT 20 min', type: 'Fitness' },
      { time: '13:00', show: 'Healthy plate', type: 'Cuisine' },
      { time: '18:30', show: 'After Work Yoga', type: 'Bien-être' },
    ],
  },
  {
    id: 'kid-care',
    name: 'Kid Care TV',
    tagline: 'Santé et éveil des enfants',
    country: 'Ghana',
    lang: 'en',
    category: 'enfants',
    cover: imgWomenJoy,
    poster: imgWomenJoy,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    viewers: 8540,
    nowPlaying: { title: 'Brossage en chanson', until: '08:30', type: 'Enfants' },
    schedule: [
      { time: '07:00', show: 'Brossage en chanson', type: 'Enfants' },
      { time: '10:00', show: 'Histoires du Dr. Câlin', type: 'Enfants' },
      { time: '16:00', show: 'Goûter malin', type: 'Cuisine' },
      { time: '19:30', show: 'Bonne nuit les petits', type: 'Enfants' },
    ],
  },
  {
    id: 'cuisine-saine',
    name: 'Cuisine Saine TV',
    tagline: 'Recettes africaines équilibrées',
    country: 'Cameroun',
    lang: 'fr',
    category: 'cuisine',
    cover: imgElderEating,
    poster: imgNutrition,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    viewers: 14200,
    nowPlaying: { title: 'Ndolè light', until: '12:30', type: 'Cuisine' },
    schedule: [
      { time: '11:00', show: 'Marché du jour', type: 'Reportage' },
      { time: '12:00', show: 'Ndolè light', type: 'Cuisine' },
      { time: '17:00', show: 'Le sucré équilibré', type: 'Cuisine' },
      { time: '20:30', show: 'Chef invité', type: 'Talk' },
    ],
  },
  {
    id: 'nutri-life',
    name: 'Nutri Life TV',
    tagline: 'L\'alimentation qui soigne le corps',
    country: 'Sénégal',
    lang: 'fr',
    category: 'cuisine',
    cover: imgAnatomyVeggies,
    poster: imgNutrition,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    viewers: 17600,
    nowPlaying: { title: 'Le ventre, deuxième cerveau', until: '11:00', type: 'Documentaire' },
    schedule: [
      { time: '10:00', show: 'Le ventre, deuxième cerveau', type: 'Documentaire' },
      { time: '13:30', show: 'Recettes anti-inflammatoires', type: 'Cuisine' },
      { time: '17:00', show: 'Microbiote en direct', type: 'Talk' },
      { time: '20:00', show: 'Famille au menu', type: 'Cuisine' },
    ],
  },
  {
    id: 'aines-tv',
    name: 'Aînés Bien-Vivre TV',
    tagline: 'Santé, autonomie et tendresse pour nos aînés',
    country: 'Bénin',
    lang: 'fr',
    category: 'sante',
    cover: imgNurseElder,
    poster: imgElderEating,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    viewers: 9430,
    nowPlaying: { title: 'À domicile avec Inf. Bisseck', until: '12:00', type: 'Reportage' },
    schedule: [
      { time: '10:30', show: 'À domicile avec Inf. Bisseck', type: 'Reportage' },
      { time: '14:00', show: 'Mémoire & jeux', type: 'Magazine' },
      { time: '17:30', show: 'Repas du grand âge', type: 'Cuisine' },
      { time: '20:30', show: 'Aïeules d\'Afrique', type: 'Documentaire' },
    ],
  },
  {
    id: 'femmes-fortes',
    name: 'Femmes Fortes TV',
    tagline: 'La chaîne des femmes qui prennent soin d\'elles',
    country: "Côte d'Ivoire",
    lang: 'fr',
    category: 'fitness',
    cover: imgWomenJoy,
    poster: imgFitnessPink,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    viewers: 22800,
    nowPlaying: { title: 'Squat & sororité', until: '10:30', type: 'Fitness' },
    schedule: [
      { time: '09:00', show: 'Squat & sororité', type: 'Fitness' },
      { time: '12:00', show: 'Cycle & énergie', type: 'Magazine' },
      { time: '16:00', show: 'Confidences au sport', type: 'Talk' },
      { time: '21:00', show: 'Soirée bien-être', type: 'Bien-être' },
    ],
  },
  {
    id: 'doc-afrique',
    name: 'Doc Afrique',
    tagline: 'Documentaires médicaux et humains',
    country: 'Mali',
    lang: 'fr',
    category: 'documentaire',
    cover: imgAnatomyVeggies,
    poster: imgAnatomyVeggies,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    viewers: 6300,
    nowPlaying: { title: 'Sages-femmes du Sahel', until: '13:00', type: 'Documentaire' },
    schedule: [
      { time: '12:00', show: 'Sages-femmes du Sahel', type: 'Documentaire' },
      { time: '14:00', show: 'Tradipraticiens', type: 'Documentaire' },
      { time: '18:00', show: 'Hôpital de brousse', type: 'Documentaire' },
      { time: '21:00', show: 'La drépanocytose', type: 'Documentaire' },
    ],
  },
];

import type { LucideIcon } from 'lucide-react';
import { Radio, Stethoscope, Leaf, Users, Headphones, Sprout, Newspaper, Tv, Dumbbell, Salad, Clapperboard, Baby } from 'lucide-react';

export const RADIO_CATEGORIES: { id: RadioStation['category'] | 'all'; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'Toutes', icon: Radio },
  { id: 'sante', label: 'Santé', icon: Stethoscope },
  { id: 'bien-etre', label: 'Bien-être', icon: Leaf },
  { id: 'famille', label: 'Famille', icon: Users },
  { id: 'jeunesse', label: 'Jeunesse', icon: Headphones },
  { id: 'tradition', label: 'Tradition', icon: Sprout },
  { id: 'info', label: 'Info', icon: Newspaper },
];

export const TV_CATEGORIES: { id: TVChannel['category'] | 'all'; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'Toutes', icon: Tv },
  { id: 'sante', label: 'Santé', icon: Stethoscope },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'cuisine', label: 'Cuisine', icon: Salad },
  { id: 'documentaire', label: 'Doc', icon: Clapperboard },
  { id: 'enfants', label: 'Enfants', icon: Baby },
  { id: 'info', label: 'Info', icon: Newspaper },
];
