import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, Clock, Sparkles, MapPin, Heart, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { EXPERIENCES, Experience } from '../voyageContent';
import { usePatientPreferences } from '../../components/useStoredState';

const CATEGORIES: Experience['category'][] = ['Soin', 'Nature', 'Cuisine', 'Sport', 'Bien-être'];

export default function ExperiencesScreen() {
  const navigate = useNavigate();
  const [cat, setCat] = useState<Experience['category'] | null>(null);
  const { isExperienceFavorite, toggleExperienceFavorite } = usePatientPreferences();

  const list = useMemo(
    () => (cat ? EXPERIENCES.filter((e) => e.category === cat) : EXPERIENCES),
    [cat]
  );

  return (
    <div>
      <section className="relative h-56 overflow-hidden">
        <ImageWithFallback src={AFR.expHammam} alt="Expériences" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Expériences
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Vivre, ressentir, savourer.</h1>
          <p className="mt-1 text-sm text-white/80 max-w-md">Soins, nature, cuisine, sport : nos expériences sélectionnées avec soin.</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 sm:-mx-8 px-6 sm:px-8 scroll-smooth snap-x">
          <button
            onClick={() => setCat(null)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium border transition ${
              cat === null ? 'bg-stone-900 text-white border-stone-900 shadow' : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            Toutes
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium border transition ${
                cat === c ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-white text-stone-700 border-stone-200 hover:border-rose-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 sm:px-8 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        {list.map((e) => {
          const fav = isExperienceFavorite(e.id);
          return (
            <article key={e.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100 hover:shadow-lg transition">
              <div className="relative h-48">
                <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] bg-white/90 backdrop-blur text-stone-700 font-semibold">
                  {e.category}
                </span>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/90 backdrop-blur inline-flex items-center gap-1 text-stone-700">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {e.rating}
                  </span>
                  <button
                    onClick={() => toggleExperienceFavorite(e.id)}
                    aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white"
                  >
                    <Heart className={`w-4 h-4 ${fav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <MapPin className="w-3 h-3" /> {e.country}
                  <span className="mx-1">·</span>
                  <Clock className="w-3 h-3" /> {e.durationHours}h
                </div>
                <div className="mt-1 font-semibold text-stone-900">{e.title}</div>
                <p className="mt-1 text-sm text-stone-600 line-clamp-2">{e.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-stone-900">{e.pricePerPerson.toLocaleString('fr-FR')}</span>
                    <span className="text-stone-500"> FCFA / pers.</span>
                  </div>
                  <span className="text-xs text-stone-500">{e.reviews} avis</span>
                </div>
                {e.lieuId && (
                  <button
                    onClick={() => navigate(`/voyage-loisirs/lieu/${e.lieuId}`)}
                    className="mt-3 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    Voir le lieu & réserver <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
