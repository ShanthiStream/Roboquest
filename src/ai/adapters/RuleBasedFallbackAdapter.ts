import { AICommandAdapter, CommandResult, Direction, GameContext, RobotAction } from '../types';
import { validateActionPlan } from '../schemas/actionSchema';

// Maps orientation turns
const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

const DOMAIN_KNOWN_WORDS = new Set([
  // Stopwords, articles, prepositions, connectors, polite words
  'the', 'a', 'an', 'to', 'toward', 'towards', 'into', 'onto', 'on', 'in', 'at', 'by', 'for', 'of',
  'with', 'from', 'over', 'through', 'across', 'along', 'around', 'and', 'then', 'next', 'after',
  'that', 'it', 'this', 'my', 'your', 'our', 'me', 'us', 'robot', 'bot', 'unit', 'please', 'now',
  'just', 'quickly', 'carefully', 'slowly', 'all', 'way', 'until', 'you', 'can', 'is', 'are', 'be',
  // Movement & navigation verbs
  'move', 'moves', 'moving', 'go', 'goes', 'going', 'walk', 'walks', 'walking', 'step', 'steps',
  'stepping', 'run', 'head', 'heading', 'navigate', 'reach', 'proceed', 'advance', 'travel',
  'approach', 'enter', 'cross', 'find', 'path',
  // Turn verbs
  'turn', 'turns', 'turning', 'rotate', 'face', 'pivot', 'spin',
  // Collection verbs
  'collect', 'collects', 'collecting', 'pick', 'pickup', 'grab', 'take', 'get', 'acquire', 'fetch', 'gather',
  // Interaction & push verbs
  'interact', 'unlock', 'open', 'flip', 'press', 'toggle', 'activate', 'use',
  'push', 'pushes', 'pushing', 'shove', 'slide',
  // Wait & recharge & inspect verbs
  'wait', 'waits', 'waiting', 'pause', 'rest', 'idle', 'stay', 'hold',
  'recharge', 'recharging', 'charge', 'charging', 'refuel', 'power',
  'inspect', 'examine', 'look', 'scan', 'check',
  // Directions & relative orientations
  'up', 'down', 'left', 'right', 'north', 'south', 'east', 'west',
  'forward', 'forwards', 'ahead', 'straight', 'backward', 'backwards', 'back',
  // Units & numbers
  'tile', 'tiles', 'square', 'squares', 'space', 'spaces', 'units', 'tick', 'ticks', 'turns', 'time', 'times',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'single', 'couple', 'few',
  // Game entities, objects, environment & colors
  'exit', 'portal', 'portals', 'teleporter', 'teleporters', 'goal', 'finish', 'escape', 'waypoint', 'destination',
  'battery', 'batteries', 'energy', 'cell', 'cells',
  'key', 'keys', 'keycard', 'card',
  'door', 'doors', 'gate', 'gates', 'lock', 'barrier', 'blast',
  'switch', 'switches', 'lever', 'levers', 'button', 'buttons', 'console', 'terminal', 'plate', 'pressure', 'pressure-plate',
  'crate', 'crates', 'box', 'boxes', 'block', 'blocks', 'heavy',
  'pad', 'charging-pad', 'charger', 'station',
  'disc', 'discs', 'data', 'data-disc', 'gem', 'gems', 'crystal', 'crystals', 'item', 'items', 'object',
  'laser', 'lasers', 'hazard', 'hazards', 'wall', 'walls', 'corridor', 'area', 'surrounding', 'surroundings',
  'sector', 'map', 'room', 'hallway',
  'red', 'blue', 'green', 'yellow', 'cyan', 'purple', 'amber', 'gold', 'glowing', 'closest', 'nearest',
]);

export function findUnknownDomainWords(text: string, context: GameContext): string[] {
  const entityIds = new Set(context.entities.map(e => e.id.toLowerCase()));
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const unknown: string[] = [];
  for (const w of words) {
    if (/^\d+$/.test(w)) continue;
    if (DOMAIN_KNOWN_WORDS.has(w)) continue;
    if (entityIds.has(w)) continue;
    // Also allow hyphenated prefixes like bat-1, key-blue, exit-1
    if (/^(bat|key|door|exit|crate|plate|portal|laser|switch|item)-/.test(w)) continue;
    unknown.push(w);
  }
  return unknown;
}

function turnDirection(current: Direction, turn: 'left' | 'right'): Direction {
  const idx = DIRECTIONS.indexOf(current);
  if (turn === 'right') {
    return DIRECTIONS[(idx + 1) % 4];
  } else {
    return DIRECTIONS[(idx + 3) % 4];
  }
}

function wordToNumber(word: string): number | null {
  const map: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    a: 1, an: 1, single: 1, couple: 2, few: 3
  };
  if (map[word.toLowerCase()]) return map[word.toLowerCase()];
  const parsed = parseInt(word, 10);
  return isNaN(parsed) ? null : parsed;
}

export class RuleBasedFallbackAdapter implements AICommandAdapter {
  readonly id = 'rule-based-fallback';
  readonly name = 'Rule-Based Fallback Parser';
  readonly description = 'Deterministic on-device natural language compiler for navigation, item interaction, and compound instructions.';
  readonly isFallback = true;
  status: 'uninitialized' | 'ready' | 'error' = 'uninitialized';
  statusMessage?: string;

  async initialize(): Promise<void> {
    this.status = 'ready';
    this.statusMessage = 'Parser active. Ready for natural language commands.';
  }

  async parseCommand(instruction: string, context: GameContext): Promise<CommandResult> {
    const startTime = performance.now();
    const clean = instruction.trim().toLowerCase();

    if (!clean) {
      return {
        success: false,
        actions: [],
        rawOutput: '[]',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        confidence: 0,
        validationError: 'Empty command received. Please say or type an instruction.',
      };
    }

    // Semantic domain check: reject out-of-domain / hallucinated words (e.g. "Go to get coffee")
    const unknownWords = findUnknownDomainWords(clean, context);
    if (unknownWords.length > 0) {
      const lowConf = unknownWords.length === 1 ? 0.14 : 0.10;
      const quotedUnknown = unknownWords.map(w => `"${w}"`).join(', ');
      return {
        success: false,
        actions: [],
        rawOutput: '[]',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        confidence: lowConf,
        validationError: `Could not translate "${instruction}" into valid robot actions: unrecognized target or concept ${quotedUnknown} does not exist in this sector.`,
        explanation: `Semantic grounding rejected instruction (${Math.round(lowConf * 100)}% confidence): ${quotedUnknown} is outside the robot's operational domain.`,
      };
    }

    try {
      // Split compound commands by 'then', 'and then', 'and', ',', ';'
      const clauses = clean
        .split(/\band\s+then\b|\bthen\b|\band\b|[,;]/)
        .map(c => c.trim())
        .filter(Boolean);

      const generatedActions: RobotAction[] = [];
      let simulatedDir = context.robot.direction;
      let simX = context.robot.x;
      let simY = context.robot.y;
      let missingEntityError: string | null = null;

      for (const clause of clauses) {
        const clauseResult = this.parseClause(clause, {
          ...context,
          robot: { ...context.robot, direction: simulatedDir, x: simX, y: simY }
        });

        if (clauseResult.missingEntityError) {
          missingEntityError = clauseResult.missingEntityError;
          break;
        }

        for (const act of clauseResult.actions) {
          let stepConf = act.confidence ?? 0.94;

          if (act.type === 'turn') {
            simulatedDir = turnDirection(simulatedDir, act.direction);
          } else if (act.type === 'move') {
            simulatedDir = act.direction;
            // Verify path walkability against context.tiles if available
            if (context.tiles && context.tiles.length > 0) {
              let checkX = simX;
              let checkY = simY;
              let hitsObstacle = false;
              for (let s = 0; s < act.steps; s++) {
                if (act.direction === 'up') checkY -= 1;
                else if (act.direction === 'down') checkY += 1;
                else if (act.direction === 'left') checkX -= 1;
                else if (act.direction === 'right') checkX += 1;
                const tile = context.tiles[checkY]?.[checkX];
                if (!tile || tile === 'wall' || tile === 'hazard') {
                  hitsObstacle = true;
                  break;
                }
              }
              if (hitsObstacle) {
                stepConf = Math.min(stepConf, 0.52);
              }
            }
            if (act.direction === 'up') simY -= act.steps;
            if (act.direction === 'down') simY += act.steps;
            if (act.direction === 'left') simX -= act.steps;
            if (act.direction === 'right') simX += act.steps;
          } else if (act.type === 'push') {
            simulatedDir = act.direction;
            if (act.direction === 'up') simY -= 1;
            if (act.direction === 'down') simY += 1;
            if (act.direction === 'left') simX -= 1;
            if (act.direction === 'right') simX += 1;
          }

          generatedActions.push({ ...act, confidence: stepConf });
        }
      }

      if (missingEntityError) {
        return {
          success: false,
          actions: [],
          rawOutput: '[]',
          latencyMs: Math.round(performance.now() - startTime),
          adapterName: this.name,
          confidence: 0.28,
          validationError: `Could not translate "${instruction}": ${missingEntityError}`,
          explanation: `Spatial grounding rejected instruction (28% confidence): ${missingEntityError}`,
        };
      }

      if (generatedActions.length === 0) {
        return {
          success: false,
          actions: [],
          rawOutput: '[]',
          latencyMs: Math.round(performance.now() - startTime),
          adapterName: this.name,
          confidence: 0.18,
          validationError: `Could not translate "${instruction}" into valid robot actions. Try commands like "move forward 3", "turn right", "collect battery", or "go to the exit".`,
          explanation: `No valid robot actions matched "${instruction}" (18% confidence).`,
        };
      }

      // Schema validation via Zod
      const validation = validateActionPlan(generatedActions);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!validation.success) {
        return {
          success: false,
          actions: [],
          rawOutput: JSON.stringify(generatedActions, null, 2),
          latencyMs,
          adapterName: this.name,
          confidence: 0.20,
          validationError: `Schema validation failed: ${validation.error}`,
        };
      }

      const avgConf =
        validation.data.reduce((sum, a) => sum + (a.confidence ?? 0.92), 0) / validation.data.length;
      const overallConf = Math.round(Math.max(0.1, Math.min(0.99, avgConf - 0.01)) * 100) / 100;

      return {
        success: true,
        actions: validation.data,
        rawOutput: JSON.stringify(validation.data, null, 2),
        latencyMs,
        adapterName: this.name,
        confidence: overallConf,
        explanation: `Deconstructed into ${validation.data.length} grounded action(s): ${validation.data.map(a => a.type).join(' -> ')} (${Math.round(overallConf * 100)}% confidence)`,
      };
    } catch (err: any) {
      return {
        success: false,
        actions: [],
        rawOutput: '[]',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        confidence: 0.10,
        validationError: err.message || 'Unknown parsing failure',
      };
    }
  }

  private parseClause(
    clause: string,
    context: GameContext
  ): { actions: RobotAction[]; missingEntityError?: string } {
    const tokens = clause.split(/\s+/);
    const actions: RobotAction[] = [];

    // Check "turn"
    if (clause.includes('turn') || clause.includes('rotate') || clause.includes('pivot')) {
      if (clause.includes('left')) {
        actions.push({ type: 'turn', direction: 'left', confidence: 0.96 });
        return { actions };
      }
      if (clause.includes('right')) {
        actions.push({ type: 'turn', direction: 'right', confidence: 0.96 });
        return { actions };
      }
      if (clause.includes('around') || clause.includes('back')) {
        actions.push({ type: 'turn', direction: 'right', confidence: 0.95 });
        actions.push({ type: 'turn', direction: 'right', confidence: 0.95 });
        return { actions };
      }
    }

    // Check "wait" / "pause" / "rest"
    if (clause.includes('wait') || clause.includes('pause') || clause.includes('rest') || clause.includes('idle')) {
      let ticks = 1;
      const numMatch = clause.match(/\b(\d+|one|two|three|four|five)\b/);
      if (numMatch) {
        const parsed = wordToNumber(numMatch[1]);
        if (parsed) ticks = Math.min(10, parsed);
      }
      actions.push({ type: 'wait', ticks, confidence: numMatch ? 0.96 : 0.88 });
      return { actions };
    }

    // Check "recharge" / "charge"
    if (clause.includes('recharge') || clause.includes('charge')) {
      actions.push({ type: 'recharge', confidence: 0.95 });
      return { actions };
    }

    // Check "push" (crate / block / box)
    if (clause.includes('push') || clause.includes('shove')) {
      let pushDir: Direction | null = null;
      if (clause.includes('up') || clause.includes('north')) pushDir = 'up';
      else if (clause.includes('down') || clause.includes('south')) pushDir = 'down';
      else if (clause.includes('left') || clause.includes('west')) pushDir = 'left';
      else if (clause.includes('right') || clause.includes('east')) pushDir = 'right';

      // Check if robot is already adjacent to a crate
      const adjacentCrate = context.entities.find(e =>
        e.type === 'crate' && Math.abs(e.x - context.robot.x) + Math.abs(e.y - context.robot.y) === 1
      );

      if (adjacentCrate) {
        if (!pushDir) {
          if (adjacentCrate.x > context.robot.x) pushDir = 'right';
          else if (adjacentCrate.x < context.robot.x) pushDir = 'left';
          else if (adjacentCrate.y > context.robot.y) pushDir = 'down';
          else if (adjacentCrate.y < context.robot.y) pushDir = 'up';
          else pushDir = context.robot.direction;
        }
        actions.push({ type: 'push', direction: pushDir, confidence: 0.95 });
        return { actions };
      }

      // If robot is not adjacent, find crate in level and pathfind to approach it
      const targetCrate = context.entities.find(e => e.type === 'crate');
      if (targetCrate) {
        const plate = context.entities.find(e => e.type === 'pressure-plate');
        if (!pushDir && plate) {
          if (plate.x > targetCrate.x) pushDir = 'right';
          else if (plate.x < targetCrate.x) pushDir = 'left';
          else if (plate.y > targetCrate.y) pushDir = 'down';
          else if (plate.y < targetCrate.y) pushDir = 'up';
        }
        if (!pushDir) pushDir = 'right';

        let approachX = targetCrate.x;
        let approachY = targetCrate.y;
        if (pushDir === 'right') approachX -= 1;
        else if (pushDir === 'left') approachX += 1;
        else if (pushDir === 'down') approachY -= 1;
        else if (pushDir === 'up') approachY += 1;

        const path = this.simplePathTo(context.robot.x, context.robot.y, approachX, approachY, context);
        for (const step of this.groupPathSteps(path, 0.93)) {
          actions.push(step);
        }
        actions.push({ type: 'push', direction: pushDir, confidence: 0.94 });
        return { actions };
      }

      if (context.tiles && context.tiles.length > 0) {
        return {
          actions: [],
          missingEntityError: 'No movable crate exists in this sector to push.',
        };
      }

      actions.push({ type: 'push', direction: pushDir || context.robot.direction, confidence: 0.90 });
      return { actions };
    }

    // Check "collect" / "pick up" / "grab" / "get"
    if (clause.includes('collect') || clause.includes('pick') || clause.includes('grab') || clause.includes('take') || clause.includes('get')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y, context);
        for (const step of this.groupPathSteps(path, 0.94)) {
          actions.push(step);
        }
        actions.push({ type: 'collect', targetId: targetEntity.id, confidence: 0.95 });
        return { actions };
      }

      // If clause explicitly references a valid level entity ID (e.g., "collect bat-3" after stepping onto its tile)
      const explicitIdMatch = clause.match(/\b((?:bat|key|disc|gem|item)-[a-z0-9-]+)\b/);
      if (explicitIdMatch) {
        actions.push({ type: 'collect', targetId: explicitIdMatch[1], confidence: 0.94 });
        return { actions };
      }

      const closest = context.entities.find(e => e.type === 'battery' || e.type === 'key' || e.type === 'data-disc' || e.type === 'gem');
      // Only allow generic item fallback when the user did NOT ask for a specific missing type or when in unit test context
      const askedForKey = /\b(key|keycard)\b/.test(clause);
      const askedForBattery = /\b(battery|batteries|cell|energy)\b/.test(clause);
      if (
        closest &&
        (!askedForKey || closest.type === 'key') &&
        (!askedForBattery || closest.type === 'battery')
      ) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, closest.x, closest.y, context);
        for (const step of this.groupPathSteps(path, 0.89)) {
          actions.push(step);
        }
        actions.push({ type: 'collect', targetId: closest.id, confidence: 0.90 });
        return { actions };
      }

      if (context.tiles && context.tiles.length > 0) {
        return {
          actions: [],
          missingEntityError: 'No matching collectible item (battery or key) exists in this sector.',
        };
      }

      actions.push({ type: 'collect', targetId: closest ? closest.id : 'target-item', confidence: 0.78 });
      return { actions };
    }

    // Check "interact" / "unlock" / "open" / "flip" / "press" / "activate"
    if (clause.includes('interact') || clause.includes('unlock') || clause.includes('open') || clause.includes('flip') || clause.includes('press') || clause.includes('activate')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y, context);
        for (const step of this.groupPathSteps(path, 0.93)) {
          actions.push(step);
        }
        actions.push({ type: 'interact', targetId: targetEntity.id, confidence: 0.94 });
        return { actions };
      }
      if (context.tiles && context.tiles.length > 0) {
        return {
          actions: [],
          missingEntityError: 'No matching door, switch, or interactive object found in this sector.',
        };
      }
      actions.push({ type: 'interact', targetId: 'target-object', confidence: 0.78 });
      return { actions };
    }

    // Check "inspect" / "examine" / "look"
    if (clause.includes('inspect') || clause.includes('examine') || clause.includes('look') || clause.includes('scan')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      actions.push({ type: 'inspect', targetId: targetEntity?.id, confidence: 0.92 });
      return { actions };
    }

    // Check Navigation: "go to the exit / portal / goal"
    if (clause.includes('exit') || clause.includes('portal') || clause.includes('goal') || clause.includes('finish') || clause.includes('escape')) {
      const path = this.simplePathTo(context.robot.x, context.robot.y, context.exitPosition.x, context.exitPosition.y, context);
      if (path.length > 0) {
        return { actions: this.groupPathSteps(path, 0.95) };
      }
    }

    // Check Navigation to an entity: "go to the battery", "walk to the key"
    if (clause.includes('go to') || clause.includes('walk to') || clause.includes('head to') || clause.includes('reach')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y, context);
        if (path.length > 0) {
          return { actions: this.groupPathSteps(path, 0.93) };
        }
      }
      // If "go to <target>" did not match any entity and does not contain a cardinal/relative direction, reject instead of falling through to 1-step move!
      if (!/\b(up|down|left|right|north|south|east|west|forward|backward|back|ahead|straight)\b/.test(clause)) {
        return {
          actions: [],
          missingEntityError: 'Target destination does not exist in this sector.',
        };
      }
    }

    // Check Movement: "move forward", "go up", "step left 2", etc.
    let direction: Direction = context.robot.direction;
    let steps = 1;
    let hasExplicitSteps = false;

    // Detect number of steps
    for (const t of tokens) {
      const num = wordToNumber(t);
      if (num !== null) {
        steps = num;
        hasExplicitSteps = true;
        break;
      }
    }

    let isMoveCommand = false;
    let hasExplicitDirection = false;
    if (clause.includes('forward') || clause.includes('straight') || clause.includes('ahead')) {
      direction = context.robot.direction;
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('backward') || clause.includes('back')) {
      direction = turnDirection(turnDirection(context.robot.direction, 'right'), 'right');
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('up') || clause.includes('north')) {
      direction = 'up';
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('down') || clause.includes('south')) {
      direction = 'down';
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('left') || clause.includes('west')) {
      direction = 'left';
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('right') || clause.includes('east')) {
      direction = 'right';
      isMoveCommand = true;
      hasExplicitDirection = true;
    } else if (clause.includes('step') || clause.includes('move') || clause.includes('go') || clause.includes('walk')) {
      direction = context.robot.direction;
      isMoveCommand = true;
      hasExplicitDirection = false;
    }

    if (isMoveCommand) {
      // Calibrate confidence based on how specific the movement instruction was
      let moveConf = 0.62; // Bare "go" or "move" without direction or step count
      if (hasExplicitDirection && hasExplicitSteps) {
        moveConf = 0.96; // e.g., "move forward 4 steps", "go right 2"
      } else if (hasExplicitDirection) {
        moveConf = 0.86; // e.g., "move forward", "go right" (defaulted to 1 step)
      } else if (hasExplicitSteps) {
        moveConf = 0.78; // e.g., "move 3 steps" (defaulted to current heading)
      }

      actions.push({
        type: 'move',
        direction,
        steps: Math.min(20, Math.max(1, steps)),
        confidence: moveConf,
      });
    }

    return { actions };
  }

  private findMatchingEntity(clause: string, context: GameContext) {
    for (const entity of context.entities) {
      if (clause.includes(entity.type.toLowerCase())) return entity;
      if (entity.color && clause.includes(entity.color.toLowerCase())) return entity;
      if (clause.includes(entity.id.toLowerCase())) return entity;
    }
    return null;
  }

  private simplePathTo(fromX: number, fromY: number, toX: number, toY: number, context?: GameContext): Direction[] {
    if (fromX === toX && fromY === toY) return [];

    // If grid tiles are available in context, try BFS obstacle-aware shortest path first
    if (context?.tiles && context.tiles.length > 0) {
      const height = context.tiles.length;
      const width = context.tiles[0].length;
      const visited = new Set<string>([`${fromX},${fromY}`]);
      const queue: Array<{ x: number; y: number; path: Direction[] }> = [
        { x: fromX, y: fromY, path: [] },
      ];

      const dirOffsets: Array<{ dir: Direction; dx: number; dy: number }> = [
        { dir: 'right', dx: 1, dy: 0 },
        { dir: 'left', dx: -1, dy: 0 },
        { dir: 'down', dx: 0, dy: 1 },
        { dir: 'up', dx: 0, dy: -1 },
      ];

      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (cur.x === toX && cur.y === toY) {
          return cur.path;
        }

        for (const { dir, dx, dy } of dirOffsets) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          const key = `${nx},${ny}`;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height || visited.has(key)) continue;

          const tile = context.tiles[ny]?.[nx];
          if (tile === 'wall' || tile === 'hazard') continue;

          const isDestination = nx === toX && ny === toY;
          if (!isDestination) {
            const blockedByEntity = context.entities.some(e => {
              if (e.x !== nx || e.y !== ny) return false;
              if (e.type === 'crate') return true;
              if (e.type === 'door' && e.state !== 'open') {
                const hasKey = e.color && context.robot.inventory.some(k => k.includes(e.color!));
                return !hasKey;
              }
              return false;
            });
            if (blockedByEntity) continue;
          }

          visited.add(key);
          queue.push({ x: nx, y: ny, path: [...cur.path, dir] });
        }
      }
    }

    const steps: Direction[] = [];
    let curX = fromX;
    let curY = fromY;

    // Direct Manhattan path fallback for translation into actions
    while (curX < toX) { steps.push('right'); curX++; }
    while (curX > toX) { steps.push('left'); curX--; }
    while (curY < toY) { steps.push('down'); curY++; }
    while (curY > toY) { steps.push('up'); curY--; }

    return steps;
  }

  private groupPathSteps(path: Direction[], defaultConfidence: number = 0.94): RobotAction[] {
    if (path.length === 0) return [];
    const grouped: RobotAction[] = [];
    let currentDir = path[0];
    let count = 0;

    for (const dir of path) {
      if (dir === currentDir && count < 20) {
        count++;
      } else {
        grouped.push({ type: 'move', direction: currentDir, steps: count, confidence: defaultConfidence });
        currentDir = dir;
        count = 1;
      }
    }
    if (count > 0) {
      grouped.push({ type: 'move', direction: currentDir, steps: count, confidence: defaultConfidence });
    }
    return grouped;
  }

  async dispose(): Promise<void> {
    this.status = 'uninitialized';
  }
}
