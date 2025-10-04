/**
 * End-to-end tests using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Plinko Game E2E', () => {
  test('should complete full game flow with deterministic seed', async ({ page }) => {
    // Navigate with deterministic seed
    await page.goto('/?seed=42');

    // Wait for start screen
    await expect(page.getByText('Plinko Popup')).toBeVisible();
    await expect(page.getByTestId('drop-ball-button')).toBeVisible();

    // Verify prize table is displayed
    await expect(page.getByText(/Available Prizes/i)).toBeVisible();

    // Click drop ball button
    await page.getByTestId('drop-ball-button').click();

    // Wait for ball to appear and animation to start
    await expect(page.getByTestId('plinko-ball')).toBeVisible();

    // Wait for reveal screen (ball drop animation)
    // Set generous timeout for animation
    await expect(page.getByRole('heading', { name: /Congratulations/i })).toBeVisible({
      timeout: 10000
    });

    // Verify prize reveal shows a prize
    await expect(page.getByTestId('claim-prize-button')).toBeVisible();

    // Take screenshot of reveal screen
    await page.screenshot({ path: 'e2e/screenshots/prize-reveal.png' });

    // Click claim button
    await page.getByTestId('claim-prize-button').click();

    // Should return to start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible();
  });

  test('should maintain 375px width', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('popup-container');
    await expect(container).toBeVisible();

    const boundingBox = await container.boundingBox();
    expect(boundingBox?.width).toBe(375);
  });

  test('should render all prizes in prize table', async ({ page }) => {
    await page.goto('/');

    // Use the Available Prizes section to scope selectors
    const prizeList = page.locator('text=Available Prizes').locator('..');
    await expect(prizeList.getByText('$500 Bonus', { exact: true })).toBeVisible();
    await expect(prizeList.getByText('$250 Bonus', { exact: true })).toBeVisible();
    await expect(prizeList.getByText('$50 Bonus', { exact: true })).toBeVisible();
    await expect(prizeList.getByText('25 Free Spins', { exact: true })).toBeVisible();
    await expect(prizeList.getByText('10 Free Spins', { exact: true })).toBeVisible();
    await expect(prizeList.getByText('5 Free Spins', { exact: true })).toBeVisible();
  });

  test('should have keyboard accessibility', async ({ page }) => {
    await page.goto('/?seed=123');

    // Wait for start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible();

    // Tab to button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Animation should start
    await expect(page.getByTestId('plinko-ball')).toBeVisible();

    // Wait for reveal
    await expect(page.getByTestId('claim-prize-button')).toBeVisible({
      timeout: 10000
    });

    // Claim button should be focused
    const claimButton = page.getByTestId('claim-prize-button');
    await expect(claimButton).toBeFocused();
  });

  test('should complete animation within timeout', async ({ page }) => {
    await page.goto('/?seed=999');

    await page.getByTestId('drop-ball-button').click();

    // Animation must complete in < 8 seconds
    await expect(page.getByRole('heading', { name: /Congratulations/i })).toBeVisible({
      timeout: 8000
    });
  });
});
