/**
 * Barrel export for utility functions
 */

// Formatting utilities
export { abbreviateNumber } from './formatNumber';
export { validatePrizeSet } from './prizeUtils';
export { calculateBucketHeight, calculateBucketZoneY } from './slotDimensions';

// Device detection
export { isMobileDevice, getMaxMobileWidth, getResponsiveViewportWidth } from './deviceDetection';

// Color utilities
export { hexToRgba, parseHexColor } from './formatting/colorUtils';

// Platform adapters
export {
  dimensionsAdapter,
  deviceInfoAdapter,
  storageAdapter,
  cryptoAdapter,
  performanceAdapter,
  navigationAdapter,
} from './platform';
