/**
 * Collision Detection Utilities
 *
 * Provides efficient collision detection for pegs, slots, and bucket impacts.
 * Designed to run once per frame in the animation driver, not per component.
 *
 * PERFORMANCE STRATEGY:
 * - Pre-computed data structures for O(1) lookups
 * - Map<frame, pegId> for peg hits
 * - Slot boundaries calculated once, reused for all frames
 * - Trajectory points already contain bucket collision data
 *
 * DETERMINISM:
 * - All collision data comes from pre-computed trajectory
 * - No runtime calculations that could vary between runs
 * - Frame-indexed lookups guarantee consistent results
 */

import type { TrajectoryPoint } from './types';

/**
 * Slot boundary data for collision detection
 */
export interface SlotBoundary {
  index: number;
  leftEdge: number;
  rightEdge: number;
  centerX: number;
}

/**
 * Result of peg collision check for a specific frame
 */
export interface PegCollisionResult {
  /** Peg IDs that were hit this frame (format: "row-col") */
  hitPegIds: string[];
}

/**
 * Result of slot collision check for a specific frame
 */
export interface SlotCollisionResult {
  /** Index of the slot containing the ball, or null if not in any slot */
  activeSlot: number | null;
  /** Whether the ball just entered this slot (state change) */
  justEntered: boolean;
}

/**
 * Result of bucket impact check for a specific frame
 */
export interface BucketImpactResult {
  /** Which wall was hit, if any */
  wallHit: 'left' | 'right' | null;
  /** Whether the floor was hit */
  floorHit: boolean;
}

/**
 * Pre-computed collision data passed to the driver
 */
export interface CollisionData {
  /** Map from frame number to array of peg IDs hit that frame */
  pegHitsByFrame: Map<number, string[]>;
  /** Slot boundaries for spatial queries */
  slotBoundaries: SlotBoundary[];
  /** Y coordinate where bucket zone starts */
  bucketZoneY: number;
}

/**
 * Build collision data from trajectory and slot configuration
 * Call this once when trajectory is loaded, before animation starts
 *
 * @param trajectory - Complete trajectory with collision data
 * @param slotBoundaries - Pre-calculated slot boundaries
 * @param bucketZoneY - Y coordinate where bucket zone starts
 * @returns CollisionData ready for driver consumption
 */
export function buildCollisionData(
  trajectory: TrajectoryPoint[],
  slotBoundaries: SlotBoundary[],
  bucketZoneY: number
): CollisionData {
  const pegHitsByFrame = new Map<number, string[]>();

  // Build frame -> peg hits map
  trajectory.forEach((point) => {
    if (point.pegsHit && point.pegsHit.length > 0) {
      const pegIds = point.pegsHit.map((peg) => `${peg.row}-${peg.col}`);
      pegHitsByFrame.set(point.frame, pegIds);
    }
  });

  return {
    pegHitsByFrame,
    slotBoundaries,
    bucketZoneY,
  };
}

/**
 * Check which pegs were hit at a specific frame
 * O(1) map lookup
 *
 * @param frame - Current frame number
 * @param collisionData - Pre-computed collision data
 * @returns Array of peg IDs hit this frame
 */
export function getPegHitsAtFrame(
  frame: number,
  collisionData: CollisionData
): PegCollisionResult {
  const hitPegIds = collisionData.pegHitsByFrame.get(frame) || [];
  return { hitPegIds };
}

/**
 * Check which slot contains the ball
 * Uses spatial query against pre-computed boundaries
 *
 * @param ballX - Ball X position
 * @param ballY - Ball Y position
 * @param collisionData - Pre-computed collision data
 * @param previousSlot - Previously active slot (for change detection)
 * @returns Slot index and whether ball just entered
 */
export function getActiveSlot(
  ballX: number,
  ballY: number,
  collisionData: CollisionData,
  previousSlot: number | null
): SlotCollisionResult {
  // Only check slot collision if ball is in bucket zone
  if (ballY < collisionData.bucketZoneY) {
    const result: SlotCollisionResult = {
      activeSlot: null,
      justEntered: previousSlot !== null,
    };
    return result;
  }

  // Find which slot contains the ball
  for (const slot of collisionData.slotBoundaries) {
    if (ballX >= slot.leftEdge && ballX <= slot.rightEdge) {
      const result: SlotCollisionResult = {
        activeSlot: slot.index,
        justEntered: previousSlot !== slot.index,
      };
      return result;
    }
  }

  // Ball not in any slot (shouldn't happen, but handle gracefully)
  const result: SlotCollisionResult = {
    activeSlot: null,
    justEntered: previousSlot !== null,
  };
  return result;
}

/**
 * Extract bucket impact data from trajectory point
 * Data is already pre-computed in trajectory, just extract it
 *
 * @param trajectoryPoint - Current trajectory point with collision data
 * @returns Bucket impact information
 */
export function getBucketImpacts(
  trajectoryPoint: TrajectoryPoint | null
): BucketImpactResult {
  if (!trajectoryPoint) {
    return { wallHit: null, floorHit: false };
  }

  return {
    wallHit: trajectoryPoint.bucketWallHit || null,
    floorHit: trajectoryPoint.bucketFloorHit || false,
  };
}

/**
 * Create slot boundaries from slot positions
 * Call this once during setup, not per frame
 *
 * @param slots - Array of slot data with x, width, and index
 * @returns Array of slot boundaries for spatial queries
 */
export function createSlotBoundaries(
  slots: Array<{ index: number; x: number; width: number }>
): SlotBoundary[] {
  return slots.map((slot) => ({
    index: slot.index,
    leftEdge: slot.x,
    rightEdge: slot.x + slot.width,
    centerX: slot.x + slot.width / 2,
  }));
}
