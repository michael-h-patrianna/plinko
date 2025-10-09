/**
 * Deterministic Trajectory Generation for Plinko
 *
 * This implementation:
 * 1. Uses deterministic physics simulation (same inputs = same output)
 * 2. Tries different initial conditions until finding a trajectory that lands in target slot
 * 3. Returns that predetermined trajectory for replay
 *
 * The ball movement is completely realistic - no guidance forces or manipulation.
 * We simply find the right starting conditions that naturally lead to the desired outcome.
 */

import { calculateBucketZoneY } from '../utils/slotDimensions';
import { createRng } from './rng';
import type { DeterministicTrajectoryPayload, DropZone, TrajectoryPoint } from './types';
import {
  PHYSICS,
  getDropZoneRange,
  clampSlotIndexFromX,
  getSlotBoundaries,
  generatePegLayout,
  type Peg,
} from './boardGeometry';

interface SimulationParams {
  startX: number;
  startVx: number;
  bounceRandomness: number;
}

export type PrecomputedTrajectoryInput = DeterministicTrajectoryPayload;

/**
 * Cap velocity to prevent unrealistic speeds
 * @param vx Horizontal velocity
 * @param vy Vertical velocity
 * @returns Capped velocity components
 */
function capVelocity(vx: number, vy: number): { vx: number; vy: number } {
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > PHYSICS.MAX_SPEED) {
    const scale = PHYSICS.MAX_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }
  return { vx, vy };
}


export interface GenerateTrajectoryParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  seed?: number;
  dropZone?: DropZone;
  /** Explicit landing slot requested by upstream system. */
  targetSlot?: number;
  /** Precomputed deterministic path supplied by provider/server. */
  precomputedTrajectory?: PrecomputedTrajectoryInput;
  /** Override for maximum deterministic search attempts. */
  maxAttempts?: number;
}

export interface GenerateTrajectoryResult {
  trajectory: TrajectoryPoint[];
  landedSlot: number;
  /** Indicates whether the resulting slot matched the requested target slot. */
  matchedTarget: boolean;
  /** Count of simulation attempts performed (0 for precomputed trajectories). */
  attempts: number;
  /** Histogram of landed slots observed during search, useful for debugging target mismatches. */
  slotHistogram: Record<number, number>;
  /** Optional metadata for callers to inspect when targets are not satisfied. */
  failure?: {
    reason: 'invalid-precomputed-path' | 'max-attempts-exceeded' | 'target-out-of-range';
    targetSlot?: number;
  };
  source: 'precomputed' | 'simulated';
}


function computeLandingSlotFromTrajectory(
  trajectory: TrajectoryPoint[],
  boardWidth: number,
  slotCount: number
): number {
  if (trajectory.length === 0) {
    return -1;
  }
  const finalPoint = trajectory[trajectory.length - 1]!;
  return clampSlotIndexFromX(finalPoint.x, boardWidth, slotCount);
}

/**
 * Run a deterministic physics simulation with given parameters
 * Returns the trajectory and which slot it landed in
 */
function runSimulation(
  params: SimulationParams,
  boardWidth: number,
  boardHeight: number,
  pegs: Peg[],
  slotCount: number,
  rngSeed: number
): { trajectory: TrajectoryPoint[]; landedSlot: number } {
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
  const bucketZoneY = calculateBucketZoneY(boardHeight, slotWidth);
  const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS + 5; // +10px to match visual slot overflow, -5 original offset

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

    // Enforce realistic velocity limits
    ({ vx, vy } = capVelocity(vx, vy));

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
    let hitPeg: Peg | null = null;
    const pegsHitThisFrame: Array<{ row: number; col: number }> = [];

    for (const peg of pegs) {
      // Calculate distance to peg at NEW position
      const dx = x - peg.x;
      const dy = y - peg.y;
      const distSq = dx * dx + dy * dy;

      // Check if we're colliding
      if (distSq < PHYSICS.COLLISION_RADIUS * PHYSICS.COLLISION_RADIUS) {
        // const dist = Math.sqrt(distSq); // Unused - keeping for potential future use

        // Skip if we recently hit this peg
        const pegKey = `${peg.row}-${peg.col}`;
        if (recentCollisions.has(pegKey)) {
          const lastHit = recentCollisions.get(pegKey)!;
          if (frame - lastHit < 10) continue;
        }

        // We have a collision!
        // Step 1: Move ball back to old position
        x = oldX;
        y = oldY;

        // Step 2: Find exact collision point using binary search
        let low = 0;
        let high = 1;
        let mid = 0.5;

        for (let i = 0; i < 10; i++) {
          // 10 iterations for precision
          const testX = oldX + oldVx * PHYSICS.DT * mid;
          const testY = oldY + oldVy * PHYSICS.DT * mid;
          const testDx = testX - peg.x;
          const testDy = testY - peg.y;
          const testDist = Math.sqrt(testDx * testDx + testDy * testDy);

          if (testDist < PHYSICS.COLLISION_RADIUS) {
            high = mid;
          } else {
            low = mid;
          }
          mid = (low + high) / 2;
        }

        // Move to exact collision point
        x = oldX + oldVx * PHYSICS.DT * low;
        y = oldY + oldVy * PHYSICS.DT * low;

        // Calculate collision normal at collision point
        const colDx = x - peg.x;
        const colDy = y - peg.y;
        const colDist = Math.sqrt(colDx * colDx + colDy * colDy);

        if (colDist < 0.1) {
          // Edge case: exactly on peg center
          x = peg.x + PHYSICS.COLLISION_RADIUS + 0.1;
          y = peg.y;
          vx = Math.abs(vx) * PHYSICS.RESTITUTION;
          vy = 0;
        } else {
          // Normal collision
          const nx = colDx / colDist;
          const ny = colDy / colDist;

          // Position ball exactly at collision boundary with small separation
          x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.1);
          y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.1);

          // Calculate relative velocity
          const dot = vx * nx + vy * ny;

          // Reflect velocity
          vx = vx - 2 * dot * nx;
          vy = vy - 2 * dot * ny;

          // Apply restitution
          vx *= PHYSICS.RESTITUTION;
          vy *= PHYSICS.RESTITUTION;

          // Add controlled randomness
          const randomAngle = (rng.next() - 0.5) * params.bounceRandomness;
          const cos = Math.cos(randomAngle);
          const sin = Math.sin(randomAngle);
          const newVx = vx * cos - vy * sin;
          const newVy = vx * sin + vy * cos;
          vx = newVx;
          vy = newVy;

          // Clamp velocities to realistic maximum
          vx = Math.max(-PHYSICS.MAX_VELOCITY_COMPONENT, Math.min(PHYSICS.MAX_VELOCITY_COMPONENT, vx));
          vy = Math.max(-PHYSICS.MAX_VELOCITY_COMPONENT, Math.min(PHYSICS.MAX_VELOCITY_COMPONENT, vy));

          // Ensure minimum bounce
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed < PHYSICS.MIN_BOUNCE_VELOCITY && speed > 0) {
            const scale = PHYSICS.MIN_BOUNCE_VELOCITY / speed;
            vx *= scale;
            vy *= scale;
          }

          // Final speed cap after all collision effects
          ({ vx, vy } = capVelocity(vx, vy));
        }

        // Record collision
        hitPeg = peg;
        recentCollisions.set(pegKey, frame);

        // Clean old collisions
        if (recentCollisions.size > 10) {
          const firstKey = recentCollisions.keys().next().value;
          if (firstKey) {
            recentCollisions.delete(firstKey);
          }
        }

        break; // Only handle one collision per frame FOR PHYSICS
      }
    }

    // After physics collision, detect ALL pegs the ball is near for visual feedback
    for (const peg of pegs) {
      const dx = x - peg.x;
      const dy = y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If ball is touching or very close to peg (within collision radius + small margin)
      if (dist <= PHYSICS.COLLISION_RADIUS + 2) {
        pegsHitThisFrame.push({ row: peg.row, col: peg.col });
      }
    }

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
    let bucketWallHit: 'left' | 'right' | undefined = undefined;
    let bucketFloorHit = false;

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

    // Final safety check: ensure no overlaps before adding frame
    for (const peg of pegs) {
      const dx = x - peg.x;
      const dy = y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PHYSICS.COLLISION_RADIUS) {
        // Push ball away from peg if still overlapping
        const nx = dx / dist;
        const ny = dy / dist;
        x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.2);
        y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.2);
      }
    }

    // Update rotation based on horizontal velocity
    rotation += (vx / PHYSICS.BALL_RADIUS) * PHYSICS.DT * 60;

    // Final velocity cap after ALL physics (collisions, walls, buckets, etc.)
    ({ vx, vy } = capVelocity(vx, vy));

    // Also cap the actual distance moved this frame to prevent collision resolution
    // from causing unrealistic jumps
    const actualDx = x - frameStartX;
    const actualDy = y - frameStartY;
    const actualDist = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
    if (actualDist > PHYSICS.MAX_DIST_PER_FRAME) {
      const scale = PHYSICS.MAX_DIST_PER_FRAME / actualDist;
      x = frameStartX + actualDx * scale;
      y = frameStartY + actualDy * scale;
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
      bucketFloorHit: bucketFloorHit || undefined,
    });
  }

  // Validate that ball reached bucket zone (not stuck above it)
  if (y < bucketZoneY - 10) {
    // Ball got stuck before reaching bucket - this is an invalid trajectory
    // Return invalid slot to trigger retry
    return { trajectory, landedSlot: -1 };
  }

  // Determine which slot the ball landed in
  // Adjust x position relative to playable area
  const xRelative = x - PHYSICS.BORDER_WIDTH;
  const landedSlot = Math.min(Math.max(0, Math.floor(xRelative / slotWidth)), slotCount - 1);

  return { trajectory, landedSlot };
}

/**
 * Main trajectory generation function
 * Generates a random trajectory and returns which slot it landed in
 * Uses brute-force retry to ensure ball never gets stuck
 * The caller is responsible for rearranging prizes to match the landing slot
 */
export function generateTrajectory(params: GenerateTrajectoryParams): GenerateTrajectoryResult {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    seed = Date.now(),
    dropZone,
    targetSlot,
    precomputedTrajectory,
    maxAttempts = 50000,
  } = params;

  if (slotCount <= 0) {
    throw new Error('slotCount must be greater than zero.');
  }

  if (typeof targetSlot === 'number' && (targetSlot < 0 || targetSlot >= slotCount)) {
    throw new Error(`Target slot ${targetSlot} is out of bounds for slot count ${slotCount}.`);
  }

  if (precomputedTrajectory) {
    const trajectory = precomputedTrajectory.points.map((point) => ({ ...point }));
    const computedSlot = computeLandingSlotFromTrajectory(trajectory, boardWidth, slotCount);
    const providedSlot = precomputedTrajectory.landingSlot;
    const effectiveTarget = typeof targetSlot === 'number' ? targetSlot : providedSlot;
    const matchedTarget =
      typeof effectiveTarget === 'number' ? computedSlot === effectiveTarget : computedSlot >= 0;

    const slotHistogram: Record<number, number> = {};
    if (computedSlot >= 0) {
      slotHistogram[computedSlot] = 1;
    }

    const failure =
      computedSlot < 0 || (typeof effectiveTarget === 'number' && computedSlot !== effectiveTarget)
        ? {
            reason: 'invalid-precomputed-path' as const,
            targetSlot: effectiveTarget,
          }
        : undefined;

    return {
      trajectory,
      landedSlot: computedSlot,
      matchedTarget,
      attempts: 0,
      slotHistogram,
      failure,
      source: 'precomputed',
    };
  }

  const pegs = generatePegLayout({ boardWidth, boardHeight, pegRows });

  const slotHistogram: Record<number, number> = {};
  let bestCandidate: {
    trajectory: TrajectoryPoint[];
    landedSlot: number;
    attempts: number;
  } | null = null;

  // Determine search range based on drop zone
  let searchCenterX: number;
  let searchRangeX: number;

  if (dropZone) {
    // User selected a specific drop zone - constrain search to that zone
    const { min, max } = getDropZoneRange(dropZone, boardWidth);
    searchCenterX = (min + max) / 2;
    searchRangeX = (max - min) / 2;
  } else {
    // Classic mode - search center area
    searchCenterX = boardWidth / 2;
    searchRangeX = 2.5; // Small range around center
  }

  // Pattern functions for exploring trajectory space efficiently
  const offsetPatterns = [
    () => 0,                                            // Dead center of zone
    (range: number) => range * 0.3,                     // Slightly right
    (range: number) => -range * 0.3,                    // Slightly left
    (range: number) => range * 0.6,                     // More right
    (range: number) => -range * 0.6,                    // More left
    (range: number, attempt: number) => Math.sin(attempt * 0.618) * range * 0.8,  // Sine wave
    (range: number, attempt: number) => Math.cos(attempt * 1.414) * range * 0.8,  // Cosine wave
  ];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Microscopic variations that are imperceptible but change entire trajectory
    // Use different patterns to explore the space efficiently
    const pattern = attempt % offsetPatterns.length;
    const microOffset = offsetPatterns[pattern]!(searchRangeX, attempt);

    const startX = searchCenterX + microOffset;
    const startVx = 0; // ALWAYS zero initial velocity - ball drops from rest

    // Vary bounce randomness systematically
    const bounceRandomness = 0.2 + ((attempt % 100) / 100) * 0.6; // 0.2 to 0.8 range

    const simulationParams: SimulationParams = {
      startX,
      startVx,
      bounceRandomness,
    };

    // Run deterministic simulation
    const simulationSeed = seed * 65537 + attempt * 31337;
    const { trajectory, landedSlot } = runSimulation(
      simulationParams,
      boardWidth,
      boardHeight,
      pegs,
      slotCount,
      simulationSeed
    );

    if (landedSlot >= 0 && landedSlot < slotCount) {
      slotHistogram[landedSlot] = (slotHistogram[landedSlot] ?? 0) + 1;

      if (!bestCandidate) {
        bestCandidate = { trajectory, landedSlot, attempts: attempt + 1 };
      }

      if (typeof targetSlot !== 'number' || landedSlot === targetSlot) {
        return {
          trajectory,
          landedSlot,
          matchedTarget: typeof targetSlot !== 'number' ? true : landedSlot === targetSlot,
          attempts: attempt + 1,
          slotHistogram,
          source: 'simulated',
        };
      }
    }
  }

  if (bestCandidate) {
    return {
      trajectory: bestCandidate.trajectory,
      landedSlot: bestCandidate.landedSlot,
      matchedTarget:
        typeof targetSlot !== 'number' ? true : bestCandidate.landedSlot === targetSlot,
      attempts: maxAttempts,
      slotHistogram,
      failure:
        typeof targetSlot === 'number'
          ? ({ reason: 'max-attempts-exceeded', targetSlot } as const)
          : undefined,
      source: 'simulated',
    };
  }

  console.error(`Failed to generate valid trajectory after ${maxAttempts} attempts`);
  throw new Error(`Could not generate valid trajectory after ${maxAttempts} attempts`);
}
