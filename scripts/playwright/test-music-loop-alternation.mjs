#!/usr/bin/env node

/**
 * Playwright test to verify music loop alternation
 * Tests that game-loop plays after start-loop and music continues alternating
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const distPath = path.resolve(projectRoot, 'dist');

async function testMusicLoopAlternation() {
  console.log('\n=== Music Loop Alternation Test ===\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console logs
  const logs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);
    console.log(`[Browser Console] ${text}`);
  });

  try {
    // Load the app
    console.log('Loading application...');
    await page.goto(`file://${distPath}/index.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Enable music in dev menu
    console.log('\nEnabling music in dev menu...');
    await page.click('[data-testid="dev-menu-trigger"]');
    await page.waitForTimeout(500);

    const musicToggle = page.locator('text=Music').locator('..').locator('button');
    const musicStatus = await musicToggle.textContent();
    console.log(`Music status: ${musicStatus}`);

    if (musicStatus.includes('off')) {
      await musicToggle.click();
      console.log('Music enabled');
      await page.waitForTimeout(500);
    }

    // Close dev menu
    await page.click('[data-testid="dev-menu-trigger"]');
    await page.waitForTimeout(500);

    // Click "Drop Ball" to start
    console.log('\nClicking "Drop Ball" button...');
    await page.click('button:has-text("Drop Ball")');
    await page.waitForTimeout(2000);

    // Check for music start log
    const musicStarted = logs.some(log =>
      log.includes('Starting music: fade in start-loop to 36% volume')
    );
    console.log(`\n✓ Music started: ${musicStarted ? 'YES' : 'NO'}`);

    // Wait for loop alternation setup (should happen shortly after music starts)
    console.log('\nWaiting for loop alternation setup...');
    await page.waitForTimeout(3000);

    const alternationSetup = logs.some(log =>
      log.includes('Setting up start-loop → game-loop alternation')
    );
    console.log(`✓ Loop alternation setup: ${alternationSetup ? 'YES' : 'NO'}`);

    // Now we need to wait for the start-loop to finish and transition to game-loop
    // start-loop.mp3 is about 8-10 seconds long, so let's wait for it
    console.log('\nWaiting for start-loop to complete and transition to game-loop...');
    console.log('(This may take 8-10 seconds)');

    // Wait up to 15 seconds for the transition
    let transitionDetected = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      const gameLoopTransition = logs.some(log =>
        log.includes('Transitioning from music-start-loop to music-game-loop')
      );
      if (gameLoopTransition) {
        transitionDetected = true;
        console.log(`✓ Transition detected after ${(i + 1) * 0.5} seconds`);
        break;
      }
    }

    console.log(`✓ Loop transition to game-loop: ${transitionDetected ? 'YES' : 'NO'}`);

    // Check for volume inheritance
    const volumeInherited = logs.some(log =>
      log.includes('Inherited volume') && log.includes('music-game-loop')
    );
    console.log(`✓ Volume inherited: ${volumeInherited ? 'YES' : 'NO'}`);

    // Summary
    console.log('\n=== Test Results ===');
    console.log(`Music started: ${musicStarted ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Alternation setup: ${alternationSetup ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Loop transition: ${transitionDetected ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Volume inheritance: ${volumeInherited ? '✓ PASS' : '✗ FAIL'}`);

    const allPassed = musicStarted && alternationSetup && transitionDetected && volumeInherited;
    console.log(`\n${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

    return allPassed;
  } catch (error) {
    console.error('Error during test:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testMusicLoopAlternation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
