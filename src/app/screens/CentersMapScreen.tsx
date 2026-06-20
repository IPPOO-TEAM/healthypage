import { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Star, Filter, Navigation, Hospital, Pill, Baby, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { CENTERS, haversine, formatKm, type CenterType } from '../components/centers';
import { useGeolocation } from '../components/useGeolocation';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPE_META: Record<CenterType, { label: string; color: string; icon: any }> = {
  hopital: { label: 'Hôpitaux', color: '#dc2626', icon: Hospital },
  clinique: { label: 'Cliniques', color: '#0891b2', icon: Building2 },
  pharmacie: { label: 'Pharmacies', color: '#16a34a', icon: Pill },
  maternite: { label: 'Maternités', color: '#db2777', icon: Baby },
};

function makeIcon(color: string) {
  return L.divIcon({
    className: 'healthy-map-pin',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
      <div style="width:22px;height:22px;border-radius:9999px;background:${color};box-shadow:0 3px 10px rgba(0,0,0,0.3);border:3px solid white;"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const TYPE_ICONS = {
  hopital: makeIcon(TYPE_META.hopital.color),
  clinique: makeIcon(TYPE_META.clinique.color),
  pharmacie: makeIcon(TYPE_META.pharmacie.color),
  maternite: makeIcon(TYPE_META.maternite.color),
};

const userIcon = L.divIcon({
  className: 'healthy-user-marker',
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
    <span style="position:absolute;inset:-4px;background:rgba(59,130,246,0.35);border-radius:9999px;animation:hp-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>
    <div style="position:relative;width:22px;height:22px;border-radius:9999px;background:linear-gradient(135deg,#3b82f6,#6366f1);box-shadow:0 4px 14px rgba(0,0,0,0.25);border:3px solid white;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DISTANCES = [
  { label: 'Tout', km: Infinity },
  { label: '< 2 km', km: 2 },
  { label: '< 5 km', km: 5 },
  { label: '< 10 km', km: 10 },
  { label: '< 25 km', km: 25 },
];

interface Props {
  onBack: () => void;
  onSelectCenter?: (id: number) => void;
}

export default function CentersMapScreen({ onBack, onSelectCenter }: Props) {
  const { position, status, request } = useGeolocation();
  const [types, setTypes] = useState<Set<CenterType>>(new Set(['hopital', 'clinique', 'pharmacie', 'maternite']));
  const [maxKm, setMaxKm] = useState<number>(Infinity);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return CENTERS
      .map((c) => ({
        ...c,
        _km: position ? haversine(position, c.position) : null,
      }))
      .filter((c) => types.has(c.type))
      .filter((c) => c.rating >= minRating)
      .filter((c) => maxKm === Infinity || (c._km !== null && c._km <= maxKm))
      .sort((a, b) => {
        if (a._km !== null && b._km !== null) return a._km, b._km;
        return b.rating, a.rating;
      });
  }, [position, types, maxKm, minRating]);

  const center: [number, number] = position ?? [6.4, 2.4]; // Bénin par défaut
  const zoom = position ? 12 : 8;

  const toggleType = (t: CenterType) => {
    setTypes((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n.size === 0 ? new Set(['hopital', 'clinique', 'pharmacie', 'maternite']) : n;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><MapPin className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Carte des centres</h2>
            <p className="text-sm text-white/85">{filtered.length} centre{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="relative h-32 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1080" alt="Centre de santé" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Trouver le bon centre · au plus près de chez vous</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={request}
            disabled={status === 'requesting'}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
              status === 'granted' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'
            }`}
          >
            <Navigation className={`w-4 h-4 ${status === 'requesting' ? 'animate-pulse' : ''}`} />
            {status === 'granted' ? 'Position OK' : status === 'requesting' ? 'Localisation…' : 'Me localiser'}
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700"
          >
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_META) as CenterType[]).map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const active = types.has(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                style={{ borderColor: active ? meta.color : undefined, backgroundColor: active ? `${meta.color}15` : undefined }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  active ? '' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: active ? meta.color : '#6b7280' }} />
                <span style={{ color: active ? meta.color : undefined }}>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Distance maximale</p>
                <div className="flex flex-wrap gap-1.5">
                  {DISTANCES.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setMaxKm(d.km)}
                      disabled={d.km !== Infinity && !position}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        maxKm === d.km ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200'
                      } disabled:opacity-40`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {!position && <p className="text-xs text-amber-600 mt-1">Activez la position pour filtrer par distance.</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Note minimale</p>
                <div className="flex flex-wrap gap-1.5">
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative isolate z-0 bg-white rounded-2xl shadow-sm overflow-hidden h-[420px]">
        <MapContainer key={position ? 'p1' : 'p0'} center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          {position && <Marker position={position} icon={userIcon}><Popup>Vous êtes ici</Popup></Marker>}
          {filtered.map((c) => (
            <Marker key={c.id} position={c.position} icon={TYPE_ICONS[c.type]}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-600">{c.specialty}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <Star className="w-3 h-3 fill-current" /> {c.rating}
                    </span>
                    {c._km !== null && <span className="text-gray-500">{formatKm(c._km)}</span>}
                  </div>
                  <button
                    onClick={() => onSelectCenter?.(c.id)}
                    className="text-xs text-teal-600 font-medium hover:text-teal-800 mt-1"
                  >
                    Voir le détail →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Liste des centres</h3>
        </div>
        <ul className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="p-4 text-sm text-gray-500 text-center">Aucun centre ne correspond aux filtres.</li>
          ) : filtered.map((c) => {
            const meta = TYPE_META[c.type];
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelectCenter?.(c.id)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 text-left"
                >
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.specialty} · {c.city}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="inline-flex items-center gap-0.5 text-amber-600">
                        <Star className="w-3 h-3 fill-current" /> {c.rating}
                      </span>
                      {c._km !== null && <span className="text-gray-500 inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {formatKm(c._km)}</span>}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
