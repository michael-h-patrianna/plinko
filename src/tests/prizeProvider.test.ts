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

  it('exposes consistent sync and async sessions', async () => {
    const provider = createDefaultPrizeProvider({ count: 6 });
    const context = { seedOverride: 987654321 };

    const asyncResult = await provider.load(context);
    const loadSync = provider.loadSync?.bind(provider);
    expect(loadSync).toBeDefined();
    const syncResult = loadSync!(context);

    expect(syncResult).toEqual(asyncResult);
    expect(syncResult.source).toBe('default');
  });

  it('propagates generation errors through both loaders', async () => {
    const provider = createDefaultPrizeProvider({ count: 2 });

    await expect(provider.load()).rejects.toThrow(/between 3 and 8/);
    const loadSync = provider.loadSync?.bind(provider);
    expect(loadSync).toBeDefined();
    expect(() => loadSync!()).toThrow(/between 3 and 8/);
  });
});
