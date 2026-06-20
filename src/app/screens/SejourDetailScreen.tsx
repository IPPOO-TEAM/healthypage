import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, MapPin, Star, Heart, Calendar, Sun, Moon,
  Coffee, Utensils, Activity, Sparkles, Stethoscope, ShieldCheck,
  CheckCircle2, Users, Hotel, Wifi, Car, Plane, Clock, Share2,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { BookingCalendar } from '../components/BookingCalendar';
import { usePatientPreferences } from '../components/useStoredState';

interface DayProgram {
  title: string;
  hero: string;
  blocks: { time: string; Icon: any; title: string; desc: string }[];
}

interface Sejour {
  id: string;
  name: string;
  destination: string;
  region: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  durationLabel: string;
  hero: string;
  gallery: string[];
  pitch: string;
  long: string;
  highlights: string[];
  amenities: { Icon: any; label: string }[];
  blockedDates: string[];
  program: DayProgram[];
}

const SEJOURS: Record<string, Sejour> = {
  'saly-renaissance': {
    id: 'saly-renaissance',
    name: 'Saly Renaissance',
    destination: 'Saly Portudal',
    region: 'Petite Côte, Sénégal',
    rating: 4.9,
    reviews: 218,
    pricePerNight: 65000,
    durationLabel: '3 à 7 nuits',
    hero: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ],
    pitch: 'Thalasso, soins du corps et bilan santé en bord de mer.',
    long:
      "Le séjour Saly Renaissance combine la douceur de la Petite Côte sénégalaise avec un programme bien-être encadré par notre équipe HEALTHY PAGE. Hébergement quatre étoiles, cuisine équilibrée signée par un chef nutritionniste, et accompagnement médical continu — depuis le bilan pré-départ jusqu'aux constantes de retour. Idéal pour se ressourcer après une période de stress, préparer une convalescence ou tout simplement reconnecter le corps et l'esprit.",
    highlights: [
      'Bilan santé complet avant départ',
      'Suivi téléconsultation 7j/7 pendant le séjour',
      'Cuisine méditerranéenne adaptée à votre profil',
      'Soins thalasso et massages biquotidiens',
      'Sorties pirogue et marche méditative encadrées',
      'Ordonnance et constantes de retour',
    ],
    amenities: [
      { Icon: Hotel, label: 'Hôtel 4★ vue mer' },
      { Icon: Wifi, label: 'Wifi haut débit' },
      { Icon: Car, label: 'Transferts inclus' },
      { Icon: Plane, label: 'Aéroport AIBD à 1h15' },
    ],
    blockedDates: ['2026-05-12', '2026-05-13', '2026-05-14', '2026-05-22', '2026-06-03', '2026-06-04'],
    program: [
      {
        title: 'Jour 1 — Arrivée & accueil',
        hero: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900',
        blocks: [
          { time: '14:00', Icon: Plane, title: 'Transfert depuis Dakar', desc: "Accueil personnalisé à AIBD, transfert privé climatisé jusqu'à Saly." },
          { time: '16:00', Icon: Stethoscope, title: 'Bilan d\'arrivée', desc: 'Mesure des constantes, entretien santé avec votre médecin référent du séjour.' },
          { time: '19:00', Icon: Utensils, title: 'Dîner d\'accueil', desc: 'Menu équilibré africain, présentation du programme et de l\'équipe.' },
        ],
      },
      {
        title: 'Jour 2 — Détox & ressourcement',
        hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900',
        blocks: [
          { time: '07:00', Icon: Sun, title: 'Yoga matinal sur la plage', desc: 'Salutations au soleil et exercices de respiration face à l\'océan.' },
          { time: '09:00', Icon: Coffee, title: 'Petit-déjeuner détox', desc: 'Bowl de fruits, jus pressés, infusions de plantes locales.' },
          { time: '11:00', Icon: Activity, title: 'Modelage hydrothérapique', desc: '60 minutes de soin thalasso aux algues et eau de mer chauffée.' },
          { time: '15:00', Icon: Sparkles, title: 'Atelier cohérence cardiaque', desc: 'Apprentissage de la technique 365 et exercices guidés.' },
          { time: '19:30', Icon: Utensils, title: 'Dîner low-FODMAP', desc: 'Poisson grillé, légumes locaux, dessert allégé et tisane digestive.' },
        ],
      },
      {
        title: 'Jour 3 — Aventure douce',
        hero: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900',
        blocks: [
          { time: '06:30', Icon: Sun, title: 'Marche méditative', desc: '5 km au bord de l\'océan avec guide de pleine conscience.' },
          { time: '10:00', Icon: MapPin, title: 'Excursion à Joal-Fadiouth', desc: 'Île aux coquillages, marché local, déjeuner chez l\'habitant.' },
          { time: '17:00', Icon: Activity, title: 'Soin pierres chaudes', desc: 'Massage profond pour relâcher les tensions accumulées.' },
          { time: '20:00', Icon: Moon, title: 'Cercle de parole', desc: 'Échange en petit comité animé par notre psychologue partenaire.' },
        ],
      },
      {
        title: 'Jour 4 — Bilan & départ',
        hero: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900',
        blocks: [
          { time: '07:30', Icon: Sun, title: 'Réveil musculaire', desc: 'Étirements doux et préparation du corps pour le retour.' },
          { time: '10:00', Icon: Stethoscope, title: 'Bilan de sortie', desc: 'Mesure des constantes, comparaison avec l\'arrivée, ordonnance personnalisée.' },
          { time: '12:00', Icon: Utensils, title: 'Déjeuner d\'au revoir', desc: 'Buffet santé inspiré de la cuisine africaine moderne.' },
          { time: '14:00', Icon: Plane, title: 'Transfert AIBD', desc: 'Retour vers l\'aéroport ou prolongation possible sur demande.' },
        ],
      },
    ],
  },
  'casamance-zen': {
    id: 'casamance-zen',
    name: 'Casamance Zen',
    destination: 'Cap Skirring',
    region: 'Casamance, Sénégal',
    rating: 4.8,
    reviews: 142,
    pricePerNight: 55000,
    durationLabel: '4 à 7 nuits',
    hero: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ],
    pitch: 'Forêts, traditions diolas et écotourisme bien-être.',
    long:
      "Au cœur de la Casamance, ce séjour allie immersion culturelle et programme santé doux. Logement en éco-lodge, repas issus des cultures locales, randonnées guidées et soins traditionnels respectueux. Accompagnement médical à distance avec téléconsultations programmées et trousse de voyage adaptée à la zone.",
    highlights: [
      'Hébergement éco-responsable',
      'Pharmacopée traditionnelle locale',
      'Cuisine biologique de saison',
      'Pirogue, marche en forêt et yoga',
      'Téléconsultation matin et soir',
      'Carnet de voyage santé numérique',
    ],
    amenities: [
      { Icon: Hotel, label: 'Éco-lodge nature' },
      { Icon: Wifi, label: 'Wifi en zone commune' },
      { Icon: Car, label: 'Navettes incluses' },
      { Icon: Plane, label: 'Vol intérieur Dakar-ZIG' },
    ],
    blockedDates: ['2026-05-08', '2026-05-09', '2026-05-25', '2026-06-10'],
    program: [
      {
        title: 'Jour 1 — Bienvenue en Casamance',
        hero: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900',
        blocks: [
          { time: '12:00', Icon: Plane, title: 'Vol Dakar → Ziguinchor', desc: 'Vol intérieur d\'1h, accueil et transfert en pirogue jusqu\'au lodge.' },
          { time: '17:00', Icon: Stethoscope, title: 'Check-in santé', desc: 'Constantes, profil voyage et briefing prévention paludisme.' },
          { time: '19:30', Icon: Utensils, title: 'Dîner traditionnel', desc: 'Riz au poisson, jus de bouye, présentation de la pharmacopée locale.' },
        ],
      },
      {
        title: 'Jour 2 — Forêt sacrée & yoga',
        hero: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900',
        blocks: [
          { time: '06:30', Icon: Sun, title: 'Yoga sur ponton', desc: 'Séance douce face aux bolongs, respiration et étirements.' },
          { time: '10:00', Icon: MapPin, title: 'Visite de forêt sacrée', desc: 'Marche guidée par un chef coutumier, découverte des plantes médicinales.' },
          { time: '15:00', Icon: Sparkles, title: 'Soin au beurre de karité', desc: 'Massage corps entier au karité brut chauffé, ambiance feutrée.' },
          { time: '20:00', Icon: Moon, title: 'Veillée diola', desc: 'Contes et percussions autour d\'un feu, infusion de plantes.' },
        ],
      },
      {
        title: 'Jour 3 — Pirogue & nutrition',
        hero: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900',
        blocks: [
          { time: '07:00', Icon: Coffee, title: 'Petit-déjeuner local', desc: 'Beignets de mil, fruits frais, infusion de kinkéliba.' },
          { time: '09:00', Icon: MapPin, title: 'Pirogue dans les bolongs', desc: 'Observation des oiseaux, mangroves, escale plage déserte.' },
          { time: '14:00', Icon: Utensils, title: 'Atelier cuisine bien-être', desc: 'Préparation d\'un menu équilibré avec une cheffe diola.' },
          { time: '18:00', Icon: Activity, title: 'Étirements & relaxation', desc: 'Séance encadrée pour clôturer la journée en douceur.' },
        ],
      },
      {
        title: 'Jour 4 — Bilan & retour',
        hero: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900',
        blocks: [
          { time: '08:00', Icon: Stethoscope, title: 'Bilan final', desc: 'Constantes, conseils de retour et plan de prévention.' },
          { time: '10:00', Icon: Sparkles, title: 'Soin des pieds', desc: 'Réflexologie plantaire pour un retour serein.' },
          { time: '12:30', Icon: Utensils, title: 'Déjeuner d\'au revoir', desc: 'Plateau de fruits de mer et dessert mangue-bissap.' },
          { time: '15:00', Icon: Plane, title: 'Retour Dakar', desc: 'Transfert pirogue + vol, livraison du carnet de voyage santé.' },
        ],
      },
    ],
  },
};

interface Props { sejourId?: string }

export default function SejourDetailScreen({ sejourId = 'saly-renaissance' }: Props) {
  const sejour = useMemo(() => SEJOURS[sejourId] ?? SEJOURS['saly-renaissance'], [sejourId]);
  const [activeDay, setActiveDay] = useState(0);
  const [confirmed, setConfirmed] = useState<{ startISO: string; endISO: string; nights: number; total: number } | null>(null);
  const { prefs, update, toggleSejourFavorite, isSejourFavorite } = usePatientPreferences();
  const fav = isSejourFavorite(sejour.id);

  const onConfirm = (data: { startISO: string; endISO: string; nights: number; total: number }) => {
    setConfirmed(data);
    update({
      lastBooking: { sejourId: sejour.id, startISO: data.startISO, nights: data.nights, guests: 2 },
      preferredDestination: sejour.destination,
    });
  };

  const fmtFR = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-screen overflow-y-auto bg-white">
      <LandingNav onStart={() => { window.location.href = '/auth?from=Sejour'; }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[40vh] sm:h-[55vh] w-full overflow-hidden">
          <ImageWithFallback src={sejour.hero} alt={sejour.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-6xl mx-auto px-4 pb-8 text-white">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <a href="/voyage-loisirs" className="hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Voyage & Loisirs
              </a>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {sejour.region}</span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">{sejour.name}</h1>
            <p className="mt-2 text-white/90 max-w-2xl">{sejour.pitch}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                {sejour.rating} · {sejour.reviews} avis
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" /> {sejour.durationLabel}
              </span>
              <button
                onClick={() => toggleSejourFavorite(sejour.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${fav ? 'bg-rose-500 text-white' : 'bg-white/15 backdrop-blur hover:bg-white/25'}`}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
                {fav ? 'Favori' : 'Ajouter aux favoris'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">À propos de ce séjour</h2>
            <p className="mt-3 text-slate-700 leading-relaxed">{sejour.long}</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sejour.amenities.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                  <Icon className="w-4 h-4 text-sky-600 flex-shrink-0" /> {label}
                </div>
              ))}
            </div>
          </section>

          {/* Gallery */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sejour.gallery.map((src, i) => (
                <ImageWithFallback key={i} src={src} alt={`Vue ${i + 1}`} className="aspect-square object-cover w-full rounded-xl" />
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Ce qui est inclus</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {sejour.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Day-by-day program */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Programme jour par jour</h2>
              <span className="text-xs text-slate-500">{sejour.program.length} jours</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
              {sejour.program.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                    activeDay === i
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  Jour {i + 1}
                </button>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <ImageWithFallback src={sejour.program[activeDay].hero} alt={sejour.program[activeDay].title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <div className="font-bold text-lg text-slate-900">{sejour.program[activeDay].title}</div>
                <ol className="mt-4 relative border-l border-slate-200 ml-2 space-y-5">
                  {sejour.program[activeDay].blocks.map((b, j) => (
                    <li key={j} className="ml-5">
                      <div className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 ring-4 ring-white" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{b.time}</span>
                        <b.Icon className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold text-slate-900">{b.title}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </div>

        {/* Right column — sticky booking */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="lg:sticky lg:top-24 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{sejour.pricePerNight.toLocaleString('fr-FR')}</div>
                  <div className="text-xs text-slate-500">FCFA / nuit / personne</div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {sejour.rating}
                </div>
              </div>
            </div>

            {confirmed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> Réservation confirmée
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                  <div><strong>Arrivée&nbsp;:</strong> {fmtFR(confirmed.startISO)}</div>
                  <div><strong>Départ&nbsp;:</strong> {fmtFR(confirmed.endISO)}</div>
                  <div><strong>Durée&nbsp;:</strong> {confirmed.nights} nuit{confirmed.nights > 1 ? 's' : ''}</div>
                  <div><strong>Total&nbsp;:</strong> {confirmed.total.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <p className="mt-4 text-xs text-slate-600">Un email de confirmation et votre carnet de voyage santé vous attendent dans votre tableau de bord patient.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href="/auth?from=Sejour" className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5">
                    Accéder au carnet <ArrowRight className="w-4 h-4" />
                  </a>
                  <button onClick={() => setConfirmed(null)} className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-sm font-medium">
                    Modifier
                  </button>
                </div>
              </div>
            ) : (
              <BookingCalendar
                blockedDates={sejour.blockedDates}
                pricePerNight={sejour.pricePerNight}
                onConfirm={onConfirm}
                initialStart={
                  prefs.lastBooking?.sejourId === sejour.id ? prefs.lastBooking?.startISO ?? null : null
                }
                initialNights={prefs.lastBooking?.nights ?? 3}
              />
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Annulation flexible
              </div>
              <p>Annulation gratuite jusqu'à 7 jours avant l'arrivée. Remboursement intégral en cas de contre-indication médicale.</p>
            </div>
          </div>
        </aside>
      </div>

      <LandingFooter accent="rose" onStart={() => { window.location.href = '/auth?from=Sejour'; }} />
    </div>
  );
}

export const SEJOUR_LIST = Object.values(SEJOURS).map((s) => ({
  id: s.id, name: s.name, destination: s.destination, region: s.region,
  pricePerNight: s.pricePerNight, rating: s.rating, reviews: s.reviews,
  hero: s.hero, pitch: s.pitch,
}));
