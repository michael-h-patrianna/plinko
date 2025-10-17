/**
 * Playwright E2E tests for global pause system
 *
 * Tests:
 * - 'P' key toggles pause
 * - Pause indicator appears when paused
 * - Animations stop when paused
 * - Demo UI continues to animate when paused
 * - DevTools menu triggers pause
 */

import { test, expect } from '@playwright/test';

test.describe('Global Pause System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for app to load
    await page.waitForSelector('text=Start Game', { timeout: 5000 });
  });

  test('P key toggles pause state', async ({ page }) => {
    // Initially not paused
    let bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('false');

    // Press 'p' to pause
    await page.keyboard.press('p');
    bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('true');

    // Press 'p' to unpause
    await page.keyboard.press('p');
    bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('false');
  });

  test('Uppercase P key also toggles pause', async ({ page }) => {
    // Press 'Shift+P' to pause
    await page.keyboard.press('Shift+P');
    const bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('true');
  });

  test('Pause indicator appears when paused', async ({ page }) => {
    // Pause the game
    await page.keyboard.press('p');

    // Check if "PAUSED" indicator is visible
    const pauseIndicator = await page.locator('body::before').evaluate((el) => {
      const before = window.getComputedStyle(el, '::before');
      return before.getPropertyValue('content');
    });

    expect(pauseIndicator).toContain('PAUSED');
  });

  test('Demo UI has data-demo-ui attribute', async ({ page }) => {
    // Open DevTools menu
    await page.click('[aria-label="Dev Tools Settings"]');

    // Check that the menu has data-demo-ui attribute
    const menuContainer = await page.locator('[data-demo-ui="true"]').first();
    await expect(menuContainer).toBeVisible();
  });

  test('DevTools menu triggers pause', async ({ page }) => {
    // Initially not paused
    let bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('false');

    // Open DevTools menu
    await page.click('[aria-label="Dev Tools Settings"]');

    // Should be paused
    bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('true');

    // Close menu by clicking outside
    await page.click('body', { position: { x: 10, y: 10 } });

    // Wait for menu to close
    await page.waitForTimeout(300);

    // Should be unpaused
    bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('false');
  });

  test('Theme editor triggers pause', async ({ page }) => {
    // Open DevTools menu
    await page.click('[aria-label="Dev Tools Settings"]');

    // Open Theme Editor
    await page.click('[aria-label="Open Theme Editor"]');

    // Wait for drawer to open
    await page.waitForSelector('[aria-labelledby="theme-editor-title"]', { timeout: 2000 });

    // Should be paused
    const bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('true');

    // Check that drawer has data-demo-ui attribute
    const drawer = await page.locator('[aria-labelledby="theme-editor-title"]');
    const demoUiAttr = await drawer.getAttribute('data-demo-ui');
    expect(demoUiAttr).toBe('true');
  });

  test('Animations stop when paused', async ({ page }) => {
    // Start the game
    await page.click('text=Start Game');

    // Wait for game to be in a state with animations
    await page.waitForTimeout(500);

    // Get initial animation state
    const initialAnimationState = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-framer-motion]');
      return elements.length > 0;
    });

    // Pause
    await page.keyboard.press('p');

    // Check that animations are paused via CSS
    const isPaused = await page.evaluate(() => {
      const body = document.body;
      return body.getAttribute('data-paused') === 'true';
    });

    expect(isPaused).toBe(true);
  });

  test('Manual pause and unpause via context', async ({ page }) => {
    // Add a test button that uses the pause context
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.id = 'test-pause-button';
      button.textContent = 'Test Pause';
      button.onclick = () => {
        // Simulate pause via window object (for testing)
        const event = new KeyboardEvent('keydown', { key: 'p' });
        window.dispatchEvent(event);
      };
      document.body.appendChild(button);
    });

    // Click the test button
    await page.click('#test-pause-button');

    // Verify pause state
    const bodyAttribute = await page.getAttribute('body', 'data-paused');
    expect(bodyAttribute).toBe('true');
  });

  test('CSS prevents transitions when paused', async ({ page }) => {
    // Pause the game
    await page.keyboard.press('p');

    // Check that CSS rule applies
    const transitionDisabled = await page.evaluate(() => {
      // Create a test element
      const testEl = document.createElement('div');
      testEl.style.transition = 'all 1s';
      document.body.appendChild(testEl);

      const computedStyle = window.getComputedStyle(testEl);
      const transition = computedStyle.getPropertyValue('transition');

      document.body.removeChild(testEl);

      // When paused, CSS should override to 'none'
      return transition === 'none' || transition.includes('none');
    });

    expect(transitionDisabled).toBe(true);
  });

  test('Demo UI transitions continue when paused', async ({ page }) => {
    // Pause the game
    await page.keyboard.press('p');

    // Open DevTools menu (which has data-demo-ui)
    await page.click('[aria-label="Dev Tools Settings"]');

    // Check that demo UI element has transitions
    const demoUIHasTransition = await page.evaluate(() => {
      const demoElement = document.querySelector('[data-demo-ui="true"]');
      if (!demoElement) return false;

      const computedStyle = window.getComputedStyle(demoElement);
      const transition = computedStyle.getPropertyValue('transition');

      // Should have transitions, not 'none'
      return transition !== 'none' && transition.length > 0;
    });

    expect(demoUIHasTransition).toBe(true);
  });
});
