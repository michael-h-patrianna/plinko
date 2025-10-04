/**
 * Theme Context and Provider
 * Manages theme state and provides theme utilities to the application
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Theme } from './types';
import { defaultTheme } from './themes/defaultTheme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeName: string;
  availableThemes: Theme[];
  switchTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
  themes?: Theme[];
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = defaultTheme,
  themes = [defaultTheme],
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [availableThemes] = useState<Theme[]>(themes);

  const switchTheme = useCallback((themeName: string) => {
    const newTheme = availableThemes.find(t => t.name === themeName);
    if (newTheme) {
      setTheme(newTheme);
      // Persist theme preference
      localStorage.setItem('plinko-theme', themeName);
    }
  }, [availableThemes]);

  // Load saved theme on mount
  React.useEffect(() => {
    const savedThemeName = localStorage.getItem('plinko-theme');
    if (savedThemeName) {
      switchTheme(savedThemeName);
    }
  }, [switchTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeName: theme.name,
    availableThemes,
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for getting specific theme values
export const useThemeValue = <K extends keyof Theme>(key: K): Theme[K] => {
  const { theme } = useTheme();
  return theme[key];
};

// Helper function to create CSS variables from theme
export const createCSSVariables = (theme: Theme): string => {
  const cssVars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([name, value]) => {
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