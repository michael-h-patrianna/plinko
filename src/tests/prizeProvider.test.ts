import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  createDefaultPrizeProvider,
  createFixturePrizeProvider,
  validatePrizeProviderPayload,
} from '../game/prizeProvider';
import { getPrizeFixture } from './fixtures/prizeFixtures';

const SHARED_SEED = 1337;

describe('PrizeProvider', () => {
  it('produces deterministic sessions when a seed override is provided', async () => {
    const provider = createDefaultPrizeProvider({ count: 6 });

    const [sessionA, sessionB] = await Promise.all([
      provider.load({ seedOverride: SHARED_SEED }),
      provider.load({ seedOverride: SHARED_SEED }),
    ]);

    expect(sessionA.prizes).toEqual(sessionB.prizes);
    expect(sessionA.winningIndex).toBe(sessionB.winningIndex);
    expect(sessionA.seed).toBe(sessionB.seed);
  });

  it('hydrates payloads from fixtures for testing scenarios', async () => {
    const fixture = getPrizeFixture('deterministicSixSlot');
    const provider = createFixturePrizeProvider(fixture);

    const result = await provider.load();

    expect(result.prizes).toEqual(fixture.prizes);
    expect(result.winningIndex).toBe(fixture.winningIndex);
    expect(result.source).toBe('fixture');
  });

  it('rejects invalid payloads that fail schema validation', () => {
    const fixture = getPrizeFixture('deterministicSixSlot');
    const attempt = () =>
      validatePrizeProviderPayload({
        prizes: fixture.prizes,
        winningIndex: fixture.prizes.length + 1,
        seed: 42,
        source: 'remote',
      });

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowError(/Winning index 7 is out of bounds for prize list of length 6/);
  });

  it('propagates generation errors from load', async () => {
    const provider = createDefaultPrizeProvider({ count: 2 });

    await expect(provider.load()).rejects.toThrow(/between 3 and 8/);
  });

  describe('Validation Edge Cases', () => {
    it('rejects payload with too few prizes', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.5,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Prize 1',
              freeReward: { gc: 100 },
            },
            {
              id: 'prize-2',
              type: 'free',
              probability: 0.5,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'Prize 2',
              freeReward: { gc: 200 },
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/at least 3/);
    });

    it('rejects payload with too many prizes', () => {
      const prizes = Array.from({ length: 9 }, (_, i) => ({
        id: `prize-${i}`,
        type: 'free' as const,
        probability: 1 / 9,
        slotIcon: '🎁',
        slotColor: '#FF0000',
        title: `Prize ${i}`,
        freeReward: { gc: 100 },
      }));

      const attempt = () =>
        validatePrizeProviderPayload({
          prizes,
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/no more than 8/);
    });

    it('rejects payload with negative winning index', () => {
      const fixture = getPrizeFixture('deterministicSixSlot');
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: fixture.prizes,
          winningIndex: -1,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid prize type', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'invalid_type',
              probability: 0.5,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Prize 1',
            },
            {
              id: 'prize-2',
              type: 'free',
              probability: 0.5,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'Prize 2',
              freeReward: { gc: 100 },
            },
            {
              id: 'prize-3',
              type: 'free',
              probability: 0,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Prize 3',
              freeReward: { gc: 50 },
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with missing required prize fields', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.5,
              // Missing slotIcon
              slotColor: '#FF0000',
              title: 'Prize 1',
            },
            {
              id: 'prize-2',
              type: 'free',
              probability: 0.5,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'Prize 2',
              freeReward: { gc: 100 },
            },
            {
              id: 'prize-3',
              type: 'free',
              probability: 0,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Prize 3',
              freeReward: { gc: 50 },
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(ZodError);
    });

    it('rejects payload with invalid probability sum', () => {
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: [
            {
              id: 'prize-1',
              type: 'free',
              probability: 0.7,
              slotIcon: '🎁',
              slotColor: '#FF0000',
              title: 'Prize 1',
              freeReward: { gc: 100 },
            },
            {
              id: 'prize-2',
              type: 'free',
              probability: 0.7,
              slotIcon: '💎',
              slotColor: '#00FF00',
              title: 'Prize 2',
              freeReward: { gc: 200 },
            },
            {
              id: 'prize-3',
              type: 'free',
              probability: 0.7,
              slotIcon: '⭐',
              slotColor: '#0000FF',
              title: 'Prize 3',
              freeReward: { gc: 300 },
            },
          ],
          winningIndex: 0,
          seed: 123,
          source: 'default',
        });

      expect(attempt).toThrowError(/probabilities must sum to 1.0/);
    });

    it('rejects payload with deterministic trajectory landing slot out of bounds', () => {
      const fixture = getPrizeFixture('deterministicSixSlot');
      const attempt = () =>
        validatePrizeProviderPayload({
          prizes: fixture.prizes,
          winningIndex: 0,
          seed: 123,
          source: 'default',
          deterministicTrajectory: {
            points: [
              { frame: 0, x: 0, y: 0, rotation: 0 },
              { frame: 1, x: 10, y: 10, rotation: 0.1 },
            ],
            landingSlot: 99,
          },
        });

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowError(/landing slot 99 is out of bounds/);
    });

    it('accepts valid payload with all optional fields', () => {
      const fixture = getPrizeFixture('deterministicSixSlot');
      const result = validatePrizeProviderPayload({
        prizes: fixture.prizes,
        winningIndex: 0,
        seed: 123,
        source: 'fixture',
        deterministicTrajectory: fixture.deterministicTrajectory,
      });

      expect(result).toBeDefined();
      expect(result.prizes.length).toBe(6);
      expect(result.winningIndex).toBe(0);
    });
  });

  describe('Provider Error Handling', () => {
    it('returns normalized error from default provider on validation failure', async () => {
      const provider = createDefaultPrizeProvider({ count: 10 });

      await expect(provider.load()).rejects.toThrow(Error);
      await expect(provider.load()).rejects.toThrow(/between 3 and 8/);
    });

    it('returns normalized error from fixture provider on validation failure', async () => {
      // Test intentionally uses invalid data to verify error handling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidFixture: any = {
        prizes: [],
        winningIndex: 0,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const provider = createFixturePrizeProvider(invalidFixture);

      await expect(provider.load()).rejects.toThrow(Error);
    });
  });
});
