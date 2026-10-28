import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/stores/gameStore';

describe('Level transitions and victory checks', () => {
  beforeEach(() => {
    useGameStore.getState().loadLevel(1);
  });

  it('progresses from level 1 through 10', () => {
    for (let id = 1; id <= 10; id++) {
      useGameStore.getState().loadLevel(id);
      expect(useGameStore.getState().currentLevelId).toBe(id);
      expect(useGameStore.getState().currentLevel.id).toBe(id);
    }
  });

  it('nextLevel advances from level 5 to level 6', () => {
    useGameStore.getState().loadLevel(5);
    expect(useGameStore.getState().currentLevelId).toBe(5);
    useGameStore.getState().nextLevel();
    expect(useGameStore.getState().currentLevelId).toBe(6);
    expect(useGameStore.getState().currentLevel.title).toBe('Laser Lab');
  });

  it('nextLevel advances through all 10 levels and stops at 10', () => {
    useGameStore.getState().loadLevel(1);
    for (let i = 1; i < 10; i++) {
      expect(useGameStore.getState().currentLevelId).toBe(i);
      useGameStore.getState().nextLevel();
    }
    expect(useGameStore.getState().currentLevelId).toBe(10);
    // At level 10, nextLevel should not advance past 10
    useGameStore.getState().nextLevel();
    expect(useGameStore.getState().currentLevelId).toBe(10);
  });
});
