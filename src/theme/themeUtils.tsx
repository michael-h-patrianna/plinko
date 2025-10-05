/**
 * Theme utility hooks and helper functions
 * Provides convenient access to theme context and values
 */

import { useContext } from 'react';
import { Theme } from './types';
import { ThemeContext } from './ThemeContext';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeName: string;
  availableThemes: Theme[];
  switchTheme: (themeName: string) => void;
}

/**
 * Hook to access the current theme context
 * Must be used within a ThemeProvider
 * @returns Theme context with current theme and switching utilities
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to access a specific theme value by key
 * @param key - The theme property key to retrieve
 * @returns The value of the specified theme property
 */
export const useThemeValue = <K extends keyof Theme>(key: K): Theme[K] => {
  const { theme } = useTheme();
  return theme[key];
};

/**
 * Helper function to create CSS variables from theme
 *
 * This utility converts a Theme object into CSS custom properties (variables).
 * Useful for:
 * - Server-side rendering (SSR) where you need to inject theme CSS into HTML
 * - CSS-in-JS frameworks that support CSS variables
 * - Dynamic theme switching via style tags
 *
 * @example
 * ```tsx
 * const cssVars = createCSSVariables(theme);
 * const styleTag = `<style>:root { ${cssVars} }</style>`;
 * ```
 *
 * @param theme - Theme object to convert
 * @returns CSS variable declarations as a string
 */
export const createCSSVariables = (theme: Theme): string => {
  const cssVars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors as Record<string, string>).forEach(([name, value]) => {
        cssVars.push(`--color-${category}-${name}: ${value};`);
      });
    }
  });

  // Gradients
  Object.entries(theme.gradients).forEach(([name, value]) => {
    cssVars.push(`--gradient-${name}: ${value};`);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([name, value]) => {
    cssVars.push(`--spacing-${name}: ${value}px;`);
  });

  // Typography
  Object.entries(theme.typography.fontSize).forEach(([name, value]) => {
    cssVars.push(`--font-size-${name}: ${value};`);
  });

  Object.entries(theme.typography.fontWeight).forEach(([name, value]) => {
    cssVars.push(`--font-weight-${name}: ${value};`);
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([name, value]) => {
    cssVars.push(`--radius-${name}: ${value}px;`);
  });

  // Animation durations
  Object.entries(theme.animation.duration).forEach(([name, value]) => {
    cssVars.push(`--duration-${name}: ${value}ms;`);
  });

  return cssVars.join('\n  ');
};
