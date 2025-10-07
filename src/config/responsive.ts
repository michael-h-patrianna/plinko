/**
 * Centralized responsive and viewport configuration
 * All dimensions in pixels
 */

/**
 * Viewport breakpoints for different device sizes
 */
export const BREAKPOINTS = {
  /** iPhone SE (smallest common mobile) */
  MOBILE_SM: 320,
  /** Galaxy S8 / Standard Android phones */
  MOBILE_MD: 360,
  /** iPhone 12 / Standard iPhone */
  MOBILE_LG: 375,
  /** iPhone 14 Pro Max / Large iPhone */
  MOBILE_XL: 414,
  /** Tablet breakpoint */
  TABLET: 768,
  /** Desktop breakpoint */
  DESKTOP: 1024,
} as const;

/**
 * Maximum viewport width for mobile devices
 * Used to cap the game board width on mobile devices
 */
export const MAX_MOBILE_WIDTH = BREAKPOINTS.MOBILE_XL;

/**
 * Device type detection thresholds
 */
export const DEVICE_THRESHOLDS = {
  /** Maximum width to be considered mobile */
  MOBILE_MAX: BREAKPOINTS.TABLET - 1,
  /** Minimum width for tablet */
  TABLET_MIN: BREAKPOINTS.TABLET,
  /** Maximum width to be considered tablet */
  TABLET_MAX: BREAKPOINTS.DESKTOP - 1,
  /** Minimum width for desktop */
  DESKTOP_MIN: BREAKPOINTS.DESKTOP,
} as const;

/**
 * Common mobile viewport sizes for testing
 * Includes device labels for reference
 */
export const COMMON_MOBILE_VIEWPORTS = [
  { width: 320, label: 'iPhone SE' },
  { width: 360, label: 'Galaxy S8' },
  { width: 375, label: 'iPhone 12' },
  { width: 414, label: 'iPhone 14 Pro Max' },
] as const;

/**
 * Game board dimensions
 */
export const BOARD_DIMENSIONS = {
  /** Default board height */
  DEFAULT_HEIGHT: 500,
  /** Default number of peg rows */
  DEFAULT_PEG_ROWS: 10,
  /** Default number of prize slots */
  DEFAULT_SLOT_COUNT: 7,
} as const;

/**
 * Physics constants (dimensions)
 */
export const PHYSICS_DIMENSIONS = {
  /** Ball radius in pixels */
  BALL_RADIUS: 9,
  /** Peg radius in pixels */
  PEG_RADIUS: 7,
  /** Collision detection radius (ball + peg) */
  COLLISION_RADIUS: 16,
  /** Border wall width */
  BORDER_WIDTH: 12,
} as const;

/**
 * Media query helpers
 */
export const MEDIA_QUERIES = {
  /** Mobile devices only */
  mobile: `(max-width: ${DEVICE_THRESHOLDS.MOBILE_MAX}px)`,
  /** Tablet devices only */
  tablet: `(min-width: ${DEVICE_THRESHOLDS.TABLET_MIN}px) and (max-width: ${DEVICE_THRESHOLDS.TABLET_MAX}px)`,
  /** Desktop devices only */
  desktop: `(min-width: ${DEVICE_THRESHOLDS.DESKTOP_MIN}px)`,
  /** Tablet and above */
  tabletAndUp: `(min-width: ${DEVICE_THRESHOLDS.TABLET_MIN}px)`,
  /** Mobile and tablet */
  mobileAndTablet: `(max-width: ${DEVICE_THRESHOLDS.TABLET_MAX}px)`,
} as const;

/**
 * Responsive helper functions
 */

/**
 * Check if a width is considered mobile
 */
export function isMobileWidth(width: number): boolean {
  return width <= DEVICE_THRESHOLDS.MOBILE_MAX;
}

/**
 * Check if a width is considered tablet
 */
export function isTabletWidth(width: number): boolean {
  return width >= DEVICE_THRESHOLDS.TABLET_MIN && width <= DEVICE_THRESHOLDS.TABLET_MAX;
}

/**
 * Check if a width is considered desktop
 */
export function isDesktopWidth(width: number): boolean {
  return width >= DEVICE_THRESHOLDS.DESKTOP_MIN;
}

/**
 * Get the device type for a given width
 */
export function getDeviceTypeFromWidth(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (isMobileWidth(width)) return 'mobile';
  if (isTabletWidth(width)) return 'tablet';
  return 'desktop';
}

/**
 * Clamp a width to the mobile maximum
 */
export function clampToMobileMax(width: number): number {
  return Math.min(width, MAX_MOBILE_WIDTH);
}
