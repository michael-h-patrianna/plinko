/**
 * Test celebration animations with different prize combinations
 */

import { chromium } from 'playwright';

const VIEWPORT = { width: 375, height: 812 };

async function testCelebration() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    console.log('Loading Plinko game...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✓ Page loaded');

    // Click "Drop Ball" to begin game
    console.log('Finding Drop Ball button...');
    const dropButton = await page.locator('button:has-text("Drop Ball")').first();
    await dropButton.waitFor({ state: 'visible', timeout: 5000 });

    await page.screenshot({
      path: 'screenshots/celebration-test/00-before-drop.png',
      fullPage: false
    });

    await dropButton.click();
    console.log('✓ Clicked Drop Ball');

    // Wait for countdown (3-2-1)
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'screenshots/celebration-test/01-countdown.png',
      fullPage: false
    });

    // Wait for ball drop and landing
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: 'screenshots/celebration-test/02-ball-landed.png',
      fullPage: false
    });

    // Check for "You Won!" text
    console.log('Checking for You Won text...');
    const youWonText = await page.locator('.you-won-main-text').first();
    const youWonVisible = await youWonText.isVisible().catch(() => false);
    console.log(`You Won text visible: ${youWonVisible}`);

    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'screenshots/celebration-test/03-you-won-animation.png',
      fullPage: false
    });

    // Check for counter elements
    console.log('Checking for counters...');
    const counters = await page.locator('.currency-counter').all();
    console.log(`Found ${counters.length} reward counters`);

    if (counters.length > 0) {
      // Get all counter details
      for (let i = 0; i < counters.length; i++) {
        const label = await counters[i].locator('.currency-counter__label').textContent();
        const valueElem = counters[i].locator('.currency-counter__value').first();
        const initialValue = await valueElem.textContent();
        console.log(`Counter ${i + 1}: ${label} = ${initialValue}`);
      }

      // Wait a bit and check if first counter changed
      await page.waitForTimeout(500);
      const firstCounter = counters[0].locator('.currency-counter__value').first();
      const midValue = await firstCounter.textContent();
      console.log(`First counter after 500ms: ${midValue}`);

      await page.waitForTimeout(1000);
      const finalValue = await firstCounter.textContent();
      console.log(`First counter after 1500ms total: ${finalValue}`);

      if (midValue !== finalValue) {
        console.log('✅ Counter is animating correctly!');
      } else {
        console.log('⚠️  Counter value not changing - animation may not be working');
      }

      // Check for floating indicators
      const indicators = await page.locator('.currency-counter__indicator--animating').all();
      console.log(`Found ${indicators.length} floating +amount indicators`);

      await page.screenshot({
        path: 'screenshots/celebration-test/04-counters-animating.png',
        fullPage: false
      });
    }

    // Wait for full animation to complete
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'screenshots/celebration-test/05-celebration-complete.png',
      fullPage: false
    });

    console.log('\n✅ Test complete! Check screenshots/celebration-test/');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({
      path: 'screenshots/celebration-test/ERROR.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    process.exit(0);
  }
}

testCelebration();
