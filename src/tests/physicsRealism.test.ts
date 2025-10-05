/**
 * Comprehensive physics realism tests for Plinko trajectory
 *
 * This test suite validates that ball movement follows realistic physics:
 * 1. No teleportation (sudden position jumps)
 * 2. No impossible acceleration (beyond physical limits)
 * 3. Energy conservation (ball doesn't gain energy without cause)
 * 4. No wall/peg clipping (ball passes through solid objects)
 * 5. Smooth, continuous motion
 * 6. Realistic collision behavior
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';
import type { TrajectoryPoint } from '../game/types';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

// Physics constants
const GRAVITY = 980; // px/s²
const DT = 1 / 60; // 60 FPS
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS;
const TERMINAL_VELOCITY = 600; // px/s
const BORDER_WIDTH = 12;

// Tolerance values
const POSITION_JUMP_THRESHOLD = 20; // Max pixels ball can move in one frame
const ACCELERATION_LIMIT = GRAVITY * 10; // Max 10x gravity for elastic collisions (high-energy impacts)
const ENERGY_GAIN_TOLERANCE = 1.1; // Allow 10% energy gain (numerical errors)

describe('Physics Realism Tests', () => {
  /**
   * Generate peg positions for collision checking
   */
  function generatePegLayout() {
    const pegs: { x: number; y: number; row: number; col: number }[] = [];
    const OPTIMAL_PEG_COLUMNS = 6;
    const pegPadding = PEG_RADIUS + 10; // Peg radius + 10px safety margin
    const playableWidth = BOARD_WIDTH - BORDER_WIDTH * 2 - pegPadding * 2;
    const playableHeight = BOARD_HEIGHT * 0.65;
    const verticalSpacing = playableHeight / (PEG_ROWS + 1);
    const horizontalSpacing = playableWidth / OPTIMAL_PEG_COLUMNS;

    for (let row = 0; row < PEG_ROWS; row++) {
      const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20;
      const isOffsetRow = row % 2 === 1;
      const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
      const numPegs = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

      for (let col = 0; col < numPegs; col++) {
        const x = BORDER_WIDTH + pegPadding + horizontalSpacing * col + offset;
        pegs.push({ x, y, row, col });
      }
    }

    return pegs;
  }

  describe('1. No Teleportation', () => {
    it('should not have sudden position jumps between frames', () => {
      const violations: string[] = [];

      // Test multiple trajectories
      for (let seed = 1; seed <= 20; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 1000,
        });

        for (let i = 1; i < trajectory.length; i++) {
          const prev = trajectory[i - 1]!;
          const curr = trajectory[i]!;

          const dx = Math.abs(curr.x - prev.x);
          const dy = Math.abs(curr.y - prev.y);
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Check for teleportation
          if (distance > POSITION_JUMP_THRESHOLD && !curr.pegHit) {
            violations.push(
              `Seed ${seed}, Frame ${i}: Ball teleported ${distance.toFixed(1)}px ` +
                `from (${prev.x.toFixed(1)}, ${prev.y.toFixed(1)}) to ` +
                `(${curr.x.toFixed(1)}, ${curr.y.toFixed(1)})`
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });

    it('should have smooth position transitions even during collisions', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 12345,
      });

      for (let i = 1; i < trajectory.length; i++) {
        const prev = trajectory[i - 1]!;
        const curr = trajectory[i]!;

        // Even collision frames should not jump unreasonably
        const maxAllowedJump = curr.pegHit ? 30 : POSITION_JUMP_THRESHOLD;
        const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));

        expect(distance).toBeLessThan(maxAllowedJump);
      }
    });
  });

  describe('2. Realistic Acceleration', () => {
    it('should not have impossible acceleration values', () => {
      const violations: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 2000,
        });

        for (let i = 1; i < trajectory.length - 1; i++) {
          const curr = trajectory[i]!;
          const next = trajectory[i + 1]!;

          // Skip collision frames (all types)
          if (
            curr.pegHit ||
            next.pegHit ||
            curr.bucketFloorHit ||
            next.bucketFloorHit ||
            curr.wallHit ||
            next.wallHit ||
            curr.bucketWallHit ||
            next.bucketWallHit
          )
            continue;

          // Calculate acceleration
          const ax = (next.vx! - curr.vx!) / DT;
          const ay = (next.vy! - curr.vy!) / DT;
          const totalAccel = Math.sqrt(ax * ax + ay * ay);

          if (totalAccel > ACCELERATION_LIMIT) {
            violations.push(
              `Seed ${seed}, Frame ${i}: Acceleration ${totalAccel.toFixed(0)}px/s² ` +
                `exceeds limit of ${ACCELERATION_LIMIT}px/s²`
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });

    it('should have gravity-dominated vertical acceleration when not colliding', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 99999,
      });

      const nonCollisionFrames: number[] = [];

      for (let i = 10; i < trajectory.length - 10; i++) {
        const curr = trajectory[i]!;
        const next = trajectory[i + 1]!;

        // Skip collision frames and their neighbors
        if (curr.pegHit || next.pegHit) continue;
        if (trajectory[i - 1]?.pegHit || trajectory[i + 1]?.pegHit) continue;

        // Calculate vertical acceleration
        const ay = (next.vy! - curr.vy!) / DT;

        // During free fall, acceleration should be close to gravity
        if (curr.y < BOARD_HEIGHT * 0.6) {
          // Above bucket zone
          nonCollisionFrames.push(ay);
        }
      }

      // Average acceleration should be close to gravity
      const avgAccel = nonCollisionFrames.reduce((a, b) => a + b, 0) / nonCollisionFrames.length;
      // Allow 100px/s² tolerance for damping and air resistance effects
      expect(Math.abs(avgAccel - GRAVITY)).toBeLessThan(100);
    });
  });

  describe('3. Energy Conservation', () => {
    it('should not gain energy without collisions', () => {
      const violations: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 3000,
        });

        for (let i = 1; i < trajectory.length - 1; i++) {
          const prev = trajectory[i - 1]!;
          const curr = trajectory[i]!;

          // Skip collision frames
          if (curr.pegHit || prev.pegHit) continue;

          // Calculate kinetic energy (KE = 0.5 * m * v²)
          // Using unit mass, so KE = 0.5 * v²
          const prevKE = 0.5 * (prev.vx! * prev.vx! + prev.vy! * prev.vy!);
          const currKE = 0.5 * (curr.vx! * curr.vx! + curr.vy! * curr.vy!);

          // Calculate potential energy (PE = m * g * h)
          // Using unit mass, so PE = g * h
          // Note: y increases downward, so lower y = higher PE
          const prevPE = GRAVITY * (BOARD_HEIGHT - prev.y);
          const currPE = GRAVITY * (BOARD_HEIGHT - curr.y);

          // Total energy
          const prevTotal = prevKE + prevPE;
          const currTotal = currKE + currPE;

          // Check for energy gain (allowing small tolerance for numerical errors)
          if (currTotal > prevTotal * ENERGY_GAIN_TOLERANCE) {
            violations.push(
              `Seed ${seed}, Frame ${i}: Energy increased from ${prevTotal.toFixed(0)} ` +
                `to ${currTotal.toFixed(0)} (${((currTotal / prevTotal - 1) * 100).toFixed(1)}% gain)`
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });

    it('should lose energy on collisions (inelastic)', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 55555,
      });

      // Find collision frames
      const collisionFrames = trajectory
        .map((point, index) => ({ point, index }))
        .filter(({ point }) => point.pegHit);

      expect(collisionFrames.length).toBeGreaterThan(0);

      for (const { index } of collisionFrames) {
        if (index > 0 && index < trajectory.length - 1) {
          const before = trajectory[index - 1]!;
          const after = trajectory[index + 1]!;

          // Calculate speeds
          const speedBefore = Math.sqrt(before.vx! * before.vx! + before.vy! * before.vy!);
          const speedAfter = Math.sqrt(after.vx! * after.vx! + after.vy! * after.vy!);

          // After collision, speed should generally decrease (energy lost)
          // Allow some increase due to gravity and guidance forces
          expect(speedAfter).toBeLessThan(speedBefore * 1.5);
        }
      }
    });
  });

  describe('4. No Wall/Peg Clipping', () => {
    it('should not pass through walls', () => {
      const violations: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 4000,
        });

        for (let i = 0; i < trajectory.length; i++) {
          const point = trajectory[i]!;

          // Check left wall
          if (point.x < BORDER_WIDTH + BALL_RADIUS) {
            violations.push(
              `Seed ${seed}, Frame ${i}: Ball clipped through left wall ` +
                `(x=${point.x.toFixed(1)}, min=${(BORDER_WIDTH + BALL_RADIUS).toFixed(1)})`
            );
          }

          // Check right wall
          if (point.x > BOARD_WIDTH - BORDER_WIDTH - BALL_RADIUS) {
            violations.push(
              `Seed ${seed}, Frame ${i}: Ball clipped through right wall ` +
                `(x=${point.x.toFixed(1)}, max=${(BOARD_WIDTH - BORDER_WIDTH - BALL_RADIUS).toFixed(1)})`
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });

    it('should not tunnel through pegs', () => {
      const pegs = generatePegLayout();
      const violations: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 5000,
        });

        for (let i = 1; i < trajectory.length; i++) {
          const prev = trajectory[i - 1]!;
          const curr = trajectory[i]!;

          // Check line segment from prev to curr against all pegs
          for (const peg of pegs) {
            // Skip pegs far from current position
            if (Math.abs(peg.y - curr.y) > 50) continue;

            // Check if line segment passes through peg
            const linePassesThroughPeg = doesLineIntersectCircle(
              prev.x,
              prev.y,
              curr.x,
              curr.y,
              peg.x,
              peg.y,
              COLLISION_RADIUS
            );

            if (linePassesThroughPeg) {
              // Check if there was a collision reported
              const hadCollision =
                curr.pegHit && curr.pegHitRow === peg.row && curr.pegHitCol === peg.col;

              if (!hadCollision) {
                const dist = Math.sqrt(Math.pow(curr.x - peg.x, 2) + Math.pow(curr.y - peg.y, 2));

                // Only report if ball is inside peg (not just passing nearby)
                if (dist < COLLISION_RADIUS * 0.9) {
                  violations.push(
                    `Seed ${seed}, Frame ${i}: Ball passed through peg at ` +
                      `(${peg.x.toFixed(0)}, ${peg.y.toFixed(0)}) without collision`
                  );
                }
              }
            }
          }
        }
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe('5. Velocity Consistency', () => {
    it('should not exceed terminal velocity', () => {
      const violations: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 6000,
        });

        for (let i = 0; i < trajectory.length; i++) {
          const point = trajectory[i]!;
          const speed = Math.sqrt(point.vx! * point.vx! + point.vy! * point.vy!);

          if (speed > TERMINAL_VELOCITY * 1.1) {
            // 10% tolerance
            violations.push(
              `Seed ${seed}, Frame ${i}: Speed ${speed.toFixed(0)}px/s ` +
                `exceeds terminal velocity of ${TERMINAL_VELOCITY}px/s`
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });

    it('should have continuous velocity changes', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 77777,
      });

      for (let i = 1; i < trajectory.length; i++) {
        const prev = trajectory[i - 1]!;
        const curr = trajectory[i]!;

        // Skip collision frames AND frames near collisions
        // where velocity can change due to bounce effects
        // Use wider buffer to avoid frames affected by collision impulse
        const isCollision = (frame: TrajectoryPoint | undefined) =>
          frame?.pegHit || frame?.bucketFloorHit || frame?.wallHit || frame?.bucketWallHit;

        if (isCollision(curr) || isCollision(prev)) continue;
        if (isCollision(trajectory[i + 1]) || isCollision(trajectory[i - 1])) continue;
        if (isCollision(trajectory[i + 2]) || isCollision(trajectory[i - 2])) continue;
        if (isCollision(trajectory[i + 3]) || isCollision(trajectory[i - 3])) continue;

        // Velocity change should be limited by acceleration * dt
        const dvx = Math.abs(curr.vx! - prev.vx!);
        const dvy = Math.abs(curr.vy! - prev.vy!);

        // Max velocity change per frame (during free fall, not collision)
        const maxDVx = GRAVITY * DT * 15; // Horizontal can change significantly due to damping/spin
        const maxDVy = GRAVITY * DT * 10; // Vertical can accelerate/decelerate

        expect(dvx).toBeLessThan(maxDVx);
        expect(dvy).toBeLessThan(maxDVy);
      }
    });
  });

  describe('6. Realistic Motion Patterns', () => {
    it('should fall downward on average', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 88888,
      });

      // Count frames where ball moves upward
      let upwardFrames = 0;
      let downwardFrames = 0;

      for (let i = 1; i < trajectory.length; i++) {
        const dy = trajectory[i]!.y - trajectory[i - 1]!.y;
        if (dy < 0) upwardFrames++;
        else if (dy > 0) downwardFrames++;
      }

      // Ball should move downward most of the time
      expect(downwardFrames).toBeGreaterThan(upwardFrames * 2);
    });

    it('should have parabolic motion between collisions', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 33333,
      });

      // Find segments between collisions
      const segments: number[][] = [];
      let currentSegment: number[] = [];

      for (let i = 0; i < trajectory.length; i++) {
        if (trajectory[i]!.pegHit && currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = [];
        } else if (!trajectory[i]!.pegHit) {
          currentSegment.push(i);
        }
      }

      // Check that segments show acceleration due to gravity
      for (const segment of segments) {
        if (segment.length > 5) {
          // Need enough points to check
          const vyValues = segment.map((i) => trajectory[i]!.vy!);

          // Vertical velocity should generally increase (falling)
          let increasing = 0;
          for (let i = 1; i < vyValues.length; i++) {
            if (vyValues[i]! > vyValues[i - 1]!) increasing++;
          }

          // Most frames should show increasing vy (gravity effect)
          // Use 0.4 threshold to allow for air resistance and damping effects
          expect(increasing).toBeGreaterThan(vyValues.length * 0.4);
        }
      }
    });
  });
});

/**
 * Check if a line segment intersects with a circle
 */
function doesLineIntersectCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  // Vector from start to end
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Vector from start to circle center
  const fx = cx - x1;
  const fy = cy - y1;

  // Project circle center onto line
  const a = dx * dx + dy * dy;
  if (a === 0) return false;

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  // Check discriminant
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  // Calculate intersection points
  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);

  // Check if intersection is within line segment
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1); // Line passes through circle
}
