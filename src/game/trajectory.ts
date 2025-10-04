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

import type { TrajectoryPoint } from './types';
import { createRng } from './rng';

// Physics constants for realistic simulation
const PHYSICS = {
  GRAVITY: 980,           // px/s² (9.8 m/s² at 100px = 1m)
  RESTITUTION: 0.75,      // Energy retained on bounce (75%)
  BALL_RADIUS: 7,         // Smaller ball (was 9)
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 14,   // Ball + Peg radius (7 + 7)
  DT: 1/60,              // 60 FPS timestep
  TERMINAL_VELOCITY: 600, // px/s max fall speed
  BORDER_WIDTH: 8,        // Thinner walls
  MIN_BOUNCE_VELOCITY: 30, // Minimum velocity after collision
};

interface Peg {
  row: number;
  col: number;
  x: number;
  y: number;
}

interface SimulationParams {
  startX: number;
  startVx: number;
  bounceRandomness: number;
}

/**
 * Generate peg layout for the board
 */
function generatePegLayout(
  boardWidth: number,
  boardHeight: number,
  pegRows: number,
  slotCount: number
): Peg[] {
  const pegs: Peg[] = [];
  // Add extra padding to ensure pegs don't touch walls - increased from 2px to 10px
  const pegPadding = PHYSICS.PEG_RADIUS + 10; // Peg radius + 10px safety margin
  const playableWidth = boardWidth - (PHYSICS.BORDER_WIDTH * 2) - (pegPadding * 2);
  const playableHeight = boardHeight * 0.65;
  const verticalSpacing = playableHeight / (pegRows + 1);
  const horizontalSpacing = playableWidth / slotCount;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + 20;
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? slotCount : slotCount + 1;

    for (let col = 0; col < numPegs; col++) {
      const x = PHYSICS.BORDER_WIDTH + pegPadding + horizontalSpacing * col + offset;
      pegs.push({ row, col, x, y });
    }
  }

  return pegs;
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
): { trajectory: TrajectoryPoint[], landedSlot: number } {
  const trajectory: TrajectoryPoint[] = [];
  const rng = createRng(rngSeed);

  // Initialize state
  let x = params.startX;
  let y = PHYSICS.BORDER_WIDTH + 10;
  let vx = params.startVx;
  let vy = 0;
  let rotation = 0;
  let frame = 0;

  // Define bucket floor position
  const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS - 5;
  // Account for border walls when calculating slot positions
  const playableWidth = boardWidth - (PHYSICS.BORDER_WIDTH * 2);
  const slotWidth = playableWidth / slotCount;

  // Track recent collisions to prevent double-hits
  const recentCollisions = new Map<string, number>();

  // Add initial rest frames
  for (let i = 0; i < 15; i++) {
    trajectory.push({
      frame: frame++,
      x, y, vx: 0, vy: 0,
      rotation: 0,
      pegHit: false
    });
  }

  // Main physics loop with proper collision detection
  // Continue until ball settles in bucket
  let settled = false;
  while (!settled && frame < 800) {
    // Apply gravity
    vy += PHYSICS.GRAVITY * PHYSICS.DT;

    // Terminal velocity
    vy = Math.min(vy, PHYSICS.TERMINAL_VELOCITY);

    // Air resistance
    vx *= 0.998;

    // Store current position and velocity
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
        const dist = Math.sqrt(distSq);

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

        for (let i = 0; i < 10; i++) { // 10 iterations for precision
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

          // Clamp velocities
          const MAX_VELOCITY = 500;
          vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx));
          vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy));

          // Ensure minimum bounce
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed < PHYSICS.MIN_BOUNCE_VELOCITY && speed > 0) {
            const scale = PHYSICS.MIN_BOUNCE_VELOCITY / speed;
            vx *= scale;
            vy *= scale;
          }
        }

        // Record collision
        hitPeg = peg;
        recentCollisions.set(pegKey, frame);

        // Clean old collisions
        if (recentCollisions.size > 10) {
          const firstKey = recentCollisions.keys().next().value;
          recentCollisions.delete(firstKey);
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

    // Wall collision detection
    let wallHit: 'left' | 'right' | undefined = undefined;
    if (x <= PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS) {
      x = PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS;
      vx = Math.abs(vx) * PHYSICS.RESTITUTION;
      wallHit = 'left';
    } else if (x >= boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS) {
      x = boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS;
      vx = -Math.abs(vx) * PHYSICS.RESTITUTION;
      wallHit = 'right';
    }

    // Bucket physics (enhanced)
    const bucketZoneY = boardHeight - 70;
    const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS - 5;
    let bucketWallHit: 'left' | 'right' | undefined = undefined;
    let bucketFloorHit = false;

    if (y >= bucketZoneY) {
      // In bucket zone - check for bucket wall collisions
      // Adjust x position relative to playable area
      const xRelative = x - PHYSICS.BORDER_WIDTH;
      const currentSlot = Math.floor(xRelative / slotWidth);
      const slotLeftEdge = PHYSICS.BORDER_WIDTH + currentSlot * slotWidth + 3;
      const slotRightEdge = PHYSICS.BORDER_WIDTH + (currentSlot + 1) * slotWidth - 3;

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

    // Add frame
    trajectory.push({
      frame: frame++,
      x, y, vx, vy,
      rotation,
      pegHit: hitPeg !== null,
      pegHitRow: hitPeg?.row,
      pegHitCol: hitPeg?.col,
      pegsHit: pegsHitThisFrame.length > 0 ? pegsHitThisFrame : undefined,
      wallHit,
      bucketWallHit,
      bucketFloorHit: bucketFloorHit || undefined
    });
  }

  // Determine which slot the ball landed in
  // Adjust x position relative to playable area
  const xRelative = x - PHYSICS.BORDER_WIDTH;
  const landedSlot = Math.min(
    Math.max(0, Math.floor(xRelative / slotWidth)),
    slotCount - 1
  );

  return { trajectory, landedSlot };
}

/**
 * Main trajectory generation function
 * Tries different initial conditions until finding one that lands in the target slot
 */
export function generateTrajectory(params: {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;
  seed?: number;
}): TrajectoryPoint[] {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    selectedIndex,
    seed = Date.now()
  } = params;

  if (selectedIndex < 0 || selectedIndex >= slotCount) {
    throw new Error(`Invalid slot index: ${selectedIndex}`);
  }

  const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);
  // Account for border walls when calculating slot positions
  const playableWidth = boardWidth - (PHYSICS.BORDER_WIDTH * 2);
  const slotWidth = playableWidth / slotCount;
  const targetX = PHYSICS.BORDER_WIDTH + selectedIndex * slotWidth + slotWidth / 2;

  // Try different initial parameters with better strategies
  // We try many subtle variations to find a natural path to target
  const maxAttempts = 50000; // 50k attempts should be sufficient

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Ball ALWAYS starts near center with ZERO velocity - realistic drop
    const centerX = boardWidth / 2;

    // Microscopic variations that are imperceptible but change entire trajectory
    // Use different patterns to explore the space efficiently
    const pattern = attempt % 7;
    let microOffset: number;
    if (pattern === 0) microOffset = 0; // Dead center
    else if (pattern === 1) microOffset = 1.5; // Slightly right
    else if (pattern === 2) microOffset = -1.5; // Slightly left
    else if (pattern === 3) microOffset = 2.5;
    else if (pattern === 4) microOffset = -2.5;
    else if (pattern === 5) microOffset = (Math.sin(attempt * 0.618) * 2); // Sine wave pattern
    else microOffset = (Math.cos(attempt * 1.414) * 2); // Cosine wave pattern

    const startX = centerX + microOffset;
    const startVx = 0; // ALWAYS zero initial velocity - ball drops from rest

    // Vary bounce randomness systematically
    const bounceRandomness = 0.2 + (attempt % 100) / 100 * 0.6; // 0.2 to 0.8 range

    const params: SimulationParams = {
      startX,
      startVx,
      bounceRandomness
    };

    // Run deterministic simulation
    const simulationSeed = seed * 65537 + attempt * 31337;
    const { trajectory, landedSlot } = runSimulation(
      params,
      boardWidth,
      boardHeight,
      pegs,
      slotCount,
      simulationSeed
    );

    // Check if it landed in the target slot
    if (landedSlot === selectedIndex) {
      // Success! Return this natural trajectory
      return trajectory.map(point => ({
        ...point,
        targetSlot: selectedIndex
      }));
    }
  }

  // This should never happen with proper parameter generation
  console.error(`Failed to find natural trajectory for slot ${selectedIndex} after ${maxAttempts} attempts`);
  throw new Error(`Could not generate natural trajectory for slot ${selectedIndex}`);
}

