import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Stethoscope, Star, MapPin, Phone, Mail, BadgeCheck, Calendar, Loader2, MessageSquare, Send, BellRing, BellOff } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import SlotPickerModal from '../components/SlotPickerModal';

interface Props {
  proId: string;
  onBack: () => void;
  patientName?: string;
}

interface Pro {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  city?: string;
  ville?: string;
  photo?: string;
  tarif?: number | string;
  licence?: string;
  type?: string;
  activity?: string;
  bio?: string;
  contact?: { phonePro?: string; emailPro?: string };
  availability?: { days?: string[]; openHours?: string; closeHours?: string };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  patientName?: string;
  createdAt?: string;
}

const proLabel = (p: Pro) => p.name?.trim() || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Praticien';
const cityOf = (p: Pro) => p.city ?? p.ville ?? '';

const fmtDate = (iso?: string) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

export default function ProPublicProfileScreen({ proId, onBack, patientName }: Props) {
  const [pro, setPro] = useState<Pro | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const [waitlistEntry, setWaitlistEntry] = useState<{ id: string } | null>(null);
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [waitlistMsg, setWaitlistMsg] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, rs] = await Promise.all([
        api.getPro(proId).catch(() => null),
        api.listProReviews(proId).catch(() => [] as Review[]),
      ]);
      setPro(p as Pro);
      setReviews((rs ?? []) as Review[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [proId]);

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    api.listWaitlistForPro(proId).then((list) => {
      const mine = (list ?? []).find((w: any) => w.patientId === pid);
      if (mine) setWaitlistEntry({ id: mine.id });
    }).catch(() => {});
  }, [proId]);

  const toggleWaitlist = async () => {
    const pid = getPatientId();
    if (!pid) { setWaitlistMsg('Connectez-vous pour rejoindre la liste.'); return; }
    setWaitlistBusy(true);
    setWaitlistMsg(null);
    try {
      if (waitlistEntry) {
        await api.leaveWaitlist(proId, waitlistEntry.id);
        setWaitlistEntry(null);
        setWaitlistMsg('Retiré de la liste d\'attente.');
      } else {
        const res = await api.joinWaitlist(proId, {
          patientId: pid,
          patientName: patientName ?? 'Patient',
          specialty: pro?.specialty,
        });
        setWaitlistEntry({ id: (res as any).id });
        setWaitlistMsg('Inscrit ! Vous serez notifié dès qu\'un créneau se libère.');
      }
    } catch (e: any) {
      setWaitlistMsg(e?.message ?? 'Action impossible.');
    } finally {
      setWaitlistBusy(false);
      setTimeout(() => setWaitlistMsg(null), 4000);
    }
  };

  const avgRating = useMemo(() => {
    const ns = reviews.map((r) => Number(r.rating ?? 0)).filter((n) => n > 0);
    return ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : 0;
  }, [reviews]);

  const submitReview = async () => {
    const pid = getPatientId();
    if (!pid) { setError('Connectez-vous pour laisser un avis.'); return; }
    if (newRating < 1 || newRating > 5) { setError('Note invalide.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await api.createProReview(proId, {
        rating: newRating,
        comment: newComment.trim() || undefined,
        patientId: pid,
        patientName: patientName ?? 'Patient',
      });
      setNewComment('');
      setNewRating(5);
      setThanks(true);
      setTimeout(() => setThanks(false), 2500);
      refresh();
    } catch (e: any) {
      setError(e?.message || "Impossible d'envoyer l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-700">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="bg-white rounded-2xl p-8 text-center text-slate-600">Praticien introuvable.</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center overflow-hidden flex-shrink-0">
            {pro.photo ? <img src={pro.photo} alt="" className="w-full h-full object-cover" /> : <Stethoscope className="w-9 h-9 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold truncate">{proLabel(pro)}</h2>
              {pro.licence && <BadgeCheck className="w-5 h-5 text-emerald-200" />}
            </div>
            <p className="text-sm text-white/90">{pro.specialty ?? '—'}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/80">
              {cityOf(pro) && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {cityOf(pro)}</span>}
              {avgRating > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {avgRating.toFixed(1)} <span className="font-normal opacity-80">({reviews.length})</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="mt-5 w-full py-3 rounded-2xl bg-white text-emerald-700 font-bold shadow-lg inline-flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Voir les créneaux & réserver
        </button>
        <button
          onClick={toggleWaitlist}
          disabled={waitlistBusy}
          className={`mt-2 w-full py-2.5 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 transition ${
            waitlistEntry ? 'bg-white/15 text-white border border-white/30' : 'bg-white/90 text-emerald-700'
          } disabled:opacity-60`}
        >
          {waitlistBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : waitlistEntry ? <BellOff className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
          {waitlistEntry ? 'Quitter la liste d\'attente' : 'Me prévenir si un créneau se libère'}
        </button>
        {waitlistMsg && <p className="mt-2 text-xs text-white/95 text-center">{waitlistMsg}</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Informations</p>
        {pro.bio && <p className="text-sm text-slate-700 leading-relaxed">{pro.bio}</p>}
        {pro.contact?.phonePro && (
          <a href={`tel:${pro.contact.phonePro}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-700">
            <Phone className="w-4 h-4 text-emerald-600" /> {pro.contact.phonePro}
          </a>
        )}
        {pro.contact?.emailPro && (
          <a href={`mailto:${pro.contact.emailPro}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-700">
            <Mail className="w-4 h-4 text-emerald-600" /> {pro.contact.emailPro}
          </a>
        )}
        {pro.availability?.openHours && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">Horaires :</span> {pro.availability.openHours}{pro.availability.closeHours ? ` – ${pro.availability.closeHours}` : ''}
          </p>
        )}
        {pro.tarif && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">Tarif :</span> {String(pro.tarif)}{Number(pro.tarif) ? ' XOF' : ''}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avis ({reviews.length})</p>
          {avgRating > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm">
              <Star className="w-4 h-4 fill-amber-500" /> {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 space-y-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setNewRating(n)} aria-label={`${n} étoiles`}>
                <Star className={`w-6 h-6 ${n <= newRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Partagez votre expérience (optionnel)…"
            rows={2}
            className="w-full px-3 py-2 bg-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm border border-slate-200"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {thanks && <p className="text-xs text-emerald-700 inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Merci pour votre avis !</p>}
          <button
            disabled={submitting}
            onClick={submitReview}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Send className="w-4 h-4" /> Publier l'avis</>}
          </button>
        </div>

        {reviews.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun avis pour le moment.</p>}
        <div className="space-y-2">
          {reviews.slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-slate-900">{r.patientName ?? 'Patient'}</p>
                <span className="text-xs text-slate-500">{fmtDate(r.createdAt)}</span>
              </div>
              <div className="flex items-center gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                ))}
              </div>
              {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
            </motion.div>
          ))}
        </div>
      </div>

      <SlotPickerModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        proId={pro.id}
        patientName={patientName ?? 'Patient'}
      />
    </div>
  );
}
