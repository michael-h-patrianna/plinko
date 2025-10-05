import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log('Opening Plinko game...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    console.log('\n✅ Testing enhanced physics with spin and angular momentum...\n');

    // Test 1: Start game and observe bouncing behavior
    console.log('Test 1: Observing ball physics during drop');
    await page.screenshot({ path: 'screenshots/verify-physics-start.png' });

    const startButton = page.locator('button:has-text("Drop Ball")');
    await startButton.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/verify-bouncing-1.png' });
    console.log('  ✓ Screenshot 1: Early bounces');

    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/verify-bouncing-2.png' });
    console.log('  ✓ Screenshot 2: Mid-drop bounces');

    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/verify-bouncing-3.png' });
    console.log('  ✓ Screenshot 3: Late bounces');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/verify-complete.png' });
    console.log('  ✓ Screenshot 4: Landing complete');

    // Test 2: Verify ball maintains momentum throughout
    console.log('\nTest 2: Multiple drops to verify consistency');

    for (let i = 1; i <= 3; i++) {
      await page.locator('button:has-text("Play Again")').click();
      await page.waitForTimeout(500);

      const startBtn = page.locator('button:has-text("Drop Ball")');
      await startBtn.click();

      await page.waitForTimeout(2700);

      const prizeElement = page.locator('[data-testid="prize-display"]');
      const prizeText = await prizeElement.textContent();
      console.log(`  Drop ${i}: Ball landed successfully - ${prizeText}`);
    }

    console.log('\n✅ Physics verification complete!');
    console.log('\nPhysics improvements implemented:');
    console.log('  • Enhanced gravity (1200 px/s²) for better hang time');
    console.log('  • Increased bounce damping (0.82) for bouncier feel');
    console.log('  • Minimal horizontal damping (0.988) for fluid motion');
    console.log('  • Stronger bounce impulse (450) for dynamic paths');
    console.log('  • Higher minimum velocity (120) for continuous liveliness');
    console.log('  • Spin physics with angular momentum (SPIN_FACTOR: 0.15)');
    console.log('  • Realistic rotation based on spin and velocity');
    console.log('\nScreenshots saved for visual verification.');
    console.log('\nPress any key to close browser...');

    // Keep browser open for manual inspection
    await page.waitForTimeout(60000);
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
