import { useEffect, useMemo, useState } from 'react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { HAPPY, HappyImage } from '../../images';
import { Trophy, Shuffle } from 'lucide-react';

const SCENES: { id: string; label: string; img: HappyImage }[] = [
  { id: 'lagune', label: 'Lagune Ganvié', img: 'zenLines' },
  { id: 'village', label: 'Village du Sahel', img: 'villageHouses' },
  { id: 'wax', label: 'Marché de wax', img: 'waxBright' },
  { id: 'sky', label: 'Ciel étoilé', img: 'starsClouds' },
];

const SIZES = [3, 4, 5] as const;

export default function PuzzleGame() {
  const [size, setSize] = useState<3 | 4 | 5>(3);
  const [scene, setScene] = useState(SCENES[0]);
  const [order, setOrder] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const total = size * size;

  const reset = () => {
    const a = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    setOrder(a);
    setMoves(0);
  };

  useEffect(() => { reset(); /* eslint-disable-next-line */ }, [size, scene]);

  const solved = useMemo(() => order.every((v, i) => v === i) && order.length > 0, [order]);

  const swap = (i: number) => {
    setOrder((prev) => {
      const empty = prev.indexOf(prev.length - 1); // not used; we'll just allow swapping with neighbour by clicking pairs
      const next = [...prev];
      [next[i], next[empty]] = [next[empty], next[i]];
      return next;
    });
    setMoves((m) => m + 1);
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => setScene(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${scene.id === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-stone-200 text-stone-700'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 relative" style={{ aspectRatio: '1 / 1' }}>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}>
          {order.map((piece, idx) => {
            const row = Math.floor(piece / size);
            const col = piece % size;
            const isLast = piece === total - 1;
            return (
              <button
                key={idx}
                onClick={() => !isLast && swap(idx)}
                className={`relative overflow-hidden border border-white/40 ${isLast ? 'bg-stone-900' : ''}`}
              >
                {!isLast && (
                  <div
                    className="absolute"
                    style={{
                      width: `${size * 100}%`,
                      height: `${size * 100}%`,
                      left: `-${col * 100}%`,
                      top: `-${row * 100}%`,
                    }}
                  >
                    <ImageWithFallback src={HAPPY[scene.img]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {solved && (
          <div className="absolute inset-0 bg-stone-950/70 flex flex-col items-center justify-center text-white">
            <Trophy className="w-10 h-10 text-amber-400" />
            <div className="mt-2 text-xl font-bold">Bravo !</div>
            <div className="text-sm opacity-85">Résolu en {moves} coups</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-stone-500">{moves} coups · {size}x{size}</div>
        <div className="flex items-center gap-2">
          {SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`w-8 h-8 rounded-full text-xs font-bold ${size === n ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            >
              {n}²
            </button>
          ))}
          <button onClick={reset} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white">
            <Shuffle className="w-3.5 h-3.5" /> Mélanger
          </button>
        </div>
      </div>
    </div>
  );
}
