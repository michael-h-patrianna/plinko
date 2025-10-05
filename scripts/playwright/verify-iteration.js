import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });

  try {
    console.log('Visual verification - Iteration 1\n');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    console.log('Dropping ball...');
    await page.locator('button:has-text("Drop Ball")').click();

    // Capture at specific intervals to show progression
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/iter1-early.png' });
    console.log('  ✓ Early drop captured (screenshots/iter1-early.png)');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/iter1-mid.png' });
    console.log('  ✓ Mid drop captured (screenshots/iter1-mid.png)');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/iter1-late.png' });
    console.log('  ✓ Late drop captured (screenshots/iter1-late.png)');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/iter1-complete.png' });
    console.log('  ✓ Complete captured (screenshots/iter1-complete.png)');

    console.log('\n✅ Screenshots saved');
    console.log('\nKeeping browser open for manual inspection (30s)...');
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
