import type { LucideIcon } from 'lucide-react';
import { Palette, Puzzle, Leaf, Gamepad2, BookOpen, Music, PawPrint, Rocket, Wand2, Home, Sparkles, Brain, Drama, Joystick } from 'lucide-react';
import { HappyImage } from './images';

export type GameCategory = 'creatif' | 'puzzle' | 'zen' | 'arcade' | 'narratif' | 'musique' | 'cosy';

export interface Game {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  category: GameCategory;
  duration: string;
  intensity: 1 | 2 | 3;
  hero: HappyImage;
  cover: HappyImage;
  accent: string;
  playable: boolean;
  featured?: boolean;
  icon: LucideIcon;
}

export const CATEGORIES: { id: GameCategory; label: string; icon: LucideIcon }[] = [
  { id: 'creatif', label: 'Créatif', icon: Palette },
  { id: 'puzzle', label: 'Puzzle', icon: Puzzle },
  { id: 'zen', label: 'Zen', icon: Leaf },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
  { id: 'narratif', label: 'Narratif', icon: BookOpen },
  { id: 'musique', label: 'Musique', icon: Music },
  { id: 'cosy', label: 'Cosy', icon: PawPrint },
];

export const GAMES: Game[] = [
  {
    id: 'zengarden', name: 'ZenGarden', tagline: 'Crée ton jardin japonais',
    desc: 'Ratisse le sable, place des pierres et bambous, compose un espace qui apaise.',
    category: 'zen', duration: '5–15 min', intensity: 1, hero: 'zenSandStones', cover: 'zenLines',
    accent: 'from-emerald-500 to-teal-700', playable: true, featured: true, icon: Leaf,
  },
  {
    id: 'puzzle', name: 'Puzzle Évasion', tagline: 'Recompose des paysages du monde',
    desc: 'Du Bénin au Maroc, recompose des images apaisantes en 12, 24 ou 48 pièces.',
    category: 'puzzle', duration: '3–10 min', intensity: 2, hero: 'puzzleWhite', cover: 'puzzleBowls',
    accent: 'from-blue-500 to-indigo-700', playable: true, featured: true, icon: Puzzle,
  },
  {
    id: 'skyrunner', name: 'SkyRunner', tagline: 'Le coureur du ciel',
    desc: 'Cours sur des plateformes célestes, esquive les obstacles, traverse les aurores.',
    category: 'arcade', duration: '2–5 min', intensity: 3, hero: 'starsClouds', cover: 'bigStar',
    accent: 'from-fuchsia-500 to-purple-700', playable: true, featured: true, icon: Rocket,
  },
  {
    id: 'colormind', name: 'ColorMind', tagline: 'Le Jardin des Couleurs',
    desc: 'Coloriage interactif de mandalas, paysages zen, animaux fantastiques.',
    category: 'creatif', duration: '5–20 min', intensity: 1, hero: 'kaleidoStar', cover: 'mandalaCircle',
    accent: 'from-pink-500 to-rose-600', playable: false, icon: Palette,
  },
  {
    id: 'minimix', name: 'MiniMix', tagline: 'Crée ton ambiance sonore',
    desc: 'Mixe pluie, cloche, piano, vent, synthé. Sauvegarde tes ambiances.',
    category: 'musique', duration: '5–30 min', intensity: 1, hero: 'scarfHeadphones', cover: 'parkMusic',
    accent: 'from-cyan-500 to-sky-700', playable: false, icon: Music,
  },
  {
    id: 'dreamstory', name: 'DreamStory', tagline: 'Ton histoire change selon tes choix',
    desc: 'Univers fantasy, comédie, romance — chaque décision change la suite.',
    category: 'narratif', duration: '10–30 min', intensity: 2, hero: 'storyShelf', cover: 'storyStack',
    accent: 'from-amber-500 to-orange-700', playable: false, icon: Wand2,
  },
  {
    id: 'mylittleworld', name: 'MyLittleWorld', tagline: 'Le village que tu construis',
    desc: 'Construis ton village, ajoute arbres, animaux, rivières — gagne des décors.',
    category: 'cosy', duration: '5–60 min', intensity: 1, hero: 'villageThatch', cover: 'villageHouses',
    accent: 'from-lime-500 to-emerald-600', playable: false, icon: Home,
  },
  {
    id: 'stardrop', name: 'StarDrop', tagline: 'Les étoiles tombantes',
    desc: 'Attrape des étoiles qui tombent, crée des constellations, débloque des galaxies.',
    category: 'arcade', duration: '2–5 min', intensity: 2, hero: 'starSky', cover: 'nebulaHeart',
    accent: 'from-violet-500 to-purple-700', playable: false, icon: Sparkles,
  },
  {
    id: 'bubblepop', name: 'Bubble Pop', tagline: 'Détend-toi en faisant éclater',
    desc: 'Combos de couleurs, sons apaisants, mode infini.',
    category: 'arcade', duration: '2–10 min', intensity: 2, hero: 'bubbleOrange', cover: 'bubbleSwirl',
    accent: 'from-orange-500 to-pink-600', playable: false, icon: Sparkles,
  },
  {
    id: 'brainsoft', name: 'BrainSoft', tagline: 'Petites énigmes zen',
    desc: 'Différences, rébus, quiz culture, défis visuels — sans pression.',
    category: 'puzzle', duration: '3–10 min', intensity: 2, hero: 'kaleidoFlower', cover: 'kaleidoSym',
    accent: 'from-indigo-500 to-blue-700', playable: false, icon: Brain,
  },
  {
    id: 'avatarfun', name: 'Avatar Fun', tagline: 'Crée ton personnage',
    desc: 'Choisis vêtements, coiffure, accessoires. Partage ton avatar.',
    category: 'creatif', duration: '5–15 min', intensity: 1, hero: 'manDreads', cover: 'manDenim',
    accent: 'from-rose-500 to-fuchsia-600', playable: false, icon: Drama,
  },
  {
    id: 'arcade', name: 'Mini-Arcade', tagline: 'Snake, 2048, Memory…',
    desc: 'Une collection de petits jeux rétro à dégainer entre deux pauses.',
    category: 'arcade', duration: '2–10 min', intensity: 2, hero: 'arcadeNeon', cover: 'arcadeMachine',
    accent: 'from-yellow-500 to-red-600', playable: false, icon: Joystick,
  },
];

export const COLLECTIONS = [
  { id: 'top3', label: 'Top 3 pour démarrer', games: ['zengarden', 'puzzle', 'skyrunner'] },
  { id: 'detente', label: '5 minutes pour souffler', games: ['zengarden', 'bubblepop', 'stardrop'] },
  { id: 'creatif', label: 'Mon côté créatif', games: ['colormind', 'avatarfun', 'mylittleworld'] },
  { id: 'evasion', label: 'M\'évader par l\'imaginaire', games: ['dreamstory', 'minimix', 'skyrunner'] },
];
