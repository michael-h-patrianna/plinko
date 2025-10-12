/**
 * Quick visual test for opacity fade-in animations
 * Launches browser in visible mode to manually verify animations
 */

import { chromium } from 'playwright';

const DEV_SERVER = 'http://localhost:5173';

async function runVisualInspection() {
  console.log('🎬 Starting visual inspection of opacity animations...');
  console.log('🔍 Watch for elements fading in smoothly (30-50% → 100% opacity) during transforms');
  console.log('❌ Look out for: sudden full-opacity appearances, jarring reveals\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100, // Slow down actions to see animations
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    console.log('📋 Loading StartScreen...');
    await page.goto(DEV_SERVER);
    await page.waitForLoadState('networkidle');

    console.log('✨ StartScreen loaded - observe title and prize card fade-ins');
    console.log('   - Title should fade from 30% → 100% while scaling/rotating');
    console.log('   - Prize card should fade from 50% → 100% while sliding in');
    console.log('   - Prize items should fade from 30% → 100% with stagger\n');

    await page.waitForTimeout(3000);

    // Drop ball to see prize reveal
    console.log('🎯 Dropping ball to see prize reveal...');
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    if (await dropButton.count() > 0) {
      await dropButton.click();
      await page.waitForTimeout(4000); // Wait for ball drop and reveal

      // Check what type of prize was revealed
      const freeReward = await page.locator('[data-testid="free-reward-overlay"]').count();
      const purchaseOffer = await page.locator('[data-testid="purchase-offer-overlay"]').count();
      const noWin = await page.locator('[data-testid="no-win-overlay"]').count();

      if (freeReward > 0) {
        console.log('✨ FreeRewardView loaded - observe:');
        console.log('   - "You Won" should fade from 30% → 100% with elastic bounce');
        console.log('   - Rewards container should fade from 50% → 100% with swoosh');
        console.log('   - Individual counters should fade from 30% → 100% with pop\n');
      } else if (purchaseOffer > 0) {
        console.log('✨ PurchaseOfferView loaded - observe:');
        console.log('   - Badge should fade from 30% → 100% with pop');
        console.log('   - Title should fade from 50% → 100% with swoosh');
        console.log('   - Reward items should fade from 30% → 100%\n');
      } else if (noWin > 0) {
        console.log('✨ NoWinView loaded - observe:');
        console.log('   - Image should fade from 50% → 80% (subdued)');
        console.log('   - Title should fade from 50% → 100%');
        console.log('   - Message card should fade from 50% → 100%\n');
      }

      await page.waitForTimeout(3000);

      // Try to claim/close and see PrizeClaimed screen
      const claimButton = page.locator('[data-testid="claim-prize-button"]');
      if (await claimButton.count() > 0) {
        const buttonText = await claimButton.textContent();

        // If it's a purchase offer, open checkout first
        if (buttonText && buttonText.includes('$')) {
          console.log('💳 Opening checkout popup...');
          await claimButton.click();
          await page.waitForTimeout(100);

          console.log('✨ CheckoutPopup loaded - observe:');
          console.log('   - Card should fade from 50% → 100% with scale');
          console.log('   - Close button should fade from 30% → 100%');
          console.log('   - Header should fade from 50% → 100%');
          console.log('   - Price should fade from 30% → 100% with pop\n');

          await page.waitForTimeout(2000);

          // Close checkout
          const closeButton = page.locator('button:has-text("×")');
          if (await closeButton.count() > 0) {
            await closeButton.click();
            await page.waitForTimeout(500);
          }
        }

        // Now claim the prize
        console.log('✅ Claiming prize...');
        await claimButton.click();
        await page.waitForTimeout(100);

        const prizeClaimed = await page.locator('[data-testid="prize-claimed-overlay"]').count();
        if (prizeClaimed > 0) {
          console.log('✨ PrizeClaimed loaded - observe:');
          console.log('   - Title should fade from 50% → 100% with diagonal entrance');
          console.log('   - Summary should fade from 30% → 100%\n');

          await page.waitForTimeout(3000);
        }
      }
    }

    console.log('\n✨ Visual inspection complete!');
    console.log('📝 Review checklist:');
    console.log('   ✓ Elements started at 30-50% opacity (not 0% or 100%)');
    console.log('   ✓ Opacity transitioned smoothly to 100% during transform');
    console.log('   ✓ No sudden jarring appearances at full opacity');
    console.log('   ✓ Animations felt smooth and professional');
    console.log('\nPress Ctrl+C to close the browser when done reviewing.');

    // Keep browser open for manual review
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Error during visual inspection:', error.message);
  } finally {
    await browser.close();
  }
}

runVisualInspection().catch(console.error);
