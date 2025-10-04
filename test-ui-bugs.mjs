import { chromium } from 'playwright';

async function captureUIBugs() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Capturing UI state for all themes...\n');

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Test each theme
    const themes = ['Default', 'Dark Blue', 'PlayFame'];

    for (const theme of themes) {
      console.log(`Testing ${theme} theme...`);

      // Click theme button
      const themeButton = await page.$(`button:text-is("${theme}")`);
      if (themeButton) {
        await themeButton.click();
        await page.waitForTimeout(500);
      }

      // Take screenshot of start screen
      await page.screenshot({
        path: `ui-bug-${theme.toLowerCase().replace(' ', '-')}-start.png`,
        fullPage: true
      });

      // Try to start the game
      const dropButton = await page.$('button:has-text("Drop Ball")');
      if (dropButton) {
        await dropButton.click();
        await page.waitForTimeout(2000);

        // Take screenshot of game board
        await page.screenshot({
          path: `ui-bug-${theme.toLowerCase().replace(' ', '-')}-game.png`,
          fullPage: true
        });

        // Wait for ball to finish
        await page.waitForTimeout(5000);

        // Take screenshot of result
        await page.screenshot({
          path: `ui-bug-${theme.toLowerCase().replace(' ', '-')}-result.png`,
          fullPage: true
        });

        // Try to claim/close
        const claimButton = await page.$('button:has-text("Claim"), button:has-text("Try Again")');
        if (claimButton) {
          await claimButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    console.log('\nScreenshots saved for analysis');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

captureUIBugs();