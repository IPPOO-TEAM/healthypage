import { useState } from 'react';
import { Play, Users, Heart } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';
import { TV_CHANNELS, TV_CATEGORIES } from '../data';
import { useTr } from '../../i18n';

function ChannelCard({ c, fav, onPlay, onFav }: {
  c: typeof TV_CHANNELS[number]; fav: boolean; onPlay: () => void; onFav: () => void;
}) {
  const name = useTr(c.name);
  const tagline = useTr(c.tagline);
  const nowTitle = useTr(c.nowPlaying.title);
  const nowType = useTr(c.nowPlaying.type);
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
      <button onClick={onPlay} className="block w-full text-left">
        <div className="relative aspect-video">
          <img src={c.poster} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
          </div>
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold">
            <Users className="w-3 h-3" /> {c.viewers.toLocaleString()}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <div className="w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[11px] font-bold tracking-wider text-rose-300">{name}</div>
            <div className="font-black text-base truncate">{nowTitle}</div>
            <div className="text-xs text-white/70">jusqu'à {c.nowPlaying.until} · {nowType}</div>
          </div>
        </div>
      </button>
      <div className="p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white/70 uppercase tracking-wider">{c.category}</div>
          <div className="text-xs text-white/60 truncate">{tagline}</div>
        </div>
        <button onClick={onFav} className="p-2">
          <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-white/40'}`} />
        </button>
        <button onClick={onPlay} className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1">
          <Play className="w-3 h-3 fill-current" /> Regarder
        </button>
      </div>
    </div>
  );
}

export default function LiveTVScreen() {
  const { playTV, favoritesTV, toggleFav } = useLivePlayer();
  const [cat, setCat] = useState<string>('all');
  const list = TV_CHANNELS.filter((c) => cat === 'all' || c.category === cat);

  return (
    <div className="px-4 pt-4 space-y-4">
      <div>
        <h1 className="font-black text-2xl">Chaînes TV en direct</h1>
        <p className="text-white/60 text-sm">{TV_CHANNELS.length} chaînes · santé, fitness, documentaires</p>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {TV_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${cat === c.id ? 'bg-rose-500 text-white' : 'bg-white/5 ring-1 ring-white/10 text-white/70'}`}>
            <c.icon className="w-3.5 h-3.5" strokeWidth={2} /> {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {list.map((c) => {
          const fav = favoritesTV.includes(c.id);
          return (
            <ChannelCard key={c.id} c={c} fav={fav}
              onPlay={() => playTV(c)} onFav={() => toggleFav('tv', c.id)} />
          );
        })}
      </div>
    </div>
  );
}
