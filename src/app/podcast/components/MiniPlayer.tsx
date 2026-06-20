import { Play, Pause, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { fmtTime } from './EpisodeCard';
import { useTr } from '../../i18n';

export default function MiniPlayer() {
  const { current, playing, time, duration, expanded, setExpanded, toggle, stop } = usePodcastPlayer();
  const title = useTr(current?.title ?? '');
  const host = useTr(current?.host ?? '');
  return (
    <AnimatePresence>
      {current && !expanded && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-14 left-2 right-2 z-30">
          <div onClick={() => setExpanded(true)} className="rounded-2xl bg-gradient-to-r from-[#3B1E8A] to-[#6C4BFF] text-white shadow-2xl ring-1 ring-white/10 overflow-hidden cursor-pointer">
            <div className="h-1 bg-white/10">
              <div className="h-full bg-[#FFD24C]" style={{ width: `${(time / (duration || 1)) * 100}%` }} />
            </div>
            <div className="flex items-center gap-3 p-3">
              <ImageWithFallback src={current.cover} alt="" className="w-11 h-11 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{title}</div>
                <div className="text-[11px] text-white/70 truncate">{host} • {fmtTime(time)} / {fmtTime(duration)}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-10 h-10 rounded-full bg-[#FFD24C] text-[#1A0B3D] grid place-items-center shadow">
                {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); stop(); }} aria-label="Fermer" className="p-1.5 rounded-full hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
