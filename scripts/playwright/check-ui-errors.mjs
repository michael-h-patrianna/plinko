/**
 * Check UI for runtime errors
 */
import { chromium } from 'playwright';

async function checkUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log('⚠️  WARNING:', text);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ PAGE ERROR:', error.message);
  });

  try {
    console.log('🌐 Loading http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Wait a bit for React to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/ui-check.png' });
    console.log('📸 Screenshot saved to screenshots/ui-check.png');

    // Check if basic elements are visible
    const hasStartScreen = await page.locator('text="Play Now"').isVisible().catch(() => false);
    console.log('✓ Start screen visible:', hasStartScreen);

    console.log('\n📊 Summary:');
    console.log('  Errors:', errors.length);
    console.log('  Warnings:', warnings.length);

    if (errors.length > 0) {
      console.log('\n🔥 ERRORS FOUND:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

  } catch (error) {
    console.error('Failed to check UI:', error.message);
  } finally {
    await browser.close();
  }
}

checkUI();
