import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Heart, Droplet, Moon, Activity, Brain, Apple, Users, Sparkles,
  Calendar, Plus, Trash2, Shield, Flower2, MessageCircle, Phone, BookOpen,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Bell,
  Sun, Star, HeartHandshake, Lock, Headphones,
  Sprout, Flower, Baby, ScrollText, Leaf, GraduationCap, Briefcase,
  Sparkle, Smile, Wind, Bath, Scissors, Smile as ToothIcon, Dumbbell,
  Zap, Coffee, Music2, ShoppingBag, Award, FileText, Video, Send, Siren,
  MapPin, AlertCircle, BadgeCheck, Compass, Lightbulb, Target, Wallet, MessageSquare, Globe,
  ChefHat, Image as ImageIcon
} from "lucide-react";
import { CONTACTS } from "../components/contacts";

type Mode = "fille" | "femme";
type Phase = "puberté" | "fertilité" | "grossesse" | "post-partum" | "ménopause" | "équilibre";
type Flow = "léger" | "moyen" | "abondant";
type Section = "suivi" | "puberte" | "hygiene" | "conseils" | "ecoute" | "soutien" | "education" | "business" | "securite" | "communaute" | "lifestyle";

interface CycleEntry { id: string; date: string; flow: Flow; mood: 1 | 2 | 3 | 4 | 5; symptoms: string[]; note?: string }
interface JournalEntry { id: string; date: string; text: string; mood: 1 | 2 | 3 | 4 | 5 }
interface Stored {
  mode: Mode; phase: Phase; cycles: CycleEntry[]; journal: JournalEntry[]; goals: string;
  cycleLength: number; periodLength: number; hygieneChecks: Record<string, boolean>; remindersOn: boolean;
}

const PHASES: { id: Phase; Icon: any; title: string; tip: string; tint: string; iconColor: string }[] = [
  { id: "puberté", Icon: Sprout, title: "Puberté", tip: "Fer, calcium, hygiène, estime de soi.", tint: "from-pink-50 to-rose-50", iconColor: "text-pink-600" },
  { id: "fertilité", Icon: Flower, title: "Fertilité", tip: "Folates, oméga-3, suivi cycles.", tint: "from-rose-50 to-fuchsia-50", iconColor: "text-rose-600" },
  { id: "grossesse", Icon: Baby, title: "Grossesse", tip: "Suivi prénatal, alimentation enrichie.", tint: "from-fuchsia-50 to-purple-50", iconColor: "text-fuchsia-600" },
  { id: "post-partum", Icon: HeartHandshake, title: "Post-partum", tip: "Récupération, allaitement, soutien.", tint: "from-purple-50 to-violet-50", iconColor: "text-violet-600" },
  { id: "ménopause", Icon: Leaf, title: "Ménopause", tip: "Équilibre hormonal, os, sommeil.", tint: "from-amber-50 to-rose-50", iconColor: "text-amber-600" },
  { id: "équilibre", Icon: Sparkle, title: "Équilibre", tip: "Cycles, sommeil, stress, alimentation.", tint: "from-rose-50 to-pink-50", iconColor: "text-rose-500" },
];

const SYMPTOMS = ["Crampes", "Fatigue", "Migraine", "Acné", "Ballonnements", "Sensibilité", "Anxiété", "Insomnie", "Fringales"];

const HYGIENE_CHECKS = [
  { id: "douche", text: "Douche quotidienne à l'eau tiède" },
  { id: "intime", text: "Toilette intime avec savon doux" },
  { id: "serviette", text: "Changer protection toutes les 4-6h" },
  { id: "mains", text: "Se laver les mains avant/après changement" },
  { id: "linge", text: "Sous-vêtements en coton, changés chaque jour" },
  { id: "sommeil", text: "7-9h de sommeil par nuit" },
];

const PUBERTE_FAQ = [
  { q: "Pourquoi mon corps change ?", a: "Les hormones (œstrogènes) déclenchent la croissance, le développement de la poitrine, l'apparition des poils et des règles. C'est naturel, chacune le vit à son rythme entre 8 et 16 ans." },
  { q: "À quel âge viennent les premières règles ?", a: "En moyenne entre 11 et 14 ans, mais cela peut être plus tôt ou plus tard. Si rien à 16 ans, parle à un médecin." },
  { q: "Combien de temps durent les règles ?", a: "Entre 3 et 7 jours en moyenne. Le cycle entier dure 21 à 35 jours. Il peut être irrégulier les 2 premières années." },
  { q: "Quelle protection choisir ?", a: "Serviettes (à changer toutes les 4-6h), tampons (4-8h, jamais plus de 8h), culottes menstruelles (lavables, écologiques), coupe menstruelle (à partir de 15-16 ans)." },
  { q: "Est-ce normal d'avoir mal au ventre ?", a: "Les douleurs légères sont fréquentes. Une bouillotte, du repos et du paracétamol soulagent. Si la douleur t'empêche d'aller à l'école, consulte." },
  { q: "Avec qui en parler ?", a: "Maman, grande sœur, tante, infirmière scolaire, médecin. Tu peux aussi écrire dans ton journal. Tu n'es jamais seule." },
];

const CONSEILS_PHASE: Record<Phase, { titre: string; items: string[] }[]> = {
  puberté: [
    { titre: "Alimentation", items: ["Petit-déjeuner riche en fer (pain complet, œuf)", "Calcium quotidien (lait, sésame, feuilles vertes)", "Hydratation : 1,5 à 2 L d'eau"] },
    { titre: "Activité", items: ["Sport 3x/semaine (marche, danse, vélo)", "Étirements pendant les règles", "Limiter sédentarité"] },
    { titre: "Bien-être", items: ["Parler de ses émotions", "Limiter écrans le soir", "Sommeil régulier"] },
  ],
  fertilité: [
    { titre: "Préconception", items: ["Acide folique 400µg/jour", "Bilan préconceptionnel", "Arrêter tabac/alcool"] },
    { titre: "Cycle", items: ["Fenêtre fertile J11-J16", "Température basale", "Glaire cervicale claire = ovulation"] },
    { titre: "Nutrition", items: ["Oméga-3 (poisson, lin)", "Antioxydants (fruits colorés)", "Limiter sucres rapides"] },
  ],
  grossesse: [
    { titre: "Suivi", items: ["7 consultations prénatales", "3 échographies (12, 22, 32 SA)", "Bilans sanguins réguliers"] },
    { titre: "Alimentation", items: ["Éviter alcool, viande crue, fromages au lait cru", "+350 kcal/j en 2e/3e trimestre", "Fer + folates + iode"] },
    { titre: "À surveiller", items: ["Saignements → consulter", "Maux de tête + œdèmes → urgence", "Mouvements bébé après 5 mois"] },
  ],
  "post-partum": [
    { titre: "Récupération", items: ["Visite postnatale 6-8 semaines", "Rééducation périnée", "Reprise activité progressive"] },
    { titre: "Allaitement", items: ["À la demande, jour et nuit", "+500 ml d'eau/jour", "Position confortable"] },
    { titre: "Moral", items: ["Baby blues (10 j) vs dépression", "Ne pas s'isoler", "Demander de l'aide"] },
  ],
  ménopause: [
    { titre: "Symptômes", items: ["Bouffées : vêtements légers, ventilation", "Sécheresse : hydratation, lubrifiants", "Sommeil : éviter écrans, tisanes"] },
    { titre: "Os & cœur", items: ["Calcium 1200 mg + vitamine D", "Marche, danse", "Bilan cardio annuel"] },
    { titre: "Suivi", items: ["Mammographie tous les 2 ans", "Frottis selon protocole", "Densitométrie si risque"] },
  ],
  équilibre: [
    { titre: "Cycle", items: ["Tenir un journal", "Repérer phases folliculaire/lutéale", "Adapter activité à l'énergie"] },
    { titre: "Hormones", items: ["Sommeil régulier", "Respiration, yoga", "Magnésium si crampes"] },
    { titre: "Prévention", items: ["Frottis tous les 3 ans", "Auto-palpation seins mensuelle", "Bilan annuel"] },
  ],
};

const ACCOMPAGNEMENT = [
  { Icon: Phone, title: "Ligne d'écoute confidentielle", desc: "24h/24, gratuit", action: "Appeler", tel: "+22995959595", bg: "bg-rose-100", color: "text-rose-700" },
  { Icon: MessageCircle, title: "Chat anonyme avec une marraine", desc: "Femmes formées, à l'écoute", action: "Discuter", bg: "bg-violet-100", color: "text-violet-700" },
  { Icon: Headphones, title: "Suivi psychologique", desc: "Téléconsultation avec psy", action: "RDV", bg: "bg-pink-100", color: "text-pink-700" },
  { Icon: HeartHandshake, title: "Groupe de sororité local", desc: "Rencontres mensuelles", action: "Rejoindre", bg: "bg-fuchsia-100", color: "text-fuchsia-700" },
];

const ECOUTE_THEMES = [
  { Icon: Heart, label: "Émotions", bg: "bg-rose-50", color: "text-rose-700", text: "text-rose-900" },
  { Icon: Brain, label: "Stress", bg: "bg-violet-50", color: "text-violet-700", text: "text-violet-900" },
  { Icon: Users, label: "Relations", bg: "bg-fuchsia-50", color: "text-fuchsia-700", text: "text-fuchsia-900" },
  { Icon: Shield, label: "Sécurité", bg: "bg-red-50", color: "text-red-700", text: "text-red-900" },
];

const STORAGE_KEY = "healthy-page:carnet-femmes";
const DEFAULT_DATA: Stored = { mode: "femme", phase: "équilibre", cycles: [], journal: [], goals: "", cycleLength: 28, periodLength: 5, hygieneChecks: {}, remindersOn: false };

const COURSES = [
  { id: "confiance", title: "Confiance en soi & affirmation", modules: 5, duration: "30 min" },
  { id: "digital", title: "Métiers du digital", modules: 8, duration: "2h" },
  { id: "orientation", title: "Préparer son orientation", modules: 4, duration: "45 min" },
  { id: "competences", title: "Compétences essentielles", modules: 6, duration: "1h" },
];

const BOURSES = [
  { name: "Bourse Mastercard Foundation", country: "Afrique", amount: "Études complètes", url: "https://mastercardfdn.org/" },
  { name: "OWSD-Elsevier", country: "International", amount: "Sciences", url: "https://owsd.net/" },
  { name: "Bourse AFD Femmes", country: "Francophonie", amount: "5 000 €/an", url: "#" },
  { name: "Tony Elumelu Foundation", country: "Afrique", amount: "5 000 $", url: "https://tefconnect.com/" },
];

const BUSINESS_IDEAS = [
  { t: "Pâtisserie locale à domicile", b: "Faible · 50 000 FCFA", icon: "ChefHat" },
  { t: "Couture & retouches", b: "Moyen · 150 000 FCFA", icon: "Scissors" },
  { t: "Vente de cosmétiques naturels", b: "Faible · 75 000 FCFA", icon: "Flower" },
  { t: "Coiffure & tresses à domicile", b: "Faible · 30 000 FCFA", icon: "Sparkles" },
  { t: "Élevage de poules pondeuses", b: "Moyen · 200 000 FCFA", icon: "Activity" },
  { t: "Boutique en ligne (mode)", b: "Faible · 100 000 FCFA", icon: "ShoppingBag" },
  { t: "Garde d'enfants à domicile", b: "Très faible · 0", icon: "Baby" },
  { t: "Cours de soutien scolaire", b: "Très faible · 0", icon: "GraduationCap" },
];

const MARKETPLACE = [
  { name: "Beurre de karité brut 250g", price: "2 500 FCFA", seller: "Aïssata Coop." },
  { name: "Culotte menstruelle coton", price: "8 000 FCFA", seller: "Femina Sénégal" },
  { name: "Huile de coco bio 500ml", price: "4 500 FCFA", seller: "BioFemme" },
  { name: "Pagne wax 6 yards", price: "15 000 FCFA", seller: "Sira Tex" },
  { name: "Savon noir africain", price: "1 500 FCFA", seller: "Naturelle BJ" },
  { name: "Tisane équilibre hormonal", price: "3 000 FCFA", seller: "Herbes & Soin" },
];

const ARTICLES: Record<string, string> = {
  "5 routines matinales pour bien démarrer": "1) Boire un grand verre d'eau au réveil.\n2) 5 minutes d'étirements doux.\n3) Petit-déjeuner riche en protéines & fibres.\n4) Visualiser sa journée (3 priorités).\n5) S'exposer à la lumière naturelle 10 min.",
  "Recettes anti-fatigue pendant les règles": "• Smoothie banane-épinards-cacao : fer + magnésium\n• Soupe lentilles-curcuma-gingembre : anti-inflammatoire\n• Bouillon poulet-légumes : minéraux\n• Tisane camomille-mélisse : crampes\n• Chocolat noir 70% : magnésium & humeur",
  "Comment dire non sans culpabiliser": "1) Reconnais ton droit à dire non.\n2) Sois claire et brève : « Je ne peux pas. »\n3) Pas besoin de te justifier longuement.\n4) Propose une alternative si tu le souhaites.\n5) Respire, la culpabilité passe.",
  "Affirmations puissantes pour la confiance": "• Je mérite le respect et l'amour.\n• Mon corps est mon allié.\n• Je suis capable d'apprendre tout ce que je décide.\n• Mes émotions sont valides.\n• Je trace ma propre voie.",
};

const VBG_GUIDES: Record<string, string> = {
  "Reconnaître les violences": "Les violences ne sont pas que physiques. Elles peuvent être :\n• Verbales (insultes, humiliations)\n• Psychologiques (manipulation, isolement)\n• Économiques (contrôle de l'argent)\n• Sexuelles (toute relation non consentie)\n• Numériques (harcèlement en ligne, partage non consenti)\n\nSi tu ne te sens pas en sécurité ou respectée, tu n'es PAS responsable. Parle à une personne de confiance.",
  "Que faire après une agression ?": "1) Mets-toi en sécurité immédiatement.\n2) Appelle Police 117 ou un proche.\n3) Ne te lave pas (preuves médicales).\n4) Va à l'hôpital, examen + traitement préventif.\n5) Dépose plainte (commissariat ou gendarmerie).\n6) Demande un soutien psychologique.\n\nTu n'es jamais coupable. L'agresseur l'est.",
  "Vos droits & démarches": "• Droit à la protection (ordonnance d'éloignement)\n• Droit au certificat médical (gratuit)\n• Droit à un avocat commis d'office\n• Droit à l'aide juridictionnelle\n• Droit à l'hébergement d'urgence\n\nAssociations : WILDAF, AFJ Bénin, Réseau Sœurs unies. Numéro vert national : 8000 11 12.",
  "Soutien psychologique post-traumatique": "Le trauma laisse des traces. C'est normal. Symptômes courants :\n• Flashbacks, cauchemars\n• Évitement, anxiété, hypervigilance\n• Honte, colère, tristesse\n\nLa thérapie EMDR ou TCC aide à se reconstruire. Tu mérites un accompagnement professionnel. Ce n'est pas de la faiblesse, c'est du courage.",
};

const COMMUNITY_GROUPS = [
  { id: "ado", title: "Adolescence & puberté", members: 1240, posts: ["Première fois aux règles, conseils ?", "Comment parler à ma maman ?", "Mes émotions sont en montagnes russes…"] },
  { id: "etudes", title: "Études & orientation", members: 896, posts: ["Comment choisir entre médecine et droit ?", "Bourse Mastercard reçue !", "Conseils pour le BAC"] },
  { id: "sante", title: "Santé & cycles", members: 2105, posts: ["Cycle irrégulier : qui consulter ?", "Mes astuces contre les crampes", "Témoignage post-partum"] },
  { id: "business", title: "Business & carrière", members: 654, posts: ["J'ai lancé ma marque de karité 🌱", "Lever des fonds pour son projet", "Concilier maternité & travail"] },
  { id: "lifestyle", title: "Lifestyle & beauté", members: 1870, posts: ["Routine cheveux crépus", "Recettes batch cooking", "Mode wax inspirations"] },
];

function load(): Stored { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) }; } catch {} return DEFAULT_DATA; }
function save(s: Stored) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }
function daysBetween(a: string, b: string) { return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000); }
function addDays(d: string, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }
function fmtDate(s: string) { try { return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); } catch { return s; } }

export default function CarnetFemmesScreen({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Stored>(() => load());
  const [section, setSection] = useState<Section>("suivi");
  const [showAdd, setShowAdd] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<CycleEntry>({ id: "", date: new Date().toISOString().slice(0, 10), flow: "moyen", mood: 3, symptoms: [], note: "" });
  const [newJournal, setNewJournal] = useState<JournalEntry>({ id: "", date: new Date().toISOString().slice(0, 10), text: "", mood: 3 });
  const [detail, setDetail] = useState<{ title: string; node: any } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [groupView, setGroupView] = useState<typeof COMMUNITY_GROUPS[0] | null>(null);
  const [newPost, setNewPost] = useState("");
  const [extraPosts, setExtraPosts] = useState<Record<string, string[]>>(() => { try { return JSON.parse(localStorage.getItem("healthy-page:cf-posts") || "{}"); } catch { return {}; } });
  const [coursesProgress, setCoursesProgress] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem("healthy-page:cf-courses") || "{}"); } catch { return {}; } });
  const [defi, setDefi] = useState<{ start: string | null; days: boolean[] }>(() => { try { return JSON.parse(localStorage.getItem("healthy-page:cf-defi") || '{"start":null,"days":[]}'); } catch { return { start: null, days: [] }; } });
  const [joined, setJoined] = useState<boolean>(() => localStorage.getItem("healthy-page:cf-joined") === "1");
  const [coachReq, setCoachReq] = useState<{ name: string; topic: string; date: string } | null>(null);
  const [orientationStep, setOrientationStep] = useState(0);
  const [orientationAnswers, setOrientationAnswers] = useState<string[]>([]);

  useEffect(() => { try { localStorage.setItem("healthy-page:cf-posts", JSON.stringify(extraPosts)); } catch {} }, [extraPosts]);
  useEffect(() => { try { localStorage.setItem("healthy-page:cf-courses", JSON.stringify(coursesProgress)); } catch {} }, [coursesProgress]);
  useEffect(() => { try { localStorage.setItem("healthy-page:cf-defi", JSON.stringify(defi)); } catch {} }, [defi]);
  useEffect(() => { try { localStorage.setItem("healthy-page:cf-joined", joined ? "1" : "0"); } catch {} }, [joined]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const closeDetail = () => setDetail(null);

  useEffect(() => { save(data); }, [data]);

  const sortedCycles = useMemo(() => [...data.cycles].sort((a, b) => b.date.localeCompare(a.date)), [data.cycles]);
  const lastCycle = sortedCycles[0];
  const avgMood = useMemo(() => data.cycles.length ? data.cycles.reduce((s, c) => s + c.mood, 0) / data.cycles.length : 0, [data.cycles]);

  const cycleStats = useMemo(() => {
    const starts = sortedCycles.filter((c, i, arr) => i === arr.length - 1 || daysBetween(arr[i + 1].date, c.date) > 10).map(c => c.date).reverse();
    if (starts.length < 2) return null;
    const ls: number[] = [];
    for (let i = 1; i < starts.length; i++) ls.push(daysBetween(starts[i - 1], starts[i]));
    return { avg: Math.round(ls.reduce((a, b) => a + b, 0) / ls.length), last: starts[starts.length - 1] };
  }, [sortedCycles]);

  const prediction = useMemo(() => {
    const ref = cycleStats?.last ?? lastCycle?.date; if (!ref) return null;
    const cl = cycleStats?.avg ?? data.cycleLength;
    const next = addDays(ref, cl), ovu = addDays(ref, cl - 14);
    const today = new Date().toISOString().slice(0, 10);
    return { next, ovu, fertileStart: addDays(ovu, -3), fertileEnd: addDays(ovu, 1), daysToNext: daysBetween(today, next), cycleLength: cl };
  }, [cycleStats, lastCycle, data.cycleLength]);

  const hygieneScore = useMemo(() => {
    const done = HYGIENE_CHECKS.filter(c => data.hygieneChecks[c.id]).length;
    return { done, total: HYGIENE_CHECKS.length, pct: Math.round((done / HYGIENE_CHECKS.length) * 100) };
  }, [data.hygieneChecks]);

  const conseils = CONSEILS_PHASE[data.phase];
  const isFille = data.mode === "fille";

  const addEntry = () => {
    setData(d => ({ ...d, cycles: [{ ...newEntry, id: Date.now().toString() }, ...d.cycles] }));
    setShowAdd(false);
    setNewEntry({ id: "", date: new Date().toISOString().slice(0, 10), flow: "moyen", mood: 3, symptoms: [], note: "" });
  };
  const deleteEntry = (id: string) => setData(d => ({ ...d, cycles: d.cycles.filter(c => c.id !== id) }));
  const toggleSymptom = (s: string) => setNewEntry(n => ({ ...n, symptoms: n.symptoms.includes(s) ? n.symptoms.filter(x => x !== s) : [...n.symptoms, s] }));
  const addJournal = () => {
    if (!newJournal.text.trim()) return;
    setData(d => ({ ...d, journal: [{ ...newJournal, id: Date.now().toString() }, ...d.journal] }));
    setShowJournal(false);
    setNewJournal({ id: "", date: new Date().toISOString().slice(0, 10), text: "", mood: 3 });
  };
  const deleteJournal = (id: string) => setData(d => ({ ...d, journal: d.journal.filter(j => j.id !== id) }));
  const toggleHygiene = (id: string) => setData(d => ({ ...d, hygieneChecks: { ...d.hygieneChecks, [id]: !d.hygieneChecks[id] } }));
  const toggleReminders = async () => {
    if (!data.remindersOn && typeof Notification !== "undefined") {
      const r = await Notification.requestPermission();
      if (r === "granted") new Notification("Healthy Page", { body: "Rappels de cycle activés ✓" });
    }
    setData(d => ({ ...d, remindersOn: !d.remindersOn }));
  };

  const sections: { id: Section; label: string; Icon: any; show: boolean }[] = [
    { id: "suivi", label: "Suivi", Icon: Droplet, show: true },
    { id: "puberte", label: "Puberté", Icon: Flower2, show: isFille },
    { id: "hygiene", label: "Hygiène", Icon: Shield, show: true },
    { id: "conseils", label: "Conseils", Icon: Apple, show: true },
    { id: "ecoute", label: "Écoute", Icon: Heart, show: true },
    { id: "education", label: "Éducation", Icon: GraduationCap, show: true },
    { id: "business", label: "Business", Icon: Briefcase, show: !isFille },
    { id: "lifestyle", label: "Lifestyle", Icon: Sparkles, show: true },
    { id: "communaute", label: "Communauté", Icon: Users, show: true },
    { id: "securite", label: "Sécurité", Icon: Siren, show: true },
    { id: "soutien", label: "Soutien", Icon: HeartHandshake, show: true },
  ].filter(s => s.show);

  return (
    <>
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-4 top-4 text-white/20"><Flower2 className="w-32 h-32" /></div>
          <div className="relative p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center" aria-label="Retour">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Femmes & Jeunes filles</span>
              <button onClick={toggleReminders} className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center ${data.remindersOn ? "bg-white text-rose-700" : "bg-white/25"}`}>
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl leading-tight">Écouter votre corps, à chaque phase</h1>
            <p className="text-sm text-white/90 mt-2">Cycles · hygiène · conseils · écoute · accompagnement.</p>
            <div className="mt-4 inline-flex bg-white/20 backdrop-blur rounded-full p-1">
              <button onClick={() => setData(d => ({ ...d, mode: "fille", phase: "puberté" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition inline-flex items-center gap-1.5 ${isFille ? "bg-white text-rose-700 shadow" : "text-white"}`}>
                <Flower className="w-3.5 h-3.5" /> Jeune fille
              </button>
              <button onClick={() => setData(d => ({ ...d, mode: "femme" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition inline-flex items-center gap-1.5 ${!isFille ? "bg-white text-rose-700 shadow" : "text-white"}`}>
                <Sparkle className="w-3.5 h-3.5" /> Femme
              </button>
            </div>
            {prediction && !isFille && (
              <div className="mt-3 inline-flex items-center gap-1.5 ml-2 bg-white/95 text-rose-800 text-xs px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {prediction.daysToNext > 0 ? `Règles dans ${prediction.daysToNext} j` : prediction.daysToNext === 0 ? "Règles aujourd'hui" : `Retard de ${-prediction.daysToNext} j`}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {sections.map(s => {
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap transition ${active ? "bg-rose-600 text-white shadow" : "bg-white border border-rose-200 text-rose-800"}`}>
                <s.Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>

        {section === "suivi" && (
          <>
            {!isFille && (
              <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
                <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Ma phase de vie</h2>
                <div className="grid grid-cols-2 gap-2">
                  {PHASES.map(p => (
                    <button key={p.id} onClick={() => setData(d => ({ ...d, phase: p.id }))}
                      className={`text-left p-3 rounded-xl border transition bg-gradient-to-br ${p.tint} ${data.phase === p.id ? "border-rose-400 ring-2 ring-rose-200 shadow-sm" : "border-rose-100 hover:border-rose-300"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${p.iconColor}`}><p.Icon className="w-4 h-4" /></span>
                        <span className="text-rose-900 text-sm font-medium">{p.title}</span>
                      </div>
                      <p className="text-xs text-rose-900/70">{p.tip}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {prediction && (
              <section className="relative overflow-hidden rounded-2xl shadow-sm border border-rose-200 p-4 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-rose-200/50 blur-2xl" />
                <div className="relative">
                  <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Prévisions du cycle</h2>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-xl p-3"><div className="text-rose-700">Prochaines règles</div><div className="text-rose-950 mt-1 font-medium">{fmtDate(prediction.next)}</div></div>
                    <div className="bg-white rounded-xl p-3"><div className="text-rose-700">Ovulation</div><div className="text-rose-950 mt-1 font-medium">{fmtDate(prediction.ovu)}</div></div>
                    <div className="bg-white rounded-xl p-3 col-span-2"><div className="text-rose-700">Fenêtre fertile</div><div className="text-rose-950 mt-1 font-medium">{fmtDate(prediction.fertileStart)} → {fmtDate(prediction.fertileEnd)}</div></div>
                  </div>
                  <p className="text-[11px] text-rose-700/70 mt-2 italic">Cycle de {prediction.cycleLength} j, estimation indicative.</p>
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-rose-900 flex items-center gap-2"><Droplet className="w-4 h-4" /> Cycle & ressentis</h2>
                <button onClick={() => setShowAdd(true)} className="text-xs px-3 py-1.5 bg-rose-600 text-white rounded-full flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
              </div>
              {data.cycles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <Droplet className="w-9 h-9 text-rose-400" />
                  </div>
                  <p className="text-sm text-gray-600">Aucune entrée pour l'instant.</p>
                  <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier suivi pour activer les prévisions.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-rose-50 rounded-lg p-2"><div className="text-xs text-rose-700">Entrées</div><div className="text-rose-900">{data.cycles.length}</div></div>
                    <div className="bg-pink-50 rounded-lg p-2"><div className="text-xs text-pink-700">Humeur ⌀</div><div className="text-pink-900">{avgMood.toFixed(1)}/5</div></div>
                    <div className="bg-fuchsia-50 rounded-lg p-2"><div className="text-xs text-fuchsia-700">Cycle ⌀</div><div className="text-fuchsia-900">{cycleStats?.avg ?? data.cycleLength}j</div></div>
                  </div>
                  <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {sortedCycles.slice(0, 12).map(c => (
                      <li key={c.id} className="flex items-start gap-2 p-2 bg-rose-50/60 rounded-lg">
                        <Droplet className={`w-4 h-4 mt-0.5 ${c.flow === "abondant" ? "text-rose-600" : c.flow === "moyen" ? "text-rose-400" : "text-rose-300"}`} />
                        <div className="flex-1 text-sm">
                          <div className="text-rose-900 flex items-center gap-1.5 flex-wrap">{fmtDate(c.date)}, flux {c.flow} · <span className="inline-flex items-center gap-1 text-xs text-rose-700"><Smile className="w-3.5 h-3.5" />{c.mood}/5</span></div>
                          {c.symptoms.length > 0 && <div className="text-xs text-gray-600 mt-0.5">{c.symptoms.join(" · ")}</div>}
                          {c.note && <div className="text-xs text-rose-700/80 italic mt-0.5">« {c.note} »</div>}
                        </div>
                        <button onClick={() => deleteEntry(c.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Moon className="w-4 h-4" /> Paramètres</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <label><span className="text-gray-700 text-xs">Durée cycle (j)</span>
                  <input type="number" min={20} max={45} value={data.cycleLength} onChange={e => setData(d => ({ ...d, cycleLength: +e.target.value || 28 }))} className="mt-1 w-full p-2 border border-rose-100 rounded-lg" /></label>
                <label><span className="text-gray-700 text-xs">Durée règles (j)</span>
                  <input type="number" min={2} max={10} value={data.periodLength} onChange={e => setData(d => ({ ...d, periodLength: +e.target.value || 5 }))} className="mt-1 w-full p-2 border border-rose-100 rounded-lg" /></label>
              </div>
            </section>
          </>
        )}

        {section === "puberte" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-pink-500 to-rose-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute right-3 bottom-3 text-white/20"><Flower2 className="w-20 h-20" /></div>
              <div className="relative">
                <Flower2 className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Mon corps change, c'est normal</h2>
                <p className="text-sm text-white/90 mt-1">La puberté est une étape unique. Voici des réponses claires.</p>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Questions fréquentes</h2>
              <div className="space-y-2">
                {PUBERTE_FAQ.map((f, i) => (
                  <div key={i} className="border border-rose-100 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left hover:bg-rose-50">
                      <span className="text-sm text-rose-900 pr-2">{f.q}</span>
                      <ChevronDown className={`w-4 h-4 text-rose-600 transition flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <div className="px-3 pb-3 text-sm text-gray-700 bg-rose-50/40">{f.a}</div>}
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { Icon: Sprout, color: "text-emerald-600", tint: "from-green-50 to-emerald-50", title: "Croissance", desc: "Taille, poids, silhouette" },
                { Icon: Heart, color: "text-rose-600", tint: "from-rose-50 to-pink-50", title: "Hormones", desc: "Émotions plus intenses" },
                { Icon: Sparkle, color: "text-amber-600", tint: "from-amber-50 to-yellow-50", title: "Peau", desc: "Plus grasse, acné possible" },
                { Icon: Flower, color: "text-fuchsia-600", tint: "from-fuchsia-50 to-rose-50", title: "Premières règles", desc: "Entre 11 et 14 ans" },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl border border-rose-100 p-4 bg-gradient-to-br ${s.tint}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${s.color}`}><s.Icon className="w-5 h-5" /></div>
                  <div className="text-rose-900 text-sm font-medium">{s.title}</div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="text-amber-900 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Quand consulter ?</h3>
              <ul className="text-sm text-amber-900 space-y-1">
                <li>• Aucun signe de puberté à 14 ans</li>
                <li>• Aucune règle à 16 ans</li>
                <li>• Douleurs très fortes pendant les règles</li>
                <li>• Saignements abondants (&gt; 7 jours)</li>
                <li>• Cycle très irrégulier après 2 ans</li>
              </ul>
            </section>
          </>
        )}

        {section === "hygiene" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-cyan-500 to-rose-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="flex items-center gap-2"><Shield className="w-4 h-4" /> Routine quotidienne</h2>
                  <span className="text-xs bg-white/95 text-rose-700 px-2 py-1 rounded-full">{hygieneScore.done}/{hygieneScore.total}</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all" style={{ width: `${hygieneScore.pct}%` }} />
                </div>
              </div>
            </section>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <ul className="space-y-2">
                {HYGIENE_CHECKS.map(c => (
                  <li key={c.id}>
                    <button onClick={() => toggleHygiene(c.id)} className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-sm transition ${data.hygieneChecks[c.id] ? "bg-rose-100 text-rose-900" : "bg-rose-50/50 text-gray-700 hover:bg-rose-50"}`}>
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${data.hygieneChecks[c.id] ? "text-rose-600" : "text-gray-300"}`} />
                      {c.text}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { Icon: Bath, color: "text-cyan-600", tint: "from-cyan-50 to-blue-50", title: "Douche", desc: "Eau tiède, savon doux" },
                { Icon: Flower, color: "text-rose-600", tint: "from-rose-50 to-pink-50", title: "Hygiène intime", desc: "1x/jour, pH neutre" },
                { Icon: Scissors, color: "text-fuchsia-600", tint: "from-purple-50 to-fuchsia-50", title: "Cheveux", desc: "2-3 lavages/semaine" },
                { Icon: Smile, color: "text-teal-600", tint: "from-teal-50 to-cyan-50", title: "Dents", desc: "2x/jour, 2 minutes" },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl border border-rose-100 p-4 bg-gradient-to-br ${s.tint}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${s.color}`}><s.Icon className="w-5 h-5" /></div>
                  <div className="text-rose-900 text-sm font-medium">{s.title}</div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Droplet className="w-4 h-4" /> Hygiène intime</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Toilette intime 1x/jour à l'eau tiède (savon doux pH neutre).</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Sécher en tamponnant, jamais frotter.</li>
                <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> Pas de douche vaginale, parfums ou lingettes parfumées.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Sous-vêtements coton, changés chaque jour.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> S'essuyer d'avant en arrière.</li>
                <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> Pertes anormales (odeur, démangeaisons) → consulter.</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Sun className="w-4 h-4" /> Pendant les règles</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><Calendar className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Changer protection toutes les 4-6h (max 8h tampon).</li>
                <li className="flex gap-2"><Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Mains lavées avant et après chaque changement.</li>
                <li className="flex gap-2"><Bath className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Doucher 1 à 2 fois par jour.</li>
                <li className="flex gap-2"><Droplet className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Bien s'hydrater contre les ballonnements.</li>
                <li className="flex gap-2"><Sun className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> Bouillotte tiède pour les crampes.</li>
              </ul>
            </section>
          </>
        )}

        {section === "conseils" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-rose-500 to-fuchsia-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <Apple className="w-5 h-5 mb-1" />
                <h2 className="text-lg">Conseils pour la phase</h2>
                <p className="text-xs text-white/85 mt-1">{PHASES.find(p => p.id === data.phase)?.title}</p>
              </div>
            </section>
            <div className="space-y-3">
              {conseils.map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-rose-100">
                  <div className="text-rose-900 text-sm font-medium mb-2">{c.titre}</div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {c.items.map((it, j) => (
                      <li key={j} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Mouvement & énergie</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { Icon: Dumbbell, color: "text-rose-600", tint: "from-rose-50 to-pink-50", phase: "Folliculaire", tip: "Énergie ↑, sport, danse" },
                  { Icon: Zap, color: "text-pink-600", tint: "from-pink-50 to-fuchsia-50", phase: "Ovulation", tip: "Pic d'énergie, social" },
                  { Icon: Wind, color: "text-fuchsia-600", tint: "from-fuchsia-50 to-purple-50", phase: "Lutéale", tip: "Énergie ↓, yoga, marche" },
                  { Icon: Moon, color: "text-amber-600", tint: "from-rose-50 to-amber-50", phase: "Règles", tip: "Repos, méditation" },
                ].map((p, i) => (
                  <div key={i} className={`rounded-xl p-3 bg-gradient-to-br ${p.tint}`}>
                    <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-1.5 ${p.color}`}><p.Icon className="w-4 h-4" /></div>
                    <div className="text-rose-900 text-xs font-medium">{p.phase}</div>
                    <p className="text-[11px] text-gray-700">{p.tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h2 className="text-rose-900 mb-2 flex items-center gap-2"><Moon className="w-4 h-4" /> Mes objectifs</h2>
              <textarea value={data.goals} onChange={e => setData(d => ({ ...d, goals: e.target.value }))}
                placeholder="Vos intentions, objectifs personnels…"
                className="w-full min-h-[100px] p-3 border border-rose-100 rounded-xl text-sm bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </section>
          </>
        )}

        {section === "ecoute" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-violet-600 to-rose-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /><span className="text-xs">100% privé · stocké sur votre appareil</span></div>
                <h2 className="text-lg flex items-center gap-2"><Heart className="w-4 h-4" /> Journal d'écoute</h2>
                <p className="text-xs text-white/90 mt-1">Posez vos pensées, joies, doutes. Personne d'autre ne peut les lire.</p>
                <button onClick={() => setShowJournal(true)} className="mt-3 bg-white text-rose-700 text-sm px-4 py-2 rounded-full inline-flex items-center gap-1.5 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Nouvelle entrée
                </button>
              </div>
            </section>

            <div className="grid grid-cols-4 gap-2">
              {ECOUTE_THEMES.map((t, i) => (
                <button key={i} onClick={() => { setNewJournal(j => ({ ...j, text: `[${t.label}] ` })); setShowJournal(true); }}
                  className={`flex flex-col items-center gap-1 p-3 ${t.bg} hover:opacity-80 rounded-xl transition`}>
                  <t.Icon className={`w-4 h-4 ${t.color}`} />
                  <span className={`text-[10px] ${t.text}`}>{t.label}</span>
                </button>
              ))}
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 text-sm">Mes entrées récentes</h3>
              {data.journal.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune note. Commencez à écrire pour vous écouter.</p>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {data.journal.slice(0, 15).map(j => (
                    <li key={j.id} className="p-3 bg-rose-50/50 rounded-xl">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs text-rose-700 inline-flex items-center gap-1">{fmtDate(j.date)} · <Smile className="w-3.5 h-3.5" />{j.mood}/5</span>
                        <button onClick={() => deleteJournal(j.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{j.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {section === "education" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <GraduationCap className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Éducation & développement</h2>
                <p className="text-sm text-white/90 mt-1">Formations, orientation, bourses, mentorat.</p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { Icon: BookOpen, color: "text-indigo-600", tint: "from-indigo-50 to-violet-50", title: "Mini-cours", desc: "Vidéos, lectures, quiz", key: "cours" },
                { Icon: Compass, color: "text-violet-600", tint: "from-violet-50 to-fuchsia-50", title: "Orientation", desc: "Tests métiers & études", key: "orientation" },
                { Icon: Award, color: "text-fuchsia-600", tint: "from-fuchsia-50 to-rose-50", title: "Bourses", desc: "Opportunités de financement", key: "bourses" },
                { Icon: Users, color: "text-rose-600", tint: "from-rose-50 to-pink-50", title: "Mentorat", desc: "Marraines & coaching", key: "mentor" },
              ].map((s, i) => (
                <button key={i} onClick={() => {
                  if (s.key === "cours") setDetail({ title: "Mini-cours disponibles", node: (
                    <ul className="space-y-2">{COURSES.map(c => (
                      <li key={c.id} className="p-3 bg-violet-50 rounded-xl flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                        <div className="flex-1"><div className="text-sm text-rose-900">{c.title}</div><div className="text-xs text-gray-500">{c.modules} modules · {c.duration}</div></div>
                        <button onClick={() => { setCoursesProgress(p => ({ ...p, [c.id]: (p[c.id] || 0) + 1 })); flash(`Module suivant débloqué : ${c.title}`); }} className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-full">Démarrer</button>
                      </li>
                    ))}</ul>
                  ) });
                  else if (s.key === "orientation") { setOrientationStep(1); setOrientationAnswers([]); setDetail({ title: "Test d'orientation", node: <div className="text-sm text-gray-700">Démarrage du test ci-dessous…</div> }); }
                  else if (s.key === "bourses") setDetail({ title: "Bourses & financements", node: (
                    <ul className="space-y-2">{BOURSES.map(b => (
                      <li key={b.name} className="p-3 bg-fuchsia-50 rounded-xl">
                        <div className="text-sm text-rose-900 font-medium">{b.name}</div>
                        <div className="text-xs text-gray-500">{b.country} · {b.amount}</div>
                        <a href={b.url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs px-3 py-1.5 bg-fuchsia-600 text-white rounded-full">Postuler</a>
                      </li>
                    ))}</ul>
                  ) });
                  else if (s.key === "mentor") setCoachReq({ name: "", topic: "Mentorat éducation", date: "" });
                }} className={`text-left rounded-2xl border border-rose-100 p-4 bg-gradient-to-br ${s.tint} hover:shadow-sm transition`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${s.color}`}><s.Icon className="w-5 h-5" /></div>
                  <div className="text-rose-900 text-sm font-medium">{s.title}</div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><Video className="w-4 h-4" /> Cours populaires</h3>
              <ul className="space-y-2">
                {[
                  { Icon: Lightbulb, t: "Confiance en soi & affirmation", d: "5 modules · 30 min" },
                  { Icon: Globe, t: "Métiers du digital", d: "8 modules · 2h" },
                  { Icon: Target, t: "Préparer son orientation", d: "Test + fiches métiers" },
                  { Icon: BadgeCheck, t: "Compétences essentielles", d: "Communication, leadership" },
                ].map((c, i) => (
                  <li key={i}>
                    <button onClick={() => {
                      const id = `pop-${i}`;
                      const prog = coursesProgress[id] || 0;
                      setDetail({ title: c.t, node: (
                        <div>
                          <p className="text-sm text-gray-700 mb-3">{c.d}</p>
                          <div className="bg-violet-50 rounded-xl p-3 mb-3">
                            <div className="text-xs text-violet-700 mb-1">Progression</div>
                            <div className="h-2 bg-white rounded-full overflow-hidden"><div className="h-full bg-violet-600" style={{ width: `${Math.min(prog * 25, 100)}%` }} /></div>
                            <div className="text-xs text-violet-900 mt-1">{Math.min(prog, 4)}/4 modules</div>
                          </div>
                          <button onClick={() => { setCoursesProgress(p => ({ ...p, [id]: (p[id] || 0) + 1 })); flash("Module marqué ✓"); closeDetail(); }} className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm">Marquer le prochain module</button>
                        </div>
                      ) });
                    }} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 text-left">
                      <div className="w-9 h-9 rounded-lg bg-white text-violet-600 flex items-center justify-center"><c.Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-rose-900">{c.t}</div>
                        <div className="text-xs text-gray-500">{c.d}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><Globe className="w-4 h-4" /> Partenaires & ressources</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Girl Effect", "UN Women", "Girls Not Brides", "She Leads Africa", "Tony Elumelu", "Women in Africa"].map(p => (
                  <div key={p} className="bg-violet-50/60 border border-violet-100 rounded-lg px-3 py-2 text-xs text-violet-900">{p}</div>
                ))}
              </div>
            </section>
          </>
        )}

        {section === "business" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <Briefcase className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Entrepreneuriat & autonomisation</h2>
                <p className="text-sm text-white/90 mt-1">Idées, business plans, marketplace, coaching.</p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { Icon: Lightbulb, color: "text-amber-600", tint: "from-amber-50 to-orange-50", title: "Idées business", desc: "Petits projets à lancer", key: "idees" },
                { Icon: FileText, color: "text-orange-600", tint: "from-orange-50 to-rose-50", title: "Business plans", desc: "Modèles prêts à l'emploi", key: "plans" },
                { Icon: ShoppingBag, color: "text-rose-600", tint: "from-rose-50 to-pink-50", title: "Marketplace", desc: "Vendre vos produits", key: "market" },
                { Icon: Users, color: "text-fuchsia-600", tint: "from-fuchsia-50 to-purple-50", title: "Coach business", desc: "Réservez une session", key: "coach" },
              ].map((s, i) => (
                <button key={i} onClick={() => {
                  if (s.key === "idees") setDetail({ title: "Idées business à lancer", node: (
                    <ul className="space-y-2">{BUSINESS_IDEAS.map((b, j) => (
                      <li key={j} className="p-3 bg-amber-50 rounded-xl flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1"><div className="text-sm text-rose-900">{b.t}</div><div className="text-xs text-gray-500">Investissement {b.b}</div></div>
                      </li>
                    ))}</ul>
                  ) });
                  else if (s.key === "plans") setDetail({ title: "Modèle de business plan", node: (
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>1. Résumé exécutif</strong>, votre projet en 5 lignes.</p>
                      <p><strong>2. Étude de marché</strong>, clientèle, concurrents, prix.</p>
                      <p><strong>3. Offre & valeur</strong>, produit/service, différenciation.</p>
                      <p><strong>4. Stratégie marketing</strong>, canaux, communication.</p>
                      <p><strong>5. Plan financier</strong>, investissement, charges, prévisions.</p>
                      <p><strong>6. Équipe & planning</strong>, qui, quand, comment.</p>
                      <button onClick={() => { const blob = new Blob([`Business Plan, Modèle\n\n1. Résumé exécutif\n2. Étude de marché\n3. Offre & valeur\n4. Stratégie marketing\n5. Plan financier\n6. Équipe & planning`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "business-plan.txt"; a.click(); flash("Modèle téléchargé ✓"); }} className="w-full mt-2 py-2.5 bg-orange-600 text-white rounded-xl text-sm">Télécharger le modèle</button>
                    </div>
                  ) });
                  else if (s.key === "market") setDetail({ title: "Marketplace femmes", node: (
                    <ul className="space-y-2">{MARKETPLACE.map((m, j) => (
                      <li key={j} className="p-3 bg-rose-50 rounded-xl flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-rose-600" />
                        <div className="flex-1"><div className="text-sm text-rose-900">{m.name}</div><div className="text-xs text-gray-500">{m.seller}</div></div>
                        <div className="text-sm text-rose-700 font-medium">{m.price}</div>
                      </li>
                    ))}</ul>
                  ) });
                  else if (s.key === "coach") setCoachReq({ name: "", topic: "Coach business", date: "" });
                }} className={`text-left rounded-2xl border border-rose-100 p-4 bg-gradient-to-br ${s.tint}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${s.color}`}><s.Icon className="w-5 h-5" /></div>
                  <div className="text-rose-900 text-sm font-medium">{s.title}</div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><Wallet className="w-4 h-4" /> Programmes d'aide</h3>
              <ul className="space-y-2">
                {[
                  { t: "Tony Elumelu Foundation", d: "Subvention 5 000$ + formation", url: "https://tefconnect.com/" },
                  { t: "She Means Business (Meta)", d: "Formation digital gratuite", url: "https://www.facebook.com/business/boost/she-means-business" },
                  { t: "WIA 54", d: "Accélérateur entrepreneuriat", url: "https://wia-initiative.com/" },
                ].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60">
                    <div className="w-9 h-9 rounded-lg bg-white text-amber-600 flex items-center justify-center"><Award className="w-4 h-4" /></div>
                    <div className="flex-1"><div className="text-sm text-rose-900">{p.t}</div><div className="text-xs text-gray-500">{p.d}</div></div>
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-full">Voir</a>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {section === "lifestyle" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <Sparkles className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Lifestyle & empowerment</h2>
                <p className="text-sm text-white/90 mt-1">Beauté, nutrition, fitness, confiance en soi.</p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { Icon: ChefHat, color: "text-rose-600", tint: "from-rose-50 to-pink-50", title: "Recettes", desc: "Cuisine saine & locale", body: "• Bouillie de mil enrichie\n• Salade d'avocat & papaye\n• Poisson braisé légumes\n• Smoothie baobab-banane\n• Tisane gingembre-citron" },
                { Icon: Sparkle, color: "text-pink-600", tint: "from-pink-50 to-fuchsia-50", title: "Beauté & soins", desc: "Routine peau & cheveux", body: "• Beurre de karité matin & soir\n• Masque miel-curcuma 1x/sem\n• Huile de coco pour cheveux\n• Argile verte pour purifier\n• Hydrater 2L d'eau/jour" },
                { Icon: Dumbbell, color: "text-fuchsia-600", tint: "from-fuchsia-50 to-purple-50", title: "Fitness féminin", desc: "Entraînements à domicile", body: "• 10 squats × 3 séries\n• 30s de gainage × 3\n• 15 fentes par jambe\n• 20 min de marche rapide\n• 5 min étirements" },
                { Icon: Star, color: "text-amber-600", tint: "from-amber-50 to-rose-50", title: "Confiance en soi", desc: "Astuces & affirmations", body: "• Je suis capable.\n• Je mérite le respect.\n• Mon corps est mon allié.\n• Je trace ma propre voie.\n• Je grandis chaque jour." },
              ].map((s, i) => (
                <button key={i} onClick={() => setDetail({ title: s.title, node: <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{s.body}</pre> })} className={`text-left rounded-2xl border border-rose-100 p-4 bg-gradient-to-br ${s.tint}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2 ${s.color}`}><s.Icon className="w-5 h-5" /></div>
                  <div className="text-rose-900 text-sm font-medium">{s.title}</div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><Music2 className="w-4 h-4" /> Défi 30 jours bien-être</h3>
              <p className="text-sm text-gray-700 mb-3">Un objectif quotidien doux pour prendre soin de vous.</p>
              {!defi.start ? (
                <button onClick={() => { setDefi({ start: new Date().toISOString().slice(0, 10), days: Array(30).fill(false) }); flash("Défi lancé ✓ Bonne route !"); }} className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium">Commencer le défi</button>
              ) : (
                <>
                  <div className="text-xs text-gray-500 mb-2">Démarré le {fmtDate(defi.start)} · {defi.days.filter(Boolean).length}/30 validés</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {defi.days.map((d, j) => (
                      <button key={j} onClick={() => setDefi(s => ({ ...s, days: s.days.map((v, k) => k === j ? !v : v) }))}
                        className={`aspect-square rounded-lg text-xs ${d ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700"}`}>{j + 1}</button>
                    ))}
                  </div>
                  <button onClick={() => setDefi({ start: null, days: [] })} className="mt-3 text-xs text-rose-600 underline">Réinitialiser</button>
                </>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4" /> Articles inspirants</h3>
              <ul className="space-y-2">
                {[
                  "5 routines matinales pour bien démarrer",
                  "Recettes anti-fatigue pendant les règles",
                  "Comment dire non sans culpabiliser",
                  "Affirmations puissantes pour la confiance",
                ].map((t, i) => (
                  <li key={i}>
                    <button onClick={() => setDetail({ title: t, node: <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{ARTICLES[t]}</pre> })} className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 text-left">
                      <ScrollText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span className="text-sm text-rose-900 flex-1">{t}</span>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {section === "communaute" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <Users className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Communauté sécurisée</h2>
                <p className="text-sm text-white/90 mt-1">Forums, groupes thématiques, messagerie privée.</p>
              </div>
            </section>

            <section className="space-y-2">
              {[
                { Icon: Heart, color: "text-rose-600", bg: "bg-rose-100", title: "Adolescence & puberté", count: "1 240 membres", id: "ado" },
                { Icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-100", title: "Études & orientation", count: "896 membres", id: "etudes" },
                { Icon: Heart, color: "text-pink-600", bg: "bg-pink-100", title: "Santé & cycles", count: "2 105 membres", id: "sante" },
                { Icon: Briefcase, color: "text-amber-600", bg: "bg-amber-100", title: "Business & carrière", count: "654 membres", id: "business" },
                { Icon: Sparkles, color: "text-fuchsia-600", bg: "bg-fuchsia-100", title: "Lifestyle & beauté", count: "1 870 membres", id: "lifestyle" },
              ].map((g, i) => (
                <button key={i} onClick={() => { const grp = COMMUNITY_GROUPS.find(x => x.id === g.id); if (grp) setGroupView(grp); }} className="w-full bg-white rounded-2xl shadow-sm border border-rose-100 p-3 flex items-center gap-3 hover:bg-rose-50/50 transition">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${g.bg} ${g.color}`}><g.Icon className="w-5 h-5" /></div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-rose-900 text-sm">{g.title}</div>
                    <p className="text-xs text-gray-600">{g.count}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-2 flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4" /> Règles de bienveillance</h3>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> Respect, écoute, confidentialité</li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> Modération automatique + humaine</li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> Signalement en un clic</li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> Pseudonymat possible</li>
              </ul>
            </section>

            <button onClick={() => { setJoined(true); flash(joined ? "Vous êtes déjà membre ✓" : "Bienvenue dans la communauté ✓"); }} className={`w-full py-3 rounded-2xl text-sm font-medium inline-flex items-center justify-center gap-2 ${joined ? "bg-emerald-600 text-white" : "bg-fuchsia-600 text-white"}`}>
              {joined ? <><CheckCircle2 className="w-4 h-4" /> Membre de la communauté</> : <><Plus className="w-4 h-4" /> Rejoindre la communauté</>}
            </button>
          </>
        )}

        {section === "securite" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-red-600 via-red-500 to-rose-600 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <Siren className="w-7 h-7 mb-2" />
                <h2 className="text-lg">Bouton SOS</h2>
                <p className="text-sm text-white/90 mt-1">En cas de danger, alertez immédiatement vos contacts et les secours.</p>
                <button onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(p => {
                      const link = `https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`;
                      const msg = `URGENCE, j'ai besoin d'aide. Ma position : ${link}`;
                      window.location.href = `sms:?body=${encodeURIComponent(msg)}`;
                    }, () => { window.location.href = "tel:117"; });
                  } else { window.location.href = "tel:117"; }
                }} className="mt-3 w-full bg-white text-red-700 rounded-xl py-3 font-bold text-sm inline-flex items-center justify-center gap-2 shadow">
                  <Siren className="w-4 h-4" /> Déclencher l'alerte
                </button>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2">
              <a href="tel:117" className="bg-red-600 text-white rounded-2xl p-4 text-center"><Phone className="w-5 h-5 mx-auto mb-1" /><div className="text-sm font-medium">Police</div><div className="text-xs">117</div></a>
              <a href="tel:166" className="bg-red-600 text-white rounded-2xl p-4 text-center"><Phone className="w-5 h-5 mx-auto mb-1" /><div className="text-sm font-medium">SAMU</div><div className="text-xs">166</div></a>
              <a href="tel:118" className="bg-orange-600 text-white rounded-2xl p-4 text-center"><Phone className="w-5 h-5 mx-auto mb-1" /><div className="text-sm font-medium">Pompiers</div><div className="text-xs">118</div></a>
              <button onClick={() => setDetail({ title: "Centres VBG à proximité", node: (
                <ul className="space-y-2 text-sm">
                  {[
                    { n: "Centre Intégré Cotonou", a: "Rue 1234, Cotonou", t: "+229 21 30 11 11" },
                    { n: "Maison de la Femme, Abidjan", a: "Cocody, Abidjan", t: "+225 27 22 44 88" },
                    { n: "WILDAF Bénin", a: "Akpakpa, Cotonou", t: "+229 21 33 22 22" },
                    { n: "AFJ, Bénin", a: "Carré 123, Cotonou", t: "+229 21 30 99 99" },
                  ].map((c, j) => (
                    <li key={j} className="p-3 bg-rose-50 rounded-xl">
                      <div className="text-rose-900">{c.n}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.a}</div>
                      <a href={`tel:${c.t.replace(/\s/g, "")}`} className="inline-block mt-1.5 text-xs px-3 py-1 bg-rose-600 text-white rounded-full">Appeler {c.t}</a>
                    </li>
                  ))}
                </ul>
              ) })} className="bg-rose-600 text-white rounded-2xl p-4 text-center"><MapPin className="w-5 h-5 mx-auto mb-1" /><div className="text-sm font-medium">Centre VBG</div><div className="text-xs">Le plus proche</div></button>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
              <h3 className="text-rose-900 mb-3 flex items-center gap-2 text-sm"><Shield className="w-4 h-4" /> Ressources anti-VBG</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  { l: "Guide pratique : reconnaître les violences", k: "Reconnaître les violences" },
                  { l: "Que faire après une agression ?", k: "Que faire après une agression ?" },
                  { l: "Vos droits & démarches juridiques", k: "Vos droits & démarches" },
                  { l: "Soutien psychologique post-traumatique", k: "Soutien psychologique post-traumatique" },
                ].map((r, i) => (
                  <li key={i}>
                    <button onClick={() => setDetail({ title: r.k, node: <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{VBG_GUIDES[r.k]}</pre> })} className="w-full flex gap-2 text-left hover:bg-rose-50/50 p-1.5 rounded-lg">
                      <BookOpen className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /> {r.l}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="text-amber-900 flex items-center gap-2 mb-2 text-sm"><AlertTriangle className="w-4 h-4" /> Sécurité numérique</h3>
              <ul className="text-xs text-amber-900 space-y-1">
                <li>• Mots de passe forts, double authentification</li>
                <li>• Méfiance face aux inconnus en ligne</li>
                <li>• Ne jamais partager photos intimes</li>
                <li>• Bloquer & signaler tout harcèlement</li>
              </ul>
            </section>
          </>
        )}

        {section === "soutien" && (
          <>
            <section className="relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br from-rose-500 to-fuchsia-500 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <HeartHandshake className="w-6 h-6 mb-2" />
                <h2 className="text-lg">Vous n'êtes jamais seule</h2>
                <p className="text-sm text-white/90 mt-1">Une équipe bienveillante, gratuite et confidentielle, pour vous écouter.</p>
              </div>
            </section>

            <div className="space-y-2">
              {ACCOMPAGNEMENT.map((a, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-3 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.bg} ${a.color}`}><a.Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-rose-900 text-sm">{a.title}</div>
                    <p className="text-xs text-gray-600">{a.desc}</p>
                  </div>
                  {a.tel
                    ? <a href={`tel:${a.tel}`} className="text-xs px-3 py-1.5 bg-rose-600 text-white rounded-full">{a.action}</a>
                    : <button onClick={() => {
                        if (a.action === "Discuter") {
                          const num = CONTACTS.marraineWhatsapp || CONTACTS.supportWhatsapp;
                          if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent("Bonjour, j'aimerais parler à une marraine.")}`, "_blank");
                        }
                        else if (a.action === "RDV") { setCoachReq({ name: "", topic: "Suivi psychologique", date: "" }); }
                        else if (a.action === "Rejoindre") { setJoined(true); flash("Inscription au cercle de sororité enregistrée ✓"); }
                      }} className="text-xs px-3 py-1.5 bg-rose-600 text-white rounded-full">{a.action}</button>}
                </div>
              ))}
            </div>

            <section className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="text-red-900 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Urgence ou danger</h3>
              <p className="text-sm text-red-900/90 mb-2">Danger immédiat, violence, détresse aiguë :</p>
              <div className="grid grid-cols-2 gap-2">
                <a href="tel:117" className="bg-red-600 text-white text-sm py-2.5 rounded-xl text-center font-medium">Police 117</a>
                <a href="tel:166" className="bg-red-600 text-white text-sm py-2.5 rounded-xl text-center font-medium">SAMU 166</a>
              </div>
              <p className="text-xs text-red-800/80 mt-2 italic">Confidentiel · sans jugement.</p>
            </section>

            <section className="rounded-2xl shadow-sm border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-4">
              <h3 className="text-rose-900 mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Sororité & événements</h3>
              <p className="text-sm text-gray-700 mb-3">Cercles de parole, ateliers, webinaires animés par des femmes formées.</p>
              <button onClick={() => setDetail({ title: "Prochains événements", node: (
                <ul className="space-y-2 text-sm">
                  {[
                    { d: "12 mai 2026", t: "Cercle de parole, Maternité & travail", l: "Cotonou · 18h" },
                    { d: "20 mai 2026", t: "Webinaire, Lever des fonds pour son projet", l: "En ligne · 19h" },
                    { d: "5 juin 2026", t: "Atelier, Confiance & affirmation", l: "Abidjan · 10h" },
                    { d: "15 juin 2026", t: "Marche solidaire contre les VBG", l: "Cotonou · 8h" },
                  ].map((e, j) => (
                    <li key={j} className="p-3 bg-rose-50 rounded-xl">
                      <div className="text-xs text-rose-700">{e.d}</div>
                      <div className="text-rose-900 mt-0.5">{e.t}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{e.l}</div>
                      <button onClick={() => { flash("Inscrite ✓"); }} className="mt-2 text-xs px-3 py-1 bg-rose-600 text-white rounded-full">S'inscrire</button>
                    </li>
                  ))}
                </ul>
              ) })} className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium">Voir les prochains événements</button>
            </section>
          </>
        )}

        <p className="text-xs text-center text-rose-700/60 px-4 pb-2 italic">
          Sororité & transmission · Apprendre ensemble, écouter le corps.
        </p>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-rose-900">Nouvelle entrée de cycle</h3>
            <label className="block text-sm">
              <span className="text-gray-700">Date</span>
              <input type="date" value={newEntry.date} onChange={e => setNewEntry(n => ({ ...n, date: e.target.value }))} className="mt-1 w-full p-2 border border-rose-100 rounded-lg" />
            </label>
            <div>
              <span className="text-sm text-gray-700">Flux</span>
              <div className="flex gap-2 mt-1">
                {(["léger", "moyen", "abondant"] as const).map(f => (
                  <button key={f} onClick={() => setNewEntry(n => ({ ...n, flow: f }))} className={`flex-1 py-1.5 rounded-lg text-sm ${newEntry.flow === f ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-900"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-700">Humeur</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setNewEntry(n => ({ ...n, mood: m as any }))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${newEntry.mood === m ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-700">Symptômes</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)} className={`px-2.5 py-1 rounded-full text-xs ${newEntry.symptoms.includes(s) ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-900"}`}>{s}</button>
                ))}
              </div>
            </div>
            <label className="block text-sm">
              <span className="text-gray-700">Note</span>
              <textarea value={newEntry.note} onChange={e => setNewEntry(n => ({ ...n, note: e.target.value }))} placeholder="Comment vous sentez-vous ?" className="mt-1 w-full p-2 border border-rose-100 rounded-lg text-sm" rows={2} />
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-900">Annuler</button>
              <button onClick={addEntry} className="flex-1 py-2 rounded-xl bg-rose-600 text-white">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2 border-b border-rose-100">
              <h3 className="text-rose-900 text-base font-medium">{detail.title}</h3>
              <button onClick={closeDetail} className="text-gray-400 hover:text-rose-600 text-xl leading-none">×</button>
            </div>
            {detail.node}
            {orientationStep > 0 && detail.title === "Test d'orientation" && (
              <div className="mt-3 space-y-3">
                {orientationStep <= 3 ? (
                  <div className="bg-violet-50 rounded-xl p-3">
                    <div className="text-sm text-violet-900 mb-2">Question {orientationStep}/3, {["Quelle activité te plaît le plus ?", "Tu préfères travailler…", "Ton style ?"][orientationStep - 1]}</div>
                    <div className="grid gap-2">
                      {[["Aider les autres", "Créer / Imaginer", "Analyser / Comprendre"], ["En équipe", "Seule", "Sur le terrain"], ["Méthodique", "Créatif", "Communicant"]][orientationStep - 1].map(opt => (
                        <button key={opt} onClick={() => { setOrientationAnswers(a => [...a, opt]); setOrientationStep(s => s + 1); }} className="w-full py-2 px-3 bg-white border border-violet-200 rounded-lg text-sm text-left text-violet-900 hover:bg-violet-100">{opt}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-violet-50 rounded-xl p-4">
                    <div className="text-sm text-violet-900 font-medium mb-2">Pistes recommandées</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {orientationAnswers.includes("Aider les autres") && <li>• Santé · Travail social · Enseignement</li>}
                      {orientationAnswers.includes("Créer / Imaginer") && <li>• Design · Mode · Communication · Arts</li>}
                      {orientationAnswers.includes("Analyser / Comprendre") && <li>• Sciences · Ingénierie · Data · Droit</li>}
                      <li>• Tu peux affiner avec un mentor sur la plateforme.</li>
                    </ul>
                    <button onClick={() => { setOrientationStep(0); setOrientationAnswers([]); closeDetail(); }} className="w-full mt-3 py-2 bg-violet-600 text-white rounded-xl text-sm">Terminer</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {groupView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setGroupView(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2 border-b border-rose-100">
              <div>
                <h3 className="text-rose-900 font-medium">{groupView.title}</h3>
                <div className="text-xs text-gray-500">{groupView.members} membres</div>
              </div>
              <button onClick={() => setGroupView(null)} className="text-gray-400 hover:text-rose-600 text-xl leading-none">×</button>
            </div>
            <ul className="space-y-2 mb-3">
              {[...(extraPosts[groupView.id] || []), ...groupView.posts].map((p, i) => (
                <li key={i} className="p-3 bg-rose-50 rounded-xl text-sm text-rose-900">{p}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Partager…" className="flex-1 p-2 border border-rose-200 rounded-lg text-sm" />
              <button onClick={() => { if (!newPost.trim() || !groupView) return; setExtraPosts(p => ({ ...p, [groupView.id]: [newPost.trim(), ...(p[groupView.id] || [])] })); setNewPost(""); flash("Message publié ✓"); }} className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg text-sm inline-flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Publier</button>
            </div>
          </div>
        </div>
      )}

      {coachReq && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setCoachReq(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-rose-900 font-medium">Demande : {coachReq.topic}</h3>
            <label className="block text-sm"><span className="text-gray-700">Votre prénom</span>
              <input value={coachReq.name} onChange={e => setCoachReq(c => c ? { ...c, name: e.target.value } : c)} className="mt-1 w-full p-2 border border-rose-200 rounded-lg" /></label>
            <label className="block text-sm"><span className="text-gray-700">Date souhaitée</span>
              <input type="date" value={coachReq.date} onChange={e => setCoachReq(c => c ? { ...c, date: e.target.value } : c)} className="mt-1 w-full p-2 border border-rose-200 rounded-lg" /></label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCoachReq(null)} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-900">Annuler</button>
              <button onClick={() => { if (!coachReq.name || !coachReq.date) { flash("Merci de remplir tous les champs"); return; } flash(`Demande envoyée ✓ ${coachReq.name}, on revient vers vous`); setCoachReq(null); }} className="flex-1 py-2 rounded-xl bg-rose-600 text-white">Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-rose-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {showJournal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setShowJournal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-violet-700" /><h3 className="text-rose-900">Journal privé</h3></div>
            <label className="block text-sm">
              <span className="text-gray-700">Date</span>
              <input type="date" value={newJournal.date} onChange={e => setNewJournal(n => ({ ...n, date: e.target.value }))} className="mt-1 w-full p-2 border border-rose-100 rounded-lg" />
            </label>
            <div>
              <span className="text-sm text-gray-700">Comment vous sentez-vous ?</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setNewJournal(n => ({ ...n, mood: m as any }))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${newJournal.mood === m ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm">
              <span className="text-gray-700">Votre texte</span>
              <textarea value={newJournal.text} onChange={e => setNewJournal(n => ({ ...n, text: e.target.value }))} placeholder="Écrivez librement…" className="mt-1 w-full p-3 border border-rose-100 rounded-lg text-sm bg-rose-50/30" rows={6} />
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowJournal(false)} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-900">Annuler</button>
              <button onClick={addJournal} className="flex-1 py-2 rounded-xl bg-rose-600 text-white">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
