// @ts-nocheck
/**
 * Solid color parser and serializer
 */

import type { ColorFormat, SolidColorData } from './types';
import { parseColor, rgbToHex, rgbToHsl } from './utils';

/**
 * Parse a CSS color string (hex, rgb, rgba, hsl, hsla) into SolidColorData
 */
export function parseSolidColor(colorString: string): SolidColorData {
  const rgb = parseColor(colorString);

  if (!rgb) {
    // Default to white if parsing fails
    return {
      color: '#ffffff',
      alpha: 1,
    };
  }

  // Store alpha separately
  const alpha = rgb.a ?? 1;

  // Convert to hex without alpha - strip alpha from rgb first
  const rgbWithoutAlpha = { r: rgb.r, g: rgb.g, b: rgb.b };
  const hex = rgbToHex(rgbWithoutAlpha);

  return {
    color: hex,
    alpha,
  };
}

/**
 * Serialize SolidColorData to CSS color string
 */
export function serializeSolidColor(
  solidColor: SolidColorData,
  colorFormat: ColorFormat = 'hex'
): string {
  const rgb = parseColor(solidColor.color);

  if (!rgb) {
    return 'rgba(255, 255, 255, 1)';
  }

  // Add alpha from solid color data
  rgb.a = solidColor.alpha;

  // Format based on color format
  if (colorFormat === 'hex') {
    // For hex with alpha, use rgba format
    if (solidColor.alpha < 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${solidColor.alpha})`;
    }
    return solidColor.color;
  } else if (colorFormat === 'rgb') {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${solidColor.alpha})`;
  } else {
    // hsl
    const hsl = rgbToHsl(rgb);
    return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${solidColor.alpha})`;
  }
}
