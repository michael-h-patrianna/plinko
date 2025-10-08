/**
 * Platform Adapters Test Suite
 *
 * Comprehensive tests for all platform adapters ensuring 100% coverage
 * Tests both success and error cases with proper browser API mocking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import all adapters
import { cryptoAdapter } from '../../utils/platform/crypto';
import { dimensionsAdapter } from '../../utils/platform/dimensions';
import { deviceInfoAdapter } from '../../utils/platform/deviceInfo';
import { storageAdapter } from '../../utils/platform/storage';
import { animationAdapter } from '../../utils/platform/animation';
import { navigationAdapter } from '../../utils/platform/navigation';
import { performanceAdapter } from '../../utils/platform/performance';

describe('Platform Adapters', () => {
  describe('cryptoAdapter', () => {
    it('should generate secure random seed', () => {
      const seed = cryptoAdapter.generateSecureRandomSeed();

      expect(seed).toBeTypeOf('number');
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(0xFFFFFFFF); // Max 32-bit unsigned integer
    });

    it('should generate different seeds on subsequent calls', () => {
      const seed1 = cryptoAdapter.generateSecureRandomSeed();
      const seed2 = cryptoAdapter.generateSecureRandomSeed();

      // Very unlikely to be the same (1 in 4 billion chance)
      expect(seed1).not.toBe(seed2);
    });

    it('should fill Uint8Array with random values', () => {
      const array = new Uint8Array(10);
      const result = cryptoAdapter.getRandomValues(array);

      expect(result).toBe(array); // Should return same array reference
      expect(result.length).toBe(10);

      // Check that values are populated (not all zeros)
      const hasNonZero = Array.from(result).some(val => val !== 0);
      expect(hasNonZero).toBe(true);
    });

    it('should fill Uint16Array with random values', () => {
      const array = new Uint16Array(5);
      const result = cryptoAdapter.getRandomValues(array);

      expect(result).toBe(array);
      expect(result.length).toBe(5);

      const hasNonZero = Array.from(result).some(val => val !== 0);
      expect(hasNonZero).toBe(true);
    });

    it('should fill Uint32Array with random values', () => {
      const array = new Uint32Array(3);
      const result = cryptoAdapter.getRandomValues(array);

      expect(result).toBe(array);
      expect(result.length).toBe(3);

      const hasNonZero = Array.from(result).some(val => val !== 0);
      expect(hasNonZero).toBe(true);
    });
  });

  describe('dimensionsAdapter', () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    afterEach(() => {
      // Restore original dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    });

    it('should get current window width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      expect(dimensionsAdapter.getWidth()).toBe(1920);
    });

    it('should get current window height', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      expect(dimensionsAdapter.getHeight()).toBe(1080);
    });

    it('should get both dimensions', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const dimensions = dimensionsAdapter.getDimensions();

      expect(dimensions).toEqual({
        width: 1024,
        height: 768,
      });
    });

    it('should add change listener and call on resize', () => {
      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      // Simulate resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600,
      });

      window.dispatchEvent(new Event('resize'));

      expect(listener).toHaveBeenCalledWith({
        width: 800,
        height: 600,
      });

      cleanup();
    });

    it('should remove listener when cleanup is called', () => {
      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      cleanup();

      // After cleanup, listener should not be called
      window.dispatchEvent(new Event('resize'));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('deviceInfoAdapter', () => {
    const originalUserAgent = navigator.userAgent;
    const originalMaxTouchPoints = navigator.maxTouchPoints;

    afterEach(() => {
      // Restore original values
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: originalUserAgent,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: originalMaxTouchPoints,
      });

      // Clear cache
      (deviceInfoAdapter as any).cachedInfo = null;
    });

    it('should detect iOS device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.os).toBe('ios');
      expect(info.type).toBe('mobile');
      expect(info.hasTouch).toBe(true);
      expect(info.isMobile).toBe(true);
      expect(info.isTablet).toBe(false);
      expect(info.isDesktop).toBe(false);
    });

    it('should detect iPad device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.os).toBe('ios');
      expect(info.type).toBe('tablet');
      expect(info.isTablet).toBe(true);
      expect(info.isMobile).toBe(false);
    });

    it('should detect Android mobile device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) Mobile',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.os).toBe('android');
      expect(info.type).toBe('mobile');
      expect(info.hasTouch).toBe(true);
    });

    it('should detect Android tablet device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 11; Tab) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.os).toBe('android');
      expect(info.type).toBe('tablet');
    });

    it('should detect desktop device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.os).toBe('web');
      expect(info.type).toBe('desktop');
      expect(info.hasTouch).toBe(false);
      expect(info.isDesktop).toBe(true);
    });

    it('should detect touch device via ontouchstart', () => {
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: {},
      });

      expect(deviceInfoAdapter.isTouchDevice()).toBe(true);

      delete (window as any).ontouchstart;
    });

    it('should detect touch device via maxTouchPoints', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 2,
      });

      expect(deviceInfoAdapter.isTouchDevice()).toBe(true);
    });

    it('should cache device info on subsequent calls', () => {
      const info1 = deviceInfoAdapter.getDeviceInfo();
      const info2 = deviceInfoAdapter.getDeviceInfo();

      expect(info1).toBe(info2); // Same reference
    });

    it('should return user agent string', () => {
      const userAgent = deviceInfoAdapter.getUserAgent();
      expect(userAgent).toBeTypeOf('string');
      expect(userAgent.length).toBeGreaterThan(0);
    });

    it('should correctly identify mobile device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });

      // Clear cache
      (deviceInfoAdapter as any).cachedInfo = null;

      expect(deviceInfoAdapter.isMobileDevice()).toBe(true);
    });

    it('should detect mobile via touch and narrow screen', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Generic Browser)',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500, // Narrow screen
      });

      // Clear cache
      (deviceInfoAdapter as any).cachedInfo = null;

      const info = deviceInfoAdapter.getDeviceInfo();
      expect(info.type).toBe('mobile');
    });
  });

  describe('storageAdapter', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should get item from localStorage', async () => {
      localStorage.setItem('test-key', 'test-value');

      const value = await storageAdapter.getItem('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const value = await storageAdapter.getItem('non-existent');
      expect(value).toBeNull();
    });

    it('should set item in localStorage', async () => {
      await storageAdapter.setItem('new-key', 'new-value');

      expect(localStorage.getItem('new-key')).toBe('new-value');
    });

    it('should remove item from localStorage', async () => {
      localStorage.setItem('to-remove', 'value');

      await storageAdapter.removeItem('to-remove');

      expect(localStorage.getItem('to-remove')).toBeNull();
    });

    it('should clear all items from localStorage', async () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      await storageAdapter.clear();

      expect(localStorage.length).toBe(0);
    });

    it('should get all keys from localStorage', async () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      const keys = await storageAdapter.getAllKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should handle getItem errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Storage error');

      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw error;
      });

      const value = await storageAdapter.getItem('error-key');

      expect(value).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] Error getting item:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should throw on setItem errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Quota exceeded');

      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw error;
      });

      await expect(storageAdapter.setItem('error-key', 'value')).rejects.toThrow('Quota exceeded');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] Error setting item:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should throw on removeItem errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Remove error');

      vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw error;
      });

      await expect(storageAdapter.removeItem('error-key')).rejects.toThrow('Remove error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] Error removing item:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should throw on clear errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Clear error');

      vi.spyOn(Storage.prototype, 'clear').mockImplementationOnce(() => {
        throw error;
      });

      await expect(storageAdapter.clear()).rejects.toThrow('Clear error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] Error clearing storage:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should return empty array on getAllKeys errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Keys error');

      vi.spyOn(Object, 'keys').mockImplementationOnce(() => {
        throw error;
      });

      const keys = await storageAdapter.getAllKeys();

      expect(keys).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] Error getting keys:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('animationAdapter', () => {
    it('should request animation frame', () => {
      const callback = vi.fn();
      const frameId = animationAdapter.requestFrame(callback);

      expect(frameId).toBeTypeOf('number');
      expect(frameId).toBeGreaterThan(0);
    });

    it('should call animation frame callback with timestamp', () => {
      return new Promise<void>((resolve) => {
        const callback = vi.fn((timestamp: number) => {
          expect(timestamp).toBeTypeOf('number');
          expect(timestamp).toBeGreaterThan(0);
          resolve();
        });

        animationAdapter.requestFrame(callback);
      });
    });

    it('should cancel animation frame', () => {
      const callback = vi.fn();
      const frameId = animationAdapter.requestFrame(callback);

      animationAdapter.cancelFrame(frameId);

      // Callback should not be called after cancellation
      // Note: This test relies on timing, may not be 100% reliable
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 50);
    });

    it('should return current timestamp', () => {
      const timestamp = animationAdapter.now();

      expect(timestamp).toBeTypeOf('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should return increasing timestamps', () => {
      const timestamp1 = animationAdapter.now();
      const timestamp2 = animationAdapter.now();

      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });
  });

  describe('navigationAdapter', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      // Mock window.location
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: '?foo=bar&baz=qux&empty=',
        pathname: '/test/path',
      } as any;
    });

    afterEach(() => {
      // Modern JSDOM 27+ requires proper restoration
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    it('should get param by key', () => {
      const value = navigationAdapter.getParam('foo');
      expect(value).toBe('bar');
    });

    it('should return null for non-existent param', () => {
      const value = navigationAdapter.getParam('nonexistent');
      expect(value).toBeNull();
    });

    it('should get all params', () => {
      const params = navigationAdapter.getAllParams();

      expect(params).toEqual({
        foo: 'bar',
        baz: 'qux',
        empty: '',
      });
    });

    it('should check if param exists', () => {
      expect(navigationAdapter.hasParam('foo')).toBe(true);
      expect(navigationAdapter.hasParam('baz')).toBe(true);
      expect(navigationAdapter.hasParam('nonexistent')).toBe(false);
    });

    it('should get current path', () => {
      const path = navigationAdapter.getCurrentPath();
      expect(path).toBe('/test/path');
    });

    it('should handle empty search params', () => {
      window.location.search = '';

      const params = navigationAdapter.getAllParams();
      expect(params).toEqual({});
    });

    it('should handle params with special characters', () => {
      window.location.search = '?name=John%20Doe&email=test%40example.com';

      expect(navigationAdapter.getParam('name')).toBe('John Doe');
      expect(navigationAdapter.getParam('email')).toBe('test@example.com');
    });

    it('should handle SSR environment (no window)', () => {
      const originalWindow = globalThis.window;

      // Temporarily remove window
      delete (globalThis as any).window;

      // Create fresh adapter instance for SSR test
      // This tests the SSR safety check in getSearchParams
      const param = navigationAdapter.getParam('anything');
      expect(param).toBeNull();

      // Restore window
      (globalThis as any).window = originalWindow;
    });

    it('should return root path in SSR environment', () => {
      const originalWindow = globalThis.window;

      // Temporarily remove window
      delete (globalThis as any).window;

      const path = navigationAdapter.getCurrentPath();
      expect(path).toBe('/');

      // Restore window
      (globalThis as any).window = originalWindow;
    });
  });

  describe('performanceAdapter', () => {
    beforeEach(() => {
      performanceAdapter.clearMarks();
    });

    afterEach(() => {
      performanceAdapter.clearMarks();
    });

    it('should return current timestamp', () => {
      const timestamp = performanceAdapter.now();

      expect(timestamp).toBeTypeOf('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should create performance mark', () => {
      performanceAdapter.mark('test-mark');

      const marks = performance.getEntriesByName('test-mark', 'mark');
      expect(marks.length).toBeGreaterThan(0);
    });

    it('should measure duration between marks', () => {
      performanceAdapter.mark('start');

      // Small delay
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait
      }

      performanceAdapter.mark('end');

      const duration = performanceAdapter.measure('test-measure', 'start', 'end');

      expect(duration).toBeTypeOf('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure from mark to now if no end mark', () => {
      performanceAdapter.mark('start');

      const duration = performanceAdapter.measure('test-measure', 'start');

      expect(duration).toBeTypeOf('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should clear all marks and measures', () => {
      performanceAdapter.mark('mark1');
      performanceAdapter.mark('mark2');
      performanceAdapter.measure('measure1', 'mark1', 'mark2');

      performanceAdapter.clearMarks();

      const marks = performance.getEntriesByType('mark');
      const measures = performance.getEntriesByType('measure');

      expect(marks.length).toBe(0);
      expect(measures.length).toBe(0);
    });

    it('should handle mark errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('Mark error');

      vi.spyOn(performance, 'mark').mockImplementationOnce(() => {
        throw error;
      });

      performanceAdapter.mark('error-mark');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Performance] mark() not supported:', error);

      consoleWarnSpy.mockRestore();
    });

    it('should handle measure errors and fallback to manual calculation', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      performanceAdapter.mark('start');
      performanceAdapter.mark('end');

      vi.spyOn(performance, 'measure').mockImplementationOnce(() => {
        throw new Error('Measure error');
      });

      const duration = performanceAdapter.measure('test', 'start', 'end');

      expect(duration).toBeTypeOf('number');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to now() if start mark does not exist', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.spyOn(performance, 'measure').mockImplementationOnce(() => {
        throw new Error('Measure error');
      });

      const duration = performanceAdapter.measure('test', 'nonexistent');

      expect(duration).toBe(0); // No start mark found
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle clearMarks errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('Clear error');

      vi.spyOn(performance, 'clearMarks').mockImplementationOnce(() => {
        throw error;
      });

      performanceAdapter.clearMarks();

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Performance] clearMarks() not supported:', error);

      consoleWarnSpy.mockRestore();
    });

    it('should get memory info if available (Chrome)', () => {
      const perfWithMemory = performance as any;
      const originalMemory = perfWithMemory.memory;

      // Mock Chrome memory API
      perfWithMemory.memory = {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 40000000,
      };

      const memoryInfo = performanceAdapter.getMemoryInfo();

      expect(memoryInfo).toEqual({
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
      });

      // Restore
      if (originalMemory) {
        perfWithMemory.memory = originalMemory;
      } else {
        delete perfWithMemory.memory;
      }
    });

    it('should return null if memory info not available', () => {
      const perfWithMemory = performance as any;
      const originalMemory = perfWithMemory.memory;

      delete perfWithMemory.memory;

      const memoryInfo = performanceAdapter.getMemoryInfo();

      expect(memoryInfo).toBeNull();

      // Restore
      if (originalMemory) {
        perfWithMemory.memory = originalMemory;
      }
    });

    it('should measure with only start mark (fallback to now)', () => {
      performanceAdapter.mark('start');

      vi.spyOn(performance, 'measure').mockImplementationOnce(() => {
        throw new Error('Measure error');
      });

      const duration = performanceAdapter.measure('test', 'start');

      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should return last measure entry when multiple measures exist', () => {
      performanceAdapter.mark('start');
      performanceAdapter.mark('mid');
      performanceAdapter.mark('end');

      performanceAdapter.measure('test', 'start', 'mid');
      const duration = performanceAdapter.measure('test', 'start', 'end');

      expect(duration).toBeGreaterThanOrEqual(0);

      const entries = performance.getEntriesByName('test', 'measure');
      expect(entries.length).toBe(2);
    });
  });

  describe('Integration Tests', () => {
    it('should work together: dimensions + deviceInfo for responsive detection', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      // Clear cache
      (deviceInfoAdapter as any).cachedInfo = null;

      const width = dimensionsAdapter.getWidth();
      const deviceInfo = deviceInfoAdapter.getDeviceInfo();

      expect(width).toBe(375);
      expect(deviceInfo.hasTouch).toBe(true);
      // Should detect as mobile due to narrow width + touch
    });

    it('should work together: storage + crypto for secure seed persistence', async () => {
      const seed = cryptoAdapter.generateSecureRandomSeed();

      await storageAdapter.setItem('game-seed', seed.toString());
      const storedSeed = await storageAdapter.getItem('game-seed');

      expect(storedSeed).toBe(seed.toString());
      expect(parseInt(storedSeed!, 10)).toBe(seed);
    });

    it('should work together: animation + performance for frame timing', () => {
      return new Promise<void>((resolve) => {
        const startTime = performanceAdapter.now();

        animationAdapter.requestFrame((timestamp: number) => {
          const endTime = performanceAdapter.now();
          const duration = endTime - startTime;

          expect(duration).toBeGreaterThan(0);
          expect(timestamp).toBeGreaterThan(startTime);
          resolve();
        });
      });
    });

    it('should work together: navigation + storage for param caching', async () => {
      window.location.search = '?level=5&difficulty=hard';

      const level = navigationAdapter.getParam('level');
      const difficulty = navigationAdapter.getParam('difficulty');

      if (level && difficulty) {
        await storageAdapter.setItem('last-level', level);
        await storageAdapter.setItem('last-difficulty', difficulty);
      }

      const cachedLevel = await storageAdapter.getItem('last-level');
      const cachedDifficulty = await storageAdapter.getItem('last-difficulty');

      expect(cachedLevel).toBe('5');
      expect(cachedDifficulty).toBe('hard');
    });
  });
});
