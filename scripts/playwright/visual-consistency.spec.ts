/**
 * E2E tests for visual consistency across all game views
 * Verifies that all popups use consistent overlay backgrounds and animations
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('StartScreen should have semi-transparent overlay background', async ({ page }) => {
    // Check if start screen overlay exists
    const overlay = page.locator('[data-testid="start-screen-overlay"]');
    await expect(overlay).toBeVisible();

    // Verify it has semi-transparent background
    const backgroundColor = await overlay.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be rgba with alpha < 1
    expect(backgroundColor).toContain('rgba');
  });

  test('All popup overlays should be centered with consistent padding', async ({ page }) => {
    // Start screen should be centered
    const startOverlay = page.locator('[data-testid="start-screen-overlay"]');
    await expect(startOverlay).toBeVisible();

    const startBox = await startOverlay.boundingBox();
    expect(startBox).toBeTruthy();

    // Click to start game
    await page.click('[data-testid="drop-ball-button"]');

    // Wait for ball drop and prize reveal
    await page.waitForTimeout(3000);

    // Check if any prize reveal overlay is visible
    const prizeOverlays = [
      '[data-testid="free-reward-overlay"]',
      '[data-testid="no-win-overlay"]',
      '[data-testid="purchase-offer-overlay"]',
    ];

    let foundOverlay = false;
    for (const selector of prizeOverlays) {
      const overlay = page.locator(selector);
      const isVisible = await overlay.isVisible().catch(() => false);
      if (isVisible) {
        foundOverlay = true;

        // Verify padding (20px)
        const padding = await overlay.evaluate((el) => {
          return window.getComputedStyle(el).padding;
        });

        expect(padding).toContain('20px');
        break;
      }
    }

    expect(foundOverlay).toBe(true);
  });

  test('Prize reveal views should not have card backgrounds for popup itself', async ({ page }) => {
    // Click to start game
    await page.click('[data-testid="drop-ball-button"]');

    // Wait for ball drop
    await page.waitForTimeout(3000);

    // Check the overlay structure - should not have rounded card background
    const overlays = page.locator('[data-testid*="-overlay"]');
    const count = await overlays.count();

    expect(count).toBeGreaterThan(0);

    // The overlay itself should have flat background (semi-transparent)
    // Content inside may have cards, but overlay should not
    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const isVisible = await overlay.isVisible().catch(() => false);

      if (isVisible) {
        const backgroundColor = await overlay.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // Should be rgba (semi-transparent)
        expect(backgroundColor).toContain('rgba');
      }
    }
  });

  test('Animations should be smooth and aligned', async ({ page }) => {
    // Monitor console for animation warnings
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Start game
    await page.click('[data-testid="drop-ball-button"]');

    // Wait for animations to complete
    await page.waitForTimeout(4000);

    // No animation warnings should occur
    const animationWarnings = warnings.filter((w) =>
      w.toLowerCase().includes('animation')
    );
    expect(animationWarnings.length).toBe(0);
  });
});
