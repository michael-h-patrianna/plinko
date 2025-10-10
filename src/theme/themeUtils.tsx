/**
 * Theme utility hooks and helper functions
 * Provides convenient access to theme context and values
 */

import { useContext } from 'react';
import { Theme } from './types';
import { ThemeContext, type ThemeContextType } from './context';


/**
 * Hook to access the current theme context
 * Must be used within a ThemeProvider
 * @returns Theme context with current theme and switching utilities
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to access a specific theme value by key
 * @param key - The theme property key to retrieve
 * @returns The value of the specified theme property
 */
export const useThemeValue = <K extends keyof Theme>(key: K): Theme[K] => {
  const { theme } = useTheme();
  return theme[key];
};

/**
 * Helper function to create CSS variables from theme
 *
 * This utility converts a Theme object into CSS custom properties (variables).
 * Useful for:
 * - Server-side rendering (SSR) where you need to inject theme CSS into HTML
 * - CSS-in-JS frameworks that support CSS variables
 * - Dynamic theme switching via style tags
 *
 * @example
 * ```tsx
 * const cssVars = createCSSVariables(theme);
 * const styleTag = `<style>:root { ${cssVars} }</style>`;
 * ```
 *
 * @param theme - Theme object to convert
 * @returns CSS variable declarations as a string
 */
export const createCSSVariables = (theme: Theme): string => {
  const cssVars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors as Record<string, string>).forEach(([name, value]) => {
        cssVars.push(`--color-${category}-${name}: ${value};`);
      });
    }
  });

  // Gradients
  Object.entries(theme.gradients).forEach(([name, value]) => {
    cssVars.push(`--gradient-${name}: ${value};`);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([name, value]) => {
    cssVars.push(`--spacing-${name}: ${value}px;`);
  });

  // Typography
  Object.entries(theme.typography.fontSize).forEach(([name, value]) => {
    cssVars.push(`--font-size-${name}: ${value};`);
  });

  Object.entries(theme.typography.fontWeight).forEach(([name, value]) => {
    cssVars.push(`--font-weight-${name}: ${value};`);
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([name, value]) => {
    cssVars.push(`--radius-${name}: ${value}px;`);
  });

  // Animation durations
  Object.entries(theme.animation.duration).forEach(([name, value]) => {
    cssVars.push(`--duration-${name}: ${value}ms;`);
  });

  return cssVars.join('\n  ');
};

// ===========================
// STYLE PATTERN UTILITIES
// ===========================

/**
 * Create a semi-transparent background color using rgba
 * Useful for overlay backgrounds, glass morphism, and subtle backgrounds
 *
 * @example
 * ```tsx
 * // Create a semi-transparent black background
 * const overlayBg = createOverlayBackground('#000000', 0.5);
 * // Returns: 'rgba(0, 0, 0, 0.5)'
 * ```
 *
 * @param color - Hex color string (e.g., '#000000')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 */
export function createOverlayBackground(color: string, opacity: number): string {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Create a card/container background style with theme integration
 *
 * @example
 * ```tsx
 * const cardStyle = createCardBackground(theme.colors.surface.primary, 0.5);
 * // Returns: { background: 'rgba(...)', borderRadius: '12px', padding: '24px' }
 * ```
 *
 * @param backgroundColor - Background color
 * @param opacity - Optional opacity (default: 1)
 * @param borderRadius - Optional border radius (default: '12px')
 * @param padding - Optional padding (default: '24px')
 * @returns Style object for card backgrounds
 */
export function createCardBackground(
  backgroundColor: string,
  opacity: number = 1,
  borderRadius: string = '12px',
  padding: string = '24px'
): React.CSSProperties {
  return {
    background: opacity < 1 ? createOverlayBackground(backgroundColor, opacity) : backgroundColor,
    borderRadius,
    padding,
  };
}

/**
 * Create a gradient text style (cross-platform compatible)
 *
 * @example
 * ```tsx
 * const gradientStyle = createGradientText(theme.gradients.buttonPrimary);
 * <h1 style={gradientStyle}>Gradient Text</h1>
 * ```
 *
 * @param gradient - CSS gradient string
 * @returns Style object for gradient text
 */
export function createGradientText(gradient: string): React.CSSProperties {
  const isGradient = gradient.includes('gradient');

  if (isGradient) {
    return {
      background: gradient,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
    };
  }

  // Fallback to solid color
  return {
    color: gradient,
  };
}

/**
 * Create a flexbox layout style with gap spacing
 *
 * @example
 * ```tsx
 * const layout = createFlexLayout('center', 'space-between', '12px', 'row');
 * <div style={layout}>Flex content</div>
 * ```
 *
 * @param alignItems - Flex align-items value
 * @param justifyContent - Flex justify-content value
 * @param gap - Gap between flex items
 * @param flexDirection - Flex direction (default: 'row')
 * @returns Style object for flexbox layouts
 */
export function createFlexLayout(
  alignItems: React.CSSProperties['alignItems'] = 'center',
  justifyContent: React.CSSProperties['justifyContent'] = 'flex-start',
  gap: string = '0',
  flexDirection: React.CSSProperties['flexDirection'] = 'row'
): React.CSSProperties {
  return {
    display: 'flex',
    alignItems,
    justifyContent,
    gap,
    flexDirection,
  };
}

/**
 * Create an absolute positioned overlay style
 *
 * @example
 * ```tsx
 * const overlayStyle = createAbsoluteOverlay({ top: '0', left: '0' }, 10);
 * <div style={overlayStyle}>Overlay content</div>
 * ```
 *
 * @param position - Position values (top, left, right, bottom)
 * @param zIndex - Optional z-index (default: undefined)
 * @param pointerEvents - Optional pointer-events (default: 'none')
 * @returns Style object for absolute overlays
 */
export function createAbsoluteOverlay(
  position: { top?: string | number; left?: string | number; right?: string | number; bottom?: string | number },
  zIndex?: number,
  pointerEvents: React.CSSProperties['pointerEvents'] = 'none'
): React.CSSProperties {
  return {
    position: 'absolute',
    ...position,
    zIndex,
    pointerEvents,
  };
}

/**
 * Create a transform style with common transformations
 *
 * @example
 * ```tsx
 * const transformStyle = createTransform({ translateX: '50%', scale: 1.2, rotate: 45 });
 * <div style={transformStyle}>Transformed content</div>
 * ```
 *
 * @param transforms - Transform values
 * @returns Style object with transform property
 */
export function createTransform(transforms: {
  translateX?: string | number;
  translateY?: string | number;
  scale?: number;
  rotate?: number | string;
  scaleX?: number;
  scaleY?: number;
}): React.CSSProperties {
  const transformParts: string[] = [];

  if (transforms.translateX !== undefined) {
    transformParts.push(`translateX(${typeof transforms.translateX === 'number' ? `${transforms.translateX}px` : transforms.translateX})`);
  }
  if (transforms.translateY !== undefined) {
    transformParts.push(`translateY(${typeof transforms.translateY === 'number' ? `${transforms.translateY}px` : transforms.translateY})`);
  }
  if (transforms.scale !== undefined) {
    transformParts.push(`scale(${transforms.scale})`);
  }
  if (transforms.scaleX !== undefined) {
    transformParts.push(`scaleX(${transforms.scaleX})`);
  }
  if (transforms.scaleY !== undefined) {
    transformParts.push(`scaleY(${transforms.scaleY})`);
  }
  if (transforms.rotate !== undefined) {
    transformParts.push(`rotate(${typeof transforms.rotate === 'number' ? `${transforms.rotate}deg` : transforms.rotate})`);
  }

  return {
    transform: transformParts.join(' '),
  };
}

/**
 * Create responsive font size based on container width
 *
 * @example
 * ```tsx
 * const fontSize = createResponsiveFontSize(320, { min: 10, max: 16, minWidth: 300, maxWidth: 600 });
 * <div style={{ fontSize }}>Responsive text</div>
 * ```
 *
 * @param containerWidth - Current container width
 * @param config - Configuration object with min/max font sizes and widths
 * @returns Font size string
 */
export function createResponsiveFontSize(
  containerWidth: number,
  config: { min: number; max: number; minWidth: number; maxWidth: number }
): string {
  const { min, max, minWidth, maxWidth } = config;

  if (containerWidth <= minWidth) return `${min}px`;
  if (containerWidth >= maxWidth) return `${max}px`;

  // Linear interpolation
  const ratio = (containerWidth - minWidth) / (maxWidth - minWidth);
  const fontSize = min + (max - min) * ratio;

  return `${Math.round(fontSize)}px`;
}
