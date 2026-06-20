import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Plus, ArrowRight, Star, MapPin, Sunrise, Flower2, Leaf, Users, Sparkles, Ticket, Calendar, Clock } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';
import { EXPERIENCES, EVENTS } from '../voyageContent';
import { usePatientPreferences } from '../../components/useStoredState';

const LISTS = [
  { id: 'weekend', label: 'Pour un week-end', Icon: Sunrise, tone: 'bg-amber-50 text-amber-600' },
  { id: 'spa', label: 'Spa', Icon: Flower2, tone: 'bg-rose-50 text-rose-600' },
  { id: 'nature', label: 'Nature', Icon: Leaf, tone: 'bg-emerald-50 text-emerald-600' },
  { id: 'famille', label: 'Famille', Icon: Users, tone: 'bg-sky-50 text-sky-600' },
];

type Tab = 'lieux' | 'experiences' | 'evenements';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function FavorisScreen() {
  const navigate = useNavigate();
  const {
    prefs,
    toggleSejourFavorite, isSejourFavorite,
    toggleExperienceFavorite, isExperienceFavorite,
    toggleEventFavorite, isEventFavorite,
  } = usePatientPreferences();
  const [tab, setTab] = useState<Tab>('lieux');

  const favLieux = (prefs.sejourFavorites ?? []).map((id) => LIEUX.find((l) => l.id === id)).filter(Boolean) as typeof LIEUX;
  const favExps = (prefs.experienceFavorites ?? []).map((id) => EXPERIENCES.find((e) => e.id === id)).filter(Boolean) as typeof EXPERIENCES;
  const favEvts = (prefs.eventFavorites ?? []).map((id) => EVENTS.find((e) => e.id === id)).filter(Boolean) as typeof EVENTS;

  const counts = { lieux: favLieux.length, experiences: favExps.length, evenements: favEvts.length };

  return (
    <div className="px-6 sm:px-8 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Favoris</h1>
          <p className="text-sm text-stone-500 mt-0.5">Gardez vos envies prêtes pour le bon moment.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-rose-500" />
        </div>
      </header>

      <div className="mt-5 inline-flex bg-stone-100 p-1 rounded-full">
        {([
          { id: 'lieux', label: 'Lieux', count: counts.lieux },
          { id: 'experiences', label: 'Expériences', count: counts.experiences },
          { id: 'evenements', label: 'Événements', count: counts.evenements },
        ] as { id: Tab; label: string; count: number }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition inline-flex items-center gap-1.5 ${
              tab === t.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.label}
            <span className={`px-1.5 rounded-full text-[10px] ${tab === t.id ? 'bg-rose-100 text-rose-600' : 'bg-stone-200 text-stone-600'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'lieux' && (
        <>
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-stone-700">Mes listes</div>
              <button className="text-xs text-rose-600 inline-flex items-center gap-1 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Nouvelle liste
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LISTS.map((l) => (
                <button key={l.id} className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-rose-300 transition flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${l.tone}`}><l.Icon className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-stone-900">{l.label}</div>
                    <div className="text-[11px] text-stone-500">0 lieux</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="text-sm font-semibold text-stone-700 mb-3">À réserver bientôt</div>
            {favLieux.length === 0 ? (
              <EmptyState
                title="Aucun lieu en favori"
                hint="Touchez le cœur sur les lieux qui vous parlent."
                cta="Explorer"
                onCta={() => navigate('/voyage-loisirs/explorer')}
                image={AFR.indigoAnimals}
              />
            ) : (
              <div className="space-y-3">
                {favLieux.map((l) => (
                  <article key={l.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden flex">
                    <button onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)} className="flex-1 flex text-left">
                      <ImageWithFallback src={AFR[l.hero]} alt={l.name} className="w-28 h-28 object-cover flex-shrink-0" />
                      <div className="flex-1 p-3">
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <MapPin className="w-3 h-3" /> {l.region}, {l.country}
                        </div>
                        <div className="font-semibold text-stone-900 mt-0.5">{l.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {l.rating}
                          </span>
                          <span className="text-stone-700"><strong>{l.pricePerNight.toLocaleString('fr-FR')}</strong> FCFA</span>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => toggleSejourFavorite(l.id)} aria-label="Retirer" className="px-4 flex items-center justify-center hover:bg-stone-50">
                      <Heart className={`w-5 h-5 ${isSejourFavorite(l.id) ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'experiences' && (
        <section className="mt-6">
          {favExps.length === 0 ? (
            <EmptyState
              title="Aucune expérience en favori"
              hint="Soins, cuisine, safari… cœurs prêts pour l'aventure."
              cta="Découvrir les expériences"
              onCta={() => navigate('/voyage-loisirs/experiences')}
              image={AFR.expHammam}
              Icon={Sparkles}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favExps.map((e) => (
                <article key={e.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="relative h-36">
                    <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={() => toggleExperienceFavorite(e.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                      <Heart className={`w-4 h-4 ${isExperienceFavorite(e.id) ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
                    </button>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-white/90 backdrop-blur font-semibold text-stone-700">{e.category}</span>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-stone-500 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {e.country}<span className="mx-1">·</span><Clock className="w-3 h-3" /> {e.durationHours}h
                    </div>
                    <div className="font-semibold text-stone-900 mt-0.5 line-clamp-1">{e.title}</div>
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span><strong>{e.pricePerPerson.toLocaleString('fr-FR')}</strong> <span className="text-stone-500">FCFA</span></span>
                      {e.lieuId && (
                        <button onClick={() => navigate(`/voyage-loisirs/lieu/${e.lieuId}`)} className="text-rose-600 font-semibold inline-flex items-center gap-1">
                          Réserver <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'evenements' && (
        <section className="mt-6">
          {favEvts.length === 0 ? (
            <EmptyState
              title="Aucun événement en favori"
              hint="Festivals, retraites, ateliers : ne loupez plus rien."
              cta="Voir l'agenda"
              onCta={() => navigate('/voyage-loisirs/evenements')}
              image={AFR.eventFestival}
              Icon={Ticket}
            />
          ) : (
            <div className="space-y-3">
              {favEvts.map((e) => (
                <article key={e.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden flex">
                  <div className="relative w-28 flex-shrink-0">
                    <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-3">
                    <div className="text-[11px] text-stone-500 inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmtDate(e.date)}
                    </div>
                    <div className="font-semibold text-stone-900 mt-0.5">{e.title}</div>
                    <div className="text-[11px] text-stone-500 inline-flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {e.location}, {e.country}
                    </div>
                  </div>
                  <button onClick={() => toggleEventFavorite(e.id)} className="px-4 flex items-center justify-center hover:bg-stone-50">
                    <Heart className={`w-5 h-5 ${isEventFavorite(e.id) ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="h-8" />
    </div>
  );
}

function EmptyState({
  title, hint, cta, onCta, image, Icon = Heart,
}: { title: string; hint: string; cta: string; onCta: () => void; image: string; Icon?: any }) {
  return (
    <div className="bg-amber-50 border border-stone-200 rounded-2xl p-8 text-center">
      <ImageWithFallback src={image} alt="" className="w-20 h-20 rounded-xl object-cover mx-auto opacity-90" />
      <div className="mt-4 font-semibold text-stone-900 inline-flex items-center gap-2 justify-center">
        <Icon className="w-4 h-4 text-rose-500" /> {title}
      </div>
      <p className="text-sm text-stone-500 mt-1">{hint}</p>
      <button
        onClick={onCta}
        className="mt-5 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold inline-flex items-center gap-2"
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
