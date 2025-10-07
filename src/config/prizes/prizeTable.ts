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
    label: 'Prize 1',
    title: 'Prize 1',
    description: 'Test Prize 1',
    probability: 1 / 6,
    color: '#F97316',
    slotIcon: '',
    slotColor: '#F97316',
  },
  {
    id: 'test2',
    type: 'free',
    label: 'Prize 2',
    title: 'Prize 2',
    description: 'Test Prize 2',
    probability: 1 / 6,
    color: '#FB923C',
    slotIcon: '',
    slotColor: '#FB923C',
  },
  {
    id: 'test3',
    type: 'free',
    label: 'Prize 3',
    title: 'Prize 3',
    description: 'Test Prize 3',
    probability: 1 / 6,
    color: '#FBBF24',
    slotIcon: '',
    slotColor: '#FBBF24',
  },
  {
    id: 'test4',
    type: 'free',
    label: 'Prize 4',
    title: 'Prize 4',
    description: 'Test Prize 4',
    probability: 1 / 6,
    color: '#FACC15',
    slotIcon: '',
    slotColor: '#FACC15',
  },
  {
    id: 'test5',
    type: 'free',
    label: 'Prize 5',
    title: 'Prize 5',
    description: 'Test Prize 5',
    probability: 1 / 6,
    color: '#34D399',
    slotIcon: '',
    slotColor: '#34D399',
  },
  {
    id: 'test6',
    type: 'free',
    label: 'Prize 6',
    title: 'Prize 6',
    description: 'Test Prize 6',
    probability: 1 / 6,
    color: '#60A5FA',
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
    label: 'Free SC 500',
    title: 'Free SC 500',
    description: 'Sweeps Coins',
    probability: 0.05,
    color: '#F97316', // orange-500
    slotIcon: '',
    slotColor: '#F97316',
  },
  {
    id: 'p2',
    type: 'free',
    label: 'Free SC 250',
    title: 'Free SC 250',
    description: 'Sweeps Coins',
    probability: 0.1,
    color: '#FB923C', // orange-400
    slotIcon: '',
    slotColor: '#FB923C',
  },
  {
    id: 'p3',
    type: 'free',
    label: 'Free SC 100',
    title: 'Free SC 100',
    description: 'Sweeps Coins',
    probability: 0.15,
    color: '#FBBF24', // yellow-500
    slotIcon: '',
    slotColor: '#FBBF24',
  },
  {
    id: 'p4',
    type: 'free',
    label: 'Free SC 50',
    title: 'Free SC 50',
    description: 'Sweeps Coins',
    probability: 0.2,
    color: '#FACC15', // yellow-400
    slotIcon: '',
    slotColor: '#FACC15',
  },
  {
    id: 'p5',
    type: 'free',
    label: '25 Free Spins',
    title: '25 Free Spins',
    description: 'Slots free play',
    probability: 0.15,
    color: '#34D399', // emerald-400
    slotIcon: '',
    slotColor: '#34D399',
  },
  {
    id: 'p6',
    type: 'free',
    label: '10 Free Spins',
    title: '10 Free Spins',
    description: 'Slots free play',
    probability: 0.15,
    color: '#60A5FA', // blue-400
    slotIcon: '',
    slotColor: '#60A5FA',
  },
  {
    id: 'p7',
    type: 'free',
    label: '5 Free Spins',
    title: '5 Free Spins',
    description: 'Slots free play',
    probability: 0.12,
    color: '#A78BFA', // violet-400
    slotIcon: '',
    slotColor: '#A78BFA',
  },
  {
    id: 'p8',
    type: 'free',
    label: '2 Free Spins',
    title: '2 Free Spins',
    description: 'Slots free play',
    probability: 0.08,
    color: '#C084FC', // violet-300
    slotIcon: '',
    slotColor: '#C084FC',
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
