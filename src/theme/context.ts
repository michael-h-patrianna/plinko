/**
 * Theme Context definition
 * Separated from ThemeContext.tsx to satisfy react-refresh/only-export-components
 */

import { createContext } from 'react';
import { Theme } from './types';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeName: string;
  availableThemes: Theme[];
  switchTheme: (themeName: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
