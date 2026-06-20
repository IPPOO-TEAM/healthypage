import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Stethoscope, Star, MapPin, ChevronRight, Filter, BadgeCheck, Loader2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';

interface Props {
  onBack: () => void;
  onSelectPro?: (proId: string) => void;
  initialSpecialty?: string;
}

interface ProRow {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  city?: string;
  ville?: string;
  photo?: string;
  tarif?: number | string;
  licence?: string;
  type?: string;
  activity?: string;
  avgRating?: number;
  reviewCount?: number;
  freeSlotsCount?: number;
}

const proLabel = (p: ProRow) => p.name?.trim() || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Praticien';
const cityOf = (p: ProRow) => p.city ?? p.ville ?? '';

export default function AnnuaireProsScreen({ onBack, onSelectPro, initialSpecialty }: Props) {
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState(initialSpecialty ?? '');
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [hasFreeSlots, setHasFreeSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pros, setPros] = useState<ProRow[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchPros = () => {
    setLoading(true);
    api.searchPros({ q, specialty, city, minRating: minRating || undefined, hasFreeSlots })
      .then((list) => setPros((list ?? []) as ProRow[]))
      .catch(() => setPros([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchPros, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, specialty, city, minRating, hasFreeSlots]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    pros.forEach((p) => { const c = cityOf(p); if (c) set.add(c); });
    return Array.from(set).sort();
  }, [pros]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    pros.forEach((p) => { if (p.specialty) set.add(p.specialty); });
    return Array.from(set).sort();
  }, [pros]);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <h2 className="text-2xl font-bold">Annuaire des praticiens</h2>
        <p className="text-sm text-white/80">Trouvez et réservez avec un professionnel vérifié</p>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, spécialité, ville…"
            className="w-full pl-9 pr-3 py-3 bg-white/15 placeholder-white/70 text-white rounded-2xl outline-none focus:bg-white/25 text-sm backdrop-blur"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur"
          >
            <Filter className="w-3.5 h-3.5" /> Filtres
          </button>
          <button
            onClick={() => setHasFreeSlots((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur ${hasFreeSlots ? 'bg-white text-emerald-700' : 'bg-white/15 hover:bg-white/25'}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Dispos cette semaine
          </button>
          {minRating > 0 && (
            <button
              onClick={() => setMinRating(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-amber-700 text-xs font-semibold"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500" /> {minRating}+ ✕
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1.5">Spécialité</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSpecialty('')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!specialty ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Toutes</button>
              {specialties.map((s) => (
                <button key={s} onClick={() => setSpecialty(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${specialty === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{s}</button>
              ))}
            </div>
          </div>
          {cities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1.5">Ville</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setCity('')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!city ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Toutes</button>
                {cities.map((c) => (
                  <button key={c} onClick={() => setCity(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${city === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1.5">Note minimale</p>
            <div className="flex gap-1.5">
              {[0, 3, 4, 4.5].map((n) => (
                <button key={n} onClick={() => setMinRating(n)} className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${minRating === n ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {n === 0 ? 'Toutes' : <><Star className="w-3 h-3 fill-current" /> {n}+</>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Recherche…
        </div>
      )}

      {!loading && pros.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-700">Aucun praticien ne correspond à votre recherche.</p>
          <p className="text-xs text-slate-500 mt-1">Essayez d'élargir les filtres.</p>
        </div>
      )}

      <div className="space-y-3">
        {pros.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.2) }}
            onClick={() => onSelectPro?.(p.id)}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-50/30 transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <Stethoscope className="w-6 h-6 text-emerald-700" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-900 truncate">{proLabel(p)}</p>
                {p.licence && <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </div>
              <p className="text-sm text-slate-600 truncate">{p.specialty ?? '—'}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                {cityOf(p) && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {cityOf(p)}</span>}
                {(p.avgRating ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" /> {p.avgRating!.toFixed(1)}
                    <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                  </span>
                )}
                {(p.freeSlotsCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <Calendar className="w-3 h-3" /> {p.freeSlotsCount} dispo
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
