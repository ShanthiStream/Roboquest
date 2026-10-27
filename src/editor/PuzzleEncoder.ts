import { LevelDefinition, TileType } from '../game/types';

export class PuzzleEncoder {
  static encode(level: LevelDefinition): string {
    const compact = {
      v: 1,
      t: level.title,
      d: level.description,
      w: level.mapSize.width,
      h: level.mapSize.height,
      tiles: level.tiles.map(row => row.map(cell => (cell === 'wall' ? 'W' : cell === 'hazard' ? 'H' : 'F')).join('')),
      rx: level.robotStart.x,
      ry: level.robotStart.y,
      rd: level.robotStart.direction,
      re: level.robotStart.energy,
      ents: level.entities.map(e => ({
        id: e.id,
        t: e.type,
        x: e.x,
        y: e.y,
        ...(e as any).color ? { c: (e as any).color } : {},
      })),
    };

    const jsonStr = JSON.stringify(compact);
    return btoa(encodeURIComponent(jsonStr));
  }

  static decode(encoded: string): LevelDefinition | null {
    try {
      const jsonStr = decodeURIComponent(atob(encoded));
      const parsed = JSON.parse(jsonStr);

      if (!parsed || parsed.v !== 1 || !parsed.w || !parsed.h || !Array.isArray(parsed.tiles)) {
        return null;
      }

      // Reconstruct full LevelDefinition
      const tiles: TileType[][] = parsed.tiles.map((rowStr: string) =>
        rowStr.split('').map((char: string) => (char === 'W' ? 'wall' : char === 'H' ? 'hazard' : 'floor'))
      );

      const entities = parsed.ents.map((e: any) => ({
        id: String(e.id),
        type: e.t,
        x: Number(e.x),
        y: Number(e.y),
        ...(e.c ? { color: e.c } : {}),
      }));

      return {
        id: 888, // Custom puzzle ID
        title: parsed.t || 'Community Custom Puzzle',
        difficulty: 'Medium',
        description: parsed.d || 'Player-created community challenge.',
        mapSize: { width: parsed.w, height: parsed.h },
        tiles,
        robotStart: {
          x: parsed.rx || 1,
          y: parsed.ry || 1,
          direction: parsed.rd || 'right',
          energy: parsed.re || 100,
        },
        entities,
        hints: [
          'Carefully inspect player-placed walls and triggers.',
          'Identify the required batteries or keys before proceeding.',
          'Navigate to the exit portal to solve this community puzzle.',
        ],
        parCommands: 4,
        parSteps: 12,
        verifiedSolution: ['move forward 4'],
      };
    } catch (e) {
      return null;
    }
  }

  static checkSolvability(level: LevelDefinition): boolean {
    const exit = level.entities.find(e => e.type === 'exit');
    if (!exit) return false;

    const sx = level.robotStart.x;
    const sy = level.robotStart.y;
    const ex = exit.x;
    const ey = exit.y;

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
        if (nx >= 0 && nx < level.mapSize.width && ny >= 0 && ny < level.mapSize.height) {
          if (level.tiles[ny][nx] !== 'wall' && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push([nx, ny]);
          }
        }
      }
    }
    return false;
  }
}
