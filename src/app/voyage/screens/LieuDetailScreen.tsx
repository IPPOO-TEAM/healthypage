import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Heart, Share2, Star, MapPin, Wind, Wifi, Coffee, Utensils,
  Sparkles, Trees, Bath, Bed, Calendar, ChevronRight,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';
import { BookingCalendar } from '../../components/BookingCalendar';
import { usePatientPreferences } from '../../components/useStoredState';

export default function LieuDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lieu = useMemo(() => LIEUX.find((l) => l.id === id) ?? LIEUX[0], [id]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { isSejourFavorite, toggleSejourFavorite, update } = usePatientPreferences();
  const fav = isSejourFavorite(lieu.id);
  const allImages = [lieu.hero, ...lieu.gallery];

  return (
    <div className="bg-white">
      {/* Galerie swipe — glass + halo */}
      <div className="relative h-72 overflow-hidden">
        <ImageWithFallback src={AFR[allImages[activeImg]]} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        {/* halos colorés */}
        <div aria-hidden className="pointer-events-none absolute -top-16 -left-10 w-64 h-64 rounded-full bg-rose-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="Retour" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button aria-label="Partager" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => toggleSejourFavorite(lieu.id)} aria-label="Favori" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow">
              <Heart className={`w-4 h-4 ${fav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/80 backdrop-blur-xl border border-white/60 text-rose-600 shadow">Coup de cœur</span>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px]">
          {activeImg + 1} / {allImages.length}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-3 bg-stone-50 border-b border-stone-100">
        {allImages.map((k, i) => (
          <button
            key={k}
            onClick={() => setActiveImg(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
              i === activeImg ? 'border-rose-500' : 'border-transparent'
            }`}
          >
            <ImageWithFallback src={AFR[k]} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Résumé */}
      <section className="px-6 sm:px-8 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <MapPin className="w-3 h-3" /> {lieu.region}, {lieu.country}
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">{lieu.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {lieu.rating} ({lieu.reviews})
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Wind className="w-4 h-4" /> Calme {lieu.calmLevel}/5
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-stone-900">{lieu.pricePerNight.toLocaleString('fr-FR')}</div>
            <div className="text-[11px] text-stone-500">FCFA / nuit</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lieu.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{t}</span>
          ))}
        </div>
      </section>

      {/* Ce que vous allez ressentir */}
      <Block title="Ce que vous allez ressentir">
        <p className="text-stone-700 leading-relaxed text-[15px]">{lieu.feel}</p>
      </Block>

      {/* Points clés */}
      <Block title="Points clés">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <KeyPoint Icon={Bed} label="Sommeil profond" />
          <KeyPoint Icon={Wind} label="Air pur" />
          <KeyPoint Icon={Trees} label="Nature proche" />
          <KeyPoint Icon={Bath} label="Soins inclus" />
        </div>
      </Block>

      {/* Équipements */}
      <Block title="Équipements">
        <div className="flex flex-wrap gap-2">
          {[
            { Icon: Wifi, label: 'Wifi haut débit' },
            { Icon: Bath, label: 'Spa & hammam' },
            { Icon: Trees, label: 'Jardin' },
            { Icon: Coffee, label: 'Petit-déj inclus' },
            { Icon: Utensils, label: 'Cuisine bien-être' },
            { Icon: Sparkles, label: 'Yoga matinal' },
          ].map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs">
              <Icon className="w-3.5 h-3.5" /> {label}
            </span>
          ))}
        </div>
      </Block>

      {/* À faire autour */}
      <Block title="À faire autour">
        <ul className="space-y-2 text-sm text-stone-700">
          <li className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span>Marche méditative au lever du soleil</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </li>
          <li className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span>Excursion pirogue dans les bolongs</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </li>
          <li className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span>Atelier cuisine locale équilibrée</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </li>
          <li className="flex items-center justify-between">
            <span>Visite culturelle guidée</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </li>
        </ul>
      </Block>

      {/* Avis */}
      <section className="px-6 sm:px-8 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-stone-900">Avis voyageurs</h2>
          <button onClick={() => navigate(`/voyage-loisirs/avis/${lieu.id}`)} className="text-xs font-semibold text-rose-600">
            Tout voir →
          </button>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-stone-900">{lieu.rating}</div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(lieu.rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
              ))}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">{lieu.reviews} avis vérifiés · Excellent</div>
          </div>
          <button
            onClick={() => navigate(`/voyage-loisirs/avis/${lieu.id}?write=1`)}
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold"
          >
            Écrire un avis
          </button>
        </div>
      </section>

      {/* Aperçu disponibilités */}
      <section className="px-6 sm:px-8 mt-8">
        <h2 className="text-base font-bold text-stone-900 mb-3">Disponibilités</h2>
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold inline-flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" /> {showCalendar ? 'Masquer le calendrier' : 'Voir les nuits disponibles'}
        </button>
        {showCalendar && (
          <div className="mt-3">
            <BookingCalendar
              blockedDates={['2026-05-12', '2026-05-13', '2026-05-22']}
              pricePerNight={lieu.pricePerNight}
              onConfirm={(d) => {
                update({ preferredDestination: lieu.region });
                navigate(`/voyage-loisirs/reservation/${lieu.id}?start=${d.startISO}&end=${d.endISO}`);
              }}
            />
          </div>
        )}
      </section>

      <div className="h-24" />

      {/* CTA fixe */}
      <div className="fixed bottom-[4.5rem] inset-x-0 z-20 bg-white border-t border-stone-200 px-4 py-3 flex items-center gap-2">
        <button onClick={() => toggleSejourFavorite(lieu.id)} aria-label="Favori" className="w-12 h-12 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-center">
          <Heart className={`w-5 h-5 ${fav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
        </button>
        <button
          onClick={() => navigate(`/voyage-loisirs/messages/${lieu.id}`)}
          className="hidden sm:inline-flex h-12 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 items-center gap-2 text-sm font-medium text-stone-700"
        >
          Contacter
        </button>
        <button
          onClick={() => navigate(`/voyage-loisirs/reservation/${lieu.id}`)}
          className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-rose-500/30"
        >
          Réserver — {lieu.pricePerNight.toLocaleString('fr-FR')} FCFA / nuit
        </button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-6 sm:px-8 mt-7">
      <h2 className="text-base font-bold text-stone-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function KeyPoint({ Icon, label }: { Icon: any; label: string }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex flex-col items-start gap-2">
      <Icon className="w-4 h-4 text-emerald-600" />
      <div className="text-xs font-medium text-stone-700">{label}</div>
    </div>
  );
}
