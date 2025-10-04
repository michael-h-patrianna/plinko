/**
 * Trajectory generation for predetermined Plinko outcomes
 * Uses realistic physics with gravity and bouncing
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
  boardWidth: number
): number {
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
 * Generates peg positions matching the board layout
 */
function generatePegPositions(
  pegRows: number,
  slotCount: number,
  boardWidth: number,
  boardHeight: number
): { x: number; y: number }[][] {
  const pegsByRow: { x: number; y: number }[][] = [];
  const verticalSpacing = (boardHeight * 0.65) / (pegRows + 1);
  const horizontalSpacing = boardWidth / (slotCount + 1);

  for (let row = 0; row < pegRows; row++) {
    const pegsInRow: { x: number; y: number }[] = [];
    const y = verticalSpacing * (row + 1) + 20;
    const offset = row % 2 === 0 ? 0 : horizontalSpacing / 2;

    for (let col = 0; col <= slotCount; col++) {
      const x = horizontalSpacing * col + horizontalSpacing / 2 + offset;
      pegsInRow.push({ x, y });
    }
    pegsByRow.push(pegsInRow);
  }

  return pegsByRow;
}

/**
 * Generates full frame-by-frame trajectory with realistic physics
 */
export function generateTrajectory(params: TrajectoryParams): TrajectoryPoint[] {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    selectedIndex,
    seed,
    dropDurationMs = 2500,
    settleDurationMs = 200
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

  // Physics constants - Per PRD Section 3.4: restitution 0.8, friction 0.01, frictionAir 0.001
  const GRAVITY = 2000; // pixels/s² - High enough to overcome restitution
  const RESTITUTION = 0.65; // Energy retention (compromise between bouncy and not stalling)
  const FRICTION_AIR = 0.015; // Air resistance to control speed
  const PEG_RADIUS = 6;
  const BALL_RADIUS = 10;
  const BOUNCE_IMPULSE = 250; // Random horizontal impulse on collision
  const STEERING_FORCE = 40; // Gentle constant force toward target (invisible table tilt)

  // Generate peg layout
  const pegsByRow = generatePegPositions(pegRows, slotCount, boardWidth, boardHeight);

  // Ball state
  let x = boardWidth / 2;
  let y = -20; // Start slightly above board

  // Target slot
  const targetSlotX = getSlotCenterX(selectedIndex, slotCount, boardWidth);

  // Initial velocity - small random to avoid perfectly straight drop
  let vx = (rng.next() - 0.5) * 20; // Small random horizontal velocity
  let vy = 0;
  let rotation = 0;

  let time = 0;
  const dt = 1 / FPS;
  let frame = 0;
  let hasPassedAllPegs = false;

  // Generate trajectory with physics
  while (time < dropDurationMs / 1000) {
    // Apply gravity
    vy += GRAVITY * dt;

    // Apply gentle constant force toward target (invisible table tilt)
    if (!hasPassedAllPegs) {
      const distanceToTarget = targetSlotX - x;
      const steeringForce = distanceToTarget * STEERING_FORCE;
      vx += steeringForce * dt;
    }

    // Apply air friction per PRD spec (frictionAir: 0.001 in Matter.js)
    vx *= (1 - FRICTION_AIR);
    vy *= (1 - FRICTION_AIR);

    // Update position
    x += vx * dt;
    y += vy * dt;

    // Check collision with ALL pegs (not just current row)
    let hitPeg = false;
    for (let row = 0; row < pegRows; row++) {
      const pegsInRow = pegsByRow[row]!;

      for (const peg of pegsInRow) {
        const dx = x - peg.x;
        const dy = y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Collision detected
        if (dist < PEG_RADIUS + BALL_RADIUS) {
          if (dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Reflect velocity with restitution (coefficient of restitution)
            const dot = vx * nx + vy * ny;
            vx = (vx - 2 * dot * nx) * RESTITUTION;
            vy = (vy - 2 * dot * ny) * RESTITUTION;

            // Add pure random horizontal impulse for natural variation
            const randomImpulse = (rng.next() - 0.5) * BOUNCE_IMPULSE;
            vx += randomImpulse;

            // Prevent upward stalling
            if (vy < 0) {
              vy *= 0.3; // Heavily dampen upward velocity
            }

            // Ensure ball keeps moving downward
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed < 80 && y < boardHeight * 0.7) {
              vy += GRAVITY * dt * 3; // Boost downward velocity if too slow
            }

            // Push ball away from peg to prevent sticking
            const overlap = (PEG_RADIUS + BALL_RADIUS) - dist + 2; // +2 for extra separation
            x += nx * overlap;
            y += ny * overlap;

            hitPeg = true;
            break;
          }
        }
      }
      if (hitPeg) break;
    }

    // Check if passed all pegs
    if (y > (boardHeight * 0.7) && !hasPassedAllPegs) {
      hasPassedAllPegs = true;
    }

    // Clamp to board bounds
    if (x < BALL_RADIUS) {
      x = BALL_RADIUS;
      vx = -vx * RESTITUTION;
    }
    if (x > boardWidth - BALL_RADIUS) {
      x = boardWidth - BALL_RADIUS;
      vx = -vx * RESTITUTION;
    }

    // Check if reached slot area (force stop to prevent falling through)
    const slotY = boardHeight * 0.8;
    if (y >= slotY && hasPassedAllPegs) {
      // Stop at slot level
      y = slotY;
      vy = 0;
      vx = 0;
      break;
    }

    // Update rotation based on velocity
    rotation += (vx / 10);

    trajectory.push({
      frame,
      x: clamp(x, 0, boardWidth),
      y,
      rotation,
      pegHit: hitPeg
    });

    frame++;
    time += dt;
  }

  // Add a few frames at rest to show final position (use actual position, no teleport)
  for (let i = 0; i < 10; i++) {
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
