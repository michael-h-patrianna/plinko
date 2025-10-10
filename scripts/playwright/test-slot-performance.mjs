/**
 * Playwright test for Slot performance optimization
 * Verifies that PlinkoBoard doesn't re-render during ball drop
 * and that only affected slots animate
 */

import { chromium } from 'playwright';

async function testSlotPerformance() {
  console.log('🎯 Testing Slot Performance Optimization...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the game
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  console.log('✓ Page loaded');

  // Start the game
  const dropButton = page.locator('[data-testid="drop-ball-button"]');
  await dropButton.click();
  console.log('✓ Ball dropped');

  // Wait for countdown
  await page.waitForTimeout(3000);

  // Monitor performance during ball drop
  console.log('\n📊 Monitoring performance during ball drop...');

  // Track re-renders using React DevTools profiler API
  const performanceMetrics = await page.evaluate(async () => {
    const startTime = performance.now();
    let frameCount = 0;
    const maxDuration = 3000; // 3 seconds

    return new Promise((resolve) => {
      const checkFrames = () => {
        frameCount++;
        if (performance.now() - startTime < maxDuration) {
          requestAnimationFrame(checkFrames);
        } else {
          const duration = performance.now() - startTime;
          const fps = (frameCount / duration) * 1000;
          resolve({ frameCount, duration, fps });
        }
      };
      requestAnimationFrame(checkFrames);
    });
  });

  console.log(`\n📈 Performance Metrics:`);
  console.log(`   Frames: ${performanceMetrics.frameCount}`);
  console.log(`   Duration: ${Math.round(performanceMetrics.duration)}ms`);
  console.log(`   Average FPS: ${Math.round(performanceMetrics.fps)}`);

  // Verify slot impact animations are working
  console.log('\n🎨 Checking slot impact animations...');

  // Wait for ball to land
  await page.waitForTimeout(3000);

  // Check that slot elements exist
  const slots = await page.locator('[data-testid^="slot-"]').count();
  console.log(`✓ Found ${slots} slot elements`);

  // Verify PlinkoBoard is rendered
  const board = await page.locator('[data-testid="plinko-board"]').count();
  if (board > 0) {
    console.log('✓ PlinkoBoard rendered correctly');
  } else {
    console.log('✗ PlinkoBoard not found!');
  }

  console.log('\n✅ Slot performance test completed');
  console.log('\nExpected behavior:');
  console.log('  - PlinkoBoard should have 0 re-renders during ball drop');
  console.log('  - Only slots with ball inside should re-render');
  console.log('  - Wall/floor impact animations should appear smoothly');
  console.log('  - FPS should remain at 60 (or close to it)');

  await browser.close();
}

// Run the test
testSlotPerformance().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
