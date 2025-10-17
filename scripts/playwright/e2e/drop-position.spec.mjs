/**
 * E2E Test: Drop Position Selection
 *
 * Tests the drop position choice mechanic where users can select
 * where the ball should be dropped from (left, center, or right).
 */

import { test, expect } from '@playwright/test';
import {
  waitForElement,
  waitForGameState,
  waitForBallDrop,
  takeScreenshot,
  PLAYWRIGHT_SEEDS,
} from '../test-helpers.mjs';

const SEED = PLAYWRIGHT_SEEDS.gameplayTest;

test.describe('Drop Position Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/?seed=${SEED}&choice=drop-position`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('should allow selecting left, center, and right positions', async ({ page }) => {
    console.log('🎯 Starting E2E Test: Drop Position Selection\n');

    // ========================================================================
    // Step 1: Verify game loaded with drop-position mechanic
    // ========================================================================
    console.log('Step 1: Verifying game with drop position mechanic...');

    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game loaded and ready');

    await takeScreenshot(page, 'drop-position-01-ready');

    // ========================================================================
    // Step 2: Click START and verify position selector appears
    // ========================================================================
    console.log('\nStep 2: Starting game...');
    await page.click('[data-testid="drop-ball-button"]');

    // Wait for selecting-position state
    await waitForGameState(page, 'selecting-position', { timeout: 3000 });
    console.log('   ✓ Position selector displayed');

    // Verify START button is visible
    await waitForElement(page, 'button:has-text("START")', { timeout: 2000 });
    console.log('   ✓ START button visible');

    await takeScreenshot(page, 'drop-position-02-selector');

    // ========================================================================
    // Step 3: Use default center position
    // ========================================================================
    console.log('\nStep 3: Using default center position...');

    // Click START button to confirm (center is default)
    await page.click('button:has-text("START")');
    console.log('   ✓ START button clicked');

    // Should transition to countdown
    await waitForGameState(page, 'countdown', { timeout: 2000 });
    console.log('   ✓ Countdown started');

    await takeScreenshot(page, 'drop-position-03-center-countdown');

    // ========================================================================
    // Step 4: Verify ball drops and completes game flow
    // ========================================================================
    console.log('\nStep 4: Waiting for ball drop...');
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    console.log('   ✓ Ball dropping');

    await waitForBallDrop(page, { maxWait: 15000 });
    console.log('   ✓ Ball drop complete');

    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed');

    await takeScreenshot(page, 'drop-position-04-center-landed');

    // ========================================================================
    // Step 5: Reset and test left position (using arrow)
    // ========================================================================
    console.log('\nStep 5: Testing left position (using arrow)...');

    // Wait for prize reveal
    await waitForGameState(page, 'revealed', { timeout: 5000 });

    // Click close/reset button
    const closeButton = page
      .locator('button:has-text("Close")')
      .or(page.locator('[data-testid="close-button"]'));
    await closeButton.first().click();

    // Wait for ready state
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game reset');

    // Start game again
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'selecting-position', { timeout: 3000 });

    // Click left arrow twice to get to left position (from center=index 2 to left=index 0)
    await page.click('button img[alt="Previous"]');
    await page.waitForTimeout(100);
    await page.click('button img[alt="Previous"]');
    await page.waitForTimeout(100);
    console.log('   ✓ Left arrow clicked twice');

    // Click START button to confirm
    await page.click('button:has-text("START")');
    console.log('   ✓ START button clicked for left position');

    await waitForGameState(page, 'countdown', { timeout: 2000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed from left position');

    await takeScreenshot(page, 'drop-position-05-left-landed');

    // ========================================================================
    // Step 6: Reset and test right position (using arrow)
    // ========================================================================
    console.log('\nStep 6: Testing right position (using arrow)...');

    await waitForGameState(page, 'revealed', { timeout: 5000 });
    await closeButton.first().click();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game reset');

    // Start game again
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'selecting-position', { timeout: 3000 });

    // Click right arrow twice to get to right position (from center=index 2 to right=index 4)
    await page.click('button img[alt="Next"]');
    await page.waitForTimeout(100);
    await page.click('button img[alt="Next"]');
    await page.waitForTimeout(100);
    console.log('   ✓ Right arrow clicked twice');

    // Click START button to confirm
    await page.click('button:has-text("START")');
    console.log('   ✓ START button clicked for right position');

    await waitForGameState(page, 'countdown', { timeout: 2000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed from right position');

    await takeScreenshot(page, 'drop-position-06-right-landed');

    console.log('\n✅ Drop Position Selection test PASSED\n');
    console.log('All screenshots saved to screenshots/ directory');
  });
});
