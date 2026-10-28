import { describe, it, expect } from 'vitest';
import { RuleBasedFallbackAdapter } from '../src/ai/adapters/RuleBasedFallbackAdapter';
import { GameContext } from '../src/ai/types';

describe('AI Natural Language Command Parser & Validation', () => {
  const adapter = new RuleBasedFallbackAdapter();
  const dummyContext: GameContext = {
    robot: { x: 2, y: 2, direction: 'right', energy: 100, inventory: [] },
    entities: [
      { id: 'bat-1', type: 'battery', x: 3, y: 2 },
      { id: 'key-blue', type: 'key', x: 2, y: 1, color: 'blue' },
      { id: 'door-1', type: 'door', x: 4, y: 2, state: 'closed' }
    ],
    mapSize: { width: 8, height: 8 },
    exitPosition: { x: 7, y: 7 },
    levelTitle: 'Test Sector',
    objectives: ['Reach the portal']
  };

  const testCases = [
    { input: 'move forward', expectedType: 'move' },
    { input: 'walk forward 3 steps', expectedType: 'move' },
    { input: 'go up 2', expectedType: 'move' },
    { input: 'step left', expectedType: 'move' },
    { input: 'head south 4', expectedType: 'move' },
    { input: 'turn left', expectedType: 'turn' },
    { input: 'turn right', expectedType: 'turn' },
    { input: 'turn around', expectedType: 'turn' },
    { input: 'collect battery', expectedType: 'collect' },
    { input: 'pick up the blue key', expectedType: 'collect' },
    { input: 'interact door', expectedType: 'interact' },
    { input: 'open the door', expectedType: 'interact' },
    { input: 'push crate up', expectedType: 'push' },
    { input: 'push block right', expectedType: 'push' },
    { input: 'wait 2 ticks', expectedType: 'wait' },
    { input: 'pause for 3 turns', expectedType: 'wait' },
    { input: 'recharge', expectedType: 'recharge' },
    { input: 'inspect door', expectedType: 'inspect' },
    { input: 'examine battery', expectedType: 'inspect' },
    { input: 'go to the exit', expectedType: 'move' },
    { input: 'go to the portal', expectedType: 'move' },
    { input: 'turn left, move forward 2 steps and collect battery', expectedCompound: true },
    { input: 'go right 3, then down 2, then push crate', expectedCompound: true },
    { input: 'move forward 1 and then turn right', expectedCompound: true },
    { input: 'turn right and go up 2', expectedCompound: true },
    { input: 'wait 1 and then go forward 3', expectedCompound: true },
    { input: 'collect key and then head to exit', expectedCompound: true },
    { input: 'step backwards 2', expectedType: 'move' },
    { input: 'scan surrounding area', expectedType: 'inspect' },
    { input: 'charge battery', expectedType: 'recharge' },
  ];

  testCases.forEach(({ input, expectedType, expectedCompound }) => {
    it(`correctly parses: "${input}"`, async () => {
      const res = await adapter.parseCommand(input, dummyContext);
      expect(res.success).toBe(true);
      expect(res.actions.length).toBeGreaterThan(0);
      if (expectedType) {
        expect(res.actions.some(a => a.type === expectedType)).toBe(true);
      }
      if (expectedCompound) {
        expect(res.actions.length).toBeGreaterThan(1);
      }
    });
  });

  it('gracefully handles empty command', async () => {
    const res = await adapter.parseCommand('', dummyContext);
    expect(res.success).toBe(false);
    expect(res.validationError).toBeDefined();
  });

  it('rejects incomprehensible instructions honestly', async () => {
    const res = await adapter.parseCommand('xyzzy flabbergast banana rainbow', dummyContext);
    expect(res.success).toBe(false);
    expect(res.validationError).toContain('Could not translate');
    expect(res.confidence).toBeLessThanOrEqual(0.2);
  });

  it('rejects out-of-domain targets like "Go to get coffee" with low confidence instead of fabricating actions', async () => {
    const res = await adapter.parseCommand('Go to get coffee', dummyContext);
    expect(res.success).toBe(false);
    expect(res.actions).toHaveLength(0);
    expect(res.confidence).toBeLessThanOrEqual(0.2);
    expect(res.validationError).toContain('"coffee"');
  });
});
