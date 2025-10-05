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
export { brutalistTheme } from './themes/brutalistTheme';

// Collection of all available themes
import { defaultTheme } from './themes/defaultTheme';
import { darkBlueTheme } from './themes/darkBlueTheme';
import { playFameTheme } from './themes/playFameTheme';
import { brutalistTheme } from './themes/brutalistTheme';

export const themes = [defaultTheme, darkBlueTheme, playFameTheme, brutalistTheme];
