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

    // Capture screenshot showing the "Drop Ball" button
    const screenshotPath = path.join(__dirname, '../../screenshots/button-color-test.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✅ Screenshot saved: ${screenshotPath}`);

    // Get button color from the DOM
    const buttonStyle = await page.evaluate(() => {
      const button = document.querySelector('button:has-text("Drop Ball")');
      if (!button) return null;
      const styles = window.getComputedStyle(button);
      return {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
      };
    });

    console.log('\n🎨 Button styles:');
    console.log('Background:', buttonStyle?.background);
    console.log('Background Image:', buttonStyle?.backgroundImage);
    console.log('\n✅ Button should have blue gradient (rgb(96, 165, 250) to rgb(37, 99, 235))');

    await browser.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
})();
