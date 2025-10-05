import { chromium } from 'playwright';

console.log('Starting Playwright test...');

const browser = await chromium.launch({
  headless: false,
  devtools: true,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

const page = await context.newPage();

// Enable console logging
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.log('CONSOLE ERROR:', msg.text());
  }
});

page.on('pageerror', (error) => {
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
  const startScreen = await page
    .locator('[data-testid="drop-ball-button"]')
    .isVisible()
    .catch(() => false);
  console.log('Start screen visible:', startScreen);

  if (!startScreen) {
    // Check for any error messages
    const bodyText = await page.locator('body').textContent();
    console.log('Body content:', bodyText.substring(0, 500));

    // Take screenshot
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
    console.log('Screenshot saved as screenshots/error-state.png');

    // Check for React error boundary or error messages
    const errorBoundary = await page.locator('text=/error/i').count();
    console.log('Error messages found:', errorBoundary);
  } else {
    console.log('✅ App loaded successfully!');

    // Take screenshot of working app
    await page.screenshot({ path: 'screenshots/app-loaded.png', fullPage: true });
    console.log('Screenshot saved as screenshots/app-loaded.png');

    // Check theme elements
    console.log('Checking theme elements...');

    // Get computed styles of the button to verify theming
    const buttonStyles = await page.locator('[data-testid="drop-ball-button"]').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        borderRadius: styles.borderRadius,
        color: styles.color,
      };
    });
    console.log('Button styles:', buttonStyles);

    // Try clicking the drop ball button
    console.log('Clicking Drop Ball button...');
    await page.locator('[data-testid="drop-ball-button"]').click();

    await page.waitForTimeout(1000);

    // Check if board is visible
    const board = await page
      .locator('[data-testid="plinko-board"]')
      .isVisible()
      .catch(() => false);
    console.log('Board visible after click:', board);

    if (board) {
      await page.screenshot({ path: 'screenshots/board-visible.png', fullPage: true });
      console.log('Board screenshot saved to screenshots/board-visible.png');

      // Check if theme is applied to board
      const boardStyles = await page.locator('[data-testid="plinko-board"]').evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          background: styles.background,
          borderRadius: styles.borderRadius,
        };
      });
      console.log('Board styles:', boardStyles);
    }

    // Check if theme selector is visible
    const themeSelector = await page
      .locator('text=/Theme:/i')
      .isVisible()
      .catch(() => false);
    console.log('Theme selector visible:', themeSelector);

    if (themeSelector) {
      // Try selecting PlayFame theme
      console.log('Attempting to select PlayFame theme...');
      await page.selectOption('select:has-text("Theme")', { label: 'PlayFame' }).catch((e) => {
        console.log('Failed to select theme:', e.message);
      });

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/playfame-theme.png', fullPage: true });
      console.log('PlayFame theme screenshot saved to screenshots/playfame-theme.png');
    }
  }

  console.log('\n=== TEST COMPLETE ===');
  console.log('App loads:', startScreen ? '✅' : '❌');
  console.log('Check screenshots for visual confirmation');
} catch (error) {
  console.error('Test failed:', error);
  await page.screenshot({ path: 'screenshots/error-screenshot.png', fullPage: true });
} finally {
  await browser.close();
  process.exit(0);
}
