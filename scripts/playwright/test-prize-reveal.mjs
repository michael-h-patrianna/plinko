import { chromium } from 'playwright';

async function testPrizeReveal() {
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

    console.log('Testing prize reveal issue...\n');

    // Click Drop Ball button
    const dropButton = await page.$('button:has-text("Drop Ball")');
    if (dropButton) {
      console.log('Clicking Drop Ball...');
      await dropButton.click();

      // Wait for ball to finish (animation plus landing timeout)
      await page.waitForTimeout(12000);

      // Take screenshot to see final state
      await page.screenshot({
        path: 'screenshots/test-prize-reveal-final.png',
        fullPage: true,
      });

      console.log('\nScreenshot saved as screenshots/test-prize-reveal-final.png');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testPrizeReveal();
