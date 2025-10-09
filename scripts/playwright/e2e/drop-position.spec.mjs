/**
 * E2E Test: Drop Position Selection
 *
 * Tests the drop position choice mechanic where users can select
 * where the ball should be dropped from (left, center, or right).
 */

import { chromium } from 'playwright';
import {
  waitForElement,
  waitForGameState,
  waitForBallDrop,
  takeScreenshot,
  PLAYWRIGHT_SEEDS,
} from '../test-helpers.mjs';

const BASE_URL = 'http://localhost:3000';
const SEED = PLAYWRIGHT_SEEDS.gameplayTest;

async function runTest() {
  console.log('🎯 Starting E2E Test: Drop Position Selection\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    // ========================================================================
    // Step 1: Load game with drop-position mechanic enabled
    // ========================================================================
    console.log('Step 1: Loading game with drop position mechanic...');
    await page.goto(`${BASE_URL}?seed=${SEED}&choice=drop-position`);

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

    // Verify position buttons are visible
    await waitForElement(page, '[data-zone="left"]', { timeout: 2000 });
    await waitForElement(page, '[data-zone="center"]', { timeout: 2000 });
    await waitForElement(page, '[data-zone="right"]', { timeout: 2000 });
    console.log('   ✓ All position buttons visible');

    await takeScreenshot(page, 'drop-position-02-selector');

    // ========================================================================
    // Step 3: Select left position
    // ========================================================================
    console.log('\nStep 3: Selecting left position...');
    await page.click('[data-zone="left"]');

    // Should transition to countdown
    await waitForGameState(page, 'countdown', { timeout: 2000 });
    console.log('   ✓ Position selected, countdown started');

    await takeScreenshot(page, 'drop-position-03-left-countdown');

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

    await takeScreenshot(page, 'drop-position-04-left-landed');

    // ========================================================================
    // Step 5: Reset and test center position
    // ========================================================================
    console.log('\nStep 5: Testing center position...');

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

    // Select center position
    await page.click('[data-zone="center"]');
    console.log('   ✓ Center position selected');

    await waitForGameState(page, 'countdown', { timeout: 2000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed from center position');

    await takeScreenshot(page, 'drop-position-05-center-landed');

    // ========================================================================
    // Step 6: Reset and test right position
    // ========================================================================
    console.log('\nStep 6: Testing right position...');

    await waitForGameState(page, 'revealed', { timeout: 5000 });
    await closeButton.first().click();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game reset');

    // Start game again
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'selecting-position', { timeout: 3000 });

    // Select right position
    await page.click('[data-zone="right"]');
    console.log('   ✓ Right position selected');

    await waitForGameState(page, 'countdown', { timeout: 2000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed from right position');

    await takeScreenshot(page, 'drop-position-06-right-landed');

    console.log('\n✅ Drop Position Selection test PASSED\n');
    console.log('All screenshots saved to screenshots/ directory');
  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
    await takeScreenshot(page, 'drop-position-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run test
runTest().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
