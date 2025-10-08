/**
 * Check what's actually rendering in the DOM
 */
import { chromium } from 'playwright-core';

try {
  // Use system Chrome instead of downloading
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const page = await browser.newPage();

  console.log('🌐 Opening http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  await page.waitForTimeout(2000);

  // Check for PopupContainer
  const popupContainer = await page.$('[data-testid="popup-container"]');
  if (popupContainer) {
    const styles = await popupContainer.evaluate(el => ({
      minHeight: window.getComputedStyle(el).minHeight,
      overflow: window.getComputedStyle(el).overflow,
      position: window.getComputedStyle(el).position,
    }));
    console.log('\n✅ PopupContainer found:');
    console.log('  Styles:', styles);
  } else {
    console.log('\n❌ PopupContainer NOT found');
  }

  // Check for countdown
  const countdown = await page.$('.text-9xl');
  if (countdown) {
    const styles = await countdown.evaluate(el => ({
      fontSize: window.getComputedStyle(el).fontSize,
      fontWeight: window.getComputedStyle(el).fontWeight,
      parentPosition: window.getComputedStyle(el.parentElement).position,
      parentPaddingTop: window.getComputedStyle(el.parentElement).paddingTop,
    }));
    console.log('\n✅ Countdown found:');
    console.log('  Styles:', styles);
  } else {
    console.log('\n❌ Countdown NOT found (might not be visible yet)');
  }

  await page.screenshot({ path: 'screenshots/dom-check.png' });
  console.log('\n📸 Screenshot: screenshots/dom-check.png');

  await browser.close();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
