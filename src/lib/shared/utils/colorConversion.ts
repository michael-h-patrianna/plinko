/**
 * Color conversion utilities
 * Functions for converting between color formats: RGB, HSL, HSV, HEX
 */

import type { ColorFormat, HSLColor, HSVColor, RGBColor } from '../../color-control/types';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  return null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;

  if (rgb.a !== undefined && rgb.a < 1) {
    return hex + toHex(rgb.a * 255);
  }

  return hex;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a,
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGBColor): HSVColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v),
    a: rgb.a,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(hsv: HSVColor): RGBColor {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsv.a,
  };
}

/**
 * Convert hex to HSV
 */
export function hexToHsv(hex: string): HSVColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsv(rgb);
}

/**
 * Convert HSV to hex
 */
export function hsvToHex(hsv: HSVColor): string {
  const rgb = hsvToRgb(hsv);
  return rgbToHex(rgb);
}

/**
 * Parse CSS color string to RGB
 */
export function parseColor(color: string): RGBColor | null {
  color = color.trim();

  // Handle hex
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined,
    };
  }

  // Handle hsl/hsla
  const hslMatch = color.match(
    /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/
  );
  if (hslMatch && hslMatch[1] && hslMatch[2] && hslMatch[3]) {
    const hsl: HSLColor = {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : undefined,
    };
    return hslToRgb(hsl);
  }

  // Handle named colors (basic set)
  const namedColors: Record<string, string> = {
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    white: '#ffffff',
    black: '#000000',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    transparent: '#00000000',
  };

  const namedColor = namedColors[color.toLowerCase()];
  if (namedColor) {
    return hexToRgb(namedColor);
  }

  return null;
}

/**
 * Format color to specified format
 */
export function formatColor(color: string, format: ColorFormat): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  switch (format) {
    case 'hex':
      return rgbToHex(rgb);
    case 'rgb':
      if (rgb.a !== undefined && rgb.a < 1) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
      }
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb);
      if (hsl.a !== undefined && hsl.a < 1) {
        return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;
      }
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    default:
      return color;
  }
}

/**
 * Check if two colors are equal
 */
export function colorsEqual(color1: string, color2: string): boolean {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) return false;

  return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b && rgb1.a === rgb2.a;
}
