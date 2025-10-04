/**
 * Prize table configuration
 * Supports 3-8 prizes with dynamic selection
 */

import type { PrizeConfig } from '../game/types';

/**
 * Full prize pool with 8 prizes
 * Each game randomly selects 3-8 prizes from this pool
 */
const PRIZE_POOL: PrizeConfig[] = [
  {
    id: 'p1',
    label: 'Free SC 500',
    description: 'Sweeps Coins',
    probability: 0.05,
    color: '#F97316' // orange-500
  },
  {
    id: 'p2',
    label: 'Free SC 250',
    description: 'Sweeps Coins',
    probability: 0.10,
    color: '#FB923C' // orange-400
  },
  {
    id: 'p3',
    label: 'Free SC 100',
    description: 'Sweeps Coins',
    probability: 0.15,
    color: '#FBBF24' // yellow-500
  },
  {
    id: 'p4',
    label: 'Free SC 50',
    description: 'Sweeps Coins',
    probability: 0.20,
    color: '#FACC15' // yellow-400
  },
  {
    id: 'p5',
    label: '25 Free Spins',
    description: 'Slots free play',
    probability: 0.15,
    color: '#34D399' // emerald-400
  },
  {
    id: 'p6',
    label: '10 Free Spins',
    description: 'Slots free play',
    probability: 0.15,
    color: '#60A5FA' // blue-400
  },
  {
    id: 'p7',
    label: '5 Free Spins',
    description: 'Slots free play',
    probability: 0.12,
    color: '#A78BFA' // violet-400
  },
  {
    id: 'p8',
    label: '2 Free Spins',
    description: 'Slots free play',
    probability: 0.08,
    color: '#C084FC' // violet-300
  }
];

/**
 * Generates a random prize configuration with 3-8 prizes
 * Normalizes probabilities to sum to 1.0
 */
export function generateRandomPrizeSet(): PrizeConfig[] {
  // Randomly choose how many prizes (3-8)
  const prizeCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 inclusive

  // Randomly select that many prizes from the pool
  const shuffled = [...PRIZE_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, prizeCount);

  // Normalize probabilities to sum to 1.0
  const totalProb = selected.reduce((sum, p) => sum + p.probability, 0);
  const normalized = selected.map(prize => ({
    ...prize,
    probability: prize.probability / totalProb
  }));

  return normalized;
}

/**
 * Validates prize configuration
 */
function validatePrizeTable(prizes: PrizeConfig[]): void {
  const sum = prizes.reduce((acc, p) => acc + p.probability, 0);
  const tolerance = 1e-6;

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(
      `Prize probabilities must sum to 1.0, got ${sum.toFixed(6)}`
    );
  }

  if (prizes.length < 3 || prizes.length > 8) {
    throw new Error(
      `Prize set must contain 3-8 prizes, got ${prizes.length}`
    );
  }
}

/**
 * Gets prize by index with bounds checking
 * @param prizes - Prize configuration array
 * @param index - Prize index (0-based)
 */
export function getPrizeByIndex(prizes: PrizeConfig[], index: number): PrizeConfig {
  if (index < 0 || index >= prizes.length) {
    throw new Error(
      `Prize index ${index} out of range [0, ${prizes.length - 1}]`
    );
  }

  return prizes[index]!;
}

/**
 * Creates a prize set and validates it
 */
export function createValidatedPrizeSet(): PrizeConfig[] {
  const prizes = generateRandomPrizeSet();
  validatePrizeTable(prizes);
  return prizes;
}
