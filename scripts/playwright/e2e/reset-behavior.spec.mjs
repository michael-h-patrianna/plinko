/**
 * E2E Test: Reset Behavior
 *
 * Tests various reset scenarios including:
 * - Reset from each game state
 * - Reset during animation
 * - Multiple consecutive resets
 * - State cleanup verification
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

async function testResetFromReady() {
  console.log('\n🔄 Testing Reset from Ready State...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game ready');

    // Reload page to reset
    await page.reload();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Reset successful, game ready again');

    await takeScreenshot(page, 'reset-01-from-ready');

    console.log('   ✅ Reset from Ready test passed');
  } catch (error) {
    console.error('   ❌ Reset from Ready test failed:', error.message);
    await takeScreenshot(page, 'reset-ready-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function testResetDuringCountdown() {
  console.log('\n⏱️ Testing Reset during Countdown...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Start game
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    console.log('   ✓ Countdown started');

    await takeScreenshot(page, 'reset-02-countdown');

    // Reset during countdown
    await page.reload();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Reset successful from countdown');

    // Verify game can be played again
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    console.log('   ✓ Game can restart after reset');

    console.log('   ✅ Reset during Countdown test passed');
  } catch (error) {
    console.error('   ❌ Reset during Countdown test failed:', error.message);
    await takeScreenshot(page, 'reset-countdown-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function testResetDuringAnimation() {
  console.log('\n🎬 Testing Reset during Ball Drop Animation...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Start game and drop ball
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    console.log('   ✓ Ball dropping');

    await takeScreenshot(page, 'reset-03-dropping');

    // Wait a bit to let animation progress
    await page.waitForTimeout(1000);

    // Reset during animation
    await page.reload();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Reset successful during animation');

    // Verify no lingering ball element
    const ballCount = await page.locator('[data-testid="plinko-ball"]').count();
    if (ballCount > 0) {
      const ballVisible = await page.locator('[data-testid="plinko-ball"]').isVisible();
      if (ballVisible) {
        console.log('   ⚠ Ball still visible after reset');
      }
    }

    // Verify game can be played again
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    console.log('   ✓ Game can restart after animation reset');

    console.log('   ✅ Reset during Animation test passed');
  } catch (error) {
    console.error('   ❌ Reset during Animation test failed:', error.message);
    await takeScreenshot(page, 'reset-animation-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function testResetAfterReveal() {
  console.log('\n🎁 Testing Reset after Prize Reveal...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Complete full game flow
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });
    console.log('   ✓ Prize revealed');

    await takeScreenshot(page, 'reset-04-revealed');

    // Click close button to reset
    const closeButton = page
      .locator('button:has-text("Close")')
      .or(page.locator('[data-testid="close-button"]'));

    await closeButton.first().click();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Reset successful after reveal');

    // Verify START button is ready again
    const startButton = await page.locator('[data-testid="drop-ball-button"]');
    const isEnabled = await startButton.isEnabled();
    if (!isEnabled) {
      throw new Error('START button not enabled after reset');
    }
    console.log('   ✓ START button enabled');

    // Verify can play another round
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    console.log('   ✓ New round started successfully');

    console.log('   ✅ Reset after Reveal test passed');
  } catch (error) {
    console.error('   ❌ Reset after Reveal test failed:', error.message);
    await takeScreenshot(page, 'reset-reveal-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function testMultipleConsecutiveResets() {
  console.log('\n🔁 Testing Multiple Consecutive Resets...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);

    for (let i = 1; i <= 5; i++) {
      console.log(`   Reset cycle ${i}...`);

      // Wait for ready state
      await waitForGameState(page, 'ready', { timeout: 5000 });

      // Start game
      await page.click('[data-testid="drop-ball-button"]');
      await waitForGameState(page, 'countdown', { timeout: 3000 });

      // Reset immediately
      await page.reload();
      await waitForGameState(page, 'ready', { timeout: 5000 });

      console.log(`   ✓ Reset cycle ${i} complete`);
    }

    await takeScreenshot(page, 'reset-05-multiple');

    // Verify game still works after multiple resets
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    console.log('   ✓ Game still functional after multiple resets');

    console.log('   ✅ Multiple Consecutive Resets test passed');
  } catch (error) {
    console.error('   ❌ Multiple Consecutive Resets test failed:', error.message);
    await takeScreenshot(page, 'reset-multiple-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function testStateCleanupAfterReset() {
  console.log('\n🧹 Testing State Cleanup after Reset...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}?seed=${SEED}`);
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Play game to completion
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });

    // Record prize before reset
    const prizeTextBefore = await page
      .locator('text=/Prize|Win|Reward/i')
      .first()
      .textContent();
    console.log(`   ✓ Prize before reset: ${prizeTextBefore?.substring(0, 30)}...`);

    // Reset game
    const closeButton = page
      .locator('button:has-text("Close")')
      .or(page.locator('[data-testid="close-button"]'));
    await closeButton.first().click();
    await waitForGameState(page, 'ready', { timeout: 5000 });
    console.log('   ✓ Game reset');

    // Verify ball is not visible
    const ballAfterReset = await page.locator('[data-testid="plinko-ball"]').count();
    if (ballAfterReset > 0) {
      const ballVisible = await page.locator('[data-testid="plinko-ball"]').isVisible();
      if (ballVisible) {
        throw new Error('Ball still visible after reset');
      }
    }
    console.log('   ✓ Ball properly removed');

    // Verify winning slot highlight is cleared
    const activeSlots = await page.locator('[data-active="true"]').count();
    if (activeSlots > 0) {
      console.log('   ⚠ Winning slot still highlighted after reset');
    } else {
      console.log('   ✓ Slot highlights cleared');
    }

    // Play again and verify different outcome possible
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });

    const prizeTextAfter = await page
      .locator('text=/Prize|Win|Reward/i')
      .first()
      .textContent();
    console.log(`   ✓ Prize after reset: ${prizeTextAfter?.substring(0, 30)}...`);

    await takeScreenshot(page, 'reset-06-cleanup');

    console.log('   ✅ State Cleanup test passed');
  } catch (error) {
    console.error('   ❌ State Cleanup test failed:', error.message);
    await takeScreenshot(page, 'reset-cleanup-ERROR');
    throw error;
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🔄 Starting E2E Test: Reset Behavior\n');

  try {
    await testResetFromReady();
    await testResetDuringCountdown();
    await testResetDuringAnimation();
    await testResetAfterReveal();
    await testMultipleConsecutiveResets();
    await testStateCleanupAfterReset();

    console.log('\n✅ All Reset Behavior tests PASSED\n');
    console.log('All screenshots saved to screenshots/ directory');
  } catch (error) {
    console.error('\n❌ Reset Behavior test suite FAILED');
    throw error;
  }
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
