/**
 * Debug CSS loading and button styles
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

// Check CSS loading
const cssInfo = await page.evaluate(() => {
  const stylesheets = Array.from(document.styleSheets);
  return {
    totalStylesheets: stylesheets.length,
    styleHrefs: stylesheets.map(s => s.href).filter(Boolean),
  };
});

console.log('📊 CSS Loading:', JSON.stringify(cssInfo, null, 2));

// Check button element and its styles
const buttonInfo = await page.evaluate(() => {
  const button = document.querySelector('[data-testid="drop-ball-button"]');
  if (!button) return { found: false };

  const computedStyle = window.getComputedStyle(button);

  return {
    found: true,
    innerText: button.textContent,
    className: button.className,
    inlineStyle: button.getAttribute('style'),
    computed: {
      padding: computedStyle.padding,
      paddingTop: computedStyle.paddingTop,
      paddingRight: computedStyle.paddingRight,
      paddingBottom: computedStyle.paddingBottom,
      paddingLeft: computedStyle.paddingLeft,
      background: computedStyle.background.substring(0, 150),
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      height: computedStyle.height,
      minWidth: computedStyle.minWidth,
    },
  };
});

console.log('\n📊 Button Info:', JSON.stringify(buttonInfo, null, 2));

// Check card element
const cardInfo = await page.evaluate(() => {
  // Find the prize list card
  const card = document.querySelector('.p-4.mb-8');
  if (!card) return { found: false };

  const computedStyle = window.getComputedStyle(card);

  return {
    found: true,
    className: card.className,
    inlineStyle: card.getAttribute('style'),
    computed: {
      padding: computedStyle.padding,
      background: computedStyle.background.substring(0, 150),
      border: computedStyle.border,
      borderRadius: computedStyle.borderRadius,
    },
  };
});

console.log('\n📊 Card Info:', JSON.stringify(cardInfo, null, 2));

await browser.close();
