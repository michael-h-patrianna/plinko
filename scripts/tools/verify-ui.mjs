/**
 * Verify UI is rendering correctly and take screenshot
 */
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

console.log('🌐 Loading http://localhost:5173...');
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Take screenshot of start screen
await page.screenshot({ path: 'screenshots/start-screen.png', fullPage: true });
console.log('📸 Screenshot saved: screenshots/start-screen.png');

// Click "Drop Ball" button
const dropButton = await page.locator('text="Drop Ball"');
if (await dropButton.isVisible()) {
  console.log('✅ Drop Ball button found, clicking...');
  await dropButton.click();
  await page.waitForTimeout(1000);

  // Take screenshot during countdown
  await page.screenshot({ path: 'screenshots/countdown.png' });
  console.log('📸 Screenshot saved: screenshots/countdown.png');

  // Wait for game to complete
  await page.waitForTimeout(8000);

  // Take screenshot of result
  await page.screenshot({ path: 'screenshots/result.png', fullPage: true });
  console.log('📸 Screenshot saved: screenshots/result.png');
}

await browser.close();
console.log('\n✅ Done! Check screenshots/ folder');
