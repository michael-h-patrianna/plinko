import { chromium } from 'playwright';

async function testPlayFameTheme() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[usePlinkoGame]') || text.includes('[App]')) {
      console.log(text);
    }
  });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('Testing PlayFame theme initial state...\n');

    // Click PlayFame theme button
    const themeButton = await page.$('button:text-is("PlayFame")');
    if (themeButton) {
      console.log('Clicking PlayFame theme...');
      await themeButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot of initial state
      await page.screenshot({
        path: 'screenshots/test-playfame-initial.png',
        fullPage: true,
      });

      console.log('\nScreenshot saved as screenshots/test-playfame-initial.png');

      // Check if Drop Ball button is visible
      const dropButton = await page.$('button:has-text("Drop Ball")');
      if (dropButton) {
        const isVisible = await dropButton.isVisible();
        console.log('Drop Ball button visible:', isVisible);
      } else {
        console.log('Drop Ball button not found');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testPlayFameTheme();
