/**
 * DEV TOOLS PERSISTENCE TEST
 *
 * Verifies that dev menu settings persist across page refreshes
 *
 * Test scenarios:
 * 1. Change multiple dev settings
 * 2. Verify settings are saved to localStorage
 * 3. Refresh the page
 * 4. Verify settings are restored
 */

import { chromium } from 'playwright';

async function testDevToolsPersistence() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📋 Starting Dev Tools Persistence Test...\n');

    // Navigate to the app
    console.log('🌐 Loading app...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Open dev tools menu
    console.log('⚙️  Opening dev tools menu...');
    const gearButton = page.locator('button[aria-label="Dev Tools Settings"]');
    await gearButton.click();
    await page.waitForTimeout(500);

    // Change settings
    console.log('🔧 Changing settings...');

    // Change choice mechanic to "None (Classic)"
    console.log('  - Setting choice mechanic to "None (Classic)"');
    const noneButton = page.locator('button:has-text("None (Classic)")');
    await noneButton.click();
    await page.waitForTimeout(300);

    // Toggle music on
    console.log('  - Turning music ON');
    const musicButton = page.locator('button:has-text("Music")');
    await musicButton.click();
    await page.waitForTimeout(300);

    // Toggle show winner on
    console.log('  - Turning show winner ON');
    const showWinnerButton = page.locator('button:has-text("Show Winner")');
    await showWinnerButton.click();
    await page.waitForTimeout(300);

    // Change performance mode to "Power Saving"
    console.log('  - Setting performance mode to "Power Saving"');
    const powerSavingButton = page.locator('button:has-text("Power Saving")');
    await powerSavingButton.click();
    await page.waitForTimeout(300);

    // Verify localStorage
    console.log('\n💾 Checking localStorage...');
    const storedSettings = await page.evaluate(() => {
      const data = localStorage.getItem('plinko-dev-settings');
      return data ? JSON.parse(data) : null;
    });

    console.log('  Stored settings:', JSON.stringify(storedSettings, null, 2));

    // Verify settings are correct
    const expectedSettings = {
      choiceMechanic: 'none',
      showWinner: true,
      musicEnabled: true,
      performanceMode: 'power-saving',
    };

    let allCorrect = true;
    for (const [key, expectedValue] of Object.entries(expectedSettings)) {
      if (storedSettings[key] !== expectedValue) {
        console.log(`  ❌ ${key}: expected ${expectedValue}, got ${storedSettings[key]}`);
        allCorrect = false;
      } else {
        console.log(`  ✅ ${key}: ${expectedValue}`);
      }
    }

    if (!allCorrect) {
      throw new Error('Settings in localStorage do not match expected values');
    }

    // Refresh the page
    console.log('\n🔄 Refreshing page...');
    await page.reload();
    await page.waitForTimeout(2000);

    // Open dev tools menu again
    console.log('⚙️  Opening dev tools menu after refresh...');
    await gearButton.click();
    await page.waitForTimeout(500);

    // Verify settings are restored
    console.log('\n✓ Verifying restored settings...');

    // Check if "None (Classic)" is selected
    const noneButtonAfterRefresh = page.locator('button:has-text("None (Classic)")');
    const noneButtonClass = await noneButtonAfterRefresh.getAttribute('class');
    const isNoneSelected = noneButtonClass?.includes('shadow-md');
    console.log(`  ${isNoneSelected ? '✅' : '❌'} Choice mechanic: None (Classic)`);

    // Check if music is on
    const musicButtonAfterRefresh = page.locator('button:has-text("Music On")');
    const musicButtonCount = await musicButtonAfterRefresh.count();
    const isMusicOn = musicButtonCount > 0;
    console.log(`  ${isMusicOn ? '✅' : '❌'} Music: ON`);

    // Check if show winner is on
    const showWinnerButtonAfterRefresh = page.locator('button:has-text("Show Winner")');
    const showWinnerButtonClass = await showWinnerButtonAfterRefresh.getAttribute('class');
    const isShowWinnerOn = showWinnerButtonClass?.includes('shadow-md');
    console.log(`  ${isShowWinnerOn ? '✅' : '❌'} Show Winner: ON`);

    // Check if power saving is selected
    const powerSavingButtonAfterRefresh = page.locator('button:has-text("Power Saving")');
    const powerSavingButtonClass = await powerSavingButtonAfterRefresh.getAttribute('class');
    const isPowerSavingSelected = powerSavingButtonClass?.includes('shadow-md');
    console.log(`  ${isPowerSavingSelected ? '✅' : '❌'} Performance: Power Saving`);

    if (isNoneSelected && isMusicOn && isShowWinnerOn && isPowerSavingSelected) {
      console.log('\n✅ SUCCESS: All settings persisted correctly!');
    } else {
      throw new Error('Some settings were not restored correctly');
    }

    // Keep browser open for manual inspection
    console.log('\n👀 Keeping browser open for inspection...');
    console.log('   Press Ctrl+C to close');
    await new Promise(() => {}); // Keep alive
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await browser.close();
    process.exit(1);
  }
}

testDevToolsPersistence();
