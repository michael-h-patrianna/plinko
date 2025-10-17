/**
 * React Native implementation stub for GradientText
 *
 * FUTURE IMPLEMENTATION:
 * This will use react-native-linear-gradient with MaskedView to achieve
 * gradient text on React Native.
 *
 * @example
 * ```tsx
 * import MaskedView from '@react-native-masked-view/masked-view';
 * import LinearGradient from 'react-native-linear-gradient';
 *
 * export function GradientText({ children, gradient, style }: GradientTextProps) {
 *   // Calculate gradient direction from angle
 *   const { start, end } = angleToGradientDirection(gradient.angle || 135);
 *
 *   return (
 *     <MaskedView maskElement={<Text style={style}>{children}</Text>}>
 *       <LinearGradient colors={gradient.colors} start={start} end={end}>
 *         <Text style={[style, { opacity: 0 }]}>{children}</Text>
 *       </LinearGradient>
 *     </MaskedView>
 *   );
 * }
 * ```
 *
 * @cross-platform This is the React Native counterpart to GradientText.web.tsx
 */

import type { GradientTextProps } from './types';

/**
 * GradientText stub for React Native
 * Currently returns plain text - will be implemented when porting to RN
 */
export function GradientText({ children, style, className }: GradientTextProps) {
  // NOTE: This is a stub implementation for future React Native support
  // When porting to RN, this will use MaskedView + LinearGradient
  // For now, we just render plain text to satisfy TypeScript

  const combinedStyle = {
    ...style,
    // Fallback: use first gradient color as solid color
    color: '#FFFFFF', // Will be replaced with gradient.colors[0] in real implementation
  };

  return <div className={className} style={combinedStyle}>{children}</div>;
}
