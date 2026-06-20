import { Play, Radio as RadioIcon, Tv, Users, Headphones, Flame, Clock, Sparkles, Heart as HeartIcon, Apple, Dumbbell } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';
import { RADIO_STATIONS, TV_CHANNELS, LIVE_IMAGES } from '../data';

export default function LiveHomeScreen() {
  const { playRadio, playTV, history } = useLivePlayer();
  const featuredTV = TV_CHANNELS[0];
  const trendingRadios = [...RADIO_STATIONS].sort((a, b) => b.listeners - a.listeners).slice(0, 6);
  const trendingTV = [...TV_CHANNELS].sort((a, b) => b.viewers - a.viewers).slice(0, 5);

  return (
    <div className="px-4 pt-4 space-y-6">
      <div onClick={() => playTV(featuredTV)}
        className="relative rounded-3xl overflow-hidden aspect-[16/10] cursor-pointer group">
        <img src={featuredTV.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold">
          <Users className="w-3 h-3" /> {featuredTV.viewers.toLocaleString()}
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="text-[11px] font-bold text-rose-400 tracking-widest">{featuredTV.name}</div>
          <h1 className="font-black text-2xl mt-1">{featuredTV.nowPlaying.title}</h1>
          <p className="text-white/70 text-sm">{featuredTV.tagline}</p>
          <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-sm">
            <Play className="w-4 h-4 fill-current" /> Regarder maintenant
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <section>
          <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><Clock className="w-4 h-4 text-rose-400" /> Repris récemment</h2>
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
            {history.slice(0, 8).map((h) => {
              const item = h.kind === 'radio' ? RADIO_STATIONS.find((s) => s.id === h.id) : TV_CHANNELS.find((c) => c.id === h.id);
              if (!item) return null;
              return (
                <button key={`${h.kind}-${h.id}`}
                  onClick={() => h.kind === 'radio' ? playRadio(item as any) : playTV(item as any)}
                  className="shrink-0 w-32 text-left">
                  <div className="aspect-square rounded-xl overflow-hidden ring-1 ring-white/10">
                    <img src={item.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-1.5 text-[11px] font-bold text-rose-400">{h.kind === 'radio' ? 'RADIO' : 'TV'}</div>
                  <div className="text-sm font-bold truncate">{item.name}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-base inline-flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Radios tendance</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trendingRadios.map((s) => (
            <button key={s.id} onClick={() => playRadio(s)} className="text-left rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-rose-400/50 transition">
              <div className="relative aspect-square">
                <img src={s.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-500 text-[9px] font-black">LIVE</div>
                <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold text-white/90">
                  <Headphones className="w-3 h-3" /> {(s.listeners / 1000).toFixed(1)}k
                </div>
              </div>
              <div className="p-2">
                <div className="font-bold text-sm truncate">{s.name}</div>
                <div className="text-[11px] text-white/60 truncate">{s.city} · {s.country}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-rose-400" /> Univers en direct</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'sante', label: 'Santé & Prévention', sub: 'tension, diabète, vaccins', img: LIVE_IMAGES.bp, tint: 'from-rose-600/80', icon: HeartIcon },
            { id: 'nutrition', label: 'Nutrition vivante', sub: 'recettes & saveurs locales', img: LIVE_IMAGES.elderEating, tint: 'from-amber-600/80', icon: Apple },
            { id: 'fitness', label: 'Fitness féminin', sub: 'force, énergie, sororité', img: LIVE_IMAGES.fitness, tint: 'from-pink-600/80', icon: Dumbbell },
            { id: 'aines', label: 'Soin des aînés', sub: 'aide à domicile & tendresse', img: LIVE_IMAGES.nurseElder, tint: 'from-indigo-600/80', icon: HeartIcon },
          ].map((u) => {
            const Icon = u.icon;
            return (
              <div key={u.id} className="relative rounded-2xl overflow-hidden aspect-square ring-1 ring-white/10">
                <img src={u.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${u.tint} via-black/40 to-transparent`} />
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <Icon className="w-5 h-5 text-white mb-1" />
                  <div className="font-black text-sm leading-tight">{u.label}</div>
                  <div className="text-[11px] text-white/80">{u.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative rounded-3xl overflow-hidden">
        <img src={LIVE_IMAGES.anatomy} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative p-5 max-w-sm">
          <div className="text-[11px] font-bold tracking-widest text-emerald-300">DOSSIER DU JOUR</div>
          <h2 className="font-black text-2xl mt-1">Mangez vos médicaments</h2>
          <p className="text-white/80 text-sm mt-1">Suivez le grand direct nutrition de Nutri Life TV — un corps, ce qu'on lui donne.</p>
          <button onClick={() => playTV(TV_CHANNELS.find((c) => c.id === 'nutri-life')!)}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400 text-black font-bold text-sm">
            <Play className="w-4 h-4 fill-current" /> Regarder maintenant
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><Tv className="w-4 h-4 text-rose-400" /> Chaînes TV en direct</h2>
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
          {trendingTV.map((c) => (
            <button key={c.id} onClick={() => playTV(c)} className="shrink-0 w-64 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 text-left">
              <div className="relative aspect-video">
                <img src={c.poster} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[10px] font-bold text-rose-300">{c.name}</div>
                  <div className="font-bold text-sm truncate">{c.nowPlaying.title}</div>
                </div>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-[11px] text-white/60 inline-flex items-center gap-1"><Users className="w-3 h-3" /> {(c.viewers / 1000).toFixed(1)}k</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">{c.nowPlaying.type}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="relative rounded-3xl overflow-hidden aspect-[16/9]">
        <img src={LIVE_IMAGES.joy} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-rose-900/40 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> CERCLE EN DIRECT
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="text-[11px] font-bold tracking-widest text-rose-300">SOURIRES DE FEMMES</div>
          <h2 className="font-black text-xl mt-1">Cercle de parole — sororité & santé mentale</h2>
          <button onClick={() => playRadio(RADIO_STATIONS.find((s) => s.id === 'sourires-femmes')!)}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-sm">
            <Headphones className="w-4 h-4" /> Écouter la station
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-black text-base mb-2 inline-flex items-center gap-2"><RadioIcon className="w-4 h-4 text-rose-400" /> Toutes les radios</h2>
        <div className="space-y-2">
          {RADIO_STATIONS.map((s) => (
            <button key={s.id} onClick={() => playRadio(s)} className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-rose-400/50 transition text-left">
              <img src={s.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{s.name}</div>
                <div className="text-[11px] text-white/60 truncate">{s.tagline}</div>
              </div>
              <div className="text-[10px] text-white/50">{(s.listeners / 1000).toFixed(1)}k</div>
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
