import { useEffect, useState } from 'react';

const KEY = 'fitnessflow:state:v1';

export type Goal = 'lose' | 'gain' | 'tone' | 'health' | 'perf';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'f' | 'm' | 'na';
export type Place = 'home' | 'gym' | 'both';

export type Profile = {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  minutesPerDay: number;
  place: Place;
  equipment: string[];
  constraints: string[];
  diet: string[];
  allergies: string[];
};

export type LoggedSet = { reps: number; weightKg?: number; rpe?: number };
export type LoggedExercise = { exerciseId: string; sets: LoggedSet[] };
export type WorkoutLog = {
  id: string;
  date: string;
  programId?: string;
  dayIndex?: number;
  durationMin: number;
  rpe?: number;
  exercises: LoggedExercise[];
  notes?: string;
};

export type FoodEntry = {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: string;
  grams: number;
};

export type DailyMetrics = {
  date: string;
  waterMl: number;
  steps: number;
  sleepH?: number;
  moodStress?: number;
  weightKg?: number;
};

export type State = {
  onboarded: boolean;
  profile: Profile | null;
  activeProgramId: string | null;
  programStartDate: string | null;
  workouts: WorkoutLog[];
  foods: FoodEntry[];
  metrics: Record<string, DailyMetrics>;
  favorites: string[];
  streak: number;
  xp: number;
  badges: string[];
  lastActiveDate?: string;
};

const initial: State = {
  onboarded: false,
  profile: null,
  activeProgramId: null,
  programStartDate: null,
  workouts: [],
  foods: [],
  metrics: {},
  favorites: [],
  streak: 0,
  xp: 0,
  badges: [],
};

let listeners: Array<(s: State) => void> = [];
let current: State = load();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function save(s: State) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getState() { return current; }

export function setState(updater: (s: State) => State) {
  current = updater(current);
  save(current);
  listeners.forEach((l) => l(current));
}

export function useStore<T>(selector: (s: State) => T): T {
  const [v, setV] = useState<T>(() => selector(current));
  useEffect(() => {
    const l = (s: State) => setV(selector(s));
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return v;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function ensureToday(): DailyMetrics {
  const k = todayKey();
  const m = current.metrics[k];
  if (m) return m;
  const fresh: DailyMetrics = { date: k, waterMl: 0, steps: 0 };
  setState((s) => ({ ...s, metrics: { ...s.metrics, [k]: fresh } }));
  return fresh;
}

export function bumpStreakOnActivity() {
  const today = todayKey();
  const last = current.lastActiveDate;
  if (last === today) return;
  let streak = current.streak;
  if (last) {
    const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
  } else streak = 1;
  setState((s) => ({ ...s, streak, lastActiveDate: today }));
}

export function addXP(n: number) {
  setState((s) => ({ ...s, xp: s.xp + n }));
}

export function bmr(p: Profile): number {
  const w = p.weightKg, h = p.heightCm, a = p.age;
  if (p.sex === 'm') return 10 * w + 6.25 * h - 5 * a + 5;
  if (p.sex === 'f') return 10 * w + 6.25 * h - 5 * a - 161;
  return 10 * w + 6.25 * h - 5 * a - 78;
}

export function tdee(p: Profile): number {
  const factor = 1.2 + Math.min(0.6, (p.daysPerWeek * p.minutesPerDay) / 600);
  let kcal = bmr(p) * factor;
  if (p.goal === 'lose') kcal -= 400;
  if (p.goal === 'gain') kcal += 350;
  return Math.round(kcal);
}

export function macroTargets(p: Profile) {
  const kcal = tdee(p);
  const protein = Math.round(p.weightKg * (p.goal === 'gain' ? 2 : 1.8));
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs };
}

export function dailyTargets(p: Profile) {
  return {
    ...macroTargets(p),
    waterMl: Math.round(p.weightKg * 35),
    steps: 8000,
    sleepH: 8,
  };
}
