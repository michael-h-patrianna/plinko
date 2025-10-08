/**
 * Animation Driver Type Definitions
 *
 * Cross-platform animation abstraction layer for web (Framer Motion) and
 * future React Native (Moti/Reanimated) implementations.
 *
 * CRITICAL CROSS-PLATFORM CONSTRAINTS:
 * - Only GPU-accelerated transforms: translateX, translateY, scale, rotate
 * - Opacity animations only
 * - Linear gradients only (no radial/conic)
 * - Color transitions
 * - NO blur, filters, shadows, or pseudo-elements
 */

/**
 * Cross-platform animation configuration
 * Supports only animations that work on both web and React Native
 */
export interface AnimationConfig {
  /** Translate X in pixels or percentage */
  x?: number | string | number[] | string[];
  /** Translate Y in pixels or percentage */
  y?: number | string | number[] | string[];
  /** Scale transformation (1 = 100%) */
  scale?: number | number[];
  /** Scale X transformation (1 = 100%) */
  scaleX?: number | number[];
  /** Scale Y transformation (1 = 100%) */
  scaleY?: number | number[];
  /** Rotation in degrees */
  rotate?: number | string | number[] | string[];
  /** Opacity (0-1) */
  opacity?: number | number[];
  /** Background color (hex, rgb, rgba) */
  backgroundColor?: string | string[];
  /** Text color (hex, rgb, rgba) */
  color?: string | string[];
  /** Transition configuration for this animation */
  transition?: TransitionConfig;
  /** Array of values for keyframe animations and other properties */
  [key: string]: number | string | number[] | string[] | TransitionConfig | undefined;
}

/**
 * Spring physics configuration
 * Based on Framer Motion spring config, compatible with Reanimated
 */
export interface SpringConfig {
  /** Stiffness of the spring (default: 100) */
  stiffness?: number;
  /** Damping of the spring (default: 10) */
  damping?: number;
  /** Mass of the spring (default: 1) */
  mass?: number;
  /** Initial velocity (default: 0) */
  velocity?: number;
  /** Rest velocity threshold (default: 0.01) */
  restSpeed?: number;
  /** Rest displacement threshold (default: 0.01) */
  restDelta?: number;
}

/**
 * Transition timing configuration
 * Cross-platform timing options
 */
export interface TransitionConfig {
  /** Duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Easing function or cubic bezier array */
  ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | number[] | string;
  /** Repeat count (Infinity for infinite) */
  repeat?: number;
  /** Repeat type */
  repeatType?: 'loop' | 'reverse' | 'mirror';
  /** Repeat delay in seconds */
  repeatDelay?: number;
  /** Spring configuration (overrides duration/ease) */
  type?: 'spring' | 'tween' | 'inertia';
  /** Spring-specific config */
  spring?: SpringConfig;
  /** Stiffness of the spring (can be specified at top level) */
  stiffness?: number;
  /** Damping of the spring (can be specified at top level) */
  damping?: number;
  /** Mass of the spring (can be specified at top level) */
  mass?: number;
  /** Keyframe timing array */
  times?: number[];
  /** Per-property transition overrides and other transition properties */
  [key: string]: number | number[] | string | SpringConfig | TransitionConfig | undefined;
}

/**
 * Variant configuration for predefined animation states
 */
export interface VariantConfig {
  [key: string]: AnimationConfig;
}

/**
 * Animation orchestration configuration
 * For coordinating child animations
 */
export interface OrchestrationConfig {
  /** Delay between child animations */
  staggerChildren?: number;
  /** Delay before children animate */
  delayChildren?: number;
  /** Stagger direction */
  staggerDirection?: 1 | -1;
}

/**
 * Animation driver interface
 * Platform-agnostic animation primitives
 */
export interface AnimationDriver {
  /** Driver name for debugging */
  readonly name: 'framer' | 'moti';

  /** Platform this driver runs on */
  readonly platform: 'web' | 'native';

  /**
   * Create animated component wrapper
   * Web: motion.div, motion.span, etc.
   * React Native: MotiView, MotiText, etc.
   *
   * NOTE: Returns platform-specific animated component (Framer Motion or Moti)
   * Type is intentionally 'any' to preserve full platform API compatibility
   */
  createAnimatedComponent<T extends keyof React.JSX.IntrinsicElements>(
    component: T
  ): any;

  /**
   * Animate presence (mount/unmount animations)
   * Web: AnimatePresence
   * React Native: AnimatePresence from moti
   */
  AnimatePresence: React.ComponentType<{
    children: React.ReactNode;
    mode?: 'wait' | 'sync' | 'popLayout';
  }>;

  /**
   * Check if animations are supported in current environment
   * Returns false for SSR, headless browsers, or reduced motion preference
   */
  isSupported(): boolean;

  /**
   * Get optimized spring configuration for smooth animations
   * Ensures 60 FPS performance
   */
  getSpringConfig(preset: 'gentle' | 'wobbly' | 'stiff' | 'slow'): SpringConfig;

  /**
   * Get optimized transition configuration
   * Ensures GPU acceleration and smooth performance
   */
  getTransitionConfig(
    preset: 'fast' | 'medium' | 'slow' | 'spring'
  ): TransitionConfig;
}

/**
 * Animation driver selection strategy
 */
export type AnimationDriverType = 'framer' | 'moti' | 'auto';

/**
 * Environment detection result
 */
export interface AnimationEnvironment {
  /** Whether we're in a browser */
  isBrowser: boolean;
  /** Whether we're in React Native */
  isNative: boolean;
  /** Whether we're in SSR */
  isSSR: boolean;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  /** Whether GPU acceleration is available */
  hasGPUAcceleration: boolean;
}

/**
 * Spring preset configurations
 * Optimized for 60 FPS performance
 */
export const SPRING_PRESETS: Record<
  'gentle' | 'wobbly' | 'stiff' | 'slow',
  SpringConfig
> = {
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

/**
 * Transition preset configurations
 * Optimized for GPU acceleration
 */
export const TRANSITION_PRESETS: Record<
  'fast' | 'medium' | 'slow' | 'spring',
  TransitionConfig
> = {
  fast: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth deceleration
  },
  medium: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1], // smooth ease-out
  },
  slow: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  },
  spring: {
    type: 'spring',
    spring: SPRING_PRESETS.gentle,
  },
};
