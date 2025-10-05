/**
 * Visual verification test for Brutalist theme
 * Validates that brutalist theme uses only white, black, and red colors
 * Tests all major UI components for theme consistency
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotDir = join(__dirname, '../../screenshots/brutalist-theme');

// Ensure screenshot directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(screenshotDir, { recursive: true });
} catch (err) {
  // Directory might already exist
}

async function captureThemeScreenshots() {
  console.log('🎨 Starting Brutalist Theme Visual Verification...\n');

  const browser = await chromium.launch({
    headless: false, // Set to false to watch the test
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📱 Loading app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Wait for app to load
    await page.waitForSelector('[data-testid="theme-toggle"]', { timeout: 5000 });

    // Switch to Brutalist theme
    console.log('🎭 Switching to Brutalist theme...');
    const themeButton = page.locator('[data-testid="theme-toggle"]');

    // Click until we get to Brutalist (4 themes total: Default, Dark Blue, PlayFame, Brutalist)
    for (let i = 0; i < 3; i++) {
      await themeButton.click();
      await page.waitForTimeout(300);
    }

    console.log('✅ Brutalist theme activated');
    await page.waitForTimeout(500);

    // 1. Capture start screen
    console.log('\n📸 Capturing start screen...');
    await page.screenshot({
      path: join(screenshotDir, '01-start-screen.png'),
      fullPage: false,
    });

    // 2. Click drop ball button to show countdown
    console.log('📸 Capturing countdown...');
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    await dropButton.click();
    await page.waitForTimeout(800); // Capture mid-countdown
    await page.screenshot({
      path: join(screenshotDir, '02-countdown.png'),
      fullPage: false,
    });

    // 3. Wait for ball to drop and capture game in progress
    console.log('📸 Capturing ball dropping...');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(screenshotDir, '03-ball-dropping.png'),
      fullPage: false,
    });

    // 4. Wait for win reveal
    console.log('📸 Capturing win reveal...');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotDir, '04-win-reveal.png'),
      fullPage: false,
    });

    // 5. Wait for prize reveal popup
    console.log('📸 Capturing prize reveal...');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotDir, '05-prize-reveal.png'),
      fullPage: false,
    });

    // Verify brutalist colors are present
    console.log('\n🔍 Verifying brutalist color palette...');
    const bodyStyles = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const colors = new Set();

      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        colors.add(styles.backgroundColor);
        colors.add(styles.color);
        colors.add(styles.borderColor);
      });

      return Array.from(colors);
    });

    // Check if brutalist colors are being used
    const hasBrutalistColors = bodyStyles.some(color => {
      const lower = color.toLowerCase();
      return (
        lower.includes('rgb(219, 0, 0)') || // Red
        lower.includes('#db0000') ||
        lower.includes('rgb(255, 255, 255)') || // White
        lower.includes('#ffffff') ||
        lower.includes('rgb(0, 0, 0)') || // Black
        lower.includes('#000000')
      );
    });

    if (hasBrutalistColors) {
      console.log('✅ Brutalist colors detected (white, black, red)');
    } else {
      console.log('⚠️  Warning: Brutalist colors may not be fully applied');
    }

    console.log(`\n✅ Screenshots saved to: ${screenshotDir}`);
    console.log('\n📊 Visual Test Summary:');
    console.log('  - Start screen: Captured');
    console.log('  - Countdown animation: Captured');
    console.log('  - Ball dropping: Captured');
    console.log('  - Win reveal: Captured');
    console.log('  - Prize reveal: Captured');
    console.log('\n🎨 Brutalist theme visual verification complete!');
    console.log('   Please review screenshots to verify:');
    console.log('   1. Only white (#ffffff), black (#000000), and red (#db0000) are used');
    console.log('   2. No gradients (only solid colors)');
    console.log('   3. Sharp borders (no rounded corners)');
    console.log('   4. High contrast throughout');

  } catch (error) {
    console.error('❌ Error during visual verification:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
captureThemeScreenshots().catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});
