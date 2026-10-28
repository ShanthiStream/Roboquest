import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/stores/gameStore';
import { GameEngine } from '../src/game/engine/GameEngine';
import { LEVELS } from '../src/game/levels/levelData';
import { NeedleAdapter } from '../src/ai/adapters/NeedleAdapter';
import { aiManager } from '../src/ai/AIAdapterManager';

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

  it('suggested "go to the exit" on Level 1 initial board moves 4 steps right to the portal with 92% energy and high confidence', async () => {
    const level1 = LEVELS[0];
    const engine = new GameEngine(level1);

    // Simulate active NeedleAdapter where raw WASM model returns ungrounded 1-step move with low confidence
    const needle = new NeedleAdapter();
    needle.status = 'ready';
    (needle as any).needleSession = {
      generate: async () => ({
        toolCalls: [{ toolName: 'move', input: {} }],
        confidence: 0.35,
      }),
    };

    const res = await needle.parseCommand('go to the exit', engine.toGameContext());
    expect(res.success).toBe(true);
    expect(res.actions).toHaveLength(1);
    expect(res.actions[0]).toMatchObject({
      type: 'move',
      direction: 'right',
      steps: 4,
    });
    expect(res.confidence).toBeGreaterThanOrEqual(0.92);
    expect(res.actions[0].confidence).toBeGreaterThanOrEqual(0.92);

    await engine.executeActions(res.actions, undefined, 0);
    const snap = engine.getSnapshot();
    expect(snap.status).toBe('won');
    expect(snap.robot.x).toBe(5);
    expect(snap.robot.y).toBe(3);
    expect(snap.robot.energy).toBe(92);
  });

  it('supports Undo Last Step restoring 100% energy followed by "move forward 4 steps" reaching portal with 92% energy', async () => {
    const level1 = LEVELS[0];
    const engine = new GameEngine(level1);

    // Move 1 step right (98% energy)
    await engine.executeActions([{ type: 'move', direction: 'right', steps: 1 }], undefined, 0);
    expect(engine.getSnapshot().robot.energy).toBe(98);
    expect(engine.getSnapshot().status).toBe('playing');

    // Undo restores 100% energy and start position
    expect(engine.undo()).toBe(true);
    expect(engine.getSnapshot().robot.energy).toBe(100);
    expect(engine.getSnapshot().robot.x).toBe(1);

    // Enter "move forward 4 steps"
    const res = await aiManager.parseCommand('move forward 4 steps', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);

    const finalSnap = engine.getSnapshot();
    expect(finalSnap.status).toBe('won');
    expect(finalSnap.robot.energy).toBe(92);
  });
});
