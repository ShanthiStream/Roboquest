export type Direction = 'up' | 'down' | 'left' | 'right';

export type RobotAction =
  | { type: "move"; direction: Direction; steps: number; confidence?: number }
  | { type: "turn"; direction: "left" | "right"; confidence?: number }
  | { type: "collect"; targetId: string; confidence?: number }
  | { type: "interact"; targetId: string; confidence?: number }
  | { type: "push"; direction: Direction; confidence?: number }
  | { type: "wait"; ticks: number; confidence?: number }
  | { type: "recharge"; confidence?: number }
  | { type: "inspect"; targetId?: string; confidence?: number };

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
  confidence?: number;
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
