/**
 * Theme exports
 */

export * from './types';
export { ThemeProvider } from './ThemeContext';
export { ThemeContext } from './context';
export * from './themeUtils';
export { defaultTheme } from './themes/defaultTheme';
export { darkBlueTheme } from './themes/darkBlueTheme';
export { playFameTheme } from './themes/playFameTheme';

// Collection of all available themes
import { defaultTheme } from './themes/defaultTheme';
import { darkBlueTheme } from './themes/darkBlueTheme';
import { playFameTheme } from './themes/playFameTheme';

export const themes = [defaultTheme, darkBlueTheme, playFameTheme];
