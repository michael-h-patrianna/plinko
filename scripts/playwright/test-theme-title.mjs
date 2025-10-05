/**
 * Test script to verify StartScreen title renders correctly when switching themes
 * Tests that gradient text clipping works properly during dynamic theme changes
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = join(process.cwd(), 'screenshots', 'theme-title-test');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const themes = ['Default', 'Dark Blue', 'PlayFame', 'Brutalist'];

async function testThemeSwitching() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('Testing theme switching with StartScreen title...\n');

    for (const theme of themes) {
      console.log(`Testing ${theme} theme...`);

      // Open DevMenu
      await page.click('[aria-label="Dev Tools Settings"]');
      await page.waitForTimeout(300);

      // Click theme selector
      await page.click('text=Theme');
      await page.waitForTimeout(200);

      // Select theme
      await page.click(`text="${theme}"`);
      await page.waitForTimeout(500);

      // Close DevMenu
      await page.click('[aria-label="Dev Tools Settings"]');
      await page.waitForTimeout(300);

      // Take screenshot
      const filename = `${theme.toLowerCase().replace(/\s+/g, '-')}-title.png`;
      await page.screenshot({
        path: join(SCREENSHOT_DIR, filename),
        fullPage: false,
      });

      console.log(`  ✓ Screenshot saved: ${filename}`);

      // Verify title is visible (check for the text)
      const titleVisible = await page.locator('text=Plinko Popup').isVisible();
      if (!titleVisible) {
        console.log(`  ✗ WARNING: Title not visible in ${theme} theme!`);
      } else {
        console.log(`  ✓ Title is visible`);
      }
    }

    console.log('\nAll themes tested. Screenshots saved to:', SCREENSHOT_DIR);
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testThemeSwitching();
