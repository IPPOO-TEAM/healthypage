import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eraser, PenLine, Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSign: (sig: { dataUrl: string; hash: string; signedAt: string }) => Promise<void> | void;
  payload: unknown;
  signerName?: string;
  title?: string;
}

const canonicalize = (v: any): string => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(v[k])).join(',') + '}';
};

const sha256Hex = async (input: string): Promise<string> => {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export default function SignatureModal({ open, onClose, onSign, payload, signerName, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#0f172a';
    setHasInk(false);
  }, [open]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  };
  const onUp = () => { drawingRef.current = false; };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    setHasInk(false);
  };

  const submit = async () => {
    if (!hasInk) { setErr('Veuillez signer dans la zone ci-dessus.'); return; }
    setSubmitting(true);
    setErr(null);
    try {
      const dataUrl = canvasRef.current!.toDataURL('image/png');
      const signedAt = new Date().toISOString();
      const canonical = canonicalize({ payload, signerName: signerName ?? '', signedAt });
      const hash = await sha256Hex(canonical);
      await onSign({ dataUrl, hash, signedAt });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Signature impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="sig-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
        >
          <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
                <PenLine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-indigo-600 font-semibold">Signature électronique</p>
                <h2 className="font-bold text-slate-900">{title ?? 'Signer le document'}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
          </header>

          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-600">
              Tracez votre signature ci-dessous. Le document sera scellé avec un hash SHA-256 horodaté garantissant son intégrité.
            </p>
            <div className="relative bg-slate-50 rounded-2xl ring-1 ring-slate-200">
              <canvas
                ref={canvasRef}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerLeave={onUp}
                className="w-full h-48 touch-none"
                style={{ touchAction: 'none' }}
              />
              {!hasInk && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-400 italic text-sm">
                  Signez ici…
                </span>
              )}
              <button
                onClick={clear}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/90 hover:bg-white text-xs text-slate-700 inline-flex items-center gap-1 shadow-sm"
              >
                <Eraser className="w-3 h-3" /> Effacer
              </button>
            </div>
            {signerName && <p className="text-xs text-slate-500">Signataire : <span className="font-semibold text-slate-700">{signerName}</span></p>}
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold">Annuler</button>
              <button
                onClick={submit}
                disabled={submitting || !hasInk}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Scellement…</> : <><ShieldCheck className="w-4 h-4" /> Signer</>}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
