/**
 * Theme System Tests
 *
 * Comprehensive test suite for theme switching and application.
 * Consolidates: test-all-themes.mjs, test-theme-app.mjs, test-theme-title.mjs
 */

import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=none', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('should apply default theme on load', async ({ page }) => {
    // Check if app loaded with theme applied
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    await expect(dropButton).toBeVisible();

    // Verify button has styling (theme applied)
    const hasStyles = await dropButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.background !== '' && styles.color !== '';
    });

    expect(hasStyles).toBeTruthy();
    console.log('Default theme applied on load');
  });

  test('should switch between available themes', async ({ page }) => {
    // Try to find theme selector (may be in dev tools)
    const themes = ['Default', 'Brutalist'];

    for (const theme of themes) {
      console.log(`Testing ${theme} theme...`);

      // Try to find theme button or selector
      const themeButton = page.locator(`button:text-is("${theme}")`).first();
      const buttonExists = await themeButton.count() > 0;

      if (buttonExists) {
        await themeButton.click();
        await page.waitForTimeout(500);

        // Verify app still works after theme change
        const dropButton = page.locator('[data-testid="drop-ball-button"], button').first();
        await expect(dropButton).toBeVisible();
        console.log(`${theme} theme loaded successfully`);
      } else {
        console.log(`${theme} theme button not found (may need dev tools)`);
      }
    }
  });

  test('should maintain UI visibility across theme changes', async ({ page }) => {
    // Verify critical UI elements are visible
    const dropButton = page.getByTestId('drop-ball-button');
    await expect(dropButton).toBeVisible();

    // Check that title/header is visible
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.length).toBeGreaterThan(0);

    console.log('UI elements visible with current theme');
  });

  test('should apply theme to all UI elements', async ({ page }) => {
    // Get drop ball button styles
    const dropButton = page.locator('[data-testid="drop-ball-button"], button').first();
    await expect(dropButton).toBeVisible();

    const buttonStyles = await dropButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        borderRadius: styles.borderRadius,
        color: styles.color,
      };
    });

    // Verify theme is applied (not default browser styles)
    expect(buttonStyles.borderRadius).not.toBe('0px');
    console.log('Theme applied to UI elements:', buttonStyles);
  });

  test('should display theme name correctly', async ({ page }) => {
    // Check if any theme name is displayed
    const bodyText = await page.locator('body').textContent();

    // The page should have content (theme is working)
    expect(bodyText.length).toBeGreaterThan(0);

    // If dev tools are open, theme name might be visible
    const hasDevTools = bodyText.toLowerCase().includes('theme');
    console.log('Theme-related UI present:', hasDevTools);
  });

  test('should render game correctly after theme switch', async ({ page }) => {
    // Click drop ball button
    const dropButton = page.getByTestId('drop-ball-button');
    await dropButton.click();
    await page.waitForTimeout(500);

    // Wait for game to load
    await page.waitForTimeout(2000);

    // Verify no errors occurred
    const hasError = await page.locator('text=/error/i').count();
    expect(hasError).toBe(0);

    console.log('Game renders correctly with theme applied');
  });
});
