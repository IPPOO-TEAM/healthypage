import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Video, X, RefreshCw, CheckCircle2, Phone, AlertTriangle, CalendarPlus, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import RdvReminderBanner from '../components/RdvReminderBanner';
import { usePatientPreferences } from '../components/useStoredState';
import PostRdvRatingModal, { isRdvRated } from '../components/PostRdvRatingModal';
import PreRdvQuestionnaireModal from '../components/PreRdvQuestionnaireModal';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface Rdv {
  id: string | number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: 'cabinet' | 'tele';
  status: 'upcoming' | 'past' | 'cancelled' | 'proposed' | 'missed' | 'confirmed';
  phone?: string;
  proId?: string;
  proposedByPro?: boolean;
}

const FR_MONTHS: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11
};

function parseRdvDate(date: string, time: string): Date | null {
  const m = date.trim().toLowerCase().match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = FR_MONTHS[m[2]];
  if (month === undefined) return null;
  const [hh, mm] = (time || '00:00').split(':').map((x) => parseInt(x, 10));
  return new Date(parseInt(m[3], 10), month, parseInt(m[1], 10), hh || 0, mm || 0);
}

function relativeToNow(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff < 0) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `dans ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `dans ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `dans ${d} j`;
  return `dans ${Math.round(d / 7)} sem.`;
}

function buildIcs(r: Rdv): string {
  const start = parseRdvDate(r.date, r.time);
  if (!start) return '';
  const end = new Date(start.getTime() + 30 * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HealthyPage//RDV//FR',
    'BEGIN:VEVENT',
    `UID:rdv-${r.id}@healthy-page`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:RDV ${r.doctor} (${r.specialty})`,
    `LOCATION:${r.location}`,
    `DESCRIPTION:Rendez-vous Healthy Page${r.phone ? ', ' + r.phone : ''}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
}

function downloadIcs(r: Rdv) {
  const ics = buildIcs(r);
  if (!ics) return;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rdv-${r.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const INITIAL: Rdv[] = [
  { id: 1, doctor: 'Dr. Aïcha Hounkpatin', specialty: 'Médecin généraliste', date: '5 Mai 2026', time: '10:30', location: 'Centre Médical Ganhi', type: 'cabinet', status: 'upcoming', phone: '+229 01 21 30 30 30' },
  { id: 2, doctor: 'Dr. Kouamé Houngbédji', specialty: 'Cardiologue', date: '12 Mai 2026', time: '14:00', location: 'Téléconsultation', type: 'tele', status: 'upcoming' },
  { id: 3, doctor: 'Dr. Marie Tchetchao', specialty: 'Pédiatre', date: '18 Avril 2026', time: '09:00', location: 'Clinique Louis Pasteur Cotonou', type: 'cabinet', status: 'past' },
  { id: 4, doctor: 'Dr. Agbodjan Dossou', specialty: 'Dermatologue', date: '2 Avril 2026', time: '16:30', location: 'Cabinet Cadjèhoun', type: 'cabinet', status: 'past' }
];

export default function MesRdvScreen({ onBack, onNavigate }: Props) {
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState<Rdv | null>(null);
  const [ratingRdv, setRatingRdv] = useState<Rdv | null>(null);
  const [preRdv, setPreRdv] = useState<Rdv | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const { prefs } = usePatientPreferences();

  const refresh = async () => {
    const pid = getPatientId();
    if (!pid) { setRdvs([]); setLoading(false); return; }
    try {
      const items = await api.listRdv(pid);
      setRdvs(items ?? []);
    } catch (e) {
      console.error('Load rdv:', e);
      setRdvs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const t = setInterval(refresh, 60000);
    return () => { window.removeEventListener('focus', onFocus); clearInterval(t); };
  }, []);

  // Scan rappels J-1 / H-2 (backend dispatch SMS/push/inapp + déduplication)
  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    const channels: string[] = [];
    if (prefs.notificationsSms !== false) channels.push('sms');
    if (prefs.notificationsEmail !== false) channels.push('push');
    channels.push('inapp');
    const run = () => { api.scanReminders(pid, channels).catch(() => null); };
    run();
    const t = setInterval(run, 5 * 60000);
    return () => clearInterval(t);
  }, [prefs.notificationsSms, prefs.notificationsEmail]);

  // Charge nom patient (pour signature des avis)
  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    api.getPatient(pid).then((p: any) => {
      const n = `${p?.patient?.firstName ?? ''} ${p?.patient?.lastName ?? ''}`.trim();
      if (n) setPatientName(n);
    }).catch(() => {});
  }, []);

  // Auto-prompt notation post-RDV (1er RDV passé non noté avec proId)
  useEffect(() => {
    if (ratingRdv) return;
    const target = rdvs.find((r) => (r.status === 'past' || r.status === 'missed') && r.proId && !isRdvRated(r.id));
    if (!target) return;
    const t = setTimeout(() => setRatingRdv(target), 1500);
    return () => clearTimeout(t);
  }, [rdvs.length]);

  // Auto-flag missed RDV (upcoming dont la date est passée depuis +30 min)
  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    const now = Date.now();
    rdvs.forEach((r) => {
      if (r.status !== 'upcoming') return;
      const d = parseRdvDate(r.date, r.time);
      if (d && d.getTime() + 30 * 60000 < now) {
        api.updateRdv(pid, String(r.id), { status: 'missed' }).catch(() => {});
        setRdvs((list) => list.map((x) => x.id === r.id ? { ...x, status: 'missed' } : x));
      }
    });
  }, [rdvs.length]);

  const updateStatus = async (id: string | number, status: Rdv['status']) => {
    setRdvs((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    const pid = getPatientId();
    if (!pid) return;
    const r = rdvs.find((x) => x.id === id);
    try {
      await api.updateRdv(pid, String(id), { status });
      if (r?.proId) {
        const proSlots = await api.listAgendaPro(r.proId).catch(() => [] as any[]);
        const slot = proSlots.find((s: any) => s.rdvId === id);
        if (slot) {
          await api.updateAgendaSlot(r.proId, slot.id, { status: status === 'cancelled' ? 'cancelled' : 'confirmed' });
        }
      }
    } catch (e) { console.error('Update rdv:', e); }
  };

  const cancel = (id: string | number) => updateStatus(id, 'cancelled');
  const confirm = (id: string | number) => updateStatus(id, 'upcoming');

  const filtered = rdvs.filter((r) =>
    tab === 'upcoming'
      ? r.status === 'upcoming' || r.status === 'confirmed' || r.status === 'cancelled' || r.status === 'proposed'
      : r.status === 'past' || r.status === 'missed'
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg text-slate-900">Mes rendez-vous</h2>
          <div className="w-10 h-10" />
        </div>

        <RdvReminderBanner rdvs={rdvs as any} />

        {(() => {
          const next = rdvs.find((r) => r.status === 'upcoming');
          return (
            <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-emerald-900/70">Le médecin assistant</p>
                  <h3 className="text-2xl text-emerald-950 leading-tight mt-1">
                    {next ? next.doctor.replace('Dr. ', '').split(' ')[0] : 'Aucun'}
                  </h3>
                  <h3 className="text-2xl text-emerald-950 leading-tight">
                    {next ? next.doctor.replace('Dr. ', '').split(' ').slice(1).join(' ') : 'à venir'}
                  </h3>
                  <p className="text-xs text-emerald-900/80 mt-1">{next?.specialty ?? 'Aucun rendez-vous prévu'}</p>
                  <div className="flex gap-1.5 mt-4">
                    <button className="w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-emerald-800">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button onClick={() => onNavigate?.('teleconsultation')} className="w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-emerald-800">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-28 h-32 rounded-2xl overflow-hidden bg-white/40 shadow-inner">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1 rounded-full ${i === 0 ? 'w-5 bg-emerald-700' : 'w-1.5 bg-emerald-700/30'}`} />
                ))}
              </div>
            </div>
          );
        })()}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm text-slate-700 mb-3">Prendre rendez-vous</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const active = i === 2;
              return (
                <button key={i} className={`min-w-[42px] py-2 rounded-full text-center transition ${active ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-600'}`}>
                  <div className="text-sm">{d.getDate()}</div>
                  <div className="text-[9px] capitalize opacity-80">{d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
              tab === t ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:text-teal-700'
            }`}
          >
            {t === 'upcoming' ? 'À venir' : 'Passés'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${
                r.status === 'cancelled' ? 'border-red-200 opacity-70' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {(r as any).forName && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-fuchsia-100 text-fuchsia-800 px-2 py-0.5 rounded-full font-semibold mb-1">
                      Pour {(r as any).forName}{(r as any).forRelation ? ` · ${(r as any).forRelation}` : ''}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{r.doctor}</h4>
                    {r.type === 'tele' && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Video className="w-3 h-3" /> Téléconsult.
                      </span>
                    )}
                    {r.status === 'cancelled' && (
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">Annulé</span>
                    )}
                    {r.status === 'confirmed' && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmé
                      </span>
                    )}
                    {r.status === 'proposed' && (
                      <span className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded-full">À confirmer</span>
                    )}
                    {r.status === 'past' && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Effectué
                      </span>
                    )}
                    {r.status === 'missed' && (
                      <span className="bg-orange-50 text-orange-800 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Manqué
                      </span>
                    )}
                    {r.status === 'upcoming' && (() => {
                      const d = parseRdvDate(r.date, r.time);
                      const rel = d ? relativeToNow(d) : '';
                      return rel ? (
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full">{rel}</span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-sm text-gray-600">{r.specialty}</p>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" />{r.date}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600" />{r.time}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-600" />{r.location}</div>
                  </div>
                </div>
              </div>

              {r.status === 'proposed' && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => confirm(r.id)}
                    className="flex-1 min-w-[120px] bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirmer
                  </button>
                  <button
                    onClick={() => cancel(r.id)}
                    className="flex-1 min-w-[120px] bg-red-50 text-red-700 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 border border-red-200"
                  >
                    <X className="w-4 h-4" /> Refuser
                  </button>
                </div>
              )}
              {r.status === 'upcoming' && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {r.type === 'tele' && (
                    <button
                      onClick={() => onNavigate?.('teleconsultation')}
                      className="flex-1 min-w-[120px] bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" /> Rejoindre
                    </button>
                  )}
                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      className="flex-1 min-w-[120px] bg-gray-100 text-gray-800 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Appeler
                    </a>
                  )}
                  <button
                    onClick={() => setPreRdv(r)}
                    className={`flex-1 min-w-[120px] py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 border ${
                      (r as any).questionnaire?.filledAt
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-violet-600 text-white border-violet-600'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" /> {(r as any).questionnaire?.filledAt ? 'Questionnaire ✓' : 'Préparer'}
                  </button>
                  <button
                    onClick={() => setReschedule(r)}
                    disabled={!r.proId}
                    className="flex-1 min-w-[120px] bg-amber-50 text-amber-800 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 border border-amber-200 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" /> Reprogrammer
                  </button>
                  <button
                    onClick={() => downloadIcs(r)}
                    className="flex-1 min-w-[120px] bg-teal-50 text-teal-800 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 border border-teal-200"
                  >
                    <CalendarPlus className="w-4 h-4" /> Calendrier
                  </button>
                  <button
                    onClick={() => cancel(r.id)}
                    className="flex-1 min-w-[120px] bg-red-50 text-red-700 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 border border-red-200"
                  >
                    <X className="w-4 h-4" /> Annuler
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun rendez-vous {tab === 'upcoming' ? 'à venir' : 'passé'}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onNavigate?.('rdv')}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md hover:shadow-lg"
      >
        Prendre un nouveau rendez-vous
      </button>

      {preRdv && (
        <PreRdvQuestionnaireModal
          open={!!preRdv}
          onClose={() => setPreRdv(null)}
          rdv={preRdv as any}
          patientId={getPatientId() ?? ''}
          onSaved={(q) => {
            setRdvs((list) => list.map((x) => x.id === preRdv.id ? ({ ...x, questionnaire: q } as any) : x));
          }}
        />
      )}

      {ratingRdv && (
        <PostRdvRatingModal
          open={!!ratingRdv}
          onClose={() => setRatingRdv(null)}
          rdv={ratingRdv as any}
          patientId={getPatientId() ?? ''}
          patientName={patientName || 'Patient'}
          onSubmitted={refresh}
        />
      )}

      {reschedule && (
        <RescheduleModal
          rdv={reschedule}
          onClose={() => setReschedule(null)}
          onPicked={async ({ day, hour, dateLabel }) => {
            const r = reschedule;
            setReschedule(null);
            const pid = getPatientId();
            if (!pid || !r.proId) return;
            const time = `${String(hour).padStart(2, '0')}:00`;
            try {
              await api.updateRdv(pid, String(r.id), { date: dateLabel, time, status: 'proposed' });
              const proSlots = await api.listAgendaPro(r.proId).catch(() => [] as any[]);
              const oldSlot = proSlots.find((s: any) => s.rdvId === r.id);
              if (oldSlot) await api.deleteAgendaSlot(r.proId, oldSlot.id).catch(() => {});
              await api.createAgendaSlot(r.proId, {
                day, hour,
                patient: '',
                patientId: pid,
                motif: r.specialty,
                type: r.type,
                rdvId: r.id,
                status: 'proposed'
              });
              setRdvs((list) => list.map((x) => x.id === r.id ? { ...x, date: dateLabel, time, status: 'proposed' } : x));
            } catch (e) { console.error('reschedule', e); }
          }}
        />
      )}
    </div>
  );
}

function RescheduleModal({ rdv, onClose, onPicked }: {
  rdv: Rdv;
  onClose: () => void;
  onPicked: (sel: { day: number; hour: number; dateLabel: string }) => void;
}) {
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [openRange, setOpenRange] = useState<{ from: number; to: number }>({ from: 8, to: 18 });
  const [breakHours, setBreakHours] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(1);

  useEffect(() => {
    if (!rdv.proId) { setLoading(false); return; }
    Promise.all([
      api.listAgendaPro(rdv.proId).catch(() => [] as any[]),
      api.getPro(rdv.proId).catch(() => null as any)
    ])
      .then(([slots, pro]: any) => {
        const taken = new Set<string>();
        (slots ?? []).forEach((s: any) => {
          if (s.status !== 'cancelled') taken.add(`${s.day}-${s.hour}`);
        });
        setBusy(taken);

        const days: any[] = pro?.availability?.days ?? pro?.availabilityDays ?? [];
        if (Array.isArray(days) && days.length > 0) {
          const map: Record<string, number> = {
            lun: 0, lundi: 0, mon: 0, monday: 0,
            mar: 1, mardi: 1, tue: 1, tuesday: 1,
            mer: 2, mercredi: 2, wed: 2, wednesday: 2,
            jeu: 3, jeudi: 3, thu: 3, thursday: 3,
            ven: 4, vendredi: 4, fri: 4, friday: 4,
            sam: 5, samedi: 5, sat: 5, saturday: 5,
            dim: 6, dimanche: 6, sun: 6, sunday: 6
          };
          const set = new Set<number>();
          days.forEach((d) => {
            if (typeof d === 'number') set.add(d);
            else if (typeof d === 'string') {
              const idx = map[d.toLowerCase().slice(0, d.length)];
              if (idx !== undefined) set.add(idx);
              else { const k = map[d.toLowerCase().slice(0, 3)]; if (k !== undefined) set.add(k); }
            }
          });
          if (set.size > 0) setOpenDays(set);
        }
        const open = pro?.availability?.open ?? pro?.availability?.openHours;
        const close = pro?.availability?.close ?? pro?.availability?.closeHours;
        if (open && close) {
          const from = parseInt(String(open).split(':')[0], 10);
          const to = parseInt(String(close).split(':')[0], 10);
          if (!isNaN(from) && !isNaN(to)) setOpenRange({ from, to });
        }
        const breaks: any[] = pro?.availability?.breaks ?? [];
        const bset = new Set<number>();
        breaks.forEach((b) => {
          const f = parseInt(String(b.from).split(':')[0], 10);
          const t = parseInt(String(b.to).split(':')[0], 10);
          if (!isNaN(f) && !isNaN(t)) for (let h = f; h < t; h++) bset.add(h);
        });
        setBreakHours(bset);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rdv.proId]);

  const monday = (() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const HOURS = Array.from({ length: Math.max(1, openRange.to - openRange.from + 1) }, (_, i) => openRange.from + i);
  const DAYS_LBL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const dateLabelFor = (day: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + day);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Reprogrammer</h3>
            <p className="text-xs text-gray-500">{rdv.doctor} • {rdv.specialty}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">‹ Semaine</button>
          <p className="text-sm font-medium">
            {monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </p>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">Semaine ›</button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-6">Chargement des disponibilités…</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, minmax(44px, 1fr))' }}>
              <div></div>
              {DAYS_LBL.map((d, di) => (
                <div key={d} className={`text-center text-[10px] font-semibold py-1 ${
                  openDays.has(di) ? 'text-gray-500' : 'text-gray-300'
                }`}>{d}</div>
              ))}
              {HOURS.map((h) => (
                <div key={h} className="contents">
                  <div className="text-[10px] text-gray-400 py-2 text-right pr-1">{h}h</div>
                  {DAYS_LBL.map((_, di) => {
                    const isBusy = busy.has(`${di}-${h}`);
                    const isClosed = !openDays.has(di);
                    const isBreak = breakHours.has(h);
                    const disabled = isBusy || isClosed || isBreak;
                    return (
                      <button
                        key={`${h}-${di}`}
                        disabled={disabled}
                        onClick={() => onPicked({ day: di, hour: h, dateLabel: dateLabelFor(di) })}
                        className={`h-9 m-0.5 rounded-md text-[10px] font-medium transition ${
                          isClosed
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : isBreak
                              ? 'bg-amber-50 text-amber-400 cursor-not-allowed'
                              : isBusy
                                ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={isBreak ? 'Pause' : undefined}
                      >{isClosed ? ', ' : isBreak ? '☕' : isBusy ? '×' : 'OK'}</button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500">Sélectionnez un créneau libre, il sera proposé au praticien.</p>
      </motion.div>
    </div>
  );
}
