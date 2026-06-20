import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Globe2, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { GUIDES } from '../voyageContent';

export default function GuidesScreen() {
  const navigate = useNavigate();
  return (
    <div>
      <section className="relative h-52 overflow-hidden">
        <ImageWithFallback src={AFR.indigoWall} alt="Guides" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/65" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium uppercase tracking-[0.18em]">
            <BookOpen className="w-3.5 h-3.5 text-amber-200" /> Guides pays
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Préparez votre départ.</h1>
          <p className="mt-1 text-sm text-white/80 max-w-md">Visa, climat, étiquette, santé : l’essentiel pour partir l’esprit léger.</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        {GUIDES.map((g) => (
          <button
            key={g.country}
            onClick={() => navigate(`/voyage-loisirs/guide/${encodeURIComponent(g.country)}`)}
            className="text-left bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100 hover:shadow-lg transition group"
          >
            <div className="relative h-44">
              <ImageWithFallback src={AFR[g.hero]} alt={g.country} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                <div>
                  <div className="text-2xl">{g.flag}</div>
                  <div className="font-bold text-lg leading-tight">{g.country}</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-stone-700 font-semibold inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {g.capital}
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-stone-600 line-clamp-2">{g.intro}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                <span className="inline-flex items-center gap-1"><Globe2 className="w-3 h-3" /> {g.bestSeason}</span>
                <span>{g.currency}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
