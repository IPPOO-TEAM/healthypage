import { Baby, Flower2, Smile, Soup, Eye, Ear, Sparkles, Activity, Droplets, HeartPulse, ScanLine, BabyIcon, Syringe, Bone, Pill, Leaf, Brain, AlertTriangle, Apple, Stethoscope, Microscope, Accessibility, Sun, Palette, Snowflake, PenTool, Users, ArrowRight, Heart, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import imgOphtal from '../../imports/photo_17_2026-05-05_09-17-08.jpg';
import imgPedia from '../../imports/photo_18_2026-05-05_09-17-08.jpg';
import imgPharma from '../../imports/photo_19_2026-05-05_09-17-08.jpg';
import imgGastro from '../../imports/photo_20_2026-05-05_09-17-08.jpg';
import imgOrl from '../../imports/photo_21_2026-05-05_09-17-08.jpg';
import imgGyneco from '../../imports/photo_22_2026-05-05_09-17-08.jpg';
import imgUrgences from '../../imports/photo_23_2026-05-05_09-17-08.jpg';
import imgPsycho from '../../imports/photo_24_2026-05-05_09-17-08.jpg';
import imgGenerale from '../../imports/photo_25_2026-05-05_09-17-08.jpg';
import imgOdonto from '../../imports/photo_26_2026-05-05_09-17-08.jpg';
import imgEndocrino from '../../imports/photo_7_2026-05-05_09-17-08.jpg';
import imgDietetique from '../../imports/photo_8_2026-05-05_09-17-08.jpg';
import imgMaternite from '../../imports/photo_9_2026-05-05_09-17-08.jpg';
import imgRadio from '../../imports/photo_11_2026-05-05_09-17-08.jpg';
import imgOrtho from '../../imports/photo_12_2026-05-05_09-17-08.jpg';
import imgNutrition from '../../imports/photo_13_2026-05-05_09-17-08.jpg';
import imgDermato from '../../imports/photo_14_2026-05-05_09-17-08.jpg';
import imgMedDouce from '../../imports/photo_15_2026-05-05_09-17-08.jpg';
import imgChirurgie from '../../imports/photo_16_2026-05-05_09-17-08.jpg';
import imgAnesthesie from '../../imports/photo_1_2026-05-05_09-17-08.jpg';
import imgGeriatrie from '../../imports/photo_2_2026-05-05_09-17-08.jpg';
import imgRhumato from '../../imports/photo_3_2026-05-05_09-17-08.jpg';
import imgUrologie from '../../imports/photo_4_2026-05-05_09-17-08.jpg';
import imgAnalyse from '../../imports/photo_5_2026-05-05_09-17-08.jpg';
import imgInfirmier from '../../imports/photo_6_2026-05-05_09-17-08.jpg';

type Specialite = {
  name: string;
  desc: string;
  Icon: any;
  img?: string;
  grad: string;
  secondary?: boolean;
};

const SPECIALITES: Specialite[] = [
  { name: 'Pédiatrie', desc: 'Suivi médical complet des nourrissons, enfants et adolescents : croissance, vaccination, développement psychomoteur, prévention et prise en charge des maladies courantes.', Icon: Baby, img: imgPedia, grad: 'from-pink-500 to-rose-500' },
  { name: 'Gynécologie', desc: 'Accompagnement de la santé féminine : suivi menstruel, fertilité, dépistage, santé intime, troubles hormonaux et prévention des cancers féminins.', Icon: Flower2, img: imgGyneco, grad: 'from-fuchsia-500 to-pink-500' },
  { name: 'Odontologie', desc: 'Soins bucco-dentaires complets : hygiène, caries, extractions, traitement des gencives, esthétique dentaire et prévention.', Icon: Smile, img: imgOdonto, grad: 'from-amber-500 to-orange-500' },
  { name: 'Gastro-entérologie', desc: 'Diagnostic et traitement des problèmes digestifs : estomac, intestins, foie, pancréas, reflux, ulcères et intolérances alimentaires.', Icon: Soup, img: imgGastro, grad: 'from-emerald-500 to-teal-500' },
  { name: 'Ophtalmologie', desc: 'Prise en charge de la vision : dépistage, correction visuelle, maladies oculaires, suivi du glaucome, cataracte et rétinopathies.', Icon: Eye, img: imgOphtal, grad: 'from-cyan-500 to-blue-500' },
  { name: 'Oto-Rhino-Laryngologie (ORL)', desc: "Soins des oreilles, du nez et de la gorge : infections, allergies, troubles auditifs, sinusites, vertiges et troubles de la voix.", Icon: Ear, img: imgOrl, grad: 'from-orange-500 to-red-500' },
  { name: 'Dermatologie', desc: 'Soins de la peau, des cheveux et des ongles : eczéma, allergies, acné, infections, dépistage des cancers cutanés et traitements esthétiques.', Icon: Sparkles, img: imgDermato, grad: 'from-amber-400 to-yellow-500' },
  { name: 'Endocrinologie', desc: 'Gestion des hormones et du métabolisme : diabète, thyroïde, obésité, troubles hormonaux féminins/masculins et maladies métaboliques.', Icon: Activity, img: imgEndocrino, grad: 'from-violet-500 to-purple-500' },
  { name: 'Urologie', desc: 'Suivi des voies urinaires et génitales : incontinence, infections urinaires, calculs rénaux, prostate et dysfonctions urinaires.', Icon: Droplets, img: imgUrologie, grad: 'from-blue-500 to-indigo-500' },
  { name: 'Anesthésie – Réanimation', desc: 'Encadrement sécuritaire des interventions médicales et prise en charge des situations critiques nécessitant une stabilisation vitale.', Icon: HeartPulse, img: imgAnesthesie, grad: 'from-red-500 to-rose-600' },
  { name: 'Radiologie & Imagerie Médicale', desc: "Examens d'imagerie pour un diagnostic précis : radiographies, échographies, scanner, IRM et interprétation médicale experte.", Icon: ScanLine, img: imgRadio, grad: 'from-slate-500 to-zinc-600' },
  { name: 'Maïeutique', desc: "Suivi global de la grossesse, préparation à l'accouchement, conseils de maternité et accompagnement post-natal.", Icon: BabyIcon, img: imgMaternite, grad: 'from-rose-400 to-pink-500' },
  { name: 'Soins Infirmiers', desc: 'Soins quotidiens, pansements, injections, perfusions, éducation thérapeutique et accompagnement à domicile ou en consultation.', Icon: Syringe, img: imgInfirmier, grad: 'from-teal-500 to-emerald-600' },
  { name: 'Rhumatologie', desc: 'Traitement des maladies articulaires, musculaires et osseuses : arthrose, polyarthrite, douleurs chroniques, tendinites et inflammation.', Icon: Bone, img: imgRhumato, grad: 'from-stone-500 to-zinc-600' },
  { name: 'Pharmacie', desc: 'Gestion, dispensation et sécurisation des médicaments, conseils thérapeutiques personnalisés et suivi des prescriptions.', Icon: Pill, img: imgPharma, grad: 'from-lime-500 to-green-600' },
  { name: 'Médecine Douce', desc: 'Approches naturelles complémentaires : phytothérapie, massages thérapeutiques, techniques de relaxation et harmonisation du bien-être.', Icon: Leaf, img: imgMedDouce, grad: 'from-green-500 to-emerald-600' },
  { name: 'Sociologie – Psychologie', desc: 'Accompagnement mental, émotionnel et social : gestion du stress, suivi psychologique, soutien familial et thérapies comportementales.', Icon: Brain, img: imgPsycho, grad: 'from-indigo-500 to-violet-600' },
  { name: 'Urgences', desc: 'Prise en charge rapide et efficace des situations nécessitant une intervention immédiate : premiers soins, stabilisation, orientation.', Icon: AlertTriangle, img: imgUrgences, grad: 'from-red-500 to-orange-600' },
  { name: 'Nutrition', desc: 'Évaluation nutritionnelle, plan alimentaire personnalisé, conseils pour une alimentation équilibrée, gestion du poids et prévention.', Icon: Apple, img: imgNutrition, grad: 'from-emerald-500 to-lime-600' },
  { name: 'Maternité', desc: 'Suivi des futures mamans : monitoring, conseils, accompagnement durant toute la grossesse, préparation et soutien post-accouchement.', Icon: BabyIcon, img: imgMaternite, grad: 'from-pink-400 to-rose-500' },
  { name: 'Neurologie', desc: "Diagnostic et traitement des affections du système nerveux : migraines, AVC, épilepsie, troubles nerveux et neuropathies.", Icon: Brain, img: 'https://images.unsplash.com/photo-1666214280250-41f16ba24a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80', grad: 'from-purple-500 to-fuchsia-600', secondary: true },
  { name: 'Diététique', desc: 'Plans alimentaires spécialisés, rééquilibrage nutritionnel, prise en charge des intolérances et programmes adaptés aux pathologies.', Icon: Apple, img: imgDietetique, grad: 'from-lime-500 to-emerald-600' },
  { name: 'Médecine Générale', desc: 'Premier recours santé, écoute, évaluation des symptômes, prévention et orientation vers les spécialistes adaptés.', Icon: Stethoscope, img: imgGenerale, grad: 'from-emerald-500 to-teal-600' },
  { name: 'Infirmerie', desc: 'Soins de première intention, premiers secours, surveillance, soutien quotidien et orientation vers les services appropriés.', Icon: Syringe, img: imgInfirmier, grad: 'from-cyan-500 to-teal-600' },
  { name: 'Analyse Médicale', desc: 'Examens biologiques fiables : analyses sanguines, urinaires, dépistages et bilans complets pour un diagnostic précis.', Icon: Microscope, img: imgAnalyse, grad: 'from-blue-500 to-cyan-600' },
  { name: 'Gériatrie', desc: "Accompagnement spécialisé des seniors : suivi des pathologies liées à l'âge, maintien de l'autonomie, prévention et bien-être.", Icon: Users, img: imgGeriatrie, grad: 'from-amber-500 to-orange-600' },
  { name: 'Orthopédie', desc: 'Traitement des troubles du système locomoteur : fractures, déformations, douleurs articulaires et appareillage fonctionnel.', Icon: Accessibility, img: imgOrtho, grad: 'from-slate-500 to-blue-600' },
  { name: 'Chirurgie', desc: "Interventions spécialisées qui réparent, corrigent ou améliorent les fonctions de l'organisme, avec une rigueur absolue et un suivi jusqu'au rétablissement complet.", Icon: HeartPulse, img: imgChirurgie, grad: 'from-cyan-500 to-blue-600' },
  { name: 'Luminothérapie', desc: "Thérapie par la lumière pour améliorer l'humeur, lutter contre la dépression saisonnière, réguler le sommeil et dynamiser l'énergie.", Icon: Sun, img: 'https://images.unsplash.com/photo-1775642548902-2f60a0aa1405?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80', grad: 'from-yellow-400 to-amber-500', secondary: true },
  { name: 'Chromothérapie', desc: "Méthode thérapeutique utilisant les couleurs pour harmoniser les émotions et favoriser l'équilibre énergétique du corps.", Icon: Palette, img: 'https://images.unsplash.com/photo-1619449947405-6aa13108371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80', grad: 'from-fuchsia-500 to-rose-500', secondary: true },
  { name: 'Cryothérapie', desc: "Thérapie par le froid pour réduire l'inflammation, traiter les douleurs, améliorer la récupération et booster la circulation.", Icon: Snowflake, img: 'https://images.unsplash.com/photo-1611876385388-94a5e97a219a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80', grad: 'from-sky-400 to-cyan-500', secondary: true },
  { name: 'Tattoo-Thérapie', desc: "Approche psychocorporelle permettant l'expression de soi, la reconstruction identitaire, la valorisation personnelle et l'art-thérapie.", Icon: PenTool, img: 'https://images.unsplash.com/photo-1629223025308-e6e28a259984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80', grad: 'from-rose-500 to-fuchsia-600', secondary: true },
];

interface Props { onBack?: () => void }

export default function SpecialitesScreen({ onBack }: Props) {
  return (
    <div className="min-h-full bg-white">
      <LandingNav onStart={() => { window.location.href = '/'; }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white">
        <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-rose-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] bg-fuchsia-200/40 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
          <ImageWithFallback
            src={imgGenerale}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
          />
          <div className="relative">
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-slate-900">
              Nos <span className="bg-gradient-to-br from-rose-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">spécialités médicales</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Une couverture complète des disciplines de santé, de la pédiatrie aux thérapies psychocorporelles, pour accompagner chaque étape de votre vie avec des praticiens qualifiés.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="space-y-10 sm:space-y-14">
          {SPECIALITES.filter(s => !s.secondary).map((s, i) => {
            const { Icon } = s;
            const reverse = i % 2 === 1;
            return (
              <article
                key={s.name}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className={`lg:col-span-7 relative ${reverse ? 'lg:order-2' : ''}`}>
                  <ImageWithFallback
                    src={s.img!}
                    alt={s.name}
                    className="block w-full h-full max-h-[520px] object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none lg:hidden" />
                </div>

                <div className={`lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center ${reverse ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{s.name}</h2>
                  <p className="mt-3 text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-20 mb-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Autres <span className="bg-gradient-to-br from-rose-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">Spécialités</span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Approches innovantes et thérapies complémentaires pour un bien-être global.</p>
        </div>

        <div className="space-y-10 sm:space-y-14">
          {SPECIALITES.filter(s => s.secondary).map((s, i) => {
            const { Icon } = s;
            const reverse = i % 2 === 1;
            return (
              <article
                key={s.name}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className={`lg:col-span-7 relative ${reverse ? 'lg:order-2' : ''}`}>
                  <ImageWithFallback
                    src={s.img!}
                    alt={s.name}
                    className="block w-full h-full max-h-[520px] object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none lg:hidden" />
                </div>

                <div className={`lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center ${reverse ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{s.name}</h2>
                  <p className="mt-3 text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-rose-300" />
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            Une équipe <span className="bg-gradient-to-br from-rose-300 via-orange-200 to-amber-200 bg-clip-text text-transparent">pluridisciplinaire</span> à votre service
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Praticiens vérifiés, parcours coordonnés, suivi numérique : votre santé prise en charge avec rigueur et humanité.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 shadow-lg shadow-rose-500/30 transition"
            >
              Retour <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      <LandingFooter accent="cyan" />
    </div>
  );
}
