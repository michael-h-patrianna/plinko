#!/usr/bin/env node
/**
 * Playwright script to test no-win flow
 * Verifies that clicking "Try Again" on no-win resets to start screen
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, '../../screenshots/nowin-debug');

async function testNoWinFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();

  console.log('🎯 Testing no-win flow...');

  // Try different seeds to find a no-win result
  for (let seed = 1000; seed < 1100; seed++) {
    await page.goto(`http://localhost:5173/?seed=${seed}`);

    // Wait for ready state
    try {
      await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 5000 });
    } catch (e) {
      console.log(`Seed ${seed}: timeout waiting for button`);
      continue;
    }

    // Click drop ball
    await page.click('button:has-text("Drop Ball")');

    // Wait for prize reveal
    try {
      await page.waitForFunction(
        () => document.querySelector('[role="status"]') !== null,
        { timeout: 15000 }
      );
    } catch (e) {
      console.log(`Seed ${seed}: timeout waiting for reveal`);
      continue;
    }

    // Check what's shown
    const pageContent = await page.evaluate(() => {
      const statusElement = document.querySelector('[role="status"]');
      const allButtons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = allButtons.map(b => b.textContent?.trim()).filter(Boolean);
      return {
        statusText: statusElement ? statusElement.textContent : null,
        buttonTexts,
        hasTryAgain: buttonTexts.includes('Try Again')
      };
    });

    const buttonStr = pageContent.buttonTexts.join(', ');
    console.log(`Seed ${seed}: buttons=[${buttonStr}]`);

    // Check if this is a no-win or try again button
    if (pageContent.hasTryAgain) {
      console.log(`\n✅ Found no-win result with seed ${seed}`);

      await page.screenshot({
        path: path.join(screenshotDir, '1-nowin-revealed.png'),
        fullPage: false
      });

      // Click the Try Again button
      await page.click('button:has-text("Try Again")');
      console.log('🖱️  Clicked Try Again button');

      // Wait a moment for transition
      await page.waitForTimeout(1000);

      // Check current state
      const currentState = await page.evaluate(() => {
        const dropButton = document.querySelector('button:has-text("Drop Ball")');
        const heading = document.querySelector('h2');
        return {
          hasDropButton: !!dropButton,
          headingText: heading ? heading.textContent : null
        };
      });

      await page.screenshot({
        path: path.join(screenshotDir, '2-after-click.png'),
        fullPage: false
      });

      console.log('\n📊 Analysis:');
      console.log(`Has Drop Ball button: ${currentState.hasDropButton}`);
      console.log(`Heading text: ${currentState.headingText}`);

      if (currentState.hasDropButton) {
        console.log('✅ Successfully reset to start screen');
      } else if (currentState.headingText && currentState.headingText.toLowerCase().includes('claimed')) {
        console.log('❌ Incorrectly showing Prize Claimed screen');
      } else {
        console.log('❓ Unknown state');
      }

      break; // Found and tested, exit loop
    }
  }

  console.log('\n📸 Screenshots saved to:', screenshotDir);

  await browser.close();
}

// Create screenshot directory
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

testNoWinFlow().catch(console.error);
