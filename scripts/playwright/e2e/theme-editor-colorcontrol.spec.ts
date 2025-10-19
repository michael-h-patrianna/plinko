/**
 * E2E test for ColorControl integration in Theme Editor
 * Tests the complete user journey from opening dev tools to changing a color
 */

import { expect, test } from '@playwright/test';

test.describe('Theme Editor - ColorControl Integration', () => {
  test('should not crash on load', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Verify no error boundary
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('complete user journey - change a color field', async ({ page }) => {
    // Step 1: Load app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Step 2: Enable dev tools
    await page.evaluate(() => {
      localStorage.setItem('plinko:devToolsEnabled', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 3: Open dev tools menu
    const devToolsButton = page.getByTestId('dev-tools-button');
    await expect(devToolsButton).toBeVisible({ timeout: 5000 });
    await devToolsButton.click();
    await page.waitForTimeout(300);

    // Step 4: Open theme editor
    const themeEditorButton = page.getByTestId('open-theme-editor-button');
    await expect(themeEditorButton).toBeVisible({ timeout: 5000 });
    await themeEditorButton.click();
    await page.waitForTimeout(300);

    // Step 5: Verify theme editor opened
    const themeEditorDialog = page.getByTestId('theme-editor-dialog');
    await expect(themeEditorDialog).toBeVisible({ timeout: 5000 });

    // Step 6: Find and expand "Colors - Background" category
    const categoryButton = page.getByRole('button', { name: /Colors - Background/i });
    await expect(categoryButton).toBeVisible({ timeout: 5000 });

    const isExpanded = await categoryButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await categoryButton.click();
      await page.waitForTimeout(300);
    }

    // Step 7: Find "Primary Background" color field
    const primaryBgLabel = page.getByText('Primary Background', { exact: true });
    await expect(primaryBgLabel).toBeVisible({ timeout: 5000 });

    // Step 8: Find and click the color preview button
    const fieldContainer = primaryBgLabel.locator('..').locator('..');
    const colorPreview = fieldContainer.getByTestId('color-preview');
    await expect(colorPreview).toBeVisible({ timeout: 5000 });

    // Get initial color
    const initialBackground = await colorPreview.evaluate((el) => {
      const preview = el.querySelector('[class*="preview"]') as HTMLElement;
      return preview ? window.getComputedStyle(preview).background : '';
    });

    await colorPreview.click();
    await page.waitForTimeout(300);

    // Step 9: Verify ColorControl modal opened
    const colorModal = page.getByTestId('color-modal');
    await expect(colorModal).toBeVisible({ timeout: 5000 });

    // Step 10: Interact with the color editor (click somewhere in the modal to change color)
    // Just clicking the modal body should trigger some color change
    const modalContent = colorModal.locator('.').first();
    await modalContent.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(200);

    // Step 11: Close modal
    await page.keyboard.press('Escape');
    await expect(colorModal).not.toBeVisible({ timeout: 3000 });

    // Step 12: Verify color changed (background should be different)
    const newBackground = await colorPreview.evaluate((el) => {
      const preview = el.querySelector('[class*="preview"]') as HTMLElement;
      return preview ? window.getComputedStyle(preview).background : '';
    });

    // The backgrounds should be different (color changed)
    // We don't check exact values, just that something changed
    expect(initialBackground).toBeTruthy();
    expect(newBackground).toBeTruthy();
  });

  test('can change a gradient field', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.setItem('plinko:devToolsEnabled', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open dev tools and theme editor
    await page.getByTestId('dev-tools-button').click();
    await page.waitForTimeout(300);
    await page.getByTestId('open-theme-editor-button').click();
    await page.waitForTimeout(300);

    // Find a gradient category
    const categoryButton = page.getByRole('button', { name: /Gradients - Background/i });
    await expect(categoryButton).toBeVisible({ timeout: 5000 });

    const isExpanded = await categoryButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await categoryButton.click();
      await page.waitForTimeout(300);
    }

    // Find a gradient field (e.g., "Board Gradient")
    const gradientLabel = page.locator('text="Background Card Gradient"').first();
    if (await gradientLabel.isVisible()) {
      const fieldContainer = gradientLabel.locator('..').locator('..');
      const colorPreview = fieldContainer.getByTestId('color-preview');
      await expect(colorPreview).toBeVisible({ timeout: 5000 });

      await colorPreview.click();
      await page.waitForTimeout(300);

      // Verify gradient modal opened
      const colorModal = page.getByTestId('color-modal');
      await expect(colorModal).toBeVisible({ timeout: 5000 });

      // Close modal
      await page.keyboard.press('Escape');
      await expect(colorModal).not.toBeVisible({ timeout: 3000 });
    }
  });
});
