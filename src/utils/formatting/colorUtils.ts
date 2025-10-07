/**
 * Color manipulation utilities for cross-platform compatibility
 */

/**
 * Converts hex/rgb/rgba color to rgba with specified alpha
 * @param hex - Color in hex (#rrggbb), rgb, or rgba format
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Handle hex format
  if (hex.startsWith('#')) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle existing rgba format
  if (hex.startsWith('rgba')) {
    return hex.replace(/[\d.]+\)$/g, `${alpha})`);
  }

  // Handle rgb format
  if (hex.startsWith('rgb')) {
    return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }

  // Fallback: return as-is
  return hex;
}

/**
 * Parses hex color to RGB components
 * @param hex - Color in hex format (#rrggbb or #rgb)
 * @returns RGB components or null if invalid
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  if (!hex.startsWith('#')) {
    return null;
  }

  // Handle short format (#rgb)
  if (hex.length === 4) {
    const r = parseInt(hex[1]! + hex[1]!, 16);
    const g = parseInt(hex[2]! + hex[2]!, 16);
    const b = parseInt(hex[3]! + hex[3]!, 16);
    return { r, g, b };
  }

  // Handle long format (#rrggbb)
  if (hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  return null;
}
