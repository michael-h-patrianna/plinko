/**
 * useAnimationDriver Hook
 *
 * Provides the appropriate animation driver based on platform and environment.
 * Automatically selects Framer Motion for web, Moti for React Native.
 *
 * Usage:
 * ```typescript
 * const driver = useAnimationDriver();
 * const AnimatedDiv = driver.createAnimatedComponent('div');
 * const { AnimatePresence } = driver;
 * ```
 */

import { useMemo } from 'react';
import type { AnimationDriver, AnimationDriverType } from './types';
import { framerDriver } from './framer';
import { motiDriver } from './moti';

/**
 * Detect platform environment
 * Returns 'web' for browser, 'native' for React Native
 */
function detectPlatform(): 'web' | 'native' {
  // Check for React Native environment
  // In RN, there's no window.document
  if (typeof window !== 'undefined' && typeof window.document === 'undefined') {
    return 'native';
  }

  // Check for window object (browser)
  if (typeof window !== 'undefined') {
    return 'web';
  }

  // SSR default to web
  return 'web';
}

/**
 * Select animation driver based on platform and preferences
 *
 * @param driverType - Driver selection: 'auto' (default), 'framer', or 'moti'
 * @returns AnimationDriver instance
 */
function selectDriver(driverType: AnimationDriverType = 'auto'): AnimationDriver {
  // Manual driver selection
  if (driverType === 'framer') {
    return framerDriver;
  }
  if (driverType === 'moti') {
    return motiDriver;
  }

  // Auto-detect based on platform
  const platform = detectPlatform();

  if (platform === 'native') {
    return motiDriver;
  }

  // Default to Framer Motion for web
  return framerDriver;
}

/**
 * Hook to get the current animation driver
 *
 * @param driverType - Optional driver type override ('auto', 'framer', 'moti')
 * @returns AnimationDriver instance with platform-specific implementation
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const driver = useAnimationDriver();
 *   const AnimatedDiv = driver.createAnimatedComponent('div');
 *
 *   return (
 *     <AnimatedDiv
 *       initial={{ opacity: 0, y: 20 }}
 *       animate={{ opacity: 1, y: 0 }}
 *       transition={driver.getTransitionConfig('medium')}
 *     >
 *       Hello World
 *     </AnimatedDiv>
 *   );
 * }
 * ```
 */
export function useAnimationDriver(
  driverType: AnimationDriverType = 'auto'
): AnimationDriver {
  const driver = useMemo(() => selectDriver(driverType), [driverType]);

  return driver;
}

/**
 * Direct access to drivers for non-React contexts
 */
export { framerDriver, motiDriver };

/**
 * Get driver without React (for utility functions, tests, etc.)
 */
export function getAnimationDriver(
  driverType: AnimationDriverType = 'auto'
): AnimationDriver {
  return selectDriver(driverType);
}
