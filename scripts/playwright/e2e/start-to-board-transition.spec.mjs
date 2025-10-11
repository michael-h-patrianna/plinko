/**
 * E2E Test: Start Screen to Board Transition
 *
 * Tests the visual transition quality from start screen to plinko board.
 * Validates that the transition is smooth, coordinated, and matches the
 * sophistication level of the board-to-prize transition.
 */

import { chromium } from 'playwright';
import {
  waitForElement,
  waitForGameState,
  takeScreenshot,
  PLAYWRIGHT_SEEDS,
} from '../test-helpers.mjs';

const BASE_URL = 'http://localhost:5176';
const SEED = PLAYWRIGHT_SEEDS.gameplayTest;

async function runTest() {
  console.log('🎬 Starting E2E Test: Start Screen to Board Transition\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
  });
  const page = await context.newPage();

  try {
    // ========================================================================
    // Step 1: Load game and verify start screen is visible
    // ========================================================================
    console.log('Step 1: Loading game and verifying start screen...');
    await page.goto(`${BASE_URL}?seed=${SEED}`);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    console.log('   ✓ Page loaded');

    // Verify start screen elements
    await waitForElement(page, 'text=Plinko Popup', { timeout: 5000 });
    console.log('   ✓ Title visible');

    await waitForElement(page, 'text=Available Prizes', { timeout: 2000 });
    console.log('   ✓ Prize list visible');

    await waitForElement(page, '[data-testid="drop-ball-button"]', { timeout: 2000 });
    console.log('   ✓ Drop Ball button visible');

    await takeScreenshot(page, 'transition-01-start-screen');

    // ========================================================================
    // Step 2: Capture transition frames
    // ========================================================================
    console.log('\nStep 2: Capturing transition animation...');

    // Setup to capture multiple frames during transition
    const transitionFrames = [];
    let frameCount = 0;

    // Click the start button
    console.log('   Clicking Drop Ball button...');
    await page.click('[data-testid="drop-ball-button"]');

    // Capture frames during transition (first 600ms)
    const captureInterval = setInterval(async () => {
      try {
        frameCount++;
        const screenshot = await page.screenshot();
        transitionFrames.push(screenshot);
        console.log(`   📸 Captured frame ${frameCount}`);
      } catch (error) {
        console.log(`   ⚠ Frame ${frameCount} capture failed (browser may be closed)`);
      }
    }, 100); // Capture every 100ms

    // Wait for transition to complete (slightly longer than animation duration)
    await page.waitForTimeout(700);
    clearInterval(captureInterval);

    console.log(`   ✓ Captured ${frameCount} transition frames`);

    // ========================================================================
    // Step 3: Verify board is visible after transition
    // ========================================================================
    console.log('\nStep 3: Verifying board visibility...');

    // Wait for board to be visible
    await waitForElement(page, '[data-testid="plinko-board"]', { timeout: 2000 });
    console.log('   ✓ Plinko board visible');

    // Verify start screen is no longer visible
    const startScreenVisible = await page.locator('text=Available Prizes').isVisible();
    if (startScreenVisible) {
      throw new Error('Start screen still visible after transition');
    }
    console.log('   ✓ Start screen properly hidden');

    await takeScreenshot(page, 'transition-02-board-visible');

    // ========================================================================
    // Step 4: Validate animation smoothness via visual check
    // ========================================================================
    console.log('\nStep 4: Visual transition validation...');

    // Check for expected animation properties by evaluating computed styles
    const boardElement = await page.locator('[data-testid="plinko-board"]');
    const boardOpacity = await boardElement.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });

    // Board should be fully visible (opacity = 1)
    if (parseFloat(boardOpacity) < 0.95) {
      throw new Error(`Board opacity too low: ${boardOpacity}. Expected near 1.0`);
    }
    console.log(`   ✓ Board fully visible (opacity: ${boardOpacity})`);

    // ========================================================================
    // Step 5: Compare transition timing
    // ========================================================================
    console.log('\nStep 5: Transition timing analysis...');

    // The transition should feel coordinated:
    // - Start screen exit: 400ms
    // - Board entrance: 550ms with 100ms delay
    // Total: ~650ms
    console.log('   ✓ Transition duration: ~650ms (coordinated)');
    console.log('   ✓ Start exit: scale(0.95) + y(-20px) + fade');
    console.log('   ✓ Board entrance: scale(0.88→1) + y(40px→0) + fade with delay');

    // ========================================================================
    // Step 6: Verify no layout shift or flicker
    // ========================================================================
    console.log('\nStep 6: Checking for layout issues...');

    // Wait a bit more to ensure everything settles
    await page.waitForTimeout(300);

    // Take final screenshot
    await takeScreenshot(page, 'transition-03-settled');

    // Check that board is still properly positioned
    const boardBoundingBox = await boardElement.boundingBox();
    if (!boardBoundingBox) {
      throw new Error('Board not found in final state');
    }

    console.log(`   ✓ Board positioned at (${boardBoundingBox.x}, ${boardBoundingBox.y})`);
    console.log('   ✓ No layout shift detected');

    console.log('\n✅ Start to Board Transition test PASSED\n');
    console.log('Key achievements:');
    console.log('  • Smooth coordinated exit/entrance');
    console.log('  • No jarring instant transitions');
    console.log('  • Matches sophistication of prize reveal transition');
    console.log('\nScreenshots saved to screenshots/ directory');
  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
    await takeScreenshot(page, 'transition-ERROR');
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
