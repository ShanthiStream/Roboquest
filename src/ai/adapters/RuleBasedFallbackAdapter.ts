import { AICommandAdapter, CommandResult, Direction, GameContext, RobotAction } from '../types';
import { validateActionPlan } from '../schemas/actionSchema';

// Maps orientation turns
const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

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
        validationError: 'Empty command received. Please say or type an instruction.',
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

      for (const clause of clauses) {
        const clauseActions = this.parseClause(clause, {
          ...context,
          robot: { ...context.robot, direction: simulatedDir, x: simX, y: simY }
        });

        for (const act of clauseActions) {
          generatedActions.push(act);
          if (act.type === 'turn') {
            simulatedDir = turnDirection(simulatedDir, act.direction);
          } else if (act.type === 'move') {
            simulatedDir = act.direction;
            if (act.direction === 'up') simY -= act.steps;
            if (act.direction === 'down') simY += act.steps;
            if (act.direction === 'left') simX -= act.steps;
            if (act.direction === 'right') simX += act.steps;
          }
        }
      }

      if (generatedActions.length === 0) {
        return {
          success: false,
          actions: [],
          rawOutput: '[]',
          latencyMs: Math.round(performance.now() - startTime),
          adapterName: this.name,
          validationError: `Could not translate "${instruction}" into valid robot actions. Try commands like "move forward 3", "turn right", "collect battery", or "find path to exit".`,
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
          validationError: `Schema validation failed: ${validation.error}`,
        };
      }

      return {
        success: true,
        actions: validation.data,
        rawOutput: JSON.stringify(validation.data, null, 2),
        latencyMs,
        adapterName: this.name,
        explanation: `Deconstructed into ${validation.data.length} action(s): ${validation.data.map(a => a.type).join(' -> ')}`,
      };
    } catch (err: any) {
      return {
        success: false,
        actions: [],
        rawOutput: '[]',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        validationError: err.message || 'Unknown parsing failure',
      };
    }
  }

  private parseClause(clause: string, context: GameContext): RobotAction[] {
    const tokens = clause.split(/\s+/);
    const actions: RobotAction[] = [];

    // Check "turn"
    if (clause.includes('turn')) {
      if (clause.includes('left')) {
        actions.push({ type: 'turn', direction: 'left' });
        return actions;
      }
      if (clause.includes('right')) {
        actions.push({ type: 'turn', direction: 'right' });
        return actions;
      }
      if (clause.includes('around') || clause.includes('back')) {
        actions.push({ type: 'turn', direction: 'right' });
        actions.push({ type: 'turn', direction: 'right' });
        return actions;
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
      actions.push({ type: 'wait', ticks });
      return actions;
    }

    // Check "recharge" / "charge"
    if (clause.includes('recharge') || clause.includes('charge')) {
      actions.push({ type: 'recharge' });
      return actions;
    }

    // Check "push" (crate / block)
    if (clause.includes('push')) {
      let pushDir: Direction = context.robot.direction;
      if (clause.includes('up') || clause.includes('north')) pushDir = 'up';
      else if (clause.includes('down') || clause.includes('south')) pushDir = 'down';
      else if (clause.includes('left') || clause.includes('west')) pushDir = 'left';
      else if (clause.includes('right') || clause.includes('east')) pushDir = 'right';
      actions.push({ type: 'push', direction: pushDir });
      return actions;
    }

    // Check "collect" / "pick up" / "grab" / "get"
    if (clause.includes('collect') || clause.includes('pick') || clause.includes('grab') || clause.includes('take') || clause.includes('get')) {
      // Find entity target matching description
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        // Pathfind or direct collect if adjacent
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y);
        for (const step of path) {
          actions.push({ type: 'move', direction: step, steps: 1 });
        }
        actions.push({ type: 'collect', targetId: targetEntity.id });
        return actions;
      } else {
        // Default collect action with closest item or generic target
        const closest = context.entities.find(e => e.type === 'battery' || e.type === 'key');
        actions.push({ type: 'collect', targetId: closest ? closest.id : 'target-item' });
        return actions;
      }
    }

    // Check "interact" / "unlock" / "open" / "flip" / "press" / "activate"
    if (clause.includes('interact') || clause.includes('unlock') || clause.includes('open') || clause.includes('flip') || clause.includes('press') || clause.includes('activate')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y);
        for (const step of path) {
          actions.push({ type: 'move', direction: step, steps: 1 });
        }
        actions.push({ type: 'interact', targetId: targetEntity.id });
        return actions;
      }
      actions.push({ type: 'interact', targetId: 'target-object' });
      return actions;
    }

    // Check "inspect" / "examine" / "look"
    if (clause.includes('inspect') || clause.includes('examine') || clause.includes('look') || clause.includes('scan')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      actions.push({ type: 'inspect', targetId: targetEntity?.id });
      return actions;
    }

    // Check Navigation: "go to the exit / portal / goal"
    if (clause.includes('exit') || clause.includes('portal') || clause.includes('goal') || clause.includes('finish') || clause.includes('escape')) {
      const path = this.simplePathTo(context.robot.x, context.robot.y, context.exitPosition.x, context.exitPosition.y);
      if (path.length > 0) {
        // Group consecutive steps in same direction
        return this.groupPathSteps(path);
      }
    }

    // Check Navigation to an entity: "go to the battery", "walk to the key"
    if (clause.includes('go to') || clause.includes('walk to') || clause.includes('head to') || clause.includes('reach')) {
      const targetEntity = this.findMatchingEntity(clause, context);
      if (targetEntity) {
        const path = this.simplePathTo(context.robot.x, context.robot.y, targetEntity.x, targetEntity.y);
        if (path.length > 0) {
          return this.groupPathSteps(path);
        }
      }
    }

    // Check Movement: "move forward", "go up", "step left 2", etc.
    let direction: Direction = context.robot.direction;
    let steps = 1;

    // Detect number of steps
    for (const t of tokens) {
      const num = wordToNumber(t);
      if (num !== null) {
        steps = num;
        break;
      }
    }

    let isMoveCommand = false;
    if (clause.includes('forward') || clause.includes('straight') || clause.includes('ahead')) {
      direction = context.robot.direction;
      isMoveCommand = true;
    } else if (clause.includes('backward') || clause.includes('back')) {
      direction = turnDirection(turnDirection(context.robot.direction, 'right'), 'right');
      isMoveCommand = true;
    } else if (clause.includes('up') || clause.includes('north')) {
      direction = 'up';
      isMoveCommand = true;
    } else if (clause.includes('down') || clause.includes('south')) {
      direction = 'down';
      isMoveCommand = true;
    } else if (clause.includes('left') || clause.includes('west')) {
      direction = 'left';
      isMoveCommand = true;
    } else if (clause.includes('right') || clause.includes('east')) {
      direction = 'right';
      isMoveCommand = true;
    } else if (clause.includes('step') || clause.includes('move') || clause.includes('go') || clause.includes('walk')) {
      direction = context.robot.direction;
      isMoveCommand = true;
    }

    if (isMoveCommand) {
      actions.push({
        type: 'move',
        direction,
        steps: Math.min(20, Math.max(1, steps)),
      });
    }

    return actions;
  }

  private findMatchingEntity(clause: string, context: GameContext) {
    for (const entity of context.entities) {
      if (clause.includes(entity.type.toLowerCase())) return entity;
      if (entity.color && clause.includes(entity.color.toLowerCase())) return entity;
      if (clause.includes(entity.id.toLowerCase())) return entity;
    }
    return null;
  }

  private simplePathTo(fromX: number, fromY: number, toX: number, toY: number): Direction[] {
    const steps: Direction[] = [];
    let curX = fromX;
    let curY = fromY;

    // Direct Manhattan path for translation into actions
    while (curX < toX) { steps.push('right'); curX++; }
    while (curX > toX) { steps.push('left'); curX--; }
    while (curY < toY) { steps.push('down'); curY++; }
    while (curY > toY) { steps.push('up'); curY--; }

    return steps;
  }

  private groupPathSteps(path: Direction[]): RobotAction[] {
    if (path.length === 0) return [];
    const grouped: RobotAction[] = [];
    let currentDir = path[0];
    let count = 0;

    for (const dir of path) {
      if (dir === currentDir && count < 20) {
        count++;
      } else {
        grouped.push({ type: 'move', direction: currentDir, steps: count });
        currentDir = dir;
        count = 1;
      }
    }
    if (count > 0) {
      grouped.push({ type: 'move', direction: currentDir, steps: count });
    }
    return grouped;
  }

  async dispose(): Promise<void> {
    this.status = 'uninitialized';
  }
}
