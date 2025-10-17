/**
 * Brutalist theme for the Plinko application
 * Stark, high-contrast design using only white, black, and red (#db0000)
 * No gradients, minimal shadows, sharp geometric forms
 */

import {
  createButtonStyle,
} from '../themeDefaults';
import { Theme } from '../types';

const RED = '#db0000';
const WHITE = '#ffffff';
const BLACK = '#000000';

export const brutalistTheme: Theme = {
  name: 'Brutalist',
  isDark: false,

  colors: {
    background: {
      primary: WHITE,
      secondary: '#f5f5f5',
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
      contrast: WHITE,
    },

    accent: {
      main: BLACK,
      light: '#333333',
    },

    text: {
      primary: BLACK,
      secondary: '#333333',
      tertiary: '#666666',
      disabled: '#999999',
      inverse: WHITE,
    },

    status: {
      success: BLACK,
      warning: RED,
      error: RED,
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
        borderRadius: '50%',
      },
      peg: {
        highlight: RED,
        borderRadius: '50%',
      },
      slot: {
        border: BLACK,
        borderWidth: '4px',
        borderRadius: '0',
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
        border: `4px solid ${BLACK}`,
        borderRadius: '0',
      },
    },

    border: {
      default: BLACK,
      light: '#666666',
    },

    shadows: {
      default: BLACK,
    },
  },

  gradients: {
    // Brutalist theme uses NO gradients - only solid colors
    backgroundCard: WHITE,

    buttonPrimary: RED,
    buttonDanger: RED,

    prizeOrange: RED,
    prizeYellow: BLACK,
    prizeEmerald: RED,
    prizeBlue: BLACK,
    prizeViolet: RED,

    glow: 'transparent',
    shine: 'transparent',

    ballMain: RED,
    ballGlow: 'transparent',

    pegDefault: BLACK,
  },

  effects: {
    transitions: {
      fast: 'all 100ms linear',
    },
  },

  typography: {
    fontFamily: {
      primary: 'Arial, Helvetica, sans-serif',
      display: 'Arial Black, sans-serif',
    },
  },

  borderRadius: {
    sm: '0',
    card: '0',
  },

  buttons: {
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
  },

  components: {
    card: {
      background: WHITE,
      border: `4px solid ${BLACK}`,
      borderRadius: '0',
    },
    modal: {
      background: WHITE,
      borderRadius: '0',
    },
  },
};
