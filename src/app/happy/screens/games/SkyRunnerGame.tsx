import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react';

export default function SkyRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    y: 0, vy: 0, ground: 0, running: false, paused: false,
    obstacles: [] as { x: number; w: number; h: number }[],
    stars: [] as { x: number; y: number }[],
    score: 0, best: 0, speed: 4, t: 0,
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('happy:skyrunner:best') || 0));
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    stateRef.current.ground = H - 50;
    stateRef.current.y = stateRef.current.ground;

    let raf = 0;
    const loop = () => {
      const s = stateRef.current;
      // background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(0.6, '#db2777');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // stars background
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 30; i++) {
        const x = (i * 53 - s.t * 0.3) % W;
        const xx = x < 0 ? x + W : x;
        ctx.fillRect(xx, (i * 17) % (H - 80), 2, 2);
      }

      // ground
      ctx.fillStyle = 'rgba(20,10,30,0.8)';
      ctx.fillRect(0, s.ground + 30, W, H - s.ground - 30);

      if (s.running && !s.paused) {
        s.t += 1;
        s.vy += 0.6;
        s.y += s.vy;
        if (s.y > s.ground) { s.y = s.ground; s.vy = 0; }
        s.score += 1;

        // spawn
        if (s.t % 60 === 0) {
          s.obstacles.push({ x: W, w: 20 + Math.random() * 18, h: 28 + Math.random() * 30 });
        }
        if (s.t % 90 === 0) {
          s.stars.push({ x: W, y: s.ground - 60 - Math.random() * 60 });
        }
        s.obstacles.forEach((o) => o.x -= s.speed);
        s.stars.forEach((st) => st.x -= s.speed);
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > 0);
        s.stars = s.stars.filter((st) => st.x > -10);

        // collisions
        const px = 60, pw = 28, ph = 36;
        const py = s.y - ph;
        for (const o of s.obstacles) {
          if (px + pw > o.x && px < o.x + o.w && py + ph > s.ground - o.h) {
            s.running = false;
            setRunning(false);
            setOver(true);
            const b = Math.max(s.best, s.score);
            s.best = b;
            setBest(b);
            localStorage.setItem('happy:skyrunner:best', String(b));
          }
        }
        s.stars = s.stars.filter((st) => {
          if (px + pw > st.x - 8 && px < st.x + 8 && py + ph > st.y - 8 && py < st.y + 8) {
            s.score += 50;
            return false;
          }
          return true;
        });

        if (s.t % 600 === 0) s.speed += 0.5;
        setScore(s.score);
      }

      // obstacles
      ctx.fillStyle = '#1f2937';
      s.obstacles.forEach((o) => ctx.fillRect(o.x, s.ground - o.h, o.w, o.h));

      // stars collectibles
      s.stars.forEach((st) => {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(st.x, st.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // player
      ctx.fillStyle = '#fff';
      ctx.fillRect(60, s.y - 36, 28, 36);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(60, s.y - 36, 28, 8);

      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const jump = () => {
    const s = stateRef.current;
    if (!s.running) return;
    if (s.y >= s.ground - 1) s.vy = -12;
  };

  const start = () => {
    const s = stateRef.current;
    s.running = true; s.paused = false; s.score = 0; s.obstacles = []; s.stars = []; s.speed = 4; s.t = 0; s.y = s.ground; s.vy = 0;
    setScore(0); setOver(false); setRunning(true);
  };

  const togglePause = () => {
    stateRef.current.paused = !stateRef.current.paused;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <span className="font-bold text-stone-900">{score}</span>
          <span className="text-xs text-stone-500"> · meilleur {best}</span>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button onClick={togglePause} className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={start} className="px-4 py-2 rounded-full bg-fuchsia-600 text-white text-sm font-semibold inline-flex items-center gap-1.5">
              <Play className="w-4 h-4 fill-white" /> {over ? 'Rejouer' : 'Lancer'}
            </button>
          )}
          {over && (
            <button onClick={start} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="relative rounded-3xl overflow-hidden border-4 border-fuchsia-900/30 shadow-inner" style={{ aspectRatio: '4 / 5' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={jump}
          className="w-full h-full touch-none"
        />
        {!running && over && (
          <div className="absolute inset-0 bg-stone-950/70 flex flex-col items-center justify-center text-white">
            <Trophy className="w-10 h-10 text-amber-400" />
            <div className="mt-2 text-xl font-bold">{score} points</div>
            <div className="text-sm opacity-85">Tape pour sauter et esquiver les obstacles</div>
          </div>
        )}
        {!running && !over && (
          <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center text-white text-sm">
            Tape "Lancer" pour démarrer
          </div>
        )}
      </div>
      <div className="text-[11px] text-stone-500 mt-2 text-center">Tape sur l'écran pour sauter · attrape les étoiles ✨</div>
    </div>
  );
}
