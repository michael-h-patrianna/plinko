import { z } from 'zod';
import {
  createValidatedProductionPrizeSet,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  type ProductionPrizeSetOptions,
} from '../config/productionPrizeTable';
import type { PrizeFixture } from '../tests/fixtures/prizeFixtures';
import { validatePrizeSet } from '../utils/prizeUtils';
import { selectPrize } from './rng';
import type { PrizeConfig } from './types';

export type PrizeProviderSource = 'default' | 'fixture' | 'remote';

const collectibleSchema = z
  .object({
    icon: z.string().min(1),
    name: z.string().min(1),
  })
  .strict();

const randomRewardSchema = z
  .object({
    config: z.object({
      icon: z.string().min(1),
      name: z.string().min(1),
    }),
  })
  .strict();

const xpRewardSchema = z
  .object({
    amount: z.number().nonnegative(),
    config: collectibleSchema,
  })
  .strict();

const freeRewardSchema = z
  .object({
    gc: z.number().nonnegative().optional(),
    sc: z.number().nonnegative().optional(),
    spins: z.number().nonnegative().optional(),
    xp: xpRewardSchema.optional(),
    randomReward: randomRewardSchema.optional(),
  })
  .strict();

const purchaseOfferSchema = z
  .object({
    offerId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default(''),
  })
  .strict();

export const prizeConfigSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['no_win', 'free', 'purchase']),
    probability: z.number().min(0),
    slotIcon: z.string().min(1),
    slotColor: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    label: z.string().optional(),
    color: z.string().optional(),
    freeReward: freeRewardSchema.optional(),
    purchaseOffer: purchaseOfferSchema.optional(),
  })
  .passthrough();

const prizeArraySchema = z
  .array(prizeConfigSchema)
  .min(3, 'Prize table must contain at least 3 entries.')
  .max(8, 'Prize table must contain no more than 8 entries.');

const basePrizeProviderResultSchema = z.object({
  prizes: prizeArraySchema,
  winningIndex: z.number().int().min(0),
  seed: z.number().int(),
  source: z.enum(['default', 'fixture', 'remote']).default('default'),
});

export const prizeProviderResultSchema = basePrizeProviderResultSchema.superRefine((value, ctx) => {
  const { prizes, winningIndex } = value;
  if (winningIndex >= prizes.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['winningIndex'],
      message: `Winning index ${winningIndex} is out of bounds for prize list of length ${prizes.length}.`,
    });
  }

  try {
    validatePrizeSet(prizes as PrizeConfig[]);
  } catch (error: unknown) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Invalid prize configuration',
    });
  }
});

type ParsedPrizeProviderResult = z.infer<typeof prizeProviderResultSchema>;

export interface PrizeProviderResult {
  prizes: PrizeConfig[];
  winningIndex: number;
  seed: number;
  source: PrizeProviderSource;
}

export interface PrizeProviderContext {
  seedOverride?: number;
  requestId?: string;
}

export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  loadSync?(context?: PrizeProviderContext): PrizeProviderResult;
}

export interface DefaultPrizeProviderOptions extends ProductionPrizeSetOptions {
  source?: PrizeProviderSource;
}

function coercePrizeProviderResult(parsed: ParsedPrizeProviderResult): PrizeProviderResult {
  return {
    prizes: parsed.prizes as PrizeConfig[],
    winningIndex: parsed.winningIndex,
    seed: parsed.seed,
    source: parsed.source,
  };
}

function resolveSeedValue(value: number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }
  return Math.floor(Date.now());
}

function buildDefaultSession(
  options: DefaultPrizeProviderOptions,
  context?: PrizeProviderContext
): PrizeProviderResult {
  const resolvedSeed = resolveSeedValue(context?.seedOverride ?? options.seed);
  const prizeSet = createValidatedProductionPrizeSet({
    count: options.count ?? DEFAULT_PRODUCTION_PRIZE_COUNT,
    seed: resolvedSeed,
  }) as PrizeConfig[];

  const { selectedIndex, seedUsed } = selectPrize(prizeSet, resolvedSeed);

  const parsed = prizeProviderResultSchema.parse({
    prizes: prizeSet,
    winningIndex: selectedIndex,
    seed: seedUsed,
    source: options.source ?? 'default',
  });

  return coercePrizeProviderResult(parsed);
}

export function createDefaultPrizeProvider(
  options: DefaultPrizeProviderOptions = {}
): PrizeProvider {
  return {
    load(context): Promise<PrizeProviderResult> {
      try {
        const session = buildDefaultSession(options, context);
        return Promise.resolve(session);
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('Failed to load prize session');
        return Promise.reject(normalizedError);
      }
    },
    loadSync(context): PrizeProviderResult {
      return buildDefaultSession(options, context);
    },
  };
}

function buildFixtureSession(
  fixture: PrizeFixture,
  context?: PrizeProviderContext
): PrizeProviderResult {
  const resolvedSeed = resolveSeedValue(context?.seedOverride ?? fixture.winningIndex);
  const parsed = prizeProviderResultSchema.parse({
    prizes: fixture.prizes,
    winningIndex: fixture.winningIndex,
    seed: resolvedSeed,
    source: 'fixture',
  });

  return coercePrizeProviderResult(parsed);
}

export function createFixturePrizeProvider(fixture: PrizeFixture): PrizeProvider {
  return {
    load(context): Promise<PrizeProviderResult> {
      try {
        const session = buildFixtureSession(fixture, context);
        return Promise.resolve(session);
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('Failed to load prize session');
        return Promise.reject(normalizedError);
      }
    },
    loadSync(context): PrizeProviderResult {
      return buildFixtureSession(fixture, context);
    },
  };
}

export function validatePrizeProviderPayload(payload: unknown): PrizeProviderResult {
  const parsed = prizeProviderResultSchema.parse(payload);
  return coercePrizeProviderResult(parsed);
}
