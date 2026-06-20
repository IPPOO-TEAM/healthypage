import { useMemo, useState } from 'react';
import { ArrowLeft, Search, Stethoscope, Star, MapPin, Clock, Languages, ChevronRight, X, Phone, BadgeCheck, Calendar, Heart, Video, MessageSquare, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { DOCTORS, CATEGORIES, type Doctor } from '../components/doctors';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface Props {
  onBack: () => void;
  onBook?: (doctor: Doctor) => void;
  initialQuery?: string;
}

export default function MedecinsScreen({ onBack, onBook, initialQuery }: Props) {
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingInfo, setBookingInfo] = useState<string | null>(null);

  const handleBook = async (doctor: Doctor, dateLabel: string, time: string) => {
    const pid = getPatientId();
    setBookingError(null);
    if (!pid) {
      setBookingError('Connectez-vous pour réserver. Mode démo : RDV non persisté.');
      onBook?.(doctor);
      return;
    }
    try {
      await api.createRdv(pid, {
        doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialty,
        date: dateLabel,
        time,
        location: `${doctor.centerName} · ${doctor.city}`,
        type: 'cabinet',
        status: 'upcoming',
        phone: doctor.phone,
        proId: doctor.id
      });
      setBookingInfo(`RDV demandé chez Dr. ${doctor.lastName} le ${dateLabel} à ${time}`);
      setTimeout(() => { setBookingInfo(null); onBook?.(doctor); }, 1100);
    } catch (e: any) {
      setBookingError(e?.message ?? 'Réservation impossible.');
    }
  };

  const [query, setQuery] = useState(initialQuery ?? '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selected, setSelected] = useState<Doctor | null>(null);

  const cities = useMemo(() => Array.from(new Set(DOCTORS.map((d) => d.city))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DOCTORS.filter((d) => {
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (selectedCity !== 'all' && d.city !== selectedCity) return false;
      if (!q) return true;
      return (
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.centerName.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory, selectedCity]);

  const grouped = useMemo(() => {
    const groups: Record<string, Doctor[]> = {};
    filtered.forEach((d) => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {bookingError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-2 rounded-xl flex items-center justify-between">
          <span>{bookingError}</span>
          <button onClick={() => setBookingError(null)} className="text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {bookingInfo && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-2 rounded-xl">
          {bookingInfo}
        </div>
      )}
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 p-5">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-emerald-300/40 blur-2xl" />
        <div className="relative flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-800 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/80 uppercase">Healthy · Médecins</span>
          <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-emerald-700 shadow-sm">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <div className="relative">
          <h2 className="text-[26px] leading-tight text-slate-900">Connectez-vous à des médecins de confiance</h2>
          <p className="text-sm text-slate-700/80 mt-2">{DOCTORS.length} professionnels vérifiés, classés par spécialité et ville.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="bg-white/80 backdrop-blur text-slate-800 text-xs px-3 py-1.5 rounded-full shadow-sm inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponibles aujourd'hui
            </div>
            <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
              Téléconsultation possible
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un médecin, spécialité, centre..."
          className="flex-1 bg-transparent outline-none text-sm py-2"
        />
        {query && <button onClick={() => setQuery('')} className="text-xs text-gray-500 px-2">Effacer</button>}
      </div>

      {!query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mt-2 px-1">
          <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
          {['Cardiologie', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Cotonou', 'Porto-Novo', 'Dr. Hounkpatin'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Catégorie</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            <CategoryChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
              Toutes ({DOCTORS.length})
            </CategoryChip>
            {CATEGORIES.map((c) => {
              const count = DOCTORS.filter((d) => d.category === c.id).length;
              if (count === 0) return null;
              return (
                <CategoryChip key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)}>
                  {c.label} ({count})
                </CategoryChip>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Ville</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            <CategoryChip active={selectedCity === 'all'} onClick={() => setSelectedCity('all')}>
              Toutes
            </CategoryChip>
            {cities.map((city) => (
              <CategoryChip key={city} active={selectedCity === city} onClick={() => setSelectedCity(city)}>
                {city}
              </CategoryChip>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => {
          const docs = grouped[cat.id];
          if (!docs || docs.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                <span className="text-xs text-gray-500">{docs.length} médecin{docs.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {docs.map((d) => (
                  <DoctorCard key={d.id} doctor={d} onClick={() => setSelected(d)} />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">Aucun médecin ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DoctorSheet doctor={selected} onClose={() => setSelected(null)} onBook={(dateLabel, time) => { handleBook(selected, dateLabel, time); setSelected(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-teal-600 text-white border-teal-600'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function DoctorCard({ doctor, onClick }: { doctor: Doctor; onClick: () => void }) {
  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-3 shadow-sm hover:shadow-md text-left flex items-center gap-3 border border-gray-100"
    >
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
        <ImageWithFallback src={doctor.photo} alt="" className="w-full h-full object-cover" />
        {doctor.available && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-gray-900 truncate">Dr. {doctor.firstName} {doctor.lastName}</h4>
          {doctor.acceptsInsurance && <BadgeCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />}
        </div>
        <p className="text-xs text-teal-700 font-medium">{doctor.specialty}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {doctor.rating} <span className="text-gray-400">({doctor.reviews})</span></span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doctor.city}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{doctor.centerName}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </motion.button>
  );
}

function DoctorSheet({ doctor, onClose, onBook }: { doctor: Doctor; onClose: () => void; onBook: (dateLabel: string, time: string) => void }) {
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day: d.getDate(),
      weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      month: d.toLocaleDateString('fr-FR', { month: 'long' })
    };
  });
  const [selectedDay, setSelectedDay] = useState(2);
  const slots = ['7:30', '8:00', '8:30', '9:00', '9:30', '10:00'];
  const [selectedSlot, setSelectedSlot] = useState(2);
  const [liked, setLiked] = useState(false);
  const patients = (doctor.reviews * 1.4).toFixed(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-50 rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <div className="relative h-72 overflow-hidden rounded-t-3xl bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50">
          <ImageWithFallback src={doctor.photo} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <button onClick={() => setLiked(l => !l)} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
            </button>
          </div>
          <div className="absolute bottom-6 left-5">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs text-slate-800 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {doctor.rating}
            </span>
          </div>
        </div>

        <div className="px-5 -mt-2 pb-32">
          <h2 className="text-3xl text-slate-900 leading-tight">Dr. {doctor.firstName}</h2>
          <h2 className="text-3xl text-slate-900 leading-tight">{doctor.lastName}</h2>
          <p className="text-sm text-slate-500 mt-1">MBBS, MD</p>
          <p className="text-sm text-slate-500">{doctor.specialty}</p>

          <div className="flex items-center gap-2 mt-4">
            <button className="px-3 py-2 rounded-full bg-sky-100 text-sky-900 text-xs flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5" /> Détails
            </button>
            <a href={`tel:${doctor.phone.replace(/\s/g, '')}`} className="ml-auto w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Phone className="w-4 h-4 text-slate-700" />
            </a>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Video className="w-4 h-4 text-slate-700" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-3 grid grid-cols-3 divide-x divide-slate-100">
            <Stat icon={Award} value={`${doctor.yearsExperience} ans`} label="Expérience" />
            <Stat icon={Users} value={`${patients}k+`} label="Patients" />
            <Stat icon={Star} value={`${(doctor.reviews / 1000).toFixed(1)}k+`} label="Avis" />
          </div>

          <div className="mt-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Sélectionner la date</span>
              <span className="text-sm text-slate-700 capitalize flex items-center gap-1">
                {days[selectedDay]?.month} <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {days.map((d, i) => {
                const active = i === selectedDay;
                return (
                  <button key={i} onClick={() => setSelectedDay(i)}
                    className={`min-w-[60px] py-2.5 px-3 rounded-2xl text-center transition ${active ? 'bg-sky-200 text-slate-900' : 'bg-slate-50 text-slate-600'}`}>
                    <div className="text-base">{d.day}</div>
                    <div className="text-[10px] capitalize opacity-80">{d.weekday}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <span className="text-sm text-slate-500">Sélectionner l'heure</span>
              <div className="mt-3 flex items-end justify-between gap-1 h-14">
                {slots.map((s, i) => {
                  const active = i === selectedSlot;
                  const height = 30 + (i % 3) * 18 + (active ? 12 : 0);
                  return (
                    <button key={s} onClick={() => setSelectedSlot(i)} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full rounded-full ${active ? 'bg-sky-500' : 'bg-slate-200'}`} style={{ height: `${height}%` }} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                {slots.map((s, i) => (
                  <span key={s} className={i === selectedSlot ? 'text-sky-600' : ''}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{doctor.centerName} · {doctor.city}</span>
            <span>{doctor.consultationFee.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <button onClick={() => onBook(`${days[selectedDay].weekday} ${days[selectedDay].day} ${days[selectedDay].month}`, slots[selectedSlot])} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl text-sm tracking-wide shadow-lg">
            Prendre rendez-vous
          </button>
        </div>
      </motion.div>
    </>
  );
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-2">
      <Icon className="w-4 h-4 text-sky-600 mb-1" />
      <div className="text-sm text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 border ${highlight ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <p className={`text-sm font-medium ${highlight ? 'text-teal-800' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
