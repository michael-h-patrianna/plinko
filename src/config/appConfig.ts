import { selectPrize as selectPrizeDefault } from '../game/rng';
import type { PrizeConfig } from '../game/types';
import { createValidatedProductionPrizeSet } from './productionPrizeTable';

export interface FeatureFlags {
  /** Controls whether developer tooling renders in production bundles. */
  devToolsEnabled: boolean;
  /** Enables the alternate drop-position choice mechanic. */
  dropPositionMechanicEnabled: boolean;
}

export interface PrizeProvider {
  /**
   * Creates a prize table for a new game session.
   * Host applications can override to inject server-provided payloads.
   */
  createPrizeSet: () => PrizeConfig[];
  /**
   * Selects the winning prize index for the provided set.
   * Implementations should remain deterministic when a seed override is supplied.
   */
  selectPrize: (
    prizes: PrizeConfig[],
    seedOverride?: number
  ) => {
    selectedIndex: number;
    seedUsed: number;
  };
}

export interface AppConfig {
  featureFlags: FeatureFlags;
  prizeProvider: PrizeProvider;
}

export type AppConfigOverrides = {
  featureFlags?: Partial<FeatureFlags>;
  prizeProvider?: Partial<PrizeProvider>;
};

const defaultFeatureFlags: FeatureFlags = {
  devToolsEnabled: true,
  dropPositionMechanicEnabled: true,
};

function createDefaultPrizeProvider(): PrizeProvider {
  return {
    createPrizeSet: () => createValidatedProductionPrizeSet() as PrizeConfig[],
    selectPrize: (prizes, seedOverride) => {
      const result = selectPrizeDefault(prizes, seedOverride);
      return {
        selectedIndex: result.selectedIndex,
        seedUsed: result.seedUsed,
      };
    },
  };
}

export function createDefaultAppConfig(): AppConfig {
  return {
    featureFlags: { ...defaultFeatureFlags },
    prizeProvider: createDefaultPrizeProvider(),
  };
}

export function mergeAppConfig(overrides?: AppConfigOverrides): AppConfig {
  const base = createDefaultAppConfig();

  if (!overrides) {
    return base;
  }

  return {
    featureFlags: {
      ...base.featureFlags,
      ...overrides.featureFlags,
    },
    prizeProvider: {
      ...base.prizeProvider,
      ...overrides.prizeProvider,
    },
  };
}
