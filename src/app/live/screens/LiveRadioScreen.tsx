import { useState } from 'react';
import { Play, Headphones, Heart, Search } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';
import { RADIO_STATIONS, RADIO_CATEGORIES } from '../data';
import { useTr } from '../../i18n';

function StationRow({ s, isCurrent, playing, fav, onPlay, onFav }: {
  s: typeof RADIO_STATIONS[number]; isCurrent: boolean; playing: boolean; fav: boolean;
  onPlay: () => void; onFav: () => void;
}) {
  const name = useTr(s.name);
  const tagline = useTr(s.tagline);
  const city = useTr(s.city);
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-2xl ring-1 transition ${isCurrent ? 'bg-rose-500/10 ring-rose-400' : 'bg-white/5 ring-white/10'}`}>
      <div className="relative w-14 h-14 rounded-xl overflow-hidden">
        <img src={s.cover} alt="" className="w-full h-full object-cover" />
        {isCurrent && playing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="flex gap-0.5 items-end h-4">
              <span className="w-0.5 bg-white animate-pulse" style={{ height: '60%' }} />
              <span className="w-0.5 bg-white animate-pulse" style={{ height: '100%', animationDelay: '0.1s' }} />
              <span className="w-0.5 bg-white animate-pulse" style={{ height: '40%', animationDelay: '0.2s' }} />
              <span className="w-0.5 bg-white animate-pulse" style={{ height: '80%', animationDelay: '0.3s' }} />
            </span>
          </div>
        )}
      </div>
      <button onClick={onPlay} className="flex-1 text-left min-w-0">
        <div className="font-bold text-sm truncate">{name}</div>
        <div className="text-[11px] text-white/60 truncate">{tagline}</div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50">
          <span className="inline-flex items-center gap-0.5"><Headphones className="w-3 h-3" />{s.listeners.toLocaleString()}</span>
          <span>·</span>
          <span>{city}</span>
        </div>
      </button>
      <button onClick={onFav} className="p-2">
        <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-white/40'}`} />
      </button>
      <button onClick={onPlay} className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </button>
    </div>
  );
}

export default function LiveRadioScreen() {
  const { playRadio, current, playing, favoritesRadio, toggleFav } = useLivePlayer();
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');

  const list = RADIO_STATIONS.filter((s) => (cat === 'all' || s.category === cat) &&
    (q.trim() === '' || s.name.toLowerCase().includes(q.toLowerCase()) || s.tagline.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="px-4 pt-4 space-y-4">
      <div>
        <h1 className="font-black text-2xl">Radio en direct</h1>
        <p className="text-white/60 text-sm">{RADIO_STATIONS.length} stations · santé, bien-être et famille</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une station…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm placeholder:text-white/40 focus:outline-none focus:ring-rose-400" />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {RADIO_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${cat === c.id ? 'bg-rose-500 text-white' : 'bg-white/5 ring-1 ring-white/10 text-white/70'}`}>
            <c.icon className="w-3.5 h-3.5" strokeWidth={2} /> {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((s) => {
          const isCurrent = current?.kind === 'radio' && current.station.id === s.id;
          const fav = favoritesRadio.includes(s.id);
          return (
            <StationRow key={s.id} s={s} isCurrent={isCurrent} playing={playing} fav={fav}
              onPlay={() => playRadio(s)} onFav={() => toggleFav('radio', s.id)} />
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-8 text-white/50 text-sm">Aucune station ne correspond.</div>
        )}
      </div>
    </div>
  );
}
