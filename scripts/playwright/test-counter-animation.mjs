import { chromium } from 'playwright';

/**
 * Visual test for improved CurrencyCounter animations
 * Tests:
 * 1. Better increment count (100 should show multiple steps, not just one)
 * 2. Ease-out timing curve (fast start, slow finish)
 * 3. Floating indicators positioned right next to the number
 */
async function testCounterAnimation() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('Testing improved counter animations...\n');
    console.log('Expected improvements:');
    console.log('- More increments (e.g., 100 should show ~5 steps, not just 1)');
    console.log('- Ease-out timing (fast → slow)');
    console.log('- Floating +X indicators stick right next to the number\n');

    // Drop a ball to trigger prize reveal
    const dropButton = await page.$('button:has-text("Drop Ball")');
    if (dropButton) {
      console.log('Dropping ball to trigger prize reveal...');
      await dropButton.click();

      // Wait for ball animation and prize reveal
      console.log('Waiting for prize reveal (this may take 10-15 seconds)...');
      await page.waitForTimeout(15000);

      // Take screenshots of the prize reveal
      console.log('Taking screenshots...');
      await page.screenshot({
        path: 'screenshots/counter-animation-final.png',
        fullPage: true,
      });

      console.log('\nScreenshot saved: screenshots/counter-animation-final.png');
      console.log('\nManual verification steps:');
      console.log('1. Click "Drop Ball" again to see the animation');
      console.log('2. Watch the counter increment multiple times (not just once)');
      console.log('3. Notice it starts fast and slows down at the end');
      console.log('4. Check that +X numbers appear right next to the main number');
    }

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 60 seconds for manual testing...');
    console.log('Press Ctrl+C to close early.');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testCounterAnimation();
