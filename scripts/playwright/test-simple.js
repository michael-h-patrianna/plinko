import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174');
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('Waiting 60 seconds for you to manually test...');
  await page.waitForTimeout(60000);

  await browser.close();
})();
