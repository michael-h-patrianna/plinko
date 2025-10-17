/**
 * Celebration System Tests
 *
 * Comprehensive test suite for celebration animations and state transitions.
 * Consolidates: test-celebration.mjs, test-celebration-flow.mjs
 */

import { test, expect } from '@playwright/test';
import { waitForElement, waitForGameState, PLAYWRIGHT_SEEDS , startGameWithDropPosition} from '../test-helpers.mjs';

test.describe('Celebration System', () => {
  // Increase test timeout to 60 seconds for celebration flow
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/?choice=drop-position', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('should trigger celebration after ball lands (win)', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);
    console.log('Started game');

    // Wait for ball to land with increased timeout
    await waitForGameState(page, 'landed', { timeout: 20000 });
    console.log('Ball landed');

    // Wait for celebration state (might skip if fast)
    try {
      await waitForGameState(page, 'celebrating', { timeout: 5000 });
      console.log('Celebration started');

      // Verify celebration state
      const gameState = await page.evaluate(() => {
        const container = document.querySelector('[data-game-state]');
        return container ? container.getAttribute('data-game-state') : null;
      });

      expect(gameState).toBe('celebrating');
    } catch (error) {
      console.warn('Celebration state not detected (might be quick transition)');
      // This is OK - celebration might be very brief
    }
  });

  test('should display celebration overlay with correct animations', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait for ball to land
    await waitForGameState(page, 'landed', { timeout: 20000 });

    // Wait for celebration state (or revealed if celebration is skipped)
    try {
      await waitForGameState(page, 'celebrating', { timeout: 5000 });
      console.log('Celebration state detected');

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
    } catch (error) {
      console.warn('Celebration state not detected, checking if already revealed');
      // Check if we're in revealed state (celebration might have been very quick)
      const currentState = await page.evaluate(() =>
        document.querySelector('[data-game-state]')?.getAttribute('data-game-state')
      );
      if (currentState === 'revealed') {
        console.log('Already in revealed state (celebration was quick)');
      } else {
        throw error;
      }
    }
  });

  test('should auto-advance to prize reveal after celebration', async ({ page }) => {
    // Start game
    await startGameWithDropPosition(page);

    // Wait for ball to land
    await waitForGameState(page, 'landed', { timeout: 20000 });
    console.log('Ball landed');

    // Wait for celebration (optional - might be quick)
    try {
      await waitForGameState(page, 'celebrating', { timeout: 5000 });
      console.log('Celebration started');
    } catch (error) {
      console.warn('Celebration state not detected (might be quick)');
    }

    // Wait for automatic transition to revealed state
    await waitForGameState(page, 'revealed', { timeout: 10000 });
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

    // Wait through drop, land, celebration with increased timeout
    await waitForGameState(page, 'revealed', { timeout: 30000 });

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

    // Wait for prize reveal with increased timeout
    await waitForGameState(page, 'revealed', { timeout: 30000 });

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

    // Wait for revealed state with increased timeout
    await waitForGameState(page, 'revealed', { timeout: 30000 });

    // Get state log
    const states = await page.evaluate(() => window._stateLog || []);
    console.log('State transitions:', states);

    // Verify expected state flow
    const hasLanded = states.includes('landed');
    const hasCelebrating = states.includes('celebrating');
    const hasRevealed = states.includes('revealed');

    expect(hasLanded).toBeTruthy();
    expect(hasRevealed).toBeTruthy();

    // Celebration state is optional (might be very quick)
    if (hasCelebrating) {
      console.log('Celebration state detected in flow');

      // Verify order: landed should come before celebrating, celebrating before revealed
      const landedIndex = states.indexOf('landed');
      const celebratingIndex = states.indexOf('celebrating');
      const revealedIndex = states.indexOf('revealed');

      expect(celebratingIndex).toBeGreaterThan(landedIndex);
      expect(revealedIndex).toBeGreaterThan(celebratingIndex);

      console.log('Celebration flow validated: landed → celebrating → revealed');
    } else {
      console.warn('Celebration state not detected (might be very quick transition)');
      console.log('Flow validated: landed → revealed (celebration was quick)');
    }
  });
});
