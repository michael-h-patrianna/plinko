#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'path';

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  console.log('📂 Loading game...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  console.log('📸 Screenshot 1: Start screen');
  await page.screenshot({ path: 'screenshots/test-1-start.png' });

  console.log('⚙️  Opening dev menu with gear icon...');
  const gearButton = page.locator('button[aria-label="Dev Tools Settings"]');
  await gearButton.click();
  await page.waitForTimeout(1000);

  console.log('📸 Screenshot 2: Dev menu open');
  await page.screenshot({ path: 'screenshots/test-2-devmenu.png' });

  console.log('🎯 Looking for Drop Position button...');
  const dropPosButton = page.locator('button:has-text("Drop Position")');
  const count = await dropPosButton.count();
  console.log(`Found ${count} buttons with "Drop Position"`);

  if (count > 0) {
    console.log('Clicking Drop Position...');
    await dropPosButton.click();
    await page.waitForTimeout(500);

    console.log('📸 Screenshot 3: Drop Position selected');
    await page.screenshot({ path: 'screenshots/test-3-selected.png' });
  }

  console.log('✅ Closing dev menu by clicking gear again...');
  await gearButton.click();
  await page.waitForTimeout(500);

  console.log('📸 Screenshot 4: Dev menu closed');
  await page.screenshot({ path: 'screenshots/test-4-closed.png' });

  console.log('▶️  Looking for Drop Ball button...');
  const dropBallButton = page.locator('button:has-text("Drop Ball")');
  const ballCount = await dropBallButton.count();
  console.log(`Found ${ballCount} Drop Ball buttons`);

  if (ballCount > 0) {
    console.log('Clicking Drop Ball...');
    await dropBallButton.click();
    await page.waitForTimeout(1500);

    console.log('📸 Screenshot 5: Drop selector should be visible!');
    await page.screenshot({ path: 'screenshots/test-5-SELECTOR.png' });

    console.log('\n✨ BROWSER WILL STAY OPEN FOR 60 SECONDS FOR MANUAL TESTING\n');
    await page.waitForTimeout(60000);
  } else {
    console.log('❌ No Drop Ball button found!');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  await page.screenshot({ path: 'screenshots/test-ERROR.png' });
} finally {
  await browser.close();
  console.log('✅ Done!');
}
