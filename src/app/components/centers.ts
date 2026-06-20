import { IMAGES } from './images';

export type CenterType = 'hopital' | 'clinique' | 'pharmacie' | 'maternite';

export interface Center {
  id: number;
  name: string;
  type: CenterType;
  city: string;
  department: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  phone: string;
  hours: string;
  doctors: number;
  description: string;
  services: string[];
  image: string;
  position: [number, number];
  available: boolean;
  nextSlot: string;
}

// Approximate city centers (lat, lon) used as default coordinates.
const CITY: Record<string, [number, number]> = {
  Cotonou: [6.3703, 2.3912],
  'Porto-Novo': [6.4969, 2.6283],
  'Abomey-Calavi': [6.4485, 2.3556],
  Abomey: [7.1855, 1.9911],
  Parakou: [9.3372, 2.6303],
  Bohicon: [7.1781, 2.0667],
  Natitingou: [10.3045, 1.3793],
  Djougou: [9.7088, 1.6661],
  Ouidah: [6.3622, 2.0852],
  Kandi: [11.1342, 2.9386],
  Comé: [6.4083, 1.8806],
  Klouékanmè: [6.9833, 1.8333],
  Kétou: [7.358, 2.6064],
  Nikki: [9.9333, 3.2167],
  "N'Dali": [9.8667, 2.7167],
  Bembèrèkè: [10.23, 2.67],
  Malanville: [11.8628, 3.3917],
  'Dassa-Zoumè': [7.75, 2.1833],
  Pobè: [6.9786, 2.6669],
  Missérété: [6.5667, 2.65],
  Godomey: [6.4133, 2.3403],
  Akassato: [6.5167, 2.3667],
};

// City → department mapping
const DEPT: Record<string, string> = {
  Cotonou: 'Littoral',
  'Porto-Novo': 'Ouémé',
  'Abomey-Calavi': 'Atlantique',
  Abomey: 'Zou',
  Parakou: 'Borgou',
  Bohicon: 'Zou',
  Natitingou: 'Atacora',
  Djougou: 'Donga',
  Ouidah: 'Atlantique',
  Kandi: 'Alibori',
  Comé: 'Mono',
  Klouékanmè: 'Couffo',
  Kétou: 'Plateau',
  Nikki: 'Borgou',
  "N'Dali": 'Borgou',
  Bembèrèkè: 'Borgou',
  Malanville: 'Alibori',
  'Dassa-Zoumè': 'Collines',
  Pobè: 'Plateau',
  Missérété: 'Ouémé',
  Godomey: 'Atlantique',
  Akassato: 'Atlantique',
};

interface Seed {
  name: string;
  type: CenterType;
  city: string;
  address?: string;
  phone?: string;
  hours?: string;
  doctors?: number;
  rating?: number;
  reviews?: number;
  specialty?: string;
  description?: string;
  services?: string[];
  image?: string;
  available?: boolean;
  nextSlot?: string;
}

const DEFAULT_SERVICES: Record<CenterType, string[]> = {
  hopital: ['Urgences', 'Consultations', 'Hospitalisation', 'Imagerie', 'Laboratoire'],
  clinique: ['Consultations', 'Soins infirmiers', 'Petite chirurgie', 'Pédiatrie'],
  pharmacie: ['Médicaments', 'Conseils pharmaceutiques', 'Tests rapides', 'Garde'],
  maternite: ['Suivi prénatal', 'Accouchement', 'Soins néonatals', 'Planning familial'],
};

const DEFAULT_SPECIALTY: Record<CenterType, string> = {
  hopital: 'Soins multispécialités',
  clinique: 'Médecine générale & spécialités',
  pharmacie: 'Officine pharmaceutique',
  maternite: 'Maternité & obstétrique',
};

const DEFAULT_HOURS: Record<CenterType, string> = {
  hopital: '24h/24, 7j/7',
  clinique: 'Lun au Sam : 07h00 à 20h00',
  pharmacie: 'Lun au Sam : 08h00 à 22h00',
  maternite: '24h/24, 7j/7',
};

const DEFAULT_IMAGE: Record<CenterType, string> = {
  hopital: IMAGES.rdvClinic,
  clinique: IMAGES.rdvConsultation,
  pharmacie: IMAGES.medicamentsPharmacy,
  maternite: IMAGES.rdvDoctor,
};

const SEEDS: Seed[] = [
  // ── COTONOU, HÔPITAUX ────────────────────────────────────────────────
  { name: 'CNHU-HKM Cotonou', type: 'hopital', city: 'Cotonou', address: 'Avenue Jean-Paul II, Ganhi, Cotonou', phone: '+229 01 21 30 17 28', specialty: 'Hôpital universitaire, soins multispécialités', description: 'Centre National Hospitalier Universitaire Hubert Koutoukou Maga, principal hôpital de référence du Bénin.', services: ['Urgences 24/7', 'Cardiologie', 'Pédiatrie', 'Chirurgie', 'Imagerie', 'Laboratoire'], rating: 4.7, reviews: 412, doctors: 80 },
  { name: 'CNHU de Pneumo-Phtisiologie', type: 'hopital', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 21 47', specialty: 'Pneumologie & phtisiologie', description: 'Centre national de référence pour les maladies pulmonaires et la tuberculose.', services: ['Pneumologie', 'Tuberculose', 'Imagerie thoracique', 'Spirométrie'], rating: 4.5, reviews: 198, doctors: 22 },
  { name: "Hôpital de l'Instruction des Armées (HIA)", type: 'hopital', city: 'Cotonou', address: 'Camp Guézo, Cotonou', phone: '+229 01 21 31 27 50', specialty: 'Hôpital militaire & civil', description: "Hôpital militaire ouvert au public, équipements modernes.", services: ['Urgences', 'Chirurgie', 'Imagerie', 'Cardiologie'], rating: 4.6, reviews: 256, doctors: 45 },
  { name: 'Hôpital Bethesda', type: 'hopital', city: 'Cotonou', address: 'Mènontin, Cotonou', phone: '+229 01 21 04 53 00', specialty: 'Hôpital confessionnel polyvalent', description: 'Hôpital protestant offrant soins généraux et spécialisés.', rating: 4.6, reviews: 187, doctors: 30 },
  { name: 'Hôpital Saint Luc', type: 'hopital', city: 'Cotonou', address: 'Cadjèhoun, Cotonou', phone: '+229 01 21 30 11 12', specialty: 'Hôpital catholique', description: 'Établissement catholique réputé pour ses soins de qualité.', rating: 4.7, reviews: 224, doctors: 35 },
  { name: 'Hôpital Humanity First', type: 'hopital', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 70 00', specialty: 'Hôpital communautaire', description: 'Établissement soutenu par Humanity First avec services généralistes.', rating: 4.4, reviews: 142, doctors: 18 },
  { name: 'HOMEL, Hôpital de la Mère et de l\'Enfant Lagune', type: 'hopital', city: 'Cotonou', address: 'Lagune, Cotonou', phone: '+229 01 21 31 10 00', specialty: 'Mère & enfant', description: 'Centre de référence en santé maternelle et pédiatrique.', services: ['Maternité', 'Néonatologie', 'Pédiatrie', 'Gynécologie'], rating: 4.7, reviews: 312, doctors: 52 },

  // ── COTONOU, CLINIQUES ────────────────────────────────────────────────
  { name: 'Clinique du Golfe', type: 'clinique', city: 'Cotonou', address: 'Cocotomey, Cotonou', phone: '+229 01 21 03 88 88', rating: 4.7, reviews: 264, doctors: 22 },
  { name: 'Clinique Mahouna', type: 'clinique', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 02 14', rating: 4.5, reviews: 140 },
  { name: 'Alafia Hospital', type: 'clinique', city: 'Cotonou', address: 'Sainte-Rita, Cotonou', phone: '+229 01 21 03 12 12', rating: 4.6, reviews: 178 },
  { name: 'Ave Maria Hospital', type: 'clinique', city: 'Cotonou', address: 'Vodjè, Cotonou', phone: '+229 01 21 30 56 56', rating: 4.5, reviews: 132 },
  { name: 'Brown Private Hospital', type: 'clinique', city: 'Cotonou', address: 'Haie Vive, Cotonou', phone: '+229 01 21 30 88 22', rating: 4.6, reviews: 156 },
  { name: 'Saint Padre Pio, Centre de Diagnostic', type: 'clinique', city: 'Cotonou', address: 'Akpakpa Centre, Cotonou', phone: '+229 01 21 33 15 00', specialty: 'Imagerie & diagnostic', rating: 4.7, reviews: 201 },
  { name: 'Clinique Akpakpa', type: 'clinique', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 14 50', rating: 4.4, reviews: 92 },
  { name: 'Clinique Avicennes', type: 'clinique', city: 'Cotonou', address: 'Saint-Michel, Cotonou', phone: '+229 01 21 31 41 00', rating: 4.5, reviews: 110 },
  { name: 'Clinique Boni', type: 'clinique', city: 'Cotonou', address: 'Houéyiho, Cotonou', phone: '+229 01 21 30 70 70', rating: 4.4, reviews: 88 },
  { name: 'Clinique Coopérative de Santé', type: 'clinique', city: 'Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 31 19 90', rating: 4.3, reviews: 76 },
  { name: 'Clinique Centrale du Dr Traoré Idriss', type: 'clinique', city: 'Cotonou', address: 'Saint-Jean, Cotonou', phone: '+229 01 21 30 25 25', rating: 4.5, reviews: 102 },
  { name: 'Clinique de l\'Union', type: 'clinique', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 88 11', rating: 4.4, reviews: 94 },
  { name: 'Clinique de la Marina', type: 'clinique', city: 'Cotonou', address: 'Marina, Cotonou', phone: '+229 01 21 30 42 42', rating: 4.6, reviews: 168 },
  { name: 'Clinique du Lac', type: 'clinique', city: 'Cotonou', address: 'Houéyiho, Cotonou', phone: '+229 01 21 30 91 91', rating: 4.5, reviews: 124 },
  { name: 'Clinique Fidjrossè', type: 'clinique', city: 'Cotonou', address: 'Fidjrossè, Cotonou', phone: '+229 01 24 18 56 73', rating: 4.5, reviews: 156 },
  { name: 'Polyclinique Biosso', type: 'clinique', city: 'Godomey', address: 'Godomey, Abomey-Calavi', phone: '+229 01 21 35 02 02', rating: 4.6, reviews: 188 },
  { name: 'Clinique Sevi', type: 'clinique', city: 'Cotonou', address: 'Saint-Michel, Cotonou', phone: '+229 01 21 31 00 55', rating: 4.4, reviews: 80 },
  { name: 'Polyclinique Saint Michel', type: 'clinique', city: 'Cotonou', address: 'Saint-Michel, Cotonou', phone: '+229 01 21 31 33 33', rating: 4.6, reviews: 197 },
  { name: 'Clinique Polyvalente Mahouna', type: 'clinique', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 02 14', rating: 4.5, reviews: 140 },

  // ── COTONOU, PHARMACIES ──────────────────────────────────────────────
  { name: 'Pharmacie Camp Guézo', type: 'pharmacie', city: 'Cotonou', address: 'Camp Guézo, Cotonou', phone: '+229 01 21 31 25 00' },
  { name: 'Pharmacie Adéchina', type: 'pharmacie', city: 'Cotonou', address: 'Adjégounlè, Cotonou', phone: '+229 01 21 32 20 50' },
  { name: 'Pharmacie Agla', type: 'pharmacie', city: 'Cotonou', address: 'Agla, Cotonou', phone: '+229 01 21 04 11 22' },
  { name: 'Pharmacie Agontinkon', type: 'pharmacie', city: 'Cotonou', address: 'Agontinkon, Cotonou', phone: '+229 01 21 33 21 10' },
  { name: 'Pharmacie Akpakpa', type: 'pharmacie', city: 'Cotonou', address: 'Akpakpa Centre, Cotonou', phone: '+229 01 21 33 18 18' },
  { name: 'Pharmacie Alafia', type: 'pharmacie', city: 'Cotonou', address: 'Sainte-Rita, Cotonou', phone: '+229 01 21 03 12 13' },
  { name: 'Pharmacie Ciné Concorde', type: 'pharmacie', city: 'Cotonou', address: 'Concorde, Cotonou', phone: '+229 01 21 30 14 14' },
  { name: 'Pharmacie Segbeya', type: 'pharmacie', city: 'Cotonou', address: 'Segbeya, Cotonou', phone: '+229 01 21 30 76 76' },
  { name: 'Pharmacie La Béninoise', type: 'pharmacie', city: 'Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 31 28 28' },
  { name: 'Pharmacie Marina', type: 'pharmacie', city: 'Cotonou', address: 'Marina, Cotonou', phone: '+229 01 21 30 42 50' },
  { name: 'Pharmacie Saint Jean', type: 'pharmacie', city: 'Cotonou', address: 'Saint-Jean, Cotonou', phone: '+229 01 21 30 17 17' },
  { name: 'Pharmacie Les Chérubins', type: 'pharmacie', city: 'Cotonou', address: 'Cadjèhoun, Cotonou', phone: '+229 01 21 30 55 55' },
  { name: 'Pharmacie Sikècodji', type: 'pharmacie', city: 'Cotonou', address: 'Sikècodji, Cotonou', phone: '+229 01 21 32 14 14' },
  { name: 'Pharmacie Godomey Fignonhou', type: 'pharmacie', city: 'Godomey', address: 'Godomey Fignonhou', phone: '+229 01 21 35 18 18' },

  // ── COTONOU, MATERNITÉS ──────────────────────────────────────────────
  { name: 'CHU-MEL, Mère et Enfant Lagune', type: 'maternite', city: 'Cotonou', address: 'Lagune, Cotonou', phone: '+229 01 21 31 10 00', description: 'Centre Hospitalier Universitaire de la Mère et de l\'Enfant, référence nationale en obstétrique et néonatologie.', rating: 4.7, reviews: 298, doctors: 38 },
  { name: 'Maternité Agblangandan', type: 'maternite', city: 'Cotonou', address: 'Agblangandan, Cotonou', phone: '+229 01 21 04 75 50', rating: 4.4, reviews: 96 },
  { name: 'Clinique Mahougnon d\'Akpakpa', type: 'maternite', city: 'Cotonou', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 12 22', rating: 4.5, reviews: 110 },

  // ── ABOMEY-CALAVI ─────────────────────────────────────────────────────
  { name: 'Hôpital de Zone d\'Abomey-Calavi', type: 'hopital', city: 'Abomey-Calavi', address: 'Centre-ville, Abomey-Calavi', phone: '+229 01 21 36 00 22', rating: 4.4, reviews: 156, doctors: 28 },
  { name: 'Centre Hospitalier International de Calavi (CHIC)', type: 'hopital', city: 'Abomey-Calavi', address: 'Calavi, Atlantique', phone: '+229 01 21 36 22 22', rating: 4.6, reviews: 189, doctors: 32 },
  { name: 'Clinique Ophtalmologique Bartimée', type: 'clinique', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 14 14', specialty: 'Ophtalmologie', rating: 4.7, reviews: 142 },
  { name: 'Clinique Centrale de Calavi', type: 'clinique', city: 'Abomey-Calavi', address: 'Calavi Centre', phone: '+229 01 21 36 18 90', rating: 4.5, reviews: 108 },
  { name: 'Hôpital Saint Augustin', type: 'hopital', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 25 25', rating: 4.5, reviews: 124, doctors: 18 },
  { name: 'Hôpital Saint Mathieu', type: 'hopital', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 27 27', rating: 4.4, reviews: 98, doctors: 14 },
  { name: 'Clinique La Colombe', type: 'clinique', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 33 33', rating: 4.4, reviews: 76 },
  { name: 'Clinique Horeb', type: 'clinique', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 41 41', rating: 4.3, reviews: 68 },
  { name: 'Clinique Coopérative de Calavi', type: 'clinique', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 50 50', rating: 4.4, reviews: 84 },
  { name: 'Pharmacie Le Jourdain', type: 'pharmacie', city: 'Abomey-Calavi', address: 'Calavi', phone: '+229 01 21 36 19 19' },
  { name: 'Pharmacie Akassato', type: 'pharmacie', city: 'Akassato', address: 'Akassato', phone: '+229 01 21 36 70 70' },
  { name: 'Pharmacie Arconville', type: 'pharmacie', city: 'Abomey-Calavi', address: 'Arconville, Calavi', phone: '+229 01 21 36 80 80' },

  // ── ABOMEY ────────────────────────────────────────────────────────────
  { name: 'Centre Hospitalier Départemental d\'Abomey', type: 'hopital', city: 'Abomey', address: 'Abomey, Zou', phone: '+229 01 22 50 03 22', rating: 4.5, reviews: 168, doctors: 26 },

  // ── PORTO-NOVO ────────────────────────────────────────────────────────
  { name: 'Centre Hospitalier Départemental Ouémé-Plateau (CHD-OP)', type: 'hopital', city: 'Porto-Novo', address: 'Porto-Novo, Ouémé', phone: '+229 01 20 21 26 19', rating: 4.6, reviews: 234, doctors: 42 },
  { name: 'Hôpital Saint Enfant Jésus', type: 'hopital', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 30 30', rating: 4.5, reviews: 162, doctors: 22 },
  { name: 'Hôpital El-Fateh', type: 'hopital', city: 'Porto-Novo', address: 'Ouando, Porto-Novo', phone: '+229 01 20 24 12 12', rating: 4.6, reviews: 198, doctors: 28 },
  { name: 'Hôpital Ahmadiyya Porto-Novo', type: 'hopital', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 60 60', rating: 4.4, reviews: 118, doctors: 16 },
  { name: 'Clinique Louis Pasteur Porto-Novo', type: 'clinique', city: 'Porto-Novo', address: 'Porto-Novo Centre', phone: '+229 01 20 21 48 95', rating: 4.7, reviews: 256, doctors: 24 },
  { name: 'Clinique Saint Nicolas', type: 'clinique', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 75 75', rating: 4.5, reviews: 132 },
  { name: 'Polyclinique The New Life', type: 'clinique', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 82 82', rating: 4.5, reviews: 116 },
  { name: 'Centre Médical Saint Camille', type: 'clinique', city: 'Missérété', address: 'Missérété, Ouémé', phone: '+229 01 20 24 05 05', rating: 4.4, reviews: 92 },
  { name: 'Clinique Vignon', type: 'maternite', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 90 90', rating: 4.5, reviews: 142 },
  { name: 'Pharmacie Catchi', type: 'pharmacie', city: 'Porto-Novo', address: 'Catchi, Porto-Novo', phone: '+229 01 20 21 11 11' },
  { name: 'Pharmacie Le Nokoué', type: 'pharmacie', city: 'Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 22 33' },
  { name: 'Pharmacie Carrefour Gbodjè', type: 'pharmacie', city: 'Porto-Novo', address: 'Gbodjè, Porto-Novo', phone: '+229 01 20 21 44 55' },
  { name: 'Pharmacie Agbokou', type: 'pharmacie', city: 'Porto-Novo', address: 'Agbokou, Porto-Novo', phone: '+229 01 20 21 55 66' },

  // ── PARAKOU ───────────────────────────────────────────────────────────
  { name: 'Centre Hospitalier Départemental du Borgou (CHD)', type: 'hopital', city: 'Parakou', address: 'Parakou, Borgou', phone: '+229 01 23 61 03 50', rating: 4.6, reviews: 218, doctors: 38 },
  { name: 'Hôpital Ahmadiyya Parakou', type: 'hopital', city: 'Parakou', address: 'Parakou', phone: '+229 01 23 61 25 25', rating: 4.4, reviews: 124, doctors: 18 },
  { name: 'Centre Lazaret de Parakou', type: 'hopital', city: 'Parakou', address: 'Parakou', phone: '+229 01 23 61 40 40', rating: 4.4, reviews: 96, doctors: 12 },
  { name: 'Clinique Baguidi', type: 'clinique', city: 'Parakou', address: 'Parakou', phone: '+229 01 23 61 55 55', rating: 4.4, reviews: 88 },
  { name: 'Clinique Dr. Zinflou', type: 'clinique', city: 'Parakou', address: 'Parakou', phone: '+229 01 23 61 66 66', rating: 4.5, reviews: 102 },
  { name: 'Clinique Médicale du Campus', type: 'clinique', city: 'Parakou', address: 'Campus, Parakou', phone: '+229 01 23 61 77 77', rating: 4.4, reviews: 76 },
  { name: 'Pharmacie Banikanni', type: 'pharmacie', city: 'Parakou', address: 'Banikanni, Parakou', phone: '+229 01 23 61 11 22' },
  { name: 'Pharmacie du Plateau', type: 'pharmacie', city: 'Parakou', address: 'Plateau, Parakou', phone: '+229 01 23 61 22 33' },

  // ── AUTRES VILLES ─────────────────────────────────────────────────────
  { name: 'Hôpital de Zone de Bohicon', type: 'hopital', city: 'Bohicon', address: 'Bohicon, Zou', phone: '+229 01 22 51 00 30', rating: 4.4, reviews: 132, doctors: 20 },
  { name: 'Hôpital de Zone de Natitingou', type: 'hopital', city: 'Natitingou', address: 'Natitingou, Atacora', phone: '+229 01 23 82 00 30', rating: 4.4, reviews: 118, doctors: 18 },
  { name: "Hôpital de l'Ordre de Malte", type: 'hopital', city: 'Djougou', address: 'Djougou, Donga', phone: '+229 01 23 80 03 33', rating: 4.6, reviews: 168, doctors: 22 },
  { name: 'Hôpital de Zone de Ouidah', type: 'hopital', city: 'Ouidah', address: 'Ouidah, Atlantique', phone: '+229 01 21 34 10 10', rating: 4.5, reviews: 142, doctors: 20 },
  { name: 'Hôpital de Zone de Kandi', type: 'hopital', city: 'Kandi', address: 'Kandi, Alibori', phone: '+229 01 23 63 00 30', rating: 4.4, reviews: 108, doctors: 16 },
  { name: 'Hôpital de Zone de Comé', type: 'hopital', city: 'Comé', address: 'Comé, Mono', phone: '+229 01 22 43 00 30', rating: 4.3, reviews: 92, doctors: 12 },
  { name: 'Hôpital de Zone de Klouékanmè', type: 'hopital', city: 'Klouékanmè', address: 'Klouékanmè, Couffo', phone: '+229 01 22 41 00 30', rating: 4.3, reviews: 76, doctors: 10 },
  { name: 'Hôpital communautaire de Kétou', type: 'hopital', city: 'Kétou', address: 'Kétou, Plateau', phone: '+229 01 20 26 00 30', rating: 4.3, reviews: 68, doctors: 10 },
  { name: 'Hôpital Sounon Séro', type: 'hopital', city: 'Nikki', address: 'Nikki, Borgou', phone: '+229 01 23 65 02 02', rating: 4.4, reviews: 84, doctors: 12 },
  { name: 'Hôpital Saint Padre Pio de N\'Dali', type: 'hopital', city: "N'Dali", address: "N'Dali, Borgou", phone: '+229 01 23 64 10 10', rating: 4.5, reviews: 98, doctors: 14 },
  { name: 'Hôpital de Zone Bembèrèkè', type: 'hopital', city: 'Bembèrèkè', address: 'Bembèrèkè, Borgou', phone: '+229 01 23 67 00 30', rating: 4.4, reviews: 78, doctors: 12 },
  { name: 'Maternité de l\'Hôpital de Zone Dassa-Glazoué', type: 'maternite', city: 'Dassa-Zoumè', address: 'Dassa-Zoumè, Collines', phone: '+229 01 22 53 00 30', rating: 4.5, reviews: 86, doctors: 10 },
  { name: 'Clinique du Château', type: 'clinique', city: 'Pobè', address: 'Pobè, Plateau', phone: '+229 01 20 25 00 30', rating: 4.4, reviews: 62 },
  { name: 'Pharmacie Bwendora', type: 'pharmacie', city: 'Bembèrèkè', address: 'Bembèrèkè, Borgou', phone: '+229 01 23 67 18 18' },
  { name: 'Pharmacie du Sahel', type: 'pharmacie', city: 'Malanville', address: 'Malanville, Alibori', phone: '+229 01 23 67 22 22' },
];

const COTONOU_REF: [number, number] = [6.3703, 2.3912];

function expandSeed(seed: Seed, id: number): Center {
  const pos = CITY[seed.city] ?? COTONOU_REF;
  const km = haversine(COTONOU_REF, pos);
  return {
    id,
    name: seed.name,
    type: seed.type,
    city: seed.city,
    department: DEPT[seed.city] ?? '',
    specialty: seed.specialty ?? DEFAULT_SPECIALTY[seed.type],
    rating: seed.rating ?? 4.4,
    reviews: seed.reviews ?? 80,
    distance: km < 0.5 ? `${(1 + (id % 8) * 0.4).toFixed(1)} km` : formatKm(km),
    address: seed.address ?? `${seed.city}, Bénin`,
    phone: seed.phone ?? '+229 01 00 00 00 00',
    hours: seed.hours ?? DEFAULT_HOURS[seed.type],
    doctors: seed.doctors ?? (seed.type === 'pharmacie' ? 0 : 8),
    description: seed.description ?? `${seed.name}, ${DEFAULT_SPECIALTY[seed.type]} à ${seed.city}.`,
    services: seed.services ?? DEFAULT_SERVICES[seed.type],
    image: seed.image ?? DEFAULT_IMAGE[seed.type],
    position: pos,
    available: seed.available ?? true,
    nextSlot: seed.nextSlot ?? "Aujourd'hui",
  };
}

export const CENTERS: Center[] = SEEDS.map((s, i) => expandSeed(s, i + 1));

export function getCenter(id: number): Center | undefined {
  return CENTERS.find((c) => c.id === id);
}

export function centersByType(type: CenterType): Center[] {
  return CENTERS.filter((c) => c.type === type);
}

export function centersByCity(city: string): Center[] {
  return CENTERS.filter((c) => c.city === city);
}

// Haversine distance in km
export function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
