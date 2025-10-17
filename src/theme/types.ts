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
}

// Component-specific styles
// RN-COMPATIBLE: No shadow fields (intentionally removed for cross-platform compatibility)
export interface ComponentStyles {
  card: {
    background: string;
    border: string;
    borderRadius: string | number;
  };
  modal: {
    background: string;
    borderRadius: string | number;
  };
}

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
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
    contrast: string;
  };

  // Accent colors
  accent: {
    main: string;
    light: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };

  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
  };

  // Prize colors (accessed via mapper, but kept for theme definition completeness)
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
      borderRadius: string | number;
    };
    peg: {
      highlight: string;
      borderRadius: string | number;
    };
    slot: {
      border: string;
      borderWidth: string;
      borderRadius: string | number;
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
      border: string;
      borderRadius: string | number;
    };
  };

  // Border colors
  border: {
    default: string;
    light: string;
  };

  // Shadow colors (for colored shadows)
  shadows: {
    default: string;
  };
}

export interface ThemeGradients {
  // Background gradients
  backgroundCard: string;

  // Button gradients
  buttonPrimary: string;
  buttonDanger: string;

  // Prize gradients (accessed via mapper)
  prizeOrange: string;
  prizeYellow: string;
  prizeEmerald: string;
  prizeBlue: string;
  prizeViolet: string;

  // Effect gradients
  glow: string;
  shine: string;

  // Ball gradients
  ballMain: string;
  ballGlow: string;

  // Peg gradients
  pegDefault: string;

  // Text gradients
  titleGradient?: string;
}

export interface ThemeEffects {
  // Transitions
  // RN-COMPATIBLE: Timing definitions (implementation differs between web/RN)
  transitions: {
    fast: string;
  };
}


export interface ThemeTypography {
  fontFamily: {
    primary: string;
    display?: string; // For headings
  };
}


export interface ThemeBorderRadius {
  sm: string;
  card: string;
}

export interface Theme {
  name: string;
  isDark: boolean; // To help with automatic contrast adjustments
  colors: ThemeColors;
  gradients: ThemeGradients;
  effects: ThemeEffects;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  buttons: ThemeButtons;
  components: ComponentStyles;
}

export type ThemeMode = 'light' | 'dark' | 'custom';
