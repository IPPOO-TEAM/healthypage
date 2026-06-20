import { Heart, Play, Radio as RadioIcon, Tv } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';
import { RADIO_STATIONS, TV_CHANNELS } from '../data';

export default function LiveFavoritesScreen() {
  const { favoritesRadio, favoritesTV, playRadio, playTV, toggleFav } = useLivePlayer();
  const radios = RADIO_STATIONS.filter((s) => favoritesRadio.includes(s.id));
  const tvs = TV_CHANNELS.filter((c) => favoritesTV.includes(c.id));
  const empty = radios.length === 0 && tvs.length === 0;

  return (
    <div className="px-4 pt-4 space-y-5">
      <div>
        <h1 className="font-black text-2xl inline-flex items-center gap-2"><Heart className="w-5 h-5 fill-rose-500 text-rose-500" /> Mes favoris</h1>
        <p className="text-white/60 text-sm">{radios.length} radios · {tvs.length} chaînes TV</p>
      </div>

      {empty && (
        <div className="rounded-2xl p-8 bg-white/5 ring-1 ring-white/10 text-center">
          <Heart className="w-10 h-10 mx-auto text-white/30" />
          <p className="text-white/70 text-sm mt-2">Ajoutez vos stations et chaînes favorites depuis l'onglet Radio ou TV.</p>
        </div>
      )}

      {radios.length > 0 && (
        <section>
          <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><RadioIcon className="w-4 h-4 text-rose-400" /> Radios</h2>
          <div className="space-y-2">
            {radios.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 ring-1 ring-white/10">
                <img src={s.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-[11px] text-white/60 truncate">{s.tagline}</div>
                </div>
                <button onClick={() => toggleFav('radio', s.id)} className="p-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
                <button onClick={() => playRadio(s)} className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tvs.length > 0 && (
        <section>
          <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><Tv className="w-4 h-4 text-rose-400" /> Chaînes TV</h2>
          <div className="grid grid-cols-2 gap-3">
            {tvs.map((c) => (
              <div key={c.id} className="rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
                <button onClick={() => playTV(c)} className="block w-full text-left">
                  <div className="relative aspect-video">
                    <img src={c.poster} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-1 left-2 right-2">
                      <div className="text-[10px] font-bold text-rose-300">{c.name}</div>
                      <div className="text-xs font-bold truncate">{c.nowPlaying.title}</div>
                    </div>
                  </div>
                </button>
                <button onClick={() => toggleFav('tv', c.id)} className="w-full px-2 py-1.5 text-[11px] font-bold text-rose-400 inline-flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500" /> Retirer
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
