import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Ticket, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { EVENTS } from '../voyageContent';
import { usePatientPreferences } from '../../components/useStoredState';

const TYPE_TONE: Record<string, string> = {
  Festival: 'bg-rose-50 text-rose-700 border-rose-200',
  Retraite: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Atelier: 'bg-amber-50 text-amber-700 border-amber-200',
  Marché: 'bg-sky-50 text-sky-700 border-sky-200',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EvenementsScreen() {
  const navigate = useNavigate();
  const { isEventFavorite, toggleEventFavorite } = usePatientPreferences();
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <section className="relative h-52 overflow-hidden">
        <ImageWithFallback src={AFR.eventFestival} alt="Événements" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium uppercase tracking-[0.18em]">
            <Ticket className="w-3.5 h-3.5 text-amber-200" /> Agenda
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Événements à venir</h1>
          <p className="mt-1 text-sm text-white/80 max-w-md">Festivals, retraites et ateliers — réservez votre place.</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 mt-5 space-y-4 pb-8">
        {sorted.map((e) => {
          const fav = isEventFavorite(e.id);
          return (
          <article key={e.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100 flex relative">
            <div className="relative w-32 sm:w-40 flex-shrink-0">
              <ImageWithFallback src={AFR[e.hero]} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <button
              onClick={() => toggleEventFavorite(e.id)}
              aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${fav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
            </button>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${TYPE_TONE[e.type]}`}>{e.type}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                  <Calendar className="w-3 h-3" /> {formatDate(e.date)}
                </span>
              </div>
              <div className="mt-1 font-semibold text-stone-900">{e.title}</div>
              <div className="text-[11px] text-stone-500 inline-flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {e.location}, {e.country}
              </div>
              <p className="mt-2 text-sm text-stone-600 line-clamp-2">{e.description}</p>
              {e.pricePerPerson && (
                <div className="mt-2 text-sm">
                  <span className="font-bold text-stone-900">{e.pricePerPerson.toLocaleString('fr-FR')}</span>
                  <span className="text-stone-500"> FCFA / pers.</span>
                </div>
              )}
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
