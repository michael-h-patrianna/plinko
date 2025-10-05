import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });

  try {
    console.log('Testing physics after removing spin...\n');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    console.log('Starting drop...');
    await page.locator('button:has-text("Drop Ball")').click();

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/final-1.png' });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/final-2.png' });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/final-3.png' });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/final-complete.png' });

    console.log('✅ Verification complete');
    console.log('\nKeeping browser open for manual inspection (60s)...');
    await page.waitForTimeout(60000);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
