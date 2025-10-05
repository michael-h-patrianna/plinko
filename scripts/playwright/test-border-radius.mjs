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
    await desktopPage.waitForTimeout(1000);

    // Capture desktop screenshot
    const desktopPath = path.join(__dirname, '../../screenshots/border-radius-desktop.png');
    await desktopPage.screenshot({ path: desktopPath });
    console.log(`✅ Desktop screenshot saved: ${desktopPath}`);

    // Inspect border wall elements on desktop
    const desktopTopWall = await desktopPage.evaluate(() => {
      const walls = Array.from(document.querySelectorAll('div[style*="position: absolute"]'));
      const topWall = walls.find(w => w.style.top === '0px' && w.style.height && w.style.left === '0px' && w.style.right === '0px');
      return topWall ? {
        borderRadius: topWall.style.borderRadius,
        top: topWall.style.top,
        height: topWall.style.height
      } : null;
    });

    const desktopLeftWall = await desktopPage.evaluate(() => {
      const walls = Array.from(document.querySelectorAll('div[style*="position: absolute"]'));
      const leftWall = walls.find(w => w.style.left === '0px' && w.style.width && w.style.bottom);
      return leftWall ? {
        borderRadius: leftWall.style.borderRadius,
        top: leftWall.style.top,
        width: leftWall.style.width
      } : null;
    });

    console.log('Desktop Top Wall:', desktopTopWall);
    console.log('Desktop Left Wall:', desktopLeftWall);

    await desktopPage.close();

    // Test mobile view (375px or smaller)
    console.log('\n📱 Testing MOBILE view (375px)...');
    const mobilePage = await browser.newPage({
      viewport: { width: 375, height: 667 }
    });

    await mobilePage.goto('http://localhost:5174');
    await mobilePage.waitForTimeout(1000);

    // Capture mobile screenshot
    const mobilePath = path.join(__dirname, '../../screenshots/border-radius-mobile.png');
    await mobilePage.screenshot({ path: mobilePath });
    console.log(`✅ Mobile screenshot saved: ${mobilePath}`);

    // Inspect border wall elements on mobile
    const mobileTopWall = await mobilePage.evaluate(() => {
      const walls = Array.from(document.querySelectorAll('div[style*="position: absolute"]'));
      const topWall = walls.find(w => w.style.top === '0px' && w.style.height && w.style.left === '0px' && w.style.right === '0px');
      return topWall ? {
        borderRadius: topWall.style.borderRadius,
        top: topWall.style.top,
        height: topWall.style.height
      } : null;
    });

    const mobileLeftWall = await mobilePage.evaluate(() => {
      const walls = Array.from(document.querySelectorAll('div[style*="position: absolute"]'));
      const leftWall = walls.find(w => w.style.left === '0px' && w.style.width && w.style.bottom);
      return leftWall ? {
        borderRadius: leftWall.style.borderRadius,
        top: leftWall.style.top,
        width: leftWall.style.width
      } : null;
    });

    console.log('Mobile Top Wall:', mobileTopWall);
    console.log('Mobile Left Wall:', mobileLeftWall);

    await mobilePage.close();

    // Validation
    console.log('\n✨ VALIDATION:');
    console.log('Expected Desktop: Top wall has "12px 12px 0 0", left/right walls offset by border width');
    console.log('Expected Mobile: Top wall has "0", left/right walls at top: 0');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
