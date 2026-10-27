import { Direction } from '../ai/types';

export type TileType = 'floor' | 'wall' | 'hazard' | 'charging-pad' | 'ice';

export interface BaseEntity {
  id: string;
  x: number;
  y: number;
}

export interface BatteryEntity extends BaseEntity {
  type: 'battery';
  energyValue: number;
  collected?: boolean;
}

export interface KeyEntity extends BaseEntity {
  type: 'key';
  color: 'blue' | 'yellow' | 'red' | 'green';
  collected?: boolean;
}

export interface DoorEntity extends BaseEntity {
  type: 'door';
  color: 'blue' | 'yellow' | 'red' | 'green';
  isOpen: boolean;
}

export interface SwitchEntity extends BaseEntity {
  type: 'switch';
  targetDoorId: string;
  isActive: boolean;
}

export interface PressurePlateEntity extends BaseEntity {
  type: 'pressure-plate';
  targetDoorId: string;
  isPressed: boolean;
}

export interface CrateEntity extends BaseEntity {
  type: 'crate';
}

export interface TeleporterEntity extends BaseEntity {
  type: 'teleporter';
  targetX: number;
  targetY: number;
  pairColor: string;
}

export interface LaserEntity extends BaseEntity {
  type: 'laser';
  direction: 'horizontal' | 'vertical';
  length: number;
  period: number; // e.g. every 2 ticks
  activeTicks: number; // active for 1 tick
  currentTick: number;
  isActive: boolean;
}

export interface ExitEntity extends BaseEntity {
  type: 'exit';
}

export type GameEntity =
  | BatteryEntity
  | KeyEntity
  | DoorEntity
  | SwitchEntity
  | PressurePlateEntity
  | CrateEntity
  | TeleporterEntity
  | LaserEntity
  | ExitEntity;

export interface RobotCosmetics {
  color: 'electric-blue' | 'neon-green' | 'sunset-orange' | 'cosmic-purple' | 'classic-silver';
  accessory: 'none' | 'antenna' | 'space-helmet' | 'mini-jetpack' | 'scientist-glasses' | 'golden-crown';
  trail: 'none' | 'sparkle' | 'electric' | 'rainbow' | 'pixel';
}

export interface RobotState {
  x: number;
  y: number;
  direction: Direction;
  energy: number;
  maxEnergy: number;
  inventory: string[]; // key ids or items
}

export interface LevelDefinition {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Expert';
  description: string;
  mapSize: { width: number; height: number };
  tiles: TileType[][];
  robotStart: {
    x: number;
    y: number;
    direction: Direction;
    energy: number;
  };
  entities: GameEntity[];
  hints: [string, string, string];
  parCommands: number;
  parSteps: number;
  verifiedSolution: string[]; // representative commands guaranteed to solve level
}

export interface GameSnapshot {
  robot: RobotState;
  entities: GameEntity[];
  status: 'playing' | 'won' | 'lost' | 'paused';
  stepsTaken: number;
  commandsUsed: number;
  lastMessage: string;
  ticks: number;
}
