/**
 * Test celebration flow: landed → celebrating → revealed
 * Verifies confetti animations, slot animations, and state transitions
 */

import { chromium } from 'playwright';

const DEV_URL = 'http://localhost:5179';
const SCREENSHOT_DIR = '/Users/michaelhaufschild/Documents/code/plinko/screenshots/celebration-flow';

async function testCelebrationFlow() {
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();

    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');

    // Check console for errors
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.error('Browser error:', err.message));

    // Take screenshot to see what's on screen
    await page.screenshot({ path: `${SCREENSHOT_DIR}/debug-loaded.png` });

    // Wait for app to render
    await page.waitForTimeout(2000);

    // Find and click drop ball button
    const dropButton = await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 10000 });
    console.log('✓ Drop Ball button found');
    await dropButton.click();
    console.log('✓ Clicked Drop Ball button');

    // Wait for countdown
    await page.waitForSelector('[data-testid="countdown"]', { timeout: 2000 });
    console.log('✓ Countdown started');

    // Wait for ball dropping
    await page.waitForFunction(
      () => {
        const ballEl = document.querySelector('[data-testid="ball"]');
        return ballEl && ballEl.getAttribute('data-state') === 'dropping';
      },
      { timeout: 10000 }
    );
    console.log('✓ Ball is dropping');

    // Wait for ball landed state
    await page.waitForFunction(
      () => {
        const ballEl = document.querySelector('[data-testid="ball"]');
        return ballEl && ballEl.getAttribute('data-state') === 'landed';
      },
      { timeout: 10000 }
    );
    console.log('✓ Ball landed');

    // Brief delay to see landed state
    await new Promise(r => setTimeout(r, 500));

    // Wait for celebrating state
    await page.waitForFunction(
      () => {
        const ballEl = document.querySelector('[data-testid="ball"]');
        return ballEl && ballEl.getAttribute('data-state') === 'celebrating';
      },
      { timeout: 2000 }
    );
    console.log('✓ Celebration state activated');

    // Take screenshot of celebration
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/celebrating.png`,
      fullPage: false,
    });
    console.log('✓ Screenshot saved: celebrating.png');

    // Wait a bit to see confetti animation
    await new Promise(r => setTimeout(r, 1200));

    // Take another screenshot mid-celebration
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/celebrating-mid.png`,
      fullPage: false,
    });
    console.log('✓ Screenshot saved: celebrating-mid.png');

    // Wait for revealed state
    await page.waitForFunction(
      () => {
        const ballEl = document.querySelector('[data-testid="ball"]');
        return ballEl && ballEl.getAttribute('data-state') === 'revealed';
      },
      { timeout: 5000 }
    );
    console.log('✓ Prize revealed');

    // Take final screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/prize-reveal.png`,
      fullPage: false,
    });
    console.log('✓ Screenshot saved: prize-reveal.png');

    console.log('\n✨ Celebration flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Create screenshot directory
import { mkdirSync } from 'fs';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Run test
testCelebrationFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
