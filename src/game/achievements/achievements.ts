export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'exploration' | 'creation' | 'customization';
  unlocked: boolean;
  unlockedAt?: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete Level 1: Hello, Robot!',
    icon: '🚀',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'battery-collector',
    title: 'Battery Collector',
    description: 'Collect 10 energy batteries across all missions.',
    icon: '⚡',
    category: 'exploration',
    unlocked: false,
  },
  {
    id: 'maze-master',
    title: 'Maze Master',
    description: 'Navigate Level 3 maze without hitting any laboratory partitions.',
    icon: '🧭',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'perfect-navigator',
    title: 'Perfect Navigator',
    description: 'Complete any level matching or beating par steps.',
    icon: '🎯',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'energy-saver',
    title: 'Energy Saver',
    description: 'Finish a mission with 75% or higher remaining energy.',
    icon: '🔋',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'laser-dodger',
    title: 'Laser Dodger',
    description: 'Bypass all security lasers in Level 6 without taking damage.',
    icon: '🛡️',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'voice-commander',
    title: 'Voice Commander',
    description: 'Complete a level by issuing voice recognition instructions.',
    icon: '🎙️',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'logic-master',
    title: 'Logic Master',
    description: 'Solve Level 9: Robot Logic multi-stage puzzle.',
    icon: '🧠',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'zero-mistakes',
    title: 'Zero Mistakes',
    description: 'Complete a level without issuing any invalid commands.',
    icon: '⭐',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'escape-artist',
    title: 'Ultimate Escape Artist',
    description: 'Conquer all 10 story mode levels and escape the laboratory facility.',
    icon: '🏆',
    category: 'gameplay',
    unlocked: false,
  },
  {
    id: 'puzzle-architect',
    title: 'Puzzle Architect',
    description: 'Design and verify a custom level in Creative Mode.',
    icon: '📐',
    category: 'creation',
    unlocked: false,
  },
  {
    id: 'robot-stylist',
    title: 'Robot Stylist',
    description: 'Equip custom colors, accessories, or particle trails.',
    icon: '🎨',
    category: 'customization',
    unlocked: false,
  },
];
