import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Clock,
  Stethoscope,
  Navigation,
  Share2,
  Heart,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
// IMAGES no longer needed, center.image now comes from shared centers module
import { useFavorites } from '../components/useFavorites';
import { getCenter, CENTERS, haversine, formatKm } from '../components/centers';
import { DOCTORS } from '../components/doctors';
import { useGeolocation } from '../components/useGeolocation';
import HeartBurst from '../components/HeartBurst';

// Fix default Leaflet marker icons (CDN)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: 'healthy-user-marker',
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
    <span style="position:absolute;inset:-4px;background:rgba(59,130,246,0.35);border-radius:9999px;animation:hp-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>
    <div style="position:relative;width:22px;height:22px;border-radius:9999px;background:linear-gradient(135deg,#3b82f6,#6366f1);box-shadow:0 4px 14px rgba(0,0,0,0.25);border:3px solid white;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const tealIcon = L.divIcon({
  className: 'healthy-marker',
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
    <span style="position:absolute;inset:-6px;background:rgba(20,184,166,0.35);border-radius:9999px;animation:hp-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>
    <div style="position:relative;width:30px;height:30px;border-radius:9999px;background:linear-gradient(135deg,#14b8a6,#06b6d4);box-shadow:0 4px 14px rgba(0,0,0,0.25);border:3px solid white;display:flex;align-items:center;justify-content:center;">
      <span style="display:block;width:8px;height:8px;background:white;border-radius:9999px;"></span>
    </div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface CenterDetailScreenProps {
  centerId: number;
  onBack: () => void;
  onRate?: () => void;
}

export default function CenterDetailScreen({ centerId, onBack, onRate }: CenterDetailScreenProps) {
  const center = getCenter(centerId) ?? CENTERS[0];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(centerId);
  const { position } = useGeolocation();
  const [burst, setBurst] = useState(0);

  const realDistance = position ? formatKm(haversine(position, center.position)) : center.distance;

  const handleFavoriteClick = () => {
    const wasFav = favorited;
    toggle(centerId);
    if (!wasFav) setBurst((b) => b + 1);
  };

  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied' | 'error'>('idle');
  const handleShare = async () => {
    const shareData = {
      title: center.name,
      text: `${center.name}, ${center.specialty}\n${center.address}`,
      url: directionsUrl
    };
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(shareData);
        setShareStatus('shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShareStatus('copied');
      } else {
        setShareStatus('error');
      }
    } catch {
      setShareStatus('error');
    }
    setTimeout(() => setShareStatus('idle'), 2200);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.position[0]},${center.position[1]}&travelmode=driving`;

  const slots = [
    'Aujourd\'hui 15h30',
    'Aujourd\'hui 17h00',
    'Demain 09h00',
    'Demain 11h30',
    'Demain 14h00',
    '03 Mai 10h00'
  ];

  useEffect(() => {
    if (document.getElementById('hp-leaflet-anim')) return;
    const style = document.createElement('style');
    style.id = 'hp-leaflet-anim';
    style.textContent = `
      @keyframes hp-ping { 75%,100% { transform:scale(2); opacity:0; } }
      .leaflet-container { font-family: inherit; border-radius: 0.75rem; }
      .dark .leaflet-tile { filter: brightness(0.7) invert(1) contrast(0.85) hue-rotate(180deg) saturate(0.7); }
    `;
    document.head.appendChild(style);
  }, []);

  const nearby: { offset: [number, number]; label: string }[] = [
    { offset: [0.004, -0.005], label: 'Pharmacie' },
    { offset: [-0.003, 0.006], label: 'Laboratoire' },
    { offset: [0.005, 0.004], label: 'Urgences' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero with back */}
      <motion.div
        layoutId={`center-card-${centerId}`}
        className="relative overflow-hidden rounded-3xl shadow-lg h-56"
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      >
        <motion.div layoutId={`center-image-${centerId}`} className="absolute inset-0">
          <ImageWithFallback
            src={center.image}
            alt={center.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/95 via-teal-800/40 to-teal-700/30"></div>

        <div className="relative p-4 flex items-start justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 backdrop-blur rounded-full ring-1 ring-white/30 text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleFavoriteClick}
              className="relative p-2 bg-white/20 backdrop-blur rounded-full ring-1 ring-white/30 text-white hover:bg-white/30 transition-colors"
            >
              <Heart className={`w-5 h-5 transition-colors ${favorited ? 'fill-red-400 text-red-400' : ''}`} />
              <HeartBurst trigger={burst} size={48} particleCount={12} />
            </motion.button>
            <button
              onClick={handleShare}
              aria-label="Partager"
              className="p-2 bg-white/20 backdrop-blur rounded-full ring-1 ring-white/30 text-white hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <span className="text-xs uppercase tracking-widest text-teal-100">{center.specialty}</span>
          <motion.h2 layoutId={`center-title-${centerId}`} className="text-2xl font-bold mt-1">{center.name}</motion.h2>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <button
              type="button"
              onClick={onRate}
              className="flex items-center gap-1 hover:text-amber-200 transition-colors"
              aria-label="Voir les avis et noter"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{center.rating}</span>
              <span className="text-teal-100">({center.reviews})</span>
            </button>
            <span className="text-teal-100">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{realDistance}</span>
            </div>
            <span className="text-teal-100">•</span>
            <div className="flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              <span>{center.doctors} médecins</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Map */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 p-2 rounded-lg">
              <Navigation className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Localisation</h3>
              <p className="text-xs text-gray-500">{center.address}</p>
            </div>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Itinéraire →
          </a>
        </div>

        <motion.div
          key={`map-${centerId}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative isolate z-0 w-full h-72 rounded-xl overflow-hidden border border-gray-100"
        >
          <MapContainer
            center={center.position}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={center.position}
              radius={250}
              pathOptions={{ color: '#0d9488', fillColor: '#14b8a6', fillOpacity: 0.15, weight: 2 }}
            />
            <Marker position={center.position} icon={tealIcon}>
              <Popup>
                <strong>{center.name}</strong>
                <br />
                {center.address}
              </Popup>
            </Marker>
            {position && (
              <>
                <Marker position={position} icon={userIcon}>
                  <Popup>
                    <strong>Votre position</strong>
                    <br />
                    {realDistance} du centre
                  </Popup>
                </Marker>
                <Polyline
                  positions={[position, center.position]}
                  pathOptions={{ color: '#0d9488', weight: 3, dashArray: '6 8', opacity: 0.7 }}
                />
              </>
            )}
            {nearby.map((p, i) => (
              <Marker
                key={i}
                position={[center.position[0] + p.offset[0], center.position[1] + p.offset[1]]}
              >
                <Popup>{p.label}</Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow text-xs pointer-events-none space-y-1">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              <span className="font-medium">{center.name}</span>
            </div>
            {position && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Vous · {realDistance}</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
          >
            <Navigation className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-700">GPS</span>
          </a>
          <a
            href={`tel:${center.phone}`}
            className="flex flex-col items-center gap-1 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Appeler</span>
          </a>
          <button
            onClick={onRate}
            className="flex flex-col items-center gap-1 p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
          >
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-xs font-medium text-amber-700">Noter</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">
              {shareStatus === 'shared' ? 'Envoyé ✓' : shareStatus === 'copied' ? 'Copié ✓' : shareStatus === 'error' ? 'Erreur' : 'Partager'}
            </span>
          </button>
        </div>
      </div>

      {/* Description & infos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{center.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Horaires</p>
              <p className="text-sm font-medium text-gray-900">{center.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="text-sm font-medium text-gray-900">{center.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Médecins du centre */}
      {(() => {
        const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
        const centerKey = norm(center.name);
        const doctorsHere = DOCTORS.filter((d) => {
          const dKey = norm(d.centerName);
          return dKey === centerKey || dKey.includes(centerKey) || centerKey.includes(dKey);
        });
        if (doctorsHere.length === 0) return null;
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Médecins du centre</h3>
              <span className="text-xs text-gray-500">{doctorsHere.length} professionnel{doctorsHere.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {doctorsHere.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-gray-50">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <ImageWithFallback src={d.photo} alt="" className="w-full h-full object-cover" />
                    {d.available && <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">Dr. {d.firstName} {d.lastName}</p>
                    <p className="text-xs text-teal-700 font-medium">{d.specialty}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.rating}</span>
                      <span>•</span>
                      <span className="truncate">{d.nextSlot}</span>
                    </div>
                  </div>
                  <a href={`tel:${d.phone.replace(/\s/g, '')}`} className="p-2 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700" aria-label="Appeler">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Services */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Services proposés</h3>
        <div className="flex flex-wrap gap-2">
          {center.services.map((s) => (
            <span
              key={s}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Booking */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-teal-50 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Créneaux disponibles</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => {
            const active = selectedSlot === slot;
            return (
              <motion.button
                key={slot}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                  active
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-transparent hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {active && <CheckCircle className="w-4 h-4 inline-block mr-1 -mt-0.5" />}
                {slot}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!selectedSlot}
          className={`w-full mt-5 py-3.5 rounded-xl font-semibold transition-colors ${
            selectedSlot
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedSlot ? `Confirmer : ${selectedSlot}` : 'Sélectionnez un créneau'}
        </motion.button>
      </div>
    </div>
  );
}
