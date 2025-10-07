/**
 * Barrel export for configuration modules
 */

// App configuration
export {
  createDefaultAppConfig,
  mergeAppConfig,
} from './appConfig';

export type {
  FeatureFlags,
  AppConfig,
  AppConfigOverrides,
} from './appConfig';

export {
  AppConfigProvider,
  useAppConfig,
} from './AppConfigContext';

// Prize tables
export {
  MOCK_PRIZES,
  generateRandomPrizeSet,
  getPrizeByIndex,
  createValidatedPrizeSet,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  generateProductionPrizeSet,
  createValidatedProductionPrizeSet,
} from './prizes';

export type {
  ProductionPrizeSetOptions,
} from './prizes';

// Timing configuration
export {
  CURRENCY_COUNTER,
  UI_TRANSITIONS,
  POPUP,
  GAME,
  WIN_ANIMATIONS,
  PRIZE_REVEAL,
  PRIZE_CLAIMED,
  START_SCREEN,
  BUTTON,
  SCREEN_SHAKE,
  TIMING_PRESETS,
} from './timing';

// Responsive configuration
export {
  BREAKPOINTS,
  MAX_MOBILE_WIDTH,
  DEVICE_THRESHOLDS,
  COMMON_MOBILE_VIEWPORTS,
  BOARD_DIMENSIONS,
  PHYSICS_DIMENSIONS,
  MEDIA_QUERIES,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  getDeviceTypeFromWidth,
  clampToMobileMax,
} from './responsive';
