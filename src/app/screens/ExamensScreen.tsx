import { useEffect, useMemo, useState } from 'react';
import {
  FileText, TrendingUp, AlertCircle, Download, CheckCircle, Clock, Activity,
  Plus, Search, Trash2, Share2, X, AlertTriangle
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';
import { isDemoPatient } from '../components/demo';

type ExamStatus = 'completed' | 'scheduled';
interface Result { name: string; value: string; range: string; normal?: boolean }
interface Examen {
  id: string;
  type: string;
  date: string;
  status: ExamStatus;
  lab: string;
  results?: Result[];
  comment?: string;
}

const STORAGE_KEY = 'healthy-page:examens';

const SEED: Examen[] = [
  {
    id: '1', type: 'Analyse de sang complète', date: '28 Mars 2026', status: 'completed', lab: 'Laboratoire BioMed',
    results: [
      { name: 'Hémoglobine', value: '14.2', range: '12-16' },
      { name: 'Glycémie', value: '5.3', range: '4.0-6.0' },
      { name: 'Cholestérol total', value: '4.8', range: '<5.2' },
      { name: 'Créatinine', value: '78', range: '60-110' }
    ]
  },
  { id: '2', type: 'Radiographie thoracique', date: '15 Février 2026', status: 'completed', lab: "Centre d'Imagerie Ganhi", comment: 'Examen normal. Aucune anomalie détectée.' },
  { id: '3', type: 'Échographie abdominale', date: '10 Mai 2026', status: 'scheduled', lab: 'Clinique Louis Pasteur Cotonou' }
];

function parseNum(s: string): number | null { const n = parseFloat(s.replace(',', '.')); return isNaN(n) ? null : n; }
function checkNormal(value: string, range: string): boolean | undefined {
  const v = parseNum(value); if (v === null) return undefined;
  const r = range.trim();
  let m = r.match(/^<\s*([\d.,]+)/); if (m) { const x = parseNum(m[1]); return x !== null ? v < x : undefined; }
  m = r.match(/^>\s*([\d.,]+)/); if (m) { const x = parseNum(m[1]); return x !== null ? v > x : undefined; }
  m = r.match(/^([\d.,]+)\s*[--]\s*([\d.,]+)/);
  if (m) { const lo = parseNum(m[1]); const hi = parseNum(m[2]); if (lo !== null && hi !== null) return v >= lo && v <= hi; }
  return undefined;
}
function load(): Examen[] {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return isDemoPatient() ? SEED : [];
}

export default function ExamensScreen() {
  const [items, setItems] = useState<Examen[]>(() => load());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ExamStatus>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<Examen | null>(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }, [items]);

  const enriched = useMemo(() => items.map(e => ({
    ...e,
    results: e.results?.map(r => ({ ...r, normal: checkNormal(r.value, r.range) }))
  })), [items]);

  const filtered = enriched.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (query && !(`${e.type} ${e.lab}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const stats = useMemo(() => {
    const completed = enriched.filter(e => e.status === 'completed').length;
    const scheduled = enriched.filter(e => e.status === 'scheduled').length;
    const next = enriched.filter(e => e.status === 'scheduled')[0];
    const abnormal = enriched.flatMap(e => e.results ?? []).filter(r => r.normal === false).length;
    return { completed, scheduled, next, abnormal };
  }, [enriched]);

  const glycemieData = useMemo(() => {
    const points: { date: string; value: number }[] = [];
    enriched.forEach(e => e.results?.forEach(r => {
      if (/glyc/i.test(r.name)) {
        const v = parseNum(r.value);
        if (v !== null) points.push({ date: e.date.split(' ').slice(0, 2).join(' '), value: v });
      }
    }));
    return points.length > 0 ? points : [
      { date: 'Jan', value: 5.2 }, { date: 'Fév', value: 5.4 },
      { date: 'Mar', value: 5.1 }, { date: 'Avr', value: 5.3 }
    ];
  }, [enriched]);

  const remove = (id: string) => setItems(list => list.filter(e => e.id !== id));
  const exportCsv = (e: Examen) => {
    if (!e.results || e.results.length === 0) return;
    const header = 'Paramètre,Valeur,Référence,Statut';
    const rows = e.results.map(r => `${r.name},${r.value},${r.range},${checkNormal(r.value, r.range) === false ? 'Anormal' : 'Normal'}`).join('\n');
    const blob = new Blob(['﻿' + header + '\n' + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `examen-${e.id}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const share = (e: Examen) => {
    const body = encodeURIComponent(`${e.type}, ${e.date} (${e.lab})\n\n` + (e.results?.map(r => `${r.name}: ${r.value} (réf. ${r.range})`).join('\n') ?? e.comment ?? ''));
    window.location.href = `mailto:?subject=${encodeURIComponent('Résultats d\'examen')}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg h-60 sm:h-44">
        <ImageWithFallback src="https://images.unsplash.com/photo-1666887360445-e3b7bba7917c?w=1080&q=80" alt="Laboratoire" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/70 to-cyan-700/30" />
        <div className="relative h-full p-6 text-white flex flex-col justify-end">
          <span className="text-xs uppercase tracking-widest text-teal-100">Analyses médicales</span>
          <h2 className="text-2xl font-bold mt-1">Mes examens médicaux</h2>
          <p className="text-sm text-teal-50 mt-1 max-w-md">Consultez vos résultats et suivez vos indicateurs.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div><span className="text-xs text-gray-600">Complétés</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><div className="bg-blue-50 p-2 rounded-lg"><Clock className="w-4 h-4 text-blue-600" /></div><span className="text-xs text-gray-600">À venir</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><div className="bg-orange-50 p-2 rounded-lg"><AlertTriangle className="w-4 h-4 text-orange-600" /></div><span className="text-xs text-gray-600">Anormaux</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.abnormal}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><div className="bg-teal-50 p-2 rounded-lg"><Activity className="w-4 h-4 text-teal-600" /></div><span className="text-xs text-gray-600">Prochain</span></div>
          <p className="text-sm font-bold text-gray-900">{stats.next?.date ?? ', '}</p>
          <p className="text-xs text-gray-500 truncate">{stats.next?.type ?? 'Aucun'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-teal-600" /></div>
            <div><h3 className="font-semibold text-gray-900">Évolution glycémie</h3><p className="text-xs text-gray-500">{glycemieData.length} mesures</p></div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={glycemieData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="x" dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis key="y" stroke="#9ca3af" fontSize={12} domain={[4, 7]} />
              <Tooltip key="tooltip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Area key="area" type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fill="#0d9488" fillOpacity={0.18} dot={{ fill: '#0d9488', r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {stats.abnormal === 0 ? (
          <div className="mt-4 p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-800">✓ Toutes vos valeurs sont dans la normale</p></div>
        ) : (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
            <p className="text-sm text-orange-900"><strong>{stats.abnormal}</strong> valeur{stats.abnormal > 1 ? 's' : ''} hors normes, consultez votre médecin.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un examen…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'completed', 'scheduled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {f === 'all' ? 'Tous' : f === 'completed' ? 'Résultats' : 'Planifiés'}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <h3 className="font-semibold text-gray-900">Historique des examens</h3>
        <AnimatePresence mode="popLayout">
          {filtered.map((e) => {
            const abn = e.results?.filter(r => r.normal === false).length ?? 0;
            return (
              <motion.div key={e.id} layout variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} exit={{ opacity: 0, x: -40 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${e.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <FileText className={`w-5 h-5 ${e.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{e.type}</h4>
                        <p className="text-sm text-gray-600 truncate">{e.lab}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-3 py-1 rounded-full ${e.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                            {e.status === 'completed' ? 'Résultats' : 'Planifié'}
                          </span>
                          <span className="text-xs text-gray-500">{e.date}</span>
                          {abn > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{abn} hors normes</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {e.status === 'completed' && e.results && (
                        <>
                          <button onClick={() => exportCsv(e)} className="p-2 hover:bg-gray-100 rounded-lg" title="Télécharger CSV"><Download className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={() => share(e)} className="p-2 hover:bg-gray-100 rounded-lg" title="Partager"><Share2 className="w-4 h-4 text-gray-600" /></button>
                        </>
                      )}
                      <button onClick={() => remove(e.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>

                  {e.results && (
                    <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                      {e.results.map((r, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${r.normal === false ? 'bg-orange-50' : 'bg-gray-50'}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Référence : {r.range}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${r.normal === false ? 'text-orange-700' : 'text-gray-900'}`}>{r.value}</span>
                            {r.normal === true && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {r.normal === false && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {e.comment && <div className="mt-4 p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-900"><strong>Commentaire :</strong> {e.comment}</p></div>}

                  {e.status === 'scheduled' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div><p className="text-sm font-medium text-amber-900 mb-1">Consignes pré-examen</p>
                        <p className="text-sm text-amber-800">Être à jeun depuis 12h. Apportez votre carte d'assurance.</p></div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun examen, ajoutez votre premier examen.</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-teal-600 text-white p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-teal-900 mb-1">Rappel automatique</h3>
              <p className="text-sm text-teal-800">Bilan annuel recommandé en Juin 2026.</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-sm h-52 md:h-auto">
          <ImageWithFallback src={IMAGES.examensMicroscope} alt="Analyses" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-cyan-700/40" />
          <div className="relative h-full p-5 text-white flex flex-col justify-end">
            <h3 className="font-semibold">Précision scientifique</h3>
            <p className="text-xs text-teal-100 mt-1">Laboratoires certifiés ISO 15189</p>
          </div>
        </div>
      </div>

      {showAdd && <AddExamenModal onClose={() => setShowAdd(false)} onSave={(e) => { setItems(l => [e, ...l]); setShowAdd(false); }} />}
    </div>
  );
}

function AddExamenModal({ onClose, onSave }: { onClose: () => void; onSave: (e: Examen) => void }) {
  const [type, setType] = useState('');
  const [lab, setLab] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
  const [status, setStatus] = useState<ExamStatus>('completed');
  const [comment, setComment] = useState('');
  const [results, setResults] = useState<Result[]>([{ name: '', value: '', range: '' }]);

  const submit = () => {
    if (!type.trim() || !lab.trim()) return;
    const cleaned = results.filter(r => r.name.trim() && r.value.trim());
    onSave({
      id: Date.now().toString(), type: type.trim(), lab: lab.trim(), date, status,
      results: status === 'completed' && cleaned.length > 0 ? cleaned : undefined,
      comment: comment.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Nouvel examen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <input value={type} onChange={e => setType(e.target.value)} placeholder="Type d'examen (ex : NFS, échographie…)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        <input value={lab} onChange={e => setLab(e.target.value)} placeholder="Laboratoire / centre" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        <input value={date} onChange={e => setDate(e.target.value)} placeholder="Date (ex : 5 Mai 2026)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        <div className="flex gap-2">
          {(['completed', 'scheduled'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`flex-1 py-2 rounded-xl text-sm ${status === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {s === 'completed' ? 'Résultats' : 'Planifié'}
            </button>
          ))}
        </div>
        {status === 'completed' && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Résultats</p>
            {results.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-1.5">
                <input value={r.name} onChange={e => setResults(l => l.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Paramètre" className="col-span-5 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
                <input value={r.value} onChange={e => setResults(l => l.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="Valeur" className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
                <input value={r.range} onChange={e => setResults(l => l.map((x, j) => j === i ? { ...x, range: e.target.value } : x))} placeholder="Réf. (ex : 4-6)" className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
                <button onClick={() => setResults(l => l.filter((_, j) => j !== i))} className="col-span-1 text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setResults(l => [...l, { name: '', value: '', range: '' }])} className="text-xs text-teal-700 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter une ligne</button>
          </div>
        )}
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Commentaire médical (optionnel)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[60px]" />
        <button onClick={submit} className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold">Enregistrer</button>
      </motion.div>
    </div>
  );
}
