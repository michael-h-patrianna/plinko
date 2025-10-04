import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/?seed=42');
  await page.waitForTimeout(2000);

  console.log('Taking screenshot before drop...');
  await page.screenshot({ path: 'before-drop.png' });

  console.log('Clicking Drop Ball button...');
  await page.click('button:has-text("Drop Ball")');

  // Take screenshots at different points during animation
  await page.waitForTimeout(500);
  console.log('Taking screenshot at 0.5s (early drop)...');
  await page.screenshot({ path: 'drop-0.5s.png' });

  await page.waitForTimeout(1000);
  console.log('Taking screenshot at 1.5s (mid drop)...');
  await page.screenshot({ path: 'drop-1.5s.png' });

  await page.waitForTimeout(1500);
  console.log('Taking screenshot at 3s (late drop)...');
  await page.screenshot({ path: 'drop-3s.png' });

  await page.waitForTimeout(2000);
  console.log('Taking screenshot at 5s (after animation)...');
  await page.screenshot({ path: 'drop-5s.png' });

  console.log('\nDone! Check the screenshots.');

  await browser.close();
}

test().catch(console.error);
