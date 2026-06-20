import {
  ArrowRight, Plane, MapPin, Compass, Sun, Hotel, ShieldCheck,
  Stethoscope, HeartHandshake, CheckCircle2, Globe, Leaf, Wind,
  Heart, Quote, Star, Briefcase, Phone, MessageCircle, Calendar,
  Users, Clock, Wallet, Syringe, Pill, Mountain, Waves, Tent,
  BookOpen, Award, Sparkles,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { SEJOUR_LIST } from './SejourDetailScreen';
import imgDesertMeditation from '../../imports/photo_1_2026-05-08_00-42-28.jpg';
import imgGlobeStetho from '../../imports/photo_3_2026-05-08_00-42-28.jpg';
import imgDesertYoga from '../../imports/photo_4_2026-05-08_00-42-28.jpg';
import imgWomenCircle from '../../imports/photo_5_2026-05-08_00-42-28.jpg';
import imgTravelInsurance from '../../imports/photo_6_2026-05-08_00-42-28.jpg';
import imgAirportLuggage from '../../imports/photo_7_2026-05-08_00-42-28.jpg';
import imgExtra2 from '../../imports/photo_2_2026-05-08_00-42-28.jpg';
import imgExtra9 from '../../imports/photo_9_2026-05-08_00-42-28.jpg';
import imgExtra10 from '../../imports/photo_10_2026-05-08_00-42-28.jpg';
import imgExtra11 from '../../imports/photo_11_2026-05-08_00-42-28.jpg';
import imgExtra12 from '../../imports/photo_12_2026-05-08_00-42-28.jpg';
import imgExtra13 from '../../imports/photo_13_2026-05-08_00-42-28.jpg';
import imgExtra14 from '../../imports/photo_14_2026-05-08_00-42-28.jpg';
import imgExtra15 from '../../imports/photo_15_2026-05-08_00-42-28.jpg';
import imgExtra16 from '../../imports/photo_16_2026-05-08_00-42-28.jpg';

interface Props { onBack?: () => void; onStart?: () => void }

const DESTINATIONS = [
  { name: 'Saly & Petite Côte', desc: 'Plages, thalasso et soins du corps en bord de mer.', tag: 'Sénégal', img: imgWomenCircle },
  { name: 'Lac Rose & Lompoul', desc: 'Évasion désertique, méditation et reconnexion intérieure.', tag: 'Sénégal', img: imgDesertMeditation },
  { name: 'Île de Gorée', desc: 'Patrimoine UNESCO, marche douce et ressourcement culturel.', tag: 'Sénégal', img: imgExtra2 },
  { name: 'Saint-Louis', desc: 'Patrimoine UNESCO, balades en pirogue, gastronomie locale.', tag: 'Nord', img: imgExtra9 },
  { name: 'Sine-Saloum', desc: 'Bolongs, mangroves et écotourisme bien-être.', tag: 'Sud', img: imgExtra10 },
  { name: 'Casamance', desc: 'Forêts, traditions diolas et séjours nature.', tag: 'Sud', img: imgExtra11 },
  { name: 'Ouidah & Grand-Popo', desc: 'Plages atlantiques, vaudou, balades patrimoniales.', tag: 'Bénin', img: imgExtra12 },
  { name: 'Ganvié & lac Nokoué', desc: 'Cité lacustre, pirogue silencieuse et art de vivre.', tag: 'Bénin', img: imgExtra13 },
  { name: 'Tata Somba & Atacora', desc: 'Montagnes sacrées, ethnies tamberma, randonnée douce.', tag: 'Nord', img: imgExtra14 },
];

const FORMULES = [
  { Icon: Hotel, title: 'Séjour Bien-être', desc: '3 à 7 jours en hôtel partenaire avec programme spa, nutrition et activités douces.', price: 'dès 89 000 FCFA / nuit', tone: 'from-sky-500 to-cyan-500' },
  { Icon: Stethoscope, title: 'Voyage Santé', desc: 'Bilan médical avant départ, suivi téléconsultation pendant le séjour, retour de constantes.', price: 'dès 145 000 FCFA / nuit', tone: 'from-emerald-500 to-teal-500' },
  { Icon: Compass, title: 'Aventure Loisirs', desc: 'Randonnées, pirogue, surf, yoga sur la plage encadrés par nos partenaires locaux.', price: 'dès 110 000 FCFA / nuit', tone: 'from-amber-500 to-orange-500' },
  { Icon: HeartHandshake, title: 'Retraite Séniors', desc: 'Cadre paisible, repas adaptés, accompagnement médical et activités intergénérationnelles.', price: 'dès 130 000 FCFA / nuit', tone: 'from-rose-500 to-pink-500' },
];

const INCLUDED = [
  'Bilan santé pré-départ et conseils vaccins',
  'Trousse voyage personnalisée + ordonnance numérique',
  'Téléconsultation 7j/7 pendant le séjour',
  'Hébergement partenaire avec cuisine équilibrée',
  'Activités encadrées (yoga, marche, soins)',
  'Assistance d\'urgence locale 24/7',
];

const STEPS = [
  { Icon: Calendar, title: 'Choisissez', desc: 'Sélectionnez votre formule, dates et destination depuis l\'app.' },
  { Icon: Stethoscope, title: 'Bilan santé', desc: 'Téléconsultation pré-départ avec un médecin partenaire.' },
  { Icon: Plane, title: 'Voyagez serein', desc: 'Trousse santé, assurance et carnet numérique prêts à l\'emploi.' },
  { Icon: Heart, title: 'Vivez le séjour', desc: 'Suivi médical à distance et activités encadrées chaque jour.' },
];

const RETREATS = [
  { name: 'Désert & Méditation', loc: 'Lompoul · Sénégal', days: '5 jours', img: imgDesertMeditation, tag: 'Bien-être' },
  { name: 'Yoga sous les dunes', loc: 'Erg Chebbi · Sahara', days: '7 jours', img: imgDesertYoga, tag: 'Yoga' },
  { name: 'Cercle de Sœurs', loc: 'Petite Côte · Sénégal', days: '4 jours', img: imgWomenCircle, tag: 'Sororité' },
];

const TESTIMONIALS = [
  { name: 'Aïssatou D.', loc: 'Dakar', text: 'Je suis revenue plus calme et en meilleure santé. Le bilan pré-départ m\'a vraiment rassurée.', rating: 5, img: imgExtra15 },
  { name: 'Patrick M.', loc: 'Cotonou', text: 'Une retraite au lac Rose magique. Le suivi médical pendant le séjour est un vrai plus.', rating: 5, img: imgExtra16 },
  { name: 'Mariam K.', loc: 'Abidjan', text: 'L\'équipe HEALTHY PAGE a tout organisé : bilan, trousse santé, vols, hôtel. Zéro stress.', rating: 5, img: imgWomenCircle },
];

const FAQ = [
  { q: 'Le bilan médical pré-départ est-il obligatoire ?', a: 'Oui, c\'est inclus dans toutes nos formules. Il garantit que vous voyagez dans les meilleures conditions et permet d\'anticiper vos traitements.' },
  { q: 'Puis-je partir avec une pathologie chronique ?', a: 'Absolument. Nos médecins partenaires adaptent chaque séjour (diabète, hypertension, asthme, grossesse...) avec un protocole sur mesure.' },
  { q: 'Quels vaccins prévoir ?', a: 'Notre médecin voyage vous remet une fiche personnalisée selon votre destination, votre âge et vos antécédents. Le rendez-vous vaccin peut être pris dans l\'app.' },
  { q: 'Que comprend l\'assistance 24/7 ?', a: 'Une ligne directe avec un médecin francophone, le rapatriement médical, l\'avance de frais hospitaliers et le relais avec les hôpitaux locaux.' },
  { q: 'Puis-je annuler ?', a: 'Annulation gratuite jusqu\'à 14 jours avant le départ. Au-delà, conditions selon le partenaire — détaillées sur chaque fiche séjour.' },
  { q: 'Y a-t-il un accompagnement pour les séniors ?', a: 'Oui, formule dédiée avec rythme adapté, repas équilibrés, accompagnant santé sur place et activités douces (marche, gym douce, ateliers mémoire).' },
];

const ACTIVITIES = [
  { Icon: Waves, name: 'Thalasso & spa', desc: 'Hammam, massages, hydrothérapie' },
  { Icon: Mountain, name: 'Randonnée douce', desc: 'Marche guidée, panoramas' },
  { Icon: Wind, name: 'Yoga & méditation', desc: 'Sessions matinales en plein air' },
  { Icon: Tent, name: 'Bivouac désert', desc: 'Nuits sous les étoiles' },
  { Icon: Leaf, name: 'Cuisine de saison', desc: 'Ateliers nutrition locale' },
  { Icon: BookOpen, name: 'Ateliers culture', desc: 'Patrimoine, contes, danses' },
  { Icon: Heart, name: 'Cercles de parole', desc: 'Espaces de partage' },
  { Icon: Compass, name: 'Excursions', desc: 'Pirogue, kayak, vélo' },
];

const TIMELINE = [
  { day: 'J-30', title: 'Réservation & bilan', desc: 'Choix du séjour, téléconsultation pré-départ, ordonnances et vaccins.' },
  { day: 'J-7', title: 'Préparation', desc: 'Trousse santé envoyée à domicile, briefing voyage, fiche destination.' },
  { day: 'J-1', title: 'Veille départ', desc: 'Rappel hydratation, derniers conseils médecin, check-list bagage.' },
  { day: 'Jour 1', title: 'Arrivée & accueil', desc: 'Transfert privé, mise au calme, première séance bien-être.' },
  { day: 'Jour 2-6', title: 'Programme', desc: 'Activités encadrées, soins, suivi quotidien des constantes.' },
  { day: 'Jour 7', title: 'Retour', desc: 'Bilan post-séjour, recommandations, rendez-vous de suivi.' },
];

const TRUSTED = [
  '+1 200 voyageurs accompagnés',
  '4,9/5 satisfaction sur 412 avis',
  'Médecins agréés au Sénégal & au Bénin',
  'Hôtels partenaires labellisés bien-être',
];

export default function VoyagePublicScreen({ onBack, onStart }: Props) {
  const start = onStart ?? (() => { window.location.href = '/auth?from=Voyage'; });
  return (
    <div className="h-screen overflow-y-auto bg-white">
      <LandingNav onStart={start} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-amber-50/40">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-sky-200/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[24rem] h-[24rem] bg-amber-200/40 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-sky-800 font-medium uppercase tracking-wide">
              <Plane className="w-3.5 h-3.5" /> Voyage & Loisirs HEALTHY PAGE
            </p>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Voyager léger, revenir en pleine santé.
            </h1>
            <p className="mt-5 text-slate-700 leading-relaxed text-[15px] sm:text-base">
              Notre rubrique <strong>Voyage & Loisirs</strong> imagine des séjours pensés autour du bien-être&nbsp;:
              destinations africaines authentiques, hôtels partenaires, activités douces et accompagnement médical
              continu. Avant, pendant et après votre voyage, votre santé reste suivie depuis l'application.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={start} className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold inline-flex items-center gap-2 shadow-md">
                Réserver un séjour <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#formules" className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:border-sky-300 text-slate-700 font-medium inline-flex items-center gap-2">
                Voir les formules
              </a>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {TRUSTED.map((t) => (
                <div key={t} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src={imgAirportLuggage}
              alt="Bagages, passeport et chapeau de paille à l'aéroport"
              className="w-full h-72 sm:h-[26rem] object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">Assistance 24/7</div>
                <div className="text-slate-500">Médecin francophone</div>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">4,9/5 · 412 avis</div>
                <div className="text-slate-500">Voyageurs vérifiés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRANDE BANNIÈRE — RETRAITE */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[420px] max-h-[560px] overflow-hidden">
          <ImageWithFallback src={imgDesertYoga} alt="Yoga collectif dans le désert" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/40 to-transparent" />
          <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-center text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Retraites bien-être</p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              Le voyage qui répare le corps et l'esprit.
            </h2>
            <p className="mt-4 max-w-xl text-white/90 leading-relaxed">
              Désert, océan, forêts sacrées : nos retraites combinent yoga, méditation, soins traditionnels et nutrition,
              encadrés par des praticiens locaux et un médecin référent.
            </p>
            <div className="mt-6">
              <button onClick={start} className="px-6 py-3 bg-white text-stone-900 hover:bg-amber-50 rounded-full font-semibold inline-flex items-center gap-2">
                Voir les retraites <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULES */}
      <section id="formules" className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-sky-800 font-medium uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5" /> Quatre formules
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Quatre façons de voyager avec nous</h2>
          <p className="mt-3 text-slate-600">Chaque formule combine soin, plaisir et sécurité médicale.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {FORMULES.map(({ Icon, title, desc, price, tone }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-sky-300 hover:shadow-md transition">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone} text-white flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-semibold text-slate-900">{title}</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{price}</span>
                <button onClick={start} className="text-sm font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1">
                  Réserver <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRÉPARATION MÉDICALE — split avec photo_3 */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <ImageWithFallback src={imgGlobeStetho} alt="Globe et stéthoscope — santé internationale" className="w-full h-80 sm:h-[26rem] object-cover rounded-3xl shadow-xl" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 border border-slate-100 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-wide">
                <Globe className="w-3.5 h-3.5" /> Médecine du voyage
              </div>
              <div className="mt-1 text-sm text-slate-700">Vaccins, paludisme, traitements chroniques — tout est anticipé.</div>
            </div>
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-emerald-800 font-medium uppercase tracking-wide">
              <Stethoscope className="w-3.5 h-3.5" /> Préparation médicale
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Voyager en pleine santé, ça se prépare.</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Notre équipe de médecins du voyage vous accompagne avant, pendant et après le séjour. Bilan complet,
              recommandations vaccinales, plan de traitement adapté à votre destination — vous partez tranquille.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { Icon: Syringe, label: 'Vaccins recommandés' },
                { Icon: Pill, label: 'Trousse santé livrée' },
                { Icon: Phone, label: 'Téléconsult. 24/7' },
                { Icon: Heart, label: 'Suivi post-retour' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-emerald-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS — 9 cartes avec image */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-amber-800 font-medium uppercase tracking-wide">
            <Sun className="w-3.5 h-3.5" /> Destinations
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Neuf escales bien-être en Afrique de l'Ouest</h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Du Sénégal au Bénin — patrimoine, plages, désert, montagne. Chaque destination est validée par nos référents santé.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DESTINATIONS.map((d) => (
            <article key={d.name} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-sky-300 hover:shadow-xl transition flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <ImageWithFallback src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-sky-700 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d.tag}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="font-bold text-slate-900">{d.name}</div>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed flex-1">{d.desc}</p>
                <button onClick={start} className="mt-4 self-start text-sm font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1">
                  Découvrir <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* RETRAITES IMMERSIVES — 3 cartes éditoriales */}
      <section className="bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 border-y border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs text-rose-800 font-medium uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Retraites signature
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Trois expériences qui transforment.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {RETREATS.map((r) => (
              <article key={r.name} className="relative h-96 rounded-3xl overflow-hidden group shadow-lg">
                <ImageWithFallback src={r.img} alt={r.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-700">{r.tag}</span>
                  <span className="bg-white/15 backdrop-blur border border-white/30 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.days}
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-200">{r.loc}</div>
                  <div className="mt-1 text-2xl font-bold leading-tight">{r.name}</div>
                  <button onClick={start} className="mt-4 px-4 py-2 bg-white text-stone-900 hover:bg-amber-50 rounded-full text-sm font-semibold inline-flex items-center gap-1.5">
                    Réserver <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FICHES SÉJOUR */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-sky-800 font-medium uppercase tracking-wide">
            <Hotel className="w-3.5 h-3.5" /> Fiches Séjour
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Choisissez votre séjour santé</h2>
          <p className="mt-3 text-slate-600">Programme jour par jour, calendrier de réservation, suivi médical inclus.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {SEJOUR_LIST.map((s) => (
            <a key={s.id} href={`/sejour/${s.id}`} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-sky-300 hover:shadow-xl transition flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback src={s.hero} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> {s.rating} · {s.reviews} avis
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-xs text-sky-700">
                  <MapPin className="w-3.5 h-3.5" /> {s.region}
                </div>
                <div className="mt-2 font-bold text-slate-900">{s.name}</div>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed flex-1">{s.pitch}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-slate-900">{s.pricePerNight.toLocaleString('fr-FR')}</span>
                    <span className="text-slate-500"> FCFA / nuit</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                    Voir la fiche <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* INCLUS — split avec mosaïque */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs text-emerald-800 font-medium uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" /> Inclus dans chaque séjour
          </p>
          <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight">Tout ce qu'il faut, rien à organiser.</h2>
          <ul className="mt-6 space-y-3">
            {INCLUDED.map((i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> {i}
              </li>
            ))}
          </ul>
          <div className="mt-7 inline-flex items-center gap-2 text-sm text-slate-500">
            <Wallet className="w-4 h-4" /> Paiement en 3× sans frais via Wave, MTN, Orange Money
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ImageWithFallback src={imgDesertYoga} alt="Yoga dans le désert" className="w-full h-44 object-cover rounded-2xl" />
          <ImageWithFallback src={imgGlobeStetho} alt="Globe et stéthoscope — santé internationale" className="w-full h-44 object-cover rounded-2xl mt-6" />
          <ImageWithFallback src={imgWomenCircle} alt="Cercle de femmes au coucher du soleil" className="w-full h-44 object-cover rounded-2xl" />
          <ImageWithFallback src={imgTravelInsurance} alt="Assurance voyage et avion" className="w-full h-44 object-cover rounded-2xl mt-6" />
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-cyan-50/40 border-y border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs text-sky-800 font-medium uppercase tracking-wide">
              <Compass className="w-3.5 h-3.5" /> Comment ça marche
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">De la réservation au retour, en 4 étapes.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ Icon, title, desc }, i) => (
              <div key={title} className="relative bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <div className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="mt-3 w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-4 font-semibold text-slate-900">{title}</div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITÉS — 8 mini cartes */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-rose-800 font-medium uppercase tracking-wide">
            <Heart className="w-3.5 h-3.5" /> Activités proposées
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Huit pratiques, mille bienfaits.</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ACTIVITIES.map(({ Icon, name, desc }) => (
            <div key={name} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-rose-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3 font-semibold text-slate-900">{name}</div>
              <p className="mt-1 text-xs text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs text-stone-700 font-medium uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" /> Itinéraire-type
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Un mois pour préparer, sept jours pour transformer.</h2>
          </div>
          <ol className="relative border-l-2 border-stone-300 ml-3 space-y-8">
            {TIMELINE.map((t) => (
              <li key={t.day} className="pl-8 relative">
                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 border-4 border-stone-50" />
                <div className="text-xs uppercase tracking-[0.2em] text-sky-700 font-semibold">{t.day}</div>
                <div className="mt-1 font-bold text-slate-900">{t.title}</div>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-amber-800 font-medium uppercase tracking-wide">
            <Quote className="w-3.5 h-3.5" /> Ils ont voyagé avec nous
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Des retours qui parlent d'eux-mêmes.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">« {t.text} »</p>
              <div className="mt-5 flex items-center gap-3">
                <ImageWithFallback src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.loc}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ASSURANCE — split avec photo_6 */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-sky-300 font-medium uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> Assurance voyage incluse
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">L'assurance qui couvre vraiment.</h2>
            <p className="mt-4 text-white/85 leading-relaxed">
              Frais médicaux à l'étranger, rapatriement, perte de bagages, retard de vol, annulation. Tout est couvert
              dès la réservation, sans démarche supplémentaire.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                'Frais médicaux jusqu\'à 250 000 €',
                'Rapatriement sanitaire 24/7',
                'Annulation toutes causes',
                'Bagages & retard',
              ].map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <span className="text-white/90">{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <ImageWithFallback src={imgTravelInsurance} alt="Assurance voyage" className="w-full h-72 sm:h-96 object-cover rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-5 -right-5 bg-white text-slate-900 rounded-2xl shadow-xl p-4 border border-slate-100 max-w-[200px]">
              <Award className="w-6 h-6 text-amber-500 mb-2" />
              <div className="text-xs font-semibold">Partenaire AXA Afrique</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Couverture pan-africaine certifiée</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs text-sky-800 font-medium uppercase tracking-wide">
            <MessageCircle className="w-3.5 h-3.5" /> Questions fréquentes
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Vos questions, nos réponses.</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition p-5">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900 list-none">
                <span>{f.q}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-amber-50 border-y border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: '1 200+', l: 'Voyageurs' },
            { n: '4,9/5', l: 'Satisfaction' },
            { n: '15', l: 'Destinations' },
            { n: '24/7', l: 'Assistance' },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl sm:text-4xl font-bold text-sky-700">{s.n}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-600">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-8 sm:p-12 text-white shadow-2xl">
          <ImageWithFallback src={imgDesertMeditation} alt="Méditation dans le désert" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700/85 via-cyan-700/75 to-teal-700/85" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 blur-3xl rounded-full" />
          <div className="relative grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <Globe className="w-10 h-10 mb-4" />
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Prêt à partir l'esprit léger&nbsp;?</h2>
              <p className="mt-3 text-white/90">Programmez votre séjour en quelques clics. Nos conseillers santé valident chaque départ.</p>
              <div className="mt-5 flex items-center gap-4 text-sm">
                <div className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> 1 200+ voyageurs</div>
                <div className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 fill-current" /> 4,9 / 5</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button onClick={start} className="px-6 py-3 bg-white text-sky-700 hover:bg-sky-50 rounded-full font-semibold inline-flex items-center gap-2">
                Commencer <ArrowRight className="w-4 h-4" />
              </button>
              <a href="/landing#offres-dediees" className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur rounded-full font-semibold border border-white/20">
                Découvrir les offres
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter accent="rose" onStart={start} />
    </div>
  );
}
