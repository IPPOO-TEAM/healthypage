import { useEffect, useRef, useState } from 'react';
import { Sparkles, Eraser, Mountain, Trees, RotateCcw } from 'lucide-react';

type Tool = 'rake' | 'stone' | 'plant' | 'erase';
type Item = { id: number; type: 'stone' | 'plant'; x: number; y: number };

export default function ZenGardenGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('rake');
  const [items, setItems] = useState<Item[]>([]);
  const [draws, setDraws] = useState(0);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    paintSand(ctx, rect.width, rect.height);
  }, []);

  const paintSand = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5e9d4');
    grad.addColorStop(1, '#e9d6b4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  const reset = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const rect = c.getBoundingClientRect();
    paintSand(ctx, rect.width, rect.height);
    setItems([]);
    setDraws(0);
  };

  const pos = (e: React.PointerEvent) => {
    const r = (e.target as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    const p = pos(e);
    if (tool === 'rake') {
      drawing.current = true;
      last.current = p;
    } else if (tool === 'stone' || tool === 'plant') {
      setItems((prev) => [...prev, { id: Date.now() + Math.random(), type: tool, x: p.x, y: p.y }]);
    } else if (tool === 'erase') {
      setItems((prev) => prev.filter((it) => Math.hypot(it.x - p.x, it.y - p.y) > 28));
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || tool !== 'rake' || !last.current) return;
    const p = pos(e);
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = 'rgba(150, 110, 60, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i += 3) {
      ctx.beginPath();
      ctx.moveTo(last.current.x + i, last.current.y + i * 0.2);
      ctx.lineTo(p.x + i, p.y + i * 0.2);
      ctx.stroke();
    }
    last.current = p;
    setDraws((d) => d + 1);
  };

  const onUp = () => { drawing.current = false; last.current = null; };

  const Tools: { id: Tool; label: string; Icon: any; color: string }[] = [
    { id: 'rake', label: 'Ratisser', Icon: Sparkles, color: 'bg-amber-500' },
    { id: 'stone', label: 'Pierre', Icon: Mountain, color: 'bg-stone-700' },
    { id: 'plant', label: 'Bambou', Icon: Trees, color: 'bg-emerald-600' },
    { id: 'erase', label: 'Gomme', Icon: Eraser, color: 'bg-rose-500' },
  ];

  return (
    <div>
      <div className="rounded-3xl overflow-hidden border-4 border-amber-900/20 shadow-inner relative bg-amber-100" style={{ aspectRatio: '4 / 5' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="w-full h-full touch-none"
        />
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute pointer-events-none"
            style={{ left: it.x, top: it.y, transform: 'translate(-50%, -50%)' }}
          >
            {it.type === 'stone' ? (
              <div className="w-10 h-7 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 shadow-md" />
            ) : (
              <div className="text-3xl drop-shadow">🎍</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-stone-500">{draws} traits · {items.length} éléments</div>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700">
          <RotateCcw className="w-3.5 h-3.5" /> Recommencer
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {Tools.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition ${
              tool === id ? 'border-stone-900 bg-white shadow' : 'border-stone-200 bg-white/60'
            }`}
          >
            <span className={`w-8 h-8 rounded-xl ${color} text-white flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-medium text-stone-800">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
