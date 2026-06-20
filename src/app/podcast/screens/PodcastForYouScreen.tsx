import { useMemo } from 'react';
import { Sparkles, Play, Heart, RefreshCw, Headphones, Flame, Quote, Zap, Lightbulb, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { buildRecommendations, groupByReason } from '../recommend';
import EpisodeCard, { fmtTime } from '../components/EpisodeCard';
import { DAILY_MIXES, MOODS, STORIES, SHORTS, TIPS, SERIES, QUOTES } from '../editorial';

export default function PodcastForYouScreen() {
  const { episodes, state, prefs, play } = usePodcastPlayer();
  const recs = useMemo(() => buildRecommendations({
    episodes,
    history: state.history,
    favs: state.favs,
    preferredLang: prefs.lang,
  }), [episodes, state.history, state.favs, prefs.lang]);

  const groups = useMemo(() => groupByReason(recs), [recs]);
  const top = recs[0];
  const totalMinutes = useMemo(() => Math.round(state.history.reduce((s, h) => s + (h.pos / 60), 0)), [state.history]);

  if (recs.length === 0) {
    return (
      <div className="min-h-[60vh] px-4 pt-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#E2ECFF] grid place-items-center">
          <Sparkles className="w-9 h-9 text-[#1E5BFF]" />
        </div>
        <h1 className="font-black text-2xl mt-5">Pour vous</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
          Écoutez un premier épisode pour que l'on vous propose des recommandations sur mesure.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {top && (
        <section className="relative bg-[#0B1220] text-white px-4 pt-7 pb-7 overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <ImageWithFallback src={top.ep.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-[#0B1220]/40" />
          <div className="relative">
            <div className="text-[11px] font-bold text-[#FFD400]">Notre meilleure suggestion</div>
            <h1 className="mt-1.5 font-black leading-tight" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.1rem)' }}>
              Pour vous, aujourd'hui
            </h1>
            <p className="text-sm text-white/75 mt-1">{top.reasonLabel}</p>

            <button onClick={() => play(top.ep)} className="mt-5 w-full text-left rounded-2xl bg-white text-[#0B1220] shadow-lg overflow-hidden flex">
              <div className="relative w-32 h-32 shrink-0">
                <ImageWithFallback src={top.ep.cover} alt={top.ep.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/45 to-transparent grid place-items-center">
                  <span className="w-12 h-12 rounded-full bg-[#1E5BFF] grid place-items-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  </span>
                </div>
              </div>
              <div className="flex-1 p-3.5 min-w-0">
                <div className="text-[10px] font-bold text-[#1E5BFF]">{top.ep.cat}</div>
                <div className="font-black text-sm leading-tight mt-0.5 line-clamp-2">{top.ep.title}</div>
                <div className="text-xs text-slate-500 mt-1.5 truncate">{top.ep.host}</div>
                <div className="text-[11px] text-slate-400 mt-1">{top.ep.duration}</div>
              </div>
            </button>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <ProfileStat icon={<Headphones className="w-3.5 h-3.5" />} label="Écoutes" value={String(state.history.length)} />
              <ProfileStat icon={<Heart className="w-3.5 h-3.5" />} label="Favoris" value={String(state.favs.length)} />
              <ProfileStat icon={<Flame className="w-3.5 h-3.5" />} label="Minutes" value={String(totalMinutes)} />
            </div>
          </div>
        </section>
      )}

      <div className="px-4 pt-5 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Basé sur vos {state.history.length} écoute{state.history.length > 1 ? 's' : ''}.
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1 text-xs font-bold text-[#1E5BFF]">
          <RefreshCw className="w-3.5 h-3.5" /> Rafraîchir
        </button>
      </div>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#12C76F]" /> Vos daily mixes
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {DAILY_MIXES.map((m) => (
            <button key={m.id} onClick={() => play(episodes[0])} className="shrink-0 w-44 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2]">
              <div className="relative h-44">
                <ImageWithFallback src={m.img} alt={m.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${m.tint} opacity-65`} />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="text-[10px] font-bold opacity-90">QUOTIDIEN</div>
                  <div className="font-black leading-tight">{m.title}</div>
                </div>
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white grid place-items-center shadow-md">
                  <Play className="w-4 h-4 text-[#1E5BFF] fill-current ml-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#FF4D8D] fill-current" /> Selon votre humeur
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((m) => (
            <button key={m.id} onClick={() => play(episodes[0])} className="relative rounded-xl overflow-hidden h-28 text-left text-white">
              <ImageWithFallback src={m.img} alt={m.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-tr ${m.tint} opacity-75`} />
              <div className="relative h-full p-3 flex flex-col justify-end">
                <div className="font-black text-sm leading-tight">{m.title}</div>
                <div className="text-[11px] opacity-90">{m.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Quote className="w-4 h-4 text-[#FFD400]" /> Inspirés par leur parcours
        </h2>
        <div className="space-y-3">
          {STORIES.slice(0, 2).map((s) => (
            <article key={s.id} className="rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
              <ImageWithFallback src={s.img} alt={s.name} className="w-28 object-cover" />
              <div className="flex-1 p-3.5 min-w-0">
                <div className="text-[10px] font-bold text-[#1E5BFF]">{s.cat}</div>
                <p className="text-[13px] text-[#0B1220] leading-snug mt-1 line-clamp-3 italic">"{s.quote}"</p>
                <div className="text-[11px] text-slate-500 mt-1.5">— {s.name}, {s.age} ans</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FFD400]" /> Capsules pour vous
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {SHORTS.map((s) => (
            <button key={s.id} onClick={() => play(episodes[0])} className="shrink-0 w-40 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2]">
              <div className="relative h-40">
                <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/85 via-[#0B1220]/20 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FFD400] text-[#0B1220] text-[10px] font-black">{s.min} min</div>
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                  <div className="font-bold text-[12px] leading-tight line-clamp-2">{s.title}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#FFD400]" /> À tester aujourd'hui
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TIPS.map((t) => (
            <button key={t.id} onClick={() => play(episodes[0])} className="relative rounded-xl overflow-hidden h-28 text-left text-white">
              <ImageWithFallback src={t.img} alt={t.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${t.tint} via-[#0B1220]/40 to-transparent`} />
              <div className="relative h-full p-2.5 flex flex-col justify-end">
                <div className="font-black text-sm leading-tight">{t.title}</div>
                <div className="text-[11px] opacity-90">{t.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1E5BFF]" /> Programmes recommandés
        </h2>
        <div className="space-y-3">
          {SERIES.slice(0, 3).map((s) => (
            <button key={s.id} onClick={() => play(episodes[0])} className="w-full text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
              <div className="relative w-28 shrink-0">
                <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${s.tone} opacity-55`} />
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/95 text-[#0B1220] text-[10px] font-black">{s.days}j</div>
              </div>
              <div className="flex-1 p-3 min-w-0">
                <div className="font-black text-sm leading-tight line-clamp-1 text-[#0B1220]">{s.title}</div>
                <div className="text-[12px] text-slate-500 mt-1 line-clamp-2">{s.subtitle}</div>
                <div className="text-[11px] text-[#1E5BFF] font-bold mt-1.5">{s.episodes} épisodes</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          <Quote className="w-4 h-4 text-[#FFD400]" /> Mantras d'experts
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {QUOTES.map((q) => (
            <article key={q.id} className="shrink-0 w-72 rounded-xl overflow-hidden bg-[#0B1220] text-white relative">
              <ImageWithFallback src={q.img} alt={q.author} className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/85 to-[#1E5BFF]/40" />
              <div className="relative p-4 min-h-[160px] flex flex-col justify-between">
                <Quote className="w-5 h-5 text-[#FFD400]" />
                <div>
                  <p className="text-sm leading-snug font-bold">"{q.quote}"</p>
                  <div className="text-[11px] text-white/75 mt-2">— {q.author}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.key} className="px-4 mt-5">
          <h2 className="font-black text-lg mb-3 flex items-center gap-2">
            {g.key === 'unfinished' ? <Play className="w-4 h-4 text-[#1E5BFF] fill-current" />
             : g.key === 'category' ? <Sparkles className="w-4 h-4 text-[#FFD400]" />
             : g.key === 'host' ? <Heart className="w-4 h-4 text-[#FF4D8D] fill-current" />
             : <Sparkles className="w-4 h-4 text-[#1E5BFF]" />}
            {g.label}
          </h2>
          {g.key === 'unfinished' ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {g.items.map((r) => {
                const h = state.history.find((x) => x.id === r.ep.id);
                const total = h?.duration ?? r.ep.durationSec;
                const pct = h ? Math.min((h.pos / total) * 100, 100) : 0;
                return (
                  <button key={r.ep.id} onClick={() => play(r.ep)} className="shrink-0 w-44 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] shadow-sm">
                    <div className="relative h-24">
                      <ImageWithFallback src={r.ep.cover} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-black/30"><div className="h-full bg-[#FFD400]" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <div className="p-2.5">
                      <div className="font-bold text-xs leading-tight line-clamp-2 text-[#0B1220]">{r.ep.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{h ? `à ${fmtTime(h.pos)}` : r.ep.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {g.items.map((r) => (
                <div key={r.ep.id}>
                  <div className="text-[11px] text-slate-400 mb-1 px-1">{r.reasonLabel}</div>
                  <EpisodeCard ep={r.ep} variant="wide" />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 ring-1 ring-white/20 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-1 text-[10px] text-white/80">
        {icon} {label}
      </div>
      <div className="font-black text-lg mt-0.5">{value}</div>
    </div>
  );
}
