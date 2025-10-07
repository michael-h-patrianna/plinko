#!/usr/bin/env node
/**
 * Visual test for ball trail visibility
 * Verifies that the motion trail is visible during ball drop
 */

import playwright from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testBallTrail() {
  console.log('🎯 Testing ball trail visibility...\n');

  const browser = await playwright.chromium.launch({
    headless: false, // Show browser for visual inspection
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Navigate to app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('✓ Loaded app');

    // Wait for the start button
    await page.waitForSelector('button', { timeout: 5000 });

    // Click start button
    await page.locator('button').first().click();
    console.log('✓ Started game');

    // Wait for ball to be in motion
    await page.waitForTimeout(500);

    // Take screenshot during ball drop
    const screenshotPath = join(__dirname, '../../screenshots/ball-trail-test.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved: ${screenshotPath}`);

    console.log('\n📸 Visual Inspection:');
    console.log('   - Check if yellow/orange trail is visible behind the ball');
    console.log('   - Trail should have multiple points with decreasing opacity');
    console.log('   - Trail should be more prominent when ball moves fast');

    // Wait a bit longer to observe the trail in the browser window
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('\n✅ Test complete - please verify screenshot shows trail');
}

testBallTrail().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
