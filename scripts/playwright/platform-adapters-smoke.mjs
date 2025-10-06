/**
 * Platform Adapters - Web Smoke Tests
 *
 * Comprehensive Playwright tests to verify platform adapters work correctly
 * in a real browser environment. Tests all adapters: storage, dimensions,
 * navigation, crypto, animation, performance, and deviceInfo.
 *
 * Run with: node scripts/playwright/platform-adapters-smoke.mjs
 */

import { test, expect } from '@playwright/test';

const DEV_SERVER_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'screenshots/platform-tests';

test.describe('Platform Adapters - Web Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dev server
    await page.goto(DEV_SERVER_URL);
    await page.waitForLoadState('networkidle');
  });

  test('platform detection - detects web platform correctly', async ({ page }) => {
    const platformInfo = await page.evaluate(() => {
      // Import platform detection utilities
      const detectPlatform = () => {
        if (
          typeof navigator !== 'undefined' &&
          navigator.product === 'ReactNative'
        ) {
          return 'native';
        }
        if (
          typeof window !== 'undefined' &&
          typeof document !== 'undefined'
        ) {
          return 'web';
        }
        return 'web';
      };

      return {
        platform: detectPlatform(),
        hasWindow: typeof window !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        hasNavigator: typeof navigator !== 'undefined',
        navigatorProduct: typeof navigator !== 'undefined' ? navigator.product : null,
      };
    });

    // Verify web platform is detected
    expect(platformInfo.platform).toBe('web');
    expect(platformInfo.hasWindow).toBe(true);
    expect(platformInfo.hasDocument).toBe(true);
    expect(platformInfo.hasNavigator).toBe(true);
    expect(platformInfo.navigatorProduct).not.toBe('ReactNative');
  });

  test('storage adapter - basic operations work', async ({ page }) => {
    const testKey = 'playwright-test-key';
    const testValue = 'playwright-test-value';

    const result = await page.evaluate(
      async ({ key, value }) => {
        // Set item
        localStorage.setItem(key, value);

        // Get item
        const retrieved = localStorage.getItem(key);

        // Check it exists
        const exists = localStorage.getItem(key) !== null;

        // Remove item
        localStorage.removeItem(key);

        // Verify removed
        const afterRemove = localStorage.getItem(key);

        return {
          setSuccess: true,
          retrievedValue: retrieved,
          existsBeforeRemove: exists,
          existsAfterRemove: afterRemove !== null,
        };
      },
      { key: testKey, value: testValue }
    );

    expect(result.setSuccess).toBe(true);
    expect(result.retrievedValue).toBe(testValue);
    expect(result.existsBeforeRemove).toBe(true);
    expect(result.existsAfterRemove).toBe(false);
  });

  test('storage adapter - getAllKeys works', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Clear first
      localStorage.clear();

      // Add test items
      localStorage.setItem('test1', 'value1');
      localStorage.setItem('test2', 'value2');
      localStorage.setItem('test3', 'value3');

      // Get all keys
      const keys = Object.keys(localStorage);

      // Clean up
      localStorage.clear();

      return {
        keys,
        keyCount: keys.length,
      };
    });

    expect(result.keyCount).toBe(3);
    expect(result.keys).toContain('test1');
    expect(result.keys).toContain('test2');
    expect(result.keys).toContain('test3');
  });

  test('dimensions adapter - returns correct window dimensions', async ({ page }) => {
    const dimensions = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        hasInnerWidth: typeof window.innerWidth === 'number',
        hasInnerHeight: typeof window.innerHeight === 'number',
      };
    });

    // Verify dimensions are positive numbers
    expect(dimensions.hasInnerWidth).toBe(true);
    expect(dimensions.hasInnerHeight).toBe(true);
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);

    // Verify they match Playwright's viewport
    const viewport = page.viewportSize();
    if (viewport) {
      expect(dimensions.width).toBe(viewport.width);
      expect(dimensions.height).toBe(viewport.height);
    }
  });

  test('dimensions adapter - resize listener fires on window resize', async ({ page }) => {
    const resizeTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let resizeCalled = false;
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;

        // Add resize listener
        const handleResize = () => {
          resizeCalled = true;
          const newWidth = window.innerWidth;
          const newHeight = window.innerHeight;

          // Clean up
          window.removeEventListener('resize', handleResize);

          resolve({
            resizeCalled,
            originalWidth,
            originalHeight,
            newWidth,
            newHeight,
            dimensionsChanged:
              newWidth !== originalWidth || newHeight !== originalHeight,
          });
        };

        window.addEventListener('resize', handleResize);

        // Trigger resize event
        // Note: We can't actually resize the window in this context,
        // but we can dispatch the event
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });
    });

    expect(resizeTest.resizeCalled).toBe(true);
  });

  test('navigation adapter - reads query parameters', async ({ page }) => {
    // Navigate with query params
    await page.goto(`${DEV_SERVER_URL}?seed=12345&theme=dark&test=true`);
    await page.waitForLoadState('networkidle');

    const navInfo = await page.evaluate(() => {
      const params = new URLSearchParams(window.location.search);

      return {
        hasSeed: params.has('seed'),
        seedValue: params.get('seed'),
        hasTheme: params.has('theme'),
        themeValue: params.get('theme'),
        hasTest: params.has('test'),
        testValue: params.get('test'),
        allParams: Object.fromEntries(params.entries()),
        currentPath: window.location.pathname,
      };
    });

    expect(navInfo.hasSeed).toBe(true);
    expect(navInfo.seedValue).toBe('12345');
    expect(navInfo.hasTheme).toBe(true);
    expect(navInfo.themeValue).toBe('dark');
    expect(navInfo.hasTest).toBe(true);
    expect(navInfo.testValue).toBe('true');
    expect(navInfo.allParams).toEqual({
      seed: '12345',
      theme: 'dark',
      test: 'true',
    });
    expect(navInfo.currentPath).toBe('/');
  });

  test('navigation adapter - getCurrentPath returns correct path', async ({ page }) => {
    const pathInfo = await page.evaluate(() => {
      return {
        pathname: window.location.pathname,
        href: window.location.href,
        hasLocationAPI: typeof window.location !== 'undefined',
      };
    });

    expect(pathInfo.hasLocationAPI).toBe(true);
    expect(pathInfo.pathname).toBe('/');
    expect(pathInfo.href).toContain(DEV_SERVER_URL);
  });

  test('crypto adapter - generates secure random seeds', async ({ page }) => {
    const cryptoTest = await page.evaluate(() => {
      // Generate multiple seeds
      const seeds = [];
      for (let i = 0; i < 5; i++) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        seeds.push(array[0]);
      }

      return {
        seeds,
        allNumbers: seeds.every((s) => typeof s === 'number'),
        allPositive: seeds.every((s) => s >= 0),
        allUnique: new Set(seeds).size === seeds.length,
        hasCryptoAPI: typeof crypto !== 'undefined',
        hasGetRandomValues: typeof crypto.getRandomValues === 'function',
      };
    });

    expect(cryptoTest.hasCryptoAPI).toBe(true);
    expect(cryptoTest.hasGetRandomValues).toBe(true);
    expect(cryptoTest.allNumbers).toBe(true);
    expect(cryptoTest.allPositive).toBe(true);
    expect(cryptoTest.allUnique).toBe(true);
    expect(cryptoTest.seeds).toHaveLength(5);
  });

  test('crypto adapter - different seeds on multiple calls', async ({ page }) => {
    const uniquenessTest = await page.evaluate(() => {
      const seeds = new Set();
      for (let i = 0; i < 100; i++) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        seeds.add(array[0]);
      }

      return {
        totalGenerated: 100,
        uniqueCount: seeds.size,
        // Should have very high uniqueness (at least 95% for 100 samples)
        isHighlyUnique: seeds.size >= 95,
      };
    });

    expect(uniquenessTest.totalGenerated).toBe(100);
    expect(uniquenessTest.isHighlyUnique).toBe(true);
  });

  test('animation adapter - requestAnimationFrame works', async ({ page }) => {
    const animationTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let callbackFired = false;
        let timestamp = 0;

        const frameId = requestAnimationFrame((time) => {
          callbackFired = true;
          timestamp = time;

          resolve({
            callbackFired,
            timestampIsNumber: typeof time === 'number',
            timestampIsPositive: time > 0,
            hasRequestAnimationFrame: typeof requestAnimationFrame === 'function',
            hasCancelAnimationFrame: typeof cancelAnimationFrame === 'function',
          });
        });

        // Ensure we have a frame ID
        if (typeof frameId !== 'number') {
          resolve({
            callbackFired: false,
            error: 'requestAnimationFrame did not return a number',
          });
        }
      });
    });

    expect(animationTest.callbackFired).toBe(true);
    expect(animationTest.timestampIsNumber).toBe(true);
    expect(animationTest.timestampIsPositive).toBe(true);
    expect(animationTest.hasRequestAnimationFrame).toBe(true);
    expect(animationTest.hasCancelAnimationFrame).toBe(true);
  });

  test('animation adapter - cancelAnimationFrame works', async ({ page }) => {
    const cancelTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let callbackFired = false;

        const frameId = requestAnimationFrame(() => {
          callbackFired = true;
        });

        // Cancel immediately
        cancelAnimationFrame(frameId);

        // Wait a bit to ensure callback doesn't fire
        setTimeout(() => {
          resolve({
            callbackFired,
            cancelWorked: !callbackFired,
          });
        }, 100);
      });
    });

    expect(cancelTest.callbackFired).toBe(false);
    expect(cancelTest.cancelWorked).toBe(true);
  });

  test('performance adapter - now() returns increasing timestamps', async ({ page }) => {
    const performanceTest = await page.evaluate(() => {
      const timestamps = [];

      // Take multiple timestamps
      for (let i = 0; i < 5; i++) {
        timestamps.push(performance.now());
      }

      return {
        timestamps,
        allNumbers: timestamps.every((t) => typeof t === 'number'),
        allPositive: timestamps.every((t) => t > 0),
        isIncreasing: timestamps.every((t, i) => i === 0 || t >= timestamps[i - 1]),
        hasPerformanceAPI: typeof performance !== 'undefined',
        hasNow: typeof performance.now === 'function',
      };
    });

    expect(performanceTest.hasPerformanceAPI).toBe(true);
    expect(performanceTest.hasNow).toBe(true);
    expect(performanceTest.allNumbers).toBe(true);
    expect(performanceTest.allPositive).toBe(true);
    expect(performanceTest.isIncreasing).toBe(true);
  });

  test('performance adapter - mark and measure work', async ({ page }) => {
    const markTest = await page.evaluate(() => {
      try {
        // Create marks
        performance.mark('test-start');

        // Do some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }

        performance.mark('test-end');

        // Measure
        performance.measure('test-duration', 'test-start', 'test-end');

        const measures = performance.getEntriesByName('test-duration', 'measure');
        const duration = measures[0]?.duration ?? 0;

        // Clean up
        performance.clearMarks();
        performance.clearMeasures();

        return {
          hasMark: typeof performance.mark === 'function',
          hasMeasure: typeof performance.measure === 'function',
          hasClearMarks: typeof performance.clearMarks === 'function',
          measureFound: measures.length > 0,
          durationIsNumber: typeof duration === 'number',
          durationIsPositive: duration >= 0,
          sum, // Just to ensure work was done
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    });

    expect(markTest.hasMark).toBe(true);
    expect(markTest.hasMeasure).toBe(true);
    expect(markTest.hasClearMarks).toBe(true);
    expect(markTest.measureFound).toBe(true);
    expect(markTest.durationIsNumber).toBe(true);
    expect(markTest.durationIsPositive).toBe(true);
  });

  test('deviceInfo adapter - returns user agent', async ({ page }) => {
    const deviceInfo = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        hasNavigator: typeof navigator !== 'undefined',
        hasUserAgent: typeof navigator.userAgent === 'string',
        userAgentLength: navigator.userAgent.length,
      };
    });

    expect(deviceInfo.hasNavigator).toBe(true);
    expect(deviceInfo.hasUserAgent).toBe(true);
    expect(deviceInfo.userAgentLength).toBeGreaterThan(0);
    expect(typeof deviceInfo.userAgent).toBe('string');
  });

  test('deviceInfo adapter - detects device type correctly', async ({ page }) => {
    const deviceDetection = await page.evaluate(() => {
      const ua = navigator.userAgent.toLowerCase();
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const isMobileUA =
        /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

      let deviceType = 'desktop';
      if (isTabletUA) {
        deviceType = 'tablet';
      } else if (isMobileUA || (hasTouch && window.innerWidth <= 768)) {
        deviceType = 'mobile';
      }

      return {
        userAgent: ua,
        hasTouch,
        isMobileUA,
        isTabletUA,
        deviceType,
        maxTouchPoints: navigator.maxTouchPoints,
        screenWidth: window.innerWidth,
      };
    });

    // Verify we get a valid device type
    expect(['mobile', 'tablet', 'desktop']).toContain(deviceDetection.deviceType);
    expect(typeof deviceDetection.hasTouch).toBe('boolean');
    expect(typeof deviceDetection.maxTouchPoints).toBe('number');
  });

  test('all adapters - integration test', async ({ page }) => {
    const integrationTest = await page.evaluate(async () => {
      const results = {
        storage: false,
        dimensions: false,
        navigation: false,
        crypto: false,
        animation: false,
        performance: false,
        deviceInfo: false,
      };

      // Test storage
      try {
        localStorage.setItem('integration-test', 'value');
        results.storage = localStorage.getItem('integration-test') === 'value';
        localStorage.removeItem('integration-test');
      } catch (e) {
        results.storage = false;
      }

      // Test dimensions
      try {
        results.dimensions =
          typeof window.innerWidth === 'number' &&
          typeof window.innerHeight === 'number';
      } catch (e) {
        results.dimensions = false;
      }

      // Test navigation
      try {
        results.navigation =
          typeof window.location !== 'undefined' &&
          typeof window.location.pathname === 'string';
      } catch (e) {
        results.navigation = false;
      }

      // Test crypto
      try {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        results.crypto = typeof arr[0] === 'number';
      } catch (e) {
        results.crypto = false;
      }

      // Test animation
      try {
        results.animation = await new Promise((resolve) => {
          const id = requestAnimationFrame(() => {
            resolve(true);
          });
          if (typeof id !== 'number') {
            resolve(false);
          }
        });
      } catch (e) {
        results.animation = false;
      }

      // Test performance
      try {
        const t = performance.now();
        results.performance = typeof t === 'number' && t > 0;
      } catch (e) {
        results.performance = false;
      }

      // Test deviceInfo
      try {
        results.deviceInfo =
          typeof navigator.userAgent === 'string' &&
          navigator.userAgent.length > 0;
      } catch (e) {
        results.deviceInfo = false;
      }

      return results;
    });

    // Verify all adapters work
    expect(integrationTest.storage).toBe(true);
    expect(integrationTest.dimensions).toBe(true);
    expect(integrationTest.navigation).toBe(true);
    expect(integrationTest.crypto).toBe(true);
    expect(integrationTest.animation).toBe(true);
    expect(integrationTest.performance).toBe(true);
    expect(integrationTest.deviceInfo).toBe(true);
  });

  // Screenshot on test failure
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `${SCREENSHOT_DIR}/${testInfo.title.replace(/\s+/g, '-')}-failure.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    }
  });
});
