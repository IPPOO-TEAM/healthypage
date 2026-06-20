import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShoppingBasket, Leaf, Users, Sparkles, Truck, MapPin, Plus, Minus, Trash2, CheckCircle2, Calendar, Tag, Search, Bell, Apple, Carrot, Wheat, Drumstick, Pause, Play, Smartphone, Wallet, History, X, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type BoxKind = 'hebdo' | 'mensuelle' | 'thematique';
type ThemeId = 'maternite' | 'pediatrie' | 'vegetarien' | 'sansgluten' | 'sportif' | 'postop';
type Pay = 'mtn' | 'moov' | 'celtiis' | 'cash';

type Box = {
  id: string;
  name: string;
  kind: BoxKind;
  theme?: ThemeId;
  description: string;
  contents: string[];
  pricePerWeek: number;
  image: string;
};

const BOXES: Box[] = [
  { id: 'b1', name: 'Box Équilibre Hebdo', kind: 'hebdo', description: 'Fruits, légumes de saison, protéines variées, céréales locales.', contents: ['Igname', 'Tomates', 'Poisson fumé', 'Mil', 'Légumes verts', 'Oranges'], pricePerWeek: 8500, image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800' },
  { id: 'b2', name: 'Box Famille Mensuelle', kind: 'mensuelle', description: 'Approvisionnement complet pour 4-6 personnes sur le mois.', contents: ['Riz local 5kg', 'Haricot 2kg', 'Huile palme 2L', 'Poisson', 'Légumes', 'Fruits'], pricePerWeek: 6500, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800' },
  { id: 'b3', name: 'Box Maternité', kind: 'thematique', theme: 'maternite', description: 'Riche en fer, calcium, folates pour grossesse et allaitement.', contents: ['Foie de bœuf', 'Épinards', 'Oeufs', 'Sésame', 'Patate douce', 'Avocat'], pricePerWeek: 11000, image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800' },
  { id: 'b4', name: 'Box Pédiatrique', kind: 'thematique', theme: 'pediatrie', description: 'Adaptée aux enfants 3-12 ans : croissance et concentration.', contents: ['Banane', 'Beurre d\'arachide', 'Yaourt', 'Maïs doux', 'Mangue', 'Lait'], pricePerWeek: 7500, image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800' },
  { id: 'b5', name: 'Box Végétarienne', kind: 'thematique', theme: 'vegetarien', description: '100% végétal, riche en protéines (légumineuses, oléagineux).', contents: ['Niébé', 'Tofu', 'Pois chiches', 'Tahini', 'Légumes', 'Quinoa'], pricePerWeek: 9000, image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800' },
  { id: 'b6', name: 'Box Sportive', kind: 'thematique', theme: 'sportif', description: 'Apport protéique et énergétique élevé.', contents: ['Poulet', 'Œufs', 'Riz complet', 'Banane', 'Avoine', 'Amandes'], pricePerWeek: 12500, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800' },
  { id: 'b7', name: 'Box Sans Gluten', kind: 'thematique', theme: 'sansgluten', description: 'Aliments naturellement sans gluten et certifiés.', contents: ['Manioc', 'Riz', 'Sarrasin', 'Légumes', 'Poisson', 'Fruits'], pricePerWeek: 10500, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800' },
  { id: 'b8', name: 'Box Récupération Post-Op', kind: 'thematique', theme: 'postop', description: 'Riche en protéines et zinc pour cicatrisation.', contents: ['Poulet bouilli', 'Œufs', 'Bouillon', 'Patate', 'Carottes', 'Citron'], pricePerWeek: 13000, image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800' }
];

type Subscription = { boxId: string; quantity: number; paused?: boolean };
type Order = { id: string; date: string; nextAt: string; total: number; itemCount: number; delivery: 'domicile' | 'relais'; address: string; pay: Pay };

type GroupBuy = { id: string; product: string; target: number; current: number; unitPrice: number; deadline: string };
const GROUPS: GroupBuy[] = [
  { id: 'g1', product: 'Sac riz local 25 kg', target: 20, current: 14, unitPrice: 14500, deadline: 'dans 4 jours' },
  { id: 'g2', product: 'Cageot tomates fraîches 10 kg', target: 15, current: 11, unitPrice: 4500, deadline: 'dans 2 jours' },
  { id: 'g3', product: 'Carton œufs (180 unités)', target: 10, current: 6, unitPrice: 9500, deadline: 'dans 6 jours' },
  { id: 'g4', product: 'Bidon huile arachide 5L', target: 12, current: 9, unitPrice: 6800, deadline: 'dans 3 jours' }
];

const KIND_LABEL: Record<BoxKind, string> = { hebdo: 'Hebdomadaire', mensuelle: 'Mensuelle', thematique: 'Thématique' };
const PAY_META: Record<Pay, { label: string; icon: typeof Smartphone; tone: string }> = {
  mtn: { label: 'MTN MoMo', icon: Smartphone, tone: 'bg-yellow-500' },
  moov: { label: 'Moov Money', icon: Smartphone, tone: 'bg-blue-600' },
  celtiis: { label: 'Celtiis Cash', icon: Smartphone, tone: 'bg-violet-600' },
  cash: { label: 'Espèces à la livraison', icon: Wallet, tone: 'bg-emerald-600' }
};

const STORE = {
  subs: 'healthy-page:box:subs',
  joined: 'healthy-page:box:joined',
  delivery: 'healthy-page:box:delivery',
  address: 'healthy-page:box:address',
  pay: 'healthy-page:box:pay',
  orders: 'healthy-page:box:orders'
};
const loadJSON = <T,>(k: string, fb: T): T => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const saveJSON = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

export default function BoxAlimentairesScreen({ onBack }: Props) {
  const [tab, setTab] = useState<'box' | 'panier' | 'groupes' | 'historique'>('box');
  const [filter, setFilter] = useState<BoxKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [subs, setSubs] = useState<Subscription[]>(() => loadJSON<Subscription[]>(STORE.subs, []));
  const [joined, setJoined] = useState<string[]>(() => loadJSON<string[]>(STORE.joined, []));
  const [delivery, setDelivery] = useState<'domicile' | 'relais'>(() => loadJSON<'domicile' | 'relais'>(STORE.delivery, 'domicile'));
  const [address, setAddress] = useState<string>(() => loadJSON<string>(STORE.address, ''));
  const [pay, setPay] = useState<Pay>(() => loadJSON<Pay>(STORE.pay, 'mtn'));
  const [orders, setOrders] = useState<Order[]>(() => loadJSON<Order[]>(STORE.orders, []));
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => saveJSON(STORE.subs, subs), [subs]);
  useEffect(() => saveJSON(STORE.joined, joined), [joined]);
  useEffect(() => saveJSON(STORE.delivery, delivery), [delivery]);
  useEffect(() => saveJSON(STORE.address, address), [address]);
  useEffect(() => saveJSON(STORE.pay, pay), [pay]);
  useEffect(() => saveJSON(STORE.orders, orders), [orders]);

  const filtered = useMemo(() => {
    return BOXES.filter((b) => {
      if (filter !== 'all' && b.kind !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q) && !b.contents.some((c) => c.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [filter, query]);

  const activeSubs = useMemo(() => subs.filter((s) => !s.paused), [subs]);

  const totalWeekly = useMemo(() => activeSubs.reduce((s, x) => {
    const b = BOXES.find((bb) => bb.id === x.boxId);
    return s + (b ? b.pricePerWeek * x.quantity : 0);
  }, 0), [activeSubs]);

  const setQty = (boxId: string, delta: number) => {
    setSubs((current) => {
      const existing = current.find((x) => x.boxId === boxId);
      if (!existing && delta > 0) return [...current, { boxId, quantity: delta }];
      return current.flatMap((x) => {
        if (x.boxId !== boxId) return [x];
        const next = x.quantity + delta;
        return next > 0 ? [{ ...x, quantity: next }] : [];
      });
    });
  };

  const togglePause = (boxId: string) => setSubs((c) => c.map((x) => x.boxId === boxId ? { ...x, paused: !x.paused } : x));
  const remove = (boxId: string) => setSubs((c) => c.filter((x) => x.boxId !== boxId));

  const canCheckout = subs.length > 0 && address.trim().length > 0 && totalWeekly > 0;

  const validate = () => {
    if (!canCheckout) return;
    const today = new Date();
    const order: Order = {
      id: `ORD-${Date.now()}`,
      date: today.toISOString().slice(0, 10),
      nextAt: addDays(today, 7),
      total: totalWeekly,
      itemCount: activeSubs.reduce((s, x) => s + x.quantity, 0),
      delivery,
      address,
      pay
    };
    setOrders((o) => [order, ...o]);
    setCheckout(false);
    setConfirmed(`Commande ${order.id} validée · ${order.total.toLocaleString('fr-FR')} F · prochaine livraison ${order.nextAt}`);
    setTimeout(() => setConfirmed(null), 5000);
  };

  const joinGroup = (id: string) => setJoined((j) => j.includes(id) ? j : [...j, id]);
  const leaveGroup = (id: string) => setJoined((j) => j.filter((x) => x !== id));

  const subCount = subs.reduce((s, x) => s + x.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Cotonou, Bénin</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setTab('panier')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 relative">
            <ShoppingBasket className="w-4 h-4" />
            {subCount > 0 && <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{subCount}</span>}
          </button>
          <button onClick={() => setTab('historique')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 relative">
            <Bell className="w-4 h-4" />
            {orders.length > 0 && <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{orders.length}</span>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm flex items-center gap-2 px-4 py-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Que voulez-vous manger ?" className="flex-1 bg-transparent text-sm outline-none" />
        {query && <button onClick={() => setQuery('')} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-3 h-3 text-gray-500" /></button>}
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-emerald-700">Offre légumes</p>
          <p className="text-2xl text-slate-900">-20%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Jusqu'au 10 mai 2026</p>
          <button onClick={() => { setQuery('légumes'); setTab('box'); }} className="mt-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs">Profiter</button>
        </div>
        <div className="w-28 h-28 rounded-2xl overflow-hidden">
          <ImageWithFallback src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400" alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-5 gap-1">
          {[
            { icon: Leaf, label: 'Halal', q: 'halal', color: 'bg-amber-50 text-amber-600' },
            { icon: Sparkles, label: 'Promos', q: 'sportif', color: 'bg-rose-50 text-rose-500' },
            { icon: Apple, label: 'Fruits', q: 'fruits', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Carrot, label: 'Légumes', q: 'légumes', color: 'bg-orange-50 text-orange-500' },
            { icon: Drumstick, label: 'Protéines', q: 'poisson', color: 'bg-red-50 text-red-500' }
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.label} onClick={() => { setQuery(c.q); setTab('box'); }} className="flex flex-col items-center gap-1.5 p-1">
                <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-700">{c.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => { setQuery(''); setFilter('all'); setTab('box'); }} className="mt-3 w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center justify-center gap-1.5">
          <Wheat className="w-3.5 h-3.5" /> Voir toutes les catégories
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-1 grid grid-cols-4 gap-1">
        {[
          { id: 'box' as const, label: 'Box' },
          { id: 'panier' as const, label: `Panier${subs.length ? ` (${subs.length})` : ''}` },
          { id: 'groupes' as const, label: 'Groupés' },
          { id: 'historique' as const, label: `Cmd${orders.length ? ` (${orders.length})` : ''}` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold py-2 rounded-xl transition ${
              tab === t.id ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow' : 'text-gray-600 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'box' && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([['all', 'Toutes'], ['hebdo', 'Hebdo'], ['mensuelle', 'Mensuelle'], ['thematique', 'Thématiques']] as const).map(([k, lbl]) => (
              <button
                key={k}
                onClick={() => setFilter(k as any)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium border transition ${
                  filter === k ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune box ne correspond à « {query} ».</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((b, i) => {
              const sub = subs.find((s) => s.boxId === b.id);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col"
                >
                  <div className="relative h-32">
                    <ImageWithFallback src={b.image} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/90 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                      <Tag className="w-3 h-3" /> {KIND_LABEL[b.kind]}
                    </span>
                    <p className="absolute bottom-2 right-3 text-white font-bold">{b.pricePerWeek.toLocaleString('fr-FR')} F</p>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{b.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 flex-1">{b.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {b.contents.slice(0, 4).map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          <Leaf className="inline w-2.5 h-2.5 mr-0.5" />{c}
                        </span>
                      ))}
                      {b.contents.length > 4 && <span className="text-[10px] text-gray-500">+{b.contents.length - 4}</span>}
                    </div>
                    {sub ? (
                      <div className="mt-3 flex items-center justify-between gap-2 bg-teal-50 dark:bg-teal-900/30 rounded-xl px-2 py-1.5">
                        <button onClick={() => setQty(b.id, -1)} className="bg-white dark:bg-slate-700 p-1 rounded-full"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-semibold text-teal-800 dark:text-teal-200">{sub.quantity} abo{sub.paused ? ' · pause' : ''}</span>
                        <button onClick={() => setQty(b.id, 1)} className="bg-white dark:bg-slate-700 p-1 rounded-full"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setQty(b.id, 1)}
                        className="mt-3 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> S'abonner
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'panier' && (
        <div className="space-y-3">
          {subs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
              <ShoppingBasket className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Votre panier est vide.</p>
              <button onClick={() => setTab('box')} className="mt-3 text-xs text-teal-700 dark:text-teal-300 font-medium">Découvrir les box →</button>
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {subs.map((s) => {
                  const b = BOXES.find((x) => x.id === s.boxId)!;
                  return (
                    <li key={s.boxId} className={`bg-white dark:bg-slate-800 rounded-xl border p-3 flex items-center gap-3 ${s.paused ? 'border-amber-200 opacity-70' : 'border-gray-100 dark:border-slate-700'}`}>
                      <ImageWithFallback src={b.image} alt={b.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{b.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{(b.pricePerWeek * s.quantity).toLocaleString('fr-FR')} F / sem.{s.paused ? ' · en pause' : ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => togglePause(b.id)} className="p-1 text-gray-500 hover:text-amber-600" title={s.paused ? 'Reprendre' : 'Mettre en pause'}>
                          {s.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setQty(b.id, -1)} className="bg-gray-100 dark:bg-slate-700 p-1 rounded-full"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-semibold w-5 text-center">{s.quantity}</span>
                        <button onClick={() => setQty(b.id, 1)} className="bg-gray-100 dark:bg-slate-700 p-1 rounded-full"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(b.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Livraison</p>
                <div className="grid grid-cols-2 gap-2">
                  {([['domicile', 'À domicile', Truck], ['relais', 'Point relais', MapPin]] as const).map(([k, lbl, Icon]) => (
                    <button
                      key={k}
                      onClick={() => setDelivery(k)}
                      className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${
                        delivery === k ? 'bg-teal-50 border-teal-400 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-700' : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {lbl}
                    </button>
                  ))}
                </div>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={delivery === 'domicile' ? 'Adresse de livraison (quartier, repère)' : 'Point relais (clinique, campus, quartier)'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 pt-2">Paiement</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAY_META) as Pay[]).map((k) => {
                    const Icon = PAY_META[k].icon;
                    const sel = pay === k;
                    return (
                      <button key={k} onClick={() => setPay(k)} className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition ${sel ? 'bg-teal-50 border-teal-400 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-700' : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'}`}>
                        <span className={`w-6 h-6 rounded-md ${PAY_META[k].tone} flex items-center justify-center text-white`}><Icon className="w-3 h-3" /></span>
                        {PAY_META[k].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Total hebdomadaire</p>
                  <p className="text-2xl font-bold">{totalWeekly.toLocaleString('fr-FR')} F CFA</p>
                  <p className="text-xs opacity-80 mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Renouvellement automatique chaque semaine</p>
                </div>
                <button onClick={() => setCheckout(true)} disabled={!canCheckout} className="bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl shadow disabled:opacity-50">Valider</button>
              </div>

              {!canCheckout && address.trim() === '' && (
                <p className="text-xs text-amber-700 text-center">Renseignez une adresse pour valider.</p>
              )}

              {confirmed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {confirmed}
                </motion.div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'groupes' && (
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Rejoignez un achat groupé pour bénéficier de prix négociés. Tarifs jusqu'à <strong>-30%</strong> par rapport au marché.</span>
          </div>

          <ul className="space-y-2">
            {GROUPS.map((g) => {
              const done = joined.includes(g.id);
              const current = g.current + (done ? 1 : 0);
              const pct = Math.min(100, Math.round((current / g.target) * 100));
              return (
                <motion.li
                  key={g.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100">{g.product}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{g.unitPrice.toLocaleString('fr-FR')} F · clôture {g.deadline}</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                      className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'}`}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300">{current} / {g.target} participants</span>
                    {done ? (
                      <button onClick={() => leaveGroup(g.id)} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Rejoint · annuler
                      </button>
                    ) : (
                      <button onClick={() => joinGroup(g.id)} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white">
                        Rejoindre
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}

      {tab === 'historique' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
              <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune commande enregistrée.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => {
                const Icon = PAY_META[o.pay].icon;
                return (
                  <li key={o.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 inline-flex items-center gap-1"><Receipt className="w-3 h-3" /> {o.id}</p>
                        <p className="font-semibold text-gray-900 dark:text-slate-100 mt-0.5">{o.total.toLocaleString('fr-FR')} F · {o.itemCount} box</p>
                        <p className="text-xs text-gray-500 mt-0.5">Validée le {o.date} · prochaine livraison {o.nextAt}</p>
                      </div>
                      <span className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white ${PAY_META[o.pay].tone}`}>
                        <Icon className="w-3 h-3" /> {PAY_META[o.pay].label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-slate-300 inline-flex items-center gap-1">
                      {o.delivery === 'domicile' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {o.delivery === 'domicile' ? 'Domicile' : 'Relais'} · {o.address}
                    </p>
                  </li>
                );
              })}
              <button onClick={() => setOrders([])} className="w-full text-xs text-red-600 py-2">Vider l'historique</button>
            </ul>
          )}
        </div>
      )}

      <AnimatePresence>
        {checkout && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckout(false)}>
            <motion.div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 space-y-4" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Confirmer la commande</h3>
                <button onClick={() => setCheckout(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <ul className="space-y-1 text-sm">
                {activeSubs.map((s) => {
                  const b = BOXES.find((x) => x.id === s.boxId)!;
                  return (
                    <li key={s.boxId} className="flex justify-between">
                      <span className="text-gray-700">{b.name} × {s.quantity}</span>
                      <span className="font-medium text-gray-900">{(b.pricePerWeek * s.quantity).toLocaleString('fr-FR')} F</span>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-600">
                <p><Truck className="inline w-3 h-3 mr-1" /> {delivery === 'domicile' ? 'Domicile' : 'Relais'} · {address}</p>
                <p>{(() => { const Icon = PAY_META[pay].icon; return <Icon className="inline w-3 h-3 mr-1" />; })()} {PAY_META[pay].label}</p>
                <p><Calendar className="inline w-3 h-3 mr-1" /> Première livraison sous 7 jours</p>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3">
                <span>Total / sem.</span>
                <span className="text-teal-700">{totalWeekly.toLocaleString('fr-FR')} F</span>
              </div>
              <button onClick={validate} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow inline-flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Confirmer & payer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
