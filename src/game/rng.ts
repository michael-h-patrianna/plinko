/**
 * Deterministic random number generator using Mulberry32 algorithm
 * Ensures consistent behavior across platforms and test runs
 */

import { cryptoAdapter } from '@utils/platform';
import type { PrizeConfig } from './types';

/**
 * Mulberry32 PRNG - Simple, fast, and deterministic
 * @param seed - 32-bit unsigned integer seed
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic RNG instance
 * @param seed - Seed value for reproducible randomness
 */
export function createRng(seed: number): { next: () => number } {
  const nextValue = mulberry32(seed);
  return { next: nextValue };
}

/**
 * Generates a cryptographically random seed
 * Only used in production; tests should provide explicit seeds
 */
export function generateSeed(): number {
  return cryptoAdapter.generateSecureRandomSeed();
}

/**
 * Validates that prize probabilities sum to 1.0 within tolerance
 */
function validateProbabilities(prizes: PrizeConfig[]): void {
  const sum = prizes.reduce((acc, p) => acc + p.probability, 0);
  const tolerance = 1e-6;

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(
      `Prize probabilities must sum to 1.0, got ${sum.toFixed(6)}. ` +
        `Difference: ${(sum - 1.0).toFixed(6)}`
    );
  }
}

/**
 * Selects a prize using weighted random selection (roulette wheel)
 * @param prizes - Array of prize configurations
 * @param seedOverride - Optional seed for deterministic testing
 * @returns Selected prize index, seed used, and cumulative weights
 */
export function selectPrize(
  prizes: PrizeConfig[],
  seedOverride?: number
): {
  selectedIndex: number;
  seedUsed: number;
  cumulativeWeights: Float32Array;
} {
  // Validation
  if (prizes.length < 3 || prizes.length > 8) {
    throw new Error(`Prize table must contain 3-8 prizes, got ${prizes.length}`);
  }

  validateProbabilities(prizes);

  // Build cumulative probability distribution
  const cumulativeWeights = new Float32Array(prizes.length);
  let cumulative = 0;
  for (let i = 0; i < prizes.length; i++) {
    cumulative += prizes[i]!.probability;
    cumulativeWeights[i] = cumulative;
  }

  // Generate or use provided seed
  const seed = seedOverride ?? generateSeed();
  const rng = createRng(seed);
  const roll = rng.next();

  // Roulette wheel selection
  let selectedIndex = 0;
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (roll <= cumulativeWeights[i]!) {
      selectedIndex = i;
      break;
    }
  }

  return {
    selectedIndex,
    seedUsed: seed,
    cumulativeWeights,
  };
}
