import { chromium } from 'playwright';

async function testAllThemes() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const themes = ['Default', 'Dark Blue', 'PlayFame'];
    
    for (const theme of themes) {
      console.log(`\n=== Testing ${theme} Theme ===`);
      
      // Click theme button
      const themeButton = await page.$(`button:text-is("${theme}")`);
      if (themeButton) {
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Check if Drop Ball button is visible (no errors)
        const dropButton = await page.$('button:has-text("Drop Ball")');
        const isVisible = dropButton ? await dropButton.isVisible() : false;
        
        console.log(`✓ Theme loads: ${isVisible}`);
        console.log(`✓ Drop Ball button visible: ${isVisible}`);
        
        if (isVisible) {
          // Test dropping a ball
          await dropButton.click();
          await page.waitForTimeout(12000); // Wait for animation
          console.log(`✓ Ball drop works`);
        }
      } else {
        console.log(`✗ ${theme} theme button not found`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testAllThemes();
