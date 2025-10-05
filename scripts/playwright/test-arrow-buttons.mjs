import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: false });

  try {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 768 }
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(500);

    // Click "Drop Ball" to get to the drop position selector
    const dropBallButton = await page.waitForSelector('button:has-text("Drop Ball")');
    await dropBallButton.click();
    await page.waitForTimeout(1000);

    // Click on a chamber to show the arrow buttons and START button
    const chambers = await page.$$('div[style*="radial-gradient"]');
    if (chambers.length > 0) {
      await chambers[3].click(); // Click on the 4th chamber (middle-ish)
      await page.waitForTimeout(500);
    }

    // Capture screenshot showing the arrow buttons
    const screenshotPath = path.join(__dirname, '../../screenshots/arrow-buttons-test.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    console.log('\n✨ Check the screenshot to verify:');
    console.log('- Arrow buttons should have a nice gradient (not ugly gray)');
    console.log('- START button should be blue with proper styling');

    await browser.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
})();
