/**
 * Cross-platform GradientText component
 *
 * Platform abstraction layer that automatically imports the correct implementation:
 * - Web: Uses WebKit background-clip CSS technique
 * - React Native: Uses MaskedView + LinearGradient (future implementation)
 *
 * This component replaces inline WebKit gradient text CSS with a reusable,
 * cross-platform compatible component.
 *
 * @example
 * ```tsx
 * // Basic usage with linear gradient
 * <GradientText
 *   gradient={{ colors: ['#FF0000', '#0000FF'] }}
 *   className="text-9xl font-black"
 * >
 *   GO!
 * </GradientText>
 *
 * // Custom angle
 * <GradientText
 *   gradient={{ colors: ['#FFD700', '#FFA500', '#FF6347'], angle: 90 }}
 *   style={{ fontSize: '48px', fontWeight: 'bold' }}
 * >
 *   3
 * </GradientText>
 *
 * // Using theme gradients
 * <GradientText
 *   gradient={{
 *     colors: [theme.colors.status.success, theme.colors.status.success],
 *     angle: 135
 *   }}
 * >
 *   Success!
 * </GradientText>
 * ```
 *
 * @cross-platform Works on both web and React Native
 * - Web: Uses CSS background-clip technique (WebKit)
 * - React Native: Will use MaskedView + react-native-linear-gradient
 */

// Platform-specific import
// When building for React Native, bundler will use .native.tsx
// For web, it uses .web.tsx
export { GradientText } from './GradientText.web';
export type { GradientTextProps, GradientConfig } from './types';
