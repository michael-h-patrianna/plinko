import { chromium } from 'playwright';
import * as fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 600, height: 900 },
    recordVideo: {
      dir: './videos/',
      size: { width: 600, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    console.log('🎥 Recording Plinko gameplay video...\n');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    console.log('Starting ball drop...');
    const startButton = await page.waitForSelector('button', { timeout: 5000 });
    await startButton.click();

    // Wait for entire animation to complete (2.5s drop + 0.2s settle + 0.3s reveal)
    await page.waitForTimeout(3500);

    console.log('✅ Animation complete');
    console.log('Waiting for video to save...');

    await page.waitForTimeout(1000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await context.close();
    console.log('\n✅ Video saved to videos/ directory');
    console.log('Review the video to verify:');
    console.log('  1. Ball descends smoothly from top to bottom');
    console.log('  2. Ball bounces naturally off pegs');
    console.log('  3. No hovering or stalling at any point');
    console.log('  4. Movement looks realistic and fluid');
    await browser.close();
  }
})();
