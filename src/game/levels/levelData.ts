import { LevelDefinition, TileType } from '../types';

function createGrid(w: number, h: number, defaultTile: TileType = 'floor'): TileType[][] {
  const grid: TileType[][] = [];
  for (let y = 0; y < h; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < w; x++) {
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
        row.push('wall');
      } else {
        row.push(defaultTile);
      }
    }
    grid.push(row);
  }
  return grid;
}

export const LEVELS: LevelDefinition[] = [
  // LEVEL 1: Hello, Robot!
  {
    id: 1,
    title: 'Hello, Robot!',
    difficulty: 'Beginner',
    description: 'Learn basic movement and reach the green exit portal.',
    mapSize: { width: 7, height: 7 },
    tiles: createGrid(7, 7),
    robotStart: { x: 1, y: 3, direction: 'right', energy: 100 },
    entities: [
      { id: 'exit-1', type: 'exit', x: 5, y: 3 }
    ],
    hints: [
      'The green portal ahead is your destination.',
      'Head straight toward the portal on the right.',
      'Try: "Move forward 4 steps" or "Go right 4".'
    ],
    parCommands: 1,
    parSteps: 4,
    verifiedSolution: ['move forward 4 steps']
  },

  // LEVEL 2: Energy Hunt
  {
    id: 2,
    title: 'Energy Hunt',
    difficulty: 'Beginner',
    description: 'Collect all 3 glowing energy batteries to activate the exit portal.',
    mapSize: { width: 7, height: 7 },
    tiles: createGrid(7, 7),
    robotStart: { x: 1, y: 1, direction: 'right', energy: 100 },
    entities: [
      { id: 'bat-1', type: 'battery', x: 3, y: 1, energyValue: 20 },
      { id: 'bat-2', type: 'battery', x: 3, y: 3, energyValue: 20 },
      { id: 'bat-3', type: 'battery', x: 5, y: 3, energyValue: 20 },
      { id: 'exit-2', type: 'exit', x: 5, y: 5 }
    ],
    hints: [
      'The portal needs energy from batteries to open.',
      'Pick up each battery along the path.',
      'Try: "Go right 2, then down 2, then right 2, then down 2".'
    ],
    parCommands: 2,
    parSteps: 8,
    verifiedSolution: ['go right 2', 'collect bat-1', 'go down 2', 'collect bat-2', 'go right 2', 'collect bat-3', 'go down 2']
  },

  // LEVEL 3: The Maze
  {
    id: 3,
    title: 'The Maze',
    difficulty: 'Easy',
    description: 'Navigate through laboratory partitions without hitting barriers.',
    mapSize: { width: 8, height: 8 },
    tiles: (() => {
      const g = createGrid(8, 8);
      // Maze internal walls
      g[2][2] = 'wall'; g[2][3] = 'wall'; g[2][4] = 'wall';
      g[4][3] = 'wall'; g[4][4] = 'wall'; g[4][5] = 'wall';
      g[5][1] = 'wall'; g[5][2] = 'wall';
      return g;
    })(),
    robotStart: { x: 1, y: 1, direction: 'right', energy: 100 },
    entities: [
      { id: 'bat-maze', type: 'battery', x: 5, y: 1, energyValue: 25 },
      { id: 'exit-3', type: 'exit', x: 6, y: 6 }
    ],
    hints: [
      'Look for the open corridor between wall sections.',
      'Head right across the top corridor, then navigate down.',
      'Try: "Go right 4, then down 2, then right 1, then down 3".'
    ],
    parCommands: 2,
    parSteps: 10,
    verifiedSolution: ['go right 4', 'collect bat-maze', 'go down 2', 'go right 1', 'go down 3']
  },

  // LEVEL 4: Locked Out
  {
    id: 4,
    title: 'Locked Out',
    difficulty: 'Easy',
    description: 'Find the blue electronic key to unlock the security door.',
    mapSize: { width: 8, height: 7 },
    tiles: (() => {
      const g = createGrid(8, 7);
      // Dividing wall across x=4
      g[1][4] = 'wall';
      g[2][4] = 'wall';
      // g[3][4] is door
      g[4][4] = 'wall';
      g[5][4] = 'wall';
      return g;
    })(),
    robotStart: { x: 1, y: 3, direction: 'right', energy: 100 },
    entities: [
      { id: 'key-blue', type: 'key', color: 'blue', x: 1, y: 1 },
      { id: 'door-blue', type: 'door', color: 'blue', x: 4, y: 3, isOpen: false },
      { id: 'exit-4', type: 'exit', x: 6, y: 3 }
    ],
    hints: [
      'The blue door blocking the hallway requires a blue key.',
      'Find the key in the top left chamber before approaching the door.',
      'Try: "Go up 2, collect the blue key, then go down 2 and right 3".'
    ],
    parCommands: 3,
    parSteps: 9,
    verifiedSolution: ['go up 2', 'go down 2', 'go right 5']
  },

  // LEVEL 5: Power Crisis
  {
    id: 5,
    title: 'Power Crisis',
    difficulty: 'Medium',
    description: 'Each step drains energy! Reach the charging station to replenish power.',
    mapSize: { width: 8, height: 8 },
    tiles: (() => {
      const g = createGrid(8, 8);
      g[4][4] = 'charging-pad';
      return g;
    })(),
    robotStart: { x: 1, y: 6, direction: 'up', energy: 45 },
    entities: [
      { id: 'bat-5a', type: 'battery', x: 2, y: 4, energyValue: 20 },
      { id: 'exit-5', type: 'exit', x: 6, y: 1 }
    ],
    hints: [
      'Your starting energy is low. Plan an efficient route.',
      'Step onto the central glowing charging pad (4, 4) to restore energy.',
      'Try: "Move up 2, right 1, collect battery, move right 2, recharge, then go to exit".'
    ],
    parCommands: 3,
    parSteps: 9,
    verifiedSolution: ['go up 2', 'go right 1', 'collect bat-5a', 'go right 2', 'recharge', 'go up 3', 'go right 2']
  },

  // LEVEL 6: Laser Lab
  {
    id: 6,
    title: 'Laser Lab',
    difficulty: 'Medium',
    description: 'Time your movements to cross the corridor when security lasers turn off.',
    mapSize: { width: 8, height: 7 },
    tiles: createGrid(8, 7),
    robotStart: { x: 1, y: 3, direction: 'right', energy: 100 },
    entities: [
      {
        id: 'laser-1',
        type: 'laser',
        x: 3,
        y: 1,
        direction: 'vertical',
        length: 5,
        period: 2,
        activeTicks: 1,
        currentTick: 0,
        isActive: true
      },
      { id: 'bat-6', type: 'battery', x: 5, y: 3, energyValue: 30 },
      { id: 'exit-6', type: 'exit', x: 6, y: 3 }
    ],
    hints: [
      'Lasers toggle on and off each turn.',
      'If the laser ahead is active, wait one turn before crossing.',
      'Try: "Wait 1 turn, then move right 4 steps".'
    ],
    parCommands: 2,
    parSteps: 5,
    verifiedSolution: ['wait 1', 'go right 4', 'collect bat-6', 'go right 1']
  },

  // LEVEL 7: Switch Master
  {
    id: 7,
    title: 'Switch Master',
    difficulty: 'Hard',
    description: 'Push the heavy crate onto the pressure plate to keep the blast door open.',
    mapSize: { width: 8, height: 7 },
    tiles: (() => {
      const g = createGrid(8, 7);
      g[1][5] = 'wall';
      g[2][5] = 'wall';
      g[4][5] = 'wall';
      g[5][5] = 'wall';
      return g;
    })(),
    robotStart: { x: 1, y: 3, direction: 'right', energy: 100 },
    entities: [
      { id: 'crate-1', type: 'crate', x: 3, y: 2 },
      { id: 'plate-1', type: 'pressure-plate', targetDoorId: 'door-blast', x: 4, y: 2, isPressed: false },
      { id: 'door-blast', type: 'door', color: 'yellow', x: 5, y: 3, isOpen: false },
      { id: 'exit-7', type: 'exit', x: 6, y: 3 }
    ],
    hints: [
      'The yellow blast door only opens when the pressure plate is held down.',
      'Navigate to the top corridor and push the crate right onto the plate.',
      'Try: "Go up 1, then go right 1, then push right, then go down 1 and right 4".'
    ],
    parCommands: 4,
    parSteps: 8,
    verifiedSolution: ['go up 1', 'go right 1', 'push right', 'go down 1', 'go right 4']
  },

  // LEVEL 8: Portal Puzzle
  {
    id: 8,
    title: 'Portal Puzzle',
    difficulty: 'Hard',
    description: 'Step into quantum teleporters to cross impassable laboratory chasms.',
    mapSize: { width: 9, height: 7 },
    tiles: (() => {
      const g = createGrid(9, 7);
      for (let y = 1; y < 6; y++) {
        g[y][4] = 'wall';
      }
      return g;
    })(),
    robotStart: { x: 1, y: 3, direction: 'right', energy: 100 },
    entities: [
      { id: 'portal-a', type: 'teleporter', x: 3, y: 3, targetX: 5, targetY: 3, pairColor: '#b026ff' },
      { id: 'portal-b', type: 'teleporter', x: 5, y: 3, targetX: 3, targetY: 3, pairColor: '#b026ff' },
      { id: 'bat-portal', type: 'battery', x: 7, y: 2, energyValue: 30 },
      { id: 'exit-8', type: 'exit', x: 7, y: 4 }
    ],
    hints: [
      'The dividing wall is solid, but the purple portal provides safe transit.',
      'Step directly onto the teleporter at (3, 3) to be beamed to the right wing.',
      'Try: "Move right 2 to enter portal, then go right 2 and down 1".'
    ],
    parCommands: 2,
    parSteps: 5,
    verifiedSolution: ['go right 2', 'go right 2', 'go down 1']
  },

  // LEVEL 9: Robot Logic
  {
    id: 9,
    title: 'Robot Logic',
    difficulty: 'Advanced',
    description: 'Multi-stage mission: collect energy cells, obtain key, and bypass hazard.',
    mapSize: { width: 9, height: 8 },
    tiles: (() => {
      const g = createGrid(9, 8);
      g[2][4] = 'wall'; g[3][4] = 'wall'; g[4][4] = 'wall';
      g[5][4] = 'wall';
      g[3][6] = 'hazard'; g[3][7] = 'hazard';
      return g;
    })(),
    robotStart: { x: 1, y: 2, direction: 'right', energy: 100 },
    entities: [
      { id: 'bat-9a', type: 'battery', x: 2, y: 2, energyValue: 25 },
      { id: 'key-9', type: 'key', color: 'green', x: 1, y: 5 },
      { id: 'door-9', type: 'door', color: 'green', x: 4, y: 6, isOpen: false },
      { id: 'exit-9', type: 'exit', x: 7, y: 2 }
    ],
    hints: [
      'Formulate a multi-stage plan: Battery first, then green key, then open door.',
      'Avoid the red hazards located along the upper sector.',
      'Try: "Collect battery, then go down 3 to key, then go down 1, right 6, and up 4".'
    ],
    parCommands: 5,
    parSteps: 15,
    verifiedSolution: ['go right 1', 'collect bat-9a', 'go left 1', 'go down 3', 'collect key-9', 'go down 1', 'go right 3', 'go right 3', 'go up 4']
  },

  // LEVEL 10: The Great Escape
  {
    id: 10,
    title: 'The Great Escape',
    difficulty: 'Expert',
    description: 'The master challenge combining keys, lasers, crates, portals, and energy management!',
    mapSize: { width: 10, height: 9 },
    tiles: (() => {
      const g = createGrid(10, 9);
      for (let y = 1; y < 8; y++) {
        if (y !== 4) g[y][4] = 'wall';
      }
      for (let y = 1; y < 8; y++) {
        if (y !== 6) g[y][7] = 'wall';
      }
      return g;
    })(),
    robotStart: { x: 1, y: 4, direction: 'right', energy: 100 },
    entities: [
      { id: 'key-10', type: 'key', color: 'red', x: 1, y: 1 },
      { id: 'laser-10', type: 'laser', x: 3, y: 2, direction: 'vertical', length: 3, period: 2, activeTicks: 1, currentTick: 0, isActive: false },
      { id: 'door-10', type: 'door', color: 'red', x: 4, y: 4, isOpen: false },
      { id: 'crate-10', type: 'crate', x: 5, y: 4 },
      { id: 'plate-10', type: 'pressure-plate', targetDoorId: 'door-portal-chamber', x: 6, y: 4, isPressed: false },
      { id: 'door-portal-chamber', type: 'door', color: 'yellow', x: 7, y: 6, isOpen: false },
      { id: 'tele-10a', type: 'teleporter', x: 5, y: 6, targetX: 8, targetY: 2, pairColor: '#00ffaa' },
      { id: 'bat-10', type: 'battery', x: 8, y: 4, energyValue: 40 },
      { id: 'exit-10', type: 'exit', x: 8, y: 6 }
    ],
    hints: [
      'Begin by securing the red key from the top alcove while minding the laser cycle.',
      'Unlock the red door, push the crate onto the plate, and access the green teleporter.',
      'The portal beams you directly into the final escape conduit!'
    ],
    parCommands: 6,
    parSteps: 18,
    verifiedSolution: [
      'go up 3', 'collect key-10', 'go down 3', 'go right 3',
      'push right', 'go down 2', 'go down 4'
    ]
  }
];
