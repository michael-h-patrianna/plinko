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
import type { AnimatedComponentFactory } from './types';
import { useAnimationDriver } from './useAnimationDriver';

interface UseAnimationResult {
  AnimatedDiv: AnimatedComponentFactory<'div'>;
  AnimatedSpan: AnimatedComponentFactory<'span'>;
  AnimatedButton: AnimatedComponentFactory<'button'>;
  AnimatedH1: AnimatedComponentFactory<'h1'>;
  AnimatedH2: AnimatedComponentFactory<'h2'>;
  AnimatedH3: AnimatedComponentFactory<'h3'>;
  AnimatedP: AnimatedComponentFactory<'p'>;
  AnimatedImg: AnimatedComponentFactory<'img'>;
  AnimatePresence: ReturnType<typeof useAnimationDriver>['AnimatePresence'];
}

/**
 * Hook providing pre-created animated components and utilities
 * Memoizes created components to avoid recreation on every render
 */
export function useAnimation(): UseAnimationResult {
  const driver = useAnimationDriver();

  // Memoize to avoid recreating on every render
  const components = useMemo<UseAnimationResult>(
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
