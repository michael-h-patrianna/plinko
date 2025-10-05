import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 800, height: 1000 },
  });
  const page = await context.newPage();

  try {
    console.log('Testing physics fix...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1500);

    console.log('Starting drop...');
    await page.screenshot({ path: 'screenshots/physics-fix-before.png' });

    const startButton = page.locator('button:has-text("Drop Ball")');
    await startButton.click();

    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/physics-fix-mid1.png' });
    console.log('Mid-drop 1 captured');

    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/physics-fix-mid2.png' });
    console.log('Mid-drop 2 captured');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/physics-fix-end.png' });
    console.log('End captured');

    console.log('\n✅ Physics screenshots captured');
    console.log('Please review the screenshots to verify ball movement is smooth and realistic');
    console.log('\nKeeping browser open for 30 seconds for manual review...');

    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
