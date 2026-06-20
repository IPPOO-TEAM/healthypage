import {
  ArrowRight, Phone, Scale, BookOpen, Shield, Briefcase,
  HeartHandshake, Sparkles, MapPin, Clock, CheckCircle2, FileText, MessageSquare,
  Gavel, Landmark, UserCheck, Stethoscope, Pill, Activity, Cross, Syringe,
  Building2, AlertTriangle, FileCheck, Users, Award, Star,
} from 'lucide-react';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack?: () => void; onStart?: () => void }

const IMG = {
  heroLawyer: 'https://images.unsplash.com/photo-1638427067705-457b6480ed2f?w=1600&q=80',
  benCity: 'https://images.unsplash.com/photo-1753818269708-0935b894bb26?w=1400&q=80',
  manConsult: 'https://images.unsplash.com/photo-1634313946117-25462979f178?w=1400&q=80',
  manDesk: 'https://images.unsplash.com/photo-1634313946050-3fefb86a710b?w=1400&q=80',
  villageMan: 'https://images.unsplash.com/photo-1583775363006-3804e2131a2d?w=1400&q=80',
  womanLawyer: 'https://images.unsplash.com/photo-1772714601004-23b94ae3913d?w=1400&q=80',
  womanConfident: 'https://images.unsplash.com/photo-1760320483844-3d808de62def?w=1400&q=80',
  womanBlueSuit: 'https://images.unsplash.com/photo-1718780816853-ed14a89f01d6?w=1400&q=80',
  meetingTable: 'https://images.unsplash.com/photo-1758519288557-9a9dee0a7f58?w=1400&q=80',
  handshakeDesk: 'https://images.unsplash.com/photo-1759310610325-2c7cb621e5e3?w=1400&q=80',
  scalesBookGavel: 'https://images.unsplash.com/photo-1774898988393-5c752e4d55e9?w=1400&q=80',
  goldenScales: 'https://images.unsplash.com/photo-1687289133469-b2a07a13b78b?w=1400&q=80',
  lawBook: 'https://images.unsplash.com/photo-1618771623063-6c3faa854a61?w=1400&q=80',
  ladyJusticeStatue: 'https://images.unsplash.com/photo-1764113697577-b5899b9a339d?w=1400&q=80',
  motherChild: 'https://images.unsplash.com/photo-1768814667211-730816cdb0a4?w=1400&q=80',
  phoneCallMan: 'https://images.unsplash.com/photo-1597389682429-10dd16d6bbd6?w=1400&q=80',
  phoneCallSuit: 'https://images.unsplash.com/photo-1603711913456-64cdf470ebdf?w=1400&q=80',
  hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400&q=80',
  doctorPaper: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80',
};

const HOTLINES = [
  {
    Icon: Phone, title: 'Hotline Santé-Justice', number: '7028',
    short: 'Conseil juridique santé gratuit',
    desc: 'Premier diagnostic juridique pour tout litige lié à un soin, un médicament, un acte médical ou une assurance santé.',
    tone: 'from-amber-500 to-orange-600', badge: 'bg-amber-50 text-amber-800 border-amber-100',
    image: IMG.phoneCallMan, tel: 'tel:7028',
  },
  {
    Icon: Cross, title: 'SAMU Bénin', number: '166',
    short: 'Urgence médicale d\'abord',
    desc: 'En cas d\'urgence vitale, contactez le SAMU avant toute démarche juridique. Constat médical = preuve clé.',
    tone: 'from-red-600 to-rose-700', badge: 'bg-red-50 text-red-700 border-red-100',
    image: IMG.hospital, tel: 'tel:166',
  },
  {
    Icon: HeartHandshake, title: 'SOS Femmes & Enfants', number: '138',
    short: 'Violences & santé psychique',
    desc: 'Violences conjugales, sexuelles, sur enfant — une cellule médico-légale prend votre dossier en charge 24/7.',
    tone: 'from-rose-500 to-fuchsia-700', badge: 'bg-rose-50 text-rose-700 border-rose-100',
    image: IMG.motherChild, tel: 'tel:138',
  },
];

// SINISTRES LIÉS À LA SANTÉ uniquement
const DOMAINS = [
  { Icon: Stethoscope, label: 'Erreur médicale', desc: 'Faute professionnelle, mauvais diagnostic, complication post-opératoire évitable.', img: IMG.doctorPaper, accent: 'from-rose-500 to-red-700' },
  { Icon: Pill, label: 'Effet indésirable médicament', desc: 'Réaction grave, contrefaçon, défaut d\'information, retrait de lot.', img: IMG.lawBook, accent: 'from-violet-500 to-purple-700' },
  { Icon: Activity, label: 'Accident corporel', desc: 'Circulation, travail, domestique — indemnisation du préjudice corporel.', img: IMG.manConsult, accent: 'from-amber-500 to-orange-600' },
  { Icon: Shield, label: 'Refus de soin', desc: 'Refus injustifié de prise en charge, discrimination, urgence non traitée.', img: IMG.hospital, accent: 'from-emerald-500 to-teal-700' },
  { Icon: Briefcase, label: 'Maladie professionnelle', desc: 'Reconnaissance CNSS, accident du travail, inaptitude, reclassement.', img: IMG.womanBlueSuit, accent: 'from-blue-600 to-indigo-700' },
  { Icon: FileCheck, label: 'Litige assurance santé', desc: 'Refus de remboursement, exclusion de garantie, retard de paiement mutuelle.', img: IMG.meetingTable, accent: 'from-sky-500 to-cyan-700' },
  { Icon: HeartHandshake, label: 'Violences & préjudice', desc: 'Constat médico-légal, ITT, indemnisation des victimes de violences.', img: IMG.womanConfident, accent: 'from-fuchsia-500 to-pink-700' },
  { Icon: Syringe, label: 'Vaccination & soins forcés', desc: 'Consentement éclairé, droits du patient, refus ou imposition de soin.', img: IMG.womanLawyer, accent: 'from-cyan-500 to-blue-700' },
  { Icon: FileText, label: 'Dossier médical', desc: 'Accès, rectification, transmission entre praticiens, perte de documents.', img: IMG.handshakeDesk, accent: 'from-stone-700 to-stone-900' },
];

const STEPS = [
  { Icon: MessageSquare, title: 'Décrivez votre situation', desc: 'Quelques questions pour cerner le sinistre santé — anonyme et chiffré.', img: IMG.manConsult },
  { Icon: BookOpen, title: 'Évaluation juridique', desc: 'Un juriste santé qualifie votre dossier et identifie les recours possibles.', img: IMG.lawBook },
  { Icon: UserCheck, title: 'Mise en relation expert', desc: 'Avocat spécialisé, médecin-conseil expert ou clinique juridique selon le besoin.', img: IMG.handshakeDesk },
  { Icon: CheckCircle2, title: 'Suivi du dossier', desc: 'Pièces médicales archivées, rappels d\'audience, mise à jour de la procédure.', img: IMG.womanLawyer },
];

const CABINETS = [
  { name: 'Cabinet Santé-Droit Cotonou', role: 'Spécialistes responsabilité médicale', city: 'Cotonou — Ganhi', phone: '+229 21 31 25 04', image: IMG.scalesBookGavel, Icon: Gavel, accent: 'from-blue-600 to-indigo-800' },
  { name: 'Maison de la Justice', role: 'Médiation pré-contentieuse santé', city: 'Cotonou — Akpakpa', phone: '+229 21 33 60 12', image: IMG.benCity, Icon: Landmark, accent: 'from-amber-500 to-orange-700' },
  { name: 'Clinique Juridique Hubert Maga', role: 'Aide aux victimes vulnérables', city: 'Porto-Novo', phone: '+229 20 21 41 60', image: IMG.villageMan, Icon: HeartHandshake, accent: 'from-rose-500 to-fuchsia-700' },
  { name: 'Pôle médico-légal du CHU', role: 'Expertises médicales agréées', city: 'Parakou — Borgou', phone: '+229 23 61 03 12', image: IMG.ladyJusticeStatue, Icon: Stethoscope, accent: 'from-emerald-600 to-teal-800' },
];

const REFS = [
  'Loi n° 97-020 sur l\'exercice de la médecine au Bénin',
  'Code de déontologie médicale (Ordre national des médecins)',
  'Loi n° 2003-04 sur la santé sexuelle et la reproduction',
  'Loi n° 2011-26 — répression des violences faites aux femmes',
  'Code de la sécurité sociale (CNSS) — accidents du travail',
  'Convention sur les droits des patients — République du Bénin',
];

const PLANS = [
  {
    name: 'Essentiel',
    price: '4 900',
    period: '/mois',
    color: 'from-stone-700 to-stone-900',
    badge: null,
    features: [
      'Hotline juridique santé illimitée',
      'Évaluation écrite sous 72h',
      '1 consultation avocat / an',
      'Modèles de courriers santé',
    ],
    cta: 'Souscrire l\'Essentiel',
  },
  {
    name: 'Famille +',
    price: '12 900',
    period: '/mois',
    color: 'from-amber-500 to-orange-600',
    badge: 'Le plus choisi',
    features: [
      'Tout l\'Essentiel pour 4 personnes',
      '4 consultations avocat / an',
      'Médecin-conseil expert inclus',
      'Représentation Maison de la Justice',
      'Frais d\'huissier remboursés',
    ],
    cta: 'Souscrire Famille +',
  },
  {
    name: 'Premium',
    price: '29 900',
    period: '/mois',
    color: 'from-rose-600 to-fuchsia-700',
    badge: 'Couverture totale',
    features: [
      'Tout Famille + sans limite',
      'Avocat dédié santé 24/7',
      'Expertise médicale autonome',
      'Procédure prise en charge à 100%',
      'Indemnisation préjudice avancée',
    ],
    cta: 'Souscrire Premium',
  },
];

const STATS = [
  { n: '92%', l: 'Dossiers santé résolus' },
  { n: '+1 400', l: 'Patients accompagnés' },
  { n: '24h', l: 'Première réponse' },
  { n: '4,9/5', l: 'Satisfaction' },
];

const FAQ = [
  { q: 'Quels sinistres prenez-vous en charge ?', a: 'Uniquement les litiges liés à la santé : erreurs médicales, accidents corporels, refus de soin, litiges avec une assurance ou mutuelle santé, maladies professionnelles, violences avec préjudice corporel.' },
  { q: 'Combien coûte une évaluation ?', a: 'L\'évaluation juridique initiale est offerte. Si vous souscrivez à une couverture, tous les frais d\'avocat et d\'huissier liés à votre sinistre sont pris en charge selon la formule.' },
  { q: 'Quels sont les délais ?', a: 'Première réponse sous 24h. Évaluation écrite complète sous 72h. Mise en relation avec un avocat spécialisé sous 5 jours.' },
  { q: 'Mes données médicales sont-elles protégées ?', a: 'Oui. Tous les échanges sont chiffrés bout-en-bout. Aucun document médical n\'est partagé sans votre accord explicite.' },
];

export default function AssistanceJuridiquePublicScreen({ onBack, onStart }: Props) {
  const start = onStart ?? (() => { window.location.href = '/auth?from=Juridique'; });
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <LandingNav onStart={start} />

      {/* HERO */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <ImageWithFallback src={IMG.heroLawyer} alt="Justice & santé au Bénin" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/60 via-stone-950/70 to-amber-950/85" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-14 text-white w-full">
            <p className="inline-flex items-center gap-2 text-xs text-white/90 font-medium uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" /> HEALTHY PAGE · Assistance Juridique Santé
            </p>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl">
              Vos droits face à<br />
              <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent">
                un sinistre santé.
              </span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-2xl leading-relaxed">
              Erreur médicale, accident corporel, refus de soin, litige avec votre assurance santé —
              nos juristes et avocats spécialisés santé vous accompagnent à chaque étape.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-900 font-semibold hover:bg-amber-50 transition shadow-lg shadow-stone-900/30">
                Se faire accompagner par nos experts <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition shadow-lg">
                <FileCheck className="w-4 h-4" /> Demander une évaluation
              </button>
              <a href="#souscrire" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition">
                <Shield className="w-4 h-4" /> Souscrire à la couverture
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Réponse sous 24h</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Confidentiel & chiffré</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 12 départements couverts</span>
              <span className="inline-flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Avocats agréés santé</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="text-3xl sm:text-4xl font-bold text-amber-700">{s.n}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-stone-600">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOTLINES */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Lignes d'écoute santé</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">3 numéros pour une urgence santé.</h2>
          <p className="mt-3 text-stone-600">Gratuits, accessibles depuis tout opérateur, en français et en langues locales.</p>
        </div>
        <div className="mt-9 grid lg:grid-cols-3 gap-5">
          {HOTLINES.map(({ Icon, title, number, short, desc, tone, badge, image, tel }) => (
            <a key={number} href={tel} className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200 hover:shadow-2xl hover:-translate-y-1 transition">
              <div className="relative h-44 overflow-hidden">
                <ImageWithFallback src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-80 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 to-transparent" />
                <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white/95 flex items-center justify-center shadow-lg">
                  <Icon className="w-5 h-5 text-stone-800" />
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[11px] font-semibold opacity-90">{short}</div>
                  <div className="text-4xl font-bold tracking-tight leading-none mt-1">{number}</div>
                </div>
              </div>
              <div className="p-5">
                <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge}`}>{title}</div>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-stone-900">
                  Composer maintenant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* DOMAINES — uniquement santé */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">Sinistres santé pris en charge</div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Quel litige santé vous concerne ?</h2>
              <p className="mt-3 text-stone-600">Notre périmètre couvre exclusivement les litiges liés à la santé, au corps médical et aux assurances de soins.</p>
            </div>
            <button onClick={start} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition">
              Demander une évaluation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAINS.map(({ Icon, label, desc, img, accent }) => (
              <button key={label} onClick={start} className="group relative rounded-3xl overflow-hidden text-left h-56 hover:-translate-y-1 transition shadow-sm hover:shadow-xl">
                <ImageWithFallback src={img} alt={label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-75 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center shadow">
                  <Icon className="w-5 h-5 text-stone-800" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-bold tracking-tight text-xl">{label}</div>
                  <div className="text-xs opacity-90 mt-1 leading-snug">{desc}</div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                    Évaluer mon cas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Comment ça marche</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">4 étapes pour faire valoir vos droits.</h2>
          <p className="mt-3 text-stone-600">Aucune connaissance juridique requise — on traduit le médico-légal en mots simples.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ Icon, title, desc, img }, i) => (
            <div key={title} className="rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-lg transition">
              <div className="relative h-36">
                <ImageWithFallback src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white text-stone-900 font-bold flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-stone-800" />
                </div>
              </div>
              <div className="p-5">
                <div className="font-bold tracking-tight">{title}</div>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition shadow-md">
            <FileCheck className="w-4 h-4" /> Demander une évaluation gratuite
          </button>
          <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-800 transition">
            <UserCheck className="w-4 h-4" /> Se faire accompagner par nos experts
          </button>
        </div>
      </section>

      {/* SOUSCRIRE — PLANS */}
      <section id="souscrire" className="bg-gradient-to-br from-amber-50 via-white to-rose-50/30 border-y border-amber-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Couverture juridique santé</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Souscrire à la couverture qui vous protège.</h2>
            <p className="mt-3 text-stone-600">Trois formules pensées pour les particuliers, les familles et les patients chroniques.</p>
          </div>
          <div className="mt-10 grid lg:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <article key={p.name} className={`relative rounded-3xl bg-white border ${p.badge ? 'border-amber-300 shadow-2xl scale-[1.02]' : 'border-stone-200 shadow-sm'} overflow-hidden flex flex-col`}>
                {p.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    {p.badge}
                  </div>
                )}
                <div className={`h-2 bg-gradient-to-r ${p.color}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="font-bold text-xl">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                    <span className="text-sm text-stone-500">FCFA{p.period}</span>
                  </div>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={start} className={`mt-6 w-full py-3 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 transition shadow-md text-white bg-gradient-to-r ${p.color} hover:opacity-90`}>
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-stone-500">Sans engagement · Résiliable à tout moment · Paiement Mobile Money</p>
        </div>
      </section>

      {/* CABINETS PARTENAIRES */}
      <section className="bg-stone-950 text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Réseau partenaire santé</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Cabinets & experts médico-légaux.</h2>
            <p className="mt-3 text-white/70">Avocats, médecins-conseils et structures officielles spécialisés en droit de la santé.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CABINETS.map(({ name, role, city, phone, image, Icon, accent }) => (
              <div key={name} className="rounded-3xl overflow-hidden bg-stone-900/60 border border-white/10">
                <div className="relative h-36">
                  <ImageWithFallback src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-2xl bg-white/95 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-stone-900" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold leading-tight">{name}</div>
                  <div className="text-xs text-white/65 mt-1">{role}</div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-white/80">
                    <MapPin className="w-3 h-3" /> {city}
                  </div>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200">
                    <Phone className="w-3.5 h-3.5" /> {phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGE + RÉFÉRENCES */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-200 fill-amber-200" />)}
              </div>
              <p className="mt-5 text-lg leading-relaxed italic">
                « Après un diagnostic raté à l'hôpital, je ne savais pas quoi faire. HEALTHY PAGE m'a évalué en 48h
                et un avocat spécialisé a obtenu une indemnisation pour mes soins prolongés. »
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold">A</div>
              <div>
                <div className="font-semibold">Adèle K.</div>
                <div className="text-xs text-white/80">Cotonou — patiente Famille +</div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm">
            <div className="relative h-40">
              <ImageWithFallback src={IMG.lawBook} alt="Textes de loi santé" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-stone-950/10" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-300">Bibliothèque santé-droit</div>
                <div className="font-bold tracking-tight text-2xl mt-1">Textes de référence</div>
              </div>
            </div>
            <ul className="p-5 space-y-3">
              {REFS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-stone-700">
                  <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">Questions fréquentes</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">On répond à vos doutes.</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-300 transition p-5">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-stone-900 list-none">
                <span>{f.q}</span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden">
        <ImageWithFallback src={IMG.goldenScales} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700/85 via-stone-900/90 to-stone-950" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center text-white">
          <Scale className="w-10 h-10 mx-auto text-amber-300" />
          <h2 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight">Votre santé mérite d'être défendue.</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">
            En quelques minutes, on évalue votre sinistre santé, on identifie vos recours et on vous met en relation avec
            les bons experts. Souscrivez à une couverture pour être protégé en continu.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-900 font-semibold hover:bg-amber-50 transition">
              <UserCheck className="w-4 h-4" /> Se faire accompagner par nos experts
            </button>
            <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition">
              <FileCheck className="w-4 h-4" /> Demander une évaluation
            </button>
            <a href="#souscrire" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition">
              <Shield className="w-4 h-4" /> Souscrire à la couverture
            </a>
          </div>
        </div>
      </section>

      <LandingFooter onStart={start} />
    </div>
  );
}
