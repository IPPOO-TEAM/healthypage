import { Play, Pause, X, Volume2, VolumeX, Maximize2, Minimize2, Heart, Radio as RadioIcon, Tv, Loader2, AlertTriangle, RotateCw } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';

export function LiveMiniPlayer() {
  const { current, status, playing, toggle, stop, expanded, setExpanded, toggleFav, favoritesRadio, favoritesTV, retry } = useLivePlayer();
  if (!current || expanded) return null;

  const isRadio = current.kind === 'radio';
  const item = isRadio ? current.station : current.channel;
  const id = item.id;
  const fav = isRadio ? favoritesRadio.includes(id) : favoritesTV.includes(id);

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 px-3">
      <div className="mx-auto max-w-xl rounded-2xl bg-white ring-1 ring-[#E6EAF2] shadow-lg p-2 flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img src={item.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute top-0.5 left-0.5 px-1 rounded bg-rose-500 text-white text-[8px] font-black">LIVE</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
            {isRadio ? <RadioIcon className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
            {isRadio ? 'RADIO' : 'TV'}
          </div>
          <div className="font-bold text-sm truncate">{item.name}</div>
          <div className="text-[11px] text-slate-500 truncate">
            {isRadio ? (item as any).hosts?.[0] : (item as any).nowPlaying?.title}
          </div>
        </div>
        <button onClick={() => toggleFav(isRadio ? 'radio' : 'tv', id)} className="p-2">
          <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
        </button>
        <button
          onClick={status === 'error' ? retry : toggle}
          aria-label={status === 'error' ? 'Réessayer' : playing ? 'Pause' : 'Lecture'}
          className={`w-10 h-10 rounded-full text-white flex items-center justify-center ${status === 'error' ? 'bg-amber-500' : 'bg-[#1E5BFF]'}`}
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" />
            : status === 'error' ? <RotateCw className="w-4 h-4" />
            : playing ? <Pause className="w-4 h-4 fill-current" />
            : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
        <button onClick={() => setExpanded(true)} className="p-2"><Maximize2 className="w-4 h-4 text-slate-500" /></button>
        <button onClick={stop} className="p-2"><X className="w-4 h-4 text-slate-400" /></button>
      </div>
    </div>
  );
}

export function LiveFullPlayer() {
  const { current, status, playing, toggle, stop, expanded, setExpanded, volume, setVolume, muted, setMuted, videoRef, toggleFav, favoritesRadio, favoritesTV, errorMessage, retry } = useLivePlayer();
  if (!current || !expanded) return null;
  const isRadio = current.kind === 'radio';
  const item = isRadio ? current.station : current.channel;
  const id = item.id;
  const fav = isRadio ? favoritesRadio.includes(id) : favoritesTV.includes(id);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={() => setExpanded(false)} className="p-2"><Minimize2 className="w-5 h-5" /></button>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </div>
        <button onClick={stop} className="p-2"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {isRadio ? (
          <div className="w-full max-w-sm">
            <div className="aspect-square rounded-3xl overflow-hidden ring-4 ring-white/10 shadow-2xl">
              <img src={item.cover} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="mt-6 text-center text-white">
              <div className="text-xs font-bold tracking-widest text-rose-400">RADIO</div>
              <h2 className="font-black text-2xl mt-1">{item.name}</h2>
              <p className="text-white/70 text-sm mt-1">{(item as any).tagline}</p>
              <p className="text-white/50 text-xs mt-2">{(item as any).city} · {(item as any).country}</p>
              {status === 'loading' && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-white/70 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connexion au flux…</p>
              )}
              {status === 'error' && (
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> {errorMessage ?? 'Flux indisponible'}</span>
                  <button onClick={retry} className="px-2.5 py-1 rounded-full bg-white text-black text-[11px] font-bold inline-flex items-center gap-1"><RotateCw className="w-3 h-3" /> Réessayer</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="relative">
              <video ref={videoRef} controls={false} playsInline poster={(item as any).poster}
                className="w-full aspect-video rounded-2xl bg-black object-cover" />
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl gap-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <div className="text-white text-sm">{errorMessage ?? 'Flux indisponible'}</div>
                  <button onClick={retry} className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold inline-flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" /> Réessayer
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 text-white">
              <div className="text-xs font-bold tracking-widest text-rose-400">TV · EN DIRECT</div>
              <h2 className="font-black text-xl mt-1">{item.name}</h2>
              <p className="text-white/70 text-sm">{(item as any).nowPlaying?.title}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => toggleFav(isRadio ? 'radio' : 'tv', id)} className="text-white/80">
            <Heart className={`w-6 h-6 ${fav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={status === 'error' ? retry : toggle}
            aria-label={status === 'error' ? 'Réessayer' : playing ? 'Pause' : 'Lecture'}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl"
          >
            {status === 'loading' ? <Loader2 className="w-7 h-7 animate-spin" />
              : status === 'error' ? <RotateCw className="w-7 h-7" />
              : playing ? <Pause className="w-7 h-7 fill-current" />
              : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
          <button onClick={() => setMuted(!muted)} className="text-white/80">
            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex items-center gap-2 max-w-sm mx-auto">
          <Volume2 className="w-4 h-4 text-white/60" />
          <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); if (muted) setMuted(false); }}
            className="flex-1 accent-rose-500" />
        </div>
      </div>
    </div>
  );
}
