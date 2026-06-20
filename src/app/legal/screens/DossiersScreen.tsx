import { useNavigate } from 'react-router';
import { Plus, FolderClosed, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';
import { DOSSIERS_DEMO, DOMAINS, DossierStatus } from '../data';

const STATUS_META: Record<DossierStatus, { label: string; color: string; Icon: any }> = {
  ouvert: { label: 'Ouvert', color: 'bg-amber-50 text-amber-700', Icon: AlertCircle },
  'en-cours': { label: 'En cours', color: 'bg-blue-50 text-blue-700', Icon: Clock },
  resolu: { label: 'Résolu', color: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 },
};

export default function DossiersScreen() {
  const navigate = useNavigate();
  const dossiers = DOSSIERS_DEMO;
  const ouvert = dossiers.filter((d) => d.status !== 'resolu').length;

  return (
    <div className="pb-6">
      {/* Header */}
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src={LEGAL.reviewDocs} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-stone-900/85 to-amber-900/85" />
        <div className="absolute inset-0 px-5 py-6 text-white flex flex-col justify-center">
          <div className="text-xs font-medium opacity-90 inline-flex items-center gap-1.5">
            <FolderClosed className="w-4 h-4" /> Mes dossiers
          </div>
          <div className="mt-1 text-3xl font-bold tracking-tight">{dossiers.length} affaire{dossiers.length > 1 ? 's' : ''}</div>
          <div className="text-sm text-white/85 mt-0.5">{ouvert} en cours · {dossiers.length - ouvert} résolue{dossiers.length - ouvert > 1 ? 's' : ''}</div>
        </div>
      </section>

      {/* Action */}
      <section className="px-5 mt-5">
        <button
          onClick={() => navigate('/assistance-juridique/domaines')}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Ouvrir un nouveau dossier
        </button>
      </section>

      {/* List */}
      <section className="px-5 mt-6 space-y-3">
        {dossiers.map((d) => {
          const dom = DOMAINS.find((x) => x.id === d.domain)!;
          const meta = STATUS_META[d.status];
          const Icon = meta.Icon;
          return (
            <div key={d.id} className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
              <div className="flex">
                <div className="relative w-24 flex-shrink-0">
                  <ImageWithFallback src={LEGAL[dom.cover]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${dom.accent} opacity-70 mix-blend-multiply`} />
                  <div className="absolute top-2 left-2 bg-white/90 rounded-md p-1 shadow"><dom.icon className="w-4 h-4 text-stone-800" strokeWidth={1.75} /></div>
                </div>
                <div className="flex-1 p-4">
                  <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </div>
                  <div className="font-bold text-sm text-stone-900 mt-1 leading-tight">{d.title}</div>
                  <div className="text-[11px] text-stone-500 mt-1">Mis à jour le {d.updated}</div>
                  {d.next && (
                    <div className="mt-2 text-[11px] text-amber-700 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {d.next}
                    </div>
                  )}
                </div>
              </div>
              <button className="w-full px-4 py-2.5 border-t border-stone-100 text-xs font-semibold text-stone-700 inline-flex items-center justify-center gap-1 hover:bg-stone-50">
                Voir le dossier <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
