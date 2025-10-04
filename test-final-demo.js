import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/?seed=42');
  await page.waitForTimeout(1500);

  console.log('Capturing initial state...');
  await page.screenshot({ path: 'final-before.png' });

  console.log('Clicking Drop Ball...');
  await page.click('button:has-text("Drop Ball")');

  // Capture at key moments in the faster animation
  await page.waitForTimeout(300);
  console.log('Capturing early drop (0.3s)...');
  await page.screenshot({ path: 'final-early.png' });

  await page.waitForTimeout(500);
  console.log('Capturing mid drop (0.8s)...');
  await page.screenshot({ path: 'final-mid.png' });

  await page.waitForTimeout(900);
  console.log('Capturing late drop (1.7s)...');
  await page.screenshot({ path: 'final-late.png' });

  await page.waitForTimeout(1500);
  console.log('Capturing prize reveal (3.2s)...');
  await page.screenshot({ path: 'final-reveal.png' });

  console.log('\n✅ Demo screenshots captured!');

  await browser.close();
}

test().catch(console.error);
