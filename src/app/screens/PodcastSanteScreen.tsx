import {
  ArrowRight, Headphones, Mic, Radio, Play, Heart, Download, Share2,
  Sparkles, BookOpen, Users, Baby, Brain, Apple, Activity, Stethoscope,
  ShieldAlert, Leaf, MessageCircle, Star, Calendar, ListMusic, Bookmark,
  Quote, Globe2, Bell, ChevronRight,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';

interface Props { onBack?: () => void; onStart?: () => void }

const IMG = {
  hero: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1600',
  studio: 'https://images.unsplash.com/photo-1590602846989-d4dfe5b87a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200',
  hostA: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  hostB: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  hostC: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  hostD: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900',
  cat1: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat2: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat3: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat4: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat5: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  cat6: 'https://images.unsplash.com/photo-1542736667-069246bdbc6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
  ad: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1400',
  community: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200',
};

const CATEGORIES = [
  { Icon: Apple, title: 'Nutrition & alimentation', color: 'from-emerald-500 to-green-600', tag: 'bg-emerald-100 text-emerald-700', img: IMG.cat1, desc: "Manger juste avec des produits locaux : maïs, mil, légumes verts, poissons et fruits de saison. Nos nutritionnistes décodent les idées reçues et proposent des assiettes équilibrées, accessibles, adaptées au climat et au pouvoir d’achat des familles." },
  { Icon: Brain, title: 'Santé mentale & bien-être', color: 'from-indigo-500 to-blue-600', tag: 'bg-indigo-100 text-indigo-700', img: IMG.cat2, desc: "Stress, anxiété, deuil, charge mentale, pression sociale : nos psychologues parlent sans tabou des émotions, avec des techniques concrètes de respiration, de relaxation et d’écoute de soi pour retrouver l’équilibre intérieur." },
  { Icon: Activity, title: 'Sport & mouvement', color: 'from-orange-500 to-amber-600', tag: 'bg-orange-100 text-orange-700', img: IMG.cat3, desc: "Bouger chaque jour, même 15 minutes, change tout. Coachs et kinés livrent des routines simples à faire à la maison ou en plein air, pensées pour les corps actifs comme pour ceux qui reprennent en douceur." },
  { Icon: Baby, title: 'Maternité & famille', color: 'from-pink-500 to-rose-600', tag: 'bg-pink-100 text-pink-700', img: IMG.cat4, desc: "De la grossesse aux premiers pas de l’enfant : sages-femmes, pédiatres et mamans expérimentées partagent conseils pratiques, repères culturels et témoignages pour traverser sereinement chaque étape de la vie de famille." },
  { Icon: Stethoscope, title: 'Prévention & médecine', color: 'from-sky-500 to-blue-600', tag: 'bg-sky-100 text-sky-700', img: IMG.cat5, desc: "Diabète, hypertension, drépanocytose, paludisme, santé sexuelle : médecins généralistes et spécialistes expliquent simplement les maladies, comment les détecter tôt et quels gestes adopter pour se protéger et protéger ses proches." },
  { Icon: Leaf, title: 'Pharmacopée & traditions', color: 'from-lime-500 to-green-600', tag: 'bg-lime-100 text-lime-700', img: IMG.cat6, desc: "Plantes, tisanes, soins ancestraux et savoirs transmis de génération en génération sont mis en dialogue avec la médecine moderne, pour valoriser le patrimoine africain tout en garantissant des usages sûrs et raisonnés." },
];

const EPISODES = [
  { cat: 'Nutrition', tag: 'bg-emerald-500', cover: IMG.cat1, title: "Bien manger avec un petit budget : guide pratique au marché", host: 'Dr. Aïssata Bah', duration: '32 min', date: 'Cette semaine', desc: "Comment composer des repas équilibrés sans exploser son budget ? Notre nutritionniste guide pas à pas le choix des produits, la planification des courses et la cuisson qui préserve les nutriments, avec des recettes faciles testées en direct." },
  { cat: 'Santé mentale', tag: 'bg-indigo-500', cover: IMG.cat2, title: "Apprendre à respirer pour calmer une crise d’anxiété", host: 'Mme Fatou Diop', duration: '24 min', date: 'Nouveau', desc: "Trois techniques simples, concrètes et discrètes, à pratiquer partout, pour reprendre la maîtrise du souffle quand le cœur s’emballe et que les pensées tournent en boucle." },
  { cat: 'Maternité', tag: 'bg-pink-500', cover: IMG.cat4, title: "Premiers mois de bébé : reconnaître les vrais signes d’alerte", host: 'Dre Mariam Touré', duration: '41 min', date: 'Tendance', desc: "Fièvre, pleurs prolongés, refus de téter, signes de déshydratation : la pédiatre distingue ce qui peut attendre, ce qui demande un avis médical et ce qui impose les urgences." },
  { cat: 'Prévention', tag: 'bg-sky-500', cover: IMG.cat5, title: "Hypertension : la maladie silencieuse qui touche un adulte sur trois", host: 'Dr. Kwame Asante', duration: '28 min', date: 'Recommandé', desc: "Pourquoi mesurer sa tension change une vie. Le cardiologue explique les facteurs de risque, l’importance du dépistage régulier et des habitudes simples qui font baisser durablement la pression artérielle." },
  { cat: 'Sport', tag: 'bg-orange-500', cover: IMG.cat3, title: "15 minutes par jour : une routine pour le dos, à la maison", host: 'Coach Yannick Mensah', duration: '19 min', date: 'Exclusif', desc: "Une séance courte et progressive, sans matériel, pour soulager les tensions du dos liées à la position assise prolongée et renforcer la sangle abdominale en douceur." },
  { cat: 'Pharmacopée', tag: 'bg-lime-500', cover: IMG.cat6, title: "Le moringa : superaliment ou simple effet de mode ?", host: 'Pr. Adjoa Mensah', duration: '36 min', date: 'À la une', desc: "La pharmacologue passe au crible les vertus du moringa, son juste usage, ses interactions à connaître et la place qu’il peut occuper dans une alimentation équilibrée au quotidien." },
];

const HOSTS = [
  { name: 'Dr. Aïssata Bah', role: 'Nutritionniste clinique', episodes: 14, photo: IMG.hostA },
  { name: 'Mme Fatou Diop', role: 'Psychologue clinicienne', episodes: 22, photo: IMG.hostB },
  { name: 'Dr. Kwame Asante', role: 'Cardiologue', episodes: 9, photo: IMG.hostC },
  { name: 'Dre Mariam Touré', role: 'Pédiatre', episodes: 17, photo: IMG.hostD },
];

const SERIES = [
  { Icon: Calendar, title: 'Le rendez-vous santé du dimanche', desc: "Chaque semaine, un grand entretien d’une heure avec un médecin, un chercheur ou un acteur de terrain pour décrypter un enjeu de santé africain et répondre aux questions de la communauté." },
  { Icon: Mic, title: 'Voix de quartier', desc: "Reportages immersifs dans les quartiers, les marchés et les centres de santé. On y entend les patients, les soignants et les guérisseurs raconter, à hauteur d’homme, la santé telle qu’elle se vit." },
  { Icon: Radio, title: 'Live santé du soir', desc: "Une émission en direct, interactive, où vous posez vos questions par message vocal, en français, en wolof, en bambara ou en lingala. Les experts répondent en clair, sans jargon, en moins de cinq minutes." },
  { Icon: BookOpen, title: 'Histoires de soin', desc: "Témoignages longs et incarnés de patients qui ont traversé une maladie, un accouchement difficile, un parcours psychologique. Une série pour briser l’isolement et redonner espoir." },
];

const STATS = [
  { n: '+150', t: 'Épisodes disponibles' },
  { n: '+40', t: 'Experts intervenants' },
  { n: '12', t: 'Rubriques santé' },
  { n: '4', t: 'Langues couvertes' },
];

export default function PodcastSanteScreen({ onStart = () => { window.location.href = '/'; } }: Props) {
  return (
    <div className="min-h-screen bg-[#F7F9FF] text-[#0B1220]">
      <LandingNav onStart={onStart} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E5BFF] via-[#3a6dff] to-[#12C76F]">
        <div className="absolute inset-0 opacity-25">
          <ImageWithFallback src={IMG.hero} alt="Studio podcast santé" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFD400]/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-[#FF4D8D]/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white">
            <Headphones className="w-4 h-4" />
            <span className="font-semibold tracking-wide">PODCAST SANTÉ — HEALTHY PAGE</span>
          </div>
          <h1 className="mt-6 text-white font-black leading-[0.95]" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.75rem)' }}>
            La santé africaine,<br />
            <span className="text-[#FFD400]">à hauteur d’oreille.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/90 text-lg leading-relaxed">
            Un podcast 100 % africain, gratuit et accessible depuis votre téléphone, qui réunit médecins, sages-femmes, nutritionnistes, psychologues et tradipraticiens autour d’une même table. Ensemble, ils décryptent en français clair, sans jargon ni tabou, les grandes questions de santé qui traversent nos familles, nos quartiers et notre continent : prévention, maternité, alimentation, santé mentale, traditions thérapeutiques et urgences du quotidien. Un épisode, c’est un voyage court, vivant et utile, conçu pour vous accompagner sur le trajet du marché, dans la cuisine, à la salle d’attente ou avant de dormir.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onStart} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFD400] text-[#0B1220] font-bold shadow-lg hover:scale-[1.02] transition">
              <Play className="w-5 h-5 fill-current" /> Écouter maintenant
            </button>
            <a href="#categories" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/15 ring-1 ring-white/40 text-white font-semibold backdrop-blur-md hover:bg-white/25 transition">
              Explorer les rubriques <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div key={s.t} className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/25 px-4 py-3 text-white">
                <div className="text-3xl font-black">{s.n}</div>
                <div className="text-xs opacity-90 mt-0.5">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO PARAGRAPHE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E5BFF]/10 text-[#1E5BFF] font-semibold text-sm">
          <Sparkles className="w-4 h-4" /> Pourquoi un podcast santé
        </div>
        <h2 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
          La voix qui rapproche le soin de chaque foyer.
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-700">
          <p>
            En Afrique, l’information de santé fiable circule encore trop peu, trop tard, et souvent dans une langue qui n’est pas celle du quotidien. Pourtant, un message juste, donné au bon moment, peut sauver une vie : reconnaître une fièvre dangereuse chez un nourrisson, comprendre un traitement contre l’hypertension, oser parler de santé mentale, choisir un aliment local plutôt qu’un produit ultra-transformé. Le podcast HEALTHY PAGE a été créé pour combler ce vide, avec un format simple, intime et profondément humain : la voix.
          </p>
          <p>
            Chaque épisode est pensé pour s’écouter facilement, en mobilité, sans connexion stable. Les sujets sont traités en profondeur mais en mots accessibles, avec des exemples tirés du terrain, des témoignages d’hommes et de femmes du continent, et toujours des conseils concrets que l’on peut appliquer dès le lendemain. Notre ambition n’est pas de remplacer le médecin, mais d’éveiller la curiosité, de prévenir les drames évitables et de redonner à chacun le pouvoir d’agir sur sa santé et celle de ses proches.
          </p>
          <p>
            Le podcast s’intègre nativement à l’application HEALTHY PAGE et à la plateforme web : un seul clic sépare l’écoute d’un épisode de la prise de rendez-vous avec un spécialiste, de la consultation de votre carnet de santé, ou de la commande d’un kit de prévention. La connaissance n’est plus un long chemin séparé du soin : elle devient le premier pas du parcours.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12C76F]/10 text-[#12C76F] font-semibold text-sm">
                <ListMusic className="w-4 h-4" /> Six rubriques pour toute la famille
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black">Choisissez votre voyage d’écoute.</h2>
              <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
                Le podcast est organisé en six grandes rubriques colorées qui couvrent l’essentiel du bien-être au quotidien. Chaque rubrique propose des séries thématiques, des épisodes courts pour aller à l’essentiel et des grands entretiens pour creuser un sujet en profondeur.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(({ Icon, title, desc, color, tag, img }) => (
              <article key={title} className="group rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-xl transition">
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-70`} />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tag}`}>
                      <Icon className="w-3.5 h-3.5" /> Rubrique
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white font-black text-xl leading-tight">
                    {title}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-slate-700 leading-relaxed">{desc}</p>
                  <button className="mt-4 inline-flex items-center gap-1.5 text-[#1E5BFF] font-semibold hover:gap-2 transition-all">
                    Voir les épisodes <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TENDANCES / EPISODES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> Cette semaine
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black">Tendances et nouveautés.</h2>
          </div>
          <a href="#" className="text-[#1E5BFF] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">Tout voir <ChevronRight className="w-4 h-4" /></a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {EPISODES.map((e) => (
            <article key={e.title} className="group rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col sm:flex-row">
              <div className="relative sm:w-48 h-44 sm:h-auto shrink-0 overflow-hidden">
                <ImageWithFallback src={e.cover} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-bold text-white ${e.tag}`}>{e.cat}</span>
                <button className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white text-[#0B1220] grid place-items-center shadow-lg group-hover:scale-110 transition">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">{e.date}</span>
                  <span>•</span>
                  <span>{e.duration}</span>
                </div>
                <h3 className="mt-2 font-black text-lg leading-tight">{e.title}</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed line-clamp-3">{e.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Avec <span className="font-semibold text-slate-700">{e.host}</span></span>
                  <div className="flex items-center gap-1.5">
                    <button aria-label="Favori" className="p-2 rounded-full hover:bg-rose-50 text-rose-500"><Heart className="w-4 h-4" /></button>
                    <button aria-label="Télécharger" className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><Download className="w-4 h-4" /></button>
                    <button aria-label="Partager" className="p-2 rounded-full hover:bg-blue-50 text-blue-600"><Share2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CARROUSEL PUBLICITAIRE */}
      <section className="bg-gradient-to-r from-[#FFD400] via-[#FF8A00] to-[#FF4D8D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xl">
            <div className="md:col-span-1 rounded-2xl overflow-hidden h-44 md:h-56">
              <ImageWithFallback src={IMG.ad} alt="Partenaire santé" className="w-full h-full object-cover" />
            </div>
            <div className="md:col-span-2">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-slate-500">Sponsorisé</span>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black leading-tight">
                Vos analyses médicales à domicile, sans déplacement.
              </h3>
              <p className="mt-2 text-slate-700 leading-relaxed">
                Notre partenaire laboratoire HEALTHY PAGE prélève chez vous, livre les résultats sur votre carnet numérique et vous met directement en contact avec un médecin pour interpréter les chiffres. Une offre découverte est réservée aux auditeurs du podcast pendant tout le mois.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1E5BFF] text-white font-bold shadow hover:bg-[#1745c4] transition">
                Profiter de l’offre <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERVENANTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF4D8D]/10 text-[#FF4D8D] font-semibold text-sm">
          <Users className="w-4 h-4" /> Voix expertes
        </div>
        <h2 className="mt-3 text-3xl sm:text-4xl font-black">Des médecins, des thérapeutes, des voix de confiance.</h2>
        <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
          Tous nos intervenants sont sélectionnés pour leur expertise reconnue, leur ancrage africain et leur capacité à parler simplement. Nous mêlons médecins hospitaliers, chercheurs, sages-femmes communautaires, psychologues et détenteurs de savoirs traditionnels, dans un dialogue respectueux qui croise rigueur scientifique et héritage culturel.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {HOSTS.map((h) => (
            <article key={h.name} className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-lg transition overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback src={h.photo} alt={h.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="font-bold leading-tight">{h.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{h.role}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#1E5BFF] font-semibold">
                  <Mic className="w-3.5 h-3.5" /> {h.episodes} épisodes
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SERIES */}
      <section className="bg-gradient-to-b from-white to-[#F7F9FF] border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E5BFF]/10 text-[#1E5BFF] font-semibold text-sm">
            <Radio className="w-4 h-4" /> Nos formats signature
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black">Quatre rendez-vous pour rythmer votre semaine.</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {SERIES.map(({ Icon, title, desc }, i) => {
              const colors = ['bg-[#1E5BFF]', 'bg-[#12C76F]', 'bg-[#FF4D8D]', 'bg-[#FF8A00]'];
              return (
                <article key={title} className="rounded-3xl bg-white ring-1 ring-slate-100 p-6 hover:shadow-lg transition">
                  <div className={`w-12 h-12 rounded-2xl ${colors[i]} text-white grid place-items-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 font-black text-xl">{title}</h3>
                  <p className="mt-2 text-slate-700 leading-relaxed">{desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMUNAUTÉ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden h-72 sm:h-96 shadow-xl">
            <ImageWithFallback src={IMG.community} alt="Communauté HEALTHY PAGE" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12C76F]/10 text-[#12C76F] font-semibold text-sm">
              <MessageCircle className="w-4 h-4" /> Une communauté qui répond
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black">Vos questions deviennent les prochains épisodes.</h2>
            <p className="mt-4 text-slate-700 leading-relaxed text-lg">
              Le podcast HEALTHY PAGE n’est pas une diffusion à sens unique. Chaque auditeur peut poser sa question par message vocal, dans sa propre langue, depuis l’application : nos équipes éditoriales sélectionnent chaque semaine les sujets les plus partagés et les confient à un expert. Ainsi, les contenus collent toujours aux préoccupations réelles des familles, des soignants et des jeunes du continent.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Quote className="w-8 h-8 text-[#FFD400]" />
              <p className="italic text-slate-600">
                « J’ai posé une question sur l’allaitement à 22h, j’ai eu la réponse dans l’épisode du dimanche matin. C’est comme si la communauté me tenait la main. » — <span className="not-italic font-semibold">Aminata, Cotonou</span>
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onStart} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1E5BFF] text-white font-bold shadow hover:bg-[#1745c4] transition">
                <Mic className="w-4 h-4" /> Poser une question
              </button>
              <button onClick={onStart} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white ring-2 ring-[#1E5BFF] text-[#1E5BFF] font-bold hover:bg-blue-50 transition">
                <Bell className="w-4 h-4" /> S’abonner aux notifications
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#1E5BFF] to-[#12C76F]">
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-[#FFD400]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-[#FF4D8D]/30 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center text-white">
          <Headphones className="w-12 h-12 mx-auto text-[#FFD400]" />
          <h2 className="mt-4 font-black leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Mettez vos écouteurs.<br />Et prenez soin de vous, ensemble.
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-white/90 text-lg leading-relaxed">
            Le podcast HEALTHY PAGE est gratuit, disponible hors ligne sur l’application, traduit dans plusieurs langues africaines et conçu pour s’écouter partout, à n’importe quelle heure. Rejoignez les milliers d’auditeurs qui ont déjà fait du soin de soi un nouveau réflexe quotidien.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={onStart} className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#FFD400] text-[#0B1220] font-bold shadow-xl hover:scale-[1.02] transition">
              <Play className="w-5 h-5 fill-current" /> Lancer le premier épisode
            </button>
            <button onClick={onStart} className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/15 ring-1 ring-white/40 text-white font-bold backdrop-blur-md hover:bg-white/25 transition">
              <Bookmark className="w-5 h-5" /> Créer ma bibliothèque
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Contenus vérifiés</span>
            <span className="inline-flex items-center gap-1"><Globe2 className="w-4 h-4" /> 100 % africain</span>
            <span className="inline-flex items-center gap-1"><Star className="w-4 h-4" /> Gratuit</span>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
