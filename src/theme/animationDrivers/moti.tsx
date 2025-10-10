/**
 * Moti Animation Driver (Placeholder)
 *
 * React Native implementation placeholder for future RN port.
 * This will use Moti + Reanimated when the React Native version is built.
 *
 * For now, this is a minimal stub that matches the AnimationDriver interface.
 * When porting to React Native:
 * 1. Install: moti, react-native-reanimated
 * 2. Replace imports with actual Moti components
 * 3. Implement platform-specific optimizations
 *
 * CRITICAL: Only supports cross-platform safe animations:
 * - Transforms: translateX, translateY, scale, rotate
 * - Opacity
 * - Colors
 * - Linear gradients (via react-native-linear-gradient)
 */

import React from 'react';
import type {
  AnimationDriver,
  AnimationEnvironment,
  SpringConfig,
  TransitionConfig,
  SPRING_PRESETS,
  TRANSITION_PRESETS,
} from './types';

/**
 * Placeholder AnimatePresence component
 * Will be replaced with actual Moti AnimatePresence in RN
 */
const PlaceholderAnimatePresence = ({
  children,
}: {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
}) => {
  return <>{children}</>;
};

/**
 * Detect React Native environment
 */
function detectEnvironment(): AnimationEnvironment {
  // In web context, this is always false
  const isNative = false;
  const isBrowser = typeof window !== 'undefined';
  const isSSR = !isBrowser;

  return {
    isBrowser,
    isNative,
    isSSR,
    prefersReducedMotion: false,
    hasGPUAcceleration: true, // Assume true for RN
  };
}

/**
 * Moti implementation of AnimationDriver (Placeholder)
 *
 * TODO (React Native Port):
 * - Import { MotiView, MotiText, AnimatePresence } from 'moti'
 * - Import Animated from 'react-native-reanimated'
 * - Implement createAnimatedComponent with MotiView
 * - Add Reanimated worklet support
 * - Configure spring physics for native thread
 */
class MotiDriver implements AnimationDriver {
  readonly name = 'moti' as const;
  readonly platform = 'native' as const;
  private environment: AnimationEnvironment;

  constructor() {
    this.environment = detectEnvironment();
  }

  /**
   * Create animated component using Moti (Placeholder)
   *
   * Future implementation:
   * ```typescript
   * import { MotiView, MotiText } from 'moti';
   *
   * const componentMap = {
   *   div: MotiView,
   *   span: MotiText,
   *   // ... other mappings
   * };
   * return componentMap[component] || MotiView;
   * ```
   */
  createAnimatedComponent<T extends keyof React.JSX.IntrinsicElements>(
    _component: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    // Placeholder: return a basic div
    // This will throw an error if used in actual RN context
    if (this.environment.isNative) {
      throw new Error(
        'MotiDriver.createAnimatedComponent: Moti is not installed. Install moti and react-native-reanimated.'
      );
    }

    // In web context, return a minimal stub
    return 'div';
  }

  /**
   * AnimatePresence for mount/unmount animations (Placeholder)
   *
   * Future implementation:
   * ```typescript
   * import { AnimatePresence } from 'moti';
   * AnimatePresence = AnimatePresence;
   * ```
   */
  AnimatePresence = PlaceholderAnimatePresence;

  /**
   * Check if animations are supported
   */
  isSupported(): boolean {
    // In actual RN implementation, always return true
    // (RN has native animation support)
    return this.environment.isNative;
  }

  /**
   * Get spring configuration for Reanimated
   * These configs work with both Framer Motion and Reanimated
   */
  getSpringConfig(
    preset: 'gentle' | 'wobbly' | 'stiff' | 'slow'
  ): SpringConfig {
    const presets: typeof SPRING_PRESETS = {
      gentle: {
        stiffness: 120,
        damping: 14,
        mass: 0.8,
      },
      wobbly: {
        stiffness: 180,
        damping: 12,
        mass: 1,
      },
      stiff: {
        stiffness: 300,
        damping: 20,
        mass: 0.6,
      },
      slow: {
        stiffness: 80,
        damping: 20,
        mass: 1.2,
      },
    };

    return presets[preset];
  }

  /**
   * Get transition configuration for Moti
   */
  getTransitionConfig(
    preset: 'fast' | 'medium' | 'slow' | 'spring'
  ): TransitionConfig {
    const presets: typeof TRANSITION_PRESETS = {
      fast: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
      medium: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
      slow: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
      spring: {
        type: 'spring',
        spring: this.getSpringConfig('gentle'),
      },
    };

    return presets[preset];
  }

  /**
   * Get current environment information
   */
  getEnvironment(): AnimationEnvironment {
    return { ...this.environment };
  }
}

/**
 * Singleton instance of Moti driver
 * Export as default for consistency with framer driver
 */
export const motiDriver = new MotiDriver();

/**
 * Export the class for testing purposes
 */
export { MotiDriver };

/**
 * Instructions for React Native port:
 *
 * 1. Install dependencies:
 *    ```bash
 *    npm install moti react-native-reanimated
 *    npx pod-install # iOS only
 *    ```
 *
 * 2. Configure Reanimated in babel.config.js:
 *    ```javascript
 *    module.exports = {
 *      plugins: ['react-native-reanimated/plugin'],
 *    };
 *    ```
 *
 * 3. Update this file:
 *    - Uncomment Moti imports
 *    - Implement createAnimatedComponent with proper component mapping
 *    - Test all animations on iOS and Android
 *
 * 4. Animation constraints already enforced:
 *    - Only transforms (translateX, translateY, scale, rotate)
 *    - Only opacity
 *    - Only linear gradients
 *    - No blur, shadows, or filters
 *
 * 5. Performance optimization:
 *    - All animations run on native thread via Reanimated
 *    - Spring physics handled by native code
 *    - No JS bridge overhead for 60 FPS
 */
