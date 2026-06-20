import { useNavigate } from 'react-router';
import { Phone, ArrowRight, Sparkles, Scale, Clock, Shield, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';
import { DOMAINS, HOTLINES, CENTERS } from '../data';

export default function AccueilScreen() {
  const navigate = useNavigate();
  const featured = DOMAINS.slice(0, 3);
  const popular = DOMAINS.slice(0, 6);
  const nearby = CENTERS.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[54vh] min-h-[420px] overflow-hidden">
        <ImageWithFallback src={LEGAL.scaleEagle} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700/65 via-stone-900/75 to-blue-950/90" />
        <div className="absolute inset-0 px-5 pb-7 flex flex-col justify-end text-white">
          <p className="inline-flex items-center gap-2 self-start text-xs text-white/90 font-medium uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Assistance juridique gratuite
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            Tes droits.<br />Expliqués simplement.
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-md">Information juridique, mise en relation avec un avocat partenaire et orientation vers la Maison de la Justice.</p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => navigate('/assistance-juridique/domaines')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-stone-900 font-semibold hover:bg-amber-50"
            >
              Décrire ma situation <ArrowRight className="w-4 h-4" />
            </button>
            <a href="tel:7028" className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white/15 backdrop-blur border border-white/30 text-white text-sm font-semibold">
              <Phone className="w-4 h-4" /> 7028
            </a>
          </div>
        </div>
      </section>

      {/* Hotlines */}
      <Section title="Numéros utiles" subtitle="Gratuits depuis tout opérateur béninois.">
        <div className="grid grid-cols-3 gap-2">
          {HOTLINES.map((h) => (
            <a key={h.id} href={`tel:${h.number}`} className={`relative rounded-3xl overflow-hidden p-3 text-white bg-gradient-to-br ${h.tone}`}>
              <Phone className="w-4 h-4 opacity-80" />
              <div className="text-2xl font-bold tracking-tight mt-2">{h.number}</div>
              <div className="text-[10px] font-semibold mt-1 opacity-90">{h.label}</div>
            </a>
          ))}
        </div>
      </Section>

      {/* À la une */}
      <Section title="À la une" subtitle="Les sujets les plus consultés cette semaine.">
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 snap-x scroll-smooth pb-1">
          {featured.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/assistance-juridique/domaine/${d.id}`)}
              className="flex-shrink-0 snap-start w-64 rounded-3xl overflow-hidden text-left relative h-72 shadow-md group"
            >
              <ImageWithFallback src={LEGAL[d.hero]} alt={d.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} opacity-65 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/15 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-white/95 text-stone-900 text-[11px] font-semibold inline-flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Guide
                </span>
                <span className="bg-white/90 rounded-lg p-1.5 shadow"><d.icon className="w-5 h-5 text-stone-800" strokeWidth={1.75} /></span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[11px] text-white/80">{d.tagline}</div>
                <div className="text-xl font-bold leading-tight tracking-tight mt-0.5">{d.label}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs">
                  Consulter <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Domaines populaires */}
      <Section title="Domaines populaires" subtitle="Choisis le sujet qui te concerne.">
        <div className="grid grid-cols-2 gap-3">
          {popular.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/assistance-juridique/domaine/${d.id}`)}
              className="rounded-2xl overflow-hidden bg-white border border-stone-100 text-left hover:shadow-md transition"
            >
              <div className="relative h-28">
                <ImageWithFallback src={LEGAL[d.cover]} alt={d.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} opacity-55 mix-blend-multiply`} />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold inline-flex items-center gap-1">
                  <d.icon className="w-3 h-3 text-stone-800" strokeWidth={2} /> {d.label}
                </div>
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-sm text-stone-900 truncate">{d.tagline}</div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">{d.topics.length} sujets · {d.laws.length} textes</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Centres proches */}
      <Section title="Centres près de toi" subtitle="Maisons de la Justice et cliniques juridiques.">
        <div className="space-y-3">
          {nearby.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/assistance-juridique/centre/${c.id}`)}
              className="w-full flex bg-white rounded-3xl border border-stone-100 overflow-hidden text-left shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-28 h-28 flex-shrink-0">
                <ImageWithFallback src={LEGAL[c.image]} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-stone-900/30 to-stone-900/10" />
              </div>
              <div className="flex-1 p-3.5">
                {c.free && <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">GRATUIT</div>}
                <div className="font-bold text-stone-900 text-sm mt-1 leading-tight">{c.name}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><MapPin className="w-3 h-3" /> {c.city}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-600">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {c.hours}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Confidentiel */}
      <section className="px-5 mt-8">
        <div className="relative rounded-3xl overflow-hidden p-5 text-white">
          <ImageWithFallback src={LEGAL.signingDoc} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-stone-950/90" />
          <div className="relative">
            <Shield className="w-7 h-7 text-amber-300" />
            <div className="font-bold tracking-tight mt-2 text-lg">100% confidentiel</div>
            <p className="text-sm text-white/85 mt-1">Tes échanges sont chiffrés. Aucune donnée n'est partagée sans ton accord.</p>
          </div>
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 px-5">
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
