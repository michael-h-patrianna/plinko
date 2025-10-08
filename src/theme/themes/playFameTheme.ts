/**
 * PlayFame theme - Purple branded theme
 * Based on actual https://www.playfame.com/lobby color scheme
 * FULLY COMPLETE THEME - All properties included
 */

import { Theme } from '../types';
import {
  defaultSpacing,
  defaultBreakpoints,
  defaultZIndex,
  defaultBorderRadius,
  playFameButtons,
  playFameComponents,
} from '../themeDefaults';

export const playFameTheme: Theme = {
  name: 'PlayFame',
  isDark: true,

  colors: {
    background: {
      primary: '#1a1038', // PlayFame main dark purple background
      secondary: '#231845', // Darker sections
      tertiary: '#2a124c', // Card backgrounds
      overlay: 'rgba(26, 16, 56, 0.95)',
      overlayDark: 'rgba(26, 16, 56, 0.98)',
    },

    surface: {
      primary: '#311d58', // Card surface
      secondary: '#3a1f58', // Elevated cards
      elevated: '#451668', // Buttons/interactive elements
    },

    primary: {
      main: '#8b5cf6', // PlayFame signature purple (buttons)
      light: '#a852ff', // Hover state
      dark: '#6e54b0', // Active state
      contrast: '#ffffff',
    },

    accent: {
      main: '#1bee02', // Green accent (wins/success)
      light: '#47d631', // Light green
      dark: '#00ad45', // Dark green
      contrast: '#000000',
    },

    text: {
      primary: '#ffffff', // Main text
      secondary: '#c1aff0', // Muted text
      tertiary: '#90A4E3', // Subtle text
      disabled: '#7a468e',
      inverse: '#17002b',
      link: '#52d5ff',
      linkHover: '#70b5f9',
    },

    status: {
      success: '#1bee02', // PlayFame green
      warning: '#ffa500', // Orange warning
      error: '#ff0048', // Red error
      info: '#52d5ff', // Cyan info
    },

    prizes: {
      orange: {
        main: '#ff7700', // Bright orange
        light: '#ffa500',
        dark: '#e56000',
      },
      yellow: {
        main: '#ffd700', // Gold
        light: '#ffed4e',
        dark: '#ffc700',
      },
      emerald: {
        main: '#1bee02', // PlayFame green
        light: '#5af25d',
        dark: '#00ad45',
      },
      blue: {
        main: '#52d5ff', // Cyan blue
        light: '#70b5f9',
        dark: '#3492f0',
      },
      violet: {
        main: '#a852ff', // PlayFame purple
        light: '#c47ae5',
        dark: '#8b5cf6',
      },
    },

    game: {
      ball: {
        primary: '#ffd700', // Gold ball
        secondary: '#ffa500', // Orange glow
        highlight: '#ffffff',
        shadow: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '50%',
      },
      peg: {
        default: '#6e54b0', // Purple pegs
        active: '#1bee02', // Green when hit
        highlight: '#47d631',
        borderRadius: '50%',
        shadow: '0 2px 6px rgba(0,0,0,0.4)',
      },
      slot: {
        border: '#561d86',
        borderWidth: '3px',
        borderRadius: '0 0 8px 8px',
        glow: 'rgba(139, 92, 246, 0.5)',
        background:
          'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(139,92,246,0.3) 70%, rgba(139,92,246,0.5) 100%)',
      },
      launcher: {
        base: '#7a468e',
        track: '#451668',
        accent: '#a852ff',
        borderRadius: '4px',
      },
      board: {
        background: 'linear-gradient(135deg, #311d58 0%, #451668 100%)',
        border: '1px solid #561d86',
        borderRadius: '1.25rem',
        shadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
      },
    },

    border: {
      default: '#561d86',
      light: '#8b5cf6',
      dark: '#311d58',
      focus: '#a852ff',
    },

    shadows: {
      default: 'rgba(0, 0, 0, 0.8)',
      colored: 'rgba(139, 92, 246, 0.6)',
      glow: 'rgba(168, 82, 255, 0.4)',
    },
  },

  gradients: {
    // Background gradients - PlayFame authentic purple theme
    backgroundMain: 'linear-gradient(180deg, #1a1038 0%, #231845 50%, #1a1038 100%)',
    backgroundOverlay: 'linear-gradient(135deg, rgba(49,29,88,0.95) 0%, rgba(26,16,56,0.98) 100%)',
    backgroundCard: 'linear-gradient(135deg, #311d58 0%, #451668 100%)',
    backgroundHeader: 'linear-gradient(180deg, #1a1038 0%, #231845 100%)',

    // Button gradients - PlayFame style with subtle gradients
    buttonPrimary: 'linear-gradient(180deg, #a852ff 0%, #8b5cf6 100%)',
    buttonSecondary: 'linear-gradient(180deg, #1bee02 0%, #00ad45 100%)',
    buttonSuccess: 'linear-gradient(180deg, #47d631 0%, #1bee02 100%)',
    buttonDanger: 'linear-gradient(180deg, #ff0048 0%, #ae143e 100%)',

    // Prize gradients - PlayFame vibrant colors
    prizeOrange: 'linear-gradient(135deg, #ffa500 0%, #ff7700 50%, #e56000 100%)',
    prizeYellow: 'linear-gradient(135deg, #ffed4e 0%, #ffd700 50%, #ffc700 100%)',
    prizeEmerald: 'linear-gradient(135deg, #5af25d 0%, #1bee02 50%, #00ad45 100%)',
    prizeBlue: 'linear-gradient(135deg, #70b5f9 0%, #52d5ff 50%, #3492f0 100%)',
    prizeViolet: 'linear-gradient(135deg, #c47ae5 0%, #a852ff 50%, #8b5cf6 100%)',

    // Effect gradients - PlayFame glow effects
    glow: 'linear-gradient(135deg, rgba(168,82,255,0.4) 0%, transparent 100%)',
    shine: 'linear-gradient(90deg, transparent 0%, rgba(168,82,255,0.7) 50%, transparent 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(168,82,255,0.3) 50%, transparent 100%)',

    // Ball gradients - golden with purple hints
    ballMain: 'linear-gradient(135deg, #ffed4e 0%, #ffd700 30%, #ffa500 70%, #ff7700 100%)',
    ballGlow:
      'linear-gradient(135deg, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0.3) 50%, transparent 100%)',

    // Peg gradients - purple theme
    pegDefault: 'linear-gradient(135deg, #7a468e 0%, #6e54b0 30%, #561d86 70%, #451668 100%)',
    pegActive: 'linear-gradient(135deg, #5af25d 0%, #47d631 30%, #1bee02 70%, #00ad45 100%)',

    // Slot gradients - purple glow
    slotBackground:
      'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(139,92,246,0.3) 70%, rgba(139,92,246,0.5) 100%)',
    slotHighlight: 'linear-gradient(135deg, rgba(168,82,255,0.4) 0%, transparent 100%)',
    slotWin: 'linear-gradient(135deg, #ffed4e 0%, #ffd700 50%, #ffa500 100%)',

    // Text gradients
    textGradient: 'linear-gradient(135deg, #a852ff 0%, #52d5ff 100%)',
    titleGradient: 'linear-gradient(135deg, #ffd700 0%, #ff7700 100%)',
  },

  effects: {
    // RN-COMPATIBLE: Removed shadows and backdrops
    glows: {
      sm: '0 0 8px',
      md: '0 0 16px',
      lg: '0 0 32px',
      colored: '0 0 24px',
      success: '0 0 20px rgba(27, 238, 2, 0.5)',
      error: '0 0 20px rgba(255, 0, 72, 0.5)',
    },

    borders: {
      none: 'none',
      thin: '1px solid',
      medium: '2px solid',
      thick: '4px solid',
      dashed: '1px dashed',
      dotted: '1px dotted',
    },

    transitions: {
      fast: 'all 150ms ease',
      normal: 'all 300ms ease',
      slow: 'all 500ms ease',
    },
  },

  images: {
    logo: undefined,
    logoSmall: undefined,
    favicon: undefined,
    backgroundPattern: undefined,
    backgroundTexture: undefined,
    backgroundGradientImage: undefined,
    prizeIcons: {
      coins: undefined,
      spins: undefined,
      bonus: undefined,
      jackpot: undefined,
      xp: undefined,
      randomReward: undefined,
    },
    gameElements: {
      star: undefined,
      sparkle: undefined,
      confetti: undefined,
      particle: undefined,
    },
    uiElements: {
      loader: undefined,
      spinner: undefined,
      checkmark: undefined,
      close: undefined,
    },
  },

  spacing: defaultSpacing,

  typography: {
    fontFamily: {
      primary: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      display: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
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
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000,
      slowest: 2000,
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
  },

  borderRadius: defaultBorderRadius,
  buttons: playFameButtons,
  components: playFameComponents,
  breakpoints: defaultBreakpoints,
  zIndex: defaultZIndex,
};
