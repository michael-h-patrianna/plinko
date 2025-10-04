/**
 * Mock prize table configuration
 * Defines 6 prizes with probabilities summing to exactly 1.0
 */

import type { PrizeConfig } from '../game/types';

/**
 * Mock prize table with 6 prizes
 * Probabilities: 0.05 + 0.10 + 0.20 + 0.25 + 0.25 + 0.15 = 1.00
 */
export const MOCK_PRIZES: PrizeConfig[] = [
  {
    id: 'p1',
    label: '$500 Bonus',
    description: 'Instant site credit',
    probability: 0.05,
    color: '#F97316' // orange-500
  },
  {
    id: 'p2',
    label: '$250 Bonus',
    description: 'Instant site credit',
    probability: 0.10,
    color: '#FB923C' // orange-400
  },
  {
    id: 'p3',
    label: '$50 Bonus',
    description: 'Instant site credit',
    probability: 0.20,
    color: '#FACC15' // yellow-400
  },
  {
    id: 'p4',
    label: '25 Free Spins',
    description: 'Slots free play',
    probability: 0.25,
    color: '#34D399' // emerald-400
  },
  {
    id: 'p5',
    label: '10 Free Spins',
    description: 'Slots free play',
    probability: 0.25,
    color: '#60A5FA' // blue-400
  },
  {
    id: 'p6',
    label: '5 Free Spins',
    description: 'Slots free play',
    probability: 0.15,
    color: '#A78BFA' // violet-400
  }
];

/**
 * Validates prize configuration at module load time
 */
function validatePrizeTable(): void {
  const sum = MOCK_PRIZES.reduce((acc, p) => acc + p.probability, 0);
  const tolerance = 1e-6;

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(
      `MOCK_PRIZES probabilities must sum to 1.0, got ${sum.toFixed(6)}`
    );
  }

  if (MOCK_PRIZES.length < 3 || MOCK_PRIZES.length > 8) {
    throw new Error(
      `MOCK_PRIZES must contain 3-8 prizes, got ${MOCK_PRIZES.length}`
    );
  }
}

// Run validation on module import
validatePrizeTable();

/**
 * Gets prize by index with bounds checking
 * @param index - Prize index (0-based)
 */
export function getPrizeByIndex(index: number): PrizeConfig {
  if (index < 0 || index >= MOCK_PRIZES.length) {
    throw new Error(
      `Prize index ${index} out of range [0, ${MOCK_PRIZES.length - 1}]`
    );
  }

  return MOCK_PRIZES[index]!;
}
