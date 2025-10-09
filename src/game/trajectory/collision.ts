/**
 * Peg Collision Detection and Response
 *
 * Handles all collision detection and physics response for ball-peg interactions.
 * Uses binary search for precise collision point detection to prevent overlaps.
 */

import { PHYSICS, type Peg } from '../boardGeometry';
import type { createRng } from '../rng';

type Rng = ReturnType<typeof createRng>;

export interface CollisionState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface CollisionResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hitPeg: Peg | null;
  pegsHit: Array<{ row: number; col: number }>;
}

interface CollisionParams {
  state: CollisionState;
  oldState: CollisionState;
  pegs: Peg[];
  recentCollisions: Map<string, number>;
  frame: number;
  bounceRandomness: number;
  rng: Rng;
}

/**
 * Detects and handles collisions with all pegs
 * Returns updated position, velocity, and collision information
 * Uses binary search for precise collision point to prevent overlaps
 */
export function detectAndHandlePegCollisions(params: CollisionParams): CollisionResult {
  const { state, oldState, pegs, recentCollisions, frame, bounceRandomness, rng } = params;
  let { x, y, vx, vy } = state;
  let hitPeg: Peg | null = null;
  const pegsHitThisFrame: Array<{ row: number; col: number }> = [];

  // CRITICAL: Use continuous collision detection (CCD) to find the closest collision
  // We must check if the MOVEMENT PATH intersects any peg, not just the end position
  // This prevents tunneling when ball moves fast

  let closestPeg: Peg | null = null;
  let closestT = 2.0; // Initialize beyond valid range [0,1]

  for (const peg of pegs) {
    // Check if movement path from oldState to state intersects this peg
    // Using parametric line-circle intersection
    const dx = state.x - oldState.x;  // Line direction vector
    const dy = state.y - oldState.y;
    const fx = oldState.x - peg.x;    // x1 - cx
    const fy = oldState.y - peg.y;    // y1 - cy

    const a = dx * dx + dy * dy;
    if (a < 0.0001) continue; // No movement

    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - PHYSICS.COLLISION_RADIUS * PHYSICS.COLLISION_RADIUS;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) continue; // No intersection

    // Calculate both intersection points
    const sqrt = Math.sqrt(discriminant);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);

    // We want the earliest intersection in range [0, 1]
    let t = -1;
    if (t1 >= 0 && t1 <= 1) t = t1;
    else if (t2 >= 0 && t2 <= 1) t = t2;

    if (t < 0) continue; // No intersection in movement range

    // Check cooldown
    const pegKey = `${peg.row}-${peg.col}`;
    if (recentCollisions.has(pegKey)) {
      const lastHit = recentCollisions.get(pegKey)!;
      if (frame - lastHit < 10) continue;
    }

    // Track closest collision
    if (t < closestT) {
      closestT = t;
      closestPeg = peg;
    }
  }

  // Handle the closest collision if found
  if (closestPeg !== null) {
    const peg = closestPeg;

    // Move to collision point
    x = oldState.x + (state.x - oldState.x) * closestT;
    y = oldState.y + (state.y - oldState.y) * closestT;

    // Calculate collision normal
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

      // Position ball at safe distance
      x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.1);
      y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.1);

      // Reflect velocity
      const dot = vx * nx + vy * ny;
      vx = vx - 2 * dot * nx;
      vy = vy - 2 * dot * ny;

      // Apply restitution
      vx *= PHYSICS.RESTITUTION;
      vy *= PHYSICS.RESTITUTION;

      // Add randomness
      const randomAngle = (rng.next() - 0.5) * bounceRandomness;
      const cos = Math.cos(randomAngle);
      const sin = Math.sin(randomAngle);
      const newVx = vx * cos - vy * sin;
      const newVy = vx * sin + vy * cos;
      vx = newVx;
      vy = newVy;

      // Clamp velocities
      vx = Math.max(-PHYSICS.MAX_VELOCITY_COMPONENT, Math.min(PHYSICS.MAX_VELOCITY_COMPONENT, vx));
      vy = Math.max(-PHYSICS.MAX_VELOCITY_COMPONENT, Math.min(PHYSICS.MAX_VELOCITY_COMPONENT, vy));

      // Ensure minimum bounce
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < PHYSICS.MIN_BOUNCE_VELOCITY && speed > 0) {
        const scale = PHYSICS.MIN_BOUNCE_VELOCITY / speed;
        vx *= scale;
        vy *= scale;
      }

      // Final speed cap
      const finalSpeed = Math.sqrt(vx * vx + vy * vy);
      if (finalSpeed > PHYSICS.MAX_SPEED) {
        const scale = PHYSICS.MAX_SPEED / finalSpeed;
        vx *= scale;
        vy *= scale;
      }
    }

    // Record collision
    hitPeg = peg;
    const pegKey = `${peg.row}-${peg.col}`;
    recentCollisions.set(pegKey, frame);

    // Clean old collisions
    if (recentCollisions.size > 10) {
      const firstKey = recentCollisions.keys().next().value;
      if (firstKey) {
        recentCollisions.delete(firstKey);
      }
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

  return { x, y, vx, vy, hitPeg, pegsHit: pegsHitThisFrame };
}

/**
 * Final safety check to ensure no overlaps with any pegs
 * Pushes ball away from any peg it's overlapping with
 */
export function preventPegOverlaps(x: number, y: number, pegs: Peg[]): { x: number; y: number } {
  let finalX = x;
  let finalY = y;

  for (const peg of pegs) {
    const dx = finalX - peg.x;
    const dy = finalY - peg.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < PHYSICS.COLLISION_RADIUS) {
      // Push ball away from peg if still overlapping
      const nx = dx / dist;
      const ny = dy / dist;
      finalX = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.2);
      finalY = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.2);
    }
  }

  return { x: finalX, y: finalY };
}
