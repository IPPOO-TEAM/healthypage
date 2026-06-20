import {
  ArrowRight, Heart, Sparkles, ShieldCheck, HeartHandshake, Award, CheckCircle2,
  Stethoscope, Apple, Brain, Users, Activity, FileText, Bot, Lock, Smartphone, BellRing,
  ClipboardList, TrendingUp, UserCheck, Workflow, Scale, MessageCircle,
  Phone, Mail, Globe, MapPin,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { HealthyPage } from '../components/Brand';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import imgHero from '../../imports/photo_19_2026-04-30_21-36-08.jpg';
import imgTeam from '../../imports/photo_31_2026-04-30_21-36-08-1.jpg';
import imgCare from '../../imports/photo_17_2026-04-30_21-36-08.jpg';
import imgTech from '../../imports/photo_28_2026-04-30_21-36-08-1.jpg';
import imgSenior1 from '../../imports/photo_1_2026-05-05_08-48-04.jpg';
import imgSenior3 from '../../imports/photo_3_2026-05-05_08-48-04.jpg';

interface Props { onBack?: () => void }

const VALUES = [
  { Icon: Heart, title: 'Respect', desc: 'Chaque personne mérite une attention authentique et un regard digne.', grad: 'from-rose-500 to-pink-500' },
  { Icon: HeartHandshake, title: 'Bienveillance', desc: 'Une écoute active, sans jugement, à chaque étape du parcours.', grad: 'from-amber-500 to-orange-500' },
  { Icon: Lock, title: 'Confidentialité', desc: 'Vos données et votre intimité sont protégées avec rigueur.', grad: 'from-violet-500 to-fuchsia-500' },
  { Icon: ShieldCheck, title: 'Dignité', desc: 'Préserver le confort, l\'autonomie et le respect de chacun.', grad: 'from-sky-500 to-cyan-500' },
  { Icon: Award, title: 'Excellence', desc: 'Des protocoles éprouvés et un service à la hauteur de la confiance reçue.', grad: 'from-emerald-500 to-teal-500' },
  { Icon: Sparkles, title: 'Humanité', desc: 'L\'humain au centre, toujours, la chaleur avant la procédure.', grad: 'from-fuchsia-500 to-rose-500' },
];

const COMPETENCES = [
  { Icon: Stethoscope, label: 'Suivi médical & constantes' },
  { Icon: Apple, label: 'Nutrition & diététique' },
  { Icon: Brain, label: 'Soutien psychologique' },
  { Icon: Users, label: 'Accompagnement social' },
  { Icon: Activity, label: 'Bien-être physique & mental' },
  { Icon: ClipboardList, label: 'Prévention & éducation sanitaire' },
  { Icon: FileText, label: 'Assistance administrative santé' },
  { Icon: Bot, label: 'Outils digitaux de suivi' },
];

const PILLARS = [
  { n: '01', Icon: UserCheck, title: 'Observation & diagnostic', desc: 'Profil santé, habitudes de vie, situation sociale. Chaque accompagnement commence par une analyse rigoureuse des besoins.' },
  { n: '02', Icon: Workflow, title: 'Programme personnalisé', desc: 'Suivi, prévention, nutrition, soutien psychologique et assistance quotidienne, ajustés à chaque rythme.' },
  { n: '03', Icon: TrendingUp, title: 'Évaluation continue', desc: 'Mesures régulières pour anticiper les risques, améliorer la qualité du suivi et stabiliser durablement la santé.' },
];

const CAPACITES = [
  'Enfants, adultes, séniors et personnes vulnérables',
  'Visites régulières & interventions à domicile',
  'Assistance dans les activités essentielles',
  'Encadrement alimentaire personnalisé',
  'Soutien émotionnel quotidien',
  'Suivi digital & rappels intelligents',
  'Accompagnement aux rendez-vous médicaux',
  'Réactivité permanente en cas de besoin',
];

const PLATEAU = [
  { Icon: Smartphone, title: 'Suivi numérique de santé', desc: 'Constantes, traitements, rendez-vous centralisés et sécurisés.' },
  { Icon: MessageCircle, title: 'Communication sécurisée', desc: 'Échanges chiffrés permanents avec les soignants et les proches.' },
  { Icon: Scale, title: 'Évaluation nutritionnelle', desc: 'Outils précis pour mesurer l\'état nutritionnel et le bien-être pondéré.' },
  { Icon: FileText, title: 'Archivage médical', desc: 'Plateformes sécurisées et conformes pour vos dossiers et examens.' },
  { Icon: Activity, title: 'Mobilité & autonomie', desc: 'Instruments d\'assistance pour le confort et le quotidien.' },
  { Icon: BellRing, title: 'Protocoles standardisés', desc: 'Procédures validées pour la prise en charge et les situations sensibles.' },
];

export default function AboutScreen({ onBack }: Props) {
  return (
    <div className="min-h-full bg-gradient-to-b from-stone-50 via-white to-rose-50/40 overflow-x-hidden">
      <LandingNav onStart={() => { window.location.href = '/'; }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-amber-200/30 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              L'humain au cœur de <span className="bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">chaque accompagnement</span>.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Chez <HealthyPage />, nous plaçons l'humain au centre de notre mission. Respect, bienveillance, confidentialité, dignité et excellence : nos valeurs guident chaque geste pour que chaque patient se sente considéré, sécurisé et valorisé.
            </p>
            <p className="mt-4 italic text-slate-700 border-l-4 border-rose-300 pl-4">
              « L'Excellence, l'Humanité et la Confiance au cœur de chaque accompagnement. »
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="grid grid-cols-6 grid-rows-4 gap-3 h-[24rem] sm:h-[30rem]">
              <div className="col-span-4 row-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                <ImageWithFallback src={imgHero} alt="Soignants Healthy Page" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                <ImageWithFallback src={imgSenior1} alt="Présence humaine" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                <ImageWithFallback src={imgSenior3} alt="Accompagnement" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="relative bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Nos valeurs et notre engagement</h2>
            <p className="mt-3 text-slate-600">Une approche chaleureuse et profondément humaine, au service du bien-être global.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ Icon, title, desc, grad }) => (
              <div key={title} className="relative rounded-2xl sm:rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} text-white flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compétences */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] shadow-xl ring-1 ring-stone-200">
            <ImageWithFallback src={imgTeam} alt="Équipe pluridisciplinaire" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Une équipe pluridisciplinaire qualifiée</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Nos professionnels couvrent le suivi médical, la nutrition, la prévention, l'accompagnement social et le bien-être physique et mental. Maîtrise des outils digitaux, connaissance des pathologies chroniques et protocoles éprouvés : une prise en charge rigoureuse, fiable et adaptée.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
              {COMPETENCES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-stone-200 px-3 py-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stratégies */}
      <section className="relative bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 text-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-amber-300 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-violet-400 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Une approche structurée et progressive</h2>
            <p className="mt-3 text-white/85">Trois piliers, une exigence : analyse précise, prévention active et accompagnement sur mesure.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map(({ n, Icon, title, desc }) => (
              <div key={n} className="relative rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-6 hover:bg-white/15 transition">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 ring-1 ring-white/30 text-white flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold text-white/30">{n}</span>
                </div>
                <h3 className="mt-4 font-bold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacités */}
      <section className="relative bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Accueil, accompagnement et prise en charge</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Nos capacités solides nous permettent d'accueillir un large public, des enfants aux séniors en passant par les personnes vulnérables. Une présence humaine quotidienne, une réactivité permanente et un service fluide, structuré et hautement professionnel.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-2">
              {CAPACITES.map((l) => (
                <li key={l} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] shadow-xl ring-1 ring-stone-200">
            <ImageWithFallback src={imgCare} alt="Accompagnement à domicile" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Plateau technique */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center mb-10">
            <div className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] shadow-xl ring-1 ring-stone-200">
              <ImageWithFallback src={imgTech} alt="Plateau technique" className="w-full h-full object-cover" />
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Des outils modernes pour une qualité maximale</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Un ensemble d'outils numériques et de protocoles standardisés pour offrir une prise en charge précise, organisée, sécurisée et conforme aux standards modernes de qualité.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATEAU.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl sm:rounded-3xl bg-white ring-1 ring-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-md mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-rose-300" />
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-rose-300 via-orange-200 to-amber-200 bg-clip-text text-transparent">Healthy Page</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/85 italic">
            « L'Excellence, l'Humanité et la Confiance au cœur de chaque accompagnement. »
          </p>
          <button
            onClick={onBack}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 shadow-lg shadow-rose-500/30 transition"
          >
            Retour à l'accueil <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <LandingFooter accent="violet" />
    </div>
  );
}
