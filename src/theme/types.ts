/**
 * Theme Type Definitions
 * COMPLETE theming system for the Plinko application
 * Every visual aspect must be themeable - no hard-coded styles allowed
 */

// Button variants configuration
// RN-COMPATIBLE: No shadow fields (intentionally removed for cross-platform compatibility)
export interface ButtonStyle {
  background: string;
  backgroundHover?: string;
  backgroundActive?: string;
  border: string;
  borderWidth: string;
  borderRadius: string | number;
  color: string;
  colorHover?: string;
  textTransform?: string;
  padding: {
    x: string;
    y: string;
  };
  fontSize: string;
  fontWeight: number;
  transition: string;
  // For outline variants
  outline?: boolean;
}

export interface ThemeButtons {
  primary: ButtonStyle;
  secondary: ButtonStyle;
  outline: ButtonStyle;
  ghost: ButtonStyle;
  danger: ButtonStyle;
  success: ButtonStyle;
  sizes: {
    sm: { padding: { x: string; y: string }; fontSize: string };
    md: { padding: { x: string; y: string }; fontSize: string };
    lg: { padding: { x: string; y: string }; fontSize: string };
  };
}

// Component-specific styles
// RN-COMPATIBLE: No shadow fields (intentionally removed for cross-platform compatibility)
export interface ComponentStyles {
  card: {
    background: string;
    border: string;
    borderWidth: string;
    borderRadius: string | number;
    padding: string;
  };
  modal: {
    background: string;
    backdropColor: string;
    borderRadius: string | number;
    padding: string;
  };
  header: {
    height: string;
    background: string;
    borderBottom: string;
  };
  input: {
    background: string;
    border: string;
    borderRadius: string | number;
    borderFocus: string;
    padding: string;
  };
  dropdown: {
    background: string;
    border: string;
    borderRadius: string | number;
    itemHover: string;
  };
  tooltip: {
    background: string;
    color: string;
    borderRadius: string | number;
    padding: string;
    fontSize: string;
  };
}

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    overlayDark: string;
  };

  // Surface colors for cards, modals, etc
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
  };

  // Primary brand colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  // Accent colors
  accent: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };

  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Prize colors
  prizes: {
    orange: {
      main: string;
      light: string;
      dark: string;
    };
    yellow: {
      main: string;
      light: string;
      dark: string;
    };
    emerald: {
      main: string;
      light: string;
      dark: string;
    };
    blue: {
      main: string;
      light: string;
      dark: string;
    };
    violet: {
      main: string;
      light: string;
      dark: string;
    };
  };

  // Game element colors
  game: {
    ball: {
      primary: string;
      secondary: string;
      highlight: string;
      shadow: string;
      borderRadius: string | number;
    };
    peg: {
      default: string;
      active: string;
      highlight: string;
      borderRadius: string | number;
      shadow: string;
    };
    slot: {
      border: string;
      borderWidth: string;
      borderRadius: string | number;
      glow: string;
      background: string;
      // Optional per-slot style overrides for themes with limited colors (like brutalist)
      // Index-based array where slotStyles[0] applies to first slot, etc.
      slotStyles?: Array<{
        border?: string;
        borderWidth?: string;
        background?: string;
      }>;
    };
    launcher: {
      base: string;
      track: string;
      accent: string;
      borderRadius: string | number;
    };
    board: {
      background: string;
      border: string;
      borderRadius: string | number;
      shadow: string;
    };
  };

  // Border colors
  border: {
    default: string;
    light: string;
    dark: string;
    focus: string;
  };

  // Shadow colors (for colored shadows)
  shadows: {
    default: string;
    colored: string;
    glow: string;
  };
}

export interface ThemeGradients {
  // Background gradients
  backgroundMain: string;
  backgroundOverlay: string;
  backgroundCard: string;
  backgroundHeader: string;

  // Button gradients
  buttonPrimary: string;
  buttonSecondary: string;
  buttonSuccess: string;
  buttonDanger: string;
  buttonOutline?: string; // Optional for outline buttons

  // Prize gradients
  prizeOrange: string;
  prizeYellow: string;
  prizeEmerald: string;
  prizeBlue: string;
  prizeViolet: string;

  // Effect gradients
  glow: string;
  shine: string;
  shimmer: string;

  // Ball gradients
  ballMain: string;
  ballGlow: string;

  // Peg gradients
  pegDefault: string;
  pegActive: string;

  // Slot gradients
  slotBackground: string;
  slotHighlight: string;
  slotWin: string;

  // Text gradients
  textGradient?: string;
  titleGradient?: string;
}

export interface ThemeEffects {
  // Glow effects (using gradients instead of blur)
  // RN-COMPATIBLE: Uses color values, not CSS box-shadow
  glows: {
    sm: string;
    md: string;
    lg: string;
    colored: string;
    success: string;
    error: string;
  };

  // Border styles
  // RN-COMPATIBLE: Border style definitions
  borders: {
    none: string;
    thin: string;
    medium: string;
    thick: string;
    dashed: string;
    dotted: string;
  };

  // Transitions
  // RN-COMPATIBLE: Timing definitions (implementation differs between web/RN)
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface ThemeImages {
  // Logo and branding
  logo?: string;
  logoSmall?: string;
  favicon?: string;

  // Background images
  backgroundPattern?: string;
  backgroundTexture?: string;
  backgroundGradientImage?: string;

  // Prize icons
  prizeIcons?: {
    coins?: string;
    spins?: string;
    bonus?: string;
    jackpot?: string;
    xp?: string;
    randomReward?: string;
  };

  // Game elements
  gameElements?: {
    star?: string;
    sparkle?: string;
    confetti?: string;
    particle?: string;
  };

  // UI elements
  uiElements?: {
    loader?: string;
    spinner?: string;
    checkmark?: string;
    close?: string;
  };
}

export interface ThemeSpacing {
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary?: string;
    mono?: string;
    display?: string; // For headings
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
  };
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
  textTransform?: {
    uppercase?: string;
    lowercase?: string;
    capitalize?: string;
  };
}

export interface ThemeAnimation {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
    slowest: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
    sharp: string;
    smooth: string;
  };
  keyframes?: {
    [key: string]: string;
  };
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
  // Component specific
  button: string;
  card: string;
  input: string;
  modal: string;
  badge: string;
  chip: string;
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeZIndex {
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  auto: string;
  dropdown: number;
  modal: number;
  popover: number;
  tooltip: number;
  notification: number;
}

export interface Theme {
  name: string;
  isDark: boolean; // To help with automatic contrast adjustments
  colors: ThemeColors;
  gradients: ThemeGradients;
  effects: ThemeEffects;
  images: ThemeImages;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  animation: ThemeAnimation;
  borderRadius: ThemeBorderRadius;
  buttons: ThemeButtons;
  components: ComponentStyles;
  breakpoints: ThemeBreakpoints;
  zIndex: ThemeZIndex;
}

export type ThemeMode = 'light' | 'dark' | 'custom';
