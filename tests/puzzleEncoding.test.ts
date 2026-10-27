import { describe, it, expect } from 'vitest';
import { PuzzleEncoder } from '../src/editor/PuzzleEncoder';
import { LEVELS } from '../src/game/levels/levelData';

describe('PuzzleEncoder and Solvability', () => {
  it('encodes and decodes level reliably without data loss', () => {
    const original = LEVELS[0];
    const encoded = PuzzleEncoder.encode(original);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(10);

    const decoded = PuzzleEncoder.decode(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.title).toBe(original.title);
    expect(decoded?.mapSize.width).toBe(original.mapSize.width);
    expect(decoded?.mapSize.height).toBe(original.mapSize.height);
    expect(decoded?.entities.length).toBe(original.entities.length);
  });

  it('rejects corrupted or malicious encoded strings safely', () => {
    const invalid = '!!!not-a-valid-base64-puzzle-string@@@';
    const decoded = PuzzleEncoder.decode(invalid);
    expect(decoded).toBeNull();
  });

  it('accurately detects solvable versus unsolvable maps', () => {
    const solvable = LEVELS[0];
    expect(PuzzleEncoder.checkSolvability(solvable)).toBe(true);

    // Create boxed-in unsolvable map
    const boxed = JSON.parse(JSON.stringify(solvable));
    // Surround exit with walls
    boxed.tiles[2][5] = 'wall';
    boxed.tiles[4][5] = 'wall';
    boxed.tiles[3][4] = 'wall';
    boxed.tiles[3][6] = 'wall';

    expect(PuzzleEncoder.checkSolvability(boxed)).toBe(false);
  });
});
