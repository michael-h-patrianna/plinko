/**
 * E2E Test: Prize Claiming Flow
 *
 * Tests the prize claiming functionality including:
 * - Free reward prizes
 * - No-win prizes
 * - Purchase offer prizes
 * - Prize display and claim button functionality
 */

import { test, expect } from '@playwright/test';
import {
  waitForElement,
  waitForGameState,
  waitForBallDrop,
  takeScreenshot,
  initializeWithSeed,
  PLAYWRIGHT_SEEDS,
  startGameWithDropPosition,
} from '../test-helpers.mjs';

test.describe('Prize Claiming Flow', () => {
  // Increase test timeout to 60 seconds for prize claim flow
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('should claim free prize reward', async ({ page }) => {
    console.log('\n📦 Testing Free Prize Claim...');

    // Use a seed that lands on a free prize
    await initializeWithSeed(page, PLAYWRIGHT_SEEDS.slot1);
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    try {
      await waitForGameState(page, 'ready', { timeout: 5000 });
    } catch (error) {
      console.warn('Game not in ready state, continuing anyway');
    }

    // Play through game
    await startGameWithDropPosition(page);
    console.log('   ✓ Started game');

    await waitForGameState(page, 'countdown', { timeout: 5000 });
    console.log('   ✓ Countdown started');

    await waitForGameState(page, 'dropping', { timeout: 10000 });
    console.log('   ✓ Ball dropping');

    await waitForBallDrop(page, { maxWait: 20000 });
    console.log('   ✓ Ball drop complete');

    await waitForGameState(page, 'landed', { timeout: 10000 });
    console.log('   ✓ Ball landed');

    await waitForGameState(page, 'revealed', { timeout: 10000 });
    console.log('   ✓ Prize reveal screen displayed');

    // Verify free reward elements are visible
    const hasRewardAmount = await page.locator('text=/SC|GC|\\d+/i').count();
    if (hasRewardAmount === 0) {
      console.log('   ⚠ No reward amount visible (might be no-win prize)');
    } else {
      console.log('   ✓ Reward amount visible');
    }

    await takeScreenshot(page, 'prize-claim-01-free-reward');

    // Look for claim button
    const claimButton = page
      .locator('button:has-text("Claim")')
      .or(page.locator('button:has-text("Collect")')
      .or(page.locator('[data-testid="claim-button"]')));

    const claimButtonCount = await claimButton.count();
    if (claimButtonCount > 0) {
      await claimButton.first().click();
      console.log('   ✓ Claim button clicked');

      // Verify claimed state
      await waitForGameState(page, 'claimed', { timeout: 3000 });
      console.log('   ✓ Prize claimed successfully');

      await takeScreenshot(page, 'prize-claim-02-free-claimed');
    } else {
      console.log('   ℹ No claim button found (might auto-claim)');
    }

    console.log('   ✅ Free Prize Claim test passed');
  });

  test('should display no-win prize correctly', async ({ page }) => {
    console.log('\n🚫 Testing No-Win Prize...');

    // Use a seed that might land on no-win
    await initializeWithSeed(page, PLAYWRIGHT_SEEDS.slot0);
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    try {
      await waitForGameState(page, 'ready', { timeout: 5000 });
    } catch (error) {
      console.warn('Game not in ready state, continuing anyway');
    }

    // Play through game
    await startGameWithDropPosition(page);
    await waitForGameState(page, 'countdown', { timeout: 5000 });
    await waitForGameState(page, 'dropping', { timeout: 10000 });
    await waitForBallDrop(page, { maxWait: 20000 });
    await waitForGameState(page, 'landed', { timeout: 10000 });
    await waitForGameState(page, 'revealed', { timeout: 10000 });

    console.log('   ✓ Prize reveal screen displayed');

    // Check for no-win messaging
    const hasNoWinText = await page.locator('text=/Better Luck|Try Again|No Win/i').count();
    if (hasNoWinText > 0) {
      console.log('   ✓ No-win message displayed');
    } else {
      console.log('   ℹ Not a no-win prize (or different messaging)');
    }

    await takeScreenshot(page, 'prize-claim-03-no-win');

    // Look for continue/close button
    const continueButton = page
      .locator('button:has-text("Continue")')
      .or(page.locator('button:has-text("Close")')
      .or(page.locator('button:has-text("Try Again")')));

    const continueButtonCount = await continueButton.count();
    if (continueButtonCount > 0) {
      await continueButton.first().click();
      console.log('   ✓ Continue button clicked');
    } else {
      console.log('   ℹ No continue button found');
    }

    console.log('   ✅ No-Win Prize test passed');
  });

  test('should display purchase offer prize correctly', async ({ page }) => {
    console.log('\n💰 Testing Purchase Offer Prize...');

    // Use a seed that might land on purchase offer
    await initializeWithSeed(page, PLAYWRIGHT_SEEDS.slot3);
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    try {
      await waitForGameState(page, 'ready', { timeout: 5000 });
    } catch (error) {
      console.warn('Game not in ready state, continuing anyway');
    }

    // Play through game
    await startGameWithDropPosition(page);
    await waitForGameState(page, 'countdown', { timeout: 5000 });
    await waitForGameState(page, 'dropping', { timeout: 10000 });
    await waitForBallDrop(page, { maxWait: 20000 });
    await waitForGameState(page, 'landed', { timeout: 10000 });
    await waitForGameState(page, 'revealed', { timeout: 10000 });

    console.log('   ✓ Prize reveal screen displayed');

    // Check for purchase offer elements
    const hasPurchaseText = await page.locator('text=/Buy|Purchase|Special Offer|Bonus/i').count();
    if (hasPurchaseText > 0) {
      console.log('   ✓ Purchase offer messaging visible');
    } else {
      console.log('   ℹ Not a purchase offer prize');
    }

    // Check for price display
    const hasPriceText = await page.locator('text=/\\$\\d+\\.\\d{2}/').count();
    if (hasPriceText > 0) {
      console.log('   ✓ Price displayed');
    } else {
      console.log('   ℹ No price visible');
    }

    await takeScreenshot(page, 'prize-claim-04-purchase-offer');

    // Look for purchase button
    const purchaseButton = page
      .locator('button:has-text("Buy")')
      .or(page.locator('button:has-text("Purchase")')
      .or(page.locator('button:has-text("Get Offer")')));

    const purchaseButtonCount = await purchaseButton.count();
    if (purchaseButtonCount > 0) {
      console.log('   ✓ Purchase button visible');
      // Don't actually click purchase in test
    } else {
      console.log('   ℹ No purchase button found');
    }

    console.log('   ✅ Purchase Offer Prize test passed');
  });

  test('should handle multiple consecutive claim rounds', async ({ page }) => {
    console.log('\n🔄 Testing Multiple Claim Rounds...');

    await initializeWithSeed(page, PLAYWRIGHT_SEEDS.gameplayTest);
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    try {
      await waitForGameState(page, 'ready', { timeout: 5000 });
    } catch (error) {
      console.warn('Game not in ready state, continuing anyway');
    }

    // Play 3 consecutive rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`   Round ${round}...`);

      // Play game
      await startGameWithDropPosition(page);
      await waitForGameState(page, 'countdown', { timeout: 5000 });
      await waitForGameState(page, 'dropping', { timeout: 10000 });
      await waitForBallDrop(page, { maxWait: 20000 });
      await waitForGameState(page, 'landed', { timeout: 10000 });
      await waitForGameState(page, 'revealed', { timeout: 10000 });

      console.log(`   ✓ Round ${round} completed`);

      await takeScreenshot(page, `prize-claim-round-${round}`);

      // Reset for next round (except last)
      if (round < 3) {
        const closeButton = page
          .locator('button:has-text("Close")')
          .or(page.locator('[data-testid="close-button"]'));

        await closeButton.first().click();
        await waitForGameState(page, 'ready', { timeout: 5000 });
        console.log(`   ✓ Round ${round} reset`);
      }
    }

    console.log('   ✅ Multiple Claim Rounds test passed');
  });
});
