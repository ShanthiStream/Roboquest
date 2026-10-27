export type Direction = 'up' | 'down' | 'left' | 'right';

export type RobotAction =
  | { type: "move"; direction: Direction; steps: number }
  | { type: "turn"; direction: "left" | "right" }
  | { type: "collect"; targetId: string }
  | { type: "interact"; targetId: string }
  | { type: "push"; direction: Direction }
  | { type: "wait"; ticks: number }
  | { type: "recharge" }
  | { type: "inspect"; targetId?: string };

export interface VisibleEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  color?: string;
  state?: string;
  properties?: Record<string, any>;
}

export interface GameContext {
  robot: {
    x: number;
    y: number;
    direction: Direction;
    energy: number;
    inventory: string[];
  };
  entities: VisibleEntity[];
  mapSize: {
    width: number;
    height: number;
  };
  exitPosition: { x: number; y: number };
  levelTitle: string;
  objectives: string[];
}

export interface CommandResult {
  success: boolean;
  actions: RobotAction[];
  rawOutput: string;
  latencyMs: number;
  adapterName: string;
  validationError?: string;
  explanation?: string;
}

export interface AICommandAdapter {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isFallback: boolean;
  readonly status: 'uninitialized' | 'loading' | 'ready' | 'error';
  readonly statusMessage?: string;
  
  initialize(): Promise<void>;
  parseCommand(instruction: string, context: GameContext): Promise<CommandResult>;
  dispose(): Promise<void>;
}
