import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Ambulance, MapPin, Clock, Phone, Car, Users, AlertCircle, CheckCircle2, Trash2, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CONTACTS, telHref, hasContact } from '../components/contacts';

interface Props { onBack: () => void }

type VehicleType = 'ambulance' | 'vsl' | 'taxi-sante';
type RideStatus = 'demandée' | 'en route' | 'à bord' | 'terminée';

type Ride = {
  id: string;
  date: string;
  vehicle: VehicleType;
  pickup: string;
  destination: string;
  reason: string;
  passengers: number;
  status: RideStatus;
  eta: number;
  price: number;
  driver?: string;
  plate?: string;
};

const VEHICLES: { id: VehicleType; label: string; desc: string; basePrice: number; etaMin: number; icon: typeof Car }[] = [
  { id: 'ambulance', label: 'Ambulance médicalisée', desc: 'Urgence avec personnel & matériel médical', basePrice: 25000, etaMin: 8, icon: Ambulance },
  { id: 'vsl', label: 'VSL (Véhicule Sanitaire Léger)', desc: 'Transport assis pour patients non urgents', basePrice: 8000, etaMin: 15, icon: Car },
  { id: 'taxi-sante', label: 'Taxi-santé partagé', desc: 'Course mutualisée vers un centre de soin', basePrice: 2500, etaMin: 12, icon: Users }
];

const REASONS = ['Consultation programmée', 'Sortie d\'hospitalisation', 'Examen / laboratoire', 'Dialyse / chimiothérapie', 'Urgence non vitale', 'Autre'];

const STORAGE = 'healthy-page:mobilite';
const loadRides = (): Ride[] => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } };
const saveRides = (r: Ride[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(r)); } catch {} };

export default function MobiliteSanteScreen({ onBack }: Props) {
  const [vehicle, setVehicle] = useState<VehicleType>('vsl');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [passengers, setPassengers] = useState(1);
  const [distanceKm, setDistanceKm] = useState(8);
  const [rides, setRides] = useState<Ride[]>(() => loadRides());
  const [active, setActive] = useState<Ride | null>(null);

  useEffect(() => { saveRides(rides); }, [rides]);

  const cfg = VEHICLES.find((v) => v.id === vehicle)!;
  const estimated = useMemo(() => Math.round(cfg.basePrice + distanceKm * 350), [cfg, distanceKm]);

  const submit = () => {
    if (!pickup.trim() || !destination.trim()) return;
    const ride: Ride = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      vehicle, pickup, destination, reason, passengers,
      status: 'demandée',
      eta: cfg.etaMin,
      price: estimated,
      driver: 'Conducteur partenaire',
      plate: 'BJ-' + Math.floor(1000 + Math.random() * 9000) + '-RB'
    };
    setRides((r) => [ride, ...r]);
    setActive(ride);
    setPickup(''); setDestination('');
    setTimeout(() => setRides((r) => r.map((x) => x.id === ride.id ? { ...x, status: 'en route' } : x)), 3000);
  };

  const cancel = (id: string) => setRides((r) => r.filter((x) => x.id !== id));

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=1080" alt="Ambulance" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Ambulance className="w-5 h-5" /> Mobilité sanitaire
          </div>
          <h2 className="text-2xl font-bold mt-1">Transport santé à la demande</h2>
          <p className="text-sm text-white/85 mt-1">Ambulance · VSL · Taxi-santé partagé</p>
        </div>
      </div>

      {active && active.status !== 'terminée' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs opacity-90 mb-2">
            <Navigation className="w-4 h-4" /> Course en cours
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{VEHICLES.find((v) => v.id === active.vehicle)?.label}</p>
              <p className="text-xs text-white/85 truncate">{active.pickup} → {active.destination}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> ETA {active.eta} min
                </span>
                <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full">
                  {active.plate}
                </span>
              </div>
            </div>
            {hasContact(CONTACTS.supportPhone) && (
              <a href={telHref(CONTACTS.supportPhone)} className="bg-white text-teal-700 rounded-full p-2.5 shadow hover:shadow-md" aria-label="Appeler le conducteur">
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] uppercase tracking-wide">
            {(['demandée', 'en route', 'à bord', 'terminée'] as RideStatus[]).map((s, i) => {
              const idx = (['demandée', 'en route', 'à bord', 'terminée'] as RideStatus[]).indexOf(active.status);
              const done = i <= idx;
              return (
                <div key={s} className={`h-1.5 rounded-full ${done ? 'bg-white' : 'bg-white/30'}`} />
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-2">Type de véhicule</p>
          <div className="space-y-2">
            {VEHICLES.map((v) => {
              const Icon = v.icon;
              const active = vehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setVehicle(v.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                    active ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-teal-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-slate-100">{v.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{v.desc}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />~{v.etaMin} min</span>
                      <span>dès {v.basePrice.toLocaleString('fr-FR')} F CFA</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Lieu de prise en charge</span>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Adresse, quartier ou centre"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Destination</span>
            <div className="relative mt-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Hôpital, clinique, laboratoire…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Motif</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Passagers</span>
              <input type="number" min={1} max={6} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-300 flex justify-between">
              <span>Distance estimée</span>
              <span className="text-teal-700 dark:text-teal-300 font-semibold">{distanceKm} km</span>
            </span>
            <input type="range" min={1} max={60} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="w-full accent-teal-600 mt-2" />
          </label>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">Estimation</p>
            <p className="text-lg font-bold text-teal-900 dark:text-teal-100">{estimated.toLocaleString('fr-FR')} F CFA</p>
          </div>
          <div className="text-right text-xs text-teal-700 dark:text-teal-300">
            <p>ETA ~{cfg.etaMin} min</p>
            <p className="opacity-75">tarif partenaire</p>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!pickup.trim() || !destination.trim()}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Ambulance className="w-5 h-5" /> Demander un transport
        </button>

        <div className="text-xs text-gray-500 dark:text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
          En cas d'urgence vitale (perte de conscience, hémorragie, douleur thoracique), composez directement le 166 (SAMU Bénin).
        </div>
      </div>

      {rides.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Mes courses</h3>
          <ul className="space-y-2">
            {rides.map((r) => {
              const v = VEHICLES.find((x) => x.id === r.vehicle)!;
              const Icon = v.icon;
              const statusColor = r.status === 'terminée'
                ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200';
              return (
                <li key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{v.label}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${statusColor}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{r.pickup} → {r.destination}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{new Date(r.date).toLocaleString('fr-FR')} · {r.price.toLocaleString('fr-FR')} F CFA</p>
                  </div>
                  <button onClick={() => cancel(r.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-1">
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> Engagements
        </div>
        Conducteurs formés aux gestes de premiers secours · véhicules désinfectés entre chaque course · tarification transparente affichée avant validation.
      </div>
    </div>
  );
}
