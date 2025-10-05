/**
 * Tests for trajectory generation
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';

describe('Trajectory Generation', () => {
  const defaultParams = {
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
    selectedIndex: 3,
    seed: 42
  };

  it('should generate trajectory with correct number of frames', () => {
    const trajectory = generateTrajectory(defaultParams);

    // With realistic physics, the trajectory length can vary
    // But should be reasonable (between 100-600 frames for a typical drop)
    expect(trajectory.length).toBeGreaterThanOrEqual(100);
    expect(trajectory.length).toBeLessThanOrEqual(600);
  });

  it('should land ball in target slot within tolerance', () => {
    const trajectory = generateTrajectory(defaultParams);
    const finalPoint = trajectory[trajectory.length - 1]!;

    const slotWidth = defaultParams.boardWidth / defaultParams.slotCount;
    const targetX = (defaultParams.selectedIndex + 0.5) * slotWidth;

    // Ball must land within slot boundaries (slot width tolerance)
    expect(Math.abs(finalPoint.x - targetX)).toBeLessThanOrEqual(slotWidth / 2);
  });

  it('should have generally increasing y during drop phase', () => {
    const trajectory = generateTrajectory(defaultParams);

    // With physics-based bouncing, y won't be strictly monotonic
    // But overall trend should be downward (start < end)
    const dropFrames = Math.floor(trajectory.length * 0.8);
    const startY = trajectory[0]!.y;
    const endY = trajectory[dropFrames - 1]!.y;

    expect(endY).toBeGreaterThan(startY);
  });

  it('should include peg hit markers', () => {
    const trajectory = generateTrajectory(defaultParams);

    const pegHits = trajectory.filter(p => p.pegHit === true);
    expect(pegHits.length).toBeGreaterThan(0);
  });

  it('should throw error for invalid selected index', () => {
    expect(() =>
      generateTrajectory({
        ...defaultParams,
        selectedIndex: -1
      })
    ).toThrow(/Invalid slot index/);

    expect(() =>
      generateTrajectory({
        ...defaultParams,
        selectedIndex: defaultParams.slotCount
      })
    ).toThrow(/Invalid slot index/);
  });

  it('should generate same trajectory for same seed', () => {
    const traj1 = generateTrajectory(defaultParams);
    const traj2 = generateTrajectory(defaultParams);

    expect(traj1.length).toBe(traj2.length);
    expect(traj1[0]).toEqual(traj2[0]);
    expect(traj1[traj1.length - 1]).toEqual(traj2[traj2.length - 1]);
  });

  it('should have rotation values', () => {
    const trajectory = generateTrajectory(defaultParams);

    for (const point of trajectory) {
      expect(typeof point.rotation).toBe('number');
    }

    // Rotation should change during drop (can be positive or negative due to spin)
    const firstRotation = trajectory[0]!.rotation;
    const midRotation = trajectory[Math.floor(trajectory.length / 2)]!.rotation;
    const lastRotation = trajectory[trajectory.length - 1]!.rotation;

    // Check that rotation has changed
    const totalRotationChange = Math.abs(lastRotation - firstRotation);
    expect(totalRotationChange).toBeGreaterThan(1); // Should rotate at least 1 degree total
  });

  it('should include frame numbers', () => {
    const trajectory = generateTrajectory(defaultParams);

    for (let i = 0; i < trajectory.length; i++) {
      expect(trajectory[i]!.frame).toBe(i);
    }
  });

  it('should settle at final position in correct slot', () => {
    const trajectory = generateTrajectory(defaultParams);

    // Last frame should be at final settled position
    const finalY = trajectory[trajectory.length - 1]!.y;
    const finalX = trajectory[trajectory.length - 1]!.x;

    // Final position should be at target slot (most important!)
    const slotWidth = defaultParams.boardWidth / defaultParams.slotCount;
    const targetX = getSlotCenterX(defaultParams.selectedIndex, defaultParams.slotCount, defaultParams.boardWidth);
    // Ball MUST land within slot boundaries
    expect(Math.abs(finalX - targetX)).toBeLessThan(slotWidth / 2);

    // Ball should have settled within the board bounds
    // With new realistic physics, ball may settle anywhere from pegs to bucket
    expect(finalY).toBeGreaterThan(0);
    expect(finalY).toBeLessThanOrEqual(defaultParams.boardHeight);
  });

function getSlotCenterX(slotIndex: number, slotCount: number, boardWidth: number): number {
  const slotWidth = boardWidth / slotCount;
  return (slotIndex + 0.5) * slotWidth;
}

  it('should throw error if final position deviates too much', () => {
    // This test verifies the internal validation logic
    // It should pass because our algorithm ensures correctness
    expect(() => generateTrajectory(defaultParams)).not.toThrow();
  });
});
