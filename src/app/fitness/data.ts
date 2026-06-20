export type Exercise = {
  id: string;
  name: string;
  group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'fullbody' | 'cardio' | 'mobility';
  equipment: 'bodyweight' | 'dumbbell' | 'band' | 'machine' | 'barbell' | 'mat';
  difficulty: 1 | 2 | 3;
  cues: string[];
  errors: string[];
  reps?: string;
  durationSec?: number;
};

export const exercises: Exercise[] = [
  { id: 'squat', name: 'Squat poids du corps', group: 'legs', equipment: 'bodyweight', difficulty: 1, reps: '12', cues: ['Pieds largeur épaules', 'Genoux dans l’axe', 'Dos droit'], errors: ['Talons qui décollent', 'Genoux qui rentrent'] },
  { id: 'pushup', name: 'Pompes', group: 'chest', equipment: 'bodyweight', difficulty: 2, reps: '10', cues: ['Gainage', 'Coudes ~45°', 'Descente contrôlée'], errors: ['Bassin qui tombe', 'Coudes trop écartés'] },
  { id: 'plank', name: 'Planche', group: 'core', equipment: 'mat', difficulty: 1, durationSec: 40, cues: ['Corps aligné', 'Abdos serrés', 'Respiration calme'], errors: ['Lombaires creuses'] },
  { id: 'lunge', name: 'Fentes alternées', group: 'legs', equipment: 'bodyweight', difficulty: 2, reps: '10/jambe', cues: ['Genou avant à 90°', 'Buste droit'], errors: ['Genou qui dépasse le pied'] },
  { id: 'glute-bridge', name: 'Pont fessier', group: 'legs', equipment: 'mat', difficulty: 1, reps: '15', cues: ['Pieds proches', 'Pousse les hanches', 'Serre les fessiers'], errors: ['Cambrer le bas du dos'] },
  { id: 'mountain-climber', name: 'Mountain climbers', group: 'cardio', equipment: 'bodyweight', difficulty: 2, durationSec: 30, cues: ['Hanches basses', 'Rythme régulier'], errors: ['Épaules qui montent'] },
  { id: 'burpee', name: 'Burpees', group: 'fullbody', equipment: 'bodyweight', difficulty: 3, reps: '8', cues: ['Saut explosif', 'Pompe contrôlée'], errors: ['Réception genoux raides'] },
  { id: 'row-band', name: 'Tirage élastique', group: 'back', equipment: 'band', difficulty: 1, reps: '12', cues: ['Tire les coudes derrière', 'Serre les omoplates'], errors: ['Hausser les épaules'] },
  { id: 'shoulder-press', name: 'Développé épaules haltères', group: 'shoulders', equipment: 'dumbbell', difficulty: 2, reps: '10', cues: ['Coudes sous les poignets', 'Gainer le tronc'], errors: ['Cambrer le dos'] },
  { id: 'biceps-curl', name: 'Curl biceps', group: 'arms', equipment: 'dumbbell', difficulty: 1, reps: '12', cues: ['Coudes fixes', 'Contrôle la descente'], errors: ['Balancer le buste'] },
  { id: 'dead-bug', name: 'Dead bug', group: 'core', equipment: 'mat', difficulty: 1, reps: '10/côté', cues: ['Bas du dos plaqué', 'Mouvements opposés'], errors: ['Cambrer'] },
  { id: 'jumping-jacks', name: 'Jumping jacks', group: 'cardio', equipment: 'bodyweight', difficulty: 1, durationSec: 45, cues: ['Réception souple'], errors: ['Genoux raides'] },
  { id: 'hip-flow', name: 'Mobilité hanches', group: 'mobility', equipment: 'mat', difficulty: 1, durationSec: 60, cues: ['Respire profondément', 'Lent et contrôlé'], errors: [] },
  { id: 'cat-cow', name: 'Chat-vache', group: 'mobility', equipment: 'mat', difficulty: 1, durationSec: 45, cues: ['Synchronise avec la respiration'], errors: [] },
];

export type ProgramDay = {
  name: string;
  blocks: { type: 'warmup' | 'main' | 'finisher' | 'cooldown'; exercises: { id: string; sets?: number; reps?: string; durationSec?: number; restSec: number }[] }[];
};

export type Program = {
  id: string;
  title: string;
  goal: string;
  weeks: number;
  daysPerWeek: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  days: ProgramDay[];
};

export const programs: Program[] = [
  {
    id: 'home-starter',
    title: 'Home Starter 4 semaines',
    goal: 'Remise en forme générale',
    weeks: 4,
    daysPerWeek: 3,
    level: 'beginner',
    description: 'Programme maison sans matériel pour reprendre en douceur.',
    days: [
      {
        name: 'Full Body A',
        blocks: [
          { type: 'warmup', exercises: [{ id: 'cat-cow', durationSec: 45, restSec: 15 }, { id: 'jumping-jacks', durationSec: 45, restSec: 15 }] },
          { type: 'main', exercises: [
            { id: 'squat', sets: 3, reps: '12', restSec: 45 },
            { id: 'pushup', sets: 3, reps: '8-10', restSec: 60 },
            { id: 'glute-bridge', sets: 3, reps: '15', restSec: 45 },
            { id: 'row-band', sets: 3, reps: '12', restSec: 45 },
          ] },
          { type: 'finisher', exercises: [{ id: 'mountain-climber', durationSec: 30, restSec: 30 }, { id: 'plank', durationSec: 30, restSec: 30 }] },
          { type: 'cooldown', exercises: [{ id: 'hip-flow', durationSec: 60, restSec: 0 }] },
        ],
      },
      {
        name: 'Full Body B',
        blocks: [
          { type: 'warmup', exercises: [{ id: 'jumping-jacks', durationSec: 45, restSec: 15 }] },
          { type: 'main', exercises: [
            { id: 'lunge', sets: 3, reps: '10/jambe', restSec: 45 },
            { id: 'shoulder-press', sets: 3, reps: '10', restSec: 60 },
            { id: 'dead-bug', sets: 3, reps: '10/côté', restSec: 30 },
            { id: 'biceps-curl', sets: 3, reps: '12', restSec: 45 },
          ] },
          { type: 'finisher', exercises: [{ id: 'burpee', sets: 3, reps: '8', restSec: 45 }] },
          { type: 'cooldown', exercises: [{ id: 'cat-cow', durationSec: 60, restSec: 0 }] },
        ],
      },
      {
        name: 'Mobilité & Core',
        blocks: [
          { type: 'warmup', exercises: [{ id: 'cat-cow', durationSec: 45, restSec: 15 }] },
          { type: 'main', exercises: [
            { id: 'plank', sets: 3, durationSec: 40, restSec: 30 },
            { id: 'dead-bug', sets: 3, reps: '12/côté', restSec: 30 },
            { id: 'glute-bridge', sets: 3, reps: '15', restSec: 30 },
          ] },
          { type: 'cooldown', exercises: [{ id: 'hip-flow', durationSec: 90, restSec: 0 }] },
        ],
      },
    ],
  },
  {
    id: 'fat-loss-6',
    title: 'Fat Loss HIIT 6 semaines',
    goal: 'Perte de poids',
    weeks: 6,
    daysPerWeek: 4,
    level: 'intermediate',
    description: 'Cardio + circuits pour brûler des calories.',
    days: [
      {
        name: 'HIIT Full Body',
        blocks: [
          { type: 'warmup', exercises: [{ id: 'jumping-jacks', durationSec: 45, restSec: 15 }] },
          { type: 'main', exercises: [
            { id: 'burpee', sets: 4, reps: '10', restSec: 30 },
            { id: 'mountain-climber', sets: 4, durationSec: 40, restSec: 20 },
            { id: 'squat', sets: 4, reps: '15', restSec: 30 },
            { id: 'pushup', sets: 4, reps: '10', restSec: 30 },
          ] },
          { type: 'cooldown', exercises: [{ id: 'cat-cow', durationSec: 60, restSec: 0 }] },
        ],
      },
    ],
  },
];

export type Food = { id: string; name: string; per100: { kcal: number; protein: number; carbs: number; fat: number } };

export const foods: Food[] = [
  { id: 'chicken', name: 'Poulet (filet)', per100: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { id: 'rice', name: 'Riz blanc cuit', per100: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: 'oat', name: 'Flocons d’avoine', per100: { kcal: 389, protein: 16.9, carbs: 66, fat: 6.9 } },
  { id: 'egg', name: 'Œuf', per100: { kcal: 155, protein: 13, carbs: 1.1, fat: 11 } },
  { id: 'banana', name: 'Banane', per100: { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
  { id: 'salmon', name: 'Saumon', per100: { kcal: 208, protein: 20, carbs: 0, fat: 13 } },
  { id: 'broccoli', name: 'Brocoli', per100: { kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 } },
  { id: 'almond', name: 'Amandes', per100: { kcal: 579, protein: 21, carbs: 22, fat: 50 } },
  { id: 'yogurt', name: 'Yaourt nature', per100: { kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 } },
  { id: 'tofu', name: 'Tofu', per100: { kcal: 144, protein: 17, carbs: 2.8, fat: 9 } },
  { id: 'sweet-potato', name: 'Patate douce', per100: { kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { id: 'avocado', name: 'Avocat', per100: { kcal: 160, protein: 2, carbs: 9, fat: 15 } },
  { id: 'lentils', name: 'Lentilles cuites', per100: { kcal: 116, protein: 9, carbs: 20, fat: 0.4 } },
  { id: 'apple', name: 'Pomme', per100: { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 } },
];

export type RecipeIngredient = { foodId: string; grams: number };
export type Recipe = {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  tags: string[];
  steps: string[];
  ingredients: RecipeIngredient[];
};

export const recipes: Recipe[] = [
  {
    id: 'bowl-poulet',
    title: 'Bowl poulet riz brocoli',
    minutes: 25,
    servings: 1,
    tags: ['high-protein', 'meal-prep'],
    steps: ['Cuire le riz', 'Saisir le poulet', 'Vapeur brocoli', 'Assembler & assaisonner'],
    ingredients: [{ foodId: 'chicken', grams: 150 }, { foodId: 'rice', grams: 150 }, { foodId: 'broccoli', grams: 120 }],
  },
  {
    id: 'porridge',
    title: 'Porridge banane amandes',
    minutes: 8,
    servings: 1,
    tags: ['breakfast', 'fibres'],
    steps: ['Chauffer flocons + lait', 'Ajouter banane et amandes'],
    ingredients: [{ foodId: 'oat', grams: 60 }, { foodId: 'banana', grams: 100 }, { foodId: 'almond', grams: 15 }],
  },
  {
    id: 'saumon-patate',
    title: 'Saumon, patate douce, avocat',
    minutes: 30,
    servings: 1,
    tags: ['omega-3', 'dîner'],
    steps: ['Cuire patate douce au four', 'Saisir saumon', 'Trancher avocat'],
    ingredients: [{ foodId: 'salmon', grams: 130 }, { foodId: 'sweet-potato', grams: 200 }, { foodId: 'avocado', grams: 80 }],
  },
];

export const challenges = [
  { id: 'water-7', title: '7 jours hydratation', description: 'Atteins ton objectif eau 7 jours d’affilée', xp: 150 },
  { id: 'workout-12', title: '12 séances en 30 jours', description: 'Reste régulier sur un mois', xp: 400 },
  { id: 'steps-10k', title: '10k pas × 5', description: '5 jours à 10 000 pas', xp: 200 },
];
