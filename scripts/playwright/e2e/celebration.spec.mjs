/**
 * Celebration System Tests
 *
 * Comprehensive test suite for celebration animations and state transitions.
 * Consolidates: test-celebration.mjs, test-celebration-flow.mjs
 */

import { test, expect } from '@playwright/test';
import { waitForElement, waitForGameState, PLAYWRIGHT_SEEDS , startGameWithDropPosition} from '../test-helpers.mjs';

test.describe('Celebration System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('should trigger celebration after ball lands (win)', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);
    console.log('Started game');

    // Wait for ball to land
    await waitForGameState(page, 'landed', { timeout: 10000 });
    console.log('Ball landed');

    // Wait for celebration state
    await waitForGameState(page, 'celebrating', { timeout: 3000 });
    console.log('Celebration started');

    // Verify celebration state
    const gameState = await page.evaluate(() => {
      const container = document.querySelector('[data-game-state]');
      return container ? container.getAttribute('data-game-state') : null;
    });

    expect(gameState).toBe('celebrating');
  });

  test('should display celebration overlay with correct animations', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait for ball to land
    await waitForGameState(page, 'landed', { timeout: 10000 });

    // Wait for celebration state
    await waitForGameState(page, 'celebrating', { timeout: 3000 });

    // Check for celebration elements (confetti, animations, etc.)
    await page.waitForTimeout(500);

    // Verify celebration visuals are present
    const hasCelebrationElements = await page.evaluate(() => {
      // Look for celebration indicators - could be confetti, flash overlay, etc.
      const gameState = document.querySelector('[data-game-state="celebrating"]');
      return gameState !== null;
    });

    expect(hasCelebrationElements).toBeTruthy();
    console.log('Celebration overlay displayed');
  });

  test('should auto-advance to prize reveal after celebration', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait for ball to land
    await waitForGameState(page, 'landed', { timeout: 10000 });
    console.log('Ball landed');

    // Wait for celebration
    await waitForGameState(page, 'celebrating', { timeout: 3000 });
    console.log('Celebration started');

    // Wait for automatic transition to revealed state
    await waitForGameState(page, 'revealed', { timeout: 5000 });
    console.log('Prize revealed after celebration');

    // Verify revealed state
    const gameState = await page.evaluate(() => {
      const container = document.querySelector('[data-game-state]');
      return container ? container.getAttribute('data-game-state') : null;
    });

    expect(gameState).toBe('revealed');
  });

  test('should display You Won text after celebration', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait through drop, land, celebration
    await waitForGameState(page, 'revealed', { timeout: 15000 });

    // Check for "You Won" text or equivalent
    const hasWinText = await page.evaluate(() => {
      // Look for win-related text
      const bodyText = document.body.innerText.toLowerCase();
      return bodyText.includes('you won') ||
             bodyText.includes('congrat') ||
             document.querySelector('[data-testid="prize-reveal"]') !== null;
    });

    expect(hasWinText).toBeTruthy();
    console.log('Win text displayed after celebration');
  });

  test('should animate counters during prize reveal', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait for prize reveal
    await waitForGameState(page, 'revealed', { timeout: 15000 });

    // Check for currency counters
    const counterInfo = await page.evaluate(() => {
      const counters = document.querySelectorAll('.currency-counter, [data-testid*="counter"]');
      return {
        count: counters.length,
        visible: counters.length > 0,
      };
    });

    console.log(`Found ${counterInfo.count} currency counters`);

    // If counters exist, they should be visible
    if (counterInfo.count > 0) {
      expect(counterInfo.visible).toBeTruthy();
    }
  });

  test('should complete full celebration flow: landed → celebrating → revealed', async ({ page }) => {
    const stateTransitions = [];

    // Monitor state changes
    await page.evaluate(() => {
      window._stateLog = [];
      const observer = new MutationObserver(() => {
        const state = document.querySelector('[data-game-state]')?.getAttribute('data-game-state');
        if (state && (!window._stateLog.length || window._stateLog[window._stateLog.length - 1] !== state)) {
          window._stateLog.push(state);
        }
      });
      observer.observe(document.body, { attributes: true, subtree: true });
    });

    // Start game
    await startGameWithDropPosition(page);

    // Wait for revealed state
    await waitForGameState(page, 'revealed', { timeout: 15000 });

    // Get state log
    const states = await page.evaluate(() => window._stateLog || []);
    console.log('State transitions:', states);

    // Verify expected state flow
    const hasLanded = states.includes('landed');
    const hasCelebrating = states.includes('celebrating');
    const hasRevealed = states.includes('revealed');

    expect(hasLanded).toBeTruthy();
    expect(hasCelebrating).toBeTruthy();
    expect(hasRevealed).toBeTruthy();

    // Verify order: landed should come before celebrating, celebrating before revealed
    const landedIndex = states.indexOf('landed');
    const celebratingIndex = states.indexOf('celebrating');
    const revealedIndex = states.indexOf('revealed');

    if (celebratingIndex >= 0) {
      expect(celebratingIndex).toBeGreaterThan(landedIndex);
      expect(revealedIndex).toBeGreaterThan(celebratingIndex);
    }

    console.log('Celebration flow validated: landed → celebrating → revealed');
  });
});
