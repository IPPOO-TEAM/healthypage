import { useState } from 'react';
import { Gift, Wallet, Ticket, Sparkles, Clock, ArrowRight, BadgeCheck } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { AVANTAGES } from '../data';
import { useStoredState } from '../../components/useStoredState';

const PRIZES = ['-15% sur votre prochain séjour', '+200 points', 'Yoga sur la plage offert', '+50 points', '-10% Spa', 'Hammam offert'];

export default function AvantagesScreen() {
  const [points, setPoints] = useStoredState<number>('voyage:points', 1240);
  const [history, setHistory] = useStoredState<string[]>('voyage:wheel-history', []);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const flash = AVANTAGES.filter((a) => a.type === 'flash');
  const gifts = AVANTAGES.filter((a) => a.type === 'gift');
  const tickets = AVANTAGES.filter((a) => a.type === 'ticket');

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setLast(null);
    setTimeout(() => {
      const p = PRIZES[Math.floor(Math.random() * PRIZES.length)];
      setLast(p);
      setHistory([p, ...history].slice(0, 8));
      if (p.includes('points')) {
        const n = parseInt(p.replace(/\D/g, ''), 10) || 0;
        setPoints((points ?? 0) + n);
      }
      setSpinning(false);
    }, 2200);
  };

  return (
    <div className="px-6 sm:px-8 pt-5 relative">
      {/* Halos d'ambiance */}
      <div className="pointer-events-none absolute -top-10 -left-16 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -right-20 w-80 h-80 rounded-full bg-rose-300/25 blur-3xl" />

      <header className="relative flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Avantages</h1>
          <p className="text-sm text-stone-500 mt-0.5">Vos avantages, vos économies, vos surprises.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 text-amber-700 flex items-center justify-center shadow-sm">
          <Gift className="w-5 h-5" />
        </div>
      </header>

      {/* Wallet */}
      <section className="mt-5 relative">
        <div className="relative rounded-xl overflow-hidden p-6 text-white shadow-xl ring-1 ring-white/10">
          <ImageWithFallback src={AFR.indigoWall} alt="Indigo" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-rose-900/80" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Mon portefeuille</div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tight">{(points ?? 0).toLocaleString('fr-FR')}</span>
              <span className="text-sm text-white/80 mb-1">points</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
              <Stat Icon={Ticket} label="Tickets" value={tickets.length} />
              <Stat Icon={Wallet} label="Cartes cadeaux" value={gifts.length} />
              <Stat Icon={BadgeCheck} label="Niveau" value="Or" />
            </div>
          </div>
        </div>
      </section>

      {/* Offres flash */}
      <Block title="Offres flash" subtitle="Une fenêtre courte, un avantage immédiat.">
        <div className="grid sm:grid-cols-2 gap-3">
          {flash.map((a) => (
            <article key={a.id} className="relative bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
              <ImageWithFallback src={AFR[a.cover]} alt={a.title} className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">{a.value}</span>
                  {a.expires && (
                    <span className="text-[11px] text-stone-500 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> jusqu'au {a.expires}
                    </span>
                  )}
                </div>
                <div className="mt-2 font-semibold text-sm text-stone-900">{a.title}</div>
                <p className="text-xs text-stone-500 mt-1">{a.desc}</p>
                <button className="mt-3 w-full py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Activer l'alerte</button>
              </div>
            </article>
          ))}
        </div>
      </Block>

      {/* Cartes cadeaux */}
      <Block title="Cartes cadeaux" subtitle="Offrez une pause qui fait du bien.">
        <div className="grid sm:grid-cols-2 gap-3">
          {gifts.map((a) => (
            <article key={a.id} className="relative rounded-xl overflow-hidden bg-white border border-stone-100 shadow-sm flex">
              <ImageWithFallback src={AFR[a.cover]} alt={a.title} className="w-24 h-full object-cover flex-shrink-0" />
              <div className="p-3 flex-1">
                <div className="text-xs font-bold text-amber-700">{a.value}</div>
                <div className="font-semibold text-sm text-stone-900 mt-0.5">{a.title}</div>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{a.desc}</p>
                <button className="mt-2 text-xs font-semibold text-rose-600 inline-flex items-center gap-1">
                  Offrir <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Block>

      {/* Tickets */}
      <Block title="Tickets cadeaux" subtitle="À utiliser sur des activités ou options.">
        <div className="space-y-2">
          {tickets.map((a) => (
            <article key={a.id} className="flex items-center bg-white border border-dashed border-stone-300 rounded-xl p-3 gap-3">
              <ImageWithFallback src={AFR[a.cover]} alt={a.title} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-stone-900">{a.title}</div>
                <div className="text-[11px] text-stone-500">{a.desc}</div>
              </div>
              <button className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">Utiliser</button>
            </article>
          ))}
        </div>
      </Block>

      {/* Roue de la fortune */}
      <Block title="Roue de la fortune" subtitle="Tournez et récupérez un avantage.">
        <div className="bg-rose-100 rounded-2xl p-6 text-center border border-amber-200">
          <div className="relative w-44 h-44 mx-auto">
            <div
              className={`w-full h-full rounded-full border-8 border-white shadow-xl ${spinning ? 'animate-spin' : ''}`}
              style={{
                background:
                  'conic-gradient(from 0deg, #fb7185 0 16%, #fbbf24 16% 32%, #34d399 32% 48%, #a78bfa 48% 64%, #f472b6 64% 80%, #f59e0b 80% 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-stone-900" />
          </div>
          <button
            onClick={spin}
            disabled={spinning}
            className="mt-5 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-semibold inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {spinning ? 'En cours…' : 'Tourner la roue'}
          </button>
          {last && <div className="mt-4 text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Vous avez gagné&nbsp;: {last}</div>}
          {history.length > 0 && (
            <div className="mt-4 text-left">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Historique</div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-white border border-stone-200 text-stone-600">{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Block>

      <div className="h-6" />
    </div>
  );
}

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Stat({ Icon, label, value }: { Icon: any; label: string; value: any }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2 border border-white/15">
      <div className="flex items-center gap-1.5 text-white/80">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="font-bold text-base mt-0.5">{value}</div>
    </div>
  );
}
