/**
 * Test trajectory generation across all mobile viewport sizes
 * Tests: 320px, 360px, 375px, 414px
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';

const VIEWPORT_SIZES = [
  { width: 320, label: 'iPhone SE' },
  { width: 360, label: 'Galaxy S8' },
  { width: 375, label: 'iPhone 12' },
  { width: 414, label: 'iPhone 14 Pro Max' },
];

const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 7;
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS; // 16px
const BORDER_WIDTH = 12;

describe('Trajectory Generation - Mobile Viewport Sizes', () => {
  VIEWPORT_SIZES.forEach(({ width, label }) => {
    describe(`${label} (${width}px)`, () => {
      it('should generate valid trajectories for all slots', () => {
        const results: { slot: number; success: boolean; frames: number }[] = [];

        for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
          const trajectory = generateTrajectory({
            boardWidth: width,
            boardHeight: BOARD_HEIGHT,
            pegRows: PEG_ROWS,
            slotCount: SLOT_COUNT,
            selectedIndex: targetSlot,
            seed: 12345 + targetSlot,
          });

          results.push({
            slot: targetSlot,
            success: trajectory.length > 0,
            frames: trajectory.length,
          });

          // Basic validations
          expect(trajectory.length).toBeGreaterThan(0);
          expect(trajectory.length).toBeLessThan(800);
        }

        // All slots should be reachable
        const allSuccess = results.every((r) => r.success);
        expect(allSuccess).toBe(true);
      });

      it('should have zero ball-peg overlaps', () => {
        const targetSlot = 3; // Middle slot
        const trajectory = generateTrajectory({
          boardWidth: width,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          selectedIndex: targetSlot,
          seed: 99999,
        });

        // Generate peg layout (same logic as trajectory.ts)
        const pegs: { x: number; y: number }[] = [];
        const OPTIMAL_PEG_COLUMNS = 6; // Fixed peg count for optimal spacing
        const pegPadding = PEG_RADIUS + 10;
        const playableWidth = width - BORDER_WIDTH * 2 - pegPadding * 2;
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
            pegs.push({ x, y });
          }
        }

        // Check every frame for overlaps
        let maxOverlap = 0;
        let overlapCount = 0;

        for (const point of trajectory) {
          for (const peg of pegs) {
            const dx = point.x - peg.x;
            const dy = point.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const overlap = COLLISION_RADIUS - distance;

            if (overlap > 0.1) {
              // Allow 0.1px numerical tolerance
              overlapCount++;
              maxOverlap = Math.max(maxOverlap, overlap);
            }
          }
        }

        expect(overlapCount).toBe(0);
        expect(maxOverlap).toBeLessThanOrEqual(0.1);
      });

      it('should have smooth motion (no teleportation)', () => {
        const targetSlot = 3;
        const trajectory = generateTrajectory({
          boardWidth: width,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          selectedIndex: targetSlot,
          seed: 54321,
        });

        let maxFrameDistance = 0;
        let teleportationCount = 0;

        for (let i = 1; i < trajectory.length; i++) {
          const prev = trajectory[i - 1]!;
          const curr = trajectory[i]!;

          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          maxFrameDistance = Math.max(maxFrameDistance, distance);

          // Ball shouldn't move more than 20px per frame (teleportation)
          if (distance > 20) {
            teleportationCount++;
          }
        }

        expect(teleportationCount).toBe(0);
        expect(maxFrameDistance).toBeLessThanOrEqual(20);
      });

      it('should keep ball within board boundaries', () => {
        const targetSlot = 3;
        const trajectory = generateTrajectory({
          boardWidth: width,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          selectedIndex: targetSlot,
          seed: 11111,
        });

        let outOfBoundsCount = 0;

        for (const point of trajectory) {
          // Check X boundaries (with ball radius)
          if (
            point.x - BALL_RADIUS < BORDER_WIDTH ||
            point.x + BALL_RADIUS > width - BORDER_WIDTH
          ) {
            outOfBoundsCount++;
          }

          // Check Y boundaries
          if (point.y - BALL_RADIUS < 0 || point.y + BALL_RADIUS > BOARD_HEIGHT) {
            outOfBoundsCount++;
          }
        }

        // Allow some tolerance for bucket edges
        expect(outOfBoundsCount).toBeLessThan(5);
      });

      it('should land in correct slot', () => {
        for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
          const trajectory = generateTrajectory({
            boardWidth: width,
            boardHeight: BOARD_HEIGHT,
            pegRows: PEG_ROWS,
            slotCount: SLOT_COUNT,
            selectedIndex: targetSlot,
            seed: 22222 + targetSlot,
          });

          const finalPoint = trajectory[trajectory.length - 1]!;

          // Calculate which slot the ball landed in
          const playableWidth = width - BORDER_WIDTH * 2;
          const slotWidth = playableWidth / SLOT_COUNT;
          const xRelative = finalPoint.x - BORDER_WIDTH;
          const landedSlot = Math.min(
            Math.max(0, Math.floor(xRelative / slotWidth)),
            SLOT_COUNT - 1
          );

          expect(landedSlot).toBe(targetSlot);
        }
      });
    });
  });

  it('should generate different trajectories for different viewport sizes', () => {
    const trajectories = VIEWPORT_SIZES.map(({ width }) =>
      generateTrajectory({
        boardWidth: width,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        selectedIndex: 3,
        seed: 77777, // Same seed for comparison
      })
    );

    // Trajectories should have different paths due to different peg layouts
    const firstTraj = trajectories[0];
    let allIdentical = true;

    for (let i = 1; i < trajectories.length; i++) {
      const traj = trajectories[i];

      // Compare a sample of positions (frame 50 if exists)
      if (firstTraj!.length > 50 && traj!.length > 50) {
        const pos1 = firstTraj![50]!;
        const pos2 = traj![50]!;

        if (Math.abs(pos1.x - pos2.x) > 1 || Math.abs(pos1.y - pos2.y) > 1) {
          allIdentical = false;
          break;
        }
      }
    }

    // Trajectories should be different for different viewport sizes
    expect(allIdentical).toBe(false);
  });
});
