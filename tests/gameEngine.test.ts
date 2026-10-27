import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine/GameEngine';
import { LEVELS } from '../src/game/levels/levelData';

describe('GameEngine Core Mechanics', () => {
  it('initializes level 1 correctly', () => {
    const engine = new GameEngine(LEVELS[0]);
    const snap = engine.getSnapshot();
    expect(snap.status).toBe('playing');
    expect(snap.robot.x).toBe(1);
    expect(snap.robot.y).toBe(3);
    expect(snap.robot.direction).toBe('right');
    expect(snap.robot.energy).toBe(100);
  });

  it('handles movement and energy depletion', async () => {
    const engine = new GameEngine(LEVELS[0]);
    await engine.executeActions([{ type: 'move', direction: 'right', steps: 2 }], undefined, 0);
    const snap = engine.getSnapshot();
    expect(snap.robot.x).toBe(3);
    expect(snap.robot.y).toBe(3);
    expect(snap.robot.energy).toBe(96); // 100 - (2 * 2)
  });

  it('prevents walking through walls', async () => {
    const engine = new GameEngine(LEVELS[0]);
    // Wall is at x=0
    await engine.executeActions([{ type: 'move', direction: 'left', steps: 5 }], undefined, 0);
    const snap = engine.getSnapshot();
    expect(snap.robot.x).toBe(1); // blocked by perimeter wall at x=0
  });

  it('turns correctly', async () => {
    const engine = new GameEngine(LEVELS[0]);
    await engine.executeActions([{ type: 'turn', direction: 'right' }], undefined, 0);
    expect(engine.getSnapshot().robot.direction).toBe('down');
    await engine.executeActions([{ type: 'turn', direction: 'left' }], undefined, 0);
    expect(engine.getSnapshot().robot.direction).toBe('right');
  });

  it('collects keys and unlocks doors', async () => {
    const engine = new GameEngine(LEVELS[3]); // Level 4: Locked Out
    // Move to key at (1, 1)
    await engine.executeActions([
      { type: 'move', direction: 'up', steps: 2 },
      { type: 'collect', targetId: 'key-blue' }
    ], undefined, 0);

    const snap = engine.getSnapshot();
    expect(snap.robot.inventory).toContain('key-blue');

    // Move to door at (4, 3) and interact
    await engine.executeActions([
      { type: 'move', direction: 'down', steps: 2 },
      { type: 'move', direction: 'right', steps: 2 },
      { type: 'interact', targetId: 'door-blue' }
    ], undefined, 0);

    const door = engine.getSnapshot().entities.find(e => e.id === 'door-blue') as any;
    expect(door.isOpen).toBe(true);
  });
});
