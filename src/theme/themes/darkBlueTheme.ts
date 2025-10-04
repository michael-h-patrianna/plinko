/**
 * Dark Blue theme variant for the Plinko application
 * Alternative theme to demonstrate theming capability
 */

import { Theme } from '../types';
import {
  defaultSpacing,
  defaultBreakpoints,
  defaultZIndex,
  defaultBorderRadius,
  defaultButtons,
  defaultComponents
} from '../themeDefaults';

export const darkBlueTheme: Theme = {
  name: 'Dark Blue',
  isDark: true,

  colors: {
    background: {
      primary: '#0a0e27', // Dark blue
      secondary: '#111937', // Darker blue
      tertiary: '#1a2348', // Medium blue
      overlay: 'rgba(10, 14, 39, 0.9)',
      overlayDark: 'rgba(10, 14, 39, 0.98)',
    },

    surface: {
      primary: '#111937',
      secondary: '#1a2348',
      elevated: '#253154',
    },

    primary: {
      main: '#4f8ef7', // Bright blue
      light: '#6ea4ff',
      dark: '#3575e5',
      contrast: '#ffffff',
    },

    accent: {
      main: '#ff6b6b', // Coral red
      light: '#ff8888',
      dark: '#e55555',
      contrast: '#ffffff',
    },

    text: {
      primary: '#e8edf7',
      secondary: '#b4c2db',
      tertiary: '#8094b8',
      disabled: '#5a6e91',
      inverse: '#0a0e27',
    },

    status: {
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#4f8ef7',
    },

    prizes: {
      orange: {
        main: '#ff7043',
        light: '#ff8a65',
        dark: '#f4511e',
      },
      yellow: {
        main: '#ffb74d',
        light: '#ffcc80',
        dark: '#ffa726',
      },
      emerald: {
        main: '#4ade80',
        light: '#66e89e',
        dark: '#38d46d',
      },
      blue: {
        main: '#4f8ef7',
        light: '#6ea4ff',
        dark: '#3575e5',
      },
      violet: {
        main: '#ba68c8',
        light: '#ce93d8',
        dark: '#ab47bc',
      },
    },

    game: {
      ball: {
        primary: '#ffb74d',
        secondary: '#ff7043',
        highlight: '#ffffff',
        shadow: 'rgba(0, 0, 0, 0.5)',
      },
      peg: {
        default: '#5a6e91',
        active: '#ffb74d',
        highlight: '#ffcc80',
      },
      slot: {
        border: '#253154',
        glow: 'rgba(79, 142, 247, 0.3)',
      },
      launcher: {
        base: '#5a6e91',
        track: '#253154',
        accent: '#8094b8',
      },
    },

    border: {
      default: '#253154',
      light: '#3a4766',
      dark: '#1a2348',
    },

    shadows: {
      default: 'rgba(0, 0, 0, 0.6)',
      colored: 'rgba(79, 142, 247, 0.5)',
      glow: 'rgba(79, 142, 247, 0.3)',
    },
  },

  gradients: {
    // Background gradients - all linear
    backgroundMain: 'linear-gradient(135deg, #0a0e27 0%, #111937 50%, #0a0e27 100%)',
    backgroundOverlay: 'linear-gradient(135deg, rgba(17,25,55,0.9) 0%, rgba(10,14,39,0.95) 100%)',
    backgroundCard: 'linear-gradient(135deg, rgba(17,25,55,0.98) 0%, rgba(10,14,39,1) 100%)',

    // Button gradients - all linear
    buttonPrimary: 'linear-gradient(135deg, #6ea4ff 0%, #4f8ef7 50%, #3575e5 100%)',
    buttonSecondary: 'linear-gradient(135deg, #ff8888 0%, #ff6b6b 50%, #e55555 100%)',
    buttonSuccess: 'linear-gradient(135deg, #66e89e 0%, #4ade80 50%, #38d46d 100%)',
    buttonDanger: 'linear-gradient(135deg, #ff9999 0%, #f87171 50%, #e55555 100%)',

    // Prize gradients - all linear
    prizeOrange: 'linear-gradient(135deg, #ff8a65 0%, #ff7043 50%, #f4511e 100%)',
    prizeYellow: 'linear-gradient(135deg, #ffe082 0%, #ffb74d 50%, #ffa726 100%)',
    prizeEmerald: 'linear-gradient(135deg, #81efb3 0%, #4ade80 50%, #38d46d 100%)',
    prizeBlue: 'linear-gradient(135deg, #90b9ff 0%, #4f8ef7 50%, #3575e5 100%)',
    prizeViolet: 'linear-gradient(135deg, #e1bee7 0%, #ba68c8 50%, #ab47bc 100%)',

    // Title gradient for text effects
    titleGradient: 'linear-gradient(135deg, #6ea4ff 0%, #4f8ef7 50%, #3575e5 100%)',

    // Effect gradients - all linear
    glow: 'linear-gradient(135deg, rgba(79,142,247,0.3) 0%, transparent 100%)',
    shine: 'linear-gradient(90deg, transparent 0%, rgba(110,164,255,0.6) 50%, transparent 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(110,164,255,0.2) 50%, transparent 100%)',

    // Ball gradients - linear replacements for radial
    ballMain: 'linear-gradient(135deg, #ffe082 0%, #ffb74d 30%, #ff7043 70%, #f4511e 100%)',
    ballGlow: 'linear-gradient(135deg, rgba(255,183,77,0.5) 0%, rgba(255,112,67,0.3) 50%, transparent 100%)',

    // Peg gradients - linear replacements for radial
    pegDefault: 'linear-gradient(135deg, #8094b8 0%, #6a7fa7 30%, #5a6e91 70%, #4a5e81 100%)',
    pegActive: 'linear-gradient(135deg, #ffe082 0%, #ffcc80 30%, #ffb74d 70%, #ffa726 100%)',

    // Slot gradients - all linear
    slotBackground: 'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(79,142,247,0.2) 70%, rgba(79,142,247,0.4) 100%)',
    slotHighlight: 'linear-gradient(135deg, rgba(110,164,255,0.3) 0%, transparent 100%)',
    slotWin: 'linear-gradient(135deg, #ffe082 0%, #ffb74d 50%, #ffa726 100%)',
  },

  effects: {
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 4px 12px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      xl: '0 12px 48px rgba(0, 0, 0, 0.6)',
      glow: '0 0 20px rgba(79, 142, 247, 0.5)',
      inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
    },

    glows: {
      sm: '0 0 8px',
      md: '0 0 16px',
      lg: '0 0 32px',
      colored: '0 0 24px',
    },

    borders: {
      thin: '1px solid',
      medium: '2px solid',
      thick: '4px solid',
    },
  },

  images: {
    logo: undefined,
    logoSmall: undefined,
    backgroundPattern: undefined,
    backgroundTexture: undefined,
    prizeIcons: {
      coins: undefined,
      spins: undefined,
      bonus: undefined,
      jackpot: undefined,
    },
    gameElements: {
      star: undefined,
      sparkle: undefined,
      confetti: undefined,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: undefined,
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000,
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  borderRadius: defaultBorderRadius,
  buttons: defaultButtons,
  components: defaultComponents,
  breakpoints: defaultBreakpoints,
  zIndex: defaultZIndex,
};