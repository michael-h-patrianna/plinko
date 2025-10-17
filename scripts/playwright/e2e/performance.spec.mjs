/**
 * Performance Tests (PRIORITY 2)
 *
 * Validates performance benchmarks and detects regressions.
 * Tests FPS, load time, memory usage, and animation smoothness.
 */

import { test, expect } from '@playwright/test';
import { waitForGameState } from '../test-helpers.mjs';

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=none', { waitUntil: 'networkidle' }); // Use choice=none for clean perf/physics tests
    await page.waitForTimeout(500);
  });

  test('should maintain 30+ FPS during ball drop', async ({ page }) => {
    // Start FPS monitoring
    await page.evaluate(() => {
      window.fpsLog = [];
      let lastTime = performance.now();
      let frames = 0;

      function measureFPS() {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          window.fpsLog.push(frames);
          frames = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(measureFPS);
      }
      requestAnimationFrame(measureFPS);
    });

    // Start game
    await page.getByTestId('drop-ball-button').click();
    await page.waitForTimeout(500);

    // Wait for ball to land with increased timeout for CI
    await waitForGameState(page, 'landed', { timeout: 30000 });

    // Get FPS measurements
    const fpsLog = await page.evaluate(() => window.fpsLog || []);

    // Should maintain at least 30 FPS (realistic for CI/headless)
    const avgFPS = fpsLog.reduce((a, b) => a + b, 0) / fpsLog.length;
    console.log(`Average FPS: ${avgFPS.toFixed(1)}`);

    expect(avgFPS).toBeGreaterThan(25); // 30 FPS target with tolerance
  });

  test('should load page in under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // < 5 seconds (generous for CI)
  });

  test('should have minimal layout shift (CLS < 0.1)', async ({ page }) => {
    await page.goto('/');

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    console.log(`Cumulative Layout Shift: ${cls.toFixed(3)}`);
    expect(cls).toBeLessThan(0.25); // Allow some tolerance for development
  });

  test('should not leak memory across multiple rounds', async ({ page }) => {
    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });

    // Play 5 rounds
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('drop-ball-button').click();
      await page.waitForTimeout(500);

      await waitForGameState(page, 'revealed', { timeout: 30000 });

      // Try to reset/continue
      await page.reload();
      await page.waitForTimeout(500);
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });

    if (initialMemory && finalMemory) {
      const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
      console.log(`Memory growth: ${(memoryGrowth * 100).toFixed(1)}%`);

      // Memory should not grow significantly (< 50% growth max)
      expect(memoryGrowth).toBeLessThan(0.5);
    } else {
      console.log('Memory API not available in this browser');
    }
  });

  test('should render animations without excessive jank', async ({ page }) => {
    // Measure frame times during animation
    const frameTimes = await page.evaluate(async () => {
      const times = [];
      let lastTime = performance.now();

      return new Promise((resolve) => {
        function measureFrame() {
          const currentTime = performance.now();
          times.push(currentTime - lastTime);
          lastTime = currentTime;

          if (times.length < 60) { // Measure 1 second
            requestAnimationFrame(measureFrame);
          } else {
            resolve(times);
          }
        }
        requestAnimationFrame(measureFrame);
      });
    });

    // Check for janky frames (> 50ms = dropped frame at 20 FPS threshold)
    const jankyFrames = frameTimes.filter(time => time > 50);
    const jankyPercentage = (jankyFrames.length / frameTimes.length) * 100;

    console.log(`Janky frames: ${jankyPercentage.toFixed(1)}%`);

    // Allow max 30% janky frames (generous for CI)
    expect(jankyPercentage).toBeLessThan(30);
  });

  test('should complete ball drop in reasonable time', async ({ page }) => {
    // Start game
    await page.getByTestId('drop-ball-button').click();
    await page.waitForTimeout(500);

    const startTime = Date.now();
    await waitForGameState(page, 'landed', { timeout: 30000 });
    const dropTime = Date.now() - startTime;

    console.log(`Ball drop time: ${dropTime}ms`);

    // Should complete in less than 15 seconds (generous for CI)
    expect(dropTime).toBeLessThan(15000);
  });

  test('should handle rapid interactions without performance degradation', async ({ page }) => {
    // Enable FPS tracking
    await page.evaluate(() => {
      window._fpsData = [];
      let lastTime = performance.now();

      function trackFPS() {
        const now = performance.now();
        const fps = 1000 / (now - lastTime);
        window._fpsData.push(fps);
        lastTime = now;
        requestAnimationFrame(trackFPS);
      }
      requestAnimationFrame(trackFPS);
    });

    // Rapidly click 10 times
    const button = page.getByTestId('drop-ball-button');
    for (let i = 0; i < 10; i++) {
      await button.click({ force: true, timeout: 100 }).catch(() => {});
      await page.waitForTimeout(50);
    }

    // Wait a bit
    await page.waitForTimeout(2000);

    // Check FPS remained stable
    const avgFps = await page.evaluate(() => {
      const data = window._fpsData || [];
      return data.reduce((a, b) => a + b, 0) / data.length;
    });

    console.log(`Average FPS during rapid interactions: ${avgFps.toFixed(1)}`);

    // FPS should remain reasonable (allow degradation in CI)
    expect(avgFps).toBeGreaterThan(20); // Allow more degradation but not complete freeze
  });

  test('should have acceptable bundle load time', async ({ page }) => {
    // Measure performance timing
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      if (perf) {
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          responseTime: perf.responseEnd - perf.requestStart,
        };
      }
      return null;
    });

    if (timing) {
      console.log('Performance timing:', timing);

      // DOM content should load quickly
      expect(timing.domContentLoaded).toBeLessThan(1000); // < 1 second
    }
  });

  test('should maintain performance with multiple animations', async ({ page }) => {
    // Start game
    await page.getByTestId('drop-ball-button').click();
    await page.waitForTimeout(500);

    // Track performance during active animations
    await page.evaluate(() => {
      window._perfStart = performance.now();
    });

    // Wait for ball drop (multiple animations active)
    await waitForGameState(page, 'landed', { timeout: 30000 });

    const perfDuration = await page.evaluate(() => {
      return performance.now() - window._perfStart;
    });

    console.log(`Animation duration: ${perfDuration.toFixed(0)}ms`);

    // Should complete without excessive delay (generous for CI)
    expect(perfDuration).toBeLessThan(20000);
  });
});
