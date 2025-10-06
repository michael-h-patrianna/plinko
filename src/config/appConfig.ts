import { createDefaultPrizeProvider, type PrizeProvider } from '../game/prizeProvider';

export interface FeatureFlags {
  /** Controls whether developer tooling renders in production bundles. */
  devToolsEnabled: boolean;
  /** Enables the alternate drop-position choice mechanic. */
  dropPositionMechanicEnabled: boolean;
}

export interface AppConfig {
  featureFlags: FeatureFlags;
  prizeProvider: PrizeProvider;
}

export type AppConfigOverrides = {
  featureFlags?: Partial<FeatureFlags>;
  prizeProvider?: PrizeProvider;
};

const defaultFeatureFlags: FeatureFlags = {
  devToolsEnabled: true,
  dropPositionMechanicEnabled: true,
};

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
    prizeProvider: overrides.prizeProvider ?? base.prizeProvider,
  };
}
