/**
 * Prize to Theme Color Mapper
 * Maps prize colors to theme-based colors for consistent theming
 * This ensures all themes (including brutalist) work correctly
 */

import type { Theme } from './types';
import type { PrizeConfig } from '@game/types';

/**
 * Maps a prize color to a theme color
 * Uses the prize's color as a hint to select the appropriate theme color
 * Falls back to primary color if no match is found
 */
export function getPrizeThemeColor(prize: PrizeConfig, theme: Theme): string {
  const prizeColor = prize.slotColor || '';

  // Map common prize colors to theme prize colors
  // This mapping works for all themes including brutalist
  const colorMap: Record<string, string> = {
    // Orange/red tones -> orange prize color
    '#FF6B35': theme.colors.prizes.orange.main,
    '#ff6b35': theme.colors.prizes.orange.main,
    '#F77F00': theme.colors.prizes.orange.main,
    '#f77f00': theme.colors.prizes.orange.main,

    // Yellow tones -> yellow prize color
    '#FFD60A': theme.colors.prizes.yellow.main,
    '#ffd60a': theme.colors.prizes.yellow.main,
    '#FFC300': theme.colors.prizes.yellow.main,
    '#ffc300': theme.colors.prizes.yellow.main,

    // Green/emerald tones -> emerald prize color
    '#10B981': theme.colors.prizes.emerald.main,
    '#10b981': theme.colors.prizes.emerald.main,
    '#06D6A0': theme.colors.prizes.emerald.main,
    '#06d6a0': theme.colors.prizes.emerald.main,

    // Blue tones -> blue prize color
    '#3B82F6': theme.colors.prizes.blue.main,
    '#3b82f6': theme.colors.prizes.blue.main,
    '#118AB2': theme.colors.prizes.blue.main,
    '#118ab2': theme.colors.prizes.blue.main,

    // Purple/violet tones -> violet prize color
    '#8B5CF6': theme.colors.prizes.violet.main,
    '#8b5cf6': theme.colors.prizes.violet.main,
    '#7209B7': theme.colors.prizes.violet.main,
    '#7209b7': theme.colors.prizes.violet.main,
  };

  // Try direct mapping first
  if (prizeColor && colorMap[prizeColor]) {
    return colorMap[prizeColor];
  }

  // Fallback: analyze color to determine category
  if (prizeColor) {
    const lower = prizeColor.toLowerCase();

    // Check for common color patterns
    if (lower.includes('ff') && (lower.includes('6') || lower.includes('7'))) {
      return theme.colors.prizes.orange.main;
    }
    if (lower.includes('ffc') || lower.includes('ffd')) {
      return theme.colors.prizes.yellow.main;
    }
    if (lower.includes('10b') || lower.includes('06d')) {
      return theme.colors.prizes.emerald.main;
    }
    if (lower.includes('3b8') || lower.includes('118')) {
      return theme.colors.prizes.blue.main;
    }
    if (lower.includes('8b5') || lower.includes('720')) {
      return theme.colors.prizes.violet.main;
    }
  }

  // Ultimate fallback: use primary color
  return theme.colors.primary.main;
}

/**
 * Gets a light/transparent version of a prize theme color for backgrounds
 * @param opacity - Opacity value (0-1), defaults to 0.15
 */
export function getPrizeThemeColorWithOpacity(
  prize: PrizeConfig,
  theme: Theme,
  opacity: number = 0.15
): string {
  const color = getPrizeThemeColor(prize, theme);

  // Convert hex to rgba if needed
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // If already rgba, replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // If rgb, convert to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  // Fallback: return as-is
  return color;
}

/**
 * Gets a gradient from prize color, or solid color for brutalist theme
 */
export function getPrizeThemeGradient(
  prize: PrizeConfig,
  theme: Theme,
  angle: number = 90
): string {
  const color = getPrizeThemeColor(prize, theme);

  // Check if theme supports gradients (check if gradient is actually a gradient or solid color)
  const testGradient = theme.gradients.prizeOrange;
  if (!testGradient.includes('gradient')) {
    // Theme doesn't support gradients, return solid color
    return color;
  }

  // Return gradient
  return `linear-gradient(${angle}deg, ${color} 0%, ${color}dd 100%)`;
}
