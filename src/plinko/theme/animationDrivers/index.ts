/**
 * Animation Driver Abstraction Layer
 *
 * Cross-platform animation system for web (Framer Motion) and
 * future React Native (Moti/Reanimated) support.
 *
 * Public API exports for animation drivers.
 */

// Core hooks
export { useAnimationDriver, getAnimationDriver } from './useAnimationDriver';
export { useAnimation } from './useAnimation';

// Driver instances (for direct access)
export { framerDriver, motiDriver } from './useAnimationDriver';

// Types
export type {
  AnimationDriver,
  AnimationDriverType,
  AnimationConfig,
  SpringConfig,
  TransitionConfig,
  VariantConfig,
  OrchestrationConfig,
  AnimationEnvironment,
} from './types';

// Preset configurations
export { SPRING_PRESETS, TRANSITION_PRESETS } from './types';

// Driver implementations (for testing)
export { FramerMotionDriver } from './framer';
export { MotiDriver } from './moti';
