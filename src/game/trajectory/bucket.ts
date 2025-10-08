/**
 * Bucket Physics and Landing Detection
 *
 * Handles bucket zone collision detection, wall bounces, floor bounces,
 * and settlement detection. Determines which slot the ball lands in.
 */

import { PHYSICS, getSlotBoundaries } from '../boardGeometry';
import { calculateBucketZoneY } from '../../utils/slotDimensions';
import type { createRng } from '../rng';

type Rng = ReturnType<typeof createRng>;

export interface BucketState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface BucketResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bucketWallHit?: 'left' | 'right';
  bucketFloorHit?: boolean;
  settled: boolean;
}

interface BucketParams {
  state: BucketState;
  boardWidth: number;
  boardHeight: number;
  slotCount: number;
  slotWidth: number;
  bucketZoneY: number;
  bucketFloorY: number;
  rng: Rng;
}

/**
 * Handles bucket physics including wall and floor collisions
 * Returns updated state and collision information
 */
export function handleBucketPhysics(params: BucketParams): BucketResult {
  const { state, boardWidth, slotCount, slotWidth, bucketZoneY, bucketFloorY, rng } = params;
  // boardWidth used for getSlotBoundaries call
  let { x, y, vx, vy } = state;
  let bucketWallHit: 'left' | 'right' | undefined = undefined;
  let bucketFloorHit = false;
  let settled = false;

  if (y >= bucketZoneY) {
    // In bucket zone - check for bucket wall collisions
    // Adjust x position relative to playable area
    const xRelative = x - PHYSICS.BORDER_WIDTH;
    const currentSlot = Math.floor(xRelative / slotWidth);
    const { leftEdge: slotLeftEdge, rightEdge: slotRightEdge } = getSlotBoundaries(
      currentSlot,
      boardWidth,
      slotCount,
      3
    );

    // Bucket wall collisions with proper physics
    if (x - PHYSICS.BALL_RADIUS <= slotLeftEdge) {
      x = slotLeftEdge + PHYSICS.BALL_RADIUS;
      vx = Math.abs(vx) * PHYSICS.RESTITUTION * 0.6; // Dampen in bucket
      bucketWallHit = 'left';
    } else if (x + PHYSICS.BALL_RADIUS >= slotRightEdge) {
      x = slotRightEdge - PHYSICS.BALL_RADIUS;
      vx = -Math.abs(vx) * PHYSICS.RESTITUTION * 0.6;
      bucketWallHit = 'right';
    }

    // Bucket floor collision with bouncing
    if (y >= bucketFloorY) {
      y = bucketFloorY;
      if (vy > 0) {
        vy = -vy * PHYSICS.RESTITUTION * 0.5; // Bounce off floor with damping
        bucketFloorHit = true;

        // Add small random horizontal movement on bounce
        vx += (rng.next() - 0.5) * 20;

        // Stop bouncing if velocity is too small
        if (Math.abs(vy) < 30) {
          vy = 0;
          vx *= 0.9; // Friction on floor
        }
      }

      // Check if ball has settled
      if (Math.abs(vx) < 5 && Math.abs(vy) < 5 && y >= bucketFloorY - 1) {
        settled = true;
      }
    }
  }

  return {
    x,
    y,
    vx,
    vy,
    bucketWallHit,
    bucketFloorHit: bucketFloorHit || undefined,
    settled,
  };
}

/**
 * Calculates bucket zone and floor Y positions
 */
export function calculateBucketDimensions(
  boardHeight: number,
  slotWidth: number
): { bucketZoneY: number; bucketFloorY: number } {
  const bucketZoneY = calculateBucketZoneY(boardHeight, slotWidth);
  const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS + 5; // +10px to match visual slot overflow, -5 original offset
  return { bucketZoneY, bucketFloorY };
}

/**
 * Determines which slot the ball landed in based on final X position
 */
export function determineLandedSlot(
  x: number,
  slotCount: number,
  slotWidth: number
): number {
  // Adjust x position relative to playable area
  const xRelative = x - PHYSICS.BORDER_WIDTH;
  const landedSlot = Math.min(Math.max(0, Math.floor(xRelative / slotWidth)), slotCount - 1);
  return landedSlot;
}

/**
 * Checks if ball reached bucket zone (not stuck above it)
 */
export function isInBucketZone(y: number, bucketZoneY: number): boolean {
  return y >= bucketZoneY - 10;
}
