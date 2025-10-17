#!/usr/bin/env node
/**
 * Quick screenshot of new drop position selector design
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');
const URL = 'http://localhost:5173';

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

  try {
    console.log('📂 Loading game...');
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Open dev menu
    console.log('⚙️  Opening dev menu...');
    await page.keyboard.press('`');
    await page.waitForTimeout(500);

    // Select Drop Position mechanic
    console.log('🎯 Selecting Drop Position mechanic...');
    const dropPositionButton = page.locator('text=Drop Position').first();
    await dropPositionButton.click();
    await page.waitForTimeout(500);

    // Close dev menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Click Drop Ball button
    console.log('▶️  Starting game...');
    const playButton = page.locator('button:has-text("Drop Ball")').first();
    await playButton.click();
    await page.waitForTimeout(1000);

    // Take screenshot of the new selector
    console.log('📸 Taking screenshot...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'new-drop-selector.png'),
      fullPage: false,
    });

    console.log('✅ Screenshot saved to screenshots/new-drop-selector.png');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
