import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, Sparkles, Leaf, ShieldCheck, CheckCircle2,
  Heart, Brain, Activity, Star, Palette, Feather, Flame, Stethoscope,
  Globe2, MessageCircle, Phone, Plus, Minus, Quote,
  ClipboardList, Search, HandHeart, CalendarCheck, BookOpen, MapPin,
} from 'lucide-react';
import { CONTACTS, telHref, waHref } from '../components/contacts';

const SUPPORT_TEL = telHref(CONTACTS.supportPhone) ?? '#';
const SUPPORT_WA = waHref(CONTACTS.supportWhatsapp) ?? '#';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { HealthyPage } from '../components/Brand';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const TESTIMONIALS = [
  { name: 'Aïcha K.', role: 'Abidjan', q: 'La tattoo-thérapie m\'a permis de transformer une cicatrice en un symbole de force. Un véritable parcours de reconstruction.' },
  { name: 'Mariam D.', role: 'Dakar', q: 'J\'avais des douleurs chroniques. Les soins par scarification, encadrés et hygiéniques, ont apporté un soulagement réel et durable.' },
  { name: 'Kossi A.', role: 'Lomé', q: 'Renouer avec la médecine de mes grand-mères, mais avec un cadre moderne et sûr. C\'est exactement ce que je cherchais.' },
];

const FAQ = [
  { q: 'Les soins sont-ils sécurisés et hygiéniques ?', a: 'Oui. Nos praticiens sont formés et certifiés. Tout matériel est stérile, à usage unique, dans le strict respect des normes de santé en vigueur.' },
  { q: 'Pour quels motifs consulter ?', a: 'Douleurs chroniques, accompagnement émotionnel, reconstruction post-trauma, recherche d\'une approche complémentaire à la médecine moderne.' },
  { q: 'Comment se déroule un parcours ?', a: 'Une première consultation d\'écoute, un diagnostic holistique, un plan personnalisé puis un suivi. Vous restez acteur de chaque étape.' },
  { q: 'Est-ce compatible avec un traitement médical ?', a: 'Absolument. Notre approche est additionnelle, jamais opposée. Nous travaillons en complémentarité avec votre médecin traitant.' },
  { q: 'Quels sont les tarifs ?', a: 'Les tarifs varient selon le praticien et la durée. Ils sont communiqués en toute transparence avant la prise de rendez-vous.' },
];

const JOURNEY = [
  { Icon: ClipboardList, n: '01', t: 'Consultation', d: 'Échange d\'écoute pour comprendre votre histoire, vos besoins et vos attentes.' },
  { Icon: Search, n: '02', t: 'Diagnostic', d: 'Lecture holistique : corps, émotions, environnement, héritage culturel.' },
  { Icon: HandHeart, n: '03', t: 'Soins', d: 'Plan personnalisé combinant approches traditionnelles et modernes.' },
  { Icon: CalendarCheck, n: '04', t: 'Suivi', d: 'Accompagnement sur la durée avec ajustements et bilans réguliers.' },
];

const PRACTITIONERS = [
  { name: 'Dr. Aminata Touré', spec: 'Médecine traditionnelle', city: 'Abidjan', img: 'https://images.unsplash.com/photo-1731135227376-587474afd8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { name: 'Maître Kofi N.', spec: 'Scarification thérapeutique', city: 'Lomé', img: 'https://images.unsplash.com/photo-1571990455341-c06400a41071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { name: 'Fatou Diallo', spec: 'Tattoo-thérapie', city: 'Dakar', img: 'https://images.unsplash.com/photo-1619449947405-6aa13108371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { name: 'Dr. Yaa Mensah', spec: 'Phytothérapie', city: 'Accra', img: 'https://images.unsplash.com/photo-1737279129724-6784754c7279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
];

const JOURNAL = [
  { tag: 'Histoire', title: 'Aux origines de la scarification rituelle en Afrique de l\'Ouest', img: 'https://images.unsplash.com/photo-1755015472519-4a21ed20b005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900', read: '6 min' },
  { tag: 'Science', title: 'Quand la micro-stimulation cutanée rencontre la recherche moderne', img: 'https://images.unsplash.com/photo-1670336955066-75408f43a34f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900', read: '8 min' },
  { tag: 'Culture', title: 'Phytothérapie : le savoir des grand-mères face aux laboratoires', img: 'https://images.unsplash.com/photo-1474904200416-6b2b7926f26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900', read: '5 min' },
];

const CENTERS = ['Abidjan', 'Dakar', 'Lomé', 'Accra', 'Lagos', 'Yaoundé', 'Bamako', 'Cotonou'];

const GALLERY = [
  'https://images.unsplash.com/photo-1747079302431-b76e054ec4d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1629223025308-e6e28a259984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1674469772697-ee46e7eed9e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1755015472519-4a21ed20b005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1710116308494-a4bd49a24dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1747079302185-e846ecf86c02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1670336955066-75408f43a34f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  'https://images.unsplash.com/photo-1674469773111-438ae4aac516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
];

interface Props { onBack?: () => void; onStart?: () => void }

const IMG = {
  hero: 'https://images.unsplash.com/photo-1747079302431-b76e054ec4d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  heroA: 'https://images.unsplash.com/photo-1629223025308-e6e28a259984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  heroB: 'https://images.unsplash.com/photo-1674469772697-ee46e7eed9e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  heroC: 'https://images.unsplash.com/photo-1755015472519-4a21ed20b005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  scari: 'https://images.unsplash.com/photo-1674469773111-438ae4aac516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  scariB: 'https://images.unsplash.com/photo-1710116308494-a4bd49a24dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  tattoo: 'https://images.unsplash.com/photo-1670336955066-75408f43a34f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  tattooB: 'https://images.unsplash.com/photo-1619449947405-6aa13108371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  trad: 'https://images.unsplash.com/photo-1737279129724-6784754c7279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  tradB: 'https://images.unsplash.com/photo-1474904200416-6b2b7926f26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  band: 'https://images.unsplash.com/photo-1747079302185-e846ecf86c02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
  cta: 'https://images.unsplash.com/photo-1571990455341-c06400a41071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
};

const SCARI_BENEFITS = [
  { Icon: Activity, t: 'Stimulation des tissus & micro-circulation' },
  { Icon: Sparkles, t: 'Activation du processus de réparation cellulaire' },
  { Icon: Heart, t: 'Soulagement des tensions musculaires' },
  { Icon: Leaf, t: 'Détoxification cutanée ciblée' },
  { Icon: Feather, t: 'Pénétration transcutanée de principes actifs naturels' },
];

const TATTOO_DOMAINS = [
  { Icon: Sparkles, t: 'Restructuration identitaire après traumas, maladies, opérations, pertes, violences' },
  { Icon: Heart, t: 'Amélioration de l’estime de soi grâce à un symbole choisi' },
  { Icon: Palette, t: 'Cicatrisation émotionnelle : transformer une douleur en œuvre d’art' },
  { Icon: Flame, t: 'Affirmation personnelle & empowerment' },
  { Icon: Brain, t: 'Réconciliation avec son image corporelle' },
];

const TRAD_FOUNDATIONS = [
  'Plantes médicinales & phytothérapie',
  'Décoctions, huiles, racines & macérations',
  'Massages traditionnels',
  'Rituels de purification',
  'Techniques manuelles énergétiques',
  'Lecture holistique : corps, esprit, environnement, ancêtres',
];

const TRAD_RECOGNITIONS = [
  'Prévention des déséquilibres',
  'Efficacité dans les pathologies chroniques',
  'Approche douce, naturelle et personnalisée',
  'Rôle complémentaire aux traitements modernes',
  'Apport culturel & identitaire',
];

const ADDITIONNELLE = [
  { Icon: Stethoscope, t: 'Médecine scientifique contemporaine' },
  { Icon: Sparkles, t: 'Thérapies alternatives validées' },
  { Icon: Heart, t: 'Approches de bien-être global' },
  { Icon: Activity, t: 'Innovations modernes' },
];

export default function ScarificationScreen({ onStart }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <LandingNav onStart={onStart ?? (() => {})} />

      {/* Hero éditorial */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-12 sm:pt-16 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <motion.h1 {...fadeUp} className="mt-4 text-[2rem] sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                Scarification, Tattoo-thérapie<br />
                <span className="italic font-serif text-amber-800">& médecine</span> traditionnelle.
              </motion.h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Un dialogue entre savoirs ancestraux africains et science moderne, au service d'une prise en charge globale, sécurisée et profondément humaine.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={onStart} className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full inline-flex items-center gap-2">
                  Consulter un praticien <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#approches" className="px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-400 rounded-full inline-flex items-center gap-2">
                  Découvrir les approches
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 aspect-[3/4] rounded-2xl overflow-hidden">
                  <ImageWithFallback src={IMG.hero} alt="Portrait peintures rituelles" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-2 grid grid-rows-2 gap-3">
                  <div className="rounded-2xl overflow-hidden">
                    <ImageWithFallback src={IMG.heroA} alt="Visage rituel" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <ImageWithFallback src={IMG.heroB} alt="Femme foulard traditionnel" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept band */}
      <section id="approches" className="border-y border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-10 sm:py-14 grid sm:grid-cols-3 gap-8">
          {[
            { n: '01', t: 'Scarification thérapeutique', d: 'Micro-stimulation cutanée encadrée et hygiénique.' },
            { n: '02', t: 'Tattoo-thérapie', d: 'Reconstruction identitaire et émotionnelle par le geste.' },
            { n: '03', t: 'Médecine traditionnelle', d: 'Plantes, rituels et lecture holistique du soin.' },
          ].map((b) => (
            <div key={b.n}>
              <div className="text-amber-800 font-serif italic">{b.n}</div>
              <div className="mt-2 text-lg tracking-tight">{b.t}</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parcours patient */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Quatre étapes, une <span className="italic font-serif text-amber-800">attention</span> constante.
            </h2>
          </div>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY.map(({ Icon, n, t, d }, i) => (
              <motion.li
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pt-6"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-stone-200">
                  <div className="absolute top-0 left-0 h-px bg-amber-700" style={{ width: `${(i + 1) * 25}%` }} />
                </div>
                <div className="font-serif italic text-amber-800">{n}</div>
                <Icon className="w-7 h-7 text-slate-900 mt-3" strokeWidth={1.5} />
                <div className="mt-3 text-lg tracking-tight">{t}</div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Galerie horizontale immersive */}
      <section className="py-12 sm:py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-5 mb-6 flex items-end justify-between gap-4">
          <div>
            <h3 className="mt-2 text-2xl sm:text-3xl tracking-tight">
              Savoir-faire & <span className="italic font-serif text-amber-800">références</span>.
            </h3>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">← faire défiler →</div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 px-5 pb-4 min-w-max">
            {GALLERY.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="w-[260px] sm:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0"
              >
                <ImageWithFallback src={src} alt="Référence africaine" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image band quote */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <ImageWithFallback src={IMG.band} alt="Plantes et savoirs ancestraux" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-5 pb-10 sm:pb-16 text-white">
            <div className="max-w-2xl">
              <div className="font-serif italic text-amber-200 text-sm tracking-wide">— Sagesse</div>
              <p className="mt-3 text-2xl sm:text-4xl tracking-tight leading-tight">
                « La santé n'est pas l'absence de maladie, mais un état d'<span className="italic font-serif">harmonie</span> entre le corps, l'esprit, la nature et les ancêtres. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approche 01 — Scarification */}
      <section className="max-w-6xl mx-auto px-5 py-14 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <ImageWithFallback src={IMG.scari} alt="Soin cutané rituel" className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ImageWithFallback src={IMG.scariB} alt="Détail rituel" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ImageWithFallback src={IMG.heroC} alt="Tradition vivante" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="font-serif italic text-amber-800 text-2xl">01</div>
            <h2 className="mt-2 text-3xl sm:text-4xl tracking-tight leading-tight">
              La <span className="italic font-serif">scarification</span> thérapeutique.
            </h2>
            <p className="mt-3 text-amber-800">Entre héritage ancestral et science moderne</p>
            <p className="mt-6 text-slate-700 leading-relaxed">
              Utilisée depuis des siècles dans de nombreuses cultures africaines, la scarification est une technique <span className="italic">symbolique, curative et identitaire</span>. Elle servait à traiter des douleurs, évacuer des congestions, faire pénétrer des plantes médicinales, ou marquer une étape spirituelle.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Réinterprétée aujourd'hui comme une <span className="italic">micro-stimulation cutanée</span>, comparable aux principes de l'acupuncture, de la mésothérapie ou du microneedling.
            </p>
            <ul className="mt-7 space-y-3">
              {SCARI_BENEFITS.map(({ Icon, t }) => (
                <li key={t} className="flex items-start gap-3 border-b border-stone-200 pb-3">
                  <Icon className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-start gap-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4">
              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                Réalisée uniquement par des professionnels formés, dans le strict respect des normes d'hygiène et de sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approche 02 — Tattoo-thérapie (full-bleed dark) */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <ImageWithFallback src={IMG.tattoo} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="font-serif italic text-amber-300 text-2xl">02</div>
            <h2 className="mt-2 text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              La <span className="italic font-serif text-amber-200">tattoo-thérapie.</span>
            </h2>
            <p className="mt-3 text-white/70">L'expression du corps au service du mental</p>
            <p className="mt-6 text-white/85 leading-relaxed max-w-xl">
              Une approche émergente qui utilise le tatouage comme outil de <span className="italic">reconstruction psychologique et émotionnelle</span>, un rituel intime par lequel on reprend le contrôle de son histoire.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {TATTOO_DOMAINS.map(({ Icon, t }) => (
                <li key={t} className="flex items-start gap-3 border-b border-white/10 pb-3">
                  <Icon className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/85 text-sm leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <ImageWithFallback src={IMG.tattooB} alt="Tatouage thérapeutique" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Approche 03 — Médecine traditionnelle */}
      <section className="max-w-6xl mx-auto px-5 py-14 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="font-serif italic text-emerald-800 text-2xl">03</div>
            <h2 className="mt-2 text-3xl sm:text-4xl tracking-tight leading-tight">
              La médecine <span className="italic font-serif text-emerald-800">traditionnelle</span> & ancestrale.
            </h2>
            <p className="mt-3 text-slate-600">Un trésor complémentaire, transmis de génération en génération.</p>
            <div className="mt-6 aspect-[4/5] rounded-2xl overflow-hidden">
              <ImageWithFallback src={IMG.trad} alt="Médecine traditionnelle" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden">
              <ImageWithFallback src={IMG.tradB} alt="Plantes et soin" className="w-full h-full object-cover" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <Leaf className="w-4 h-4" />
                  <span className="tracking-[0.2em] text-xs uppercase">Fondements</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {TRAD_FOUNDATIONS.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-slate-700 border-b border-stone-200 pb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                      <span className="leading-relaxed text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 text-amber-800">
                  <Star className="w-4 h-4" />
                  <span className="tracking-[0.2em] text-xs uppercase">Reconnaissance</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {TRAD_RECOGNITIONS.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-slate-700 border-b border-stone-200 pb-3">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                      <span className="leading-relaxed text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed border-l-2 border-emerald-700 pl-4 italic">
              <HealthyPage /> valorise cette médecine non comme une opposition à la médecine moderne, mais comme une <span className="not-italic text-emerald-800">médecine additionnelle</span>, venant renforcer la prise en charge globale du patient.
            </p>
          </div>
        </div>
      </section>

      {/* Médecine additionnelle (dark band) */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <Globe2 className="w-8 h-8 text-amber-300" />
              <h2 className="mt-4 text-3xl sm:text-4xl tracking-tight leading-tight">
                Une <span className="italic font-serif text-amber-200">alliance</span> moderne et sécurisée.
              </h2>
              <p className="mt-4 text-white/75 leading-relaxed max-w-md">
                Combiner techniques traditionnelles, savoir scientifique, technologies modernes et humanité, pour un soin holistique, équilibré, centré sur le patient.
              </p>
            </div>
            <ul className="lg:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {ADDITIONNELLE.map(({ Icon, t }) => (
                <li key={t} className="flex items-start gap-3 border-b border-white/10 pb-4">
                  <Icon className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Praticiens vedettes */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Des thérapeutes <span className="italic font-serif text-amber-800">formés</span>, près de chez vous.
            </h2>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center gap-2 text-sm tracking-tight underline underline-offset-4">
            Voir tous <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRACTITIONERS.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                <ImageWithFallback src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="text-xs text-amber-800 tracking-[0.2em] uppercase">{p.spec}</div>
              <div className="mt-2 text-lg tracking-tight">{p.name}</div>
              <div className="mt-1 text-sm text-slate-500 inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {p.city}
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-stone-200">
          <div className="text-xs text-slate-500 tracking-[0.2em] uppercase mb-4">Centres partenaires</div>
          <div className="flex flex-wrap gap-2">
            {CENTERS.map((c) => (
              <span key={c} className="px-4 py-2 border border-stone-300 rounded-full text-sm inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Ils ont <span className="italic font-serif text-amber-800">vécu</span> l'expérience.
            </h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-stone-50 rounded-2xl p-6 border border-stone-200"
              >
                <Quote className="w-6 h-6 text-amber-700" />
                <blockquote className="mt-4 text-slate-700 leading-relaxed italic">
                  « {t.q} »
                </blockquote>
                <figcaption className="mt-5 pt-4 border-t border-stone-200">
                  <div className="tracking-tight">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Carnets éditoriaux */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Lectures pour <span className="italic font-serif text-amber-800">prolonger</span> la rencontre.
            </h2>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center gap-2 text-sm tracking-tight underline underline-offset-4">
            Tous les articles <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {JOURNAL.map((a, i) => (
            <motion.article
              key={a.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <ImageWithFallback src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 border border-stone-300 rounded-full tracking-[0.15em] uppercase">{a.tag}</span>
                <span className="text-slate-500 inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {a.read}</span>
              </div>
              <h3 className="mt-4 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-amber-800 transition-colors">
                {a.title}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 text-sm text-amber-800">
                Lire <ArrowRight className="w-4 h-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
            Questions <span className="italic font-serif text-amber-800">fréquentes</span>.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
          {FAQ.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full py-5 flex items-start justify-between gap-4 text-left"
                >
                  <span className="tracking-tight pr-4">{item.q}</span>
                  {isOpen ? <Minus className="w-5 h-5 text-amber-700 flex-shrink-0 mt-1" /> : <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />}
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-slate-600 leading-relaxed pr-8">{item.a}</p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA — full-bleed African image */}
      <section className="relative">
        <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
          <ImageWithFallback src={IMG.cta} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto px-5 pb-12 sm:pb-20 w-full text-white">
              <div className="max-w-2xl">
                <div className="font-serif italic text-amber-200 text-sm tracking-wide">— Aux origines du soin</div>
                <h2 className="mt-3 text-3xl sm:text-5xl tracking-tight leading-[1.05]">
                  Prêt(e) à explorer une <span className="italic font-serif text-amber-200">approche</span> complémentaire ?
                </h2>
                <p className="mt-5 text-white/85 leading-relaxed">
                  Nos praticiens formés vous accompagnent dans un parcours personnalisé, en sécurité et en conscience.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={onStart} className="px-7 py-3.5 bg-white text-slate-900 hover:bg-stone-100 rounded-full inline-flex items-center gap-2">
                    Prendre rendez-vous <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href={SUPPORT_WA} className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full inline-flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href={SUPPORT_TEL} className="px-7 py-3.5 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white rounded-full inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Être rappelé(e)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter accent="amber" onStart={onStart} />

      {/* Sticky CTA mobile */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-between gap-2 pl-5 pr-2 py-2"
        >
          <span className="text-sm tracking-tight">Prêt(e) à consulter ?</span>
          <button onClick={onStart} className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-4 py-2.5 text-sm inline-flex items-center gap-1.5">
            Prendre RDV <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
