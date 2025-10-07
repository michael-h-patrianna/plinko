import { createDefaultPrizeProvider, type PrizeProvider } from '../game/prizeProvider';

export interface FeatureFlags {
  /** Controls whether developer tooling renders in production bundles. */
  devToolsEnabled: boolean;
  /** Enables the alternate drop-position choice mechanic. */
  dropPositionMechanicEnabled: boolean;
}

/**
 * Performance mode configuration
 * Allows parent applications to control quality vs battery trade-offs
 */
export type PerformanceMode = 'high-quality' | 'balanced' | 'power-saving';

export interface PerformanceConfig {
  /**
   * Performance mode controls quality vs battery consumption
   * - 'high-quality': Full visual effects (60 FPS, all particles, trail effects)
   * - 'balanced': Moderate quality (60 FPS, reduced particles)
   * - 'power-saving': Battery optimized (30 FPS, minimal particles, no trail)
   * @default 'high-quality'
   */
  mode: PerformanceMode;

  /**
   * Override individual performance settings
   * When provided, these take precedence over the mode preset
   */
  overrides?: {
    /** Animation frame rate (FPS). Default: 60 for high-quality, 30 for power-saving */
    fps?: number;
    /** Show ball trail effect. Default: true for high-quality, false for power-saving */
    showTrail?: boolean;
    /** Particle count multiplier (0-1). Default: 1 for high-quality, 0.5 for power-saving */
    particleMultiplier?: number;
    /** Enable infinite animations. Default: true for high-quality, false for power-saving */
    enableInfiniteAnimations?: boolean;
  };
}

export interface AppConfig {
  featureFlags: FeatureFlags;
  prizeProvider: PrizeProvider;
  performance: PerformanceConfig;
}

export type AppConfigOverrides = {
  featureFlags?: Partial<FeatureFlags>;
  prizeProvider?: PrizeProvider;
  performance?: Partial<PerformanceConfig>;
};

/**
 * Get environment-aware feature flags.
 * In production, dev tools are disabled by default but can be enabled via env var.
 * In development, dev tools are enabled by default.
 */
function getDefaultFeatureFlags(): FeatureFlags {
  const isProduction = import.meta.env.PROD;
  const forceDevTools = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';

  return {
    // Disable dev tools in production unless explicitly enabled
    devToolsEnabled: isProduction ? forceDevTools : true,
    // Drop position mechanic can be enabled in both dev and production
    dropPositionMechanicEnabled: true,
  };
}

const defaultFeatureFlags: FeatureFlags = getDefaultFeatureFlags();

function getDefaultPerformanceConfig(): PerformanceConfig {
  return {
    mode: 'high-quality',
    overrides: undefined,
  };
}

export function createDefaultAppConfig(): AppConfig {
  return {
    featureFlags: { ...defaultFeatureFlags },
    prizeProvider: createDefaultPrizeProvider(),
    performance: getDefaultPerformanceConfig(),
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
    performance: {
      ...base.performance,
      ...overrides.performance,
      overrides: {
        ...base.performance.overrides,
        ...overrides.performance?.overrides,
      },
    },
  };
}

/**
 * Get performance setting based on mode and overrides
 * Helper function to resolve the effective performance configuration
 */
export function getPerformanceSetting<K extends keyof Required<PerformanceConfig>['overrides']>(
  config: PerformanceConfig,
  setting: K
): Required<PerformanceConfig>['overrides'][K] {
  // Check if there's an explicit override
  if (config.overrides && config.overrides[setting] !== undefined) {
    return config.overrides[setting];
  }

  // Otherwise use mode preset
  const presets: Record<PerformanceMode, Required<PerformanceConfig>['overrides']> = {
    'high-quality': {
      fps: 60,
      showTrail: true,
      particleMultiplier: 1.0,
      enableInfiniteAnimations: true,
    },
    balanced: {
      fps: 60,
      showTrail: true,
      particleMultiplier: 0.7,
      enableInfiniteAnimations: false,
    },
    'power-saving': {
      fps: 30,
      showTrail: false,
      particleMultiplier: 0.5,
      enableInfiniteAnimations: false,
    },
  };

  return presets[config.mode][setting];
}
