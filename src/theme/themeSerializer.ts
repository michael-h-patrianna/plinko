/**
 * Theme JSON Serialization Utilities
 *
 * Provides robust serialization, deserialization, validation, and import/export
 * functionality for Theme objects with strict type safety.
 */

import type { Theme } from './types';

/**
 * Serializes a Theme object to a formatted JSON string.
 *
 * @param theme - The Theme object to serialize
 * @returns Formatted JSON string with 2-space indentation
 */
export function serializeTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Deserializes a JSON string back to a Theme object.
 * Validates the parsed object before returning.
 *
 * @param json - JSON string to parse
 * @returns Parsed and validated Theme object, or null if invalid
 */
export function deserializeTheme(json: string): Theme | null {
  try {
    const parsed: unknown = JSON.parse(json);
    const validation = validateTheme(parsed);

    if (!validation.valid) {
      console.error('Theme validation failed:', validation.errors);
      return null;
    }

    return parsed as Theme;
  } catch (error) {
    console.error('Failed to parse theme JSON:', error);
    return null;
  }
}

/**
 * Validation result containing success status and any errors found.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that an unknown object matches the Theme interface structure.
 * Performs comprehensive checks on all required properties and nested objects.
 *
 * @param obj - Object to validate
 * @returns Validation result with list of any errors found
 */
export function validateTheme(obj: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if object exists and is an object
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Theme must be an object'] };
  }

  const theme = obj as Record<string, unknown>;

  // Validate top-level required properties
  validateString(theme, 'name', errors);
  validateBoolean(theme, 'isDark', errors);

  // Validate required complex objects
  validateObject(theme, 'colors', errors);
  validateObject(theme, 'gradients', errors);
  validateObject(theme, 'effects', errors);
  validateObject(theme, 'images', errors);
  validateObject(theme, 'spacing', errors);
  validateObject(theme, 'typography', errors);
  validateObject(theme, 'animation', errors);
  validateObject(theme, 'borderRadius', errors);
  validateObject(theme, 'buttons', errors);
  validateObject(theme, 'components', errors);
  validateObject(theme, 'breakpoints', errors);
  validateObject(theme, 'zIndex', errors);

  // Validate nested color properties
  if (theme.colors && typeof theme.colors === 'object') {
    const colors = theme.colors as Record<string, unknown>;
    validateNestedObject(colors, 'background', ['primary', 'secondary', 'tertiary', 'overlay', 'overlayDark'], errors);
    validateNestedObject(colors, 'surface', ['primary', 'secondary', 'elevated'], errors);
    validateNestedObject(colors, 'primary', ['main', 'light', 'dark', 'contrast'], errors);
    validateNestedObject(colors, 'accent', ['main', 'light', 'dark', 'contrast'], errors);
    validateNestedObject(colors, 'text', ['primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link', 'linkHover'], errors);
    validateNestedObject(colors, 'status', ['success', 'warning', 'error', 'info'], errors);
    validateNestedObject(colors, 'border', ['default', 'light', 'dark', 'focus'], errors);
    validateNestedObject(colors, 'shadows', ['default', 'colored', 'glow'], errors);

    // Validate prize colors
    if (colors.prizes && typeof colors.prizes === 'object') {
      const prizes = colors.prizes as Record<string, unknown>;
      ['orange', 'yellow', 'emerald', 'blue', 'violet'].forEach(color => {
        validateNestedObject(prizes, color, ['main', 'light', 'dark'], errors);
      });
    } else {
      errors.push('Missing required property: colors.prizes');
    }

    // Validate game colors
    if (colors.game && typeof colors.game === 'object') {
      const game = colors.game as Record<string, unknown>;
      validateNestedObject(game, 'ball', ['primary', 'secondary', 'highlight', 'shadow', 'borderRadius'], errors);
      validateNestedObject(game, 'peg', ['default', 'active', 'highlight', 'borderRadius', 'shadow'], errors);
      validateNestedObject(game, 'slot', ['border', 'borderWidth', 'borderRadius', 'glow', 'background'], errors);
      validateNestedObject(game, 'launcher', ['base', 'track', 'accent', 'borderRadius'], errors);
      validateNestedObject(game, 'board', ['background', 'border', 'borderRadius', 'shadow'], errors);
    } else {
      errors.push('Missing required property: colors.game');
    }
  }

  // Validate gradients
  if (theme.gradients && typeof theme.gradients === 'object') {
    const gradients = theme.gradients as Record<string, unknown>;
    const requiredGradients = [
      'backgroundMain', 'backgroundOverlay', 'backgroundCard', 'backgroundHeader',
      'buttonPrimary', 'buttonSecondary', 'buttonSuccess', 'buttonDanger',
      'prizeOrange', 'prizeYellow', 'prizeEmerald', 'prizeBlue', 'prizeViolet',
      'glow', 'shine', 'shimmer',
      'ballMain', 'ballGlow',
      'pegDefault', 'pegActive',
      'slotBackground', 'slotHighlight', 'slotWin'
    ];

    requiredGradients.forEach(gradient => {
      if (typeof gradients[gradient] !== 'string') {
        errors.push(`Missing or invalid property: gradients.${gradient}`);
      }
    });
  }

  // Validate effects
  if (theme.effects && typeof theme.effects === 'object') {
    const effects = theme.effects as Record<string, unknown>;
    validateNestedObject(effects, 'glows', ['sm', 'md', 'lg', 'colored', 'success', 'error'], errors);
    validateNestedObject(effects, 'borders', ['none', 'thin', 'medium', 'thick', 'dashed', 'dotted'], errors);
    validateNestedObject(effects, 'transitions', ['fast', 'normal', 'slow'], errors);
  }

  // Validate spacing
  if (theme.spacing && typeof theme.spacing === 'object') {
    const spacing = theme.spacing as Record<string | number, unknown>;
    const requiredSpacings = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];

    requiredSpacings.forEach(space => {
      if (typeof spacing[space] !== 'string') {
        errors.push(`Missing or invalid property: spacing.${space}`);
      }
    });
  }

  // Validate typography
  if (theme.typography && typeof theme.typography === 'object') {
    const typography = theme.typography as Record<string, unknown>;
    validateNestedObject(typography, 'fontFamily', ['primary'], errors);
    validateNestedObject(typography, 'fontSize', ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'], errors);
    validateNestedObject(typography, 'fontWeight', ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'], errors);
    validateNestedObject(typography, 'lineHeight', ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'], errors);
    validateNestedObject(typography, 'letterSpacing', ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'], errors);
  }

  // Validate animation
  if (theme.animation && typeof theme.animation === 'object') {
    const animation = theme.animation as Record<string, unknown>;
    validateNestedObject(animation, 'duration', ['instant', 'fast', 'normal', 'slow', 'slower', 'slowest'], errors);
    validateNestedObject(animation, 'easing', ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bounce', 'elastic', 'sharp', 'smooth'], errors);
  }

  // Validate borderRadius
  if (theme.borderRadius && typeof theme.borderRadius === 'object') {
    const borderRadius = theme.borderRadius as Record<string, unknown>;
    const requiredRadii = ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full', 'button', 'card', 'input', 'modal', 'badge', 'chip'];

    requiredRadii.forEach(radius => {
      if (typeof borderRadius[radius] !== 'string') {
        errors.push(`Missing or invalid property: borderRadius.${radius}`);
      }
    });
  }

  // Validate buttons
  if (theme.buttons && typeof theme.buttons === 'object') {
    const buttons = theme.buttons as Record<string, unknown>;
    const requiredButtons = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'];

    requiredButtons.forEach(button => {
      if (!buttons[button] || typeof buttons[button] !== 'object') {
        errors.push(`Missing or invalid property: buttons.${button}`);
      }
    });

    validateNestedObject(buttons, 'sizes', ['sm', 'md', 'lg'], errors);
  }

  // Validate components
  if (theme.components && typeof theme.components === 'object') {
    const components = theme.components as Record<string, unknown>;
    const requiredComponents = ['card', 'modal', 'header', 'input', 'dropdown', 'tooltip'];

    requiredComponents.forEach(component => {
      if (!components[component] || typeof components[component] !== 'object') {
        errors.push(`Missing or invalid property: components.${component}`);
      }
    });
  }

  // Validate breakpoints
  if (theme.breakpoints && typeof theme.breakpoints === 'object') {
    const breakpoints = theme.breakpoints as Record<string, unknown>;
    const requiredBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    requiredBreakpoints.forEach(breakpoint => {
      if (typeof breakpoints[breakpoint] !== 'string') {
        errors.push(`Missing or invalid property: breakpoints.${breakpoint}`);
      }
    });
  }

  // Validate zIndex
  if (theme.zIndex && typeof theme.zIndex === 'object') {
    const zIndex = theme.zIndex as Record<string | number, unknown>;
    const requiredZIndices = [0, 10, 20, 30, 40, 50, 'auto', 'dropdown', 'modal', 'popover', 'tooltip', 'notification'];

    requiredZIndices.forEach(index => {
      const value = zIndex[index];
      const isValid = typeof value === 'number' || typeof value === 'string';
      if (!isValid) {
        errors.push(`Missing or invalid property: zIndex.${index}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates that a property is a string.
 */
function validateString(obj: Record<string, unknown>, prop: string, errors: string[]): void {
  if (typeof obj[prop] !== 'string') {
    errors.push(`Missing or invalid property: ${prop} (expected string)`);
  }
}

/**
 * Validates that a property is a boolean.
 */
function validateBoolean(obj: Record<string, unknown>, prop: string, errors: string[]): void {
  if (typeof obj[prop] !== 'boolean') {
    errors.push(`Missing or invalid property: ${prop} (expected boolean)`);
  }
}

/**
 * Validates that a property is an object.
 */
function validateObject(obj: Record<string, unknown>, prop: string, errors: string[]): void {
  if (!obj[prop] || typeof obj[prop] !== 'object') {
    errors.push(`Missing or invalid property: ${prop} (expected object)`);
  }
}

/**
 * Validates that a nested object has all required properties.
 */
function validateNestedObject(
  parent: Record<string, unknown>,
  parentProp: string,
  requiredProps: string[],
  errors: string[]
): void {
  if (!parent[parentProp] || typeof parent[parentProp] !== 'object') {
    errors.push(`Missing or invalid property: ${parentProp}`);
    return;
  }

  const nested = parent[parentProp] as Record<string, unknown>;
  requiredProps.forEach(prop => {
    if (nested[prop] === undefined || nested[prop] === null) {
      errors.push(`Missing required property: ${parentProp}.${prop}`);
    }
  });
}

/**
 * Deep merges a partial theme object with a base theme.
 * Useful for loading themes that might be missing some properties.
 *
 * @param partial - Partial theme object to merge
 * @param base - Base theme to merge with
 * @returns Complete Theme object with merged values
 */
export function mergeWithDefaults(partial: Partial<Theme>, base: Theme): Theme {
  return deepMerge(base as unknown as Record<string, unknown>, partial as unknown as Record<string, unknown>) as unknown as Theme;
}

/**
 * Performs a deep merge of two objects.
 * Properties from the source object override those in the target.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Type guard to check if a value is a plain object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Exports a Theme object to a downloadable JSON file in the browser.
 * Creates a blob URL, triggers download, and cleans up the URL.
 *
 * @param theme - Theme object to export
 * @param filename - Name of the file to download (without extension)
 */
export function exportThemeToFile(theme: Theme, filename: string): void {
  const json = serializeTheme(theme);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports a Theme from a File object.
 * Reads the file, parses it, and validates it as a Theme.
 *
 * @param file - File object to import
 * @returns Promise that resolves to a Theme object, or null if invalid
 */
export function importThemeFromFile(file: File): Promise<Theme | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;

      if (typeof result !== 'string') {
        console.error('Failed to read file as text');
        resolve(null);
        return;
      }

      const theme = deserializeTheme(result);
      resolve(theme);
    };

    reader.onerror = () => {
      console.error('Failed to read file:', reader.error);
      resolve(null);
    };

    reader.readAsText(file);
  });
}
