import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('networkidle');

  // Click "Drop Ball"
  const dropButton = await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 5000 });
  await dropButton.click();

  // Wait longer for ball animation and prize reveal
  await page.waitForTimeout(7000);

  // Take screenshot of prize reveal state
  await page.screenshot({ path: 'prize-reveal-state.png', fullPage: false });
  console.log('✓ Screenshot 1: prize-reveal-state.png');

  // Look for either "Claim Prize" or "Try Again" button with longer timeout
  try {
    const claimButton = await page.waitForSelector('button:has-text("Claim Prize"), button:has-text("Try Again"), button:has-text("Close")', { timeout: 5000 });
    await claimButton.click();

    // Wait for PrizeClaimed view to animate in
    await page.waitForTimeout(1500);

    // Take screenshot
    await page.screenshot({ path: 'prize-claimed-debug.png', fullPage: false });
    console.log('✓ Screenshot 2: prize-claimed-debug.png');
  } catch (e) {
    console.log('Could not find claim button, taking screenshot of current state...');
    await page.screenshot({ path: 'current-state.png', fullPage: false });
    console.log('✓ Screenshot: current-state.png');
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
