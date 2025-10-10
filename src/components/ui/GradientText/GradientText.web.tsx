/**
 * Web implementation of GradientText using WebKit background-clip CSS
 *
 * Uses WebKit-specific CSS properties to clip background gradient to text.
 * This is a web-only technique that will be replaced with MaskedView on React Native.
 *
 * @example
 * ```tsx
 * <GradientText
 *   gradient={{ colors: ['#FF0000', '#0000FF'], angle: 135 }}
 *   className="text-9xl font-black"
 * >
 *   GO!
 * </GradientText>
 * ```
 *
 * @cross-platform This component has a React Native counterpart in GradientText.native.tsx
 */

import type { CSSProperties } from 'react';
import type { GradientTextProps } from './types';

/**
 * Converts gradient config to CSS linear-gradient string
 */
function buildLinearGradient(colors: string[], angle: number = 135): string {
  const colorStops = colors.join(', ');
  return `linear-gradient(${angle}deg, ${colorStops})`;
}

/**
 * GradientText component for web
 * Renders text with a linear gradient fill using WebKit CSS properties
 */
export function GradientText({ children, gradient, style = {}, className = '' }: GradientTextProps) {
  const gradientCSS = buildLinearGradient(gradient.colors, gradient.angle);

  const gradientStyle: CSSProperties = {
    background: gradientCSS,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    ...style,
  };

  return (
    <div className={className} style={gradientStyle}>
      {children}
    </div>
  );
}
