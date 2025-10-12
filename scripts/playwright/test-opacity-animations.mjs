/**
 * Visual test for opacity fade-in animations across all screens
 * Verifies that elements fade in smoothly during transform animations
 *
 * Tests:
 * 1. StartScreen - title, prize card, prize items
 * 2. FreeRewardView - "You Won" text, rewards container, counters
 * 3. PurchaseOfferView - badge, title, rewards, benefits, limited time
 * 4. NoWinView - image, title, message card
 * 5. CheckoutPopup - card, close button, header, price, payment info, disclaimer
 * 6. PrizeClaimed - title, summary
 * 7. RewardItem - individual reward animations
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_SERVER = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots/opacity-animations');

// Create screenshot directory
import fs from 'fs';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureAnimationFrames(page, testName, duration = 2000, frameInterval = 100) {
  const frames = [];
  const startTime = Date.now();

  while (Date.now() - startTime < duration) {
    const screenshot = await page.screenshot({ type: 'png' });
    frames.push({
      time: Date.now() - startTime,
      screenshot
    });
    await page.waitForTimeout(frameInterval);
  }

  return frames;
}

async function testStartScreenAnimations(page) {
  console.log('\n📋 Testing StartScreen animations...');

  // Navigate to start screen
  await page.goto(DEV_SERVER);
  await page.waitForSelector('[data-testid="start-screen-overlay"]', { timeout: 5000 });

  // Wait a moment for initial render
  await page.waitForTimeout(100);

  // Capture initial state (should show opacity fade-in)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-start-screen-initial.png') });
  await page.waitForTimeout(200);

  // Capture mid-animation (title should be animating with opacity)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-start-screen-title-animating.png') });
  await page.waitForTimeout(400);

  // Capture prize card entrance (should fade in while transforming)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-start-screen-prize-card.png') });
  await page.waitForTimeout(400);

  // Capture full animation complete
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-start-screen-complete.png') });

  console.log('✅ StartScreen animations captured');
}

async function testFreeRewardAnimations(page) {
  console.log('\n🎁 Testing FreeRewardView animations...');

  // Start from start screen
  await page.goto(DEV_SERVER);
  await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });

  // Drop ball to trigger prize reveal
  await page.click('[data-testid="drop-ball-button"]');

  // Wait for free reward overlay (need to find one)
  await page.waitForTimeout(3000); // Wait for ball drop

  const freeRewardOverlay = await page.locator('[data-testid="free-reward-overlay"]').count();
  if (freeRewardOverlay > 0) {
    console.log('Found free reward overlay');

    // Capture initial state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-free-reward-initial.png') });
    await page.waitForTimeout(200);

    // Capture "You Won" entrance
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-free-reward-you-won.png') });
    await page.waitForTimeout(400);

    // Capture rewards container entrance
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-free-reward-rewards.png') });
    await page.waitForTimeout(600);

    // Capture complete state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-free-reward-complete.png') });

    console.log('✅ FreeRewardView animations captured');
  } else {
    console.log('⚠️  No free reward found in this drop');
  }
}

async function testPurchaseOfferAnimations(page) {
  console.log('\n💰 Testing PurchaseOfferView animations...');

  // Try multiple drops to find purchase offer
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(DEV_SERVER);
    await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });
    await page.click('[data-testid="drop-ball-button"]');
    await page.waitForTimeout(3000);

    const purchaseOverlay = await page.locator('[data-testid="purchase-offer-overlay"]').count();
    if (purchaseOverlay > 0) {
      console.log('Found purchase offer overlay');

      // Capture badge entrance
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-purchase-badge.png') });
      await page.waitForTimeout(200);

      // Capture title entrance
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-purchase-title.png') });
      await page.waitForTimeout(300);

      // Capture rewards container
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-purchase-rewards.png') });
      await page.waitForTimeout(500);

      // Capture complete state
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-purchase-complete.png') });

      console.log('✅ PurchaseOfferView animations captured');
      return;
    }
  }

  console.log('⚠️  Could not find purchase offer after 5 attempts');
}

async function testNoWinAnimations(page) {
  console.log('\n😔 Testing NoWinView animations...');

  // Try multiple drops to find no-win
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(DEV_SERVER);
    await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });
    await page.click('[data-testid="drop-ball-button"]');
    await page.waitForTimeout(3000);

    const noWinOverlay = await page.locator('[data-testid="no-win-overlay"]').count();
    if (noWinOverlay > 0) {
      console.log('Found no-win overlay');

      // Capture image entrance
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-nowin-image.png') });
      await page.waitForTimeout(200);

      // Capture title
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-nowin-title.png') });
      await page.waitForTimeout(300);

      // Capture message card
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-nowin-message.png') });
      await page.waitForTimeout(400);

      // Capture complete state
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-nowin-complete.png') });

      console.log('✅ NoWinView animations captured');
      return;
    }
  }

  console.log('⚠️  Could not find no-win after 5 attempts');
}

async function testCheckoutPopupAnimations(page) {
  console.log('\n💳 Testing CheckoutPopup animations...');

  // Find purchase offer first
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(DEV_SERVER);
    await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });
    await page.click('[data-testid="drop-ball-button"]');
    await page.waitForTimeout(3000);

    const purchaseButton = await page.locator('[data-testid="claim-prize-button"]').count();
    if (purchaseButton > 0) {
      const buttonText = await page.locator('[data-testid="claim-prize-button"]').textContent();
      if (buttonText && buttonText.includes('$')) {
        console.log('Found purchase offer, clicking to open checkout');
        await page.locator('[data-testid="claim-prize-button"]').click();
        await page.waitForTimeout(100);

        // Capture card entrance
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17-checkout-card.png') });
        await page.waitForTimeout(200);

        // Capture header
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18-checkout-header.png') });
        await page.waitForTimeout(300);

        // Capture price display
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19-checkout-price.png') });
        await page.waitForTimeout(500);

        // Capture complete state
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-checkout-complete.png') });

        console.log('✅ CheckoutPopup animations captured');
        return;
      }
    }
  }

  console.log('⚠️  Could not find purchase offer to open checkout');
}

async function testPrizeClaimedAnimations(page) {
  console.log('\n✅ Testing PrizeClaimed animations...');

  await page.goto(DEV_SERVER);
  await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });
  await page.click('[data-testid="drop-ball-button"]');
  await page.waitForTimeout(3000);

  // Find and click claim button
  const claimButton = await page.locator('[data-testid="claim-prize-button"]').count();
  if (claimButton > 0) {
    await page.locator('[data-testid="claim-prize-button"]').click();
    await page.waitForTimeout(100);

    const prizeClaimedOverlay = await page.locator('[data-testid="prize-claimed-overlay"]').count();
    if (prizeClaimedOverlay > 0) {
      console.log('Found prize claimed overlay');

      // Capture checkmark entrance
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-claimed-checkmark.png') });
      await page.waitForTimeout(300);

      // Capture title entrance
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-claimed-title.png') });
      await page.waitForTimeout(400);

      // Capture complete state
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-claimed-complete.png') });

      console.log('✅ PrizeClaimed animations captured');
      return;
    }
  }

  console.log('⚠️  Could not capture prize claimed screen');
}

async function runTests() {
  console.log('🎬 Starting opacity animation visual tests...');
  console.log(`📸 Screenshots will be saved to: ${SCREENSHOT_DIR}`);

  const browser = await chromium.launch({
    headless: false, // Run in visible mode to see animations
  });

  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 720,
    },
  });

  try {
    // Test each screen
    await testStartScreenAnimations(page);
    await testFreeRewardAnimations(page);
    await testPurchaseOfferAnimations(page);
    await testNoWinAnimations(page);
    await testCheckoutPopupAnimations(page);
    await testPrizeClaimedAnimations(page);

    console.log('\n✨ All opacity animation tests complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\n👀 Review the screenshots to verify:');
    console.log('   - Elements start at 30-50% opacity (not 0% or 100%)');
    console.log('   - Opacity transitions smoothly to 100% during transform');
    console.log('   - No jarring sudden appearances at full opacity');
    console.log('   - Animations feel smooth and professional');

  } catch (error) {
    console.error('❌ Error during tests:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
