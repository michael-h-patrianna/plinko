#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

await page.goto('http://localhost:5173');
await page.waitForTimeout(2000);

// Take initial screenshot
await page.screenshot({ path: 'screenshots/current-state.png' });
console.log('✅ Screenshot saved to screenshots/current-state.png');
console.log('Browser will stay open for 30 seconds...');

await page.waitForTimeout(30000);
await browser.close();
