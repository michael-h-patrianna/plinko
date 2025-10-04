import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(text);
    logs.push(text);
  });

  await page.goto('http://localhost:5173/?seed=42');
  await page.waitForTimeout(2000);

  console.log('\n=== INITIAL LOGS ===');
  console.log('Captured', logs.length, 'console logs');

  // Clear logs and click the button
  logs.length = 0;

  console.log('\n=== CLICKING DROP BALL BUTTON ===');
  await page.click('button:has-text("Drop Ball")');

  // Wait for animation (should be ~5 seconds)
  await page.waitForTimeout(6000);

  console.log('\n=== LOGS DURING/AFTER ANIMATION ===');
  console.log('Captured', logs.length, 'new logs during animation');

  await browser.close();
}

test().catch(console.error);
