import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('BROWSER:', msg.text()));
  page.on('pageerror', (err) => console.error('ERROR:', err.message));

  await page.goto('http://localhost:5173/?seed=42');
  console.log('\n1. Loaded page');

  await page.waitForTimeout(1000);
  console.log('2. Taking screenshot of start...');
  await page.screenshot({ path: 'screenshots/live-start.png' });

  console.log('3. Clicking drop ball...');
  await page.click('[data-testid="drop-ball-button"]');

  await page.waitForTimeout(500);
  console.log('4. Ball should be dropping - screenshot...');
  await page.screenshot({ path: 'screenshots/live-drop-start.png' });

  await page.waitForTimeout(1500);
  console.log('5. Mid animation - screenshot...');
  await page.screenshot({ path: 'screenshots/live-mid.png' });

  await page.waitForTimeout(2000);
  console.log('6. Later animation - screenshot...');
  await page.screenshot({ path: 'screenshots/live-late.png' });

  console.log('\n7. Waiting for reveal...');
  try {
    await page.waitForSelector('text=Congratulations', { timeout: 5000 });
    console.log('✅ Reveal appeared!');
    await page.screenshot({ path: 'screenshots/live-reveal.png' });
  } catch (e) {
    console.log('❌ Reveal did not appear in time');
    await page.screenshot({ path: 'screenshots/live-timeout.png' });
  }

  console.log('\nKeeping browser open - check the animation yourself...');
  console.log('Press Ctrl+C when done.');
  await new Promise(() => {});
}

test().catch(console.error);
