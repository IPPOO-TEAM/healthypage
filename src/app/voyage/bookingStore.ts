// Mini-store de réservations adossé au localStorage.
// Pas de backend : on persiste localement comme une vraie app de booking en démo.

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  lieuId: string;
  startISO: string;
  endISO: string;
  nights: number;
  guestsAdults: number;
  guestsChildren: number;
  rooms: number;
  roomType: string;
  pricePerNight: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  currency: 'FCFA';
  options: string[];
  contactEmail: string;
  contactPhone: string;
  status: BookingStatus;
  createdAtISO: string;
  reference: string;
}

const KEY = 'voyage:bookings';

export function listBookings(): Booking[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]') as Booking[];
  } catch {
    return [];
  }
}

export function saveBookings(list: Booking[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function addBooking(b: Booking) {
  const list = listBookings();
  list.unshift(b);
  saveBookings(list);
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  const list = listBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBookings(list);
}

export function getBooking(id: string): Booking | undefined {
  return listBookings().find((b) => b.id === id);
}

export function makeReference() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HP-${t.slice(-4)}-${r}`;
}

export function ensureBookingSeed() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return;
    const seed: Booking[] = [
      {
        id: 'bk-seed-1',
        lieuId: 'saly-renaissance',
        startISO: '2026-06-12', endISO: '2026-06-17',
        nights: 5, guestsAdults: 2, guestsChildren: 0, rooms: 1, roomType: 'Supérieure',
        pricePerNight: 145000, subtotal: 725000, taxes: 54375, fees: 4500, total: 783875,
        currency: 'FCFA',
        options: ['Transfert privé', 'Petit-déjeuner inclus'],
        contactEmail: 'vous@exemple.com', contactPhone: '+221 77 000 00 00',
        status: 'confirmed',
        createdAtISO: '2026-04-22T10:12:00.000Z',
        reference: 'HP-A1B2-C3D4',
      },
      {
        id: 'bk-seed-2',
        lieuId: 'marrakech-medina',
        startISO: '2026-09-04', endISO: '2026-09-08',
        nights: 4, guestsAdults: 2, guestsChildren: 1, rooms: 1, roomType: 'Suite',
        pricePerNight: 220000, subtotal: 880000, taxes: 66000, fees: 4500, total: 950500,
        currency: 'FCFA',
        options: ['Hammam privé'],
        contactEmail: 'vous@exemple.com', contactPhone: '+221 77 000 00 00',
        status: 'pending',
        createdAtISO: '2026-05-02T18:30:00.000Z',
        reference: 'HP-E5F6-G7H8',
      },
      {
        id: 'bk-seed-3',
        lieuId: 'casamance-zen',
        startISO: '2026-02-15', endISO: '2026-02-19',
        nights: 4, guestsAdults: 2, guestsChildren: 0, rooms: 1, roomType: 'Standard',
        pricePerNight: 95000, subtotal: 380000, taxes: 28500, fees: 4500, total: 413000,
        currency: 'FCFA',
        options: ['Excursion pirogue'],
        contactEmail: 'vous@exemple.com', contactPhone: '+221 77 000 00 00',
        status: 'completed',
        createdAtISO: '2026-01-10T09:00:00.000Z',
        reference: 'HP-J9K0-L1M2',
      },
    ];
    saveBookings(seed);
  } catch {}
}

// ---------- Avis ----------

export interface Review {
  id: string;
  lieuId: string;
  author: string;
  ratingOverall: number;
  ratingCleanliness: number;
  ratingService: number;
  ratingLocation: number;
  ratingComfort: number;
  title: string;
  body: string;
  stayMonthISO: string; // YYYY-MM
  createdAtISO: string;
  helpful: number;
}

const REV_KEY = 'voyage:reviews';

export function listReviews(lieuId?: string): Review[] {
  try {
    const all = JSON.parse(window.localStorage.getItem(REV_KEY) || '[]') as Review[];
    return lieuId ? all.filter((r) => r.lieuId === lieuId) : all;
  } catch { return []; }
}

export function addReview(r: Review) {
  try {
    const all = JSON.parse(window.localStorage.getItem(REV_KEY) || '[]') as Review[];
    all.unshift(r);
    window.localStorage.setItem(REV_KEY, JSON.stringify(all));
  } catch {}
}

// Avis pré-remplis pour rendre les fiches vivantes dès le premier lancement
export const SEED_REVIEWS: Omit<Review, 'id' | 'createdAtISO'>[] = [
  {
    lieuId: 'saly-evasion',
    author: 'Aïssatou D.',
    ratingOverall: 5, ratingCleanliness: 5, ratingService: 5, ratingLocation: 5, ratingComfort: 5,
    title: 'Une parenthèse rare',
    body: "Le souffle de l'océan, la propreté irréprochable, l'équipe attentive. Je suis repartie reposée comme jamais.",
    stayMonthISO: '2026-03', helpful: 12,
  },
  {
    lieuId: 'saly-evasion',
    author: 'Mamadou S.',
    ratingOverall: 4, ratingCleanliness: 5, ratingService: 4, ratingLocation: 5, ratingComfort: 4,
    title: 'Très bon rapport qualité-prix',
    body: "Plage à deux pas, chambre lumineuse. Le petit-déjeuner gagnerait à proposer plus de fruits locaux.",
    stayMonthISO: '2026-02', helpful: 4,
  },
  {
    lieuId: 'saly-evasion',
    author: 'Claire M.',
    ratingOverall: 5, ratingCleanliness: 5, ratingService: 5, ratingLocation: 4, ratingComfort: 5,
    title: 'On y retournera',
    body: "Massage au bord de l'eau extraordinaire. Le silence du soir vaut tout l'or du monde.",
    stayMonthISO: '2026-01', helpful: 8,
  },
  {
    lieuId: 'casamance-bolong',
    author: 'Yann P.',
    ratingOverall: 5, ratingCleanliness: 4, ratingService: 5, ratingLocation: 5, ratingComfort: 4,
    title: 'Hors du temps',
    body: "Les bolongs au lever du jour, c'est saisissant. Hospitalité magnifique.",
    stayMonthISO: '2026-04', helpful: 10,
  },
  {
    lieuId: 'marrakech-medina',
    author: 'Salma R.',
    ratingOverall: 5, ratingCleanliness: 5, ratingService: 5, ratingLocation: 5, ratingComfort: 5,
    title: 'Riad enchanteur',
    body: "Le hammam le soir, les zelliges turquoise, la table d'hôte. Un coup au cœur.",
    stayMonthISO: '2026-02', helpful: 15,
  },
  {
    lieuId: 'zanzibar-east',
    author: 'Diego F.',
    ratingOverall: 5, ratingCleanliness: 5, ratingService: 4, ratingLocation: 5, ratingComfort: 5,
    title: 'Un Zanzibar authentique',
    body: "Plage à perte de vue, équipe locale formidable, cuisine swahilie au top.",
    stayMonthISO: '2026-03', helpful: 6,
  },
];

export function ensureReviewSeed() {
  try {
    const raw = window.localStorage.getItem(REV_KEY);
    if (raw) return;
    const now = new Date();
    const seeded: Review[] = SEED_REVIEWS.map((r, i) => ({
      ...r,
      id: `seed-${i}`,
      createdAtISO: new Date(now.getTime() - (i + 1) * 86400000 * 7).toISOString(),
    }));
    window.localStorage.setItem(REV_KEY, JSON.stringify(seeded));
  } catch {}
}

// ---------- Messagerie hôtes ----------

export interface MessageThread {
  id: string;
  lieuId: string;
  hostName: string;
  lastSeenISO: string;
  messages: { id: string; from: 'me' | 'host'; body: string; atISO: string }[];
}

const MSG_KEY = 'voyage:threads';

export function listThreads(): MessageThread[] {
  try { return JSON.parse(window.localStorage.getItem(MSG_KEY) || '[]') as MessageThread[]; }
  catch { return []; }
}

export function saveThreads(list: MessageThread[]) {
  try { window.localStorage.setItem(MSG_KEY, JSON.stringify(list)); } catch {}
}

export function ensureThreadSeed() {
  if (listThreads().length) return;
  const now = Date.now();
  const seed: MessageThread[] = [
    {
      id: 'th-saly',
      lieuId: 'saly-evasion',
      hostName: 'Fatou (Saly Évasion)',
      lastSeenISO: new Date(now - 3600 * 1000).toISOString(),
      messages: [
        { id: 'm1', from: 'host', body: 'Bonjour ! Heureuse de vous accueillir bientôt. Avez-vous des préférences alimentaires ?', atISO: new Date(now - 7200_000).toISOString() },
        { id: 'm2', from: 'me', body: 'Bonjour Fatou, je suis pesco-végétarien, est-ce possible ?', atISO: new Date(now - 5400_000).toISOString() },
        { id: 'm3', from: 'host', body: 'Bien sûr, notre cheffe préparera un menu adapté. À très vite !', atISO: new Date(now - 3600_000).toISOString() },
      ],
    },
    {
      id: 'th-marrakech',
      lieuId: 'marrakech-medina',
      hostName: 'Yassine (Riad Medina)',
      lastSeenISO: new Date(now - 86400_000).toISOString(),
      messages: [
        { id: 'm1', from: 'host', body: 'Bienvenue ! Souhaitez-vous une navette aéroport ?', atISO: new Date(now - 90000_000).toISOString() },
      ],
    },
  ];
  saveThreads(seed);
}
