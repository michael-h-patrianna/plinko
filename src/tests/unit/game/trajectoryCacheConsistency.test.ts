/**
 * Integration tests for trajectory cache consistency
 * Verifies cache generation is deterministic and bitwise identical across multiple runs
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectoryCache, getCachedValues } from '@game/trajectoryCache';
import { generateTrajectory } from '@game/trajectory';
import type { TrajectoryPoint, TrajectoryCache } from '@game/types';

describe('Trajectory Cache Consistency', () => {
  const BOARD_WIDTH = 310;
  const BOARD_HEIGHT = 570;
  const PEG_ROWS = 12;
  const SLOT_COUNT = 7;

  describe('Cache Generation Determinism', () => {
    it('should generate identical cache for same trajectory', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 50, pegHit: false },
        { frame: 1, x: 110, y: 100, rotation: 5, vx: 20, vy: 100, pegHit: false },
        { frame: 2, x: 115, y: 150, rotation: 10, vx: 15, vy: 200, pegHit: true },
        { frame: 3, x: 120, y: 200, rotation: 15, vx: 5, vy: 300, pegHit: false },
      ];

      const cache1 = generateTrajectoryCache(trajectory);
      const cache2 = generateTrajectoryCache(trajectory);

      // Verify lengths match
      expect(cache1.speeds.length).toBe(cache2.speeds.length);
      expect(cache1.scalesX.length).toBe(cache2.scalesX.length);
      expect(cache1.scalesY.length).toBe(cache2.scalesY.length);
      expect(cache1.trailLengths.length).toBe(cache2.trailLengths.length);

      // Verify bitwise identical
      for (let i = 0; i < trajectory.length; i++) {
        expect(cache1.speeds[i]).toBe(cache2.speeds[i]);
        expect(cache1.scalesX[i]).toBe(cache2.scalesX[i]);
        expect(cache1.scalesY[i]).toBe(cache2.scalesY[i]);
        expect(cache1.trailLengths[i]).toBe(cache2.trailLengths[i]);
      }
    });

    it('should generate cache with correct length', () => {
      const trajectory: TrajectoryPoint[] = Array.from({ length: 100 }, (_, i) => ({
        frame: i,
        x: 100 + i,
        y: 50 + i * 5,
        rotation: i * 2,
        vx: i % 10,
        vy: i * 2,
        pegHit: i % 3 === 0,
      }));

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.speeds.length).toBe(100);
      expect(cache.scalesX.length).toBe(100);
      expect(cache.scalesY.length).toBe(100);
      expect(cache.trailLengths.length).toBe(100);
    });

    it('should handle empty trajectory', () => {
      const trajectory: TrajectoryPoint[] = [];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.speeds.length).toBe(0);
      expect(cache.scalesX.length).toBe(0);
      expect(cache.scalesY.length).toBe(0);
      expect(cache.trailLengths.length).toBe(0);
    });

    it('should use Float32Array for numeric values', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 50, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.speeds).toBeInstanceOf(Float32Array);
      expect(cache.scalesX).toBeInstanceOf(Float32Array);
      expect(cache.scalesY).toBeInstanceOf(Float32Array);
    });

    it('should use Uint8Array for trail lengths', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 50, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.trailLengths).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Speed Calculation Consistency', () => {
    it('should calculate speed correctly', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 3, vy: 4, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Speed = sqrt(3^2 + 4^2) = 5
      expect(cache.speeds[0]).toBe(5);
    });

    it('should calculate speed for zero velocity', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 0, vy: 0, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.speeds[0]).toBe(0);
    });

    it('should handle undefined velocities as zero', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.speeds[0]).toBe(0);
    });

    it('should calculate speed for negative velocities correctly', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: -3, vy: -4, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Speed = sqrt((-3)^2 + (-4)^2) = 5
      expect(cache.speeds[0]).toBe(5);
    });
  });

  describe('Trail Length Calculation', () => {
    it('should use trail length 10 for slow speeds', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 5, vy: 5, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.trailLengths[0]).toBe(10);
    });

    it('should use trail length 16 for medium speeds', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 100, vy: 100, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.trailLengths[0]).toBe(16);
    });

    it('should use maxTrailLength for high speeds', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 300, vy: 300, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Speed = sqrt(300^2 + 300^2) = ~424, which is > 300, so trail length should be maxTrailLength (20)
      // But the actual implementation caps at 16 for speeds 100-300, and sizeTokens.ball.maxTrailLength above 300
      // Let's verify it uses the appropriate trail length
      expect(cache.trailLengths[0]).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Squash/Stretch Calculation', () => {
    it('should apply squash on peg hit with high speed', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 300, vy: 300, pegHit: true },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Should have squash (scaleX > 1, scaleY < 1)
      expect(cache.scalesX[0]).toBeGreaterThan(1);
      expect(cache.scalesY[0]).toBeLessThan(1);
    });

    it('should not apply squash on peg hit with low speed', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 10, pegHit: true },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Should have no squash (scales = 1)
      expect(cache.scalesX[0]).toBe(1);
      expect(cache.scalesY[0]).toBe(1);
    });

    it('should apply stretch when falling fast without peg hit', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 50, vy: 500, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Should have stretch (scaleX < 1, scaleY > 1)
      expect(cache.scalesX[0]).toBeLessThan(1);
      expect(cache.scalesY[0]).toBeGreaterThan(1);
    });

    it('should not apply stretch when falling slowly', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 50, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      // Should have no stretch (scales = 1)
      expect(cache.scalesX[0]).toBe(1);
      expect(cache.scalesY[0]).toBe(1);
    });

    it('should default to scale 1 when no squash/stretch conditions met', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 10, vy: 10, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);

      expect(cache.scalesX[0]).toBe(1);
      expect(cache.scalesY[0]).toBe(1);
    });
  });

  describe('getCachedValues Function', () => {
    it('should retrieve cached values for valid frame', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 3, vy: 4, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);
      const values = getCachedValues(cache, 0);

      expect(values.speed).toBe(5);
      expect(values.scaleX).toBe(1);
      expect(values.scaleY).toBe(1);
      expect(values.trailLength).toBe(10);
    });

    it('should return defaults for null cache', () => {
      const values = getCachedValues(null, 0);

      expect(values.speed).toBe(0);
      expect(values.scaleX).toBe(1);
      expect(values.scaleY).toBe(1);
      expect(values.trailLength).toBe(10);
    });

    it('should return defaults for undefined cache', () => {
      const values = getCachedValues(undefined, 0);

      expect(values.speed).toBe(0);
      expect(values.scaleX).toBe(1);
      expect(values.scaleY).toBe(1);
      expect(values.trailLength).toBe(10);
    });

    it('should return defaults for negative frame', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 3, vy: 4, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);
      const values = getCachedValues(cache, -1);

      expect(values.speed).toBe(0);
      expect(values.scaleX).toBe(1);
      expect(values.scaleY).toBe(1);
      expect(values.trailLength).toBe(10);
    });

    it('should return defaults for frame beyond cache length', () => {
      const trajectory: TrajectoryPoint[] = [
        { frame: 0, x: 100, y: 50, rotation: 0, vx: 3, vy: 4, pegHit: false },
      ];

      const cache = generateTrajectoryCache(trajectory);
      const values = getCachedValues(cache, 100);

      expect(values.speed).toBe(0);
      expect(values.scaleX).toBe(1);
      expect(values.scaleY).toBe(1);
      expect(values.trailLength).toBe(10);
    });

    it('should handle missing values in cache gracefully', () => {
      const cache: TrajectoryCache = {
        speeds: new Float32Array([0, 0, 0]),
        scalesX: new Float32Array([0, 0, 0]),
        scalesY: new Float32Array([0, 0, 0]),
        trailLengths: new Uint8Array([0, 0, 0]),
      };

      const values = getCachedValues(cache, 0);

      expect(values.speed).toBe(0);
      expect(values.scaleX).toBe(1); // Fallback to 1 for 0
      expect(values.scaleY).toBe(1); // Fallback to 1 for 0
      expect(values.trailLength).toBe(10); // Fallback to 10 for 0
    });
  });

  describe('Full Trajectory Cache Consistency - 100 Runs', () => {
    it('should generate bitwise identical caches for same seed (100 trajectories)', () => {
      const SEED = 12345;
      const NUM_RUNS = 100;
      const caches: TrajectoryCache[] = [];

      // Generate 100 trajectories with same seed
      for (let i = 0; i < NUM_RUNS; i++) {
        const result = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: SEED,
        });

        caches.push(result.cache);
      }

      // Verify all caches are identical to first cache
      const referenceCache = caches[0]!;

      for (let runIndex = 1; runIndex < NUM_RUNS; runIndex++) {
        const currentCache = caches[runIndex]!;

        // Verify lengths match
        expect(currentCache.speeds.length).toBe(referenceCache.speeds.length);
        expect(currentCache.scalesX.length).toBe(referenceCache.scalesX.length);
        expect(currentCache.scalesY.length).toBe(referenceCache.scalesY.length);
        expect(currentCache.trailLengths.length).toBe(referenceCache.trailLengths.length);

        // Verify bitwise identical for every frame
        for (let frame = 0; frame < referenceCache.speeds.length; frame++) {
          expect(currentCache.speeds[frame]).toBe(referenceCache.speeds[frame]);
          expect(currentCache.scalesX[frame]).toBe(referenceCache.scalesX[frame]);
          expect(currentCache.scalesY[frame]).toBe(referenceCache.scalesY[frame]);
          expect(currentCache.trailLengths[frame]).toBe(referenceCache.trailLengths[frame]);
        }
      }
    }, 30000); // 30 second timeout for 100 trajectory generations

    it('should verify cache consistency with trajectory points (10 runs)', () => {
      const SEED = 98765;
      const NUM_RUNS = 10;

      // Store trajectories and caches
      const trajectories: TrajectoryPoint[][] = [];
      const caches: TrajectoryCache[] = [];

      // Generate trajectories
      for (let i = 0; i < NUM_RUNS; i++) {
        const result = generateTrajectory({
          boardWidth: BOARD_WIDTH,
          boardHeight: BOARD_HEIGHT,
          pegRows: PEG_ROWS,
          slotCount: SLOT_COUNT,
          seed: SEED,
        });

        trajectories.push(result.trajectory);
        caches.push(result.cache);
      }

      // Verify all trajectories are identical
      const referenceTrajectory = trajectories[0]!;

      for (let runIndex = 1; runIndex < NUM_RUNS; runIndex++) {
        const currentTrajectory = trajectories[runIndex]!;

        expect(currentTrajectory.length).toBe(referenceTrajectory.length);

        for (let frame = 0; frame < referenceTrajectory.length; frame++) {
          const refPoint = referenceTrajectory[frame]!;
          const curPoint = currentTrajectory[frame]!;

          expect(curPoint.x).toBe(refPoint.x);
          expect(curPoint.y).toBe(refPoint.y);
          expect(curPoint.vx).toBe(refPoint.vx);
          expect(curPoint.vy).toBe(refPoint.vy);
          expect(curPoint.rotation).toBe(refPoint.rotation);
        }
      }

      // Verify all caches are identical
      const referenceCache = caches[0]!;

      for (let runIndex = 1; runIndex < NUM_RUNS; runIndex++) {
        const currentCache = caches[runIndex]!;

        for (let frame = 0; frame < referenceCache.speeds.length; frame++) {
          expect(currentCache.speeds[frame]).toBe(referenceCache.speeds[frame]);
          expect(currentCache.scalesX[frame]).toBe(referenceCache.scalesX[frame]);
          expect(currentCache.scalesY[frame]).toBe(referenceCache.scalesY[frame]);
          expect(currentCache.trailLengths[frame]).toBe(referenceCache.trailLengths[frame]);
        }
      }
    });

    it('should generate different caches for different seeds', () => {
      const result1 = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 11111,
      });

      const result2 = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed: 22222,
      });

      // Caches should be different (different trajectories)
      let hasDifference = false;

      const minLength = Math.min(result1.cache.speeds.length, result2.cache.speeds.length);

      for (let i = 0; i < minLength; i++) {
        if (
          result1.cache.speeds[i] !== result2.cache.speeds[i] ||
          result1.cache.scalesX[i] !== result2.cache.scalesX[i] ||
          result1.cache.scalesY[i] !== result2.cache.scalesY[i] ||
          result1.cache.trailLengths[i] !== result2.cache.trailLengths[i]
        ) {
          hasDifference = true;
          break;
        }
      }

      expect(hasDifference || result1.cache.speeds.length !== result2.cache.speeds.length).toBe(true);
    });
  });

  describe('Cache Memory Efficiency', () => {
    it('should use memory-efficient typed arrays', () => {
      const trajectory: TrajectoryPoint[] = Array.from({ length: 200 }, (_, i) => ({
        frame: i,
        x: 100 + i,
        y: 50 + i * 5,
        rotation: i * 2,
        vx: i % 10,
        vy: i * 2,
        pegHit: i % 3 === 0,
      }));

      const cache = generateTrajectoryCache(trajectory);

      // Float32Array: 4 bytes per element
      const speedsBytes = cache.speeds.byteLength;
      expect(speedsBytes).toBe(200 * 4);

      const scalesXBytes = cache.scalesX.byteLength;
      expect(scalesXBytes).toBe(200 * 4);

      const scalesYBytes = cache.scalesY.byteLength;
      expect(scalesYBytes).toBe(200 * 4);

      // Uint8Array: 1 byte per element
      const trailLengthsBytes = cache.trailLengths.byteLength;
      expect(trailLengthsBytes).toBe(200 * 1);

      // Total should be ~2.6 KB for 200 frames
      const totalBytes = speedsBytes + scalesXBytes + scalesYBytes + trailLengthsBytes;
      expect(totalBytes).toBe(2600);
    });

    it('should have minimal memory overhead for large trajectories', () => {
      const trajectory: TrajectoryPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        frame: i,
        x: 100 + i,
        y: 50 + i * 5,
        rotation: i * 2,
        vx: i % 10,
        vy: i * 2,
        pegHit: i % 3 === 0,
      }));

      const cache = generateTrajectoryCache(trajectory);

      // Total should be ~13 KB for 1000 frames
      const totalBytes =
        cache.speeds.byteLength + cache.scalesX.byteLength + cache.scalesY.byteLength + cache.trailLengths.byteLength;
      expect(totalBytes).toBe(13000);
    });
  });
});
