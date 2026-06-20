import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Languages, CreditCard, FileCheck, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { GUIDES } from '../voyageContent';

export default function GuideDetailScreen() {
  const { country } = useParams();
  const navigate = useNavigate();
  const guide = GUIDES.find((g) => g.country === decodeURIComponent(country ?? ''));
  if (!guide) {
    return (
      <div className="p-6 text-center text-stone-500">
        Guide introuvable.
        <div className="mt-3"><button onClick={() => navigate('/voyage-loisirs/guides')} className="text-rose-600 font-semibold">Retour aux guides</button></div>
      </div>
    );
  }

  const facts = [
    { Icon: MapPin, label: 'Capitale', value: guide.capital },
    { Icon: Calendar, label: 'Meilleure saison', value: guide.bestSeason },
    { Icon: Languages, label: 'Langues', value: guide.language },
    { Icon: CreditCard, label: 'Monnaie', value: guide.currency },
    { Icon: FileCheck, label: 'Visa', value: guide.visa },
  ];

  return (
    <div>
      <section className="relative h-72 overflow-hidden">
        <ImageWithFallback src={AFR[guide.hero]} alt={guide.country} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-6 left-5 right-5 text-white">
          <div className="text-3xl">{guide.flag}</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{guide.country}</h1>
          <p className="mt-2 text-sm text-white/85 max-w-md">{guide.intro}</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 pt-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {facts.map((f) => (
            <div key={f.label} className="bg-white border border-stone-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-stone-500 text-[11px] uppercase tracking-wider">
                <f.Icon className="w-3.5 h-3.5" /> {f.label}
              </div>
              <div className="mt-1 text-sm font-medium text-stone-800">{f.value}</div>
            </div>
          ))}
        </div>

        <section className="mt-7">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 mb-3 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Incontournables
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.highlights.map((h) => (
              <span key={h} className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                {h}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-7 space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 mb-1">Conseils pratiques</h2>
          {guide.tips.map((t) => (
            <article key={t.title} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="font-semibold text-sm text-stone-900">{t.title}</div>
              <p className="mt-1 text-sm text-stone-600 leading-relaxed">{t.body}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
