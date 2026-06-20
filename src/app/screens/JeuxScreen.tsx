import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Gamepad2, Trophy, Coins, Sparkles, Brain, Heart, Apple, BedDouble, Wind,
  ShieldPlus, Baby, ChevronRight, CheckCircle2, XCircle, RotateCw, Calendar, Radio, Gift, Star,
  Zap, Timer, Activity, Target, Flame, Puzzle,
} from 'lucide-react';
import { usePoints, PointsLedgerEntry } from '../components/usePoints';

interface Props { onBack: () => void; }

type Tab = 'accueil' | 'biblio' | 'minijeux' | 'concours' | 'live' | 'kids' | 'recompenses' | 'roue' | 'flash';

const QUIZZES: { id: string; title: string; cat: string; icon: any; color: string; bg: string; questions: { q: string; a: string[]; correct: number; explain: string }[] }[] = [
  {
    id: 'nutrition', title: 'Quiz Nutrition', cat: 'Nutrition', icon: Apple, color: 'text-emerald-700', bg: 'bg-emerald-50',
    questions: [
      { q: 'Combien de portions de fruits/légumes par jour ?', a: ['1 à 2', '3 à 4', '5 ou plus', '8 à 10'], correct: 2, explain: 'Au moins 5 portions par jour selon l\'OMS.' },
      { q: 'Quel sucre est le plus rapide ?', a: ['Pain complet', 'Soda', 'Légumineuses', 'Pomme'], correct: 1, explain: 'Les sodas ont un index glycémique très élevé.' },
      { q: 'L\'eau recommandée par jour ?', a: ['0,5L', '1L', '1,5 à 2L', '4L'], correct: 2, explain: '1,5 à 2L pour un adulte sédentaire.' },
    ],
  },
  {
    id: 'sommeil', title: 'Quiz Sommeil', cat: 'Sommeil', icon: BedDouble, color: 'text-violet-700', bg: 'bg-violet-50',
    questions: [
      { q: 'Durée idéale adulte ?', a: ['4-5h', '6h', '7-9h', '11h+'], correct: 2, explain: '7 à 9h pour la majorité des adultes.' },
      { q: 'Heure idéale dernier repas ?', a: ['Juste avant', '1h avant', '2-3h avant', '5h avant'], correct: 2, explain: '2 à 3h avant le coucher pour bien digérer.' },
    ],
  },
  {
    id: 'secours', title: 'Premiers secours', cat: 'Premiers secours', icon: ShieldPlus, color: 'text-rose-700', bg: 'bg-rose-50',
    questions: [
      { q: 'Numéro d\'urgence européen ?', a: ['15', '17', '18', '112'], correct: 3, explain: '112 fonctionne partout en Europe.' },
      { q: 'Compression cardiaque adulte : rythme ?', a: ['30/min', '60/min', '100-120/min', '180/min'], correct: 2, explain: 'Rythme de 100 à 120 compressions par minute.' },
      { q: 'PLS : on tourne la victime…', a: ['Sur le ventre', 'Sur le dos', 'Sur le côté', 'Assise'], correct: 2, explain: 'Position latérale de sécurité = sur le côté.' },
    ],
  },
  {
    id: 'stress', title: 'Anti-stress', cat: 'Anti-stress', icon: Wind, color: 'text-cyan-700', bg: 'bg-cyan-50',
    questions: [
      { q: 'Cohérence cardiaque : combien de respirations/min ?', a: ['3', '6', '12', '20'], correct: 1, explain: '6 respirations/min pendant 5 min, 3 fois/jour.' },
      { q: 'Hormone du stress ?', a: ['Insuline', 'Mélatonine', 'Cortisol', 'Sérotonine'], correct: 2, explain: 'Le cortisol monte en cas de stress prolongé.' },
    ],
  },
  {
    id: 'hygiene', title: 'Hygiène', cat: 'Hygiène', icon: Heart, color: 'text-pink-700', bg: 'bg-pink-50',
    questions: [
      { q: 'Lavage des mains efficace : durée ?', a: ['5 sec', '10 sec', '20-30 sec', '2 min'], correct: 2, explain: '20 à 30 secondes minimum.' },
      { q: 'Brossage des dents : durée ?', a: ['30s', '1 min', '2 min', '5 min'], correct: 2, explain: '2 minutes, 2 fois par jour.' },
    ],
  },
  {
    id: 'memoire', title: 'Mémoire & cerveau', cat: 'Mémoire', icon: Brain, color: 'text-blue-700', bg: 'bg-blue-50',
    questions: [
      { q: 'Activité la plus utile pour le cerveau ?', a: ['Écrans', 'Sommeil de qualité', 'Sucre rapide', 'Café'], correct: 1, explain: 'Le sommeil consolide la mémoire.' },
    ],
  },
];

const CONCOURS = [
  { id: 'photo', title: 'Concours photo bien-être', sub: 'Thème : "Ma routine du matin"', prize: '500 pts + bon partenaire', endsIn: 12 },
  { id: 'pas', title: 'Défi 10 000 pas', sub: '7 jours, classement national', prize: '300 pts + tee-shirt HEALTHY', endsIn: 5 },
  { id: 'recette', title: 'Concours recette healthy', sub: 'Cuisine africaine équilibrée', prize: '700 pts + box bien-être', endsIn: 20 },
];

const LIVES = [
  { id: 'l1', title: 'Quiz live santé du dimanche', when: 'Dimanche 18h', host: 'Dr. Camara', cat: 'Quiz' },
  { id: 'l2', title: 'Yoga doux en direct', when: 'Mercredi 07h30', host: 'Coach Aïssa', cat: 'Coach' },
  { id: 'l3', title: 'Talk : santé mentale & jeunes', when: 'Vendredi 20h', host: 'Pr. Diallo', cat: 'Talk' },
];

const WHEEL = [
  { label: '50 pts', kind: 'points', value: 50, color: '#10b981' },
  { label: 'Carte cadeau', kind: 'gift', value: 1, color: '#f59e0b' },
  { label: '20 pts', kind: 'points', value: 20, color: '#0ea5e9' },
  { label: 'Re-tente', kind: 'retry', value: 0, color: '#94a3b8' },
  { label: '100 pts', kind: 'points', value: 100, color: '#8b5cf6' },
  { label: 'Premium 1j', kind: 'premium', value: 1, color: '#ec4899' },
  { label: '10 pts', kind: 'points', value: 10, color: '#14b8a6' },
  { label: '200 pts', kind: 'points', value: 200, color: '#ef4444' },
];

export default function JeuxScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('accueil');
  const points = usePoints();

  return (
    <div className="space-y-6 pb-10">
      <Header onBack={onBack} balance={points.balance} level={points.level} totalEarned={points.totalEarned} />

      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2 scrollbar-hide">
        {([
          ['accueil', 'Accueil', Sparkles],
          ['biblio', 'Quiz santé', Brain],
          ['minijeux', 'Mini-jeux', Puzzle],
          ['concours', 'Concours', Trophy],
          ['live', 'Lives', Radio],
          ['kids', 'Kids', Baby],
          ['recompenses', 'Boutique', Gift],
          ['roue', 'Roue', Target],
          ['flash', 'Flash', Zap],
        ] as [Tab, string, any][]).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === id ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md scale-105' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-fuchsia-200'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'accueil' && <Accueil onJump={setTab} balance={points.balance} />}
      {tab === 'biblio' && <Biblio onComplete={(pts, reason) => points.award(pts, reason, 'quiz')} />}
      {tab === 'minijeux' && <MiniJeux onComplete={(pts, reason) => points.award(pts, reason, 'quiz')} />}
      {tab === 'concours' && <Concours onParticipate={(c) => points.award(20, `Participation : ${c.title}`, 'concours')} />}
      {tab === 'live' && <Live />}
      {tab === 'kids' && <Kids onComplete={(pts, reason) => points.award(pts, reason, 'quiz')} />}
      {tab === 'recompenses' && <Recompenses ledger={points.ledger} onSpend={(amt, label) => points.spend(amt, `Boutique : ${label}`, 'other')} balance={points.balance} totalEarned={points.totalEarned} level={points.level} />}
      {tab === 'roue' && <Roue prizes={WHEEL} balance={points.balance} onSpend={(amt) => points.spend(amt, 'Tour de roue Jeux', 'wheel')} onWin={(p) => {
        if (p.kind === 'points' && p.value > 0) points.award(p.value, `Roue Jeux : ${p.label}`, 'wheel');
        if (p.kind === 'gift') points.award(150, `Roue Jeux : ${p.label}`, 'wheel', { kind: 'gift' });
        if (p.kind === 'premium') points.award(80, `Roue Jeux : ${p.label}`, 'wheel', { kind: 'premium' });
      }} />}
      {tab === 'flash' && <Flash />}
    </div>
  );
}

function Header({ onBack, balance, level, totalEarned }: { onBack: () => void; balance: number; level: number; totalEarned: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-fuchsia-700 via-purple-600 to-indigo-600 text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.5), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236,72,153,.4), transparent 60%), radial-gradient(circle at 50% 100%, rgba(99,102,241,.5), transparent 70%)' }} />
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-fuchsia-400/20 rounded-full blur-3xl" />
      <div className="relative p-6">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full ring-1 ring-white/30 hover:bg-white/25 mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium ring-1 ring-white/30">
              <Gamepad2 className="w-3.5 h-3.5" /> HEALTHY PAGE · Arcade santé
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mt-3 leading-tight">Jouez, apprenez,<br/>gagnez votre forme.</h1>
            <p className="text-sm text-fuchsia-100 mt-2 max-w-xl">Quiz, mini-jeux, concours et roue de la fortune — la santé devient un terrain de jeu.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Stat icon={Coins} label="Points" value={balance} />
          <Stat icon={Star} label="Niveau" value={level} />
          <Stat icon={Trophy} label="Total" value={totalEarned} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl px-3 py-3 ring-1 ring-white/25 text-center hover:bg-white/20 transition">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold">{label}</div>
      <div className="text-2xl font-bold flex items-center justify-center gap-1.5 mt-1"><Icon className="w-4 h-4 text-amber-200" /> {value}</div>
    </div>
  );
}

function Accueil({ onJump, balance }: { onJump: (t: Tab) => void; balance: number }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { t: 'biblio', title: 'Quiz', desc: 'Apprendre en jouant', icon: Brain, color: 'from-fuchsia-500 to-pink-600' },
          { t: 'minijeux', title: 'Mini-jeux', desc: 'Memory, réflexes, souffle', icon: Puzzle, color: 'from-violet-500 to-purple-600' },
          { t: 'concours', title: 'Concours', desc: 'Défis mensuels', icon: Trophy, color: 'from-amber-500 to-orange-600' },
          { t: 'roue', title: 'Roue', desc: 'Cadeaux & surprises', icon: Gift, color: 'from-emerald-500 to-teal-600' },
        ].map((tile, i) => {
          const Icon = tile.icon;
          return (
            <motion.button key={i} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03, y: -2 }} onClick={() => onJump(tile.t as Tab)}
              className={`text-left rounded-3xl p-5 bg-gradient-to-br ${tile.color} text-white shadow-lg relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/15 rounded-full blur-2xl" />
              <Icon className="w-9 h-9 relative" />
              <h3 className="text-lg font-bold mt-3 relative">{tile.title}</h3>
              <p className="text-xs text-white/85 mt-1 relative">{tile.desc}</p>
            </motion.button>
          );
        })}
      </div>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Jeux populaires</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {QUIZZES.slice(0, 3).map(q => {
            const Icon = q.icon;
            return (
              <button key={q.id} onClick={() => onJump('biblio')} className={`text-left rounded-2xl p-4 ${q.bg} ring-1 ring-black/5 hover:shadow-md transition`}>
                <Icon className={`w-6 h-6 ${q.color}`} />
                <h4 className={`font-semibold mt-2 ${q.color}`}>{q.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{q.questions.length} questions · {q.questions.length * 10} pts max</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-amber-100 to-rose-100 rounded-2xl p-5 ring-1 ring-amber-200">
        <h3 className="font-semibold text-slate-900">Vos récompenses</h3>
        <p className="text-sm text-slate-700 mt-1">Vous avez <strong>{balance} points</strong>. Convertissez-les en avantages dans la boutique.</p>
        <button onClick={() => onJump('recompenses')} className="mt-3 inline-flex items-center gap-1 bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-800">
          Ouvrir la boutique <ChevronRight className="w-4 h-4" />
        </button>
      </section>
    </>
  );
}

function Biblio({ onComplete }: { onComplete: (pts: number, reason: string) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const quiz = QUIZZES.find(q => q.id === active);
  return (
    <>
      {!quiz ? (
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Bibliothèque de jeux</h2>
          <p className="text-sm text-slate-600 mt-1">Des jeux courts, des réflexes durables, un score qui reflète vos progrès.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {QUIZZES.map(q => {
              const Icon = q.icon;
              return (
                <button key={q.id} onClick={() => setActive(q.id)} className={`text-left rounded-2xl p-4 ${q.bg} ring-1 ring-black/5 hover:shadow-md transition`}>
                  <Icon className={`w-6 h-6 ${q.color}`} />
                  <h4 className={`font-semibold mt-2 ${q.color}`}>{q.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{q.cat} · {q.questions.length} questions</p>
                  <p className="text-xs font-semibold text-slate-700 mt-2">+{q.questions.length * 10} pts max</p>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <QuizPlayer quiz={quiz} onClose={() => setActive(null)} onFinish={(score, total) => {
          const pts = score * 10;
          onComplete(pts, `${quiz.title} : ${score}/${total}`);
        }} />
      )}
    </>
  );
}

function QuizPlayer({ quiz, onClose, onFinish }: { quiz: typeof QUIZZES[number]; onClose: () => void; onFinish: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;

  const next = () => {
    const ok = pick === q.correct;
    const newScore = ok ? score + 1 : score;
    if (isLast) {
      setScore(newScore);
      setDone(true);
      onFinish(newScore, quiz.questions.length);
      return;
    }
    setScore(newScore);
    setIdx(i => i + 1);
    setPick(null);
  };

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{quiz.title}</h2>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Fermer</button>
      </div>
      {!done ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-fuchsia-600 h-full transition-all" style={{ width: `${((idx) / quiz.questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-500">{idx + 1}/{quiz.questions.length}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mt-4">{q.q}</h3>
          <div className="mt-3 space-y-2">
            {q.a.map((ans, i) => {
              const submitted = pick != null && (i === pick || i === q.correct);
              const correct = i === q.correct && pick != null;
              const wrong = i === pick && pick !== q.correct;
              return (
                <button key={i} onClick={() => pick == null && setPick(i)} disabled={pick != null}
                  className={`w-full text-left px-4 py-3 rounded-xl ring-1 transition ${
                    correct ? 'bg-emerald-50 ring-emerald-300 text-emerald-900' :
                    wrong ? 'bg-rose-50 ring-rose-300 text-rose-900' :
                    pick === i ? 'bg-fuchsia-50 ring-fuchsia-300' :
                    'bg-slate-50 ring-slate-200 hover:bg-slate-100'
                  }`}>
                  <span className="inline-flex items-center gap-2">
                    {correct && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {wrong && <XCircle className="w-4 h-4 text-rose-600" />}
                    {ans}
                  </span>
                </button>
              );
            })}
          </div>
          {pick != null && (
            <>
              <div className={`mt-3 p-3 rounded-xl ring-1 text-sm flex items-start gap-2 ${pick === q.correct ? 'bg-emerald-50 ring-emerald-200 text-emerald-900' : 'bg-rose-50 ring-rose-200 text-rose-900'}`}>
                {pick === q.correct ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />} <span>{q.explain}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={next} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold hover:opacity-90 shadow-md inline-flex items-center justify-center gap-1.5">
                  {isLast ? 'Voir le score' : 'Question suivante'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-2xl font-bold text-slate-900 mt-3">Score : {score}/{quiz.questions.length}</h3>
          <p className="text-sm text-slate-600 mt-1">+{score * 10} points crédités</p>
          <div className="mt-5 flex gap-2 justify-center">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">Fermer</button>
            <button onClick={() => { setIdx(0); setPick(null); setScore(0); setDone(false); }} className="px-4 py-2 rounded-xl bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-700 inline-flex items-center gap-1">
              <RotateCw className="w-4 h-4" /> Rejouer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Concours({ onParticipate }: { onParticipate: (c: typeof CONCOURS[number]) => void }) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Concours mensuels</h2>
      <p className="text-sm text-slate-600 mt-1">Un défi par mois pour garder le rythme et transformer l'effort en victoire.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {CONCOURS.map(c => (
          <article key={c.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 ring-1 ring-amber-100">
            <Trophy className="w-7 h-7 text-amber-600" />
            <h3 className="font-semibold text-slate-900 mt-2">{c.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{c.sub}</p>
            <p className="text-xs text-amber-800 mt-2">🏆 {c.prize}</p>
            <p className="text-xs text-slate-500 mt-1">Se termine dans {c.endsIn} jours</p>
            <button onClick={() => onParticipate(c)} className="mt-3 w-full py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
              Participer (+20 pts)
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Live() {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Lives & événements</h2>
      <p className="text-sm text-slate-600 mt-1">Des rendez-vous qui motivent, des experts qui répondent, une énergie collective.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {LIVES.map(l => (
          <article key={l.id} className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-rose-100 p-2 rounded-xl"><Radio className="w-5 h-5 text-rose-600" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{l.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{l.host} · {l.cat}</p>
                <p className="text-xs text-slate-600 mt-1 inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {l.when}</p>
              </div>
            </div>
            <button className="mt-3 w-full py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
              S'inscrire
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Kids({ onComplete }: { onComplete: (pts: number, reason: string) => void }) {
  const items = [
    { id: 'k1', title: 'Mémo des fruits', desc: 'Retrouve les paires (5+ ans)', icon: Apple, pts: 15, color: 'bg-emerald-50', tx: 'text-emerald-700' },
    { id: 'k2', title: 'L\'aventure des dents', desc: 'Histoire interactive (4+ ans)', icon: Heart, pts: 10, color: 'bg-pink-50', tx: 'text-pink-700' },
    { id: 'k3', title: 'Quiz secourisme junior', desc: 'Les bons réflexes (8+ ans)', icon: ShieldPlus, pts: 20, color: 'bg-rose-50', tx: 'text-rose-700' },
    { id: 'k4', title: 'Défi lavage des mains', desc: 'En famille — 5 jours', icon: Sparkles, pts: 25, color: 'bg-cyan-50', tx: 'text-cyan-700' },
  ];
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-pink-100 p-2 rounded-xl"><Baby className="w-6 h-6 text-pink-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Espace Kids & Famille</h2>
          <p className="text-sm text-slate-600">Des jeux qui amusent et qui installent de bons réflexes dès l'enfance.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {items.map(it => {
          const Icon = it.icon;
          return (
            <div key={it.id} className={`rounded-2xl p-4 ${it.color} ring-1 ring-black/5`}>
              <Icon className={`w-6 h-6 ${it.tx}`} />
              <h3 className="font-semibold text-slate-900 mt-2">{it.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{it.desc}</p>
              <button onClick={() => onComplete(it.pts, it.title)} className="mt-3 w-full py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700">
                Lancer (+{it.pts} pts)
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Recompenses({ ledger, balance, totalEarned, level, onSpend }: { ledger: PointsLedgerEntry[]; balance: number; totalEarned: number; level: number; onSpend: (amt: number, label: string) => boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const items = [
    { id: 'b1', label: 'Carte cadeau 5€', cost: 200 },
    { id: 'b2', label: 'Mois Premium HEALTHY', cost: 500 },
    { id: 'b3', label: 'Box bien-être surprise', cost: 800 },
    { id: 'b4', label: 'Code -10% séjour partenaire', cost: 150 },
  ];
  const buy = (it: typeof items[number]) => {
    if (onSpend(it.cost, it.label)) setMsg(`${it.label} ajouté à vos avantages.`);
    else setMsg(`Solde insuffisant pour ${it.label}.`);
  };
  return (
    <>
      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Récompenses & boutique</h2>
        <p className="text-sm text-slate-600 mt-1">Chaque action compte, chaque point ouvre un avantage.</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-fuchsia-50 rounded-xl p-3 text-center">
            <div className="text-xs text-fuchsia-700">Solde</div>
            <div className="text-xl font-bold text-fuchsia-900">{balance}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xs text-amber-700">Niveau</div>
            <div className="text-xl font-bold text-amber-900">{level}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-700">Total gagné</div>
            <div className="text-xl font-bold text-emerald-900">{totalEarned}</div>
          </div>
        </div>
        {msg && <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-sm">{msg}</div>}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Boutique avantages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {items.map(it => (
            <div key={it.id} className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
              <Gift className="w-6 h-6 text-fuchsia-600" />
              <h4 className="font-semibold text-slate-900 mt-2">{it.label}</h4>
              <p className="text-xs text-slate-500 mt-1">Coût : {it.cost} pts</p>
              <button onClick={() => buy(it)} disabled={balance < it.cost}
                className="mt-3 w-full py-2 rounded-xl bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 disabled:opacity-50">
                Échanger
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Historique des points</h3>
        {ledger.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">Aucune activité pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {ledger.slice(0, 30).map(e => (
              <li key={e.id} className="py-2 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="text-slate-800 truncate">{e.reason}</p>
                  <p className="text-xs text-slate-400">{new Date(e.at).toLocaleString('fr-FR')} · {e.source}</p>
                </div>
                <span className={`font-mono font-semibold ${e.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{e.delta >= 0 ? '+' : ''}{e.delta}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Roue({ prizes, balance, onSpend, onWin }: { prizes: { label: string; kind: string; value: number; color: string }[]; balance: number; onSpend: (amt: number) => boolean; onWin: (p: any) => void }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const seg = 360 / prizes.length;
  const COST = 10;

  const spin = () => {
    if (spinning) return;
    if (balance < COST) { setResult({ label: 'Solde insuffisant', kind: 'error' }); return; }
    if (!onSpend(COST)) { setResult({ label: 'Solde insuffisant', kind: 'error' }); return; }
    setSpinning(true); setResult(null);
    const idx = Math.floor(Math.random() * prizes.length);
    setAngle(360 * 6 + (360 - idx * seg - seg / 2));
    setTimeout(() => {
      setSpinning(false);
      const p = prizes[idx];
      setResult(p);
      if (p.kind !== 'retry' && p.kind !== 'error') onWin(p);
    }, 4200);
  };

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Roue de la fortune</h2>
      <p className="text-sm text-slate-600 mt-1">Tournez la roue et transformez votre score en récompense.</p>
      <div className="flex flex-col items-center mt-4">
        <div className="relative w-72 h-72">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-900" />
          </div>
          <motion.div animate={{ rotate: angle }} transition={{ duration: 4, ease: [0.17, 0.67, 0.32, 1.27] }}
            className="w-full h-full rounded-full shadow-xl ring-4 ring-white relative overflow-hidden"
            style={{ background: `conic-gradient(${prizes.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ')})` }}>
            {prizes.map((p, i) => {
              const rot = i * seg + seg / 2;
              return (
                <div key={i} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${rot}deg)` }}>
                  <span className="mt-3 text-[10px] font-bold text-white drop-shadow">{p.label}</span>
                </div>
              );
            })}
          </motion.div>
          <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white shadow-md ring-4 ring-slate-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-fuchsia-500" />
          </div>
        </div>
        <button onClick={spin} disabled={spinning} className="mt-6 px-6 py-3 rounded-2xl bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-700 disabled:opacity-60">
          {spinning ? 'La roue tourne…' : `Tourner (${COST} pts)`}
        </button>
        {result && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-sm text-slate-800">
            🎉 {result.kind === 'error' ? result.label : `Gain : ${result.label}`}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// MINI-JEUX
// ============================================================
type MiniId = 'memory' | 'reflex' | 'breath';

function MiniJeux({ onComplete }: { onComplete: (pts: number, reason: string) => void }) {
  const [active, setActive] = useState<MiniId | null>(null);
  const games = [
    { id: 'memory' as const, title: 'Memory Santé', desc: 'Retrouvez les paires en un minimum de coups.', Icon: Brain, color: 'from-violet-500 to-fuchsia-600', max: '+50 pts max' },
    { id: 'reflex' as const, title: 'Réflexes éclair', desc: 'Tapez dès que la cible devient verte. Le plus rapide gagne.', Icon: Zap, color: 'from-amber-500 to-orange-600', max: '+40 pts max' },
    { id: 'breath' as const, title: 'Cohérence cardiaque', desc: 'Respirez au rythme du cercle pendant 1 minute.', Icon: Activity, color: 'from-cyan-500 to-teal-600', max: '+30 pts' },
  ];

  if (active === 'memory') return <MemoryGame onClose={() => setActive(null)} onScore={(pts) => onComplete(pts, 'Memory Santé')} />;
  if (active === 'reflex') return <ReflexGame onClose={() => setActive(null)} onScore={(pts) => onComplete(pts, 'Réflexes éclair')} />;
  if (active === 'breath') return <BreathGame onClose={() => setActive(null)} onScore={(pts) => onComplete(pts, 'Cohérence cardiaque')} />;

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white flex items-center justify-center shadow-md">
          <Puzzle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mini-jeux santé</h2>
          <p className="text-sm text-slate-600">Jouez court, gagnez des points, entretenez votre forme.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {games.map(g => {
          const Icon = g.Icon;
          return (
            <motion.button key={g.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActive(g.id)}
              className={`text-left rounded-3xl p-5 bg-gradient-to-br ${g.color} text-white shadow-lg relative overflow-hidden`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
              <Icon className="w-10 h-10 relative" />
              <h3 className="text-lg font-bold mt-4 relative">{g.title}</h3>
              <p className="text-xs text-white/85 mt-1 relative">{g.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full relative">
                <Coins className="w-3 h-3" /> {g.max}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

// ----- Memory Match -----
const MEMORY_ICONS = [Apple, Heart, Brain, BedDouble, Wind, ShieldPlus];
function MemoryGame({ onClose, onScore }: { onClose: () => void; onScore: (pts: number) => void }) {
  const buildDeck = () => {
    const pairs = [...MEMORY_ICONS, ...MEMORY_ICONS].map((Icon, i) => ({ id: i, Icon, matched: false }));
    return pairs.sort(() => Math.random() - 0.5);
  };
  const [deck, setDeck] = useState(buildDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (open.length !== 2) return;
    setMoves(m => m + 1);
    const [a, b] = open;
    if (deck[a].Icon === deck[b].Icon) {
      setTimeout(() => {
        setDeck(d => d.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
        setOpen([]);
      }, 500);
    } else {
      setTimeout(() => setOpen([]), 800);
    }
  }, [open, deck]);

  useEffect(() => {
    if (deck.every(c => c.matched) && !scored) {
      setDone(true);
      setScored(true);
      const pts = Math.max(10, 50 - Math.max(0, moves - 6) * 3 - Math.max(0, time - 30));
      onScore(pts);
    }
  }, [deck, moves, time, scored, onScore]);

  const flip = (i: number) => {
    if (open.length === 2) return;
    if (open.includes(i)) return;
    if (deck[i].matched) return;
    setOpen(o => [...o, i]);
  };

  const reset = () => { setDeck(buildDeck()); setOpen([]); setMoves(0); setTime(0); setDone(false); setScored(false); };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2"><Brain className="w-5 h-5 text-fuchsia-600" /> Memory Santé</h2>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Fermer</button>
      </div>
      <div className="flex items-center gap-3 mt-3 text-sm">
        <div className="px-3 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 font-semibold inline-flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> {time}s</div>
        <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">Coups : {moves}</div>
        <button onClick={reset} className="ml-auto text-xs text-slate-500 hover:text-fuchsia-600 inline-flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Réinitialiser</button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 mt-5 max-w-md mx-auto">
        {deck.map((card, i) => {
          const Icon = card.Icon;
          const shown = open.includes(i) || card.matched;
          return (
            <motion.button key={i} onClick={() => flip(i)}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                card.matched ? 'bg-emerald-100 ring-2 ring-emerald-300' :
                shown ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md' :
                'bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300'
              }`}>
              {shown ? <Icon className={`w-8 h-8 ${card.matched ? 'text-emerald-700' : ''}`} /> : <Sparkles className="w-5 h-5 text-slate-400" />}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <div className="mt-5 text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 ring-1 ring-emerald-200">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 mt-2">Bravo !</h3>
          <p className="text-sm text-slate-600 mt-1">{moves} coups · {time}s</p>
          <button onClick={reset} className="mt-3 px-4 py-2 rounded-xl bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-700 inline-flex items-center gap-1.5">
            <RotateCw className="w-4 h-4" /> Rejouer
          </button>
        </div>
      )}
    </section>
  );
}

// ----- Reflex Game -----
function ReflexGame({ onClose, onScore }: { onClose: () => void; onScore: (pts: number) => void }) {
  type State = 'idle' | 'waiting' | 'go' | 'result' | 'tooSoon';
  const [state, setState] = useState<State>('idle');
  const [ms, setMs] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [scored, setScored] = useState(false);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    setState('waiting');
    setMs(null);
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setState('go');
    }, delay);
  };

  const tap = () => {
    if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('tooSoon');
      return;
    }
    if (state === 'go') {
      const t = Math.round(performance.now() - startRef.current);
      setMs(t);
      setBest(b => b == null ? t : Math.min(b, t));
      setRound(r => r + 1);
      setState('result');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (round >= 3 && best != null && !scored) {
      const pts = best < 250 ? 40 : best < 350 ? 30 : best < 500 ? 20 : 10;
      onScore(pts);
      setScored(true);
    }
  }, [round, best, scored, onScore]);

  const bg = state === 'waiting' ? 'from-rose-500 to-red-600' :
             state === 'go' ? 'from-emerald-500 to-teal-500' :
             state === 'tooSoon' ? 'from-amber-500 to-orange-600' :
             'from-slate-700 to-slate-900';
  const label = state === 'idle' ? 'Appuyer pour commencer' :
                state === 'waiting' ? 'Attendez le vert…' :
                state === 'go' ? 'TAP !' :
                state === 'tooSoon' ? 'Trop tôt ! Recommencez' :
                `${ms} ms`;

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Réflexes éclair</h2>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Fermer</button>
      </div>
      <div className="flex items-center gap-3 mt-3 text-sm">
        <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">Manche {Math.min(round + (state === 'idle' ? 0 : 1), 3)}/3</div>
        {best != null && <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Best : {best} ms</div>}
      </div>
      <button
        onClick={() => state === 'idle' || state === 'result' || state === 'tooSoon' ? start() : tap()}
        className={`mt-5 w-full h-72 rounded-3xl bg-gradient-to-br ${bg} text-white font-bold text-2xl shadow-xl transition-colors flex items-center justify-center select-none active:scale-[0.99]`}>
        <div className="text-center px-4">
          {state === 'go' ? <Target className="w-16 h-16 mx-auto mb-2" /> : null}
          <div>{label}</div>
          {state === 'result' && ms != null && (
            <div className="text-sm font-medium text-white/85 mt-2">
              {ms < 250 ? 'Excellent !' : ms < 350 ? 'Très bien' : ms < 500 ? 'Bien' : 'Continuez'}
            </div>
          )}
        </div>
      </button>
      {round >= 3 && (
        <div className="mt-4 text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 ring-1 ring-amber-200">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm text-slate-700 mt-1">3 manches terminées — Best : <strong>{best} ms</strong></p>
          <button onClick={() => { setRound(0); setBest(null); setScored(false); setState('idle'); }} className="mt-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 inline-flex items-center gap-1.5">
            <RotateCw className="w-4 h-4" /> Nouvelle session
          </button>
        </div>
      )}
    </section>
  );
}

// ----- Breath Game (cohérence cardiaque 4-4-4) -----
function BreathGame({ onClose, onScore }: { onClose: () => void; onScore: (pts: number) => void }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [phaseTick, setPhaseTick] = useState(0);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => {
      setSeconds(s => s - 1);
      setPhaseTick(p => {
        const next = p + 1;
        if (next >= 12) { return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  useEffect(() => {
    if (phaseTick < 4) setPhase('in');
    else if (phaseTick < 8) setPhase('hold');
    else setPhase('out');
  }, [phaseTick]);

  useEffect(() => {
    if (running && seconds === 0 && !scored) {
      setRunning(false);
      onScore(30);
      setScored(true);
    }
  }, [running, seconds, scored, onScore]);

  const reset = () => { setRunning(false); setSeconds(60); setPhase('in'); setPhaseTick(0); setScored(false); };

  const scale = phase === 'in' ? 1.4 : phase === 'hold' ? 1.4 : 0.6;
  const phaseLabel = phase === 'in' ? 'Inspirez' : phase === 'hold' ? 'Retenez' : 'Expirez';
  const phaseColor = phase === 'in' ? 'from-cyan-400 to-sky-500' : phase === 'hold' ? 'from-violet-400 to-purple-500' : 'from-emerald-400 to-teal-500';

  return (
    <section className="bg-gradient-to-br from-cyan-50 via-white to-teal-50 rounded-3xl p-6 shadow-sm ring-1 ring-cyan-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-600" /> Cohérence cardiaque</h2>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Fermer</button>
      </div>
      <p className="text-sm text-slate-600 mt-2">Suivez le cercle : 4s inspiration · 4s rétention · 4s expiration. 1 minute pour gagner 30 points.</p>

      <div className="flex flex-col items-center mt-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div
            animate={{ scale: running ? scale : 0.8 }}
            transition={{ duration: phase === 'hold' ? 0 : 4, ease: 'easeInOut' }}
            className={`w-40 h-40 rounded-full bg-gradient-to-br ${phaseColor} shadow-2xl`}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-slate-900">{seconds}s</div>
            <AnimatePresence mode="wait">
              <motion.div key={phase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-sm font-semibold text-slate-700 mt-1">
                {running ? phaseLabel : 'Prêt ?'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          {!running && seconds > 0 && (
            <button onClick={() => setRunning(true)} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-md inline-flex items-center gap-2">
              <Activity className="w-4 h-4" /> Démarrer
            </button>
          )}
          {running && (
            <button onClick={() => setRunning(false)} className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold">
              Pause
            </button>
          )}
          {(seconds < 60 || seconds === 0) && (
            <button onClick={reset} className="px-4 py-3 rounded-2xl bg-white text-slate-700 font-semibold ring-1 ring-slate-200 inline-flex items-center gap-1.5">
              <RotateCw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
        {seconds === 0 && (
          <div className="mt-5 text-center bg-white rounded-2xl p-4 ring-1 ring-cyan-200">
            <Heart className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-700 mt-1">Session terminée — <strong>+30 points</strong></p>
          </div>
        )}
      </div>
    </section>
  );
}

function Flash() {
  const [alert, setAlert] = useState(false);
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Flash & promotions</h2>
      <p className="text-sm text-slate-600 mt-1">Une offre courte, un avantage immédiat, une motivation qui remonte.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {[
          { t: 'Quiz Express x2', d: 'Points doublés sur tous les quiz pendant 1h', when: 'Aujourd\'hui 18h-19h', color: 'from-fuchsia-500 to-pink-600' },
          { t: 'Roue gratuite', d: 'Un tour offert par jour', when: 'Tous les jours', color: 'from-amber-500 to-orange-600' },
          { t: 'Concours flash photo', d: '+100 pts à la 1ère soumission', when: 'Demain 12h-14h', color: 'from-emerald-500 to-teal-600' },
          { t: 'Live bonus', d: '+30 pts par participation au live', when: 'Vendredi 20h', color: 'from-violet-500 to-purple-600' },
        ].map((p, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${p.color} text-white shadow-sm`}>
            <Sparkles className="w-7 h-7 mb-2" />
            <h3 className="font-bold">{p.t}</h3>
            <p className="text-xs text-white/85 mt-1">{p.d}</p>
            <p className="text-xs text-white/80 mt-2">⏱ {p.when}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setAlert(true)} disabled={alert} className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 inline-flex items-center justify-center gap-1.5">
        {alert ? <><CheckCircle2 className="w-4 h-4" /> Alerte activée pour les prochains flash</> : 'Activer les alertes flash'}
      </button>
    </section>
  );
}
