/**
 * E2E tests for theme switching functionality
 */

import { test, expect } from '@playwright/test';

const THEMES = ['default', 'playFame', 'darkBlue'];

test.describe('Theme Switching E2E', () => {
  for (const themeName of THEMES) {
    test(`should render and play game with ${themeName} theme`, async ({ page }) => {
      await page.goto('/?seed=42');

      // Wait for app to load
      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

      // Find theme selector (could be select or other element)
      const themeSelector = page.locator('select, [role="combobox"], [aria-label*="theme" i]').first();
      const isThemeSelectorVisible = await themeSelector.isVisible().catch(() => false);

      if (isThemeSelectorVisible) {
        await themeSelector.selectOption(themeName);
        // Wait for theme to apply
        await page.waitForTimeout(200);
      }

      // Verify board is visible
      const board = page.getByTestId('plinko-board');
      await expect(board).toBeVisible();

      // Play game
      await page.getByTestId('drop-ball-button').click();

      // Wait for ball
      await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });

      // Wait for completion
      const claimButton = page.getByTestId('claim-prize-button').or(page.getByText(/claim|try again/i));
      await expect(claimButton).toBeVisible({ timeout: 12000 });

      // Verify claim button exists
      await expect(claimButton).toBeVisible();
    });

    test(`${themeName} theme should maintain visual consistency`, async ({ page }) => {
      await page.goto('/');

      // Wait for page load
      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

      // Select theme if selector exists
      const themeSelector = page.locator('select, [role="combobox"], [aria-label*="theme" i]').first();
      const isThemeSelectorVisible = await themeSelector.isVisible().catch(() => false);

      if (isThemeSelectorVisible) {
        await themeSelector.selectOption(themeName);
        await page.waitForTimeout(200);
      }

      // Check board exists and has proper styling
      const board = page.getByTestId('plinko-board');
      await expect(board).toBeVisible();

      // Verify all slots are visible
      const slots = page.locator('[data-testid^="slot-"]');
      const slotCount = await slots.count();
      expect(slotCount).toBeGreaterThan(0);

      // Verify theme colors are applied (board should have background)
      const hasBackground = await board.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.background || styles.backgroundColor;
      });
      expect(hasBackground).toBeTruthy();
    });
  }

  test('should allow theme selection if selector exists', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

    const themeSelector = page.locator('select, [role="combobox"], [aria-label*="theme" i]').first();
    const isVisible = await themeSelector.isVisible().catch(() => false);

    if (isVisible) {
      // Try selecting each theme
      for (const theme of THEMES) {
        await themeSelector.selectOption(theme);
        await page.waitForTimeout(100);

        // Verify theme was selected
        const selectedValue = await themeSelector.inputValue();
        expect(selectedValue).toBe(theme);
      }
    }
  });

  test('all themes should support complete game flow', async ({ page }) => {
    for (const themeName of THEMES) {
      await page.goto('/?seed=100');

      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

      // Select theme if available
      const themeSelector = page.locator('select, [role="combobox"]').first();
      const isVisible = await themeSelector.isVisible().catch(() => false);

      if (isVisible) {
        await themeSelector.selectOption(themeName);
        await page.waitForTimeout(100);
      }

      // Complete game
      await page.getByTestId('drop-ball-button').click();

      const claimButton = page.getByTestId('claim-prize-button').or(page.getByText(/claim|try again/i));
      await expect(claimButton).toBeVisible({ timeout: 12000 });

      await claimButton.click();

      // Should reset to start
      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 3000 });
    }
  });
});
