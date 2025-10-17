/**
 * useBallAnimationDriver Hook
 *
 * Provides platform-specific ball animation driver for direct DOM/shared value manipulation.
 * Automatically selects web or native implementation based on platform.
 *
 * Usage:
 * ```typescript
 * const ballRefs = {
 *   ballMain: useRef<HTMLDivElement>(null),
 *   ballGlowOuter: useRef<HTMLDivElement>(null),
 *   ballGlowMid: useRef<HTMLDivElement>(null),
 *   trailElements: Array(20).fill(null).map(() => useRef<HTMLDivElement>(null)),
 *   maxTrailLength: 20,
 * };
 *
 * const driver = useBallAnimationDriver(ballRefs);
 *
 * // In animation loop:
 * driver.applyBallTransform({ position: { x, y, rotation }, stretch: { scaleX, scaleY } });
 * driver.updateTrail(trailFrames);
 * ```
 */

import { useMemo } from 'react';
import type { BallAnimationDriver } from './ballAnimationDriver';
import { createWebBallAnimationDriver, type WebBallRefs } from './ballAnimationDriver.web';

/**
 * Detect platform environment
 * Returns 'web' for browser, 'native' for React Native
 */
function detectPlatform(): 'web' | 'native' {
  // Check for React Native environment
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
 * Hook to get platform-specific ball animation driver
 *
 * @param refs - Platform-specific refs (WebBallRefs for web, NativeBallRefs for native)
 * @returns BallAnimationDriver instance with platform-specific implementation
 */
export function useBallAnimationDriver(refs: WebBallRefs): BallAnimationDriver {
  const platform = detectPlatform();

  const driver = useMemo(() => {
    if (platform === 'native') {
      // TODO: Implement native driver when React Native support is added
      throw new Error('Native ball animation driver not yet implemented');
    }

    // Web implementation
    return createWebBallAnimationDriver(refs);
  }, [platform, refs]);

  return driver;
}
