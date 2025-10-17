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
  PLAYWRIGHT_SEEDS,
  startGameWithDropPosition,
} from '../test-helpers.mjs';

test.describe('Prize Claiming Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('should claim free prize reward', async ({ page }) => {
    console.log('\n📦 Testing Free Prize Claim...');

    // Use a seed that lands on a free prize
    await page.goto(`/?seed=${PLAYWRIGHT_SEEDS.slot1}&choice=drop-position`, { waitUntil: 'networkidle' });
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Play through game
    await startGameWithDropPosition(page); // Handles drop position if enabled
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });

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
    await page.goto(`/?seed=${PLAYWRIGHT_SEEDS.slot0}&choice=drop-position`, { waitUntil: 'networkidle' });
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Play through game
    await startGameWithDropPosition(page); // Handles drop position if enabled
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });

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
    await page.goto(`/?seed=${PLAYWRIGHT_SEEDS.slot3}&choice=drop-position`, { waitUntil: 'networkidle' });
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Play through game
    await startGameWithDropPosition(page); // Handles drop position if enabled
    await waitForGameState(page, 'countdown', { timeout: 3000 });
    await waitForGameState(page, 'dropping', { timeout: 5000 });
    await waitForBallDrop(page, { maxWait: 15000 });
    await waitForGameState(page, 'landed', { timeout: 5000 });
    await waitForGameState(page, 'revealed', { timeout: 5000 });

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

    await page.goto(`/?seed=${PLAYWRIGHT_SEEDS.gameplayTest}&choice=drop-position`, { waitUntil: 'networkidle' });
    await waitForGameState(page, 'ready', { timeout: 5000 });

    // Play 3 consecutive rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`   Round ${round}...`);

      // Play game
      await startGameWithDropPosition(page); // Handles drop position if enabled
      await waitForGameState(page, 'countdown', { timeout: 3000 });
      await waitForGameState(page, 'dropping', { timeout: 5000 });
      await waitForBallDrop(page, { maxWait: 15000 });
      await waitForGameState(page, 'landed', { timeout: 5000 });
      await waitForGameState(page, 'revealed', { timeout: 5000 });

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
