import type { LucideIcon } from 'lucide-react';
import { Users, Briefcase, Home, Hand, ShoppingCart, FileText, Scale, TrendingUp } from 'lucide-react';
import { LegalImage } from './images';

export type DomainId = 'famille' | 'travail' | 'foncier' | 'femmes' | 'consommation' | 'admin' | 'penal' | 'commerce';

export interface Domain {
  id: DomainId;
  label: string;
  icon: LucideIcon;
  tagline: string;
  desc: string;
  hero: LegalImage;
  cover: LegalImage;
  accent: string;
  topics: string[];
  laws: string[];
}

export const DOMAINS: Domain[] = [
  {
    id: 'famille', label: 'Famille', icon: Users, tagline: 'Mariage, divorce, enfants',
    desc: 'Mariage civil et coutumier, divorce, garde et pension, succession, état civil au Bénin.',
    hero: 'familyTrad', cover: 'twoWomen', accent: 'from-rose-500 to-pink-700',
    topics: ['Mariage civil', 'Divorce par consentement', 'Garde des enfants', 'Pension alimentaire', 'Succession', 'Reconnaissance de paternité'],
    laws: ['Code des Personnes et de la Famille (loi 2002-07)', 'Code civil béninois'],
  },
  {
    id: 'travail', label: 'Travail', icon: Briefcase, tagline: 'Contrat, salaire, licenciement',
    desc: 'Contrat de travail, paie, congés, licenciement abusif, sécurité sociale (CNSS).',
    hero: 'vendorThumb', cover: 'vendorTomato', accent: 'from-amber-500 to-orange-700',
    topics: ['Contrat CDI/CDD', 'Salaire impayé', 'Licenciement', 'Heures supplémentaires', 'CNSS', 'Accident du travail'],
    laws: ['Code du travail (loi 98-004)', 'Convention collective interprofessionnelle'],
  },
  {
    id: 'foncier', label: 'Foncier & habitat', icon: Home, tagline: 'Terrain, location, voisinage',
    desc: 'Achat de terrain, titre foncier, ADC, location, expulsion, conflits de voisinage.',
    hero: 'greenField', cover: 'fieldTrees', accent: 'from-emerald-600 to-teal-800',
    topics: ['Titre foncier', 'Attestation de Détention Coutumière', 'Bail', 'Expulsion', 'Bornage', 'Voisinage'],
    laws: ['Code foncier et domanial (loi 2017-15)', 'Décrets d\'application ANDF'],
  },
  {
    id: 'femmes', label: 'Droits des femmes', icon: Hand, tagline: 'Violences, harcèlement, héritage',
    desc: 'Violences conjugales, harcèlement, dot, mariage forcé, héritage, mutilations.',
    hero: 'womanScarfA', cover: 'womanScarfB', accent: 'from-fuchsia-600 to-violet-800',
    topics: ['Violences conjugales', 'Harcèlement', 'Mariage forcé', 'Héritage', 'Garde alternée', 'Pension'],
    laws: ['Loi 2011-26 violences faites aux femmes', 'Loi 2003-04 santé sexuelle et reproductive'],
  },
  {
    id: 'consommation', label: 'Consommation', icon: ShoppingCart, tagline: 'Achats, banque, télécom',
    desc: 'Litiges sur achats, services, banque, mobile money, télécom, garantie.',
    hero: 'marketCrowd', cover: 'phoneVintage', accent: 'from-sky-500 to-blue-700',
    topics: ['Garantie', 'Mobile Money', 'Banque', 'Télécom', 'Achat en ligne', 'Surfacturation'],
    laws: ['Loi 2007-21 protection du consommateur', 'Régulation BCEAO'],
  },
  {
    id: 'admin', label: 'Administratif', icon: FileText, tagline: 'Pièces, démarches, recours',
    desc: 'Pièces d\'identité, passeport, recours administratif, contentieux fiscal.',
    hero: 'columnBuilding', cover: 'domeBuilding', accent: 'from-stone-700 to-stone-900',
    topics: ['CNI', 'Passeport', 'Acte de naissance', 'Recours gracieux', 'Contentieux fiscal', 'Marchés publics'],
    laws: ['Code de procédure administrative', 'Loi 2018-15 ANIP'],
  },
  {
    id: 'penal', label: 'Pénal', icon: Scale, tagline: 'Plainte, garde à vue, défense',
    desc: 'Dépôt de plainte, garde à vue, instruction, défense pénale, médiation.',
    hero: 'gavelDark', cover: 'gavelClosed', accent: 'from-red-600 to-rose-800',
    topics: ['Dépôt de plainte', 'Garde à vue', 'Instruction', 'Défense', 'Liberté provisoire', 'Médiation pénale'],
    laws: ['Code pénal béninois', 'Code de procédure pénale'],
  },
  {
    id: 'commerce', label: 'Affaires & commerce', icon: TrendingUp, tagline: 'Entreprise, contrats, OHADA',
    desc: 'Création d\'entreprise, contrats commerciaux, recouvrement, OHADA.',
    hero: 'signingDoc', cover: 'contractTable', accent: 'from-indigo-600 to-blue-800',
    topics: ['Création SA/SARL', 'Contrats commerciaux', 'Recouvrement', 'OHADA', 'Faillite', 'Marques'],
    laws: ['Actes uniformes OHADA', 'Loi 2017-20 climat des affaires'],
  },
];

export interface LegalCenter {
  id: string;
  name: string;
  type: 'maison' | 'cabinet' | 'tribunal' | 'clinique';
  city: string;
  dept: string;
  phone: string;
  hours: string;
  free: boolean;
  image: LegalImage;
}

export const CENTERS: LegalCenter[] = [
  { id: 'mj-cotonou', name: 'Maison de la Justice de Cotonou', type: 'maison', city: 'Cotonou — Akpakpa', dept: 'Littoral', phone: '+229 21 33 60 12', hours: 'Lun–Ven · 8h–17h', free: true, image: 'flagBuilding' },
  { id: 'mj-portonovo', name: 'Maison de la Justice Porto-Novo', type: 'maison', city: 'Porto-Novo', dept: 'Ouémé', phone: '+229 20 21 41 60', hours: 'Lun–Ven · 8h–17h', free: true, image: 'whiteRoof' },
  { id: 'mj-parakou', name: 'Maison de la Justice Parakou', type: 'maison', city: 'Parakou', dept: 'Borgou', phone: '+229 23 61 03 12', hours: 'Lun–Ven · 8h–16h', free: true, image: 'facadeSky' },
  { id: 'ordre-avocats', name: 'Ordre des Avocats du Bénin', type: 'cabinet', city: 'Cotonou — Ganhi', dept: 'Littoral', phone: '+229 21 31 25 04', hours: 'Lun–Ven · 9h–17h', free: false, image: 'flagPole' },
  { id: 'cliniqueHM', name: 'Clinique Juridique Hubert Maga', type: 'clinique', city: 'Porto-Novo', dept: 'Ouémé', phone: '+229 20 21 30 88', hours: 'Lun–Sam · 8h–18h', free: true, image: 'domeTower' },
  { id: 'cliniqueWomen', name: 'Clinique Juridique Femmes & Droit', type: 'clinique', city: 'Cotonou — Cadjehoun', dept: 'Littoral', phone: '+229 21 30 55 70', hours: 'Lun–Ven · 8h–17h', free: true, image: 'modernConcrete' },
  { id: 'tribunal-cotonou', name: 'Tribunal de 1ère Instance', type: 'tribunal', city: 'Cotonou', dept: 'Littoral', phone: '+229 21 30 04 12', hours: 'Lun–Ven · 8h–15h', free: false, image: 'columnBuilding' },
  { id: 'tribunal-abomey', name: 'Tribunal d\'Abomey', type: 'tribunal', city: 'Abomey', dept: 'Zou', phone: '+229 22 50 02 18', hours: 'Lun–Ven · 8h–15h', free: false, image: 'domeBuilding' },
];

export const HOTLINES = [
  { id: 'vert', label: 'Numéro Vert Justice', number: '7028', desc: 'Information juridique gratuite', tone: 'from-amber-500 to-orange-600' },
  { id: 'police', label: 'Police Judiciaire', number: '117', desc: 'Plaintes & signalements', tone: 'from-blue-600 to-indigo-700' },
  { id: 'sos', label: 'SOS Femmes & Enfants', number: '138', desc: 'Violences & protection', tone: 'from-rose-500 to-fuchsia-700' },
];

export type DossierStatus = 'ouvert' | 'en-cours' | 'resolu';

export interface Dossier {
  id: string;
  title: string;
  domain: DomainId;
  status: DossierStatus;
  updated: string;
  next?: string;
}

// DOSSIERS_DEMO retiré : les dossiers juridiques utilisateurs doivent venir
// d'une vraie source (Supabase). L'écran affiche désormais un empty-state
// tant qu'aucune intégration n'est branchée.
export const DOSSIERS_DEMO: Dossier[] = [];
