/**
 * Design Tokens - Cross-Platform Compatible
 *
 * These tokens are designed to work on both Web (React + CSS) and React Native.
 *
 * CROSS-PLATFORM CONSTRAINTS:
 * ✅ ALLOWED: Colors, linear gradients, opacity, transforms, spacing values
 * ❌ FORBIDDEN: Box shadows, text shadows, radial gradients, blur, backdrop-filter
 *
 * All values in this file maintain cross-platform compatibility for future React Native port.
 */

import type { CSSProperties } from 'react';
import { hexToRgba } from '../utils/formatting/colorUtils';

// Re-export for backwards compatibility
export { hexToRgba };

// ===========================
// COLOR TOKENS
// ===========================

export const colorTokens = {
  // Neutral palette
  white: '#ffffff',
  black: '#000000',

  // Gray scale (slate colors)
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Brand colors
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Status colors
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Prize colors
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Brutalist colors
  brutalist: {
    red: '#db0000',
    redDark: '#a00000',
    white: '#ffffff',
    offWhite: '#f5f5f5',
    lightGray: '#e0e0e0',
    gray: '#666666',
    darkGray: '#333333',
    black: '#000000',
  },
} as const;

// ===========================
// SPACING TOKENS (works on web and RN)
// ===========================

export const spacingTokens = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;

// ===========================
// TYPOGRAPHY TOKENS
// ===========================

export const typographyTokens = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    brutalist: 'Arial, Helvetica, sans-serif',
    brutalistDisplay: 'Arial Black, sans-serif',
    brutalistMono: 'Courier New, monospace',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
} as const;

// ===========================
// BORDER RADIUS TOKENS
// ===========================

export const borderRadiusTokens = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,

  // Component specific
  button: 3,
  card: 12,
  input: 3,
  modal: 16,
  badge: 4,
  chip: 9999,
  ball: 9999, // 50% in CSS
  peg: 9999,
} as const;

// ===========================
// OPACITY TOKENS
// ===========================

export const opacityTokens = {
  0: 0,
  5: 0.05,
  10: 0.1,
  15: 0.15,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  85: 0.85,
  90: 0.9,
  95: 0.95,
  98: 0.98,
  100: 1,
} as const;

// ===========================
// ANIMATION TOKENS
// ===========================

export const animationTokens = {
  duration: {
    instant: 0,
    fastest: 50,
    faster: 100,
    fast: 150,
    normal: 200,
    medium: 300,
    slow: 500,
    slower: 800,
    slowest: 1000,
    xSlow: 2000,
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ===========================
// GRADIENT TOKENS (LINEAR ONLY - RN COMPATIBLE)
// ===========================

export const gradientTokens = {
  // Background gradients
  background: {
    main: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    overlay: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
    card: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)',
    header: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  },

  // Button gradients
  button: {
    primary: 'linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
    primaryHover: 'linear-gradient(135deg, rgb(147, 197, 253) 0%, rgb(96, 165, 250) 50%, rgb(59, 130, 246) 100%)',
    secondary: 'linear-gradient(135deg, rgb(71, 85, 105) 0%, rgb(51, 65, 85) 50%, rgb(30, 41, 59) 100%)',
    secondaryHover: 'linear-gradient(135deg, rgb(100, 116, 139) 0%, rgb(71, 85, 105) 50%, rgb(51, 65, 85) 100%)',
    success: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    danger: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
  },

  // Prize gradients
  prize: {
    orange: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    yellow: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
    emerald: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)',
    blue: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #2563eb 100%)',
    violet: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%)',
  },

  // Game element gradients
  game: {
    ball: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #fb923c 70%, #f97316 100%)',
    ballGlow: 'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 50%, transparent 100%)',
    pegDefault: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 70%, #64748b 100%)',
    pegActive: 'linear-gradient(135deg, #fef3c7 0%, #fde047 30%, #facc15 70%, #eab308 100%)',
    slotBackground: 'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(59,130,246,0.2) 70%, rgba(59,130,246,0.4) 100%)',
    slotHighlight: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
    slotWin: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
  },

  // Effect gradients
  effect: {
    glow: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
    shine: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
  },
} as const;

// ===========================
// BORDER WIDTH TOKENS
// ===========================

export const borderWidthTokens = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  6: 6,
  8: 8,
} as const;

// ===========================
// Z-INDEX TOKENS
// ===========================

export const zIndexTokens = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,

  // Named layers
  base: 0,
  board: 10,
  peg: 15,
  slot: 16,
  ballTrail: 18,
  ballGlow: 19,
  ballGlowMid: 20,
  ball: 21,
  overlay: 30,
  countdown: 40,
  dropdown: 1000,
  modal: 1100,
  popover: 1200,
  tooltip: 1300,
  notification: 1400,
} as const;

// ===========================
// SIZE TOKENS (common dimensions)
// ===========================

export const sizeTokens = {
  // Ball sizes
  ball: {
    diameter: 14,
    glowMid: 24,
    glowOuter: 36,
    trail: 8, // Half the ball size - clearly distinguishable from ball
    /**
     * Maximum trail length - Pool size for pre-rendered trail elements
     * This determines the maximum number of trail points that can be rendered simultaneously.
     * Used by BallAnimationDriver to create a fixed pool of trail divs that are recycled.
     */
    maxTrailLength: 20,
  },

  // Peg sizes
  peg: {
    diameter: 8,
  },

  // Board dimensions
  board: {
    width: 450,
    maxWidth: 500,
    height: 500,
    borderWidth: 8,
    playableHeightPercent: 0.65,
  },

  // Header
  header: {
    height: 64,
  },

  // Common component sizes
  button: {
    heightSm: 32,
    heightMd: 40,
    heightLg: 48,
  },

  input: {
    height: 40,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

// ===========================
// BREAKPOINT TOKENS
// ===========================

export const breakpointTokens = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ===========================
// SEMANTIC TOKENS (theme-aware shortcuts)
// ===========================

/**
 * Semantic tokens provide theme-aware shortcuts for common use cases.
 * These reference the base tokens above but add semantic meaning.
 */
export const semanticTokens = {
  // Text colors
  text: {
    primary: colorTokens.gray[100],
    secondary: colorTokens.gray[300],
    tertiary: colorTokens.gray[400],
    disabled: colorTokens.gray[500],
    inverse: colorTokens.gray[900],
    link: colorTokens.blue[500],
    linkHover: colorTokens.blue[400],
  },

  // Background colors
  background: {
    primary: colorTokens.gray[900],
    secondary: colorTokens.gray[800],
    tertiary: colorTokens.gray[700],
    elevated: colorTokens.gray[600],
  },

  // Border colors
  border: {
    default: colorTokens.gray[600],
    light: colorTokens.gray[500],
    dark: colorTokens.gray[700],
    focus: colorTokens.blue[500],
  },

  // Status colors
  status: {
    success: colorTokens.emerald[500],
    warning: colorTokens.amber[500],
    error: colorTokens.red[500],
    info: colorTokens.blue[500],
  },
} as const;

// ===========================
// COMPONENT TOKENS
// ===========================

/**
 * Component-specific token collections for common UI patterns.
 * These combine base tokens for specific components.
 */
export const componentTokens = {
  card: {
    padding: spacingTokens[6],
    borderRadius: borderRadiusTokens.card,
    borderWidth: borderWidthTokens[1],
  },

  modal: {
    padding: spacingTokens[8],
    borderRadius: borderRadiusTokens.modal,
    backdropOpacity: opacityTokens[90],
  },

  button: {
    paddingX: spacingTokens[6],
    paddingY: spacingTokens[3],
    borderRadius: borderRadiusTokens.button,
    borderWidth: borderWidthTokens[2],
    fontWeight: typographyTokens.fontWeight.semibold,
    fontSize: typographyTokens.fontSize.base,
  },

  input: {
    padding: spacingTokens[3],
    borderRadius: borderRadiusTokens.input,
    borderWidth: borderWidthTokens[1],
    fontSize: typographyTokens.fontSize.base,
    height: sizeTokens.input.height,
  },

  tooltip: {
    padding: spacingTokens[2],
    borderRadius: borderRadiusTokens.md,
    fontSize: typographyTokens.fontSize.sm,
    maxWidth: 320,
  },
} as const;

// ===========================
// LAYOUT TOKENS
// ===========================

/**
 * Layout-specific token collections for container and positioning patterns.
 * These tokens centralize layout values used across the application.
 */
export const layoutTokens = {
  /**
   * Main container layout settings for different viewport sizes
   */
  container: {
    /** Padding for mobile viewports */
    mobilePadding: spacingTokens[0],
    /** Padding for desktop viewports */
    desktopPadding: spacingTokens[4],
  },

  /**
   * DevTools positioning and sizing configuration
   */
  devTools: {
    /** Fixed position bottom offset */
    bottom: 0,
    /** Fixed position right offset */
    right: 0,
    /** z-index for DevTools overlay */
    zIndex: 9999,
    /** Width setting for DevTools container */
    width: '100%',
    /** Base value for desktop maxWidth calculation (used in calc(50vw + Xpx)) */
    desktopMaxWidthBase: 400,
  },

  /**
   * Game container layout settings
   */
  gameContainer: {
    /** Margin setting for centered layout */
    margin: '0 auto',
    /** Maximum width for mobile viewports */
    mobileMaxWidth: 414,
    /** Height setting for mobile viewports */
    mobileHeight: '100vh',
    /** Display mode */
    display: 'flex',
    /** Flex direction */
    flexDirection: 'column' as const,
    /** Justify content for mobile */
    mobileJustifyContent: 'center' as const,
    /** Transition duration for width changes (milliseconds) */
    transitionDuration: animationTokens.duration.medium,
    /** Transition easing function */
    transitionEasing: animationTokens.easing.easeInOut,
  },
} as const;

// ===========================
// COMMON STYLE PATTERNS
// ===========================

/**
 * Reusable style pattern tokens for commonly used inline styles.
 * These patterns combine base tokens to reduce inline style verbosity.
 */
export const stylePatternTokens = {
  /**
   * Flexbox centering patterns
   */
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,

  flexCenterColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,

  flexStart: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  } as const,

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const,

  /**
   * Absolute positioning patterns
   */
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as const,

  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  } as const,

  /**
   * Common overlay/backdrop styles
   */
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
  },

  /**
   * Text truncation patterns
   */
  textTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,

  textClamp: (lines: number) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  }),

  /**
   * Transform origins for animations
   */
  transformOrigins: {
    center: 'center center',
    top: 'center top',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center',
  } as const,
} as const;

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Get spacing value in rem (for web) or number (for RN)
 * @param web - If true, returns rem string; if false, returns number
 */
export function getSpacing(key: keyof typeof spacingTokens, web: boolean = true): string | number {
  const value = spacingTokens[key];
  return web ? `${value / 16}rem` : value;
}

/**
 * Get font size in rem (for web) or number (for RN)
 * @param web - If true, returns rem string; if false, returns number
 */
export function getFontSize(key: keyof typeof typographyTokens.fontSize, web: boolean = true): string | number {
  const value = typographyTokens.fontSize[key];
  return web ? `${value / 16}rem` : value;
}

/**
 * Get border radius in px string (for web) or number (for RN)
 * @param web - If true, returns px string; if false, returns number
 */
export function getBorderRadius(key: keyof typeof borderRadiusTokens, web: boolean = true): string | number {
  const value = borderRadiusTokens[key];
  return web ? (value === 9999 ? '50%' : `${value}px`) : value;
}

// ===========================
// LAYOUT HELPER FUNCTIONS
// ===========================

/**
 * Get container padding based on viewport type
 * @param isMobile - Whether the viewport is mobile
 * @returns Padding value (0 for mobile, 1rem for desktop)
 */
export function getContainerPadding(isMobile: boolean): string {
  return isMobile ? '0' : '1rem';
}

/**
 * Get DevTools container styles based on viewport type
 * @param isMobile - Whether the viewport is mobile
 * @param maxWidthBase - Base value for desktop maxWidth calculation (default: 400)
 * @returns Style object for DevTools container
 */
export function getDevToolsStyles(isMobile: boolean, maxWidthBase: number = layoutTokens.devTools.desktopMaxWidthBase): CSSProperties {
  return {
    position: 'fixed',
    bottom: layoutTokens.devTools.bottom,
    right: layoutTokens.devTools.right,
    zIndex: layoutTokens.devTools.zIndex,
    maxWidth: isMobile ? undefined : `calc(50vw + ${maxWidthBase}px)`,
    width: layoutTokens.devTools.width,
    pointerEvents: 'none',
  };
}

/**
 * Get game container styles based on viewport and board settings
 * @param isMobile - Whether the viewport is mobile
 * @param lockedBoardWidth - The locked board width in pixels
 * @param isViewportLocked - Whether the viewport is locked (disables transition)
 * @returns Style object for game container
 */
export function getGameContainerStyles(
  isMobile: boolean,
  lockedBoardWidth: number,
  isViewportLocked: boolean
): CSSProperties {
  return {
    width: isMobile ? '100%' : `${lockedBoardWidth}px`,
    margin: layoutTokens.gameContainer.margin,
    maxWidth: isMobile ? `${layoutTokens.gameContainer.mobileMaxWidth}px` : undefined,
    height: isMobile ? layoutTokens.gameContainer.mobileHeight : undefined,
    display: layoutTokens.gameContainer.display,
    flexDirection: layoutTokens.gameContainer.flexDirection,
    justifyContent: isMobile ? layoutTokens.gameContainer.mobileJustifyContent : undefined,
    transition: isViewportLocked ? 'none' : `width ${layoutTokens.gameContainer.transitionDuration}ms ${layoutTokens.gameContainer.transitionEasing}`,
  };
}

// ===========================
// TYPE EXPORTS
// ===========================

export type ColorToken = typeof colorTokens;
export type SpacingToken = typeof spacingTokens;
export type TypographyToken = typeof typographyTokens;
export type BorderRadiusToken = typeof borderRadiusTokens;
export type OpacityToken = typeof opacityTokens;
export type AnimationToken = typeof animationTokens;
export type GradientToken = typeof gradientTokens;
export type BorderWidthToken = typeof borderWidthTokens;
export type ZIndexToken = typeof zIndexTokens;
export type SizeToken = typeof sizeTokens;
export type BreakpointToken = typeof breakpointTokens;
export type SemanticToken = typeof semanticTokens;
export type ComponentToken = typeof componentTokens;
export type LayoutToken = typeof layoutTokens;
export type StylePatternToken = typeof stylePatternTokens;
