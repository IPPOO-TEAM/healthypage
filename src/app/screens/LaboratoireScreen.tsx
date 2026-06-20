import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FlaskConical, Search, Plus, Trash2, FileText, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Activity, Download } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type Analysis = { id: string; code: string; name: string; category: string; preparation: string; delay: string; price: number };

const CATALOGUE: Analysis[] = [
  { id: "nfs", code: "NFS", name: "Numération formule sanguine", category: "Hématologie", preparation: "À jeun non requis", delay: "24h", price: 4500 },
  { id: "gly", code: "GLY", name: "Glycémie à jeun", category: "Biochimie", preparation: "À jeun 12h", delay: "12h", price: 2500 },
  { id: "hba1c", code: "HBA1C", name: "Hémoglobine glyquée (HbA1c)", category: "Biochimie", preparation: "Aucune", delay: "48h", price: 8500 },
  { id: "chol", code: "CHOL", name: "Bilan lipidique complet", category: "Biochimie", preparation: "À jeun 12h", delay: "24h", price: 6500 },
  { id: "creat", code: "CREAT", name: "Créatininémie & DFG", category: "Biochimie", preparation: "À jeun non requis", delay: "24h", price: 3500 },
  { id: "tsh", code: "TSH", name: "TSH (thyroïde)", category: "Hormones", preparation: "Le matin de préférence", delay: "48h", price: 7500 },
  { id: "bhcg", code: "BHCG", name: "β-HCG (grossesse)", category: "Hormones", preparation: "Aucune", delay: "24h", price: 5500 },
  { id: "vih", code: "VIH", name: "Sérologie VIH", category: "Sérologie", preparation: "Aucune", delay: "48h", price: 4500 },
  { id: "hbs", code: "HBS", name: "Hépatite B (Ag HBs)", category: "Sérologie", preparation: "Aucune", delay: "48h", price: 5000 },
  { id: "palu", code: "PALU", name: "Goutte épaisse / TDR paludisme", category: "Parasitologie", preparation: "Aucune", delay: "2h", price: 2000 },
  { id: "ecbu", code: "ECBU", name: "ECBU (urines)", category: "Bactériologie", preparation: "Hygiène intime préalable", delay: "48h", price: 4000 },
  { id: "copro", code: "COPRO", name: "Coproculture", category: "Bactériologie", preparation: "Recueil matinal", delay: "72h", price: 5500 },
  { id: "crp", code: "CRP", name: "CRP (inflammation)", category: "Biochimie", preparation: "Aucune", delay: "12h", price: 3000 },
  { id: "ferr", code: "FERR", name: "Ferritine", category: "Biochimie", preparation: "Aucune", delay: "48h", price: 6000 },
];

const CATEGORIES = Array.from(new Set(CATALOGUE.map(a => a.category)));

type Demand = { id: string; date: string; analyses: string[]; status: "préparation" | "prélevé" | "résultats" };

const STORAGE_KEY = "healthy-page:lab";

function load(): Demand[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

type Marker = {
  code: string; name: string; unit: string; min: number; max: number;
  history: { date: string; value: number }[];
};

const MARKERS: Marker[] = [
  { code: 'GLY', name: 'Glycémie à jeun', unit: 'mmol/L', min: 4.0, max: 6.0, history: [
    { date: 'Sep', value: 5.2 }, { date: 'Nov', value: 5.5 }, { date: 'Jan', value: 5.8 }, { date: 'Mar', value: 6.4 }, { date: 'Avr', value: 5.9 }
  ]},
  { code: 'HBA1C', name: 'Hémoglobine glyquée', unit: '%', min: 4.0, max: 5.7, history: [
    { date: 'Oct', value: 5.4 }, { date: 'Jan', value: 5.7 }, { date: 'Avr', value: 6.1 }
  ]},
  { code: 'CHOL', name: 'Cholestérol total', unit: 'mmol/L', min: 0, max: 5.2, history: [
    { date: 'Sep', value: 4.9 }, { date: 'Déc', value: 5.0 }, { date: 'Mar', value: 4.8 }
  ]},
  { code: 'CREAT', name: 'Créatininémie', unit: 'µmol/L', min: 60, max: 110, history: [
    { date: 'Oct', value: 78 }, { date: 'Jan', value: 82 }, { date: 'Avr', value: 79 }
  ]},
  { code: 'CRP', name: 'CRP', unit: 'mg/L', min: 0, max: 5, history: [
    { date: 'Fév', value: 2.1 }, { date: 'Mar', value: 14.2 }, { date: 'Avr', value: 3.8 }
  ]},
  { code: 'FERR', name: 'Ferritine', unit: 'µg/L', min: 20, max: 250, history: [
    { date: 'Nov', value: 22 }, { date: 'Fév', value: 18 }, { date: 'Avr', value: 15 }
  ]}
];

function flag(value: number, min: number, max: number): { level: 'ok' | 'warn' | 'high'; label: string } {
  if (value < min) {
    const ratio = (min - value) / Math.max(min, 1);
    return ratio > 0.15 ? { level: 'high', label: 'Bas' } : { level: 'warn', label: 'Limite bas' };
  }
  if (value > max) {
    const ratio = (value - max) / Math.max(max, 1);
    return ratio > 0.15 ? { level: 'high', label: 'Élevé' } : { level: 'warn', label: 'Limite haut' };
  }
  return { level: 'ok', label: 'Normal' };
}

const LEVEL_CLASSES: Record<'ok' | 'warn' | 'high', string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
};

export default function LaboratoireScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'catalogue' | 'demandes' | 'resultats'>('catalogue');
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [demands, setDemands] = useState<Demand[]>(() => load());
  const [showDetail, setShowDetail] = useState<Analysis | null>(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demands)); } catch {} }, [demands]);

  const filtered = useMemo(() => CATALOGUE.filter(a => {
    if (category && a.category !== category) return false;
    if (search && !`${a.name} ${a.code}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, category]);

  const total = useMemo(() => cart.reduce((s, id) => s + (CATALOGUE.find(a => a.id === id)?.price || 0), 0), [cart]);

  const toggle = (id: string) => setCart(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);

  const submit = () => {
    if (!cart.length) return;
    const d: Demand = { id: Date.now().toString(), date: new Date().toISOString().slice(0, 10), analyses: [...cart], status: "préparation" };
    setDemands(ds => [d, ...ds]);
    setCart([]);
    setTab('demandes');
  };

  const flagged = useMemo(() => MARKERS.map((m) => {
    const last = m.history[m.history.length - 1];
    return { ...m, last, status: flag(last.value, m.min, m.max) };
  }), []);

  const abnormalCount = flagged.filter((m) => m.status.level !== 'ok').length;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1582719471216-d2e7e332e19c?w=1080" alt="Laboratoire" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <FlaskConical className="w-5 h-5" /> Laboratoire
          </div>
          <h2 className="text-2xl font-bold mt-1">Analyses biologiques</h2>
          <p className="text-sm text-white/85 mt-1">Prescription · prélèvement · résultats interprétés</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-1 grid grid-cols-3 gap-1">
        {[
          { id: 'catalogue' as const, label: 'Catalogue' },
          { id: 'demandes' as const, label: `Demandes${demands.length ? ` (${demands.length})` : ''}` },
          { id: 'resultats' as const, label: `Résultats${abnormalCount ? ` · ${abnormalCount}!` : ''}` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold py-2 rounded-xl transition ${
              tab === t.id ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'catalogue' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une analyse…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button onClick={() => setCategory(null)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${!category ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-900 dark:bg-slate-700 dark:text-slate-300"}`}>Toutes</button>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${category === c ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-900 dark:bg-slate-700 dark:text-slate-300"}`}>{c}</button>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {filtered.map(a => {
              const inCart = cart.includes(a.id);
              return (
                <li key={a.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 flex items-start gap-3">
                  <button onClick={() => setShowDetail(a)} className="flex-1 text-left">
                    <div className="text-gray-900 dark:text-slate-100 text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{a.code} · {a.category} · {a.delay} · {a.price.toLocaleString()} FCFA</div>
                  </button>
                  <button onClick={() => toggle(a.id)} className={`p-2 rounded-full ${inCart ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700 dark:bg-slate-700 dark:text-slate-300"}`}>
                    {inCart ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {cart.length > 0 && (
            <div className="sticky bottom-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-teal-200 dark:border-teal-800/40 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{cart.length} analyse{cart.length > 1 ? "s" : ""}</div>
                <div className="text-gray-900 dark:text-slate-100 font-semibold">{total.toLocaleString()} FCFA</div>
              </div>
              <button onClick={submit} className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl text-sm font-semibold">Valider la demande</button>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-slate-400 px-2 flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /> Tarifs indicatifs. Une ordonnance médicale peut être requise selon l'analyse.</p>
        </div>
      )}

      {tab === 'demandes' && (
        <div className="space-y-3">
          {demands.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center">
              <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Aucune demande en cours.</p>
              <button onClick={() => setTab('catalogue')} className="mt-3 text-xs text-teal-700 dark:text-teal-300 font-medium">Parcourir le catalogue →</button>
            </div>
          ) : demands.map((d) => (
            <div key={d.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{d.date} · {d.analyses.length} analyse{d.analyses.length > 1 ? 's' : ''}</div>
                <span className="text-[10px] uppercase font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">{d.status}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-slate-400">{d.analyses.map(id => CATALOGUE.find(a => a.id === id)?.code).filter(Boolean).join(" · ")}</div>
              <button onClick={() => setDemands(ds => ds.filter(x => x.id !== d.id))} className="mt-2 text-xs text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'resultats' && (
        <div className="space-y-3">
          {abnormalCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">{abnormalCount} valeur{abnormalCount > 1 ? 's' : ''} hors normes détectée{abnormalCount > 1 ? 's' : ''}</p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">Discutez-en avec votre médecin lors de votre prochaine consultation.</p>
              </div>
            </div>
          )}

          {flagged.map((m) => {
            const trend = m.history.length >= 2 ? m.history[m.history.length - 1].value - m.history[m.history.length - 2].value : 0;
            const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Activity;
            const trendClass = m.status.level === 'ok' ? 'text-emerald-600' : m.status.level === 'warn' ? 'text-amber-600' : 'text-red-600';
            const yMin = Math.min(m.min, ...m.history.map((h) => h.value)) * 0.85;
            const yMax = Math.max(m.max, ...m.history.map((h) => h.value)) * 1.1;

            return (
              <motion.div
                key={m.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Normes : {m.min}-{m.max} {m.unit}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${LEVEL_CLASSES[m.status.level]}`}>
                      {m.status.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-bold ${m.status.level === 'ok' ? 'text-gray-900 dark:text-slate-100' : m.status.level === 'warn' ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}`}>
                      {m.last.value}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{m.unit}</span>
                    {trend !== 0 && (
                      <span className={`ml-auto inline-flex items-center gap-0.5 text-xs ${trendClass}`}>
                        <TrendIcon className="w-3 h-3" /> {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={m.history} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                        <ReferenceArea y1={m.min} y2={m.max} fill="#10b981" fillOpacity={0.08} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={[yMin, yMax]} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }}
                          formatter={(v: number) => [`${v} ${m.unit}`, m.name]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={m.status.level === 'high' ? '#dc2626' : m.status.level === 'warn' ? '#d97706' : '#0d9488'}
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                    <span>{m.history[0].date}</span>
                    <span>Plage normale en vert</span>
                    <span>{m.history[m.history.length - 1].date}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <button className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/40">
            <Download className="w-4 h-4" /> Télécharger le rapport complet (PDF)
          </button>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-4 space-y-2" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{showDetail.name}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{showDetail.code} · {showDetail.category}</p>
            <div className="text-sm space-y-1 pt-2 text-gray-700 dark:text-slate-300">
              <div><span className="text-gray-500 dark:text-slate-400">Préparation :</span> {showDetail.preparation}</div>
              <div><span className="text-gray-500 dark:text-slate-400">Délai résultats :</span> {showDetail.delay}</div>
              <div><span className="text-gray-500 dark:text-slate-400">Tarif :</span> {showDetail.price.toLocaleString()} FCFA</div>
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
