import { useParams } from 'react-router';
import { Phone, MapPin, Clock, Landmark, CheckCircle2, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';
import { CENTERS } from '../data';

const TYPE_LABEL: Record<string, string> = {
  maison: 'Maison de la Justice',
  cabinet: 'Cabinet d\'avocats',
  tribunal: 'Tribunal',
  clinique: 'Clinique juridique',
};

export default function CentreDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const c = CENTERS.find((x) => x.id === id);
  if (!c) return <div className="p-8 text-center text-stone-500">Centre introuvable.</div>;

  return (
    <div className="pb-10">
      <section className="relative h-72 overflow-hidden">
        <ImageWithFallback src={LEGAL[c.image]} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
        <div className="absolute inset-0 px-5 pb-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur inline-flex items-center gap-1 text-xs font-semibold">
              <Landmark className="w-3 h-3" /> {TYPE_LABEL[c.type]}
            </span>
            {c.free && <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold">GRATUIT</span>}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight leading-tight">{c.name}</h1>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-3">
        <Row Icon={MapPin} label="Adresse" value={`${c.city} · ${c.dept}`} />
        <Row Icon={Clock} label="Horaires" value={c.hours} />
        <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="block">
          <Row Icon={Phone} label="Téléphone" value={c.phone} action />
        </a>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold text-stone-900">Services proposés</h2>
        <div className="mt-3 bg-white rounded-3xl border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {[
            'Information juridique',
            'Médiation et conciliation',
            'Aide à la rédaction de courriers',
            'Orientation vers un avocat',
            'Accompagnement aux audiences',
          ].map((s) => (
            <div key={s} className="flex items-center gap-3 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="text-sm text-stone-800">{s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <a
          href={`tel:${c.phone.replace(/\s+/g, '')}`}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-600 text-white font-semibold text-sm"
        >
          <Phone className="w-4 h-4" /> Appeler le centre <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}

function Row({ Icon, label, value, action }: { Icon: any; label: string; value: string; action?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] text-stone-500">{label}</div>
        <div className={`text-sm font-semibold ${action ? 'text-amber-700' : 'text-stone-900'}`}>{value}</div>
      </div>
      {action && <ArrowRight className="w-4 h-4 text-amber-700" />}
    </div>
  );
}
