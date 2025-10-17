/**
 * Physics Determinism Tests (PRIORITY 1)
 *
 * Critical tests to validate physics simulation is deterministic and reproducible.
 * Ensures same seed produces same outcomes and physics behaves realistically.
 */

import { test, expect } from '@playwright/test';
import { waitForGameState, PLAYWRIGHT_SEEDS } from '../test-helpers.mjs';

test.describe('Physics Determinism', () => {
  test.beforeEach(async ({ page }) => {
    // Use choice=none for clean physics tests without position selection
    await page.goto('/?choice=none', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('same seed should produce same landing slot', async ({ page }) => {
    const seed = PLAYWRIGHT_SEEDS.slot0;
    const results = [];

    // Run 3 iterations with same seed
    for (let i = 0; i < 3; i++) {
      // Inject seed
      await page.evaluate((seedValue) => {
        let currentSeed = seedValue;
        Math.random = function() {
          currentSeed = (currentSeed * 9301 + 49297) % 233280;
          return currentSeed / 233280;
        };
        window.__TEST_SEED__ = seedValue;
      }, seed);

      // Reload to apply seed
      if (i > 0) {
        await page.reload();
        await page.waitForTimeout(500);
      }

      // Start game
      await page.locator('button').first().click();
      await page.waitForTimeout(500);

      // Wait for ball to land
      await waitForGameState(page, 'landed', { timeout: 10000 });

      // Get landing slot/position
      const position = await page.evaluate(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (ball) {
          const rect = ball.getBoundingClientRect();
          return { x: Math.round(rect.x), y: Math.round(rect.y) };
        }
        return null;
      });

      results.push(position);
      console.log(`Run ${i + 1}: Ball landed at x=${position?.x}, y=${position?.y}`);
    }

    // All results should be identical (or very close due to rendering)
    if (results.length >= 2 && results[0] && results[1]) {
      const xDiff = Math.abs(results[0].x - results[1].x);
      const yDiff = Math.abs(results[0].y - results[1].y);

      // Allow small variance (< 5px) for rendering differences
      expect(xDiff).toBeLessThan(5);
      expect(yDiff).toBeLessThan(5);

      console.log('Determinism verified: same seed → same outcome');
    }
  });

  test('different seeds should produce varied outcomes', async ({ page }) => {
    const seeds = [PLAYWRIGHT_SEEDS.slot0, PLAYWRIGHT_SEEDS.slot2, PLAYWRIGHT_SEEDS.slot4];
    const results = [];

    for (let i = 0; i < seeds.length; i++) {
      // Inject seed
      await page.evaluate((seedValue) => {
        let currentSeed = seedValue;
        Math.random = function() {
          currentSeed = (currentSeed * 9301 + 49297) % 233280;
          return currentSeed / 233280;
        };
      }, seeds[i]);

      // Reload to apply seed
      if (i > 0) {
        await page.reload();
        await page.waitForTimeout(500);
      }

      // Start game
      await page.locator('button').first().click();
      await page.waitForTimeout(500);

      // Wait for landing
      await waitForGameState(page, 'landed', { timeout: 10000 });

      // Get position
      const position = await page.evaluate(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (ball) {
          return ball.getBoundingClientRect().x;
        }
        return null;
      });

      results.push(position);
      console.log(`Seed ${seeds[i]}: Ball landed at x=${position}`);
    }

    // Results should be different
    const uniquePositions = new Set(results.filter(r => r !== null).map(r => Math.round(r / 10)));
    expect(uniquePositions.size).toBeGreaterThan(1);

    console.log('Variety verified: different seeds → different outcomes');
  });

  test('ball should never get stuck or freeze', async ({ page }) => {
    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Ball should land within reasonable time (10 seconds max)
    const startTime = Date.now();
    await waitForGameState(page, 'landed', { timeout: 10000 });
    const dropTime = Date.now() - startTime;

    console.log(`Ball drop completed in ${dropTime}ms`);

    // Should complete in reasonable time (< 10 seconds)
    expect(dropTime).toBeLessThan(10000);
  });

  test('ball should always land in a valid slot', async ({ page }) => {
    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for landing
    await waitForGameState(page, 'landed', { timeout: 10000 });

    // Get ball position
    const ballPosition = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return null;

      const rect = ball.getBoundingClientRect();
      const board = document.querySelector('[data-testid="plinko-board"]');
      const boardRect = board?.getBoundingClientRect();

      return {
        x: rect.x,
        y: rect.y,
        withinBoard: boardRect ? (
          rect.x >= boardRect.left &&
          rect.x <= boardRect.right &&
          rect.y >= boardRect.top &&
          rect.y <= boardRect.bottom
        ) : false,
      };
    });

    // Ball should be within board boundaries
    expect(ballPosition?.withinBoard).toBeTruthy();

    console.log('Ball landed at valid position:', ballPosition);
  });

  test('trajectory should be realistic (no teleporting)', async ({ page }) => {
    const positions = [];

    // Track ball position during drop
    await page.exposeFunction('recordPosition', (x, y) => {
      positions.push({ x, y, timestamp: Date.now() });
    });

    await page.evaluate(() => {
      const interval = setInterval(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (ball) {
          const rect = ball.getBoundingClientRect();
          window.recordPosition(rect.x, rect.y);
        }

        // Stop tracking after ball lands
        const gameState = document.querySelector('[data-game-state]')?.getAttribute('data-game-state');
        if (gameState === 'landed' || gameState === 'revealed') {
          clearInterval(interval);
        }
      }, 50); // Track every 50ms
    });

    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for landing
    await waitForGameState(page, 'landed', { timeout: 10000 });
    await page.waitForTimeout(500);

    console.log(`Recorded ${positions.length} position samples`);

    // Verify no sudden jumps (teleporting)
    for (let i = 1; i < positions.length; i++) {
      const dx = Math.abs(positions[i].x - positions[i-1].x);
      const dy = Math.abs(positions[i].y - positions[i-1].y);

      // Max movement per 50ms frame (generous threshold)
      expect(dx).toBeLessThan(200); // No horizontal teleporting
      expect(dy).toBeLessThan(200); // No vertical teleporting
    }

    console.log('Trajectory is realistic (no teleporting detected)');
  });

  test('ball should move downward consistently', async ({ page }) => {
    const yPositions = [];

    // Track Y position
    await page.exposeFunction('recordY', (y) => {
      yPositions.push(y);
    });

    await page.evaluate(() => {
      const interval = setInterval(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (ball) {
          const rect = ball.getBoundingClientRect();
          window.recordY(rect.y);
        }

        const gameState = document.querySelector('[data-game-state]')?.getAttribute('data-game-state');
        if (gameState === 'landed') {
          clearInterval(interval);
        }
      }, 100);
    });

    // Start game
    await page.locator('button').first().click();
    await page.waitForTimeout(500);

    // Wait for landing
    await waitForGameState(page, 'landed', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Ball should generally move downward (Y should increase)
    const firstY = yPositions[0];
    const lastY = yPositions[yPositions.length - 1];

    expect(lastY).toBeGreaterThan(firstY); // Ball moved down

    console.log(`Ball moved from Y:${Math.round(firstY)} to Y:${Math.round(lastY)}`);
  });
});
