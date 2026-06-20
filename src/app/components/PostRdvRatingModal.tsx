import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Loader2, Send, Stethoscope } from 'lucide-react';
import { api } from './api';

interface Props {
  open: boolean;
  onClose: () => void;
  rdv: { id: string | number; doctor?: string; specialty?: string; proId?: string; date?: string; time?: string };
  patientId: string;
  patientName: string;
  onSubmitted?: () => void;
}

const RATED_KEY = (rdvId: string | number) => `healthy-page:rated:${rdvId}`;

export const isRdvRated = (rdvId: string | number) => {
  try { return !!localStorage.getItem(RATED_KEY(rdvId)); } catch { return false; }
};
export const markRdvRated = (rdvId: string | number) => {
  try { localStorage.setItem(RATED_KEY(rdvId), '1'); } catch {}
};

export default function PostRdvRatingModal({ open, onClose, rdv, patientId, patientName, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    if (!rating || !rdv.proId) {
      setError(!rating ? 'Choisissez une note de 1 à 5 étoiles.' : 'Praticien introuvable.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.createProReview(rdv.proId, {
        rating,
        comment: comment.trim() || undefined,
        patientId,
        patientName,
        rdvId: String(rdv.id),
      });
      markRdvRated(rdv.id);
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Envoi impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    markRdvRated(rdv.id);
    onClose();
  };

  const labels = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];
  const display = hover || rating;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={skip}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
        >
          <header className="px-5 py-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold">Notez votre consultation</p>
                <h2 className="font-bold">Votre avis compte</h2>
              </div>
            </div>
            <button onClick={skip} className="p-2 rounded-lg hover:bg-white/15"><X className="w-5 h-5" /></button>
          </header>

          <div className="p-5 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{rdv.doctor ?? 'Praticien'}</p>
                <p className="text-xs text-slate-500 truncate">{rdv.specialty ?? ''}{rdv.date ? ` · ${rdv.date}` : ''}{rdv.time ? ` ${rdv.time}` : ''}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1.5 transition-transform hover:scale-110"
                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  >
                    <Star className={`w-9 h-9 ${n <= display ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 h-4 mt-1">{labels[display] || 'Touchez une étoile'}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Accueil, écoute, qualité du soin…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={400}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={skip} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold">Plus tard</button>
              <button
                onClick={submit}
                disabled={submitting || !rating}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Send className="w-4 h-4" /> Publier</>}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">Votre avis est public sur le profil du praticien.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
