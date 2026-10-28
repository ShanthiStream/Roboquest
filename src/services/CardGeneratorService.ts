import { RobotCosmetics } from '../game/types';
import { AIPerformanceReport } from '../ai/types';
import { drawQRCode } from '../utils/qrCode';

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

export interface GrandWinnerCardDetails {
  nickname: string;
  totalScore: number;
  totalStars: number;
  maxStars: number;
  totalSteps: number;
  totalCommands: number;
  parSteps: number;
  parCommands: number;
  cosmetics: RobotCosmetics;
  aiReport: AIPerformanceReport;
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

      // Live Web App QR Code Box for Level Certificate
      const lvlQrX = 575;
      const lvlQrY = 460;
      const lvlQrSize = 105;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 240, 255, 0.35)';
      ctx.shadowBlur = 10;
      drawQRCode(ctx, 'https://roboquest.dinesh-0d2.workers.dev/', lvlQrX, lvlQrY, lvlQrSize, {
        darkColor: '#070b19',
        lightColor: '#ffffff',
        quietZone: 2,
        borderRadius: 8,
      });
      ctx.restore();

      ctx.fillStyle = '#00ffaa';
      ctx.font = '700 10px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO PLAY', lvlQrX + lvlQrSize / 2, lvlQrY + lvlQrSize + 14);
      ctx.textAlign = 'left';

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

  static generateGrandWinnerCard(details: GrandWinnerCardDetails): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d')!;

      // Deep cybernetic gold & cosmic space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#060a16');
      bgGrad.addColorStop(0.35, '#0c1326');
      bgGrad.addColorStop(0.7, '#141738');
      bgGrad.addColorStop(1, '#1b1429');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // Cyber grid background
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.05)';
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

      // Outer golden champion double border
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, 1152, 627);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, 1136, 611);

      // Golden corner brackets
      const corners = [
        [24, 24, 1, 1],
        [1176, 24, -1, 1],
        [24, 651, 1, -1],
        [1176, 651, -1, -1],
      ];
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 6;
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * 24);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * 24, cy);
        ctx.stroke();
      });

      // Top Champion Header
      ctx.fillStyle = '#ffb300';
      ctx.font = '900 38px Orbitron, sans-serif';
      ctx.fillText('👑 ROBOQUEST : CAMPAIGN GRAND CHAMPION 👑', 65, 88);

      ctx.fillStyle = '#00ffaa';
      ctx.font = '700 20px Inter, sans-serif';
      ctx.fillText('ALL 10 SECTORS CONQUERED • OFFICIAL VICTORY CERTIFICATE', 65, 122);

      // Left Column: Commander Profile & Core Campaign Stats
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText('SUPREME COMMANDER', 65, 185);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '800 36px Orbitron, sans-serif';
      ctx.fillText(details.nickname, 65, 230);

      // Stars earned row
      ctx.fillStyle = '#ffb300';
      ctx.font = '40px sans-serif';
      ctx.fillText('★'.repeat(5), 65, 290);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 20px Orbitron, sans-serif';
      ctx.fillText(`${details.totalStars} / ${details.maxStars} STARS EARNED`, 205, 282);

      // Campaign Stats Row
      const stats = [
        { label: 'TOTAL SCORE', value: `${details.totalScore.toLocaleString()} PTS`, color: '#ffd700' },
        { label: 'SECTORS', value: '10 / 10', color: '#00ffaa' },
        { label: 'NAV STEPS', value: `${details.totalSteps} (Par ${details.parSteps})`, color: '#38bdf8' },
        { label: 'COMMANDS', value: `${details.totalCommands} (Par ${details.parCommands})`, color: '#c084fc' },
      ];

      stats.forEach((st, idx) => {
        const sx = 65 + (idx % 2) * 230;
        const sy = 345 + Math.floor(idx / 2) * 65;

        ctx.fillStyle = '#64748b';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.fillText(st.label, sx, sy);

        ctx.fillStyle = st.color;
        ctx.font = '700 22px Orbitron, sans-serif';
        ctx.fillText(st.value, sx, sy + 28);
      });

      // Needle AI Performance Box (Center-Bottom)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(65, 480, 520, 115);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(65, 480, 520, 115);

      // Needle AI Header inside box
      ctx.fillStyle = '#00ffaa';
      ctx.font = '700 14px Inter, sans-serif';
      ctx.fillText(`⚡ NEEDLE ON-DEVICE AI APPRAISAL  •  ${Math.round(details.aiReport.confidence * 100)}% CONFIDENCE`, 80, 506);

      ctx.fillStyle = '#ffd700';
      ctx.font = '800 18px Orbitron, sans-serif';
      ctx.fillText(`TIER: ${details.aiReport.tier.toUpperCase()} (${details.aiReport.efficiencyScore}%)`, 80, 536);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px Inter, sans-serif';
      ctx.fillText(`Playstyle: ${details.aiReport.playstyle}  •  Latency: ${details.aiReport.latencyMs}ms (Local WASM)`, 80, 560);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic 12px Inter, sans-serif';
      const cleanSummary = details.aiReport.aiSummary.length > 70 
        ? details.aiReport.aiSummary.slice(0, 68) + '...'
        : details.aiReport.aiSummary;
      ctx.fillText(`"${cleanSummary}"`, 80, 582);

      // Live Web App QR Code Box (Roboquest Cloudflare URL)
      const qrBoxX = 612;
      const qrBoxY = 475;
      const qrBoxSize = 115;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 12;
      drawQRCode(ctx, 'https://roboquest.dinesh-0d2.workers.dev/', qrBoxX, qrBoxY, qrBoxSize, {
        darkColor: '#070b19',
        lightColor: '#ffffff',
        quietZone: 2,
        borderRadius: 10,
      });
      ctx.restore();

      // QR Code Labels
      ctx.fillStyle = '#00ffaa';
      ctx.font = '700 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO PLAY', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 9px monospace';
      ctx.fillText('roboquest.workers.dev', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 27);
      ctx.textAlign = 'left';

      // Right Side: Grand Winner Robot Avatar Showcase
      ctx.save();
      ctx.translate(900, 360);

      // Champion golden radial halo
      const goldHalo = ctx.createRadialGradient(0, 0, 20, 0, 0, 200);
      goldHalo.addColorStop(0, 'rgba(255, 179, 0, 0.4)');
      goldHalo.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
      goldHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = goldHalo;
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
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
      ctx.roundRect(-80, 80, 160, 40, 14);
      ctx.fill();
      ctx.stroke();

      // Chassis
      ctx.fillStyle = '#14203d';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(-90, -65, 180, 135, 32);
      ctx.fill();
      ctx.stroke();

      // Visor screen
      ctx.fillStyle = '#070b19';
      ctx.beginPath();
      ctx.roundRect(-70, -50, 140, 85, 20);
      ctx.fill();

      // Glowing eyes
      ctx.fillStyle = '#00ffaa';
      ctx.beginPath();
      ctx.arc(-30, -8, 18, 0, Math.PI * 2);
      ctx.arc(30, -8, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-35, -15, 9, 9);
      ctx.fillRect(25, -15, 9, 9);

      // Always draw the Champion's Golden Crown on top of mascot!
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#fff8db';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-50, -65);
      ctx.lineTo(-65, -110);
      ctx.lineTo(-24, -85);
      ctx.lineTo(0, -125);
      ctx.lineTo(24, -85);
      ctx.lineTo(65, -110);
      ctx.lineTo(50, -65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ruby in the crown center
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -90, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Bottom Footer Bar
      ctx.fillStyle = '#64748b';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText('⚡ POWERED BY CACTUS NEEDLE 3 ON-DEVICE AI • ZERO CLOUD EGRESS • ROBOQUEST ENGINE', 65, 628);

      resolve(canvas.toDataURL('image/png'));
    });
  }
}
