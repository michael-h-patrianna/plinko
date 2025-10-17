/**
 * Animation Platform Adapter - Web Implementation
 *
 * Uses requestAnimationFrame and performance.now() for smooth 60 FPS animations
 */

import type { AnimationAdapter, AnimationCallback, AnimationFrameId } from './types';

class WebAnimationAdapter implements AnimationAdapter {
  requestFrame(callback: AnimationCallback): AnimationFrameId {
    return requestAnimationFrame(callback);
  }

  cancelFrame(frameId: AnimationFrameId): void {
    cancelAnimationFrame(frameId);
  }

  now(): number {
    return performance.now();
  }
}

export const animationAdapter: AnimationAdapter = new WebAnimationAdapter();
