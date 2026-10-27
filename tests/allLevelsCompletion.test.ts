import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine/GameEngine';
import { LEVELS } from '../src/game/levels/levelData';
import { RuleBasedFallbackAdapter } from '../src/ai/adapters/RuleBasedFallbackAdapter';

describe('All 10 Levels Scripted Solvability', () => {
  const adapter = new RuleBasedFallbackAdapter();

  LEVELS.forEach((level) => {
    it(`Sector ${level.id} (${level.title}) passes verified solution`, async () => {
      const engine = new GameEngine(level);

      for (const cmd of level.verifiedSolution) {
        if (engine.getSnapshot().status === 'won') break;
        const result = await adapter.parseCommand(cmd, engine.toGameContext());
        expect(result.success).toBe(true);
        expect(result.actions.length).toBeGreaterThan(0);
        await engine.executeActions(result.actions, undefined, 0);
      }

      const finalSnap = engine.getSnapshot();
      expect(finalSnap.status).toBe('won');
    });
  });
});
