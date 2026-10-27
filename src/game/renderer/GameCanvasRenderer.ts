import { GameEntity, LaserEntity, RobotCosmetics, RobotState, TileType } from '../types';

export class GameCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private tileSize: number = 64;
  private cameraX: number = 0;
  private cameraY: number = 0;

  // Robot render interpolation
  private robotCurrentX: number = 0;
  private robotCurrentY: number = 0;
  private robotTargetX: number = 0;
  private robotTargetY: number = 0;
  private robotDirection: string = 'right';
  private walkBob: number = 0;
  private eyeBlinkTimer: number = 0;
  private eyeBlinking: boolean = false;
  private idleTime: number = 0;

  // Particle systems
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
    maxLife: number;
  }> = [];

  // Cached state references
  private tiles: TileType[][] = [];
  private entities: GameEntity[] = [];
  private cosmetics: RobotCosmetics = {
    color: 'electric-blue',
    accessory: 'antenna',
    trail: 'sparkle',
  };

  private initialized: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    if (canvas.parentElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(canvas.parentElement);
    }
  }

  private handleResize = () => {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: 600 };
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(300, rect.width || window.innerWidth);
    const h = Math.max(300, rect.height || 500);

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  };

  start() {
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      this.update(dt);
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  syncState(robot: RobotState, entities: GameEntity[], tiles: TileType[][], cosmetics?: RobotCosmetics) {
    this.tiles = tiles;
    this.entities = entities;
    if (cosmetics) this.cosmetics = cosmetics;

    this.robotTargetX = robot.x;
    this.robotTargetY = robot.y;
    this.robotDirection = robot.direction;

    // First time sync init or level reset
    if (!this.initialized) {
      this.initialized = true;
      this.robotCurrentX = robot.x;
      this.robotCurrentY = robot.y;
      const dpr = window.devicePixelRatio || 1;
      const viewW = (this.canvas.width || 800) / dpr;
      const viewH = (this.canvas.height || 600) / dpr;
      this.cameraX = this.robotCurrentX * this.tileSize + this.tileSize / 2 - viewW / 2;
      this.cameraY = this.robotCurrentY * this.tileSize + this.tileSize / 2 - viewH / 2;
    }
  }

  private update(dt: number) {
    this.idleTime += dt;

    // Lerp robot position for fluid smooth motion
    const lerpSpeed = 12 * dt;
    const dx = this.robotTargetX - this.robotCurrentX;
    const dy = this.robotTargetY - this.robotCurrentY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.01) {
      this.robotCurrentX += dx * lerpSpeed;
      this.robotCurrentY += dy * lerpSpeed;
      this.walkBob += dt * 18;

      // Spawn trail particles
      if (this.cosmetics.trail !== 'none' && Math.random() < 0.6) {
        this.spawnTrailParticle();
      }
    } else {
      this.robotCurrentX = this.robotTargetX;
      this.robotCurrentY = this.robotTargetY;
      this.walkBob = Math.sin(this.idleTime * 3) * 0.15;
    }

    // Eye blinking
    this.eyeBlinkTimer += dt;
    if (this.eyeBlinkTimer > 3.5) {
      this.eyeBlinking = true;
      if (this.eyeBlinkTimer > 3.65) {
        this.eyeBlinking = false;
        this.eyeBlinkTimer = 0;
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Camera follow robot
    const dpr = window.devicePixelRatio || 1;
    const viewW = this.canvas.width / dpr;
    const viewH = this.canvas.height / dpr;

    // Center camera on robot
    const targetCamX = this.robotCurrentX * this.tileSize + this.tileSize / 2 - viewW / 2;
    const targetCamY = this.robotCurrentY * this.tileSize + this.tileSize / 2 - viewH / 2;

    this.cameraX += (targetCamX - this.cameraX) * 8 * dt;
    this.cameraY += (targetCamY - this.cameraY) * 8 * dt;
  }

  private spawnTrailParticle() {
    const rx = (this.robotCurrentX + 0.5) * this.tileSize;
    const ry = (this.robotCurrentY + 0.7) * this.tileSize;
    let color = '#00f0ff';
    if (this.cosmetics.trail === 'rainbow') {
      const hues = ['#ff0055', '#ff9900', '#00ffcc', '#0099ff', '#b026ff'];
      color = hues[Math.floor(Math.random() * hues.length)];
    } else if (this.cosmetics.trail === 'electric') {
      color = '#00ffaa';
    } else if (this.cosmetics.trail === 'pixel') {
      color = '#ffb300';
    }

    this.particles.push({
      x: rx + (Math.random() - 0.5) * 16,
      y: ry + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 20 - 15,
      color,
      size: Math.random() * 4 + 2,
      life: 0,
      maxLife: 0.5,
    });
  }

  private render() {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    this.ctx.save();
    this.ctx.scale(dpr, dpr);

    this.ctx.clearRect(0, 0, width, height);

    // Dark sci-fi laboratory background
    this.ctx.fillStyle = '#070b19';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Render floor & tiles
    this.renderMapTiles();

    // Render floor entities (plates, portals, exits)
    this.renderFloorEntities();

    // Render lasers
    this.renderLasers();

    // Render midground entities (batteries, keys, doors, switches, crates)
    this.renderInteractableEntities();

    // Render particles
    this.renderParticles();

    // Render robot character
    this.renderRobot();

    this.ctx.restore();
    this.ctx.restore();
  }

  private renderMapTiles() {
    if (!this.tiles || this.tiles.length === 0) return;
    const rows = this.tiles.length;
    const cols = this.tiles[0].length;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = this.tiles[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        if (tile === 'wall') {
          // Futuristic dark metal barrier
          this.ctx.fillStyle = '#14203d';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

          // Neon edge trim
          this.ctx.strokeStyle = '#1e305b';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);

          this.ctx.fillStyle = '#0d1527';
          this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);

          // Top bevel
          this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
          this.ctx.fillRect(px + 6, py + 6, this.tileSize - 12, 4);
        } else if (tile === 'hazard') {
          // Warning hazard stripes
          this.ctx.fillStyle = '#220814';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

          this.ctx.fillStyle = 'rgba(255, 51, 102, 0.4)';
          for (let i = -this.tileSize; i < this.tileSize * 2; i += 16) {
            this.ctx.beginPath();
            this.ctx.moveTo(px + i, py);
            this.ctx.lineTo(px + i + 8, py);
            this.ctx.lineTo(px + i + 8 - this.tileSize, py + this.tileSize);
            this.ctx.lineTo(px + i - this.tileSize, py + this.tileSize);
            this.ctx.fill();
          }

          this.ctx.strokeStyle = '#ff3366';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 'charging-pad') {
          // Glowing energy charging pad
          this.ctx.fillStyle = '#0a232b';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

          const glow = (Math.sin(this.idleTime * 4) + 1) * 0.5;
          this.ctx.strokeStyle = `rgba(0, 255, 170, ${0.4 + glow * 0.4})`;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);

          // Bolt symbol
          this.ctx.fillStyle = '#00ffaa';
          this.ctx.beginPath();
          this.ctx.moveTo(px + 34, py + 16);
          this.ctx.lineTo(px + 24, py + 34);
          this.ctx.lineTo(px + 32, py + 34);
          this.ctx.lineTo(px + 30, py + 48);
          this.ctx.lineTo(px + 42, py + 28);
          this.ctx.lineTo(px + 34, py + 28);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          // Standard lab floor tile
          this.ctx.fillStyle = '#0c1324';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

          // Subtle grid line
          this.ctx.strokeStyle = '#121b33';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

          // Micro dot
          this.ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
          this.ctx.fillRect(px + this.tileSize / 2 - 1, py + this.tileSize / 2 - 1, 2, 2);
        }
      }
    }
  }

  private renderFloorEntities() {
    for (const ent of this.entities) {
      const px = ent.x * this.tileSize;
      const py = ent.y * this.tileSize;

      if (ent.type === 'exit') {
        // Glowing portal exit
        const pulse = Math.sin(this.idleTime * 5) * 4;
        const grad = this.ctx.createRadialGradient(
          px + 32, py + 32, 4,
          px + 32, py + 32, 26 + pulse
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#00ffaa');
        grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.5)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 28 + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Portal spinning rings
        this.ctx.strokeStyle = '#00ffaa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 18, this.idleTime * 3, this.idleTime * 3 + Math.PI * 1.5);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 12, -this.idleTime * 4, -this.idleTime * 4 + Math.PI * 1.5);
        this.ctx.stroke();
      } else if (ent.type === 'pressure-plate') {
        const plate = ent as any;
        this.ctx.fillStyle = plate.isPressed ? '#1e305b' : '#14203d';
        this.ctx.strokeStyle = plate.isPressed ? '#00ffaa' : '#ffb300';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(px + 10, py + 10, 44, 44);
        this.ctx.strokeRect(px + 10, py + 10, 44, 44);

        this.ctx.fillStyle = plate.isPressed ? '#00ffaa' : '#ffb300';
        this.ctx.fillRect(px + 24, py + 24, 16, 16);
      } else if (ent.type === 'teleporter') {
        const tele = ent as any;
        const pulse = Math.sin(this.idleTime * 6) * 3;
        this.ctx.strokeStyle = tele.pairColor || '#b026ff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 20 + pulse, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = tele.pairColor || '#b026ff';
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private renderLasers() {
    const lasers = this.entities.filter(e => e.type === 'laser') as LaserEntity[];
    for (const laser of lasers) {
      const px = laser.x * this.tileSize;
      const py = laser.y * this.tileSize;

      // Emitter base
      this.ctx.fillStyle = '#ff3366';
      this.ctx.fillRect(px + 22, py + 22, 20, 20);

      if (laser.isActive) {
        this.ctx.save();
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 12;

        if (laser.direction === 'vertical') {
          const beamLength = laser.length * this.tileSize;
          this.ctx.fillStyle = '#ff3366';
          this.ctx.fillRect(px + 30, py + 32, 4, beamLength);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(px + 31, py + 32, 2, beamLength);
        } else {
          const beamLength = laser.length * this.tileSize;
          this.ctx.fillStyle = '#ff3366';
          this.ctx.fillRect(px + 32, py + 30, beamLength, 4);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(px + 32, py + 31, beamLength, 2);
        }
        this.ctx.restore();
      }
    }
  }

  private renderInteractableEntities() {
    for (const ent of this.entities) {
      const px = ent.x * this.tileSize;
      const py = ent.y * this.tileSize;

      if (ent.type === 'battery') {
        const floatY = Math.sin(this.idleTime * 4 + ent.x) * 4;
        // Battery cylinder body
        this.ctx.fillStyle = '#0d1527';
        this.ctx.strokeStyle = '#00ffaa';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(px + 20, py + 18 + floatY, 24, 30);
        this.ctx.strokeRect(px + 20, py + 18 + floatY, 24, 30);

        // Terminal nipple
        this.ctx.fillStyle = '#00ffaa';
        this.ctx.fillRect(px + 27, py + 14 + floatY, 10, 4);

        // Energy cells bars
        this.ctx.fillStyle = '#00ffaa';
        this.ctx.fillRect(px + 24, py + 24 + floatY, 16, 5);
        this.ctx.fillRect(px + 24, py + 32 + floatY, 16, 5);
        this.ctx.fillRect(px + 24, py + 40 + floatY, 16, 5);
      } else if (ent.type === 'key') {
        const key = ent as any;
        const color = key.color === 'blue' ? '#00f0ff' : key.color === 'yellow' ? '#ffb300' : key.color === 'red' ? '#ff3366' : '#00ffaa';
        const floatY = Math.sin(this.idleTime * 4 + ent.y) * 4;

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;

        // Key bow
        this.ctx.beginPath();
        this.ctx.arc(px + 26, py + 32 + floatY, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Key blade
        this.ctx.fillRect(px + 32, py + 30 + floatY, 16, 4);
        this.ctx.fillRect(px + 42, py + 34 + floatY, 3, 5);
        this.ctx.fillRect(px + 46, py + 34 + floatY, 3, 4);
      } else if (ent.type === 'door') {
        const door = ent as any;
        const color = door.color === 'blue' ? '#00f0ff' : door.color === 'yellow' ? '#ffb300' : door.color === 'red' ? '#ff3366' : '#00ffaa';

        if (door.isOpen) {
          // Sliding open door frame
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px + 4, py + 4, 10, this.tileSize - 8);
          this.ctx.strokeRect(px + this.tileSize - 14, py + 4, 10, this.tileSize - 8);
        } else {
          // Closed reinforced door
          this.ctx.fillStyle = '#14203d';
          this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 3;
          this.ctx.strokeRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);

          // Lock badge in center
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(px + 32, py + 32, 8, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else if (ent.type === 'switch') {
        const sw = ent as any;
        this.ctx.fillStyle = '#14203d';
        this.ctx.fillRect(px + 16, py + 16, 32, 32);

        this.ctx.fillStyle = sw.isActive ? '#00ffaa' : '#ff3366';
        this.ctx.beginPath();
        this.ctx.arc(px + 32, py + 32, 8, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (ent.type === 'crate') {
        // Metallic storage crate
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(px + 8, py + 8, 48, 48);

        this.ctx.strokeStyle = '#d4a373';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(px + 8, py + 8, 48, 48);

        // Cross braces
        this.ctx.beginPath();
        this.ctx.moveTo(px + 8, py + 8);
        this.ctx.lineTo(px + 56, py + 56);
        this.ctx.moveTo(px + 56, py + 8);
        this.ctx.lineTo(px + 8, py + 56);
        this.ctx.stroke();
      }
    }
  }

  private renderParticles() {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    this.ctx.globalAlpha = 1;
  }

  private renderRobot() {
    const rx = this.robotCurrentX * this.tileSize + 32;
    const ry = this.robotCurrentY * this.tileSize + 32 + this.walkBob;

    this.ctx.save();
    this.ctx.translate(rx, ry);

    // Robot body colors
    let primaryColor = '#00f0ff';
    let chassisColor = '#14203d';
    if (this.cosmetics.color === 'neon-green') primaryColor = '#00ffaa';
    else if (this.cosmetics.color === 'sunset-orange') primaryColor = '#ff7700';
    else if (this.cosmetics.color === 'cosmic-purple') primaryColor = '#b026ff';
    else if (this.cosmetics.color === 'classic-silver') primaryColor = '#cbd5e1';

    // Wheels/Treads shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 20, 18, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Wheels base
    this.ctx.fillStyle = '#0d1527';
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(-14, 14, 28, 8, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Body Chassis
    this.ctx.fillStyle = chassisColor;
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-16, -14, 32, 26, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Visor screen
    this.ctx.fillStyle = '#070b19';
    this.ctx.beginPath();
    this.ctx.roundRect(-12, -10, 24, 15, 4);
    this.ctx.fill();

    // Eyes
    let eyeOffsetX = 0;
    if (this.robotDirection === 'left') eyeOffsetX = -3;
    if (this.robotDirection === 'right') eyeOffsetX = 3;

    if (!this.eyeBlinking) {
      this.ctx.fillStyle = '#00ffaa';
      // Left eye
      this.ctx.beginPath();
      this.ctx.arc(-5 + eyeOffsetX, -3, 3, 0, Math.PI * 2);
      this.ctx.fill();
      // Right eye
      this.ctx.beginPath();
      this.ctx.arc(5 + eyeOffsetX, -3, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Eye reflections
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(-6 + eyeOffsetX, -4, 1.5, 1.5);
      this.ctx.fillRect(4 + eyeOffsetX, -4, 1.5, 1.5);
    } else {
      // Blinking slit
      this.ctx.strokeStyle = '#00ffaa';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-8 + eyeOffsetX, -3);
      this.ctx.lineTo(-2 + eyeOffsetX, -3);
      this.ctx.moveTo(2 + eyeOffsetX, -3);
      this.ctx.lineTo(8 + eyeOffsetX, -3);
      this.ctx.stroke();
    }

    // Render Accessories
    if (this.cosmetics.accessory === 'antenna') {
      this.ctx.strokeStyle = primaryColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -14);
      this.ctx.lineTo(0, -23);
      this.ctx.stroke();

      this.ctx.fillStyle = '#00ffaa';
      this.ctx.beginPath();
      this.ctx.arc(0, -24, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.cosmetics.accessory === 'space-helmet') {
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, -5, 20, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (this.cosmetics.accessory === 'golden-crown') {
      this.ctx.fillStyle = '#ffb300';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -14);
      this.ctx.lineTo(-12, -22);
      this.ctx.lineTo(-5, -17);
      this.ctx.lineTo(0, -25);
      this.ctx.lineTo(5, -17);
      this.ctx.lineTo(12, -22);
      this.ctx.lineTo(10, -14);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else if (this.cosmetics.accessory === 'mini-jetpack') {
      this.ctx.fillStyle = '#ff3366';
      this.ctx.fillRect(-19, -8, 4, 16);
      this.ctx.fillRect(15, -8, 4, 16);
    } else if (this.cosmetics.accessory === 'scientist-glasses') {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(-9 + eyeOffsetX, -6, 7, 7);
      this.ctx.strokeRect(2 + eyeOffsetX, -6, 7, 7);
      this.ctx.beginPath();
      this.ctx.moveTo(-2 + eyeOffsetX, -3);
      this.ctx.lineTo(2 + eyeOffsetX, -3);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}
