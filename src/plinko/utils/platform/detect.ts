/**
 * Platform Detection Utility
 *
 * Provides runtime detection of the current platform (web vs React Native)
 * Used by all platform adapters to determine which implementation to use
 */

export type Platform = 'web' | 'native';

/**
 * Detects the current platform at runtime
 *
 * Detection strategy:
 * - React Native has a global navigator.product === 'ReactNative'
 * - Web has window and document objects
 *
 * @returns 'web' or 'native'
 */
export function detectPlatform(): Platform {
  // React Native detection
  if (
    typeof navigator !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    navigator.product === 'ReactNative'
  ) {
    return 'native';
  }

  // Web detection (has window and document)
  if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  ) {
    return 'web';
  }

  // Default to web for SSR environments
  return 'web';
}

/**
 * Current platform (cached result)
 */
export const PLATFORM: Platform = detectPlatform();

/**
 * Platform check utilities
 */
export const isWeb = PLATFORM === 'web';
export const isNative = PLATFORM === 'native';

/**
 * Helper to throw errors for unimplemented native features
 */
export function throwNativeNotImplemented(feature: string): never {
  throw new Error(
    `${feature} is not yet implemented for React Native. ` +
    `This feature is currently web-only. ` +
    `Please check the platform adapter implementation.`
  );
}

/**
 * Helper to log warnings for platform-specific behavior
 */
export function warnPlatformSpecific(message: string): void {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[Platform Warning] ${message}`);
  }
}
