/**
 * Theme exports
 */

export * from './types';
export { ThemeProvider } from './ThemeContext';
export { ThemeContext } from './context';
export * from './themeUtils';
export { defaultTheme } from './themes/defaultTheme';
export { brutalistTheme } from './themes/brutalistTheme';

// Collection of all available themes
import { defaultTheme } from './themes/defaultTheme';
import { brutalistTheme } from './themes/brutalistTheme';

export const themes = [defaultTheme, brutalistTheme];
