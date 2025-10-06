/**
 * Theme Provider for managing application theming
 * Provides theme switching functionality with localStorage persistence
 */

import React, { useState, useCallback, ReactNode } from 'react';
import { Theme } from './types';
import { defaultTheme } from './themes/defaultTheme';
import { ThemeContext, ThemeContextType } from './context';
import { storageAdapter } from '../utils/platform';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
  themes?: Theme[];
}

/**
 * Theme provider component that wraps the application
 * Loads saved theme from localStorage on mount and persists theme changes
 * @param children - Child components to render
 * @param initialTheme - Initial theme to use (default: defaultTheme)
 * @param themes - Array of available themes
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = defaultTheme,
  themes = [defaultTheme],
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [availableThemes] = useState<Theme[]>(themes);

  const switchTheme = useCallback(
    (themeName: string) => {
      const newTheme = availableThemes.find((t) => t.name === themeName);
      if (newTheme) {
        setTheme(newTheme);
        // Persist theme preference
        storageAdapter.setItem('plinko-theme', themeName);
      }
    },
    [availableThemes]
  );

  // Load saved theme on mount
  React.useEffect(() => {
    storageAdapter.getItem('plinko-theme').then((savedThemeName) => {
      if (savedThemeName) {
        switchTheme(savedThemeName);
      }
    }).catch((error) => {
      console.warn('Failed to load theme preference:', error);
    });
  }, [switchTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeName: theme.name,
    availableThemes,
    switchTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
