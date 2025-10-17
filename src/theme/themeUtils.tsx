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

  // Border radius
  Object.entries(theme.borderRadius).forEach(([name, value]) => {
    cssVars.push(`--radius-${name}: ${value}px;`);
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

// ===========================
// PHASE 1 MIGRATION UTILITIES
// ===========================

/**
 * Create centered flex container (replaces repetitive centered flexbox patterns)
 * Cross-platform compatible - uses only flexbox properties
 *
 * @example
 * ```tsx
 * // Before:
 * style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
 *
 * // After:
 * style={createCenteredContainer('column', '12px')}
 * ```
 *
 * @param direction - Flex direction (default: 'column')
 * @param gap - Gap between flex items (optional)
 * @returns Style object for centered flex container
 */
export function createCenteredContainer(
  direction: 'row' | 'column' = 'column',
  gap?: string
): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: direction,
    ...(gap && { gap }),
  };
}

/**
 * Create fullscreen overlay preset (replaces repetitive absolute positioning)
 * Cross-platform compatible - uses inset instead of individual positioning
 *
 * @example
 * ```tsx
 * // Before:
 * style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}
 *
 * // After:
 * style={createFullscreenOverlay(30)}
 * ```
 *
 * @param zIndex - Z-index value
 * @param pointerEvents - Pointer events behavior (default: 'none')
 * @returns Style object for fullscreen overlay
 */
export function createFullscreenOverlay(
  zIndex: number,
  pointerEvents: React.CSSProperties['pointerEvents'] = 'none'
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    zIndex,
    pointerEvents,
  };
}

/**
 * Create centered absolute element (replaces repetitive centering patterns)
 * Cross-platform compatible - uses transforms for centering
 *
 * @example
 * ```tsx
 * // Before:
 * style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
 *
 * // After:
 * style={createCenteredAbsolute(10)}
 * ```
 *
 * @param zIndex - Optional z-index value
 * @returns Style object for centered absolute element
 */
export function createCenteredAbsolute(
  zIndex?: number
): React.CSSProperties {
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    ...(zIndex !== undefined && { zIndex }),
  };
}

/**
 * Create themed text style (replaces direct theme.colors.text.* references)
 * Provides consistent typography with theme integration
 *
 * @example
 * ```tsx
 * // Before:
 * style={{ color: theme.colors.text.primary, fontFamily: theme.typography.fontFamily.primary }}
 *
 * // After:
 * style={createTextStyle('primary', theme, { fontSize: '14px', fontWeight: 600 })}
 * ```
 *
 * @param variant - Text color variant from theme
 * @param theme - Theme object
 * @param options - Optional typography overrides
 * @returns Style object for text
 */
export function createTextStyle(
  variant: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse',
  theme: Theme,
  options?: {
    fontSize?: string;
    fontWeight?: number;
    fontFamily?: 'primary' | 'display';
  }
): React.CSSProperties {
  return {
    color: theme.colors.text[variant],
    fontFamily: theme.typography.fontFamily[options?.fontFamily || 'primary'],
    ...(options?.fontSize && { fontSize: options.fontSize }),
    ...(options?.fontWeight && { fontWeight: options.fontWeight }),
  };
}

/**
 * Create themed overlay background with opacity presets
 * Replaces hardcoded rgba() values with theme-aware colors
 * Cross-platform compatible - converts hex to rgba
 *
 * @example
 * ```tsx
 * // Before:
 * background: 'rgba(0, 0, 0, 0.5)' // ❌ Hardcoded, bypasses theme
 *
 * // After:
 * background: createThemedOverlay(theme, 'medium') // ✅ Theme-aware
 * ```
 *
 * @param theme - Theme object
 * @param opacity - Opacity preset ('light' | 'medium' | 'dark')
 * @returns rgba color string
 */
export function createThemedOverlay(
  theme: Theme,
  opacity: 'light' | 'medium' | 'dark' = 'medium'
): string {
  const opacityMap = { light: 0.3, medium: 0.5, dark: 0.8 };
  const targetOpacity = opacityMap[opacity];

  // Use surface.elevated as base color (it's a hex color)
  const baseColor = theme.colors.surface.elevated || theme.colors.background.secondary || '#1e293b';

  return createOverlayBackground(baseColor, targetOpacity);
}

/**
 * Create themed text with opacity (for secondary/muted text)
 * Replaces hardcoded rgba() text colors with theme-aware colors
 * Cross-platform compatible
 *
 * @example
 * ```tsx
 * // Before:
 * color: 'rgba(255, 255, 255, 0.7)' // ❌ Hardcoded, bypasses theme
 *
 * // After:
 * color: createThemedTextColor(theme, 'secondary', 0.7) // ✅ Theme-aware
 * ```
 *
 * @param theme - Theme object
 * @param variant - Text color variant ('primary' | 'secondary' | 'tertiary')
 * @param opacity - Optional opacity override (uses theme default if not provided)
 * @returns rgba color string or theme color
 */
export function createThemedTextColor(
  theme: Theme,
  variant: 'primary' | 'secondary' | 'tertiary' = 'secondary',
  opacity?: number
): string {
  const color = theme.colors.text[variant];
  if (opacity !== undefined) {
    return createOverlayBackground(color, opacity);
  }
  return color;
}

/**
 * Create themed shadow text color (for text shadow layers)
 * Replaces hardcoded rgba() shadow colors with theme-aware shadows
 * Cross-platform compatible - returns color only (not box-shadow)
 *
 * @example
 * ```tsx
 * // Before:
 * color: 'rgba(0, 0, 0, 0.15)' // ❌ Hardcoded shadow color
 *
 * // After:
 * color: createThemedShadowColor(theme, 0.15) // ✅ Theme-aware
 * ```
 *
 * @param theme - Theme object
 * @param opacity - Shadow opacity (0-1)
 * @returns rgba color string for shadow layer
 */
export function createThemedShadowColor(
  theme: Theme,
  opacity: number
): string {
  return createOverlayBackground(theme.colors.shadows.default, opacity);
}

/**
 * Create themed container style with variants
 * Enhanced version of createCardBackground with preset variants
 * Cross-platform compatible - no shadows
 *
 * @example
 * ```tsx
 * // Before:
 * style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '12px 20px', borderRadius: '12px' }}
 *
 * // After:
 * style={createContainerStyle(theme, 'overlay', { padding: '12px 20px', borderRadius: '12px' })}
 * ```
 *
 * @param theme - Theme object
 * @param variant - Container variant ('card' | 'overlay' | 'elevated')
 * @param options - Optional style overrides
 * @returns Style object for container
 */
export function createContainerStyle(
  theme: Theme,
  variant: 'card' | 'overlay' | 'elevated' = 'card',
  options?: {
    padding?: string;
    borderRadius?: string;
  }
): React.CSSProperties {
  const backgrounds = {
    card: theme.components.card.background,
    overlay: createThemedOverlay(theme, 'medium'),
    elevated: theme.colors.surface.elevated,
  };

  return {
    background: backgrounds[variant],
    padding: options?.padding || '16px',
    borderRadius: options?.borderRadius || theme.components.card.borderRadius,
  };
}
