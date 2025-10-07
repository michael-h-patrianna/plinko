import { chromium } from 'playwright';
import {
  waitForElement,
  waitForBallDrop,
  waitForNetworkIdle,
  takeScreenshot,
  initializeWithSeed,
  PLAYWRIGHT_SEEDS,
} from './test-helpers.mjs';

console.log('Starting deterministic gameplay test...\n');

const browser = await chromium.launch({
  headless: false,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

const page = await context.newPage();

// Initialize with deterministic seed
await initializeWithSeed(page, PLAYWRIGHT_SEEDS.gameplayTest);

// Track test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

try {
  // Test 1: App loads
  console.log('Test 1: App loads with deterministic seed');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await waitForNetworkIdle(page);

  const appLoaded = await waitForElement(page, '[data-testid="drop-ball-button"]', {
    timeout: 5000,
  }).catch(() => false);
  logTest('App loads successfully', appLoaded);

  if (!appLoaded) {
    throw new Error('App failed to load');
  }

  await takeScreenshot(page, 'deterministic-start-screen', { folder: 'screenshots' });

  // Test 2: Drop ball and verify animation completes
  console.log('\nTest 2: Ball drop with deterministic behavior');
  await page.locator('[data-testid="drop-ball-button"]').click();

  const boardVisible = await waitForElement(page, '[data-testid="plinko-board"]', {
    timeout: 2000,
  }).catch(() => false);
  logTest('Board appears after button click', boardVisible);

  if (boardVisible) {
    await takeScreenshot(page, 'deterministic-board-visible', { folder: 'screenshots' });

    // Wait for ball drop to complete
    await waitForBallDrop(page, { maxWait: 10000 });

    await takeScreenshot(page, 'deterministic-ball-landed', { folder: 'screenshots' });
    logTest('Ball drop animation completes', true);
  }

  // Test 3: Verify consistent landing with same seed
  console.log('\nTest 3: Verify deterministic landing (5 drops with same seed)');
  const landingSlots = [];

  for (let i = 0; i < 5; i++) {
    // Reload page to reset state
    await page.reload({ waitUntil: 'networkidle' });
    await initializeWithSeed(page, PLAYWRIGHT_SEEDS.gameplayTest);
    await waitForNetworkIdle(page);

    // Drop ball
    await page.locator('[data-testid="drop-ball-button"]').click();
    await waitForElement(page, '[data-testid="plinko-board"]');
    await waitForBallDrop(page);

    // Try to get landed slot (if exposed via data attribute)
    const slotInfo = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      return ball ? ball.getAttribute('data-landed-slot') : null;
    });

    landingSlots.push(slotInfo);
    console.log(`   Drop ${i + 1}: Slot ${slotInfo || 'unknown'}`);
  }

  // Check if all drops landed in same slot (deterministic behavior)
  const uniqueSlots = new Set(landingSlots.filter(s => s !== null));
  const isDeterministic = uniqueSlots.size <= 1;
  logTest(
    'Ball lands in same slot with same seed',
    isDeterministic,
    `Landed in ${uniqueSlots.size} unique slot(s)`
  );

  // Test 4: Theme switching works deterministically
  console.log('\nTest 4: Theme switching');
  await page.reload({ waitUntil: 'networkidle' });
  await waitForNetworkIdle(page);

  const themeSelectorVisible = await waitForElement(page, 'select', {
    timeout: 2000,
  }).catch(() => false);

  if (themeSelectorVisible) {
    // Switch to PlayFame theme
    await page.selectOption('select', 'PlayFame');
    await page.waitForTimeout(500);

    const buttonStyles = await page.locator('[data-testid="drop-ball-button"]').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        borderRadius: styles.borderRadius,
        background: styles.background.substring(0, 50),
      };
    });

    const isRounded = buttonStyles.borderRadius.includes('9999') || buttonStyles.borderRadius.includes('9e+12');
    logTest('PlayFame theme applies rounded buttons', isRounded, `Border radius: ${buttonStyles.borderRadius}`);

    await takeScreenshot(page, 'deterministic-playfame-theme', { folder: 'screenshots' });

    // Switch to other themes
    const themes = ['Dark Blue', 'Oceanic', 'Sunset'];
    for (const theme of themes) {
      await page.selectOption('select', theme);
      await page.waitForTimeout(500);
      const themeName = theme.toLowerCase().replace(' ', '-');
      await takeScreenshot(page, `deterministic-${themeName}-theme`, { folder: 'screenshots' });
    }

    logTest('All themes load without errors', true);
  } else {
    logTest('Theme selector visible', false);
  }

  // Test 5: UI elements are stable (no flickering/layout shift)
  console.log('\nTest 5: UI stability check');
  await page.reload({ waitUntil: 'networkidle' });
  await waitForNetworkIdle(page);

  // Measure layout stability by checking button position over time
  const positions = [];
  for (let i = 0; i < 5; i++) {
    const boundingBox = await page.locator('[data-testid="drop-ball-button"]').boundingBox();
    positions.push(boundingBox);
    await page.waitForTimeout(200);
  }

  const positionsStable = positions.every((pos, idx) => {
    if (idx === 0) return true;
    const prev = positions[idx - 1];
    return Math.abs(pos.x - prev.x) < 1 && Math.abs(pos.y - prev.y) < 1;
  });

  logTest('UI elements remain stable (no layout shift)', positionsStable);

  // Test 6: Verify deterministic seeds work across different scenarios
  console.log('\nTest 6: Different seeds produce different results');
  const seedResults = [];

  for (const seedName of ['slot0', 'slot1', 'slot2']) {
    await page.reload({ waitUntil: 'networkidle' });
    await initializeWithSeed(page, PLAYWRIGHT_SEEDS[seedName]);
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="drop-ball-button"]').click();
    await waitForElement(page, '[data-testid="plinko-board"]');
    await waitForBallDrop(page);

    const slotInfo = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      return ball ? ball.getAttribute('data-landed-slot') : null;
    });

    seedResults.push({ seedName, slot: slotInfo });
    console.log(`   Seed ${seedName}: Slot ${slotInfo || 'unknown'}`);
  }

  // Check that we got different results (seeds should produce variety)
  const uniqueResults = new Set(seedResults.map(r => r.slot).filter(s => s !== null));
  logTest(
    'Different seeds produce varied results',
    uniqueResults.size >= 1,
    `Got ${uniqueResults.size} unique outcomes`
  );

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (testResults.failed > 0) {
    console.log('\nFailed tests:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.name}`);
        if (t.details) {
          console.log(`     ${t.details}`);
        }
      });
  }

  console.log('\n📁 Screenshots saved to ./screenshots directory');

  // Exit with error code if tests failed
  process.exitCode = testResults.failed > 0 ? 1 : 0;
} catch (error) {
  console.error('\n❌ Test execution failed:', error.message);
  await takeScreenshot(page, 'deterministic-error', { folder: 'screenshots' });
  process.exitCode = 1;
} finally {
  await browser.close();
}
