import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Apple, Droplet, Flame, CheckCircle2, ScanLine, ListChecks, UserCog, CalendarDays, Trash2, Sparkles, Utensils, Plus, Minus, GlassWater, ShoppingCart, Copy, Check } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../components/api';
import { getPatientId } from '../../components/usePatientId';

interface Props { onBack: () => void; }

type Tab = 'today' | 'profile' | 'scan' | 'menus';

interface NutritionProfile {
  goal: string;
  diet: string;
  pathologies: string[];
  allergies: string;
  values: string[];
  weight: string;
  height: string;
  waterGoalL: string;
  kcalGoal: string;
}

interface Meal {
  id: string;
  label: string;
  kcal: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  recommendation?: string;
  createdAt?: string;
  kind?: 'food' | 'water';
  glasses?: number;
}

const GLASS_ML = 250;

const GOALS = ['Équilibre général', 'Perte de poids', 'Prise de masse', 'Immunité', 'Grossesse / allaitement', 'Performance sportive', 'Récupération post-opératoire'];
const DIETS = ['Omnivore', 'Végétarien', 'Végétalien', 'Sans gluten', 'Sans lactose', 'Halal', 'Diabétique'];
const PATHOS = ['HTA', 'Diabète', 'Cholestérol élevé', 'Anémie', 'Insuffisance rénale'];
const VALUES = ['Local / circuit court', 'Bio', 'Saisonnier', 'Faible empreinte carbone'];

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // Mon..Sun

function computeWeek(meals: Meal[]): { day: string; kcal: number }[] {
  const out: { day: string; kcal: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate(), i);
    const key = d.toDateString();
    const kcal = meals
      .filter((m) => m.kind !== 'water' && m.createdAt && new Date(m.createdAt).toDateString() === key)
      .reduce((s, m) => s + (m.kcal || 0), 0);
    const dow = (d.getDay() + 6) % 7; // Mon=0
    out.push({ day: DAY_LABELS[dow], kcal });
  }
  return out;
}

const DEFAULT_PROFILE: NutritionProfile = {
  goal: GOALS[0],
  diet: DIETS[0],
  pathologies: [],
  allergies: '',
  values: [],
  weight: '',
  height: '',
  waterGoalL: '1.8',
  kcalGoal: '2000'
};

// Static menus tailored by goal, full week, plats locaux Bénin / Côte d'Ivoire
const MENUS: Record<string, { day: string; pdj: string; dej: string; din: string }[]> = {
  'Équilibre général': [
    { day: 'Lundi', pdj: 'Bouillie de mil + papaye + thé', dej: 'Riz brun, poisson grillé, gombo, banane plantain', din: 'Soupe légumes + œuf dur + akassa léger' },
    { day: 'Mardi', pdj: 'Pain complet + arachide + thé citron', dej: 'Igname pilée, sauce épinard, poulet local', din: 'Salade crudités + attiéké léger' },
    { day: 'Mercredi', pdj: 'Yaourt nature + banane + flocons d\'avoine', dej: 'Couscous légumes + boulettes de poisson', din: 'Tisane + soupe haricots blancs' },
    { day: 'Jeudi', pdj: 'Bouillie maïs + ananas + lait', dej: 'Riz, sauce gombo, poisson fumé, légumes verts', din: 'Soupe poulet-citron + igname rôtie' },
    { day: 'Vendredi', pdj: 'Pain + avocat + œuf brouillé', dej: 'Foutou banane, sauce graine, poulet kedjenou', din: 'Salade composée + papaye' },
    { day: 'Samedi', pdj: 'Akpan + arachide grillée', dej: 'Attiéké poisson + alloco modéré', din: 'Soupe légumes verts + pain complet' },
    { day: 'Dimanche', pdj: 'Bouillie sorgho + mangue', dej: 'Igname, sauce arachide, poisson grillé', din: 'Salade fruit + yaourt' }
  ],
  'Perte de poids': [
    { day: 'Lundi', pdj: 'Œuf à la coque + papaye + thé sans sucre', dej: 'Salade composée + poisson grillé', din: 'Soupe légumes + tisane' },
    { day: 'Mardi', pdj: 'Yaourt nature + amandes + 1 fruit', dej: 'Légumes vapeur + poulet (sans peau)', din: 'Bouillon poisson + crudités citronnées' },
    { day: 'Mercredi', pdj: 'Bouillie peu sucrée + 1 fruit', dej: 'Riz brun (petite portion), poisson, légumes verts', din: 'Œufs brouillés + tomate + concombre' },
    { day: 'Jeudi', pdj: 'Pain complet (1 tranche) + œuf + thé', dej: 'Attiéké modéré + poisson + crudités', din: 'Soupe poulet + courgette' },
    { day: 'Vendredi', pdj: 'Yaourt + flocons + 1 banane', dej: 'Salade haricots + thon + légumes', din: 'Soupe gombo + tisane' },
    { day: 'Samedi', pdj: 'Œuf poché + tomates + thé', dej: 'Légumes grillés + poisson fumé (peu)', din: 'Bouillon léger + crudités' },
    { day: 'Dimanche', pdj: 'Papaye + yaourt + 1 c. arachide', dej: 'Igname (petite) + sauce épinard + poisson', din: 'Soupe légumes + 1 fruit' }
  ],
  'Grossesse / allaitement': [
    { day: 'Lundi', pdj: 'Bouillie maïs + lait + banane + datte', dej: 'Riz, foie de bœuf, épinards, jus orange frais', din: 'Soupe poisson + igname pilée' },
    { day: 'Mardi', pdj: 'Pain + œuf + lait + datte', dej: 'Igname, sauce graine, poulet local', din: 'Couscous légumes + yaourt' },
    { day: 'Mercredi', pdj: 'Avocat + pain complet + lait', dej: 'Haricots, riz, poisson fumé, légumes', din: 'Soupe lentilles + fruit' },
    { day: 'Jeudi', pdj: 'Bouillie sorgho + lait + arachide', dej: 'Foutou + sauce arachide + poisson', din: 'Soupe pois cassés + igname' },
    { day: 'Vendredi', pdj: 'Pain + beurre arachide + lait + fruit', dej: 'Riz, sauce gombo, foie de poulet, légumes', din: 'Couscous légumes + œuf + yaourt' },
    { day: 'Samedi', pdj: 'Akpan + lait + banane', dej: 'Attiéké + poisson grillé + alloco modéré', din: 'Soupe haricots blancs + pain' },
    { day: 'Dimanche', pdj: 'Bouillie maïs + ananas + lait', dej: 'Igname pilée + sauce épinard + viande maigre', din: 'Soupe poulet + légumes + yaourt' }
  ],
  'Prise de masse': [
    { day: 'Lundi', pdj: 'Bouillie maïs + lait + arachide + œufs (2)', dej: 'Riz copieux + poulet + sauce arachide + alloco', din: 'Pâte d\'igname + sauce graine + poisson' },
    { day: 'Mardi', pdj: 'Pain + beurre arachide + lait + 2 œufs', dej: 'Foutou + sauce kedjenou + poulet', din: 'Riz + haricots + viande + légumes' },
    { day: 'Mercredi', pdj: 'Bouillie sorgho + lait + banane + amandes', dej: 'Attiéké + poisson fumé + alloco + sauce tomate', din: 'Couscous + boulettes viande + légumes' },
    { day: 'Jeudi', pdj: 'Yaourt + flocons + arachide + datte', dej: 'Riz + sauce graine + poulet + plantain', din: 'Igname + omelette aux légumes + fromage' },
    { day: 'Vendredi', pdj: 'Pain complet + œuf + avocat + lait', dej: 'Foutou banane + sauce arachide + poisson', din: 'Riz + haricots + viande + légumes' },
    { day: 'Samedi', pdj: 'Akpan + arachide + lait + banane', dej: 'Attiéké poisson + alloco copieux', din: 'Igname rôtie + sauce épinard + viande' },
    { day: 'Dimanche', pdj: 'Bouillie + lait + 2 œufs + fruit', dej: 'Riz jollof + poulet entier + plantain', din: 'Couscous + boulettes + légumes + yaourt' }
  ],
  'Immunité': [
    { day: 'Lundi', pdj: 'Papaye + gingembre + thé citron + miel', dej: 'Riz + poisson grillé + légumes verts + ail', din: 'Soupe légumes-gingembre + œuf' },
    { day: 'Mardi', pdj: 'Yaourt + curcuma + miel + fruit', dej: 'Attiéké + poisson + sauce tomate + gombo', din: 'Bouillon poulet + ail + légumes' },
    { day: 'Mercredi', pdj: 'Bouillie + lait + orange + arachide', dej: 'Igname + sauce épinard + foie de bœuf', din: 'Soupe haricots + ail + tisane gingembre' },
    { day: 'Jeudi', pdj: 'Pain + avocat + œuf + thé curcuma', dej: 'Riz + sauce gombo + poisson fumé', din: 'Soupe poulet-citron + légumes' },
    { day: 'Vendredi', pdj: 'Mangue + yaourt + flocons + gingembre', dej: 'Foutou + sauce arachide + poulet', din: 'Soupe légumes + œuf + tisane' },
    { day: 'Samedi', pdj: 'Akpan + miel + ananas', dej: 'Attiéké poisson + crudités + ail', din: 'Bouillon gingembre + igname rôtie' },
    { day: 'Dimanche', pdj: 'Papaye + œuf + thé citron-miel', dej: 'Riz + poulet curry + légumes verts', din: 'Soupe lentilles + ail + fruit' }
  ],
  'Performance sportive': [
    { day: 'Lundi', pdj: 'Flocons avoine + lait + banane + miel', dej: 'Riz + poulet + patate douce + légumes', din: 'Pâtes + poisson + sauce tomate' },
    { day: 'Mardi', pdj: 'Pain complet + œuf + avocat + jus orange', dej: 'Foutou + sauce arachide + poulet', din: 'Riz + haricots + poisson + légumes' },
    { day: 'Mercredi', pdj: 'Yaourt + flocons + arachide + miel', dej: 'Attiéké + poisson + alloco modéré', din: 'Igname pilée + sauce épinard + viande' },
    { day: 'Jeudi', pdj: 'Bouillie maïs + lait + banane', dej: 'Riz + poulet kedjenou + plantain', din: 'Couscous + boulettes + légumes' },
    { day: 'Vendredi', pdj: 'Pain + beurre arachide + lait + fruit', dej: 'Foutou + sauce graine + poisson', din: 'Riz + haricots + œuf + légumes' },
    { day: 'Samedi', pdj: 'Akpan + lait + banane + miel', dej: 'Attiéké + poisson grillé + alloco', din: 'Igname + sauce arachide + viande' },
    { day: 'Dimanche', pdj: 'Yaourt + flocons + 2 fruits', dej: 'Riz jollof + poulet + plantain', din: 'Soupe pâtes + poisson + légumes' }
  ],
  'Récupération post-opératoire': [
    { day: 'Lundi', pdj: 'Bouillie sorgho + lait + miel', dej: 'Soupe légumes + poisson vapeur + riz blanc', din: 'Bouillon poulet + igname pilée' },
    { day: 'Mardi', pdj: 'Yaourt + flocons + papaye', dej: 'Riz + poulet vapeur + carottes', din: 'Soupe haricots blancs (mixée)' },
    { day: 'Mercredi', pdj: 'Bouillie maïs + lait + banane mûre', dej: 'Igname pilée + sauce épinard douce + poisson', din: 'Soupe légumes + œuf à la coque' },
    { day: 'Jeudi', pdj: 'Pain mou + œuf + thé léger', dej: 'Couscous fin + boulettes vapeur + courgette', din: 'Bouillon poisson + riz' },
    { day: 'Vendredi', pdj: 'Yaourt + compote fruits', dej: 'Riz + poulet vapeur + courgette', din: 'Soupe lentilles mixée + pain' },
    { day: 'Samedi', pdj: 'Bouillie + lait + miel', dej: 'Igname + sauce tomate douce + poisson', din: 'Soupe carottes + œuf' },
    { day: 'Dimanche', pdj: 'Papaye + yaourt + flocons', dej: 'Riz + poulet vapeur + haricots verts', din: 'Bouillon poulet + pain' }
  ]
};

export default function NutritionScreen({ onBack }: Props) {
  const pid = getPatientId();
  const [tab, setTab] = useState<Tab>('today');
  const [profile, setProfile] = useState<NutritionProfile>(DEFAULT_PROFILE);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!pid) { setLoading(false); return; }
    Promise.all([
      api.getPatient(pid).catch(() => ({ patient: null })),
      api.listMeals(pid).catch(() => [])
    ]).then(([{ patient }, m]: any) => {
      if (patient?.nutrition) setProfile({ ...DEFAULT_PROFILE, ...patient.nutrition });
      setMeals((m as Meal[]) ?? []);
    }).finally(() => setLoading(false));
  }, [pid]);

  const today = new Date().toDateString();
  const isToday = (m: Meal) => m.createdAt && new Date(m.createdAt).toDateString() === today;
  const week = useMemo(() => computeWeek(meals), [meals]);
  const todayFood = useMemo(() => meals.filter((m) => isToday(m) && m.kind !== 'water'), [meals]);
  const todayWater = useMemo(() => meals.filter((m) => isToday(m) && m.kind === 'water'), [meals]);
  const todayKcal = todayFood.reduce((s, m) => s + (m.kcal || 0), 0);
  const glassesToday = todayWater.reduce((s, m) => s + (m.glasses || 0), 0);
  const goal = Number(profile.kcalGoal) || 2000;
  const waterGoalL = Number(profile.waterGoalL) || 1.8;
  const waterGoalGlasses = Math.max(1, Math.round((waterGoalL * 1000) / GLASS_ML));

  const addWater = async (delta: number) => {
    if (!pid) { setError('Aucun compte patient actif.'); return; }
    if (delta < 0) {
      const last = [...todayWater].reverse().find((m) => (m.glasses ?? 0) > 0);
      if (!last) return;
      try {
        await api.deleteMeal(pid, last.id);
        setMeals((arr) => arr.filter((m) => m.id !== last.id));
      } catch (e: any) { setError(e?.message ?? 'Suppression impossible'); }
      return;
    }
    try {
      const res = await api.createMeal(pid, {
        label: `Verre d'eau (${GLASS_ML} ml)`,
        kcal: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0,
        kind: 'water', glasses: 1
      });
      setMeals((arr) => [...arr, res as Meal]);
    } catch (e: any) { setError(e?.message ?? 'Enregistrement impossible'); }
  };

  const saveProfile = async () => {
    if (!pid) { setError('Aucun compte patient actif.'); return; }
    setError(null);
    try {
      await api.updatePatient(pid, { nutrition: profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-800 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-amber-700/80 uppercase">Healthy · Nutrition</span>
          <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-orange-600 shadow-sm">
            <Apple className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3 items-end">
          <div className="col-span-3">
            <h2 className="text-[26px] leading-tight text-slate-900">Votre guide quotidien pour mieux manger</h2>
            <p className="text-sm text-slate-600 mt-2">Suivez vos apports, scannez vos repas, recevez des recommandations adaptées.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-full inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> {todayKcal} / {goal} kcal
              </div>
              <div className="bg-white/80 text-slate-800 text-xs px-3 py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                <Droplet className="w-3.5 h-3.5 text-cyan-500" /> {((glassesToday * GLASS_ML) / 1000).toFixed(1)} L
              </div>
            </div>
          </div>
          <div className="col-span-2 relative h-32 rounded-2xl overflow-hidden">
            <ImageWithFallback src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600" alt="Bowl sain" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900">Progression de la semaine</h3>
          <span className="text-xs text-slate-500">7 jours</span>
        </div>
        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week}>
              <XAxis key="x" dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Bar key="b" dataKey="kcal" fill="#fb923c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-slate-900">Mon corps, mes nutriments</h3>
            <p className="text-xs text-slate-600 mt-0.5">Ce que chaque groupe apporte à votre organisme</p>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700/80">Holistique</span>
        </div>
        <div className="grid grid-cols-5 gap-3 items-center">
          <div className="col-span-2 relative h-44 rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-100 to-lime-100">
            <ImageWithFallback src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600" alt="Silhouette saine" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-200/40 to-transparent" />
          </div>
          <ul className="col-span-3 space-y-2 text-sm">
            {[
              { dot: 'bg-rose-400', label: 'Tomates', sub: 'Cœur · antioxydants' },
              { dot: 'bg-orange-400', label: 'Carottes', sub: 'Vue · bêta-carotène' },
              { dot: 'bg-emerald-500', label: 'Épinards · gombo', sub: 'Sang · fer & folates' },
              { dot: 'bg-amber-500', label: 'Igname · mil', sub: 'Énergie · glucides lents' },
              { dot: 'bg-teal-500', label: 'Poisson · niébé', sub: 'Muscles · protéines' }
            ].map((it) => (
              <li key={it.label} className="flex items-start gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${it.dot}`} />
                <div>
                  <p className="text-slate-900 leading-tight">{it.label}</p>
                  <p className="text-xs text-slate-500">{it.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-1 shadow-sm flex gap-1 overflow-x-auto">
        {([
          ['today', 'Aujourd\'hui', Flame],
          ['profile', 'Profil', UserCog],
          ['scan', 'Scanner', ScanLine],
          ['menus', 'Menus', CalendarDays]
        ] as [Tab, string, any][]).map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 min-w-[88px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'today' && (
            <TodayTab
              todayKcal={todayKcal}
              goal={goal}
              week={week}
              waterGoalL={waterGoalL}
              waterGoalGlasses={waterGoalGlasses}
              glassesToday={glassesToday}
              waterEntries={todayWater}
              onWaterDelta={addWater}
              meals={todayFood}
              onScan={() => setTab('scan')}
              onDelete={async (id) => {
                if (!pid) return;
                try {
                  await api.deleteMeal(pid, id);
                  setMeals((arr) => arr.filter((m) => m.id !== id));
                } catch (e: any) { setError(e?.message ?? 'Suppression impossible'); }
              }}
            />
          )}
          {tab === 'profile' && (
            <ProfileTab
              loading={loading}
              profile={profile}
              setProfile={setProfile}
              onSave={saveProfile}
              saved={saved}
            />
          )}
          {tab === 'scan' && (
            <ScanTab
              onSaved={(meal) => setMeals((arr) => [...arr, meal])}
              pid={pid}
              setError={setError}
              profile={profile}
            />
          )}
          {tab === 'menus' && <MenusTab profile={profile} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TodayTab({ todayKcal, goal, week, waterGoalL, waterGoalGlasses, glassesToday, waterEntries, onWaterDelta, meals, onScan, onDelete }: {
  todayKcal: number; goal: number; week: { day: string; kcal: number }[];
  waterGoalL: number; waterGoalGlasses: number; glassesToday: number;
  waterEntries: Meal[]; onWaterDelta: (n: number) => void;
  meals: Meal[]; onScan: () => void; onDelete: (id: string) => void;
}) {
  const litersToday = (glassesToday * GLASS_ML) / 1000;
  const waterPct = Math.min(100, Math.round((litersToday / waterGoalL) * 100));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Flame} color="orange" label="Aujourd'hui" value={`${todayKcal} kcal`} sub={`/ ${goal}`} />
        <Stat icon={Droplet} color="cyan" label="Eau" value={`${litersToday.toFixed(1)} L`} sub={`obj. ${waterGoalL} L`} />
        <Stat icon={CheckCircle2} color="emerald" label="Repas" value={String(meals.length)} sub="logués" />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <GlassWater className="w-5 h-5 text-cyan-600" /> Hydratation
          </h3>
          <span className="text-xs text-gray-500">{glassesToday}/{waterGoalGlasses} verres · {GLASS_ML} ml</span>
        </div>
        <div className="h-2.5 bg-cyan-50 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${waterPct}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Array.from({ length: Math.max(waterGoalGlasses, glassesToday) }).map((_, i) => (
            <div key={i} className={`w-7 h-9 rounded-md border ${i < glassesToday ? 'bg-cyan-500 border-cyan-600' : 'bg-cyan-50 border-cyan-100'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onWaterDelta(-1)} disabled={glassesToday === 0} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 inline-flex items-center gap-1.5">
            <Minus className="w-4 h-4" /> Verre
          </button>
          <button onClick={() => onWaterDelta(1)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl py-2.5 font-medium inline-flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Ajouter un verre ({GLASS_ML} ml)
          </button>
        </div>
        {waterEntries.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Dernier verre : {new Date(waterEntries[waterEntries.length - 1].createdAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Apports des 7 derniers jours</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week}>
              <CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="x" dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis key="y" stroke="#9ca3af" fontSize={12} />
              <Bar key="b" dataKey="kcal" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Repas du jour</h3>
          <button onClick={onScan} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-xl">
            <ScanLine className="w-4 h-4" /> Scanner
          </button>
        </div>
        {meals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Aucun repas enregistré aujourd'hui.</p>
        ) : (
          <ul className="space-y-3">
            {meals.map((m) => (
              <li key={m.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-xl"><Utensils className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {m.kcal} kcal · P {m.proteins}g · G {m.carbs}g · L {m.fats}g · F {m.fiber}g
                  </p>
                  {m.recommendation && (
                    <p className="text-xs text-emerald-700 mt-1 flex items-start gap-1">
                      <Sparkles className="w-3 h-3 mt-0.5 shrink-0" /> {m.recommendation}
                    </p>
                  )}
                </div>
                <button onClick={() => onDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ loading, profile, setProfile, onSave, saved }: {
  loading: boolean; profile: NutritionProfile; setProfile: (p: NutritionProfile) => void; onSave: () => void; saved: boolean;
}) {
  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;
  const set = <K extends keyof NutritionProfile>(k: K, v: NutritionProfile[K]) => setProfile({ ...profile, [k]: v });
  const toggle = (k: 'pathologies' | 'values', v: string) => {
    const arr = profile[k];
    set(k, (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]) as any);
  };
  return (
    <div className="space-y-4">
      <Section title="Objectif & régime">
        <Field label="Objectif principal">
          <select value={profile.goal} onChange={(e) => set('goal', e.target.value)} className={inputCls}>
            {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Régime alimentaire">
          <select value={profile.diet} onChange={(e) => set('diet', e.target.value)} className={inputCls}>
            {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Pathologies & allergies">
        <p className="text-xs text-gray-500 mb-2">Cochez ce qui s'applique :</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {PATHOS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle('pathologies', p)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                profile.pathologies.includes(p)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <Field label="Allergies / intolérances">
          <input value={profile.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="ex. arachide, lactose…" className={inputCls} />
        </Field>
      </Section>

      <Section title="Valeurs personnelles">
        <div className="flex flex-wrap gap-2">
          {VALUES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggle('values', v)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                profile.values.includes(v)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Objectifs quotidiens">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Calories (kcal)">
            <input type="number" value={profile.kcalGoal} onChange={(e) => set('kcalGoal', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Eau (litres)">
            <input type="number" step="0.1" value={profile.waterGoalL} onChange={(e) => set('waterGoalL', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <button
        onClick={onSave}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 rounded-2xl font-semibold shadow-md"
      >
        {saved ? '✓ Profil enregistré' : 'Enregistrer mon profil alimentaire'}
      </button>
    </div>
  );
}

// Heuristic-based local "scan", mots-clés enrichis avec aliments locaux Bénin / Côte d'Ivoire / Afrique de l'Ouest
const FOOD_DB: Record<string, { kcal: number; p: number; c: number; f: number; fib: number }> = {
  // Céréales & féculents
  riz: { kcal: 200, p: 4, c: 45, f: 0.5, fib: 1 },
  pain: { kcal: 250, p: 8, c: 50, f: 2, fib: 3 },
  baguette: { kcal: 250, p: 8, c: 50, f: 2, fib: 2 },
  igname: { kcal: 180, p: 2, c: 40, f: 0.3, fib: 4 },
  mais: { kcal: 180, p: 5, c: 38, f: 2, fib: 3 },
  maïs: { kcal: 180, p: 5, c: 38, f: 2, fib: 3 },
  mil: { kcal: 190, p: 6, c: 40, f: 1.5, fib: 4 },
  sorgho: { kcal: 200, p: 7, c: 41, f: 1.8, fib: 4 },
  fonio: { kcal: 180, p: 5, c: 38, f: 1, fib: 3 },
  couscous: { kcal: 220, p: 7, c: 45, f: 1, fib: 3 },
  pates: { kcal: 220, p: 8, c: 44, f: 1, fib: 2 },
  pâtes: { kcal: 220, p: 8, c: 44, f: 1, fib: 2 },
  spaghetti: { kcal: 220, p: 8, c: 44, f: 1, fib: 2 },
  attieke: { kcal: 200, p: 2, c: 45, f: 0.5, fib: 2 },
  attiéké: { kcal: 200, p: 2, c: 45, f: 0.5, fib: 2 },
  garri: { kcal: 210, p: 1.5, c: 50, f: 0.3, fib: 2 },
  gari: { kcal: 210, p: 1.5, c: 50, f: 0.3, fib: 2 },
  eba: { kcal: 220, p: 1, c: 52, f: 0.2, fib: 2 },
  foutou: { kcal: 220, p: 2, c: 50, f: 0.5, fib: 3 },
  foufou: { kcal: 220, p: 2, c: 50, f: 0.5, fib: 3 },
  fufu: { kcal: 220, p: 2, c: 50, f: 0.5, fib: 3 },
  akpan: { kcal: 160, p: 4, c: 32, f: 1, fib: 2 },
  akassa: { kcal: 170, p: 4, c: 34, f: 1, fib: 2 },
  manioc: { kcal: 200, p: 1.5, c: 47, f: 0.3, fib: 3 },
  patate: { kcal: 130, p: 2, c: 30, f: 0.2, fib: 4 },
  plantain: { kcal: 220, p: 2, c: 50, f: 0.5, fib: 4 },
  alloco: { kcal: 280, p: 2, c: 50, f: 9, fib: 4 },
  flocons: { kcal: 180, p: 6, c: 30, f: 3, fib: 5 },
  avoine: { kcal: 180, p: 6, c: 30, f: 3, fib: 5 },

  // Protéines animales
  poisson: { kcal: 180, p: 25, c: 0, f: 8, fib: 0 },
  thon: { kcal: 160, p: 28, c: 0, f: 5, fib: 0 },
  silure: { kcal: 200, p: 22, c: 0, f: 12, fib: 0 },
  capitaine: { kcal: 180, p: 26, c: 0, f: 7, fib: 0 },
  tilapia: { kcal: 130, p: 26, c: 0, f: 3, fib: 0 },
  poulet: { kcal: 220, p: 30, c: 0, f: 10, fib: 0 },
  agouti: { kcal: 200, p: 28, c: 0, f: 9, fib: 0 },
  boeuf: { kcal: 250, p: 26, c: 0, f: 16, fib: 0 },
  bœuf: { kcal: 250, p: 26, c: 0, f: 16, fib: 0 },
  mouton: { kcal: 270, p: 25, c: 0, f: 19, fib: 0 },
  porc: { kcal: 260, p: 26, c: 0, f: 17, fib: 0 },
  foie: { kcal: 180, p: 26, c: 4, f: 7, fib: 0 },
  viande: { kcal: 240, p: 26, c: 0, f: 15, fib: 0 },
  œuf: { kcal: 80, p: 7, c: 0.5, f: 5, fib: 0 },
  oeuf: { kcal: 80, p: 7, c: 0.5, f: 5, fib: 0 },
  omelette: { kcal: 160, p: 14, c: 1, f: 11, fib: 0 },

  // Légumineuses
  haricot: { kcal: 200, p: 12, c: 35, f: 1, fib: 8 },
  haricots: { kcal: 200, p: 12, c: 35, f: 1, fib: 8 },
  niebe: { kcal: 200, p: 13, c: 35, f: 1, fib: 8 },
  niébé: { kcal: 200, p: 13, c: 35, f: 1, fib: 8 },
  lentilles: { kcal: 200, p: 14, c: 33, f: 1, fib: 8 },
  pois: { kcal: 180, p: 12, c: 30, f: 1, fib: 7 },
  soja: { kcal: 220, p: 18, c: 18, f: 10, fib: 6 },

  // Sauces & graines
  arachide: { kcal: 280, p: 12, c: 8, f: 22, fib: 4 },
  cacahuete: { kcal: 280, p: 12, c: 8, f: 22, fib: 4 },
  cacahuète: { kcal: 280, p: 12, c: 8, f: 22, fib: 4 },
  amande: { kcal: 250, p: 9, c: 8, f: 21, fib: 5 },
  amandes: { kcal: 250, p: 9, c: 8, f: 21, fib: 5 },
  noix: { kcal: 280, p: 8, c: 6, f: 26, fib: 4 },
  sesame: { kcal: 280, p: 9, c: 7, f: 24, fib: 5 },
  sésame: { kcal: 280, p: 9, c: 7, f: 24, fib: 5 },
  graine: { kcal: 260, p: 7, c: 12, f: 20, fib: 4 },
  palme: { kcal: 280, p: 0, c: 0, f: 30, fib: 0 },
  huile: { kcal: 90, p: 0, c: 0, f: 10, fib: 0 },
  beurre: { kcal: 100, p: 1, c: 0.5, f: 11, fib: 0 },

  // Légumes
  legumes: { kcal: 60, p: 3, c: 10, f: 0.5, fib: 5 },
  légumes: { kcal: 60, p: 3, c: 10, f: 0.5, fib: 5 },
  gombo: { kcal: 40, p: 2, c: 8, f: 0.2, fib: 4 },
  epinard: { kcal: 30, p: 3, c: 4, f: 0.3, fib: 3 },
  épinard: { kcal: 30, p: 3, c: 4, f: 0.3, fib: 3 },
  epinards: { kcal: 30, p: 3, c: 4, f: 0.3, fib: 3 },
  épinards: { kcal: 30, p: 3, c: 4, f: 0.3, fib: 3 },
  tomate: { kcal: 25, p: 1, c: 5, f: 0.2, fib: 2 },
  oignon: { kcal: 35, p: 1, c: 8, f: 0.1, fib: 2 },
  ail: { kcal: 15, p: 1, c: 3, f: 0, fib: 0.5 },
  piment: { kcal: 20, p: 1, c: 4, f: 0.2, fib: 2 },
  carotte: { kcal: 35, p: 1, c: 8, f: 0.2, fib: 3 },
  chou: { kcal: 30, p: 2, c: 6, f: 0.2, fib: 3 },
  salade: { kcal: 25, p: 2, c: 4, f: 0.2, fib: 2 },
  crudites: { kcal: 40, p: 2, c: 6, f: 0.5, fib: 3 },
  crudités: { kcal: 40, p: 2, c: 6, f: 0.5, fib: 3 },
  concombre: { kcal: 15, p: 1, c: 3, f: 0.1, fib: 1 },
  aubergine: { kcal: 30, p: 1, c: 6, f: 0.2, fib: 3 },
  courgette: { kcal: 20, p: 1, c: 4, f: 0.2, fib: 1 },
  poivron: { kcal: 25, p: 1, c: 5, f: 0.2, fib: 2 },
  feuilles: { kcal: 35, p: 3, c: 5, f: 0.5, fib: 4 },
  baobab: { kcal: 35, p: 2, c: 6, f: 0.2, fib: 5 },

  // Fruits
  banane: { kcal: 100, p: 1, c: 25, f: 0.3, fib: 3 },
  papaye: { kcal: 60, p: 1, c: 15, f: 0.2, fib: 3 },
  ananas: { kcal: 70, p: 1, c: 18, f: 0.2, fib: 2 },
  mangue: { kcal: 80, p: 1, c: 20, f: 0.3, fib: 2 },
  orange: { kcal: 60, p: 1, c: 15, f: 0.2, fib: 3 },
  citron: { kcal: 20, p: 0.5, c: 6, f: 0.1, fib: 2 },
  pasteque: { kcal: 35, p: 1, c: 9, f: 0.2, fib: 1 },
  pastèque: { kcal: 35, p: 1, c: 9, f: 0.2, fib: 1 },
  goyave: { kcal: 70, p: 2, c: 14, f: 1, fib: 5 },
  avocat: { kcal: 220, p: 3, c: 12, f: 20, fib: 9 },
  pomme: { kcal: 80, p: 0.5, c: 21, f: 0.2, fib: 4 },
  fruit: { kcal: 80, p: 1, c: 20, f: 0.3, fib: 3 },
  datte: { kcal: 70, p: 1, c: 18, f: 0.1, fib: 2 },

  // Laitiers
  yaourt: { kcal: 100, p: 5, c: 12, f: 3, fib: 0 },
  lait: { kcal: 120, p: 6, c: 12, f: 5, fib: 0 },
  fromage: { kcal: 200, p: 14, c: 1, f: 15, fib: 0 },
  wagashi: { kcal: 180, p: 16, c: 1, f: 12, fib: 0 },

  // Plats
  soupe: { kcal: 120, p: 4, c: 12, f: 5, fib: 2 },
  bouillon: { kcal: 80, p: 4, c: 6, f: 3, fib: 1 },
  bouillie: { kcal: 150, p: 4, c: 30, f: 1, fib: 2 },
  jollof: { kcal: 280, p: 8, c: 50, f: 6, fib: 3 },
  kedjenou: { kcal: 250, p: 22, c: 12, f: 12, fib: 3 },

  // Boissons & sucres
  the: { kcal: 5, p: 0, c: 1, f: 0, fib: 0 },
  thé: { kcal: 5, p: 0, c: 1, f: 0, fib: 0 },
  cafe: { kcal: 5, p: 0, c: 1, f: 0, fib: 0 },
  café: { kcal: 5, p: 0, c: 1, f: 0, fib: 0 },
  tisane: { kcal: 5, p: 0, c: 1, f: 0, fib: 0 },
  jus: { kcal: 80, p: 0.5, c: 20, f: 0.1, fib: 0.5 },
  bissap: { kcal: 60, p: 0, c: 15, f: 0, fib: 0 },
  gingembre: { kcal: 10, p: 0, c: 2, f: 0, fib: 0.3 },
  miel: { kcal: 60, p: 0, c: 17, f: 0, fib: 0 },
  sucre: { kcal: 40, p: 0, c: 10, f: 0, fib: 0 }
};

const SYNONYMS: Record<string, string> = {
  grillé: '', grille: '', frit: '', vapeur: '', cuit: '', cru: '', fumé: '', fume: '', pilée: '', pilee: '',
  rouge: '', blanc: '', petite: '', grande: '', portion: '', sauce: '',
};

// Parse quantities: "2 oeufs", "200g riz", "1.5 tasse lait", "300 ml lait"
// FOOD_DB values are per "portion standard" ≈ 150 g (sauf œuf=1 unité, lait=200ml).
function unitMultiplier(food: string, qty: number, unit: string): number {
  // unit-based foods (counted per piece)
  if (food === 'oeuf' || food === 'œuf' || food === 'oeufs' || food === 'œufs') return qty; // par œuf
  if (!unit) {
    // si juste un nombre devant, considère = portions
    return qty;
  }
  if (unit === 'g' || unit === 'gr' || unit === 'gramme' || unit === 'grammes') return qty / 150;
  if (unit === 'kg') return (qty * 1000) / 150;
  if (unit === 'ml') return qty / 200;
  if (unit === 'l' || unit === 'litre' || unit === 'litres') return (qty * 1000) / 200;
  if (unit === 'tasse' || unit === 'tasses' || unit === 'verre' || unit === 'verres') return qty;
  if (unit === 'cuillere' || unit === 'cuillère' || unit === 'cs' || unit === 'cc') return qty * 0.1;
  if (unit === 'tranche' || unit === 'tranches') return qty * 0.3;
  if (unit === 'portion' || unit === 'portions' || unit === 'part' || unit === 'parts') return qty;
  return qty;
}

const UNIT_WORDS = new Set([
  'g', 'gr', 'gramme', 'grammes', 'kg', 'ml', 'l', 'litre', 'litres',
  'tasse', 'tasses', 'verre', 'verres', 'cuillere', 'cuillère', 'cs', 'cc',
  'tranche', 'tranches', 'portion', 'portions', 'part', 'parts'
]);

function analyzeMeal(text: string) {
  // Tokenize: split sur séparateurs mais conserve nombres (avec virgule décimale)
  const cleaned = text.toLowerCase().replace(/,(?=\d)/g, '.');
  const tokens = cleaned.split(/[\s,;+/()]+/).map((t) => t.trim()).filter(Boolean);

  let kcal = 0, p = 0, c = 0, f = 0, fib = 0;
  const matched: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (SYNONYMS[tok] === '' || !tok) continue;

    // Détection quantité: "200g riz" ou "200 g riz" ou "2 oeufs"
    let qty = 1;
    let unit = '';
    let foodIdx = i;

    const numMatch = tok.match(/^(\d+(?:\.\d+)?)([a-zà-ÿ]*)$/i);
    if (numMatch) {
      qty = parseFloat(numMatch[1]);
      unit = numMatch[2] || '';
      // Si unité collée invalide, peut-être prochain token = unité
      if (!unit && i + 1 < tokens.length && UNIT_WORDS.has(tokens[i + 1])) {
        unit = tokens[i + 1];
        foodIdx = i + 2;
        i++; // skip unit
      } else if (unit && !UNIT_WORDS.has(unit)) {
        // unit-string non reconnue → ignore
        unit = '';
        foodIdx = i + 1;
      } else {
        foodIdx = i + 1;
      }
      // Skip aux aliments
      const food = tokens[foodIdx];
      if (!food) { i = foodIdx; continue; }
      const hit = FOOD_DB[food];
      if (hit) {
        const mult = unitMultiplier(food, qty, unit);
        kcal += hit.kcal * mult; p += hit.p * mult; c += hit.c * mult; f += hit.f * mult; fib += hit.fib * mult;
        matched.push(`${qty}${unit ? ' ' + unit : ''} ${food}`);
        i = foodIdx;
        continue;
      }
      i = foodIdx;
      continue;
    }

    // Pas de quantité → 1 portion standard
    const hit = FOOD_DB[tok];
    if (hit) {
      kcal += hit.kcal; p += hit.p; c += hit.c; f += hit.f; fib += hit.fib;
      matched.push(tok);
    }
  }

  if (matched.length === 0) {
    kcal = 450; p = 18; c = 55; f = 12; fib = 4;
  }
  return { kcal: Math.round(kcal), proteins: Math.round(p), carbs: Math.round(c), fats: Math.round(f), fiber: Math.round(fib), matched };
}

function buildRecommendation(macros: { kcal: number; proteins: number; carbs: number; fats: number; fiber: number }, profile: NutritionProfile) {
  const tips: string[] = [];
  if (macros.fiber < 4) tips.push('Ajoutez des légumes ou un fruit pour les fibres.');
  if (macros.proteins < 15) tips.push('Apport en protéines un peu faible, pensez aux œufs, poisson ou légumineuses.');
  if (macros.fats > 35) tips.push('Lipides élevés : modérez l\'huile de palme et les fritures.');
  if (profile.pathologies.includes('Diabète') && macros.carbs > 60) tips.push('Glucides élevés : préférez des portions modérées et fibres.');
  if (profile.pathologies.includes('HTA')) tips.push('Limitez le sel ajouté et privilégiez les bouillons maison.');
  if (profile.pathologies.includes('Cholestérol élevé') && macros.fats > 25) tips.push('Privilégiez poisson, légumineuses et huiles végétales non saturées.');
  if (profile.pathologies.includes('Anémie') && macros.proteins >= 15) tips.push('Bon apport protéique, associez à un fruit riche en vitamine C pour le fer.');
  if (profile.pathologies.includes('Insuffisance rénale') && macros.proteins > 25) tips.push('Protéines à modérer en cas d\'insuffisance rénale, voir avec votre médecin.');
  if (profile.goal === 'Perte de poids' && macros.kcal > 700) tips.push('Portion plutôt copieuse pour un objectif de perte de poids.');
  if (profile.goal === 'Prise de masse' && macros.kcal < 500) tips.push('Apport un peu juste pour la prise de masse, augmentez la portion.');
  if (tips.length === 0) tips.push('Bon équilibre, continuez ainsi !');
  return tips.join(' ');
}

function ScanTab({ onSaved, pid, setError, profile }: {
  onSaved: (m: Meal) => void; pid: string | null; setError: (e: string | null) => void; profile: NutritionProfile;
}) {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMeal> | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    if (!text.trim()) return;
    setAnalysis(analyzeMeal(text));
  };

  const save = async () => {
    if (!pid || !analysis) { setError(pid ? null : 'Aucun compte patient actif.'); return; }
    setBusy(true);
    try {
      const recommendation = buildRecommendation(analysis, profile);
      const res = await api.createMeal(pid, {
        label: text,
        kcal: analysis.kcal,
        proteins: analysis.proteins,
        carbs: analysis.carbs,
        fats: analysis.fats,
        fiber: analysis.fiber,
        recommendation,
        kind: 'food'
      });
      onSaved(res as Meal);
      setText('');
      setAnalysis(null);
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-emerald-600" /> Scanner mon repas
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Décrivez votre repas avec quantités optionnelles : <em>200g riz, 2 œufs, 1 tasse lait, 1 banane</em>. Unités reconnues : g, kg, ml, l, tasse, verre, tranche, portion. Aliments locaux : attiéké, foutou, gari, igname, plantain, alloco, kedjenou, niébé, gombo, wagashi, bissap…
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ex : 200g attiéké, 1 poisson, 100g alloco, 1 tomate"
          rows={3}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={() => { setText(''); setAnalysis(null); }} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm">Effacer</button>
          <button onClick={run} disabled={!text.trim()} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60">
            Analyser
          </button>
        </div>
      </div>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Estimation nutritionnelle</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            <Macro label="kcal" value={analysis.kcal} />
            <Macro label="Prot." value={`${analysis.proteins}g`} />
            <Macro label="Gluc." value={`${analysis.carbs}g`} />
            <Macro label="Lip." value={`${analysis.fats}g`} />
            <Macro label="Fib." value={`${analysis.fiber}g`} />
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 flex gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <p>{buildRecommendation(analysis, profile)}</p>
          </div>
          {analysis.matched.length > 0 && (
            <p className="text-xs text-gray-500">Ingrédients reconnus : {analysis.matched.join(', ')}</p>
          )}
          <button onClick={save} disabled={busy} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-60">
            {busy ? 'Enregistrement…' : 'Ajouter à mon journal'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Catégories pour la liste de courses
const SHOPPING_CATS: { name: string; keywords: string[] }[] = [
  { name: 'Céréales & féculents', keywords: ['riz', 'pain', 'mil', 'sorgho', 'maïs', 'mais', 'fonio', 'couscous', 'pâtes', 'pates', 'igname', 'attiéké', 'attieke', 'gari', 'foutou', 'akpan', 'akassa', 'manioc', 'patate', 'plantain', 'alloco', 'flocons', 'avoine'] },
  { name: 'Protéines', keywords: ['poisson', 'thon', 'silure', 'capitaine', 'tilapia', 'poulet', 'agouti', 'bœuf', 'boeuf', 'mouton', 'porc', 'foie', 'viande', 'œuf', 'oeuf', 'omelette', 'boulettes', 'kedjenou'] },
  { name: 'Légumineuses & graines', keywords: ['haricot', 'niébé', 'niebe', 'lentilles', 'pois', 'soja', 'arachide', 'amande', 'noix', 'sésame', 'sesame'] },
  { name: 'Légumes', keywords: ['légumes', 'legumes', 'gombo', 'épinard', 'epinard', 'tomate', 'oignon', 'ail', 'piment', 'carotte', 'chou', 'salade', 'crudité', 'crudite', 'concombre', 'aubergine', 'courgette', 'poivron', 'feuilles', 'baobab'] },
  { name: 'Fruits', keywords: ['banane', 'papaye', 'ananas', 'mangue', 'orange', 'citron', 'pastèque', 'pasteque', 'goyave', 'avocat', 'pomme', 'fruit', 'datte'] },
  { name: 'Laitiers', keywords: ['yaourt', 'lait', 'fromage', 'wagashi'] },
  { name: 'Sauces, huiles & épices', keywords: ['huile', 'palme', 'beurre', 'sauce', 'graine', 'gingembre', 'curcuma', 'miel', 'sucre'] },
  { name: 'Boissons', keywords: ['thé', 'the', 'café', 'cafe', 'tisane', 'jus', 'bissap'] }
];

function buildShoppingList(menu: { day: string; pdj: string; dej: string; din: string }[]) {
  const counts = new Map<string, number>();
  for (const day of menu) {
    for (const meal of [day.pdj, day.dej, day.din]) {
      const tokens = meal.toLowerCase().split(/[\s,;.+/()\-]+/).map((t) => t.trim()).filter(Boolean);
      const seen = new Set<string>();
      for (const t of tokens) {
        if (seen.has(t)) continue;
        seen.add(t);
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  }
  const grouped: { name: string; items: { item: string; count: number }[] }[] = [];
  const usedTokens = new Set<string>();
  for (const cat of SHOPPING_CATS) {
    const items: { item: string; count: number }[] = [];
    for (const kw of cat.keywords) {
      const hit = counts.get(kw);
      if (hit && !usedTokens.has(kw)) {
        items.push({ item: kw, count: hit });
        usedTokens.add(kw);
      }
    }
    if (items.length) grouped.push({ name: cat.name, items: items.sort((a, b) => b.count - a.count) });
  }
  return grouped;
}

function ShoppingListModal({ menu, onClose }: { menu: { day: string; pdj: string; dej: string; din: string }[]; onClose: () => void }) {
  const groups = useMemo(() => buildShoppingList(menu), [menu]);
  const [copied, setCopied] = useState(false);
  const text = groups.map((g) => `${g.name}\n` + g.items.map((it) => `  • ${it.item}${it.count > 1 ? ` ×${it.count}` : ''}`).join('\n')).join('\n\n');
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Liste de courses</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-4 space-y-4">
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun ingrédient identifié.</p>
          ) : groups.map((g) => (
            <div key={g.name}>
              <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">{g.name}</h4>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li key={it.item} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-800 capitalize">{it.item}</span>
                    {it.count > 1 && <span className="text-xs text-gray-500">×{it.count}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">Fermer</button>
          <button onClick={copy} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium">
            {copied ? <><Check className="w-4 h-4" /> Copié</> : <><Copy className="w-4 h-4" /> Copier</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MenusTab({ profile }: { profile: NutritionProfile }) {
  const list = MENUS[profile.goal] ?? MENUS['Équilibre général'];
  const [showShopping, setShowShopping] = useState(false);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-emerald-500">
        <p className="text-sm text-gray-700">
          Menu hebdomadaire pour : <strong>{profile.goal}</strong>
          {profile.diet && profile.diet !== 'Omnivore' ? ` · ${profile.diet}` : ''}
        </p>
        <p className="text-xs text-gray-500 mt-1">Recettes inspirées de produits locaux (Bénin, Côte d'Ivoire, Afrique de l'Ouest) et de saison.</p>
      </div>
      <button
        onClick={() => setShowShopping(true)}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
      >
        <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
        <div className="flex-1 text-left">
          <p className="font-semibold">Générer ma liste de courses</p>
          <p className="text-xs text-white/80">Ingrédients de la semaine, regroupés par catégorie</p>
        </div>
      </button>
      <AnimatePresence>{showShopping && <ShoppingListModal menu={list} onClose={() => setShowShopping(false)} />}</AnimatePresence>
      {list.map((m) => (
        <div key={m.day} className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-600" /> {m.day}
          </h4>
          <ul className="text-sm text-gray-700 space-y-1.5">
            <li><span className="font-medium">Petit-déjeuner :</span> {m.pdj}</li>
            <li><span className="font-medium">Déjeuner :</span> {m.dej}</li>
            <li><span className="font-medium">Dîner :</span> {m.din}</li>
          </ul>
        </div>
      ))}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Stat({ icon: Icon, color, label, value, sub }: { icon: any; color: string; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <Icon className={`w-5 h-5 text-${color}-500`} />
      <p className="text-xs text-gray-500 mt-2">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
