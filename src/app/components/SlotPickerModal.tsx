import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Stethoscope, Video, MapPin, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Search, User, Users } from 'lucide-react';
import { api } from './api';
import { getPatientId } from './usePatientId';
import PaymentModal from './PaymentModal';

const FR_MONTHS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface Pro {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  ville?: string;
  photo?: string;
  tarif?: number | string;
}

interface Slot {
  id: string;
  proId?: string;
  day: number;
  hour: number;
  date?: string;
  type: 'cabinet' | 'tele';
  motif?: string;
  status?: string;
  patientId?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  specialty?: string | null;
  proId?: string | null;
  onBooked?: (rdv: any) => void;
  patientName: string;
}

const fmtFrLong = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${FR_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

const isoOf = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

const proLabel = (p: Pro) => p.name?.trim() || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Praticien';

export default function SlotPickerModal({ open, onClose, specialty, proId, onBooked, patientName }: Props) {
  const [step, setStep] = useState<'list' | 'slots' | 'confirm' | 'success'>('list');
  const [pros, setPros] = useState<Pro[]>([]);
  const [loadingPros, setLoadingPros] = useState(false);
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookedRdv, setBookedRdv] = useState<any>(null);
  const [famille, setFamille] = useState<any[]>([]);
  const [recipientId, setRecipientId] = useState<string>('self');

  useEffect(() => {
    if (!open) return;
    setSelectedPro(null);
    setSlots([]);
    setPickedSlot(null);
    setError(null);
    setRecipientId('self');
    const pid = getPatientId();
    if (pid) {
      api.listFamille(pid).then((list) => setFamille(list ?? [])).catch(() => setFamille([]));
    }
    if (proId) {
      setStep('slots');
      setLoadingSlots(true);
      api.getPro(proId)
        .then((p: any) => {
          setSelectedPro(p as Pro);
          return api.listFreeSlotsForPro(proId);
        })
        .then((list) => setSlots((list ?? []) as Slot[]))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
      return;
    }
    setStep('list');
    setLoadingPros(true);
    api.listPros()
      .then((list) => setPros((list ?? []) as Pro[]))
      .catch(() => setPros([]))
      .finally(() => setLoadingPros(false));
  }, [open, proId]);

  const filteredPros = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pros.filter((p) => {
      if (specialty) {
        const s = (p.specialty ?? '').toLowerCase();
        if (!s.includes(specialty.toLowerCase())) return false;
      }
      if (!q) return true;
      const hay = `${proLabel(p)} ${p.specialty ?? ''} ${p.ville ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pros, specialty, search]);

  const openProSlots = (pro: Pro) => {
    setSelectedPro(pro);
    setStep('slots');
    setLoadingSlots(true);
    setError(null);
    api.listFreeSlotsForPro(pro.id)
      .then((list) => setSlots((list ?? []) as Slot[]))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  };

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    slots.forEach((s) => {
      let dateIso = s.date;
      if (!dateIso) {
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const d = new Date(monday);
        d.setDate(monday.getDate() + s.day);
        dateIso = isoOf(d);
      }
      const d = new Date(dateIso);
      if (isNaN(d.getTime())) return;
      if (d.getTime() < now.getTime()) return;
      if (!map.has(dateIso)) map.set(dateIso, []);
      map.get(dateIso)!.push(s);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, list]) => ({
        date,
        slots: list.sort((a, b) => a.hour - b.hour),
      }));
  }, [slots]);

  const confirmBooking = async () => {
    if (!selectedPro || !pickedSlot) return;
    const pid = getPatientId();
    if (!pid) {
      setError('Vous devez être connecté pour réserver.');
      return;
    }
    setBooking(true);
    setError(null);
    try {
      const dateIso = pickedSlot.date ?? (() => {
        const monday = new Date();
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const d = new Date(monday);
        d.setDate(monday.getDate() + pickedSlot.day);
        return isoOf(d);
      })();
      const fam = recipientId !== 'self' ? famille.find((f) => String(f.id) === recipientId) : null;
      const forFamille = fam ? { id: String(fam.id), name: `${fam.firstName ?? ''} ${fam.lastName ?? ''}`.trim() || 'Proche', relation: fam.relation ?? '' } : null;
      const rdv = await api.bookFreeSlot(selectedPro.id, pickedSlot.id, pid, {
        date: fmtFrLong(dateIso),
        time: `${String(pickedSlot.hour).padStart(2, '0')}:00`,
        doctor: proLabel(selectedPro),
        specialty: selectedPro.specialty ?? 'Consultation',
        location: pickedSlot.type === 'tele' ? 'Téléconsultation' : (selectedPro.ville ?? 'Cabinet'),
        type: pickedSlot.type ?? 'cabinet',
        patientName,
        forFamille,
      });
      try {
        await api.createNotification(pid, {
          title: 'RDV confirmé',
          body: `Avec ${proLabel(selectedPro)} le ${fmtFrLong(dateIso)} à ${String(pickedSlot.hour).padStart(2, '0')}:00`,
          type: 'rdv',
          proId: selectedPro.id,
          read: false,
        });
      } catch {}
      setBookedRdv(rdv);
      onBooked?.(rdv);
      setStep('success');
    } catch (e: any) {
      console.error('bookFreeSlot failed', e);
      setError(e?.message || 'Réservation impossible. Le créneau a peut-être été pris à l\'instant.');
      api.listFreeSlotsForPro(selectedPro.id).then((list) => setSlots((list ?? []) as Slot[])).catch(() => {});
    } finally {
      setBooking(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="slot-picker-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col"
        >
          <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'list' && step !== 'success' && (
                <button
                  onClick={() => {
                    if (proId && step === 'slots') { onClose(); return; }
                    if (proId && step === 'confirm') { setStep('slots'); return; }
                    setStep(step === 'confirm' ? 'slots' : 'list');
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-semibold">Prendre RDV</p>
                <h2 className="font-bold text-slate-900">
                  {step === 'list' && (specialty ? `Praticiens · ${specialty}` : 'Choisir un praticien')}
                  {step === 'slots' && proLabel(selectedPro!)}
                  {step === 'confirm' && 'Confirmer'}
                  {step === 'success' && 'Réservé !'}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {step === 'list' && (
              <div className="p-4 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom, spécialité, ville…"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                {loadingPros && (
                  <div className="flex items-center justify-center py-10 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement des praticiens…
                  </div>
                )}
                {!loadingPros && filteredPros.length === 0 && (
                  <div className="text-center py-10 text-sm text-slate-500">
                    Aucun praticien disponible{specialty ? ` en ${specialty}` : ''}.
                  </div>
                )}
                {!loadingPros && filteredPros.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProSlots(p)}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <Stethoscope className="w-5 h-5 text-emerald-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{proLabel(p)}</p>
                      <p className="text-xs text-slate-600 truncate">{p.specialty ?? '—'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.ville ?? ''}{p.tarif ? ` · ${p.tarif}` : ''}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {step === 'slots' && (
              <div className="p-4 space-y-4">
                {loadingSlots && (
                  <div className="flex items-center justify-center py-10 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Recherche des créneaux libres…
                  </div>
                )}
                {!loadingSlots && slotsByDate.length === 0 && (
                  <div className="text-center py-10">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Aucun créneau libre pour ce praticien.</p>
                    <p className="text-xs text-slate-500 mt-1">Réessayez plus tard, ou choisissez un autre praticien.</p>
                  </div>
                )}
                {!loadingSlots && slotsByDate.map(({ date, slots: daySlots }) => {
                  const d = new Date(date);
                  const dayLabel = DAY_LABELS[(d.getDay() + 6) % 7];
                  return (
                    <div key={date}>
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        {dayLabel} {d.getDate()} {FR_MONTHS_LONG[d.getMonth()].toLowerCase()}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {daySlots.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setPickedSlot(s); setStep('confirm'); }}
                            className="relative px-2 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400 text-emerald-800 text-sm font-medium transition"
                          >
                            {String(s.hour).padStart(2, '0')}:00
                            {s.type === 'tele' && (
                              <span className="absolute top-0.5 right-0.5">
                                <Video className="w-3 h-3 text-emerald-600" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 'confirm' && selectedPro && pickedSlot && (
              <div className="p-5 space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-200">
                  <p className="text-xs text-emerald-700 uppercase tracking-wide font-semibold">Récapitulatif</p>
                  <p className="font-bold text-slate-900 mt-1">{proLabel(selectedPro)}</p>
                  <p className="text-sm text-slate-700">{selectedPro.specialty ?? 'Consultation'}</p>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-600" /> {fmtFrLong(pickedSlot.date ?? isoOf(new Date()))}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" /> {String(pickedSlot.hour).padStart(2, '0')}:00</div>
                    <div className="flex items-center gap-2">
                      {pickedSlot.type === 'tele'
                        ? <><Video className="w-4 h-4 text-emerald-600" /> Téléconsultation</>
                        : <><MapPin className="w-4 h-4 text-emerald-600" /> {selectedPro.ville ?? 'Cabinet'}</>}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 inline-flex items-center gap-1"><Users className="w-3 h-3" /> Pour qui ?</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setRecipientId('self')}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition ${recipientId === 'self' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <span className="font-medium text-slate-900">Pour moi</span>
                      <span className="text-xs text-slate-500">— {patientName}</span>
                      {recipientId === 'self' && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                    </button>
                    {famille.map((f) => {
                      const id = String(f.id);
                      const sel = recipientId === id;
                      const name = `${f.firstName ?? ''} ${f.lastName ?? ''}`.trim() || 'Proche';
                      return (
                        <button
                          key={id}
                          onClick={() => setRecipientId(id)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition ${sel ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                        >
                          <Users className="w-4 h-4 text-emerald-700" />
                          <span className="font-medium text-slate-900">{name}</span>
                          {f.relation && <span className="text-xs text-slate-500">— {f.relation}</span>}
                          {sel && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                  {famille.length === 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">Astuce : ajoutez un proche dans Carnet familial pour réserver à sa place.</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 ring-1 ring-red-100">{error}</p>
                )}
                <button
                  disabled={booking}
                  onClick={confirmBooking}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Réservation…</> : 'Confirmer le RDV'}
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  En confirmant, vous acceptez d'être contacté par le praticien et de respecter sa politique d'annulation (24h min).
                </p>
              </div>
            )}

            {step === 'success' && selectedPro && pickedSlot && (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">RDV confirmé</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {proLabel(selectedPro)} · {fmtFrLong(pickedSlot.date ?? isoOf(new Date()))} à {String(pickedSlot.hour).padStart(2, '0')}:00
                  </p>
                </div>
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30"
                >Régler la consultation maintenant</button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold"
                >Plus tard · Voir mes RDV</button>
                <p className="text-[11px] text-slate-500">
                  Vous pouvez payer plus tard depuis « Mes paiements » ou en cabinet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      {selectedPro && pickedSlot && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          amount={Number((selectedPro as any).tarif) || 5000}
          currency="XOF"
          purpose={`Consultation ${selectedPro.specialty ?? ''} · ${proLabel(selectedPro)}`}
          rdvId={bookedRdv?.id}
          proId={selectedPro.id}
          onSettled={(status) => { if (status === 'succeeded') setPaymentOpen(false); }}
        />
      )}
    </AnimatePresence>
  );
}
