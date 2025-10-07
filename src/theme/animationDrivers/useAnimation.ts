/**
 * Convenience hook that returns pre-created animated components
 * Reduces boilerplate in components that use animations
 *
 * Instead of:
 * ```
 * const driver = useAnimationDriver();
 * const AnimatedDiv = driver.createAnimatedComponent('div');
 * const { AnimatePresence } = driver;
 * ```
 *
 * Use:
 * ```
 * const { AnimatedDiv, AnimatePresence } = useAnimation();
 * ```
 */

import { useMemo } from 'react';
import { useAnimationDriver } from './useAnimationDriver';

/**
 * Hook providing pre-created animated components and utilities
 * Memoizes created components to avoid recreation on every render
 */
export function useAnimation() {
  const driver = useAnimationDriver();

  // Memoize to avoid recreating on every render
  const components = useMemo(
    () => ({
      // Common HTML elements
      AnimatedDiv: driver.createAnimatedComponent('div'),
      AnimatedSpan: driver.createAnimatedComponent('span'),
      AnimatedButton: driver.createAnimatedComponent('button'),
      AnimatedH1: driver.createAnimatedComponent('h1'),
      AnimatedH2: driver.createAnimatedComponent('h2'),
      AnimatedH3: driver.createAnimatedComponent('h3'),
      AnimatedP: driver.createAnimatedComponent('p'),
      AnimatedImg: driver.createAnimatedComponent('img'),

      // Animation utilities
      AnimatePresence: driver.AnimatePresence,
    }),
    [driver]
  );

  return components;
}
