/**
 * Bucket Physics and Landing Detection
 *
 * Handles bucket zone collision detection, wall bounces, floor bounces,
 * and settlement detection. Determines which slot the ball lands in.
 */

import { PHYSICS, getSlotBoundaries } from '../boardGeometry';
import { calculateBucketZoneY } from '@utils/slotDimensions';
import type { createRng } from '../rng';

type Rng = ReturnType<typeof createRng>;

/**
 * Checks if ball has settled (low velocity and on floor)
 */
function isBallSettled(vx: number, vy: number, y: number, bucketFloorY: number): boolean {
  return (
    Math.abs(vx) < PHYSICS.SETTLEMENT_VELOCITY_THRESHOLD &&
    Math.abs(vy) < PHYSICS.SETTLEMENT_VELOCITY_THRESHOLD &&
    y >= bucketFloorY - PHYSICS.SETTLEMENT_Y_TOLERANCE
  );
}

/**
 * Handles bucket wall collision physics
 * Returns updated position and velocity
 */
function handleBucketWallCollision(
  x: number,
  vx: number,
  slotLeftEdge: number,
  slotRightEdge: number
): { x: number; vx: number; wallHit?: 'left' | 'right' } {
  if (x - PHYSICS.BALL_RADIUS <= slotLeftEdge) {
    return {
      x: slotLeftEdge + PHYSICS.BALL_RADIUS,
      vx: Math.abs(vx) * PHYSICS.RESTITUTION * PHYSICS.BUCKET_WALL_DAMPING,
      wallHit: 'left',
    };
  } else if (x + PHYSICS.BALL_RADIUS >= slotRightEdge) {
    return {
      x: slotRightEdge - PHYSICS.BALL_RADIUS,
      vx: -Math.abs(vx) * PHYSICS.RESTITUTION * PHYSICS.BUCKET_WALL_DAMPING,
      wallHit: 'right',
    };
  }
  return { x, vx };
}

/**
 * Handles bucket floor collision and bouncing physics
 * Returns updated position, velocity, and bounce state
 */
function handleBucketFloorCollision(
  y: number,
  vx: number,
  vy: number,
  bucketFloorY: number,
  rng: Rng
): { y: number; vx: number; vy: number; floorHit: boolean } {
  if (y < bucketFloorY) {
    return { y, vx, vy, floorHit: false };
  }

  const newY = bucketFloorY;
  let newVx = vx;
  let newVy = vy;
  let floorHit = false;

  if (vy > 0) {
    newVy = -vy * PHYSICS.RESTITUTION * PHYSICS.BUCKET_FLOOR_DAMPING;
    floorHit = true;

    // Add small random horizontal movement on bounce
    newVx += (rng.next() - 0.5) * PHYSICS.FLOOR_BOUNCE_RANDOMNESS;

    // Stop bouncing if velocity is too small
    if (Math.abs(newVy) < PHYSICS.MIN_FLOOR_BOUNCE_VELOCITY) {
      newVy = 0;
      newVx *= PHYSICS.FLOOR_FRICTION;
    }
  }

  return { y: newY, vx: newVx, vy: newVy, floorHit };
}

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
    const xRelative = x - PHYSICS.BORDER_WIDTH;
    const currentSlot = Math.floor(xRelative / slotWidth);
    const { leftEdge: slotLeftEdge, rightEdge: slotRightEdge } = getSlotBoundaries(
      currentSlot,
      boardWidth,
      slotCount,
      PHYSICS.SLOT_WALL_THICKNESS
    );

    // Handle bucket wall collisions
    const wallResult = handleBucketWallCollision(x, vx, slotLeftEdge, slotRightEdge);
    x = wallResult.x;
    vx = wallResult.vx;
    bucketWallHit = wallResult.wallHit;

    // Handle bucket floor collision with bouncing
    const floorResult = handleBucketFloorCollision(y, vx, vy, bucketFloorY, rng);
    y = floorResult.y;
    vx = floorResult.vx;
    vy = floorResult.vy;
    bucketFloorHit = floorResult.floorHit;

    // Check if ball has settled
    settled = isBallSettled(vx, vy, y, bucketFloorY);
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
  const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS + PHYSICS.BUCKET_FLOOR_OFFSET;
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
  return y >= bucketZoneY - PHYSICS.BUCKET_ZONE_TOLERANCE;
}
