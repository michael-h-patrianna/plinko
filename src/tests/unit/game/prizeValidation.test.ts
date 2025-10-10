/**
 * Comprehensive unit tests for prize validation module
 */

import { describe, expect, it } from 'vitest';
import type { Prize } from '@game/prizeTypes';
import {
  isPrize,
  isPrizeType,
  PrizeValidationError,
  validatePrize,
  validatePrizes,
  validatePrizesOrThrow,
  validatePrizeOrThrow,
} from '@game/prizeValidation';

describe('Prize Validation', () => {
  describe('validatePrize - no_win type', () => {
    it('validates a valid no_win prize', () => {
      const prize: Prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
        description: 'Better luck next time',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects no_win prize with missing id', () => {
      const prize = {
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'id')).toBe(true);
    });

    it('rejects no_win prize with empty id', () => {
      const prize = {
        id: '',
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('id cannot be empty'))).toBe(true);
    });

    it('rejects no_win prize with negative probability', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: -0.5,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('probability'))).toBe(true);
    });

    it('rejects no_win prize with probability > 1', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 1.5,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('between 0 and 1'))).toBe(true);
    });

    it('rejects no_win prize with freeReward', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
        freeReward: { gc: 100 },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('should not have freeReward'))).toBe(
        true
      );
    });

    it('rejects no_win prize with purchaseOffer', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'No Win',
        purchaseOffer: {
          offerId: 'offer_1',
          title: 'Special Offer',
          description: 'Get it now!',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('should not have purchaseOffer'))).toBe(
        true
      );
    });

    it('rejects no_win prize with missing slotIcon', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 0.1,
        slotColor: '#000000',
        title: 'No Win',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'slotIcon')).toBe(true);
    });

    it('rejects no_win prize with empty title', () => {
      const prize = {
        id: 'no_win_1',
        type: 'no_win',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: '',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('title cannot be empty'))).toBe(true);
    });
  });

  describe('validatePrize - free type', () => {
    it('validates a valid free prize with GC reward', () => {
      const prize: Prize = {
        id: 'gc_100',
        type: 'free',
        probability: 0.2,
        slotIcon: '/gc.png',
        slotColor: '#00FF00',
        title: '100 GC',
        freeReward: {
          gc: 100,
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates a valid free prize with SC reward', () => {
      const prize: Prize = {
        id: 'sc_50',
        type: 'free',
        probability: 0.15,
        slotIcon: '/sc.png',
        slotColor: '#FF0000',
        title: '50 SC',
        freeReward: {
          sc: 50,
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('validates a valid free prize with spins reward', () => {
      const prize: Prize = {
        id: 'spins_10',
        type: 'free',
        probability: 0.1,
        slotIcon: '/spins.png',
        slotColor: '#0000FF',
        title: '10 Free Spins',
        freeReward: {
          spins: 10,
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('validates a valid free prize with XP reward', () => {
      const prize: Prize = {
        id: 'stars_100',
        type: 'free',
        probability: 0.1,
        slotIcon: '/stars.png',
        slotColor: '#FFFF00',
        title: '100 Stars',
        freeReward: {
          xp: {
            amount: 100,
            config: {
              icon: '/stars.png',
              name: 'Stars',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('validates a valid free prize with random reward', () => {
      const prize: Prize = {
        id: 'bronze_wheel',
        type: 'free',
        probability: 0.05,
        slotIcon: '/wheel.png',
        slotColor: '#CD7F32',
        title: 'Bronze Wheel',
        freeReward: {
          randomReward: {
            config: {
              icon: '/wheel.png',
              name: 'Bronze Wheel',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('validates a valid free prize with combo rewards', () => {
      const prize: Prize = {
        id: 'combo_1',
        type: 'free',
        probability: 0.05,
        slotIcon: '/combo.png',
        slotColor: '#FF00FF',
        title: 'Mega Combo',
        freeReward: {
          gc: 1000,
          sc: 50,
          spins: 10,
          xp: {
            amount: 500,
            config: {
              icon: '/stars.png',
              name: 'Stars',
            },
          },
          randomReward: {
            config: {
              icon: '/wheel.png',
              name: 'Bronze Wheel',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('rejects free prize without freeReward', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have freeReward'))).toBe(true);
    });

    it('rejects free prize with empty freeReward', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: {},
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('at least one reward'))).toBe(true);
    });

    it('rejects free prize with negative GC', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: { gc: -100 },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('gc'))).toBe(true);
    });

    it('rejects free prize with zero SC', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: { sc: 0 },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('positive'))).toBe(true);
    });

    it('rejects free prize with invalid XP structure (missing amount)', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: {
          xp: {
            config: {
              icon: '/stars.png',
              name: 'Stars',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('amount'))).toBe(true);
    });

    it('rejects free prize with invalid XP config (missing icon)', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: {
          xp: {
            amount: 100,
            config: {
              name: 'Stars',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('icon'))).toBe(true);
    });

    it('rejects free prize with invalid random reward config (missing name)', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        freeReward: {
          randomReward: {
            config: {
              icon: '/wheel.png',
            },
          },
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('name'))).toBe(true);
    });
  });

  describe('validatePrize - purchase type', () => {
    it('validates a valid purchase prize', () => {
      const prize: Prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          offerId: 'offer_001',
          title: '50% Off Premium Pack',
          description: 'Limited time only!',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('validates purchase prize with freeReward (bundle)', () => {
      const prize: Prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Bundle',
        purchaseOffer: {
          offerId: 'offer_001',
          title: 'Premium Bundle',
          description: 'Get GC + SC!',
        },
        freeReward: {
          gc: 10000,
          sc: 100,
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('rejects purchase prize without purchaseOffer', () => {
      const prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have purchaseOffer'))).toBe(true);
    });

    it('rejects purchase prize with missing offerId', () => {
      const prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          title: '50% Off',
          description: 'Limited time!',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('offerId'))).toBe(true);
    });

    it('rejects purchase prize with empty offerId', () => {
      const prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          offerId: '',
          title: '50% Off',
          description: 'Limited time!',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('offerId cannot be empty'))).toBe(true);
    });

    it('rejects purchase prize with missing title in purchaseOffer', () => {
      const prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          offerId: 'offer_001',
          description: 'Limited time!',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('title'))).toBe(true);
    });

    it('accepts purchase prize with optional description', () => {
      const prize: Prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          offerId: 'offer_001',
          title: '50% Off Premium Pack',
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('rejects purchase prize with invalid freeReward', () => {
      const prize = {
        id: 'offer_1',
        type: 'purchase',
        probability: 0.1,
        slotIcon: '/offer.png',
        slotColor: '#FF0000',
        title: 'Special Offer',
        purchaseOffer: {
          offerId: 'offer_001',
          title: 'Bundle',
          description: 'Get it!',
        },
        freeReward: {
          gc: -100, // Invalid negative amount
        },
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('gc'))).toBe(true);
    });
  });

  describe('validatePrizes - array validation', () => {
    it('validates an array of valid prizes', () => {
      const prizes: Prize[] = [
        {
          id: 'no_win_1',
          type: 'no_win',
          probability: 0.2,
          slotIcon: '/nowin.png',
          slotColor: '#000000',
          title: 'No Win',
        },
        {
          id: 'gc_100',
          type: 'free',
          probability: 0.4,
          slotIcon: '/gc.png',
          slotColor: '#00FF00',
          title: '100 GC',
          freeReward: { gc: 100 },
        },
        {
          id: 'offer_1',
          type: 'purchase',
          probability: 0.4,
          slotIcon: '/offer.png',
          slotColor: '#FF0000',
          title: 'Special Offer',
          purchaseOffer: {
            offerId: 'offer_001',
            title: '50% Off',
            description: 'Get it now!',
          },
        },
      ];

      const result = validatePrizes(prizes);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects array with invalid prizes and provides index context', () => {
      const prizes = [
        {
          id: 'valid_1',
          type: 'no_win',
          probability: 0.5,
          slotIcon: '/icon.png',
          slotColor: '#000000',
          title: 'Valid Prize',
        },
        {
          id: 'invalid_2',
          type: 'free',
          probability: 0.5,
          slotIcon: '/icon.png',
          slotColor: '#000000',
          title: 'Invalid Prize',
          // Missing freeReward
        },
      ];

      const result = validatePrizes(prizes);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Prize[1]'))).toBe(true);
      expect(result.errors.some((e) => e.message.includes('must have freeReward'))).toBe(true);
    });

    it('collects all validation errors from multiple invalid prizes', () => {
      const prizes = [
        {
          id: '',
          type: 'no_win',
          probability: 1.5,
          slotIcon: '/icon.png',
          slotColor: '#000000',
          title: 'Prize 1',
        },
        {
          id: 'prize_2',
          type: 'free',
          probability: 0.5,
          slotIcon: '',
          slotColor: '#000000',
          title: '',
          freeReward: {},
        },
      ];

      const result = validatePrizes(prizes);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
      expect(result.errors.some((e) => e.message.includes('Prize[0]'))).toBe(true);
      expect(result.errors.some((e) => e.message.includes('Prize[1]'))).toBe(true);
    });
  });

  describe('validatePrizeOrThrow', () => {
    it('does not throw for valid prize', () => {
      const prize: Prize = {
        id: 'gc_100',
        type: 'free',
        probability: 0.2,
        slotIcon: '/gc.png',
        slotColor: '#00FF00',
        title: '100 GC',
        freeReward: { gc: 100 },
      };

      expect(() => validatePrizeOrThrow(prize)).not.toThrow();
    });

    it('throws PrizeValidationError for invalid prize', () => {
      const prize = {
        id: 'free_1',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Free Prize',
        // Missing freeReward
      };

      expect(() => validatePrizeOrThrow(prize)).toThrow(PrizeValidationError);
      expect(() => validatePrizeOrThrow(prize)).toThrow(/must have freeReward/);
    });
  });

  describe('validatePrizesOrThrow', () => {
    it('does not throw for valid prizes', () => {
      const prizes: Prize[] = [
        {
          id: 'gc_100',
          type: 'free',
          probability: 0.5,
          slotIcon: '/gc.png',
          slotColor: '#00FF00',
          title: '100 GC',
          freeReward: { gc: 100 },
        },
        {
          id: 'no_win_1',
          type: 'no_win',
          probability: 0.5,
          slotIcon: '/nowin.png',
          slotColor: '#000000',
          title: 'No Win',
        },
      ];

      expect(() => validatePrizesOrThrow(prizes)).not.toThrow();
    });

    it('throws PrizeValidationError for invalid prizes', () => {
      const prizes = [
        {
          id: 'invalid_1',
          type: 'free',
          probability: 0.5,
          slotIcon: '/icon.png',
          slotColor: '#000000',
          title: 'Invalid',
        },
      ];

      expect(() => validatePrizesOrThrow(prizes)).toThrow(PrizeValidationError);
    });
  });

  describe('isPrize type guard', () => {
    it('returns true for valid prize', () => {
      const prize: Prize = {
        id: 'gc_100',
        type: 'free',
        probability: 0.2,
        slotIcon: '/gc.png',
        slotColor: '#00FF00',
        title: '100 GC',
        freeReward: { gc: 100 },
      };

      expect(isPrize(prize)).toBe(true);
    });

    it('returns false for invalid prize', () => {
      const prize = {
        id: 'invalid',
        type: 'free',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Invalid',
      };

      expect(isPrize(prize)).toBe(false);
    });

    it('returns false for non-object values', () => {
      expect(isPrize(null)).toBe(false);
      expect(isPrize(undefined)).toBe(false);
      expect(isPrize('string')).toBe(false);
      expect(isPrize(123)).toBe(false);
    });
  });

  describe('isPrizeType type guard', () => {
    it('returns true for valid prize types', () => {
      expect(isPrizeType('no_win')).toBe(true);
      expect(isPrizeType('free')).toBe(true);
      expect(isPrizeType('purchase')).toBe(true);
    });

    it('returns false for invalid prize types', () => {
      expect(isPrizeType('invalid')).toBe(false);
      expect(isPrizeType('')).toBe(false);
      expect(isPrizeType(null)).toBe(false);
      expect(isPrizeType(undefined)).toBe(false);
      expect(isPrizeType(123)).toBe(false);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('rejects prize with non-object type', () => {
      const result = validatePrize(null);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must be an object'))).toBe(true);
    });

    it('rejects prize with unknown type', () => {
      const prize = {
        id: 'unknown_1',
        type: 'unknown_type',
        probability: 0.1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Unknown',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Unknown prize type'))).toBe(true);
    });

    it('rejects prize with NaN probability', () => {
      const prize = {
        id: 'prize_1',
        type: 'no_win',
        probability: NaN,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('finite number'))).toBe(true);
    });

    it('rejects prize with Infinity probability', () => {
      const prize = {
        id: 'prize_1',
        type: 'no_win',
        probability: Infinity,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('finite number'))).toBe(true);
    });

    it('accepts prize with probability = 0', () => {
      const prize: Prize = {
        id: 'prize_1',
        type: 'no_win',
        probability: 0,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('accepts prize with probability = 1', () => {
      const prize: Prize = {
        id: 'prize_1',
        type: 'no_win',
        probability: 1,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(true);
    });

    it('rejects prize with wrong type for numeric field', () => {
      const prize = {
        id: 'prize_1',
        type: 'no_win',
        probability: '0.5',
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must be a number'))).toBe(true);
    });

    it('rejects prize with wrong type for string field', () => {
      const prize = {
        id: 123,
        type: 'no_win',
        probability: 0.5,
        slotIcon: '/icon.png',
        slotColor: '#000000',
        title: 'Prize',
      };

      const result = validatePrize(prize);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must be a string'))).toBe(true);
    });
  });
});
