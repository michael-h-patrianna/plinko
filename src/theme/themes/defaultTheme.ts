/**
 * Default theme for the Plinko application
 * All blur effects removed, only linear gradients used
 */

import {
  defaultBorderRadius,
  defaultBreakpoints,
  defaultComponents,
  defaultSpacing,
  defaultZIndex,
  createButtonStyle,
} from '../themeDefaults';
import { Theme } from '../types';

export const defaultTheme: Theme = {
  name: 'Default',

  colors: {
    background: {
      primary: '#0f172a', // slate-900
      secondary: '#1e293b', // slate-800
      tertiary: '#334155', // slate-700
      overlay: 'rgba(15, 23, 42, 0.9)',
      overlayDark: 'rgba(15, 23, 42, 0.98)',
    },

    surface: {
      primary: '#1e293b', // slate-800
      secondary: '#334155', // slate-700
      elevated: '#475569', // slate-600
    },

    primary: {
      main: '#3b82f6', // blue-500
      light: '#60a5fa', // blue-400
      dark: '#2563eb', // blue-600
      contrast: '#ffffff',
    },

    accent: {
      main: '#8b5cf6', // violet-500
      light: '#a78bfa', // violet-400
      dark: '#7c3aed', // violet-600
      contrast: '#ffffff',
    },

    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#cbd5e1', // slate-300
      tertiary: '#94a3b8', // slate-400
      disabled: '#64748b', // slate-500
      inverse: '#0f172a', // slate-900
      link: '#3b82f6', // blue-500
      linkHover: '#60a5fa', // blue-400
    },

    status: {
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#3b82f6', // blue-500
    },

    prizes: {
      orange: {
        main: '#f97316', // orange-500
        light: '#fb923c', // orange-400
        dark: '#ea580c', // orange-600
      },
      yellow: {
        main: '#fbbf24', // yellow-500
        light: '#facc15', // yellow-400
        dark: '#eab308', // yellow-600
      },
      emerald: {
        main: '#10b981', // emerald-500
        light: '#34d399', // emerald-400
        dark: '#059669', // emerald-600
      },
      blue: {
        main: '#3b82f6', // blue-500
        light: '#60a5fa', // blue-400
        dark: '#2563eb', // blue-600
      },
      violet: {
        main: '#8b5cf6', // violet-500
        light: '#a78bfa', // violet-400
        dark: '#7c3aed', // violet-600
      },
    },

    game: {
      ball: {
        primary: '#fbbf24', // yellow-500
        secondary: '#fb923c', // orange-400
        highlight: '#ffffff',
        shadow: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '50%',
      },
      peg: {
        default: '#64748b', // slate-500
        active: '#fbbf24', // yellow-500
        highlight: '#facc15', // yellow-400
        borderRadius: '50%',
        shadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      slot: {
        border: '#475569', // slate-600
        borderWidth: '2px',
        borderRadius: '0 0 8px 8px',
        glow: 'rgba(255, 255, 255, 0.3)',
        background: 'rgba(15, 23, 42, 0.8)',
      },
      launcher: {
        base: '#64748b', // slate-500
        track: '#475569', // slate-600
        accent: '#94a3b8', // slate-400
        borderRadius: '4px',
      },
      board: {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid #475569',
        borderRadius: '1.25rem',
        shadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      },
    },

    border: {
      default: '#475569', // slate-600
      light: '#64748b', // slate-500
      dark: '#334155', // slate-700
      focus: '#3b82f6', // blue-500
    },

    shadows: {
      default: 'rgba(0, 0, 0, 0.5)',
      colored: 'rgba(251, 146, 60, 0.6)',
      glow: 'rgba(255, 255, 255, 0.3)',
    },
  },

  gradients: {
    // Background gradients - all linear
    backgroundMain: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    backgroundOverlay: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
    backgroundCard: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)',
    backgroundHeader: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',

    // Button gradients - all linear
    buttonPrimary:
      'linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
    buttonSecondary: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    buttonSuccess: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',

    // Prize gradients - all linear
    prizeOrange: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    prizeYellow: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
    prizeEmerald: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)',
    prizeBlue: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #2563eb 100%)',
    prizeViolet: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%)',

    // Effect gradients - all linear (replacing radial effects)
    glow: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
    shine: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',

    // Ball gradients - linear replacements for radial
    ballMain: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #fb923c 70%, #f97316 100%)',
    ballGlow:
      'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 50%, transparent 100%)',

    // Peg gradients - linear replacements for radial
    pegDefault: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 70%, #64748b 100%)',
    pegActive: 'linear-gradient(135deg, #fef3c7 0%, #fde047 30%, #facc15 70%, #eab308 100%)',

    // Slot gradients - all linear
    slotBackground:
      'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(59,130,246,0.2) 70%, rgba(59,130,246,0.4) 100%)',
    slotHighlight: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
    slotWin: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
  },

  effects: {
    // RN-COMPATIBLE: Removed shadows and backdrops
    glows: {
      sm: '0 0 8px',
      md: '0 0 16px',
      lg: '0 0 32px',
      colored: '0 0 24px',
      success: '0 0 20px rgba(16, 185, 129, 0.5)',
      error: '0 0 20px rgba(239, 68, 68, 0.5)',
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
    // Can be customized per brand
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

  spacing: defaultSpacing,

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: undefined,
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

  // Required properties that were missing
  isDark: false,
  buttons: {
    // RN-COMPATIBLE: Removed all shadow properties
    primary: createButtonStyle(
      'linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
      '#ffffff',
      'transparent',
      {
        backgroundHover: 'linear-gradient(135deg, rgb(147, 197, 253) 0%, rgb(96, 165, 250) 50%, rgb(59, 130, 246) 100%)',
        textTransform: 'uppercase',
      }
    ),
    secondary: createButtonStyle(
      'linear-gradient(135deg, rgb(71, 85, 105) 0%, rgb(51, 65, 85) 50%, rgb(30, 41, 59) 100%)',
      '#ffffff',
      'transparent',
      {
        backgroundHover: 'linear-gradient(135deg, rgb(100, 116, 139) 0%, rgb(71, 85, 105) 50%, rgb(51, 65, 85) 100%)',
      }
    ),
    outline: createButtonStyle('transparent', '#3b82f6', '#3b82f6', {
      backgroundHover: 'rgba(59, 130, 246, 0.1)',
      outline: true,
    }),
    ghost: createButtonStyle('transparent', '#64748b', 'transparent', {
      backgroundHover: 'rgba(100, 116, 139, 0.1)',
    }),
    danger: createButtonStyle('#ef4444', '#ffffff', 'transparent', {
      backgroundHover: '#dc2626',
    }),
    success: createButtonStyle('#22c55e', '#ffffff', 'transparent', {
      backgroundHover: '#16a34a',
    }),
    sizes: {
      sm: { padding: { x: '1rem', y: '0.5rem' }, fontSize: '0.875rem' },
      md: { padding: { x: '1.5rem', y: '0.75rem' }, fontSize: '1rem' },
      lg: { padding: { x: '2rem', y: '1rem' }, fontSize: '1.125rem' },
    },
  },
  components: defaultComponents,
  breakpoints: defaultBreakpoints,
  zIndex: defaultZIndex,
};
