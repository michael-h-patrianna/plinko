const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test...');

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Wait a bit to see if app loads
    await page.waitForTimeout(2000);

    // Check if the app loaded
    console.log('Checking if app loaded...');

    // Check for the start screen
    const startScreen = await page.locator('[data-testid="drop-ball-button"]').isVisible().catch(() => false);
    console.log('Start screen visible:', startScreen);

    if (!startScreen) {
      // Check for any error messages
      const bodyText = await page.locator('body').textContent();
      console.log('Body content:', bodyText.substring(0, 500));

      // Take screenshot
      await page.screenshot({ path: 'error-state.png', fullPage: true });
      console.log('Screenshot saved as error-state.png');

      // Check console errors
      const errors = await page.evaluate(() => {
        return window.console.error ? 'Console has errors' : 'No console errors';
      });
      console.log('Console state:', errors);
    } else {
      console.log('✅ App loaded successfully!');

      // Take screenshot of working app
      await page.screenshot({ path: 'app-loaded.png', fullPage: true });
      console.log('Screenshot saved as app-loaded.png');

      // Try clicking the drop ball button
      console.log('Clicking Drop Ball button...');
      await page.locator('[data-testid="drop-ball-button"]').click();

      await page.waitForTimeout(1000);

      // Check if board is visible
      const board = await page.locator('[data-testid="plinko-board"]').isVisible().catch(() => false);
      console.log('Board visible after click:', board);

      if (board) {
        await page.screenshot({ path: 'board-visible.png', fullPage: true });
        console.log('Board screenshot saved');
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }

  console.log('Test complete. Browser will stay open for inspection.');
  // Keep browser open for manual inspection
  await page.waitForTimeout(300000);

  await browser.close();
})();