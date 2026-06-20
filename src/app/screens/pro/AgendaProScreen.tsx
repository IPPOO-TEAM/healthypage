import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Video, MapPin, X, Link2, Copy, RefreshCw, Check } from 'lucide-react';
import { api } from '../../components/api';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Slot {
  id: string;
  day: number;
  hour: number;
  patient: string;
  motif: string;
  type: 'cabinet' | 'tele';
  patientId?: string;
  rdvId?: string;
  status?: 'proposed' | 'confirmed' | 'cancelled' | 'free';
  date?: string;
}

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface Props {
  proId: string;
}

export default function AgendaProScreen({ proId }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const teleOnly = searchParams.get('tele') === '1';
  const setTeleOnly = (v: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set('tele', '1'); else next.delete('tele');
    setSearchParams(next, { replace: true });
  };
  const [patients, setPatients] = useState<any[]>([]);
  const [breakHours, setBreakHours] = useState<Set<number>>(new Set());
  const [feedToken, setFeedToken] = useState<string>('');
  const [feedBusy, setFeedBusy] = useState(false);
  const [feedCopied, setFeedCopied] = useState(false);
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    api.listProPatients(proId).then((list) => setPatients(list ?? [])).catch(() => setPatients([]));
    api.getPro(proId).then((p: any) => { if (p?.feedToken) setFeedToken(p.feedToken); }).catch(() => {});
    const loadPro = () => {
      api.getPro(proId).then((pro: any) => {
        const set = new Set<number>();
        const breaks: any[] = pro?.availability?.breaks ?? [];
        breaks.forEach((b) => {
          const from = parseInt(String(b.from).split(':')[0], 10);
          const to = parseInt(String(b.to).split(':')[0], 10);
          if (!isNaN(from) && !isNaN(to)) {
            for (let h = from; h < to; h++) set.add(h);
          }
        });
        setBreakHours(set);
      }).catch(() => {});
    };
    loadPro();
    const onFocus = () => loadPro();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [proId]);

  const visibleSlots = useMemo(
    () => teleOnly ? slots.filter((s) => s.type === 'tele') : slots,
    [slots, teleOnly]
  );

  useEffect(() => {
    let mounted = true;
    api.listAgendaPro(proId)
      .then((list) => {
        if (!mounted) return;
        setSlots(list && list.length > 0 ? (list as Slot[]) : []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [proId]);

  const monday = useMemo(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  const dateLabel = (i: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.getDate();
  };

  const weekRange = (() => {
    const end = new Date(monday);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    return `${fmt(monday)} → ${fmt(end)}`;
  })();

  const remove = async (id: string) => {
    const slot = slots.find((x) => x.id === id);
    setSlots((s) => s.filter((x) => x.id !== id));
    setSelected(null);
    try {
      await api.deleteAgendaSlot(proId, id);
      if (slot?.patientId && slot?.rdvId) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7cbeffac/patients/${slot.patientId}/rdv/${slot.rdvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ status: 'cancelled' })
        });
      }
    } catch (e) { console.error('delete slot', e); }
  };

  const generateOrRotateToken = async () => {
    setFeedBusy(true);
    try {
      const { token } = await api.generateAgendaFeedToken(proId);
      setFeedToken(token);
    } catch (e) { console.error('feed-token', e); }
    finally { setFeedBusy(false); }
  };

  const feedHttpUrl = feedToken ? api.agendaFeedUrl(proId, feedToken) : '';
  const feedWebcalUrl = feedHttpUrl.replace(/^https?:/, 'webcal:');
  const googleAddUrl = feedHttpUrl ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedHttpUrl)}` : '';
  const outlookAddUrl = feedHttpUrl ? `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedHttpUrl)}&name=${encodeURIComponent('Healthy Page')}` : '';

  const copyFeed = async () => {
    if (!feedHttpUrl) return;
    try {
      await navigator.clipboard.writeText(feedHttpUrl);
      setFeedCopied(true);
      setTimeout(() => setFeedCopied(false), 2000);
    } catch {}
  };

  return (
    <div>
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-white/80 uppercase tracking-widest">Agenda</p>
              <h1 className="font-bold text-lg">Semaine</h1>
              <p className="text-xs text-white/80">{weekRange}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-white text-blue-700 p-2 rounded-xl shadow"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setWeekOffset((w) => w, 1)} className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-sm inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Précédente
          </button>
          <button onClick={() => setWeekOffset(0)} className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-sm">
            Aujourd'hui
          </button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-sm inline-flex items-center gap-1">
            Suivante <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setTeleOnly(!teleOnly)}
          className={`mt-3 w-full px-3 py-2 rounded-xl text-sm inline-flex items-center justify-center gap-2 transition ${
            teleOnly ? 'bg-white text-blue-700' : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          <Video className="w-4 h-4" /> {teleOnly ? 'Téléconsultation uniquement (actif)' : 'Filtrer : Téléconsultation uniquement'}
        </button>
      </header>

      <main className="px-3 mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm mx-2">
          <button
            onClick={() => setShowSync((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between gap-2 text-sm font-semibold text-blue-700"
          >
            <span className="inline-flex items-center gap-2"><Link2 className="w-4 h-4" /> Synchroniser Google / Outlook</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showSync ? 'rotate-90' : ''}`} />
          </button>
          {showSync && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                Abonnez votre calendrier pour voir vos RDV en lecture seule. Les changements (annulations, ajouts) se propagent automatiquement.
              </p>
              {!feedToken ? (
                <button
                  onClick={generateOrRotateToken}
                  disabled={feedBusy}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {feedBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Générer mon lien de synchronisation
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <code className="flex-1 text-[11px] text-slate-700 truncate">{feedHttpUrl}</code>
                    <button
                      onClick={copyFeed}
                      className="p-2 rounded-lg bg-white text-slate-700 hover:bg-blue-50 inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      {feedCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {feedCopied ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={googleAddUrl} target="_blank" rel="noreferrer"
                      className="py-2 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs text-center border border-rose-200"
                    >Google Calendar</a>
                    <a
                      href={outlookAddUrl} target="_blank" rel="noreferrer"
                      className="py-2 rounded-xl bg-sky-50 text-sky-700 font-semibold text-xs text-center border border-sky-200"
                    >Outlook</a>
                    <a
                      href={feedWebcalUrl}
                      className="py-2 rounded-xl bg-slate-50 text-slate-700 font-semibold text-xs text-center border border-slate-200"
                    >Apple Calendar (webcal)</a>
                    <a
                      href={feedHttpUrl} target="_blank" rel="noreferrer"
                      className="py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs text-center border border-emerald-200"
                    >Télécharger .ics</a>
                  </div>
                  <button
                    onClick={generateOrRotateToken}
                    disabled={feedBusy}
                    className="w-full py-2 rounded-xl bg-amber-50 text-amber-800 font-semibold text-xs inline-flex items-center justify-center gap-2 border border-amber-200 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${feedBusy ? 'animate-spin' : ''}`} /> Régénérer le lien (révoque l'ancien)
                  </button>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Lecture seule. Le lien contient un jeton secret : ne le partagez pas. Régénérez-le si compromis.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative h-28 rounded-2xl overflow-hidden mx-2">
          <ImageWithFallback src="https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=1080" alt="Agenda médical" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 to-transparent flex items-end p-4">
            <p className="text-white text-sm">Organiser la semaine · présentiel & téléconsultation</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, minmax(60px, 1fr))' }}>
            <div></div>
            {DAYS.map((d, i) => (
              <div key={d} className="text-center py-2 border-b border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase">{d}</p>
                <p className="text-sm font-bold text-gray-900">{dateLabel(i)}</p>
              </div>
            ))}
            {HOURS.map((h) => (
              <div key={`row-${h}`} className="contents">
                <div className={`text-[10px] text-right pr-2 py-3 border-b border-gray-100 ${
                  breakHours.has(h) ? 'text-amber-500' : 'text-gray-400'
                }`}>{h}h{breakHours.has(h) ? '*' : ''}</div>
                {DAYS.map((_, di) => {
                  const slot = visibleSlots.find((s) => s.day === di && s.hour === h);
                  const isBreak = breakHours.has(h);
                  return (
                    <button
                      key={`${h}-${di}`}
                      disabled={isBreak && !slot}
                      onClick={() => slot ? setSelected(slot) : null}
                      className={`relative h-12 border-b border-l border-gray-100 ${
                        slot
                          ? slot.status === 'free'
                            ? 'bg-emerald-50 hover:bg-emerald-100'
                            : 'bg-blue-50 hover:bg-blue-100'
                          : isBreak ? 'bg-amber-50/40 cursor-not-allowed' : 'hover:bg-slate-50'
                      } transition`}
                    >
                      {slot && (
                        <div className={`absolute inset-1 rounded-md text-white p-1 text-left ${
                          slot.status === 'free'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}>
                          <p className="text-[9px] font-semibold truncate leading-tight">{slot.patient}</p>
                          <p className="text-[8px] opacity-80 truncate">{slot.motif}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Today list */}
        <section className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-700" /> Agenda du jour ({visibleSlots.filter((s) => s.day === ((new Date().getDay() + 6) % 7) && weekOffset === 0).length})
          </h2>
          <div className="space-y-2">
            {visibleSlots
              .filter((s) => s.day === ((new Date().getDay() + 6) % 7) && weekOffset === 0)
              .sort((a, b) => a.hour - b.hour)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left"
                >
                  <div className="bg-white p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{`${s.hour}:00`} • {s.patient}</p>
                    <p className="text-xs text-gray-500">{s.motif}</p>
                  </div>
                  {s.type === 'tele' ? (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Video className="w-3 h-3" /> Tele
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Cabinet
                    </span>
                  )}
                </button>
              ))}
          </div>
        </section>
      </main>

      {/* Slot detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{selected.date ? new Date(selected.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) : DAYS[selected.day]} • {selected.hour}h00</p>
                <h3 className="font-bold text-lg">{selected.patient}</h3>
                <p className="text-sm text-gray-600">{selected.motif}</p>
                {selected.status === 'free' && (
                  <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    Créneau libre · réservable en ligne
                  </span>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              {selected.status === 'free' ? (
                <>
                  <button onClick={() => setSelected(null)} className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">Fermer</button>
                  <button onClick={() => remove(selected.id)} className="bg-red-50 text-red-700 py-3 rounded-xl font-medium">Retirer la dispo</button>
                </>
              ) : (
                <>
                  <button className="bg-blue-700 text-white py-3 rounded-xl font-medium">Ouvrir dossier</button>
                  <button onClick={() => remove(selected.id)} className="bg-red-50 text-red-700 py-3 rounded-xl font-medium">Annuler</button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <AddSlotModal
          patients={patients}
          breakHours={breakHours}
          onClose={() => setShowAdd(false)}
          onAdd={async (s) => {
            try {
              if (s.status === 'free') {
                const saved = await api.createAgendaSlot(proId, { ...s, status: 'free' });
                setSlots((list) => [...list, saved as Slot]);
                return;
              }
              let rdvId: string | undefined;
              if (s.patientId) {
                const offset = (new Date(monday).getDate() + s.day) - new Date().getDate();
                const dateStr = (() => {
                  const d = new Date(monday);
                  d.setDate(d.getDate() + s.day);
                  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
                })();
                const rdv = await api.createRdv(s.patientId, {
                  doctor: 'Praticien',
                  specialty: s.motif,
                  date: dateStr,
                  time: `${String(s.hour).padStart(2, '0')}:00`,
                  location: s.type === 'tele' ? 'Téléconsultation' : 'Cabinet',
                  type: s.type,
                  status: 'proposed',
                  proId,
                  proposedByPro: true
                }) as any;
                rdvId = rdv?.id;
                void offset;
                try {
                  await api.createNotification(s.patientId, {
                    title: 'Nouvelle proposition de RDV',
                    body: `${dateStr} à ${String(s.hour).padStart(2, '0')}:00, ${s.motif}`,
                    type: 'rdv',
                    proId,
                    rdvId,
                    read: false
                  });
                } catch (e) { console.error('notif create', e); }
              }
              const saved = await api.createAgendaSlot(proId, { ...s, rdvId, status: s.patientId ? 'proposed' : 'confirmed' });
              setSlots((list) => [...list, saved as Slot]);
            } catch (e) {
              console.error('add slot', e);
            } finally {
              setShowAdd(false);
            }
          }}
        />
      )}
    </div>
  );
}

function AddSlotModal({ patients, breakHours, onClose, onAdd }: { patients: any[]; breakHours: Set<number>; onClose: () => void; onAdd: (s: Omit<Slot, 'id'>) => void }) {
  const [mode, setMode] = useState<'publish' | 'book'>('publish');
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(9);
  const [patient, setPatient] = useState('');
  const [patientId, setPatientId] = useState<string>('');
  const [motif, setMotif] = useState('');
  const [type, setType] = useState<'cabinet' | 'tele'>('cabinet');
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return monday.toISOString().slice(0, 10);
  });
  const inp = 'w-full px-3 py-2.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500';

  const computedDay = (() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return day;
    return (d.getDay() + 6) % 7;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-3"
      >
        <h3 className="font-bold text-lg">Nouveau créneau</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode('publish')}
            className={`py-2.5 rounded-xl border-2 text-sm font-medium ${
              mode === 'publish' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600'
            }`}
          >Publier dispo</button>
          <button
            onClick={() => setMode('book')}
            className={`py-2.5 rounded-xl border-2 text-sm font-medium ${
              mode === 'book' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
            }`}
          >Réserver patient</button>
        </div>
        <p className="text-xs text-gray-600">
          {mode === 'publish'
            ? 'Le créneau sera réservable en ligne par n\'importe quel patient.'
            : 'Bloque ce créneau pour un patient connu (proposition à confirmer).'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
          <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className={inp}>
            {HOURS.filter((h) => !breakHours.has(h)).map((h) => <option key={h} value={h}>{h}h</option>)}
          </select>
        </div>
        {mode === 'book' && (
          <>
            <select
              value={patientId}
              onChange={(e) => {
                const id = e.target.value;
                setPatientId(id);
                const p = patients.find((x) => x.id === id);
                if (p) setPatient(`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim());
              }}
              className={inp}
            >
              <option value="">— Patient libre (saisie manuelle) —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
            <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nom du patient" className={inp} disabled={!!patientId} />
          </>
        )}
        <input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder={mode === 'publish' ? 'Motif (ex: Consultation générale)' : 'Motif'} className={inp} />
        {mode === 'book' && patientId && (
          <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
            Un RDV "à confirmer" sera également créé dans l'espace patient.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {(['cabinet', 'tele'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`py-2.5 rounded-xl border-2 text-sm font-medium ${
                type === t ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200'
              }`}
            >{t === 'tele' ? 'Téléconsultation' : 'Cabinet'}</button>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium">Annuler</button>
          <button
            onClick={() => onAdd({
              day: computedDay,
              hour,
              patient: mode === 'publish' ? 'Disponible' : patient,
              motif: motif || (mode === 'publish' ? 'Consultation' : ''),
              type,
              patientId: mode === 'book' ? (patientId || undefined) : undefined,
              status: mode === 'publish' ? 'free' : undefined,
              date,
            })}
            disabled={mode === 'book' ? (!patient || !motif) : !date}
            className={`flex-1 text-white py-3 rounded-xl font-medium disabled:opacity-50 ${
              mode === 'publish' ? 'bg-emerald-600' : 'bg-blue-700'
            }`}
          >{mode === 'publish' ? 'Publier' : 'Ajouter'}</button>
        </div>
      </motion.div>
    </div>
  );
}
