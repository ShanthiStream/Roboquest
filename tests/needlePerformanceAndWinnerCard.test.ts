import { describe, it, expect } from 'vitest';
import { NeedleAdapter } from '../src/ai/adapters/NeedleAdapter';
import { aiManager } from '../src/ai/AIAdapterManager';
import { UserPerformanceMetrics } from '../src/ai/types';
import { LEVELS } from '../src/game/levels/levelData';

describe('Needle AI User Performance Identification & Winner Card Validation', () => {
  it('confirms Level 10 is the final campaign sector', () => {
    expect(LEVELS.length).toBe(10);
    const lastLevel = LEVELS[LEVELS.length - 1];
    expect(lastLevel.id).toBe(10);
    expect(lastLevel.title).toBe('The Great Escape');
  });

  it('NeedleAdapter evaluates high-efficiency commander performance correctly', async () => {
    const adapter = new NeedleAdapter();
    const metrics: UserPerformanceMetrics = {
      nickname: 'Commander Ace',
      levelsCleared: 10,
      totalLevels: 10,
      totalScore: 28500,
      starsEarned: 30,
      maxStars: 30,
      totalSteps: 80,
      parSteps: 90,
      totalCommands: 20,
      parCommands: 25,
      avgEnergyRemaining: 88,
      currentLevelId: 10,
    };

    const report = await adapter.evaluatePerformance(metrics);

    expect(report).toBeDefined();
    expect(report.efficiencyScore).toBeGreaterThanOrEqual(90);
    expect(report.tier).toBe('Cybernetic Grandmaster');
    expect(report.playstyle).toBe('Algorithmic Precisionist');
    expect(report.strengths.length).toBeGreaterThan(0);
    expect(report.confidence).toBeGreaterThan(0.7);
    expect(report.latencyMs).toBeGreaterThan(0);
    expect(report.modelName).toBe('Cactus Needle 3 WASM');
  });

  it('NeedleAdapter evaluates tactical explorer playstyle', async () => {
    const adapter = new NeedleAdapter();
    const metrics: UserPerformanceMetrics = {
      nickname: 'Explorer Bot',
      levelsCleared: 10,
      totalLevels: 10,
      totalScore: 18000,
      starsEarned: 22,
      maxStars: 30,
      totalSteps: 140,
      parSteps: 90,
      totalCommands: 45,
      parCommands: 25,
      avgEnergyRemaining: 60,
      currentLevelId: 10,
    };

    const report = await adapter.evaluatePerformance(metrics);

    expect(report).toBeDefined();
    expect(report.efficiencyScore).toBeLessThan(90);
    expect(report.tier).not.toBe('Cybernetic Grandmaster');
    expect(report.playstyle).toBe('Adaptive Tactical Explorer');
    expect(report.aiSummary).toContain('Explorer Bot');
  });

  it('aiManager evaluates performance through NeedleAdapter', async () => {
    const metrics: UserPerformanceMetrics = {
      nickname: 'Test Commander',
      levelsCleared: 10,
      totalLevels: 10,
      totalScore: 25000,
      starsEarned: 28,
      maxStars: 30,
      totalSteps: 88,
      parSteps: 90,
      totalCommands: 24,
      parCommands: 25,
      avgEnergyRemaining: 82,
      currentLevelId: 10,
    };

    const report = await aiManager.evaluatePerformance(metrics);

    expect(report).toBeDefined();
    expect(report.tier).toBeDefined();
    expect(report.efficiencyScore).toBeGreaterThanOrEqual(80);
    expect(report.confidence).toBeGreaterThan(0.8);
  });

  it('generates a valid QR code matrix for the live Cloudflare URL', async () => {
    const { generateQRCodeMatrix } = await import('../src/utils/qrCode');
    const liveUrl = 'https://roboquest.dinesh-0d2.workers.dev/';
    const matrix = generateQRCodeMatrix(liveUrl, 4);

    expect(matrix).toBeDefined();
    expect(matrix.length).toBe(33);
    expect(matrix[0].length).toBe(33);

    // Verify top-left finder pattern core
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
    expect(matrix[3][3]).toBe(true);

    // Verify top-right finder pattern core
    expect(matrix[0][32]).toBe(true);
    expect(matrix[0][26]).toBe(true);

    // Verify bottom-left finder pattern core
    expect(matrix[32][0]).toBe(true);
    expect(matrix[26][0]).toBe(true);
  });
});
