import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, X, Loader2, Globe2, Check, Radio, Sparkles, Zap, Phone, PhoneOff, MessageSquare, Trash2 } from 'lucide-react';
import { HealthyPage } from './Brand';
import { useT, LOCALES } from '../i18n';
import type { Locale } from '../i18n';
import { CENTERS } from './centers';
import { DOCTORS, CATEGORIES } from './doctors';
import { PODCAST_EPISODES } from './podcasts';
import { translateBatch, isMachineTranslatable } from '../i18n/translator';
import { getCurrentAccount, type PatientAccount } from './accounts';
import logoBrand from '../../imports/1.png';

type Role = 'patient' | 'pro' | 'admin' | null;
type CurrentUser = {
  role: Role;
  account: PatientAccount | null;
  displayName: string;
  greetingName: string;
  honorific: string;
};

function readRole(): Role {
  try { return (localStorage.getItem('healthy-page:role') as Role) ?? null; } catch { return null; }
}

function timeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function detectUser(): CurrentUser {
  const role = readRole();
  const account = getCurrentAccount();
  if (account) {
    const full = `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim();
    const sex = (account as any).sex as string | undefined;
    const honorific = sex === 'F' ? 'Madame' : sex === 'M' ? 'Monsieur' : '';
    return {
      role,
      account,
      displayName: full || account.email || 'Utilisateur',
      greetingName: account.firstName || full || 'cher utilisateur',
      honorific,
    };
  }
  if (role === 'pro') return { role, account: null, displayName: 'Professionnel de santé', greetingName: 'Docteur', honorific: 'Docteur' };
  if (role === 'admin') return { role, account: null, displayName: 'Administrateur', greetingName: 'Administrateur', honorific: '' };
  return { role, account: null, displayName: 'Invité', greetingName: 'cher visiteur', honorific: '' };
}

const POLITE_OPENERS_BY_TIME: Record<ReturnType<typeof timeOfDay>, string[]> = {
  morning: [
    "Bonjour", "Bien le bonjour", "Très belle matinée à vous", "Salutations matinales",
    "Heureux de vous retrouver ce matin", "Quelle joie de vous saluer ce matin",
    "Belle journée qui commence", "Le matin vous va bien", "Bonjour à vous, avec le sourire",
    "Que cette matinée vous soit légère", "Doux réveil à vous",
  ],
  afternoon: [
    "Bonjour", "Bel après-midi à vous", "Ravi de vous accueillir", "Mes salutations",
    "C'est un plaisir de vous revoir", "Je vous souhaite une excellente journée",
    "Bel instant pour se retrouver", "Heureux de vous croiser", "Quel plaisir, bonjour",
    "Bonjour, j'espère que la journée vous est belle",
  ],
  evening: [
    "Bonsoir", "Belle soirée à vous", "Mes salutations", "Ravi de vous retrouver ce soir",
    "Je vous souhaite une douce soirée", "Heureux de vous saluer ce soir",
    "Le soir tombe, bonsoir à vous", "Bonsoir, j'espère que votre journée fut bonne",
    "Quelle paix de vous retrouver à cette heure", "Bonsoir, prenez le temps qu'il faut",
  ],
  night: [
    "Bonsoir", "Bonne nuit à vous", "Ravi de vous retrouver", "Mes salutations nocturnes",
    "Je veille avec vous", "La nuit est calme, je vous écoute",
    "Bonsoir, je suis là si besoin", "Doux silence de la nuit, bonsoir",
  ],
};

const WARM_TAILS = [
  "j'espère que vous allez bien",
  "j'espère que la journée vous est douce",
  "ravi de vous accompagner aujourd'hui",
  "tout le plaisir est pour moi de vous aider",
  "heureux d'être à vos côtés",
  "votre santé est ma priorité",
  "je suis ici, à votre rythme",
  "prenez votre temps, je vous écoute",
  "comment puis-je vous être utile aujourd'hui",
  "je suis attentif à ce que vous allez me dire",
];

// Ton par section — utilisé pour adapter le message d'accueil
type SectionTone = 'calme' | 'professionnel' | 'motivant' | 'fun' | 'empathique' | 'neutre';

function detectSection(pathname: string): { tone: SectionTone; label: string; suggestions: { label: string; q: string }[] } {
  const p = pathname.toLowerCase();
  if (p.includes('voyage') || p.includes('loisirs')) {
    if (p.includes('reservation')) return {
      tone: 'professionnel', label: 'Voyage · Réservation',
      suggestions: [
        { label: '3 nuits à Saly pour 2 adultes', q: 'réserve 3 nuits à Saly pour 2 adultes' },
        { label: 'Du 12 au 17 juin', q: 'réserve du 12 au 17 juin' },
        { label: 'Voir mes voyages', q: 'ouvre mes voyages' },
      ],
    };
    if (p.includes('mes-voyages') || p.includes('mesvoyages')) return {
      tone: 'calme', label: 'Mes voyages',
      suggestions: [
        { label: 'Prochain départ', q: 'mon prochain voyage' },
        { label: 'Annuler un séjour', q: 'comment annuler un séjour' },
        { label: 'Télécharger un bon', q: 'exporter mes réservations' },
      ],
    };
    if (p.includes('favoris')) return {
      tone: 'calme', label: 'Favoris voyage',
      suggestions: [
        { label: 'Réserver un favori', q: 'réserve mon favori' },
        { label: 'Trier par prix', q: 'trie mes favoris par prix' },
        { label: 'Partager une liste', q: 'partage ma liste de favoris' },
      ],
    };
    if (p.includes('experiences')) return {
      tone: 'fun', label: 'Expériences',
      suggestions: [
        { label: 'Safari nature', q: 'expériences safari' },
        { label: 'Atelier cuisine', q: 'expériences culinaires' },
        { label: 'Bien-être', q: 'expériences bien-être' },
      ],
    };
    if (p.includes('evenements')) return {
      tone: 'fun', label: 'Événements',
      suggestions: [
        { label: 'Ce week-end', q: 'événements ce week-end' },
        { label: 'Festivals', q: 'festivals à venir' },
        { label: 'Réserver une place', q: 'réserve une place' },
      ],
    };
    if (p.includes('communaute')) return {
      tone: 'calme', label: 'Communauté voyage',
      suggestions: [
        { label: 'Carnets populaires', q: 'carnets de voyage populaires' },
        { label: 'Poser une question', q: 'pose une question à la communauté' },
        { label: 'Voyageurs proches', q: 'voyageurs proches de moi' },
      ],
    };
    if (p.includes('message')) return {
      tone: 'professionnel', label: 'Messages voyage',
      suggestions: [
        { label: 'Messages non lus', q: 'mes messages non lus' },
        { label: 'Contacter la conciergerie', q: 'contacte la conciergerie' },
        { label: 'Dernière conversation', q: 'reprends la dernière conversation' },
      ],
    };
    if (p.includes('explorer')) return {
      tone: 'calme', label: 'Voyage · Explorer',
      suggestions: [
        { label: 'Saly bord de mer', q: 'séjour à Saly' },
        { label: 'Sine-Saloum nature', q: 'séjour Sine-Saloum' },
        { label: 'Retraites yoga', q: 'recommande une retraite yoga' },
      ],
    };
    return {
      tone: 'calme', label: 'Voyage & Loisirs',
      suggestions: [
        { label: 'Idée d\'évasion ce week-end', q: 'suggère-moi un lieu pour un week-end calme' },
        { label: 'Mes réservations', q: 'ouvre mes voyages' },
        { label: 'Retraites yoga', q: 'recommande une retraite yoga' },
      ],
    };
  }
  if (p.includes('ressenti') || p.includes('silence') || p.includes('emotion')) return {
    tone: 'empathique', label: 'Émotion & Écoute',
    suggestions: [
      { label: 'Respiration guidée', q: 'lance une respiration apaisante' },
      { label: 'Parler à quelqu\'un', q: 'ouvre le chat médical' },
      { label: 'Méditation 5 min', q: 'propose une méditation courte' },
    ],
  };
  if (p.includes('juridique')) return {
    tone: 'professionnel', label: 'Assistance juridique',
    suggestions: [
      { label: 'Évaluer ma situation', q: 'aide-moi à évaluer mon dossier' },
      { label: 'Trouver un expert', q: 'trouve-moi un expert juridique santé' },
      { label: 'Domaines couverts', q: 'que couvre l\'assistance juridique' },
    ],
  };
  if (p.includes('jeu') || p.includes('bien-etre/accueil')) return {
    tone: 'fun', label: 'Jeux Bien-être',
    suggestions: [
      { label: 'Quizz santé', q: 'lance un quizz santé' },
      { label: 'Mini-jeu Réflexes', q: 'lance le jeu Réflexes' },
      { label: 'Memory santé', q: 'lance le Memory santé' },
    ],
  };
  if (p.includes('fitness') || p.includes('sport') || p.includes('activite')) return {
    tone: 'motivant', label: 'Fitness',
    suggestions: [
      { label: 'Séance du jour', q: 'propose une séance courte aujourd\'hui' },
      { label: 'Mon activité', q: 'ouvre mon activité' },
      { label: 'Programme yoga', q: 'ouvre yoga' },
    ],
  };
  if (p.includes('podcast') || p.includes('radio') || p.includes('tv')) return {
    tone: 'calme', label: 'Médias santé',
    suggestions: [
      { label: 'Podcasts pour vous', q: 'recommande un podcast' },
      { label: 'Radio en direct', q: 'ouvre la radio' },
      { label: 'Sommeil', q: 'podcasts sur le sommeil' },
    ],
  };
  if (p.includes('urgence') || p.includes('sos')) return {
    tone: 'empathique', label: 'Urgences',
    suggestions: [
      { label: 'Triage rapide', q: 'ouvre le triage symptômes' },
      { label: 'Activer le SOS', q: 'lance le SOS' },
      { label: 'Centres proches', q: 'centres d\'urgence proches' },
    ],
  };
  if (p.includes('rdv') || p.includes('teleconsult')) return {
    tone: 'professionnel', label: 'Rendez-vous',
    suggestions: [
      { label: 'Prendre RDV', q: 'prendre rendez-vous' },
      { label: 'Mes rendez-vous', q: 'ouvre mes rdv' },
      { label: 'Téléconsultation', q: 'ouvre la téléconsultation' },
    ],
  };
  if (p.includes('carnet') || p.includes('ordonnance') || p.includes('traitement')) return {
    tone: 'professionnel', label: 'Carnet de santé',
    suggestions: [
      { label: 'Mes traitements', q: 'ouvre mes traitements' },
      { label: 'Mes examens', q: 'ouvre mes examens' },
      { label: 'Mes ordonnances', q: 'ouvre mes ordonnances' },
    ],
  };
  return {
    tone: 'neutre', label: 'Healthy Page',
    suggestions: [
      { label: 'Que peux-tu faire ?', q: 'que peux-tu faire' },
      { label: 'Médecins proches', q: 'médecins proches de moi' },
      { label: 'Voyage bien-être', q: 'idée de voyage bien-être' },
      { label: 'Lance le SOS', q: 'lance le sos' },
    ],
  };
}

const TONE_TAILS: Record<SectionTone, string[]> = {
  calme: [
    "respirez, je suis là", "prenez tout le temps qu'il vous faut",
    "à votre rythme, je vous écoute", "rien ne presse",
  ],
  professionnel: [
    "je vous accompagne avec rigueur", "à votre service",
    "je vous guide pas à pas", "vos démarches sont entre de bonnes mains",
  ],
  motivant: [
    "on y va, vous allez voir", "ensemble, on avance",
    "prêt(e) à bouger ?", "je suis votre coach du moment",
  ],
  fun: [
    "on s'amuse ensemble ?", "prêt(e) à jouer ?",
    "c'est l'heure de se détendre", "let's go !",
  ],
  empathique: [
    "je suis là, sans jugement", "vous êtes en sécurité ici",
    "prenez ce dont vous avez besoin", "votre ressenti compte",
  ],
  neutre: WARM_TAILS,
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildGreeting(user: CurrentUser, tone: SectionTone = 'neutre'): string {
  const opener = pick(POLITE_OPENERS_BY_TIME[timeOfDay()]);
  const name = user.account
    ? (user.honorific ? `${user.honorific} ${user.account.lastName || user.greetingName}` : user.greetingName)
    : user.greetingName;
  const tail = pick(TONE_TAILS[tone] ?? WARM_TAILS);
  return `${opener} ${name}, ${tail}.`;
}

// ---------- Historique d'interactions ----------
const HISTORY_KEY = 'healthy-page:ai-history';
type HistoryEntry = { q: string; ts: number; topic: TopicId; title: string };

type TopicId = 'voyage' | 'juridique' | 'urgences' | 'rdv' | 'carnet' | 'bien-etre' | 'medias' | 'jeux' | 'profil' | 'recherche' | 'autre';

const TOPIC_LABEL: Record<TopicId, { label: string; icon: string; tone: string }> = {
  voyage: { label: 'Voyage', icon: '✈️', tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
  juridique: { label: 'Juridique', icon: '⚖️', tone: 'bg-slate-100 text-slate-700 ring-slate-300' },
  urgences: { label: 'Urgences', icon: '🚨', tone: 'bg-red-50 text-red-700 ring-red-200' },
  rdv: { label: 'Rendez-vous', icon: '📅', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
  carnet: { label: 'Carnet santé', icon: '📋', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  'bien-etre': { label: 'Bien-être', icon: '🌿', tone: 'bg-teal-50 text-teal-700 ring-teal-200' },
  medias: { label: 'Médias', icon: '🎧', tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
  jeux: { label: 'Jeux', icon: '🎮', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  profil: { label: 'Profil', icon: '👤', tone: 'bg-stone-100 text-stone-700 ring-stone-300' },
  recherche: { label: 'Recherche', icon: '🔎', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  autre: { label: 'Autre', icon: '💬', tone: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

const TOPIC_PATTERNS: { id: TopicId; patterns: RegExp[] }[] = [
  { id: 'urgences', patterns: [/\b(urgence|sos|secours|triage|emergency|help)\b/i] },
  { id: 'voyage', patterns: [/\b(voyage|sejour|hotel|reserv|destination|saly|marrakech|zanzibar|essaouira|casamance|lompoul|sahara|lamu|cape\s?town|lalibela|book|stay)\b/i] },
  { id: 'juridique', patterns: [/\b(juridique|avocat|sinistre|litige|legal|lawyer)\b/i] },
  { id: 'rdv', patterns: [/\b(rdv|rendez[\s-]?vous|teleconsult|consultation|appointment)\b/i] },
  { id: 'carnet', patterns: [/\b(carnet|ordonnance|traitement|medicament|examen|prescription)\b/i] },
  { id: 'bien-etre', patterns: [/\b(yoga|sommeil|nutrition|stress|respiration|meditation|wellness)\b/i] },
  { id: 'medias', patterns: [/\b(podcast|radio|television|tv|live\s+show)\b/i] },
  { id: 'jeux', patterns: [/\b(jeu|jeux|quizz|quiz|memory|game)\b/i] },
  { id: 'profil', patterns: [/\b(profil|compte|parametre|setting|account|profile)\b/i] },
  { id: 'recherche', patterns: [/\b(medecin|docteur|specialiste|centre|hopital|clinique|pharmacie|doctor|hospital)\b/i] },
];

function classifyTopic(q: string): TopicId {
  const t = norm(q);
  for (const { id, patterns } of TOPIC_PATTERNS) {
    if (patterns.some((p) => p.test(t))) return id;
  }
  return 'autre';
}

function topicTitle(q: string, topic: TopicId): string {
  const trim = q.trim();
  const short = trim.length > 50 ? trim.slice(0, 47).trimEnd() + '…' : trim;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as Partial<HistoryEntry>[];
    // Backfill anciens enregistrements sans topic/title
    return raw.map((e) => ({
      q: e.q ?? '',
      ts: e.ts ?? Date.now(),
      topic: (e.topic as TopicId) ?? classifyTopic(e.q ?? ''),
      title: e.title ?? topicTitle(e.q ?? '', (e.topic as TopicId) ?? classifyTopic(e.q ?? '')),
    }));
  } catch { return []; }
}
function pushHistory(q: string) {
  try {
    const topic = classifyTopic(q);
    const entry: HistoryEntry = { q, ts: Date.now(), topic, title: topicTitle(q, topic) };
    const list = loadHistory();
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

function groupHistoryByTopic(): { topic: TopicId; items: HistoryEntry[] }[] {
  const list = loadHistory();
  const map = new Map<TopicId, HistoryEntry[]>();
  for (const e of list) {
    if (!map.has(e.topic)) map.set(e.topic, []);
    map.get(e.topic)!.push(e);
  }
  return Array.from(map.entries()).map(([topic, items]) => ({ topic, items }));
}

function summarizeQuery(q: string): string {
  const t = q.trim();
  if (t.length <= 60) return t;
  return t.slice(0, 57).trimEnd() + '…';
}

function buildRecallLine(): string | null {
  const list = loadHistory();
  if (!list.length) return null;
  const last = list[0];
  const hours = (Date.now() - last.ts) / 3600000;
  if (hours < 0.05) return null;
  const when = hours < 1 ? "il y a quelques instants"
    : hours < 24 ? `il y a ${Math.round(hours)} h`
    : hours < 24 * 7 ? `il y a ${Math.round(hours / 24)} jour${hours >= 48 ? 's' : ''}`
    : "la dernière fois";
  const topicLbl = TOPIC_LABEL[last.topic]?.label ?? '';
  const topicBit = topicLbl && last.topic !== 'autre' ? ` (sujet : ${topicLbl})` : '';
  return `${when}${topicBit}, vous me demandiez : « ${summarizeQuery(last.q)} ». On reprend là si vous voulez.`;
}

type Msg = { id: string; role: 'user' | 'ai'; text: string; ts: number; recallQuery?: string };

const BCP47: Record<Locale, string> = {
  fr: 'fr-FR', en: 'en-US', fon: 'fr-FR', yor: 'yo-NG', wol: 'fr-FR',
  hau: 'ha-NG', ibo: 'ig-NG', lin: 'ln-CD', bam: 'bm-ML', ful: 'ff-SN',
  dyu: 'fr-FR', sen: 'fr-FR', zar: 'fr-FR',
};

// ----- Moteur déterministe -----
const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ').trim();

const tokenize = (s: string) => norm(s).split(' ').filter((t) => t.length > 1);

// Détection prioritaire d'une demande de SOS : voix, texte, live.
// On accepte « sos » seul, ou n'importe quel verbe d'activation + sos,
// ainsi que les appels au secours explicites.
const SOS_VERB = /(active|activer|declenche|declencher|lance|lancer|demarre|demarrer|met|mets|mettre|envoie|envoyer|appelle|appeler|donne|alerte|alerter|sonne|sonner|fais|faire|start|trigger|fire)/;
export function isSOSRequest(s: string): boolean {
  const n = norm(s);
  if (!n) return false;
  if (/\bsos\b/.test(n)) return true; // « sos » seul ou en composition → priorité absolue
  if (SOS_VERB.test(n) && /\b(urgence|secours|alerte|emergency|help)\b/.test(n)) return true;
  if (/\b(au secours|aidez moi|aide moi|help me|emergency|urgence vitale|urgence medicale)\b/.test(n)) return true;
  return false;
}

type Intent = {
  id: string;
  keywords: { phrase: string; weight: number }[];
  handler: (q: string, tokens: string[], user: CurrentUser) => string;
};

function scoreIntent(intent: Intent, tokens: string[]): number {
  const set = new Set(tokens);
  let score = 0;
  for (const { phrase, weight } of intent.keywords) {
    const parts = norm(phrase).split(' ').filter(Boolean);
    if (parts.every((p) => set.has(p))) score += weight;
  }
  return score;
}

function findCity(tokens: string[]): string | null {
  const cities = Array.from(new Set(CENTERS.map((c) => norm(c.city))));
  for (const t of tokens) if (cities.includes(t)) return CENTERS.find((c) => norm(c.city) === t)!.city;
  return null;
}

function findSpecialty(tokens: string[]): string | null {
  const specs = Array.from(new Set(DOCTORS.map((d) => norm(d.specialty))));
  for (const t of tokens) {
    const hit = specs.find((s) => s.split(' ').includes(t));
    if (hit) return DOCTORS.find((d) => norm(d.specialty) === hit)!.specialty;
  }
  const cats = CATEGORIES.map((c) => norm(c.label));
  for (const t of tokens) {
    const hit = cats.find((c) => c.split(' ').includes(t));
    if (hit) return CATEGORIES.find((c) => norm(c.label) === hit)!.label;
  }
  return null;
}

function profileAnswer(user: CurrentUser): string {
  if (user.account) {
    const a = user.account;
    return [
      `Voici ce que je sais de vous : ${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() + '.',
      a.email ? `Email : ${a.email}.` : '',
      a.phone ? `Téléphone : ${a.phone}.` : '',
      a.dob ? `Date de naissance : ${a.dob}.` : '',
      (a as any).city || (a as any).country ? `Localisation : ${[(a as any).city, (a as any).country].filter(Boolean).join(', ')}.` : '',
      a.bloodType ? `Groupe sanguin : ${a.bloodType}.` : '',
      a.allergies ? `Allergies : ${a.allergies}.` : '',
      a.chronicDiseases ? `Antécédents : ${a.chronicDiseases}.` : '',
      a.insurer ? `Assurance : ${a.insurer}.` : '',
    ].filter(Boolean).join('\n');
  }
  if (user.role === 'pro') return "Vous êtes connecté comme professionnel de santé.";
  if (user.role === 'admin') return "Vous êtes connecté comme administrateur de la plateforme.";
  return "Vous n'êtes pas encore connecté. Ouvrez « Connexion » pour que je puisse vous reconnaître.";
}

// ----- Extracteur de profil santé (dictée libre) -----
type ProfilePatch = Partial<{
  firstName: string; lastName: string; phone: string; email: string;
  address: string; city: string; country: string; dob: string;
  sex: 'F' | 'M'; bloodType: string; height: number; weight: number;
  allergies: string; chronicDiseases: string; insurer: string; policyNumber: string;
  profession: string; emName: string; emRelation: string; emPhone: string;
}>;

const FR_MONTHS: Record<string, string> = {
  janvier: '01', janv: '01', fevrier: '02', fev: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', juil: '07', aout: '08', septembre: '09',
  sept: '09', octobre: '10', oct: '10', novembre: '11', nov: '11', decembre: '12', dec: '12',
};

function parseDob(text: string): string | null {
  const t = text.toLowerCase();
  // 15/05/1990 ou 15-05-1990 ou 15.05.1990
  let m = t.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
  if (m) {
    const d = m[1].padStart(2, '0'); const mo = m[2].padStart(2, '0');
    let y = m[3]; if (y.length === 2) y = (parseInt(y) > 30 ? '19' : '20') + y;
    return `${y}-${mo}-${d}`;
  }
  // 15 mai 1990
  const norm2 = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
  m = norm2.match(/\b(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})\b/);
  if (m && FR_MONTHS[m[2]]) return `${m[3]}-${FR_MONTHS[m[2]]}-${m[1].padStart(2, '0')}`;
  return null;
}

function extractProfilePatch(raw: string): { patch: ProfilePatch; summary: string[] } {
  const patch: ProfilePatch = {};
  const summary: string[] = [];
  const t = raw;
  const lower = t.toLowerCase();
  const norm2 = lower.normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Nom
  let m = t.match(/\b(?:je\s+m['' ]appelle|je\s+suis|mon\s+nom\s+(?:est|c['' ]est)|nom\s*:|prenom\s*:)\s+([A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,60})/i);
  if (m) {
    const parts = m[1].trim().split(/\s+/).filter(Boolean).slice(0, 4);
    if (parts.length >= 1) { patch.firstName = parts[0]; summary.push(`Prénom : ${parts[0]}`); }
    if (parts.length >= 2) { patch.lastName = parts.slice(1).join(' '); summary.push(`Nom : ${patch.lastName}`); }
  }

  // Date de naissance
  if (/(naissance|ne\s+le|nee\s+le|date\s+de\s+naissance)/.test(norm2)) {
    const dob = parseDob(t);
    if (dob) { patch.dob = dob; summary.push(`Date de naissance : ${dob}`); }
  }

  // Sexe / genre
  if (/\b(femme|feminin|fille|madame|mme)\b/.test(norm2)) { patch.sex = 'F'; summary.push('Sexe : F'); }
  else if (/\b(homme|masculin|garcon|monsieur|mr)\b/.test(norm2)) { patch.sex = 'M'; summary.push('Sexe : M'); }

  // Email
  m = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (m) { patch.email = m[0].toLowerCase(); summary.push(`Email : ${patch.email}`); }

  // Téléphone
  m = t.match(/\+?\d[\d\s.\-]{6,18}\d/);
  if (m && /(telephone|tel\b|portable|numero|joindre|mon\s+num)/.test(norm2)) {
    patch.phone = m[0].trim(); summary.push(`Téléphone : ${patch.phone}`);
  }

  // Groupe sanguin
  m = t.match(/\b(A|B|AB|O)\s*[+\-]?\s*(positif|negatif|pos|neg)?\b/i);
  if (m && /(groupe|sanguin|sang)/.test(norm2)) {
    const g = m[1].toUpperCase();
    const rh = m[2] ? (/^(neg|negatif)/i.test(m[2]) ? '-' : '+') : (t.includes('-') ? '-' : '+');
    patch.bloodType = `${g}${rh}`; summary.push(`Groupe sanguin : ${patch.bloodType}`);
  }

  // Taille
  m = norm2.match(/\b(?:je\s+mesure|taille|mesure)\s*(?:de\s+|:|=)?\s*(\d{2,3})\s*(?:cm|centim|m\b)?/);
  if (m) {
    let v = parseInt(m[1]); if (v < 3) v = Math.round(v * 100);
    if (v >= 50 && v <= 230) { patch.height = v; summary.push(`Taille : ${v} cm`); }
  }

  // Poids
  m = norm2.match(/\b(?:je\s+pese|poids|pese)\s*(?:de\s+|:|=)?\s*(\d{2,3})\s*(?:kg|kilo)?/);
  if (m) {
    const v = parseInt(m[1]);
    if (v >= 20 && v <= 300) { patch.weight = v; summary.push(`Poids : ${v} kg`); }
  }

  // Ville / pays
  m = t.match(/\b(?:j['' ]habite(?:\s+a)?|je\s+vis\s+a|je\s+reside\s+a|ville\s*:?)\s+([A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,40})/i);
  if (m) {
    const v = m[1].trim().split(/[,.]/)[0].trim();
    patch.city = v; summary.push(`Ville : ${v}`);
  }

  // Adresse
  m = t.match(/\b(?:adresse|j['' ]habite\s+au?)\s*:?\s+([^\n.,;]{4,80})/i);
  if (m && !patch.city) { patch.address = m[1].trim(); summary.push(`Adresse : ${patch.address}`); }

  // Allergies
  m = t.match(/\b(?:allergi(?:e|que|es))\s*(?:a|au|aux|:)?\s*([^\n.;]{2,80})/i);
  if (m) { patch.allergies = m[1].trim(); summary.push(`Allergies : ${patch.allergies}`); }

  // Antécédents / maladies chroniques
  m = t.match(/\b(?:antecedents?|maladies?\s+chroniques?|chronique[s]?|je\s+suis\s+(?:hypertendu|diabetique|asthmatique))\s*(?:de|:)?\s*([^\n.;]{2,80})?/i);
  if (m) {
    let v = (m[1] || '').trim();
    if (!v) {
      if (/hypertendu/i.test(t)) v = 'Hypertension';
      else if (/diabetique/i.test(t)) v = 'Diabète';
      else if (/asthmatique/i.test(t)) v = 'Asthme';
    }
    if (v) { patch.chronicDiseases = v; summary.push(`Antécédents : ${v}`); }
  }

  // Assurance
  m = t.match(/\b(?:assurance|assureur|mutuelle)\s*(?::|est|c['' ]est)?\s*([A-Za-z0-9À-ÖØ-öø-ÿ &'\-]{2,60})/i);
  if (m) { patch.insurer = m[1].trim(); summary.push(`Assurance : ${patch.insurer}`); }

  // Profession
  m = t.match(/\b(?:profession|metier|je\s+travaille\s+comme|je\s+suis)\s+([A-Za-zÀ-ÖØ-öø-ÿ'\- ]{3,50})/i);
  if (m && !patch.firstName) {
    const v = m[1].trim().split(/[,.]/)[0].trim();
    if (!/^(?:un|une|le|la|les|en|de|du)\b/i.test(v)) {
      patch.profession = v; summary.push(`Profession : ${v}`);
    }
  }

  // Contact d'urgence : "en cas d'urgence : Koffi, époux, +229..."
  m = t.match(/\b(?:urgence|contact\s+d['' ]urgence|en\s+cas\s+d['' ]urgence)\s*:?\s*([^\n;]{3,120})/i);
  if (m) {
    const seg = m[1];
    const tel = seg.match(/\+?\d[\d\s.\-]{6,18}\d/);
    if (tel) { patch.emPhone = tel[0].trim(); summary.push(`Urgence (tél.) : ${patch.emPhone}`); }
    const before = tel ? seg.slice(0, seg.indexOf(tel[0])) : seg;
    const parts = before.split(/[,/]/).map((x) => x.trim()).filter(Boolean);
    if (parts[0]) { patch.emName = parts[0]; summary.push(`Urgence (nom) : ${parts[0]}`); }
    if (parts[1]) { patch.emRelation = parts[1]; summary.push(`Urgence (lien) : ${parts[1]}`); }
  }

  return { patch, summary };
}

async function applyProfilePatch(accountId: string | undefined, patch: ProfilePatch): Promise<{ ok: boolean; localOk: boolean; backendOk: boolean; error?: string }> {
  let localOk = false;
  let backendOk = false;
  let error: string | undefined;
  try {
    const accountsMod = await import('./accounts');
    const { updateAccount, getCurrentAccount, ensureBackendPatient } = accountsMod;
    // 1) Mise à jour locale — on retombe sur le compte courant si l'id n'a pas été passé.
    let id = accountId;
    if (!id) {
      const cur = getCurrentAccount();
      id = cur?.id;
    }
    if (id) {
      updateAccount(id, patch as any);
      localOk = true;
    }
    // 2) Mise à jour backend — on s'assure d'avoir un patientId, on le crée sinon.
    let pid: string | null = null;
    try { pid = localStorage.getItem('healthy-page:patientId'); } catch {}
    if (!pid && id) {
      pid = await ensureBackendPatient(id);
    }
    if (pid) {
      const { api } = await import('./api');
      const payload: any = { ...patch };
      if (patch.sex) payload.gender = patch.sex;
      if (patch.bloodType) payload.blood = patch.bloodType;
      if (patch.emName || patch.emPhone || patch.emRelation) {
        payload.emergency = { name: patch.emName ?? '', relation: patch.emRelation ?? '', phone: patch.emPhone ?? '' };
      }
      await api.updatePatient(pid, payload);
      backendOk = true;
    }
    try { window.dispatchEvent(new CustomEvent('hp:profile:updated')); } catch {}
  } catch (e: any) {
    error = e?.message ?? String(e);
    console.warn('applyProfilePatch failed', e);
  }
  return { ok: localOk || backendOk, localOk, backendOk, error };
}

const INTENTS: Intent[] = [
  {
    id: 'fill_profile',
    keywords: [
      { phrase: 'remplir profil', weight: 10 }, { phrase: 'remplis profil', weight: 10 },
      { phrase: 'completer profil', weight: 10 }, { phrase: 'complete profil', weight: 9 },
      { phrase: 'mettre a jour profil', weight: 9 }, { phrase: 'mes infos', weight: 6 },
      { phrase: 'mes informations', weight: 7 }, { phrase: 'profil sante', weight: 8 },
      { phrase: 'enregistre profil', weight: 9 }, { phrase: 'sauvegarde profil', weight: 9 },
      { phrase: 'note mes infos', weight: 8 }, { phrase: 'voici mes infos', weight: 8 },
      { phrase: 'je m appelle', weight: 4 }, { phrase: 'mon nom', weight: 3 },
      { phrase: 'date de naissance', weight: 5 }, { phrase: 'groupe sanguin', weight: 6 },
      { phrase: 'je pese', weight: 5 }, { phrase: 'je mesure', weight: 5 },
      { phrase: 'allergique', weight: 5 }, { phrase: 'allergies', weight: 5 },
      { phrase: 'mon assurance', weight: 5 }, { phrase: 'contact urgence', weight: 6 },
    ],
    handler: (q, _t, u) => {
      const { patch, summary } = extractProfilePatch(q);
      if (summary.length === 0) {
        return [
          "Avec plaisir, je peux remplir votre profil santé pendant que vous me parlez.",
          "Dites-moi simplement vos informations, par exemple :",
          "1. « Je m'appelle Aïcha Adjovi, née le 15 mai 1992. »",
          "2. « Groupe sanguin O+, je pèse 64 kg, je mesure 168 cm. »",
          "3. « J'habite à Cotonou, allergique à la pénicilline. »",
          "4. « Mon assurance est NSIA, contact d'urgence : Koffi, époux, +229 01 96 88 21 03. »",
          "Je sauvegarde tout dans votre profil au fur et à mesure.",
        ].join('\n');
      }
      if (!u.account) {
        return [
          "Je peux noter ces informations, mais aucun compte patient n'est connecté.",
          "Connectez-vous (ou créez votre compte) puis redictez vos informations — je les enregistrerai automatiquement dans votre profil santé.",
        ].join('\n');
      }
      // Application asynchrone — le résultat sera annoncé via l'événement profil mis à jour ou erreur.
      applyProfilePatch(u.account.id, patch).then((res) => {
        try {
          if (res.ok) {
            window.dispatchEvent(new CustomEvent('hp:ai:profile:saved', { detail: { localOk: res.localOk, backendOk: res.backendOk } }));
          } else {
            window.dispatchEvent(new CustomEvent('hp:ai:profile:error', { detail: { error: res.error ?? 'inconnu' } }));
          }
        } catch {}
      });
      return [
        "C'est noté, j'enregistre dans votre profil santé :",
        ...summary.map((s, i) => `${i + 1}. ${s}`),
        "",
        "Vous pouvez continuer à me dicter d'autres informations, ou ouvrir « modifier profil » pour vérifier.",
      ].join('\n');
    },
  },
  {
    id: 'greet',
    keywords: [
      { phrase: 'bonjour', weight: 5 }, { phrase: 'salut', weight: 5 },
      { phrase: 'hello', weight: 5 }, { phrase: 'bonsoir', weight: 5 },
      { phrase: 'coucou', weight: 4 }, { phrase: 'hi', weight: 3 },
      { phrase: 'ca va', weight: 4 }, { phrase: 'comment vas tu', weight: 6 },
    ],
    handler: (_q, _t, u) => `${buildGreeting(u)} Comment puis-je vous être utile aujourd'hui ?`,
  },
  {
    id: 'thanks',
    keywords: [{ phrase: 'merci', weight: 6 }, { phrase: 'thanks', weight: 5 }],
    handler: (_q, _t, u) => `Avec grand plaisir ${u.greetingName}. Y a-t-il autre chose que je puisse faire pour vous ?`,
  },
  {
    id: 'identity',
    keywords: [
      { phrase: 'qui suis je', weight: 10 }, { phrase: 'mon nom', weight: 8 },
      { phrase: 'mon prenom', weight: 8 }, { phrase: 'mon profil', weight: 7 },
      { phrase: 'mes infos', weight: 7 }, { phrase: 'mon compte', weight: 6 },
      { phrase: 'mes donnees', weight: 5 }, { phrase: 'me reconnais', weight: 8 },
    ],
    handler: (_q, _t, u) => profileAnswer(u),
  },
  {
    id: 'capabilities',
    keywords: [
      { phrase: 'que peux tu faire', weight: 10 }, { phrase: 'aide', weight: 4 },
      { phrase: 'help', weight: 5 }, { phrase: 'tes capacites', weight: 8 },
      { phrase: 'fonctionnalites', weight: 6 },
    ],
    handler: () =>
      "Je peux vous accompagner sur :\n• Centres de santé (par ville, type, note)\n• Médecins et spécialistes\n• Podcasts et émissions Healthy Page\n• Rendez-vous, téléconsultation, carnet de santé\n• Bien-être : nutrition, sommeil, stress, yoga\n• Voyage santé et retraites bien-être\n• Jeux santé et mini-jeux\n• Assistance juridique santé\n• Urgences, SOS, triage\n• Votre profil et préférences",
  },
  {
    id: 'centers',
    keywords: [
      { phrase: 'centre', weight: 6 }, { phrase: 'centres', weight: 6 },
      { phrase: 'hopital', weight: 6 }, { phrase: 'clinique', weight: 6 },
      { phrase: 'pharmacie', weight: 6 }, { phrase: 'maternite', weight: 6 },
      { phrase: 'etablissement', weight: 5 },
    ],
    handler: (_q, tokens) => {
      const city = findCity(tokens);
      const wantsCount = tokens.includes('combien') || tokens.includes('nombre');
      const list = city ? CENTERS.filter((c) => norm(c.city) === norm(city)) : CENTERS;
      if (wantsCount) {
        return city
          ? `${list.length} centre(s) référencé(s) à ${city}.`
          : `La plateforme référence ${CENTERS.length} centres répartis sur ${new Set(CENTERS.map((c) => c.city)).size} villes.`;
      }
      const top = list.slice(0, 5).map((c) => `• ${c.name} — ${c.type}, ${c.city} (${c.rating}/5, ${c.reviews} avis)`).join('\n');
      const head = city ? `${list.length} centre(s) à ${city} :` : `${CENTERS.length} centres référencés. Top 5 :`;
      return `${head}\n${top}`;
    },
  },
  {
    id: 'doctors',
    keywords: [
      { phrase: 'medecin', weight: 6 }, { phrase: 'medecins', weight: 6 },
      { phrase: 'docteur', weight: 6 }, { phrase: 'praticien', weight: 5 },
      { phrase: 'specialiste', weight: 6 }, { phrase: 'specialite', weight: 5 },
      { phrase: 'consulter', weight: 3 },
    ],
    handler: (_q, tokens) => {
      const city = findCity(tokens);
      const spec = findSpecialty(tokens);
      let list = DOCTORS;
      if (city) list = list.filter((d) => norm(d.city) === norm(city));
      if (spec) list = list.filter((d) => d.specialty === spec || d.category === spec);
      if (tokens.includes('combien') || tokens.includes('nombre')) {
        const tag = [spec, city && `à ${city}`].filter(Boolean).join(' ');
        return `${list.length} praticien(s) ${tag || 'au total'}.`;
      }
      const top = list.slice(0, 5).map((d) =>
        `• Dr ${d.firstName} ${d.lastName} — ${d.specialty}, ${d.city} (${d.rating}/5, ${d.consultationFee} FCFA)`
      ).join('\n');
      const filterDesc = [spec, city].filter(Boolean).join(' à ');
      const head = filterDesc ? `${list.length} praticien(s) (${filterDesc}) :` : `${DOCTORS.length} praticiens dans ${CATEGORIES.length} catégories. Échantillon :`;
      return list.length ? `${head}\n${top}` : `Aucun praticien trouvé pour ${filterDesc}.`;
    },
  },
  {
    id: 'podcasts',
    keywords: [
      { phrase: 'podcast', weight: 7 }, { phrase: 'podcasts', weight: 7 },
      { phrase: 'episode', weight: 6 }, { phrase: 'episodes', weight: 6 },
      { phrase: 'ecouter', weight: 4 }, { phrase: 'audio', weight: 4 },
    ],
    handler: (_q, tokens) => {
      const topic = tokens.find((t) => ['nutrition','sommeil','mental','stress','maternite','prevention','sport','enfant','femme'].includes(t));
      let list = PODCAST_EPISODES;
      if (topic) list = list.filter((e) => norm(e.cat).includes(topic) || norm(e.title).includes(topic) || norm(e.desc).includes(topic));
      if (tokens.includes('combien')) return topic ? `${list.length} épisode(s) sur « ${topic} ».` : `${PODCAST_EPISODES.length} épisodes disponibles.`;
      const top = list.slice(0, 4).map((e) => `• ${e.title} — ${e.host} (${e.duration})`).join('\n');
      return list.length ? `${list.length} épisode(s)${topic ? ` sur « ${topic} »` : ''} :\n${top}` : `Aucun épisode sur ce thème.`;
    },
  },
  {
    id: 'voyage',
    keywords: [
      { phrase: 'voyage', weight: 8 }, { phrase: 'retraite', weight: 7 },
      { phrase: 'sejour', weight: 7 }, { phrase: 'destination', weight: 6 },
      { phrase: 'vacances', weight: 5 },
    ],
    handler: () =>
      "Voyage & retraites bien-être : 9 destinations africaines, 4 formules (Découverte, Confort, Premium, Signature), retraites yoga, médecine douce et thalasso. Préparation médicale incluse. Ouvrez l'onglet Voyage.",
  },
  {
    id: 'suggest_place',
    keywords: [
      { phrase: 'suggere', weight: 8 }, { phrase: 'suggerer', weight: 8 },
      { phrase: 'recommande', weight: 8 }, { phrase: 'recommander', weight: 8 },
      { phrase: 'conseille', weight: 7 }, { phrase: 'propose', weight: 6 },
      { phrase: 'lieu', weight: 6 }, { phrase: 'lieux', weight: 6 },
      { phrase: 'endroit', weight: 6 }, { phrase: 'endroits', weight: 6 },
      { phrase: 'ou aller', weight: 9 }, { phrase: 'idee', weight: 5 },
      { phrase: 'que visiter', weight: 8 },
    ],
    handler: (_q, _t, u) => {
      const opener = pick([
        `Avec plaisir, voici quelques pépites que je vous conseille`,
        `Volontiers ${u.greetingName}, j'ai trois belles idées pour vous`,
        `Bien sûr, laissez-moi vous suggérer`,
      ]);
      return `${opener} :\n• Saly & la Petite Côte au Sénégal — plages, thalasso, soins du corps en bord de mer.\n• Lompoul & le Lac Rose — méditation, dunes orangées, retraite silencieuse de 5 jours.\n• Ouidah & Grand-Popo au Bénin — patrimoine vaudou, balades atlantiques, ressourcement culturel.\nDites-moi votre humeur (mer, désert, culture, yoga…) et j'affine la sélection.`;
    },
  },
  {
    id: 'games',
    keywords: [
      { phrase: 'jeu', weight: 7 }, { phrase: 'jeux', weight: 7 },
      { phrase: 'quiz', weight: 6 }, { phrase: 'mini jeu', weight: 8 },
    ],
    handler: () =>
      "Jeux santé : quizz éducatifs, parcours d'entraînement, et 3 mini-jeux — Memory santé, Réflexes, Respiration guidée. Ouvrez l'onglet Jeux.",
  },
  {
    id: 'legal',
    keywords: [
      { phrase: 'juridique', weight: 8 }, { phrase: 'avocat', weight: 7 },
      { phrase: 'sinistre', weight: 7 }, { phrase: 'erreur medicale', weight: 9 },
      { phrase: 'litige', weight: 6 },
    ],
    handler: () =>
      "Assistance juridique santé : 9 domaines (erreur médicale, effet indésirable, refus de soin, litige assurance, etc.). 3 formules : Essentiel, Famille+, Premium. Demandez « se faire accompagner par un expert » ou « évaluer ma situation ».",
  },
  {
    id: 'appointments',
    keywords: [
      { phrase: 'rendez vous', weight: 9 }, { phrase: 'rdv', weight: 8 },
      { phrase: 'consultation', weight: 6 }, { phrase: 'reserver', weight: 5 },
      { phrase: 'teleconsultation', weight: 7 },
    ],
    handler: () =>
      "Vos rendez-vous : « Mes RDV » pour consulter et annuler · « RDV » pour en créer · « Téléconsultation » pour le distanciel. Confirmation et rappel automatiques.",
  },
  {
    id: 'wellness',
    keywords: [
      { phrase: 'bien etre', weight: 8 }, { phrase: 'nutrition', weight: 6 },
      { phrase: 'sommeil', weight: 6 }, { phrase: 'stress', weight: 6 },
      { phrase: 'yoga', weight: 6 }, { phrase: 'respiration', weight: 6 },
      { phrase: 'meditation', weight: 5 },
    ],
    handler: (_q, tokens) => {
      const map: Record<string, string> = {
        nutrition: "Nutrition : conseils, recettes locales, plans de repas équilibrés.",
        sommeil: "Sommeil : routines apaisantes, suivi des cycles, exercices de relaxation.",
        stress: "Stress : cohérence cardiaque, méditations guidées, journal d'humeur.",
        yoga: "Yoga : séances par durée et niveau, mode hors-ligne disponible.",
        respiration: "Respiration : carré, cohérence cardiaque, abeille — guidée à la voix.",
      };
      const hit = tokens.find((t) => t in map);
      return hit ? map[hit] : "Bien-être : Nutrition · Sommeil · Activité · Stress · Respiration · Yoga.";
    },
  },
  {
    id: 'emergency',
    keywords: [
      { phrase: 'urgence', weight: 9 }, { phrase: 'urgences', weight: 9 },
      { phrase: 'sos', weight: 9 }, { phrase: 'secours', weight: 7 },
      { phrase: 'symptome', weight: 5 }, { phrase: 'triage', weight: 7 },
    ],
    handler: () =>
      "Urgences : bouton SOS rouge envoie votre position GPS à votre contact d'urgence. Le triage évalue la gravité. En danger vital, appelez d'abord les services locaux.",
  },
  {
    id: 'records',
    keywords: [
      { phrase: 'carnet', weight: 8 }, { phrase: 'dossier', weight: 6 },
      { phrase: 'examen', weight: 6 }, { phrase: 'ordonnance', weight: 7 },
      { phrase: 'medicament', weight: 6 }, { phrase: 'traitement', weight: 6 },
    ],
    handler: () =>
      "Carnet de santé : examens, ordonnances, traitements, antécédents, allergies, alertes. Tout dans l'onglet Carnet.",
  },
  {
    id: 'languages',
    keywords: [
      { phrase: 'langue', weight: 7 }, { phrase: 'langues', weight: 7 },
      { phrase: 'traduction', weight: 6 }, { phrase: 'traduire', weight: 6 },
    ],
    handler: () =>
      "13 langues disponibles : français, anglais, fon, yoruba, wolof, haoussa, igbo, lingala, bambara, peul, dioula, sénoufo, djerma. Toute la plateforme se traduit automatiquement.",
  },
  {
    id: 'account',
    keywords: [
      { phrase: 'profil', weight: 6 }, { phrase: 'compte', weight: 5 },
      { phrase: 'parametre', weight: 6 }, { phrase: 'parametres', weight: 6 },
      { phrase: 'connexion', weight: 6 }, { phrase: 'biometrie', weight: 7 },
    ],
    handler: () =>
      "Connexion universelle : email, Google, téléphone+OTP, biométrie, QR cross-device. Profil et paramètres modifiables à tout moment.",
  },
];

const SUGGESTIONS = "Essayez : « ouvre mes rendez-vous », « va au carnet de santé », « passe en anglais », « lance le SOS », « combien de médecins à Cotonou »";

// ---------- Parsing booking voyage depuis la voix ----------
const VOYAGE_LIEUX: { id: string; aliases: string[] }[] = [
  { id: 'saly-renaissance', aliases: ['saly', 'saly renaissance', 'petite cote'] },
  { id: 'casamance-zen', aliases: ['casamance', 'casamance zen', 'cap skirring', 'ziguinchor'] },
  { id: 'lompoul-desert', aliases: ['lompoul', 'lompoul desert', 'dune'] },
  { id: 'saint-louis-fleuve', aliases: ['saint louis', 'saint louis fleuve', 'st louis'] },
  { id: 'goree-respire', aliases: ['goree', 'ile de goree', 'ile goree'] },
  { id: 'marrakech-medina', aliases: ['marrakech', 'marrakech medina', 'medina', 'riad'] },
  { id: 'essaouira-souffle', aliases: ['essaouira', 'essaouira souffle', 'mogador'] },
  { id: 'desert-sahara', aliases: ['sahara', 'desert sahara', 'desert merzouga', 'merzouga'] },
  { id: 'zanzibar-stone', aliases: ['zanzibar', 'stone town', 'zanzibar stone'] },
  { id: 'lamu-island', aliases: ['lamu', 'lamu island'] },
  { id: 'cape-town-mountain', aliases: ['cape town', 'le cap', 'cape town mountain'] },
  { id: 'lalibela-altitude', aliases: ['lalibela', 'lalibela altitude', 'ethiopie'] },
];

const FRENCH_NUMBERS: Record<string, number> = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15,
  one: 1, two: 2, three: 3, four: 4, five: 5, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
};

function parseNumber(token: string): number | null {
  const n = parseInt(token, 10);
  if (!Number.isNaN(n) && n > 0) return n;
  if (token in FRENCH_NUMBERS) return FRENCH_NUMBERS[token];
  return null;
}

function findLieuFromText(rawNorm: string): string | null {
  for (const l of VOYAGE_LIEUX) {
    for (const a of l.aliases) {
      if (rawNorm.includes(a)) return l.id;
    }
  }
  return null;
}

const MONTHS_FR: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6,
  aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11,
  // Anglais
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
  may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7,
  september: 8, sep: 8, sept: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
  // Yoruba (translittération sans tons)
  serere: 0, erele: 1, erena: 2, igbe: 3, ebibi: 4, okudu: 5, agemo: 6, ogun: 7,
  owewe: 8, owara: 9, belu: 10, ope: 11,
  // Wolof courant — emprunts français déjà couverts (jánwiye, féwriye, etc.)
  janwiye: 0, fewriye: 1, marsa: 2, awril: 3, mee: 4, suwen: 5, sulet: 6,
  ut: 7, septembar: 8, oktoobar: 9, nowembar: 10, desembar: 11,
  // Fon — emprunts français usuels
  zanvie: 0, fevirie: 1, mawu: 2,
};

const WEEKDAYS_FR: Record<string, number> = {
  dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6,
  // Anglais
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5, saturday: 6, sat: 6,
  // Yoruba (translittération sans tons)
  aiku: 0, aje: 1, isegun: 2, ojoru: 3, ojobo: 4, eti: 5, abameta: 6,
  // Wolof
  dibeer: 0, altine: 1, talaata: 2, allarba: 3, alxames: 4, ajjuma: 5, gaawu: 6,
  // Fon (translittération usuelle)
  aklunigbe: 0, tenigbe: 1, talatagbe: 2, azangbe: 3, lamisigbe: 4, axosugbe: 5, sibigbe: 6,
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextWeekday(target: number, fromNext = false): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const cur = d.getDay();
  let delta = (target - cur + 7) % 7;
  if (delta === 0) delta = 7;
  if (fromNext) delta += 7;
  d.setDate(d.getDate() + delta);
  return d;
}

// Parse les expressions de dates en français → { startISO, endISO?, nights? }
function parseDates(rawNorm: string): { startISO?: string; endISO?: string; nights?: number } {
  const out: { startISO?: string; endISO?: string; nights?: number } = {};

  // « du 12 au 17 juin » / « from June 12 to 17 » / « from 12 to 17 june »
  const rangeMonthEn = rawNorm.match(/from\s+([a-z]+)\s+(\d{1,2})\s+(?:to|until|till|through)\s+(?:([a-z]+)\s+)?(\d{1,2})/);
  if (rangeMonthEn && MONTHS_FR[rangeMonthEn[1]] != null) {
    const m1 = MONTHS_FR[rangeMonthEn[1]];
    const d1 = parseInt(rangeMonthEn[2], 10);
    const m2 = rangeMonthEn[3] && MONTHS_FR[rangeMonthEn[3]] != null ? MONTHS_FR[rangeMonthEn[3]] : m1;
    const d2 = parseInt(rangeMonthEn[4], 10);
    const today = new Date();
    const start = new Date(today.getFullYear(), m1, d1, 12, 0, 0, 0);
    if (start < today) start.setFullYear(today.getFullYear() + 1);
    const end = new Date(start.getFullYear(), m2, d2, 12, 0, 0, 0);
    if (end < start) end.setFullYear(end.getFullYear() + 1);
    out.startISO = toISODate(start);
    out.endISO = toISODate(end);
    return out;
  }

  // « du 12 au 17 juin » / « du 12 juin au 17 juin » / « du 12/06 au 17/06 »
  const rangeMonth = rawNorm.match(/du\s+(\d{1,2})(?:\s+([a-zéû]+))?\s+au\s+(\d{1,2})\s+([a-zéû]+)/);
  if (rangeMonth) {
    const d1 = parseInt(rangeMonth[1], 10);
    const m1Name = rangeMonth[2];
    const d2 = parseInt(rangeMonth[3], 10);
    const m2Name = rangeMonth[4];
    const m2 = MONTHS_FR[m2Name];
    const m1 = m1Name && MONTHS_FR[m1Name] != null ? MONTHS_FR[m1Name] : m2;
    if (m1 != null && m2 != null) {
      const today = new Date();
      let y = today.getFullYear();
      const start = new Date(y, m1, d1, 12, 0, 0, 0);
      if (start < today) start.setFullYear(y + 1);
      const end = new Date(start.getFullYear(), m2, d2, 12, 0, 0, 0);
      if (end < start) end.setFullYear(end.getFullYear() + 1);
      out.startISO = toISODate(start);
      out.endISO = toISODate(end);
      return out;
    }
  }

  // « du 12/06 au 17/06 » format numérique
  const rangeNum = rawNorm.match(/du\s+(\d{1,2})[\/\-](\d{1,2})\s+au\s+(\d{1,2})[\/\-](\d{1,2})/);
  if (rangeNum) {
    const d1 = parseInt(rangeNum[1], 10), m1 = parseInt(rangeNum[2], 10) - 1;
    const d2 = parseInt(rangeNum[3], 10), m2 = parseInt(rangeNum[4], 10) - 1;
    const today = new Date();
    let y = today.getFullYear();
    const start = new Date(y, m1, d1, 12, 0, 0, 0);
    if (start < today) start.setFullYear(y + 1);
    const end = new Date(start.getFullYear(), m2, d2, 12, 0, 0, 0);
    if (end < start) end.setFullYear(end.getFullYear() + 1);
    out.startISO = toISODate(start);
    out.endISO = toISODate(end);
    return out;
  }

  // « le 12 juin » / « 12 juin » / « june 12 » / « on june 12 »
  const single = rawNorm.match(/(?:le\s+|on\s+)?(\d{1,2})\s+([a-zéû]+)/);
  if (single && MONTHS_FR[single[2]] != null) {
    const d = parseInt(single[1], 10);
    const m = MONTHS_FR[single[2]];
    const today = new Date();
    const start = new Date(today.getFullYear(), m, d, 12, 0, 0, 0);
    if (start < today) start.setFullYear(today.getFullYear() + 1);
    out.startISO = toISODate(start);
    return out;
  }
  const singleEn = rawNorm.match(/(?:on\s+)?([a-z]+)\s+(\d{1,2})/);
  if (singleEn && MONTHS_FR[singleEn[1]] != null) {
    const m = MONTHS_FR[singleEn[1]];
    const d = parseInt(singleEn[2], 10);
    const today = new Date();
    const start = new Date(today.getFullYear(), m, d, 12, 0, 0, 0);
    if (start < today) start.setFullYear(today.getFullYear() + 1);
    out.startISO = toISODate(start);
    return out;
  }

  // « vendredi prochain » / « next friday »
  const wkNext = rawNorm.match(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+(?:prochain|prochaine)\b/);
  if (wkNext) {
    out.startISO = toISODate(nextWeekday(WEEKDAYS_FR[wkNext[1]], true));
    return out;
  }
  const wkNextEn = rawNorm.match(/\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\b/);
  if (wkNextEn) {
    out.startISO = toISODate(nextWeekday(WEEKDAYS_FR[wkNextEn[1]], true));
    return out;
  }

  // « ce vendredi » / « samedi » / « this saturday » / « on friday »
  const wkSimple = rawNorm.match(/\b(?:ce\s+|this\s+|on\s+)?(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (wkSimple) {
    out.startISO = toISODate(nextWeekday(WEEKDAYS_FR[wkSimple[1]], false));
    return out;
  }

  // Demain / aujourd'hui / week-end / tomorrow / today / weekend
  if (/\bdemain\b|\btomorrow\b/.test(rawNorm)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    out.startISO = toISODate(d);
    return out;
  }
  if (/\baujourd['\s]hui\b|\btoday\b|\btonight\b/.test(rawNorm)) {
    out.startISO = toISODate(new Date());
    return out;
  }
  if (/\bapres[\s-]?demain\b|\bday\s+after\s+tomorrow\b/.test(rawNorm)) {
    const d = new Date(); d.setDate(d.getDate() + 2);
    out.startISO = toISODate(d);
    return out;
  }
  if (/\bce\s+week[\s-]?end\b|\bweekend\b|\bthis\s+weekend\b/.test(rawNorm)) {
    out.startISO = toISODate(nextWeekday(6, false));
    out.nights = 2;
    return out;
  }
  if (/\bnext\s+weekend\b|\bweek[\s-]?end\s+prochain\b/.test(rawNorm)) {
    out.startISO = toISODate(nextWeekday(6, true));
    out.nights = 2;
    return out;
  }

  return out;
}

function parseBooking(rawNorm: string): { lieuId: string; nights?: number; adults?: number; children?: number; rooms?: number; startISO?: string; endISO?: string } | null {
  const lieuId = findLieuFromText(rawNorm);
  if (!lieuId) return null;
  const tokens = rawNorm.split(/\s+/);
  let nights: number | undefined;
  let adults: number | undefined;
  let children: number | undefined;
  let rooms: number | undefined;
  for (let i = 0; i < tokens.length - 1; i++) {
    const n = parseNumber(tokens[i]);
    if (n == null) continue;
    const next = tokens[i + 1];
    const next2 = tokens[i + 2] || '';
    if (/^nuit|^night/.test(next)) nights = n;
    else if (/^adulte|^adult/.test(next) || ((next === 'pour' || next === 'for') && /^adulte|^adult/.test(next2))) adults = n;
    else if (/^enfant|^kid|^child/.test(next) || ((next === 'pour' || next === 'for') && /^enfant|^kid|^child/.test(next2))) children = n;
    else if (/^chambre|^piece|^room/.test(next)) rooms = n;
    else if (/^personne|^voyageur|^pax|^people|^guest/.test(next)) adults = n;
  }
  const dates = parseDates(rawNorm);
  return { lieuId, nights: nights ?? dates.nights, adults, children, rooms, startISO: dates.startISO, endISO: dates.endISO };
}

// ---------- Registre d'actions exécutables ----------
type ActionContext = {
  navigate: (path: string) => void;
  setLocale: (l: Locale) => void;
  user: CurrentUser;
};
type Action = {
  id: string;
  triggers: string[];          // phrases déclencheurs (tokens normalisés, AND)
  description: string;         // ce que l'IA répond
  exec: (ctx: ActionContext, q: string) => string | void;
};

const ACTIONS: Action[] = [
  // Navigation patient
  { id: 'open_home', triggers: ['accueil', 'home'], description: "J'ouvre l'accueil patient.",
    exec: ({ navigate }) => { navigate('/patient/home'); } },
  { id: 'open_mesrdv', triggers: ['mes rdv'], description: "J'ouvre vos rendez-vous.",
    exec: ({ navigate }) => { navigate('/patient/mesrdv'); } },
  { id: 'open_rdv', triggers: ['prendre rendez vous'], description: "Je vous emmène prendre un rendez-vous.",
    exec: ({ navigate }) => { navigate('/patient/rdv'); } },
  { id: 'open_teleconsultation', triggers: ['teleconsultation'], description: "J'ouvre la téléconsultation.",
    exec: ({ navigate }) => { navigate('/patient/teleconsultation'); } },
  { id: 'open_carnet', triggers: ['carnet'], description: "J'ouvre votre carnet de santé.",
    exec: ({ navigate }) => { navigate('/patient/carnet'); } },
  { id: 'open_examens', triggers: ['examens'], description: "J'ouvre vos examens.",
    exec: ({ navigate }) => { navigate('/patient/examens'); } },
  { id: 'open_medicaments', triggers: ['medicaments'], description: "J'ouvre vos médicaments.",
    exec: ({ navigate }) => { navigate('/patient/medicaments'); } },
  { id: 'open_traitements', triggers: ['traitements'], description: "J'ouvre vos traitements.",
    exec: ({ navigate }) => { navigate('/patient/traitements'); } },
  { id: 'open_ordonnance', triggers: ['ordonnance'], description: "J'ouvre vos ordonnances.",
    exec: ({ navigate }) => { navigate('/patient/medicaments'); } },
  { id: 'open_profil', triggers: ['profil'], description: "J'ouvre votre profil.",
    exec: ({ navigate }) => { navigate('/patient/profile'); } },
  { id: 'open_parametres', triggers: ['parametres'], description: "J'ouvre les paramètres.",
    exec: ({ navigate }) => { navigate('/patient/parametres'); } },
  { id: 'open_alertes', triggers: ['alertes'], description: "J'ouvre vos alertes médicales.",
    exec: ({ navigate }) => { navigate('/patient/alertes'); } },
  { id: 'open_specialistes', triggers: ['specialistes'], description: "J'ouvre les spécialistes.",
    exec: ({ navigate }) => { navigate('/patient/specialistes'); } },
  { id: 'open_medecins', triggers: ['medecins'], description: "J'ouvre la liste des médecins.",
    exec: ({ navigate }) => { navigate('/patient/medecins'); } },
  { id: 'open_carte', triggers: [
      'carte', 'la carte', 'ouvre la carte', 'ouvrir la carte', 'voir la carte', 'consulter la carte',
      'map', 'la map', 'ouvre la map', 'ouvrir la map', 'voir la map', 'consulter la map',
      'carte sante', 'carte des centres', 'centres proches', 'centres autour', 'centre de sante proche',
      'centres de sante', 'hopitaux proches', 'cliniques proches', 'pharmacies autour',
      'localiser un centre', 'trouver un centre', 'ou est le centre', 'plan des centres',
    ], description: "J'ouvre la carte des centres de santé.",
    exec: ({ navigate }) => { navigate('/patient/carte'); } },
  { id: 'open_pharmacie', triggers: ['pharmacie'], description: "J'ouvre la pharmacie.",
    exec: ({ navigate }) => { navigate('/patient/pharmacie'); } },
  { id: 'open_bienetre', triggers: ['bien etre'], description: "J'ouvre l'espace Bien-être.",
    exec: ({ navigate }) => { navigate('/patient/bienetre'); } },
  { id: 'open_nutrition', triggers: ['nutrition'], description: "J'ouvre Nutrition.",
    exec: ({ navigate }) => { navigate('/patient/nutrition'); } },
  { id: 'open_sommeil', triggers: ['sommeil'], description: "J'ouvre Sommeil.",
    exec: ({ navigate }) => { navigate('/patient/sommeil'); } },
  { id: 'open_yoga', triggers: ['yoga'], description: "J'ouvre Yoga.",
    exec: ({ navigate }) => { navigate('/patient/yoga'); } },
  { id: 'open_respiration', triggers: ['respiration'], description: "J'ouvre les exercices de respiration.",
    exec: ({ navigate }) => { navigate('/patient/respiration'); } },
  { id: 'open_stress', triggers: ['stress'], description: "J'ouvre Gestion du stress.",
    exec: ({ navigate }) => { navigate('/patient/stress'); } },
  { id: 'open_activite', triggers: ['activite'], description: "J'ouvre Activité physique.",
    exec: ({ navigate }) => { navigate('/patient/activite'); } },
  { id: 'open_chat', triggers: ['chat'], description: "J'ouvre le chat médical.",
    exec: ({ navigate }) => { navigate('/patient/chat'); } },
  { id: 'open_triage', triggers: ['triage'], description: "J'ouvre le triage symptômes.",
    exec: ({ navigate }) => { navigate('/patient/triage'); } },
  { id: 'open_bibliotheque', triggers: ['bibliotheque'], description: "J'ouvre la bibliothèque santé.",
    exec: ({ navigate }) => { navigate('/patient/bibliotheque'); } },
  { id: 'open_assurances', triggers: ['assurances'], description: "J'ouvre vos assurances.",
    exec: ({ navigate }) => { navigate('/patient/assurances'); } },
  { id: 'open_parrainage', triggers: ['parrainage'], description: "J'ouvre le parrainage.",
    exec: ({ navigate }) => { navigate('/patient/parrainage'); } },

  // Voyage — actions étendues
  { id: 'open_voyage', triggers: ['voyage', 'loisirs'], description: "J'ouvre Voyage & Loisirs.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/explorer'); } },
  { id: 'voyage_search', triggers: ['recherche voyage', 'cherche voyage', 'rechercher voyage', 'destination'],
    description: "J'ouvre la recherche de destinations.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/recherche'); } },
  { id: 'voyage_book', triggers: ['reserver voyage', 'reserve voyage', 'reservation voyage', 'reserver sejour', 'reserver lieu'],
    description: "Je vous emmène réserver votre séjour.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/explorer'); } },
  { id: 'voyage_mes', triggers: ['mes voyages', 'mes reservations', 'mes sejours'],
    description: "J'ouvre vos réservations de voyage.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/mes-voyages'); } },
  { id: 'voyage_favoris', triggers: ['favoris voyage', 'mes favoris voyage', 'lieux favoris'],
    description: "J'ouvre vos favoris voyage.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/favoris'); } },
  { id: 'voyage_experiences', triggers: ['experiences', 'experiences voyage'],
    description: "J'ouvre les expériences à vivre.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/experiences'); } },
  { id: 'voyage_evenements', triggers: ['evenements', 'agenda voyage', 'festivals'],
    description: "J'ouvre l'agenda des événements.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/evenements'); } },
  { id: 'voyage_communaute', triggers: ['communaute voyage', 'voyageurs'],
    description: "J'ouvre la communauté des voyageurs.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/communaute'); } },
  { id: 'voyage_messages', triggers: ['messages voyage', 'messagerie hote', 'mes hotes'],
    description: "J'ouvre votre messagerie avec les hôtes.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/messages'); } },

  // Favoris & avis
  { id: 'favoris_general', triggers: ['mes favoris', 'favoris'],
    description: "J'ouvre vos favoris voyage.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/favoris'); } },
  { id: 'noter_medecin', triggers: ['noter medecin', 'avis medecin', 'evaluer medecin', 'note praticien'],
    description: "J'ouvre la liste des médecins pour laisser une note.",
    exec: ({ navigate }) => { navigate('/patient/medecins'); } },
  { id: 'laisser_avis', triggers: ['laisser avis', 'donner avis', 'ecrire avis', 'noter sejour'],
    description: "Je vous emmène laisser votre avis sur vos derniers séjours.",
    exec: ({ navigate }) => { navigate('/voyage-loisirs/mes-voyages'); } },

  { id: 'open_jeux', triggers: ['jeux'], description: "J'ouvre les Jeux santé.",
    exec: ({ navigate }) => { navigate('/jeux-bien-etre/accueil'); } },
  { id: 'open_juridique', triggers: ['assistance juridique'], description: "J'ouvre l'assistance juridique santé.",
    exec: ({ navigate }) => { navigate('/assistance-juridique/accueil'); } },
  { id: 'open_podcast', triggers: ['podcast'], description: "J'ouvre Podcast Santé.",
    exec: ({ navigate }) => { navigate('/podcast/pour-vous'); } },
  { id: 'open_live_radio', triggers: ['radio'], description: "J'ouvre la radio en direct.",
    exec: ({ navigate }) => { navigate('/live/radio'); } },
  { id: 'open_live_tv', triggers: ['television'], description: "J'ouvre la télévision en direct.",
    exec: ({ navigate }) => { navigate('/live/tv'); } },
  { id: 'open_urgences', triggers: ['urgences'], description: "J'ouvre les urgences.",
    exec: ({ navigate }) => { navigate('/patient/urgences'); } },

  // Actions système
  { id: 'sos_alert', triggers: [
      'sos', 'declenche sos', 'declencher sos', 'lance sos', 'lancer sos', 'active sos', 'activer sos',
      'alerte sos', 'alerte urgence', 'alerte d urgence', 'envoie alerte', 'envoyer alerte',
      'au secours', 'aidez moi', 'aide moi vite', 'urgence vitale', 'urgence medicale',
      'appelle secours', 'appeler secours', 'envoie secours', 'urgence maintenant',
      "j'ai besoin d'aide", 'besoin d aide urgente', 'help', 'emergency',
    ], description: "Je déclenche immédiatement l'alerte SOS et préviens vos contacts d'urgence.",
    exec: () => {
      try { window.dispatchEvent(new CustomEvent('hp:sos:trigger')); } catch {}
    } },
  { id: 'logout', triggers: ['deconnexion', 'deconnecter', 'logout'], description: "Je vous déconnecte.",
    exec: ({ navigate }) => {
      try {
        localStorage.removeItem('healthy-page:current-account-id');
        localStorage.removeItem('healthy-page:role');
      } catch {}
      navigate('/auth');
    } },
  { id: 'login', triggers: ['connexion', 'connecter', 'login'], description: "J'ouvre la connexion.",
    exec: ({ navigate }) => { navigate('/auth'); } },

  // ===== Patient — accès complet à toutes les sections =====
  { id: 'open_favorites_patient', triggers: ['mes favoris medicaux', 'favoris sante'], description: "J'ouvre vos favoris santé.", exec: ({ navigate }) => { navigate('/patient/favorites'); } },
  { id: 'open_ressentis', triggers: ['ressentis', 'mes ressentis', 'humeur', 'emotion'], description: "J'ouvre vos ressentis.", exec: ({ navigate }) => { navigate('/patient/ressentis'); } },
  { id: 'open_notifications', triggers: ['notifications', 'mes notifications'], description: "J'ouvre vos notifications.", exec: ({ navigate }) => { navigate('/patient/notifications'); } },
  { id: 'open_edit_profile', triggers: ['modifier profil', 'editer profil'], description: "J'ouvre la modification du profil.", exec: ({ navigate }) => { navigate('/patient/edit-profile'); } },
  { id: 'open_conseils', triggers: ['conseils sante', 'conseils'], description: "J'ouvre vos conseils santé.", exec: ({ navigate }) => { navigate('/patient/conseils'); } },
  { id: 'open_historique', triggers: ['historique', 'mes consultations'], description: "J'ouvre votre historique.", exec: ({ navigate }) => { navigate('/patient/historique'); } },
  { id: 'open_posologie', triggers: ['posologie', 'doses'], description: "J'ouvre la posologie.", exec: ({ navigate }) => { navigate('/patient/posologie'); } },
  { id: 'open_renouvellement', triggers: ['renouvellement ordonnance', 'renouveler ordonnance'], description: "J'ouvre le renouvellement d'ordonnance.", exec: ({ navigate }) => { navigate('/patient/renouvellement'); } },
  { id: 'open_assistance', triggers: ['assistance', 'support', 'aide application'], description: "J'ouvre l'assistance.", exec: ({ navigate }) => { navigate('/patient/assistance'); } },
  { id: 'open_macarte', triggers: ['ma carte', 'carte healthy', 'carte de membre'], description: "J'ouvre votre carte Healthy.", exec: ({ navigate }) => { navigate('/patient/macarte'); } },
  { id: 'open_centers_map', triggers: ['centres proches', 'centres autour de moi', 'carte centres'], description: "J'ouvre la carte des centres.", exec: ({ navigate }) => { navigate('/patient/carte'); } },
  { id: 'open_pharmacopee', triggers: ['pharmacopee', 'plantes medicinales'], description: "J'ouvre la pharmacopée.", exec: ({ navigate }) => { navigate('/patient/pharmacopee'); } },
  { id: 'open_cars_helfy', triggers: ['taxi ambulance', 'cars helfy', 'ambulance'], description: "J'ouvre Cars Helfy (taxi-ambulance).", exec: ({ navigate }) => { navigate('/patient/cars'); } },
  { id: 'open_hotel', triggers: ['hotel sante', 'hotel medical'], description: "J'ouvre Hôtel Santé.", exec: ({ navigate }) => { navigate('/patient/hotel'); } },
  { id: 'open_pedo', triggers: ['pediatrie', 'pedo', 'enfants'], description: "J'ouvre l'espace Pédiatrie.", exec: ({ navigate }) => { navigate('/patient/pedo'); } },
  { id: 'open_diaspora', triggers: ['diaspora'], description: "J'ouvre l'espace Diaspora.", exec: ({ navigate }) => { navigate('/patient/diaspora'); } },
  { id: 'open_entreprise', triggers: ['entreprise', 'sante entreprise'], description: "J'ouvre Healthy Entreprise.", exec: ({ navigate }) => { navigate('/patient/entreprise'); } },
  { id: 'open_femmes', triggers: ['femmes', 'sante feminine'], description: "J'ouvre l'espace Femmes.", exec: ({ navigate }) => { navigate('/patient/femmes'); } },
  { id: 'open_laboratoire', triggers: ['laboratoire', 'analyses'], description: "J'ouvre Laboratoire.", exec: ({ navigate }) => { navigate('/patient/laboratoire'); } },
  { id: 'open_metaphysique', triggers: ['metaphysique', 'spiritualite'], description: "J'ouvre Métaphysique.", exec: ({ navigate }) => { navigate('/patient/metaphysique'); } },
  { id: 'open_fonds', triggers: ['fonds solidaire', 'cagnotte sante'], description: "J'ouvre le fonds solidaire.", exec: ({ navigate }) => { navigate('/patient/fonds'); } },
  { id: 'open_rural', triggers: ['rural', 'sante rurale'], description: "J'ouvre l'espace Rural.", exec: ({ navigate }) => { navigate('/patient/rural'); } },
  { id: 'open_microcabine', triggers: ['microcabine', 'micro cabine'], description: "J'ouvre Micro-cabine.", exec: ({ navigate }) => { navigate('/patient/microcabine'); } },
  { id: 'open_mobilite', triggers: ['mobilite', 'transport sante'], description: "J'ouvre Mobilité.", exec: ({ navigate }) => { navigate('/patient/mobilite'); } },
  { id: 'open_box', triggers: ['box sante'], description: "J'ouvre Box Santé.", exec: ({ navigate }) => { navigate('/patient/box'); } },
  { id: 'open_famille', triggers: ['famille', 'mes proches'], description: "J'ouvre l'espace Famille.", exec: ({ navigate }) => { navigate('/patient/famille'); } },
  { id: 'open_compagnie', triggers: ['compagnie', 'compagnon sante'], description: "J'ouvre Compagnie.", exec: ({ navigate }) => { navigate('/patient/compagnie'); } },
  { id: 'open_psychocorporel', triggers: ['psychocorporel', 'therapie corporelle'], description: "J'ouvre Psychocorporel.", exec: ({ navigate }) => { navigate('/patient/psychocorporel'); } },
  { id: 'open_guichet', triggers: ['guichet', 'guichet unique'], description: "J'ouvre le Guichet.", exec: ({ navigate }) => { navigate('/patient/guichet'); } },
  { id: 'open_codiag', triggers: ['codiagnostic', 'codiag', 'co diagnostic'], description: "J'ouvre CoDiag.", exec: ({ navigate }) => { navigate('/patient/codiag'); } },
  { id: 'open_sas', triggers: ['sas medical'], description: "J'ouvre le SAS.", exec: ({ navigate }) => { navigate('/patient/sas'); } },
  { id: 'open_categorie', triggers: ['categorie sante', 'categories'], description: "J'ouvre les catégories.", exec: ({ navigate }) => { navigate('/patient/categorie'); } },

  // ===== Voyage — sous-pages restantes =====
  { id: 'open_voyage_carte', triggers: ['carte voyage', 'plan voyage'], description: "J'ouvre la carte des destinations.", exec: ({ navigate }) => { navigate('/voyage-loisirs/carte'); } },
  { id: 'open_voyage_avantages', triggers: ['avantages voyage', 'club voyage'], description: "J'ouvre les avantages voyageurs.", exec: ({ navigate }) => { navigate('/voyage-loisirs/avantages'); } },
  { id: 'open_voyage_profil', triggers: ['profil voyage', 'compte voyage'], description: "J'ouvre votre profil voyage.", exec: ({ navigate }) => { navigate('/voyage-loisirs/profil'); } },
  { id: 'open_voyage_inspirations', triggers: ['inspirations voyage', 'inspiration voyage'], description: "J'ouvre les inspirations.", exec: ({ navigate }) => { navigate('/voyage-loisirs/inspirations'); } },
  { id: 'open_voyage_guides', triggers: ['guides voyage', 'guide voyage'], description: "J'ouvre les guides de voyage.", exec: ({ navigate }) => { navigate('/voyage-loisirs/guides'); } },
  { id: 'open_voyage_conciergerie', triggers: ['conciergerie voyage', 'conciergerie'], description: "J'ouvre la conciergerie voyage.", exec: ({ navigate }) => { navigate('/voyage-loisirs/conciergerie'); } },

  // ===== Juridique =====
  { id: 'open_legal_domaines', triggers: ['domaines juridiques', 'domaines droit'], description: "J'ouvre les domaines juridiques.", exec: ({ navigate }) => { navigate('/assistance-juridique/domaines'); } },
  { id: 'open_legal_dossiers', triggers: ['dossiers juridiques', 'mes dossiers juridiques'], description: "J'ouvre vos dossiers juridiques.", exec: ({ navigate }) => { navigate('/assistance-juridique/dossiers'); } },
  { id: 'open_legal_profil', triggers: ['profil juridique'], description: "J'ouvre votre profil juridique.", exec: ({ navigate }) => { navigate('/assistance-juridique/profil'); } },

  // ===== Jeux Bien-être =====
  { id: 'open_jeux_catalogue', triggers: ['catalogue jeux', 'liste jeux'], description: "J'ouvre le catalogue des jeux.", exec: ({ navigate }) => { navigate('/jeux-bien-etre/catalogue'); } },
  { id: 'open_jeux_recompenses', triggers: ['recompenses jeux', 'mes recompenses'], description: "J'ouvre vos récompenses.", exec: ({ navigate }) => { navigate('/jeux-bien-etre/recompenses'); } },
  { id: 'open_jeux_profil', triggers: ['profil jeux'], description: "J'ouvre votre profil Jeux.", exec: ({ navigate }) => { navigate('/jeux-bien-etre/profil'); } },

  // ===== Podcast =====
  { id: 'open_podcast_decouvrir', triggers: ['decouvrir podcasts', 'explorer podcasts'], description: "J'ouvre la découverte podcasts.", exec: ({ navigate }) => { navigate('/podcast/decouvrir'); } },
  { id: 'open_podcast_recherche', triggers: ['recherche podcast', 'chercher podcast'], description: "J'ouvre la recherche podcast.", exec: ({ navigate }) => { navigate('/podcast/recherche'); } },
  { id: 'open_podcast_biblio', triggers: ['bibliotheque podcast', 'mes podcasts'], description: "J'ouvre votre bibliothèque podcast.", exec: ({ navigate }) => { navigate('/podcast/bibliotheque'); } },
  { id: 'open_podcast_profil', triggers: ['profil podcast'], description: "J'ouvre votre profil podcast.", exec: ({ navigate }) => { navigate('/podcast/profil'); } },

  // ===== Live (Radio/TV) =====
  { id: 'open_live_grille', triggers: ['grille programmes', 'programme tele', 'programme radio'], description: "J'ouvre la grille des programmes.", exec: ({ navigate }) => { navigate('/live/grille'); } },
  { id: 'open_live_favoris', triggers: ['favoris live', 'chaines favorites'], description: "J'ouvre vos chaînes favorites.", exec: ({ navigate }) => { navigate('/live/favoris'); } },

  // ===== Pages publiques =====
  { id: 'open_landing', triggers: ['landing', 'accueil public', 'page accueil'], description: "J'ouvre la page d'accueil publique.", exec: ({ navigate }) => { navigate('/landing'); } },
  { id: 'open_apropos', triggers: ['a propos', 'qui sommes nous'], description: "J'ouvre la page À propos.", exec: ({ navigate }) => { navigate('/a-propos'); } },
  { id: 'open_specialites', triggers: ['specialites', 'nos specialites'], description: "J'ouvre les spécialités.", exec: ({ navigate }) => { navigate('/specialites'); } },
  { id: 'open_kit_grossesse', triggers: ['kit grossesse', 'grossesse'], description: "J'ouvre le Kit Grossesse.", exec: ({ navigate }) => { navigate('/kit-grossesse'); } },
  { id: 'open_scarification', triggers: ['scarification', 'tradition'], description: "J'ouvre Scarification & Tradition.", exec: ({ navigate }) => { navigate('/scarification-tradition'); } },
  { id: 'open_carnet_presentation', triggers: ['presentation carnet', 'a propos carnet'], description: "J'ouvre la présentation du Carnet de santé.", exec: ({ navigate }) => { navigate('/carnet-sante'); } },
  { id: 'open_podcast_sante_pres', triggers: ['presentation podcast', 'a propos podcast'], description: "J'ouvre la présentation Podcast Santé.", exec: ({ navigate }) => { navigate('/podcast-sante'); } },
  { id: 'open_voyage_about', triggers: ['a propos voyage', 'presentation voyage'], description: "J'ouvre la présentation Voyage & Loisirs.", exec: ({ navigate }) => { navigate('/voyage-loisirs/about'); } },
  { id: 'open_juridique_about', triggers: ['a propos juridique', 'presentation juridique'], description: "J'ouvre la présentation Assistance Juridique.", exec: ({ navigate }) => { navigate('/assistance-juridique/about'); } },
  { id: 'open_jeux_about', triggers: ['a propos jeux', 'presentation jeux'], description: "J'ouvre la présentation Jeux Bien-être.", exec: ({ navigate }) => { navigate('/jeux-bien-etre/about'); } },
  { id: 'open_urgences_publiques', triggers: ['urgences publiques', 'numero urgence'], description: "J'ouvre Urgences (page publique).", exec: ({ navigate }) => { navigate('/urgences-publiques'); } },

  // ===== Fitness =====
  { id: 'open_fitness', triggers: ['fitness', 'sport', 'salle de sport'], description: "J'ouvre Healthy Fitness.", exec: ({ navigate }) => { navigate('/fitness'); } },

  // ===== Pro (côté praticien) =====
  { id: 'open_pro_home', triggers: ['pro accueil', 'praticien accueil', 'espace pro'], description: "J'ouvre l'espace pro.", exec: ({ navigate }) => { navigate('/pro/home'); } },
  { id: 'open_pro_agenda', triggers: ['agenda pro', 'mon agenda praticien'], description: "J'ouvre votre agenda pro.", exec: ({ navigate }) => { navigate('/pro/agenda'); } },
  { id: 'open_pro_patients', triggers: ['mes patients', 'liste patients'], description: "J'ouvre vos patients.", exec: ({ navigate }) => { navigate('/pro/patients'); } },
  { id: 'open_pro_messages', triggers: ['messages pro', 'messagerie pro'], description: "J'ouvre votre messagerie pro.", exec: ({ navigate }) => { navigate('/pro/messages'); } },
  { id: 'open_pro_profil', triggers: ['profil pro', 'profil praticien'], description: "J'ouvre votre profil pro.", exec: ({ navigate }) => { navigate('/pro/profil'); } },

  // ===== Navigation système =====
  { id: 'go_back', triggers: ['retour', 'reviens en arriere', 'page precedente', 'precedente'], description: "Je reviens en arrière.", exec: () => { try { window.history.back(); } catch {} } },
  { id: 'go_forward', triggers: ['suivant', 'page suivante', 'avance'], description: "J'avance d'une page.", exec: () => { try { window.history.forward(); } catch {} } },
  { id: 'reload_page', triggers: ['rafraichir', 'recharger', 'actualiser page'], description: "Je recharge la page.", exec: () => { try { window.location.reload(); } catch {} } },
  { id: 'scroll_top', triggers: ['haut de page', 'remonter en haut'], description: "Je remonte en haut.", exec: () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {} } },
  { id: 'scroll_bottom', triggers: ['bas de page', 'descendre tout en bas'], description: "Je descends en bas.", exec: () => { try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch {} } },

  // Langues
  { id: 'lang_fr', triggers: ['francais', 'french'], description: "Je passe l'application en français.",
    exec: ({ setLocale }) => { setLocale('fr'); } },
  { id: 'lang_en', triggers: ['anglais', 'english'], description: "Switching the app to English.",
    exec: ({ setLocale }) => { setLocale('en'); } },
  { id: 'lang_yor', triggers: ['yoruba'], description: "Je passe en yoruba.",
    exec: ({ setLocale }) => { setLocale('yor'); } },
  { id: 'lang_wol', triggers: ['wolof'], description: "Je passe en wolof.",
    exec: ({ setLocale }) => { setLocale('wol'); } },
  { id: 'lang_fon', triggers: ['fon'], description: "Je passe en fon.",
    exec: ({ setLocale }) => { setLocale('fon'); } },
];

const ACTION_VERBS = ['ouvre','ouvrir','ouvres','va','vas','aller','allons','emmene','emmener','lance','lancer','lances','active','activer','actives','demarre','demarrer','demarres','passe','passes','passer','affiche','afficher','affiches','montre','montrer','montres','navigue','naviguer','deconnecte','deconnecter','connecte','connecter','traduis','traduire'];

function detectAction(tokens: string[], rawNorm: string): Action | null {
  const set = new Set(tokens);
  const hasVerb = tokens.some((t) => ACTION_VERBS.includes(t));
  // Score chaque action
  let best: { a: Action; score: number } | null = null;
  for (const a of ACTIONS) {
    for (const trig of a.triggers) {
      const parts = norm(trig).split(' ').filter(Boolean);
      const allMatch = parts.every((p) => set.has(p) || rawNorm.includes(p));
      if (allMatch) {
        const score = parts.length * 10 + (hasVerb ? 5 : 0);
        if (!best || score > best.score) best = { a, score };
      }
    }
  }
  // Sans verbe d'action explicite, on exige plus de poids
  if (!best) return null;
  if (!hasVerb && best.score < 20) return null;
  return best.a;
}

// Stop-words FR + interrogatifs (à ignorer pour le scoring)
const STOP = new Set([
  'le','la','les','un','une','des','de','du','au','aux','et','ou','a','en','est','sont',
  'pour','par','sur','dans','avec','sans','que','qui','quoi','quel','quelle','quels','quelles',
  'ce','cet','cette','ces','je','tu','il','elle','on','nous','vous','ils','elles','me','te','se',
  'mon','ma','mes','ton','ta','tes','son','sa','ses','notre','votre','leur','leurs',
  'ne','pas','plus','moins','tres','tout','tous','toute','toutes',
  'comment','pourquoi','ou','quand','combien','peux','peut','dois','faut','besoin','aller','va',
  'svp','stp','sil','plait','merci','bonjour','salut','hello',
]);

const significant = (tokens: string[]) => tokens.filter((t) => !STOP.has(t) && t.length >= 2);

// Distance Levenshtein simple — tolérance aux fautes
function lev(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (Math.abs(al - bl) > 2) return 99;
  const dp = Array.from({ length: al + 1 }, (_, i) => i);
  for (let j = 1; j <= bl; j++) {
    let prev = dp[0]; dp[0] = j;
    for (let i = 1; i <= al; i++) {
      const tmp = dp[i];
      dp[i] = a[i-1] === b[j-1] ? prev : Math.min(prev, dp[i-1], dp[i]) + 1;
      prev = tmp;
    }
  }
  return dp[al];
}

const fuzzyHas = (haystack: string, token: string): boolean => {
  if (!token || token.length < 3) return false;
  if (haystack.includes(token)) return true;
  // tolérance 1 faute pour mots ≥ 4 lettres
  if (token.length < 4) return false;
  return haystack.split(' ').some((w) => w.length >= 3 && lev(w, token) <= 1);
};

// ---------- Recherche générique sur toute la plateforme ----------
type SearchHit = { kind: 'doctor'|'center'|'podcast'|'destination'|'plan'|'topic'; score: number; render: () => string };

const VOYAGE_DESTS = [
  { name: 'Saly & Petite Côte', region: 'Sénégal', tags: 'plage thalasso mer cote soin spa balneaire' },
  { name: 'Lac Rose & Lompoul', region: 'Sénégal', tags: 'desert dune meditation retraite silence yoga' },
  { name: 'Île de Gorée', region: 'Sénégal', tags: 'patrimoine unesco culture marche douce histoire' },
  { name: 'Saint-Louis', region: 'Sénégal Nord', tags: 'patrimoine pirogue gastronomie unesco fleuve' },
  { name: 'Sine-Saloum', region: 'Sénégal Sud', tags: 'mangrove ecotourisme bolong nature pirogue' },
  { name: 'Casamance', region: 'Sénégal Sud', tags: 'foret nature diola tradition village' },
  { name: 'Ouidah & Grand-Popo', region: 'Bénin', tags: 'plage atlantique vaudou patrimoine balade' },
  { name: 'Ganvié & lac Nokoué', region: 'Bénin', tags: 'lacustre pirogue silence cite eau' },
  { name: 'Tata Somba & Atacora', region: 'Bénin Nord', tags: 'montagne sacre tamberma randonnee ethnie' },
];

const LEGAL_DOMAINS = [
  { label: 'Erreur médicale', tags: 'faute diagnostic chirurgie hopital praticien medecin' },
  { label: 'Effet indésirable médicament', tags: 'pharmacie posologie surdose pharma traitement' },
  { label: 'Accident corporel', tags: 'blessure trauma route travail accident dommage' },
  { label: 'Refus de soin', tags: 'discrimination acces hopital admission urgence' },
  { label: 'Maladie professionnelle', tags: 'travail employeur amiante exposition pro' },
  { label: 'Litige assurance santé', tags: 'mutuelle remboursement assureur sinistre' },
  { label: 'Violences & préjudice', tags: 'agression victime violence prejudice plainte' },
  { label: 'Vaccination & soins forcés', tags: 'consentement vaccin obligation force' },
  { label: 'Dossier médical', tags: 'acces dossier patient confidentialite donnees' },
];

function platformSearch(qTokens: string[]): SearchHit[] {
  const sig = significant(qTokens);
  if (!sig.length) return [];
  const hits: SearchHit[] = [];
  const matchScore = (text: string): number => {
    const t = norm(text);
    let s = 0;
    for (const tok of sig) if (fuzzyHas(t, tok)) s += 1;
    return s;
  };

  for (const d of DOCTORS) {
    const text = `${d.firstName} ${d.lastName} ${d.specialty} ${d.category} ${d.city} ${d.centerName}`;
    const s = matchScore(text);
    if (s > 0) hits.push({ kind:'doctor', score: s + 0.1*d.rating, render: () =>
      `• Dr ${d.firstName} ${d.lastName} — ${d.specialty}, ${d.city} (${d.rating}/5, ${d.consultationFee} FCFA). Prochain créneau : ${d.nextSlot}.`
    });
  }
  for (const c of CENTERS) {
    const text = `${c.name} ${c.type} ${c.city}`;
    const s = matchScore(text);
    if (s > 0) hits.push({ kind:'center', score: s + 0.1*c.rating, render: () =>
      `• ${c.name} — ${c.type}, ${c.city} (${c.rating}/5, ${c.reviews} avis).`
    });
  }
  for (const e of PODCAST_EPISODES) {
    const text = `${e.title} ${e.host} ${e.cat} ${e.desc}`;
    const s = matchScore(text);
    if (s > 0) hits.push({ kind:'podcast', score: s, render: () =>
      `• Podcast : ${e.title} — ${e.host} (${e.duration}).`
    });
  }
  for (const v of VOYAGE_DESTS) {
    const text = `${v.name} ${v.region} ${v.tags}`;
    const s = matchScore(text);
    if (s > 0) hits.push({ kind:'destination', score: s, render: () =>
      `• Destination : ${v.name} — ${v.region}.`
    });
  }
  for (const l of LEGAL_DOMAINS) {
    const text = `${l.label} ${l.tags}`;
    const s = matchScore(text);
    if (s > 0) hits.push({ kind:'topic', score: s, render: () =>
      `• Assistance juridique santé : ${l.label}.`
    });
  }
  return hits.sort((a, b) => b.score - a.score);
}

function answerInFrench(q: string, user: CurrentUser, ctx?: ActionContext): string {
  const raw = q.trim();
  if (!raw) return `${buildGreeting(user)} ${SUGGESTIONS}`;

  const tokens = tokenize(raw);
  const rawNorm = norm(raw);

  // 0a) Réservation voyage paramétrée — « réserve 3 nuits à Saly pour 2 adultes »
  if (ctx && /\b(reserve|reserver|reservation|book|booking|prends|prendre|prend|stay)\b/.test(rawNorm)) {
    const parsed = parseBooking(rawNorm);
    if (parsed) {
      const qs = new URLSearchParams();
      if (parsed.startISO) qs.set('start', parsed.startISO);
      if (parsed.endISO) qs.set('end', parsed.endISO);
      if (parsed.nights) qs.set('nights', String(parsed.nights));
      if (parsed.adults) qs.set('adults', String(parsed.adults));
      if (parsed.children) qs.set('children', String(parsed.children));
      if (parsed.rooms) qs.set('rooms', String(parsed.rooms));
      const path = `/voyage-loisirs/reservation/${parsed.lieuId}${qs.toString() ? `?${qs}` : ''}`;
      try { ctx.navigate(path); } catch {}
      const lieuName = parsed.lieuId.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      const dateBit = parsed.startISO && parsed.endISO
        ? `du ${parsed.startISO} au ${parsed.endISO}`
        : parsed.startISO ? `à partir du ${parsed.startISO}` : null;
      const bits = [
        dateBit,
        parsed.nights ? `${parsed.nights} nuit${parsed.nights > 1 ? 's' : ''}` : null,
        parsed.adults ? `${parsed.adults} adulte${parsed.adults > 1 ? 's' : ''}` : null,
        parsed.children ? `${parsed.children} enfant${parsed.children > 1 ? 's' : ''}` : null,
        parsed.rooms ? `${parsed.rooms} chambre${parsed.rooms > 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(', ');
      return `C'est noté ${user.greetingName}. J'ouvre la réservation pour ${lieuName}${bits ? ` — ${bits}` : ''}. Vérifiez les dates et finalisez quand vous voulez.`;
    }
  }

  // 0) Action exécutable détectée → exécute et confirme
  if (ctx) {
    const action = detectAction(tokens, rawNorm);
    if (action) {
      try { action.exec(ctx, raw); } catch {}
      const confirms = [
        `D'accord ${user.greetingName}.`,
        `Tout de suite ${user.greetingName}.`,
        `C'est parti.`,
        `Avec plaisir.`,
      ];
      return `${pick(confirms)} ${action.description}`;
    }
  }

  // 1) Intentions explicites
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    const score = scoreIntent(intent, tokens);
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  if (best && best.score >= 5) return best.intent.handler(raw, tokens, user);

  // 2) Recherche directe par nom propre médecin
  const doc = DOCTORS.find((d) => tokens.includes(norm(d.lastName)) || tokens.includes(norm(d.firstName)));
  if (doc) {
    return `Dr ${doc.firstName} ${doc.lastName} — ${doc.specialty}, ${doc.centerName} (${doc.city}). Note ${doc.rating}/5. ${doc.yearsExperience} ans d'expérience. Consultation : ${doc.consultationFee} FCFA. Prochain créneau : ${doc.nextSlot}.`;
  }

  // 3) Recherche générique multi-source avec fuzzy matching
  const hits = platformSearch(tokens);
  if (hits.length) {
    const top = hits.slice(0, 6);
    const intro = pick([
      `Voici ce que j'ai trouvé sur la plateforme`,
      `Je vous propose ces résultats`,
      `D'après ce que je sais`,
    ]);
    return `${intro} :\n${top.map(h => h.render()).join('\n')}`;
  }

  // 4) Repli intent partiel
  if (best && best.score > 0) return best.intent.handler(raw, tokens, user);

  return `Je n'ai pas trouvé de réponse précise sur « ${raw} ». Reformulez en mentionnant un thème (médecins, centre, ville, podcast, voyage, juridique, urgences, bien-être). ${SUGGESTIONS}`;
}

// ---------- Voix naturelle ----------
function pickBestVoice(locale: Locale): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const wanted = (BCP47[locale] ?? 'fr-FR').toLowerCase();
  const lang2 = wanted.split('-')[0];
  const score = (v: SpeechSynthesisVoice): number => {
    const n = (v.name + ' ' + v.lang).toLowerCase();
    let s = 0;
    if (v.lang?.toLowerCase() === wanted) s += 10;
    else if (v.lang?.toLowerCase().startsWith(lang2)) s += 6;
    // Voix neurales/cloud connues — beaucoup plus naturelles
    if (/google/.test(n)) s += 12;
    if (/natural|neural|premium|enhanced|wavenet|studio|online|cloud/.test(n)) s += 10;
    // Voix iOS/macOS de qualité
    if (/audrey|amelie|amélie|thomas|aurelie|aurélie/.test(n)) s += 8;
    // Voix Microsoft Azure Neural
    if (/denise|henri|brigitte|alain|jacqueline|yves/.test(n)) s += 7;
    if (/microsoft/.test(n)) s += 4;
    // Pénaliser les voix manifestement basiques (eSpeak, Festival, Pico)
    if (/espeak|festival|pico|compact|fred|albert|kathy|zarvox/.test(n)) s -= 20;
    if (v.localService) s -= 1; // les voix cloud sont presque toujours meilleures
    return s;
  };
  return voices.slice().sort((a, b) => score(b) - score(a))[0] ?? null;
}

function humanize(text: string): string {
  // Nettoyage pour TTS : enlever tirets/puces/markdown, normaliser ponctuation
  return text
    // Tirets cadratin/demi-cadratin partout → virgule
    .replace(/[—–]/g, ', ')
    // Tiret ASCII isolé (entouré d'espaces ou en début/fin) → virgule
    .replace(/(^|\s)-+(\s|$)/g, '$1, $2')
    // Suite de tirets ou tiret entre chiffre et lettre → espace
    .replace(/-{2,}/g, ' ')
    // Puces et symboles parasites
    .replace(/[•·▸▾►▪◦]/g, '')
    // Markdown gras/italique
    .replace(/\*+/g, '')
    .replace(/_+/g, ' ')
    // Emojis et pictos non vocalisables
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    // Abréviations
    .replace(/\bRDV\b/gi, 'rendez-vous')
    .replace(/\bFCFA\b/g, 'francs CFA')
    .replace(/(\d)\s*\/\s*5\b/g, '$1 sur 5')
    // Normaliser espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
}

function splitForSpeech(text: string): string[] {
  // On découpe uniquement sur ponctuation forte pour éviter les coupures de mots.
  // Les virgules restent dans la phrase et créent une intonation naturelle.
  const cleaned = humanize(text).replace(/\n+/g, '. ');
  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  const out: string[] = [];
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    // Si une phrase est très longue (>180 caractères), on la coupe sur « ; » ou « : »
    if (t.length > 180) {
      const parts = t.split(/(?<=[;:])\s+/).map((p) => p.trim()).filter(Boolean);
      out.push(...parts);
    } else {
      out.push(t);
    }
  }
  return out;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const ORB_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return {
    id: i,
    x: Math.cos(angle),
    y: Math.sin(angle),
    delay: (i % 7) * 0.18,
    size: 4 + ((i * 3) % 5),
  };
});

function VoiceOrb({ speaking, listening, thinking, level }: { speaking: boolean; listening: boolean; thinking: boolean; level: number }) {
  const scale = 1 + (speaking ? 0.18 : listening ? Math.min(0.25, level * 1.4) : 0);
  const glowColor = speaking ? 'rgba(52,211,153,0.45)' : listening ? 'rgba(244,114,182,0.45)' : 'rgba(255,255,255,0.18)';
  const particleColor = speaking ? 'rgba(110,231,183,0.95)' : listening ? 'rgba(251,113,133,0.95)' : 'rgba(255,255,255,0.55)';
  const active = speaking || listening || thinking;
  const radiusBase = 88;
  const radiusBoost = 22 + level * 28;
  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      {/* Particules orbitales / projetées */}
      {ORB_PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            background: particleColor,
            boxShadow: `0 0 ${p.size * 2}px ${particleColor}`,
            left: '50%', top: '50%',
          }}
          animate={active ? {
            x: [p.x * radiusBase * 0.45, p.x * (radiusBase + radiusBoost), p.x * radiusBase * 0.45],
            y: [p.y * radiusBase * 0.45, p.y * (radiusBase + radiusBoost), p.y * radiusBase * 0.45],
            opacity: [0, 0.95, 0],
            scale: [0.4, 1, 0.4],
          } : { x: p.x * radiusBase * 0.5, y: p.y * radiusBase * 0.5, opacity: 0.25, scale: 0.6 }}
          transition={{ duration: speaking ? 1.6 : 2.4, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
      {/* Anneaux d'onde émis quand l'IA parle */}
      {speaking && [0, 0.6, 1.2].map((d) => (
        <motion.span
          key={`wave-${d}`}
          aria-hidden
          className="absolute rounded-full pointer-events-none border border-emerald-300/60"
          style={{ width: 128, height: 128 }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: d }}
        />
      ))}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
        animate={{ scale: 1 + (level * 0.6) + (speaking ? 0.15 : 0) }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      />
      <motion.div
        className="absolute inset-2 rounded-full ring-1 ring-white/15"
        animate={{ scale: 1 + level * 0.25 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      />
      <motion.div
        className="absolute inset-6 rounded-full ring-1 ring-white/10"
        animate={{ scale: 1 + level * 0.4 + (speaking ? 0.08 : 0) }}
        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
      />
      <motion.div
        className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${
          speaking
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : listening
              ? 'bg-gradient-to-br from-rose-500 to-pink-600'
              : 'bg-gradient-to-br from-slate-700 to-slate-800'
        }`}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      >
        {thinking ? (
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        ) : speaking ? (
          <Volume2 className="w-10 h-10 text-white" />
        ) : listening ? (
          <Mic className="w-10 h-10 text-white" />
        ) : (
          <Sparkles className="w-10 h-10 text-white" />
        )}
      </motion.div>
    </div>
  );
}

export function AIAssistant() {
  const { locale, setLocale } = useT();
  const navigate = useCallback((p: string) => { try { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); } catch { window.location.assign(p); } }, []);
  const [langOpen, setLangOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supportsSTT, setSupportsSTT] = useState(false);
  const [user, setUser] = useState<CurrentUser>(() => detectUser());
  const [pathname, setPathname] = useState<string>(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const section = useMemo(() => detectSection(pathname), [pathname]);
  const recRef = useRef<any>(null);
  const liveRef = useRef(false);
  const speakingRef = useRef(false);
  const speakGenRef = useRef(0);
  const restartAttemptsRef = useRef(0);
  const restartTimerRef = useRef<number | null>(null);
  const bargeInRef = useRef<number | null>(null);
  const micLevelRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const liveScrollRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const shutUpRef = useRef<(() => void) | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callElapsed, setCallElapsed] = useState(0);
  const [interim, setInterim] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyGroups, setHistoryGroups] = useState<{ topic: TopicId; items: HistoryEntry[] }[]>([]);

  useEffect(() => { if (open) setHistoryGroups(groupHistoryByTopic()); }, [open, msgs.length]);

  useEffect(() => {
    const w = window as any;
    setSupportsSTT(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    // warm voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    const refresh = () => setUser(detectUser());
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    // Patch pushState/replaceState so SPA navigations notify us instantly
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (...args) { const r = origPush.apply(this, args as any); window.dispatchEvent(new Event('hp:locationchange')); return r; };
    window.history.replaceState = function (...args) { const r = origReplace.apply(this, args as any); window.dispatchEvent(new Event('hp:locationchange')); return r; };
    window.addEventListener('hp:locationchange', onNav);
    const id = window.setInterval(onNav, 800);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('hp:locationchange', onNav);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.clearInterval(id);
    };
  }, []);
  useEffect(() => { if (open) setUser(detectUser()); }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open, thinking]);

  // Speak with natural pacing
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    return new Promise<void>((resolve) => {
      try {
        window.speechSynthesis.cancel();
        // Coupe immédiatement la reconnaissance vocale pour qu'elle ne capte pas notre propre voix
        try { recRef.current?.abort?.(); } catch {}
        try { recRef.current?.stop?.(); } catch {}
        recRef.current = null;
        setListening(false);
        setInterim('');
        const gen = ++speakGenRef.current;
        const voice = pickBestVoice(locale);
        const enVoice = pickBestVoice('en' as Locale);
        // Découpe en sous-segments alternant locale / anglais pour les marques anglaises
        type Piece = { text: string; en: boolean };
        const splitBrandPieces = (s: string): Piece[] => {
          const re = /\b(Healthy\s*Page|HEALTHY\s*PAGE|Healthy)\b/g;
          const out: Piece[] = [];
          let last = 0; let m: RegExpExecArray | null;
          while ((m = re.exec(s)) !== null) {
            if (m.index > last) out.push({ text: s.slice(last, m.index), en: false });
            out.push({ text: m[0], en: true });
            last = m.index + m[0].length;
          }
          if (last < s.length) out.push({ text: s.slice(last), en: false });
          return out.filter((p) => p.text.trim().length > 0);
        };
        const segments = splitForSpeech(text);
        const pieces: Piece[] = segments.flatMap(splitBrandPieces);
        if (!pieces.length) { resolve(); return; }
        speakingRef.current = true;
        setSpeaking(true);
        let i = 0;
        const speakNext = () => {
          if (gen !== speakGenRef.current) { resolve(); return; }
          if (i >= pieces.length) {
            speakingRef.current = false;
            setSpeaking(false);
            resolve();
            return;
          }
          const piece = pieces[i];
          const u = new SpeechSynthesisUtterance(piece.text);
          if (piece.en) {
            u.lang = 'en-US';
            if (enVoice) u.voice = enVoice;
          } else {
            u.lang = BCP47[locale] ?? 'fr-FR';
            if (voice) u.voice = voice;
          }
          const isQuestion = /\?\s*$/.test(piece.text);
          u.rate = 0.95;
          u.pitch = isQuestion ? 1.08 : 1.02;
          u.volume = 1;
          // Pas de pause artificielle entre piece française et marque anglaise pour garder la fluidité
          const nextIsBrandSwitch = pieces[i + 1] && pieces[i + 1].en !== piece.en;
          const pauseAfter = nextIsBrandSwitch ? 20 : 60;
          u.onend = () => { if (gen !== speakGenRef.current) return; i++; setTimeout(speakNext, pauseAfter); };
          u.onerror = () => { if (gen !== speakGenRef.current) return; i++; setTimeout(speakNext, 50); };
          window.speechSynthesis.speak(u);
        };
        speakNext();
      } catch {
        speakingRef.current = false;
        setSpeaking(false);
        resolve();
      }
    });
  }, [voiceOn, locale]);

  const localizeForDisplay = useCallback(async (frText: string): Promise<string> => {
    if (locale === 'fr' || !isMachineTranslatable(locale)) return frText;
    try {
      const [tr] = await translateBatch([frText], locale);
      return tr || frText;
    } catch { return frText; }
  }, [locale]);

  const startListenInternal = useCallback(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    if (recRef.current) { try { recRef.current.abort?.(); recRef.current.stop?.(); } catch {} recRef.current = null; }
    const rec = new SR();
    rec.lang = BCP47[locale] ?? 'fr-FR';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // En mode Live on garde la reconnaissance ouverte en continu
    rec.continuous = !!liveRef.current;
    rec.onresult = (e: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText && !speakingRef.current) {
        setInterim(interimText);
        // Live mode : on n'attend pas la fin de phrase si la personne crie « SOS ».
        if (liveRef.current && isSOSRequest(interimText)) {
          setInterim('');
          sendRef.current?.(interimText.trim());
        }
      }
      if (finalText && !speakingRef.current) {
        setInterim('');
        sendRef.current?.(finalText.trim());
      }
    };
    const scheduleRestart = (baseMs: number) => {
      if (!liveRef.current || speakingRef.current) return;
      // Backoff exponentiel borné si la reconnaissance échoue en boucle
      const attempts = Math.min(restartAttemptsRef.current, 5);
      const delay = baseMs + attempts * 250;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = window.setTimeout(() => {
        if (liveRef.current && !speakingRef.current) startListenInternal();
      }, delay);
    };
    rec.onerror = (e: any) => {
      const err = e?.error;
      setInterim('');
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        liveRef.current = false;
        setLiveMode(false);
        setListening(false);
        return;
      }
      setListening(false);
      restartAttemptsRef.current += 1;
      // 'no-speech' est attendu en mode Live → relance rapide
      scheduleRestart(err === 'no-speech' ? 120 : 250);
    };
    rec.onend = () => {
      setListening(false);
      if (liveRef.current && !speakingRef.current) {
        scheduleRestart(80);
      } else {
        setInterim('');
      }
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
      // Reset le compteur dès qu'on a un démarrage réussi (sera incrémenté de nouveau si erreur)
      restartAttemptsRef.current = 0;
    } catch { setListening(false); }
  }, [locale]);

  const sendRef = useRef<(s: string) => void>();

  const shutUp = useCallback(() => {
    speakGenRef.current++;
    try { window.speechSynthesis?.cancel(); } catch {}
    speakingRef.current = false;
    setSpeaking(false);
  }, []);
  useEffect(() => { shutUpRef.current = shutUp; }, [shutUp]);

  // Retours après application d'un patch profil par l'IA
  useEffect(() => {
    const onErr = (e: any) => {
      const err = e?.detail?.error ?? 'inconnue';
      setMsgs((m) => [...m, { id: `a-${Date.now()}`, role: 'ai', text: `Je n'ai pas pu enregistrer dans votre profil santé (${err}). Vérifiez votre connexion ou ouvrez « modifier profil » pour valider.`, ts: Date.now() }]);
    };
    const onOk = (e: any) => {
      const d = e?.detail || {};
      if (!d.backendOk && d.localOk) {
        setMsgs((m) => [...m, { id: `a-${Date.now()}`, role: 'ai', text: "Sauvegarde locale effectuée. La synchronisation serveur reprendra dès que vous serez en ligne.", ts: Date.now() }]);
      }
    };
    window.addEventListener('hp:ai:profile:error', onErr);
    window.addEventListener('hp:ai:profile:saved', onOk);
    return () => {
      window.removeEventListener('hp:ai:profile:error', onErr);
      window.removeEventListener('hp:ai:profile:saved', onOk);
    };
  }, []);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    // Stoppe immédiatement toute lecture en cours : on n'enchaîne pas sur un message précédent
    shutUp();
    // ⚠️ PRIORITÉ ABSOLUE : SOS — on déclenche sans attendre, sans discuter.
    if (isSOSRequest(text)) {
      const uMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
      const aMsg: Msg = { id: `a-${Date.now()}`, role: 'ai', text: "SOS déclenché. J'envoie l'alerte à vos contacts d'urgence maintenant.", ts: Date.now() + 1 };
      setMsgs((m) => [...m, uMsg, aMsg]);
      setInput('');
      setThinking(false);
      try { window.dispatchEvent(new CustomEvent('hp:sos:trigger')); } catch {}
      try { speak("SOS déclenché. J'envoie l'alerte à vos contacts d'urgence maintenant."); } catch {}
      return;
    }
    const uMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    setMsgs((m) => [...m, uMsg]);
    setInput('');
    setThinking(true);
    // Petit délai naturel hors-Live ; en Live on enchaîne immédiatement pour la fluidité
    if (!liveRef.current) await new Promise(r => setTimeout(r, 280));
    const ctx: ActionContext = { navigate: (p) => navigate(p), setLocale: (l) => setLocale(l), user };
    const fr = answerInFrench(text, user, ctx);
    pushHistory(text);
    const out = await localizeForDisplay(fr);
    const aMsg: Msg = { id: `a-${Date.now()}`, role: 'ai', text: out, ts: Date.now() };
    setMsgs((m) => [...m, aMsg]);
    setThinking(false);
    await speak(out);
    if (liveRef.current && !speakingRef.current) {
      // Relance rapide après la fin de la parole IA (l'écho se dissipe en ~150 ms)
      window.setTimeout(() => { if (liveRef.current && !speakingRef.current) startListenInternal(); }, 180);
    }
  }, [localizeForDisplay, speak, user, startListenInternal, navigate, setLocale, shutUp]);

  useEffect(() => { sendRef.current = send; }, [send]);

  useEffect(() => {
    const onHide = () => { if (document.hidden) shutUp(); };
    const onUnload = () => shutUp();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
      shutUp();
    };
  }, [shutUp]);

  useEffect(() => { if (!open) shutUp(); }, [open, shutUp]);

  const startListen = useCallback(() => { shutUp(); startListenInternal(); }, [startListenInternal, shutUp]);
  const stopListen = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const stopMicMeter = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  }, []);

  const startMicMeter = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        const avg = sum / buf.length / 255;
        const lvl = muted ? 0 : avg;
        micLevelRef.current = lvl;
        setMicLevel(lvl);
        // Barge-in : si l'utilisateur parle clairement (>0.18) pendant >250 ms
        // alors que l'IA parle, on coupe immédiatement la TTS et on rouvre le mic.
        if (liveRef.current && speakingRef.current && !muted && lvl > 0.18) {
          if (bargeInRef.current == null) bargeInRef.current = performance.now();
          else if (performance.now() - bargeInRef.current > 250) {
            bargeInRef.current = null;
            shutUpRef.current?.();
            window.setTimeout(() => { if (liveRef.current && !speakingRef.current) startListenInternal(); }, 80);
          }
        } else if (bargeInRef.current != null) {
          bargeInRef.current = null;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  }, [muted]);

  const toggleLive = useCallback(async () => {
    if (liveRef.current) {
      liveRef.current = false;
      setLiveMode(false);
      // Coupe la reconnaissance de manière dure (pas juste stop)
      try { recRef.current?.abort?.(); } catch {}
      try { recRef.current?.stop?.(); } catch {}
      recRef.current = null;
      setListening(false);
      setInterim('');
      stopMicMeter();
      setCallStartedAt(null);
      setCallElapsed(0);
      // Stoppe complètement la synthèse (incrémente le gen pour neutraliser tout speakNext en attente)
      speakGenRef.current++;
      try { window.speechSynthesis.cancel(); } catch {}
      speakingRef.current = false;
      setSpeaking(false);
      return;
    }
    liveRef.current = true;
    setLiveMode(true);
    setVoiceOn(true);
    setMuted(false);
    setCallStartedAt(Date.now());
    startMicMeter();
    const intro = await localizeForDisplay(`Mode Live activé. Je vous écoute ${user.greetingName}, parlez librement.`);
    setMsgs((m) => [...m, { id: `a-live-${Date.now()}`, role: 'ai', text: intro, ts: Date.now() }]);
    await speak(intro);
    if (liveRef.current) startListenInternal();
  }, [localizeForDisplay, speak, startListenInternal, stopListen, user, startMicMeter, stopMicMeter]);

  // Timer d'appel
  useEffect(() => {
    if (!callStartedAt) return;
    const id = window.setInterval(() => setCallElapsed(Math.floor((Date.now() - callStartedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [callStartedAt]);

  // Auto-scroll du transcript Live
  useEffect(() => {
    if (liveMode) liveScrollRef.current?.scrollTo({ top: liveScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, liveMode, thinking]);

  // Cleanup
  useEffect(() => () => stopMicMeter(), [stopMicMeter]);

  // Welcome when first opened — random polite phrase + name
  useEffect(() => {
    if (open && msgs.length === 0) {
      (async () => {
        const greet = buildGreeting(user, section.tone);
        const ctxLine = section.label !== 'Healthy Page'
          ? ` Je vois que vous êtes sur « ${section.label} » — je peux vous y guider.`
          : '';
        const recall = buildRecallLine();
        const recallLine = recall ? ` ${recall}` : '';
        const lastQ = recall ? loadHistory()[0]?.q : undefined;
        const fr = user.account
          ? `${greet}${ctxLine}${recallLine} Je vous reconnais et garde en mémoire vos informations de santé. Posez-moi vos questions, à l'écrit ou au micro — passez en mode Live pour un échange vocal en temps réel.`
          : `${greet}${ctxLine}${recallLine} Je suis votre assistant Healthy Page. Connectez-vous pour que je personnalise nos échanges. Activez le mode Live pour me parler comme à un ami.`;
        const welcome = await localizeForDisplay(fr);
        setMsgs([{ id: 'a-welcome', role: 'ai', text: welcome, ts: Date.now(), recallQuery: lastQ }]);
        if (voiceOn) speak(welcome);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Suggestion proactive quand la page change pendant que l'assistant est ouvert
  const lastSectionRef = useRef<string>(section.label);
  useEffect(() => {
    if (!open) { lastSectionRef.current = section.label; return; }
    if (lastSectionRef.current === section.label) return;
    if (lastSectionRef.current === 'Healthy Page' && msgs.length <= 1) { lastSectionRef.current = section.label; return; }
    lastSectionRef.current = section.label;
    if (section.label === 'Healthy Page') return;
    (async () => {
      const top = section.suggestions[0];
      const fr = `Je vois que vous venez d'ouvrir « ${section.label} »${top ? ` — voulez-vous que je ${top.q.replace(/^je\s+/, '').replace(/^(suggère|propose|recommande|lance|ouvre|trouve|prends|réserve)/i, m => m.toLowerCase()) || top.label} ?` : '.'}`;
      const text = await localizeForDisplay(fr);
      setMsgs((m) => [...m, { id: `a-ctx-${Date.now()}`, role: 'ai', text, ts: Date.now() }]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.label, open]);

  const placeholder = useMemo(() => {
    return locale === 'en' ? 'Ask me anything…' : 'Posez votre question…';
  }, [locale]);

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[9990]">
        {/* Halo lumineux animé */}
        <motion.span
          aria-hidden
          className="absolute inset-0 -m-3 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.45), rgba(99,102,241,0.25) 55%, transparent 75%)', filter: 'blur(12px)' }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: '0 0 0 0 rgba(244,114,182,0.55)' }}
          animate={{ boxShadow: ['0 0 0 0 rgba(244,114,182,0.55)', '0 0 0 14px rgba(244,114,182,0)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.button
          aria-label="Assistant IA"
          onClick={() => setOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center ring-4 ring-white/80 hover:scale-105 transition overflow-hidden"
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(244,114,182,0.18), rgba(99,102,241,0.18), rgba(16,185,129,0.18), rgba(244,114,182,0.18))' }} />
          {open
            ? <X className="w-6 h-6 text-slate-700 relative" />
            : <img src={logoBrand} alt="Healthy Page" className="w-12 h-12 object-contain relative" />}
          {liveMode && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {liveMode && (
          <motion.div
            key="ai-live"
            className="fixed inset-0 z-[10000] bg-gradient-to-b from-slate-950 via-rose-950/40 to-slate-950 text-white flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10">
              <VoiceOrb speaking={speaking} listening={listening && !muted} thinking={thinking} level={micLevel} />
              <div className="mt-8 text-center">
                <div className="text-base font-semibold">
                  {thinking ? 'Je réfléchis…' : speaking ? 'Je vous réponds' : muted ? 'Micro coupé' : listening ? 'Je vous écoute' : 'Un instant…'}
                </div>
                <div className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
                  {speaking
                    ? "Vous pouvez m'interrompre à tout moment."
                    : "Parlez librement, je m'adapte à votre rythme."}
                </div>
              </div>

              <div ref={liveScrollRef} className="mt-6 w-full max-w-md max-h-[28vh] overflow-y-auto space-y-2 px-1">
                {msgs.slice(-6).map((m) => (
                  <div key={m.id} className={`text-[13px] leading-snug rounded-2xl px-3 py-2 ${
                    m.role === 'user'
                      ? 'bg-white/15 text-white ml-auto max-w-[85%] rounded-br-sm'
                      : 'bg-white/5 ring-1 ring-white/10 text-white/90 max-w-[85%] rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                ))}
                {interim && (
                  <div className="text-[13px] leading-snug rounded-2xl px-3 py-2 bg-white/10 ring-1 ring-white/10 text-white/70 ml-auto max-w-[85%] rounded-br-sm italic">
                    {interim}<span className="ml-0.5 inline-block w-1 h-3 align-middle bg-white/60 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-10 pt-4 flex items-center justify-center gap-5">
              <button
                onClick={() => setMuted((m) => !m)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ring-1 transition ${
                  muted ? 'bg-white text-slate-900 ring-white' : 'bg-white/10 text-white ring-white/20 hover:bg-white/15'
                }`}
                aria-label={muted ? 'Réactiver le micro' : 'Couper le micro'}
              >
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={toggleLive}
                className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 transition flex items-center justify-center shadow-2xl shadow-rose-900/40 ring-4 ring-rose-500/20"
                aria-label="Terminer l'appel"
              >
                <X className="w-7 h-7" />
              </button>
              <button
                onClick={() => {
                  liveRef.current = false;
                  setLiveMode(false);
                  try { recRef.current?.abort?.(); } catch {}
                  try { recRef.current?.stop?.(); } catch {}
                  recRef.current = null;
                  setListening(false);
                  setInterim('');
                  stopMicMeter();
                  setCallStartedAt(null);
                  speakGenRef.current++;
                  try { window.speechSynthesis.cancel(); } catch {}
                  speakingRef.current = false;
                  setSpeaking(false);
                  setOpen(true);
                }}
                className="w-14 h-14 rounded-full bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/15 flex items-center justify-center"
                aria-label="Passer en chat"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
        {open && !liveMode && (
          <motion.div
            key="ai-panel"
            className="fixed bottom-44 right-4 z-[9990] w-[min(92vw,400px)] h-[min(72vh,600px)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #fefcff 45%, #fff5f9 100%)',
              boxShadow: speaking
                ? '0 24px 48px -16px rgba(16,185,129,0.45), 0 0 0 1px rgba(16,185,129,0.35)'
                : thinking
                  ? '0 24px 48px -16px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.35)'
                  : listening
                    ? '0 24px 48px -16px rgba(244,114,182,0.45), 0 0 0 1px rgba(244,114,182,0.35)'
                    : '0 24px 48px -18px rgba(30,91,255,0.18), 0 0 0 1px #E6EAF2',
              transition: 'box-shadow 0.4s ease',
            }}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            {/* Aurora animée en fond */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)', filter: 'blur(28px)' }}
              animate={{ x: [0, 20, -10, 0], y: [0, 14, -8, 0], scale: [1, 1.08, 0.96, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-14 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)', filter: 'blur(32px)' }}
              animate={{ x: [0, -18, 12, 0], y: [0, -10, 8, 0], scale: [1, 1.12, 0.94, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute top-1/3 -right-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.22), transparent 70%)', filter: 'blur(24px)' }}
              animate={{ x: [0, 8, -6, 0], y: [0, -12, 6, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Bandeau lumineux animé */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(244,114,182,0.9), rgba(99,102,241,0.9), rgba(16,185,129,0.9), transparent)' }}
              animate={{ backgroundPositionX: ['0%', '200%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative px-4 py-3 bg-white/70 backdrop-blur-sm border-b border-[#E6EAF2] flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-full bg-white ring-1 ring-[#E6EAF2] flex items-center justify-center overflow-hidden shrink-0">
                <img src={logoBrand} alt="Healthy Page" className="w-8 h-8 object-contain" />
                {speaking && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="leading-tight truncate flex items-center gap-1.5">
                  <HealthyPage className="text-xs tracking-wide" />
                  <span className="text-slate-500 text-xs">· Assistant</span>
                  {liveMode && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] ring-1 ring-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.account ? `${user.honorific ? user.honorific + ' ' : ''}${user.displayName}` : (user.role ? `Rôle : ${user.role}` : 'Invité')} · {locale.toUpperCase()}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="h-8 px-2.5 rounded-full bg-white ring-1 ring-[#1E5BFF]/30 hover:ring-[#1E5BFF] text-[#1E5BFF] inline-flex items-center gap-1.5 shadow-sm"
                  aria-label="Langue"
                  title={`Langue : ${locale.toUpperCase()}`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] tracking-wide" style={{ fontWeight: 700 }}>{locale.toUpperCase()}</span>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setLangOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-60 max-h-80 overflow-y-auto rounded-xl bg-white ring-1 ring-[#E6EAF2] shadow-2xl z-[60] p-1">
                      {LOCALES.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => { setLocale(l.id as Locale); setLangOpen(false); }}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm ${l.id === locale ? 'bg-[#E2ECFF] text-[#1E5BFF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          <span className={`inline-flex items-center justify-center min-w-[34px] h-6 px-1.5 rounded-md text-[11px] tracking-wide ${l.id === locale ? 'bg-[#1E5BFF] text-white' : 'bg-slate-100 text-slate-700'}`} style={{ fontWeight: 700 }}>
                            {String(l.id).toUpperCase()}
                          </span>
                          <span className="w-5 text-base leading-none">{l.flag}</span>
                          <span className="flex-1">{l.native}</span>
                          {l.id === locale && <Check className="w-3.5 h-3.5 text-[#1E5BFF]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setVoiceOn((v) => !v)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                title={voiceOn ? 'Couper la voix' : 'Activer la voix'}
              >
                {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { shutUp(); stopListen(); setOpen(false); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live mode banner */}
            {liveMode && (
              <div className="relative px-3 py-2 bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border-b border-rose-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span className="text-[12px] text-rose-700 flex-1">
                  {speaking ? 'Je réponds…' : listening ? 'Je vous écoute…' : 'Mode conversation continue'}
                </span>
                <button
                  onClick={toggleLive}
                  className="text-[11px] px-2 py-1 rounded-full bg-white ring-1 ring-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Quitter
                </button>
              </div>
            )}

            {historyGroups.length > 0 && (
              <div className="relative px-3 pt-2 pb-1 bg-white/80 backdrop-blur-sm border-b border-[#E6EAF2]">
                <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1 py-1">
                  <button
                    onClick={() => setHistoryOpen((v) => !v)}
                    className="hover:text-slate-800"
                  >
                    Historique par sujet ({historyGroups.length}) {historyOpen ? '▾' : '▸'}
                  </button>
                  <span className="inline-flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm("Effacer tout l'historique des échanges avec l'IA ?")) {
                          try { localStorage.removeItem(HISTORY_KEY); } catch {}
                          setHistoryGroups([]);
                        }
                      }}
                      className="px-2 py-0.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                    >
                      Effacer
                    </button>
                  </span>
                </div>
                {historyOpen && (
                  <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {historyGroups.map((g) => {
                      const meta = TOPIC_LABEL[g.topic];
                      return (
                        <div key={g.topic} className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${meta.tone}`}>
                            {meta.label}
                            <span className="opacity-70 ml-1">· {g.items.length}</span>
                          </span>
                          {g.items.slice(0, 3).map((it) => (
                            <button
                              key={it.ts}
                              onClick={() => send(it.q)}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-slate-50 hover:bg-[#E2ECFF] hover:text-[#1E5BFF] text-slate-600 ring-1 ring-slate-200 truncate max-w-[180px]"
                              title={it.q}
                            >
                              {it.title}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: 'linear-gradient(180deg, rgba(248,250,255,0.6) 0%, rgba(255,245,251,0.55) 100%)' }}>
              {msgs.map((m, idx) => {
                const isLastAi = m.role === 'ai' && idx === msgs.length - 1;
                const echo = speaking && isLastAi;
                return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, delay: Math.min(idx, 3) * 0.03, ease: 'easeOut' }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="relative max-w-[85%]">
                    {echo && [0, 0.5, 1].map((d) => (
                      <motion.span
                        key={`echo-${d}`}
                        aria-hidden
                        className="absolute inset-0 rounded-2xl rounded-bl-sm pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.45), transparent 70%)' }}
                        initial={{ scale: 1, opacity: 0.55 }}
                        animate={{ scale: 1.25, opacity: 0 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: d }}
                      />
                    ))}
                    {echo && (
                      <motion.span
                        aria-hidden
                        className="absolute -inset-0.5 rounded-2xl rounded-bl-sm pointer-events-none"
                        style={{ boxShadow: '0 0 0 0 rgba(16,185,129,0.55)' }}
                        animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.55)', '0 0 0 10px rgba(16,185,129,0)'] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <div className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'text-white rounded-br-sm whitespace-pre-wrap'
                        : 'bg-white/85 backdrop-blur-sm ring-1 ring-[#E6EAF2] text-slate-800 rounded-bl-sm'
                    }`} style={m.role === 'user' ? { background: 'linear-gradient(135deg, #1E5BFF 0%, #6F8BFF 100%)' } : undefined}>
                      {m.role === 'ai' ? <RichMessage text={m.text} /> : m.text}
                    </div>
                  </div>
                  {m.recallQuery && (
                    <button
                      onClick={() => send(m.recallQuery!)}
                      className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E2ECFF] text-[#1E5BFF] text-[12px] font-semibold hover:bg-[#D0E0FF] ring-1 ring-[#1E5BFF]/15"
                    >
                      <Zap className="w-3 h-3" />
                      Reprendre : « {summarizeQuery(m.recallQuery)} »
                    </button>
                  )}
                </motion.div>
                );
              })}
              {interim && !liveMode && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm bg-[#1E5BFF]/70 text-white italic">
                    {interim}<span className="ml-0.5 inline-block w-1 h-3 align-middle bg-white/80 animate-pulse" />
                  </div>
                </div>
              )}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-white ring-1 ring-[#E6EAF2] rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> je réfléchis…
                  </div>
                </div>
              )}
            </div>

            {!liveMode && (
              <div className="relative px-3 py-2 border-t border-[#E6EAF2] bg-white/75 backdrop-blur-sm">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                  {section.suggestions.map((s, i) => (
                    <motion.button
                      key={s.label + section.label}
                      onClick={() => send(s.q)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative shrink-0 px-3 py-1.5 rounded-full text-[12px] text-slate-700 inline-flex items-center gap-1 overflow-hidden ring-1 ring-[#E6EAF2]"
                      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 50%, #fff0f7 100%)' }}
                    >
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.85) 50%, transparent 70%)' }}
                        animate={{ x: ['-120%', '120%'] }}
                        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 + i * 0.4, ease: 'easeInOut' }}
                      />
                      <Zap className="relative w-3 h-3 text-[#1E5BFF]" />
                      <span className="relative">{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative p-2 border-t border-[#E6EAF2] bg-white/85 backdrop-blur-sm flex items-center gap-2">
              {supportsSTT && (
                <button
                  onClick={toggleLive}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                    liveMode ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={liveMode ? 'Quitter le mode Live' : 'Activer le mode Live (échange vocal continu)'}
                >
                  <Radio className={`w-5 h-5 ${liveMode ? 'animate-pulse' : ''}`} />
                </button>
              )}
              {supportsSTT && !liveMode && (
                <button
                  onClick={listening ? stopListen : startListen}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    listening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={listening ? 'Arrêter' : 'Parler'}
                >
                  {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <input
                value={input}
                onChange={(e) => { if (speakingRef.current) shutUp(); setInput(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
                placeholder={placeholder}
                className="flex-1 h-10 px-3 rounded-full bg-slate-100 outline-none text-sm focus:ring-2 focus:ring-[#1E5BFF]/30"
                data-no-translate="true"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#1E5BFF] text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ol'; items: string[] }
  | { kind: 'ul'; items: string[] };

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flushP = () => {
    if (buf.length) {
      blocks.push({ kind: 'p', text: buf.join(' ').trim() });
      buf = [];
    }
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { flushP(); i++; continue; }
    const ol = line.match(/^\s*(\d+)[\.\)]\s+(.+)$/);
    const ul = line.match(/^\s*[-•·]\s+(.+)$/);
    if (ol) {
      flushP();
      const items: string[] = [ol[2].trim()];
      i++;
      while (i < lines.length) {
        const m = lines[i].match(/^\s*(\d+)[\.\)]\s+(.+)$/);
        if (!m) {
          if (lines[i].match(/^\s{2,}\S/) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
          break;
        }
        items.push(m[2].trim()); i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }
    if (ul) {
      flushP();
      const items: string[] = [ul[1].trim()];
      i++;
      while (i < lines.length) {
        const m = lines[i].match(/^\s*[-•·]\s+(.+)$/);
        if (!m) {
          if (lines[i].match(/^\s{2,}\S/) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
          break;
        }
        items.push(m[1].trim()); i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    buf.push(line);
    i++;
  }
  flushP();
  return blocks;
}

function RichMessage({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  if (blocks.length === 1 && blocks[0].kind === 'p') {
    return <span className="whitespace-pre-wrap">{blocks[0].text}</span>;
  }
  return (
    <div className="space-y-2 leading-relaxed">
      {blocks.map((b, i) => {
        if (b.kind === 'p') return <p key={i} className="whitespace-pre-wrap">{b.text}</p>;
        if (b.kind === 'ol') {
          return (
            <ol key={i} className="space-y-1.5 mt-1">
              {b.items.map((it, k) => (
                <li key={k} className="flex gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#1E5BFF] text-white text-[11px] tabular-nums" style={{ fontWeight: 700 }}>
                    {k + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{it}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <ul key={i} className="space-y-1.5 mt-1">
            {b.items.map((it, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#1E5BFF]" />
                <span className="flex-1">{it}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export default AIAssistant;
