import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Sparkles, ArrowRight, Star, Wind, MapPin, Heart, BookOpen, Ticket, Users, ConciergeBell, Calendar, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX, COLLECTIONS, INTENT_LABEL, Intent } from '../data';
import { EXPERIENCES, EVENTS, TESTIMONIALS } from '../voyageContent';
import { usePatientPreferences } from '../../components/useStoredState';

const PASTILLES: Intent[] = ['souffler', 'nature', 'spa', 'meditation', 'detox', 'famille', 'senior', 'cure'];

export default function ExplorerScreen() {
  const navigate = useNavigate();
  const [activeIntent, setActiveIntent] = useState<Intent | null>(null);
  const { toggleSejourFavorite, isSejourFavorite } = usePatientPreferences();

  // Préchargement des hero images pour accélérer le LCP
  useEffect(() => {
    const heroes = [AFR.salyEmptyBeach, AFR.indigoWall, ...LIEUX.slice(0, 6).map((l) => AFR[l.hero])];
    const links: HTMLLinkElement[] = [];
    heroes.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      (link as any).fetchPriority = 'high';
      document.head.appendChild(link);
      links.push(link);
    });
    return () => { links.forEach((l) => l.remove()); };
  }, []);

  const filtered = useMemo(
    () => (activeIntent ? LIEUX.filter((l) => l.intents.includes(activeIntent)) : LIEUX),
    [activeIntent]
  );
  const pepites = LIEUX.slice(0, 4);
  const topNotes = [...LIEUX].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const proches = LIEUX.filter((l) => l.country === 'Sénégal').slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[62vh] min-h-[460px] overflow-hidden">
        <ImageWithFallback src={AFR.jungleHikers} alt="Randonnée en forêt tropicale" loading="eager" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-7 pb-10 text-white">
          <h1 className="mt-4 text-[34px] sm:text-5xl font-bold leading-[1.05] tracking-tight">
            Une pause qui change<br />votre énergie.
          </h1>
          <p className="mt-3 text-sm text-white/75 max-w-md">Lieux choisis pour leur calme, leur lumière et la qualité de récupération.</p>
          <button
            onClick={() => navigate('/voyage-loisirs/recherche')}
            className="mt-6 w-full bg-white/95 hover:bg-white text-stone-700 rounded-xl px-4 py-4 inline-flex items-center gap-3 shadow-2xl shadow-black/20 ring-1 ring-white/40"
          >
            <Search className="w-5 h-5 text-rose-500" />
            <span className="text-sm flex-1 text-left">Destination, séjour, ambiance, soin…</span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-stone-900 text-white font-semibold">IA</span>
          </button>
        </div>
      </section>

      {/* Pastilles d'intentions */}
      <section className="px-6 sm:px-8 pt-5">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 sm:-mx-8 px-6 sm:px-8 scroll-smooth snap-x">
          <button
            onClick={() => setActiveIntent(null)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeIntent === null
                ? 'bg-stone-900 text-white border-stone-900 shadow'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
            }`}
          >
            Tout
          </button>
          {PASTILLES.map((i) => (
            <button
              key={i}
              onClick={() => setActiveIntent(i)}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeIntent === i
                  ? 'bg-rose-600 text-white border-rose-600 shadow'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-rose-300'
              }`}
            >
              {INTENT_LABEL[i]}
            </button>
          ))}
        </div>
      </section>

      {/* Pépites du moment */}
      <Section title="Pépites du moment" subtitle="Des lieux sélectionnés pour leur atmosphère.">
        <Carousel>
          {(activeIntent ? filtered : pepites).slice(0, 6).map((l) => (
            <BigLieuCard
              key={l.id}
              hero={AFR[l.hero]}
              name={l.name}
              region={`${l.region}, ${l.country}`}
              price={l.pricePerNight}
              rating={l.rating}
              tags={l.tags}
              fav={isSejourFavorite(l.id)}
              onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
              onFav={() => toggleSejourFavorite(l.id)}
            />
          ))}
        </Carousel>
      </Section>

      {/* Collections HEALTHY PAGE */}
      <Section title="Collections HEALTHY PAGE" subtitle="Des lieux choisis pour le calme et la qualité de récupération.">
        <Carousel>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/voyage-loisirs/collection/${c.id}`)}
              className="flex-shrink-0 snap-start w-64 relative h-40 rounded-2xl overflow-hidden text-left shadow-md group"
            >
              <ImageWithFallback src={c.cover} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="font-bold leading-tight">{c.title}</div>
                <div className="text-[11px] text-white/80 mt-0.5">{c.lieuIds.length} lieux</div>
              </div>
            </button>
          ))}
        </Carousel>
      </Section>

      {/* Mieux notés */}
      <Section title="Séjours les mieux notés" subtitle="Le choix unanime des voyageurs.">
        <Carousel>
          {topNotes.map((l) => (
            <CompactLieuCard
              key={l.id}
              hero={AFR[l.hero]}
              name={l.name}
              region={`${l.region}, ${l.country}`}
              rating={l.rating}
              calm={l.calmLevel}
              onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
            />
          ))}
        </Carousel>
      </Section>

      {/* Inspirations Afrique moderne */}
      <section className="px-6 sm:px-8 mt-10">
        <div className="relative rounded-2xl overflow-hidden">
          <ImageWithFallback src={AFR.indigoWall} alt="Motif indigo" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-stone-900/70" />
          <div className="relative p-6 sm:p-8 text-white">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Inspirations</div>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight max-w-md">
              Des lieux authentiques, une esthétique qui inspire.
            </h3>
            <button
              onClick={() => navigate('/voyage-loisirs/inspirations')}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-stone-900 text-sm font-semibold hover:bg-amber-50"
            >
              Découvrir <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Expériences signature */}
      <Section title="Expériences signature" subtitle="Soins, cuisine, nature, sport — vivez plus que des nuits.">
        <Carousel>
          {EXPERIENCES.slice(0, 6).map((e) => (
            <button
              key={e.id}
              onClick={() => navigate('/voyage-loisirs/experiences')}
              className="flex-shrink-0 snap-start w-64 text-left"
            >
              <div className="relative h-44 rounded-2xl overflow-hidden shadow-md group">
                <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/45" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] bg-white/90 backdrop-blur text-stone-700 font-semibold">
                  {e.category}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-bold leading-tight line-clamp-2">{e.title}</div>
                  <div className="text-[11px] text-white/80 mt-1 inline-flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {e.durationHours}h
                    <span>·</span>
                    <span>{e.pricePerPerson.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </Carousel>
      </Section>

      {/* Quick links */}
      <section className="px-6 sm:px-8 mt-10">
        <div className="grid grid-cols-2 gap-3">
          <QuickLink Icon={BookOpen} title="Guides pays" subtitle="Visa, climat, étiquette" tone="bg-amber-500 text-white" cardBg="bg-amber-50 border-amber-200" onClick={() => navigate('/voyage-loisirs/guides')} />
          <QuickLink Icon={Ticket} title="Événements" subtitle="Festivals & retraites" tone="bg-rose-500 text-white" cardBg="bg-rose-50 border-rose-200" onClick={() => navigate('/voyage-loisirs/evenements')} />
          <QuickLink Icon={Users} title="Communauté" subtitle="Avis & témoignages" tone="bg-emerald-500 text-white" cardBg="bg-emerald-50 border-emerald-200" onClick={() => navigate('/voyage-loisirs/communaute')} />
          <QuickLink Icon={ConciergeBell} title="Conciergerie" subtitle="Voyage sur-mesure" tone="bg-amber-300 text-stone-900" cardBg="bg-stone-900 border-stone-900 text-white" onClick={() => navigate('/voyage-loisirs/conciergerie')} />
        </div>
      </section>

      {/* Événements à venir */}
      <Section title="Événements à venir" subtitle="Festivals, retraites, ateliers à ne pas manquer.">
        <Carousel>
          {EVENTS.slice(0, 5).map((e) => (
            <button
              key={e.id}
              onClick={() => navigate('/voyage-loisirs/evenements')}
              className="flex-shrink-0 snap-start w-60 text-left bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100"
            >
              <div className="relative h-32">
                <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-white/95 text-stone-700 font-semibold">
                  {e.type}
                </span>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-rose-600 font-semibold inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
                <div className="font-semibold text-sm text-stone-900 mt-0.5 line-clamp-2">{e.title}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{e.location}, {e.country}</div>
              </div>
            </button>
          ))}
        </Carousel>
      </Section>

      {/* Témoignages */}
      <Section title="Ils en parlent" subtitle="La Téranga, ressentie par notre communauté.">
        <Carousel>
          {TESTIMONIALS.slice(0, 5).map((t) => (
            <article key={t.id} className="flex-shrink-0 snap-start w-72 bg-white rounded-2xl shadow-md border border-stone-100 p-4">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={AFR[t.avatar]} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-100" />
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{t.name}</div>
                  <div className="text-[11px] text-stone-500">{t.city} · {t.lieu}</div>
                </div>
                <div className="ml-auto inline-flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-700 italic leading-relaxed line-clamp-4">« {t.quote} »</p>
            </article>
          ))}
        </Carousel>
      </Section>

      {/* Bannière conciergerie */}
      <section className="px-6 sm:px-8 mt-10">
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white p-6 sm:p-8">
          <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-amber-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-rose-500/25 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <ConciergeBell className="w-6 h-6 text-amber-200" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Conciergerie</div>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">Un voyage sur-mesure, sans charge mentale.</h3>
              <p className="mt-1 text-sm text-white/70 max-w-md">Vol, transferts, expériences exclusives, assistance 24/7.</p>
            </div>
            <button
              onClick={() => navigate('/voyage-loisirs/conciergerie')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-900 text-sm font-semibold"
            >
              Découvrir <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Escapades proches */}
      <Section title="Escapades proches" subtitle="À deux pas de Dakar, prêt à partir ce week-end.">
        <Carousel>
          {proches.map((l) => (
            <CompactLieuCard
              key={l.id}
              hero={AFR[l.hero]}
              name={l.name}
              region={`${l.region}, ${l.country}`}
              rating={l.rating}
              calm={l.calmLevel}
              onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
            />
          ))}
        </Carousel>
      </Section>

      <div className="h-8" />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="px-6 sm:px-8 mb-4">
        <h2 className="text-lg font-bold tracking-tight text-stone-900">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Carousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-6 sm:px-8 snap-x scroll-smooth">
      {children}
    </div>
  );
}

function BigLieuCard({ hero, name, region, price, rating, tags, fav, onClick, onFav }: any) {
  return (
    <article className="flex-shrink-0 snap-start w-72 rounded-2xl bg-white shadow-md overflow-hidden border border-stone-100 relative">
      <div onClick={onClick} role="button" tabIndex={0} className="block w-full text-left cursor-pointer">
        <div className="relative h-48">
          <ImageWithFallback src={hero} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur text-stone-700 inline-flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {rating}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <MapPin className="w-3 h-3" /> {region}
          </div>
          <div className="mt-1 font-semibold text-stone-900">{name}</div>
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {tags.slice(0, 3).map((t: string) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{t}</span>
            ))}
          </div>
          <div className="mt-3 text-sm">
            <span className="font-bold text-stone-900">{price.toLocaleString('fr-FR')}</span>
            <span className="text-stone-500"> FCFA / nuit</span>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onFav?.(); }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white z-10"
        aria-label="Favori"
      >
        <Heart className={`w-4 h-4 ${fav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
      </button>
    </article>
  );
}

function QuickLink({ Icon, title, subtitle, tone, cardBg, onClick }: { Icon: LucideIcon; title: string; subtitle: string; tone: string; cardBg: string; onClick: () => void }) {
  const dark = cardBg.includes('text-white');
  return (
    <button
      onClick={onClick}
      className={`border rounded-xl p-4 text-left hover:shadow-md transition flex items-center gap-3 ${cardBg}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${dark ? 'text-white' : 'text-stone-900'}`}>{title}</div>
        <div className={`text-[11px] ${dark ? 'text-white/70' : 'text-stone-600'}`}>{subtitle}</div>
      </div>
      <ArrowRight className={`w-4 h-4 ${dark ? 'text-white/70' : 'text-stone-500'}`} />
    </button>
  );
}

function CompactLieuCard({ hero, name, region, rating, calm, onClick }: any) {
  return (
    <button onClick={onClick} className="flex-shrink-0 snap-start w-56 text-left">
      <div className="relative h-36 rounded-xl overflow-hidden">
        <ImageWithFallback src={hero} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] bg-white/90 backdrop-blur inline-flex items-center gap-1 text-stone-700">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {rating}
        </span>
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/90 text-white inline-flex items-center gap-1">
          <Wind className="w-3 h-3" /> Calme {calm}/5
        </span>
      </div>
      <div className="mt-2 px-1">
        <div className="font-semibold text-sm text-stone-900 truncate">{name}</div>
        <div className="text-xs text-stone-500 truncate">{region}</div>
      </div>
    </button>
  );
}
