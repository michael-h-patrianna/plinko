/**
 * @fileoverview Trail optimization unit tests
 * Tests pre-computed lookup tables for trail opacity/scale calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTrailLookup,
  getCachedTrailLookup,
  prewarmTrailCache,
  clearTrailCache,
  getTrailCacheStats,
  DEFAULT_TRAIL_CONFIG,
} from '../../../animation/trailOptimization';
import { opacityTokens } from '../../../theme/tokens';

describe('trailOptimization', () => {
  beforeEach(() => {
    // Clear cache before each test for isolation
    clearTrailCache();
  });

  describe('buildTrailLookup', () => {
    it('should build correct lookup table for trail length 1', () => {
      const lookup = buildTrailLookup(1);

      expect(lookup).toHaveLength(1);
      expect(lookup[0]).toEqual({
        opacity: opacityTokens[90], // First point always has full opacity (progress = 0/0 = 0)
        scale: 1, // First point always has full scale
      });
    });

    it('should build correct lookup table for trail length 5', () => {
      const lookup = buildTrailLookup(5);

      expect(lookup).toHaveLength(5);

      // First point (progress = 0)
      expect(lookup[0]!.opacity).toBeCloseTo(opacityTokens[90], 2); // 0.9
      expect(lookup[0]!.scale).toBe(1);

      // Last point (progress = 1)
      expect(lookup[4]!.opacity).toBe(opacityTokens[5]); // Min opacity 0.05
      expect(lookup[4]!.scale).toBeCloseTo(0.4, 2); // 1 - 1 * 0.6 = 0.4
    });

    it('should build correct lookup table for trail length 20 (max)', () => {
      const lookup = buildTrailLookup(20);

      expect(lookup).toHaveLength(20);

      // First point
      expect(lookup[0]!.opacity).toBeCloseTo(opacityTokens[90], 2);
      expect(lookup[0]!.scale).toBe(1);

      // Middle point (progress ≈ 0.5)
      const midIndex = 10;
      const midProgress = 10 / 19;
      const expectedMidOpacity = Math.max(
        opacityTokens[90] * Math.pow(1 - midProgress, 2.5),
        opacityTokens[5]
      );
      expect(lookup[midIndex]!.opacity).toBeCloseTo(expectedMidOpacity, 2);

      // Last point
      expect(lookup[19]!.opacity).toBe(opacityTokens[5]);
      expect(lookup[19]!.scale).toBeCloseTo(0.4, 2);
    });

    it('should enforce minimum opacity floor', () => {
      const lookup = buildTrailLookup(20);

      // All opacities should be >= minOpacity
      lookup.forEach((frame) => {
        expect(frame.opacity).toBeGreaterThanOrEqual(opacityTokens[5]);
      });
    });

    it('should enforce minimum scale floor', () => {
      const lookup = buildTrailLookup(20);

      // All scales should be >= minScale
      lookup.forEach((frame) => {
        expect(frame.scale).toBeGreaterThanOrEqual(0.3);
      });
    });

    it('should produce monotonically decreasing opacity', () => {
      const lookup = buildTrailLookup(20);

      for (let i = 1; i < lookup.length; i++) {
        expect(lookup[i]!.opacity).toBeLessThanOrEqual(lookup[i - 1]!.opacity);
      }
    });

    it('should produce monotonically decreasing scale', () => {
      const lookup = buildTrailLookup(20);

      for (let i = 1; i < lookup.length; i++) {
        expect(lookup[i]!.scale).toBeLessThanOrEqual(lookup[i - 1]!.scale);
      }
    });

    it('should match original Math.pow calculation exactly', () => {
      const length = 10;
      const lookup = buildTrailLookup(length);

      for (let i = 0; i < length; i++) {
        const progress = i / Math.max(length - 1, 1);

        // Original calculation
        const expectedOpacity = Math.max(
          opacityTokens[90] * Math.pow(1 - progress, 2.5),
          opacityTokens[5]
        );
        const expectedScale = Math.max(1 - progress * 0.6, 0.3);

        expect(lookup[i]!.opacity).toBeCloseTo(expectedOpacity, 10);
        expect(lookup[i]!.scale).toBeCloseTo(expectedScale, 10);
      }
    });

    it('should support custom trail configuration', () => {
      const customConfig = {
        baseOpacity: 0.8,
        minOpacity: 0.1,
        fadeExponent: 3.0,
        scaleReduction: 0.7,
        minScale: 0.2,
      };

      const lookup = buildTrailLookup(10, customConfig);

      // First point uses custom baseOpacity
      expect(lookup[0]!.opacity).toBeCloseTo(0.8, 2);

      // Last point uses custom minOpacity
      expect(lookup[9]!.opacity).toBe(0.1);

      // Last point uses custom minScale
      expect(lookup[9]!.scale).toBeCloseTo(0.3, 2); // 1 - 1 * 0.7 = 0.3, but min is 0.2
    });
  });

  describe('getCachedTrailLookup', () => {
    it('should cache lookup tables', () => {
      const lookup1 = getCachedTrailLookup(10);
      const lookup2 = getCachedTrailLookup(10);

      // Should return same reference (cached)
      expect(lookup1).toBe(lookup2);
    });

    it('should create separate caches for different lengths', () => {
      const lookup10 = getCachedTrailLookup(10);
      const lookup20 = getCachedTrailLookup(20);

      // Different lengths should have different lookup tables
      expect(lookup10).not.toBe(lookup20);
      expect(lookup10.length).toBe(10);
      expect(lookup20.length).toBe(20);
    });

    it('should use default config when not specified', () => {
      const lookup = getCachedTrailLookup(5);

      expect(lookup[0]!.opacity).toBeCloseTo(DEFAULT_TRAIL_CONFIG.baseOpacity, 2);
    });

    it('should populate cache stats', () => {
      getCachedTrailLookup(5);
      getCachedTrailLookup(10);
      getCachedTrailLookup(15);

      const stats = getTrailCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.keys).toEqual([5, 10, 15]);
    });
  });

  describe('prewarmTrailCache', () => {
    it('should pre-compute common trail lengths', () => {
      prewarmTrailCache(20);

      const stats = getTrailCacheStats();

      // Should have cached all lengths from 1-20
      expect(stats.size).toBeGreaterThanOrEqual(4); // At minimum, common lengths
      expect(stats.keys).toContain(5);
      expect(stats.keys).toContain(10);
      expect(stats.keys).toContain(15);
      expect(stats.keys).toContain(20);
    });

    it('should pre-compute all lengths from 1 to maxLength', () => {
      prewarmTrailCache(10);

      const stats = getTrailCacheStats();

      // Should have all lengths 1-10
      expect(stats.size).toBe(10);
      for (let i = 1; i <= 10; i++) {
        expect(stats.keys).toContain(i);
      }
    });

    it('should make subsequent lookups instant (cached)', () => {
      prewarmTrailCache(20);

      // These should all be cache hits
      const lookup5 = getCachedTrailLookup(5);
      const lookup10 = getCachedTrailLookup(10);
      const lookup20 = getCachedTrailLookup(20);

      expect(lookup5.length).toBe(5);
      expect(lookup10.length).toBe(10);
      expect(lookup20.length).toBe(20);
    });
  });

  describe('clearTrailCache', () => {
    it('should clear all cached lookups', () => {
      getCachedTrailLookup(5);
      getCachedTrailLookup(10);

      expect(getTrailCacheStats().size).toBe(2);

      clearTrailCache();

      expect(getTrailCacheStats().size).toBe(0);
    });

    it('should allow re-building cache after clear', () => {
      const lookup1 = getCachedTrailLookup(10);
      clearTrailCache();
      const lookup2 = getCachedTrailLookup(10);

      // Different references (rebuilt)
      expect(lookup1).not.toBe(lookup2);

      // But same values
      expect(lookup1).toEqual(lookup2);
    });
  });

  describe('performance validation', () => {
    it('should eliminate Math.pow during animation (no computation in lookup)', () => {
      const lookup = getCachedTrailLookup(20);

      // Verify lookup is just array access (no Math.pow needed)
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        // Simulate 1000 frames of animation
        for (let j = 0; j < 20; j++) {
          lookup[j]; // Array access only
        }
      }

      const lookupTime = performance.now() - startTime;

      // Compare with original Math.pow approach
      const startTimePow = performance.now();

      for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 20; j++) {
          const progress = j / 19;
          Math.max(
            opacityTokens[90] * Math.pow(1 - progress, 2.5),
            opacityTokens[5]
          );
          Math.max(1 - progress * 0.6, 0.3);
        }
      }

      const powTime = performance.now() - startTimePow;

      // Lookup should be significantly faster (at least 2x)
      expect(lookupTime).toBeLessThan(powTime / 2);
    });

    it('should handle dynamic trail length changes efficiently', () => {
      // Simulate ball speed changing trail length during animation
      const trailLengths = [5, 10, 15, 20, 15, 10, 5];

      trailLengths.forEach((length) => {
        const lookup = getCachedTrailLookup(length);
        expect(lookup.length).toBe(length);
      });

      // All unique lengths should be cached
      const stats = getTrailCacheStats();
      expect(stats.size).toBe(4); // 5, 10, 15, 20
    });
  });

  describe('edge cases', () => {
    it('should handle trail length 0', () => {
      const lookup = buildTrailLookup(0);
      expect(lookup).toHaveLength(0);
    });

    it('should handle very large trail length', () => {
      const lookup = buildTrailLookup(100);
      expect(lookup).toHaveLength(100);
      expect(lookup[0]!.opacity).toBeCloseTo(opacityTokens[90], 2);
      expect(lookup[99]!.opacity).toBe(opacityTokens[5]);
    });

    it('should handle fractional progress correctly', () => {
      const lookup = buildTrailLookup(3);

      // progress = 0, 0.5, 1
      expect(lookup[0]!.opacity).toBeCloseTo(opacityTokens[90], 2);
      expect(lookup[1]!.opacity).toBeCloseTo(
        Math.max(opacityTokens[90] * Math.pow(0.5, 2.5), opacityTokens[5]),
        2
      );
      expect(lookup[2]!.opacity).toBe(opacityTokens[5]);
    });
  });

  describe('visual quality preservation', () => {
    it('should maintain smooth fade curve', () => {
      const lookup = buildTrailLookup(20);

      // Calculate opacity deltas between consecutive points
      const deltas: number[] = [];
      for (let i = 1; i < lookup.length; i++) {
        deltas.push(lookup[i - 1]!.opacity - lookup[i]!.opacity);
      }

      // Deltas should be positive (decreasing) and relatively smooth
      deltas.forEach((delta) => {
        expect(delta).toBeGreaterThanOrEqual(0); // Monotonic decrease
      });

      // Standard deviation of deltas should be reasonable (smooth curve)
      const mean = deltas.reduce((a, b) => a + b) / deltas.length;
      const variance = deltas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / deltas.length;
      const stdDev = Math.sqrt(variance);

      expect(stdDev).toBeLessThan(0.1); // Relatively smooth transitions
    });

    it('should produce visually identical results to original implementation', () => {
      const lengths = [5, 10, 15, 20];

      lengths.forEach((length) => {
        const lookup = buildTrailLookup(length);

        // Compare each point with original calculation
        for (let i = 0; i < length; i++) {
          const progress = i / Math.max(length - 1, 1);

          // Original
          const originalOpacity = Math.max(
            opacityTokens[90] * Math.pow(1 - progress, 2.5),
            opacityTokens[5]
          );
          const originalScale = Math.max(1 - progress * 0.6, 0.3);

          // Optimized
          expect(lookup[i]!.opacity).toBeCloseTo(originalOpacity, 10);
          expect(lookup[i]!.scale).toBeCloseTo(originalScale, 10);
        }
      });
    });
  });
});
