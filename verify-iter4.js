import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });

  try {
    console.log('Visual verification - Iteration 4 (Asymmetric Damping)\n');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    console.log('Dropping ball...');
    const startButton = await page.waitForSelector('button', { timeout: 5000 });
    await startButton.click();

    // Capture at specific intervals
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'iter4-early.png' });
    console.log('  ✓ Early drop');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'iter4-mid.png' });
    console.log('  ✓ Mid drop');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'iter4-late.png' });
    console.log('  ✓ Late drop');

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'iter4-complete.png' });
    console.log('  ✓ Complete');

    console.log('\n✅ Iteration 4 screenshots captured');
    console.log('Keeping browser open (30s)...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
