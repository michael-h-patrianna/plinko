/**
 * Default theme for the Plinko application
 * All blur effects removed, only linear gradients used
 */

import {
  defaultBorderRadius,
  createButtonStyle,
} from '../themeDefaults';
import { Theme } from '../types';

export const defaultTheme: Theme = {
  name: 'Default',
  isDark: true,

  colors: {
    background: {
      primary: '#0f172a', // slate-900
      secondary: '#1e293b', // slate-800
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
      contrast: '#ffffff',
    },

    accent: {
      main: '#8b5cf6', // violet-500
      light: '#a78bfa', // violet-400
    },

    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#cbd5e1', // slate-300
      tertiary: '#94a3b8', // slate-400
      disabled: '#64748b', // slate-500
      inverse: '#0f172a', // slate-900
    },

    status: {
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
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
        borderRadius: '50%',
      },
      peg: {
        highlight: '#facc15', // yellow-400
        borderRadius: '50%',
      },
      slot: {
        border: '#475569', // slate-600
        borderWidth: '2px',
        borderRadius: '0 0 8px 8px',
        background: 'rgba(15, 23, 42, 0.8)',
      },
      launcher: {
        base: '#64748b', // slate-500
        track: '#475569', // slate-600
        accent: '#94a3b8', // slate-400
        borderRadius: '4px',
      },
      board: {
        border: '1px solid #475569',
        borderRadius: '1.25rem',
      },
    },

    border: {
      default: '#475569', // slate-600
      light: '#64748b', // slate-500
    },

    shadows: {
      default: 'rgba(0, 0, 0, 0.5)',
    },
  },

  gradients: {
    // Background gradients - all linear
    backgroundCard: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)',

    // Button gradients - all linear
    buttonPrimary:
      'linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
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

    // Ball gradients - linear replacements for radial
    ballMain: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #fb923c 70%, #f97316 100%)',
    ballGlow:
      'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 50%, transparent 100%)',

    // Peg gradients - linear replacements for radial
    pegDefault: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 70%, #64748b 100%)',
  },

  effects: {
    transitions: {
      fast: 'all 150ms ease',
    },
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },

  borderRadius: {
    sm: defaultBorderRadius.sm,
    card: defaultBorderRadius.card,
  },

  buttons: {
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
  },

  components: {
    card: {
      background: 'rgba(30, 41, 59, 0.9)',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      borderRadius: defaultBorderRadius.card,
    },
    modal: {
      background: 'rgba(15, 23, 42, 0.98)',
      borderRadius: '1rem',
    },
  },
};
