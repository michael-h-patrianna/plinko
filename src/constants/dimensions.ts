/**
 * Centralized dimension constants for viewport, board, and layout values
 * All values in pixels unless otherwise noted
 */

// ============================================================================
// Viewport Breakpoints
// ============================================================================

export const VIEWPORT = {
  /** Minimum mobile width (320px) - smallest supported screen */
  MIN_MOBILE: 320,

  /** Small mobile width (360px) - common Android size */
  SMALL_MOBILE: 360,

  /** Default mobile width (375px) - iPhone standard */
  DEFAULT_MOBILE: 375,

  /** Max mobile width (414px) - iPhone Plus/Max sizes */
  MAX_MOBILE: 414,

  /** Tablet breakpoint (768px) - touch/mobile detection threshold */
  TABLET: 768,
} as const;

// ============================================================================
// Board Dimensions
// ============================================================================

export const BOARD = {
  /** Default board width (375px) */
  DEFAULT_WIDTH: 375,

  /** Default board height (500px) */
  DEFAULT_HEIGHT: 500,

  /** Default number of peg rows */
  DEFAULT_PEG_ROWS: 10,
} as const;

// ============================================================================
// UI Component Sizes
// ============================================================================

export const UI_SIZE = {
  /** Minimum button width (120px) - for consistent button sizing */
  MIN_BUTTON_WIDTH: 120,

  /** Standard button height (56px = 14 in h-14) */
  BUTTON_HEIGHT: 56,

  /** Icon size for prize reveals and displays (120px) */
  ICON_SIZE: 120,

  /** Minimum popup height for desktop (650px) */
  MIN_POPUP_HEIGHT: 650,

  /** Dev tools menu minimum width (320px) */
  DEV_TOOLS_MIN_WIDTH: 320,
} as const;

// ============================================================================
// Slot Dimensions
// ============================================================================

export const SLOT = {
  /** Narrow slot threshold (40px) - 8 prizes on 320px screen */
  NARROW_THRESHOLD: 40,

  /** Small slot threshold (50px) - 7-8 prizes on 375px screen */
  SMALL_THRESHOLD: 50,

  /** Bucket zone Y offset for narrow slots (105px from bottom) */
  NARROW_BUCKET_OFFSET: 105,

  /** Bucket zone Y offset for small slots (95px from bottom) */
  SMALL_BUCKET_OFFSET: 95,
} as const;

// ============================================================================
// Layout Spacing
// ============================================================================

export const LAYOUT = {
  /** Desktop max width calculation base (400px) - used in calc(50vw + 400px) */
  DESKTOP_MAX_WIDTH_BASE: 400,

  /** Border radius for small screens (12px) */
  SMALL_BORDER_RADIUS: 12,
} as const;
