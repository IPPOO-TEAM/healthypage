import {
  ArrowRight, CheckCircle2, CreditCard, Calendar, Phone, MessageCircle,
  Heart, Shirt, Milk, Moon, Stethoscope, BookOpen, Sparkles, Wallet,
  ShieldCheck, Globe2, Leaf, Users,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { CONTACTS, telHref, waHref } from '../components/contacts';

const SUPPORT_TEL = telHref(CONTACTS.supportPhone) ?? '#';
const SUPPORT_WA = waHref(CONTACTS.supportWhatsapp) ?? '#';
import { HealthyPage } from '../components/Brand';

interface Props { onBack?: () => void; onStart?: () => void }

const IMG = {
  hero: 'https://images.unsplash.com/photo-1623669118847-9587296277e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1400',
  heroSecondary: 'https://images.unsplash.com/photo-1623259669885-a5ba5a58fefe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  babyMother: 'https://images.unsplash.com/photo-1509099342178-e323b1717dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200',
  finalCta: 'https://images.unsplash.com/photo-1629032449128-eba4d4ebf6f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200',
  cat1: 'https://images.unsplash.com/photo-1716972065448-e08a46809530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat2: 'https://images.unsplash.com/photo-1662464101535-9c52ede67cf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat3: 'https://images.unsplash.com/photo-1720649069293-f1e0e100be09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat4: 'https://images.unsplash.com/photo-1662464101531-43ad33c66f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat5: 'https://images.unsplash.com/photo-1767820437264-96f7c4156af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat6: 'https://images.unsplash.com/photo-1737648987004-2f724d30e6b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  gal1: 'https://images.unsplash.com/photo-1662464101594-7c3af4e4d97c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  gal2: 'https://images.unsplash.com/photo-1729189264840-68a4e839e8ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  gal3: 'https://images.unsplash.com/photo-1667422233599-eec3cd543f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
};

const CATEGORIES = [
  { Icon: Heart, n: '01', title: 'Hygiène & soins', img: IMG.cat1, items: [
    'Couches nouveau-né en stock progressif',
    'Lingettes douces & coton bébé',
    'Savon, gel lavant & crème érythème',
    'Thermomètre & sérum physiologique',
    'Kit de premiers soins',
  ]},
  { Icon: Shirt, n: '02', title: 'Vêtements essentiels', img: IMG.cat2, items: [
    'Bodies naissance (0–3 mois)',
    'Pyjamas en coton doux',
    'Bonnet, chaussettes & gants',
    'Lange multifonction',
    'Couverture légère',
  ]},
  { Icon: Milk, n: '03', title: 'Alimentation & allaitement', img: IMG.cat3, items: [
    'Biberons & tétines nouveau-né',
    'Stérilisateur manuel',
    'Lait infantile (si non exclusif)',
    'Coussin d’allaitement',
    'Bavoirs (×3 minimum)',
  ]},
  { Icon: Moon, n: '04', title: 'Confort & sommeil', img: IMG.cat4, items: [
    'Matelas bébé & draps adaptés',
    'Couverture légère',
    'Nid de sommeil',
    'Veilleuse douce (option)',
  ]},
  { Icon: Stethoscope, n: '05', title: 'Maternité, pour la maman', img: IMG.cat5, items: [
    'Tenue d’hôpital confortable',
    'Soutien-gorge d’allaitement',
    'Serviettes & culottes post-partum',
    'Trousse hygiène intime',
    'Tisane post-partum (lactation)',
  ]},
  { Icon: BookOpen, n: '06', title: 'Suivi HEALTHY PAGE', img: IMG.cat6, items: [
    'Carnet de suivi grossesse & naissance',
    'Guide « préparer l’arrivée de bébé »',
    'Liste personnalisée par mois',
    'Conseils nutrition & guide d’urgence',
    'Accès WhatsApp / app / téléphone',
  ]},
];

const OBJECTIFS = [
  { Icon: ShieldCheck, t: 'Réduire les accouchements sans préparation matérielle' },
  { Icon: Wallet, t: 'Éviter les dettes d’urgence à l’hôpital ou en pharmacie' },
  { Icon: Heart, t: 'Permettre aux familles modestes d’accueillir un enfant dignement' },
  { Icon: Sparkles, t: 'Créer une culture de préparation responsable' },
  { Icon: Users, t: 'Renforcer la santé maternelle et infantile' },
];

export default function KitGrossesseScreen({ onStart }: Props) {
  const start = onStart ?? (() => {});
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <LandingNav onStart={start} />

      {/* Hero — éditorial mobile-first */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-10 sm:pb-16">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <h1 className="mt-4 text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Préparer l'arrivée de bébé,<br className="hidden sm:block" />
                <span className="italic font-serif text-rose-700">en toute sérénité.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Pour les familles africaines qui veulent offrir à leur enfant une naissance digne, sans stress financier, mois après mois.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={start} className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium inline-flex items-center gap-2 shadow-sm">
                  Démarrer mon kit <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#contenu" className="px-6 py-3.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 font-medium inline-flex items-center gap-2 text-slate-800">
                  Voir le contenu
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
                <div>
                  <div className="text-2xl font-bold text-slate-900">4×</div>
                  <div className="text-xs">ou 12 mois</div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">6</div>
                  <div className="text-xs">catégories</div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">+50</div>
                  <div className="text-xs">essentiels</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="grid grid-cols-5 gap-3 sm:gap-4">
                <div className="col-span-3 relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
                  <ImageWithFallback src={IMG.hero} alt="Future maman africaine" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-2 flex flex-col gap-3 sm:gap-4">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-md">
                    <ImageWithFallback src={IMG.heroSecondary} alt="Grossesse sereine" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative flex-1 rounded-3xl overflow-hidden shadow-md">
                    <ImageWithFallback src={IMG.gal1} alt="Bébé africain souriant" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept — bande premium */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid sm:grid-cols-3 gap-6 sm:gap-10">
          {[
            { Icon: Sparkles, t: 'Concept', d: 'Une prévoyance familiale qui transforme l\'angoisse en sérénité, mois après mois.' },
            { Icon: Wallet, t: 'Accessible', d: 'Paiement échelonné. Chaque élément devient progressivement disponible.' },
            { Icon: Heart, t: 'Humain', d: 'Un accompagnement HEALTHY PAGE de bout en bout : conseils, suivi, urgence.' },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">{t}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bandeau image full-width — moment maman/bébé */}
      <section className="relative">
        <div className="relative h-[60vw] sm:h-[40vw] max-h-[520px] overflow-hidden">
          <ImageWithFallback src={IMG.babyMother} alt="Mère africaine et son enfant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-8 sm:pb-14">
              <p className="max-w-xl text-white text-xl sm:text-3xl font-serif italic leading-snug">
                « Chaque enfant mérite de naître entouré du strict nécessaire. »
              </p>
              <div className="mt-3 text-white/80 text-sm tracking-wider uppercase"><HealthyPage /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu du kit — éditorial */}
      <section id="contenu" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Six catégories. <span className="italic font-serif text-rose-700">Zéro oubli.</span></h2>
          <p className="mt-4 text-slate-600 leading-relaxed">Chaque essentiel, du bain au sommeil, pour la maman comme pour bébé, pensé pour la réalité africaine.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {CATEGORIES.map(({ Icon, n, title, items, img }) => (
            <article key={title} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-6 sm:p-7 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Mini-galerie tendresse africaine */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
          {[IMG.gal1, IMG.gal2, IMG.gal3].map((src, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden">
              <ImageWithFallback src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* Modalités — premium dark */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Un paiement <span className="italic font-serif text-rose-300">à votre rythme.</span></h2>
            <p className="mt-4 text-white/70 leading-relaxed">Choisissez la formule qui s'adapte à votre quotidien, sans pression, sans surprise.</p>
          </div>
          <div className="mt-8 sm:mt-10 grid md:grid-cols-2 gap-5">
            <div className="bg-white/5 backdrop-blur rounded-3xl p-7 border border-white/10 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <CreditCard className="w-7 h-7 text-rose-300" />
                <span className="text-xs font-mono tracking-wider text-white/60">OPTION 01</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">Paiement en 4 fois</h3>
              <ul className="mt-5 space-y-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> Versement initial</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> 3 paiements mensuels ou bimensuels</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> Livraison progressive ou totale</li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-3xl p-7 border border-white/10 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <Calendar className="w-7 h-7 text-rose-300" />
                <span className="text-xs font-mono tracking-wider text-white/60">OPTION 02</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">Étalement sur 12 mois</h3>
              <ul className="mt-5 space-y-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> Micro-paiement mensuel</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> Constitution progressive du kit</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" /> Remise avant ou après naissance</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button onClick={start} className="px-7 py-3.5 rounded-full bg-white text-slate-900 hover:bg-rose-50 font-semibold inline-flex items-center gap-2 shadow-sm">
              Choisir ma formule <ArrowRight className="w-4 h-4" />
            </button>
            <a href={SUPPORT_WA} className="px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/10 font-medium inline-flex items-center gap-2 text-white">
              <MessageCircle className="w-4 h-4" /> Une question ? WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Objectif social */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          <div className="lg:col-span-5">
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Un objectif <span className="italic font-serif text-emerald-700">social,</span> pas commercial.</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Notre ambition : que <span className="font-medium text-slate-900">l'arrivée d'un enfant</span> ne soit jamais un événement de stress matériel, surtout pour les foyers les plus modestes.
            </p>
          </div>
          <ul className="lg:col-span-7 grid sm:grid-cols-2 gap-3 sm:gap-4">
            {OBJECTIFS.map(({ Icon, t }) => (
              <li key={t} className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4 sm:p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-slate-700 leading-relaxed mt-1">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA — éditorial avec image africaine */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] bg-rose-700 text-white">
          <ImageWithFallback src={IMG.finalCta} alt="Couple africain attendant un enfant" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/85 via-rose-700/70 to-fuchsia-700/60" />
          <div className="relative p-7 sm:p-12 lg:p-16 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Leaf className="w-9 h-9 mb-4 text-rose-100" />
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">Préparez l'arrivée de votre bébé, <span className="italic font-serif">sereinement.</span></h2>
              <p className="mt-4 text-white/90 leading-relaxed max-w-md">Démarrez votre Kit Grossesse aujourd'hui. Constituez son contenu mois après mois, sans pression, sans surprise.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={start} className="px-7 py-3.5 bg-white text-rose-700 hover:bg-rose-50 rounded-full font-semibold inline-flex items-center gap-2 shadow-lg">
                  Souscrire au kit <ArrowRight className="w-4 h-4" />
                </button>
                <a href={SUPPORT_TEL} className="px-6 py-3.5 bg-white/15 backdrop-blur hover:bg-white/25 rounded-full font-medium inline-flex items-center gap-2 border border-white/20">
                  <Phone className="w-4 h-4" /> Être rappelé(e)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <LandingFooter accent="rose" onStart={start} />
    </div>
  );
}
