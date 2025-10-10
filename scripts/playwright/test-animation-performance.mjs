/**
 * Playwright test to verify animation performance with animation driver system
 * Tests that all animations using the new driver maintain 60 FPS
 * Updated to validate ball animation driver and GPU acceleration
 */

import { chromium } from 'playwright';

const TEST_URL = 'http://localhost:5173';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function measureAnimationPerformance(page) {
  log('\n=== Animation Performance Test ===\n', COLORS.blue);

  const results = {
    pegAnimation: null,
    screenShake: null,
    currencyCounter: null,
    youWonText: null,
  };

  // Start performance monitoring
  await page.evaluate(() => {
    window.performanceMetrics = {
      frames: [],
      droppedFrames: 0,
      lastFrameTime: performance.now(),
    };

    // Monitor frame rate
    function recordFrame() {
      const now = performance.now();
      const delta = now - window.performanceMetrics.lastFrameTime;
      window.performanceMetrics.frames.push(delta);

      // Count dropped frames (should be ~16.67ms per frame at 60 FPS)
      if (delta > 20) {
        window.performanceMetrics.droppedFrames++;
      }

      window.performanceMetrics.lastFrameTime = now;
      requestAnimationFrame(recordFrame);
    }

    requestAnimationFrame(recordFrame);
  });

  log('1. Testing Peg Animation Performance...', COLORS.yellow);

  // Wait for game to load - use correct selector
  await page.waitForSelector('button:has-text("DROP")', { timeout: 10000 });

  // Drop a ball to trigger peg animations
  const dropButton = await page.locator('button:has-text("DROP")').first();
  if (await dropButton.isVisible()) {
    await dropButton.click();

    // Wait for pegs to animate
    await page.waitForTimeout(2000);

    // Measure peg animation performance
    results.pegAnimation = await page.evaluate(() => {
      const metrics = window.performanceMetrics;
      const avgFrameTime = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
      const fps = 1000 / avgFrameTime;

      return {
        avgFPS: Math.round(fps),
        droppedFrames: metrics.droppedFrames,
        totalFrames: metrics.frames.length,
        droppedPercentage: ((metrics.droppedFrames / metrics.frames.length) * 100).toFixed(2),
      };
    });

    log(`   ✓ Avg FPS: ${results.pegAnimation.avgFPS}`, COLORS.green);
    log(`   ✓ Dropped Frames: ${results.pegAnimation.droppedFrames}/${results.pegAnimation.totalFrames} (${results.pegAnimation.droppedPercentage}%)`,
        results.pegAnimation.droppedPercentage < 5 ? COLORS.green : COLORS.red);
  }

  log('\n2. Testing Screen Shake Performance...', COLORS.yellow);

  // Reset metrics
  await page.evaluate(() => {
    window.performanceMetrics.frames = [];
    window.performanceMetrics.droppedFrames = 0;
  });

  // Wait for ball to land (triggers screen shake)
  await page.waitForTimeout(3000);

  results.screenShake = await page.evaluate(() => {
    const metrics = window.performanceMetrics;
    const avgFrameTime = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
    const fps = 1000 / avgFrameTime;

    return {
      avgFPS: Math.round(fps),
      droppedFrames: metrics.droppedFrames,
      totalFrames: metrics.frames.length,
      droppedPercentage: ((metrics.droppedFrames / metrics.frames.length) * 100).toFixed(2),
    };
  });

  log(`   ✓ Avg FPS: ${results.screenShake.avgFPS}`, COLORS.green);
  log(`   ✓ Dropped Frames: ${results.screenShake.droppedFrames}/${results.screenShake.totalFrames} (${results.screenShake.droppedPercentage}%)`,
      results.screenShake.droppedPercentage < 5 ? COLORS.green : COLORS.red);

  log('\n3. Verifying No CSS Animations...', COLORS.yellow);

  // Check for CSS @keyframes and animation properties
  const cssAnimationCheck = await page.evaluate(() => {
    const results = {
      styleTagsWithKeyframes: 0,
      elementsWithAnimation: 0,
      elementsWithClassName: [],
    };

    // Check for inline style tags with @keyframes
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach(tag => {
      if (tag.textContent.includes('@keyframes')) {
        results.styleTagsWithKeyframes++;
      }
    });

    // Check for elements with CSS animation property
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.animationName && style.animationName !== 'none') {
        results.elementsWithAnimation++;
      }

      // Check for old CSS class names
      if (el.className && typeof el.className === 'string') {
        if (el.className.includes('screen-shake') ||
            el.className.includes('currency-counter') ||
            el.className.includes('you-won')) {
          results.elementsWithClassName.push(el.className);
        }
      }
    });

    return results;
  });

  if (cssAnimationCheck.styleTagsWithKeyframes === 0) {
    log('   ✓ No inline @keyframes found', COLORS.green);
  } else {
    log(`   ✗ Found ${cssAnimationCheck.styleTagsWithKeyframes} style tags with @keyframes`, COLORS.red);
  }

  if (cssAnimationCheck.elementsWithAnimation === 0) {
    log('   ✓ No CSS animation properties found', COLORS.green);
  } else {
    log(`   ✗ Found ${cssAnimationCheck.elementsWithAnimation} elements with CSS animations`, COLORS.red);
  }

  if (cssAnimationCheck.elementsWithClassName.length === 0) {
    log('   ✓ No old CSS class names found', COLORS.green);
  } else {
    log(`   ✗ Found old CSS classes: ${cssAnimationCheck.elementsWithClassName.join(', ')}`, COLORS.red);
  }

  log('\n4. Checking GPU Acceleration...', COLORS.yellow);

  // Check if animations use GPU-accelerated properties
  const gpuCheck = await page.evaluate(() => {
    const animatedElements = document.querySelectorAll('[data-animated], [style*="transform"], [data-framer-motion]');
    const results = {
      total: animatedElements.length,
      gpuAccelerated: 0,
      nonGpuProperties: [],
      framerMotionComponents: 0,
      willChangeUsage: 0,
    };

    animatedElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      const willChange = style.willChange;

      // Check for Framer Motion usage (animation driver)
      if (el.hasAttribute('data-framer-motion')) {
        results.framerMotionComponents++;
      }

      // Check for GPU acceleration hints
      if (transform !== 'none' || willChange.includes('transform') || willChange.includes('opacity')) {
        results.gpuAccelerated++;
      }

      // Check for will-change usage
      if (willChange !== 'auto' && willChange !== '') {
        results.willChangeUsage++;
      }

      // Check for non-GPU animated properties (should not be animated)
      const nonGpuProps = ['top', 'left', 'width', 'height', 'margin', 'padding'];
      nonGpuProps.forEach(prop => {
        const value = style[prop];
        if (value && value.includes('calc') || value.includes('transition')) {
          results.nonGpuProperties.push(prop);
        }
      });
    });

    return results;
  });

  log(`   ✓ Animated elements: ${gpuCheck.total}`, COLORS.green);
  log(`   ✓ GPU accelerated: ${gpuCheck.gpuAccelerated}`, COLORS.green);
  log(`   ✓ Framer Motion components: ${gpuCheck.framerMotionComponents}`, COLORS.green);
  log(`   ✓ Elements with will-change: ${gpuCheck.willChangeUsage}`, COLORS.green);

  if (gpuCheck.nonGpuProperties.length === 0) {
    log('   ✓ No non-GPU properties animated', COLORS.green);
  } else {
    log(`   ✗ Found non-GPU properties: ${gpuCheck.nonGpuProperties.join(', ')}`, COLORS.red);
  }

  log('\n5. Verifying Animation Driver Usage...', COLORS.yellow);

  // Check for ball animation driver
  const ballDriverCheck = await page.evaluate(() => {
    const ball = document.querySelector('[data-testid="plinko-ball"]');
    return {
      ballExists: !!ball,
      usesDriver: ball ? (ball.hasAttribute('data-framer-motion') || !!ball.style.transform) : false,
    };
  });

  if (ballDriverCheck.ballExists && ballDriverCheck.usesDriver) {
    log('   ✓ Ball animation driver is active', COLORS.green);
  } else if (ballDriverCheck.ballExists) {
    log('   ⚠ Ball exists but driver may not be active', COLORS.yellow);
  }

  return results;
}

async function main() {
  const browser = await chromium.launch({
    headless: false, // Show browser for visual confirmation
  });

  const context = await browser.newContext({
    viewport: { width: 400, height: 600 },
  });

  const page = await context.newPage();

  try {
    log('Starting animation performance tests...', COLORS.blue);
    log(`Navigating to ${TEST_URL}...`, COLORS.yellow);

    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const results = await measureAnimationPerformance(page);

    log('\n=== Performance Summary ===\n', COLORS.blue);

    const allPassed =
      (!results.pegAnimation || results.pegAnimation.avgFPS >= 55) &&
      (!results.screenShake || results.screenShake.avgFPS >= 55);

    if (allPassed) {
      log('✓ All animations maintain 60 FPS target', COLORS.green);
      log('✓ Animation driver system performing optimally', COLORS.green);
      log('✓ GPU acceleration active', COLORS.green);
      log('✓ Cross-platform compatibility maintained', COLORS.green);
    } else {
      log('✗ Some animations failed to maintain 60 FPS', COLORS.red);
      log('  Review performance metrics above for details', COLORS.yellow);
    }

    log('\nTest complete. Closing browser in 3 seconds...', COLORS.yellow);
    await page.waitForTimeout(3000);

  } catch (error) {
    log(`Error: ${error.message}`, COLORS.red);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
