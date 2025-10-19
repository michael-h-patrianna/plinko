/**
 * Utility functions for gradient parsing, color conversion, and serialization
 *
 * @deprecated This file is maintained for backward compatibility.
 * New code should import from:
 * - @lib/shared/utils/colorConversion for color conversion functions
 * - @lib/shared/utils/gradientCalculations for gradient calculation functions
 * - @lib/shared/utils/performance for debounce/throttle utilities
 */

// Re-export all color conversion functions
export {
  colorsEqual,
  formatColor,
  hexToHsv,
  hexToRgb,
  hslToRgb,
  hsvToHex,
  hsvToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from '../shared/utils/colorConversion';

// Re-export all gradient calculation functions
export {
  angleToDirection,
  clampPosition,
  directionToAngle,
  generateStopId,
  getColorAtPosition,
  interpolateColor,
  normalizeAngle,
  sortStops,
} from '../shared/utils/gradientCalculations';

// Re-export performance utilities
export { debounce } from '../shared/utils/performance';

// Keep types for backward compatibility
export type { ColorFormat, ColorStop, HSLColor, HSVColor, RGBColor } from './types';
