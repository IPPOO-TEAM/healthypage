import { useEffect } from 'react';
import { motion } from 'motion/react';
import logo from '../../imports/1.png';

interface Props { onDone: () => void; }

const BASE = 'https://images.unsplash.com/';
const Q = '?auto=format&fit=crop&w=400&h=400&q=70';

// Health-only references: doctors, stethoscopes, nurses, healthy food, wellness
const ROW_1 = [
  'photo-1576669801945-7a346954da5a',
  'photo-1666887360316-a8872b3556b4',
  'photo-1666887359800-60e37f543dbd',
  'photo-1648775270988-910b784da8cc',
  'photo-1635545999375-057ee4013deb',
  'photo-1666886573583-9839aafe43cf',
  'photo-1666887360388-93e684b6474a'
];

const ROW_2 = [
  'photo-1576091160399-112ba8d25d1d',
  'photo-1666886573460-d660a09bc044',
  'photo-1666887360541-e9a3cec344be',
  'photo-1645652367526-a0ecb717650a',
  'photo-1666887360921-85952a86894f',
  'photo-1648775271007-435bb750fb1b',
  'photo-1666887360476-7eaa054d1abd'
];

const ROW_3 = [
  'photo-1666887360445-e3b7bba7917c',
  'photo-1666886573681-a8fbe983a3fd',
  'photo-1666887360364-4919ae373fcb',
  'photo-1767611104976-86ce57776dc3',
  'photo-1666886573206-e31fe221db88',
  'photo-1653983613420-5c767477a9ad',
  'photo-1767611118479-3f3a8704c8ba'
];

export default function SplashGridScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex flex-col">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[200%] h-[200%] flex flex-col justify-center gap-2"
          style={{ transform: 'rotate(-10deg)' }}
        >
          <Row images={ROW_1} duration={28} reverse={false} />
          <Row images={ROW_2} duration={32} reverse={true} />
          <Row images={ROW_3} duration={26} reverse={false} />
          <Row images={ROW_1} duration={30} reverse={true} />
          <Row images={ROW_2} duration={26} reverse={false} />
          <Row images={ROW_3} duration={34} reverse={true} />
          <Row images={ROW_1} duration={28} reverse={false} />
          <Row images={ROW_2} duration={32} reverse={true} />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white from-[30%] to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-12"
      >
        <img src={logo} alt="Healthy Page" className="w-40 h-40 drop-shadow-lg" />
      </motion.div>
    </div>
  );
}

function Row({ images, duration, reverse }: { images: string[]; duration: number; reverse: boolean }) {
  const doubled = [...images, ...images];
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex gap-3 w-fit"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((id, i) => (
          <div key={`${id}-${i}`} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-slate-100">
            <img
              src={`${BASE}${id}${Q}`}
              alt=""
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
