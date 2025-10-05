import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: false });

  try {
    // Test desktop view (wider than 375px)
    console.log('\n📱 Testing DESKTOP view (1024px)...');
    const desktopPage = await browser.newPage({
      viewport: { width: 1024, height: 768 }
    });

    await desktopPage.goto('http://localhost:5174');
    await desktopPage.waitForTimeout(500);

    // Click "Drop Ball" to show the plinko board
    await desktopPage.click('button:has-text("Drop Ball")');
    await desktopPage.waitForTimeout(1000);

    // Capture desktop screenshot
    const desktopPath = path.join(__dirname, '../../screenshots/border-corners-desktop.png');
    await desktopPage.screenshot({ path: desktopPath });
    console.log(`✅ Desktop screenshot saved: ${desktopPath}`);

    await desktopPage.close();

    // Test mobile view (375px)
    console.log('\n📱 Testing MOBILE view (375px)...');
    const mobilePage = await browser.newPage({
      viewport: { width: 375, height: 667 }
    });

    await mobilePage.goto('http://localhost:5174');
    await mobilePage.waitForTimeout(500);

    // Click "Drop Ball" to show the plinko board
    await mobilePage.click('button:has-text("Drop Ball")');
    await mobilePage.waitForTimeout(1000);

    // Capture mobile screenshot
    const mobilePath = path.join(__dirname, '../../screenshots/border-corners-mobile.png');
    await mobilePage.screenshot({ path: mobilePath });
    console.log(`✅ Mobile screenshot saved: ${mobilePath}`);

    await mobilePage.close();

    console.log('\n✨ Check the screenshots to verify:');
    console.log('Desktop: Top-left and top-right corners should be rounded (12px)');
    console.log('Mobile: Top corners should be square (no border radius)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
