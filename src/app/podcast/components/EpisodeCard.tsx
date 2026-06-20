import { Play, Heart, Download, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { PodcastEpisode } from '../../components/podcasts';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { cat as catOf } from '../catColors';
import { useTr } from '../../i18n';

export function fmtTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function EpisodeCard({ ep, variant = 'list' }: { ep: PodcastEpisode; variant?: 'list' | 'tile' | 'wide' }) {
  const { play, current, playing, isFav, isDownloaded, toggleFav, toggleDownload, downloadingId, downloadPct } = usePodcastPlayer();
  const isCurrent = current?.id === ep.id;
  const fav = isFav(ep.id);
  const dl = isDownloaded(ep.id);
  const c = catOf(ep.cat);
  const title = useTr(ep.title);
  const host = useTr(ep.host);
  const desc = useTr(ep.desc);

  if (variant === 'tile') {
    return (
      <button onClick={() => play(ep)} className="shrink-0 w-56 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] shadow-sm">
        <div className="relative h-32">
          <ImageWithFallback src={ep.cover} alt={title} className="w-full h-full object-cover" />
          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${c.solid}`}>{c.label}</span>
          <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1E5BFF] grid place-items-center shadow-md">
            <Play className="w-4 h-4 fill-current text-white ml-0.5" />
          </div>
        </div>
        <div className="p-3">
          <div className="font-bold text-sm leading-tight line-clamp-2 text-[#0B1220]">{title}</div>
          <div className="text-xs text-slate-500 mt-1">{host} • {ep.duration}</div>
        </div>
      </button>
    );
  }

  return (
    <article className={`rounded-xl bg-white ring-1 transition overflow-hidden ${isCurrent ? 'ring-[#1E5BFF] shadow-md' : 'ring-[#E6EAF2]'}`}>
      <div className="flex gap-3 p-3 items-center">
        <button onClick={() => play(ep)} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100">
          <ImageWithFallback src={ep.cover} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 grid place-items-center">
            <Play className={`w-5 h-5 text-white fill-current ${isCurrent && playing ? 'opacity-0' : 'ml-0.5'}`} />
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${c.bg} ${c.fg}`}>{c.label}</span>
          <div className="font-bold text-sm leading-tight mt-1 line-clamp-2 text-[#0B1220]">{title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{host} • {ep.duration}</div>
          {variant === 'wide' && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{desc}</p>}
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button onClick={() => toggleFav(ep.id)} aria-label="Favori" className={`p-1.5 rounded-md ${fav ? 'bg-rose-50 text-[#FF4D8D]' : 'text-slate-400 hover:bg-slate-100'}`}>
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => toggleDownload(ep)} aria-label="Télécharger" disabled={downloadingId === ep.id}
            className={`p-1.5 rounded-md relative ${dl ? 'bg-emerald-50 text-[#12C76F]' : 'text-slate-400 hover:bg-emerald-50 hover:text-[#12C76F]'} disabled:opacity-60`}>
            {downloadingId === ep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className={`w-4 h-4 ${dl ? 'fill-current' : ''}`} />}
            {downloadingId === ep.id && downloadPct > 0 && (
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-slate-500">{downloadPct}%</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
