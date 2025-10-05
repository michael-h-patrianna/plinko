/**
 * Tests for drop zone trajectory generation
 * Validates that trajectories can be generated from specific drop zones
 * and that the ball starts in the correct position
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';
import type { DropZone } from '../game/types';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 7;

/**
 * Get expected X coordinate range for a drop zone
 */
function getExpectedXRange(zone: DropZone, boardWidth: number): { min: number; max: number } {
  const ranges: Record<DropZone, { min: number; max: number }> = {
    'left': { min: boardWidth * 0.05, max: boardWidth * 0.15 },
    'left-center': { min: boardWidth * 0.25, max: boardWidth * 0.35 },
    'center': { min: boardWidth * 0.45, max: boardWidth * 0.55 },
    'right-center': { min: boardWidth * 0.65, max: boardWidth * 0.75 },
    'right': { min: boardWidth * 0.85, max: boardWidth * 0.95 },
  };
  return ranges[zone];
}

describe('Drop Zone Trajectory Generation', () => {
  const DROP_ZONES: DropZone[] = ['left', 'left-center', 'center', 'right-center', 'right'];

  DROP_ZONES.forEach((dropZone) => {
    describe(`Drop zone: ${dropZone}`, () => {
      it('should generate a valid trajectory with the specified drop zone', () => {
        const { trajectory, landedSlot } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 12345,
          dropZone,
        });

        // Trajectory should exist and have frames
        expect(trajectory).toBeDefined();
        expect(trajectory.length).toBeGreaterThan(0);

        // Should land in a valid slot
        expect(landedSlot).toBeGreaterThanOrEqual(0);
        expect(landedSlot).toBeLessThan(SLOT_COUNT);
      });

      it('should start the ball in the correct drop zone X range', () => {
        const { trajectory } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 12345,
          dropZone,
        });

        // Get the starting position (skip initial rest frames)
        const startFrame = trajectory[15]; // After 15 rest frames
        expect(startFrame).toBeDefined();

        const expectedRange = getExpectedXRange(dropZone, BOARD_WIDTH);

        // Ball should start within the expected X range for this zone
        expect(startFrame!.x).toBeGreaterThanOrEqual(expectedRange.min);
        expect(startFrame!.x).toBeLessThanOrEqual(expectedRange.max);
      });

      it('should generate different trajectories with different seeds for same drop zone', () => {
        const result1 = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 12345,
          dropZone,
        });

        const result2 = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 54321,
          dropZone,
        });

        // Different seeds should produce different results
        const isDifferent =
          result1.landedSlot !== result2.landedSlot ||
          result1.trajectory.length !== result2.trajectory.length;

        expect(isDifferent).toBe(true);
      });

      it('should generate identical trajectories with same seed and drop zone', () => {
        const result1 = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 99999,
          dropZone,
        });

        const result2 = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: 99999,
          dropZone,
        });

        // Same seed and drop zone should produce identical results
        expect(result1.landedSlot).toBe(result2.landedSlot);
        expect(result1.trajectory.length).toBe(result2.trajectory.length);

        // Check first few frames are identical
        for (let i = 0; i < Math.min(10, result1.trajectory.length); i++) {
          expect(result1.trajectory[i]!.x).toBeCloseTo(result2.trajectory[i]!.x, 5);
          expect(result1.trajectory[i]!.y).toBeCloseTo(result2.trajectory[i]!.y, 5);
        }
      });
    });
  });

  it('should generate trajectories from all 5 drop zones successfully', () => {
    const results = DROP_ZONES.map((zone) =>
      generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 12345,
        dropZone: zone,
      })
    );

    // All zones should produce valid trajectories
    results.forEach((result) => {
      expect(result.trajectory.length).toBeGreaterThan(0);
      expect(result.landedSlot).toBeGreaterThanOrEqual(0);
      expect(result.landedSlot).toBeLessThan(SLOT_COUNT);
    });

    // Starting positions should be spread across the board
    const startPositions = results.map((r) => r.trajectory[15]!.x);
    const minX = Math.min(...startPositions);
    const maxX = Math.max(...startPositions);

    // There should be significant spread (at least 50% of board width)
    expect(maxX - minX).toBeGreaterThan(BOARD_WIDTH * 0.5);
  });

  it('should work without drop zone (backward compatibility)', () => {
    const { trajectory, landedSlot } = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      seed: 12345,
      // No dropZone specified - should default to center area
    });

    expect(trajectory.length).toBeGreaterThan(0);
    expect(landedSlot).toBeGreaterThanOrEqual(0);
    expect(landedSlot).toBeLessThan(SLOT_COUNT);

    // Should start near center when no drop zone specified
    const startX = trajectory[15]!.x;
    const centerX = BOARD_WIDTH / 2;
    expect(Math.abs(startX - centerX)).toBeLessThan(10); // Within 10px of center
  });

  it('should maintain physics validity with drop zones', () => {
    const { trajectory } = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      seed: 12345,
      dropZone: 'left',
    });

    // Check frame-to-frame motion is continuous (no teleportation)
    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1]!;
      const curr = trajectory[i]!;

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Max movement per frame at 60fps should be reasonable
      expect(distance).toBeLessThanOrEqual(20);
    }
  });

  it('should generate trajectories to all slots from different zones', () => {
    const testCases: Array<{ zone: DropZone }> = [
      { zone: 'left' },
      { zone: 'center' },
      { zone: 'right' },
    ];

    testCases.forEach(({ zone }) => {
      const results: number[] = [];

      // Try multiple seeds to find trajectories to different slots
      for (let seed = 0; seed < 100 && results.length < 2; seed++) {
        const { landedSlot } = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed,
          dropZone: zone,
        });

        if (!results.includes(landedSlot)) {
          results.push(landedSlot);
        }
      }

      // Should be able to reach multiple different slots from each zone
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });
});
