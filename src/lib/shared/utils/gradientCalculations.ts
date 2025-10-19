/**
 * Gradient calculation utilities
 * Functions for gradient interpolation, stop management, and angle conversions
 */

import type { ColorStop } from '../../color-control/types';
import { parseColor, rgbToHex } from './colorConversion';

/**
 * Interpolate color between two stops
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  const a =
    rgb1.a !== undefined && rgb2.a !== undefined ? rgb1.a + (rgb2.a - rgb1.a) * factor : undefined;

  return rgbToHex({ r, g, b, a });
}

/**
 * Get color at a specific position in gradient
 */
export function getColorAtPosition(stops: ColorStop[], position: number): string {
  if (stops.length === 0) return '#000000';

  const sorted = sortStops(stops);
  const firstStop = sorted[0];
  const lastStop = sorted[sorted.length - 1];

  if (!firstStop) return '#000000';

  // Position before first stop
  if (position <= firstStop.position) {
    return firstStop.color;
  }

  // Position after last stop
  if (lastStop && position >= lastStop.position) {
    return lastStop.color;
  }

  // Find surrounding stops
  for (let i = 0; i < sorted.length - 1; i++) {
    const stop1 = sorted[i];
    const stop2 = sorted[i + 1];

    if (stop1 && stop2 && position >= stop1.position && position <= stop2.position) {
      const range = stop2.position - stop1.position;
      const factor = (position - stop1.position) / range;
      return interpolateColor(stop1.color, stop2.color, factor);
    }
  }

  return firstStop.color;
}

/**
 * Sort color stops by position
 */
export function sortStops(stops: ColorStop[]): ColorStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Validate color stop position (0-100)
 */
export function clampPosition(position: number): number {
  return Math.max(0, Math.min(100, position));
}

/**
 * Generate unique ID for color stops
 */
export function generateStopId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Convert angle to directional keyword
 */
export function angleToDirection(angle: number): string | null {
  const normalized = normalizeAngle(angle);
  const directions: Record<number, string> = {
    0: 'to right',
    90: 'to bottom',
    180: 'to left',
    270: 'to top',
  };
  return directions[normalized] || null;
}

/**
 * Convert directional keyword to angle
 */
export function directionToAngle(direction: string): number {
  const directions: Record<string, number> = {
    'to right': 0,
    'to bottom': 90,
    'to left': 180,
    'to top': 270,
    'to bottom right': 45,
    'to bottom-right': 45,
    'to right bottom': 45,
    'to bottom left': 135,
    'to bottom-left': 135,
    'to left bottom': 135,
    'to top left': 225,
    'to top-left': 225,
    'to left top': 225,
    'to top right': 315,
    'to top-right': 315,
    'to right top': 315,
  };
  return directions[direction.toLowerCase()] ?? 90;
}
