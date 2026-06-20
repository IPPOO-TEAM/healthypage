import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Search, Plus, X, Trash2, ChefHat, Clock, Coffee, Soup, UtensilsCrossed, Cookie } from 'lucide-react';
import { foods, recipes, type Food } from '../data';
import { dailyTargets, setState, todayKey, useStore, type FoodEntry } from '../store';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

const recipeImages: Record<string, string> = {
  default0: 'https://images.unsplash.com/photo-1693333853046-22bc4d920eeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  default1: 'https://images.unsplash.com/photo-1615865417491-9941019fbc00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  default2: 'https://images.unsplash.com/photo-1666819691716-827f78d892f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  default3: 'https://images.unsplash.com/photo-1759303841002-fb871cc0fcb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
};
function recipeImg(i: number) {
  return recipeImages[`default${i % 4}`];
}

type Tab = 'log' | 'recipes' | 'plan';
type Meal = FoodEntry['meal'];

export function Nutrition() {
  const [tab, setTab] = useState<Tab>('log');
  return (
    <div className="pb-28">
      <header className="px-5 pt-12 pb-4">
        <h1 className="tracking-tight" style={{ fontSize: 28, fontWeight: 800 }}>Nutrition</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Suis tes repas, calories et macros.</p>
      </header>
      <div className="px-5">
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 text-sm">
          {(['log', 'recipes', 'plan'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 h-10 rounded-xl font-medium ${tab === t ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600' : 'text-slate-500'}`}>
              {t === 'log' ? 'Journal' : t === 'recipes' ? 'Recettes' : 'Plan'}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 mt-5">
        {tab === 'log' && <FoodLog />}
        {tab === 'recipes' && <Recipes />}
        {tab === 'plan' && <Plan />}
      </div>
    </div>
  );
}

function FoodLog() {
  const profile = useStore((s) => s.profile)!;
  const entries = useStore((s) => s.foods.filter((f) => f.date === todayKey()));
  const [adding, setAdding] = useState<Meal | null>(null);
  const targets = dailyTargets(profile);

  const totals = useMemo(() => {
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    for (const e of entries) {
      const f = foods.find((x) => x.id === e.foodId);
      if (!f) continue;
      const k = e.grams / 100;
      kcal += f.per100.kcal * k;
      protein += f.per100.protein * k;
      carbs += f.per100.carbs * k;
      fat += f.per100.fat * k;
    }
    return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }, [entries]);

  const remove = (id: string) => setState((s) => ({ ...s, foods: s.foods.filter((f) => f.id !== id) }));

  const meals: { id: Meal; label: string; Icon: typeof Coffee; tint: string }[] = [
    { id: 'breakfast', label: 'Petit-déjeuner', Icon: Coffee, tint: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
    { id: 'lunch', label: 'Déjeuner', Icon: Soup, tint: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300' },
    { id: 'dinner', label: 'Dîner', Icon: UtensilsCrossed, tint: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
    { id: 'snack', label: 'Collation', Icon: Cookie, tint: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 text-white p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">Calories restantes</div>
            <div className="mt-1 font-bold tracking-tight" style={{ fontSize: 36 }}>{Math.max(0, targets.kcal - totals.kcal)}</div>
            <div className="text-sm text-white/85">{totals.kcal} consommées · {targets.kcal} objectif</div>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/30 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-white" style={{ clipPath: `inset(${100 - Math.min(100, (totals.kcal / targets.kcal) * 100)}% 0 0 0)` }} />
            <span className="font-bold relative">{Math.round((totals.kcal / targets.kcal) * 100)}%</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Macro label="Protéines" cur={totals.protein} target={targets.protein} color="bg-white/20" />
          <Macro label="Glucides" cur={totals.carbs} target={targets.carbs} color="bg-white/20" />
          <Macro label="Lipides" cur={totals.fat} target={targets.fat} color="bg-white/20" />
        </div>
      </div>

      {meals.map((m) => {
        const list = entries.filter((e) => e.meal === m.id);
        const k = list.reduce((s, e) => {
          const f = foods.find((x) => x.id === e.foodId); return s + (f ? (f.per100.kcal * e.grams) / 100 : 0);
        }, 0);
        return (
          <div key={m.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.tint}`}>
                  <m.Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-xs text-slate-500">{Math.round(k)} kcal</div>
                </div>
              </div>
              <button onClick={() => setAdding(m.id)} className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Plus className="w-5 h-5" /></button>
            </div>
            {list.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((e) => {
                  const f = foods.find((x) => x.id === e.foodId);
                  if (!f) return null;
                  return (
                    <div key={e.id} className="px-4 py-2.5 flex justify-between items-center text-sm">
                      <div>
                        <div>{f.name}</div>
                        <div className="text-xs text-slate-500">{e.grams} g · {Math.round((f.per100.kcal * e.grams) / 100)} kcal</div>
                      </div>
                      <button onClick={() => remove(e.id)} className="p-2 text-slate-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>{adding && <AddFoodSheet meal={adding} onClose={() => setAdding(null)} />}</AnimatePresence>
    </div>
  );
}

function Macro({ label, cur, target, color }: { label: string; cur: number; target: number; color: string }) {
  const pct = Math.min(100, (cur / target) * 100);
  return (
    <div>
      <div className="text-xs text-white/85">{label}</div>
      <div className="font-semibold">{cur} / {target}g</div>
      <div className={`mt-1 h-1 ${color} rounded-full overflow-hidden`}>
        <div className="h-full bg-white" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AddFoodSheet({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);

  const list = foods.filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()));

  const add = () => {
    if (!pick) return;
    const entry: FoodEntry = { id: `f-${Date.now()}`, date: todayKey(), meal, foodId: pick.id, grams };
    setState((s) => ({ ...s, foods: [...s.foods, entry] }));
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-h-[85vh] bg-white dark:bg-slate-950 rounded-t-3xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold">Ajouter un aliment</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {!pick ? (
          <>
            <div className="p-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher" className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 divide-y divide-slate-100 dark:divide-slate-800">
              {list.map((f) => (
                <button key={f.id} onClick={() => setPick(f)} className="w-full text-left py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{f.name}</div>
                    <div className="text-xs text-slate-500">P {f.per100.protein}g · G {f.per100.carbs}g · L {f.per100.fat}g</div>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{f.per100.kcal} kcal/100g</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="p-5">
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-4">
              <div className="font-semibold">{pick.name}</div>
              <div className="text-xs text-slate-500">{pick.per100.kcal} kcal / 100g</div>
            </div>
            <div className="mt-5">
              <div className="text-xs text-slate-500 mb-2">Quantité (g)</div>
              <input type="number" value={grams} onChange={(e) => setGrams(Math.max(1, +e.target.value || 0))} className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-900" />
              <div className="mt-3 flex gap-2">
                {[50, 100, 150, 200, 250].map((v) => <button key={v} onClick={() => setGrams(v)} className="px-3 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">{v}g</button>)}
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                <div><div className="font-bold">{Math.round((pick.per100.kcal * grams) / 100)}</div><div className="text-slate-500">kcal</div></div>
                <div><div className="font-bold">{Math.round((pick.per100.protein * grams) / 100)}g</div><div className="text-slate-500">protéines</div></div>
                <div><div className="font-bold">{Math.round((pick.per100.carbs * grams) / 100)}g</div><div className="text-slate-500">glucides</div></div>
                <div><div className="font-bold">{Math.round((pick.per100.fat * grams) / 100)}g</div><div className="text-slate-500">lipides</div></div>
              </div>
              <button onClick={add} className="mt-6 w-full h-12 rounded-xl bg-emerald-500 text-white font-semibold">Ajouter au repas</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Recipes() {
  return (
    <div className="space-y-3">
      {recipes.map((r, idx) => {
        const macros = r.ingredients.reduce((acc, ing) => {
          const f = foods.find((x) => x.id === ing.foodId);
          if (!f) return acc;
          const k = ing.grams / 100;
          return { kcal: acc.kcal + f.per100.kcal * k, protein: acc.protein + f.per100.protein * k };
        }, { kcal: 0, protein: 0 });
        return (
          <div key={r.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="aspect-[16/9] relative">
              <ImageWithFallback src={recipeImg(idx)} alt={r.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-orange-600 inline-flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Recette
              </div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {r.minutes} min</span>
                  <span>{Math.round(macros.kcal / r.servings)} kcal/portion</span>
                  <span>{Math.round(macros.protein / r.servings)}g prot.</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {r.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Plan() {
  const profile = useStore((s) => s.profile)!;
  const targets = dailyTargets(profile);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4">
        <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Plan suggéré</div>
        <div className="mt-1 font-semibold text-emerald-900 dark:text-emerald-100">{targets.kcal} kcal / jour · P {targets.protein}g · G {targets.carbs}g · L {targets.fat}g</div>
        <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">Adapté à ton objectif ({labelGoal(profile.goal)}) et ton activité.</p>
      </div>
      {days.map((d, i) => {
        const r = recipes[i % recipes.length];
        return (
          <div key={d} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold">{d}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{r.title}</div>
              <div className="text-xs text-slate-500">{r.minutes} min · {r.tags.join(' · ')}</div>
            </div>
            <Apple className="w-4 h-4 text-emerald-500" />
          </div>
        );
      })}
    </div>
  );
}

function labelGoal(g: string) {
  const m: Record<string, string> = { lose: 'perte de poids', gain: 'prise de muscle', tone: 'tonification', health: 'santé', perf: 'performance' };
  return m[g] || g;
}
