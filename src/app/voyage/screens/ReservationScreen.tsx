import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  ArrowLeft, Calendar, Users, Bed, Check, Shield, ChevronRight, CreditCard,
  Sparkles, Plane, Utensils, MapPin, Lock, ArrowRight,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';
import { addBooking, makeReference, Booking } from '../bookingStore';

type Step = 'dates' | 'voyageurs' | 'options' | 'paiement' | 'confirm';
const STEPS: { id: Step; label: string }[] = [
  { id: 'dates', label: 'Dates' },
  { id: 'voyageurs', label: 'Voyageurs' },
  { id: 'options', label: 'Options' },
  { id: 'paiement', label: 'Paiement' },
];

const ROOM_TYPES = [
  { id: 'standard', label: 'Chambre Standard', factor: 1.0, desc: 'Lit double, vue jardin' },
  { id: 'superieure', label: 'Chambre Supérieure', factor: 1.25, desc: 'Lit king, terrasse' },
  { id: 'suite', label: 'Suite Vue Mer', factor: 1.6, desc: 'Salon, baignoire, vue océan' },
];

const OPTIONS_LIST = [
  { id: 'transfer', label: 'Transfert aéroport privé', price: 25000, Icon: Plane },
  { id: 'breakfast', label: 'Petit-déjeuner inclus', price: 6000, Icon: Utensils, perNight: true },
  { id: 'spa', label: 'Soin spa de bienvenue', price: 18000, Icon: Sparkles },
  { id: 'guide', label: "Guide local d'une journée", price: 30000, Icon: MapPin },
];

function todayPlus(d: number) {
  const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10);
}

function diffNights(a: string, b: string) {
  const da = new Date(a).getTime(), db = new Date(b).getTime();
  return Math.max(1, Math.round((db - da) / 86400000));
}

export default function ReservationScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lieu = useMemo(() => LIEUX.find((l) => l.id === id) ?? LIEUX[0], [id]);

  const [step, setStep] = useState<Step>('dates');
  const nightsParam = Math.max(1, Math.min(60, parseInt(params.get('nights') || '0', 10) || 0));
  const startDefault = params.get('start') ?? todayPlus(14);
  const endDefault = params.get('end') ?? (nightsParam ? todayPlus(14 + nightsParam) : todayPlus(17));
  const [start, setStart] = useState(startDefault);
  const [end, setEnd] = useState(endDefault);
  const [adults, setAdults] = useState(Math.max(1, Math.min(8, parseInt(params.get('adults') || '2', 10) || 2)));
  const [children, setChildren] = useState(Math.max(0, Math.min(8, parseInt(params.get('children') || '0', 10) || 0)));
  const [rooms, setRooms] = useState(Math.max(1, Math.min(5, parseInt(params.get('rooms') || '1', 10) || 1)));
  const [roomTypeId, setRoomTypeId] = useState('superieure');
  const [opts, setOpts] = useState<Record<string, boolean>>({ breakfast: true });
  const [insurance, setInsurance] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const nights = diffNights(start, end);
  const roomType = ROOM_TYPES.find((r) => r.id === roomTypeId)!;
  const nightly = Math.round(lieu.pricePerNight * roomType.factor);
  const subtotal = nightly * nights * rooms;
  const optionsCost = OPTIONS_LIST.reduce((sum, o) => {
    if (!opts[o.id]) return sum;
    return sum + (o.perNight ? o.price * nights : o.price);
  }, 0);
  const insuranceCost = insurance ? Math.round(subtotal * 0.04) : 0;
  const taxes = Math.round(subtotal * 0.075);
  const fees = 4500;
  const total = subtotal + optionsCost + insuranceCost + taxes + fees;

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const canNext = (() => {
    if (step === 'dates') return nights > 0;
    if (step === 'voyageurs') return adults > 0 && rooms > 0;
    if (step === 'options') return true;
    if (step === 'paiement') return email.includes('@') && phone.length >= 6 && card.replace(/\s/g, '').length >= 12 && exp.length >= 4 && cvc.length >= 3;
    return false;
  })();

  const goNext = () => {
    if (!canNext) return;
    if (step === 'paiement') {
      const booking: Booking = {
        id: `bk-${Date.now()}`,
        lieuId: lieu.id,
        startISO: start, endISO: end, nights,
        guestsAdults: adults, guestsChildren: children, rooms,
        roomType: roomType.label,
        pricePerNight: nightly,
        subtotal, taxes, fees: fees + insuranceCost + optionsCost,
        total, currency: 'FCFA',
        options: OPTIONS_LIST.filter((o) => opts[o.id]).map((o) => o.label),
        contactEmail: email, contactPhone: phone,
        status: 'confirmed',
        createdAtISO: new Date().toISOString(),
        reference: makeReference(),
      };
      addBooking(booking);
      setConfirmed(booking);
      setStep('confirm');
      return;
    }
    setStep(STEPS[stepIndex + 1].id);
  };

  const goBack = () => {
    if (step === 'confirm') return navigate('/voyage-loisirs/mes-voyages');
    if (stepIndex === 0) navigate(-1);
    else setStep(STEPS[stepIndex - 1].id);
  };

  if (confirmed) {
    return (
      <div className="px-6 sm:px-8 py-8 max-w-xl mx-auto text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">Réservation confirmée</h1>
        <p className="mt-2 text-stone-600">Référence <strong>{confirmed.reference}</strong> · un email a été envoyé à {confirmed.contactEmail}.</p>

        <div className="mt-6 bg-white border border-stone-200 rounded-2xl overflow-hidden text-left">
          <div className="relative h-40">
            <ImageWithFallback src={AFR[lieu.hero]} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-900/35" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="text-xs opacity-90">{lieu.region}, {lieu.country}</div>
              <div className="font-bold tracking-tight">{lieu.name}</div>
            </div>
          </div>
          <dl className="p-4 text-sm space-y-2">
            <Row k="Séjour" v={`Du ${confirmed.startISO} au ${confirmed.endISO} · ${confirmed.nights} nuit(s)`} />
            <Row k="Voyageurs" v={`${confirmed.guestsAdults} adulte(s)${confirmed.guestsChildren ? `, ${confirmed.guestsChildren} enfant(s)` : ''}`} />
            <Row k="Logement" v={`${confirmed.rooms} × ${confirmed.roomType}`} />
            {confirmed.options.length > 0 && <Row k="Options" v={confirmed.options.join(', ')} />}
            <Row k="Total payé" v={`${confirmed.total.toLocaleString('fr-FR')} FCFA`} bold />
          </dl>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate('/voyage-loisirs/mes-voyages')} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold">
            Voir mes voyages
          </button>
          <button onClick={() => navigate(`/voyage-loisirs/messages/${confirmed.lieuId}`)} className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-800 font-semibold">
            Contacter l'hôte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-full pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={goBack} aria-label="Retour" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500">Réservation</div>
          <div className="font-semibold text-stone-900 text-sm truncate">{lieu.name}</div>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-6 sm:px-8 pt-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={s.id} className="flex-1 flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${done ? 'bg-rose-500' : active ? 'bg-rose-300' : 'bg-stone-200'}`} />
                <span className={`text-[11px] font-medium hidden sm:inline ${active ? 'text-rose-600' : done ? 'text-stone-700' : 'text-stone-400'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 sm:px-8 mt-5 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div>
          {step === 'dates' && (
            <Card title="Quand partez-vous ?">
              <div className="grid grid-cols-2 gap-3">
                <FieldDate label="Arrivée" value={start} onChange={(v) => { setStart(v); if (v >= end) setEnd(todayPlus(diffNights(todayPlus(0), v) + 1)); }} />
                <FieldDate label="Départ" value={end} min={start} onChange={setEnd} />
              </div>
              <div className="mt-3 text-sm text-stone-700 inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" /> {nights} nuit{nights > 1 ? 's' : ''}
                <span className="mx-2 text-stone-300">·</span>
                {nightly.toLocaleString('fr-FR')} FCFA / nuit
              </div>
            </Card>
          )}

          {step === 'voyageurs' && (
            <>
              <Card title="Voyageurs">
                <Stepper label="Adultes" Icon={Users} value={adults} setValue={setAdults} min={1} />
                <Stepper label="Enfants" Icon={Users} value={children} setValue={setChildren} min={0} />
                <Stepper label="Chambres" Icon={Bed} value={rooms} setValue={setRooms} min={1} />
              </Card>
              <Card title="Type de logement">
                {ROOM_TYPES.map((rt) => {
                  const sel = roomTypeId === rt.id;
                  const price = Math.round(lieu.pricePerNight * rt.factor);
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setRoomTypeId(rt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 mb-2 ${
                        sel ? 'border-rose-300 bg-rose-50/60' : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-stone-900">{rt.label}</div>
                        <div className="text-xs text-stone-500">{rt.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-stone-900">{price.toLocaleString('fr-FR')}</div>
                        <div className="text-[11px] text-stone-500">FCFA / nuit</div>
                      </div>
                    </button>
                  );
                })}
              </Card>
            </>
          )}

          {step === 'options' && (
            <>
              <Card title="Ajouts">
                {OPTIONS_LIST.map((o) => {
                  const on = !!opts[o.id];
                  return (
                    <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer ${on ? 'border-rose-300 bg-rose-50/60' : 'border-stone-200 bg-white'}`}>
                      <input type="checkbox" checked={on} onChange={(e) => setOpts((s) => ({ ...s, [o.id]: e.target.checked }))} className="accent-rose-600 w-4 h-4" />
                      <o.Icon className="w-5 h-5 text-rose-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-stone-900">{o.label}</div>
                        <div className="text-[11px] text-stone-500">
                          {o.price.toLocaleString('fr-FR')} FCFA{o.perNight ? ' / nuit' : ''}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </Card>
              <Card title="Annulation flexible">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer">
                  <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="accent-rose-600 w-4 h-4" />
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-stone-900">Assurance annulation</div>
                    <div className="text-[11px] text-stone-500">Remboursement intégral jusqu'à 48 h avant l'arrivée. ~ 4 % du séjour.</div>
                  </div>
                </label>
              </Card>
            </>
          )}

          {step === 'paiement' && (
            <>
              <Card title="Vos coordonnées">
                <Field label="Email" value={email} onChange={setEmail} placeholder="vous@exemple.com" type="email" />
                <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+221 7X XXX XX XX" type="tel" />
              </Card>
              <Card title={<span className="inline-flex items-center gap-2"><CreditCard className="w-4 h-4 text-rose-500" /> Paiement sécurisé</span>}>
                <Field label="Numéro de carte" value={card} onChange={(v) => setCard(formatCard(v))} placeholder="4242 4242 4242 4242" inputMode="numeric" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiration" value={exp} onChange={(v) => setExp(formatExp(v))} placeholder="MM/AA" inputMode="numeric" />
                  <Field label="CVC" value={cvc} onChange={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} placeholder="123" inputMode="numeric" />
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-stone-500">
                  <Lock className="w-3 h-3" /> Paiement chiffré · démo, aucune transaction réelle
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Récap latéral */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-32">
              <ImageWithFallback src={AFR[lieu.hero]} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-stone-900/30" />
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <div className="text-[10px] uppercase opacity-80">{lieu.region}, {lieu.country}</div>
                <div className="font-bold text-sm">{lieu.name}</div>
              </div>
            </div>
            <dl className="p-4 text-sm space-y-1.5">
              <Row k={`${nightly.toLocaleString('fr-FR')} × ${nights} nuit(s) × ${rooms}`} v={`${subtotal.toLocaleString('fr-FR')} FCFA`} />
              {optionsCost > 0 && <Row k="Options" v={`${optionsCost.toLocaleString('fr-FR')} FCFA`} />}
              {insuranceCost > 0 && <Row k="Assurance" v={`${insuranceCost.toLocaleString('fr-FR')} FCFA`} />}
              <Row k="Taxes (7,5 %)" v={`${taxes.toLocaleString('fr-FR')} FCFA`} />
              <Row k="Frais de service" v={`${fees.toLocaleString('fr-FR')} FCFA`} />
              <div className="border-t border-stone-100 my-2" />
              <Row k="Total" v={`${total.toLocaleString('fr-FR')} FCFA`} bold />
            </dl>
          </div>
        </aside>
      </div>

      {/* CTA fixe */}
      <div className="fixed bottom-[4.5rem] inset-x-0 z-30 bg-white border-t border-stone-200 px-6 sm:px-8 py-3 flex items-center gap-3">
        <div className="flex-1 hidden sm:block">
          <div className="text-[11px] text-stone-500">Total</div>
          <div className="font-bold text-stone-900">{total.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <button
          disabled={!canNext}
          onClick={goNext}
          className={`flex-1 sm:flex-initial sm:px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition ${
            canNext ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 hover:bg-rose-700' : 'bg-stone-200 text-stone-500 cursor-not-allowed'
          }`}
        >
          {step === 'paiement' ? 'Payer maintenant' : 'Continuer'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
      <h2 className="text-sm font-bold text-stone-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', inputMode }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; inputMode?: any }) {
  return (
    <label className="block mb-3 last:mb-0">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">{label}</div>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:bg-rose-50/30 outline-none text-sm"
      />
    </label>
  );
}

function FieldDate({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">{label}</div>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 outline-none text-sm"
      />
    </label>
  );
}

function Stepper({ label, Icon, value, setValue, min }: { label: string; Icon: any; value: number; setValue: (n: number) => void; min: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="inline-flex items-center gap-2 text-sm text-stone-800">
        <Icon className="w-4 h-4 text-rose-500" /> {label}
      </div>
      <div className="inline-flex items-center gap-3">
        <button onClick={() => setValue(Math.max(min, value - 1))} className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100">−</button>
        <div className="w-6 text-center font-semibold text-stone-900">{value}</div>
        <button onClick={() => setValue(value + 1)} className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100">+</button>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? 'font-bold text-stone-900' : 'text-stone-700'}`}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export { ChevronRight };
