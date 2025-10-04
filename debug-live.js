import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(text);
    logs.push(text);
  });

  await page.goto('http://localhost:5173/?seed=42');
  await page.waitForTimeout(2000);

  console.log('\n=== CLICKING DROP BALL ===\n');
  await page.click('button:has-text("Drop Ball")');

  // Wait and watch
  await page.waitForTimeout(10000);

  console.log('\n=== ANIMATION COMPLETE ===');
  console.log('Total logs captured:', logs.length);

  // Keep browser open to inspect
  await new Promise(resolve => setTimeout(resolve, 60000));
}

debug().catch(console.error);
