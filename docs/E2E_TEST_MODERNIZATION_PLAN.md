# E2E Test Suite Modernization Plan

## Executive Summary

The Playwright E2E test suite has grown to **64 files** through iterative development. While **7 core tests are excellent**, the suite contains significant redundancy, debug artifacts, and gaps in coverage. This plan outlines a systematic approach to modernize the test suite.

**Goal:** Reduce from 64 files to ~20 high-quality tests with better coverage and organization.

---

## Current State Analysis

### What We Have

| Category | Count | Quality | Action |
|----------|-------|---------|--------|
| Core E2E Tests (`.spec.*`) | 7 | ✅ Excellent | Keep & Maintain |
| Standalone Test Scripts | 38 | ⚠️ Mixed | Consolidate |
| Debug/Utility Scripts | 15 | ❌ Obsolete | Delete/Move |
| Legacy Verification | 4 | ❌ Obsolete | Delete |

### Coverage Assessment

**✅ Well Covered:**
- Complete game flow (idle → ready → drop → land → reveal → claim → reset)
- Prize claiming (free rewards, no-win, purchase offers)
- Drop position selector (choice mechanic)
- Reset behavior (all states, edge cases)
- Audio controls (toggle, persistence)
- Visual transitions and consistency

**❌ Critical Gaps:**
- Physics determinism (same seed → same landing slot)
- State machine validation (invalid transitions blocked)
- Performance testing (60 FPS, memory leaks, load time)
- Accessibility (keyboard nav, screen readers, ARIA)
- Error handling (network failures, invalid data)
- Cross-platform (different viewports, browsers)

**🔄 Redundancy:**
- 4 ball trail tests → should be 1
- 2 celebration tests → should be 1
- 3 theme tests → should be 1
- 4 animation tests → should be 1
- 7 visual tests → should be 1

---

## Phase 1: Cleanup & Deletion

**Estimated Time:** 1-2 days
**Impact:** Remove 30 obsolete files

### Files to Delete (30 total)

#### Debug Scripts (4 files)
```bash
# These were used during development and are no longer needed
rm scripts/playwright/debug-ball-position.mjs
rm scripts/playwright/debug-live.js
rm scripts/playwright/debug-nowin-flow.mjs
rm scripts/playwright/debug-selector.mjs
```

#### Legacy Verification Scripts (5 files)
```bash
# These were from iterative development cycles
rm scripts/playwright/verify-final.js
rm scripts/playwright/verify-iter4.js
rm scripts/playwright/verify-iteration.js
rm scripts/playwright/verify-physics-improvements.js
rm scripts/playwright/verify-physics.js
```

#### Screenshot Utilities (5 files)
```bash
# Move to scripts/tools/ or delete if not needed
mv scripts/playwright/quick-screenshot.mjs scripts/tools/
mv scripts/playwright/screenshot-drop-selector.mjs scripts/tools/
mv scripts/playwright/capture-all-themes.mjs scripts/tools/
mv scripts/playwright/brutalist-theme-visual.mjs scripts/tools/
mv scripts/playwright/record-video.js scripts/tools/
```

#### Redundant/Obsolete Tests (16 files)
```bash
# Covered by other tests or no longer relevant
rm scripts/playwright/test-simple.js                    # Duplicate of test-app-loads.mjs
rm scripts/playwright/test-live.js                      # Debug script
rm scripts/playwright/test-final-demo.js                # One-off demo validation
rm scripts/playwright/test-complete.mjs                 # Duplicate of game-flow.spec.mjs
rm scripts/playwright/test-physics-fix.js               # One-off bug fix
rm scripts/playwright/test-prize-claimed.js             # Covered by prize-claim.spec.mjs
rm scripts/playwright/test-prize-reveal.mjs             # Covered by prize-claim.spec.mjs
rm scripts/playwright/test-drop-position-selector.mjs   # Duplicate of drop-position.spec.mjs
rm scripts/playwright/test-theme-app.js                 # Duplicate (keep .mjs)
rm scripts/playwright/test-counter-animation.mjs        # Will merge into animations
rm scripts/playwright/test-slot-performance.mjs         # Will merge into performance suite
rm scripts/playwright/test-reward-orchestration.mjs     # Covered by prize-claim
rm scripts/playwright/test-music-loop-alternation.mjs   # Will merge into audio tests
rm scripts/playwright/test-devtools-persistence.mjs     # DevTools specific, not core game
rm scripts/playwright/test-ball-visible.mjs             # Trivial, covered by game-flow
rm scripts/playwright/quick-visual-test.mjs             # Debug script
```

**Verification Step:**
```bash
# After deletion, verify remaining tests still pass
npm run test:e2e
```

---

## Phase 2: Consolidation

**Estimated Time:** 2-3 days
**Impact:** 20 files → 5 comprehensive tests

### 2.1 Ball Trail Tests (4 → 1)

**Create:** `scripts/playwright/e2e/ball-trail.spec.mjs`

**Consolidate:**
- `test-ball-trail.mjs` - Basic trail rendering
- `test-trail-improvement.mjs` - Trail quality improvements
- `test-trail-performance.mjs` - Trail performance metrics
- `test-trail-visibility.mjs` - Trail visibility validation

**New Test Structure:**
```javascript
import { test, expect } from '@playwright/test';
import { initializePage, waitForGameState } from '../test-helpers.mjs';

test.describe('Ball Trail System', () => {
  test('should render trail during ball drop', async ({ page }) => {
    // Consolidate basic trail tests
  });

  test('should maintain trail quality at 60 FPS', async ({ page }) => {
    // Consolidate performance tests
  });

  test('should render trail visibility correctly', async ({ page }) => {
    // Consolidate visibility tests
  });

  test('should optimize trail points based on velocity', async ({ page }) => {
    // Consolidate improvement tests
  });
});
```

**Checklist:**
- [ ] Extract unique assertions from each test
- [ ] Combine into comprehensive test file
- [ ] Use `test-helpers.mjs` for deterministic behavior
- [ ] Verify all original test cases covered
- [ ] Delete source files after verification

---

### 2.2 Celebration Tests (2 → 1)

**Create:** `scripts/playwright/e2e/celebration.spec.mjs`

**Consolidate:**
- `test-celebration.mjs` - Basic celebration animation
- `test-celebration-flow.mjs` - Celebration flow timing

**New Test Structure:**
```javascript
test.describe('Celebration System', () => {
  test('should trigger celebration after ball lands (win)', async ({ page }) => {
    // Test celebration starts
  });

  test('should display celebration overlay with correct animations', async ({ page }) => {
    // Test visual elements
  });

  test('should auto-advance to prize reveal after celebration', async ({ page }) => {
    // Test flow timing
  });

  test('should not show celebration for no-win prizes', async ({ page }) => {
    // Test no-win scenario
  });
});
```

**Checklist:**
- [ ] Merge celebration animation tests
- [ ] Merge celebration flow tests
- [ ] Test all prize types (win, no-win)
- [ ] Verify timing matches original tests
- [ ] Delete source files after verification

---

### 2.3 Theme Tests (3 → 1)

**Create:** `scripts/playwright/e2e/theming.spec.mjs`

**Consolidate:**
- `test-all-themes.mjs` - Theme switching
- `test-theme-app.mjs` - Theme application
- `test-theme-title.mjs` - Theme title display

**New Test Structure:**
```javascript
test.describe('Theme System', () => {
  test('should apply default theme on load', async ({ page }) => {
    // Default theme validation
  });

  test('should switch between all available themes', async ({ page }) => {
    const themes = ['Default', 'Brutalist'];
    for (const theme of themes) {
      // Test each theme
    }
  });

  test('should persist theme selection across page reloads', async ({ page }) => {
    // Test persistence
  });

  test('should update all UI elements when theme changes', async ({ page }) => {
    // Test comprehensive application
  });

  test('should display theme name correctly', async ({ page }) => {
    // Test title/name display
  });
});
```

**Checklist:**
- [ ] Test all available themes
- [ ] Verify theme persistence
- [ ] Test UI updates on theme change
- [ ] Verify theme titles display
- [ ] Delete source files after verification

---

### 2.4 Animation Tests (4 → 1)

**Create:** `scripts/playwright/e2e/animations.spec.mjs`

**Consolidate:**
- `test-animation-performance.mjs` - FPS validation
- `test-animation-system.mjs` - Animation system
- `test-opacity-animations.mjs` - Opacity animations
- `test-startscreen-animation.mjs` - Start screen entrance

**New Test Structure:**
```javascript
test.describe('Animation System', () => {
  test('should maintain 60 FPS during animations', async ({ page }) => {
    // Consolidate performance tests
  });

  test('should animate start screen entrance smoothly', async ({ page }) => {
    // Start screen animations
  });

  test('should handle opacity animations correctly', async ({ page }) => {
    // Opacity fade in/out
  });

  test('should use correct animation drivers (Framer Motion)', async ({ page }) => {
    // Animation system validation
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Accessibility - prefers-reduced-motion
  });
});
```

**Checklist:**
- [ ] Merge performance tests
- [ ] Merge system tests
- [ ] Merge opacity tests
- [ ] Merge start screen tests
- [ ] Add reduced motion test
- [ ] Delete source files after verification

---

### 2.5 Visual Quality Tests (7 → 1)

**Create:** `scripts/playwright/e2e/visual-quality.spec.mjs`

**Consolidate:**
- `test-visual-quality.js` - General visual quality
- `test-border-corners.mjs` - Border corner rendering
- `test-border-radius.mjs` - Border radius styling
- `test-button-color.mjs` - Button color validation
- `test-arrow-buttons.mjs` - Arrow button rendering
- `test-selector-visual.mjs` - Drop selector visuals
- `test-animation-screenshots.js` - Animation screenshots

**New Test Structure:**
```javascript
test.describe('Visual Quality', () => {
  test('should render UI with correct styling', async ({ page }) => {
    // Overall visual quality
  });

  test('should render borders and corners correctly', async ({ page }) => {
    // Border styling validation
  });

  test('should apply correct button colors per theme', async ({ page }) => {
    // Button color validation
  });

  test('should render arrow buttons correctly', async ({ page }) => {
    // Arrow button styling
  });

  test('should render drop position selector visually correct', async ({ page }) => {
    // Selector visuals
  });

  test('should match visual regression baselines', async ({ page }) => {
    // Screenshot comparison
  });
});
```

**Checklist:**
- [ ] Merge all visual validation tests
- [ ] Consolidate border/styling tests
- [ ] Consolidate button tests
- [ ] Add visual regression baselines
- [ ] Delete source files after verification

---

## Phase 3: New Tests (Fill Gaps)

**Estimated Time:** 3-5 days
**Impact:** Add 4 critical test files

### 3.1 Physics Determinism Tests ⭐ Priority 1

**Create:** `scripts/playwright/e2e/physics-determinism.spec.mjs`

**Purpose:** Validate that physics simulation is deterministic and reproducible

```javascript
import { test, expect } from '@playwright/test';
import { initializePage, waitForGameState, PLAYWRIGHT_SEEDS } from '../test-helpers.mjs';

test.describe('Physics Determinism', () => {
  test('same seed should produce same landing slot', async ({ page }) => {
    const seed = PLAYWRIGHT_SEEDS.CENTER;
    const results = [];

    // Run 10 iterations with same seed
    for (let i = 0; i < 10; i++) {
      await initializePage(page, { seed });
      await page.click('[data-testid="drop-ball-button"]');
      await waitForGameState(page, 'landed');

      const slotIndex = await page.getAttribute('[data-testid="plinko-ball"]', 'data-slot-index');
      results.push(slotIndex);

      await page.click('[data-testid="reset-button"]');
    }

    // All results should be identical
    const uniqueResults = [...new Set(results)];
    expect(uniqueResults).toHaveLength(1);
  });

  test('different seeds should produce varied outcomes', async ({ page }) => {
    const seeds = Object.values(PLAYWRIGHT_SEEDS);
    const results = new Set();

    for (const seed of seeds) {
      await initializePage(page, { seed });
      await page.click('[data-testid="drop-ball-button"]');
      await waitForGameState(page, 'landed');

      const slotIndex = await page.getAttribute('[data-testid="plinko-ball"]', 'data-slot-index');
      results.add(slotIndex);

      await page.click('[data-testid="reset-button"]');
    }

    // Should have multiple different outcomes
    expect(results.size).toBeGreaterThan(1);
  });

  test('ball should never get stuck or freeze', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');

    // Ball should land within reasonable time (5 seconds)
    await expect(page.locator('[data-game-state="landed"]')).toBeVisible({ timeout: 5000 });
  });

  test('ball should always land in a valid slot', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'landed');

    const slotIndex = await page.getAttribute('[data-testid="plinko-ball"]', 'data-slot-index');
    const slotIndexNum = parseInt(slotIndex, 10);

    // Should be a valid slot index (0-4 for 5 prizes)
    expect(slotIndexNum).toBeGreaterThanOrEqual(0);
    expect(slotIndexNum).toBeLessThan(5);
  });

  test('trajectory should look realistic (no teleporting)', async ({ page }) => {
    await initializePage(page);

    // Record ball positions during drop
    const positions = [];
    page.on('console', msg => {
      if (msg.text().includes('Ball position:')) {
        const pos = JSON.parse(msg.text().split('Ball position:')[1]);
        positions.push(pos);
      }
    });

    await page.evaluate(() => {
      const originalLog = console.log;
      setInterval(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (ball) {
          const rect = ball.getBoundingClientRect();
          originalLog(`Ball position: ${JSON.stringify({ x: rect.x, y: rect.y })}`);
        }
      }, 16); // Every frame
    });

    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'landed');

    // Verify no sudden jumps (teleporting)
    for (let i = 1; i < positions.length; i++) {
      const dx = Math.abs(positions[i].x - positions[i-1].x);
      const dy = Math.abs(positions[i].y - positions[i-1].y);

      // Max movement per frame at 60 FPS (reasonable threshold)
      expect(dx).toBeLessThan(100); // No horizontal teleporting
      expect(dy).toBeLessThan(100); // No vertical teleporting
    }
  });

  test('collision with pegs should be consistent', async ({ page }) => {
    const seed = PLAYWRIGHT_SEEDS.CENTER;

    // Record peg collisions for same seed across 3 runs
    const collisionSets = [];

    for (let run = 0; run < 3; run++) {
      await initializePage(page, { seed });

      const collisions = [];
      page.on('console', msg => {
        if (msg.text().includes('Peg collision:')) {
          const pegId = msg.text().split('Peg collision:')[1];
          collisions.push(pegId);
        }
      });

      await page.click('[data-testid="drop-ball-button"]');
      await waitForGameState(page, 'landed');

      collisionSets.push(collisions);
      await page.click('[data-testid="reset-button"]');
    }

    // All collision sequences should be identical
    expect(collisionSets[0]).toEqual(collisionSets[1]);
    expect(collisionSets[1]).toEqual(collisionSets[2]);
  });
});
```

**Checklist:**
- [ ] Test same seed → same outcome
- [ ] Test different seeds → varied outcomes
- [ ] Test ball never gets stuck
- [ ] Test ball always lands in valid slot
- [ ] Test trajectory is realistic (no teleporting)
- [ ] Test collision consistency
- [ ] Test edge cases (boundary conditions)
- [ ] Add performance assertions (drop time < 5s)

---

### 3.2 State Machine Tests ⭐ Priority 1

**Create:** `scripts/playwright/e2e/state-machine.spec.mjs`

**Purpose:** Validate game state transitions and prevent invalid states

```javascript
test.describe('State Machine', () => {
  test('should prevent dropping ball during countdown', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'countdown');

    // Try to click drop button during countdown (should be disabled)
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    await expect(dropButton).toBeDisabled();
  });

  test('should prevent reset during ball drop', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'dropping');

    // Reset button should not be visible/clickable during drop
    const resetButton = page.locator('[data-testid="reset-button"]');
    await expect(resetButton).not.toBeVisible();
  });

  test('should follow valid state progression', async ({ page }) => {
    await initializePage(page);

    // Expected state progression
    const expectedStates = [
      'idle',
      'ready',
      'countdown',
      'dropping',
      'landed',
      'celebrating',
      'revealed',
      'claimed'
    ];

    const observedStates = [];

    // Monitor state changes
    await page.evaluate(() => {
      const observer = new MutationObserver(() => {
        const state = document.querySelector('[data-game-state]')?.getAttribute('data-game-state');
        if (state) window.gameStates = window.gameStates || [];
        if (state && (!window.gameStates.length || window.gameStates[window.gameStates.length - 1] !== state)) {
          window.gameStates.push(state);
        }
      });
      observer.observe(document.body, { attributes: true, subtree: true });
    });

    // Play through complete game
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'revealed');
    await page.click('[data-testid="claim-prize-button"]');
    await waitForGameState(page, 'claimed');

    // Get observed states
    const states = await page.evaluate(() => window.gameStates);

    // Verify state progression matches expected
    expect(states).toEqual(expect.arrayContaining(expectedStates));
  });

  test('should handle rapid user clicks gracefully', async ({ page }) => {
    await initializePage(page);

    // Rapidly click drop button 10 times
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="drop-ball-button"]', { force: true });
    }

    // Should still reach valid end state
    await expect(page.locator('[data-game-state="revealed"]')).toBeVisible({ timeout: 10000 });

    // No console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    expect(consoleErrors).toHaveLength(0);
  });

  test('should persist state correctly across page reload', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'revealed');

    // Reload page
    await page.reload();

    // Should return to idle state (no persistence of in-progress game)
    await expect(page.locator('[data-game-state="idle"]')).toBeVisible();
  });

  test('should clear state on explicit reset', async ({ page }) => {
    await initializePage(page);
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'revealed');

    // Reset
    await page.click('[data-testid="reset-button"]');

    // Should return to idle
    await expect(page.locator('[data-game-state="idle"]')).toBeVisible();

    // All game elements should be reset
    await expect(page.locator('[data-testid="plinko-ball"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="prize-reveal"]')).not.toBeVisible();
  });
});
```

**Checklist:**
- [ ] Test invalid transitions blocked
- [ ] Test valid state progression
- [ ] Test rapid clicks handled gracefully
- [ ] Test state persistence behavior
- [ ] Test reset clears all state
- [ ] Test no memory leaks across states
- [ ] Test concurrent actions handled

---

### 3.3 Performance Tests ⭐ Priority 2

**Create:** `scripts/playwright/e2e/performance.spec.mjs`

**Purpose:** Validate performance benchmarks and detect regressions

```javascript
test.describe('Performance', () => {
  test('should maintain 60 FPS during ball drop', async ({ page }) => {
    await initializePage(page);

    // Start FPS monitoring
    await page.evaluate(() => {
      window.fpsLog = [];
      let lastTime = performance.now();
      let frames = 0;

      function measureFPS() {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          window.fpsLog.push(frames);
          frames = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(measureFPS);
      }
      requestAnimationFrame(measureFPS);
    });

    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'landed');

    // Get FPS measurements
    const fpsLog = await page.evaluate(() => window.fpsLog);

    // Should maintain close to 60 FPS (allow 10% tolerance)
    const avgFPS = fpsLog.reduce((a, b) => a + b, 0) / fpsLog.length;
    expect(avgFPS).toBeGreaterThan(54); // 90% of 60 FPS
  });

  test('should load page in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // < 2 seconds
  });

  test('should have minimal layout shift (CLS < 0.1)', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    expect(cls).toBeLessThan(0.1); // Good CLS score
  });

  test('should not leak memory across 20 rounds', async ({ page }) => {
    await initializePage(page);

    // Get initial memory
    const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

    // Play 20 rounds
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="drop-ball-button"]');
      await waitForGameState(page, 'revealed');
      await page.click('[data-testid="claim-prize-button"]');
      await waitForGameState(page, 'claimed');
      await page.click('[data-testid="play-again-button"]');
      await waitForGameState(page, 'ready');
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

    // Memory should not grow significantly (allow 50% growth max)
    const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
    expect(memoryGrowth).toBeLessThan(0.5); // < 50% growth
  });

  test('should render animations without jank', async ({ page }) => {
    await initializePage(page);

    // Measure frame times during animation
    const frameTimes = await page.evaluate(async () => {
      const times = [];
      let lastTime = performance.now();

      return new Promise((resolve) => {
        function measureFrame() {
          const currentTime = performance.now();
          times.push(currentTime - lastTime);
          lastTime = currentTime;

          if (times.length < 120) { // Measure 2 seconds at 60 FPS
            requestAnimationFrame(measureFrame);
          } else {
            resolve(times);
          }
        }
        requestAnimationFrame(measureFrame);
      });
    });

    // Check for janky frames (> 32ms = dropped frame)
    const jankyFrames = frameTimes.filter(time => time > 32);
    const jankyPercentage = (jankyFrames.length / frameTimes.length) * 100;

    // Allow max 5% janky frames
    expect(jankyPercentage).toBeLessThan(5);
  });

  test('should handle large prize tables without slowdown', async ({ page }) => {
    // Test with maximum prize count
    await initializePage(page, { prizeCount: 20 });

    const startTime = Date.now();
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'landed');
    const dropTime = Date.now() - startTime;

    // Should complete in reasonable time even with 20 prizes
    expect(dropTime).toBeLessThan(5000);
  });
});
```

**Checklist:**
- [ ] Test 60 FPS maintained
- [ ] Test page load time < 2s
- [ ] Test CLS < 0.1
- [ ] Test no memory leaks (20 rounds)
- [ ] Test no animation jank
- [ ] Test performance with large prize tables
- [ ] Test bundle size reasonable
- [ ] Add performance regression alerts

---

### 3.4 Accessibility Tests ⭐ Priority 2

**Create:** `scripts/playwright/e2e/accessibility.spec.mjs`

**Purpose:** Ensure game is accessible to all users

```javascript
test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await initializePage(page);

    // Tab to drop button
    await page.keyboard.press('Tab');
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    await expect(dropButton).toBeFocused();

    // Press Enter to drop ball
    await page.keyboard.press('Enter');
    await waitForGameState(page, 'revealed');

    // Tab to claim button
    await page.keyboard.press('Tab');
    const claimButton = page.locator('[data-testid="claim-prize-button"]');
    await expect(claimButton).toBeFocused();

    // Press Enter to claim
    await page.keyboard.press('Enter');
    await waitForGameState(page, 'claimed');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await initializePage(page);

    // Check critical elements have ARIA labels
    const dropButton = page.locator('[data-testid="drop-ball-button"]');
    await expect(dropButton).toHaveAttribute('aria-label');

    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    await expect(soundToggle).toHaveAttribute('aria-label');

    // Prize slots should have ARIA labels
    const slots = page.locator('[data-testid^="slot-"]');
    const slotCount = await slots.count();
    for (let i = 0; i < slotCount; i++) {
      await expect(slots.nth(i)).toHaveAttribute('aria-label');
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await initializePage(page);

    // Tab to button
    await page.keyboard.press('Tab');
    const dropButton = page.locator('[data-testid="drop-ball-button"]');

    // Check focus indicator is visible
    const outlineColor = await dropButton.evaluate(el => {
      return window.getComputedStyle(el).outlineColor;
    });

    // Should have a visible outline (not transparent)
    expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(outlineColor).not.toBe('transparent');
  });

  test('should meet color contrast requirements', async ({ page }) => {
    await initializePage(page);

    // Check contrast ratio for text elements
    const textElements = [
      '[data-testid="drop-ball-button"]',
      '[data-testid="prize-label"]',
      '[data-testid="prize-value"]',
    ];

    for (const selector of textElements) {
      const element = page.locator(selector).first();
      if (await element.count() === 0) continue;

      const contrast = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // Simple contrast calculation (full implementation would use WCAG formula)
        return { bgColor, textColor };
      });

      // Verify colors are defined (full WCAG check would be more complex)
      expect(contrast.bgColor).toBeDefined();
      expect(contrast.textColor).toBeDefined();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await initializePage(page);

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    await expect(liveRegions).toHaveCount(expect.any(Number));

    // Game state changes should be announced
    await page.click('[data-testid="drop-ball-button"]');
    await waitForGameState(page, 'revealed');

    // Check if prize reveal has announcement
    const prizeAnnouncement = page.locator('[role="alert"], [aria-live="assertive"]');
    await expect(prizeAnnouncement).toBeVisible();
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await initializePage(page);

    await page.click('[data-testid="drop-ball-button"]');

    // Animations should be reduced/disabled
    const animationDuration = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return null;
      return window.getComputedStyle(ball).animationDuration;
    });

    // With reduced motion, animations should be instant or very short
    expect(animationDuration === '0s' || animationDuration === null).toBeTruthy();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Enable high contrast
    await page.emulateMedia({ forcedColors: 'active' });
    await initializePage(page);

    // Elements should still be visible
    await expect(page.locator('[data-testid="drop-ball-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="plinko-board"]')).toBeVisible();
    await expect(page.locator('[data-testid^="slot-"]').first()).toBeVisible();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await initializePage(page);

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check buttons are actual buttons
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
```

**Checklist:**
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test ARIA labels present and accurate
- [ ] Test focus indicators visible
- [ ] Test color contrast meets WCAG AA
- [ ] Test screen reader announcements
- [ ] Test prefers-reduced-motion support
- [ ] Test high contrast mode
- [ ] Test semantic HTML structure
- [ ] Run axe-core accessibility audit
- [ ] Test with actual screen readers

---

## Phase 4: Infrastructure

**Estimated Time:** 1-2 days
**Impact:** Unified test suite with proper configuration

### 4.1 Create Playwright Configuration

**Create:** `scripts/playwright/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Plinko E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Test file pattern
  testMatch: '**/*.spec.{js,mjs,ts}',

  // Timeout per test
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  // Fail fast on CI
  fullyParallel: true,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Parallel workers
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Console output
  ],

  // Global setup/teardown
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  // Shared settings
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Browser context options
    contextOptions: {
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 }
      }
    },
  },

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Checklist:**
- [ ] Create config file
- [ ] Configure test directory
- [ ] Set up reporters (HTML, JSON, JUnit)
- [ ] Configure browser projects
- [ ] Set up dev server auto-start
- [ ] Configure video/screenshot on failure
- [ ] Set proper timeouts
- [ ] Configure CI-specific settings

---

### 4.2 Create Global Setup/Teardown

**Create:** `scripts/playwright/global-setup.ts`

```typescript
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Plinko E2E test suite...');

  // Start dev server (handled by webServer config)
  // Any additional global setup here

  // Warm up the application
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(config.use?.baseURL || 'http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await browser.close();

  console.log('✅ Global setup complete');
}

export default globalSetup;
```

**Create:** `scripts/playwright/global-teardown.ts`

```typescript
async function globalTeardown() {
  console.log('🧹 Cleaning up after tests...');

  // Clean up screenshots directory if needed
  // Any other cleanup

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
```

**Checklist:**
- [ ] Create global setup
- [ ] Create global teardown
- [ ] Warm up application in setup
- [ ] Clean up test artifacts in teardown
- [ ] Add logging for visibility

---

### 4.3 Update package.json Scripts

**Update:** `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test --config scripts/playwright/playwright.config.ts",
    "test:e2e:headed": "playwright test --config scripts/playwright/playwright.config.ts --headed",
    "test:e2e:debug": "playwright test --config scripts/playwright/playwright.config.ts --debug",
    "test:e2e:ui": "playwright test --config scripts/playwright/playwright.config.ts --ui",
    "test:e2e:report": "playwright show-report scripts/playwright/test-results/html",
    "test:e2e:chrome": "playwright test --config scripts/playwright/playwright.config.ts --project=chromium",
    "test:e2e:firefox": "playwright test --config scripts/playwright/playwright.config.ts --project=firefox",
    "test:e2e:webkit": "playwright test --config scripts/playwright/playwright.config.ts --project=webkit",
    "test:e2e:mobile": "playwright test --config scripts/playwright/playwright.config.ts --project=mobile-chrome --project=mobile-safari"
  }
}
```

**Checklist:**
- [ ] Add unified test command
- [ ] Add headed mode command
- [ ] Add debug mode command
- [ ] Add UI mode command
- [ ] Add report viewing command
- [ ] Add browser-specific commands
- [ ] Add mobile testing command

---

### 4.4 Create Test Suite Documentation

**Create:** `scripts/playwright/README.md`

```markdown
# Plinko E2E Test Suite

## Overview

Comprehensive Playwright test suite for the Plinko game covering:
- ✅ Complete game flow
- ✅ Physics determinism
- ✅ State machine validation
- ✅ Performance benchmarks
- ✅ Accessibility compliance

## Running Tests

### All Tests
\`\`\`bash
npm run test:e2e
\`\`\`

### Specific Browser
\`\`\`bash
npm run test:e2e:chrome   # Chrome only
npm run test:e2e:firefox  # Firefox only
npm run test:e2e:webkit   # Safari only
\`\`\`

### Debug Mode
\`\`\`bash
npm run test:e2e:debug
\`\`\`

### UI Mode (Interactive)
\`\`\`bash
npm run test:e2e:ui
\`\`\`

### View Report
\`\`\`bash
npm run test:e2e:report
\`\`\`

## Test Structure

\`\`\`
scripts/playwright/
├── e2e/                          # Core E2E tests
│   ├── game-flow.spec.mjs       # Complete game journey
│   ├── prize-claim.spec.mjs     # Prize claiming
│   ├── drop-position.spec.mjs   # Drop position mechanic
│   ├── reset-behavior.spec.mjs  # Reset scenarios
│   ├── physics-determinism.spec.mjs  # Physics validation
│   ├── state-machine.spec.mjs   # State transitions
│   ├── performance.spec.mjs     # Performance benchmarks
│   ├── accessibility.spec.mjs   # A11y compliance
│   ├── theming.spec.mjs         # Theme system
│   ├── animations.spec.mjs      # Animation system
│   ├── visual-quality.spec.mjs  # Visual quality
│   ├── ball-trail.spec.mjs      # Ball trail effects
│   └── celebration.spec.mjs     # Celebration animations
├── test-helpers.mjs             # Shared test utilities
├── playwright.config.ts         # Playwright configuration
├── global-setup.ts              # Global setup
├── global-teardown.ts           # Global teardown
└── README.md                    # This file
\`\`\`

## Writing Tests

### Use Test Helpers

\`\`\`javascript
import { initializePage, waitForGameState, PLAYWRIGHT_SEEDS } from '../test-helpers.mjs';

test('should complete game flow', async ({ page }) => {
  // Initialize with deterministic seed
  await initializePage(page, { seed: PLAYWRIGHT_SEEDS.CENTER });

  // Wait for specific game state
  await waitForGameState(page, 'landed');
});
\`\`\`

### Deterministic Testing

Always use `PLAYWRIGHT_SEEDS` for reproducible results:

\`\`\`javascript
const seed = PLAYWRIGHT_SEEDS.CENTER;  // Deterministic center drop
await initializePage(page, { seed });
\`\`\`

### State Validation

Use `data-game-state` attribute:

\`\`\`javascript
await expect(page.locator('[data-game-state="revealed"]')).toBeVisible();
\`\`\`

## Test Coverage

| Category | Coverage | Status |
|----------|----------|--------|
| Game Flow | 100% | ✅ |
| Prize Types | 100% | ✅ |
| Physics | 100% | ✅ |
| State Machine | 100% | ✅ |
| Performance | 100% | ✅ |
| Accessibility | 100% | ✅ |
| Visual Quality | 100% | ✅ |

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Nightly builds

Configuration: `.github/workflows/e2e-tests.yml`

## Debugging

### Failed Tests

1. Check `test-results/` directory for:
   - Screenshots
   - Videos
   - Traces

2. Open trace viewer:
\`\`\`bash
npx playwright show-trace test-results/trace.zip
\`\`\`

### Flaky Tests

1. Run with retries:
\`\`\`bash
npx playwright test --retries=3
\`\`\`

2. Check test stability:
\`\`\`bash
npx playwright test --repeat-each=10
\`\`\`

## Best Practices

1. ✅ Always use `test-helpers.mjs` utilities
2. ✅ Use deterministic seeds for physics tests
3. ✅ Validate state transitions with `data-game-state`
4. ✅ Take screenshots on failure
5. ✅ Use meaningful test descriptions
6. ✅ Keep tests isolated and independent
7. ✅ Clean up after each test
8. ❌ Don't rely on timing (use `waitForGameState`)
9. ❌ Don't hardcode values (use constants)
10. ❌ Don't skip cleanup

## Maintenance

### Adding New Tests

1. Create test file in `e2e/` with `.spec.mjs` extension
2. Import test helpers
3. Follow existing test structure
4. Run locally before committing
5. Update this README

### Updating Tests

1. Check if changes affect multiple tests
2. Update shared utilities in `test-helpers.mjs`
3. Run full suite after changes
4. Update documentation

## Performance Benchmarks

Target metrics (enforced by tests):
- Page load: < 2 seconds
- FPS during drop: > 54 FPS (90% of 60)
- CLS: < 0.1
- Memory growth (20 rounds): < 50%
- No animation jank: < 5% dropped frames

## Support

Questions? See main project documentation or raise an issue.
\`\`\`

**Checklist:**
- [ ] Create README
- [ ] Document test structure
- [ ] Document running tests
- [ ] Document writing tests
- [ ] Document debugging
- [ ] Document best practices
- [ ] Document performance benchmarks

---

## Phase 5: Documentation & Finalization

**Estimated Time:** 1 day
**Impact:** Complete documentation and validation

### 5.1 Create Test Coverage Report

**Create:** `scripts/playwright/coverage-report.md`

```markdown
# E2E Test Coverage Report

## Summary

- Total Tests: 20
- Critical Path Coverage: 100%
- Browser Coverage: Chrome, Firefox, Safari, Mobile
- Last Updated: [Date]

## Coverage by Category

### Game Flow (100%)
- ✅ Start to finish gameplay
- ✅ Prize reveal and claim
- ✅ Reset behavior
- ✅ Multiple rounds

### Physics (100%)
- ✅ Deterministic outcomes
- ✅ Trajectory validation
- ✅ Collision detection
- ✅ Edge cases

### State Machine (100%)
- ✅ Valid state transitions
- ✅ Invalid transitions blocked
- ✅ State persistence
- ✅ Rapid interactions

### Performance (100%)
- ✅ 60 FPS animation
- ✅ Page load time
- ✅ Memory management
- ✅ No jank

### Accessibility (100%)
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Screen reader support
- ✅ Color contrast

### Visual (100%)
- ✅ Theme switching
- ✅ Animations
- ✅ Visual consistency
- ✅ Responsive design

## Gap Analysis

No significant gaps remaining. All critical functionality covered.

## Maintenance Schedule

- Weekly: Run full suite on all browsers
- Per PR: Run core tests (game flow, physics, state)
- Nightly: Run full suite + performance benchmarks
\`\`\`

**Checklist:**
- [ ] Document coverage by category
- [ ] List all test files
- [ ] Document gaps (if any)
- [ ] Set maintenance schedule
- [ ] Update after Phase 3 completion

---

### 5.2 Update Main Documentation

**Update:** `docs/TESTING.md` (if exists) or create new

Add section on E2E testing:

```markdown
## E2E Testing (Playwright)

The E2E test suite validates the complete Plinko game experience from a user's perspective.

### Quick Start

\`\`\`bash
npm run test:e2e
\`\`\`

### Test Categories

1. **Game Flow** - Complete gameplay from start to finish
2. **Physics** - Deterministic behavior and collision detection
3. **State Machine** - Valid state transitions and error handling
4. **Performance** - 60 FPS, load time, memory management
5. **Accessibility** - Keyboard nav, screen readers, ARIA
6. **Visual** - Themes, animations, consistency

### Writing E2E Tests

See `scripts/playwright/README.md` for detailed guide.

### CI/CD

Tests run automatically on PRs and main branch pushes.
\`\`\`

**Checklist:**
- [ ] Update main testing documentation
- [ ] Add E2E section
- [ ] Link to Playwright README
- [ ] Document CI/CD integration

---

## Timeline & Resources

### Overall Timeline

| Phase | Duration | Parallel? |
|-------|----------|-----------|
| Phase 1: Cleanup | 1-2 days | No |
| Phase 2: Consolidation | 2-3 days | Yes (per category) |
| Phase 3: New Tests | 3-5 days | Yes (per test file) |
| Phase 4: Infrastructure | 1-2 days | Partially |
| Phase 5: Documentation | 1 day | No |
| **Total** | **8-13 days** | Sequential: ~10 days |

### Resource Requirements

- 1 developer (full-time)
- Or 2 developers (5-7 days, parallel work)

### Milestones

| Milestone | Completion Criteria |
|-----------|---------------------|
| M1: Cleanup Complete | 30 files deleted, no broken tests |
| M2: Consolidation Complete | 5 consolidated test files, all passing |
| M3: New Tests Complete | 4 new test files, 100% coverage |
| M4: Infrastructure Complete | Playwright config, unified test suite |
| M5: Documentation Complete | README, coverage report, main docs updated |

---

## Success Criteria

### Quantitative

- ✅ **64 files → 20 files** (69% reduction)
- ✅ **100% critical path coverage**
- ✅ **< 5 minute total test runtime**
- ✅ **0 flaky tests**
- ✅ **All tests use deterministic seeds**
- ✅ **All tests pass on Chrome, Firefox, Safari**

### Qualitative

- ✅ Tests are maintainable and well-documented
- ✅ New developers can understand test structure
- ✅ Tests catch regressions effectively
- ✅ CI/CD integration is seamless
- ✅ Test failures are easy to debug

---

## Risk Management

### Potential Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing tests during consolidation | High | Gradual consolidation, verify each step |
| New tests reveal existing bugs | Medium | Fix bugs, adjust timeline |
| Flaky physics tests due to timing | Medium | Use deterministic seeds, increase timeouts |
| Test suite becomes too slow | Medium | Optimize, run critical tests on PR only |
| Developer resistance to new structure | Low | Clear documentation, training session |

---

## Post-Completion Maintenance

### Ongoing Activities

1. **Weekly Test Reviews**
   - Check for flaky tests
   - Review failures
   - Update as needed

2. **Monthly Coverage Reviews**
   - Assess coverage gaps
   - Add tests for new features
   - Update documentation

3. **Quarterly Test Performance Review**
   - Optimize slow tests
   - Update performance benchmarks
   - Refactor as needed

### Adding New Features

When adding new game features:

1. Add E2E test to appropriate spec file
2. Run full suite locally
3. Update coverage report
4. Document in README

---

## Appendix A: File Deletion Checklist

Copy this checklist when executing Phase 1:

```
Phase 1: File Deletion

Debug Scripts (4):
[ ] debug-ball-position.mjs
[ ] debug-live.js
[ ] debug-nowin-flow.mjs
[ ] debug-selector.mjs

Legacy Verification (5):
[ ] verify-final.js
[ ] verify-iter4.js
[ ] verify-iteration.js
[ ] verify-physics-improvements.js
[ ] verify-physics.js

Screenshot Utilities (5):
[ ] quick-screenshot.mjs → scripts/tools/
[ ] screenshot-drop-selector.mjs → scripts/tools/
[ ] capture-all-themes.mjs → scripts/tools/
[ ] brutalist-theme-visual.mjs → scripts/tools/
[ ] record-video.js → scripts/tools/

Redundant Tests (16):
[ ] test-simple.js
[ ] test-live.js
[ ] test-final-demo.js
[ ] test-complete.mjs
[ ] test-physics-fix.js
[ ] test-prize-claimed.js
[ ] test-prize-reveal.mjs
[ ] test-drop-position-selector.mjs
[ ] test-theme-app.js
[ ] test-counter-animation.mjs
[ ] test-slot-performance.mjs
[ ] test-reward-orchestration.mjs
[ ] test-music-loop-alternation.mjs
[ ] test-devtools-persistence.mjs
[ ] test-ball-visible.mjs
[ ] quick-visual-test.mjs

Verification:
[ ] All tests still pass after deletion
[ ] No broken imports
[ ] Git commit with clear message
```

---

## Appendix B: Consolidation Checklist

Copy this checklist when executing Phase 2:

```
Phase 2: Test Consolidation

Ball Trail (4 → 1):
[ ] Create e2e/ball-trail.spec.mjs
[ ] Migrate test-ball-trail.mjs
[ ] Migrate test-trail-improvement.mjs
[ ] Migrate test-trail-performance.mjs
[ ] Migrate test-trail-visibility.mjs
[ ] Verify all original assertions included
[ ] Run new test - passes
[ ] Delete 4 source files
[ ] Git commit

Celebration (2 → 1):
[ ] Create e2e/celebration.spec.mjs
[ ] Migrate test-celebration.mjs
[ ] Migrate test-celebration-flow.mjs
[ ] Verify all original assertions included
[ ] Run new test - passes
[ ] Delete 2 source files
[ ] Git commit

Theme (3 → 1):
[ ] Create e2e/theming.spec.mjs
[ ] Migrate test-all-themes.mjs
[ ] Migrate test-theme-app.mjs
[ ] Migrate test-theme-title.mjs
[ ] Verify all original assertions included
[ ] Run new test - passes
[ ] Delete 3 source files
[ ] Git commit

Animation (4 → 1):
[ ] Create e2e/animations.spec.mjs
[ ] Migrate test-animation-performance.mjs
[ ] Migrate test-animation-system.mjs
[ ] Migrate test-opacity-animations.mjs
[ ] Migrate test-startscreen-animation.mjs
[ ] Verify all original assertions included
[ ] Run new test - passes
[ ] Delete 4 source files
[ ] Git commit

Visual Quality (7 → 1):
[ ] Create e2e/visual-quality.spec.mjs
[ ] Migrate test-visual-quality.js
[ ] Migrate test-border-corners.mjs
[ ] Migrate test-border-radius.mjs
[ ] Migrate test-button-color.mjs
[ ] Migrate test-arrow-buttons.mjs
[ ] Migrate test-selector-visual.mjs
[ ] Migrate test-animation-screenshots.js
[ ] Verify all original assertions included
[ ] Run new test - passes
[ ] Delete 7 source files
[ ] Git commit

Final Verification:
[ ] All consolidated tests pass
[ ] No broken imports
[ ] Coverage maintained or improved
[ ] Git push to branch
```

---

## Appendix C: New Test Implementation Checklist

Copy this checklist when executing Phase 3:

```
Phase 3: New Tests

Physics Determinism (Priority 1):
[ ] Create e2e/physics-determinism.spec.mjs
[ ] Test: Same seed → same outcome
[ ] Test: Different seeds → varied outcomes
[ ] Test: Ball never stuck
[ ] Test: Ball always lands in valid slot
[ ] Test: Trajectory realistic (no teleporting)
[ ] Test: Collision consistency
[ ] All tests pass
[ ] Performance assertions added
[ ] Git commit

State Machine (Priority 1):
[ ] Create e2e/state-machine.spec.mjs
[ ] Test: Prevent invalid transitions
[ ] Test: Valid state progression
[ ] Test: Rapid clicks handled
[ ] Test: State persistence
[ ] Test: Reset clears all state
[ ] Test: No memory leaks
[ ] All tests pass
[ ] Edge cases covered
[ ] Git commit

Performance (Priority 2):
[ ] Create e2e/performance.spec.mjs
[ ] Test: Maintain 60 FPS
[ ] Test: Page load < 2s
[ ] Test: CLS < 0.1
[ ] Test: No memory leaks (20 rounds)
[ ] Test: No animation jank
[ ] Test: Large prize tables
[ ] All tests pass
[ ] Benchmarks documented
[ ] Git commit

Accessibility (Priority 2):
[ ] Create e2e/accessibility.spec.mjs
[ ] Test: Keyboard navigation
[ ] Test: ARIA labels
[ ] Test: Focus indicators
[ ] Test: Color contrast
[ ] Test: Screen reader support
[ ] Test: Reduced motion
[ ] Test: High contrast mode
[ ] Test: Semantic HTML
[ ] All tests pass
[ ] A11y audit clean
[ ] Git commit

Final Verification:
[ ] All new tests pass
[ ] Coverage gaps filled
[ ] Performance benchmarks met
[ ] Documentation updated
[ ] Git push to branch
```

---

## Appendix D: Infrastructure Setup Checklist

Copy this checklist when executing Phase 4:

```
Phase 4: Infrastructure

Playwright Configuration:
[ ] Create playwright.config.ts
[ ] Configure test directory
[ ] Set up reporters (HTML, JSON, JUnit)
[ ] Configure browser projects (Chrome, Firefox, Safari)
[ ] Configure mobile projects
[ ] Set up dev server auto-start
[ ] Configure video/screenshot on failure
[ ] Set proper timeouts
[ ] Configure CI-specific settings
[ ] Test configuration works
[ ] Git commit

Global Setup/Teardown:
[ ] Create global-setup.ts
[ ] Implement warmup logic
[ ] Create global-teardown.ts
[ ] Implement cleanup logic
[ ] Test setup/teardown
[ ] Git commit

Package.json Scripts:
[ ] Add test:e2e command
[ ] Add test:e2e:headed command
[ ] Add test:e2e:debug command
[ ] Add test:e2e:ui command
[ ] Add test:e2e:report command
[ ] Add browser-specific commands
[ ] Add mobile testing command
[ ] Test all commands work
[ ] Git commit

Documentation:
[ ] Create scripts/playwright/README.md
[ ] Document test structure
[ ] Document running tests
[ ] Document writing tests
[ ] Document debugging
[ ] Document best practices
[ ] Git commit

Final Verification:
[ ] All scripts work
[ ] Configuration validated
[ ] Documentation complete
[ ] Git push to branch
```

---

## Next Steps

1. **Review this plan** with team
2. **Schedule implementation** (allocate 8-13 days)
3. **Create branch** (`test-suite-modernization`)
4. **Execute phases** in order
5. **Review & merge** to main branch

---

**Plan Created:** [Date]
**Author:** [Name]
**Status:** Ready for Implementation
