import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Plane, MessageCircle, X, Sparkles, Plus, ReceiptText } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';
import { listBookings, updateBooking, ensureBookingSeed, Booking } from '../bookingStore';

type Tab = 'a-venir' | 'passes' | 'annules';

export default function MesVoyagesScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('a-venir');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [, force] = useState(0);

  useEffect(() => { ensureBookingSeed(); setBookings(listBookings()); }, []);

  const todayISO = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => bookings.filter((b) => {
    if (b.status === 'cancelled') return tab === 'annules';
    if (tab === 'a-venir') return b.endISO >= todayISO;
    if (tab === 'passes') return b.endISO < todayISO;
    return false;
  }), [bookings, tab, todayISO]);

  const cancel = (id: string) => {
    updateBooking(id, { status: 'cancelled' });
    setBookings(listBookings());
    force((n) => n + 1);
  };

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500">Voyages</div>
          <div className="font-semibold text-stone-900">Mes réservations</div>
        </div>
      </header>

      <div className="px-6 sm:px-8 pt-4">
        <div className="inline-flex bg-stone-100 p-1 rounded-full">
          {([
            { id: 'a-venir', label: 'À venir' },
            { id: 'passes', label: 'Passés' },
            { id: 'annules', label: 'Annulés' },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                tab === t.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 sm:px-8 mt-5 space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center">
            <Sparkles className="w-6 h-6 text-rose-400 mx-auto" />
            <div className="mt-2 font-semibold text-stone-800">
              {tab === 'a-venir' ? 'Aucun voyage à venir' : tab === 'passes' ? "Pas encore d'aventures" : 'Aucune annulation'}
            </div>
            <p className="mt-1 text-sm text-stone-500">Trouvez votre prochaine parenthèse.</p>
            <button onClick={() => navigate('/voyage-loisirs/explorer')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold">
              <Plus className="w-4 h-4" /> Explorer les destinations
            </button>
          </div>
        )}

        {filtered.map((b) => {
          const lieu = LIEUX.find((l) => l.id === b.lieuId);
          if (!lieu) return null;
          return (
            <article key={b.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => navigate(`/voyage-loisirs/lieu/${lieu.id}`)} className="block w-full text-left">
                <div className="flex">
                  <div className="relative w-28 sm:w-36 flex-shrink-0">
                    <ImageWithFallback src={AFR[lieu.hero]} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
                    {b.status === 'cancelled' && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-[11px] font-bold tracking-wider">ANNULÉ</div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3" /> {lieu.region}, {lieu.country}
                    </div>
                    <div className="mt-0.5 font-semibold text-stone-900">{lieu.name}</div>
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-stone-700">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      {fmtRange(b.startISO, b.endISO)} · {b.nights} nuit{b.nights > 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 text-[11px] text-stone-500">
                      Réf. {b.reference} · {b.guestsAdults} adulte{b.guestsAdults > 1 ? 's' : ''}
                      {b.guestsChildren ? `, ${b.guestsChildren} enfant${b.guestsChildren > 1 ? 's' : ''}` : ''} · {b.rooms} chambre{b.rooms > 1 ? 's' : ''}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        b.status === 'cancelled' ? 'bg-stone-200 text-stone-600' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {b.status === 'confirmed' ? 'Confirmé' : b.status === 'pending' ? 'En attente' : b.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                      </span>
                      <span className="text-[12px] font-bold text-stone-900">{b.total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              </button>

              {b.status !== 'cancelled' && (
                <div className="border-t border-stone-100 px-3 py-2 flex items-center justify-end gap-2 bg-stone-50/40">
                  <button
                    onClick={() => navigate(`/voyage-loisirs/messages/${b.lieuId}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Hôte
                  </button>
                  <button
                    onClick={() => navigate(`/voyage-loisirs/voyage/${b.id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 inline-flex items-center gap-1"
                  >
                    <ReceiptText className="w-3.5 h-3.5" /> Détails
                  </button>
                  {tab === 'a-venir' && (
                    <button
                      onClick={() => { if (confirm('Confirmer l\'annulation de cette réservation ?')) cancel(b.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Annuler
                    </button>
                  )}
                  {tab === 'passes' && (
                    <button
                      onClick={() => navigate(`/voyage-loisirs/avis/${b.lieuId}?write=1`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Laisser un avis
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function fmtRange(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  const sameMonth = da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
  if (sameMonth) {
    return `${da.getDate()} – ${db.getDate()} ${db.toLocaleDateString('fr-FR', { month: 'short' })} ${db.getFullYear()}`;
  }
  return `${fmt.format(da)} – ${fmt.format(db)} ${db.getFullYear()}`;
}
