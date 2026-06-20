import {
  ArrowRight, Phone, Flame, Shield, Ambulance, AlertTriangle, MapPin,
  Clock, HeartPulse, Radio, CheckCircle2, PhoneCall, Hospital, Stethoscope,
  Baby, Activity, Sparkles,
} from 'lucide-react';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import imgDoctorConsult from '../../imports/photo_2_2026-05-08_00-42-28.jpg';
import imgCaringHands from '../../imports/photo_9_2026-05-08_00-42-28.jpg';
import imgBloodPressure from '../../imports/photo_10_2026-05-08_00-42-28.jpg';
import imgNurseWheelchair from '../../imports/photo_11_2026-05-08_00-42-28.jpg';
import imgNursePhone from '../../imports/photo_12_2026-05-08_00-42-28.jpg';
import imgFirefightersHose from '../../imports/photo_13_2026-05-08_00-42-28.jpg';
import imgFirefighterVertical from '../../imports/photo_14_2026-05-08_00-42-28.jpg';
import imgFirefighterFlames from '../../imports/photo_15_2026-05-08_00-42-28.jpg';
import imgFireTrucks from '../../imports/photo_16_2026-05-08_00-42-28.jpg';

interface Props { onBack?: () => void; onStart?: () => void }

// Banque d'images Bénin / Afrique de l'Ouest — chaque image n'est utilisée qu'UNE seule fois.
const IMG = {
  cotonouMarket: 'https://images.unsplash.com/photo-1765584829997-12ab011bb5b3?w=1400&q=80',
  cotonouLife: 'https://images.unsplash.com/photo-1765584830351-b751c8937c75?w=1400&q=80',
  cotonouStreet: 'https://images.unsplash.com/photo-1765584830084-eb3d2268b263?w=1400&q=80',
  ganvieBoats: 'https://images.unsplash.com/photo-1734867610513-762622d2e78c?w=1400&q=80',
  ganvieVillage: 'https://images.unsplash.com/photo-1734867790637-1716c5b9ab42?w=1400&q=80',
  ganviePerson: 'https://images.unsplash.com/photo-1734867744216-441a982a16f2?w=1400&q=80',
  porto: 'https://images.unsplash.com/photo-1749549439194-96d0006ad861?w=1400&q=80',
  ambulanceParamedic: imgNurseWheelchair,
  ambulanceStreet: imgFirefighterFlames,
  fireFlame: imgFirefighterVertical,
  fireScene: imgFirefightersHose,
  policeOfficer: 'https://images.unsplash.com/photo-1663824580144-9c2a1f257b15?w=1400&q=80',
  policeSenegal: 'https://images.unsplash.com/photo-1717201582500-14ae2375c57f?w=1400&q=80',
  cprHands: imgCaringHands,
  cprTraining: imgBloodPressure,
  doctorListening: imgDoctorConsult,
  phoneCall: imgNursePhone,
  lifeBoat: imgFireTrucks,
};

const NUMBERS = [
  {
    Icon: Shield,
    title: 'Police Secours',
    number: '117',
    short: 'Police nationale',
    desc: 'Sécurité publique, agressions, vols, intrusions, accidents de circulation et signalements.',
    tone: 'from-blue-600 to-indigo-700',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    image: IMG.policeOfficer,
    tel: 'tel:117',
  },
  {
    Icon: Flame,
    title: 'Sapeurs-Pompiers',
    number: '118',
    short: 'Groupement National',
    desc: 'Incendies, accidents domestiques, désincarcération, secours à personne et catastrophes.',
    tone: 'from-red-500 to-orange-600',
    badge: 'bg-red-50 text-red-700 border-red-100',
    image: IMG.fireFlame,
    tel: 'tel:118',
  },
  {
    Icon: Ambulance,
    title: 'SAMU Bénin',
    number: '166',
    short: 'Urgences médicales',
    desc: 'Urgences vitales, malaises graves, accouchements en détresse, transport médicalisé.',
    tone: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    image: IMG.ambulanceParamedic,
    tel: 'tel:166',
  },
];

const HOSPITALS = [
  {
    name: 'CNHU-HKM Cotonou',
    role: 'Hôpital national universitaire',
    city: 'Cotonou',
    phone: '+229 21 30 01 55',
    image: IMG.doctorListening,
    Icon: Hospital,
    accent: 'from-rose-500 to-rose-700',
  },
  {
    name: 'HOMEL — Mère & Enfant',
    role: 'Maternité et pédiatrie',
    city: 'Cotonou — Lagune',
    phone: '+229 21 31 26 83',
    image: IMG.cotonouLife,
    Icon: Baby,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    name: 'CHD Ouémé-Plateau',
    role: 'Centre hospitalier départemental',
    city: 'Porto-Novo',
    phone: '+229 20 21 25 85',
    image: IMG.porto,
    Icon: Stethoscope,
    accent: 'from-emerald-500 to-teal-700',
  },
  {
    name: 'CHU Borgou',
    role: 'Pôle Nord — Référence',
    city: 'Parakou',
    phone: '+229 23 61 00 56',
    image: IMG.ganviePerson,
    Icon: Activity,
    accent: 'from-indigo-500 to-purple-700',
  },
];

const STEPS = [
  { Icon: PhoneCall, title: 'Appelez', desc: 'Composez le numéro adapté à la situation. Restez calme et clair.', image: IMG.phoneCall },
  { Icon: MapPin, title: 'Localisez', desc: 'Indiquez l\'arrondissement, le quartier, un repère visible et l\'étage.', image: IMG.cotonouStreet },
  { Icon: HeartPulse, title: 'Décrivez', desc: 'Nombre de victimes, état de conscience, respiration, saignements.', image: IMG.cprHands },
  { Icon: Clock, title: 'Restez en ligne', desc: 'Ne raccrochez pas tant que l\'opérateur ne vous le demande pas.', image: IMG.ambulanceStreet },
];

const PROTOCOL = [
  'Mettre la victime en sécurité sans aggraver son état',
  'Vérifier la conscience et la respiration',
  'Effectuer les gestes de premiers secours connus',
  'Conserver les ordonnances et documents médicaux à portée',
  'Préparer le contact des proches et du médecin traitant',
  'Photographier la zone si la situation l\'exige',
];

const REGIONS = [
  { name: 'Littoral / Cotonou', samu: '166', police: '117', image: IMG.cotonouMarket },
  { name: 'Ouémé / Porto-Novo', samu: '166', police: '117', image: IMG.ganvieBoats },
  { name: 'Atlantique / Ouidah', samu: '166', police: '117', image: IMG.ganvieVillage },
  { name: 'Borgou / Parakou', samu: '166', police: '117', image: IMG.fireScene },
];

export default function UrgencesPublicScreen({ onBack, onStart }: Props) {
  const start = onStart ?? (() => { window.location.href = '/auth?from=Urgences'; });
  return (
    <div className="h-screen overflow-y-auto bg-stone-50">
      <LandingNav onStart={start} />

      {/* HERO ÉDITORIAL avec image plein cadre */}
      <section className="relative overflow-hidden">
        <div className="relative h-[78vh] min-h-[560px] max-h-[760px]">
          <ImageWithFallback
            src={IMG.ambulanceParamedic}
            alt="Ambulance — paramédical en intervention"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/85 via-stone-950/55 to-red-900/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(244,63,94,0.25),transparent_60%)]" />
          <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-14 sm:pb-20 text-white">
            <p className="inline-flex items-center gap-2 self-start text-xs text-white/90 font-medium uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" /> Urgences publiques · République du Bénin
            </p>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl">
              Au moindre danger,<br />un seul geste suffit.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              HEALTHY PAGE centralise les numéros d'urgence du Bénin — Police 117, Pompiers 118, SAMU 166 — avec
              les bons hôpitaux par département et les protocoles à connaître.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="tel:166" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-red-700 font-semibold hover:bg-red-50">
                <Phone className="w-4 h-4" /> Appeler le SAMU 166
              </a>
              <a href="tel:118" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/30 font-semibold hover:bg-white/20">
                <Flame className="w-4 h-4" /> Pompiers 118
              </a>
              <a href="tel:117" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/30 font-semibold hover:bg-white/20">
                <Shield className="w-4 h-4" /> Police 117
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CARTES NUMÉROS */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {NUMBERS.map(({ Icon, title, number, short, desc, tone, badge, image, tel }) => (
            <a
              key={title}
              href={tel}
              className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xl hover:shadow-2xl transition"
            >
              <div className="relative h-44 overflow-hidden">
                <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-br ${tone} mix-blend-multiply opacity-80`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur border border-white/30">
                    {short}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/80">{title}</div>
                  <div className="text-5xl font-bold tracking-tight leading-none mt-0.5">{number}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge}`}>24h/24 · 7j/7</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 group-hover:text-rose-700">
                    Appeler <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* RÉFLEXES — 4 ÉTAPES IMAGÉES */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-rose-700 font-medium uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Les bons réflexes
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Quatre gestes qui sauvent.</h2>
            <p className="mt-2 text-stone-600 max-w-xl">Une marche à suivre claire, du premier appel à l'arrivée des secours.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ Icon, title, desc, image }, i) => (
            <article key={title} className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200 hover:shadow-xl transition">
              <div className="relative h-40 overflow-hidden">
                <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white text-rose-600 font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <div className="p-5">
                <div className="font-bold text-stone-900">{title}</div>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HÔPITAUX DE RÉFÉRENCE */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs text-emerald-700 font-medium uppercase tracking-wide">
            <Hospital className="w-3.5 h-3.5" /> Hôpitaux de référence du Bénin
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Le bon hôpital, dans le bon département.</h2>
          <p className="mt-2 text-stone-600">Numéros et plateaux techniques pour orienter vos urgences au plus vite.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOSPITALS.map(({ name, role, city, phone, image, Icon, accent }) => (
            <article key={name} className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm hover:shadow-lg transition">
              <div className="relative h-44">
                <ImageWithFallback src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-80 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-stone-800" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-white/80 inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {city}
                  </div>
                  <div className="font-bold mt-0.5 leading-tight">{name}</div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-stone-500">{role}</div>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-2 flex items-center justify-between text-sm font-semibold text-stone-900 hover:text-rose-700">
                  <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4" /> {phone}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROTOCOLE — split image + liste */}
      <section className="mt-24 bg-gradient-to-br from-stone-950 via-stone-900 to-rose-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden h-80 lg:h-[26rem]">
            <ImageWithFallback src={IMG.cprTraining} alt="Formation premiers secours" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Premiers secours</div>
              <div className="text-lg font-bold mt-1">Préservez la vie avant l'arrivée du SAMU</div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <p className="inline-flex items-center gap-2 text-xs text-white/90 font-medium uppercase tracking-wide">
              <Radio className="w-3.5 h-3.5" /> Protocole de secours
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Avant l'arrivée des secours.</h2>
            <p className="mt-3 text-white/80 leading-relaxed max-w-xl">
              Quelques gestes bien exécutés peuvent stabiliser une situation critique. Gardez ces réflexes en tête.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {PROTOCOL.map((p) => (
                <li key={p} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* COUVERTURE TERRITORIALE */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-amber-800 font-medium uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" /> Couverture territoriale
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Du Littoral au Borgou.</h2>
            <p className="mt-2 text-stone-600 max-w-xl">Les mêmes numéros partout au Bénin, des relais hospitaliers dans chaque département.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONS.map((r) => (
            <article key={r.name} className="relative h-48 rounded-3xl overflow-hidden group">
              <ImageWithFallback src={r.image} alt={r.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200">Département</div>
                <div className="font-bold leading-tight mt-0.5">{r.name}</div>
                <div className="mt-2 flex gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/90">SAMU {r.samu}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/90">Police {r.police}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA SOS */}
      <section className="max-w-7xl mx-auto px-4 mt-24 mb-16">
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
          <ImageWithFallback src={IMG.lifeBoat} alt="Sécurité — gilets de sauvetage" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-700/95 via-red-600/90 to-orange-600/85" />
          <div className="relative p-8 sm:p-12 text-white grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <AlertTriangle className="w-10 h-10 mb-4" />
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Activez le bouton SOS HEALTHY PAGE</h2>
              <p className="mt-3 text-white/90 max-w-xl">
                Depuis votre tableau de bord patient, le bouton SOS alerte vos contacts d'urgence et nos opérateurs santé en un seul geste — partout au Bénin.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button onClick={start} className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 rounded-full font-semibold inline-flex items-center gap-2">
                Activer SOS <ArrowRight className="w-4 h-4" />
              </button>
              <a href="tel:166" className="px-6 py-3 bg-white/15 backdrop-blur border border-white/30 rounded-full font-semibold inline-flex items-center gap-2 hover:bg-white/25">
                <Phone className="w-4 h-4" /> SAMU 166
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter accent="rose" onStart={start} />
    </div>
  );
}
