/**
 * Default theme values and utilities
 * Provides base values that can be extended by specific themes
 */

import {
  ThemeSpacing,
  ThemeButtons,
  ComponentStyles,
  ThemeBreakpoints,
  ThemeZIndex,
  ThemeBorderRadius,
  ThemeEffects,
  ButtonStyle,
} from './types';

// Default spacing values (in rem/px)
export const defaultSpacing: ThemeSpacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Default breakpoints
export const defaultBreakpoints: ThemeBreakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Default z-index scale
export const defaultZIndex: ThemeZIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
  dropdown: 1000,
  modal: 1100,
  popover: 1200,
  tooltip: 1300,
  notification: 1400,
};

// Default border radius scale
export const defaultBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
  // Component specific
  button: '0.5rem',
  card: '0.75rem',
  input: '0.375rem',
  modal: '1rem',
  badge: '0.25rem',
  chip: '9999px',
};

// Default effects
export const defaultEffects: ThemeEffects = {
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    glowLg: '0 0 40px rgba(59, 130, 246, 0.6)',
    button: '0 4px 12px rgba(0, 0, 0, 0.15)',
    buttonHover: '0 6px 20px rgba(0, 0, 0, 0.2)',
    card: '0 4px 12px rgba(0, 0, 0, 0.08)',
    modal: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  glows: {
    sm: '0 0 8px',
    md: '0 0 16px',
    lg: '0 0 32px',
    colored: '0 0 24px',
    success: '0 0 20px rgba(34, 197, 94, 0.5)',
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
  backdrops: {
    none: 'none',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
  },
  transitions: {
    fast: 'all 150ms ease',
    normal: 'all 300ms ease',
    slow: 'all 500ms ease',
  },
};

// Helper to create button styles
export function createButtonStyle(
  background: string,
  color: string,
  border: string = 'transparent',
  options: Partial<ButtonStyle> = {}
): ButtonStyle {
  return {
    background,
    backgroundHover: options.backgroundHover,
    backgroundActive: options.backgroundActive,
    border,
    borderWidth: options.borderWidth || '2px',
    borderRadius: options.borderRadius || defaultBorderRadius.button,
    color,
    colorHover: options.colorHover,
    shadow: options.shadow || defaultEffects.shadows.button,
    shadowHover: options.shadowHover || defaultEffects.shadows.buttonHover,
    padding: options.padding || { x: '1.5rem', y: '0.75rem' },
    fontSize: options.fontSize || '1rem',
    fontWeight: options.fontWeight || 600,
    transition: options.transition || defaultEffects.transitions.normal,
    outline: options.outline,
  };
}

// Default button styles for Default theme
export const defaultButtons: ThemeButtons = {
  primary: createButtonStyle(
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
      shadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      shadowHover: '0 8px 24px rgba(59, 130, 246, 0.4)',
    }
  ),
  secondary: createButtonStyle('#475569', '#ffffff', 'transparent', {
    backgroundHover: '#64748b',
  }),
  outline: createButtonStyle('transparent', '#3b82f6', '#3b82f6', {
    backgroundHover: 'rgba(59, 130, 246, 0.1)',
    outline: true,
    shadow: 'none',
    shadowHover: '0 4px 12px rgba(59, 130, 246, 0.2)',
  }),
  ghost: createButtonStyle('transparent', '#64748b', 'transparent', {
    backgroundHover: 'rgba(100, 116, 139, 0.1)',
    shadow: 'none',
    shadowHover: 'none',
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
};

// PlayFame button styles - round with specific styling
export const playFameButtons: ThemeButtons = {
  primary: createButtonStyle(
    'linear-gradient(180deg, #a852ff 0%, #8b5cf6 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(180deg, #c47ae5 0%, #a852ff 100%)',
      borderRadius: '9999px', // Fully rounded
      shadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
      shadowHover: '0 8px 24px rgba(168, 82, 255, 0.5)',
      padding: { x: '2rem', y: '0.875rem' },
      fontWeight: 700,
    }
  ),
  secondary: createButtonStyle(
    'linear-gradient(180deg, #1bee02 0%, #00ad45 100%)',
    '#000000',
    'transparent',
    {
      backgroundHover: 'linear-gradient(180deg, #47d631 0%, #1bee02 100%)',
      borderRadius: '9999px',
      shadow: '0 4px 16px rgba(27, 238, 2, 0.3)',
      padding: { x: '2rem', y: '0.875rem' },
      fontWeight: 700,
    }
  ),
  outline: createButtonStyle('transparent', '#52d5ff', '#52d5ff', {
    backgroundHover: 'rgba(82, 213, 255, 0.1)',
    borderRadius: '9999px',
    borderWidth: '2px',
    outline: true,
    shadow: 'none',
    shadowHover: '0 0 20px rgba(82, 213, 255, 0.4)',
    padding: { x: '2rem', y: '0.875rem' },
    fontWeight: 700,
  }),
  ghost: createButtonStyle('transparent', '#c1aff0', 'transparent', {
    backgroundHover: 'rgba(193, 175, 240, 0.1)',
    borderRadius: '9999px',
    shadow: 'none',
    padding: { x: '2rem', y: '0.875rem' },
  }),
  danger: createButtonStyle(
    'linear-gradient(180deg, #ff0048 0%, #ae143e 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(180deg, #ff3366 0%, #ff0048 100%)',
      borderRadius: '9999px',
      padding: { x: '2rem', y: '0.875rem' },
      fontWeight: 700,
    }
  ),
  success: createButtonStyle(
    'linear-gradient(180deg, #47d631 0%, #1bee02 100%)',
    '#000000',
    'transparent',
    {
      backgroundHover: 'linear-gradient(180deg, #5af25d 0%, #47d631 100%)',
      borderRadius: '9999px',
      padding: { x: '2rem', y: '0.875rem' },
      fontWeight: 700,
    }
  ),
  sizes: {
    sm: { padding: { x: '1.5rem', y: '0.625rem' }, fontSize: '0.875rem' },
    md: { padding: { x: '2rem', y: '0.875rem' }, fontSize: '1rem' },
    lg: { padding: { x: '2.5rem', y: '1.125rem' }, fontSize: '1.125rem' },
  },
};

// Default component styles
export const defaultComponents: ComponentStyles = {
  card: {
    background: 'rgba(30, 41, 59, 0.9)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderWidth: '1px',
    borderRadius: defaultBorderRadius.card,
    shadow: defaultEffects.shadows.card,
    padding: '1.5rem',
  },
  modal: {
    background: 'rgba(15, 23, 42, 0.98)',
    backdropColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: defaultBorderRadius.modal,
    shadow: defaultEffects.shadows.modal,
    padding: '2rem',
  },
  header: {
    height: '4rem',
    background: 'rgba(15, 23, 42, 0.95)',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
    shadow: defaultEffects.shadows.sm,
  },
  input: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: defaultBorderRadius.input,
    borderFocus: '2px solid #3b82f6',
    shadow: 'none',
    shadowFocus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    padding: '0.75rem 1rem',
  },
  dropdown: {
    background: 'rgba(30, 41, 59, 0.98)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: defaultBorderRadius.md,
    shadow: defaultEffects.shadows.lg,
    itemHover: 'rgba(71, 85, 105, 0.2)',
  },
  tooltip: {
    background: 'rgba(15, 23, 42, 0.95)',
    color: '#e2e8f0',
    borderRadius: defaultBorderRadius.md,
    shadow: defaultEffects.shadows.lg,
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
  },
};

// PlayFame component styles
export const playFameComponents: ComponentStyles = {
  card: {
    background: 'linear-gradient(135deg, #311d58 0%, #451668 100%)',
    border: '1px solid #561d86',
    borderWidth: '1px',
    borderRadius: '1.25rem',
    shadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
    padding: '1.75rem',
  },
  modal: {
    background: 'linear-gradient(135deg, #231845 0%, #311d58 100%)',
    backdropColor: 'rgba(26, 16, 56, 0.9)',
    borderRadius: '1.5rem',
    shadow: '0 24px 48px rgba(168, 82, 255, 0.3)',
    padding: '2.5rem',
  },
  header: {
    height: '4.5rem',
    background: 'linear-gradient(180deg, #1a1038 0%, #231845 100%)',
    borderBottom: '2px solid #561d86',
    shadow: '0 4px 16px rgba(139, 92, 246, 0.2)',
  },
  input: {
    background: 'rgba(49, 29, 88, 0.5)',
    border: '2px solid #561d86',
    borderRadius: '9999px',
    borderFocus: '2px solid #a852ff',
    shadow: 'none',
    shadowFocus: '0 0 0 4px rgba(168, 82, 255, 0.2)',
    padding: '0.875rem 1.25rem',
  },
  dropdown: {
    background: 'linear-gradient(135deg, #311d58 0%, #3a1f58 100%)',
    border: '1px solid #561d86',
    borderRadius: '1rem',
    shadow: '0 12px 32px rgba(168, 82, 255, 0.25)',
    itemHover: 'rgba(168, 82, 255, 0.15)',
  },
  tooltip: {
    background: 'linear-gradient(135deg, #451668 0%, #561d86 100%)',
    color: '#ffffff',
    borderRadius: '0.75rem',
    shadow: '0 8px 24px rgba(168, 82, 255, 0.3)',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
  },
};
