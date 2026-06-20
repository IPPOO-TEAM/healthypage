import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, ShieldCheck, FileText, Activity, Syringe, Stethoscope,
  HeartPulse, Pill, Lock, Users, Smartphone, Download,
  CheckCircle2, MessageCircle, Phone, Plus, Minus, Quote,
  ClipboardList, FolderHeart, Share2, Cloud, X, ChevronLeft, ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CONTACTS, telHref, waHref } from '../components/contacts';

const SUPPORT_TEL = telHref(CONTACTS.supportPhone) ?? '#';
const SUPPORT_WA = waHref(CONTACTS.supportWhatsapp) ?? '#';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { HealthyPage } from '../components/Brand';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import extraitCover from '../../imports/photo_19_2026-05-05_18-49-31.jpg';
import extraitFamille from '../../imports/photo_24_2026-05-05_18-49-31.jpg';
import extraitBienEtre from '../../imports/photo_5_2026-05-05_18-49-31.jpg';
import extraitNouveauNe from '../../imports/photo_15_2026-05-05_18-49-31.jpg';
import extraitUrgences from '../../imports/photo_12_2026-05-05_18-49-31.jpg';
import extraitGestes from '../../imports/photo_7_2026-05-05_18-49-31.jpg';
import extraitPLS from '../../imports/photo_13_2026-05-05_18-49-31.jpg';
import extraitTrousse from '../../imports/photo_14_2026-05-05_18-49-31.jpg';
import extraitEquipements from '../../imports/photo_9_2026-05-05_18-49-31.jpg';

interface Props { onBack?: () => void; onStart?: () => void }

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const IMG = {
  hero: 'https://images.unsplash.com/photo-1536064479547-7ee40b74b807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  heroA: 'https://images.unsplash.com/photo-1697383904932-94304530a3dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  heroB: 'https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  band: 'https://images.unsplash.com/photo-1658129850537-ea7517a9682f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
  app: 'https://images.unsplash.com/photo-1666887360445-e3b7bba7917c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  cta: 'https://images.unsplash.com/photo-1515657834497-26509e295154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
};

const SECTIONS = [
  { Icon: FileText, n: '01', t: 'Antécédents médicaux', d: 'Pathologies, allergies, interventions, hospitalisations, un historique complet et accessible.' },
  { Icon: Syringe, n: '02', t: 'Vaccinations', d: 'Carnet vaccinal numérique avec rappels automatiques et certificats vérifiables.' },
  { Icon: Pill, n: '03', t: 'Traitements & ordonnances', d: 'Médicaments en cours, posologies, renouvellements et historique pharmaceutique.' },
  { Icon: Activity, n: '04', t: 'Examens & analyses', d: 'Résultats biologiques, imagerie, comptes-rendus, centralisés et partageables.' },
  { Icon: HeartPulse, n: '05', t: 'Constantes & suivi', d: 'Tension, glycémie, poids, fréquence cardiaque, courbes et tendances dans le temps.' },
  { Icon: Stethoscope, n: '06', t: 'Consultations', d: 'Comptes-rendus de chaque rendez-vous, prescriptions et orientations spécialisées.' },
];

const BENEFITS = [
  { Icon: Lock, t: 'Souveraineté des données', d: 'Vos informations vous appartiennent. Chiffrement de bout en bout, hébergement local sécurisé.' },
  { Icon: Share2, t: 'Partage maîtrisé', d: 'Donnez accès à votre médecin, votre pharmacien ou un proche, en un geste, et révoquez quand vous voulez.' },
  { Icon: Cloud, t: 'Toujours synchronisé', d: 'Disponible sur mobile, web, hors ligne. Sauvegarde automatique, jamais perdu.' },
  { Icon: Users, t: 'Carnet familial', d: 'Gérez le carnet de vos enfants, de vos parents âgés, de toute votre famille en un seul endroit.' },
];

const JOURNEY = [
  { Icon: Smartphone, t: 'Téléchargement', d: 'L\'application HEALTHY PAGE en quelques secondes.' },
  { Icon: ClipboardList, t: 'Initialisation', d: 'Renseignez vos informations de base, importez vos documents.' },
  { Icon: FolderHeart, t: 'Vie quotidienne', d: 'Consultations, traitements, examens, tout s\'enregistre automatiquement.' },
  { Icon: Share2, t: 'Partage', d: 'Vous décidez qui voit quoi, et pour combien de temps.' },
];

const TESTIMONIALS = [
  { name: 'Awa M.', role: 'Mère de famille · Abidjan', q: 'Avoir tous les carnets de mes 3 enfants dans une seule app, c\'est un soulagement immense. Plus rien ne se perd.' },
  { name: 'Dr. Konaté', role: 'Médecin généraliste · Bamako', q: 'Quand un patient arrive avec son carnet HEALTHY PAGE, je gagne 15 minutes de consultation. C\'est un outil clinique remarquable.' },
  { name: 'Issa T.', role: 'Diabétique · Lomé', q: 'Le suivi de ma glycémie sur plusieurs mois, partagé avec mon endocrinologue à distance, ça a changé ma prise en charge.' },
];

const FAQ = [
  { q: 'Mes données sont-elles vraiment sécurisées ?', a: 'Oui. Chiffrement de bout en bout, hébergement conforme aux normes de santé, accès biométrique. Vous êtes le seul propriétaire de vos données.' },
  { q: 'Puis-je l\'utiliser hors connexion ?', a: 'Absolument. Le carnet est consultable hors ligne. La synchronisation se fait automatiquement dès que vous retrouvez le réseau.' },
  { q: 'Mon médecin peut-il y accéder ?', a: 'Uniquement si vous lui donnez accès, et à la portée que vous choisissez. Vous pouvez révoquer le partage à tout moment.' },
  { q: 'Puis-je gérer le carnet de mes proches ?', a: 'Oui, le carnet familial vous permet de gérer plusieurs profils (enfants, parents âgés) avec un suivi adapté à chacun.' },
  { q: 'Est-ce gratuit ?', a: 'Le carnet de santé personnel est inclus dans l\'application. Des modules avancés (analyses, alertes, partage pro) sont disponibles via l\'abonnement HEALTHY PAGE.' },
];

const STATS = [
  { v: '100%', l: 'Données chiffrées' },
  { v: '24/7', l: 'Accès permanent' },
  { v: '6', l: 'Sections complètes' },
  { v: '∞', l: 'Stockage' },
];

const GENERATIONS = [
  { src: extraitCover, alt: 'Couverture du carnet HEALTHY PAGE', caption: 'Couverture du carnet' },
  { src: extraitFamille, alt: 'Carnet de santé en famille', caption: 'Carnet en famille' },
  { src: extraitNouveauNe, alt: 'Génération nouveau-né (0-24 mois)', caption: 'Nouveau-né (0-24 mois)' },
  { src: extraitBienEtre, alt: 'Santé et bien-être des mamans', caption: 'Santé & bien-être' },
];

const URGENCES = [
  { src: extraitUrgences, alt: 'Urgences et secours santé', caption: 'Urgences & secours' },
  { src: extraitGestes, alt: 'Les gestes de premiers secours', caption: 'Gestes qui sauvent' },
  { src: extraitPLS, alt: 'Position latérale de sécurité', caption: 'Position latérale de sécurité' },
  { src: extraitTrousse, alt: 'La trousse de premiers soins', caption: 'Trousse de premiers soins' },
  { src: extraitEquipements, alt: 'Équipements de sécurité et de secours', caption: 'Équipements de secours' },
];

const ALL_EXTRAITS = [...GENERATIONS, ...URGENCES];

export default function CarnetSantePresentationScreen({ onStart }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openAt = (img: { src: string }) => {
    const idx = ALL_EXTRAITS.findIndex((x) => x.src === img.src);
    setLightbox(idx >= 0 ? idx : 0);
  };
  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + ALL_EXTRAITS.length) % ALL_EXTRAITS.length));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % ALL_EXTRAITS.length));
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <LandingNav onStart={onStart ?? (() => {})} />

      {/* Hero éditorial */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-12 sm:pt-16 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <motion.h1 {...fadeUp} className="mt-4 text-[2rem] sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                Toute votre santé,<br />
                <span className="italic font-serif text-teal-800">en un seul</span> carnet.
              </motion.h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Centralisez vos antécédents, vos traitements, vos examens et le suivi de votre famille. Sécurisé, accessible partout, partageable en un geste.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={onStart} className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full inline-flex items-center gap-2">
                  Créer mon carnet <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#feuilleter" className="px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Feuilleter le carnet
                </a>
                <a href="#decouvrir" className="px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-400 rounded-full inline-flex items-center gap-2">
                  Découvrir les sections
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
                <div className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-700" /> Chiffrement E2E</div>
                <div className="inline-flex items-center gap-2"><Cloud className="w-4 h-4 text-teal-700" /> Sync continue</div>
                <div className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-teal-700" /> Carnet familial</div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 aspect-[3/4] rounded-2xl overflow-hidden">
                  <ImageWithFallback src={IMG.hero} alt="Patient consultant son carnet de santé" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-2 grid grid-rows-2 gap-3">
                  <div className="rounded-2xl overflow-hidden">
                    <ImageWithFallback src={IMG.heroA} alt="Application santé sur mobile" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <ImageWithFallback src={IMG.heroB} alt="Suivi médical numérique" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.l} className="text-center sm:text-left">
              <div className="font-serif italic text-teal-800 text-3xl sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-500 tracking-[0.15em] uppercase">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote band image */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <ImageWithFallback src={IMG.band} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-5 pb-10 sm:pb-16 text-white">
            <div className="max-w-2xl">
              <div className="font-serif italic text-teal-200 text-sm tracking-wide">— Une promesse</div>
              <p className="mt-3 text-2xl sm:text-4xl tracking-tight leading-tight">
                « Votre carnet de santé doit vivre <span className="italic font-serif">avec vous</span>, vous suivre partout, et vous appartenir entièrement. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifeste éditorial — texte long structuré */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="font-serif italic text-teal-800 text-sm tracking-wide">— Le carnet HEALTHY PAGE</div>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Un accompagnement <span className="italic font-serif text-teal-800">complet</span>, <br className="hidden sm:block" />
              entièrement <span className="italic font-serif text-teal-800">personnalisé</span>.
            </h2>
            <p className="mt-6 text-slate-600 leading-relaxed">
              Pensé pour vivre avec vous, le carnet centralise vos informations de santé et vous guide à chaque étape, du quotidien aux situations d'urgence.
            </p>
            <div className="-mx-5 sm:mx-0 mt-8 sm:aspect-[4/3] overflow-hidden sm:rounded-2xl sm:ring-1 sm:ring-stone-200">
              <ImageWithFallback src={extraitCover} alt="Couverture carnet HEALTHY PAGE" className="w-full h-auto sm:h-full sm:object-cover block" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <motion.div {...fadeUp} className="border-l-2 border-teal-700 pl-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Centralisation</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Notre carnet de santé centralise l'ensemble des informations essentielles : antécédents médicaux, allergies, interventions réalisées et éléments importants à connaître en cas d'urgence. Grâce à son système de suivi évolutif, il enregistre l'historique des consultations, les diagnostics posés et les traitements prescrits, pour conserver une vision claire et structurée de votre parcours médical.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="border-l-2 border-teal-700 pl-6">
              <div className="flex items-center gap-3 mb-3">
                <Syringe className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Vaccinations &amp; calendrier</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Un espace dédié au suivi des vaccinations regroupe les dates, les rappels nécessaires et l'historique complet, consultables à tout moment. Le calendrier de santé intégré permet de planifier rendez-vous, examens et traitements, pour une meilleure organisation au quotidien et une compréhension accrue de votre état de santé.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="border-l-2 border-teal-700 pl-6">
              <div className="flex items-center gap-3 mb-3">
                <HeartPulse className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Paramètres vitaux &amp; conseils</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Suivi précis du poids, de la tension artérielle, de la glycémie ou encore de la croissance des enfants : les données mises à jour régulièrement aident à détecter plus tôt d'éventuelles anomalies et à anticiper certains risques. Le carnet propose en complément des recommandations adaptées au profil de l'utilisateur — nutrition, prévention, hygiène de vie.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="border-l-2 border-teal-700 pl-6">
              <div className="flex items-center gap-3 mb-3">
                <Stethoscope className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Continuité des soins</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                En regroupant toutes les données pertinentes en un seul endroit, le carnet facilite la communication avec les professionnels de santé : compréhension des symptômes, prise en charge en consultation, continuité de soins optimale. Une interface simple et intuitive, pour mieux gérer sa santé, gagner en autonomie et renforcer la prévention au quotidien.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feuilleter le carnet — flipbook interactif */}
      <section id="feuilleter" className="bg-white border-b border-stone-200 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <div className="font-serif italic text-teal-800 text-sm tracking-wide">— Feuilletez votre carnet</div>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Tournez les pages, <span className="italic font-serif text-teal-800">page après page</span>.
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Visualisez le carnet HEALTHY PAGE comme un véritable livre&nbsp;: avancez, reculez, parcourez chaque page à votre rythme.
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="relative aspect-[3/4] sm:aspect-[4/3] overflow-hidden bg-stone-100 rounded-2xl ring-1 ring-stone-200 shadow-2xl shadow-slate-900/10">
              <iframe
                src="https://drive.google.com/file/d/1xlXj8kCTKCZsx7MVln8YS6T9ak7o8VID/preview"
                title="Carnet de santé HEALTHY PAGE"
                allow="autoplay"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Feuilletez le carnet officiel HEALTHY PAGE
              </div>
              <a
                href="https://drive.google.com/file/d/1xlXj8kCTKCZsx7MVln8YS6T9ak7o8VID/view"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
              >
                Ouvrir en plein écran <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie d'extraits visuels — groupée par thème */}
      <section className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto sm:px-5 py-16 sm:py-20">
          <div className="px-5 sm:px-0 max-w-2xl mb-10">
            <div className="font-serif italic text-teal-800 text-sm tracking-wide">— Aperçus du carnet</div>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Quelques extraits, <span className="italic font-serif text-teal-800">en images</span>.
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Un aperçu des pages illustrées du carnet, regroupées par thème&nbsp;: générations de soins et urgences. Cliquez sur une image pour l'agrandir.
            </p>
          </div>

          {/* Thème 1 — Générations */}
          <div className="px-5 sm:px-0 mb-5 flex items-center gap-3">
            <span className="font-serif italic text-teal-800">01</span>
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Générations de soins</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="grid grid-cols-12 sm:gap-4 mb-12">
            {GENERATIONS.map((img, i) => (
              <figure
                key={img.src}
                onClick={() => openAt(img)}
                className={`${i === 0 ? 'col-span-12 sm:col-span-7 sm:aspect-[16/10]' : i === 1 ? 'col-span-12 sm:col-span-5 sm:aspect-[16/10]' : i === 2 ? 'col-span-12 sm:aspect-[21/9]' : 'col-span-12 sm:col-span-12 sm:aspect-[16/10]'} overflow-hidden bg-white sm:rounded-2xl sm:ring-1 sm:ring-stone-200 cursor-zoom-in group`}
              >
                <ImageWithFallback src={img.src} alt={img.alt} className="w-full h-auto sm:h-full sm:object-cover block transition-transform duration-500 group-hover:scale-[1.02]" />
              </figure>
            ))}
          </div>

          {/* Thème 2 — Urgences */}
          <div className="px-5 sm:px-0 mb-5 flex items-center gap-3">
            <span className="font-serif italic text-teal-800">02</span>
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Urgences &amp; secours</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="grid grid-cols-12 sm:gap-4">
            <figure
              onClick={() => openAt(URGENCES[0])}
              className="col-span-12 sm:aspect-[21/8] overflow-hidden bg-white sm:rounded-2xl sm:ring-1 sm:ring-stone-200 cursor-zoom-in group"
            >
              <ImageWithFallback src={URGENCES[0].src} alt={URGENCES[0].alt} className="w-full h-auto sm:h-full sm:object-cover block transition-transform duration-500 group-hover:scale-[1.02]" />
            </figure>
            {URGENCES.slice(1, 4).map((img, i) => (
              <figure
                key={img.src}
                onClick={() => openAt(img)}
                className={`${i === 2 ? 'col-span-12 sm:col-span-4' : 'col-span-12 sm:col-span-4'} sm:aspect-[3/4] overflow-hidden bg-white sm:rounded-2xl sm:ring-1 sm:ring-stone-200 cursor-zoom-in group`}
              >
                <ImageWithFallback src={img.src} alt={img.alt} className="w-full h-auto sm:h-full sm:object-cover block transition-transform duration-500 group-hover:scale-[1.02]" />
              </figure>
            ))}
            <figure
              onClick={() => openAt(URGENCES[4])}
              className="col-span-12 sm:aspect-[21/9] overflow-hidden bg-white sm:rounded-2xl sm:ring-1 sm:ring-stone-200 cursor-zoom-in group"
            >
              <ImageWithFallback src={URGENCES[4].src} alt={URGENCES[4].alt} className="w-full h-auto sm:h-full sm:object-cover block transition-transform duration-500 group-hover:scale-[1.02]" />
            </figure>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={close}>
          <button onClick={close} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white" aria-label="Fermer">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 sm:left-4 p-2 text-white/80 hover:text-white" aria-label="Précédent">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 sm:right-4 p-2 text-white/80 hover:text-white" aria-label="Suivant">
            <ChevronRight className="w-8 h-8" />
          </button>
          <motion.figure
            key={lightbox}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-[95vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={ALL_EXTRAITS[lightbox].src}
              alt={ALL_EXTRAITS[lightbox].alt}
              className="max-w-[95vw] max-h-[80vh] object-contain"
            />
            <figcaption className="mt-4 text-white/85 text-sm tracking-wide">
              {ALL_EXTRAITS[lightbox].caption}
              <span className="ml-3 text-white/50">{lightbox + 1} / {ALL_EXTRAITS.length}</span>
            </figcaption>
          </motion.figure>
        </div>
      )}

      {/* 6 sections */}
      <section id="decouvrir" className="max-w-6xl mx-auto px-5 py-14 sm:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
            Six sections pour <span className="italic font-serif text-teal-800">tout</span> consigner.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200 border border-stone-200 rounded-2xl overflow-hidden">
          {SECTIONS.map(({ Icon, n, t, d }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white p-6 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <Icon className="w-7 h-7 text-teal-700" strokeWidth={1.5} />
                <span className="font-serif italic text-stone-300 text-2xl">{n}</span>
              </div>
              <div className="mt-6 text-lg tracking-tight">{t}</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bénéfices avec image */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <ImageWithFallback src={IMG.app} alt="Application HEALTHY PAGE" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Un carnet pensé pour <span className="italic font-serif text-teal-800">votre vraie vie</span>.
            </h2>
            <ul className="mt-10 space-y-6">
              {BENEFITS.map(({ Icon, t, d }, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-5 border-b border-stone-200 pb-6 last:border-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <div className="text-lg tracking-tight">{t}</div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{d}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Parcours utilisateur */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
            Quatre étapes, et <span className="italic font-serif text-teal-800">c'est à vous</span>.
          </h2>
        </div>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {JOURNEY.map(({ Icon, t, d }, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative pt-6"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-stone-200">
                <div className="absolute top-0 left-0 h-px bg-teal-700" style={{ width: `${(i + 1) * 25}%` }} />
              </div>
              <div className="font-serif italic text-teal-800">0{i + 1}</div>
              <Icon className="w-7 h-7 text-slate-900 mt-3" strokeWidth={1.5} />
              <div className="mt-3 text-lg tracking-tight">{t}</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Souveraineté (dark) */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Lock className="w-8 h-8 text-teal-300" />
            <h2 className="mt-4 text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              Vos données vous <span className="italic font-serif text-teal-200">appartiennent.</span>
            </h2>
            <p className="mt-5 text-white/80 leading-relaxed max-w-xl">
              <HealthyPage /> ne revend rien, n'analyse rien sans votre consentement, et ne stocke que ce que vous décidez. Le carnet de santé est un bien intime, nous le traitons comme tel.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                'Chiffrement AES-256 de bout en bout',
                'Authentification biométrique',
                'Hébergement de santé certifié',
                'Aucune publicité, aucun pistage',
                'Export complet à tout moment',
                'Suppression définitive sur demande',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 border-b border-white/10 pb-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90 text-sm leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-teal-900/40 to-slate-900 border border-white/10 rounded-3xl p-8">
              <div className="font-serif italic text-teal-200 text-sm tracking-wide">— Engagement</div>
              <Quote className="w-8 h-8 text-teal-300 mt-4" />
              <p className="mt-4 text-xl tracking-tight leading-snug">
                « Aucune donnée de santé ne quitte votre appareil sans votre accord explicite. »
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 text-sm text-white/60">
                Politique de confidentialité <HealthyPage /> · 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
              Ils l'utilisent <span className="italic font-serif text-teal-800">au quotidien</span>.
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
                <Quote className="w-6 h-6 text-teal-700" />
                <blockquote className="mt-4 text-slate-700 leading-relaxed italic">« {t.q} »</blockquote>
                <figcaption className="mt-5 pt-4 border-t border-stone-200">
                  <div className="tracking-tight">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight leading-tight">
            Questions <span className="italic font-serif text-teal-800">fréquentes</span>.
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
                  {isOpen ? <Minus className="w-5 h-5 text-teal-700 flex-shrink-0 mt-1" /> : <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />}
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

      {/* CTA final full-bleed */}
      <section className="relative">
        <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
          <ImageWithFallback src={IMG.cta} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto px-5 pb-12 sm:pb-20 w-full text-white">
              <div className="max-w-2xl">
                <div className="font-serif italic text-teal-200 text-sm tracking-wide">— Prenez la main</div>
                <h2 className="mt-3 text-3xl sm:text-5xl tracking-tight leading-[1.05]">
                  Commencez votre <span className="italic font-serif text-teal-200">carnet de santé</span> aujourd'hui.
                </h2>
                <p className="mt-5 text-white/85 leading-relaxed">
                  Quelques minutes suffisent. Vous gardez la main sur vos données, à vie.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={onStart} className="px-7 py-3.5 bg-white text-slate-900 hover:bg-stone-100 rounded-full inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Démarrer maintenant
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

      <LandingFooter accent="emerald" onStart={onStart} />

      {/* Sticky CTA mobile */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-between gap-2 pl-5 pr-2 py-2"
        >
          <span className="text-sm tracking-tight">Créer mon carnet</span>
          <button onClick={onStart} className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2.5 text-sm inline-flex items-center gap-1.5">
            Démarrer <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

    </div>
  );
}
