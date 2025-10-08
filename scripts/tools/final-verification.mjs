/**
 * Final verification with detailed DOM inspection
 */
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

console.log('🌐 Loading http://localhost:5173...\n');
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Detailed inspection
const inspection = await page.evaluate(() => {
  const popup = document.querySelector('[data-testid="popup-container"]');
  const startScreen = document.querySelector('h1, h2');
  const button = document.querySelector('button');

  return {
    popupContainer: popup ? {
      exists: true,
      computedStyle: {
        minHeight: window.getComputedStyle(popup).minHeight,
        overflow: window.getComputedStyle(popup).overflow,
        position: window.getComputedStyle(popup).position,
        width: window.getComputedStyle(popup).width,
        display: window.getComputedStyle(popup).display,
      },
      inlineStyle: popup.getAttribute('style'),
      className: popup.className,
    } : { exists: false },
    startScreen: startScreen ? {
      text: startScreen.textContent,
      fontSize: window.getComputedStyle(startScreen).fontSize,
      color: window.getComputedStyle(startScreen).color,
    } : null,
    button: button ? {
      text: button.textContent,
      background: window.getComputedStyle(button).background,
      padding: window.getComputedStyle(button).padding,
    } : null,
  };
});

console.log('📊 DOM Inspection Results:\n');
console.log(JSON.stringify(inspection, null, 2));

await page.screenshot({ path: 'screenshots/final-verification.png', fullPage: true });
console.log('\n📸 Screenshot: screenshots/final-verification.png');

await browser.close();
