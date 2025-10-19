// @ts-nocheck
/**
 * CSS linear-gradient parser and serializer
 */

import { logger } from './shared-utils';
import type { ColorFormat, ColorStop, GradientData } from './types';
import {
  directionToAngle,
  formatColor,
  generateStopId,
  normalizeAngle,
  sortStops,
} from './utils';

/**
 * Parse a CSS linear-gradient string into GradientData
 */
export function parseGradient(gradientString: string): GradientData {
  // Default gradient if parsing fails
  const defaultGradient: GradientData = {
    angle: 90,
    stops: [
      { id: generateStopId(), color: '#ffffff', position: 0 },
      { id: generateStopId(), color: '#000000', position: 100 },
    ],
  };

  // Remove whitespace and check for linear-gradient
  const trimmed = gradientString.trim();
  if (!trimmed.startsWith('linear-gradient(')) {
    return defaultGradient;
  }

  try {
    // Extract content between parentheses
    const content = trimmed.slice(16, -1); // Remove "linear-gradient(" and ")"

    // Split by commas, but respect nested parentheses
    const parts = splitGradientParts(content);

    if (parts.length < 2) {
      return defaultGradient;
    }

    // Parse angle/direction (first part might be angle or color)
    let angle = 90; // default
    let stopPartsStartIndex = 0;

    const firstPart = parts[0].trim();

    // Check if first part is an angle
    if (firstPart.endsWith('deg')) {
      const angleValue = parseFloat(firstPart);
      if (!isNaN(angleValue)) {
        angle = normalizeAngle(angleValue);
        stopPartsStartIndex = 1;
      }
    } else if (firstPart.startsWith('to ')) {
      // Directional keyword
      angle = directionToAngle(firstPart);
      stopPartsStartIndex = 1;
    }
    // Otherwise, first part is a color stop

    // Parse color stops
    const stops: ColorStop[] = [];
    const stopParts = parts.slice(stopPartsStartIndex);

    for (let i = 0; i < stopParts.length; i++) {
      const stopPart = stopParts[i].trim();
      const parsed = parseColorStop(stopPart);

      if (parsed) {
        // If position is not specified, calculate it
        if (parsed.position === null) {
          if (i === 0) {
            parsed.position = 0;
          } else if (i === stopParts.length - 1) {
            parsed.position = 100;
          } else {
            // Interpolate position
            parsed.position = (i / (stopParts.length - 1)) * 100;
          }
        }

        stops.push({
          id: generateStopId(),
          color: parsed.color,
          position: parsed.position,
        });
      }
    }

    // Ensure we have at least 2 stops
    if (stops.length < 2) {
      return defaultGradient;
    }

    return {
      angle,
      stops: sortStops(stops),
    };
  } catch (error) {
    logger.error('Error parsing gradient', { error });
    return defaultGradient;
  }
}

/**
 * Split gradient parts by comma, respecting nested parentheses
 */
function splitGradientParts(content: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Parse a color stop string (e.g., "#ff0000 50%", "rgb(255, 0, 0)", "blue 25%")
 */
function parseColorStop(
  stopString: string
): { color: string; position: number | null } | null {
  const trimmed = stopString.trim();

  // Try to extract position percentage
  const percentMatch = trimmed.match(/(.+?)\s+(\d+(?:\.\d+)?)%$/);
  if (percentMatch) {
    return {
      color: percentMatch[1].trim(),
      position: parseFloat(percentMatch[2]),
    };
  }

  // No position specified
  return {
    color: trimmed,
    position: null,
  };
}

/**
 * Serialize GradientData to CSS linear-gradient string
 */
export function serializeGradient(
  gradient: GradientData,
  colorFormat: ColorFormat = 'hex'
): string {
  const { angle, stops } = gradient;

  // Sort stops by position
  const sortedStops = sortStops(stops);

  // Convert standard angles to direction keywords for better CSS readability
  let anglePart: string;
  switch (angle) {
    case 0:
      anglePart = 'to right';
      break;
    case 90:
      anglePart = 'to bottom';
      break;
    case 180:
      anglePart = 'to left';
      break;
    case 270:
      anglePart = 'to top';
      break;
    default:
      anglePart = `${angle}deg`;
  }

  // Format stops
  const stopStrings = sortedStops.map((stop) => {
    const color = formatColor(stop.color, colorFormat);
    return `${color} ${stop.position}%`;
  });

  return `linear-gradient(${anglePart}, ${stopStrings.join(', ')})`;
}

/**
 * Validate if a string is a valid CSS linear-gradient
 */
export function isValidGradient(gradientString: string): boolean {
  try {
    const parsed = parseGradient(gradientString);
    return parsed.stops.length >= 2;
  } catch {
    return false;
  }
}

/**
 * Create a default gradient
 */
export function createDefaultGradient(): GradientData {
  return {
    angle: 90,
    stops: [
      { id: generateStopId(), color: '#667eea', position: 0 },
      { id: generateStopId(), color: '#764ba2', position: 100 },
    ],
  };
}
