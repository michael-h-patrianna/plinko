/**
 * Captures screenshots of all 4 themes (Default, Dark Blue, PlayFame, Brutalist)
 * Shows start screen for each theme
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const THEMES = ['Default', 'Dark Blue', 'PlayFame', 'Brutalist'];
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = join(process.cwd(), 'screenshots', 'themes');

async function captureTheme(page, themeName) {
  console.log(`📸 Capturing ${themeName} theme...`);

  // Open dev menu
  await page.click('button:has-text("Dev Menu")');
  await page.waitForTimeout(500);

  // Switch to theme
  await page.click(`button:has-text("${themeName}")`);
  await page.waitForTimeout(500);

  // Close dev menu
  await page.click('button:has-text("Dev Menu")');
  await page.waitForTimeout(500);

  // Take screenshot
  const filename = join(OUTPUT_DIR, `${themeName.toLowerCase().replace(/ /g, '-')}.png`);
  await page.screenshot({
    path: filename,
    fullPage: false,
  });

  console.log(`✅ Saved: ${filename}`);
}

async function main() {
  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  try {
    console.log(`🌐 Opening ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture each theme
    for (const theme of THEMES) {
      await captureTheme(page, theme);
    }

    console.log('\n✨ All theme screenshots captured!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
