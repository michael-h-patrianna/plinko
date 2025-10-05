/**
 * Comprehensive unit tests for all utility functions
 * Tests edge cases, error conditions, and boundary conditions
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validatePrizeSet, getPrizeByIndex, normalizeProbabilities } from '../utils/prizeUtils';
import {
  isMobileDevice,
  getMaxMobileWidth,
  getResponsiveViewportWidth,
} from '../utils/deviceDetection';
import { abbreviateNumber } from '../utils/formatNumber';
import { calculateBucketHeight, calculateBucketZoneY } from '../utils/slotDimensions';
import type { PrizeConfig } from '../game/types';

describe('prizeUtils', () => {
  describe('validatePrizeSet', () => {
    it('should validate a prize set with probabilities summing to 1.0', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.3,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.4,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.3,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });

    it('should accept probabilities within tolerance (1e-6)', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.333333,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.333333,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.333334,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });

    it('should throw error when probabilities sum to less than 1.0', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.2,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.3,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.4,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).toThrow(
        /Prize probabilities must sum to 1\.0, got 0\.900000/
      );
    });

    it('should throw error when probabilities sum to more than 1.0', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.4,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.4,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.4,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).toThrow(
        /Prize probabilities must sum to 1\.0, got 1\.200000/
      );
    });

    it('should throw error when prize count is less than 3', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.5,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.5,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).toThrow(/Prize set must contain 3-8 prizes, got 2/);
    });

    it('should throw error when prize count is more than 8', () => {
      const prizes: PrizeConfig[] = Array.from({ length: 9 }, (_, i) => ({
        id: `p${i}`,
        type: 'free' as const,
        probability: 1 / 9,
        title: `Prize ${i}`,
        slotIcon: '',
        slotColor: '#000',
      }));

      expect(() => validatePrizeSet(prizes)).toThrow(/Prize set must contain 3-8 prizes, got 9/);
    });

    it('should validate exactly 3 prizes', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.3,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.3,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.4,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });

    it('should validate exactly 8 prizes', () => {
      const prizes: PrizeConfig[] = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i}`,
        type: 'free' as const,
        probability: 0.125,
        title: `Prize ${i}`,
        slotIcon: '',
        slotColor: '#000',
      }));

      expect(() => validatePrizeSet(prizes)).not.toThrow();
    });

    it('should handle empty array', () => {
      const prizes: PrizeConfig[] = [];

      // Empty array has sum of 0, which is checked first
      expect(() => validatePrizeSet(prizes)).toThrow(
        /Prize probabilities must sum to 1\.0, got 0\.000000/
      );
    });

    it('should handle zero probabilities', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).toThrow(
        /Prize probabilities must sum to 1\.0, got 0\.000000/
      );
    });

    it('should handle negative probabilities', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: -0.5,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 1.0,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.5,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).not.toThrow(); // Sum is still 1.0
    });

    it('should handle very large probabilities', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 1000,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: -998,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: -1,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => validatePrizeSet(prizes)).not.toThrow(); // Sum is still 1.0
    });
  });

  describe('getPrizeByIndex', () => {
    const prizes: PrizeConfig[] = [
      {
        id: 'p1',
        type: 'free',
        probability: 0.3,
        title: 'Prize 1',
        slotIcon: '',
        slotColor: '#000',
      },
      {
        id: 'p2',
        type: 'free',
        probability: 0.4,
        title: 'Prize 2',
        slotIcon: '',
        slotColor: '#000',
      },
      {
        id: 'p3',
        type: 'free',
        probability: 0.3,
        title: 'Prize 3',
        slotIcon: '',
        slotColor: '#000',
      },
    ];

    it('should return prize at valid index 0', () => {
      const prize = getPrizeByIndex(prizes, 0);
      expect(prize).toBe(prizes[0]);
      expect(prize.id).toBe('p1');
    });

    it('should return prize at valid index 1', () => {
      const prize = getPrizeByIndex(prizes, 1);
      expect(prize).toBe(prizes[1]);
      expect(prize.id).toBe('p2');
    });

    it('should return prize at valid index 2', () => {
      const prize = getPrizeByIndex(prizes, 2);
      expect(prize).toBe(prizes[2]);
      expect(prize.id).toBe('p3');
    });

    it('should return prize at last valid index', () => {
      const prize = getPrizeByIndex(prizes, prizes.length - 1);
      expect(prize).toBe(prizes[2]);
    });

    it('should throw error for negative index', () => {
      expect(() => getPrizeByIndex(prizes, -1)).toThrow(/Prize index -1 out of range \[0, 2\]/);
    });

    it('should throw error for index equal to length', () => {
      expect(() => getPrizeByIndex(prizes, 3)).toThrow(/Prize index 3 out of range \[0, 2\]/);
    });

    it('should throw error for index greater than length', () => {
      expect(() => getPrizeByIndex(prizes, 10)).toThrow(/Prize index 10 out of range \[0, 2\]/);
    });

    it('should throw error for very large index', () => {
      expect(() => getPrizeByIndex(prizes, Number.MAX_SAFE_INTEGER)).toThrow(
        /Prize index \d+ out of range \[0, 2\]/
      );
    });

    it('should handle empty array', () => {
      expect(() => getPrizeByIndex([], 0)).toThrow(/Prize index 0 out of range \[0, -1\]/);
    });

    it('should handle single element array', () => {
      const singlePrize = [prizes[0]];
      expect(getPrizeByIndex(singlePrize, 0)).toBe(prizes[0]);
      expect(() => getPrizeByIndex(singlePrize, 1)).toThrow(/Prize index 1 out of range \[0, 0\]/);
    });

    it('should preserve type information', () => {
      interface ExtendedPrize extends PrizeConfig {
        customField: string;
      }
      const extendedPrizes: ExtendedPrize[] = [
        {
          ...prizes[0],
          customField: 'custom1',
        },
        {
          ...prizes[1],
          customField: 'custom2',
        },
      ];

      const prize = getPrizeByIndex(extendedPrizes, 0);
      expect(prize.customField).toBe('custom1');
    });
  });

  describe('normalizeProbabilities', () => {
    it('should normalize probabilities that sum to 2.0', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 1.0,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.5,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.5,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0].probability).toBe(0.5);
      expect(normalized[1].probability).toBe(0.25);
      expect(normalized[2].probability).toBe(0.25);
      expect(normalized.reduce((sum, p) => sum + p.probability, 0)).toBeCloseTo(1.0);
    });

    it('should normalize probabilities that sum to 0.5', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.1,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.2,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.2,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0].probability).toBe(0.2);
      expect(normalized[1].probability).toBe(0.4);
      expect(normalized[2].probability).toBe(0.4);
      expect(normalized.reduce((sum, p) => sum + p.probability, 0)).toBeCloseTo(1.0);
    });

    it('should not modify probabilities already summing to 1.0', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.3,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.4,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.3,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0].probability).toBeCloseTo(0.3);
      expect(normalized[1].probability).toBeCloseTo(0.4);
      expect(normalized[2].probability).toBeCloseTo(0.3);
    });

    it('should throw error when total probability is zero', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      expect(() => normalizeProbabilities(prizes)).toThrow(/Total probability cannot be zero/);
    });

    it('should handle negative and positive probabilities that cancel out', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 1.0,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: -0.5,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: -0.5,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      // This actually sums to 0, which throws an error
      expect(() => normalizeProbabilities(prizes)).toThrow(/Total probability cannot be zero/);
    });

    it('should preserve other prize properties', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 1.0,
          title: 'Prize 1',
          description: 'Description 1',
          slotIcon: 'icon1.png',
          slotColor: '#FF0000',
        },
        {
          id: 'p2',
          type: 'purchase',
          probability: 1.0,
          title: 'Prize 2',
          slotIcon: 'icon2.png',
          slotColor: '#00FF00',
        },
      ];

      const normalized = normalizeProbabilities(prizes);

      expect(normalized[0].id).toBe('p1');
      expect(normalized[0].type).toBe('free');
      expect(normalized[0].title).toBe('Prize 1');
      expect(normalized[0].description).toBe('Description 1');
      expect(normalized[0].slotIcon).toBe('icon1.png');
      expect(normalized[0].slotColor).toBe('#FF0000');

      expect(normalized[1].id).toBe('p2');
      expect(normalized[1].type).toBe('purchase');
      expect(normalized[1].title).toBe('Prize 2');
      expect(normalized[1].slotIcon).toBe('icon2.png');
      expect(normalized[1].slotColor).toBe('#00FF00');
    });

    it('should create new array and not modify original', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.5,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.5,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.5,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const originalProbs = prizes.map((p) => p.probability);
      const normalized = normalizeProbabilities(prizes);

      expect(prizes[0].probability).toBe(originalProbs[0]);
      expect(prizes[1].probability).toBe(originalProbs[1]);
      expect(prizes[2].probability).toBe(originalProbs[2]);
      expect(normalized).not.toBe(prizes);
    });

    it('should handle empty array', () => {
      const prizes: PrizeConfig[] = [];
      expect(() => normalizeProbabilities(prizes)).toThrow(/Total probability cannot be zero/);
    });

    it('should handle very small probabilities', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 0.0000001,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 0.0000002,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 0.0000003,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const normalized = normalizeProbabilities(prizes);
      const sum = normalized.reduce((acc, p) => acc + p.probability, 0);

      expect(sum).toBeCloseTo(1.0);
    });

    it('should handle very large probabilities', () => {
      const prizes: PrizeConfig[] = [
        {
          id: 'p1',
          type: 'free',
          probability: 1000000,
          title: 'Prize 1',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p2',
          type: 'free',
          probability: 2000000,
          title: 'Prize 2',
          slotIcon: '',
          slotColor: '#000',
        },
        {
          id: 'p3',
          type: 'free',
          probability: 3000000,
          title: 'Prize 3',
          slotIcon: '',
          slotColor: '#000',
        },
      ];

      const normalized = normalizeProbabilities(prizes);
      const sum = normalized.reduce((acc, p) => acc + p.probability, 0);

      expect(sum).toBeCloseTo(1.0);
      expect(normalized[0].probability).toBeCloseTo(1 / 6);
      expect(normalized[1].probability).toBeCloseTo(2 / 6);
      expect(normalized[2].probability).toBeCloseTo(3 / 6);
    });
  });
});

describe('deviceDetection', () => {
  // Store original values - cast to unknown first to avoid error typed values
  const originalNavigator = global.navigator as unknown as Navigator;
  const originalWindow = global.window as unknown as Window & typeof globalThis;

  beforeEach(() => {
    // Reset navigator and window for each test
    global.navigator = {
      userAgent: '',
      maxTouchPoints: 0,
    } as unknown as Navigator;

    global.window = {
      innerWidth: 1024,
      ontouchstart: undefined,
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    // Restore original values
    (global as { navigator: Navigator }).navigator = originalNavigator;
    (global as { window: Window & typeof globalThis }).window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('isMobileDevice', () => {
    it('should return true for iPhone user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for iPad user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for Android user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for iPod user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for BlackBerry user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (BlackBerry)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for IEMobile user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows Phone; IEMobile)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for Opera Mini user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Opera/9.80 (J2ME/MIDP; Opera Mini)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for WebOS user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (webOS/1.4.0)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return false for desktop user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return true for touch device with width <= 768', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for touch device with width < 768', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 375,
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return false for touch device with width > 768', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 1024,
        configurable: true,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return true for ontouchstart property', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'ontouchstart', {
        value: null,
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should handle case-insensitive user agent matching', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'MOZILLA/5.0 (IPHONE; CPU IPHONE OS 14_0)',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return false for non-mobile, non-touch device', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return false for empty user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: '',
        configurable: true,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return false when maxTouchPoints is 0 and ontouchstart is undefined', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });
      // Explicitly ensure ontouchstart is not in window
      delete (global.window as Record<string, unknown>).ontouchstart;

      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('getMaxMobileWidth', () => {
    it('should return 414', () => {
      expect(getMaxMobileWidth()).toBe(414);
    });

    it('should be a number', () => {
      expect(typeof getMaxMobileWidth()).toBe('number');
    });

    it('should be greater than 0', () => {
      expect(getMaxMobileWidth()).toBeGreaterThan(0);
    });
  });

  describe('getResponsiveViewportWidth', () => {
    it('should return window width for desktop device', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 1920,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(1920);
    });

    it('should return capped width for mobile device with width > max', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 500,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(414);
    });

    it('should return actual width for mobile device with width < max', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 375,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(375);
    });

    it('should return max width for mobile device with width = max', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 414,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(414);
    });

    it('should handle very small mobile width', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 320,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(320);
    });

    it('should handle very large desktop width', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 3840,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(3840);
    });

    it('should handle zero width gracefully', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(global.window, 'innerWidth', {
        value: 0,
        configurable: true,
      });

      expect(getResponsiveViewportWidth()).toBe(0);
    });
  });
});

describe('formatNumber', () => {
  describe('abbreviateNumber', () => {
    it('should return number as string for values < 1000', () => {
      expect(abbreviateNumber(0)).toBe('0');
      expect(abbreviateNumber(1)).toBe('1');
      expect(abbreviateNumber(99)).toBe('99');
      expect(abbreviateNumber(500)).toBe('500');
      expect(abbreviateNumber(999)).toBe('999');
    });

    it('should abbreviate thousands with k', () => {
      expect(abbreviateNumber(1000)).toBe('1k');
      expect(abbreviateNumber(1500)).toBe('1.5k');
      expect(abbreviateNumber(2000)).toBe('2k');
      expect(abbreviateNumber(2500)).toBe('2.5k');
      expect(abbreviateNumber(11500)).toBe('11.5k');
      expect(abbreviateNumber(116500)).toBe('116.5k');
    });

    it('should abbreviate millions with M', () => {
      expect(abbreviateNumber(1000000)).toBe('1M');
      expect(abbreviateNumber(1500000)).toBe('1.5M');
      expect(abbreviateNumber(2000000)).toBe('2M');
      expect(abbreviateNumber(2500000)).toBe('2.5M');
      expect(abbreviateNumber(11500000)).toBe('11.5M');
    });

    it('should remove unnecessary decimals for whole thousands', () => {
      expect(abbreviateNumber(3000)).toBe('3k');
      expect(abbreviateNumber(10000)).toBe('10k');
      expect(abbreviateNumber(100000)).toBe('100k');
    });

    it('should remove unnecessary decimals for whole millions', () => {
      expect(abbreviateNumber(3000000)).toBe('3M');
      expect(abbreviateNumber(10000000)).toBe('10M');
      expect(abbreviateNumber(100000000)).toBe('100M');
    });

    it('should keep one decimal place for non-whole thousands', () => {
      expect(abbreviateNumber(1100)).toBe('1.1k');
      expect(abbreviateNumber(1234)).toBe('1.2k'); // Rounds to 1 decimal
      expect(abbreviateNumber(9999)).toBe('10.0k'); // Rounds up to 10.0k
    });

    it('should keep one decimal place for non-whole millions', () => {
      expect(abbreviateNumber(1100000)).toBe('1.1M');
      expect(abbreviateNumber(1234567)).toBe('1.2M'); // Rounds to 1 decimal
      expect(abbreviateNumber(9999999)).toBe('10.0M'); // Rounds up to 10.0M
    });

    it('should handle boundary values', () => {
      expect(abbreviateNumber(999)).toBe('999');
      expect(abbreviateNumber(1000)).toBe('1k');
      expect(abbreviateNumber(999999)).toBe('1000.0k'); // 999.999k rounds to 1000.0k
      expect(abbreviateNumber(1000000)).toBe('1M');
    });

    it('should handle very large numbers', () => {
      expect(abbreviateNumber(999999999)).toBe('1000.0M'); // Rounds to 1000.0M
      expect(abbreviateNumber(1000000000)).toBe('1000M');
      expect(abbreviateNumber(Number.MAX_SAFE_INTEGER)).toContain('M');
    });

    it('should handle negative numbers', () => {
      // Function doesn't handle negative numbers - they stay as-is
      expect(abbreviateNumber(-500)).toBe('-500');
      expect(abbreviateNumber(-1500)).toBe('-1500'); // Not abbreviated
      expect(abbreviateNumber(-2000000)).toBe('-2000000'); // Not abbreviated
    });

    it('should handle decimal input values', () => {
      expect(abbreviateNumber(999.9)).toBe('999.9');
      expect(abbreviateNumber(1500.5)).toBe('1.5k');
      expect(abbreviateNumber(1500000.5)).toBe('1.5M');
    });

    it('should handle zero', () => {
      expect(abbreviateNumber(0)).toBe('0');
    });

    it('should handle very small positive numbers', () => {
      expect(abbreviateNumber(0.1)).toBe('0.1');
      expect(abbreviateNumber(0.9)).toBe('0.9');
    });

    it('should handle edge case around 1000k -> 1M transition', () => {
      expect(abbreviateNumber(999000)).toBe('999k');
      expect(abbreviateNumber(999500)).toBe('999.5k');
      expect(abbreviateNumber(1000000)).toBe('1M');
    });

    it('should correctly round decimal thousands', () => {
      expect(abbreviateNumber(1449)).toBe('1.4k');
      expect(abbreviateNumber(1450)).toBe('1.4k'); // toFixed rounds to 1.4k
      expect(abbreviateNumber(1951)).toBe('2.0k'); // toFixed gives 1.951 -> 2.0k
    });

    it('should correctly round decimal millions', () => {
      expect(abbreviateNumber(1449000)).toBe('1.4M');
      expect(abbreviateNumber(1450000)).toBe('1.4M'); // toFixed rounds to 1.4M
      expect(abbreviateNumber(1951000)).toBe('2.0M'); // toFixed gives 1.951 -> 2.0M
    });
  });
});

describe('slotDimensions', () => {
  describe('calculateBucketHeight', () => {
    it('should return 105 for very narrow slots (< 40)', () => {
      expect(calculateBucketHeight(30)).toBe(105);
      expect(calculateBucketHeight(35)).toBe(105);
      expect(calculateBucketHeight(39)).toBe(105);
      expect(calculateBucketHeight(39.9)).toBe(105);
    });

    it('should return 95 for narrow slots (40-49)', () => {
      expect(calculateBucketHeight(40)).toBe(95);
      expect(calculateBucketHeight(45)).toBe(95);
      expect(calculateBucketHeight(49)).toBe(95);
      expect(calculateBucketHeight(49.9)).toBe(95);
    });

    it('should return 90 for standard slots (>= 50)', () => {
      expect(calculateBucketHeight(50)).toBe(90);
      expect(calculateBucketHeight(60)).toBe(90);
      expect(calculateBucketHeight(100)).toBe(90);
      expect(calculateBucketHeight(1000)).toBe(90);
    });

    it('should handle boundary values', () => {
      expect(calculateBucketHeight(40)).toBe(95);
      expect(calculateBucketHeight(50)).toBe(90);
    });

    it('should handle zero width', () => {
      expect(calculateBucketHeight(0)).toBe(105);
    });

    it('should handle negative width', () => {
      expect(calculateBucketHeight(-10)).toBe(105);
    });

    it('should handle very small positive width', () => {
      expect(calculateBucketHeight(0.1)).toBe(105);
      expect(calculateBucketHeight(1)).toBe(105);
    });

    it('should handle very large width', () => {
      expect(calculateBucketHeight(10000)).toBe(90);
    });

    it('should handle decimal widths near boundaries', () => {
      expect(calculateBucketHeight(39.99)).toBe(105);
      expect(calculateBucketHeight(40.01)).toBe(95);
      expect(calculateBucketHeight(49.99)).toBe(95);
      expect(calculateBucketHeight(50.01)).toBe(90);
    });
  });

  describe('calculateBucketZoneY', () => {
    it('should calculate correct Y for very narrow slots', () => {
      const boardHeight = 600;
      const slotWidth = 35;
      const expectedHeight = 105;

      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(boardHeight - expectedHeight);
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(495);
    });

    it('should calculate correct Y for narrow slots', () => {
      const boardHeight = 600;
      const slotWidth = 45;
      const expectedHeight = 95;

      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(boardHeight - expectedHeight);
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(505);
    });

    it('should calculate correct Y for standard slots', () => {
      const boardHeight = 600;
      const slotWidth = 60;
      const expectedHeight = 90;

      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(boardHeight - expectedHeight);
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(510);
    });

    it('should handle different board heights with very narrow slots', () => {
      expect(calculateBucketZoneY(500, 35)).toBe(395);
      expect(calculateBucketZoneY(800, 35)).toBe(695);
      expect(calculateBucketZoneY(1000, 35)).toBe(895);
    });

    it('should handle different board heights with narrow slots', () => {
      expect(calculateBucketZoneY(500, 45)).toBe(405);
      expect(calculateBucketZoneY(800, 45)).toBe(705);
      expect(calculateBucketZoneY(1000, 45)).toBe(905);
    });

    it('should handle different board heights with standard slots', () => {
      expect(calculateBucketZoneY(500, 60)).toBe(410);
      expect(calculateBucketZoneY(800, 60)).toBe(710);
      expect(calculateBucketZoneY(1000, 60)).toBe(910);
    });

    it('should handle zero board height', () => {
      expect(calculateBucketZoneY(0, 60)).toBe(-90);
    });

    it('should handle negative board height', () => {
      expect(calculateBucketZoneY(-100, 60)).toBe(-190);
    });

    it('should handle very small board height', () => {
      expect(calculateBucketZoneY(50, 60)).toBe(-40);
    });

    it('should handle very large board height', () => {
      expect(calculateBucketZoneY(10000, 60)).toBe(9910);
    });

    it('should handle decimal board height', () => {
      expect(calculateBucketZoneY(600.5, 60)).toBe(510.5);
      expect(calculateBucketZoneY(599.9, 60)).toBe(509.9);
    });

    it('should handle decimal slot width near boundaries', () => {
      expect(calculateBucketZoneY(600, 39.9)).toBe(495);
      expect(calculateBucketZoneY(600, 40.1)).toBe(505);
      expect(calculateBucketZoneY(600, 49.9)).toBe(505);
      expect(calculateBucketZoneY(600, 50.1)).toBe(510);
    });

    it('should handle mobile screen sizes (320px width, 8 prizes)', () => {
      const boardHeight = 568; // iPhone SE height
      const slotWidth = 320 / 8; // 40px per prize
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(473);
    });

    it('should handle tablet screen sizes (768px width, 5 prizes)', () => {
      const boardHeight = 1024;
      const slotWidth = 768 / 5; // ~153px per prize
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(934);
    });

    it('should handle desktop screen sizes (1920px width, 3 prizes)', () => {
      const boardHeight = 1080;
      const slotWidth = 1920 / 3; // 640px per prize
      expect(calculateBucketZoneY(boardHeight, slotWidth)).toBe(990);
    });

    it('should correctly integrate bucket height calculation', () => {
      // Verify that calculateBucketZoneY correctly uses calculateBucketHeight
      const boardHeight = 600;

      // Test very narrow
      const veryNarrowWidth = 30;
      expect(calculateBucketZoneY(boardHeight, veryNarrowWidth)).toBe(
        boardHeight - calculateBucketHeight(veryNarrowWidth)
      );

      // Test narrow
      const narrowWidth = 45;
      expect(calculateBucketZoneY(boardHeight, narrowWidth)).toBe(
        boardHeight - calculateBucketHeight(narrowWidth)
      );

      // Test standard
      const standardWidth = 60;
      expect(calculateBucketZoneY(boardHeight, standardWidth)).toBe(
        boardHeight - calculateBucketHeight(standardWidth)
      );
    });
  });
});
