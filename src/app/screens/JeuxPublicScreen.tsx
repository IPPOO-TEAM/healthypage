import {
  ArrowRight, Gamepad2, Brain, Trophy, Sparkles, Puzzle, Heart,
  Users, Timer, CheckCircle2, Star,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';

interface Props { onBack?: () => void; onStart?: () => void }

const GAMES = [
  { Icon: Brain, title: 'Quiz Santé', desc: '10 questions ludiques pour tester ses réflexes nutrition, sommeil et prévention.', tone: 'from-indigo-500 to-violet-500', minutes: '5 min' },
  { Icon: Puzzle, title: 'Puzzle Anatomie', desc: 'Reconstituez le corps humain et apprenez le rôle de chaque organe.', tone: 'from-emerald-500 to-teal-500', minutes: '7 min' },
  { Icon: Heart, title: 'Cardio Memory', desc: 'Memory cardiologique pour entraîner concentration et culture santé.', tone: 'from-rose-500 to-pink-500', minutes: '4 min' },
  { Icon: Timer, title: 'Réflexe SOS', desc: 'Mini-jeu d\'urgence : choisissez le bon numéro et le bon geste à temps.', tone: 'from-amber-500 to-orange-500', minutes: '3 min' },
  { Icon: Sparkles, title: 'Bien-être Bingo', desc: 'Cochez vos habitudes saines de la semaine et débloquez des récompenses.', tone: 'from-sky-500 to-cyan-500', minutes: '7 jours' },
  { Icon: Users, title: 'Famille Quiz', desc: 'Mode multijoueur pour défier vos proches sur la santé du foyer.', tone: 'from-fuchsia-500 to-purple-500', minutes: '10 min' },
];

const BENEFITS = [
  'Apprendre les bons réflexes santé sans pression',
  'Stimuler la mémoire et la concentration des séniors',
  'Sensibiliser les enfants à l\'hygiène et la nutrition',
  'Cumuler des points fidélité HEALTHY PAGE',
  'Débloquer des badges et récompenses bien-être',
  'Partager des défis sains en famille ou entre amis',
];

export default function JeuxPublicScreen({ onBack, onStart }: Props) {
  const start = onStart ?? (() => { window.location.href = '/auth?from=Jeux'; });
  return (
    <div className="h-screen overflow-y-auto bg-white">
      <LandingNav onStart={start} />

      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/40">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-violet-200/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[24rem] h-[24rem] bg-fuchsia-200/40 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-violet-800 font-medium uppercase tracking-wide">
              <Gamepad2 className="w-3.5 h-3.5" /> Jeux & Bien-être
            </p>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Jouer pour mieux comprendre, mieux vivre.
            </h1>
            <p className="mt-5 text-slate-700 leading-relaxed text-[15px] sm:text-base">
              La rubrique <strong>Jeux</strong> de HEALTHY PAGE transforme la prévention en moments de plaisir.
              Quiz, puzzles, défis multijoueurs et mini-jeux pédagogiques&nbsp;: chaque partie renforce
              votre culture santé tout en stimulant votre cerveau.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={start} className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold inline-flex items-center gap-2 shadow-md">
                Commencer à jouer <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#jeux" className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:border-violet-300 text-slate-700 font-medium">
                Voir les jeux
              </a>
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200"
              alt="Jeux et concentration"
              className="w-full h-72 sm:h-96 object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" />
              <div>
                <div className="font-semibold text-sm">+1 240 joueurs</div>
                <div className="text-xs text-slate-500">cette semaine</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="jeux" className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Six jeux pour apprendre en s'amusant</h2>
          <p className="mt-3 text-slate-600">Du quiz éclair au défi familial, il y en a pour tous les âges.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map(({ Icon, title, desc, tone, minutes }) => (
            <div key={title} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-violet-300 transition">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tone} text-white flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-semibold text-slate-900">{title}</div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{minutes}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              <button onClick={start} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
                Jouer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-50 to-violet-50/30 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs text-emerald-800 font-medium uppercase tracking-wide">
              <Star className="w-3.5 h-3.5" /> Pourquoi jouer&nbsp;?
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight">Le jeu, un allié de santé.</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nos jeux ne sont pas que divertissants&nbsp;: ils s'appuient sur des protocoles d'éducation à la santé
              et participent au programme fidélité HEALTHY PAGE. Chaque victoire compte.
            </p>
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <Trophy className="w-7 h-7 text-amber-500" />
              <div className="mt-3 text-3xl font-bold">128</div>
              <div className="text-xs text-slate-500">badges à débloquer</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
              <Users className="w-7 h-7 text-sky-500" />
              <div className="mt-3 text-3xl font-bold">+12 000</div>
              <div className="text-xs text-slate-500">parties par mois</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <Brain className="w-7 h-7 text-violet-500" />
              <div className="mt-3 text-3xl font-bold">6</div>
              <div className="text-xs text-slate-500">univers de jeu</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
              <Sparkles className="w-7 h-7 text-rose-500" />
              <div className="mt-3 text-3xl font-bold">100%</div>
              <div className="text-xs text-slate-500">santé positive</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 blur-3xl rounded-full" />
          <div className="relative grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <Gamepad2 className="w-10 h-10 mb-4" />
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Prêt à relever le défi&nbsp;?</h2>
              <p className="mt-3 text-white/90">Lancez votre première partie en moins de 30 secondes — gratuit, sans téléchargement.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button onClick={start} className="px-6 py-3 bg-white text-violet-700 hover:bg-violet-50 rounded-full font-semibold inline-flex items-center gap-2">
                Jouer maintenant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter accent="rose" onStart={start} />
    </div>
  );
}
