/**
 * Comprehensive tests for prize configurations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, expect, it } from 'vitest';
import {
  MOCK_PRIZES,
  createValidatedPrizeSet,
  generateRandomPrizeSet,
  getPrizeByIndex,
} from '../../../config/prizes/prizeTable';
import {
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  createValidatedProductionPrizeSet,
  generateProductionPrizeSet,
  getPrizeByIndex as getProductionPrizeByIndex,
} from '../../../config/prizes/productionPrizeTable';
import type { PrizeConfig } from '../../../game/types';
import {
  getPrizeByIndex as getPrizeByIndexUtil,
  normalizeProbabilities,
  validatePrizeSet,
} from '../../../utils/prizeUtils';

describe('MOCK_PRIZES Configuration', () => {
  it('should have exactly 6 prizes', () => {
    expect(MOCK_PRIZES).toHaveLength(6);
  });

  it('should have all required fields for each prize', () => {
    MOCK_PRIZES.forEach((prize, index) => {
      expect(prize, `Prize ${index} should have id`).toHaveProperty('id');
      expect(prize, `Prize ${index} should have type`).toHaveProperty('type');
      expect(prize, `Prize ${index} should have title`).toHaveProperty('title');
      expect(prize, `Prize ${index} should have probability`).toHaveProperty('probability');
      expect(prize, `Prize ${index} should have slotIcon`).toHaveProperty('slotIcon');
      expect(prize, `Prize ${index} should have slotColor`).toHaveProperty('slotColor');
    });
  });

  it('should have probabilities that sum to 1.0', () => {
    const sum = MOCK_PRIZES.reduce((acc: number, prize: PrizeConfig) => acc + prize.probability, 0);
    expect(sum).toBeCloseTo(1.0, 6);
  });

  it('should have equal probability for all prizes (1/6)', () => {
    const expectedProbability = 1 / 6;
    MOCK_PRIZES.forEach((prize, index) => {
      expect(prize.probability, `Prize ${index} probability`).toBeCloseTo(expectedProbability, 6);
    });
  });

  it('should have unique IDs', () => {
    const ids = MOCK_PRIZES.map((p: PrizeConfig) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(MOCK_PRIZES.length);
  });

  it('should have valid color hex codes', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    MOCK_PRIZES.forEach((prize, index) => {
      expect(prize.slotColor, `Prize ${index} slotColor`).toMatch(hexColorRegex);
    });
  });

  it('should all be of type "free"', () => {
    MOCK_PRIZES.forEach((prize, index) => {
      expect(prize.type, `Prize ${index} type`).toBe('free');
    });
  });
});

describe('Prize Set Generation', () => {
  describe('generateRandomPrizeSet', () => {
    it('should generate prize sets with 3-8 prizes', () => {
      for (let i = 0; i < 20; i++) {
        const prizes = generateRandomPrizeSet();
        expect(prizes.length).toBeGreaterThanOrEqual(3);
        expect(prizes.length).toBeLessThanOrEqual(8);
      }
    });

    it('should normalize probabilities to sum to 1.0', () => {
      for (let i = 0; i < 10; i++) {
        const prizes = generateRandomPrizeSet();
        const sum = prizes.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);
        expect(sum).toBeCloseTo(1.0, 6);
      }
    });

    it('should return different prize sets on multiple calls', () => {
      const set1 = generateRandomPrizeSet();
      const set2 = generateRandomPrizeSet();

      // Different instances
      expect(set1).not.toBe(set2);

      // Highly likely to have different counts or IDs
      const hasDifference =
        set1.length !== set2.length || set1.some((p: PrizeConfig, i: number) => p.id !== set2[i]?.id);

      // With 8 prizes to choose from, very likely to be different
      // (though theoretically could be same)
      expect(hasDifference).toBe(true);
    });

    it('should preserve all prize properties', () => {
      const prizes = generateRandomPrizeSet();
      prizes.forEach((prize, index) => {
        expect(prize, `Prize ${index}`).toHaveProperty('id');
        expect(prize, `Prize ${index}`).toHaveProperty('type');
        expect(prize, `Prize ${index}`).toHaveProperty('title');
        expect(prize, `Prize ${index}`).toHaveProperty('probability');
        expect(typeof prize.probability, `Prize ${index} probability type`).toBe('number');
        expect(prize.probability, `Prize ${index} probability`).toBeGreaterThan(0);
      });
    });
  });

  describe('generateProductionPrizeSet', () => {
    it('should generate prize sets with the default count when not specified', () => {
      for (let i = 0; i < 20; i++) {
        const prizes = generateProductionPrizeSet();
        expect(prizes.length).toBe(DEFAULT_PRODUCTION_PRIZE_COUNT);
      }
    });

    it('should generate exact count when specified', () => {
      const counts = [3, 4, 5, 6, 7, 8];
      counts.forEach((count) => {
        const prizes = generateProductionPrizeSet({ count });
        expect(prizes.length).toBe(count);
      });
    });

    it('should normalize probabilities to sum to 1.0', () => {
      for (let i = 0; i < 10; i++) {
        const prizes = generateProductionPrizeSet();
        const sum = prizes.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);
        expect(sum).toBeCloseTo(1.0, 6);
      }
    });

    it('should include required fields', () => {
      const prizes = generateProductionPrizeSet({ count: 5 });
      prizes.forEach((prize, index) => {
        expect(prize, `Prize ${index}`).toHaveProperty('title');
        expect(prize, `Prize ${index}`).toHaveProperty('slotColor');
      });
    });

    it('should handle all prize types', () => {
      const prizeTypes = new Set<string>();

      // Generate many sets to see variety
      for (let i = 0; i < 50; i++) {
        const prizes = generateProductionPrizeSet();
        prizes.forEach((p: PrizeConfig) => prizeTypes.add(p.type));
      }

      // Should have at least free and possibly purchase/no_win
      expect(prizeTypes.has('free')).toBe(true);
    });
  });
});

describe('Prize Set Validation', () => {
  describe('validatePrizeSet', () => {
    it('should pass for valid prize sets', () => {
      expect(() => validatePrizeSet(MOCK_PRIZES)).not.toThrow();
    });

    it('should pass for generated prize sets', () => {
      const prizes = generateRandomPrizeSet();
      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });

    it('should throw when probabilities do not sum to 1.0', () => {
      const invalidPrizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 0.3 },
        { ...MOCK_PRIZES[1]!, probability: 0.3 },
        { ...MOCK_PRIZES[2]!, probability: 0.3 },
      ];

      expect(() => validatePrizeSet(invalidPrizes)).toThrow(/must sum to 1\.0/);
    });

    it('should throw when less than 3 prizes', () => {
      const tooFewPrizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 0.5 },
        { ...MOCK_PRIZES[1]!, probability: 0.5 },
      ];

      expect(() => validatePrizeSet(tooFewPrizes)).toThrow(/must contain 3-8 prizes/);
    });

    it('should throw when more than 8 prizes', () => {
      const tooManyPrizes: PrizeConfig[] = Array(9)
        .fill(null)
        .map((_, i) => ({
          ...MOCK_PRIZES[0]!,
          id: `p${i}`,
          probability: 1 / 9,
        }));

      expect(() => validatePrizeSet(tooManyPrizes)).toThrow(/must contain 3-8 prizes/);
    });

    it('should handle floating point precision', () => {
      const prizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 0.1 },
        { ...MOCK_PRIZES[1]!, probability: 0.2 },
        { ...MOCK_PRIZES[2]!, probability: 0.7 },
      ];

      // Should pass despite potential floating point issues
      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });
  });

  describe('createValidatedPrizeSet', () => {
    it('should return a valid prize set', () => {
      const prizes = createValidatedPrizeSet();

      expect(prizes.length).toBeGreaterThanOrEqual(3);
      expect(prizes.length).toBeLessThanOrEqual(8);

      const sum = prizes.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);
      expect(sum).toBeCloseTo(1.0, 6);
    });

    it('should not throw errors', () => {
      expect(() => createValidatedPrizeSet()).not.toThrow();
    });
  });

  describe('createValidatedProductionPrizeSet', () => {
    it('should return a valid prize set', () => {
      const prizes = createValidatedProductionPrizeSet();

      expect(prizes.length).toBe(DEFAULT_PRODUCTION_PRIZE_COUNT);

      const sum = prizes.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);
      expect(sum).toBeCloseTo(1.0, 6);
    });

    it('should accept count parameter', () => {
      const prizes = createValidatedProductionPrizeSet({ count: 5 });
      expect(prizes.length).toBe(5);

      const sum = prizes.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);
      expect(sum).toBeCloseTo(1.0, 6);
    });
  });
});

describe('Probability Normalization', () => {
  describe('normalizeProbabilities', () => {
    it('should normalize probabilities to sum to 1.0', () => {
      const prizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 1 },
        { ...MOCK_PRIZES[1]!, probability: 2 },
        { ...MOCK_PRIZES[2]!, probability: 3 },
      ];

      const normalized = normalizeProbabilities(prizes);
      const sum = normalized.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);

      expect(sum).toBeCloseTo(1.0, 6);
    });

    it('should preserve relative probabilities', () => {
      const prizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 1 },
        { ...MOCK_PRIZES[1]!, probability: 2 },
        { ...MOCK_PRIZES[2]!, probability: 3 },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0]!.probability).toBeCloseTo(1 / 6, 6);
      expect(normalized[1]!.probability).toBeCloseTo(2 / 6, 6);
      expect(normalized[2]!.probability).toBeCloseTo(3 / 6, 6);
    });

    it('should handle already normalized probabilities', () => {
      const normalized = normalizeProbabilities(MOCK_PRIZES);
      const sum = normalized.reduce((acc: number, p: PrizeConfig) => acc + p.probability, 0);

      expect(sum).toBeCloseTo(1.0, 6);
    });

    it('should throw on zero total probability', () => {
      const prizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 0 },
        { ...MOCK_PRIZES[1]!, probability: 0 },
      ];

      expect(() => normalizeProbabilities(prizes)).toThrow(/cannot be zero/);
    });

    it('should preserve all other prize properties', () => {
      const prizes: PrizeConfig[] = [
        { ...MOCK_PRIZES[0]!, probability: 1 },
        { ...MOCK_PRIZES[1]!, probability: 2 },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0]!.id).toBe(prizes[0]!.id);
      expect(normalized[0]!.type).toBe(prizes[0]!.type);
      expect(normalized[0]!.title).toBe(prizes[0]!.title);
      expect(normalized[1]!.id).toBe(prizes[1]!.id);
    });
  });
});

describe('Prize Retrieval by Index', () => {
  describe('getPrizeByIndex', () => {
    it('should return correct prize for valid index', () => {
      const prize = getPrizeByIndex(MOCK_PRIZES, 0);
      expect(prize).toBe(MOCK_PRIZES[0]);
    });

    it('should return correct prize for all valid indices', () => {
      MOCK_PRIZES.forEach((expectedPrize, index) => {
        const prize = getPrizeByIndex(MOCK_PRIZES, index);
        expect(prize).toBe(expectedPrize);
      });
    });

    it('should throw on negative index', () => {
      expect(() => getPrizeByIndex(MOCK_PRIZES, -1)).toThrow(/out of range/);
    });

    it('should throw on index too large', () => {
      expect(() => getPrizeByIndex(MOCK_PRIZES, MOCK_PRIZES.length)).toThrow(/out of range/);
      expect(() => getPrizeByIndex(MOCK_PRIZES, 100)).toThrow(/out of range/);
    });

    it('should work with production prizes', () => {
      const prizes = generateProductionPrizeSet({ count: 5 });
      const prize = getProductionPrizeByIndex(prizes, 0);
      expect(prize).toBe(prizes[0]);
    });
  });

  describe('getPrizeByIndexUtil', () => {
    it('should return correct prize for valid index', () => {
      const prize = getPrizeByIndexUtil(MOCK_PRIZES, 2);
      expect(prize).toBe(MOCK_PRIZES[2]);
    });

    it('should throw on invalid index', () => {
      expect(() => getPrizeByIndexUtil(MOCK_PRIZES, -1)).toThrow(/out of range/);
      expect(() => getPrizeByIndexUtil(MOCK_PRIZES, 10)).toThrow(/out of range/);
    });

    it('should include helpful error messages', () => {
      try {
        getPrizeByIndexUtil(MOCK_PRIZES, 10);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('10');
        expect((error as Error).message).toContain('0');
        expect((error as Error).message).toContain('5');
      }
    });
  });
});

describe('Prize Configuration Edge Cases', () => {
  it('should handle minimum prize set (3 prizes)', () => {
    const prizes = generateProductionPrizeSet({ count: 3 });
    expect(() => validatePrizeSet(prizes)).not.toThrow();
    expect(prizes.length).toBe(3);
  });

  it('should handle maximum prize set (8 prizes)', () => {
    const prizes = generateProductionPrizeSet({ count: 8 });
    expect(() => validatePrizeSet(prizes)).not.toThrow();
    expect(prizes.length).toBe(8);
  });

  it('should handle very small probabilities', () => {
    const prizes: PrizeConfig[] = [
      { ...MOCK_PRIZES[0]!, probability: 0.001 },
      { ...MOCK_PRIZES[1]!, probability: 0.001 },
      { ...MOCK_PRIZES[2]!, probability: 0.998 },
    ];

    const normalized = normalizeProbabilities(prizes);
    const sum = normalized.reduce((acc, p) => acc + p.probability, 0);
    expect(sum).toBeCloseTo(1.0, 6);
  });

  it('should handle equal probabilities', () => {
    const count = 7;
    const prizes: PrizeConfig[] = Array(count)
      .fill(null)
      .map((_, i) => ({
        ...MOCK_PRIZES[0]!,
        id: `p${i}`,
        probability: 1 / count,
      }));

    expect(() => validatePrizeSet(prizes)).not.toThrow();
  });
});

describe('Prize Types Coverage', () => {
  it('should support free prize type', () => {
    const freePrizes = MOCK_PRIZES.filter((p: PrizeConfig) => p.type === 'free');
    expect(freePrizes.length).toBe(6);
  });

  it('should support production prize types', () => {
    const validTypes = ['free', 'purchase', 'no_win'];
    const prizes = generateProductionPrizeSet({ count: 8 });

    prizes.forEach((prize: PrizeConfig) => {
      expect(validTypes).toContain(prize.type);
    });
  });
});
