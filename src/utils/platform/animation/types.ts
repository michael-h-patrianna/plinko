/**
 * Animation Platform Adapter Types
 *
 * Provides requestAnimationFrame abstraction for smooth animations
 * across web and React Native platforms
 */

export type AnimationCallback = (timestamp: number) => void;
export type AnimationFrameId = number;

export interface AnimationAdapter {
  /**
   * Requests an animation frame callback
   * The callback will be invoked before the next repaint
   *
   * @param callback - Function to call on next frame with timestamp
   * @returns Frame ID that can be used to cancel the request
   */
  requestFrame(callback: AnimationCallback): AnimationFrameId;

  /**
   * Cancels a pending animation frame request
   *
   * @param frameId - The ID returned from requestFrame
   */
  cancelFrame(frameId: AnimationFrameId): void;

  /**
   * Gets the current high-resolution timestamp
   * Useful for calculating animation deltas
   *
   * @returns Current timestamp in milliseconds
   */
  now(): number;
}
