/**
 * Brutalist theme for the Plinko application
 * Stark, high-contrast design using only white, black, and red (#db0000)
 * No gradients, minimal shadows, sharp geometric forms
 */

import {
  defaultBreakpoints,
  defaultSpacing,
  defaultZIndex,
  createButtonStyle,
} from '../themeDefaults';
import { Theme } from '../types';

const RED = '#db0000';
const WHITE = '#ffffff';
const BLACK = '#000000';

// Brutalist components with stark styling
// RN-COMPATIBLE: Removed all shadow fields
const brutalistComponents = {
  card: {
    background: WHITE,
    border: `4px solid ${BLACK}`,
    borderWidth: '4px',
    borderRadius: '0',
    padding: '1.5rem',
  },
  modal: {
    background: WHITE,
    backdropColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '0',
    padding: '2rem',
  },
  header: {
    height: '4rem',
    background: BLACK,
    borderBottom: `4px solid ${RED}`,
  },
  input: {
    background: WHITE,
    border: `3px solid ${BLACK}`,
    borderRadius: '0',
    borderFocus: `3px solid ${RED}`,
    padding: '0.75rem 1rem',
  },
  dropdown: {
    background: WHITE,
    border: `3px solid ${BLACK}`,
    borderRadius: '0',
    itemHover: RED,
  },
  tooltip: {
    background: BLACK,
    color: WHITE,
    borderRadius: '0',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
  },
};

export const brutalistTheme: Theme = {
  name: 'Brutalist',
  isDark: false,

  colors: {
    background: {
      primary: WHITE,
      secondary: '#f5f5f5',
      tertiary: '#e0e0e0',
      overlay: 'rgba(255, 255, 255, 0.98)',
      overlayDark: WHITE,
    },

    surface: {
      primary: WHITE,
      secondary: '#f5f5f5',
      elevated: WHITE,
    },

    primary: {
      main: RED,
      light: RED,
      dark: '#a00000',
      contrast: WHITE,
    },

    accent: {
      main: BLACK,
      light: '#333333',
      dark: BLACK,
      contrast: WHITE,
    },

    text: {
      primary: BLACK,
      secondary: '#333333',
      tertiary: '#666666',
      disabled: '#999999',
      inverse: WHITE,
      link: RED,
      linkHover: '#a00000',
    },

    status: {
      success: BLACK,
      warning: RED,
      error: RED,
      info: BLACK,
    },

    prizes: {
      orange: {
        main: RED,
        light: RED,
        dark: '#a00000',
      },
      yellow: {
        main: BLACK,
        light: '#333333',
        dark: BLACK,
      },
      emerald: {
        main: RED,
        light: RED,
        dark: '#a00000',
      },
      blue: {
        main: BLACK,
        light: '#333333',
        dark: BLACK,
      },
      violet: {
        main: RED,
        light: RED,
        dark: '#a00000',
      },
    },

    game: {
      ball: {
        primary: RED,
        secondary: BLACK,
        highlight: WHITE,
        shadow: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '50%',
      },
      peg: {
        default: BLACK,
        active: RED,
        highlight: RED,
        borderRadius: '50%',
        shadow: 'none',
      },
      slot: {
        border: BLACK,
        borderWidth: '4px',
        borderRadius: '0',
        glow: 'none',
        background: WHITE,
        // Per-slot styles for visual differentiation with limited color palette
        slotStyles: [
          // Slot 0: Thick solid black border
          { border: `6px solid ${BLACK}`, borderWidth: '6px', background: WHITE },
          // Slot 1: Thick solid red border
          { border: `6px solid ${RED}`, borderWidth: '6px', background: WHITE },
          // Slot 2: Thick dashed black border
          { border: `6px dashed ${BLACK}`, borderWidth: '6px', background: WHITE },
          // Slot 3: Thick dashed red border
          { border: `6px dashed ${RED}`, borderWidth: '6px', background: WHITE },
          // Slot 4: Double black border
          { border: `6px double ${BLACK}`, borderWidth: '6px', background: WHITE },
          // Slot 5: Thick dotted black border
          { border: `6px dotted ${BLACK}`, borderWidth: '6px', background: WHITE },
          // Slot 6: Thick dotted red border
          { border: `6px dotted ${RED}`, borderWidth: '6px', background: WHITE },
        ],
      },
      launcher: {
        base: BLACK,
        track: '#333333',
        accent: RED,
        borderRadius: '0',
      },
      board: {
        background: WHITE,
        border: `4px solid ${BLACK}`,
        borderRadius: '0',
        shadow: `12px 12px 0px ${BLACK}`,
      },
    },

    border: {
      default: BLACK,
      light: '#666666',
      dark: BLACK,
      focus: RED,
    },

    shadows: {
      default: BLACK,
      colored: RED,
      glow: 'none',
    },
  },

  gradients: {
    // Brutalist theme uses NO gradients - only solid colors
    backgroundMain: WHITE,
    backgroundOverlay: WHITE,
    backgroundCard: WHITE,
    backgroundHeader: BLACK,

    buttonPrimary: RED,
    buttonSecondary: BLACK,
    buttonSuccess: BLACK,
    buttonDanger: RED,

    prizeOrange: RED,
    prizeYellow: BLACK,
    prizeEmerald: RED,
    prizeBlue: BLACK,
    prizeViolet: RED,

    glow: 'transparent',
    shine: 'transparent',
    shimmer: 'transparent',

    ballMain: RED,
    ballGlow: 'transparent',

    pegDefault: BLACK,
    pegActive: RED,

    slotBackground: WHITE,
    slotHighlight: RED,
    slotWin: RED,
  },

  effects: {
    // RN-COMPATIBLE: Removed shadows and backdrops
    glows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      colored: 'none',
      success: 'none',
      error: 'none',
    },

    borders: {
      none: 'none',
      thin: '2px solid',
      medium: '3px solid',
      thick: '4px solid',
      dashed: '2px dashed',
      dotted: '2px dotted',
    },

    transitions: {
      fast: 'all 100ms linear',
      normal: 'all 200ms linear',
      slow: 'all 300ms linear',
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

  spacing: defaultSpacing,

  typography: {
    fontFamily: {
      primary: 'Arial, Helvetica, sans-serif',
      secondary: undefined,
      mono: 'Courier New, monospace',
      display: 'Arial Black, sans-serif',
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
      thin: 400,
      extralight: 400,
      light: 400,
      normal: 400,
      medium: 700,
      semibold: 700,
      bold: 700,
      extrabold: 900,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.1,
      snug: 1.2,
      normal: 1.3,
      relaxed: 1.4,
      loose: 1.5,
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0em',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.05em',
    },
  },

  animation: {
    duration: {
      instant: 0,
      fast: 100,
      normal: 200,
      slow: 300,
      slower: 500,
      slowest: 1000,
    },
    easing: {
      linear: 'linear',
      easeIn: 'linear',
      easeOut: 'linear',
      easeInOut: 'linear',
      bounce: 'linear',
      elastic: 'linear',
      sharp: 'linear',
      smooth: 'linear',
    },
  },

  borderRadius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    '2xl': '0',
    '3xl': '0',
    full: '0', // Even circles become squares in brutalist mode!
    button: '0',
    card: '0',
    input: '0',
    modal: '0',
    badge: '0',
    chip: '0',
  },

  buttons: {
    // RN-COMPATIBLE: Removed all shadow properties
    primary: createButtonStyle(RED, WHITE, BLACK, {
      backgroundHover: '#a00000',
      textTransform: 'uppercase',
      borderWidth: '3px',
      borderRadius: '0',
      fontWeight: 900,
      transition: 'all 100ms linear',
    }),
    secondary: createButtonStyle(BLACK, WHITE, BLACK, {
      backgroundHover: '#333333',
      textTransform: 'uppercase',
      borderWidth: '3px',
      borderRadius: '0',
      fontWeight: 900,
      transition: 'all 100ms linear',
    }),
    outline: createButtonStyle(WHITE, BLACK, BLACK, {
      backgroundHover: '#f5f5f5',
      outline: true,
      textTransform: 'uppercase',
      borderWidth: '3px',
      borderRadius: '0',
      fontWeight: 900,
      transition: 'all 100ms linear',
    }),
    ghost: createButtonStyle('transparent', BLACK, 'transparent', {
      backgroundHover: '#f5f5f5',
      textTransform: 'uppercase',
      borderRadius: '0',
      fontWeight: 700,
      transition: 'all 100ms linear',
    }),
    danger: createButtonStyle(RED, WHITE, BLACK, {
      backgroundHover: '#a00000',
      borderWidth: '3px',
      borderRadius: '0',
      fontWeight: 900,
    }),
    success: createButtonStyle(BLACK, WHITE, BLACK, {
      backgroundHover: '#333333',
      borderWidth: '3px',
      borderRadius: '0',
      fontWeight: 900,
    }),
    sizes: {
      sm: { padding: { x: '1rem', y: '0.5rem' }, fontSize: '0.875rem' },
      md: { padding: { x: '1.5rem', y: '0.75rem' }, fontSize: '1rem' },
      lg: { padding: { x: '2rem', y: '1rem' }, fontSize: '1.125rem' },
    },
  },
  components: brutalistComponents,
  breakpoints: defaultBreakpoints,
  zIndex: defaultZIndex,
};
