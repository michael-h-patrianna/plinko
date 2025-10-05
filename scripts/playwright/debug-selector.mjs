#!/usr/bin/env node
/**
 * Debug drop selector - opens browser for manual testing
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 500 });
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

console.log('🌐 Opening browser...');
await page.goto('http://localhost:5173');
await page.waitForTimeout(1500);

console.log('⚙️ Opening dev menu (press ` key)...');
await page.keyboard.press('`');
await page.waitForTimeout(800);

console.log('🎯 Clicking Drop Position option...');
// Click on the "Drop Position" radio option
const dropPosOption = page.locator('label:has-text("Drop Position")');
await dropPosOption.click();
await page.waitForTimeout(500);

console.log('✅ Closing dev menu (press Escape)...');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

console.log('▶️ Clicking Drop Ball button...');
const dropButton = page.locator('button:has-text("Drop Ball")');
await dropButton.click();

console.log('\n✨ Browser will stay open for manual testing for 60 seconds...\n');
await page.waitForTimeout(60000);

await browser.close();
console.log('✅ Done!');
