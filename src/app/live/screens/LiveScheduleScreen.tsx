import { useState } from 'react';
import { Radio as RadioIcon, Tv, Play } from 'lucide-react';
import { useLivePlayer } from '../LivePlayerContext';
import { RADIO_STATIONS, TV_CHANNELS } from '../data';

export default function LiveScheduleScreen() {
  const { playRadio, playTV } = useLivePlayer();
  const [tab, setTab] = useState<'radio' | 'tv'>('radio');

  return (
    <div className="px-4 pt-4 space-y-4">
      <div>
        <h1 className="font-black text-2xl">Grille des programmes</h1>
        <p className="text-white/60 text-sm">Découvrez ce qui passe aujourd'hui</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 ring-1 ring-white/10">
        <button onClick={() => setTab('radio')}
          className={`py-2 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 ${tab === 'radio' ? 'bg-rose-500 text-white' : 'text-white/70'}`}>
          <RadioIcon className="w-4 h-4" /> Radio
        </button>
        <button onClick={() => setTab('tv')}
          className={`py-2 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 ${tab === 'tv' ? 'bg-rose-500 text-white' : 'text-white/70'}`}>
          <Tv className="w-4 h-4" /> TV
        </button>
      </div>

      {tab === 'radio' ? (
        <div className="space-y-4">
          {RADIO_STATIONS.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={s.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-[11px] text-white/60 truncate">{s.city} · {s.country}</div>
                </div>
                <button onClick={() => playRadio(s)} className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <div className="border-t border-white/10 divide-y divide-white/5">
                {s.schedule.map((slot) => (
                  <div key={slot.time} className="flex items-center gap-3 px-3 py-2">
                    <div className="text-xs font-mono font-bold text-rose-300 w-12">{slot.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{slot.show}</div>
                      <div className="text-[11px] text-white/50 truncate">avec {slot.host}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {TV_CHANNELS.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={c.poster} alt="" className="w-16 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{c.name}</div>
                  <div className="text-[11px] text-white/60 truncate">en cours : {c.nowPlaying.title}</div>
                </div>
                <button onClick={() => playTV(c)} className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <div className="border-t border-white/10 divide-y divide-white/5">
                {c.schedule.map((slot) => (
                  <div key={slot.time} className="flex items-center gap-3 px-3 py-2">
                    <div className="text-xs font-mono font-bold text-rose-300 w-12">{slot.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{slot.show}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">{slot.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
