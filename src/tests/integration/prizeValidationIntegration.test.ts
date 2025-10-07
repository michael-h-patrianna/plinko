/**
 * Integration tests for prize validation with prize provider
 * Tests that invalid configs are rejected at the provider level
 */

import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { validatePrizeProviderPayload } from '../../game/prizeProvider';

describe('Prize Validation Integration', () => {
  describe('Invalid Prize Configurations - Provider Level', () => {
    it('rejects payload with invalid free prize (missing freeReward)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Free Prize',
              // Missing freeReward
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/must have freeReward/);
    });

    it('rejects payload with invalid free prize (empty freeReward)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Free Prize',
              freeReward: {}, // Empty - no rewards
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/at least one reward/);
    });

    it('rejects payload with invalid free prize (negative GC)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Invalid GC',
              freeReward: {
                gc: -100, // Negative
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid free prize (zero SC)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Invalid SC',
              freeReward: {
                sc: 0, // Zero is not allowed (must be positive)
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid XP reward (missing config)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Invalid XP',
              freeReward: {
                xp: {
                  amount: 100,
                  // Missing config
                },
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid XP config (missing icon)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Invalid XP',
              freeReward: {
                xp: {
                  amount: 100,
                  config: {
                    // Missing icon
                    name: 'Stars',
                  },
                },
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid purchase prize (missing purchaseOffer)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'purchase',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Purchase Prize',
              // Missing purchaseOffer
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/must have purchaseOffer/);
    });

    it('rejects payload with invalid purchase prize (missing offerId)', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'purchase',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Purchase Prize',
              purchaseOffer: {
                // Missing offerId
                title: 'Special Offer',
                description: 'Get it now!',
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Another No Win',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with no_win prize containing freeReward', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'No Win',
              freeReward: {
                gc: 100, // Should not have freeReward
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win 2',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'No Win 3',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/should not have freeReward/);
    });

    it('rejects payload with no_win prize containing purchaseOffer', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'No Win',
              purchaseOffer: {
                offerId: 'offer_1',
                title: 'Offer',
                description: 'Get it!',
              },
            },
            {
              id: 'prize-2',
              type: 'no_win',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'No Win 2',
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'No Win 3',
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/should not have purchaseOffer/);
    });
  });

  describe('Valid Prize Configurations - Provider Level', () => {
    it('accepts valid free prize with GC reward', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'GC Prize',
            freeReward: {
              gc: 100,
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid free prize with SC reward', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'SC Prize',
            freeReward: {
              sc: 50,
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid free prize with spins reward', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'Spins Prize',
            freeReward: {
              spins: 10,
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid free prize with XP reward', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'XP Prize',
            freeReward: {
              xp: {
                amount: 500,
                config: {
                  icon: '/stars.png',
                  name: 'Stars',
                },
              },
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid free prize with random reward', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'Random Reward Prize',
            freeReward: {
              randomReward: {
                config: {
                  icon: '/wheel.png',
                  name: 'Bronze Wheel',
                },
              },
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid free prize with combo rewards', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'free',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
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
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid purchase prize', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'purchase',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'Special Offer',
            purchaseOffer: {
              offerId: 'offer_001',
              title: '50% Off Premium Pack',
              description: 'Limited time only!',
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid purchase prize with freeReward bundle', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'purchase',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'Premium Bundle',
            purchaseOffer: {
              offerId: 'offer_001',
              title: 'Premium Bundle',
              description: 'Get GC + SC!',
            },
            freeReward: {
              gc: 10000,
              sc: 100,
            },
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'Another No Win',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });

    it('accepts valid no_win prize', () => {
      const result = validatePrizeProviderPayload({
        prizes: [
          {
            id: 'prize-1',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '🎁',
            slotColor: '#FF0000',
            title: 'No Win',
            description: 'Better luck next time!',
          },
          {
            id: 'prize-2',
            type: 'no_win',
            probability: 0.33,
            slotIcon: '💎',
            slotColor: '#00FF00',
            title: 'No Win 2',
          },
          {
            id: 'prize-3',
            type: 'no_win',
            probability: 0.34,
            slotIcon: '⭐',
            slotColor: '#0000FF',
            title: 'No Win 3',
          },
        ],
        winningIndex: 0,
        seed: 123,
        source: 'default',
      });

      expect(result).toBeDefined();
      expect(result.prizes).toHaveLength(3);
    });
  });

  describe('Mixed Invalid Scenarios', () => {
    it('provides detailed error messages for multiple validation failures', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.33,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Invalid Free Prize',
              freeReward: {
                gc: -100, // Negative value
                sc: 0, // Zero value
              },
            },
            {
              id: 'prize-2',
              type: 'purchase',
              probability: 0.33,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'Invalid Purchase Prize',
              // Missing purchaseOffer
            },
            {
              id: 'prize-3',
              type: 'no_win',
              probability: 0.34,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'No Win',
              freeReward: { gc: 100 }, // Should not have freeReward
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      // The error should mention validation failures
      try {
        attempt();
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
