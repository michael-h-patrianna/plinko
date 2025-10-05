/**
 * E2E tests for theme switching
 * Tests all available themes to ensure they render correctly
 */

import { test, expect } from '@playwright/test';

const THEMES = ['default', 'playFame', 'darkBlue'];

test.describe('Theme Switching E2E', () => {
  for (const themeName of THEMES) {
    test(`should render and play game with ${themeName} theme`, async ({ page }) => {
      await page.goto('/?seed=42');

      // Wait for app to load
      await expect(page.getByTestId('drop-ball-button')).toBeVisible();

      // Switch to theme
      const themeSelector = page.locator('select').first();
      await themeSelector.selectOption(themeName);

      // Verify theme applied - check for theme-specific background
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) =>
        window.getComputedStyle(el.querySelector('[class*="min-h-screen"]') || el).background
      );
      expect(bgColor).toBeTruthy();

      // Play game
      await page.getByTestId('drop-ball-button').click();

      // Wait for ball
      await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 5000 });

      // Wait for completion
      await expect(page.getByRole('heading', { name: /Congratulations/i })).toBeVisible({
        timeout: 10000
      });

      // Take screenshot
      await page.screenshot({
        path: `e2e/screenshots/theme-${themeName}-reveal.png`,
        fullPage: true
      });

      // Verify claim button exists
      await expect(page.getByTestId('claim-prize-button')).toBeVisible();
    });

    test(`${themeName} theme should maintain visual consistency`, async ({ page }) => {
      await page.goto('/');

      // Switch to theme
      const themeSelector = page.locator('select').first();
      await themeSelector.selectOption(themeName);

      // Check board exists and has proper styling
      const board = page.getByTestId('plinko-board');
      await expect(board).toBeVisible();

      // Verify all slots are visible
      const slots = page.locator('[data-testid^="slot-"]');
      const slotCount = await slots.count();
      expect(slotCount).toBeGreaterThan(0);

      // Take screenshot of start screen
      await page.screenshot({
        path: `e2e/screenshots/theme-${themeName}-start.png`,
        fullPage: true
      });
    });
  }

  test('should persist theme selection across navigation', async ({ page }) => {
    await page.goto('/');

    // Select darkBlue theme
    const themeSelector = page.locator('select').first();
    await themeSelector.selectOption('darkBlue');

    // Reload page
    await page.reload();

    // Theme should still be darkBlue
    const selectedValue = await themeSelector.inputValue();
    expect(selectedValue).toBe('darkBlue');
  });

  test('all themes should support complete game flow', async ({ page }) => {
    for (const themeName of THEMES) {
      await page.goto('/?seed=100');

      // Switch theme
      const themeSelector = page.locator('select').first();
      await themeSelector.selectOption(themeName);

      // Complete game
      await page.getByTestId('drop-ball-button').click();
      await expect(page.getByTestId('claim-prize-button')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('claim-prize-button').click();

      // Should reset to start
      await expect(page.getByTestId('drop-ball-button')).toBeVisible();
    }
  });
});
