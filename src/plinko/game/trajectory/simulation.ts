/**
 * Physics Simulation Loop
 *
 * Main physics simulation that integrates collision detection, bucket physics,
 * and all other physics effects. Runs the deterministic simulation frame by frame.
 */

import { PHYSICS, type Peg } from '../boardGeometry';
import { createRng } from '../rng';
import type { TrajectoryPoint } from '../types';
import { detectAndHandlePegCollisions, preventPegOverlaps } from './collision';
import {
  handleBucketPhysics,
  calculateBucketDimensions,
  determineLandedSlot,
  isInBucketZone,
} from './bucket';

export interface SimulationParams {
  startX: number;
  startVx: number;
  bounceRandomness: number;
}

export interface SimulationResult {
  trajectory: TrajectoryPoint[];
  landedSlot: number;
}

interface SimulationConfig {
  params: SimulationParams;
  boardWidth: number;
  boardHeight: number;
  pegs: Peg[];
  slotCount: number;
  rngSeed: number;
}

/**
 * Run a deterministic physics simulation with given parameters
 * Returns the trajectory and which slot it landed in
 */
export function runSimulation(config: SimulationConfig): SimulationResult {
  const { params, boardWidth, boardHeight, pegs, slotCount, rngSeed } = config;
  const trajectory: TrajectoryPoint[] = [];
  const rng = createRng(rngSeed);

  // Initialize state
  let x = params.startX;
  let y = PHYSICS.BORDER_WIDTH + 10;
  let vx = params.startVx;
  let vy = 0;
  let rotation = 0;
  let frame = 0;

  // Calculate bucket dimensions based on slot width
  const playableWidth = boardWidth - PHYSICS.BORDER_WIDTH * 2;
  const slotWidth = playableWidth / slotCount;
  const { bucketZoneY, bucketFloorY } = calculateBucketDimensions(boardHeight, slotWidth);

  // Track recent collisions to prevent double-hits
  const recentCollisions = new Map<string, number>();

  // Track stuck ball detection
  let stuckFrames = 0;
  let lastY = y;

  // Add initial rest frames
  for (let i = 0; i < 15; i++) {
    trajectory.push({
      frame: frame++,
      x,
      y,
      vx: 0,
      vy: 0,
      rotation: 0,
      pegHit: false,
    });
  }

  // Main physics loop with proper collision detection
  // Continue until ball settles in bucket
  let settled = false;
  while (!settled && frame < 800) {
    // Apply gravity
    vy += PHYSICS.GRAVITY * PHYSICS.DT;

    // Terminal velocity (limit downward velocity)
    vy = Math.min(vy, PHYSICS.TERMINAL_VELOCITY);

    // Enforce realistic velocity limits only after collisions (not during free fall)
    // During free fall, terminal velocity is enough
    // Only cap total speed if it's unrealistically high (e.g., from collision bugs)
    const currentSpeed = Math.sqrt(vx * vx + vy * vy);
    if (currentSpeed > PHYSICS.MAX_SPEED) {
      const scale = PHYSICS.MAX_SPEED / currentSpeed;
      vx *= scale;
      vy *= scale;
    }

    // Air resistance
    vx *= 0.998;

    // Store position at start of frame for distance limiting
    const frameStartX = x;
    const frameStartY = y;

    // Store current position and velocity for collision detection
    const oldX = x;
    const oldY = y;
    const oldVx = vx;
    const oldVy = vy;

    // Move the ball
    x += vx * PHYSICS.DT;
    y += vy * PHYSICS.DT;

    // Check collisions with all pegs
    const collisionResult = detectAndHandlePegCollisions({
      state: { x, y, vx, vy },
      oldState: { x: oldX, y: oldY, vx: oldVx, vy: oldVy },
      pegs,
      recentCollisions,
      frame,
      bounceRandomness: params.bounceRandomness,
      rng,
    });

    x = collisionResult.x;
    y = collisionResult.y;
    vx = collisionResult.vx;
    vy = collisionResult.vy;
    const hitPeg = collisionResult.hitPeg;
    const pegsHitThisFrame = collisionResult.pegsHit;

    // Wall collision detection with strict bounds enforcement
    let wallHit: 'left' | 'right' | undefined = undefined;
    const minX = PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS;
    const maxX = boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS;

    if (x < minX) {
      x = minX;
      vx = Math.abs(vx) * PHYSICS.RESTITUTION;
      wallHit = 'left';
    } else if (x > maxX) {
      x = maxX;
      vx = -Math.abs(vx) * PHYSICS.RESTITUTION;
      wallHit = 'right';
    }

    // Additional safety: hard clamp to ensure ball never escapes board
    x = Math.max(minX, Math.min(maxX, x));

    // Also clamp Y to board bounds (allow 10px extra at bottom for slot overflow)
    const minY = PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS;
    const maxY = boardHeight - PHYSICS.BALL_RADIUS + 10;
    y = Math.max(minY, Math.min(maxY, y));

    // Bucket physics (enhanced)
    const bucketResult = handleBucketPhysics({
      state: { x, y, vx, vy },
      boardWidth,
      boardHeight,
      slotCount,
      slotWidth,
      bucketZoneY,
      bucketFloorY,
      rng,
    });

    x = bucketResult.x;
    y = bucketResult.y;
    vx = bucketResult.vx;
    vy = bucketResult.vy;
    settled = bucketResult.settled;
    const bucketWallHit = bucketResult.bucketWallHit;
    const bucketFloorHit = bucketResult.bucketFloorHit;

    // Final safety check: ensure no overlaps before adding frame
    const safePosition = preventPegOverlaps(x, y, pegs);
    x = safePosition.x;
    y = safePosition.y;

    // Update rotation based on horizontal velocity
    rotation += (vx / PHYSICS.BALL_RADIUS) * PHYSICS.DT * 60;

    // Final velocity cap after ALL physics (collisions, walls, buckets, etc.)
    const totalSpeed = Math.sqrt(vx * vx + vy * vy);
    if (totalSpeed > PHYSICS.MAX_SPEED) {
      const scale = PHYSICS.MAX_SPEED / totalSpeed;
      vx *= scale;
      vy *= scale;
    }

    // Cap the actual distance moved per frame EXCEPT when a collision occurred
    // Collision resolution may need to move the ball further to ensure separation
    if (!hitPeg) {
      const actualDx = x - frameStartX;
      const actualDy = y - frameStartY;
      const actualDist = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
      if (actualDist > PHYSICS.MAX_DIST_PER_FRAME) {
        const scale = PHYSICS.MAX_DIST_PER_FRAME / actualDist;
        x = frameStartX + actualDx * scale;
        y = frameStartY + actualDy * scale;
      }
    }

    // Detect stuck ball (not in bucket zone and not making vertical progress)
    if (y < bucketZoneY) {
      if (Math.abs(y - lastY) < 0.5) {
        stuckFrames++;
        // If stuck for too long, this is an invalid trajectory
        // (will be detected later and cause retry with different parameters)
        if (stuckFrames > 60) {
          // Mark as invalid by breaking early
          break;
        }
      } else {
        stuckFrames = 0;
      }
      lastY = y;
    }

    // Add frame
    trajectory.push({
      frame: frame++,
      x,
      y,
      vx,
      vy,
      rotation,
      pegHit: hitPeg !== null,
      pegHitRow: hitPeg?.row,
      pegHitCol: hitPeg?.col,
      pegsHit: pegsHitThisFrame.length > 0 ? pegsHitThisFrame : undefined,
      wallHit,
      bucketWallHit,
      bucketFloorHit,
    });
  }

  // Validate that ball reached bucket zone (not stuck above it)
  if (!isInBucketZone(y, bucketZoneY)) {
    // Ball got stuck before reaching bucket - this is an invalid trajectory
    // Return invalid slot to trigger retry
    return { trajectory, landedSlot: -1 };
  }

  // Determine which slot the ball landed in
  const landedSlot = determineLandedSlot(x, slotCount, slotWidth);

  return { trajectory, landedSlot };
}
