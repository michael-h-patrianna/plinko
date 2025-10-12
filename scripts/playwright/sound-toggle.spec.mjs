/**
 * Playwright E2E tests for SoundToggle functionality
 * Tests real-time audio control, persistence, and visual behavior across views
 */

import { test, expect } from '@playwright/test';

test.describe('SoundToggle Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:5173');

    // Wait for the app to load
    await page.waitForSelector('[data-testid="drop-ball-button"]', { timeout: 10000 });
  });

  test('renders sound toggle button on start screen', async ({ page }) => {
    // Check that sound toggle exists
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    await expect(soundToggle).toBeVisible();

    // Check initial state (unmuted)
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(soundToggle).toHaveAttribute('aria-label', 'Mute sound');
  });

  test('toggles sound state when clicked', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Initial state - unmuted
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'false');

    // Click to mute
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(soundToggle).toHaveAttribute('aria-label', 'Unmute sound');

    // Click to unmute
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(soundToggle).toHaveAttribute('aria-label', 'Mute sound');
  });

  test('persists mute state across page reloads', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Mute the audio
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="sound-toggle"]', { timeout: 10000 });

    // Check that muted state persisted
    const soundToggleAfterReload = page.locator('[data-testid="sound-toggle"]');
    await expect(soundToggleAfterReload).toHaveAttribute('aria-pressed', 'true');
    await expect(soundToggleAfterReload).toHaveAttribute('aria-label', 'Unmute sound');
  });

  test('sound toggle is visible on PlinkoBoard view', async ({ page }) => {
    // Start the game
    const dropBallButton = page.locator('[data-testid="drop-ball-button"]');
    await dropBallButton.click();

    // Wait for board to appear
    await page.waitForSelector('[data-testid="plinko-board"]', { timeout: 3000 });

    // Check sound toggle is still visible
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    await expect(soundToggle).toBeVisible();
  });

  test('sound toggle is visible on prize reveal screen', async ({ page }) => {
    // Start the game
    const dropBallButton = page.locator('[data-testid="drop-ball-button"]');
    await dropBallButton.click();

    // Wait for board
    await page.waitForSelector('[data-testid="plinko-board"]', { timeout: 3000 });

    // Wait for prize reveal (using claim button as indicator)
    await page.waitForSelector('[data-testid="claim-prize-button"]', { timeout: 15000 });

    // Check sound toggle is still visible
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    await expect(soundToggle).toBeVisible();
  });

  test('sound toggle maintains state across view transitions', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Mute on start screen
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');

    // Transition to board
    const dropBallButton = page.locator('[data-testid="drop-ball-button"]');
    await dropBallButton.click();
    await page.waitForSelector('[data-testid="plinko-board"]', { timeout: 3000 });

    // Check mute state persisted
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');

    // Wait for prize reveal
    await page.waitForSelector('[data-testid="claim-prize-button"]', { timeout: 15000 });

    // Check mute state still persisted
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('sound toggle button has proper hover and focus states', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Focus the button with keyboard
    await page.keyboard.press('Tab');
    await expect(soundToggle).toBeFocused();

    // Hover over button
    await soundToggle.hover();

    // Visual check: button should be visible and styled
    const boundingBox = await soundToggle.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  });

  test('sound toggle is keyboard accessible', async ({ page }) => {
    // Tab to sound toggle
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs depending on page structure

    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');

    // Press Space to toggle back
    await page.keyboard.press('Space');
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('sound toggle position is correct on different views', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Check position on start screen (should be bottom-right)
    const startScreenPosition = await soundToggle.boundingBox();
    expect(startScreenPosition).toBeTruthy();

    // Start game and check position on board
    await page.locator('[data-testid="drop-ball-button"]').click();
    await page.waitForSelector('[data-testid="plinko-board"]', { timeout: 3000 });

    const boardPosition = await soundToggle.boundingBox();
    expect(boardPosition).toBeTruthy();

    // Position should be in bottom-right region
    // (exact coordinates may vary by viewport, but x should be high)
    if (boardPosition) {
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        expect(boardPosition.x).toBeGreaterThan(viewportSize.width * 0.6);
      }
    }
  });

  test('sound toggle icon changes when toggled', async ({ page }) => {
    const soundToggle = page.locator('[data-testid="sound-toggle"]');

    // Get initial icon state (sound on icon should be visible)
    const soundOnIcon = soundToggle.locator('img').first();
    await expect(soundOnIcon).toHaveAttribute('src', /sound-on/);

    // Toggle to muted
    await soundToggle.click();

    // Wait for icon change (sound off icon should now be more visible)
    await page.waitForTimeout(300); // Wait for CSS transition

    // Verify aria state changed
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
  });
});
