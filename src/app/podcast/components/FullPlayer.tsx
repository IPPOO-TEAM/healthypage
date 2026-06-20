import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Heart, Download, Share2, Search, Loader2, Shuffle, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { searchWords } from '../../components/podcastTranscript';
import { fmtTime } from './EpisodeCard';
import PodcastCharacter from './PodcastCharacter';
import { useTr } from '../../i18n';

function Waveform({ progress, onSeek }: { progress: number; onSeek: (pct: number) => void }) {
  const bars = 56;
  return (
    <div
      className="relative h-12 flex items-center gap-[3px] cursor-pointer select-none"
      onClick={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        onSeek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
        const h = 18 + seed * 28;
        const active = i / bars <= progress;
        return (
          <span key={i} style={{ height: `${h}px` }}
            className={`flex-1 rounded-full ${active ? 'bg-[#6C4BFF]' : 'bg-[#D9CFFF]'}`} />
        );
      })}
    </div>
  );
}

export default function FullPlayer() {
  const {
    current, playing, time, duration, expanded, setExpanded, toggle, seek, seekTo,
    isFav, isDownloaded, toggleFav, toggleDownload, downloadingId, downloadPct,
    transcript, transcriptLoading, loadCurrentTranscript,
    prefs, setPrefs,
  } = usePodcastPlayer();

  const [showTranscript, setShowTranscript] = useState(false);
  const [tQuery, setTQuery] = useState('');

  useEffect(() => { setShowTranscript(false); setTQuery(''); }, [current?.id]);
  useEffect(() => { if (showTranscript) loadCurrentTranscript(); }, [showTranscript, current?.id]);

  const hits = useMemo(() => searchWords(transcript, tQuery), [transcript, tQuery]);
  const activeIdx = useMemo(() => {
    if (!transcript.length) return -1;
    let idx = -1;
    for (let i = 0; i < transcript.length; i++) { if (transcript[i].t <= time) idx = i; else break; }
    return idx;
  }, [transcript, time]);

  const pct = duration ? time / duration : 0;
  const tTitle = useTr(current?.title ?? '');
  const tHost = useTr(current?.host ?? '');
  const tDesc = useTr(current?.desc ?? '');

  return (
    <AnimatePresence>
      {current && expanded && (
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          className="fixed inset-0 z-40 bg-[#F4F0FF] text-[#1A0B3D]">
          <div className="h-full overflow-y-auto px-5 pt-5 pb-10 flex flex-col">
            <div className="flex items-center justify-between">
              <button onClick={() => setExpanded(false)} className="p-2 rounded-full bg-white shadow-sm ring-1 ring-[#E8E0FF]"><ArrowLeft className="w-5 h-5" /></button>
              <span className="text-sm font-bold">Lecteur podcast</span>
              <button className="p-2 rounded-full bg-white shadow-sm ring-1 ring-[#E8E0FF]"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            <div className="mt-6 mx-auto w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-[#6C4BFF] via-[#7C5CFC] to-[#3B1E8A]">
              <PodcastCharacter className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white pointer-events-none">
                <div className="text-[10px] font-black tracking-[0.3em]">PODCAST</div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest opacity-80">EP · {current.id.toUpperCase()}</div>
                  <div className="font-black text-xl leading-tight mt-1 drop-shadow-md">{tTitle}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <div className="font-black text-lg">{tTitle}</div>
              <p className="text-slate-500 text-sm mt-0.5">{tHost}</p>
            </div>

            <div className="mt-5">
              <Waveform progress={pct} onSeek={(p) => seekTo(p * (duration || 0))} />
              <div className="flex justify-between text-xs text-slate-500 mt-1 font-bold">
                <span>{fmtTime(time)}</span><span>{fmtTime(duration)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-5">
              <button onClick={() => setPrefs({ shuffle: !prefs.shuffle })} aria-label="Aléatoire"
                className={`p-2.5 rounded-full ${prefs.shuffle ? 'text-[#6C4BFF] bg-[#E8E0FF]' : 'text-slate-500'}`}>
                <Shuffle className="w-5 h-5" />
              </button>
              <button onClick={() => seek(-15)} className="p-3 text-[#1A0B3D]"><SkipBack className="w-7 h-7 fill-current" /></button>
              <button onClick={toggle} className="w-16 h-16 rounded-full bg-[#6C4BFF] text-white grid place-items-center shadow-xl shadow-[#6C4BFF]/40 active:scale-95 transition">
                {playing ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
              <button onClick={() => seek(15)} className="p-3 text-[#1A0B3D]"><SkipForward className="w-7 h-7 fill-current" /></button>
              <button onClick={() => setPrefs({ repeat: !prefs.repeat })} aria-label="Répéter"
                className={`p-2.5 rounded-full ${prefs.repeat ? 'text-[#6C4BFF] bg-[#E8E0FF]' : 'text-slate-500'}`}>
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                <button key={r} onClick={() => setPrefs({ rate: r })}
                  className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${prefs.rate === r ? 'bg-[#6C4BFF] text-white ring-transparent' : 'bg-white text-slate-700 ring-[#E8E0FF]'}`}>
                  ×{r}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              <button onClick={() => toggleFav(current.id)} className={`px-4 py-2 rounded-full text-sm font-bold ring-1 ${isFav(current.id) ? 'bg-rose-500 text-white ring-transparent' : 'bg-white text-slate-700 ring-[#E8E0FF]'}`}>
                <Heart className={`w-4 h-4 inline mr-1 ${isFav(current.id) ? 'fill-current' : ''}`} /> Favori
              </button>
              <button onClick={() => toggleDownload(current)} disabled={downloadingId === current.id}
                className={`px-4 py-2 rounded-full text-sm font-bold ring-1 disabled:opacity-60 ${isDownloaded(current.id) ? 'bg-emerald-500 text-white ring-transparent' : 'bg-white text-slate-700 ring-[#E8E0FF]'}`}>
                {downloadingId === current.id
                  ? <><Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> {downloadPct}%</>
                  : <><Download className={`w-4 h-4 inline mr-1 ${isDownloaded(current.id) ? 'fill-current' : ''}`} /> {isDownloaded(current.id) ? 'Hors-ligne' : 'Télécharger'}</>}
              </button>
              <button className="px-4 py-2 rounded-full text-sm font-bold bg-white text-slate-700 ring-1 ring-[#E8E0FF]"><Share2 className="w-4 h-4 inline mr-1" /> Partager</button>
            </div>

            <div className="mt-6 rounded-2xl bg-white ring-1 ring-[#E8E0FF] p-4">
              <div className="font-black text-sm mb-1">À propos de l'épisode</div>
              <p className="text-sm text-slate-600 leading-relaxed">{tDesc}</p>
            </div>

            <button onClick={() => setShowTranscript((v) => !v)} className="mt-4 w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-white ring-1 ring-[#E8E0FF]">
              <span className="font-bold text-sm">Transcription cherchable</span>
              <span className="text-xs text-slate-500">{showTranscript ? 'Masquer' : 'Afficher'}</span>
            </button>

            {showTranscript && (
              <div className="mt-3 rounded-2xl bg-white ring-1 ring-[#E8E0FF] p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={tQuery} onChange={(e) => setTQuery(e.target.value)}
                    placeholder="Chercher un mot dans la transcription…"
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F4F0FF] ring-1 ring-[#E8E0FF] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C4BFF]" />
                </div>
                {transcriptLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Génération via Whisper…
                  </div>
                )}
                {!transcriptLoading && transcript.length === 0 && (
                  <div className="text-sm text-slate-500 py-2">Transcription indisponible.</div>
                )}
                {!transcriptLoading && transcript.length > 0 && (
                  <>
                    {tQuery && <div className="text-xs text-slate-500 mb-2">{hits.size} résultat{hits.size > 1 ? 's' : ''}</div>}
                    <div className="text-sm leading-relaxed max-h-72 overflow-y-auto pr-1">
                      {transcript.map((tw, i) => {
                        const isHit = hits.has(i);
                        const isActive = i === activeIdx;
                        return (
                          <button key={i} onClick={() => seekTo(tw.t)} title={fmtTime(tw.t)}
                            className={`px-0.5 rounded transition ${
                              isActive ? 'bg-[#6C4BFF] text-white font-bold' :
                              isHit ? 'bg-[#E8E0FF] text-[#3B1E8A] font-bold' :
                              'text-slate-700 hover:bg-[#F4F0FF]'
                            }`}>
                            {tw.w}{' '}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
