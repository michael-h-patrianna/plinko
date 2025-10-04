/**
 * Trajectory generation for predetermined Plinko outcomes
 * Uses REALISTIC physics with proper gravity (9.8 m/s²), acceleration, and bucket bouncing
 */

import type { TrajectoryPoint } from './types';
import { createRng } from './rng';

interface TrajectoryParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;
  seed: number;
  dropDurationMs?: number;
  settleDurationMs?: number;
}

/**
 * Calculates the center X coordinate for a given slot
 */
function getSlotCenterX(
  slotIndex: number,
  slotCount: number,
  boardWidth: number,
  borderWidth: number = 12
): number {
  // Slots don't account for borders
  const slotWidth = boardWidth / slotCount;
  return (slotIndex + 0.5) * slotWidth;
}

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generates peg positions matching the board layout (accounting for borders)
 */
function generatePegPositions(
  pegRows: number,
  slotCount: number,
  boardWidth: number,
  boardHeight: number,
  borderWidth: number = 12
): { x: number; y: number; row: number; col: number }[][] {
  const pegsByRow: { x: number; y: number; row: number; col: number }[][] = [];

  // Account for border walls
  const playableWidth = boardWidth - (borderWidth * 2);
  const playableHeight = boardHeight * 0.65;

  const verticalSpacing = playableHeight / (pegRows + 1);
  const horizontalSpacing = playableWidth / slotCount;

  for (let row = 0; row < pegRows; row++) {
    const pegsInRow: { x: number; y: number; row: number; col: number }[] = [];
    const y = verticalSpacing * (row + 1) + borderWidth + 20;

    // Match the visual layout exactly
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? slotCount : slotCount + 1;

    for (let col = 0; col < numPegs; col++) {
      const x = borderWidth + horizontalSpacing * col + offset;
      pegsInRow.push({ x, y, row, col });
    }
    pegsByRow.push(pegsInRow);
  }

  return pegsByRow;
}

/**
 * Generates full frame-by-frame trajectory with REALISTIC physics
 */
export function generateTrajectory(params: TrajectoryParams): TrajectoryPoint[] {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    selectedIndex,
    seed,
    dropDurationMs = 3000, // Increased for realistic falling time
    settleDurationMs = 500  // Increased for bucket bouncing
  } = params;

  // Validation
  if (selectedIndex < 0 || selectedIndex >= slotCount) {
    throw new Error(
      `selectedIndex ${selectedIndex} out of range [0, ${slotCount - 1}]`
    );
  }

  const rng = createRng(seed);
  const FPS = 60;
  const trajectory: TrajectoryPoint[] = [];

  // REALISTIC PHYSICS CONSTANTS
  // Convert real-world physics to pixels (assuming 1 meter = 100 pixels)
  const PIXELS_PER_METER = 100;
  const GRAVITY = 9.8 * PIXELS_PER_METER; // 980 px/s² - Real Earth gravity!
  const RESTITUTION = 0.7; // Ball bounces back to 70% of impact energy
  const FRICTION_AIR = 0.005; // Minimal air resistance for realism
  const PEG_RADIUS = 7; // Slightly larger pegs
  const BALL_RADIUS = 11; // Slightly larger ball for better visual
  const BOUNCE_IMPULSE = 180; // Reduced random impulse for more natural bouncing
  const STEERING_FORCE = 35; // Subtle guidance toward target
  const BORDER_WIDTH = 12;

  // Generate peg layout with border awareness
  const pegsByRow = generatePegPositions(pegRows, slotCount, boardWidth, boardHeight, BORDER_WIDTH);

  // Ball state - starts at REST (realistic!)
  let x = boardWidth / 2;
  let y = BORDER_WIDTH + 10; // Start just below top border
  let vx = 0; // Starts at rest!
  let vy = 0; // Starts at rest!
  let rotation = 0;
  let rotationVelocity = 0;

  // Target slot
  const targetSlotX = getSlotCenterX(selectedIndex, slotCount, boardWidth, BORDER_WIDTH);

  let time = 0;
  const dt = 1 / FPS;
  let frame = 0;
  let hasPassedAllPegs = false;
  let inBucket = false;
  let bucketBounces = 0;

  // Bucket dimensions - MUST match visual Slot component
  const slotWidth = boardWidth / slotCount;
  const slotHeight = 90; // Matches Slot.tsx height
  const slotY = boardHeight - slotHeight; // Slots are at bottom-0
  const slotLeftX = selectedIndex * slotWidth;
  const slotRightX = (selectedIndex + 1) * slotWidth;
  const slotBottomY = boardHeight; // True bottom of board

  // PHYSICS SIMULATION LOOP
  while (time < (dropDurationMs + settleDurationMs) / 1000) {
    // Apply REAL gravity - ball accelerates from rest
    vy += GRAVITY * dt;

    // Apply gentle steering toward target (only while above buckets)
    if (!inBucket && !hasPassedAllPegs) {
      const distanceToTarget = targetSlotX - x;
      const steeringForce = distanceToTarget * STEERING_FORCE;
      vx += steeringForce * dt;
    }

    // Apply air resistance
    vx *= (1 - FRICTION_AIR);
    vy *= (1 - FRICTION_AIR);

    // Update position with acceleration
    x += vx * dt;
    y += vy * dt;

    // Check collision with ALL pegs
    let hitPeg = false;
    let hitPegRow = -1;
    let hitPegCol = -1;

    if (!inBucket) {
      for (let row = 0; row < pegRows; row++) {
        const pegsInRow = pegsByRow[row]!;

        for (const peg of pegsInRow) {
          const dx = x - peg.x;
          const dy = y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < PEG_RADIUS + BALL_RADIUS) {
            if (dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;

              // Realistic collision response
              const dot = vx * nx + vy * ny;
              vx = (vx - 2 * dot * nx) * RESTITUTION;
              vy = (vy - 2 * dot * ny) * RESTITUTION;

              // Small random impulse for variation
              const randomImpulse = (rng.next() - 0.5) * BOUNCE_IMPULSE;
              vx += randomImpulse;

              // Prevent upward stalling
              if (vy < 0) {
                vy *= 0.5;
              }

              // Ensure downward movement - gentle anti-stuck
              const speed = Math.sqrt(vx * vx + vy * vy);
              if (speed < 60 && y < boardHeight * 0.7) {
                vy += GRAVITY * dt * 2;
              }

              // Push ball away from peg
              const overlap = (PEG_RADIUS + BALL_RADIUS) - dist + 1;
              x += nx * overlap;
              y += ny * overlap;

              hitPeg = true;
              hitPegRow = peg.row;
              hitPegCol = peg.col;
              break;
            }
          }
        }
        if (hitPeg) break;
      }
    }

    // Check if passed all pegs
    if (y > (boardHeight * 0.7) && !hasPassedAllPegs) {
      hasPassedAllPegs = true;
    }

    // Border wall collisions (only if not in bucket)
    if (!inBucket) {
      const leftWall = BORDER_WIDTH + BALL_RADIUS;
      const rightWall = boardWidth - BORDER_WIDTH - BALL_RADIUS;

      if (x < leftWall) {
        x = leftWall;
        vx = -vx * RESTITUTION;
      }
      if (x > rightWall) {
        x = rightWall;
        vx = -vx * RESTITUTION;
      }
    }

    // BUCKET PHYSICS - The critical improvement!
    if (hasPassedAllPegs && y >= slotY - BALL_RADIUS) {
      inBucket = true;

      // Ball enters bucket - now it bounces realistically!

      // Left bucket wall collision
      if (x < slotLeftX + BALL_RADIUS) {
        x = slotLeftX + BALL_RADIUS;
        vx = Math.abs(vx) * RESTITUTION; // Bounce right
        bucketBounces++;
      }

      // Right bucket wall collision
      if (x > slotRightX - BALL_RADIUS) {
        x = slotRightX - BALL_RADIUS;
        vx = -Math.abs(vx) * RESTITUTION; // Bounce left
        bucketBounces++;
      }

      // Bucket floor collision
      if (y >= slotBottomY - BALL_RADIUS) {
        y = slotBottomY - BALL_RADIUS;
        vy = -Math.abs(vy) * RESTITUTION; // Bounce up
        vx *= 0.9; // Friction on floor
        bucketBounces++;
      }

      // After enough bounces, settle to rest
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < 10 && bucketBounces > 3) {
        // Come to final rest at bucket center
        const finalX = targetSlotX;
        const finalY = slotBottomY - BALL_RADIUS;

        // Smooth settling
        x += (finalX - x) * 0.15;
        y = finalY;
        vx *= 0.8;
        vy *= 0.8;

        if (Math.abs(x - finalX) < 1 && speed < 5) {
          x = finalX;
          vx = 0;
          vy = 0;
        }
      }
    }

    // Update rotation based on velocity (rolling motion)
    rotationVelocity = vx / (BALL_RADIUS * 2); // Angular velocity from linear
    rotation += rotationVelocity * dt * 60; // Convert to degrees

    trajectory.push({
      frame,
      x: clamp(x, 0, boardWidth),
      y,
      rotation,
      pegHit: hitPeg,
      pegHitRow: hitPeg ? hitPegRow : undefined,
      pegHitCol: hitPeg ? hitPegCol : undefined
    });

    frame++;
    time += dt;

    // Exit if truly at rest
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (inBucket && speed < 1 && Math.abs(x - targetSlotX) < 1) {
      break;
    }
  }

  // Add a few final frames showing rest
  for (let i = 0; i < 15; i++) {
    trajectory.push({
      frame: trajectory.length,
      x: clamp(x, 0, boardWidth),
      y,
      rotation,
      pegHit: false
    });
  }

  return trajectory;
}
