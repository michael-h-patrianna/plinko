/**
 * Prize table configuration
 * Supports 3-8 prizes with dynamic selection
 */

import type { PrizeConfig } from '../../game/types';
import {
  validatePrizeSet,
  getPrizeByIndex as getPrizeByIndexUtil,
  normalizeProbabilities,
} from '../../utils/prizeUtils';

/**
 * Mock prizes for testing
 * 6 prizes with equal probability (16.67% each)
 */
export const MOCK_PRIZES: PrizeConfig[] = [
  {
    id: 'test1',
    type: 'free',
    title: 'Prize 1',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#F97316',
  },
  {
    id: 'test2',
    type: 'free',
    title: 'Prize 2',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#FB923C',
  },
  {
    id: 'test3',
    type: 'free',
    title: 'Prize 3',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#FBBF24',
  },
  {
    id: 'test4',
    type: 'free',
    title: 'Prize 4',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#FACC15',
  },
  {
    id: 'test5',
    type: 'free',
    title: 'Prize 5',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#34D399',
  },
  {
    id: 'test6',
    type: 'free',
    title: 'Prize 6',
    probability: 1 / 6,
    slotIcon: '',
    slotColor: '#60A5FA',
  },
];

/**
 * Full prize pool with 8 prizes
 * Each game randomly selects 3-8 prizes from this pool
 */
const PRIZE_POOL: PrizeConfig[] = [
  {
    id: 'p1',
    type: 'free',
    title: 'Free SC 500',
    probability: 0.05,
    slotIcon: '',
    slotColor: '#F97316', // orange-500
  },
  {
    id: 'p2',
    type: 'free',
    title: 'Free SC 250',
    probability: 0.1,
    slotIcon: '',
    slotColor: '#FB923C', // orange-400
  },
  {
    id: 'p3',
    type: 'free',
    title: 'Free SC 100',
    probability: 0.15,
    slotIcon: '',
    slotColor: '#FBBF24', // yellow-500
  },
  {
    id: 'p4',
    type: 'free',
    title: 'Free SC 50',
    probability: 0.2,
    slotIcon: '',
    slotColor: '#FACC15', // yellow-400
  },
  {
    id: 'p5',
    type: 'free',
    title: '25 Free Spins',
    probability: 0.15,
    slotIcon: '',
    slotColor: '#34D399', // emerald-400
  },
  {
    id: 'p6',
    type: 'free',
    title: '10 Free Spins',
    probability: 0.15,
    slotIcon: '',
    slotColor: '#60A5FA', // blue-400
  },
  {
    id: 'p7',
    type: 'free',
    title: '5 Free Spins',
    probability: 0.12,
    slotIcon: '',
    slotColor: '#A78BFA', // violet-400
  },
  {
    id: 'p8',
    type: 'free',
    title: '2 Free Spins',
    probability: 0.08,
    slotIcon: '',
    slotColor: '#C084FC', // violet-300
  },
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

  // Normalize probabilities using shared utility
  return normalizeProbabilities(selected);
}

/**
 * Gets prize by index with bounds checking
 * Re-export from shared utilities for backward compatibility
 */
export const getPrizeByIndex = getPrizeByIndexUtil;

/**
 * Creates a prize set and validates it
 */
export function createValidatedPrizeSet(): PrizeConfig[] {
  const prizes = generateRandomPrizeSet();
  validatePrizeSet(prizes);
  return prizes;
}
