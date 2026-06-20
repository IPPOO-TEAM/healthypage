import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Send, Trash2, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getCenter } from '../components/centers';
import { getPatientId } from '../components/usePatientId';

interface Props {
  centerId: number;
  onBack: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  patientId?: string;
  patientName?: string;
  createdAt?: string;
}

export default function RateCenterScreen({ centerId, onBack }: Props) {
  const center = getCenter(centerId);
  const pid = getPatientId();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState<{ firstName?: string; lastName?: string } | null>(null);

  useEffect(() => {
    api.listCentreReviews(centerId)
      .then((rs) => setReviews((rs as Review[]).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))))
      .catch((e) => setError(e?.message ?? 'Chargement impossible'))
      .finally(() => setLoading(false));
    if (pid) api.getPatient(pid).then((r: any) => setMe(r?.patient ?? null)).catch(() => {});
  }, [centerId, pid]);

  const submit = async () => {
    if (!pid) { setError('Connectez-vous pour laisser un avis.'); return; }
    if (rating === 0) { setError('Choisissez une note.'); return; }
    if (!comment.trim()) { setError('Ajoutez un commentaire.'); return; }
    setError(null);
    setBusy(true);
    try {
      const patientName = me ? `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim() : '';
      const r = await api.createCentreReview(centerId, {
        rating,
        comment: comment.trim(),
        patientId: pid,
        patientName: patientName || 'Patient',
      });
      setReviews((arr) => [r as Review, ...arr]);
      setRating(0);
      setComment('');
    } catch (e: any) {
      setError(e?.message ?? 'Envoi impossible');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteCentreReview(centerId, id);
      setReviews((arr) => arr.filter((r) => r.id !== id));
    } catch (e: any) { setError(e?.message ?? 'Suppression impossible'); }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : (center?.rating ?? 0);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Star className="w-7 h-7 fill-white" /></div>
          <div>
            <h2 className="text-2xl font-bold">Noter & avis</h2>
            <p className="text-sm text-white/85">{center?.name ?? 'Centre'}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 inline-flex items-center gap-2">
            <Star className="w-5 h-5 fill-white" />
            <span className="text-lg font-bold">{avg.toFixed(1)}</span>
            <span className="text-xs text-white/80">/ 5</span>
          </div>
          <p className="text-sm text-white/90">{reviews.length} avis patients</p>
        </div>
      </div>

      <div className="relative h-32 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=1080" alt="Avis patients" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Votre avis compte · améliorer ensemble la qualité des soins</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900">Laisser un avis</h3>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience (accueil, soins, propreté…)"
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{comment.length}/500</span>
        </div>
        <button
          onClick={submit}
          disabled={busy || rating === 0 || !comment.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {busy ? 'Envoi…' : 'Publier mon avis'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Avis ({reviews.length})</h3>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Chargement…</p>
        ) : reviews.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">Aucun avis pour le moment. Soyez le premier !</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <motion.li key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center font-semibold shrink-0">
                  {(r.patientName ?? 'P').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">{r.patientName || 'Patient'}</p>
                    {r.patientId === pid && (
                      <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 my-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                    {r.createdAt && (
                      <span className="text-xs text-gray-500 ml-1">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{r.comment}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
