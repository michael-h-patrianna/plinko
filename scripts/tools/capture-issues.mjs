/**
 * Capture countdown and prize reveal screens specifically
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
await page.waitForTimeout(1000);

// Click Drop Ball
console.log('🎮 Clicking Drop Ball...');
await page.click('text="Drop Ball"');

// IMMEDIATELY take screenshot to catch countdown
await page.waitForTimeout(100); // Just 100ms to catch countdown starting
await page.screenshot({ path: 'screenshots/countdown-capture.png' });
console.log('📸 Countdown screenshot: screenshots/countdown-capture.png');

// Check countdown DOM
const countdownInfo = await page.evaluate(() => {
  const countdown = document.querySelector('.text-9xl');
  if (countdown) {
    const parent = countdown.closest('div[style*="paddingTop"]');
    return {
      found: true,
      text: countdown.textContent,
      fontSize: window.getComputedStyle(countdown).fontSize,
      fontWeight: window.getComputedStyle(countdown).fontWeight,
      parent: parent ? {
        paddingTop: parent.style.paddingTop,
        position: window.getComputedStyle(parent).position,
        zIndex: window.getComputedStyle(parent).zIndex,
      } : null,
    };
  }
  return { found: false };
});

console.log('\n📊 Countdown DOM:', JSON.stringify(countdownInfo, null, 2));

// Wait for game to complete
console.log('\n⏳ Waiting for game to complete...');
await page.waitForTimeout(8000);

await page.screenshot({ path: 'screenshots/prize-reveal-capture.png', fullPage: true });
console.log('📸 Prize reveal screenshot: screenshots/prize-reveal-capture.png');

// Check prize reveal DOM
const prizeRevealInfo = await page.evaluate(() => {
  // Look for prize reveal container
  const container = document.querySelector('[data-testid="popup-container"]');
  const prizeCard = document.querySelector('[style*="padding"]');

  return {
    container: container ? {
      minHeight: window.getComputedStyle(container).minHeight,
      display: window.getComputedStyle(container).display,
      position: window.getComputedStyle(container).position,
    } : null,
    prizeCard: prizeCard ? {
      padding: window.getComputedStyle(prizeCard).padding,
      background: window.getComputedStyle(prizeCard).background.substring(0, 100),
      textAlign: window.getComputedStyle(prizeCard).textAlign,
    } : null,
  };
});

console.log('\n📊 Prize Reveal DOM:', JSON.stringify(prizeRevealInfo, null, 2));

await browser.close();
