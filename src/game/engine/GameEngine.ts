import { Direction, GameContext, RobotAction } from '../../ai/types';
import { sound } from '../../audio/SoundSystem';
import {
  BatteryEntity,
  CrateEntity,
  DoorEntity,
  ExitEntity,
  GameEntity,
  GameSnapshot,
  KeyEntity,
  LaserEntity,
  LevelDefinition,
  PressurePlateEntity,
  RobotState,
  SwitchEntity,
  TeleporterEntity,
  TileType,
} from '../types';

export interface ActionExecutionListener {
  onStepStart?: (action: RobotAction, index: number, total: number) => void;
  onStepComplete?: (action: RobotAction, snapshot: GameSnapshot) => void;
  onLevelComplete?: (snapshot: GameSnapshot) => void;
  onGameOver?: (reason: string, snapshot: GameSnapshot) => void;
  onMessage?: (message: string) => void;
}

export class GameEngine {
  private level: LevelDefinition;
  private robot: RobotState;
  private entities: GameEntity[];
  private tiles: TileType[][];
  private status: 'playing' | 'won' | 'lost' | 'paused' = 'playing';
  private stepsTaken: number = 0;
  private commandsUsed: number = 0;
  private ticks: number = 0;
  private lastMessage: string = 'Robot systems online.';
  private history: GameSnapshot[] = [];
  private isExecuting: boolean = false;

  constructor(level: LevelDefinition) {
    this.level = level;
    this.tiles = JSON.parse(JSON.stringify(level.tiles));
    this.robot = {
      x: level.robotStart.x,
      y: level.robotStart.y,
      direction: level.robotStart.direction,
      energy: level.robotStart.energy,
      maxEnergy: 100,
      inventory: [],
    };
    this.entities = JSON.parse(JSON.stringify(level.entities));
    this.saveSnapshot();
  }

  reset() {
    this.tiles = JSON.parse(JSON.stringify(this.level.tiles));
    this.robot = {
      x: this.level.robotStart.x,
      y: this.level.robotStart.y,
      direction: this.level.robotStart.direction,
      energy: this.level.robotStart.energy,
      maxEnergy: 100,
      inventory: [],
    };
    this.entities = JSON.parse(JSON.stringify(this.level.entities));
    this.status = 'playing';
    this.stepsTaken = 0;
    this.commandsUsed = 0;
    this.ticks = 0;
    this.lastMessage = 'Level reset. Systems ready.';
    this.history = [];
    this.saveSnapshot();
  }

  undo(): boolean {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current state
      const prev = this.history[this.history.length - 1];
      this.restoreSnapshot(prev);
      this.lastMessage = 'Reverted previous action.';
      return true;
    }
    return false;
  }

  private saveSnapshot() {
    this.history.push(this.getSnapshot());
    if (this.history.length > 50) this.history.shift();
  }

  private restoreSnapshot(snap: GameSnapshot) {
    this.robot = JSON.parse(JSON.stringify(snap.robot));
    this.entities = JSON.parse(JSON.stringify(snap.entities));
    this.status = snap.status;
    this.stepsTaken = snap.stepsTaken;
    this.commandsUsed = snap.commandsUsed;
    this.ticks = snap.ticks;
    this.lastMessage = snap.lastMessage;
  }

  getSnapshot(): GameSnapshot {
    return {
      robot: JSON.parse(JSON.stringify(this.robot)),
      entities: JSON.parse(JSON.stringify(this.entities)),
      status: this.status,
      stepsTaken: this.stepsTaken,
      commandsUsed: this.commandsUsed,
      lastMessage: this.lastMessage,
      ticks: this.ticks,
    };
  }

  getTiles(): TileType[][] {
    return this.tiles;
  }

  getLevel(): LevelDefinition {
    return this.level;
  }

  toGameContext(): GameContext {
    const exit = this.entities.find(e => e.type === 'exit') || { x: 0, y: 0 };
    return {
      robot: {
        x: this.robot.x,
        y: this.robot.y,
        direction: this.robot.direction,
        energy: this.robot.energy,
        inventory: [...this.robot.inventory],
      },
      entities: this.entities.map(e => ({
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        color: (e as any).color,
        state: (e as any).isOpen ? 'open' : (e as any).isActive ? 'active' : undefined,
      })),
      mapSize: { width: this.level.mapSize.width, height: this.level.mapSize.height },
      exitPosition: { x: exit.x, y: exit.y },
      levelTitle: this.level.title,
      objectives: [this.level.description],
    };
  }

  async executeActions(
    actions: RobotAction[],
    listener?: ActionExecutionListener,
    delayMs: number = 220
  ): Promise<boolean> {
    if (this.isExecuting || this.status !== 'playing') return false;
    this.isExecuting = true;
    this.commandsUsed++;

    for (let i = 0; i < actions.length; i++) {
      if (this.status !== 'playing') break;

      const act = actions[i];
      listener?.onStepStart?.(act, i, actions.length);

      this.executeSingleAction(act);
      this.updateEnvironmentalHazards();
      this.checkTriggers();

      listener?.onStepComplete?.(act, this.getSnapshot());

      if (delayMs > 0 && i < actions.length - 1 && this.status === 'playing') {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    this.saveSnapshot();
    this.isExecuting = false;

    if ((this.status as string) === 'won') {
      sound.playVictory();
      listener?.onLevelComplete?.(this.getSnapshot());
      return true;
    } else if ((this.status as string) === 'lost') {
      sound.playError();
      listener?.onGameOver?.(this.lastMessage, this.getSnapshot());
      return false;
    }

    return true;
  }

  private executeSingleAction(action: RobotAction) {
    switch (action.type) {
      case 'turn': {
        this.robot.direction = this.calcTurn(this.robot.direction, action.direction);
        this.lastMessage = `Turned ${action.direction}.`;
        sound.playFootstep();
        break;
      }
      case 'move': {
        this.robot.direction = action.direction;
        let successSteps = 0;
        for (let s = 0; s < action.steps; s++) {
          if (this.robot.energy <= 0) {
            this.status = 'lost';
            this.lastMessage = 'Energy exhausted! The robot powered down.';
            break;
          }

          const nextPos = this.getNextCoord(this.robot.x, this.robot.y, action.direction);
          if (this.isPassable(nextPos.x, nextPos.y)) {
            this.robot.x = nextPos.x;
            this.robot.y = nextPos.y;
            this.robot.energy = Math.max(0, this.robot.energy - 2);
            this.stepsTaken++;
            successSteps++;
            sound.playFootstep();

            // Auto-collect items if stepped on
            this.autoCollectAt(this.robot.x, this.robot.y);
            // Check tile effects
            this.checkTileEffects(this.robot.x, this.robot.y);
          } else {
            sound.playError();
            this.lastMessage = `Obstacle at (${nextPos.x}, ${nextPos.y}) blocked movement.`;
            break;
          }
        }
        if (successSteps > 0 && this.status === 'playing') {
          this.lastMessage = `Moved ${successSteps} step(s) ${action.direction}.`;
        }
        break;
      }
      case 'collect': {
        const item = this.entities.find(e => e.id === action.targetId || (e.x === this.robot.x && e.y === this.robot.y));
        if (item && item.x === this.robot.x && item.y === this.robot.y) {
          this.collectItem(item);
        } else {
          this.lastMessage = 'No item in reach to collect.';
        }
        break;
      }
      case 'interact': {
        this.interactFacing();
        break;
      }
      case 'push': {
        this.pushCrate(action.direction);
        break;
      }
      case 'wait': {
        for (let t = 0; t < action.ticks; t++) {
          this.ticks++;
          this.robot.energy = Math.max(0, this.robot.energy - 1);
        }
        this.lastMessage = `Waited ${action.ticks} cycle(s).`;
        break;
      }
      case 'recharge': {
        if (this.tiles[this.robot.y]?.[this.robot.x] === 'charging-pad') {
          this.robot.energy = this.robot.maxEnergy;
          sound.playCollect();
          this.lastMessage = 'Battery fully recharged to 100%! Power restored.';
        } else {
          this.lastMessage = 'Must be standing on a charging pad to recharge.';
        }
        break;
      }
      case 'inspect': {
        const target = this.entities.find(e => e.id === action.targetId);
        if (target) {
          this.lastMessage = `Sensor scan: ${target.type} located at (${target.x}, ${target.y}).`;
        } else {
          this.lastMessage = `Sensor scan: Robot at (${this.robot.x}, ${this.robot.y}) facing ${this.robot.direction}. Energy: ${this.robot.energy}%.`;
        }
        break;
      }
    }
  }

  private calcTurn(cur: Direction, turn: 'left' | 'right'): Direction {
    const order: Direction[] = ['up', 'right', 'down', 'left'];
    const idx = order.indexOf(cur);
    return turn === 'right' ? order[(idx + 1) % 4] : order[(idx + 3) % 4];
  }

  private getNextCoord(x: number, y: number, dir: Direction) {
    if (dir === 'up') return { x, y: y - 1 };
    if (dir === 'down') return { x, y: y + 1 };
    if (dir === 'left') return { x: x - 1, y };
    return { x: x + 1, y };
  }

  private isPassable(x: number, y: number): boolean {
    if (x < 0 || x >= this.level.mapSize.width || y < 0 || y >= this.level.mapSize.height) {
      return false;
    }
    if (this.tiles[y][x] === 'wall') return false;

    // Check closed doors
    const door = this.entities.find(e => e.type === 'door' && e.x === x && e.y === y) as DoorEntity | undefined;
    if (door && !door.isOpen) {
      const keyColor = door.color;
      const hasKey = this.robot.inventory.some(k => k.includes(keyColor));
      if (hasKey) {
        door.isOpen = true;
        sound.playUnlock();
        this.lastMessage = `Used ${keyColor} key to unlock door!`;
        return true;
      }
      return false;
    }

    // Check crates
    const crate = this.entities.find(e => e.type === 'crate' && e.x === x && e.y === y);
    if (crate) return false;

    return true;
  }

  private autoCollectAt(x: number, y: number) {
    const item = this.entities.find(e => (e.type === 'battery' || e.type === 'key') && e.x === x && e.y === y);
    if (item) {
      this.collectItem(item);
    }
  }

  private collectItem(item: GameEntity) {
    if (item.type === 'battery') {
      const bat = item as BatteryEntity;
      this.robot.energy = Math.min(this.robot.maxEnergy, this.robot.energy + bat.energyValue);
      this.entities = this.entities.filter(e => e.id !== bat.id);
      sound.playCollect();
      this.lastMessage = `Energy battery acquired! +${bat.energyValue}% energy.`;
    } else if (item.type === 'key') {
      const key = item as KeyEntity;
      this.robot.inventory.push(key.id);
      if (!this.robot.inventory.includes(key.color)) {
        this.robot.inventory.push(key.color);
      }
      this.entities = this.entities.filter(e => e.id !== key.id);
      sound.playCollect();
      this.lastMessage = `Acquired ${key.color} security key!`;
    }
  }

  private interactFacing() {
    const next = this.getNextCoord(this.robot.x, this.robot.y, this.robot.direction);
    let door = this.entities.find(e => e.type === 'door' && e.x === next.x && e.y === next.y) as DoorEntity | undefined;
    if (!door) {
      door = this.entities.find(e => e.type === 'door' && Math.abs(e.x - this.robot.x) + Math.abs(e.y - this.robot.y) <= 1) as DoorEntity | undefined;
    }
    if (door) {
      if (door.isOpen) {
        this.lastMessage = 'Door is already unlocked.';
        return;
      }
      // Check for key
      const keyColor = door.color;
      const hasKey = this.robot.inventory.some(k => k.includes(keyColor));
      if (hasKey) {
        door.isOpen = true;
        sound.playUnlock();
        this.lastMessage = `Used ${keyColor} key to unlock door!`;
        return;
      } else {
        sound.playError();
        this.lastMessage = `Door is locked. Requires ${keyColor} key.`;
        return;
      }
    }

    const sw = this.entities.find(e => e.type === 'switch' && e.x === next.x && e.y === next.y) as SwitchEntity | undefined;
    if (sw) {
      sw.isActive = !sw.isActive;
      sound.playSwitch();
      const targetDoor = this.entities.find(e => e.id === sw.targetDoorId) as DoorEntity | undefined;
      if (targetDoor) {
        targetDoor.isOpen = sw.isActive;
        this.lastMessage = `Switch toggled. Blast door ${targetDoor.isOpen ? 'opened' : 'closed'}.`;
      }
      return;
    }

    this.lastMessage = 'No interactive control panel in front of robot.';
  }

  private pushCrate(dir: Direction) {
    let targetDir = dir;
    let crateCoord = this.getNextCoord(this.robot.x, this.robot.y, targetDir);
    let crate = this.entities.find(e => e.type === 'crate' && e.x === crateCoord.x && e.y === crateCoord.y) as CrateEntity | undefined;

    // If no crate in target direction, check if there is an adjacent crate
    if (!crate) {
      const adjacentCrates = this.entities.filter(e =>
        e.type === 'crate' && Math.abs(e.x - this.robot.x) + Math.abs(e.y - this.robot.y) === 1
      ) as CrateEntity[];

      if (adjacentCrates.length === 1) {
        crate = adjacentCrates[0];
        if (crate.x > this.robot.x) targetDir = 'right';
        else if (crate.x < this.robot.x) targetDir = 'left';
        else if (crate.y > this.robot.y) targetDir = 'down';
        else if (crate.y < this.robot.y) targetDir = 'up';
        crateCoord = { x: crate.x, y: crate.y };
      }
    }

    if (!crate) {
      this.lastMessage = 'No movable crate in that direction to push.';
      return;
    }

    const pushTo = this.getNextCoord(crateCoord.x, crateCoord.y, targetDir);
    if (!this.isPassable(pushTo.x, pushTo.y)) {
      sound.playError();
      this.lastMessage = 'Crate path is blocked.';
      return;
    }

    // Move crate
    crate.x = pushTo.x;
    crate.y = pushTo.y;
    sound.playSwitch();
    this.lastMessage = `Crate pushed to (${pushTo.x}, ${pushTo.y}).`;

    // Move robot into old crate pos and face pushed direction
    this.robot.x = crateCoord.x;
    this.robot.y = crateCoord.y;
    this.robot.direction = targetDir;
    this.stepsTaken++;

    // Update pressure plates
    this.updatePressurePlates();
  }

  private updatePressurePlates() {
    const plates = this.entities.filter(e => e.type === 'pressure-plate') as PressurePlateEntity[];
    for (const plate of plates) {
      const hasCrateOrRobot =
        (this.robot.x === plate.x && this.robot.y === plate.y) ||
        this.entities.some(e => e.type === 'crate' && e.x === plate.x && e.y === plate.y);

      plate.isPressed = hasCrateOrRobot;
      const door = this.entities.find(e => e.id === plate.targetDoorId) as DoorEntity | undefined;
      if (door) {
        door.isOpen = plate.isPressed;
        if (plate.isPressed) {
          sound.playUnlock();
        }
      }
    }
  }

  private checkTileEffects(x: number, y: number) {
    // Charging pad
    if (this.tiles[y]?.[x] === 'charging-pad') {
      this.robot.energy = Math.min(this.robot.maxEnergy, this.robot.energy + 10);
    }
    // Hazard tile
    if (this.tiles[y]?.[x] === 'hazard') {
      this.robot.energy = Math.max(0, this.robot.energy - 35);
      sound.playError();
      if (this.robot.energy <= 0) {
        this.status = 'lost';
        this.lastMessage = 'Severe damage from hazard tile! Robot failed.';
      }
    }
    // Teleporter
    const teleporter = this.entities.find(e => e.type === 'teleporter' && e.x === x && e.y === y) as TeleporterEntity | undefined;
    if (teleporter) {
      sound.playPortal();
      this.robot.x = teleporter.targetX;
      this.robot.y = teleporter.targetY;
      this.lastMessage = 'Quantum teleportation sequence complete!';
    }

    this.updatePressurePlates();
  }

  private updateEnvironmentalHazards() {
    this.ticks++;

    // Update lasers
    const lasers = this.entities.filter(e => e.type === 'laser') as LaserEntity[];
    for (const laser of lasers) {
      laser.currentTick = (laser.currentTick + 1) % laser.period;
      laser.isActive = laser.currentTick < laser.activeTicks;

      // Check if robot is in active laser beam
      if (laser.isActive) {
        let hit = false;
        if (laser.direction === 'vertical' && this.robot.x === laser.x && this.robot.y >= laser.y && this.robot.y < laser.y + laser.length) {
          hit = true;
        } else if (laser.direction === 'horizontal' && this.robot.y === laser.y && this.robot.x >= laser.x && this.robot.x < laser.x + laser.length) {
          hit = true;
        }

        if (hit) {
          sound.playLaserWarning();
          this.robot.energy = Math.max(0, this.robot.energy - 40);
          this.lastMessage = 'Warning! Laser beam struck chassis (-40% Energy)!';
          if (this.robot.energy <= 0) {
            this.status = 'lost';
            this.lastMessage = 'Critical damage: Destroyed by security laser!';
          }
        }
      }
    }
  }

  private checkTriggers() {
    if (this.status !== 'playing') return;

    // Check battery requirements
    const remainingBatteries = this.entities.filter(e => e.type === 'battery');

    // Check exit portal
    const exit = this.entities.find(e => e.type === 'exit') as ExitEntity | undefined;
    if (exit && this.robot.x === exit.x && this.robot.y === exit.y) {
      if (remainingBatteries.length > 0 && this.level.id === 2) {
        this.lastMessage = `Portal requires all batteries! (${remainingBatteries.length} remaining).`;
        return;
      }
      this.status = 'won';
      this.lastMessage = 'Mission accomplished! Portal jump successful.';
    }
  }
}
