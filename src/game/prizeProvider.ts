import {
  createValidatedProductionPrizeSet,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  type ProductionPrizeSetOptions,
} from '@config/prizes/productionPrizeTable';
import type { PrizeFixture } from '@tests/fixtures/prizeFixtures';
import { validatePrizeSet } from '@utils/prizeUtils';
import { z } from 'zod';
import { validatePrizesOrThrow } from './prizeValidation';
import { selectPrize } from './rng';
import type { DeterministicTrajectoryPayload, PrizeConfig } from './types';

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
    amount: z.number().positive(),
    config: collectibleSchema,
  })
  .strict();

const freeRewardSchema = z
  .object({
    gc: z.number().positive().optional(),
    sc: z.number().positive().optional(),
    spins: z.number().positive().optional(),
    xp: xpRewardSchema.optional(),
    randomReward: randomRewardSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      // At least one reward must be present
      return (
        data.gc !== undefined ||
        data.sc !== undefined ||
        data.spins !== undefined ||
        data.xp !== undefined ||
        data.randomReward !== undefined
      );
    },
    {
      message: 'FreeReward must contain at least one reward (gc, sc, spins, xp, or randomReward)',
    }
  );

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
  .catchall(z.unknown());

const prizeArraySchema = z
  .array(prizeConfigSchema)
  .min(3, 'Prize table must contain at least 3 entries.')
  .max(8, 'Prize table must contain no more than 8 entries.');

const trajectoryPointSchema = z.object({
  frame: z.number().int(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  pegHit: z.boolean().optional(),
  pegHitRow: z.number().int().optional(),
  pegHitCol: z.number().int().optional(),
  pegsHit: z
    .array(
      z.object({
        row: z.number().int(),
        col: z.number().int(),
      })
    )
    .optional(),
  vx: z.number().optional(),
  vy: z.number().optional(),
  wallHit: z.enum(['left', 'right']).optional(),
  bucketWallHit: z.enum(['left', 'right']).optional(),
  bucketFloorHit: z.boolean().optional(),
});

const deterministicTrajectorySchema = z.object({
  points: z.array(trajectoryPointSchema).min(1, 'Deterministic path requires at least one point.'),
  landingSlot: z.number().int().min(0).optional(),
  seed: z.number().int().optional(),
  provider: z.string().min(1).optional(),
});

const basePrizeProviderResultSchema = z.object({
  prizes: prizeArraySchema,
  winningIndex: z.number().int().min(0),
  seed: z.number().int(),
  source: z.enum(['default', 'fixture', 'remote']).default('default'),
  deterministicTrajectory: deterministicTrajectorySchema.optional(),
});

export const prizeProviderResultSchema = basePrizeProviderResultSchema.superRefine((value, ctx) => {
  const { prizes, winningIndex } = value;
  if (winningIndex >= prizes.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['winningIndex'],
      message: `Winning index ${winningIndex} is out of bounds for prize list of length ${prizes.length}.`,
    });
  }

  if (
    value.deterministicTrajectory?.landingSlot !== undefined &&
    value.deterministicTrajectory.landingSlot >= prizes.length
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['deterministicTrajectory', 'landingSlot'],
      message: `Deterministic trajectory landing slot ${value.deterministicTrajectory.landingSlot} is out of bounds for prize list of length ${prizes.length}.`,
    });
  }

  // Validate probability sums
  try {
    validatePrizeSet(prizes as PrizeConfig[]);
  } catch (error: unknown) {
    ctx.addIssue({
      code: 'custom',
      message: error instanceof Error ? error.message : 'Invalid prize configuration',
    });
  }

  // Validate type-specific prize structures
  try {
    validatePrizesOrThrow(prizes);
  } catch (error: unknown) {
    ctx.addIssue({
      code: 'custom',
      message: error instanceof Error ? error.message : 'Prize validation failed',
    });
  }
});

type ParsedPrizeProviderResult = z.infer<typeof prizeProviderResultSchema>;

export interface PrizeProviderResult {
  prizes: PrizeConfig[];
  winningIndex: number;
  seed: number;
  source: PrizeProviderSource;
  deterministicTrajectory?: DeterministicTrajectoryPayload;
}

export interface PrizeProviderContext {
  seedOverride?: number;
  requestId?: string;
}

export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
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
    deterministicTrajectory: parsed.deterministicTrajectory,
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
    count: options.count,
    seed: resolvedSeed,
  });

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
  options: DefaultPrizeProviderOptions = { count: DEFAULT_PRODUCTION_PRIZE_COUNT }
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
    deterministicTrajectory: fixture.deterministicTrajectory,
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
  };
}

export function validatePrizeProviderPayload(payload: unknown): PrizeProviderResult {
  const parsed = prizeProviderResultSchema.parse(payload);
  return coercePrizeProviderResult(parsed);
}
