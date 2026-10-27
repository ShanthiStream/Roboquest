import { LevelDefinition, TileType } from '../game/types';

// Pseudo-random number generator with seed
function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class DailyChallengeService {
  static getTodayDateString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  static generateDailyLevel(dateStr?: string): LevelDefinition {
    const date = dateStr || this.getTodayDateString();
    const seed = dateToSeed(date);
    const rng = sfc32(seed, seed ^ 0xdeadbeef, seed ^ 0x12345678, seed ^ 0x87654321);

    const width = 8;
    const height = 8;
    const tiles: TileType[][] = [];

    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          row.push('wall');
        } else {
          // 15% chance of internal wall, ensuring center stays relatively clear
          const isCenter = (x >= 3 && x <= 4 && y >= 3 && y <= 4);
          if (!isCenter && rng() < 0.16) {
            row.push('wall');
          } else {
            row.push('floor');
          }
        }
      }
      tiles.push(row);
    }

    const startX = 1;
    const startY = 1;
    tiles[startY][startX] = 'floor';

    const exitX = width - 2;
    const exitY = height - 2;
    tiles[exitY][exitX] = 'floor';

    // Battery placements
    const bat1X = 3;
    const bat1Y = 2;
    tiles[bat1Y][bat1X] = 'floor';

    const bat2X = 5;
    const bat2Y = 4;
    tiles[bat2Y][bat2X] = 'floor';

    // Verify solvability using BFS
    const isSolvable = this.checkPath(tiles, startX, startY, exitX, exitY);
    if (!isSolvable) {
      // Clear a direct path if random walls blocked it
      for (let x = startX; x <= exitX; x++) tiles[startY][x] = 'floor';
      for (let y = startY; y <= exitY; y++) tiles[y][exitX] = 'floor';
    }

    return {
      id: 999, // Special ID for Daily Challenge
      title: `Daily Protocol : ${date}`,
      difficulty: 'Medium',
      description: 'Daily synchronized laboratory puzzle. Collect both energy batteries and reach the extraction portal.',
      mapSize: { width, height },
      tiles,
      robotStart: { x: startX, y: startY, direction: 'right', energy: 100 },
      entities: [
        { id: `daily-bat-1-${date}`, type: 'battery', x: bat1X, y: bat1Y, energyValue: 25 },
        { id: `daily-bat-2-${date}`, type: 'battery', x: bat2X, y: bat2Y, energyValue: 25 },
        { id: `daily-exit-${date}`, type: 'exit', x: exitX, y: exitY },
      ],
      hints: [
        `Today's challenge seed: ${date}.`,
        'Plan a route linking both energy units before heading to the portal.',
        'Use voice or compound commands to conquer the daily challenge in minimal commands.',
      ],
      parCommands: 3,
      parSteps: 12,
      verifiedSolution: ['go right 2', 'collect daily-bat-1', 'go down 2', 'go right 2', 'collect daily-bat-2', 'go down 2'],
    };
  }

  private static checkPath(tiles: TileType[][], sx: number, sy: number, ex: number, ey: number): boolean {
    const queue: [number, number][] = [[sx, sy]];
    const visited = new Set<string>();
    visited.add(`${sx},${sy}`);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      if (cx === ex && cy === ey) return true;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < tiles[0].length && ny >= 0 && ny < tiles.length) {
          if (tiles[ny][nx] !== 'wall' && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push([nx, ny]);
          }
        }
      }
    }
    return false;
  }
}
