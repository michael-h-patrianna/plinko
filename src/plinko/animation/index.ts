/**
 * Ball Animation Driver - Public API
 *
 * Cross-platform animation system for ball movement that bypasses React reconciliation.
 * Provides 40-60% CPU reduction on web by using direct DOM manipulation.
 *
 * @see docs/optimize.md for implementation details and performance benefits
 */

// Core driver interface and types
export type {
  BallAnimationDriver,
  BallTransform,
  TrailFrame,
} from './ballAnimationDriver';

// Web implementation
export { WebBallAnimationDriver, createWebBallAnimationDriver, type WebBallRefs } from './ballAnimationDriver.web';

// Hook for platform-agnostic usage
export { useBallAnimationDriver } from './useBallAnimationDriver';
