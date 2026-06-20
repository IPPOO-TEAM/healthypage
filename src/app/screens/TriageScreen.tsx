import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, MessageCircle, Calendar, AlertTriangle, Stethoscope, ShieldAlert, ChevronRight, RotateCcw, Activity, Heart, Brain, Bone, Baby, Thermometer, History, Sparkles, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { api } from '../components/api';
import { CONTACTS, telHref } from '../components/contacts';

type Level = 'urgence' | 'conseil' | 'rdv';

type Symptom = { id: string; label: string; icon: typeof Heart; redFlags: string[] };

const SYMPTOMS: Symptom[] = [
  { id: 'thorax', label: 'Douleur thoracique', icon: Heart, redFlags: ['Douleur irradiant au bras/mâchoire', 'Sueurs froides', 'Essoufflement brutal'] },
  { id: 'neuro', label: 'Trouble neurologique', icon: Brain, redFlags: ['Paralysie / faiblesse d\'un côté', 'Trouble de la parole', 'Perte de conscience'] },
  { id: 'fievre', label: 'Fièvre', icon: Thermometer, redFlags: ['Fièvre > 39.5°C', 'Raideur de nuque', 'Éruption purpurique'] },
  { id: 'abdo', label: 'Douleur abdominale', icon: Activity, redFlags: ['Ventre dur / défense', 'Vomissements de sang', 'Selles noires'] },
  { id: 'trauma', label: 'Traumatisme / chute', icon: Bone, redFlags: ['Perte de conscience initiale', 'Fracture visible', 'Saignement abondant'] },
  { id: 'enfant', label: 'Enfant < 5 ans', icon: Baby, redFlags: ['Geignements faibles', 'Refus de boire', 'Fièvre + somnolence'] },
];

type Question = {
  id: string;
  text: string;
  hint?: string;
  options: { label: string; level: Level }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Quelle est l\'intensité de votre symptôme ?',
    hint: 'Évaluez la gêne ressentie maintenant',
    options: [
      { label: 'Insupportable / m\'empêche de fonctionner', level: 'urgence' },
      { label: 'Forte mais gérable', level: 'conseil' },
      { label: 'Modérée à légère', level: 'rdv' }
    ]
  },
  {
    id: 'q2',
    text: 'Depuis combien de temps avez-vous ces symptômes ?',
    options: [
      { label: 'Quelques minutes / brutal', level: 'urgence' },
      { label: 'Quelques heures', level: 'conseil' },
      { label: 'Plusieurs jours', level: 'rdv' }
    ]
  },
  {
    id: 'q3',
    text: 'Présentez-vous l\'un de ces signes ?',
    hint: 'Choisissez l\'option la plus pertinente',
    options: [
      { label: 'Douleur thoracique, essoufflement, perte de conscience, paralysie', level: 'urgence' },
      { label: 'Fièvre élevée, vomissements répétés, douleur intense', level: 'conseil' },
      { label: 'Aucun de ces signes', level: 'rdv' }
    ]
  },
  {
    id: 'q4',
    text: 'S\'agit-il d\'un enfant < 5 ans, femme enceinte, ou personne âgée ?',
    options: [
      { label: 'Oui, et état préoccupant', level: 'urgence' },
      { label: 'Oui, état stable', level: 'conseil' },
      { label: 'Non', level: 'rdv' }
    ]
  }
];

const LEVELS: Record<Level, {
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  icon: typeof ShieldAlert;
  actions: { label: string; type: 'call' | 'chat' | 'rdv' | 'tel'; href?: string }[];
}> = {
  urgence: {
    title: 'Niveau 1, Urgence',
    subtitle: 'Vos réponses suggèrent une situation pouvant nécessiter une prise en charge immédiate.',
    color: 'from-red-700 to-rose-600',
    bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/40',
    icon: ShieldAlert,
    actions: [
      { label: 'Appeler le SAMU (Bénin 166)', type: 'tel', href: 'tel:166' },
      { label: 'Appeler la cellule Healthy Page', type: 'tel', href: telHref(CONTACTS.supportPhone) ?? '#' },
      { label: 'Localiser l\'urgence la plus proche', type: 'rdv' }
    ]
  },
  conseil: {
    title: 'Niveau 2, Conseil médical',
    subtitle: 'Un échange avec un soignant peut vous orienter rapidement et éviter une consultation inutile.',
    color: 'from-amber-600 to-orange-500',
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40',
    icon: Stethoscope,
    actions: [
      { label: 'Téléconsultation (visio)', type: 'chat' },
      { label: 'Chat avec un soignant', type: 'chat' },
      { label: 'Appel cellule téléphonique', type: 'tel', href: telHref(CONTACTS.supportPhone) ?? '#' }
    ]
  },
  rdv: {
    title: 'Niveau 3, Prise de rendez-vous',
    subtitle: 'Vos symptômes peuvent attendre une consultation programmée. Choisissez un créneau quand cela vous convient.',
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800/40',
    icon: Calendar,
    actions: [
      { label: 'Trouver un spécialiste', type: 'rdv' },
      { label: 'Prendre RDV dans un centre', type: 'rdv' },
      { label: 'Voir conseils personnalisés', type: 'chat' }
    ]
  }
};

type HistoryEntry = { id: string; date: string; symptom: string; level: Level };
const HIST_KEY = 'healthy-page:triage-history';
const loadHist = (): HistoryEntry[] => { try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch { return []; } };

interface Props { onBack: () => void }

export default function TriageScreen({ onBack }: Props) {
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Level[]>([]);
  const [done, setDone] = useState<Level | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHist());
  const [autoCall, setAutoCall] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ urgency: 'urgence' | 'conseil' | 'rdv'; specialty: string; reasoning: string; redFlags: string[]; followUpQuestions: string[] } | null>(null);

  const runAITriage = async () => {
    if (aiText.trim().length < 5) { setAiError('Décrivez vos symptômes en quelques mots.'); return; }
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const r = await api.triageAI({ description: aiText.trim() });
      setAiResult({
        urgency: r.urgency,
        specialty: r.specialty,
        reasoning: r.reasoning,
        redFlags: r.redFlags ?? [],
        followUpQuestions: r.followUpQuestions ?? [],
      });
      setHistory(h => [{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 16).replace('T', ' '), symptom: `IA · ${r.specialty}`, level: r.urgency }, ...h].slice(0, 10));
      if (r.urgency === 'urgence') setAutoCall(15);
    } catch (e: any) {
      setAiError(e?.message ?? 'Analyse impossible.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { try { localStorage.setItem(HIST_KEY, JSON.stringify(history)); } catch {} }, [history]);

  useEffect(() => {
    if (autoCall === null) return;
    if (autoCall <= 0) { window.location.href = 'tel:166'; setAutoCall(null); return; }
    const t = setTimeout(() => setAutoCall((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [autoCall]);

  const restart = () => { setStep(0); setAnswers([]); setDone(null); setSymptom(null); setAutoCall(null); };

  const escalate = () => {
    setAnswers(QUESTIONS.map(() => 'urgence' as Level));
    setDone('urgence');
    setHistory(h => [{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 16).replace('T', ' '), symptom: (symptom?.label || ', ') + ' (drapeau rouge)', level: 'urgence' }, ...h].slice(0, 10));
    setAutoCall(15);
  };

  const choose = (level: Level) => {
    const next = [...answers, level];
    if (step + 1 < QUESTIONS.length) {
      setAnswers(next);
      setStep(step + 1);
    } else {
      const score: Record<Level, number> = { urgence: 0, conseil: 0, rdv: 0 };
      next.forEach((l) => { score[l] += 1; });
      const final: Level = score.urgence >= 1 ? 'urgence' : score.conseil >= 2 ? 'conseil' : 'rdv';
      setAnswers(next);
      setDone(final);
      setHistory(h => [{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 16).replace('T', ' '), symptom: symptom?.label || ', ', level: final }, ...h].slice(0, 10));
      if (final === 'urgence') setAutoCall(15);
    }
  };

  const handleAction = (type: 'call' | 'chat' | 'rdv' | 'tel', href?: string) => {
    if (type === 'tel' && href) { window.location.href = href; return; }
    if (type === 'chat') { navigate('/patient/teleconsultation'); return; }
    if (type === 'rdv') { navigate('/patient/rdv'); return; }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base text-slate-900">Explorer par zone</h2>
          <button onClick={(done || symptom) ? restart : undefined} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="relative h-48 mx-4 mb-4 rounded-2xl bg-gradient-to-b from-emerald-100/60 to-white overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80"
            alt="Anatomie"
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80"
          />
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button className="w-7 h-7 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center"><Phone className="w-3 h-3 text-emerald-700" /></button>
            <button className="w-7 h-7 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center"><Heart className="w-3 h-3 text-emerald-700" /></button>
            <button className="w-7 h-7 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center"><Brain className="w-3 h-3 text-emerald-700" /></button>
          </div>
          <div className="absolute left-3 bottom-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-sm">
            <p className="text-[10px] text-slate-500">Zone détectée</p>
            <p className="text-sm text-slate-900">Triage médical</p>
          </div>
        </div>
      </div>

      {!symptom && !done && (
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">Triage IA · Claude</p>
          </div>
          <h3 className="font-bold text-base">Décrivez vos symptômes</h3>
          <p className="text-xs text-white/80 mb-3">L'IA propose une orientation et la spécialité adaptée. Pas un diagnostic.</p>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ex : depuis ce matin, j'ai mal à la poitrine côté gauche et je suis essoufflé en marchant…"
            className="w-full px-3 py-2 rounded-xl bg-white/95 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/60"
          />
          <button
            onClick={runAITriage}
            disabled={aiLoading || aiText.trim().length < 5}
            className="mt-3 w-full py-2.5 rounded-xl bg-white text-indigo-700 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse…</> : <><Send className="w-4 h-4" /> Analyser mes symptômes</>}
          </button>
          {aiError && <p className="mt-2 text-xs bg-red-500/30 rounded-lg px-2 py-1.5">{aiError}</p>}
          <AnimatePresence>
            {aiResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 bg-white text-slate-900 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    aiResult.urgency === 'urgence' ? 'bg-red-100 text-red-700' :
                    aiResult.urgency === 'conseil' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {aiResult.urgency === 'urgence' ? 'Urgence' : aiResult.urgency === 'conseil' ? 'Conseil rapide' : 'RDV programmé'}
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="text-sm font-semibold text-indigo-700">{aiResult.specialty}</span>
                </div>
                <p className="text-sm text-slate-700">{aiResult.reasoning}</p>
                {aiResult.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2">
                    <p className="text-[11px] font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Signes d'alerte</p>
                    <ul className="text-xs text-red-700 list-disc pl-4 mt-1">
                      {aiResult.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                {aiResult.followUpQuestions.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Questions à préciser</p>
                    <ul className="text-xs text-slate-700 list-disc pl-4 mt-1">
                      {aiResult.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  {aiResult.urgency === 'urgence' ? (
                    <a href="tel:166" className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-1"><Phone className="w-3.5 h-3.5" /> Appeler 166</a>
                  ) : aiResult.urgency === 'conseil' ? (
                    <button onClick={() => navigate('/patient/teleconsultation')} className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Téléconsultation</button>
                  ) : null}
                  <button
                    onClick={() => navigate(`/patient/medecins?specialty=${encodeURIComponent(aiResult.specialty)}`)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> {aiResult.specialty}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center pt-1">Ce triage IA ne remplace pas un avis médical.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!symptom && !done && (
        <div className="space-y-3">
          <h3 className="text-sm text-teal-900 dark:text-teal-200">Ou choisissez un motif</h3>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOMS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setSymptom(s)} className="bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 rounded-2xl p-3 text-left hover:border-teal-400 transition">
                  <Icon className="w-5 h-5 text-teal-600 mb-1" />
                  <div className="text-sm text-teal-900 dark:text-slate-100">{s.label}</div>
                </button>
              );
            })}
          </div>
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-200"><History className="w-4 h-4" /> Historique récent</div>
                {history.length > 3 && (
                  <button onClick={() => setShowHistory(true)} className="text-xs text-teal-700 hover:underline">Voir tout ({history.length})</button>
                )}
              </div>
              <ul className="space-y-1">
                {history.slice(0, 3).map(h => (
                  <li key={h.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300">{h.date} · {h.symptom}</span>
                    <span className={`px-2 py-0.5 rounded-full ${h.level === 'urgence' ? 'bg-red-100 text-red-700' : h.level === 'conseil' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>{h.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {symptom && !done && (
        <div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
              <AlertTriangle className="w-4 h-4" /> Drapeaux rouges, {symptom.label}
            </div>
            <ul className="text-xs text-amber-800 dark:text-amber-200/90 space-y-0.5 ml-5 list-disc">
              {symptom.redFlags.map(f => <li key={f}>{f}</li>)}
            </ul>
            <p className="text-[11px] mt-1.5 text-amber-700 dark:text-amber-300">Si l'un de ces signes est présent, appelez immédiatement le 166.</p>
            <button onClick={escalate} className="mt-2 w-full py-2 rounded-xl bg-red-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> J'ai l'un de ces signes, escalade immédiate
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i < step ? 'bg-teal-500' : i === step ? 'bg-teal-300' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Question {step + 1} sur {QUESTIONS.length}</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={QUESTIONS[step].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">{QUESTIONS[step].text}</h2>
              {QUESTIONS[step].hint && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{QUESTIONS[step].hint}</p>
              )}
              <div className="mt-4 space-y-2">
                {QUESTIONS[step].options.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => choose(opt.level)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 text-left text-sm font-medium text-gray-800 dark:text-slate-200 transition"
                  >
                    <span>{opt.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {step > 0 && (
            <button
              onClick={() => { setStep(step, 1); setAnswers(answers.slice(0, -1)); }}
              className="mt-3 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            >
              ← Question précédente
            </button>
          )}
        </div>
      )}

      {done && (
        <>
          {autoCall !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-600 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
              <div className="flex-1">
                <div className="font-bold">Escalade automatique au SAMU</div>
                <div className="text-xs text-white/90">Appel du 166 dans <span className="font-bold">{autoCall}s</span>, annulez si erreur.</div>
              </div>
              <button onClick={() => setAutoCall(null)} className="px-3 py-1.5 rounded-full bg-white text-red-700 text-xs font-semibold">Annuler</button>
            </motion.div>
          )}
          <ResultCard level={done} onAction={handleAction} onRestart={restart} />
        </>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Avertissement
        </div>
        Cet outil de triage est indicatif et ne remplace pas un avis médical. En cas de doute ou d'aggravation, contactez immédiatement les urgences.
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowHistory(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900">Historique des triages</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun triage enregistré.</p>
            ) : (
              <ul className="space-y-2">
                {history.map(h => (
                  <li key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="min-w-0">
                      <div className="text-sm text-gray-900 truncate">{h.symptom}</div>
                      <div className="text-xs text-gray-500">{h.date}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${h.level === 'urgence' ? 'bg-red-100 text-red-700' : h.level === 'conseil' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>{h.level}</span>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); setShowHistory(false); }} className="mt-3 w-full py-2 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                Effacer l'historique
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ level, onAction, onRestart }: { level: Level; onAction: (t: 'call' | 'chat' | 'rdv' | 'tel', href?: string) => void; onRestart: () => void }) {
  const cfg = LEVELS[level];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className={`bg-gradient-to-r ${cfg.color} text-white rounded-2xl p-5 shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-3">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{cfg.title}</h2>
            <p className="text-sm text-white/90">{cfg.subtitle}</p>
          </div>
        </div>
      </div>

      <div className={`border rounded-2xl p-4 ${cfg.bg}`}>
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-slate-200 mb-2">Actions recommandées</p>
        <div className="space-y-2">
          {cfg.actions.map((a, i) => {
            const ActionIcon = a.type === 'tel' ? Phone : a.type === 'chat' ? MessageCircle : Calendar;
            return (
              <motion.button
                key={i}
                onClick={() => onAction(a.type, a.href)}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 hover:shadow-md transition text-left"
              >
                <ActionIcon className="w-5 h-5 text-gray-700 dark:text-slate-300" />
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-slate-200">{a.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" /> Recommencer le triage
      </button>
    </motion.div>
  );
}
