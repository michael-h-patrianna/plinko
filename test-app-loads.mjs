import { chromium } from 'playwright';

async function testAppLoads() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Testing if app loads...\n');

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Check basic page structure
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check if body exists
    const hasBody = await page.evaluate(() => document.body !== null);
    console.log(`Body exists: ${hasBody}`);

    // Check for any visible content
    const textContent = await page.evaluate(() => document.body.textContent?.trim().substring(0, 100));
    console.log(`Text content: ${textContent || 'None'}`);

    // Look for key elements
    const elements = await page.evaluate(() => {
      return {
        hasThemeSelector: document.querySelector('select[aria-label="Select theme"]') !== null,
        hasViewportSelector: document.querySelector('select[aria-label="Select viewport"]') !== null,
        hasStartButton: document.querySelector('button') !== null,
        hasTitle: document.querySelector('h1, h2') !== null,
        hasPopup: document.querySelector('[class*="popup"], [class*="Popup"]') !== null,
        allSelectorsPresent: document.querySelectorAll('select').length,
        allButtonsPresent: document.querySelectorAll('button').length,
        allDivsPresent: document.querySelectorAll('div').length,
      };
    });

    console.log('\nElements found:');
    console.log(`  Theme selector: ${elements.hasThemeSelector}`);
    console.log(`  Viewport selector: ${elements.hasViewportSelector}`);
    console.log(`  Start button: ${elements.hasStartButton}`);
    console.log(`  Title: ${elements.hasTitle}`);
    console.log(`  Popup container: ${elements.hasPopup}`);
    console.log(`  Total selects: ${elements.allSelectorsPresent}`);
    console.log(`  Total buttons: ${elements.allButtonsPresent}`);
    console.log(`  Total divs: ${elements.allDivsPresent}`);

    // Check for errors
    if (errors.length > 0) {
      console.log('\n❌ Console errors found:');
      errors.forEach(err => console.log(`  ${err}`));
    } else {
      console.log('\n✅ No console errors');
    }

    // Take screenshot
    await page.screenshot({ path: 'app-state.png', fullPage: true });
    console.log('\nScreenshot saved as app-state.png');

    // Check React DevTools if available
    const hasReact = await page.evaluate(() => {
      return window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    });
    console.log(`\nReact detected: ${hasReact ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAppLoads();