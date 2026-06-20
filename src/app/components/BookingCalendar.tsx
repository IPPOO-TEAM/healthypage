import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Props {
  blockedDates?: string[];
  minNights?: number;
  maxNights?: number;
  pricePerNight?: number;
  currency?: string;
  initialStart?: string | null;
  initialNights?: number;
  onConfirm: (data: { startISO: string; endISO: string; nights: number; total: number }) => void;
}

const FR_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const FR_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return toISO(dt);
}
function diffDays(a: string, b: string) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  const t1 = new Date(y1, m1 - 1, d1).getTime();
  const t2 = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((t2 - t1) / 86400000);
}

export function BookingCalendar({
  blockedDates = [],
  minNights = 2,
  maxNights = 14,
  pricePerNight = 65000,
  currency = 'FCFA',
  initialStart = null,
  initialNights = 3,
  onConfirm,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [start, setStart] = useState<string | null>(initialStart);
  const [end, setEnd] = useState<string | null>(initialStart ? addDays(initialStart, initialNights) : null);
  const [guests, setGuests] = useState(2);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const todayISO = toISO(today);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const daysIn = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(toISO(new Date(cursor.getFullYear(), cursor.getMonth(), d)));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const inRange = (iso: string) => start && end && iso > start && iso < end;
  const isStart = (iso: string) => start === iso;
  const isEnd = (iso: string) => end === iso;
  const isPast = (iso: string) => iso < todayISO;
  const isBlocked = (iso: string) => blockedSet.has(iso);

  const onPick = (iso: string) => {
    if (isPast(iso) || isBlocked(iso)) return;
    if (!start || (start && end)) {
      setStart(iso);
      setEnd(null);
      return;
    }
    if (iso <= start) {
      setStart(iso);
      return;
    }
    const nights = diffDays(start, iso);
    if (nights < minNights) return;
    if (nights > maxNights) return;
    // Refuse if any blocked date is between
    for (let i = 1; i < nights; i++) {
      const between = addDays(start, i);
      if (blockedSet.has(between)) {
        setStart(iso);
        setEnd(null);
        return;
      }
    }
    setEnd(iso);
  };

  const nights = start && end ? diffDays(start, end) : 0;
  const total = nights * pricePerNight * guests;

  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  };
  const fmtMoney = (n: number) => n.toLocaleString('fr-FR') + ' ' + currency;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-full hover:bg-slate-100"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-semibold text-slate-900">
          {FR_MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-full hover:bg-slate-100"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 pt-3">
        <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500 uppercase tracking-wide mb-1">
          {FR_DAYS.map((d) => <div key={d} className="text-center py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const past = isPast(iso);
            const blocked = isBlocked(iso);
            const sel = isStart(iso) || isEnd(iso);
            const range = inRange(iso);
            return (
              <button
                key={iso}
                disabled={past || blocked}
                onClick={() => onPick(iso)}
                className={[
                  'h-10 rounded-lg text-sm font-medium transition relative',
                  past || blocked
                    ? 'text-slate-300 cursor-not-allowed line-through'
                    : sel
                    ? 'bg-sky-600 text-white shadow-md'
                    : range
                    ? 'bg-sky-100 text-sky-900'
                    : 'hover:bg-slate-100 text-slate-700',
                ].join(' ')}
              >
                {Number(iso.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 mt-3 bg-slate-50 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Arrivée</span>
          <span className="font-semibold text-slate-900">{start ? fmt(start) : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Départ</span>
          <span className="font-semibold text-slate-900">{end ? fmt(end) : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Voyageurs</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100">−</button>
            <span className="w-6 text-center font-semibold">{guests}</span>
            <button onClick={() => setGuests(Math.min(8, guests + 1))} className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100">+</button>
          </div>
        </div>
        {nights > 0 && (
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {nights} nuit{nights > 1 ? 's' : ''} × {guests} voyageur{guests > 1 ? 's' : ''}
            </div>
            <div className="font-bold text-lg text-slate-900">{fmtMoney(total)}</div>
          </div>
        )}
        <button
          disabled={!start || !end}
          onClick={() => start && end && onConfirm({ startISO: start, endISO: end, nights, total })}
          className="w-full mt-2 py-3 rounded-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold inline-flex items-center justify-center gap-2 shadow-md transition"
        >
          <Check className="w-4 h-4" />
          {start && end ? 'Confirmer la réservation' : `Sélectionnez ${minNights} nuits minimum`}
        </button>
        {blockedDates.length > 0 && (
          <p className="text-[11px] text-slate-500 text-center">
            Les dates barrées sont déjà réservées.
          </p>
        )}
      </div>
    </div>
  );
}
