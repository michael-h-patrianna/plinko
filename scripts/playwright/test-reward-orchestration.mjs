/**
 * Visual test for FreeRewardView animation orchestration
 * Captures screenshots of the premium reveal sequence
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const screenshotsDir = join(projectRoot, 'screenshots/reward-orchestration');

// Ensure screenshots directory exists
mkdirSync(screenshotsDir, { recursive: true });

async function testRewardOrchestration() {
  console.log('🎬 Testing FreeRewardView animation orchestration...\n');

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    console.log('✓ Loaded application');

    // Wait for and click the "Drop Ball" button
    await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 5000 });
    await page.click('[data-testid="drop-ball-button"]');
    console.log('✓ Clicked Drop Ball button');

    // Wait for ball animation to complete and prize reveal to appear
    // Could be either free-reward or purchase-offer overlay
    const overlayAppeared = await Promise.race([
      page.waitForSelector('[data-testid="free-reward-overlay"]', { timeout: 15000 }).then(() => 'free-reward'),
      page.waitForSelector('[data-testid="purchase-offer-overlay"]', { timeout: 15000 }).then(() => 'purchase-offer'),
    ]);
    console.log(`✓ Prize reveal overlay appeared: ${overlayAppeared}`);

    // If it's a purchase offer, click drop ball again
    if (overlayAppeared === 'purchase-offer') {
      console.log('Got purchase offer, clicking close and trying again...');
      // Click the close/dismiss button or press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      await page.click('[data-testid="drop-ball-button"]');
      await page.waitForSelector('[data-testid="free-reward-overlay"]', { timeout: 15000 });
      console.log('✓ Free reward overlay appeared on second attempt');
    }

    // Capture screenshots at key moments in the orchestration
    const timings = [
      { delay: 0, name: '1-initial', description: 'Initial state (YouWonText starting)' },
      { delay: 300, name: '2-you-won', description: 'YouWonText mid-bounce' },
      { delay: 500, name: '3-container-swoosh', description: 'Rewards container entrance' },
      { delay: 700, name: '4-counters-popping', description: 'Counters starting to pop in' },
      { delay: 1000, name: '5-button-entrance', description: 'Claim button starting entrance' },
      { delay: 1500, name: '6-complete', description: 'Sequence complete' },
    ];

    for (const timing of timings) {
      await page.waitForTimeout(timing.delay);
      const screenshotPath = join(screenshotsDir, `${timing.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`✓ Captured: ${timing.name} - ${timing.description}`);
    }

    console.log('\n✅ Animation orchestration test complete!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}\n`);

    // Keep browser open for manual inspection
    console.log('Browser will remain open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testRewardOrchestration().catch(console.error);
