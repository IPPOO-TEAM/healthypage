import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Phone, Mail, MapPin, Calendar, Heart, Activity, FileText, Loader2, ExternalLink } from 'lucide-react';
import { api } from './api';
import { logAudit } from './adminSession';
import { useToast } from './AdminToast';

interface Props { patient: any; onClose: () => void; adminEmail: string; }

export function AdminPatientDetail({ patient, onClose, adminEmail }: Props) {
  const [details, setDetails] = useState<any>(null);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    let cancel = false;
    Promise.all([
      api.getPatient(patient.id).catch(() => null),
      api.listRdv(patient.id).catch(() => []),
    ]).then(([d, r]) => {
      if (cancel) return;
      setDetails(d);
      setRdvs(r ?? []);
      setLoading(false);
    });
    logAudit('view-patient', adminEmail, patient.id);
    return () => { cancel = true; };
  }, [patient.id, adminEmail]);

  const fullName = `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || '(Sans nom)';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/80">Patient</p>
                <h2 className="text-xl font-bold">{fullName}</h2>
                <p className="text-xs text-white/80 mt-0.5">ID · {patient.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/15 hover:bg-white/25" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-teal-600" />
            <p className="mt-3 text-sm text-gray-500">Chargement du dossier…</p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <section className="grid sm:grid-cols-2 gap-3">
              <Field icon={Phone} label="Téléphone" value={patient.phone} />
              <Field icon={Mail} label="Email" value={patient.email} />
              <Field icon={MapPin} label="Lieu" value={[patient.address, patient.city, patient.country].filter(Boolean).join(', ')} />
              <Field icon={Calendar} label="Date de naissance" value={patient.dob} />
              <Field icon={Heart} label="Groupe sanguin" value={patient.blood} />
              <Field icon={Activity} label="Genre" value={patient.gender} />
              <Field icon={FileText} label="Assurance" value={patient.insurer} />
              <Field icon={User} label="Profession" value={patient.profession} />
            </section>

            {details?.emergency && (
              <section className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-rose-900 mb-2 inline-flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Contact d'urgence
                </h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-rose-700/80">Nom :</span> {details.emergency.name ?? '—'}</div>
                  <div><span className="text-rose-700/80">Téléphone :</span> {details.emergency.phone ?? '—'}</div>
                  <div><span className="text-rose-700/80">Lien :</span> {details.emergency.relation ?? '—'}</div>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Rendez-vous ({rdvs.length})</h3>
              {rdvs.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">Aucun RDV enregistré.</p>
              ) : (
                <ul className="space-y-2">
                  {rdvs.slice(0, 8).map((r) => (
                    <li key={r.id} className="bg-gray-50 rounded-xl p-3 text-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{r.motif ?? r.specialty ?? 'Consultation'}</div>
                        <div className="text-xs text-gray-500">{r.date ?? '—'} {r.time ?? ''} · {r.type ?? 'cabinet'}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.status === 'cancelled' ? 'bg-rose-100 text-rose-700'
                        : r.status === 'proposed' ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>{r.status ?? 'confirmed'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {patient.phone && (
                <a href={`tel:${patient.phone}`} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium inline-flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Appeler
                </a>
              )}
              {patient.email && (
                <a href={`mailto:${patient.email}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(patient.id);
                  push('success', 'ID copié dans le presse-papiers');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Copier ID
              </button>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900 break-words">{value || '—'}</div>
    </div>
  );
}
