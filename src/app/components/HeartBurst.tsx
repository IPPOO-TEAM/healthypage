import { AnimatePresence, motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface HeartBurstProps {
  trigger: number; // increment to fire a new burst
  size?: number;
  particleCount?: number;
}

export default function HeartBurst({ trigger, size = 40, particleCount = 10 }: HeartBurstProps) {
  if (!trigger) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-[60]">
      <AnimatePresence>
        <motion.span
          key={`pulse-${trigger}`}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute rounded-full bg-red-400/50"
          style={{ width: size, height: size }}
        />
        <motion.div
          key={`core-${trigger}`}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.4, 1], rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute"
        >
          <Heart className="fill-red-500 text-red-500" style={{ width: size, height: size }} />
        </motion.div>
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = 50 + Math.random() * 30;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const delay = Math.random() * 0.05;
          return (
            <motion.span
              key={`p-${trigger}-${i}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ x, y, opacity: 0, scale: 1 }}
              transition={{ duration: 0.7, delay, ease: 'easeOut' }}
              className="absolute"
            >
              <Heart
                className={`${i % 2 === 0 ? 'fill-red-400 text-red-400' : 'fill-pink-400 text-pink-400'}`}
                style={{ width: 14, height: 14 }}
              />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
