/**
 * Shared utilities for ColorControl library
 */

// Logger stub
export const logger = {
  debug: (..._args: unknown[]) => {},
  info: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
};

// Performance tracking stub
export const measurePerformance = <T>(fn: () => T, _label: string): T => {
  return fn();
};

export const startMeasure = (_label: string) => {};
export const endMeasure = (_label: string) => {};

// Debounce utility with cancel method
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

// Color parsing
export function parseColor(color: string): { r: number; g: number; b: number; a?: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    if (hex.length === 3 && hex[0] && hex[1] && hex[2]) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    }
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined,
    };
  }

  return null;
}

export function formatColor(r: number, g: number, b: number, format: string = 'hex'): string {
  if (format === 'rgb') {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return rgbToHex(r, g, b);
}

export function colorsEqual(c1: string, c2: string): boolean {
  return c1.toLowerCase() === c2.toLowerCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result && result[1] && result[2] && result[3]) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

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
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

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

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Gradient utilities
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function angleToDirection(angle: number): string {
  const normalized = normalizeAngle(angle);
  if (normalized === 0) return 'to top';
  if (normalized === 90) return 'to right';
  if (normalized === 180) return 'to bottom';
  if (normalized === 270) return 'to left';
  return `${normalized}deg`;
}

export function directionToAngle(direction: string): number {
  if (direction === 'to top') return 0;
  if (direction === 'to right') return 90;
  if (direction === 'to bottom') return 180;
  if (direction === 'to left') return 270;
  const match = direction.match(/(\d+)deg/);
  return match && match[1] ? parseInt(match[1], 10) : 90;
}

export function clampPosition(position: number): number {
  return Math.max(0, Math.min(100, position));
}

export function generateStopId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function sortStops<T extends { position: number }>(stops: T[]): T[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return rgbToHex(r, g, b);
}

export function getColorAtPosition(
  stops: Array<{ color: string; position: number }>,
  position: number
): string {
  if (stops.length === 0) return '#000000';
  if (stops.length === 1 && stops[0]) return stops[0].color;

  const sorted = sortStops(stops);

  // Before first stop
  const firstStop = sorted[0];
  if (firstStop && position <= firstStop.position) return firstStop.color;

  // After last stop
  const lastStop = sorted[sorted.length - 1];
  if (lastStop && position >= lastStop.position) return lastStop.color;

  // Between stops
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentStop = sorted[i];
    const nextStop = sorted[i + 1];
    if (currentStop && nextStop && position >= currentStop.position && position <= nextStop.position) {
      const t = (position - currentStop.position) / (nextStop.position - currentStop.position);
      return interpolateColor(currentStop.color, nextStop.color, t);
    }
  }

  return firstStop?.color || '#000000';
}

export function calculateGradientPreview(_gradient: unknown): string {
  return '';
}
