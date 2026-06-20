import { useNavigate } from 'react-router';
import { ArrowLeft, Star, Users, MessageCircle, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { TESTIMONIALS } from '../voyageContent';

export default function CommunauteScreen() {
  const navigate = useNavigate();
  const stats = [
    { Icon: Users, value: '12 480', label: 'voyageurs' },
    { Icon: Heart, value: '4,9 / 5', label: 'satisfaction' },
    { Icon: MessageCircle, value: '3 100', label: 'avis publiés' },
  ];

  return (
    <div>
      <section className="relative h-52 overflow-hidden">
        <ImageWithFallback src={AFR.expYogaCircle} alt="Communauté" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/65" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium uppercase tracking-[0.18em]">
            <Users className="w-3.5 h-3.5 text-amber-200" /> Communauté
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Une famille de voyageurs.</h1>
          <p className="mt-1 text-sm text-white/80 max-w-md">Récits, conseils, rencontres : ce qu’ils ont vécu peut inspirer votre prochain départ.</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 mt-5">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-stone-200 text-center">
              <s.Icon className="w-4 h-4 text-rose-500 mx-auto" />
              <div className="mt-1 font-bold text-stone-900 text-sm">{s.value}</div>
              <div className="text-[11px] text-stone-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="px-6 sm:px-8 mt-7">
        <h2 className="text-lg font-bold tracking-tight text-stone-900 mb-3">Ils racontent</h2>
        <div className="space-y-4 pb-10">
          {TESTIMONIALS.map((t) => (
            <article key={t.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3">
              <ImageWithFallback src={AFR[t.avatar]} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-rose-100" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-900 text-sm">{t.name}, {t.age} ans</div>
                    <div className="text-[11px] text-stone-500">{t.city} · {t.lieu}</div>
                  </div>
                  <div className="inline-flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-stone-700 italic leading-relaxed">« {t.quote} »</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
