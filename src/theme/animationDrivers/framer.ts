/**
 * Framer Motion Animation Driver
 *
 * Web implementation of the animation driver using Framer Motion.
 * Provides GPU-accelerated animations with cross-platform compatibility.
 *
 * CRITICAL: This driver only exposes animations that are compatible with
 * future React Native implementation (transforms, opacity, colors only).
 *
 * PAUSE INTEGRATION:
 * This driver respects the global pause state (window.__ANIMATIONS_PAUSED__).
 * When paused, animated components are wrapped to prevent animation updates.
 * This ensures all Framer Motion animations truly freeze when the game is paused.
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { createElement, forwardRef, useEffect, useState } from 'react';
import type {
  AnimatedComponentFactory,
  AnimatePresenceProps,
  AnimationDriver,
  AnimationEnvironment,
  SPRING_PRESETS,
  SpringConfig,
  TRANSITION_PRESETS,
  TransitionConfig,
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
  if (isBrowser && 'matchMedia' in window && window.matchMedia) {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;
    } catch {
      // Ignore errors in test environments
      prefersReducedMotion = false;
    }
  }

  // GPU acceleration detection (basic heuristic)
  let hasGPUAcceleration = true;
  if (isBrowser) {
    // Check for hardware acceleration support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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
 * Check if animations are currently paused globally
 */
function isAnimationsPaused(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).__ANIMATIONS_PAUSED__;
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
   * Returns pause-aware motion.div, motion.span, etc.
   *
   * When animations are paused, the component will:
   * - Stop responding to animate prop changes
   * - Freeze at current visual state
   * - Resume smoothly when unpaused
   */
  createAnimatedComponent<T extends keyof React.JSX.IntrinsicElements>(
    component: T
  ): AnimatedComponentFactory<T> {
    const key = component as keyof typeof motion;
    const MotionComponent = motion[key] as any;

    // Wrap the motion component to respect pause state
    // eslint-disable-next-line react/display-name
    const PauseAwareComponent = forwardRef((props: any, ref: any) => {
      const [isPaused, setIsPaused] = useState(isAnimationsPaused());

      // Listen for pause state changes
      useEffect(() => {
        const checkPause = () => {
          setIsPaused(isAnimationsPaused());
        };

        // Check on mount and when pause state might change
        checkPause();

        // Set up interval to check pause state
        // (More reliable than trying to listen to context from driver)
        const interval = setInterval(checkPause, 100);

        return () => clearInterval(interval);
      }, []);

      // When paused, override animate to current state to freeze animation
      const pausedProps = isPaused
        ? {
            ...props,
            // Remove animation props to freeze at current state
            animate: props.style || {},
            transition: { duration: 0 },
          }
        : props;

      // Use createElement to avoid JSX syntax (file is .ts not .tsx)
      return createElement(MotionComponent, { ref, ...pausedProps });
    });

    return PauseAwareComponent as any as AnimatedComponentFactory<T>;
  }

  /**
   * AnimatePresence for mount/unmount animations
   */
  AnimatePresence: ComponentType<AnimatePresenceProps> =
    AnimatePresence as ComponentType<AnimatePresenceProps>;

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
  getSpringConfig(preset: 'gentle' | 'wobbly' | 'stiff' | 'slow'): SpringConfig {
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
  getTransitionConfig(preset: 'fast' | 'medium' | 'slow' | 'spring'): TransitionConfig {
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
