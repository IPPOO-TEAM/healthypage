import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Filter, ArrowUpDown, Locate, Star, Wind } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';

function makePin(active: boolean, price: number): DivIcon {
  const html = `
    <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
      <div style="
        background: ${active ? '#e11d48' : '#ffffff'};
        color: ${active ? '#ffffff' : '#9f1239'};
        border: 2px solid ${active ? '#9f1239' : '#e11d48'};
        font-size: 11px;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        white-space: nowrap;
      ">${(price / 1000).toFixed(0)}k</div>
      <div style="
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${active ? '#9f1239' : '#e11d48'};
        margin-top: -1px;
      "></div>
    </div>`;
  return L.divIcon({
    html,
    className: 'voyage-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 5), { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export default function CarteScreen() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>(LIEUX[0].id);
  const active = useMemo(() => LIEUX.find((l) => l.id === activeId)!, [activeId]);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Centre la carte sur l'Afrique au montage
  const initialCenter: [number, number] = [5, 18];

  useEffect(() => {
    // Scroll horizontal vers la carte active
    const el = cardsRef.current?.querySelector(`[data-id="${activeId}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeId]);

  return (
    <div className="relative h-[calc(100vh-3.5rem-4.5rem)] flex flex-col">
      {/* Carte Leaflet réelle */}
      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          center={initialCenter}
          zoom={3}
          minZoom={2}
          maxZoom={12}
          scrollWheelZoom
          worldCopyJump
          className="absolute inset-0 w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {LIEUX.map((l) => (
            <Marker
              key={l.id}
              position={[l.lat, l.lng]}
              icon={makePin(l.id === activeId, l.pricePerNight)}
              eventHandlers={{
                click: () => setActiveId(l.id),
              }}
              zIndexOffset={l.id === activeId ? 1000 : 0}
            >
              <Popup closeButton={false}>
                <div className="min-w-[180px]">
                  <div className="font-semibold text-sm text-stone-900">{l.name}</div>
                  <div className="text-[11px] text-stone-500">{l.region}, {l.country}</div>
                  <button
                    onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
                    className="mt-2 w-full py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    Voir la fiche
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          <FlyTo lat={active.lat} lng={active.lng} />
        </MapContainer>

        {/* Halos décoratifs */}
        <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-rose-300/20 blur-3xl z-[400]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-0 w-[320px] h-[320px] rounded-full bg-amber-300/20 blur-3xl z-[400]" />

        {/* Top controls — glass */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-[500]">
          <button className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm border border-white/60 text-sm font-medium inline-flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Filtres
          </button>
          <button className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm border border-white/60 text-sm font-medium inline-flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4" /> Trier
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/voyage-loisirs/recherche')}
              className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm border border-white/60 text-sm font-medium"
            >
              Rechercher dans cette zone
            </button>
            <button aria-label="Ma position" className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm border border-white/60 flex items-center justify-center">
              <Locate className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom carousel of cards */}
      <div className="flex-shrink-0 bg-white/95 pt-4 pb-3 px-1 sm:px-2 z-[500]">
        <div className="px-4 mb-2 flex items-center justify-between">
          <div className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">{LIEUX.length} lieux</span> autour de l'Afrique
          </div>
        </div>
        <div ref={cardsRef} className="flex gap-3 overflow-x-auto px-4 snap-x scroll-smooth">
          {LIEUX.map((l) => {
            const isActive = l.id === activeId;
            return (
              <button
                key={l.id}
                data-id={l.id}
                onClick={() => {
                  if (isActive) navigate(`/voyage-loisirs/lieu/${l.id}`);
                  else setActiveId(l.id);
                }}
                className={`flex-shrink-0 snap-start w-72 rounded-xl overflow-hidden border bg-white/80 backdrop-blur-xl shadow-sm text-left transition ${
                  isActive ? 'border-rose-300 ring-2 ring-rose-200 shadow-rose-200/50 shadow-lg' : 'border-stone-200/70'
                }`}
              >
                <div className="flex">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <ImageWithFallback src={AFR[l.hero]} alt={l.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3" /> {l.country}
                    </div>
                    <div className="mt-0.5 font-semibold text-sm text-stone-900 truncate">{l.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-stone-700">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {l.rating}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <Wind className="w-3 h-3" /> Calme {l.calmLevel}/5
                      </span>
                    </div>
                    <div className="mt-1 text-[12px]">
                      <span className="font-bold">{l.pricePerNight.toLocaleString('fr-FR')}</span>
                      <span className="text-stone-500"> FCFA</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
