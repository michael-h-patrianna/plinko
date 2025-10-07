/**
 * Production prize table with realistic prize configurations
 */

import freeSpinsIcon from '../../assets/free-spins.png';
import gcIcon from '../../assets/gc.png';
import gcscIcon from '../../assets/gcsc.png';
import noWinIcon from '../../assets/nowin.png';
import offerIcon from '../../assets/offer.png';
import randomRewardIcon from '../../assets/random_reward.png';
import scIcon from '../../assets/sc.png';
import xpIcon from '../../assets/xp.png';
import type { Prize } from '../../game/prizeTypes';
import { createRng, generateSeed } from '../../game/rng';
import {
  getPrizeByIndex as getPrizeByIndexUtil,
  normalizeProbabilities,
  validatePrizeSet,
} from '../../utils/prizeUtils';

/**
 * Prize pool for production use
 * Mix of NoWin, Free rewards, and Purchase offers
 */
const PRODUCTION_PRIZE_POOL: Prize[] = [
  // High-value SC rewards
  {
    id: 'sc_500',
    type: 'free',
    probability: 0.03,
    slotIcon: scIcon,
    slotColor: '#F97316', // orange-500
    title: '500 Free SC',
    freeReward: {
      sc: 500,
    },
  },
  {
    id: 'sc_250',
    type: 'free',
    probability: 0.06,
    slotIcon: scIcon,
    slotColor: '#FB923C', // orange-400
    title: '250 Free SC',
    freeReward: {
      sc: 250,
    },
  },
  {
    id: 'sc_100',
    type: 'free',
    probability: 0.1,
    slotIcon: scIcon,
    slotColor: '#FBBF24', // yellow-500
    title: '100 Free SC',
    freeReward: {
      sc: 100,
    },
  },

  // Combined rewards (SC + GC)
  {
    id: 'combo_50sc_5000gc',
    type: 'free',
    probability: 0.08,
    slotIcon: gcscIcon,
    slotColor: '#FACC15', // yellow-400
    title: 'Combo Reward',
    freeReward: {
      sc: 50,
      gc: 5000,
    },
  },

  // GC rewards
  {
    id: 'gc_10000',
    type: 'free',
    probability: 0.12,
    slotIcon: gcIcon,
    slotColor: '#34D399', // emerald-400
    title: '10,000 GC',
    freeReward: {
      gc: 10000,
    },
  },
  {
    id: 'gc_5000',
    type: 'free',
    probability: 0.15,
    slotIcon: gcIcon,
    slotColor: '#60A5FA', // blue-400
    title: '5,000 GC',
    freeReward: {
      gc: 5000,
    },
  },

  // Free Spins
  {
    id: 'spins_25',
    type: 'free',
    probability: 0.1,
    slotIcon: freeSpinsIcon,
    slotColor: '#A78BFA', // violet-400
    title: '25 Free Spins',
    freeReward: {
      spins: 25,
    },
  },
  {
    id: 'spins_10',
    type: 'free',
    probability: 0.12,
    slotIcon: freeSpinsIcon,
    slotColor: '#C084FC', // violet-300
    title: '10 Free Spins',
    freeReward: {
      spins: 10,
    },
  },

  // Collectible rewards (Stars, Bats, Pumpkins, etc.)
  {
    id: 'stars_500',
    type: 'free',
    probability: 0.08,
    slotIcon: xpIcon,
    slotColor: '#818CF8', // indigo-400
    title: '500 Stars',
    freeReward: {
      xp: {
        amount: 500,
        config: {
          icon: xpIcon,
          name: 'Stars',
        },
      },
    },
  },

  // Random reward (Bronze Wheel)
  {
    id: 'bronze_wheel',
    type: 'free',
    probability: 0.06,
    slotIcon: randomRewardIcon,
    slotColor: '#F472B6', // pink-400
    title: 'Bronze Wheel',
    description: '',
    freeReward: {
      randomReward: {
        config: {
          icon: randomRewardIcon,
          name: 'Bronze Wheel',
        },
      },
    },
  },

  // Mega combo (for testing multiple rewards)
  {
    id: 'mega_combo',
    type: 'free',
    probability: 0.01,
    slotIcon: gcscIcon,
    slotColor: '#A855F7', // purple-500
    title: 'Mega Combo!',
    freeReward: {
      sc: 100,
      gc: 10000,
      spins: 25,
      xp: {
        amount: 1000,
        config: {
          icon: xpIcon,
          name: 'Stars',
        },
      },
      randomReward: {
        config: {
          icon: randomRewardIcon,
          name: 'Bronze Wheel',
        },
      },
    },
  },

  // Purchase offers
  {
    id: 'special_offer',
    type: 'purchase',
    probability: 0.05,
    slotIcon: offerIcon,
    slotColor: '#EF4444', // red-500
    title: 'Special Offer',
    description: 'Limited time deal just for you!',
    freeReward: {
      gc: 10000,
      sc: 100,
    },
    purchaseOffer: {
      offerId: 'offer_001',
      title: '50% Off Premium Pack',
      description: 'Get 10,000 GC + 100 SC for half price!',
    },
  },

  // No win (consolation)
  {
    id: 'no_win',
    type: 'no_win',
    probability: 0.05,
    slotIcon: noWinIcon,
    slotColor: '#64748B', // slate-500
    title: 'No Win',
    description: 'Better luck next time!',
  },
];

/**
 * Add backward-compatible fields to Prize for legacy components
 */
function addBackwardCompatFields(
  prize: Prize
): Prize & { label: string; color: string; description?: string } {
  return {
    ...prize,
    label: prize.title,
    color: prize.slotColor,
    description: prize.description,
  };
}

export const DEFAULT_PRODUCTION_PRIZE_COUNT = 6;

export interface ProductionPrizeSetOptions {
  count: number;
  seed?: number;
}

function getShuffleSeed(seed?: number): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return seed;
  }
  return generateSeed();
}

/**
 * Generates a prize set with deterministic shuffle support
 * Ensures probabilities sum to 1.0
 */
export function generateProductionPrizeSet(
  options: ProductionPrizeSetOptions = { count: DEFAULT_PRODUCTION_PRIZE_COUNT }
): Prize[] {
  const { count, seed } = options;

  if (!Number.isFinite(count)) {
    throw new Error('Production prize set requires an explicit prize count.');
  }

  if (count < 3 || count > 8) {
    throw new Error(`Production prize set count must be between 3 and 8 (received ${count}).`);
  }

  const shuffleSeed = getShuffleSeed(seed);
  const rng = createRng(shuffleSeed);
  const pool = [...PRODUCTION_PRIZE_POOL];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const temp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = temp;
  }

  const selected = pool.slice(0, count);
  const normalized = normalizeProbabilities(selected);
  return normalized.map((prize) => addBackwardCompatFields(prize));
}

/**
 * Creates and validates a prize set
 */
export function createValidatedProductionPrizeSet(
  options: ProductionPrizeSetOptions = { count: DEFAULT_PRODUCTION_PRIZE_COUNT }
): Prize[] {
  const prizes = generateProductionPrizeSet(options);
  validatePrizeSet(prizes);
  return prizes;
}

/**
 * Get prize by index with bounds checking
 * Re-export from shared utilities for backward compatibility
 */
export const getPrizeByIndex = getPrizeByIndexUtil;
