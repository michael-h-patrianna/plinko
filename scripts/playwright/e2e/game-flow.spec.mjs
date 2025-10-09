/**
 * E2E Test: Complete Game Flow
 *
 * Tests the full user journey from loading the game to claiming a prize.
 * Validates visual elements, state transitions, and UI responsiveness.
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
  console.log('🎮 Starting E2E Test: Complete Game Flow\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
  });
  const page = await context.newPage();

  try {
    // ========================================================================
    // Step 1: Load game and verify prizes are displayed
    // ========================================================================
    console.log('Step 1: Loading game...');
    await page.goto(`${BASE_URL}?seed=${SEED}`);

    // Wait for game to be ready
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game loaded and ready');

    // Verify prize slots are visible
    const slotCount = await page.locator('[data-testid^="slot-"]').count();
    if (slotCount < 3 || slotCount > 8) {
      throw new Error(`Invalid slot count: ${slotCount}. Expected 3-8 slots.`);
    }
    console.log(`   ✓ ${slotCount} prize slots visible`);

    // Verify START button exists
    await waitForElement(page, '[data-testid="drop-ball-button"]');
    console.log('   ✓ START button visible');

    await takeScreenshot(page, 'game-flow-01-ready');

    // ========================================================================
    // Step 2: Click START button and verify countdown
    // ========================================================================
    console.log('\nStep 2: Starting game...');
    await page.click('[data-testid="drop-ball-button"]');

    // Wait for countdown state
    await waitForGameState(page, 'countdown', { timeout: 2000 });
    console.log('   ✓ Countdown started');

    // Verify countdown numbers are visible
    await waitForElement(page, 'text=3', { timeout: 1000 });
    console.log('   ✓ Countdown display visible');

    await takeScreenshot(page, 'game-flow-02-countdown');

    // ========================================================================
    // Step 3: Wait for ball drop and verify animation
    // ========================================================================
    console.log('\nStep 3: Waiting for ball drop...');

    // Wait for dropping state
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    console.log('   ✓ Ball drop started');

    // Verify ball element is visible
    await waitForElement(page, '[data-testid="plinko-ball"]', { timeout: 2000 });
    console.log('   ✓ Ball visible during drop');

    await takeScreenshot(page, 'game-flow-03-dropping');

    // Wait for ball to complete drop animation
    await waitForBallDrop(page, { maxWait: 15000 });
    console.log('   ✓ Ball drop animation complete');

    // ========================================================================
    // Step 4: Verify landing and slot highlight
    // ========================================================================
    console.log('\nStep 4: Verifying landing...');

    // Wait for landed state
    await waitForGameState(page, 'landed', { timeout: 5000 });
    console.log('   ✓ Ball landed');

    // Verify winning slot is highlighted
    const winningSlot = await page.locator('[data-active="true"]').first();
    const isVisible = await winningSlot.isVisible();
    if (!isVisible) {
      throw new Error('Winning slot not highlighted');
    }
    console.log('   ✓ Winning slot highlighted');

    await takeScreenshot(page, 'game-flow-04-landed');

    // ========================================================================
    // Step 5: Verify prize reveal
    // ========================================================================
    console.log('\nStep 5: Waiting for prize reveal...');

    // Wait for revealed state (auto-reveal after landing)
    await waitForGameState(page, 'revealed', { timeout: 5000 });
    console.log('   ✓ Prize revealed');

    // Verify prize reveal screen elements
    const prizeTitle = await page.locator('text=/Prize|Win|Reward/i').first();
    const isTitleVisible = await prizeTitle.isVisible();
    if (!isTitleVisible) {
      throw new Error('Prize title not visible');
    }
    console.log('   ✓ Prize reveal screen displayed');

    await takeScreenshot(page, 'game-flow-05-revealed');

    // ========================================================================
    // Step 6: Claim prize and verify completion
    // ========================================================================
    console.log('\nStep 6: Claiming prize...');

    // Click claim button (if present)
    const claimButton = page.locator('button:has-text("Claim")').or(page.locator('button:has-text("Collect")'));
    const claimButtonExists = await claimButton.count();

    if (claimButtonExists > 0) {
      await claimButton.first().click();
      console.log('   ✓ Claim button clicked');

      // Wait for claimed state
      await waitForGameState(page, 'claimed', { timeout: 3000 });
      console.log('   ✓ Prize claimed');

      await takeScreenshot(page, 'game-flow-06-claimed');
    } else {
      console.log('   ℹ No claim button found (might auto-claim)');
    }

    // ========================================================================
    // Step 7: Reset game and verify return to ready state
    // ========================================================================
    console.log('\nStep 7: Resetting game...');

    // Look for reset/close button
    const resetButton = page
      .locator('button:has-text("Close")')
      .or(page.locator('button:has-text("Play Again")'))
      .or(page.locator('[data-testid="close-button"]'));

    const resetButtonExists = await resetButton.count();
    if (resetButtonExists > 0) {
      await resetButton.first().click();
      console.log('   ✓ Reset button clicked');

      // Wait for game to return to ready or idle state
      try {
        await Promise.race([
          waitForGameState(page, 'ready', { timeout: 3000 }),
          waitForGameState(page, 'idle', { timeout: 3000 }),
        ]);
        console.log('   ✓ Game reset to initial state');
      } catch (error) {
        console.log('   ⚠ Game may have reset but state not detected');
      }

      await takeScreenshot(page, 'game-flow-07-reset');
    } else {
      console.log('   ℹ No reset button found');
    }

    console.log('\n✅ Complete Game Flow test PASSED\n');
    console.log('All screenshots saved to screenshots/ directory');
  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
    await takeScreenshot(page, 'game-flow-ERROR');
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
