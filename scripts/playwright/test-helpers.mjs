/**
 * Playwright test helpers for deterministic testing
 * Provides utilities to replace random waits with deterministic checks
 */

/**
 * Wait for element to be visible with deterministic polling
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {object} options - Wait options
 * @returns {Promise<boolean>} True if element is visible
 */
export async function waitForElement(page, selector, options = {}) {
  const { timeout = 10000, pollInterval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const isVisible = await page.locator(selector).isVisible();
      if (isVisible) {
        return true;
      }
    } catch (error) {
      // Element not found, continue polling
    }
    await page.waitForTimeout(pollInterval);
  }

  throw new Error(`Element ${selector} not visible after ${timeout}ms`);
}

/**
 * Wait for animation to complete by checking element position stability
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {object} options - Wait options
 * @returns {Promise<void>}
 */
export async function waitForAnimationComplete(page, selector, options = {}) {
  const { maxChecks = 30, checkInterval = 100, tolerance = 0.5 } = options;

  let previousPosition = null;
  let stableCount = 0;
  const requiredStableChecks = 3;

  for (let i = 0; i < maxChecks; i++) {
    try {
      const boundingBox = await page.locator(selector).boundingBox();

      if (!boundingBox) {
        await page.waitForTimeout(checkInterval);
        continue;
      }

      if (previousPosition) {
        const dx = Math.abs(boundingBox.x - previousPosition.x);
        const dy = Math.abs(boundingBox.y - previousPosition.y);

        if (dx < tolerance && dy < tolerance) {
          stableCount++;
          if (stableCount >= requiredStableChecks) {
            return; // Animation complete
          }
        } else {
          stableCount = 0;
        }
      }

      previousPosition = boundingBox;
      await page.waitForTimeout(checkInterval);
    } catch (error) {
      // Element might have disappeared, consider animation complete
      return;
    }
  }

  // Animation didn't stabilize but we've waited enough
  console.warn(`Animation for ${selector} did not stabilize after ${maxChecks} checks`);
}

/**
 * Wait for game state change by polling data attribute
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} expectedState - Expected state value
 * @param {object} options - Wait options
 * @returns {Promise<void>}
 */
export async function waitForGameState(page, expectedState, options = {}) {
  const { timeout = 10000 } = options;

  await page.waitForFunction(
    (state) => {
      const gameContainer = document.querySelector('[data-game-state]');
      return gameContainer && gameContainer.getAttribute('data-game-state') === state;
    },
    expectedState,
    { timeout }
  );
}

/**
 * Initialize page with deterministic seed for testing
 * @param {import('playwright').Page} page - Playwright page object
 * @param {number} seed - Deterministic seed to use
 * @returns {Promise<void>}
 */
export async function initializeWithSeed(page, seed) {
  await page.addInitScript((seedValue) => {
    // Override Math.random with seeded RNG for frontend code
    let currentSeed = seedValue;
    Math.random = function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    // Store seed for debugging
    window.__TEST_SEED__ = seedValue;
  }, seed);
}

/**
 * Deterministic seeds for Playwright tests
 */
export const PLAYWRIGHT_SEEDS = {
  default: 123456789,
  alternate: 987654321,
  themeTest: 111222333,
  gameplayTest: 444555666,
  uiTest: 777888999,
  slot0: 111111,
  slot1: 222222,
  slot2: 333333,
  slot3: 444444,
  slot4: 555555,
  slot5: 666666,
};

/**
 * Wait for network idle state (all pending requests completed)
 * @param {import('playwright').Page} page - Playwright page object
 * @param {object} options - Wait options
 * @returns {Promise<void>}
 */
export async function waitForNetworkIdle(page, options = {}) {
  const { timeout = 5000, idleTime = 500 } = options;

  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(idleTime);
}

/**
 * Take screenshot with consistent naming
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {object} options - Screenshot options
 * @returns {Promise<void>}
 */
export async function takeScreenshot(page, name, options = {}) {
  const { folder = 'screenshots', fullPage = true } = options;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `${folder}/${name}-${timestamp}.png`;

  await page.screenshot({ path: filename, fullPage });
  console.log(`   📸 Saved to ${filename}`);
}

/**
 * Wait for ball drop animation to complete
 * Deterministically waits for ball to reach final position
 * @param {import('playwright').Page} page - Playwright page object
 * @param {object} options - Wait options
 * @returns {Promise<void>}
 */
export async function waitForBallDrop(page, options = {}) {
  const { maxWait = 10000 } = options;

  // Wait for ball element to exist
  await waitForElement(page, '[data-testid="plinko-ball"]', { timeout: 2000 });

  // Wait for animation to complete by checking position stability
  await waitForAnimationComplete(page, '[data-testid="plinko-ball"]', {
    maxChecks: maxWait / 100,
    checkInterval: 100,
  });

  // Additional wait for any prize reveal animations
  await page.waitForTimeout(1000);
}

/**
 * Get computed style value for element
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} property - CSS property name
 * @returns {Promise<string>} Computed style value
 */
export async function getComputedStyle(page, selector, property) {
  return await page.locator(selector).evaluate((el, prop) => {
    return window.getComputedStyle(el)[prop];
  }, property);
}

/**
 * Wait for element count to match expected value
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} expectedCount - Expected element count
 * @param {object} options - Wait options
 * @returns {Promise<void>}
 */
export async function waitForElementCount(page, selector, expectedCount, options = {}) {
  const { timeout = 5000 } = options;

  await page.waitForFunction(
    ({ sel, count }) => {
      return document.querySelectorAll(sel).length === count;
    },
    { selector, count: expectedCount },
    { timeout }
  );
}
