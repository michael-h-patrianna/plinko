/**
 * Test StartScreen reveal animation orchestration
 * Validates premium entrance sequence with Disney principles
 */

import { chromium } from 'playwright';

async function testStartScreenAnimation() {
  console.log('Starting StartScreen animation test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Navigate to app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    console.log('✓ App loaded - preparing to capture animation\n');

    // Reload to capture animation from start
    console.log('Reloading page to capture animation sequence...\n');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Capture animation sequence with precise timing
    console.log('Recording animation sequence...');

    // Start capturing immediately
    await page.screenshot({
      path: 'screenshots/startscreen-anim-0ms.png',
      fullPage: false
    });
    console.log('  - Captured: 0ms (initial state)');

    await page.waitForTimeout(200); // Anticipation phase ending
    await page.screenshot({
      path: 'screenshots/startscreen-anim-200ms.png',
      fullPage: false
    });
    console.log('  - Captured: 200ms (title anticipation)');

    await page.waitForTimeout(200); // Title bounce peak (400ms total)
    await page.screenshot({
      path: 'screenshots/startscreen-anim-400ms.png',
      fullPage: false
    });
    console.log('  - Captured: 400ms (title bounce peak)');

    await page.waitForTimeout(200); // Card swooping in (600ms total)
    await page.screenshot({
      path: 'screenshots/startscreen-anim-600ms.png',
      fullPage: false
    });
    console.log('  - Captured: 600ms (card entrance)');

    await page.waitForTimeout(300); // Items cascading (900ms total)
    await page.screenshot({
      path: 'screenshots/startscreen-anim-900ms.png',
      fullPage: false
    });
    console.log('  - Captured: 900ms (items cascade)');

    await page.waitForTimeout(400); // Sequence complete (1300ms total)
    await page.screenshot({
      path: 'screenshots/startscreen-anim-complete.png',
      fullPage: false
    });
    console.log('  - Captured: 1300ms (complete)\n');

    console.log('✓ Animation sequence captured successfully');
    console.log('✓ Screenshots saved to screenshots/startscreen-anim-*.png\n');

    console.log('Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/startscreen-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

testStartScreenAnimation().catch(console.error);
