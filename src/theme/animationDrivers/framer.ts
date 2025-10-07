/**
 * Framer Motion Animation Driver
 *
 * Web implementation of the animation driver using Framer Motion.
 * Provides GPU-accelerated animations with cross-platform compatibility.
 *
 * CRITICAL: This driver only exposes animations that are compatible with
 * future React Native implementation (transforms, opacity, colors only).
 */

import { motion, AnimatePresence } from 'framer-motion';
import type {
  AnimationDriver,
  AnimationEnvironment,
  SpringConfig,
  TransitionConfig,
  SPRING_PRESETS,
  TRANSITION_PRESETS,
} from './types';

/**
 * Detect animation environment and capabilities
 */
function detectEnvironment(): AnimationEnvironment {
  // SSR detection
  const isBrowser = typeof window !== 'undefined';
  const isSSR = !isBrowser;

  // React Native detection (will be false on web)
  const isNative = false;

  // Reduced motion preference
  let prefersReducedMotion = false;
  if (isBrowser && window.matchMedia) {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // GPU acceleration detection (basic heuristic)
  let hasGPUAcceleration = true;
  if (isBrowser) {
    // Check for hardware acceleration support
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    hasGPUAcceleration = !!gl;
  }

  return {
    isBrowser,
    isNative,
    isSSR,
    prefersReducedMotion,
    hasGPUAcceleration,
  };
}

/**
 * Framer Motion implementation of AnimationDriver
 */
class FramerMotionDriver implements AnimationDriver {
  readonly name = 'framer' as const;
  readonly platform = 'web' as const;
  private environment: AnimationEnvironment;

  constructor() {
    this.environment = detectEnvironment();
  }

  /**
   * Create animated component using Framer Motion
   * Returns motion.div, motion.span, etc.
   */
  createAnimatedComponent<T extends keyof JSX.IntrinsicElements>(
    component: T
  ): any {
    // Return the motion wrapper for the component
    return motion[component as keyof typeof motion] || motion.div;
  }

  /**
   * AnimatePresence for mount/unmount animations
   */
  AnimatePresence = AnimatePresence;

  /**
   * Check if animations are supported
   * Returns false for SSR or reduced motion preference
   */
  isSupported(): boolean {
    // Disable animations in SSR
    if (this.environment.isSSR) {
      return false;
    }

    // Respect reduced motion preference but still return true
    // (components can check prefersReducedMotion separately)
    return true;
  }

  /**
   * Get spring configuration for smooth 60 FPS animations
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
   * Get transition configuration optimized for GPU acceleration
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
   * Check if reduced motion is preferred
   * Components can use this to disable or simplify animations
   */
  prefersReducedMotion(): boolean {
    return this.environment.prefersReducedMotion;
  }

  /**
   * Get current environment information
   */
  getEnvironment(): AnimationEnvironment {
    return { ...this.environment };
  }
}

/**
 * Singleton instance of Framer Motion driver
 * Export as default for easy usage
 */
export const framerDriver = new FramerMotionDriver();

/**
 * Export the class for testing purposes
 */
export { FramerMotionDriver };
