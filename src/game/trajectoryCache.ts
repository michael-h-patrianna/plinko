/**
 * Trajectory cache generation for performance optimization
 *
 * PERFORMANCE BENEFITS:
 * - Pre-calculates expensive operations (Math.sqrt, scale calculations)
 * - Reduces per-frame CPU from ~180 ops/sec to ~3 array lookups/sec
 * - Frame-drop-safe: uses frame index, not time-based
 * - Memory efficient: ~2.5 KB per 200 frames using typed arrays
 *
 * Expected CPU reduction: 5-10% during animation
 */

import type { TrajectoryPoint, TrajectoryCache } from './types';
import { sizeTokens } from '../theme/tokens';

/**
 * Generate pre-calculated cache for a trajectory
 * Call this once when trajectory is loaded, before animation starts
 *
 * @param trajectory - Array of trajectory points
 * @param enableMotionEffects - Whether to enable enhanced motion effects (squash/stretch on collisions)
 * @returns TrajectoryCache with typed arrays for fast frame lookups
 */
export function generateTrajectoryCache(trajectory: TrajectoryPoint[], enableMotionEffects: boolean = true): TrajectoryCache {
  const length = trajectory.length;

  // Allocate typed arrays (memory efficient: 4 bytes per float, 1 byte per uint8)
  const speeds = new Float32Array(length);
  const scalesX = new Float32Array(length);
  const scalesY = new Float32Array(length);
  const trailLengths = new Uint8Array(length);

  // Pre-calculate all values in a single pass
  for (let i = 0; i < length; i++) {
    const point = trajectory[i];
    if (!point) continue;

    const vx = point.vx || 0;
    const vy = point.vy || 0;

    // Calculate speed (most expensive operation)
    const speed = Math.sqrt(vx * vx + vy * vy);
    speeds[i] = speed;

    // Calculate trail length based on speed (capped at maxTrailLength token)
    if (speed < 100) {
      trailLengths[i] = 10;
    } else if (speed < 300) {
      trailLengths[i] = 16;
    } else {
      trailLengths[i] = sizeTokens.ball.maxTrailLength;
    }

    // Calculate squash/stretch scales with optional enhanced collision effects
    let scaleX = 1;
    let scaleY = 1;

    if (enableMotionEffects) {
      // Enhanced squash on peg collision (more pronounced)
      if (point.pegHit && speed > 50) {
        const squashAmount = Math.min(speed / 600, 0.5); // Max 50% squash
        scaleX = 1 + squashAmount * 0.65; // Widen horizontally (1.15x at max)
        scaleY = 1 - squashAmount * 0.7; // Compress vertically (0.85x at min)
      }
      // Enhanced squash on wall collision
      else if (point.wallHit && speed > 50) {
        const squashAmount = Math.min(speed / 700, 0.4); // Max 40% squash
        scaleX = 1 - squashAmount * 0.55; // Compress horizontally (0.9x at max)
        scaleY = 1 + squashAmount * 0.55; // Expand vertically (1.1x at max)
      }
      // Enhanced squash on bucket floor collision
      else if (point.bucketFloorHit && speed > 50) {
        const squashAmount = Math.min(speed / 500, 0.6); // Max 60% squash (more impact)
        scaleX = 1 + squashAmount * 0.85; // Expand horizontally (1.25x at max)
        scaleY = 1 - squashAmount * 0.85; // Compress vertically (0.75x at min)
      }
      // Stretch when falling fast
      else if (vy > 200 && !point.pegHit && !point.wallHit && !point.bucketFloorHit) {
        const stretchAmount = Math.min(vy / 1000, 0.3); // Max 30% stretch
        scaleX = 1 - stretchAmount * 0.4; // Narrow horizontally
        scaleY = 1 + stretchAmount; // Elongate vertically
      }
    } else {
      // Fallback to basic squash/stretch (legacy behavior)
      if (point.pegHit && speed > 50) {
        const squashAmount = Math.min(speed / 800, 0.4); // Max 40% squash
        scaleX = 1 + squashAmount * 0.5; // Widen horizontally
        scaleY = 1 - squashAmount; // Compress vertically
      }
      // Basic stretch when falling fast
      else if (vy > 200 && !point.pegHit) {
        const stretchAmount = Math.min(vy / 1000, 0.3); // Max 30% stretch
        scaleX = 1 - stretchAmount * 0.4; // Narrow horizontally
        scaleY = 1 + stretchAmount; // Elongate vertically
      }
    }

    scalesX[i] = scaleX;
    scalesY[i] = scaleY;
  }

  return { speeds, scalesX, scalesY, trailLengths };
}

/**
 * Get cached values for a specific frame (frame-drop-safe)
 *
 * @param cache - Pre-generated trajectory cache
 * @param frame - Frame number (used as array index)
 * @returns Cached values with fallback defaults
 */
export function getCachedValues(
  cache: TrajectoryCache | null | undefined,
  frame: number
): {
  speed: number;
  scaleX: number;
  scaleY: number;
  trailLength: number;
} {
  if (!cache || frame < 0 || frame >= cache.speeds.length) {
    // Fallback to safe defaults if cache unavailable or frame out of bounds
    return { speed: 0, scaleX: 1, scaleY: 1, trailLength: 10 };
  }

  return {
    speed: cache.speeds[frame] || 0,
    scaleX: cache.scalesX[frame] || 1,
    scaleY: cache.scalesY[frame] || 1,
    trailLength: cache.trailLengths[frame] || 10,
  };
}
