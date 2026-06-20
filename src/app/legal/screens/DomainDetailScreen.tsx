import { useNavigate, useParams } from 'react-router';
import { ArrowRight, BookOpen, CheckCircle2, Phone, MessageSquare, Scale, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';
import { DOMAINS, CENTERS } from '../data';

export default function DomainDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dom = DOMAINS.find((d) => d.id === id);
  if (!dom) return <div className="p-8 text-center text-stone-500">Domaine introuvable.</div>;

  const recommended = CENTERS.slice(0, 3);

  return (
    <div className="pb-10">
      <section className="relative h-72 overflow-hidden">
        <ImageWithFallback src={LEGAL[dom.hero]} alt={dom.label} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br ${dom.accent} opacity-65 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
        <div className="absolute inset-0 px-5 pb-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur inline-flex items-center gap-1">
              <dom.icon className="w-3.5 h-3.5" strokeWidth={2} /> Guide juridique
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{dom.label}</h1>
          <p className="text-sm text-white/85 mt-1">{dom.tagline}</p>
        </div>
      </section>

      <section className="px-5 mt-5">
        <p className="text-sm text-stone-700 leading-relaxed">{dom.desc}</p>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold text-stone-900">Sujets traités</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {dom.topics.map((t) => (
            <div key={t} className="bg-white rounded-2xl border border-stone-100 px-3 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="text-xs font-medium text-stone-800">{t}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold text-stone-900">Textes de référence</h2>
        <div className="mt-3 bg-white rounded-3xl border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {dom.laws.map((law) => (
            <div key={law} className="flex items-start gap-3 px-4 py-3">
              <BookOpen className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-stone-800">{law}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold text-stone-900">Centres recommandés</h2>
        <div className="mt-3 space-y-2">
          {recommended.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/assistance-juridique/centre/${c.id}`)}
              className="w-full flex bg-white rounded-2xl border border-stone-100 overflow-hidden text-left"
            >
              <div className="relative w-20 h-20 flex-shrink-0">
                <ImageWithFallback src={LEGAL[c.image]} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-3">
                <div className="font-semibold text-sm text-stone-900 leading-tight">{c.name}</div>
                <div className="mt-1 text-[11px] text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}</div>
                {c.free && <div className="mt-1 inline-flex text-[10px] font-bold text-emerald-700">GRATUIT</div>}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <div className="rounded-3xl bg-stone-900 text-white p-5">
          <Scale className="w-7 h-7 text-amber-300" />
          <div className="font-bold tracking-tight mt-2 text-lg">Besoin d'aide sur ce domaine ?</div>
          <p className="text-sm text-white/80 mt-1">Décris ta situation, on te recontacte sous 24h avec un plan d'action.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-stone-900 text-sm font-semibold">
              <MessageSquare className="w-4 h-4" /> Décrire ma situation
            </button>
            <a href="tel:7028" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/30 text-sm font-semibold">
              <Phone className="w-4 h-4" /> 7028
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
