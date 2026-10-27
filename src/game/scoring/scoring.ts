import { LevelDefinition } from '../types';

export interface ScoreBreakdown {
  stars: number;
  totalScore: number;
  baseScore: number;
  energyBonus: number;
  stepBonus: number;
  commandBonus: number;
  isParBeaten: boolean;
}

export function calculateLevelScore(
  level: LevelDefinition,
  stepsTaken: number,
  commandsUsed: number,
  remainingEnergy: number
): ScoreBreakdown {
  const baseScore = 1000;
  const energyBonus = Math.round(remainingEnergy * 10);

  // Bonus for staying within or beating par
  const stepDiff = level.parSteps - stepsTaken;
  const stepBonus = Math.max(0, stepDiff * 50);

  const commandDiff = level.parCommands - commandsUsed;
  const commandBonus = Math.max(0, commandDiff * 100);

  const totalScore = baseScore + energyBonus + stepBonus + commandBonus;

  // Star calculation
  let stars = 1;
  if (stepsTaken <= level.parSteps + 2 && remainingEnergy >= 20) {
    stars = 2;
  }
  if (stepsTaken <= level.parSteps && commandsUsed <= level.parCommands + 1 && remainingEnergy >= 40) {
    stars = 3;
  }

  return {
    stars,
    totalScore,
    baseScore,
    energyBonus,
    stepBonus,
    commandBonus,
    isParBeaten: stepsTaken <= level.parSteps && commandsUsed <= level.parCommands,
  };
}
