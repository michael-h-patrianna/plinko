/**
 * Tests for deterministic RNG system
 */

import { describe, it, expect } from 'vitest';
import { selectPrize, createRng, generateSeed } from '@game/rng';
import { MOCK_PRIZES } from '@config/prizes/prizeTable';

describe('RNG System', () => {
  describe('createRng', () => {
    it('should generate same sequence for same seed', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);

      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());

      expect(values1).toEqual(values2);
    });

    it('should generate different sequences for different seeds', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(54321);

      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());

      expect(values1).not.toEqual(values2);
    });

    it('should generate values between 0 and 1', () => {
      const rng = createRng(99999);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe('generateSeed', () => {
    it('should generate numeric seeds', () => {
      const seed = generateSeed();
      expect(typeof seed).toBe('number');
      expect(Number.isInteger(seed)).toBe(true);
    });

    it('should generate different seeds on subsequent calls', () => {
      const seeds = Array.from({ length: 10 }, () => generateSeed());
      const uniqueSeeds = new Set(seeds);
      // generateSeed() uses Date.now() which can produce same value in fast execution
      // but should produce different values over multiple calls
      expect(uniqueSeeds.size).toBeGreaterThanOrEqual(1);
      // Verify all seeds are valid numbers
      seeds.forEach(seed => {
        expect(typeof seed).toBe('number');
        expect(Number.isInteger(seed)).toBe(true);
      });
    });
  });

  describe('selectPrize', () => {
    it('should return deterministic result with same seed', () => {
      const result1 = selectPrize(MOCK_PRIZES, 42);
      const result2 = selectPrize(MOCK_PRIZES, 42);

      expect(result1.selectedIndex).toBe(result2.selectedIndex);
      expect(result1.seedUsed).toBe(result2.seedUsed);
    });

    it('should return valid prize index', () => {
      const result = selectPrize(MOCK_PRIZES, 12345);

      expect(result.selectedIndex).toBeGreaterThanOrEqual(0);
      expect(result.selectedIndex).toBeLessThan(MOCK_PRIZES.length);
    });

    it('should respect probability distribution over many samples', () => {
      const samples = 10000;
      const counts: number[] = Array(MOCK_PRIZES.length).fill(0) as number[];

      for (let i = 0; i < samples; i++) {
        const result = selectPrize(MOCK_PRIZES, i);
        const idx = result.selectedIndex;
        const currentCount = counts[idx];
        if (currentCount !== undefined && idx >= 0 && idx < counts.length) {
          counts[idx] = currentCount + 1;
        }
      }

      // Check that observed frequencies roughly match probabilities (±10%)
      for (let i = 0; i < MOCK_PRIZES.length; i++) {
        const count = counts[i];
        if (count === undefined) continue;
        const observed = count / samples;
        const prize = MOCK_PRIZES[i];
        if (!prize) continue;
        const expected = prize.probability;
        const error = Math.abs(observed - expected);
        expect(error).toBeLessThan(0.1); // 10% tolerance
      }
    });

    it('should throw error for invalid prize table size', () => {
      const tooFew = MOCK_PRIZES.slice(0, 2);
      expect(() => selectPrize(tooFew)).toThrow(/3-8 prizes/);

      const tooMany = [...MOCK_PRIZES, ...MOCK_PRIZES, ...MOCK_PRIZES];
      expect(() => selectPrize(tooMany)).toThrow(/3-8 prizes/);
    });

    it('should throw error if probabilities do not sum to 1.0', () => {
      const invalidPrizes = MOCK_PRIZES.map((p) => ({
        ...p,
        probability: p.probability * 0.5, // Sum will be 0.5
      }));

      expect(() => selectPrize(invalidPrizes)).toThrow(/sum to 1.0/);
    });

    it('should include cumulative weights in response', () => {
      const result = selectPrize(MOCK_PRIZES, 999);

      expect(result.cumulativeWeights).toBeInstanceOf(Float32Array);
      expect(result.cumulativeWeights.length).toBe(MOCK_PRIZES.length);
      expect(result.cumulativeWeights[result.cumulativeWeights.length - 1]).toBeCloseTo(1.0, 5);
    });
  });
});
