import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, CalendarX, Loader2, ShieldCheck, MapPin, Stethoscope, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../components/api';

interface Props { token: string; onDone?: () => void; }

export default function RdvActionScreen({ token, onDone }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ rdv: any; patientName: string } | null>(null);
  const [submitting, setSubmitting] = useState<'confirm' | 'cancel' | null>(null);
  const [done, setDone] = useState<'confirmed' | 'cancelled' | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getRdvByToken(token)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Lien invalide'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [token]);

  const act = async (action: 'confirm' | 'cancel') => {
    setSubmitting(action);
    setError(null);
    try {
      const res = await api.rdvAction(token, action);
      setData((d) => d ? { ...d, rdv: res.rdv } : d);
      setDone(action === 'confirm' ? 'confirmed' : 'cancelled');
    } catch (e: any) {
      setError(e?.message ?? 'Action impossible');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg">Lien invalide ou expiré</h1>
          <p className="text-sm text-gray-600">{error ?? 'Ce lien de confirmation n\'est plus valide.'}</p>
          <button onClick={onDone} className="mt-2 px-5 py-2.5 rounded-xl bg-gray-100 text-sm font-medium">Fermer</button>
        </div>
      </div>
    );
  }

  const r = data.rdv;
  const status = r.status as string;
  const isConfirmed = status === 'confirmed' || done === 'confirmed';
  const isCancelled = status === 'cancelled' || done === 'cancelled';
  const lockedFinal = (isConfirmed && done === 'confirmed') || (isCancelled && done === 'cancelled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">Healthy Page · Confirmation RDV</p>
          </div>
          <h1 className="text-xl font-bold">Bonjour {data.patientName.split(' ')[0]}</h1>
          <p className="text-sm text-white/85 mt-1">Confirmez ou annulez ce rendez-vous en un clic.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-gray-900">{r.doctor ?? 'Praticien'}</span>
              {r.specialty && <span className="text-gray-500">· {r.specialty}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{r.date} à {r.time}</span>
            </div>
            {r.location && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>{r.location}</span>
              </div>
            )}
            {r.type === 'tele' && (
              <span className="inline-block text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">Téléconsultation</span>
            )}
          </div>

          {done && (
            <div className={`rounded-2xl p-4 text-center ${done === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {done === 'confirmed' ? (
                <><CalendarCheck className="w-7 h-7 mx-auto mb-1" /><p className="font-semibold">Rendez-vous confirmé</p><p className="text-xs mt-1">Merci, le praticien a été notifié.</p></>
              ) : (
                <><CalendarX className="w-7 h-7 mx-auto mb-1" /><p className="font-semibold">Rendez-vous annulé</p><p className="text-xs mt-1">Le créneau a été libéré pour un autre patient.</p></>
              )}
            </div>
          )}

          {!done && status === 'confirmed' && (
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">Ce RDV est déjà confirmé. Vous pouvez encore l'annuler si besoin.</p>
          )}
          {!done && status === 'cancelled' && (
            <p className="text-sm text-rose-700 bg-rose-50 rounded-xl p-3">Ce RDV est annulé.</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!lockedFinal && status !== 'cancelled' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => act('cancel')}
                disabled={!!submitting}
                className="py-3 rounded-xl border-2 border-rose-200 text-rose-700 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX className="w-4 h-4" />} Annuler
              </button>
              <button
                onClick={() => act('confirm')}
                disabled={!!submitting || status === 'confirmed'}
                className="py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />} {status === 'confirmed' ? 'Confirmé' : 'Confirmer'}
              </button>
            </div>
          )}

          <button
            onClick={onDone}
            className="w-full text-sm text-teal-700 hover:underline inline-flex items-center justify-center gap-1"
          >
            Ouvrir l'application <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
