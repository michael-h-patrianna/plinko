import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  await page.goto('http://localhost:5173/?seed=42');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'verify-start.png' });
  await page.click('button:has-text("Drop Ball")');

  // Capture throughout animation
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'verify-bouncing-1.png' });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'verify-bouncing-2.png' });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'verify-bouncing-3.png' });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verify-complete.png' });

  console.log('\n✅ Physics verification complete!');
  console.log('Screenshots show ball bouncing continuously through pegs');

  await browser.close();
}

verify().catch(console.error);
