import { RobotCosmetics } from '../game/types';

export interface LevelProgress {
  unlocked: boolean;
  stars: number;
  highScore: number;
  bestSteps: number;
  bestCommands: number;
}

export interface PlayerProfile {
  nickname: string;
  crystals: number;
  unlockedLevels: number[]; // level IDs
  levelProgress: Record<number, LevelProgress>;
  unlockedCosmetics: {
    colors: string[];
    accessories: string[];
    trails: string[];
  };
  equippedCosmetics: RobotCosmetics;
  unlockedAchievements: string[];
  customPuzzles: any[];
  dailyCompletedDates: string[];
}

const STORAGE_KEY = 'roboquest_player_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  nickname: 'Commander Bot',
  crystals: 150,
  unlockedLevels: [1],
  levelProgress: {
    1: { unlocked: true, stars: 0, highScore: 0, bestSteps: 0, bestCommands: 0 },
  },
  unlockedCosmetics: {
    colors: ['electric-blue', 'neon-green'],
    accessories: ['none', 'antenna'],
    trails: ['none', 'sparkle'],
  },
  equippedCosmetics: {
    color: 'electric-blue',
    accessory: 'antenna',
    trail: 'sparkle',
  },
  unlockedAchievements: [],
  customPuzzles: [],
  dailyCompletedDates: [],
};

class StorageService {
  private profile: PlayerProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): PlayerProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
      }
    } catch (e) {}
    return DEFAULT_PROFILE;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {}
  }

  getProfile(): PlayerProfile {
    return this.profile;
  }

  setNickname(nick: string) {
    this.profile.nickname = nick.trim() || 'Commander Bot';
    this.save();
  }

  addCrystals(amount: number) {
    this.profile.crystals += amount;
    this.save();
  }

  spendCrystals(amount: number): boolean {
    if (this.profile.crystals >= amount) {
      this.profile.crystals -= amount;
      this.save();
      return true;
    }
    return false;
  }

  recordLevelComplete(
    levelId: number,
    stars: number,
    score: number,
    steps: number,
    commands: number
  ) {
    const existing = this.profile.levelProgress[levelId] || {
      unlocked: true,
      stars: 0,
      highScore: 0,
      bestSteps: 999,
      bestCommands: 999,
    };

    const newProgress: LevelProgress = {
      unlocked: true,
      stars: Math.max(existing.stars, stars),
      highScore: Math.max(existing.highScore, score),
      bestSteps: existing.bestSteps === 0 ? steps : Math.min(existing.bestSteps, steps),
      bestCommands: existing.bestCommands === 0 ? commands : Math.min(existing.bestCommands, commands),
    };

    this.profile.levelProgress[levelId] = newProgress;

    // Unlock next level if levelId < 10
    const nextId = levelId + 1;
    if (nextId <= 10 && !this.profile.unlockedLevels.includes(nextId)) {
      this.profile.unlockedLevels.push(nextId);
      if (!this.profile.levelProgress[nextId]) {
        this.profile.levelProgress[nextId] = {
          unlocked: true,
          stars: 0,
          highScore: 0,
          bestSteps: 0,
          bestCommands: 0,
        };
      }
    }

    // Reward crystals
    this.profile.crystals += stars * 50;
    this.save();
  }

  unlockAchievement(id: string): boolean {
    if (!this.profile.unlockedAchievements.includes(id)) {
      this.profile.unlockedAchievements.push(id);
      this.profile.crystals += 100;
      this.save();
      return true;
    }
    return false;
  }

  unlockCosmetic(category: 'colors' | 'accessories' | 'trails', item: string) {
    if (!this.profile.unlockedCosmetics[category].includes(item)) {
      this.profile.unlockedCosmetics[category].push(item);
      this.save();
    }
  }

  equipCosmetic(cosmetics: RobotCosmetics) {
    this.profile.equippedCosmetics = cosmetics;
    this.save();
  }

  resetAll() {
    this.profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    this.save();
  }
}

export const storage = new StorageService();
