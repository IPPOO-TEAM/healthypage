import { useNavigate } from 'react-router';
import { Play, Heart, Brain, Baby, Shield, Activity, Leaf, TrendingUp, Clock, ArrowRight, Mic2, Quote, Sparkles, ListMusic, Zap, Radio, Calendar, Users, Lightbulb } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import EpisodeCard, { fmtTime } from '../components/EpisodeCard';
import { COLLECTIONS, STORIES, EXPERTS, MOODS, SERIES, CIRCLES, SHORTS, LIVES, AGE_GROUPS, QUOTES, TIPS } from '../editorial';
import { useT } from '../../i18n';

const CATS = [
  { id: 'nutrition', label: 'Nutrition', Icon: Leaf, bg: 'bg-[#E6F8EE]', fg: 'text-[#0F8A4F]' },
  { id: 'mental', label: 'Mental', Icon: Brain, bg: 'bg-[#E4E8FF]', fg: 'text-[#3046C7]' },
  { id: 'maternite', label: 'Maternité', Icon: Baby, bg: 'bg-[#FFE0EC]', fg: 'text-[#B0285E]' },
  { id: 'prevention', label: 'Prévention', Icon: Shield, bg: 'bg-[#E2ECFF]', fg: 'text-[#1240C7]' },
  { id: 'sport', label: 'Sport', Icon: Activity, bg: 'bg-[#FFEFD9]', fg: 'text-[#A85800]' },
  { id: 'tradition', label: 'Tradition', Icon: Heart, bg: 'bg-[#FFF6CC]', fg: 'text-[#8A6A00]' },
];

export default function PodcastHomeScreen() {
  const { episodes, state, current, time, duration, play } = usePodcastPlayer();
  const navigate = useNavigate();
  const { t } = useT();
  const top = episodes[0];
  const trending = episodes.slice(0, 4);
  const fresh = [...episodes].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 3);
  const hosts = Array.from(new Map(episodes.map((e) => [e.host, e])).values()).slice(0, 6);

  return (
    <div className="pb-2">
      <section className="px-4 pt-5">
        <div className="relative rounded-2xl overflow-hidden bg-[#0B1220] text-white shadow-md">
          {top && (
            <div className="absolute inset-0">
              <ImageWithFallback src={top.cover} alt="" className="w-full h-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />
            </div>
          )}
          <div className="relative p-5 pt-32">
            <div className="text-[11px] text-[#FFD400] font-bold">{t('podcast.featured')}</div>
            <h1 className="font-black leading-tight mt-1.5" style={{ fontSize: 'clamp(1.5rem, 5.5vw, 1.9rem)' }}>
              {top?.title}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{top?.host}</div>
                <div className="text-[12px] text-white/70 truncate">{top?.duration} • {top?.cat}</div>
              </div>
              <button onClick={() => top && play(top)} aria-label="Lire"
                className="px-5 h-11 rounded-lg bg-[#1E5BFF] text-white font-black inline-flex items-center gap-2 shadow-md active:scale-95 transition">
                <Play className="w-4 h-4 fill-current" /> {t('common.listen')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base">{t('podcast.categories')}</h2>
          <button onClick={() => navigate('/podcast/decouvrir')} className="text-xs font-bold text-[#1E5BFF] inline-flex items-center gap-0.5">
            {t('common.see_all')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {CATS.map(({ id, label, Icon, bg, fg }) => (
            <button key={id} onClick={() => navigate(`/podcast/decouvrir?cat=${id}`)}
              className="shrink-0 flex flex-col items-center gap-1.5 w-20">
              <div className={`w-16 h-16 rounded-xl ${bg} grid place-items-center ring-1 ring-[#E6EAF2]`}>
                <Icon className={`w-7 h-7 ${fg}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {state.history.length > 0 && (
        <section className="px-4 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-base inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1E5BFF]" /> {t('podcast.continue_listening')}
            </h2>
            <button onClick={() => navigate('/podcast/bibliotheque')} className="text-xs font-bold text-[#1E5BFF]">Tout voir</button>
          </div>
          <div className="space-y-2.5">
            {state.history.slice(0, 3).map((h) => {
              const ep = episodes.find((e) => e.id === h.id);
              if (!ep) return null;
              const total = h.duration ?? ep.durationSec;
              const pct = current?.id === ep.id && duration ? (time / duration) * 100 : (h.pos / total) * 100;
              return (
                <button key={ep.id + h.at} onClick={() => play(ep)}
                  className="w-full text-left rounded-xl bg-white ring-1 ring-[#E6EAF2] p-2.5 flex items-center gap-3 active:scale-[0.99] transition">
                  <ImageWithFallback src={ep.cover} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-tight line-clamp-1 text-[#0B1220]">{ep.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">{ep.host}</div>
                    <div className="mt-1.5 h-1 bg-[#E6EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1E5BFF]" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">à {fmtTime(h.pos)} / {ep.duration}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E2ECFF] text-[#1E5BFF] grid place-items-center">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#FF8A00]" /> {t('podcast.trending')}
          </h2>
          <span className="text-xs text-slate-500">Top 4</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trending.map((ep, idx) => (
            <button key={ep.id} onClick={() => play(ep)} className="text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] active:scale-[0.99] transition">
              <div className="relative aspect-square">
                <ImageWithFallback src={ep.cover} alt={ep.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-md bg-white/95 grid place-items-center font-black text-sm text-[#0B1220]">
                  {idx + 1}
                </div>
                <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1E5BFF] grid place-items-center shadow-md">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
              </div>
              <div className="p-2.5">
                <div className="font-bold text-[13px] leading-tight line-clamp-2 text-[#0B1220]">{ep.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{ep.host}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Mic2 className="w-4 h-4 text-[#1E5BFF]" /> {t('podcast.voices_to_follow')}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {hosts.map((ep) => (
            <button key={ep.host} onClick={() => play(ep)} className="shrink-0 flex flex-col items-center w-24">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#E2ECFF] shadow-sm">
                <ImageWithFallback src={ep.cover} alt={ep.host} className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] font-bold text-slate-700 text-center mt-1.5 leading-tight line-clamp-2">{ep.host}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{ep.cat}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            {t('podcast.new')} <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FFD400] text-[#0B1220]">NEW</span>
          </h2>
          <span className="text-xs text-slate-500">{fresh.length} épisodes</span>
        </div>
        <div className="space-y-3">
          {fresh.map((e) => <EpisodeCard key={e.id} ep={e} variant="wide" />)}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <ListMusic className="w-4 h-4 text-[#12C76F]" /> Collections thématiques
          </h2>
          <span className="text-xs text-slate-500">{COLLECTIONS.length} séries</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {COLLECTIONS.map((c) => (
            <button key={c.id} onClick={() => play(episodes[0])} className="shrink-0 w-60 text-left rounded-xl overflow-hidden ring-1 ring-[#E6EAF2] bg-white shadow-sm">
              <div className="relative h-32">
                <ImageWithFallback src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.tone} opacity-60`} />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="text-[10px] font-bold opacity-90">{c.episodes} épisodes</div>
                  <div className="font-black text-sm leading-tight mt-0.5 line-clamp-2">{c.title}</div>
                </div>
              </div>
              <div className="p-2.5 text-xs text-slate-600">{c.subtitle}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFD400]" /> Mood du jour
          </h2>
        </div>
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

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Mic2 className="w-4 h-4 text-[#1E5BFF]" /> Voix d'experts
          </h2>
          <span className="text-xs text-slate-500">{EXPERTS.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {EXPERTS.map((x) => (
            <button key={x.id} className="shrink-0 w-44 text-left rounded-xl overflow-hidden ring-1 ring-[#E6EAF2] bg-white">
              <div className="relative h-44">
                <ImageWithFallback src={x.img} alt={x.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/85 via-[#0B1220]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="font-black text-sm leading-tight line-clamp-1">{x.name}</div>
                  <div className="text-[11px] opacity-90">{x.role}</div>
                </div>
              </div>
              <div className="px-3 py-2 text-[11px] text-slate-500">{x.episodes} épisodes</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Quote className="w-4 h-4 text-[#FF4D8D]" /> Témoignages
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {STORIES.map((s) => (
            <article key={s.id} className="shrink-0 w-72 rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] flex">
              <ImageWithFallback src={s.img} alt={s.name} className="w-24 h-auto object-cover" />
              <div className="flex-1 p-3 min-w-0">
                <div className="text-[10px] font-bold text-[#1E5BFF]">{s.cat}</div>
                <Quote className="w-3.5 h-3.5 text-[#FFD400] mt-1" />
                <p className="text-[12px] text-[#0B1220] leading-snug mt-0.5 line-clamp-3">{s.quote}</p>
                <div className="text-[11px] text-slate-500 mt-1.5">— {s.name}, {s.age} ans</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#FF2D2D]" /> En direct & à venir
          </h2>
        </div>
        <div className="space-y-2.5">
          {LIVES.map((l) => (
            <button key={l.id} onClick={() => play(episodes[0])} className="w-full text-left rounded-xl bg-white ring-1 ring-[#E6EAF2] p-2.5 flex items-center gap-3 active:scale-[0.99] transition">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <ImageWithFallback src={l.img} alt={l.host} className="w-full h-full object-cover" />
                {l.live && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FF2D2D] text-white">LIVE</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight line-clamp-1 text-[#0B1220]">{l.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{l.host}</div>
                <div className="text-[11px] text-[#1E5BFF] font-bold mt-0.5">{l.when}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E2ECFF] text-[#1E5BFF] grid place-items-center">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#FFD400]" /> Capsules courtes
          </h2>
          <span className="text-xs text-slate-500">{SHORTS.length} • &lt; 6 min</span>
        </div>
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

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1E5BFF]" /> Programmes guidés
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {SERIES.map((s) => (
            <button key={s.id} onClick={() => play(episodes[0])} className="shrink-0 w-64 text-left rounded-xl overflow-hidden bg-white ring-1 ring-[#E6EAF2] shadow-sm">
              <div className="relative h-36">
                <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${s.tone} opacity-65`} />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/95 text-[#0B1220] text-[10px] font-black">{s.days}j</div>
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="text-[10px] font-bold opacity-90">{s.episodes} épisodes</div>
                  <div className="font-black text-sm leading-tight mt-0.5 line-clamp-2">{s.title}</div>
                </div>
              </div>
              <div className="p-2.5 text-xs text-slate-600 line-clamp-1">{s.subtitle}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-[#FFD400]" /> Conseils du jour
          </h2>
        </div>
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

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#FF4D8D]" /> Cercles d'écoute
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {CIRCLES.map((c) => (
            <button key={c.id} onClick={() => play(episodes[0])} className="shrink-0 w-60 text-left rounded-xl overflow-hidden">
              <div className="relative h-36">
                <ImageWithFallback src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.tint} via-[#0B1220]/40 to-transparent`} />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="font-black text-sm leading-tight">{c.title}</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{c.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base">Selon votre âge</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AGE_GROUPS.map((a) => (
            <button key={a.id} onClick={() => navigate('/podcast/decouvrir')} className="relative rounded-xl overflow-hidden h-28 text-left text-white">
              <ImageWithFallback src={a.img} alt={a.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${a.tint} via-[#0B1220]/40 to-transparent`} />
              <div className="relative h-full p-2.5 flex flex-col justify-end">
                <div className="font-black text-sm leading-tight">{a.label}</div>
                <div className="text-[11px] opacity-90">{a.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3 inline-flex items-center gap-1.5">
          <Quote className="w-4 h-4 text-[#FFD400]" /> Paroles d'experts
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

      <section className="px-4 pt-6">
        <h2 className="font-black text-base mb-3">{t('podcast.all_episodes')}</h2>
        <div className="space-y-3">
          {episodes.map((e) => <EpisodeCard key={e.id} ep={e} variant="wide" />)}
        </div>
      </section>
    </div>
  );
}
