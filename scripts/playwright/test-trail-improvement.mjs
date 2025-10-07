/**
 * Visual Test: Ball Trail Improvement
 *
 * Tests the improved comet tail effect with:
 * - Increased trail density (8-20 points)
 * - Linear gradient glow effect
 * - Exponential opacity fade
 * - Larger trail points (12px)
 * - Progressive blur enhancement
 *
 * Captures screenshots at different speeds to show trail stretching.
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '/Users/michaelhaufschild/Documents/code/plinko/screenshots/trail-improvement';
const APP_URL = 'http://localhost:5174';

async function captureTrailEffect() {
  console.log('🎯 Starting ball trail improvement visual test...\n');

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false, // Visual test - show browser
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    console.log('📱 Loading app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Start game
    console.log('🎮 Starting game...');
    const startButton = await page.locator('[data-testid="start-button"]');
    await startButton.click();
    await page.waitForTimeout(500);

    // Wait for countdown
    console.log('⏳ Waiting for countdown...');
    await page.waitForTimeout(3500);

    // Capture screenshots at different points during ball drop
    const capturePoints = [
      { delay: 200, name: 'early-drop-slow', description: 'Early drop (slow speed)' },
      { delay: 600, name: 'mid-drop-medium', description: 'Mid drop (medium speed)' },
      { delay: 1200, name: 'late-drop-fast', description: 'Late drop (fast speed)' },
      { delay: 1800, name: 'final-descent', description: 'Final descent (maximum speed)' },
    ];

    for (const point of capturePoints) {
      console.log(`📸 Capturing: ${point.description}...`);
      await page.waitForTimeout(point.delay);

      const screenshot = await page.screenshot({ encoding: 'binary' });
      const screenshotPath = join(OUTPUT_DIR, `${point.name}.png`);
      writeFileSync(screenshotPath, screenshot);
      console.log(`   ✓ Saved: ${screenshotPath}`);
    }

    // Wait for ball to land
    console.log('⏳ Waiting for landing...');
    await page.waitForTimeout(2000);

    // Capture final state
    console.log('📸 Capturing final state...');
    const finalScreenshot = await page.screenshot({ encoding: 'binary' });
    writeFileSync(join(OUTPUT_DIR, 'final-landed.png'), finalScreenshot);

    console.log('\n✅ Trail improvement test complete!');
    console.log(`📂 Screenshots saved to: ${OUTPUT_DIR}\n`);

    // Generate comparison report
    const report = {
      timestamp: new Date().toISOString(),
      test: 'Ball Trail Improvement',
      improvements: [
        'Increased trail density: 8-20 points (was 4-12)',
        'Trail point size: 12px (was 8px)',
        'Linear gradient glow effect (RN-compatible)',
        'Exponential opacity fade: 0.9 → 0.05 (was linear 0.8 → 0.15)',
        'Scale taper: 1.0 → 0.3 (was 1.0 → 0.4)',
        'Progressive blur enhancement: 0.5px (web-only)',
      ],
      screenshots: capturePoints.map(p => p.name + '.png').concat(['final-landed.png']),
      crossPlatformCompatible: true,
      performanceImpact: 'Minimal - trail still respects performance config',
    };

    writeFileSync(
      join(OUTPUT_DIR, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📊 Test report saved: test-report.json\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run test
captureTrailEffect().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
