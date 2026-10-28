import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine/GameEngine';
import { LEVELS } from '../src/game/levels/levelData';
import { aiManager } from '../src/ai/AIAdapterManager';
import { RuleBasedFallbackAdapter } from '../src/ai/adapters/RuleBasedFallbackAdapter';

describe('Level 7 Push Mechanics & Solutions', () => {
  const level7 = LEVELS.find((l) => l.id === 7)!;
  const adapter = new RuleBasedFallbackAdapter();

  it('verifies Level 7 initial configuration', () => {
    const engine = new GameEngine(level7);
    const snap = engine.getSnapshot();
    expect(snap.status).toBe('playing');
    expect(snap.robot.x).toBe(1);
    expect(snap.robot.y).toBe(3);

    const crate = snap.entities.find((e) => e.type === 'crate');
    expect(crate).toBeDefined();
    expect(crate?.x).toBe(3);
    expect(crate?.y).toBe(2);

    const plate = snap.entities.find((e) => e.type === 'pressure-plate') as any;
    expect(plate).toBeDefined();
    expect(plate.x).toBe(4);
    expect(plate.y).toBe(2);
    expect(plate.isPressed).toBe(false);

    const door = snap.entities.find((e) => e.id === 'door-blast') as any;
    expect(door).toBeDefined();
    expect(door.isOpen).toBe(false);
  });

  it('completes Level 7 via sequential manual commands', async () => {
    const engine = new GameEngine(level7);

    // 1. Go up 1
    let res = await aiManager.parseCommand('go up 1', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);
    expect(engine.getSnapshot().robot.x).toBe(1);
    expect(engine.getSnapshot().robot.y).toBe(2);

    // 2. Go right 1
    res = await aiManager.parseCommand('go right 1', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);
    expect(engine.getSnapshot().robot.x).toBe(2);
    expect(engine.getSnapshot().robot.y).toBe(2);

    // 3. Push crate right onto pressure plate
    res = await aiManager.parseCommand('push right', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);
    const crate = engine.getSnapshot().entities.find((e) => e.type === 'crate');
    expect(crate?.x).toBe(4);
    expect(crate?.y).toBe(2);
    const plate = engine.getSnapshot().entities.find((e) => e.type === 'pressure-plate') as any;
    expect(plate.isPressed).toBe(true);
    const door = engine.getSnapshot().entities.find((e) => e.id === 'door-blast') as any;
    expect(door.isOpen).toBe(true);

    // 4. Go down 1
    res = await aiManager.parseCommand('go down 1', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);
    expect(engine.getSnapshot().robot.x).toBe(3);
    expect(engine.getSnapshot().robot.y).toBe(3);

    // 5. Go right through open blast door to exit
    res = await aiManager.parseCommand('go right 3', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('won');
  });

  it('handles push when robot approached crate facing up', async () => {
    const engine = new GameEngine(level7);

    // Approach crate via right then up
    await engine.executeActions([
      { type: 'move', direction: 'right', steps: 1 },
      { type: 'move', direction: 'up', steps: 1 },
    ], undefined, 0);

    expect(engine.getSnapshot().robot.x).toBe(2);
    expect(engine.getSnapshot().robot.y).toBe(2);
    expect(engine.getSnapshot().robot.direction).toBe('up');

    // Player enters simply 'push' or 'push crate'
    const res = await aiManager.parseCommand('push crate', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);

    const crate = engine.getSnapshot().entities.find((e) => e.type === 'crate');
    expect(crate?.x).toBe(4);
    expect(crate?.y).toBe(2);
    expect(engine.getSnapshot().robot.x).toBe(3);
    expect(engine.getSnapshot().robot.y).toBe(2);
    expect(engine.getSnapshot().robot.direction).toBe('right');
  });

  it('supports single high-level command: "push crate onto pressure plate"', async () => {
    const engine = new GameEngine(level7);
    const res = await adapter.parseCommand('push crate onto the pressure plate', engine.toGameContext());
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);

    const crate = engine.getSnapshot().entities.find((e) => e.type === 'crate');
    expect(crate?.x).toBe(4);
    expect(crate?.y).toBe(2);

    const door = engine.getSnapshot().entities.find((e) => e.id === 'door-blast') as any;
    expect(door.isOpen).toBe(true);
  });

  it('solves entire Level 7 via full compound instruction', async () => {
    const engine = new GameEngine(level7);
    const res = await aiManager.parseCommand(
      'go up 1, go right 1, push right, go down 1, go right 4',
      engine.toGameContext()
    );
    expect(res.success).toBe(true);
    await engine.executeActions(res.actions, undefined, 0);
    expect(engine.getSnapshot().status).toBe('won');
  });
});
