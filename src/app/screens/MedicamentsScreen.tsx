import { useEffect, useMemo, useState } from 'react';
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Bell,
  Plus,
  ChevronRight,
  X,
  Trash2,
  Check,
  AlertTriangle,
  Package
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';
import { isDemoPatient } from '../components/demo';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface MedicamentsProps { onNavigate?: (screen: string) => void; }

interface Traitement {
  id: string;
  nom: string;
  posologie: string;
  horaires: string[];
  duree: string;
  debutTraitement: string;
  finTraitement?: string;
  color: string;
  takenLog?: Record<string, boolean[]>;
  enCours?: boolean;
  stock?: number;
  stockInitial?: number;
}

const INTERACTION_RULES: { a: RegExp; b: RegExp; severity: 'major' | 'moderate'; note: string }[] = [
  { a: /amoxicillin/i, b: /m[ée]thotrexate/i, severity: 'major', note: 'Risque de toxicité du méthotrexate' },
  { a: /paracetamol|paracétamol|doliprane/i, b: /warfarin|warfarine|coumadin/i, severity: 'moderate', note: 'Augmentation possible de l\'INR' },
  { a: /ibuprof[èe]ne|ibuprofen|aspirin|aspirine/i, b: /warfarin|warfarine|coumadin/i, severity: 'major', note: 'Risque hémorragique majoré' },
  { a: /ibuprof[èe]ne|ibuprofen/i, b: /aspirin|aspirine/i, severity: 'moderate', note: 'Effet antiagrégant réduit' },
  { a: /amoxicillin|amoxicilline/i, b: /pilule|contraceptif|levonorgestrel|estrog/i, severity: 'moderate', note: 'Efficacité contraceptive possiblement réduite' },
];

function findInteractions(traits: { id: string; nom: string }[]) {
  const out: { a: string; b: string; severity: 'major' | 'moderate'; note: string }[] = [];
  for (let i = 0; i < traits.length; i++) {
    for (let j = i + 1; j < traits.length; j++) {
      for (const r of INTERACTION_RULES) {
        const ai = r.a.test(traits[i].nom), bi = r.b.test(traits[i].nom);
        const aj = r.a.test(traits[j].nom), bj = r.b.test(traits[j].nom);
        if ((ai && bj) || (bi && aj)) {
          out.push({ a: traits[i].nom, b: traits[j].nom, severity: r.severity, note: r.note });
        }
      }
    }
  }
  return out;
}

interface Ordonnance {
  id: string;
  date: string;
  medecin: string;
  medicaments: number;
  statut: 'active' | 'renouvelable' | 'archivee';
  renewalRequestedAt?: string;
}

const COLORS = ['blue', 'green', 'orange', 'rose', 'violet', 'teal'];
const COLOR_BAR: Record<string, string> = {
  blue: 'bg-blue-600', green: 'bg-green-600', orange: 'bg-orange-600',
  rose: 'bg-rose-600', violet: 'bg-violet-600', teal: 'bg-teal-600'
};
const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-50', green: 'bg-green-50', orange: 'bg-orange-50',
  rose: 'bg-rose-50', violet: 'bg-violet-50', teal: 'bg-teal-50'
};
const COLOR_FG: Record<string, string> = {
  blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600',
  rose: 'text-rose-600', violet: 'text-violet-600', teal: 'text-teal-600'
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEMO_TRAITEMENTS: Traitement[] = [
  { id: 't_demo_1', nom: 'Amoxicilline 500mg', posologie: '1 comprimé 3x/jour', horaires: ['08:00', '14:00', '20:00'], duree: 'J5/7', debutTraitement: '25 Avril 2026', finTraitement: '02 Mai 2026', color: 'blue', takenLog: { [todayKey()]: [true, true, false] }, enCours: true, stock: 6, stockInitial: 21 },
  { id: 't_demo_2', nom: 'Paracétamol 1g', posologie: '1 comprimé si douleur', horaires: ['Au besoin'], duree: 'En cours', debutTraitement: '10 Mars 2026', color: 'green', takenLog: {}, enCours: true, stock: 12, stockInitial: 16 },
  { id: 't_demo_3', nom: 'Vitamine D 1000 UI', posologie: '1 gélule/jour', horaires: ['08:00'], duree: 'Cure 3 mois', debutTraitement: '01 Avril 2026', finTraitement: '30 Juin 2026', color: 'orange', takenLog: { [todayKey()]: [true] }, enCours: true, stock: 60, stockInitial: 90 }
];

const DEMO_ORDONNANCES: Ordonnance[] = [
  { id: 'o_demo_1', date: '25 Avril 2026', medecin: 'Dr. Camara', medicaments: 2, statut: 'active' },
  { id: 'o_demo_2', date: '10 Mars 2026', medecin: 'Dr. Traoré', medicaments: 1, statut: 'renouvelable' }
];

function minutesUntil(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const now = new Date();
  const t = new Date();
  t.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 60000);
}

export default function MedicamentsScreen({ onNavigate }: MedicamentsProps = {}) {
  const pid = getPatientId();
  const demo = isDemoPatient();
  const [traitements, setTraitements] = useState<Traitement[]>([]);
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!pid) {
      setTraitements(demo ? DEMO_TRAITEMENTS : []);
      setOrdonnances(demo ? DEMO_ORDONNANCES : []);
      setLoading(false);
      return;
    }
    Promise.all([
      api.listTraitement(pid).catch(() => [] as any[]),
      api.listOrdonnance(pid).catch(() => [] as any[])
    ]).then(([t, o]) => {
      if (!active) return;
      const tList = (t as any[]).filter((x) => !x?._deleted);
      setTraitements(tList.length ? (tList as Traitement[]) : (demo ? DEMO_TRAITEMENTS : []));
      setOrdonnances((o as any[]).length ? (o as Ordonnance[]) : (demo ? DEMO_ORDONNANCES : []));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pid, demo]);

  const dayKey = todayKey();
  const stats = useMemo(() => {
    const total = traitements.reduce((s, t) => s + t.horaires.filter((h) => /^\d{1,2}:\d{2}$/.test(h)).length, 0);
    const taken = traitements.reduce((s, t) => s + ((t.takenLog?.[dayKey] ?? []).filter(Boolean).length), 0);
    let nextLabel = ', ';
    let nextDelta: number | null = null;
    for (const t of traitements) {
      const log = t.takenLog?.[dayKey] ?? [];
      t.horaires.forEach((h, i) => {
        if (log[i]) return;
        const d = minutesUntil(h);
        if (d == null || d < 0) return;
        if (nextDelta == null || d < nextDelta) { nextDelta = d; nextLabel = h; }
      });
    }
    return { total, taken, nextLabel, nextDelta };
  }, [traitements, dayKey]);

  const flashOk = (msg: string) => { setInfo(msg); setTimeout(() => setInfo(null), 2200); };

  const persistTraitement = async (id: string, payload: any) => {
    if (!pid) return;
    try { await api.upsertTraitement(pid, id, payload); }
    catch (e: any) { setError(e?.message ?? 'Sauvegarde impossible'); }
  };

  const toggleIntake = (tId: string, idx: number) => {
    setTraitements((arr) => arr.map((t) => {
      if (t.id !== tId) return t;
      const log = { ...(t.takenLog ?? {}) };
      const cur = log[dayKey] ? [...log[dayKey]] : t.horaires.map(() => false);
      const wasTaken = cur[idx];
      cur[idx] = !cur[idx];
      log[dayKey] = cur;
      let stock = t.stock;
      if (typeof stock === 'number') {
        stock = Math.max(0, stock + (wasTaken ? 1 : -1));
      }
      const updated = { ...t, takenLog: log, stock };
      persistTraitement(t.id, updated);
      if (cur[idx]) flashOk(`${t.nom} · prise confirmée${typeof stock === 'number' ? ` · ${stock} restants` : ''}`);
      return updated;
    }));
  };

  const addTraitement = async (data: { nom: string; posologie: string; horaires: string[]; duree: string; debutTraitement: string; finTraitement?: string; stock?: number; stockInitial?: number }) => {
    const id = `t_${Date.now()}`;
    const t: Traitement = {
      id,
      ...data,
      color: COLORS[traitements.length % COLORS.length],
      takenLog: {},
      enCours: true
    };
    setTraitements((arr) => [...arr, t]);
    setShowAdd(false);
    flashOk('Traitement ajouté');
    await persistTraitement(id, t);
  };

  const removeTraitement = async (id: string) => {
    if (!confirm('Supprimer ce traitement ?')) return;
    setTraitements((arr) => arr.filter((t) => t.id !== id));
    if (pid) {
      try { await api.upsertTraitement(pid, id, { _deleted: true, id }); } catch {}
    }
    flashOk('Traitement supprimé');
  };

  const requestRenewal = async (oId: string) => {
    const ts = new Date().toISOString();
    setOrdonnances((arr) => arr.map((o) => o.id === oId ? { ...o, renewalRequestedAt: ts, statut: 'active' } : o));
    if (pid) {
      const target = ordonnances.find((o) => o.id === oId);
      if (target) {
        try {
          await api.createOrdonnance(pid, {
            type: 'renewal_request',
            ordonnanceId: oId,
            requestedAt: ts,
            medecin: target.medecin,
            originalDate: target.date
          });
        } catch (e: any) { setError(e?.message ?? 'Demande impossible'); }
      }
    }
    flashOk('Demande de renouvellement envoyée');
  };

  const interactions = useMemo(() => findInteractions(traitements), [traitements]);
  const lowStock = traitements.filter(t => typeof t.stock === 'number' && t.stock <= 3);

  const next = traitements
    .flatMap((t) => t.horaires.map((h, i) => ({ t, h, i, log: t.takenLog?.[dayKey]?.[i] ?? false })))
    .filter((x) => /^\d{1,2}:\d{2}$/.test(x.h) && !x.log)
    .map((x) => ({ ...x, delta: minutesUntil(x.h) }))
    .filter((x) => x.delta != null && x.delta >= 0)
    .sort((a, b) => (a.delta!, b.delta!))[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate?.('home')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <h2 className="text-base text-slate-900">Mes médicaments</h2>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white" aria-label="Ajouter">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i, 2);
            const active = i === 2;
            return (
              <div key={i} className={`min-w-[44px] py-2 rounded-2xl text-center ${active ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-600'}`}>
                <div className="text-[10px] uppercase opacity-80">{d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</div>
                <div className="text-base mt-0.5">{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl flex items-start justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {info && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" /> {info}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onNavigate?.('traitements')} className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md text-sm font-medium text-teal-700 border border-teal-100">Traitements en cours</button>
        <button onClick={() => onNavigate?.('posologie')} className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md text-sm font-medium text-rose-700 border border-rose-100">Posologie détail</button>
        <button onClick={() => onNavigate?.('renouvellement')} className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md text-sm font-medium text-cyan-700 border border-cyan-100">Renouvellement</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-teal-50 p-2 rounded-lg"><Pill className="w-4 h-4 text-teal-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{traitements.length}</p>
          <p className="text-xs text-gray-500">En cours</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.taken}/{stats.total}</p>
          <p className="text-xs text-gray-500">Aujourd'hui</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-50 p-2 rounded-lg"><Clock className="w-4 h-4 text-amber-600" /></div>
          </div>
          <p className="text-sm font-bold text-gray-900">{stats.nextLabel}</p>
          <p className="text-xs text-gray-500">Prochain</p>
        </div>
      </div>

      {interactions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Interactions médicamenteuses détectées</h3>
              <p className="text-xs text-red-700">Vérifiez avec votre médecin ou pharmacien.</p>
            </div>
          </div>
          <ul className="space-y-1.5 mt-2">
            {interactions.map((it, i) => (
              <li key={i} className="text-sm bg-white/60 rounded-lg p-2">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mr-2 ${it.severity === 'major' ? 'bg-red-600 text-white' : 'bg-orange-200 text-orange-900'}`}>
                  {it.severity === 'major' ? 'Majeure' : 'Modérée'}
                </span>
                <strong className="text-red-900">{it.a.split(' ')[0]}</strong> + <strong className="text-red-900">{it.b.split(' ')[0]}</strong>
                <p className="text-xs text-red-800 mt-0.5">{it.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-start gap-2">
          <Package className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-900">Stock faible</p>
            <p className="text-xs text-orange-800">{lowStock.map(t => `${t.nom} (${t.stock})`).join(' · ')}, pensez au renouvellement.</p>
          </div>
        </div>
      )}

      {next && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-amber-600 text-white p-3 rounded-xl"><Bell className="w-6 h-6" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                {next.delta! <= 0
                  ? 'Prise à confirmer maintenant'
                  : `Prochaine prise dans ${next.delta! >= 60 ? Math.floor(next.delta! / 60) + 'h' + String(next.delta! % 60).padStart(2, '0') : next.delta + ' min'}`}
              </h3>
              <p className="text-sm text-amber-800 mb-3">{next.t.nom} · {next.h}</p>
              <button onClick={() => toggleIntake(next.t.id, next.i)} className="bg-amber-600 text-white px-5 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm">
                Confirmer la prise
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Traitements en cours</h3>
          <button onClick={() => setShowAdd(true)} className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-slate-500">Chargement…</div>
        ) : traitements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 mx-auto flex items-center justify-center mb-3">
              <Pill className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm text-slate-700 font-medium mb-1">Aucun traitement enregistré</p>
            <p className="text-xs text-slate-500 mb-4">Ajoutez votre premier médicament pour activer les rappels.</p>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" /> Ajouter un traitement
            </button>
          </div>
        ) : traitements.map((traitement) => {
          const log = traitement.takenLog?.[dayKey] ?? traitement.horaires.map(() => false);
          return (
            <div key={traitement.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1 ${COLOR_BAR[traitement.color] ?? 'bg-teal-600'}`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${COLOR_BG[traitement.color] ?? 'bg-teal-50'}`}>
                      <Pill className={`w-5 h-5 ${COLOR_FG[traitement.color] ?? 'text-teal-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{traitement.nom}</h4>
                      <p className="text-sm text-gray-600 mb-2">{traitement.posologie}</p>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{traitement.duree}</span>
                        {traitement.finTraitement && <span>Jusqu'au {traitement.finTraitement}</span>}
                        {typeof traitement.stock === 'number' && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${traitement.stock <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'}`}>
                            <Package className="w-3 h-3" /> {traitement.stock}{traitement.stockInitial ? `/${traitement.stockInitial}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeTraitement(traitement.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Prises du jour · cliquez pour confirmer</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {traitement.horaires.map((horaire, idx) => {
                      const taken = log[idx];
                      const interactive = /^\d{1,2}:\d{2}$/.test(horaire);
                      return (
                        <button
                          key={idx}
                          onClick={() => interactive && toggleIntake(traitement.id, idx)}
                          disabled={!interactive}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            taken ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          } ${!interactive ? 'opacity-70 cursor-default' : ''}`}
                        >
                          {taken ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          <span className={`text-sm font-medium ${taken ? 'text-green-700' : 'text-gray-700'}`}>{horaire}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Mes ordonnances</h3>
        </div>
        {ordonnances.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">Aucune ordonnance enregistrée.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ordonnances.map((ordonnance) => (
              <div key={ordonnance.id} className="flex items-center justify-between p-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-teal-50 p-2 rounded-lg shrink-0"><Calendar className="w-5 h-5 text-teal-600" /></div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">Ordonnance du {ordonnance.date}</p>
                    <p className="text-sm text-gray-600">{ordonnance.medecin}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                      ordonnance.renewalRequestedAt ? 'bg-blue-50 text-blue-700' :
                      ordonnance.statut === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ordonnance.renewalRequestedAt ? 'Demande envoyée' : ordonnance.statut === 'active' ? 'Active' : 'Renouvelable'}
                    </span>
                  </div>
                </div>
                {ordonnance.statut === 'renouvelable' && !ordonnance.renewalRequestedAt && (
                  <button onClick={() => requestRenewal(ordonnance.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap">
                    Renouveler
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1 relative h-52 md:h-auto">
            <ImageWithFallback src={IMAGES.medicamentsBox} alt="Boîte de médicaments" className="absolute inset-0 w-full h-full object-cover object-top" />
          </div>
          <div className="md:col-span-2 p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Pharmacie partenaire</h3>
                <p className="text-sm text-blue-800 mb-3">Vos demandes de renouvellement sont transmises à la cellule de coordination Healthy.</p>
                <button onClick={() => onNavigate?.('pharmacie')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Trouver une pharmacie →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddTraitementModal onClose={() => setShowAdd(false)} onSubmit={addTraitement} />}
    </div>
  );
}

function AddTraitementModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (d: { nom: string; posologie: string; horaires: string[]; duree: string; debutTraitement: string; finTraitement?: string; stock?: number; stockInitial?: number }) => void;
}) {
  const [nom, setNom] = useState('');
  const [posologie, setPosologie] = useState('');
  const [horaires, setHoraires] = useState<string[]>(['08:00']);
  const [duree, setDuree] = useState('7 jours');
  const [debut, setDebut] = useState(new Date().toLocaleDateString('fr-FR'));
  const [fin, setFin] = useState('');
  const [stock, setStock] = useState<string>('');

  const valid = nom.trim().length > 1 && posologie.trim().length > 1 && horaires.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Nouveau traitement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Médicament">
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex. Amoxicilline 500mg" className={inputCls} />
          </Field>
          <Field label="Posologie">
            <input value={posologie} onChange={(e) => setPosologie(e.target.value)} placeholder="ex. 1 comprimé 3x/jour" className={inputCls} />
          </Field>
          <Field label="Horaires de prise">
            <div className="space-y-2">
              {horaires.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input type="time" value={h} onChange={(e) => setHoraires((arr) => arr.map((x, j) => j === i ? e.target.value : x))} className={`${inputCls} flex-1`} />
                  {horaires.length > 1 && (
                    <button onClick={() => setHoraires((arr) => arr.filter((_, j) => j !== i))} className="px-3 rounded-xl border border-gray-200 text-gray-500"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setHoraires((arr) => [...arr, '12:00'])} className="text-xs text-teal-700 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter un horaire</button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Durée"><input value={duree} onChange={(e) => setDuree(e.target.value)} className={inputCls} /></Field>
            <Field label="Début"><input value={debut} onChange={(e) => setDebut(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Fin (optionnel)">
            <input value={fin} onChange={(e) => setFin(e.target.value)} placeholder="ex. 02 Mai 2026" className={inputCls} />
          </Field>
          <Field label="Stock initial (optionnel)">
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="ex. 21 comprimés" className={inputCls} />
          </Field>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">Annuler</button>
          <button
            onClick={() => {
              if (!valid) return;
              const s = parseInt(stock, 10);
              onSubmit({ nom, posologie, horaires, duree, debutTraitement: debut, finTraitement: fin || undefined, stock: isNaN(s) ? undefined : s, stockInitial: isNaN(s) ? undefined : s });
            }}
            disabled={!valid}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
