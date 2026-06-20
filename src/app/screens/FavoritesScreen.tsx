import { ArrowLeft, Heart, MapPin, Star, Stethoscope, ChevronRight, HeartCrack } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useFavorites } from '../components/useFavorites';
import { CENTERS, getCenter, haversine, formatKm } from '../components/centers';
import { useGeolocation } from '../components/useGeolocation';

interface FavoritesScreenProps {
  onBack: () => void;
  onSelectCenter: (id: number) => void;
}

export default function FavoritesScreen({ onBack, onSelectCenter }: FavoritesScreenProps) {
  const { ids, toggle } = useFavorites();
  const { position } = useGeolocation();

  const favCenters = ids
    .map((id) => getCenter(id))
    .filter((c): c is NonNullable<ReturnType<typeof getCenter>> => Boolean(c));

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-red-500 to-pink-500" />
        <div className="relative p-6 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 backdrop-blur rounded-full ring-1 ring-white/30 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs uppercase tracking-widest text-rose-100">Profil</span>
              <h2 className="text-2xl font-bold mt-1 flex items-center gap-2">
                <Heart className="w-6 h-6 fill-white" /> Mes favoris
              </h2>
            </div>
          </div>
          <p className="text-sm text-rose-50 mt-3 max-w-md">
            Retrouvez ici les centres médicaux que vous avez sauvegardés ({favCenters.length})
          </p>
        </div>
      </div>

      {favCenters.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <HeartCrack className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Touchez le cœur sur une fiche centre pour l'ajouter à vos favoris et le retrouver ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {favCenters.map((center) => {
              const realDist = position ? formatKm(haversine(position, center.position)) : center.distance;
              return (
                <motion.div
                  key={center.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                  onClick={() => onSelectCenter(center.id)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-rose-300 overflow-hidden cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full h-44 sm:w-32 sm:h-32 flex-shrink-0">
                      <ImageWithFallback
                        src={center.image}
                        alt={center.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{center.name}</h4>
                          <p className="text-xs text-gray-600 mt-0.5">{center.specialty}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(center.id); }}
                          aria-label="Retirer des favoris"
                          className="p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-gray-900">{center.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{realDist}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{center.doctors} méd.</span>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {favCenters.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-xs text-rose-700">
          {CENTERS.length, favCenters.length} autres centres disponibles dans la liste RDV.
        </div>
      )}
    </div>
  );
}
