/**
 * Core Plinko game E2E tests
 */

import { expect, test } from '@playwright/test';

test.describe('Plinko Game E2E', () => {
  test('should complete full game flow with deterministic seed', async ({ page }) => {
    await page.goto('/?seed=42');

    // Wait for start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

    // Click drop ball button
    await page.getByTestId('drop-ball-button').click();

    // Wait for ball to appear
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });

    // Wait for prize reveal (looking for status role which contains prize info)
    const prizeReveal = page.locator('[role="status"]').first();
    await expect(prizeReveal).toBeVisible({ timeout: 12000 });

    // Verify claim button appears (could be "Claim Prize" or "Try Again")
    const claimButton = page.getByTestId('claim-prize-button');
    await expect(claimButton).toBeVisible({ timeout: 2000 });

    // Click claim button
    await claimButton.click();

    // Should return to start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 3000 });
  });

  test('should maintain approximately 375px width', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('popup-container');
    await expect(container).toBeVisible();

    const boundingBox = await container.boundingBox();

    // Allow for browser rendering differences (within 20px tolerance)
    expect(boundingBox?.width).toBeGreaterThan(355);
    expect(boundingBox?.width).toBeLessThan(395);
  });

  test('should render prize slots', async ({ page }) => {
    await page.goto('/');

    // Verify slots are visible
    const slots = page.locator('[data-testid^="slot-"]');
    const slotCount = await slots.count();

    expect(slotCount).toBeGreaterThan(0);
    expect(slotCount).toBeLessThanOrEqual(6); // Should have 6 slots max
  });

  test('should support keyboard interaction', async ({ page }) => {
    await page.goto('/?seed=123');

    // Wait for start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

    // Button should be focusable and clickable with keyboard
    const button = page.getByTestId('drop-ball-button');
    await button.focus();
    await expect(button).toBeFocused();

    // Press Enter to start game
    await page.keyboard.press('Enter');

    // Animation should start
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });
  });

  test('should complete animation within timeout', async ({ page }) => {
    await page.goto('/?seed=999');

    await page.getByTestId('drop-ball-button').click();

    // Animation must complete in < 12 seconds
    const claimButton = page.getByTestId('claim-prize-button');
    await expect(claimButton).toBeVisible({ timeout: 12000 });
  });

  test('should show ball physics in action', async ({ page }) => {
    await page.goto('/?seed=42');
    await page.getByTestId('drop-ball-button').click();

    const ball = page.getByTestId('plinko-ball');
    await expect(ball).toBeVisible();

    // Ball should move down over time
    const initialBox = await ball.boundingBox();
    await page.waitForTimeout(1000);
    const laterBox = await ball.boundingBox();

    // Y position should increase (ball moves down)
    expect(laterBox?.y || 0).toBeGreaterThan(initialBox?.y || 0);
  });
});
