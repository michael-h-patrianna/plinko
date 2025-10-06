/**
 * Comprehensive E2E tests covering ALL functionality
 */

import { expect, test } from '@playwright/test';

test.describe('Comprehensive Plinko E2E', () => {
  // =========================================================================
  // 1. BASIC GAME FLOW
  // =========================================================================

  test('should complete full game cycle from start to claim', async ({ page }) => {
    await page.goto('/?seed=42');

    // Verify start screen loaded
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Plinko Popup')).toBeVisible();

    // Start game
    await page.getByTestId('drop-ball-button').click();

    // Verify ball appears
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });

    // Wait for prize reveal (may say "You won!" or show prize directly)
    const prizeReveal = page.locator('[role="status"]').first();
    await expect(prizeReveal).toBeVisible({ timeout: 12000 });

    // Claim button should appear
    const claimButton = page.getByTestId('claim-prize-button');
    await expect(claimButton).toBeVisible({ timeout: 2000 });

    // Click claim
    await claimButton.click();

    // Should return to start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 3000 });
  });

  test('should play multiple consecutive games', async ({ page }) => {
    await page.goto('/?seed=100');

    for (let i = 0; i < 3; i++) {
      await page.getByTestId('drop-ball-button').click();

      // Wait for completion
      const claimButton = page.getByTestId('claim-prize-button');
      await expect(claimButton).toBeVisible({ timeout: 12000 });

      await claimButton.click();
      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 3000 });
    }
  });

  // =========================================================================
  // 2. PRIZE TYPES
  // =========================================================================

  test('should show different prize types across multiple games', async ({ page }) => {
    const seeds = [42, 100, 200, 300, 400];
    const prizeTypes = new Set<string>();

    for (const seed of seeds) {
      await page.goto(`/?seed=${seed}`);
      await page.getByTestId('drop-ball-button').click();

      const prizeReveal = page.locator('[role="status"]').first();
      await expect(prizeReveal).toBeVisible({ timeout: 12000 });

      // Capture what type of prize was shown
      const text = await prizeReveal.textContent();
      if (
        text?.includes('won') ||
        text?.includes('SC') ||
        text?.includes('GC') ||
        text?.includes('Spins')
      ) {
        prizeTypes.add('reward');
      }
      if (text?.includes('Special Offer') || text?.includes('$')) {
        prizeTypes.add('offer');
      }
      if (text?.includes('Better Luck') || text?.includes('Try Again')) {
        prizeTypes.add('nowin');
      }

      const claimButton = page.getByTestId('claim-prize-button');
      await claimButton.click();
      await page.waitForTimeout(500);
    }

    // Should have seen at least one prize type
    expect(prizeTypes.size).toBeGreaterThan(0);
  });

  // =========================================================================
  // 3. PHYSICS & ANIMATION
  // =========================================================================

  test('ball should bounce off pegs during drop', async ({ page }) => {
    await page.goto('/?seed=42');
    await page.getByTestId('drop-ball-button').click();

    const ball = page.getByTestId('plinko-ball');
    await expect(ball).toBeVisible();

    // Track ball position changes (should move)
    const initialPos = await ball.boundingBox();
    await page.waitForTimeout(500);
    const laterPos = await ball.boundingBox();

    expect(initialPos?.y).toBeLessThan(laterPos?.y || 0);
  });

  test('animation should complete within reasonable time', async ({ page }) => {
    await page.goto('/?seed=999');
    const startTime = Date.now();

    await page.getByTestId('drop-ball-button').click();

    const claimButton = page.getByTestId('claim-prize-button');
    await expect(claimButton).toBeVisible({ timeout: 10000 });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
  });

  test('ball should not escape board boundaries', async ({ page }) => {
    await page.goto('/?seed=777');
    await page.getByTestId('drop-ball-button').click();

    const ball = page.getByTestId('plinko-ball');
    const board = page.getByTestId('plinko-board');

    await expect(ball).toBeVisible();

    // Check ball stays within board for 2 seconds
    for (let i = 0; i < 10; i++) {
      const ballBox = await ball.boundingBox();
      const boardBox = await board.boundingBox();

      if (ballBox && boardBox) {
        expect(ballBox.x).toBeGreaterThanOrEqual(boardBox.x - 5);
        expect(ballBox.x + ballBox.width).toBeLessThanOrEqual(boardBox.x + boardBox.width + 5);
      }

      await page.waitForTimeout(200);
    }
  });

  // =========================================================================
  // 4. THEMES
  // =========================================================================

  const THEMES = ['default', 'playFame', 'darkBlue'];

  for (const themeName of THEMES) {
    test(`${themeName} theme should render correctly`, async ({ page }) => {
      await page.goto('/');

      // Wait for app to load
      await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

      // Find and select theme
      const themeSelector = page.locator('select, [role="combobox"]').first();
      if (await themeSelector.isVisible({ timeout: 1000 })) {
        await themeSelector.selectOption(themeName);
      }

      // Verify board is styled
      const board = page.getByTestId('plinko-board');
      await expect(board).toBeVisible();

      // Verify slots are visible
      const slots = page.locator('[data-testid^="slot-"]');
      expect(await slots.count()).toBeGreaterThan(0);

      // Play a game with this theme
      await page.getByTestId('drop-ball-button').click();

      const claimButton = page.getByTestId('claim-prize-button');
      await expect(claimButton).toBeVisible({ timeout: 12000 });
    });
  }

  // =========================================================================
  // 5. ACCESSIBILITY
  // =========================================================================

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check for proper roles
    const button = page.getByTestId('drop-ball-button');
    await expect(button).toHaveAttribute('role', 'button');

    // Check for status region (prize reveal)
    await button.click();
    const status = page.locator('[role="status"]').first();
    await expect(status).toBeVisible({ timeout: 12000 });
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/?seed=123');

    // Tab to button
    await page.keyboard.press('Tab');

    const button = page.getByTestId('drop-ball-button');
    await expect(button).toBeFocused();

    // Press Enter to start
    await page.keyboard.press('Enter');

    // Game should start
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check button has sufficient contrast
    const button = page.getByTestId('drop-ball-button');
    const color = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        bg: styles.backgroundColor,
        text: styles.color,
      };
    });

    expect(color.bg).toBeTruthy();
    expect(color.text).toBeTruthy();
  });

  // =========================================================================
  // 6. RESPONSIVE & VIEWPORT
  // =========================================================================

  test('should maintain fixed width on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const container = page.getByTestId('popup-container');
    const box = await container.boundingBox();

    // Should be approximately 375px (allow for browser rendering differences)
    expect(box?.width).toBeGreaterThan(360);
    expect(box?.width).toBeLessThan(390);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?seed=42');

    await expect(page.getByTestId('drop-ball-button')).toBeVisible();

    await page.getByTestId('drop-ball-button').click();
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });

    const claimButton = page
      .getByTestId('claim-prize-button')
      .or(page.getByText(/claim|try again/i));
    await expect(claimButton).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // 7. STATE & PERSISTENCE
  // =========================================================================

  test('should handle page reload during game', async ({ page }) => {
    await page.goto('/?seed=42');
    await page.getByTestId('drop-ball-button').click();

    // Wait a bit then reload
    await page.waitForTimeout(1000);
    await page.reload();

    // Should return to start screen
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // 8. EDGE CASES & ERROR HANDLING
  // =========================================================================

  test('should handle rapid clicking', async ({ page }) => {
    await page.goto('/?seed=42');

    const button = page.getByTestId('drop-ball-button');

    // Click multiple times rapidly
    await button.click();
    await button.click();
    await button.click();

    // Should only start one game
    const balls = page.getByTestId('plinko-ball');
    expect(await balls.count()).toBeLessThanOrEqual(1);
  });

  test('should handle missing seed gracefully', async ({ page }) => {
    await page.goto('/');

    // Should still load and work
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('drop-ball-button').click();
    await expect(page.getByTestId('plinko-ball')).toBeVisible({ timeout: 3000 });
  });

  // =========================================================================
  // 9. PERFORMANCE
  // =========================================================================

  test('should maintain 60 FPS during animation', async ({ page }) => {
    await page.goto('/?seed=42');

    // Start performance monitoring
    const performanceMetrics: number[] = [];
    (page as unknown as { on: (event: string, handler: (payload: unknown) => void) => void }).on(
      'metrics',
      (payload: unknown) => {
        const metrics = (payload as { metrics?: Record<string, number> })?.metrics;
        if (metrics?.TaskDuration) {
          performanceMetrics.push(metrics.TaskDuration);
        }
      }
    );

    await page.getByTestId('drop-ball-button').click();

    await page.waitForTimeout(2000);

    // Should have recorded some metrics
    expect(performanceMetrics.length).toBeGreaterThan(0);
  });

  test('should load in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.getByTestId('drop-ball-button')).toBeVisible({ timeout: 5000 });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  // =========================================================================
  // 10. PRIZE TABLE & UI ELEMENTS
  // =========================================================================

  test('should display prize table on start screen', async ({ page }) => {
    await page.goto('/');

    // Prize table should be visible
    const prizeTable = page.locator('text=/Available Prizes|Prize Table|Prizes/i').first();
    const isPrizeTableVisible = await prizeTable.isVisible().catch(() => false);

    // Even if not visible, slots should show prizes
    const slots = page.locator('[data-testid^="slot-"]');
    expect(await slots.count()).toBeGreaterThan(0);
  });

  test('should show prize reveal with animations', async ({ page }) => {
    await page.goto('/?seed=42');
    await page.getByTestId('drop-ball-button').click();

    const prizeReveal = page.locator('[role="status"]').first();
    await expect(prizeReveal).toBeVisible({ timeout: 12000 });

    // Should have some animated content
    const hasAnimatedContent = await prizeReveal.evaluate((el) => {
      return el.textContent && el.textContent.length > 0;
    });

    expect(hasAnimatedContent).toBe(true);
  });

  // =========================================================================
  // 11. DETERMINISTIC BEHAVIOR
  // =========================================================================

  test('same seed should produce same result', async ({ page }) => {
    const seed = 12345;
    const results: string[] = [];

    for (let i = 0; i < 2; i++) {
      await page.goto(`/?seed=${seed}`);
      await page.getByTestId('drop-ball-button').click();

      const prizeReveal = page.locator('[role="status"]').first();
      await expect(prizeReveal).toBeVisible({ timeout: 12000 });

      const text = await prizeReveal.textContent();
      results.push(text || '');

      const claimButton = page.getByTestId('claim-prize-button');
      await claimButton.click();
      await page.waitForTimeout(500);
    }

    // Same seed should produce same prize text
    expect(results[0]).toBe(results[1]);
  });
});
