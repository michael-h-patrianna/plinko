/**
 * Test script to investigate ball trail visibility issue
 * Tests trail in different performance modes and captures console logs
 */

import { chromium } from '@playwright/test';

async function testTrailVisibility() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);
    console.log('BROWSER:', text);
  });

  // Navigate to the application
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  console.log('\n=== INITIAL STATE ===');
  await page.waitForTimeout(2000);

  // Open dev menu (assuming it has a button or can be opened)
  console.log('\n=== LOOKING FOR DEV MENU ===');

  // Try to find and click the dev tools button
  try {
    const devButton = await page.waitForSelector('[data-testid="dev-tools-toggle"], button:has-text("Dev"), button:has-text("Tools")', { timeout: 5000 });
    if (devButton) {
      await devButton.click();
      console.log('Clicked dev tools button');
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Could not find dev tools button, it might already be visible');
  }

  // Try to find performance mode selector
  console.log('\n=== LOOKING FOR PERFORMANCE SELECTOR ===');
  const performanceSelector = await page.locator('select').first();
  if (await performanceSelector.count() > 0) {
    // Get current value
    const currentMode = await performanceSelector.inputValue();
    console.log('Current performance mode:', currentMode);

    // Switch to power-saving
    console.log('\n=== SWITCHING TO POWER-SAVING MODE ===');
    await performanceSelector.selectOption('power-saving');
    await page.waitForTimeout(1000);

    const logsAfterPowerSaving = logs.filter(l => l.includes('[PlinkoBoard]') || l.includes('[Ball]'));
    console.log('Logs after power-saving:', logsAfterPowerSaving.slice(-5));

    // Switch to high-quality
    console.log('\n=== SWITCHING TO HIGH-QUALITY MODE ===');
    await performanceSelector.selectOption('high-quality');
    await page.waitForTimeout(1000);

    const logsAfterHighQuality = logs.filter(l => l.includes('[PlinkoBoard]') || l.includes('[Ball]'));
    console.log('Logs after high-quality:', logsAfterHighQuality.slice(-5));
  }

  // Click start button and watch ball drop
  console.log('\n=== STARTING GAME ===');
  try {
    const startButton = await page.locator('button:has-text("START"), button:has-text("Start")').first();
    await startButton.click({ timeout: 5000 });
    console.log('Clicked START button');

    // Wait for ball to drop
    await page.waitForTimeout(5000);

    // Filter relevant logs
    const relevantLogs = logs.filter(l =>
      l.includes('[App]') ||
      l.includes('[AppConfigProvider]') ||
      l.includes('[PlinkoBoard]') ||
      l.includes('[Ball]')
    );

    console.log('\n=== ALL RELEVANT LOGS ===');
    relevantLogs.forEach(log => console.log(log));
  } catch (e) {
    console.error('Error during game start:', e.message);
  }

  console.log('\n=== TEST COMPLETE - Keeping browser open for inspection ===');
  // Keep browser open for manual inspection
  await page.waitForTimeout(30000);

  await browser.close();
}

testTrailVisibility().catch(console.error);
