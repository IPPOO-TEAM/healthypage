import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Play, FileText, Headphones, Globe, Clock, Heart, Bookmark, BookmarkCheck, X, CheckCircle2, Download, RotateCw, Share2, NotebookPen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type Lang = 'fr' | 'fon' | 'yor' | 'wol' | 'hau' | 'ibo' | 'lin' | 'bam' | 'ful' | 'dyu' | 'sen' | 'zar';
type Format = 'article' | 'video' | 'audio' | 'fiche';

type Resource = {
  id: string;
  title: string;
  topic: string;
  format: Format;
  langs: Lang[];
  duration: string;
  level: 'débutant' | 'intermédiaire' | 'expert';
  audience: string;
  image: string;
  body: string[];
};

const LANGS: { id: Lang | 'all'; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'fr', label: 'Français' },
  { id: 'fon', label: 'Fon' },
  { id: 'yor', label: 'Yoruba' },
  { id: 'wol', label: 'Wolof' },
  { id: 'hau', label: 'Haoussa' },
  { id: 'ibo', label: 'Igbo' },
  { id: 'lin', label: 'Lingala' },
  { id: 'bam', label: 'Bambara' },
  { id: 'ful', label: 'Peul' },
  { id: 'dyu', label: 'Dioula' },
  { id: 'sen', label: 'Sénoufo' },
  { id: 'zar', label: 'Djerma' },
];

const TOPICS = ['Tous', 'Maternité', 'Nutrition', 'Hygiène', 'Pédiatrie', 'Maladies chroniques', 'Mental', 'Premiers secours', 'Plantes médicinales'];

const FORMATS: { id: Format | 'all'; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'Tous', icon: BookOpen },
  { id: 'article', label: 'Articles', icon: FileText },
  { id: 'video', label: 'Vidéos', icon: Play },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'fiche', label: 'Fiches', icon: FileText }
];

const RESOURCES: Resource[] = [
  { id: '1', title: 'Allaitement exclusif les 6 premiers mois', topic: 'Maternité', format: 'video', langs: ['fr', 'fon', 'yor'], duration: '8 min', level: 'débutant', audience: 'Jeunes mères', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800',
    body: [
      "L'OMS recommande l'allaitement maternel exclusif pendant les 6 premiers mois. Le lait maternel contient tous les nutriments dont le nourrisson a besoin et le protège contre les infections.",
      "Les bonnes positions : la « madone », la position couchée et le « ballon de rugby ». Veillez à ce que la bouche de l'enfant englobe une grande partie de l'aréole, pas seulement le mamelon.",
      "Fréquence : à la demande, jour et nuit, environ 8 à 12 tétées par 24 h les premières semaines. Évitez les biberons d'eau, de tisane ou de lait artificiel pendant cette période.",
      "Signes de bonne prise : déglutition audible, satisfaction après la tétée, 5 à 6 couches mouillées par jour. Consultez si la prise de poids stagne ou si l'enfant pleure constamment."
    ] },
  { id: '2', title: 'Reconnaître un paludisme grave chez l\'enfant', topic: 'Pédiatrie', format: 'fiche', langs: ['fr', 'fon', 'bam'], duration: '3 min', level: 'débutant', audience: 'Parents', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
    body: [
      "Signes d'alerte (urgence) : fièvre élevée + un de ces signes, convulsions, somnolence anormale, refus de boire/téter, vomissements répétés, respiration rapide, pâleur des paumes, urines foncées.",
      "Avant l'arrivée à l'hôpital : déshabiller l'enfant, l'éponger à l'eau tiède, donner du paracétamol selon le poids, ne rien donner par la bouche s'il est inconscient.",
      "Confirmation : un test rapide (TDR) ou une goutte épaisse permettent de poser le diagnostic en moins de 30 minutes au centre de santé le plus proche.",
      "Prévention : moustiquaire imprégnée chaque nuit, élimination des eaux stagnantes, traitement préventif intermittent recommandé pendant la grossesse."
    ] },
  { id: '3', title: 'Vivre avec le diabète : alimentation locale', topic: 'Maladies chroniques', format: 'article', langs: ['fr', 'wol'], duration: '12 min', level: 'intermédiaire', audience: 'Adultes', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
    body: [
      "Le diabète n'oblige pas à renoncer à la cuisine traditionnelle. Le secret : équilibrer les portions et choisir des aliments à index glycémique modéré.",
      "À privilégier : haricot blanc, niébé, voandzou, légumes-feuilles (gboma, crincrin), poisson, igname bouillie, fonio, mil. Ils libèrent le sucre lentement.",
      "À limiter : pain blanc, riz blanc en grande quantité, sodas, jus industriels, sauces très sucrées. Préférez l'eau, le bissap sans sucre, le thé.",
      "Astuce : remplir la moitié de l'assiette de légumes, un quart de protéines (poisson, œuf, viande maigre), un quart de féculents complets. Manger lentement, à heure régulière."
    ] },
  { id: '4', title: 'Lavage des mains : gestes essentiels', topic: 'Hygiène', format: 'video', langs: ['fr', 'fon', 'yor', 'bam', 'wol'], duration: '4 min', level: 'débutant', audience: 'Tout public', image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800',
    body: [
      "Quand : avant de manger, après les toilettes, après avoir mouché un enfant, avant de cuisiner, en rentrant à la maison.",
      "Comment : mouiller, savonner, frotter paumes, dos des mains, entre les doigts, ongles, poignets pendant 20 secondes (le temps d'un refrain), rincer, sécher avec un linge propre.",
      "Sans eau courante ? Un seau-robinet avec savon suffit. Le gel hydroalcoolique remplace ponctuellement mais ne convient pas si les mains sont visiblement sales.",
      "Apprenez aux enfants en chantant : c'est un geste qui sauve plus de vies que beaucoup de médicaments."
    ] },
  { id: '5', title: 'Hypertension : suivi quotidien à domicile', topic: 'Maladies chroniques', format: 'audio', langs: ['fr', 'yor'], duration: '15 min', level: 'intermédiaire', audience: 'Aînés', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    body: [
      "Mesurez votre tension à heure fixe, le matin avant médicament et le soir, assis depuis 5 minutes, bras posé à hauteur du cœur.",
      "Notez les valeurs : objectif < 140/90 mmHg en général, < 130/80 en cas de diabète. Apportez le carnet à chaque consultation.",
      "Limiter le sel : pas de cube ajouté systématiquement, attention au poisson fumé, aux conserves. Manger banane, papaye, légumes-feuilles riches en potassium.",
      "Alertez si : céphalées intenses, troubles de la vue, douleur thoracique, faiblesse d'un côté du corps. Ce sont des urgences."
    ] },
  { id: '6', title: 'Gérer le stress et l\'anxiété au quotidien', topic: 'Mental', format: 'article', langs: ['fr'], duration: '10 min', level: 'débutant', audience: 'Adultes', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
    body: [
      "Le stress devient un problème quand il dure : sommeil agité, irritabilité, douleurs sans cause, perte d'appétit ou grignotage.",
      "Technique 4-7-8 : inspirez 4 s, retenez 7 s, expirez 8 s. Trois cycles suffisent pour ralentir le cœur et calmer l'esprit.",
      "Routines protectrices : marche quotidienne 30 min, sommeil régulier, repas partagés, parler à une personne de confiance, limiter les écrans le soir.",
      "Demander de l'aide est un signe de force. Un psychologue ou un médecin généraliste peut accompagner sans jugement."
    ] },
  { id: '7', title: 'Plantes médicinales : usages sûrs', topic: 'Plantes médicinales', format: 'fiche', langs: ['fr', 'fon', 'yor'], duration: '6 min', level: 'intermédiaire', audience: 'Tradipraticiens', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800',
    body: [
      "Une plante n'est pas anodine : elle contient des principes actifs réels. Demandez toujours à un tradipraticien reconnu et signalez les plantes prises à votre médecin.",
      "Citronnelle, gingembre, neem, moringa, kinkéliba : usages traditionnels documentés mais dosage important. Ne dépassez pas 2 à 3 tasses par jour.",
      "Précautions : éviter pendant la grossesse sans avis (certaines plantes sont abortives), pas pour les nourrissons, attention aux interactions avec les médicaments.",
      "Une plante mal identifiée peut être toxique. En cas de doute, abstenez-vous."
    ] },
  { id: '8', title: 'Premiers gestes en cas d\'étouffement', topic: 'Premiers secours', format: 'video', langs: ['fr', 'fon', 'bam'], duration: '5 min', level: 'débutant', audience: 'Tout public', image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800',
    body: [
      "Si la personne tousse fort, encouragez-la à continuer : la toux est le meilleur réflexe. Ne tapez pas dans le dos.",
      "Si elle ne peut plus tousser, parler ni respirer : 5 claques entre les omoplates avec le plat de la main, puis 5 compressions abdominales (Heimlich) si nécessaire.",
      "Nourrisson < 1 an : tête vers le bas sur l'avant-bras, 5 tapes dans le dos, puis retourner et faire 5 pressions thoraciques avec 2 doigts.",
      "Appelez les secours dès que possible (SAMU 119 au Bénin) et continuez les manœuvres jusqu'à leur arrivée."
    ] },
  { id: '9', title: 'Nutrition équilibrée avec produits locaux', topic: 'Nutrition', format: 'article', langs: ['fr', 'wol', 'bam'], duration: '14 min', level: 'débutant', audience: 'Familles', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    body: [
      "Pas besoin d'aliments importés : la cuisine ouest-africaine offre tous les groupes nutritionnels nécessaires.",
      "Énergie : igname, manioc, riz, mil, fonio, plantain. Protéines : haricot, niébé, poisson, œufs, poulet, soja. Vitamines : amarante, gboma, mangue, papaye, tomate, gombo.",
      "Réduire l'huile : cuire à la vapeur ou braiser, utiliser un seul type d'huile (rouge ou tournesol) avec modération. Limiter les bouillons cubes.",
      "Trois repas + une collation à base de fruit ou d'arachide. Boire 1,5 L d'eau par jour."
    ] },
  { id: '10', title: 'Vaccination de l\'enfant : calendrier', topic: 'Pédiatrie', format: 'fiche', langs: ['fr', 'fon', 'yor', 'bam', 'wol'], duration: '4 min', level: 'débutant', audience: 'Parents', image: 'https://images.unsplash.com/photo-1632053002439-fa39ed79b8a4?w=800',
    body: [
      "Naissance : BCG (tuberculose) + VPO0 (polio) + Hep B0. À 6, 10, 14 semaines : Penta (DTC-Hib-HepB), VPO, Pneumo, Rota.",
      "9 mois : rougeole-rubéole + fièvre jaune. 15-18 mois : rappels selon programme national.",
      "Apportez le carnet à chaque visite. La vaccination est gratuite dans les centres publics.",
      "Effets normaux : légère fièvre 24 à 48 h, rougeur au point de piqûre. Consultez si fièvre > 39 °C, convulsions, gonflement important."
    ] },
  { id: '11', title: 'Préparer une grossesse en santé', topic: 'Maternité', format: 'audio', langs: ['fr', 'fon'], duration: '20 min', level: 'débutant', audience: 'Couples', image: 'https://images.unsplash.com/photo-1518126203403-26d5e7d4d2c2?w=800',
    body: [
      "3 mois avant la conception : commencer l'acide folique (400 µg/j) pour prévenir les malformations du tube neural.",
      "Bilan préconceptionnel : groupe sanguin, sérologies (toxo, rubéole, VIH, hépatites), électrophorèse de l'hémoglobine, glycémie.",
      "Hygiène de vie : arrêter alcool et tabac, alimentation variée, activité physique modérée, sommeil suffisant.",
      "Consultations prénatales : minimum 8 selon l'OMS. Premier rendez-vous avant 12 semaines."
    ] },
  { id: '12', title: 'Drépanocytose : comprendre et accompagner', topic: 'Maladies chroniques', format: 'article', langs: ['fr', 'fon'], duration: '18 min', level: 'expert', audience: 'Familles', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    body: [
      "La drépanocytose est une maladie génétique de l'hémoglobine. Forme grave : SS. Forme porteur sain : AS (pas malade).",
      "Crises douloureuses (vaso-occlusives) : déclenchées par froid, déshydratation, infection, effort intense. Prévention : boire beaucoup, éviter le froid, traiter rapidement les infections.",
      "Suivi régulier : hémogramme, bilan organes (rate, reins, yeux), vaccinations renforcées (pneumocoque, méningocoque), antibiothérapie préventive enfant.",
      "Conseil génétique avant grossesse : un test sanguin du couple permet de connaître le risque. Soutien psychologique essentiel."
    ] }
];

const STORAGE_BOOK = 'healthy-page:biblio-bookmarks';
const STORAGE_LANG = 'healthy-page:biblio-lang';
const STORAGE_PROG = 'healthy-page:biblio-progress';
const STORAGE_NOTES = 'healthy-page:biblio-notes';
const STORAGE_DL = 'healthy-page:biblio-downloads';

type Progress = { page: number; total: number; done: boolean; updatedAt: number };

const loadJSON = <T,>(k: string, fallback: T): T => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
const saveJSON = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const FORMAT_ICON: Record<Format, typeof FileText> = { article: FileText, video: Play, audio: Headphones, fiche: FileText };

export default function BibliothequeScreen({ onBack }: Props) {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Lang | 'all'>(() => (localStorage.getItem(STORAGE_LANG) as any) || 'all');
  const [topic, setTopic] = useState<string>('Tous');
  const [format, setFormat] = useState<Format | 'all'>('all');
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadJSON<string[]>(STORAGE_BOOK, []));
  const [progress, setProgress] = useState<Record<string, Progress>>(() => loadJSON<Record<string, Progress>>(STORAGE_PROG, {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => loadJSON<Record<string, string>>(STORAGE_NOTES, {}));
  const [downloads, setDownloads] = useState<string[]>(() => loadJSON<string[]>(STORAGE_DL, []));
  const [reading, setReading] = useState<Resource | null>(null);
  const [page, setPage] = useState(0);
  const readerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => saveJSON(STORAGE_BOOK, bookmarks), [bookmarks]);
  useEffect(() => saveJSON(STORAGE_PROG, progress), [progress]);
  useEffect(() => saveJSON(STORAGE_NOTES, notes), [notes]);
  useEffect(() => saveJSON(STORAGE_DL, downloads), [downloads]);

  const setLangPersist = (l: Lang | 'all') => {
    setLang(l);
    try { localStorage.setItem(STORAGE_LANG, l); } catch {}
  };

  const toggleBook = (id: string) => setBookmarks((b) => b.includes(id) ? b.filter((x) => x !== id) : [...b, id]);
  const toggleDownload = (id: string) => setDownloads((d) => d.includes(id) ? d.filter((x) => x !== id) : [...d, id]);

  const openReader = (r: Resource) => {
    const p = progress[r.id];
    setPage(p && !p.done ? Math.min(p.page, r.body.length - 1) : 0);
    setReading(r);
  };
  const closeReader = () => {
    if (reading) {
      const total = reading.body.length;
      const cur = progress[reading.id];
      const done = cur?.done || page >= total - 1;
      setProgress((prev) => ({ ...prev, [reading.id]: { page, total, done, updatedAt: Date.now() } }));
    }
    setReading(null);
  };
  const markDone = () => {
    if (!reading) return;
    setProgress((prev) => ({ ...prev, [reading.id]: { page: reading.body.length - 1, total: reading.body.length, done: true, updatedAt: Date.now() } }));
  };
  const resetProgress = () => {
    if (!reading) return;
    setProgress((prev) => { const n = { ...prev }; delete n[reading.id]; return n; });
    setPage(0);
  };
  const next = () => { if (!reading) return; setPage((p) => Math.min(p + 1, reading.body.length - 1)); readerRef.current?.scrollTo({ top: 0 }); };
  const prev = () => { if (!reading) return; setPage((p) => Math.max(0, p - 1)); readerRef.current?.scrollTo({ top: 0 }); };

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (lang !== 'all' && !r.langs.includes(lang)) return false;
      if (topic !== 'Tous' && r.topic !== topic) return false;
      if (format !== 'all' && r.format !== format) return false;
      if (query && !(r.title.toLowerCase().includes(query.toLowerCase()) || r.topic.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [lang, topic, format, query]);

  const featured = bookmarks.length > 0 ? RESOURCES.filter((r) => bookmarks.includes(r.id)) : [];
  const inProgress = useMemo(() =>
    Object.entries(progress)
      .filter(([, p]) => !p.done && p.page > 0)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .map(([id]) => RESOURCES.find((r) => r.id === id))
      .filter((r): r is Resource => !!r)
      .slice(0, 5),
  [progress]);

  const stats = useMemo(() => {
    const done = Object.values(progress).filter((p) => p.done).length;
    return { done, total: RESOURCES.length, dl: downloads.length };
  }, [progress, downloads]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1080" alt="Bibliothèque" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <BookOpen className="w-5 h-5" /> Bibliothèque éducative
          </div>
          <h2 className="text-2xl font-bold mt-1">Apprendre la santé, dans votre langue</h2>
          <p className="text-sm text-white/85 mt-1">Articles · vidéos · audios · fiches en 5 langues</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Lus</p>
          <p className="font-bold text-teal-700 dark:text-teal-300">{stats.done}/{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Favoris</p>
          <p className="font-bold text-cyan-700 dark:text-cyan-300">{bookmarks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Hors-ligne</p>
          <p className="font-bold text-emerald-700 dark:text-emerald-300">{stats.dl}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un sujet (paludisme, vaccination…)"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Langue
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLangPersist(l.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  lang === l.id ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1.5">Sujet</p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  topic === t ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-cyan-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1.5">Format</p>
          <div className="grid grid-cols-5 gap-1.5">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const sel = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border text-[10px] transition ${
                    sel ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-2 flex items-center gap-1">
            <RotateCw className="w-4 h-4" /> Continuer la lecture
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {inProgress.map((r) => {
              const p = progress[r.id];
              const pct = Math.round(((p.page + 1) / p.total) * 100);
              return (
                <button key={r.id} onClick={() => openReader(r)} className="flex-shrink-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden text-left">
                  <div className="relative h-20">
                    <ImageWithFallback src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                      <div className="h-full bg-teal-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-slate-100 line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-teal-700 dark:text-teal-300 mt-0.5">{pct}% · page {p.page + 1}/{p.total}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {featured.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-2 flex items-center gap-1">
            <BookmarkCheck className="w-4 h-4" /> Mes favoris
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {featured.map((r) => {
              const Icon = FORMAT_ICON[r.format];
              return (
                <button key={r.id} onClick={() => openReader(r)} className="flex-shrink-0 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden text-left">
                  <div className="relative h-20">
                    <ImageWithFallback src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-white/90 text-teal-700 p-1 rounded-md"><Icon className="w-3 h-3" /></div>
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-slate-100 px-2 py-2 line-clamp-2">{r.title}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-1">
        <span>{filtered.length} ressource{filtered.length > 1 ? 's' : ''}</span>
        {(query || lang !== 'all' || topic !== 'Tous' || format !== 'all') && (
          <button onClick={() => { setQuery(''); setLangPersist('all'); setTopic('Tous'); setFormat('all'); }} className="text-teal-700 dark:text-teal-300 font-medium">
            Réinitialiser
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Aucune ressource ne correspond à vos filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((r) => {
            const Icon = FORMAT_ICON[r.format];
            const saved = bookmarks.includes(r.id);
            const dl = downloads.includes(r.id);
            const p = progress[r.id];
            const pct = p ? Math.round(((p.page + 1) / p.total) * 100) : 0;
            return (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col"
              >
                <div className="relative h-32">
                  <ImageWithFallback src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-900/95 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {r.format}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => toggleDownload(r.id)} aria-label="Télécharger" className="bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-lg hover:scale-105 transition">
                      <Download className={`w-3.5 h-3.5 ${dl ? 'text-emerald-600' : 'text-gray-600'}`} />
                    </button>
                    <button onClick={() => toggleBook(r.id)} aria-label="Favori" className="bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-lg hover:scale-105 transition">
                      {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" /> : <Bookmark className="w-3.5 h-3.5 text-gray-600" />}
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                    <span className="bg-black/40 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{r.duration}</span>
                    <span className="bg-black/40 px-1.5 py-0.5 rounded">{r.level}</span>
                  </div>
                  {p?.done && (
                    <div className="absolute inset-x-0 bottom-0 bg-emerald-500/90 text-white text-[10px] font-semibold py-0.5 px-2 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Lu
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">{r.topic}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mt-0.5 leading-snug line-clamp-2">{r.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {r.audience}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.langs.map((l) => (
                      <span key={l} className="text-[9px] uppercase font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {l}
                      </span>
                    ))}
                  </div>
                  {p && !p.done && (
                    <div className="mt-2 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  )}
                  <button onClick={() => openReader(r)} className="mt-3 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold py-2 rounded-xl shadow-sm hover:shadow-md transition inline-flex items-center justify-center gap-1">
                    {p?.done ? 'Relire' : p ? 'Reprendre' : 'Consulter'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <Globe className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Contenus validés par des professionnels de santé · traductions communautaires relues · accessibles hors-ligne après téléchargement.</span>
      </div>

      <AnimatePresence>
        {reading && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeReader}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-40 flex-shrink-0">
                <ImageWithFallback src={reading.image} alt={reading.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <button onClick={closeReader} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-white flex items-center justify-center" aria-label="Fermer">
                  <X className="w-4 h-4 text-gray-800" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{reading.topic} · {reading.format}</p>
                  <h2 className="font-bold text-lg leading-tight mt-0.5">{reading.title}</h2>
                  <p className="text-xs opacity-85 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {reading.duration} · {reading.level} · {reading.audience}
                  </p>
                </div>
              </div>

              <div className="px-4 pt-3 flex-shrink-0">
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all" style={{ width: `${((page + 1) / reading.body.length) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 text-right">Section {page + 1} / {reading.body.length}</p>
              </div>

              <div ref={readerRef} className="px-5 py-4 overflow-y-auto flex-1">
                <p className="text-sm leading-relaxed text-gray-800 dark:text-slate-200 whitespace-pre-wrap">{reading.body[page]}</p>

                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1.5 flex items-center gap-1">
                    <NotebookPen className="w-3 h-3" /> Mes notes
                  </p>
                  <textarea
                    value={notes[reading.id] || ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [reading.id]: e.target.value }))}
                    placeholder="Notez ici ce que vous voulez retenir…"
                    className="w-full text-sm bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/40 rounded-xl p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => toggleBook(reading.id)} className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1 ${bookmarks.includes(reading.id) ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {bookmarks.includes(reading.id) ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />} Favori
                  </button>
                  <button onClick={() => toggleDownload(reading.id)} className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1 ${downloads.includes(reading.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    <Download className="w-3 h-3" /> {downloads.includes(reading.id) ? 'Hors-ligne' : 'Télécharger'}
                  </button>
                  <button onClick={() => { try { (navigator as any).share?.({ title: reading.title, text: reading.body?.[0] ?? reading.title }); } catch {} }} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Partager
                  </button>
                  <button onClick={resetProgress} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Recommencer
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 p-3 flex items-center gap-2 flex-shrink-0">
                <button onClick={prev} disabled={page === 0} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-slate-200 disabled:opacity-40">Précédent</button>
                {page < reading.body.length - 1 ? (
                  <button onClick={next} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-sm">Suivant</button>
                ) : (
                  <button onClick={() => { markDone(); closeReader(); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-sm inline-flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Terminer
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
