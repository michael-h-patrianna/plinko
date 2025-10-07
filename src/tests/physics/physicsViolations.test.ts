/**
 * Tests for detecting physics violations in Plinko trajectory
 *
 * This test suite ensures:
 * 1. Ball never passes through pegs (collision detection)
 * 2. Ball never passes through bucket walls
 * 3. Ball acceleration remains realistic (no sudden speed changes)
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../../game/trajectory';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

// Physics constants matching the game
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS; // 16px
const GRAVITY = 980; // px/s²
const BORDER_WIDTH = 12;

/**
 * Generate peg layout matching the game board
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

describe('Physics Violations Detection', () => {
  describe('Peg Collision Detection', () => {
    it('should never allow ball to pass through pegs without collision', () => {
      const pegs = generatePegLayout();

      // Test 10 different trajectories
      for (let seed = 1; seed <= 10; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 1000,
        });

        // Check each frame for peg violations
        for (let i = 1; i < trajectory.length; i++) {
          const prevFrame = trajectory[i - 1]!;
          const currFrame = trajectory[i]!;

          // Check if ball path intersects with any peg
          for (const peg of pegs) {
            // Skip pegs that are far away
            if (Math.abs(peg.y - currFrame.y) > 50) continue;

            // Calculate distance from ball center to peg center
            const distToPeg = Math.sqrt(
              Math.pow(currFrame.x - peg.x, 2) + Math.pow(currFrame.y - peg.y, 2)
            );

            // If ball is overlapping with peg
            if (distToPeg < COLLISION_RADIUS) {
              // Check if ball moved through peg without proper collision
              const prevDistToPeg = Math.sqrt(
                Math.pow(prevFrame.x - peg.x, 2) + Math.pow(prevFrame.y - peg.y, 2)
              );

              // If ball was outside collision radius and now inside without a collision marker
              if (prevDistToPeg >= COLLISION_RADIUS && !currFrame.pegHit) {
                // Check if ball path crossed through peg
                const pathCrossesPeg = doesPathCrossPeg(
                  prevFrame.x,
                  prevFrame.y,
                  currFrame.x,
                  currFrame.y,
                  peg.x,
                  peg.y,
                  COLLISION_RADIUS
                );

                expect(pathCrossesPeg).toBe(false);
              }
            }
          }
        }
      }
    });
  });

  describe('Bucket Wall Collision', () => {
    it('should never allow ball to pass through bucket walls', () => {
      // Test each slot
      for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
        const { trajectory, landedSlot } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: targetSlot * 12345,
        });

        const slotWidth = BOARD_WIDTH / SLOT_COUNT;
        const bucketZoneY = BOARD_HEIGHT * 0.7; // Buckets start at 70% height

        // Check frames in bucket zone
        for (let i = 1; i < trajectory.length; i++) {
          const currFrame = trajectory[i]!;

          // Only check frames in bucket zone
          if (currFrame.y < bucketZoneY) continue;

          // Calculate which slot the ball is in
          const ballSlot = Math.floor(currFrame.x / slotWidth);

          // Check if ball center is in wrong slot (allow tolerance)
          if (ballSlot !== landedSlot) {
            // Allow some tolerance near boundaries for visual ball width
            const distToLandedSlot = Math.min(
              Math.abs(currFrame.x - landedSlot * slotWidth),
              Math.abs(currFrame.x - (landedSlot + 1) * slotWidth)
            );

            expect(distToLandedSlot).toBeLessThanOrEqual(BALL_RADIUS);
          }

          // Check for wall crossing
          const prevFrame = trajectory[i - 1]!;
          if (prevFrame.y >= bucketZoneY) {
            const prevSlot = Math.floor(prevFrame.x / slotWidth);

            // If ball jumped slots, it passed through a wall
            if (Math.abs(prevSlot - ballSlot) > 1) {
              expect(Math.abs(prevSlot - ballSlot)).toBeLessThanOrEqual(1);
            }
          }
        }
      }
    });
  });

  describe('Stuck Ball Detection', () => {
    it('should never get stuck and always reach a slot', () => {
      const bucketZoneY = BOARD_HEIGHT * 0.7;
      const numTests = 2000; // Large number to catch rare edge cases

      for (let seed = 0; seed < numTests; seed++) {
        const { trajectory, landedSlot } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 7919, // Prime number for better distribution
        });

        // Verify ball reached bucket zone
        const lastFrame = trajectory[trajectory.length - 1]!;
        expect(lastFrame.y).toBeGreaterThanOrEqual(bucketZoneY - 10);

        // Verify ball landed in a valid slot
        expect(landedSlot).toBeGreaterThanOrEqual(0);
        expect(landedSlot).toBeLessThan(SLOT_COUNT);

        // Check for stuck frames (ball not making vertical progress)
        let consecutiveStuckFrames = 0;
        let maxStuckFrames = 0;

        for (let i = 1; i < trajectory.length; i++) {
          const prevFrame = trajectory[i - 1]!;
          const currFrame = trajectory[i]!;

          // Only check frames above bucket zone
          if (currFrame.y < bucketZoneY) {
            const verticalProgress = currFrame.y - prevFrame.y;

            // If ball is not making vertical progress (< 0.5px per frame)
            if (Math.abs(verticalProgress) < 0.5) {
              consecutiveStuckFrames++;
              maxStuckFrames = Math.max(maxStuckFrames, consecutiveStuckFrames);
            } else {
              consecutiveStuckFrames = 0;
            }
          } else {
            // Reset once in bucket zone
            consecutiveStuckFrames = 0;
          }
        }

        // Ball should never be stuck for more than 30 frames (0.5 seconds)
        expect(maxStuckFrames).toBeLessThan(30);
      }
    });

    it('should make consistent downward progress', () => {
      const bucketZoneY = BOARD_HEIGHT * 0.7;
      const numTests = 1000;

      for (let seed = 0; seed < numTests; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 3571,
        });

        // Track Y position every 10 frames
        const yCheckpoints: number[] = [];
        for (let i = 15; i < trajectory.length && trajectory[i]!.y < bucketZoneY; i += 10) {
          yCheckpoints.push(trajectory[i]!.y);
        }

        // Verify ball makes net downward progress overall (not every checkpoint, due to bouncing)
        if (yCheckpoints.length >= 2) {
          const totalProgress = yCheckpoints[yCheckpoints.length - 1]! - yCheckpoints[0]!;
          // Overall progress should be downward (allow for some bouncing)
          expect(totalProgress).toBeGreaterThan(20);
        }
      }
    });
  });

  describe('Realistic Speed Limits', () => {
    it('should never exceed realistic speed limits', () => {
      const MAX_REALISTIC_SPEED = 800; // px/s - physics constant from trajectory.ts
      const numTests = 2000;

      for (let seed = 0; seed < numTests; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 9973,
        });

        // Check every frame for speed violations
        for (const frame of trajectory) {
          const speed = Math.sqrt((frame.vx ?? 0) ** 2 + (frame.vy ?? 0) ** 2);

          // Speed should never exceed the maximum
          expect(speed).toBeLessThanOrEqual(MAX_REALISTIC_SPEED);

          // Log violation for debugging
          if (speed > MAX_REALISTIC_SPEED) {
            console.error(
              `Speed violation at frame ${frame.frame}: ${speed.toFixed(2)}px/s (max: ${MAX_REALISTIC_SPEED}px/s)`
            );
            console.error(`  Position: (${frame.x.toFixed(2)}, ${frame.y.toFixed(2)})`);
            console.error(`  Velocity: (${frame.vx?.toFixed(2)}, ${frame.vy?.toFixed(2)})`);
          }
        }
      }
    });

    it('should have realistic frame-to-frame distance', () => {
      const dt = 1 / 60; // 60 FPS
      const MAX_REALISTIC_SPEED = 800;
      const MAX_DISTANCE_PER_FRAME = MAX_REALISTIC_SPEED * dt; // ~13.33px at 800px/s
      const numTests = 1000;

      for (let seed = 0; seed < numTests; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 6151,
        });

        // Check frame-to-frame distance
        for (let i = 1; i < trajectory.length; i++) {
          const prevFrame = trajectory[i - 1]!;
          const currFrame = trajectory[i]!;

          const dx = currFrame.x - prevFrame.x;
          const dy = currFrame.y - prevFrame.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Distance should not exceed max realistic distance
          // Add small tolerance for numerical precision
          expect(distance).toBeLessThanOrEqual(MAX_DISTANCE_PER_FRAME + 0.5);

          // Log violation for debugging
          if (distance > MAX_DISTANCE_PER_FRAME + 0.5) {
            console.error(
              `Distance violation between frames ${prevFrame.frame} and ${currFrame.frame}: ${distance.toFixed(2)}px (max: ${MAX_DISTANCE_PER_FRAME.toFixed(2)}px)`
            );
            console.error(`  From: (${prevFrame.x.toFixed(2)}, ${prevFrame.y.toFixed(2)})`);
            console.error(`  To: (${currFrame.x.toFixed(2)}, ${currFrame.y.toFixed(2)})`);
          }
        }
      }
    });

    it('should maintain terminal velocity cap', () => {
      const TERMINAL_VELOCITY = 600; // px/s - from trajectory.ts
      const numTests = 1000;

      for (let seed = 0; seed < numTests; seed++) {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: seed * 4993,
        });

        // Check vertical velocity in free fall
        for (let i = 1; i < trajectory.length; i++) {
          const currFrame = trajectory[i]!;

          // Skip collision frames
          if (
            currFrame.pegHit ||
            currFrame.bucketFloorHit ||
            currFrame.wallHit ||
            currFrame.bucketWallHit
          )
            continue;

          const vy = Math.abs(currFrame.vy ?? 0);

          // Vertical velocity should not exceed terminal velocity (with tolerance for rounding)
          expect(vy).toBeLessThanOrEqual(TERMINAL_VELOCITY + 1);
        }
      }
    });
  });

  describe('Realistic Acceleration', () => {
    it('should maintain realistic acceleration throughout trajectory', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 99999,
      });

      const dt = 1 / 60; // 60 FPS
      const maxRealisticAcceleration = GRAVITY * 1.5; // Allow 50% over gravity for guidance
      const bucketZoneY = BOARD_HEIGHT * 0.7;

      // Skip initial rest frames
      let startIdx = 0;
      for (let i = 0; i < trajectory.length - 1; i++) {
        if (trajectory[i]!.vx !== 0 || trajectory[i]!.vy !== 0) {
          startIdx = i;
          break;
        }
      }

      // Check acceleration between frames
      for (let i = startIdx + 1; i < trajectory.length - 1; i++) {
        const prevFrame = trajectory[i - 1]!;
        const currFrame = trajectory[i]!;

        // Skip collision frames as they have instant velocity changes
        if (
          currFrame.pegHit ||
          currFrame.bucketFloorHit ||
          currFrame.wallHit ||
          currFrame.bucketWallHit
        )
          continue;

        // Calculate acceleration
        const ax = (currFrame.vx! - prevFrame.vx!) / dt;
        const ay = (currFrame.vy! - prevFrame.vy!) / dt;
        const totalAccel = Math.sqrt(ax * ax + ay * ay);

        // After last peg row, vertical acceleration should be dominated by gravity
        // Skip bucket floor frames where ball bounces (vy changes sign)
        if (currFrame.y > bucketZoneY && prevFrame.y > bucketZoneY) {
          const vySign = Math.sign(currFrame.vy ?? 0);
          const prevVySign = Math.sign(prevFrame.vy ?? 0);

          // Skip bounce frames where vy changes sign (floor collision)
          if (vySign === prevVySign || vySign === 0 || prevVySign === 0) {
            // In bucket zone free fall - should be mostly gravity
            // Allow 100% tolerance for air resistance and damping
            expect(Math.abs(ay)).toBeLessThan(GRAVITY * 2);

            // Horizontal acceleration should be minimal
            expect(Math.abs(ax)).toBeLessThan(500);
          }
        }

        // Overall acceleration should never be too extreme
        expect(totalAccel).toBeLessThan(maxRealisticAcceleration * 2);
      }
    });

    it('should show natural free fall after last peg row', () => {
      const { trajectory } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 77777,
      });

      // Find last peg hit
      let lastPegHitIdx = -1;
      for (let i = trajectory.length - 1; i >= 0; i--) {
        if (trajectory[i]!.pegHit) {
          lastPegHitIdx = i;
          break;
        }
      }

      expect(lastPegHitIdx).toBeGreaterThan(0);

      // Check velocity profile after last peg
      const framesAfterLastPeg = trajectory.slice(lastPegHitIdx + 1);

      // Vertical velocity should generally increase (falling)
      let increasingVyCount = 0;
      let totalFrames = 0;

      for (let i = 1; i < framesAfterLastPeg.length - 30; i++) {
        // Skip settling frames
        const prevFrame = framesAfterLastPeg[i - 1]!;
        const currFrame = framesAfterLastPeg[i]!;

        totalFrames++;
        if (currFrame.vy! >= prevFrame.vy!) {
          increasingVyCount++;
        }
      }

      // At least 70% of frames should show increasing vertical velocity (falling)
      const increasingRatio = increasingVyCount / totalFrames;
      expect(increasingRatio).toBeGreaterThan(0.7);
    });
  });
});

/**
 * Helper function to check if a path crosses through a peg
 */
function doesPathCrossPeg(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pegX: number,
  pegY: number,
  radius: number
): boolean {
  // Vector from start to end
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Vector from start to peg center
  const fx = pegX - x1;
  const fy = pegY - y1;

  // Project peg center onto line
  const a = dx * dx + dy * dy;
  if (a === 0) return false; // Start and end are same point

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  // Check discriminant
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false; // No intersection

  // Calculate intersection points
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

  // Check if intersection is within line segment
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}
