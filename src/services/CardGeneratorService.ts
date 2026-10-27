import { RobotCosmetics } from '../game/types';

export interface CardDetails {
  nickname: string;
  levelTitle: string;
  levelNumber: number;
  stars: number;
  score: number;
  steps: number;
  commands: number;
  cosmetics: RobotCosmetics;
}

export class CardGeneratorService {
  static generateCard(details: CardDetails): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d')!;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#070b19');
      bgGrad.addColorStop(0.5, '#0d1527');
      bgGrad.addColorStop(1, '#14203d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // Grid background effect
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 675);
        ctx.stroke();
      }
      for (let y = 0; y < 675; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Outer glowing border
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, 1152, 627);

      // Top Title Bar
      ctx.fillStyle = '#00f0ff';
      ctx.font = '900 44px Orbitron, sans-serif';
      ctx.fillText('ROBOQUEST : THE TINY AI ADVENTURE', 70, 95);

      ctx.fillStyle = '#00ffaa';
      ctx.font = '600 22px Inter, sans-serif';
      ctx.fillText('MISSION COMPLETION CERTIFICATE', 70, 135);

      // Card Content Box (Left side: Stats, Right side: Robot Avatar)
      // Level info
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px Inter, sans-serif';
      ctx.fillText(`Level ${details.levelNumber} — ${details.levelTitle}`, 70, 215);

      // Commander Nickname
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 22px Inter, sans-serif';
      ctx.fillText('COMMANDER', 70, 270);
      ctx.fillStyle = '#00f0ff';
      ctx.font = '700 30px Inter, sans-serif';
      ctx.fillText(details.nickname, 70, 310);

      // Stars
      const starSymbols = '★'.repeat(details.stars) + '☆'.repeat(3 - details.stars);
      ctx.fillStyle = '#ffb300';
      ctx.font = '48px sans-serif';
      ctx.fillText(starSymbols, 70, 385);

      // Stats row
      const stats = [
        { label: 'FINAL SCORE', value: details.score.toLocaleString() },
        { label: 'STEPS TAKEN', value: details.steps.toString() },
        { label: 'COMMANDS', value: details.commands.toString() },
      ];

      stats.forEach((st, idx) => {
        const sx = 70 + idx * 200;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 16px Inter, sans-serif';
        ctx.fillText(st.label, sx, 450);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 28px Orbitron, sans-serif';
        ctx.fillText(st.value, sx, 490);
      });

      // Footer badge
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(70, 545, 450, 48);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(70, 545, 450, 48);
      ctx.fillStyle = '#00ffaa';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText('⚡ POWERED BY CACTUS NEEDLE AI & CLOUDFLARE', 88, 575);

      // Right Side: Render Robot Mascot Showcase
      ctx.save();
      ctx.translate(920, 340);

      // Glow behind robot
      const radGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
      radGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      radGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw large robot avatar
      let primaryColor = '#00f0ff';
      if (details.cosmetics.color === 'neon-green') primaryColor = '#00ffaa';
      else if (details.cosmetics.color === 'sunset-orange') primaryColor = '#ff7700';
      else if (details.cosmetics.color === 'cosmic-purple') primaryColor = '#b026ff';
      else if (details.cosmetics.color === 'classic-silver') primaryColor = '#cbd5e1';

      // Base treads
      ctx.fillStyle = '#0d1527';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-70, 70, 140, 35, 12);
      ctx.fill();
      ctx.stroke();

      // Chassis
      ctx.fillStyle = '#14203d';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(-80, -60, 160, 120, 30);
      ctx.fill();
      ctx.stroke();

      // Visor screen
      ctx.fillStyle = '#070b19';
      ctx.beginPath();
      ctx.roundRect(-60, -45, 120, 75, 18);
      ctx.fill();

      // Glowing eyes
      ctx.fillStyle = '#00ffaa';
      ctx.beginPath();
      ctx.arc(-26, -8, 16, 0, Math.PI * 2);
      ctx.arc(26, -8, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-30, -14, 8, 8);
      ctx.fillRect(22, -14, 8, 8);

      // Accessory on card
      if (details.cosmetics.accessory === 'antenna') {
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, -60);
        ctx.lineTo(0, -100);
        ctx.stroke();

        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.arc(0, -105, 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (details.cosmetics.accessory === 'golden-crown') {
        ctx.fillStyle = '#ffb300';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-45, -60);
        ctx.lineTo(-55, -95);
        ctx.lineTo(-20, -75);
        ctx.lineTo(0, -110);
        ctx.lineTo(20, -75);
        ctx.lineTo(55, -95);
        ctx.lineTo(45, -60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    });
  }
}
