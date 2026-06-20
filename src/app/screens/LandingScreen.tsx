import { useEffect, useRef, useState } from "react";
import {
  Heart, Stethoscope, Pill, Activity, Users, Shield, Sparkles, MapPin,
  ArrowRight, CheckCircle2, Star, Phone, Mail, Globe, ChevronDown,
  Smartphone, Video, BookOpen, HeartHandshake, Briefcase, Plane,
  Calendar, Wallet, Siren, Baby, Flower2, Brain,
  Award, TrendingUp, Lock, Zap, Apple, Wind, GraduationCap,
  Building2, ChefHat, ShieldCheck, Clock, CreditCard, Headphones,
  FileText, BellRing, Languages, WifiOff, UserCheck, Microscope,
  Car, Home as HomeIcon, Leaf, Menu, X,
  QrCode, ScanLine, KeyRound, BadgeCheck, Gamepad2
} from "lucide-react";
import { LandingNav } from "../components/LandingNav";
import { LandingFooter } from "../components/LandingFooter";
import logo from "../../imports/1.png";
import carteAbonneFront from "../../imports/photo_21_2026-05-05_18-49-31-1.jpg";
import carteAbonneBack from "../../imports/photo_23_2026-05-05_18-49-31-1.jpg";
import imgNurseElder from "../../imports/photo_24_2026-04-30_21-36-08.jpg";
import imgAppMockup1 from "../../imports/Galaxy-S21-Ultra-healthypage.figma.site.png";
import imgAppMockup2 from "../../imports/Galaxy-S21-Ultra-healthypage.figma.site_(1).png";
import imgAppMockup3 from "../../imports/Galaxy-S21-Ultra-healthypage.figma.site_(2).png";
import imgAppDownload from "../../imports/Gemini_Generated_Image_k6ar33k6anr33k6ar_(1).png";
import imgPediatrician from "../../imports/photo_27_2026-04-30_21-36-08.jpg";
import imgVaccination from "../../imports/photo_13_2026-04-30_21-36-08-1.jpg";
import imgSisters from "../../imports/photo_14_2026-04-30_21-36-08-1.jpg";
import imgSorority from "../../imports/photo_15_2026-04-30_21-36-08-1.jpg";
import imgFamilyKitchen from "../../imports/photo_16_2026-04-30_21-36-08-1.jpg";
import imgNurseElderMan from "../../imports/photo_17_2026-04-30_21-36-08.jpg";
import imgHeartStetho from "../../imports/photo_18_2026-04-30_21-36-08.jpg";
import imgDoctorPatient from "../../imports/photo_19_2026-04-30_21-36-08.jpg";
import imgBloodPressure from "../../imports/photo_23_2026-04-30_21-36-08-1.jpg";
import imgMomBoy from "../../imports/photo_12_2026-04-30_21-36-08.jpg";
import imgEarExam from "../../imports/photo_25_2026-04-30_21-36-08.jpg";
import imgNurseChart from "../../imports/photo_26_2026-04-30_21-36-08.jpg";
import imgDoctorOffice from "../../imports/photo_28_2026-04-30_21-36-08-1.jpg";
import imgManStetho from "../../imports/photo_29_2026-04-30_21-36-08.jpg";
import imgStetho from "../../imports/photo_30_2026-04-30_21-36-08.jpg";
import imgSurgicalTeam from "../../imports/photo_31_2026-04-30_21-36-08-1.jpg";
import imgDeskStetho from "../../imports/photo_32_2026-04-30_21-36-08-1.jpg";
import imgMomTeen from "../../imports/photo_11_2026-04-30_21-36-08.jpg";
import bgWp1 from "../../imports/Jikook_wallpaper.jpg";
import bgWp2 from "../../imports/Zig.jpg";
import bgWp3 from "../../imports/téléchargement_-_2026-02-19T010840.560.jpg";
import bgWp4 from "../../imports/téléchargement_-_2026-02-19T010836.143.jpg";
import bgWp5 from "../../imports/téléchargement_-_2026-02-19T010826.111.jpg";
import bgWp6 from "../../imports/téléchargement_-_2026-02-18T214255.678.jpg";
import imgHppooBanner from "../../imports/Plan_de_travail15.jpg";
import imgSenior1 from "../../imports/photo_1_2026-05-05_08-48-04.jpg";
import imgSenior2 from "../../imports/photo_2_2026-05-05_08-48-04.jpg";
import imgSenior3 from "../../imports/photo_3_2026-05-05_08-48-04.jpg";
import imgSenior4 from "../../imports/photo_4_2026-05-05_08-48-04.jpg";
import imgSenior5 from "../../imports/photo_5_2026-05-05_08-48-04.jpg";
import imgSenior6 from "../../imports/photo_6_2026-05-05_08-48-04.jpg";
import imgSenior7 from "../../imports/photo_7_2026-05-05_08-48-04.jpg";
import imgSenior8 from "../../imports/photo_8_2026-05-05_08-48-04.jpg";
import imgNutri1 from "../../imports/photo_1_2026-05-05_09-08-48.jpg";
import imgNutri2 from "../../imports/photo_2_2026-05-05_09-08-48.jpg";
import imgNutri3 from "../../imports/photo_3_2026-05-05_09-08-48.jpg";
import imgNutri4 from "../../imports/photo_4_2026-05-05_09-08-48.jpg";
import imgNutri5 from "../../imports/photo_5_2026-05-05_09-08-48.jpg";
import imgNutri6 from "../../imports/photo_6_2026-05-05_09-08-48.jpg";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { HealthyPage } from "../components/Brand";

interface Props { onStart: () => void }

// Each image is used exactly once across the page.
const IMG = {
  heroDoctor: imgNurseElder,        // hero principal
  family: imgFamilyKitchen,         // famille en cuisine
  entrepreneur: imgSorority,         // groupe de femmes
  motherBaby: imgMomBoy,             // mère + petit garçon
  teenGirl: imgMomTeen,              // mère + fille ado
  manPro: imgManStetho,              // médecin homme stéthoscope
  food: imgStetho,                   // visuel santé
  yoga: imgSisters,                  // duo joyeux bien-être
  doctor2: imgDoctorOffice,          // médecin en cabinet
  fatherBaby: imgPediatrician,       // pédiatre + enfant
  operatingRoom: imgSurgicalTeam,    // équipe chirurgicale
  doctorListening: imgDoctorPatient, // auscultation
  surgeon: imgEarExam,               // examen ORL
  labWoman: imgNurseChart,           // infirmière + données
  labTeam: imgDeskStetho,            // bureau médecin moderne
  nurseSmile: imgNurseElderMan,      // infirmière + senior
  workerSmile: imgVaccination,       // vaccination enfant
  surgicalTeam: imgBloodPressure,    // mesure tension
  heartStetho: imgHeartStetho,       // décor symbolique
};

function AnimatedNumber({ value, duration = 1800, suffix = "", prefix = "" }: { value: number; duration?: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.floor(eased * value));
            if (p < 1) requestAnimationFrame(tick);
            else setN(value);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{prefix}{n.toLocaleString("fr-FR")}{suffix}</span>;
}

const STATS: { value: number; suffix: string; label: string; Icon: any; color: string }[] = [
  { value: 120000, suffix: "+", label: "Utilisateurs actifs", Icon: Users, color: "from-rose-500 to-pink-500" },
  { value: 850, suffix: "", label: "Professionnels certifiés", Icon: Stethoscope, color: "from-violet-500 to-fuchsia-500" },
  { value: 12, suffix: "", label: "Pays Afrique francophone", Icon: Globe, color: "from-emerald-500 to-teal-500" },
  { value: 320000, suffix: "+", label: "Consultations délivrées", Icon: Video, color: "from-emerald-500 to-teal-500" },
  { value: 8200, suffix: "+", label: "Avis · note 4.9/5", Icon: Star, color: "from-amber-500 to-orange-500" },
  { value: 24, suffix: "/7", label: "Support & urgences", Icon: Headphones, color: "from-red-500 to-rose-500" },
];

const GALLERY: { src: string; title: string; subtitle: string; tall?: boolean; wide?: boolean }[] = [
  { src: IMG.doctorListening, title: "Médecine moderne", subtitle: "Diagnostic clinique précis", tall: true },
  { src: IMG.operatingRoom, title: "Plateaux techniques", subtitle: "Blocs opératoires partenaires" },
  { src: IMG.labTeam, title: "Recherche & laboratoire", subtitle: "Analyses biologiques de pointe", wide: true },
  { src: IMG.surgeon, title: "Chirurgie spécialisée", subtitle: "Chirurgiens africains formés", tall: true },
  { src: IMG.nurseSmile, title: "Soins infirmiers", subtitle: "Personnel bienveillant" },
  { src: IMG.labWoman, title: "Innovation médicale", subtitle: "Diagnostic biomédical" },
  { src: IMG.surgicalTeam, title: "Équipes pluridisciplinaires", subtitle: "Pour une prise en charge complète", wide: true },
  { src: IMG.workerSmile, title: "Téléconsultation", subtitle: "Accessible depuis chez vous" },
];

const MODULES = [
  { Icon: Stethoscope, title: "Téléconsultation", desc: "Consultez médecins généralistes et spécialistes par vidéo, audio ou tchat, 24h/24, en français ou en langues locales (fon, yoruba, baoulé, wolof).", badge: "5 min d'attente", grad: "from-rose-500 to-pink-500" },
  { Icon: Pill, title: "Ordonnances & posologie", desc: "Renouvellement automatique, rappels de prises, alertes interactions médicamenteuses. Livraison en pharmacie partenaire ou à domicile.", badge: "Auto · sécurisé", grad: "from-amber-500 to-orange-500" },
  { Icon: Calendar, title: "Rendez-vous spécialistes", desc: "Plus de 850 médecins, sages-femmes, kinés, dentistes. Filtrez par spécialité, langue, ville, prix, tarif assurance.", badge: "Réservation 1 clic", grad: "from-violet-500 to-fuchsia-500" },
  { Icon: HeartHandshake, title: "Femmes & jeunes filles", desc: "Suivi des cycles, puberté, hygiène intime, écoute psychologique, sororité, lutte contre les VBG, mentorat.", badge: "100% privé", grad: "from-pink-500 to-rose-500" },
  { Icon: Apple, title: "Nutrition africaine", desc: "Plans alimentaires basés sur les produits locaux : mil, fonio, igname, légumes-feuilles, poissons. Adapté à votre santé.", badge: "Diabète · grossesse", grad: "from-emerald-500 to-teal-500" },
  { Icon: Wind, title: "Bien-être & santé mentale", desc: "Yoga, respiration guidée, gestion du stress, sommeil, méditation. Accompagnement par psychologues certifiés.", badge: "30+ programmes", grad: "from-teal-500 to-teal-500" },
  { Icon: Baby, title: "Pédiatrie & maternité", desc: "Carnet de vaccination, suivi de croissance, allaitement, premiers soins, conseils prénatals & postnatals.", badge: "0-12 ans", grad: "from-emerald-500 to-teal-500" },
  { Icon: Plane, title: "Diaspora", desc: "Suivez la santé de vos proches au pays, payez consultations et médicaments en mobile money depuis l'étranger.", badge: "Mobile Money + IBAN", grad: "from-emerald-500 to-purple-500" },
  { Icon: Briefcase, title: "Entreprise & RH", desc: "Programmes santé pour vos équipes, dashboard RH, assurances groupe, prévention, dépistages collectifs.", badge: "Pro · B2B", grad: "from-slate-700 to-slate-900" },
  { Icon: MapPin, title: "Carte santé géolocalisée", desc: "Centres, hôpitaux, pharmacies de garde, laboratoires d'analyses, ambulances. Avec horaires et avis.", badge: "Hors-ligne", grad: "from-rose-600 to-red-500" },
  { Icon: ChefHat, title: "Box alimentaires", desc: "Repas thérapeutiques livrés : adaptés au diabète, à la grossesse, à la convalescence, à l'hypertension.", badge: "Livraison J+1", grad: "from-orange-500 to-rose-500" },
  { Icon: Brain, title: "Médecine traditionnelle", desc: "Pharmacopée africaine documentée, plantes médicinales, tradithérapeutes certifiés et sécurisés.", badge: "Validé scientifiquement", grad: "from-purple-600 to-fuchsia-600" },
  { Icon: Siren, title: "Urgences & SOS", desc: "Bouton SOS qui géolocalise et alerte vos proches + secours. Numéros vitaux en un clic.", badge: "117 · 166 · 118", grad: "from-red-600 to-rose-600" },
  { Icon: Microscope, title: "Examens & laboratoires", desc: "Prise de sang à domicile, résultats numériques, partage sécurisé avec votre médecin.", badge: "À domicile", grad: "from-teal-600 to-emerald-600" },
  { Icon: Car, title: "Mobilité santé", desc: "Ambulance, taxi médical, transport de patients dialysés, accompagnement personnes âgées.", badge: "24h/24", grad: "from-emerald-600 to-teal-600" },
];

const STEPS = [
  { Icon: Smartphone, t: "1. Créez votre compte en 30 secondes", d: "Téléchargez Healthy Page (Android, iOS ou web). Choisissez votre profil, patient, professionnel, entreprise, diaspora, et renseignez quelques infos de base. Aucune carte bancaire requise." },
  { Icon: UserCheck, t: "2. Personnalisez votre carnet santé", d: "Ajoutez antécédents, allergies, traitements en cours, contacts d'urgence. Importez d'anciennes ordonnances. Vos données restent sur votre appareil par défaut, chiffrées." },
  { Icon: Video, t: "3. Consultez, suivez, agissez", d: "Réservez un médecin, lancez une téléconsultation, recevez une ordonnance, faites livrer vos médicaments, suivez votre cycle ou la croissance de votre enfant, en quelques clics." },
  { Icon: TrendingUp, t: "4. Une santé qui évolue avec vous", d: "Recevez conseils personnalisés, alertes vaccins, rappels, recommandations. L'app apprend de vous pour mieux vous accompagner, toujours bienveillante, jamais intrusive." },
];

const AUDIENCES = [
  { Icon: Heart, t: "Patients & familles", d: "Toute la santé de votre foyer en une seule app : consultations, ordonnances, vaccins enfants, suivi grossesse, prévention. Économisez du temps et de l'argent.", points: ["Consultation dès 1 500 FCFA", "Carnet familial illimité", "Conseils personnalisés"], img: IMG.family, color: "from-rose-500 to-pink-600", cta: "Créer mon compte famille" },
  { Icon: Stethoscope, t: "Professionnels de santé", d: "Médecins, sages-femmes, infirmiers, pharmaciens, kinés. Gérez votre agenda, vos patients, vos téléconsultations dans un environnement sécurisé conforme RGPD.", points: ["Agenda intelligent", "Dossiers patients sécurisés", "Téléconsultation HD intégrée"], img: IMG.doctor2, color: "from-emerald-500 to-teal-600", cta: "Rejoindre en tant que pro" },
  { Icon: Plane, t: "Diaspora & familles à l'étranger", d: "Vos parents au pays méritent les meilleurs soins. Suivez leurs RDV, payez consultations et médicaments depuis Paris, Montréal, Bruxelles ou New York.", points: ["Mobile Money + carte bancaire", "Suivi en temps réel", "Alertes urgences"], img: IMG.fatherBaby, color: "from-violet-500 to-purple-600", cta: "Protéger mes proches" },
  { Icon: Building2, t: "Entreprises & ONG", d: "Offrez à vos collaborateurs la santé numérique : prévention, dépistages, téléconsultation, assurances groupe. Tableau de bord RH inclus.", points: ["Dashboard analytique", "Tarifs B2B dégressifs", "Programmes sur mesure"], img: IMG.entrepreneur, color: "from-emerald-500 to-teal-600", cta: "Demander une démo" },
];

const FEATURES_DEEP = [
  { Icon: Languages, t: "Multilingue", d: "Français, anglais, fon, yoruba, baoulé, wolof, lingala." },
  { Icon: WifiOff, t: "Hors-ligne", d: "Carnet, conseils, fiches d'urgence accessibles sans réseau." },
  { Icon: CreditCard, t: "Mobile Money", d: "MTN, Orange, Moov, Wave, carte bancaire, IBAN diaspora." },
  { Icon: Shield, t: "Données chiffrées", d: "AES-256, hébergement Afrique, conforme aux réglementations locales." },
  { Icon: BellRing, t: "Rappels intelligents", d: "Médicaments, RDV, vaccins, règles, examens annuels." },
  { Icon: Headphones, t: "Support 24/7", d: "Assistance humaine en français et langues locales." },
];

const TESTIMONIALS = [
  { name: "Aïssata D., 28 ans", role: "Cotonou, Bénin", img: IMG.entrepreneur, q: "Enceinte de 7 mois, je vis loin d'une maternité. La téléconsultation Healthy Page m'a permis de suivre mon bébé semaine après semaine avec une sage-femme. Mon mari, qui travaille à Lagos, voit aussi tous les comptes-rendus. Une révolution.", rate: 5 },
  { name: "Dr. Kouamé J., 42 ans", role: "Médecin généraliste, Abidjan", img: IMG.manPro, q: "Avant Healthy Page, je perdais 2 heures par jour en gestion d'agenda et appels. Aujourd'hui, mes patients réservent en ligne, je consulte 30% de plus, et je ne perds aucun dossier. Mes confrères devraient tous l'adopter.", rate: 5 },
  { name: "Mariam B., 35 ans", role: "Diaspora, Paris", img: IMG.motherBaby, q: "Ma maman vit à Cotonou, elle a 68 ans et du diabète. Je paie ses consultations, ses analyses et ses médicaments en 1 clic depuis Paris. Je reçois ses rapports médicaux. Je dors enfin tranquille.", rate: 5 },
  { name: "Fatou S., 16 ans", role: "Lycéenne, Dakar", img: IMG.teenGirl, q: "La section jeunes filles m'aide à comprendre mon corps, mes règles, mes émotions. Discret, gratuit, sans tabou. J'ai même trouvé une marraine en ligne qui m'aide pour mes études.", rate: 5 },
];

const PARTNERS = [
  "Ministère de la Santé Bénin", "OMS Afrique", "UNICEF", "Mastercard Foundation",
  "Tony Elumelu", "UN Women", "Orange Health", "MTN MoMo", "AFD", "Girl Effect",
];

const PRICING = [
  { name: "Essentiel", price: "1 500 FCFA / mois", desc: "Pour découvrir et prendre soin de vous au quotidien.", features: ["Carnet santé personnel", "Suivi cycles & nutrition", "Bibliothèque conseils", "Carte des centres", "Bouton SOS", "1 téléconsult/mois incluse"], cta: "Démarrer", featured: false },
  { name: "Premium", price: "2 500 FCFA / mois", desc: "Le quotidien santé d'un foyer entier, sans limite.", features: ["Tout l'Essentiel, sans pub", "Téléconsultations illimitées", "Carnet familial (5 membres)", "Box alimentaire -20%", "Pharmacie à domicile", "Suivi pédiatrique avancé", "Support prioritaire"], cta: "Démarrer 14 jours offerts", featured: true },
  { name: "Diaspora", price: "9,90 € / mois", desc: "Protégez vos proches au pays, où que vous soyez.", features: ["Suivi 3 proches au pays", "Paiement mobile money intégré", "Alertes urgences SMS", "Téléconsult. illimitées proches", "Dashboard de suivi familial", "Conciergerie médicale dédiée"], cta: "Protéger ma famille", featured: false },
];

const FAQ = [
  { q: "Healthy Page est-elle vraiment gratuite ?", a: "Oui. La majorité des fonctions essentielles, carnet santé, suivi des cycles, nutrition, conseils, carte des centres, bouton SOS, première téléconsultation mensuelle, sont 100% gratuites. Les téléconsultations supplémentaires, médicaments et services premium sont payants à des tarifs locaux accessibles (à partir de 1 500 FCFA)." },
  { q: "Mes données médicales sont-elles vraiment protégées ?", a: "Oui. Toutes les données sont chiffrées en AES-256, hébergées dans des centres de données situés en Afrique conformes aux réglementations locales (Loi 2017-20 Bénin, Loi 2013-450 Côte d'Ivoire) ainsi qu'au RGPD. Votre carnet santé reste sur votre appareil par défaut. Aucune donnée n'est partagée sans votre consentement explicite. Vous pouvez exporter ou supprimer toutes vos données à tout moment." },
  { q: "Dans quels pays l'application est-elle disponible ?", a: "Healthy Page est officiellement déployée au Bénin, Côte d'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Cameroun, Gabon, Niger, Guinée, Congo et RDC. La diaspora peut accéder partout dans le monde via web et applications iOS/Android." },
  { q: "Comment paie-t-on les services ?", a: "Plusieurs moyens : Mobile Money (MTN, Orange, Moov, Wave), carte bancaire (Visa, Mastercard, GIM-UEMOA), espèces dans nos 1 200 points partenaires (boutiques, kiosques), virement diaspora (IBAN, Wise). Les paiements sont sécurisés par 3D Secure." },
  { q: "Puis-je utiliser l'app sans connexion internet ?", a: "Oui. Le mode hors-ligne donne accès à votre carnet santé, aux fiches d'urgence, aux conseils pré-téléchargés, à la prise de notes et au journal. La téléconsultation et la réservation de RDV nécessitent une connexion (3G suffit)." },
  { q: "Les médecins sont-ils vraiment qualifiés ?", a: "Oui. Chaque professionnel est vérifié manuellement : diplôme, inscription à l'Ordre national, RCP, identité. Les avis patients sont publics et modérés. Vous voyez l'historique, la spécialité, les langues parlées et les tarifs avant de réserver." },
  { q: "Que se passe-t-il en cas d'urgence vitale ?", a: "Le bouton SOS géolocalise votre position, envoie un SMS à vos contacts d'urgence et compose les numéros vitaux (117, 166, 118). Notre équipe peut aussi déclencher une ambulance partenaire si vous avez activé l'option Premium." },
  { q: "Y a-t-il un service pour les jeunes filles ?", a: "Oui. La section dédiée propose suivi du cycle, contenus puberté, hygiène intime, écoute psychologique anonyme, mentorat, lutte contre les violences basées sur le genre, sororité. 100% privée, gratuite, accessible dès 12 ans avec consentement parental." },
];

const TIMELINE = [
  { year: "2023", t: "Naissance", d: "Lancement à Cotonou avec 50 médecins partenaires." },
  { year: "2024", t: "Expansion ouest-africaine", d: "Côte d'Ivoire, Sénégal, Togo. 30 000 utilisateurs." },
  { year: "2025", t: "Diaspora & B2B", d: "Module diaspora et entreprises. 100 000 utilisateurs." },
  { year: "2026", t: "Continent", d: "12 pays · 850 pros · 120 000 utilisateurs · IA santé." },
];

export default function LandingScreen({ onStart }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Decorative wallpapers @ 3% opacity */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img src={bgWp1} alt="" className="absolute top-0 left-0 w-full sm:w-[60%] object-cover opacity-[0.03]" />
        <img src={bgWp2} alt="" className="absolute top-[20%] right-0 w-full sm:w-[50%] object-cover opacity-[0.03]" />
        <img src={bgWp3} alt="" className="absolute top-[40%] left-0 w-full sm:w-[55%] object-cover opacity-[0.03]" />
        <img src={bgWp4} alt="" className="absolute top-[60%] right-0 w-full sm:w-[50%] object-cover opacity-[0.03]" />
        <img src={bgWp5} alt="" className="absolute top-[78%] left-0 w-full sm:w-[55%] object-cover opacity-[0.03]" />
        <img src={bgWp6} alt="" className="absolute bottom-0 right-0 w-full sm:w-[60%] object-cover opacity-[0.03]" />
      </div>
      <div className="relative z-10">
      <LandingNav onStart={onStart} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white">
        <div className="absolute -top-20 -right-20 w-[32rem] h-[32rem] bg-rose-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-40 -left-32 w-[36rem] h-[36rem] bg-fuchsia-200/40 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] bg-amber-100/40 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-16 sm:pt-16 sm:pb-28 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left content */}
          <div className="lg:col-span-6 relative z-10">
            <h1 className="text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-7xl font-bold tracking-tight">
              Toute votre santé,<br />
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">enfin réunie.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Téléconsultation, ordonnances, suivi des cycles, pédiatrie, nutrition africaine, urgences, diaspora. Une plateforme bienveillante, pensée par et pour l'Afrique francophone, du Bénin à Paris, d'Abidjan à Dakar.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <button onClick={onStart} className="flex-1 sm:flex-none px-5 sm:px-7 py-3.5 sm:py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium inline-flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition text-sm sm:text-base">
                Lancer l'application <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#modules" className="flex-1 sm:flex-none px-5 sm:px-7 py-3.5 sm:py-4 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 rounded-full font-medium inline-flex items-center justify-center gap-2 transition shadow-sm text-sm sm:text-base">
                <Video className="w-4 h-4" /> Comment ça marche
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[IMG.entrepreneur, IMG.teenGirl, IMG.manPro, IMG.motherBaby, IMG.nurseSmile].map((u, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200 shadow-sm">
                    <ImageWithFallback src={u} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <span>Plébiscitée par <strong>120 000+</strong> familles africaines</span>
              </div>
            </div>
          </div>

          {/* Right visual, multi-image collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative grid grid-cols-6 grid-rows-6 gap-2 sm:gap-3 aspect-[5/6] sm:aspect-[6/7]">
              {/* Main big photo */}
              <div className="col-span-4 row-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <ImageWithFallback src={IMG.heroDoctor} alt="Médecin africaine avec stéthoscope" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Top right photo */}
              <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <ImageWithFallback src={IMG.surgeon} alt="Chirurgien africain" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Right middle photo */}
              <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <ImageWithFallback src={IMG.labWoman} alt="Laboratoire" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Bottom-left photo */}
              <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <ImageWithFallback src={IMG.nurseSmile} alt="Personnel soignant" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Bottom photo */}
              <div className="col-span-4 row-span-2 relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <ImageWithFallback src={IMG.operatingRoom} alt="Bloc opératoire" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating action cards */}
            <div className="hidden md:flex absolute -left-4 top-12 bg-white rounded-2xl shadow-2xl p-3 items-center gap-2.5 border border-slate-100 z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><Video className="w-5 h-5" /></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Téléconsult.</div>
                <div className="text-sm font-semibold">En cours · 14:30</div>
              </div>
            </div>
            <div className="hidden md:flex absolute -right-3 top-1/2 bg-white rounded-2xl shadow-2xl p-3 flex-col gap-1 border border-slate-100 w-52 z-10">
              <div className="flex items-center justify-between">
                <div className="text-xs text-rose-700 font-medium inline-flex items-center gap-1"><Flower2 className="w-3.5 h-3.5" /> Cycle</div>
                <span className="text-[10px] text-rose-500">J14</span>
              </div>
              <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-rose-500 to-pink-500" />
              </div>
              <div className="text-[10px] text-slate-500">Ovulation demain</div>
            </div>
            <div className="hidden lg:flex absolute -bottom-4 left-12 bg-white rounded-2xl shadow-2xl p-3 items-center gap-2 border border-slate-100 z-10">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div className="text-xs">
                <div className="font-semibold">Ordonnance prête</div>
                <div className="text-slate-500">Pharmacie à 200m</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-slate-900 to-fuchsia-900/30" />
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-rose-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-fuchsia-500/15 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight">L'impact de <HealthyPage /> en chiffres</h2>
            <p className="mt-3 text-slate-300 max-w-2xl mx-auto">Trois ans pour transformer l'accès aux soins en Afrique francophone et sa diaspora.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {STATS.map((s, i) => (
              <div key={i} className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
                  <s.Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl sm:text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-slate-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 98% de satisfaction</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-300" /> 5 min d'attente moyenne</span>
            <span className="inline-flex items-center gap-1.5"><Award className="w-4 h-4 text-rose-300" /> Prix Innovation Santé Afrique 2025</span>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-24 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <ImageWithFallback src={IMG.motherBaby} alt="Mère africaine avec son enfant" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Une santé digne, accessible et bienveillante pour chaque Africain.e.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            En Afrique francophone, plus de 60% des familles renoncent à des soins par manque d'accès, de temps ou d'information. <HealthyPage /> existe pour briser cette barrière. Nous croyons qu'avec un téléphone et un peu de réseau, chacun peut être suivi par un médecin compétent, comprendre son corps, protéger ses enfants et être écouté.e.
          </p>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Notre équipe, médecins, sages-femmes, ingénieurs, designers, est basée à Cotonou, Abidjan et Dakar. Nous bâtissons une plateforme <strong>africaine</strong>, dans nos langues, à nos prix, avec nos réalités.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { Icon: Leaf, t: "Locale", d: "Conçue en Afrique" },
              { Icon: Heart, t: "Humaine", d: "Sans jugement" },
              { Icon: ShieldCheck, t: "Sûre", d: "Données protégées" },
            ].map((v, i) => (
              <div key={i} className="text-center p-3 bg-rose-50/60 rounded-2xl">
                <v.Icon className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{v.t}</div>
                <div className="text-[11px] text-slate-500">{v.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="bg-gradient-to-br from-slate-50 to-rose-50/30 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Tout ce dont une famille africaine a besoin</h2>
            <p className="mt-3 text-slate-600">De la première consultation à la pharmacie à domicile : 15 modules pensés pour vos vies réelles.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m, i) => (
              <div key={i} className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-rose-200 transition cursor-pointer">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.grad} text-white flex items-center justify-center mb-3 shadow-sm`}>
                  <m.Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="font-semibold">{m.title}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">{m.badge}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
                <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={onStart} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium inline-flex items-center gap-2 shadow-md">
              Essayer tous les modules <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Gallery, modern African healthcare */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Une nouvelle génération de soignants</h2>
          <p className="mt-3 text-slate-600">Des médecins, sages-femmes, infirmiers, biologistes, chirurgiens africains formés aux standards les plus élevés. C'est avec eux que nous construisons <HealthyPage />.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 grid-flow-dense auto-rows-[140px] sm:auto-rows-[200px] gap-2.5 sm:gap-4">
          {GALLERY.map((g, i) => (
            <div key={i} className={`group relative rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 hover:shadow-2xl transition ${g.tall ? "row-span-2" : ""} ${g.wide ? "col-span-2" : ""}`}>
              <ImageWithFallback src={g.src} alt={g.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200 font-medium">{g.subtitle}</div>
                <div className="text-sm sm:text-base font-semibold mt-0.5 leading-tight">{g.title}</div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button onClick={onStart} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium inline-flex items-center gap-2 shadow-md">
            Trouver un soignant <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#qui" className="px-6 py-3 bg-white border border-slate-200 hover:border-rose-300 rounded-full font-medium inline-flex items-center gap-2">
            Devenir partenaire
          </a>
        </div>
      </section>

      {/* Feature highlight 1, Femmes */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-24 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Écouter votre corps, à chaque étape de votre vie.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Des premières règles à la ménopause, la grossesse, le post-partum, la sororité. <HealthyPage /> accompagne chaque femme africaine avec respect, sans tabou et en confidentialité absolue.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Suivi du cycle avec prédictions ovulation et fenêtre fertile",
              "Module puberté avec FAQ adaptée aux jeunes filles dès 12 ans",
              "Hygiène intime, conseils, journal d'écoute privé",
              "Bouton SOS géolocalisé contre les violences basées sur le genre",
              "Sororité : groupes de parole, mentorat, marraines formées",
              "Téléconsultations gynécologie & sage-femme",
            ].map((l, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />{l}</li>
            ))}
          </ul>
          <button onClick={onStart} className="mt-7 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium inline-flex items-center gap-2 shadow-md">
            Découvrir le module femmes <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="order-1 lg:order-2 relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <ImageWithFallback src={IMG.teenGirl} alt="Jeune fille africaine confiante" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/30 to-transparent" />
        </div>
      </section>

      {/* Bien manger, première médecine */}
      <section id="nutrition" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-lime-50/40 border-y border-emerald-100/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[28rem] h-[28rem] rounded-full bg-lime-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          {/* Hero */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                Bien manger, <span className="bg-gradient-to-br from-emerald-600 via-lime-500 to-amber-500 bg-clip-text text-transparent">la première médecine</span> du corps.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
                Bien se nourrir, c'est bien plus qu'un acte quotidien : c'est la première forme de soin. La nourriture construit nos cellules, fortifie nos défenses et influence notre longévité. Mangez mieux, vivez mieux, l'organisme se régénère, l'énergie revient, les pathologies chroniques reculent.
              </p>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Chez <HealthyPage />, nous croyons fermement que <em>« la santé commence dans l'assiette »</em>. Notre programme d'accompagnement nutritionnel personnalisé et scientifiquement encadré vous aide à retrouver un rapport simple, équilibré et bienveillant avec votre alimentation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={onStart} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white font-semibold px-6 py-3 shadow-lg shadow-emerald-500/30 transition">
                  Voir les plans nutrition <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#tarifs" className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-emerald-200 hover:bg-emerald-50 text-emerald-800 font-semibold px-6 py-3 transition">
                  Forfaits diététique
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-6 grid-rows-6 gap-3 h-[30rem] sm:h-[36rem]">
                <div className="col-span-4 row-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-emerald-100">
                  <ImageWithFallback src={imgNutri1} alt="Assiette équilibrée et colorée" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/0 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wide">
                      <Leaf className="w-3 h-3 text-emerald-300" /> Notre engagement
                    </span>
                    <p className="mt-3 text-white font-semibold text-lg sm:text-xl drop-shadow leading-snug">« Mangez mieux. Vivez mieux. »</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-emerald-100">
                  <ImageWithFallback src={imgNutri2} alt="Mets sur mesure" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><p className="text-white font-semibold text-sm">Mets sur mesure</p></div>
                </div>
                <div className="col-span-2 row-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-emerald-100">
                  <ImageWithFallback src={imgNutri3} alt="Produits frais locaux" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><p className="text-white font-semibold text-sm">Produits frais</p></div>
                </div>
                <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-emerald-100">
                  <ImageWithFallback src={imgNutri4} alt="Plan personnalisé" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><p className="text-white font-semibold text-sm">Plans perso.</p></div>
                </div>
                <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-emerald-100">
                  <ImageWithFallback src={imgNutri5} alt="Conseils diététiques" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><p className="text-white font-semibold text-sm">Conseils</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 services */}
          <div className="mt-20 grid md:grid-cols-3 gap-5">
            <div className="relative rounded-2xl sm:rounded-3xl bg-white ring-1 ring-emerald-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Adapter à votre condition réelle</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Maladies, habitudes, âge, activité, état émotionnel, historique médical : nous analysons votre profil global pour proposer une alimentation qui correspond vraiment à votre corps. Optimiser, prévenir, énergiser.</p>
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl bg-white ring-1 ring-emerald-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Mets sur mesure</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Suggestions de repas personnalisés : variés, équilibrés, délicieux et accessibles. Perte de poids, prise de masse, régulation métabolique, gestion des maladies chroniques, toujours sans frustration.</p>
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl bg-white ring-1 ring-emerald-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-lime-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Suivi diététique régulier</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Suivez vos progrès, ajustez les plans, corrigez les habitudes néfastes, installez de nouvelles routines positives et stabilisez durablement votre état de santé.</p>
            </div>
          </div>

          {/* Promise band */}
          <div className="mt-16 grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg ring-1 ring-emerald-100 aspect-[4/3] lg:aspect-auto">
              <ImageWithFallback src={imgNutri6} alt="Cuisine saine et conviviale" className="w-full h-full object-cover" />
            </div>
            <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white ring-1 ring-emerald-100 p-8 sm:p-10 shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Une relation équilibrée avec la nourriture, un bien-être profond.</h3>
              <ul className="mt-6 space-y-3">
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /><span>Renforce le système immunitaire, améliore sommeil, humeur, digestion et concentration.</span></li>
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" /><span>Réduit les risques de diabète, hypertension, obésité et troubles digestifs.</span></li>
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" /><span>Diminue les inflammations et redonne vitalité au quotidien.</span></li>
              </ul>
              <p className="mt-6 italic text-slate-600 border-l-4 border-emerald-300 pl-4">« <HealthyPage />, la santé commence dans l'assiette. »</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlight 3, Bien-être */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-24 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Prendre soin de l'esprit autant que du corps.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            La santé mentale en Afrique reste taboue. <HealthyPage /> propose un espace sûr, anonyme et accessible : psychologues certifiés, exercices de respiration, méditation guidée en français et en langues locales, sommeil, gestion du stress.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Téléconsultation avec psychologues africains certifiés",
              "Programmes de cohérence cardiaque (4-4-6)",
              "Yoga doux & étirements adaptés à la maison",
              "Suivi du sommeil et journal d'humeur privé",
              "Lignes d'écoute confidentielles 24/7",
            ].map((l, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />{l}</li>
            ))}
          </ul>
          <button onClick={onStart} className="mt-7 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium inline-flex items-center gap-2 shadow-md">
            Explorer le bien-être <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="order-1 lg:order-2 relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <ImageWithFallback src={IMG.yoga} alt="Femme africaine pratiquant le yoga" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Deep features */}
      <section className="bg-slate-50/80 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pensée pour les réalités africaines</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES_DEEP.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <f.Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.t}</div>
                  <p className="text-sm text-slate-600 mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Comment ça marche ?</h2>
          <p className="mt-3 text-slate-600">Quatre étapes simples pour reprendre votre santé en main.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="relative bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="absolute -top-4 left-7 w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-fuchsia-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <s.Icon className="w-7 h-7 text-rose-600 mb-3 mt-3" />
              <div className="font-semibold text-lg">{s.t}</div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section id="qui" className="bg-gradient-to-br from-slate-50 to-rose-50/30 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Pour qui est <HealthyPage /> ?</h2>
            <p className="mt-3 text-slate-600">Une expérience taillée pour chaque profil.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {AUDIENCES.map((a, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                <div className="relative h-40 sm:h-48">
                  <ImageWithFallback src={a.img} alt={a.t} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${a.color} opacity-60`} />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center text-slate-900 shadow-md">
                    <a.Icon className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xl font-bold text-white drop-shadow">{a.t}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{a.d}</p>
                  <ul className="mt-4 space-y-1.5">
                    {a.points.map((p, j) => (
                      <li key={j} className="flex gap-2 text-xs text-slate-700"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />{p}</li>
                    ))}
                  </ul>
                  <button onClick={onStart} className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition">
                    {a.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accompagnement Premium Séniors */}
      <section id="seniors" className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-rose-50/40 border-y border-stone-200/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 -left-24 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-10 -right-16 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          {/* Hero */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                Bien vieillir, c'est <span className="bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">vivre mieux</span>, entouré et en confiance.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
                <HealthyPage /> a conçu un programme entièrement dédié aux séniors pour leur offrir un accompagnement complet, humain et rassurant. Notre objectif : préserver leur santé, renforcer leur autonomie et améliorer leur qualité de vie au quotidien, pour que chaque sénior se sente écouté, accompagné et valorisé.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#modules" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-semibold px-6 py-3 shadow-lg shadow-rose-500/30 transition">
                  Découvrir le programme <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#tarifs" className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-stone-300 hover:bg-stone-50 text-slate-800 font-semibold px-6 py-3 transition">
                  Forfaits famille
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-6 grid-rows-6 gap-3 h-[30rem] sm:h-[36rem]">
                <div className="col-span-4 row-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                  <ImageWithFallback src={imgSenior1} alt="Sénior accompagné avec tendresse" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/0 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wide">
                      <Sparkles className="w-3 h-3 text-rose-300" /> Notre promesse
                    </span>
                    <p className="mt-3 text-white font-semibold text-lg sm:text-xl drop-shadow leading-snug">« La santé, l'écoute et la douceur au cœur de chaque journée. »</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                  <ImageWithFallback src={imgSenior2} alt="Suivi santé régulier" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">Suivi santé</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                  <ImageWithFallback src={imgSenior3} alt="Personne de compagnie" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">Compagnie</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                  <ImageWithFallback src={imgSenior4} alt="Nutrition adaptée" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">Nutrition</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-stone-200">
                  <ImageWithFallback src={imgSenior5} alt="Activités stimulantes" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">Stimulation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Suivi santé régulier</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Évaluation de l'état général, surveillance des constantes, prise de médicaments, coordination avec médecins et spécialistes, organisation des rendez-vous.</p>
            </div>
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Personne de compagnie</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Pour rompre l'isolement : moments chaleureux partagés, accompagnement aux sorties, écoute active et environnement social rassurant.</p>
            </div>
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-lime-500/30">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Accompagnement nutritionnel</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Plans alimentaires équilibrés et personnalisés, suivi des apports, conseils sur les bonnes pratiques pour un mode de vie sain et durable.</p>
            </div>
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Hygiène & cadre de vie</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Aide à l'hygiène, organisation du cadre de vie, assistance quotidienne et confort à domicile pour préserver dignité et sérénité.</p>
            </div>
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Soutien psycho & cognitif</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Soutien psychologique bienveillant et activités de stimulation cognitive pour préserver l'éveil et la sérénité de l'esprit.</p>
            </div>
            <div className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="absolute top-0 left-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-bold text-slate-900 text-lg">Gestion administrative santé</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Démarches d'assurance, dossier médical, prise de RDV, accès à des conseils spécialisés pour un bien-être global et durable.</p>
            </div>
          </div>

          {/* Promise band */}
          <div className="mt-20 grid lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg ring-1 ring-stone-200 aspect-[3/4]">
                <ImageWithFallback src={imgSenior6} alt="Présence rassurante" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-rows-2 gap-3 aspect-[3/4]">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg ring-1 ring-stone-200 min-h-0">
                  <ImageWithFallback src={imgSenior7} alt="Soin attentionné" className="w-full h-full object-cover" />
                </div>
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg ring-1 ring-stone-200 min-h-0">
                  <ImageWithFallback src={imgSenior8} alt="Sérénité retrouvée" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 rounded-3xl bg-white ring-1 ring-stone-200 p-8 sm:p-10 shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Une présence, un soutien, un compagnon de vie.</h3>
              <ul className="mt-6 space-y-3">
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" /><span>Une présence et un compagnon de vie pour chaque sénior, au quotidien.</span></li>
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" /><span>La garantie d'un accompagnement humain, sécurisé et respectueux.</span></li>
                <li className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /><span>L'engagement de redonner confort, dignité et sérénité à chaque étape de la vie.</span></li>
              </ul>
              <p className="mt-6 italic text-slate-600 border-l-4 border-rose-300 pl-4">« <HealthyPage />, la santé, l'écoute et la douceur au cœur de chaque journée. »</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offres dédiées */}
      <section id="offres-dediees" className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Des offres pensées pour chaque étape de vie</h2>
          <p className="mt-3 text-slate-600">Étudiants, futures mamans, familles, crèches & centres de loisirs : un accompagnement sur-mesure, humain et accessible.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {/* 1. Étudiants */}
          <article className="group relative bg-gradient-to-br from-emerald-50 via-white to-violet-50 border border-emerald-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
            <div className="relative h-52 sm:h-60 overflow-hidden">
              <ImageWithFallback src="https://images.unsplash.com/photo-1726690330713-18c0c0efbdc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Étudiant en pleine session de travail" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/10 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white/90 text-xs font-medium">Offre 01</div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Santé & Bien-être Étudiants</h3>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Pensée pour les jeunes confrontés au stress, au manque de sommeil, à une alimentation déséquilibrée et à la pression académique. Diagnostic complet (profil alimentaire, carences, fatigue, habitudes), puis plans repas <span className="font-medium">simples, rapides et économiques</span>, adaptés aux emplois du temps chargés.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Soutien à la gestion du stress, sommeil, concentration et habitudes propices à la réussite. Routines courtes (stretching, mobilité, express), suivi mensuel et rappels intelligents pour rester motivé toute l'année.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
              {["Plans repas budget étudiant","Gestion stress & sommeil","Routines express","Rappels intelligents"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            </div>
          </article>

          {/* 2. Maternité */}
          <article className="group relative bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-rose-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
            <div className="relative h-52 sm:h-60 overflow-hidden">
              <ImageWithFallback src="https://images.unsplash.com/photo-1623669118847-9587296277e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Future maman lifestyle moderne" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-rose-900/10 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white/90 text-xs font-medium">Offre 02</div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Maternité & Grossesse</h3>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Un accompagnement des premiers mois jusqu'au post-partum. Diagnostic global (alimentation, prise de poids, sommeil, symptômes) puis plan nutritionnel adapté à chaque trimestre (envies, nausées, hydratation, micronutriments) pour favoriser le développement du bébé et prévenir diabète gestationnel, pré-éclampsie ou anémies.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Conseils sommeil, postures, exercices doux (respiration, yoga prénatal, mobilité), préparation à l'accouchement, puis suivi post-partum : retour en forme, hormones, périnée, routine bébé.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
              {["Plan nutrition par trimestre","Yoga prénatal & respiration","Prévention complications","Suivi post-partum"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-700"><CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            <a href="/kit-grossesse" className="mt-6 inline-flex items-center gap-2 text-rose-700 hover:text-rose-800 font-medium text-sm">
              Découvrir le Kit Préparation Grossesse & Naissance <ArrowRight className="w-4 h-4" />
            </a>
            </div>
          </article>

          {/* 3. Familles */}
          <article className="group relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
            <div className="relative h-52 sm:h-60 overflow-hidden">
              <ImageWithFallback src="https://images.unsplash.com/photo-1606787364410-947e10173148?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Famille africaine partage repas équilibré" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/10 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white/90 text-xs font-medium">Offre 03</div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Familles & Équilibre du Foyer</h3>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Un mode de vie sain pour tous : enfants, ados, adultes, seniors, sportifs. Bilan individuel, puis menus familiaux harmonisés selon les goûts, le budget et le rythme, pour réduire l'ultra-transformé, prévenir l'obésité infantile et créer une dynamique positive autour de la table.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Astuces pour enfants difficiles, lunchbox équilibrées, routines petit-déjeuner, hydratation, sommeil. Ateliers « Cuisine saine en famille », accompagnement instantané en cas de maladie et espace de communication centralisé.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
              {["Menus familiaux équilibrés","Ateliers cuisine saine","Soutien enfants difficiles","Suivi santé centralisé"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            </div>
          </article>

          {/* 4. Centres / Crèches */}
          <article className="group relative bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
            <div className="relative h-52 sm:h-60 overflow-hidden">
              <ImageWithFallback src="https://images.unsplash.com/photo-1761208663763-c4d30657c910?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Enfants jouant en crèche moderne" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-amber-900/10 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white/90 text-xs font-medium">Offre 04</div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Centres de Loisirs, Garderie & Crèche</h3>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Pour les structures accueillant des enfants : un environnement sain, sécurisé et stimulant. <span className="font-medium">0–3 ans</span> : suivi nutritionnel (lait, purées, bouillies, diversification), surveillance croissance & hydratation, sommeil, stimulation cognitive douce, hygiène stricte et rapport quotidien aux parents.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              <span className="font-medium">3–12 ans</span> : activités ludiques & éducatives (sports légers, motricité, ateliers créatifs, pédagogie du bien-manger), menus adaptés, hydratation et repos. Personnel formé aux premiers soins, fiches de suivi individuel partagées avec les parents.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
              {["Suivi nutritionnel 0–3 ans","Activités éducatives 3–12 ans","Personnel formé premiers soins","Rapports quotidiens parents"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-700"><CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            </div>
          </article>
        </div>

        <div className="mt-10 text-center">
          <button onClick={onStart} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition">
            Découvrir l'offre adaptée <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Carte d'abonné — QR code */}
      <section id="carte-abonne" className="relative bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-24 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 text-xs text-rose-700 font-medium uppercase tracking-wide">
              <QrCode className="w-3.5 h-3.5" /> Carte d'abonné HEALTHY PAGE
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              Une carte unique, un QR code,<br className="hidden sm:block" /> tout votre univers santé.
            </h2>
            <div className="mt-6 space-y-5 text-slate-700 leading-relaxed text-[15px] sm:text-base">
              <p>
                Chez <strong>HEALTHY PAGE</strong>, la carte d'abonné dotée d'un QR code occupe une place essentielle dans notre écosystème de services. Conçue pour offrir simplicité, fluidité et sécurité, elle permet à chaque utilisateur d'accéder facilement à son univers santé. Dès qu'elle est scannée, la carte assure une <strong>authentification instantanée</strong>, garantissant que l'accès aux informations personnelles et aux services soit réservé uniquement à son titulaire. Elle devient ainsi un outil fiable qui protège l'intégrité des données tout en facilitant leur usage.
              </p>
              <p>
                La carte d'abonné permet également une <strong>connexion rapide</strong> à l'espace personnel sur HEALTHY PAGE. Plus besoin de mémoriser des identifiants complexes&nbsp;: un simple scan suffit pour ouvrir son tableau de bord, consulter ses informations de santé, ses suivis ou ses rendez-vous. Cette approche simplifiée renforce l'autonomie des utilisateurs et leur permet de naviguer plus sereinement dans leur espace dédié.
              </p>
              <p>
                Le QR code intégré joue aussi un rôle déterminant dans le <strong>processus de paiement</strong>. Il permet d'effectuer ou de valider des transactions de manière sécurisée, qu'il s'agisse d'un renouvellement d'abonnement, d'un service ponctuel ou d'un accès privilégié. Cette solution digitale réduit les contraintes habituelles, optimise le temps et garantit une expérience fluide.
              </p>
              <p>
                Enfin, la carte d'abonné HEALTHY PAGE constitue un puissant <strong>outil d'identification</strong>. Elle contient toutes les informations nécessaires pour reconnaître rapidement l'utilisateur, vérifier son statut et lui attribuer automatiquement les avantages liés à son abonnement. Que ce soit lors d'une consultation, d'un contrôle ou de l'accès à un service spécifique, cette carte représente la preuve officielle de son appartenance à notre plateforme.
              </p>
              <p>
                Avec cette carte unique et moderne, HEALTHY PAGE renforce sa mission&nbsp;: offrir un environnement sécurisé, pratique et accessible, où chaque utilisateur peut gérer sa santé avec confiance et tranquillité.
              </p>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {[
                { Icon: ScanLine, t: "Authentification instantanée", d: "Scan = accès sécurisé à votre compte." },
                { Icon: KeyRound, t: "Connexion sans mot de passe", d: "Tableau de bord en un seul scan." },
                { Icon: CreditCard, t: "Paiement sécurisé", d: "Renouvellements & services validés en QR." },
                { Icon: BadgeCheck, t: "Identification officielle", d: "Avantages d'abonnement reconnus partout." },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-rose-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-6 bg-gradient-to-br from-rose-200/40 via-fuchsia-200/30 to-amber-200/30 rounded-[2.5rem] blur-2xl" />
              <div className="relative space-y-4">
                <img src={carteAbonneFront} alt="Carte de santé & bien-être HEALTHY PAGE — recto" className="relative w-full block rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200 rotate-[-2deg]" />
                <img src={carteAbonneBack} alt="Carte de santé & bien-être HEALTHY PAGE — verso avec QR code" className="relative w-full block rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200 rotate-[2deg]" />
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ScanLine className="w-3.5 h-3.5" /> Scannez pour vous connecter, payer ou être identifié
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Des prix justes, africains, sans surprise.</h2>
          <p className="mt-3 text-slate-600">Sans engagement. Annulable à tout moment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PRICING.map((p, i) => (
            <div key={i} className={`relative bg-white rounded-3xl p-7 border ${p.featured ? "border-rose-300 shadow-2xl shadow-rose-200/50 ring-2 ring-rose-200" : "border-slate-100 shadow-sm"}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white text-xs font-medium rounded-full shadow">Le plus populaire</div>}
              <div className="text-sm font-semibold text-rose-700">{p.name}</div>
              <div className="mt-2 text-3xl font-bold tracking-tight">{p.price}</div>
              <p className="text-sm text-slate-500 mt-1.5">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button onClick={onStart} className={`mt-7 w-full py-3 rounded-full font-medium text-sm transition ${p.featured ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-slate-900 text-white">
      </section>

      {/* Testimonials */}
      <section id="avis" className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Ils nous racontent</h2>
          <p className="mt-3 text-slate-600">Des milliers de personnes ont déjà transformé leur santé. Voici quelques voix.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rate }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-800 italic leading-relaxed">« {t.q} »</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-rose-100">
                  <ImageWithFallback src={t.img} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="relative bg-slate-50/80 border-y border-slate-100 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 opacity-10 pointer-events-none">
          <ImageWithFallback src={IMG.heartStetho} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-6">
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PARTNERS.map(p => (
              <div key={p} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs sm:text-sm text-slate-700 shadow-sm">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Botanique, Pharmacopée & Médecine ancestrale */}
      <section id="heritage" className="relative bg-gradient-to-b from-emerald-50 via-amber-50/40 to-white border-y border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-28">
          <div className="text-center mb-12">
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">Botanique, pharmacopée & médecine ancestrale</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">Un pont entre les savoirs traditionnels d'Afrique et la médecine moderne. Plantes, préparations et rituels documentés par des praticiens, en dialogue avec les soins cliniques.</p>
          </div>

          {/* Mosaïque d'images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-14">
            <div className="aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
              <ImageWithFallback src="https://images.unsplash.com/photo-1637219415191-6d54f6bb47e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Feuillage" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-sm sm:translate-y-6">
              <ImageWithFallback src="https://images.unsplash.com/photo-1759015425581-466896dc050b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Fleurs jaunes" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
              <ImageWithFallback src="https://images.unsplash.com/photo-1770572271597-595e0041846b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Plantes séchées" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-sm sm:translate-y-6">
              <ImageWithFallback src="https://images.unsplash.com/photo-1768700439764-9ec0ba31ae75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Mortier et ingrédients" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 3 piliers */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Botanique */}
            <article className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-emerald-100 shadow-md hover:shadow-xl transition">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 aspect-[16/10] overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Botanique" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1761730249607-49256cfd8fb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Fleurs violettes" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1637219416072-d6e69459b611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Plante dans la brume" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="mt-2 text-xl font-bold text-slate-900">Le savoir des plantes</h3>
                <p className="mt-3 text-sm text-slate-600">Identification, fiches d'usage, précautions et interactions des plantes médicinales locales (moringa, kinkéliba, neem, vernonia, hibiscus…), vérifiées par des praticiens.</p>
              </div>
            </article>

            {/* Pharmacopée */}
            <article className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-amber-100 shadow-md hover:shadow-xl transition">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 aspect-[16/10] overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1744461988499-b62936ad047b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Pharmacopée" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1474904200416-6b2b7926f26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Épices" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1673208126879-18094b40d9cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Plantes séchées" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="mt-2 text-xl font-bold text-slate-900">Préparations documentées</h3>
                <p className="mt-3 text-sm text-slate-600">Tisanes, décoctions, macérations et cataplasmes : recettes traditionnelles, posologies, indications et contre-indications, validées en collaboration avec des pharmaciens.</p>
              </div>
            </article>

            {/* Médecine ancestrale */}
            <article className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-rose-100 shadow-md hover:shadow-xl transition">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 aspect-[16/10] overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1772787429360-10c9686d0204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80" alt="Médecine ancestrale" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1672505155432-f25c16aef2a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Pratique traditionnelle" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1704597435621-ff7026f124fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=720&q=80" alt="Bols de fleurs" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="mt-2 text-xl font-bold text-slate-900">Savoirs transmis</h3>
                <p className="mt-3 text-sm text-slate-600">Protocoles ancestraux, accompagnement holistique, rituels de soin du corps et de l'esprit, en dialogue respectueux avec la médecine moderne.</p>
              </div>
            </article>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a href="#modules" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 shadow-md transition">Découvrir le module Pharmacopée</a>
          </div>
        </div>
      </section>

      {/* Download the app */}
      <section id="telecharger" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950 text-white">
        <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Téléchargez <HealthyPage /><br />sur votre mobile
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
              Carnet santé, téléconsultation, suivi des cycles, rappels de médicaments, bouton SOS, toute votre santé dans la poche, hors connexion incluse.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a href="#" aria-label="Télécharger sur l'App Store" className="group inline-flex items-center gap-3 bg-black text-white hover:bg-black/90 rounded-2xl px-5 py-3 shadow-lg transition">
                <svg viewBox="0 0 384 512" className="w-7 h-7" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.4 84.5c30.1-35.7 27.4-68.2 26.5-79.9-26.6 1.5-57.4 18.1-74.9 38.5-19.3 21.9-30.6 49-28.2 78.7 28.8 2.2 55.1-12.6 76.6-37.3z"/>
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">Télécharger sur</div>
                  <div className="font-semibold text-lg -mt-0.5">App Store</div>
                </div>
              </a>
              <a href="#" aria-label="Disponible sur Google Play" className="group inline-flex items-center gap-3 bg-black text-white hover:bg-black/90 rounded-2xl px-5 py-3 shadow-lg transition">
                <svg viewBox="0 0 512 512" className="w-7 h-7" aria-hidden="true">
                  <defs>
                    <linearGradient id="gp-blue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#00C3FF"/><stop offset="1" stopColor="#1AAEFF"/>
                    </linearGradient>
                    <linearGradient id="gp-green" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#00F076"/><stop offset="1" stopColor="#00D26A"/>
                    </linearGradient>
                    <linearGradient id="gp-yellow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#FFCC00"/><stop offset="1" stopColor="#FFB300"/>
                    </linearGradient>
                    <linearGradient id="gp-red" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#FF3A44"/><stop offset="1" stopColor="#E03030"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#gp-green)" d="M40 24c-5 3-8 8-8 14v436c0 6 3 11 8 14l242-232L40 24z"/>
                  <path fill="url(#gp-blue)" d="M362 198 282 256l80 58 78-44c14-8 14-28 0-36l-78-36z"/>
                  <path fill="url(#gp-yellow)" d="m282 256-242 232c5 3 12 3 18 0l324-180-100-52z"/>
                  <path fill="url(#gp-red)" d="M58 24c-6-3-13-3-18 0l242 232 80-58L58 24z"/>
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">Disponible sur</div>
                  <div className="font-semibold text-lg -mt-0.5">Google Play</div>
                </div>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4,9 / 5 · 12 400 avis</div>
              <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> iOS · Android · Web</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Données chiffrées</div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <img src={imgAppDownload} alt="Téléchargez Healthy Page" className="w-full h-auto drop-shadow-2xl rounded-3xl" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      {/* Univers complémentaires : Voyage / Urgences / Jeux */}
      <section id="univers" className="bg-gradient-to-br from-slate-50 to-rose-50/20 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="inline-flex items-center gap-2 text-xs text-rose-800 font-medium uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Univers HEALTHY PAGE
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight">Au-delà du soin, trois rubriques pour mieux vivre</h2>
            <p className="mt-3 text-slate-600">Chaque univers a sa propre destination dédiée — accessible depuis le menu.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <a href="/voyage-loisirs" className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-teal-300 hover:shadow-xl transition flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Plane className="w-6 h-6" />
              </div>
              <div className="mt-4 font-bold text-slate-900">Voyage & Loisirs</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
                Séjours bien-être, escapades santé et retraites accompagnées dans les plus belles destinations africaines.
                Bilan pré-départ, téléconsultation 7j/7 et hôtels partenaires sélectionnés.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 group-hover:text-teal-900">
                Découvrir le sous-site <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a href="/urgences-publiques" className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-red-300 hover:shadow-xl transition flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                <Siren className="w-6 h-6" />
              </div>
              <div className="mt-4 font-bold text-slate-900">Urgences</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
                Pompiers, Police, Ambulances&nbsp;: les bons numéros, les bons réflexes et les protocoles de secours,
                centralisés pour réagir vite et sauver des vies.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700 group-hover:text-red-900">
                Voir les numéros d'urgence <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a href="/jeux-bien-etre" className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-violet-300 hover:shadow-xl transition flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="mt-4 font-bold text-slate-900">Jeux</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
                Quiz, puzzles, défis multijoueurs et mini-jeux santé&nbsp;: la prévention devient un plaisir,
                pour tous les âges, avec badges et récompenses.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 group-hover:text-violet-900">
                Lancer une partie <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Questions fréquentes</h2>
          <p className="mt-3 text-slate-600">Tout ce qu'il faut savoir avant de commencer.</p>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50">
                <span className="font-medium pr-4">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <div className="px-4 sm:px-5 pb-5 text-sm text-slate-600 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600">Une autre question ?</p>
          <a href="mailto:hello@healthypage.africa" className="mt-2 inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm">
            <Mail className="w-4 h-4" /> hello@healthypage.africa
          </a>
        </div>
      </section>

      {/* HPPOO banner */}
      <section className="w-full px-0 sm:px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <ImageWithFallback src={imgHppooBanner} alt="HPPOO Santé & Bien-Être" className="w-full h-auto sm:rounded-3xl shadow-xl" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-12 sm:pb-24">
        <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 p-6 sm:p-12 lg:p-16 text-white shadow-2xl">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/15 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-amber-300/20 blur-3xl rounded-full" />
          <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <img src={logo} alt="Healthy Page" className="w-14 h-14 mb-5 drop-shadow-lg" />
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">Votre santé mérite mieux que d'attendre.</h2>
              <p className="mt-4 text-white/90 leading-relaxed">Rejoignez les 120 000+ utilisateurs qui ont fait le choix d'une santé simple, accessible et bienveillante. Gratuit pour commencer · sans carte bancaire.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={onStart} className="px-7 py-3.5 bg-white text-rose-700 hover:bg-rose-50 rounded-full font-semibold inline-flex items-center gap-2 shadow-lg">
                  Lancer l'application <ArrowRight className="w-4 h-4" />
                </button>
                <a href="mailto:contact@healthypage.africa" className="px-7 py-3.5 bg-white/15 backdrop-blur hover:bg-white/25 rounded-full font-semibold inline-flex items-center gap-2 border border-white/20">
                  Parler à un conseiller santé
                </a>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 30 secondes pour s'inscrire</span>
                <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 100% confidentiel</span>
              </div>
            </div>
            <div className="hidden lg:block relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback src={IMG.family} alt="Famille africaine heureuse" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <LandingFooter accent="rose" onStart={onStart} />
      </div>
    </div>
  );
}
