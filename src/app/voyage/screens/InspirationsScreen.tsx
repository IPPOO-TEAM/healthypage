import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';

const STORIES = [
  { id: 'matin-saly', title: 'Un matin sur la plage de Saly', cover: 'salyEmptyBeach' as const, lead: 'L\'aube rose, le sable encore frais, et la respiration qui ralentit.' },
  { id: 'thé-marrakech', title: 'Le thé qui répare à Marrakech', cover: 'riadOpenPool' as const, lead: 'Une cour fleurie, le bruit d\'une fontaine, le rituel du thé à la menthe.' },
  { id: 'dunes-lompoul', title: 'Les dunes ocre de Lompoul', cover: 'desertCamels' as const, lead: 'Le silence du désert, ce sentiment d\'être minuscule et libre.' },
  { id: 'ile-zanzibar', title: 'Stone Town au coucher du soleil', cover: 'zanzibarPath' as const, lead: 'Des ruelles d\'épices, l\'océan turquoise, la lenteur retrouvée.' },
];

export default function InspirationsScreen() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="relative h-44">
        <ImageWithFallback src={AFR.indigoWall} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/65" />
        <button onClick={() => navigate(-1)} aria-label="Retour" className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-200 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Inspirations
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Histoires d'Afrique apaisée</h1>
          <p className="text-xs text-white/80 mt-1">Lectures courtes pour rêver et préparer le voyage.</p>
        </div>
      </div>

      <section className="px-6 sm:px-8 mt-5 space-y-4 pb-4">
        {STORIES.map((s) => (
          <article key={s.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
            <ImageWithFallback src={AFR[s.cover]} alt={s.title} className="w-full h-44 object-cover" />
            <div className="p-4">
              <h2 className="font-semibold text-stone-900">{s.title}</h2>
              <p className="text-sm text-stone-600 mt-1">{s.lead}</p>
              <button className="mt-3 text-xs font-semibold text-rose-600">Lire l'histoire →</button>
            </div>
          </article>
        ))}
      </section>

      <section className="px-6 sm:px-8 mt-2 pb-8">
        <h2 className="text-base font-bold text-stone-900 mb-3">Lieux qui inspirent</h2>
        <div className="grid grid-cols-2 gap-3">
          {LIEUX.slice(0, 6).map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(`/voyage-loisirs/lieu/${l.id}`)}
              className="rounded-xl overflow-hidden bg-white border border-stone-100 text-left hover:shadow-md transition"
            >
              <ImageWithFallback src={AFR[l.hero]} alt={l.name} className="w-full h-28 object-cover" />
              <div className="p-2.5">
                <div className="text-[11px] text-stone-500">{l.country}</div>
                <div className="font-semibold text-sm text-stone-900 truncate">{l.name}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
