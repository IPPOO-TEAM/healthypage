import {
  MapPin,
  Search,
  Star,
  Navigation,
  Clock,
  ChevronRight,
  Filter,
  Stethoscope,
  Heart,
  Baby,
  Activity,
  Eye,
  Microscope
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import SlotPickerModal from '../components/SlotPickerModal';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';
import { useFavorites } from '../components/useFavorites';
import { CENTERS, haversine, formatKm } from '../components/centers';
import { useGeolocation } from '../components/useGeolocation';
import HeartBurst from '../components/HeartBurst';

interface RdvScreenProps {
  onSelectCenter?: (id: number) => void;
  onNavigate?: (screen: string) => void;
}

export default function RdvScreen({ onSelectCenter, onNavigate }: RdvScreenProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'availability'>('distance');
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const { isFavorite, toggle } = useFavorites();
  const { status: geoStatus, position, request: requestGeo } = useGeolocation();
  const [bursts, setBursts] = useState<Record<number, number>>({});
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [slotPickerSpecialty, setSlotPickerSpecialty] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('Patient');

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    api.getPatient(pid)
      .then((res: any) => {
        const p = res?.patient ?? res;
        const fn = p?.firstName ?? '';
        const ln = p?.lastName ?? '';
        const full = `${fn} ${ln}`.trim();
        if (full) setPatientName(full);
      })
      .catch(() => {});
  }, []);

  const openSlotPicker = (sp?: string | null) => {
    const map: Record<string, string> = {
      generaliste: 'généraliste',
      cardiologue: 'cardiolog',
      pediatre: 'pédiatre',
      urgences: 'urgences',
      ophtalmologue: 'ophtalmolog',
      laboratoire: 'laboratoire',
    };
    setSlotPickerSpecialty(sp ? (map[sp] ?? sp) : null);
    setSlotPickerOpen(true);
  };

  const handleToggleFavorite = (id: number) => {
    const wasFav = isFavorite(id);
    toggle(id);
    if (!wasFav) {
      setBursts((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }));
    }
  };

  const specialties = [
    { id: 'generaliste', name: 'Généraliste', icon: Stethoscope, color: 'teal' },
    { id: 'cardiologue', name: 'Cardiologue', icon: Heart, color: 'red' },
    { id: 'pediatre', name: 'Pédiatre', icon: Baby, color: 'pink' },
    { id: 'urgences', name: 'Urgences', icon: Activity, color: 'orange' },
    { id: 'ophtalmologue', name: 'Ophtalmologue', icon: Eye, color: 'blue' },
    { id: 'laboratoire', name: 'Laboratoire', icon: Microscope, color: 'purple' }
  ];

  const centers = useMemo(() => {
    const enriched = CENTERS.map((c) => ({
      ...c,
      distance: position ? formatKm(haversine(position, c.position)) : c.distance,
      _km: position ? haversine(position, c.position) : Number.POSITIVE_INFINITY
    }));
    const q = searchQuery.toLowerCase().trim();
    const filtered = enriched.filter((c) => {
      if (selectedSpecialty) {
        const services = (c.services ?? []).join(' ').toLowerCase();
        if (!services.includes(selectedSpecialty) && c.specialty?.toLowerCase().indexOf(selectedSpecialty) === -1) return false;
      }
      if (minRating > 0 && c.rating < minRating) return false;
      if (onlyAvailable && !c.available) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q) ||
        (c.specialty ?? '').toLowerCase().includes(q)
      );
    });
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'availability') filtered.sort((a, b) => (Number(b.available) - Number(a.available)) || (b.rating - a.rating));
    else if (position) filtered.sort((a, b) => a._km - b._km);
    return filtered;
  }, [position, searchQuery, selectedSpecialty, sortBy, minRating, onlyAvailable]);

  return (
    <div className="space-y-6">
      {/* Header Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1631558554184-319c88f4f8a4?w=1080&q=80"
          alt="Consultation médicale"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/70 to-teal-700/40"></div>
        <div className="relative p-6 text-white">
          <span className="text-xs uppercase tracking-widest text-teal-100">Rendez-vous</span>
          <h2 className="text-2xl font-bold mt-1">Trouver un centre médical</h2>
          <p className="text-sm text-teal-50 mt-2 max-w-md">
            Recherchez et prenez rendez-vous avec les meilleurs professionnels près de chez vous
          </p>
          <button
            onClick={() => openSlotPicker(selectedSpecialty)}
            className="mt-4 inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 transition px-4 py-2.5 rounded-xl font-bold shadow-md"
          >
            <Clock className="w-4 h-4" /> Prendre RDV en ligne
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un centre, spécialiste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3">
            <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
            {['CNHU-HKM', 'Cotonou', 'Cardiologie', 'Pédiatrie', 'Maternité', 'Pharmacie', 'Cocotomey'].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSearchQuery(s)}
                className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={requestGeo}
            disabled={geoStatus === 'requesting'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              geoStatus === 'granted'
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            <Navigation className={`w-4 h-4 ${geoStatus === 'requesting' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {geoStatus === 'requesting'
                ? 'Localisation…'
                : geoStatus === 'granted'
                ? 'À proximité ✓'
                : geoStatus === 'denied'
                ? 'Activer la position'
                : 'À proximité'}
            </span>
          </button>
          <button
            onClick={() => { setSelectedSpecialty(null); setSearchQuery(''); setMinRating(0); setOnlyAvailable(false); setSortBy('distance'); }}
            disabled={!selectedSpecialty && !searchQuery && minRating === 0 && !onlyAvailable && sortBy === 'distance'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Réinitialiser</span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Trier :</span>
            {([
              ['distance', 'Distance'],
              ['rating', 'Mieux notés'],
              ['availability', 'Disponibles']
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                disabled={key === 'distance' && !position}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  sortBy === key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200'
                } disabled:opacity-40`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Note min. :</span>
            {[0, 4.0, 4.3, 4.5, 4.7].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border ${
                  minRating === r ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {r === 0 ? 'Toutes' : <><Star className="w-3 h-3 fill-current" /> {r.toFixed(1)}+</>}
              </button>
            ))}
            <label className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Disponibles aujourd'hui
            </label>
          </div>
        </div>
      </div>

      {/* CTA: annuaire dynamique des praticiens (avis + dispos) */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => onNavigate?.('annuaire')}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="bg-white/20 p-3 rounded-xl"><Stethoscope className="w-6 h-6" /></div>
          <div>
            <p className="font-semibold">Annuaire des praticiens</p>
            <p className="text-xs text-white/85">Avis vérifiés, dispos en temps réel</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      {/* CTA: liste des médecins */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => onNavigate?.('medecins')}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="bg-white/20 p-3 rounded-xl"><Stethoscope className="w-6 h-6" /></div>
          <div>
            <p className="font-semibold">Voir les médecins enregistrés</p>
            <p className="text-xs text-white/85">Liste complète classée par catégorie</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      {/* Specialties */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Spécialités</h3>
          <button
            onClick={() => onNavigate?.('specialistes')}
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Voir toutes →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {specialties.map((specialty) => {
            const Icon = specialty.icon;
            const isSelected = selectedSpecialty === specialty.id;

            return (
              <button
                key={specialty.id}
                onClick={() => setSelectedSpecialty(isSelected ? null : specialty.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  isSelected
                    ? `bg-${specialty.color}-50 border-2 border-${specialty.color}-600`
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isSelected ? `bg-${specialty.color}-100` : 'bg-white'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected ? `text-${specialty.color}-600` : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-xs font-medium text-center ${
                  isSelected ? `text-${specialty.color}-900` : 'text-gray-700'
                }`}>
                  {specialty.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Centers List */}
      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Centres recommandés ({centers.length})
          </h3>
          <span className="text-xs text-gray-500">
            {sortBy === 'rating' ? 'Triés par note' : sortBy === 'availability' ? 'Disponibles d\'abord' : position ? 'Triés par distance' : 'Triés par défaut'}
          </span>
        </div>

        {centers.map((center, idx) => {
          const fav = isFavorite(center.id);
          const heroImg = idx === 0 ? IMAGES.rdvClinic : idx === 1 ? IMAGES.rdvDoctor : null;
          return (
          <motion.div key={center.id} variants={itemVariants}>
          <motion.div
            layoutId={`center-card-${center.id}`}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            onClick={() => onSelectCenter?.(center.id)}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-teal-600 overflow-hidden cursor-pointer"
          >
            {heroImg && (
              <motion.div layoutId={`center-image-${center.id}`} className="relative h-48 sm:h-40">
                <ImageWithFallback
                  src={heroImg}
                  alt={center.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {idx === 0 && (
                  <span className="absolute top-3 left-3 bg-white/90 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur">
                    Recommandé par IA
                  </span>
                )}
                {idx === 1 && (
                  <span className="absolute top-3 left-3 bg-amber-400/95 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
                    ★ Premium
                  </span>
                )}
                <div className="absolute top-3 right-3">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(center.id); }}
                    aria-label="Favori"
                    className="relative p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-white transition-colors"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                    <HeartBurst trigger={bursts[center.id] ?? 0} size={28} particleCount={8} />
                  </motion.button>
                </div>
              </motion.div>
            )}
            <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <motion.h4 layoutId={`center-title-${center.id}`} className="font-semibold text-gray-900">{center.name}</motion.h4>
                  {!heroImg && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(center.id); }}
                      aria-label="Favori"
                      className="relative p-1 rounded-full hover:bg-gray-100"
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      <HeartBurst trigger={bursts[center.id] ?? 0} size={24} particleCount={8} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{center.specialty}</p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">{center.rating}</span>
                    <span className="text-xs text-gray-500">({center.reviews})</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{center.distance}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-sm">{center.doctors} médecins</span>
                  </div>
                </div>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Prochain créneau</p>
                  <p className={`text-sm font-medium ${
                    center.available ? 'text-teal-600' : 'text-gray-900'
                  }`}>
                    {center.nextSlot}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); openSlotPicker(selectedSpecialty); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                center.available
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {center.available ? 'Prendre RDV' : 'Voir créneaux'}
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{center.address}</span>
            </div>
            </div>
          </motion.div>
          </motion.div>
          );
        })}
      </motion.div>

      <SlotPickerModal
        open={slotPickerOpen}
        onClose={() => setSlotPickerOpen(false)}
        specialty={slotPickerSpecialty}
        patientName={patientName}
        onBooked={() => { setTimeout(() => { onNavigate?.('mesrdv'); }, 800); }}
      />

      {/* Urgences */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Urgence médicale ?</h3>
            <p className="text-sm text-red-800 mb-3">
              Contactez immédiatement le service d'urgence le plus proche
            </p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Appeler le 185
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
