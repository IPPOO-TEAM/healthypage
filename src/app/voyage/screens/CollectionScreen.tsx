import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Star, Wind } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { COLLECTIONS, LIEUX } from '../data';

export default function CollectionScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collection = COLLECTIONS.find((c) => c.id === id) ?? COLLECTIONS[0];
  const lieux = collection.lieuIds.map((lid) => LIEUX.find((l) => l.id === lid)).filter(Boolean) as typeof LIEUX;

  return (
    <div>
      <div className="relative h-56 overflow-hidden">
        <ImageWithFallback src={collection.cover} alt={collection.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/55" />
        {/* halos colorés */}
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-rose-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl" />
        <button onClick={() => navigate(-1)} aria-label="Retour" className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-100">
            Collection HEALTHY PAGE
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{collection.title}</h1>
          <div className="text-xs text-white/85 mt-1">{lieux.length} lieux sélectionnés</div>
        </div>
      </div>

      <div className="px-6 sm:px-8 mt-5 space-y-3 pb-6">
        {lieux.map((l) => (
          <button
            key={l.id}
            onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
            className="w-full flex bg-white rounded-xl border border-stone-100 overflow-hidden text-left hover:shadow-md transition"
          >
            <ImageWithFallback src={AFR[l.hero]} alt={l.name} className="w-28 h-28 object-cover flex-shrink-0" />
            <div className="flex-1 p-3">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <MapPin className="w-3 h-3" /> {l.region}, {l.country}
              </div>
              <div className="font-semibold text-stone-900 mt-0.5">{l.name}</div>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{l.short}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {l.rating}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Wind className="w-3 h-3" /> {l.calmLevel}/5
                </span>
                <span className="text-stone-700"><strong>{l.pricePerNight.toLocaleString('fr-FR')}</strong> FCFA</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
