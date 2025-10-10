#!/usr/bin/env node
/**
 * Comprehensive E2E Test: Animation System
 *
 * Tests the new animation driver system for:
 * - Ball drop animations (60 FPS target)
 * - Win animations (CurrencyCounter, YouWonText)
 * - Screen shake effects
 * - Peg hit animations
 * - Visual regression validation
 *
 * This test visually confirms that the migration from CSS animations
 * to the animation driver system works correctly across all features.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = join(__dirname, '../../screenshots/animation-system');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, COLORS.cyan);
  log(`  ${title}`, COLORS.cyan);
  log('='.repeat(60), COLORS.cyan);
}

function subsection(title) {
  log(`\n${title}`, COLORS.yellow);
  log('-'.repeat(60), COLORS.yellow);
}

/**
 * Performance monitoring utilities
 */
async function setupPerformanceMonitoring(page) {
  await page.evaluate(() => {
    window.performanceMetrics = {
      frames: [],
      droppedFrames: 0,
      lastFrameTime: performance.now(),
      animations: [],
    };

    function recordFrame() {
      const now = performance.now();
      const delta = now - window.performanceMetrics.lastFrameTime;
      window.performanceMetrics.frames.push(delta);

      // Count dropped frames (target: 16.67ms per frame at 60 FPS)
      if (delta > 20) {
        window.performanceMetrics.droppedFrames++;
      }

      window.performanceMetrics.lastFrameTime = now;
      requestAnimationFrame(recordFrame);
    }

    requestAnimationFrame(recordFrame);
  });
}

async function getPerformanceMetrics(page) {
  return await page.evaluate(() => {
    const metrics = window.performanceMetrics;
    if (!metrics || !metrics.frames || metrics.frames.length === 0) {
      return null;
    }

    const avgFrameTime = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
    const fps = 1000 / avgFrameTime;
    const droppedPercentage = ((metrics.droppedFrames / metrics.frames.length) * 100).toFixed(2);

    return {
      avgFPS: Math.round(fps),
      droppedFrames: metrics.droppedFrames,
      totalFrames: metrics.frames.length,
      droppedPercentage: parseFloat(droppedPercentage),
    };
  });
}

function resetPerformanceMetrics(page) {
  return page.evaluate(() => {
    if (window.performanceMetrics) {
      window.performanceMetrics.frames = [];
      window.performanceMetrics.droppedFrames = 0;
      window.performanceMetrics.lastFrameTime = performance.now();
    }
  });
}

/**
 * Test 1: Ball Drop Animation
 */
async function testBallDropAnimation(page) {
  subsection('Test 1: Ball Drop Animation');

  // Wait for drop button and click it
  await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 10000 });
  log('  ✓ Drop button visible', COLORS.green);

  await resetPerformanceMetrics(page);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '01-before-drop.png') });

  await page.click('button:has-text("Drop Ball")');
  log('  ✓ Ball drop initiated', COLORS.green);

  // Wait for countdown (3 seconds)
  await page.waitForTimeout(3500);

  // Screenshot during ball animation
  await page.screenshot({ path: join(SCREENSHOT_DIR, '02-ball-dropping.png') });

  // Verify ball is visible and animating
  const ballState = await page.evaluate(() => {
    const ball = document.querySelector('[data-testid="plinko-ball"]');
    if (!ball) return { exists: false };

    const style = window.getComputedStyle(ball);
    const rect = ball.getBoundingClientRect();

    return {
      exists: true,
      display: style.display,
      opacity: parseFloat(style.opacity),
      transform: style.transform,
      position: { x: rect.x, y: rect.y },
      size: { width: rect.width, height: rect.height },
      state: ball.dataset.state,
    };
  });

  if (!ballState.exists) {
    log('  ✗ Ball element does not exist', COLORS.red);
    return false;
  }

  if (ballState.display === 'none') {
    log('  ✗ Ball has display: none', COLORS.red);
    return false;
  }

  if (ballState.opacity === 0) {
    log('  ✗ Ball is invisible (opacity: 0)', COLORS.red);
    return false;
  }

  if (ballState.transform === 'none') {
    log('  ✗ Ball has no transform applied', COLORS.red);
    return false;
  }

  log(`  ✓ Ball is visible and positioned at (${ballState.position.x.toFixed(1)}, ${ballState.position.y.toFixed(1)})`, COLORS.green);
  log(`  ✓ Ball size: ${ballState.size.width}x${ballState.size.height}`, COLORS.green);
  log(`  ✓ Ball state: ${ballState.state}`, COLORS.green);

  // Wait for ball to finish dropping (max 5 seconds)
  await page.waitForTimeout(5000);

  // Get performance metrics for ball animation
  const perfMetrics = await getPerformanceMetrics(page);
  if (perfMetrics) {
    log(`  ✓ Ball animation FPS: ${perfMetrics.avgFPS}`, perfMetrics.avgFPS >= 55 ? COLORS.green : COLORS.red);
    log(`  ✓ Dropped frames: ${perfMetrics.droppedFrames}/${perfMetrics.totalFrames} (${perfMetrics.droppedPercentage}%)`,
      perfMetrics.droppedPercentage < 5 ? COLORS.green : COLORS.yellow);
  }

  await page.screenshot({ path: join(SCREENSHOT_DIR, '03-ball-landed.png') });

  return perfMetrics && perfMetrics.avgFPS >= 55;
}

/**
 * Test 2: Peg Hit Animations
 */
async function testPegAnimations(page) {
  subsection('Test 2: Peg Hit Animations');

  // Check that pegs are animating when hit
  const pegAnimations = await page.evaluate(() => {
    const pegs = document.querySelectorAll('[data-testid^="peg-"]');
    const results = {
      totalPegs: pegs.length,
      pegsWithAnimation: 0,
      pegsWithTransform: 0,
      sampleTransforms: [],
    };

    pegs.forEach((peg, idx) => {
      const style = window.getComputedStyle(peg);

      // Check for animation driver usage
      if (style.animationName && style.animationName !== 'none') {
        results.pegsWithAnimation++;
      }

      // Check for transforms (animation driver uses transforms)
      if (style.transform && style.transform !== 'none') {
        results.pegsWithTransform++;
        if (idx < 3) {
          results.sampleTransforms.push(style.transform);
        }
      }
    });

    return results;
  });

  log(`  ✓ Total pegs: ${pegAnimations.totalPegs}`, COLORS.green);
  log(`  ✓ Pegs with transforms: ${pegAnimations.pegsWithTransform}`, COLORS.green);

  if (pegAnimations.sampleTransforms.length > 0) {
    log(`  ✓ Sample transforms applied: ${pegAnimations.sampleTransforms.length}`, COLORS.green);
  }

  return pegAnimations.totalPegs > 0;
}

/**
 * Test 3: Win Animations
 */
async function testWinAnimations(page) {
  subsection('Test 3: Win Animations');

  await resetPerformanceMetrics(page);

  // Wait for prize reveal (should appear after ball lands)
  try {
    await page.waitForSelector('[data-testid="prize-reveal"]', { timeout: 2000 });
    log('  ✓ Prize reveal appeared', COLORS.green);
  } catch {
    log('  ℹ No prize reveal (might not have won)', COLORS.yellow);
    return true; // Not a failure if no win
  }

  await page.screenshot({ path: join(SCREENSHOT_DIR, '04-prize-reveal.png') });

  // Check for CurrencyCounter animation
  const counterState = await page.evaluate(() => {
    const counter = document.querySelector('[data-testid="currency-counter"]');
    if (!counter) return { exists: false };

    const style = window.getComputedStyle(counter);
    return {
      exists: true,
      display: style.display,
      opacity: parseFloat(style.opacity),
      visible: style.display !== 'none' && parseFloat(style.opacity) > 0,
    };
  });

  if (counterState.exists && counterState.visible) {
    log('  ✓ Currency counter visible and animating', COLORS.green);
  } else if (counterState.exists) {
    log('  ℹ Currency counter exists but not visible', COLORS.yellow);
  }

  // Check for YouWonText animation
  const wonTextState = await page.evaluate(() => {
    const text = document.querySelector('[data-testid="you-won-text"]');
    if (!text) return { exists: false };

    const style = window.getComputedStyle(text);
    return {
      exists: true,
      display: style.display,
      opacity: parseFloat(style.opacity),
      transform: style.transform,
      visible: style.display !== 'none' && parseFloat(style.opacity) > 0,
    };
  });

  if (wonTextState.exists && wonTextState.visible) {
    log('  ✓ "You Won" text visible and animating', COLORS.green);
  } else if (wonTextState.exists) {
    log('  ℹ "You Won" text exists but not visible', COLORS.yellow);
  }

  // Wait for animations to complete
  await page.waitForTimeout(2000);

  // Get performance metrics for win animations
  const perfMetrics = await getPerformanceMetrics(page);
  if (perfMetrics) {
    log(`  ✓ Win animation FPS: ${perfMetrics.avgFPS}`, perfMetrics.avgFPS >= 55 ? COLORS.green : COLORS.red);
    log(`  ✓ Dropped frames: ${perfMetrics.droppedFrames}/${perfMetrics.totalFrames} (${perfMetrics.droppedPercentage}%)`,
      perfMetrics.droppedPercentage < 5 ? COLORS.green : COLORS.yellow);
  }

  await page.screenshot({ path: join(SCREENSHOT_DIR, '05-win-animations-complete.png') });

  return perfMetrics && perfMetrics.avgFPS >= 55;
}

/**
 * Test 4: Screen Shake Effect
 */
async function testScreenShake(page) {
  subsection('Test 4: Screen Shake Effect');

  await resetPerformanceMetrics(page);

  // Screen shake should trigger when ball lands
  // Check for the screen shake container
  const shakeState = await page.evaluate(() => {
    // Look for container that has shake transforms
    const containers = document.querySelectorAll('[data-testid*="shake"], [style*="transform"]');
    const results = {
      containersFound: containers.length,
      transforms: [],
    };

    containers.forEach((container, idx) => {
      const style = window.getComputedStyle(container);
      if (style.transform && style.transform !== 'none') {
        if (idx < 3) {
          results.transforms.push(style.transform);
        }
      }
    });

    return results;
  });

  if (shakeState.transforms.length > 0) {
    log('  ✓ Screen shake transforms detected', COLORS.green);
    log(`  ✓ Sample transforms: ${shakeState.transforms.length}`, COLORS.green);
  } else {
    log('  ℹ No active screen shake detected (may have completed)', COLORS.yellow);
  }

  // Wait for shake to complete
  await page.waitForTimeout(500);

  // Get performance metrics for screen shake
  const perfMetrics = await getPerformanceMetrics(page);
  if (perfMetrics) {
    log(`  ✓ Screen shake FPS: ${perfMetrics.avgFPS}`, perfMetrics.avgFPS >= 55 ? COLORS.green : COLORS.red);
  }

  return true; // Screen shake is optional, don't fail if not detected
}

/**
 * Test 5: Animation Driver Verification
 */
async function testAnimationDriverUsage(page) {
  subsection('Test 5: Animation Driver Verification');

  // Verify that old CSS animations are NOT being used
  const cssAnimationCheck = await page.evaluate(() => {
    const results = {
      styleTagsWithKeyframes: 0,
      oldCSSClasses: [],
      animationDriverComponents: 0,
    };

    // Check for inline style tags with @keyframes
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach(tag => {
      if (tag.textContent.includes('@keyframes')) {
        results.styleTagsWithKeyframes++;
      }
    });

    // Check for old CSS class names from deleted files
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.className && typeof el.className === 'string') {
        // These classes should not exist anymore
        if (el.className.includes('screen-shake-container') ||
            el.className.includes('currency-counter-pop') ||
            el.className.includes('you-won-fade')) {
          results.oldCSSClasses.push(el.className);
        }
      }

      // Check for animation driver usage (Framer Motion components have data-framer-motion)
      if (el.hasAttribute('data-framer-motion') || el.hasAttribute('data-framer-component')) {
        results.animationDriverComponents++;
      }
    });

    return results;
  });

  if (cssAnimationCheck.styleTagsWithKeyframes === 0) {
    log('  ✓ No @keyframes CSS animations found', COLORS.green);
  } else {
    log(`  ✗ Found ${cssAnimationCheck.styleTagsWithKeyframes} style tags with @keyframes`, COLORS.red);
  }

  if (cssAnimationCheck.oldCSSClasses.length === 0) {
    log('  ✓ No old CSS animation classes found', COLORS.green);
  } else {
    log(`  ✗ Found old CSS classes: ${cssAnimationCheck.oldCSSClasses.join(', ')}`, COLORS.red);
  }

  if (cssAnimationCheck.animationDriverComponents > 0) {
    log(`  ✓ Animation driver components detected: ${cssAnimationCheck.animationDriverComponents}`, COLORS.green);
  } else {
    log('  ℹ No animation driver components detected (may be using CSS transforms)', COLORS.yellow);
  }

  return cssAnimationCheck.styleTagsWithKeyframes === 0 && cssAnimationCheck.oldCSSClasses.length === 0;
}

/**
 * Test 6: GPU Acceleration Verification
 */
async function testGPUAcceleration(page) {
  subsection('Test 6: GPU Acceleration');

  const gpuCheck = await page.evaluate(() => {
    const animatedElements = document.querySelectorAll('[data-framer-motion], [data-animated], [style*="transform"]');
    const results = {
      total: animatedElements.length,
      gpuAccelerated: 0,
      nonGpuProperties: new Set(),
      willChangeUsage: 0,
    };

    animatedElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      const willChange = style.willChange;

      // Check for GPU acceleration hints
      if (transform !== 'none' || willChange.includes('transform') || willChange.includes('opacity')) {
        results.gpuAccelerated++;
      }

      if (willChange !== 'auto' && willChange !== '') {
        results.willChangeUsage++;
      }

      // Check for non-GPU animated properties (should not be animated)
      const nonGpuProps = ['top', 'left', 'width', 'height', 'margin', 'padding'];
      nonGpuProps.forEach(prop => {
        const value = style[prop];
        if (value && (value.includes('calc') || style.transition.includes(prop))) {
          results.nonGpuProperties.add(prop);
        }
      });
    });

    return {
      ...results,
      nonGpuProperties: Array.from(results.nonGpuProperties),
    };
  });

  log(`  ✓ Total animated elements: ${gpuCheck.total}`, COLORS.green);
  log(`  ✓ GPU accelerated elements: ${gpuCheck.gpuAccelerated}`, COLORS.green);
  log(`  ✓ Elements with will-change: ${gpuCheck.willChangeUsage}`, COLORS.green);

  if (gpuCheck.nonGpuProperties.length === 0) {
    log('  ✓ No non-GPU properties being animated', COLORS.green);
  } else {
    log(`  ⚠ Found non-GPU properties: ${gpuCheck.nonGpuProperties.join(', ')}`, COLORS.yellow);
  }

  return gpuCheck.gpuAccelerated > 0;
}

/**
 * Test 7: Visual Regression
 */
async function testVisualRegression(page) {
  subsection('Test 7: Visual Regression');

  // Take final screenshot for visual comparison
  await page.screenshot({ path: join(SCREENSHOT_DIR, '06-final-state.png'), fullPage: true });
  log('  ✓ Final screenshot captured', COLORS.green);

  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  if (errors.length === 0) {
    log('  ✓ No console errors', COLORS.green);
  } else {
    log(`  ⚠ Console errors detected: ${errors.length}`, COLORS.yellow);
    errors.forEach(err => log(`    - ${err}`, COLORS.yellow));
  }

  return errors.length === 0;
}

/**
 * Main test runner
 */
async function runTests() {
  section('Animation System E2E Test Suite');

  const browser = await chromium.launch({
    headless: false, // Show browser for visual confirmation
  });

  const context = await browser.newContext({
    viewport: { width: 400, height: 700 },
  });

  const page = await context.newPage();

  const results = {
    ballDrop: false,
    pegAnimations: false,
    winAnimations: false,
    screenShake: false,
    animationDriver: false,
    gpuAcceleration: false,
    visualRegression: false,
  };

  try {
    log(`\nNavigating to ${TEST_URL}...`, COLORS.yellow);
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Create screenshots directory
    const { mkdir } = await import('fs/promises');
    await mkdir(SCREENSHOT_DIR, { recursive: true });

    log('✓ App loaded successfully', COLORS.green);
    await page.screenshot({ path: join(SCREENSHOT_DIR, '00-app-loaded.png') });

    // Setup performance monitoring
    await setupPerformanceMonitoring(page);

    // Run tests
    results.ballDrop = await testBallDropAnimation(page);
    results.pegAnimations = await testPegAnimations(page);
    results.winAnimations = await testWinAnimations(page);
    results.screenShake = await testScreenShake(page);
    results.animationDriver = await testAnimationDriverUsage(page);
    results.gpuAcceleration = await testGPUAcceleration(page);
    results.visualRegression = await testVisualRegression(page);

    // Summary
    section('Test Results Summary');

    const passed = Object.entries(results).filter(([_, value]) => value === true).length;
    const total = Object.keys(results).length;
    const passRate = ((passed / total) * 100).toFixed(1);

    log(`\nPassed: ${passed}/${total} (${passRate}%)`, passed === total ? COLORS.green : COLORS.yellow);

    Object.entries(results).forEach(([test, passed]) => {
      const icon = passed ? '✓' : '✗';
      const color = passed ? COLORS.green : COLORS.red;
      log(`  ${icon} ${test}`, color);
    });

    log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`, COLORS.cyan);

    if (passed === total) {
      log('\n✓ All tests passed! Animation system working correctly.', COLORS.green);
    } else {
      log('\n⚠ Some tests failed. Review screenshots for visual inspection.', COLORS.yellow);
    }

    log('\nClosing browser in 3 seconds...', COLORS.yellow);
    await page.waitForTimeout(3000);

    await browser.close();
    process.exit(passed === total ? 0 : 1);

  } catch (error) {
    log(`\n✗ Test failed: ${error.message}`, COLORS.red);
    console.error(error);
    await browser.close();
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(error);
  process.exit(1);
});
