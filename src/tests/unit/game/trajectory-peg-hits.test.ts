/**
 * Test that peg hit information is properly recorded in trajectories
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../../../game/trajectory';

const VIEWPORT_SIZES = [320, 360, 375, 414];

describe('Trajectory Peg Hit Recording', () => {
  VIEWPORT_SIZES.forEach((boardWidth) => {
    describe(`Viewport ${boardWidth}px`, () => {
      it('should record peg hits in trajectory data', () => {
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 12345,
        });

        // Count frames with peg hits
        const framesWithPegHits = trajectory.filter((point: any) => point.pegHit === true);
        const uniquePegsHit = new Set<string>();

        framesWithPegHits.forEach((point: any) => {
          if (point.pegHitRow !== undefined && point.pegHitCol !== undefined) {
            const pegKey = `${point.pegHitRow}-${point.pegHitCol}`;
            uniquePegsHit.add(pegKey);
          }
        });

        console.log(`\n${boardWidth}px viewport:`);
        console.log(`  Total frames: ${trajectory.length}`);
        console.log(`  Frames with peg hits: ${framesWithPegHits.length}`);
        console.log(`  Unique pegs hit: ${uniquePegsHit.size}`);
        console.log(
          `  Peg hit rate: ${((framesWithPegHits.length / trajectory.length) * 100).toFixed(1)}%`
        );

        // Should have hit some pegs
        expect(uniquePegsHit.size).toBeGreaterThan(0);
        expect(framesWithPegHits.length).toBeGreaterThan(0);

        // Every frame with pegHit=true should have row and col defined
        framesWithPegHits.forEach((point) => {
          expect(point.pegHitRow).toBeDefined();
          expect(point.pegHitCol).toBeDefined();
          expect(typeof point.pegHitRow).toBe('number');
          expect(typeof point.pegHitCol).toBe('number');
        });
      });

      it('should have pegHit data structure correct', () => {
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 99999,
        });

        // Check each frame has the required fields
        trajectory.forEach((point: any) => {
          expect(point).toHaveProperty('pegHit');
          expect(typeof point.pegHit).toBe('boolean');

          // If pegHit is true, row and col should be defined
          if (point.pegHit === true) {
            expect(point.pegHitRow).toBeDefined();
            expect(point.pegHitCol).toBeDefined();
          }

          // If pegHit is false, row and col should be undefined
          if (point.pegHit === false) {
            expect(point.pegHitRow).toBeUndefined();
            expect(point.pegHitCol).toBeUndefined();
          }
        });
      });

      it('should record consecutive peg hits correctly', () => {
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 54321,
        });

        let consecutiveHits = 0;
        let maxConsecutiveHits = 0;
        let currentConsecutive = 0;

        for (let i = 0; i < trajectory.length; i++) {
          if (trajectory[i]!.pegHit === true) {
            currentConsecutive++;
            maxConsecutiveHits = Math.max(maxConsecutiveHits, currentConsecutive);
          } else {
            if (currentConsecutive > 0) {
              consecutiveHits++;
              currentConsecutive = 0;
            }
          }
        }

        console.log(`\n${boardWidth}px - Consecutive hits analysis:`);
        console.log(`  Max consecutive hit frames: ${maxConsecutiveHits}`);
        console.log(`  Number of hit sequences: ${consecutiveHits}`);

        // Ball should hit pegs but not stick to them for too long
        // Most hits should be 1-5 frames (binary search makes this brief)
        expect(maxConsecutiveHits).toBeLessThan(20);
      });

      it('should not have duplicate peg hits in same frame', () => {
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 77777,
        });

        // Each frame should only hit ONE peg (or none)
        trajectory.forEach((point: any) => {
          if (point.pegHit === true) {
            // Should have exactly one peg defined
            expect(point.pegHitRow).toBeDefined();
            expect(point.pegHitCol).toBeDefined();

            // Row and col should be valid integers
            expect(Number.isInteger(point.pegHitRow!)).toBe(true);
            expect(Number.isInteger(point.pegHitCol!)).toBe(true);

            // Row should be in valid range
            expect(point.pegHitRow).toBeGreaterThanOrEqual(0);
            expect(point.pegHitRow).toBeLessThan(10);

            // Col should be in valid range (depends on row offset)
            expect(point.pegHitCol).toBeGreaterThanOrEqual(0);
            expect(point.pegHitCol).toBeLessThanOrEqual(7);
          }
        });
      });

      it('should show all peg hits when logged', () => {
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 11111,
        });

        const pegHits: Array<{ frame: number; row: number; col: number }> = [];

        trajectory.forEach((point: any, frameIndex: number) => {
          if (
            point.pegHit === true &&
            point.pegHitRow !== undefined &&
            point.pegHitCol !== undefined
          ) {
            pegHits.push({
              frame: frameIndex,
              row: point.pegHitRow,
              col: point.pegHitCol,
            });
          }
        });

        console.log(`\n${boardWidth}px - Detailed peg hits:`);
        pegHits.slice(0, 10).forEach((hit) => {
          console.log(`  Frame ${hit.frame}: Peg (${hit.row}, ${hit.col})`);
        });
        if (pegHits.length > 10) {
          console.log(`  ... and ${pegHits.length - 10} more hits`);
        }

        expect(pegHits.length).toBeGreaterThan(0);
      });
    });
  });
});
