/**
 * Default theme values and utilities
 * Provides base values that can be extended by specific themes
 */

import {
  ButtonStyle,
  ComponentStyles,
  ThemeBorderRadius,
  ThemeButtons,
  ThemeEffects,
} from './types';

// Default border radius scale
export const defaultBorderRadius: ThemeBorderRadius = {
  sm: '0.125rem',
  card: '0.75rem',
};

// Default effects
// RN-COMPATIBLE: Removed shadows and backdrops (not compatible with React Native)
export const defaultEffects: ThemeEffects = {
  transitions: {
    fast: 'all 150ms ease',
  },
};

// Helper to create button styles
// RN-COMPATIBLE: Removed shadow parameters
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
    borderRadius: options.borderRadius || '3px',
    color,
    textTransform: options.textTransform || 'none',
    colorHover: options.colorHover,
    padding: options.padding || { x: '1.5rem', y: '0.75rem' },
    fontSize: options.fontSize || '1rem',
    fontWeight: options.fontWeight || 600,
    transition: options.transition || defaultEffects.transitions.fast,
    outline: options.outline,
  };
}

// Default button styles for Default theme
// RN-COMPATIBLE: Removed all shadow options
export const defaultButtons: ThemeButtons = {
  primary: createButtonStyle(
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
      textTransform: 'uppercase',
    }
  ),
  secondary: createButtonStyle(
    'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)',
    }
  ),
};

// PlayFame button styles - round with specific styling
// RN-COMPATIBLE: Removed all shadow options
export const playFameButtons: ThemeButtons = {
  primary: createButtonStyle(
    'linear-gradient(180deg, #a852ff 0%, #8b5cf6 100%)',
    '#ffffff',
    'transparent',
    {
      backgroundHover: 'linear-gradient(180deg, #c47ae5 0%, #a852ff 100%)',
      borderRadius: '9999px', // Fully rounded
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
      padding: { x: '2rem', y: '0.875rem' },
      fontWeight: 700,
    }
  ),
};

// Default component styles
// RN-COMPATIBLE: Removed all shadow fields
export const defaultComponents: ComponentStyles = {
  card: {
    background: 'rgba(30, 41, 59, 0.9)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: defaultBorderRadius.card,
  },
  modal: {
    background: 'rgba(15, 23, 42, 0.98)',
    borderRadius: '1rem',
  },
};

// PlayFame component styles
// RN-COMPATIBLE: Removed all shadow fields
export const playFameComponents: ComponentStyles = {
  card: {
    background: 'linear-gradient(135deg, #311d58 0%, #451668 100%)',
    border: '1px solid #561d86',
    borderRadius: '1.25rem',
  },
  modal: {
    background: 'linear-gradient(135deg, #231845 0%, #311d58 100%)',
    borderRadius: '1.5rem',
  },
};
