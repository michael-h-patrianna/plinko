/**
 * Shared prize utility functions
 * Used by both prizeTable.ts and productionPrizeTable.ts
 */

import type { PrizeConfig } from '@game/types';

/**
 * Validates that prize probabilities sum to 1.0 and count is within valid range
 * @param prizes - Array of prize configurations
 * @throws Error if validation fails
 */
export function validatePrizeSet(prizes: PrizeConfig[]): void {
  const sum = prizes.reduce((acc, p) => acc + p.probability, 0);
  const tolerance = 1e-6;

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(`Prize probabilities must sum to 1.0, got ${sum.toFixed(6)}`);
  }

  if (prizes.length < 3 || prizes.length > 8) {
    throw new Error(`Prize set must contain 3-8 prizes, got ${prizes.length}`);
  }
}

/**
 * Gets prize by index with bounds checking
 * @param prizes - Prize configuration array
 * @param index - Prize index (0-based)
 * @returns The prize at the specified index
 * @throws Error if index is out of bounds
 */
export function getPrizeByIndex<T extends PrizeConfig>(prizes: T[], index: number): T {
  if (index < 0 || index >= prizes.length) {
    throw new Error(`Prize index ${index} out of range [0, ${prizes.length - 1}]`);
  }

  return prizes[index]!;
}

/**
 * Normalizes prize probabilities to sum to exactly 1.0
 * @param prizes - Array of prize configurations
 * @returns New array with normalized probabilities
 */
export function normalizeProbabilities<T extends PrizeConfig>(prizes: T[]): T[] {
  const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);

  if (totalProb === 0) {
    throw new Error('Total probability cannot be zero');
  }

  return prizes.map((prize) => ({
    ...prize,
    probability: prize.probability / totalProb,
  }));
}
