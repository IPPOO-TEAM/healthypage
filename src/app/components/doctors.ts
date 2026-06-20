// Registre des médecins du réseau HEALTHY PAGE, Bénin.
// Photos issues de l'image bank africain, anonymisées par usage.

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'F' | 'M';
  specialty: string;
  category: string;
  city: string;
  centerId?: number;
  centerName: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  yearsExperience: number;
  languages: string[];
  bio: string;
  photo: string;
  available: boolean;
  nextSlot: string;
  consultationFee: number; // FCFA
  acceptsInsurance: boolean;
}

const PHOTOS = {
  fDoc1: 'https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?w=600&q=80',
  fDoc2: 'https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=600&q=80',
  fDoc3: 'https://images.unsplash.com/photo-1576089235406-0612d7bb033e?w=600&q=80',
  mDoc1: 'https://images.unsplash.com/photo-1666887360445-e3b7bba7917c?w=600&q=80',
  mDoc2: 'https://images.unsplash.com/photo-1666887360313-43de76a966da?w=600&q=80',
  mDoc3: 'https://images.unsplash.com/photo-1666887360369-1901f341fdad?w=600&q=80',
  mDoc4: 'https://images.unsplash.com/photo-1769072610024-5b8a50f05c73?w=600&q=80',
  mDoc5: 'https://images.unsplash.com/photo-1631558554184-319c88f4f8a4?w=600&q=80',
  mDoc6: 'https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?w=600&q=80',
  mDoc7: 'https://images.unsplash.com/photo-1763739528420-bdc297ff4ec7?w=600&q=80',
  mDoc8: 'https://images.unsplash.com/photo-1600679472868-eae382e28b34?w=600&q=80',
  fDoc4: 'https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=600&q=80',
  fDoc5: 'https://images.unsplash.com/photo-1678225894316-b6e83cd06242?w=600&q=80',
};

export const CATEGORIES: { id: string; label: string; specialties: string[] }[] = [
  { id: 'gen', label: 'Médecine générale', specialties: ['Médecin généraliste', 'Médecin de famille', 'Urgentiste'] },
  { id: 'mere', label: 'Mère & enfant', specialties: ['Pédiatre', 'Gynécologue', 'Obstétricien', 'Sage-femme', 'Néonatologue'] },
  { id: 'cardio', label: 'Cardiologie & vaisseaux', specialties: ['Cardiologue', 'Chirurgien cardio-vasculaire', 'Phlébologue'] },
  { id: 'chir', label: 'Chirurgie', specialties: ['Chirurgien général', 'Chirurgien orthopédiste', 'Chirurgien viscéral', 'Neurochirurgien', 'Chirurgien plastique'] },
  { id: 'sens', label: 'Sensoriel & ORL', specialties: ['Ophtalmologue', 'ORL', 'Stomatologue'] },
  { id: 'mental', label: 'Santé mentale', specialties: ['Psychiatre', 'Psychologue', 'Neuropsychologue'] },
  { id: 'chronique', label: 'Maladies chroniques', specialties: ['Diabétologue', 'Endocrinologue', 'Pneumologue', 'Néphrologue', 'Rhumatologue'] },
  { id: 'dentaire', label: 'Soins dentaires', specialties: ['Chirurgien-dentiste', 'Orthodontiste'] },
  { id: 'derma', label: 'Peau & dermatologie', specialties: ['Dermatologue', 'Allergologue'] },
  { id: 'reeduc', label: 'Rééducation & nutrition', specialties: ['Kinésithérapeute', 'Diététicien / Nutritionniste', 'Ergothérapeute'] },
  { id: 'imagerie', label: 'Imagerie & laboratoire', specialties: ['Radiologue', 'Biologiste médical', 'Anatomo-pathologiste'] },
];

export const DOCTORS: Doctor[] = [
  // Médecine générale
  { id: 1, firstName: 'Aïssatou', lastName: 'Hounkpatin', gender: 'F', specialty: 'Médecin généraliste', category: 'gen', city: 'Cotonou', centerName: 'CNHU-HKM Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 30 17 28', rating: 4.8, reviews: 312, yearsExperience: 14, languages: ['Français', 'Fon'], bio: 'Médecin généraliste expérimentée, spécialisée en médecine de famille et suivi des maladies chroniques.', photo: PHOTOS.fDoc1, available: true, nextSlot: "Aujourd'hui 15h30", consultationFee: 7000, acceptsInsurance: true },
  { id: 2, firstName: 'Kossi', lastName: 'Adjovi', gender: 'M', specialty: 'Médecin généraliste', category: 'gen', city: 'Porto-Novo', centerName: 'CHD Ouémé-Plateau', address: 'Porto-Novo', phone: '+229 01 20 21 26 19', rating: 4.6, reviews: 184, yearsExperience: 9, languages: ['Français', 'Goun', 'Yoruba'], bio: 'Médecin généraliste, consultations adultes et enfants.', photo: PHOTOS.mDoc1, available: true, nextSlot: 'Demain 09h00', consultationFee: 6000, acceptsInsurance: true },
  { id: 3, firstName: 'Sékou', lastName: 'Dossou', gender: 'M', specialty: 'Urgentiste', category: 'gen', city: 'Cotonou', centerName: "Hôpital de l'Instruction des Armées", address: 'Camp Guézo, Cotonou', phone: '+229 01 21 31 27 50', rating: 4.7, reviews: 226, yearsExperience: 12, languages: ['Français'], bio: 'Médecin urgentiste, prise en charge rapide des urgences vitales.', photo: PHOTOS.mDoc2, available: true, nextSlot: '24h/24', consultationFee: 10000, acceptsInsurance: true },

  // Mère & enfant
  { id: 4, firstName: 'Mariama', lastName: 'Houngbédji', gender: 'F', specialty: 'Pédiatre', category: 'mere', city: 'Cotonou', centerName: 'HOMEL Lagune', address: 'Lagune, Cotonou', phone: '+229 01 21 31 10 00', rating: 4.9, reviews: 412, yearsExperience: 18, languages: ['Français', 'Fon'], bio: 'Pédiatre senior, suivi du nouveau-né au pré-adolescent. Vaccinations, allergies, croissance.', photo: PHOTOS.fDoc2, available: true, nextSlot: "Aujourd'hui 16h45", consultationFee: 12000, acceptsInsurance: true },
  { id: 5, firstName: 'Yawavi', lastName: 'Akakpo', gender: 'F', specialty: 'Gynécologue', category: 'mere', city: 'Cotonou', centerName: 'CHU-MEL', address: 'Lagune, Cotonou', phone: '+229 01 21 31 10 00', rating: 4.8, reviews: 298, yearsExperience: 15, languages: ['Français', 'Mina'], bio: 'Gynécologue obstétricien, suivi de grossesse, fertilité et santé féminine.', photo: PHOTOS.fDoc3, available: true, nextSlot: 'Demain 11h00', consultationFee: 15000, acceptsInsurance: true },
  { id: 6, firstName: 'Cyrille', lastName: 'Tchetchao', gender: 'M', specialty: 'Pédiatre', category: 'mere', city: 'Parakou', centerName: 'CHD du Borgou', address: 'Parakou', phone: '+229 01 23 61 03 50', rating: 4.6, reviews: 154, yearsExperience: 10, languages: ['Français', 'Bariba'], bio: 'Pédiatre, troubles digestifs et respiratoires de l\'enfant.', photo: PHOTOS.mDoc3, available: true, nextSlot: 'Lun. 10h30', consultationFee: 10000, acceptsInsurance: true },
  { id: 7, firstName: 'Edwige', lastName: 'Quenum', gender: 'F', specialty: 'Sage-femme', category: 'mere', city: 'Cotonou', centerName: 'Maternité Agblangandan', address: 'Agblangandan, Cotonou', phone: '+229 01 21 04 75 50', rating: 4.7, reviews: 189, yearsExperience: 11, languages: ['Français', 'Fon'], bio: 'Sage-femme, suivi prénatal, accouchement et post-partum.', photo: PHOTOS.fDoc4, available: true, nextSlot: "Aujourd'hui 14h00", consultationFee: 5000, acceptsInsurance: true },

  // Cardiologie
  { id: 8, firstName: 'Fortuné', lastName: 'Codjia', gender: 'M', specialty: 'Cardiologue', category: 'cardio', city: 'Cotonou', centerName: 'Clinique Louis Pasteur Cotonou', address: 'Cadjèhoun, Cotonou', phone: '+229 01 21 30 48 95', rating: 4.9, reviews: 356, yearsExperience: 22, languages: ['Français', 'Anglais'], bio: 'Cardiologue interventionnel, hypertension, insuffisance cardiaque, ECG et échocardiographie.', photo: PHOTOS.mDoc4, available: true, nextSlot: 'Demain 14h30', consultationFee: 20000, acceptsInsurance: true },
  { id: 9, firstName: 'Rosine', lastName: 'Aïvodji', gender: 'F', specialty: 'Cardiologue', category: 'cardio', city: 'Porto-Novo', centerName: 'Clinique Louis Pasteur Porto-Novo', address: 'Porto-Novo', phone: '+229 01 20 21 48 95', rating: 4.7, reviews: 198, yearsExperience: 14, languages: ['Français'], bio: 'Cardiologie clinique et préventive, dépistage des risques cardiovasculaires.', photo: PHOTOS.fDoc5, available: true, nextSlot: 'Mer. 09h00', consultationFee: 18000, acceptsInsurance: true },

  // Chirurgie
  { id: 10, firstName: 'Wilfrid', lastName: 'Tossou', gender: 'M', specialty: 'Chirurgien orthopédiste', category: 'chir', city: 'Cotonou', centerName: 'CNHU-HKM Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 30 17 28', rating: 4.8, reviews: 247, yearsExperience: 17, languages: ['Français'], bio: 'Chirurgie orthopédique et traumatologique, prothèses articulaires.', photo: PHOTOS.mDoc5, available: true, nextSlot: 'Jeu. 10h00', consultationFee: 25000, acceptsInsurance: true },
  { id: 11, firstName: 'Patrice', lastName: 'Glèlè', gender: 'M', specialty: 'Chirurgien général', category: 'chir', city: 'Cotonou', centerName: 'Hôpital Saint Luc', address: 'Cadjèhoun, Cotonou', phone: '+229 01 21 30 11 12', rating: 4.6, reviews: 162, yearsExperience: 13, languages: ['Français'], bio: 'Chirurgie viscérale et digestive, hernies, vésicule biliaire.', photo: PHOTOS.mDoc6, available: true, nextSlot: 'Demain 08h30', consultationFee: 22000, acceptsInsurance: true },

  // Sensoriel & ORL
  { id: 12, firstName: 'Lionel', lastName: 'Soglo', gender: 'M', specialty: 'Ophtalmologue', category: 'sens', city: 'Abomey-Calavi', centerName: 'Clinique Ophtalmologique Bartimée', address: 'Calavi', phone: '+229 01 21 36 14 14', rating: 4.9, reviews: 334, yearsExperience: 19, languages: ['Français'], bio: 'Ophtalmologie médicale et chirurgicale, cataracte, glaucome.', photo: PHOTOS.mDoc7, available: true, nextSlot: 'Lun. 14h00', consultationFee: 15000, acceptsInsurance: true },
  { id: 13, firstName: 'Mireille', lastName: 'Adékambi', gender: 'F', specialty: 'ORL', category: 'sens', city: 'Cotonou', centerName: 'Polyclinique Saint Michel', address: 'Saint-Michel, Cotonou', phone: '+229 01 21 31 33 33', rating: 4.7, reviews: 192, yearsExperience: 12, languages: ['Français', 'Fon'], bio: 'Oto-rhino-laryngologie, audition, sinus, troubles de la voix.', photo: PHOTOS.fDoc1, available: true, nextSlot: 'Demain 16h00', consultationFee: 14000, acceptsInsurance: true },

  // Santé mentale
  { id: 14, firstName: 'Olivia', lastName: 'Akpolè', gender: 'F', specialty: 'Psychiatre', category: 'mental', city: 'Cotonou', centerName: 'Hôpital Bethesda', address: 'Mènontin, Cotonou', phone: '+229 01 21 04 53 00', rating: 4.8, reviews: 218, yearsExperience: 15, languages: ['Français'], bio: 'Psychiatrie adulte, dépression, anxiété, troubles du sommeil.', photo: PHOTOS.fDoc2, available: true, nextSlot: 'Mer. 11h00', consultationFee: 18000, acceptsInsurance: false },
  { id: 15, firstName: 'Romain', lastName: 'Houénou', gender: 'M', specialty: 'Psychologue', category: 'mental', city: 'Cotonou', centerName: 'Cabinet privé', address: 'Haie Vive, Cotonou', phone: '+229 01 96 12 34 56', rating: 4.6, reviews: 142, yearsExperience: 8, languages: ['Français', 'Fon'], bio: 'Thérapie cognitive et comportementale (TCC), gestion du stress.', photo: PHOTOS.mDoc8, available: true, nextSlot: "Aujourd'hui 18h00", consultationFee: 12000, acceptsInsurance: false },

  // Maladies chroniques
  { id: 16, firstName: 'Bénédicte', lastName: 'Sagbohan', gender: 'F', specialty: 'Diabétologue', category: 'chronique', city: 'Cotonou', centerName: 'CNHU-HKM Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 30 17 28', rating: 4.8, reviews: 274, yearsExperience: 16, languages: ['Français'], bio: 'Diabétologie et endocrinologie, suivi diabète type 1 et 2.', photo: PHOTOS.fDoc3, available: true, nextSlot: 'Demain 10h00', consultationFee: 16000, acceptsInsurance: true },
  { id: 17, firstName: 'Jean-Baptiste', lastName: 'Vidégla', gender: 'M', specialty: 'Pneumologue', category: 'chronique', city: 'Cotonou', centerName: 'CNHU de Pneumo-Phtisiologie', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 21 47', rating: 4.7, reviews: 186, yearsExperience: 14, languages: ['Français'], bio: 'Pneumologie, asthme, BPCO, tuberculose.', photo: PHOTOS.mDoc1, available: true, nextSlot: 'Jeu. 09h30', consultationFee: 15000, acceptsInsurance: true },
  { id: 18, firstName: 'Edmond', lastName: 'Kpodzro', gender: 'M', specialty: 'Néphrologue', category: 'chronique', city: 'Cotonou', centerName: 'CNHU-HKM Cotonou', address: 'Ganhi, Cotonou', phone: '+229 01 21 30 17 28', rating: 4.6, reviews: 124, yearsExperience: 11, languages: ['Français'], bio: 'Néphrologie, insuffisance rénale chronique, dialyse.', photo: PHOTOS.mDoc2, available: true, nextSlot: 'Mar. 13h30', consultationFee: 18000, acceptsInsurance: true },

  // Dentaires
  { id: 19, firstName: 'Christelle', lastName: 'Lawson', gender: 'F', specialty: 'Chirurgien-dentiste', category: 'dentaire', city: 'Cotonou', centerName: 'Clinique de la Marina', address: 'Marina, Cotonou', phone: '+229 01 21 30 42 42', rating: 4.7, reviews: 168, yearsExperience: 9, languages: ['Français', 'Anglais'], bio: 'Soins dentaires généraux, blanchiment, pose d\'implants.', photo: PHOTOS.fDoc4, available: true, nextSlot: "Aujourd'hui 17h00", consultationFee: 12000, acceptsInsurance: true },
  { id: 20, firstName: 'Hervé', lastName: 'Akpovo', gender: 'M', specialty: 'Orthodontiste', category: 'dentaire', city: 'Porto-Novo', centerName: 'Polyclinique The New Life', address: 'Porto-Novo', phone: '+229 01 20 21 82 82', rating: 4.8, reviews: 142, yearsExperience: 12, languages: ['Français'], bio: 'Orthodontie enfant et adulte, gouttières invisibles.', photo: PHOTOS.mDoc3, available: true, nextSlot: 'Sam. 09h00', consultationFee: 18000, acceptsInsurance: false },

  // Dermatologie
  { id: 21, firstName: 'Léa', lastName: 'Dégboé', gender: 'F', specialty: 'Dermatologue', category: 'derma', city: 'Cotonou', centerName: 'Clinique du Golfe', address: 'Cocotomey, Cotonou', phone: '+229 01 21 03 88 88', rating: 4.8, reviews: 232, yearsExperience: 13, languages: ['Français'], bio: 'Dermatologie médicale et esthétique, eczéma, acné, peaux noires.', photo: PHOTOS.fDoc5, available: true, nextSlot: 'Demain 15h00', consultationFee: 17000, acceptsInsurance: true },

  // Rééducation & nutrition
  { id: 22, firstName: 'Benoît', lastName: 'Hounsou', gender: 'M', specialty: 'Kinésithérapeute', category: 'reeduc', city: 'Cotonou', centerName: 'Centre Médical d\'Akpakpa', address: 'Akpakpa, Cotonou', phone: '+229 01 21 33 14 50', rating: 4.7, reviews: 156, yearsExperience: 10, languages: ['Français', 'Fon'], bio: 'Kinésithérapie, rééducation post-opératoire et sportive.', photo: PHOTOS.mDoc4, available: true, nextSlot: "Aujourd'hui 16h00", consultationFee: 8000, acceptsInsurance: true },
  { id: 23, firstName: 'Géraldine', lastName: 'Affodogandji', gender: 'F', specialty: 'Diététicien / Nutritionniste', category: 'reeduc', city: 'Cotonou', centerName: 'Cabinet privé', address: 'Cadjèhoun, Cotonou', phone: '+229 01 97 23 45 67', rating: 4.9, reviews: 264, yearsExperience: 8, languages: ['Français'], bio: 'Nutrition adaptée, perte de poids, diabète, grossesse.', photo: PHOTOS.fDoc1, available: true, nextSlot: 'Demain 11h30', consultationFee: 10000, acceptsInsurance: false },

  // Imagerie & labo
  { id: 24, firstName: 'Roland', lastName: 'Adjamonsi', gender: 'M', specialty: 'Radiologue', category: 'imagerie', city: 'Cotonou', centerName: 'Saint Padre Pio, Centre de Diagnostic', address: 'Akpakpa Centre, Cotonou', phone: '+229 01 21 33 15 00', rating: 4.7, reviews: 178, yearsExperience: 14, languages: ['Français'], bio: 'Imagerie médicale, échographie, scanner, IRM.', photo: PHOTOS.mDoc5, available: true, nextSlot: 'Demain 08h00', consultationFee: 25000, acceptsInsurance: true },
  { id: 25, firstName: 'Sandrine', lastName: 'Zinsou', gender: 'F', specialty: 'Biologiste médical', category: 'imagerie', city: 'Cotonou', centerName: 'Polyclinique Saint Michel', address: 'Saint-Michel, Cotonou', phone: '+229 01 21 31 33 33', rating: 4.6, reviews: 132, yearsExperience: 10, languages: ['Français'], bio: 'Biologie médicale, analyses sanguines, microbiologie.', photo: PHOTOS.fDoc2, available: true, nextSlot: "Aujourd'hui 09h00", consultationFee: 5000, acceptsInsurance: true },
];

export function getDoctor(id: number): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}

export function doctorsByCategory(categoryId: string): Doctor[] {
  return DOCTORS.filter((d) => d.category === categoryId);
}

export function doctorsBySpecialty(specialty: string): Doctor[] {
  return DOCTORS.filter((d) => d.specialty === specialty);
}

export function doctorsByCity(city: string): Doctor[] {
  return DOCTORS.filter((d) => d.city === city);
}
