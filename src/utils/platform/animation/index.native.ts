/**
 * Animation Platform Adapter - React Native Implementation
 *
 * Uses React Native's requestAnimationFrame polyfill
 *
 * NOTE: React Native provides requestAnimationFrame globally, but for better
 * performance and advanced animations, consider using:
 * - react-native-reanimated (GPU-accelerated, declarative)
 * - Moti (built on Reanimated, simpler API)
 *
 * This is a placeholder implementation. In a real React Native app:
 * 1. The global requestAnimationFrame works out of the box
 * 2. For production, refactor to use Moti or Reanimated for better performance
 */

import { throwNativeNotImplemented } from '../detect';
import type { AnimationAdapter, AnimationCallback, AnimationFrameId } from './types';

class NativeAnimationAdapter implements AnimationAdapter {
  requestFrame(_callback: AnimationCallback): AnimationFrameId {
    throwNativeNotImplemented('Animation.requestFrame');
  }

  cancelFrame(_frameId: AnimationFrameId): void {
    throwNativeNotImplemented('Animation.cancelFrame');
  }

  now(): number {
    return Date.now();
  }
}

export const animationAdapter: AnimationAdapter = new NativeAnimationAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * Basic Implementation (using global requestAnimationFrame):
 * ----------------------------------------------------------
 * import type { AnimationAdapter, AnimationCallback, AnimationFrameId } from './types';
 *
 * class NativeAnimationAdapter implements AnimationAdapter {
 *   requestFrame(callback: AnimationCallback): AnimationFrameId {
 *     // React Native provides global requestAnimationFrame
 *     return requestAnimationFrame(callback);
 *   }
 *
 *   cancelFrame(frameId: AnimationFrameId): void {
 *     cancelAnimationFrame(frameId);
 *   }
 *
 *   now(): number {
 *     // React Native has performance.now() polyfilled
 *     return performance.now();
 *   }
 * }
 *
 * export const animationAdapter: AnimationAdapter = new NativeAnimationAdapter();
 *
 *
 * RECOMMENDED: Refactor to Moti/Reanimated for Production
 * -------------------------------------------------------
 * The ball animation in usePlinkoGame.ts uses requestAnimationFrame in a loop.
 * For React Native, this should be refactored to use Moti or Reanimated:
 *
 * Example with Moti:
 * import { MotiView } from 'moti';
 *
 * // Instead of RAF loop updating state, use:
 * <MotiView
 *   animate={{
 *     translateX: ballPosition.x,
 *     translateY: ballPosition.y,
 *   }}
 *   transition={{
 *     type: 'timing',
 *     duration: 16, // 60 FPS
 *   }}
 * />
 *
 * This runs on the UI thread (GPU-accelerated) instead of JS thread,
 * resulting in buttery smooth 60 FPS animations even on low-end devices.
 */
