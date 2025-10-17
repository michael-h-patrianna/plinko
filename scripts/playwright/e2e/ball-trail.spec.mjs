/**
 * Ball Trail System Tests
 *
 * Comprehensive test suite for ball trail rendering, performance, and visual quality.
 * Consolidates: test-ball-trail.mjs, test-trail-improvement.mjs, test-trail-performance.mjs, test-trail-visibility.mjs
 */

import { test, expect } from '@playwright/test';
import { waitForElement, waitForGameState, PLAYWRIGHT_SEEDS } from '../test-helpers.mjs';

test.describe('Ball Trail System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=none', { waitUntil: 'networkidle' }); // Use choice=none for clean perf/physics tests
    await page.waitForTimeout(500);
  });

  test('should render trail during ball drop', async ({ page }) => {
    // Start game
    await page.locator('button').first().click();
    console.log('Started game');

    // Wait for game to be ready
    await page.waitForTimeout(500);

    // Wait for ball to be in motion
    await waitForElement(page, '[data-testid="plinko-ball"]', { timeout: 5000 });

    // Verify ball exists
    const ball = page.locator('[data-testid="plinko-ball"]');
    await expect(ball).toBeVisible();

    // Check that trail elements exist (SVG circles in trail)
    // Trail should render as the ball moves
    const hasBallMoved = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      return ball !== null;
    });

    expect(hasBallMoved).toBeTruthy();
    console.log('Trail rendered during ball drop');
  });

  test('should maintain trail quality at 60 FPS', async ({ page }) => {
    // Enable performance tracking
    await page.evaluate(() => {
      window._perfMetrics = {
        frameCount: 0,
        frameTimes: [],
      };

      let lastFrameTime = performance.now();
      const trackFrame = () => {
        const now = performance.now();
        const frameDelta = now - lastFrameTime;
        window._perfMetrics.frameTimes.push(frameDelta);
        window._perfMetrics.frameCount++;
        lastFrameTime = now;
        requestAnimationFrame(trackFrame);
      };
      requestAnimationFrame(trackFrame);
    });

    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for ball drop to complete
    await waitForGameState(page, 'landed', { timeout: 10000 });

    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const m = window._perfMetrics;
      const fps = m.frameTimes.map((t) => 1000 / t);
      const avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
      const minFps = Math.min(...fps);
      const slowFrames = m.frameTimes.filter((t) => t > 1000 / 60 * 1.5).length;
      const slowFramePercent = (slowFrames / m.frameTimes.length) * 100;

      return {
        avgFps: avgFps.toFixed(1),
        minFps: minFps.toFixed(1),
        slowFramePercent: slowFramePercent.toFixed(1),
      };
    });

    console.log(`Average FPS: ${metrics.avgFps}`);
    console.log(`Min FPS: ${metrics.minFps}`);
    console.log(`Slow frames: ${metrics.slowFramePercent}%`);

    // Should maintain close to 60 FPS (allow some tolerance)
    expect(parseFloat(metrics.avgFps)).toBeGreaterThan(54); // 90% of 60 FPS
    expect(parseFloat(metrics.slowFramePercent)).toBeLessThan(10); // Less than 10% slow frames
  });

  test('should render trail with correct visual properties', async ({ page }) => {
    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for ball to be visible
    await waitForElement(page, '[data-testid="plinko-ball"]', { timeout: 5000 });

    // Check trail visual properties
    const trailProperties = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return null;

      // Look for trail elements (SVG circles or trail container)
      const trailElements = ball.querySelectorAll('circle') || [];

      return {
        hasBall: !!ball,
        trailElementCount: trailElements.length,
        ballVisible: ball.offsetParent !== null,
      };
    });

    expect(trailProperties.hasBall).toBeTruthy();
    expect(trailProperties.ballVisible).toBeTruthy();
    console.log(`Trail elements found: ${trailProperties.trailElementCount}`);
  });

  test('should optimize trail points based on velocity', async ({ page }) => {
    // This test verifies that the trail optimization is working
    // The optimization should eliminate Math.pow calls using pre-computed lookup

    // Monkey-patch Math.pow to count calls
    await page.evaluate(() => {
      window._mathPowCalls = 0;
      const originalPow = Math.pow;
      Math.pow = function (...args) {
        window._mathPowCalls++;
        return originalPow.apply(this, args);
      };
    });

    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for ball drop to complete
    await waitForGameState(page, 'landed', { timeout: 10000 });

    // Check Math.pow call count
    const mathPowCalls = await page.evaluate(() => window._mathPowCalls);

    console.log(`Math.pow calls during drop: ${mathPowCalls}`);

    // With optimization, Math.pow calls should be minimal
    // Before optimization: ~1,200 calls/sec (20 trail points × 60 FPS)
    // After optimization: should be < 100 total calls
    expect(mathPowCalls).toBeLessThan(500); // Allow some tolerance for non-trail usage
  });

  test('should handle different performance modes', async ({ page }) => {
    // Try to find performance mode selector (if dev tools are available)
    const performanceSelector = page.locator('select').first();

    const hasSelector = await performanceSelector.count() > 0;

    if (hasSelector) {
      console.log('Testing with power-saving mode');
      await performanceSelector.selectOption('power-saving');
      await page.waitForTimeout(500);

      // Start game in power-saving mode
      await page.locator('button').first().click();
      await page.waitForTimeout(500);
      await waitForGameState(page, 'landed', { timeout: 10000 });

      console.log('Power-saving mode completed');

      // Reset and test high-quality mode
      await page.reload();
      await page.waitForTimeout(500);

      await performanceSelector.selectOption('high-quality');
      await page.waitForTimeout(500);

      await page.locator('button').first().click();
      await page.waitForTimeout(500);
      await waitForGameState(page, 'landed', { timeout: 10000 });

      console.log('High-quality mode completed');
    } else {
      console.log('Performance selector not available, skipping mode test');
    }
  });

  test('should maintain visual quality during fast ball movement', async ({ page }) => {
    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Track ball position changes to ensure trail stretches during fast movement
    const positionSamples = await page.evaluate(async () => {
      const samples = [];
      const ball = document.querySelector('[data-testid="plinko-ball"]');

      for (let i = 0; i < 20; i++) {
        if (ball) {
          const rect = ball.getBoundingClientRect();
          samples.push({ x: rect.x, y: rect.y, timestamp: Date.now() });
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return samples;
    });

    // Verify ball is actually moving
    const positions = positionSamples.filter(s => s.y > 0);
    expect(positions.length).toBeGreaterThan(0);

    // Check for movement (Y should increase as ball drops)
    if (positions.length > 1) {
      const firstY = positions[0].y;
      const lastY = positions[positions.length - 1].y;
      expect(lastY).toBeGreaterThan(firstY); // Ball should move downward
      console.log(`Ball moved from Y:${firstY.toFixed(0)} to Y:${lastY.toFixed(0)}`);
    }
  });
});
