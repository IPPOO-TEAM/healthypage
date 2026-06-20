import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';
import { DOMAINS } from '../data';

export default function DomainesScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const list = DOMAINS.filter((d) => {
    if (!q) return true;
    const hay = `${d.label} ${d.tagline} ${d.desc} ${d.topics.join(' ')}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="px-5 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Domaines juridiques</h1>
        <p className="text-sm text-stone-500 mt-1">8 domaines couvrant le droit béninois.</p>
      </div>

      <div className="mt-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un sujet, un mot-clé..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-stone-200 text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 text-center text-stone-500 text-sm">Aucun résultat. Essaie un autre terme.</div>
      ) : (
        <div className="mt-5 space-y-3 pb-4">
          {list.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/assistance-juridique/domaine/${d.id}`)}
              className="w-full flex bg-white rounded-3xl border border-stone-100 overflow-hidden text-left shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-32 h-32 flex-shrink-0">
                <ImageWithFallback src={LEGAL[d.cover]} alt={d.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} opacity-65 mix-blend-multiply`} />
                <div className="absolute top-2 left-2 bg-white/90 rounded-lg p-1.5 shadow"><d.icon className="w-5 h-5 text-stone-800" strokeWidth={1.75} /></div>
              </div>
              <div className="flex-1 p-4">
                <div className="font-bold text-stone-900 leading-tight">{d.label}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{d.tagline}</div>
                <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">{d.desc}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  Consulter <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
