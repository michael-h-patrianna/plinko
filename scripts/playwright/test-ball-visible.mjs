#!/usr/bin/env node
/**
 * Test: Ball visibility during drop animation
 * Verifies that the ball renderer shows the ball correctly using the animation driver
 * Updated to validate new animation system
 */

import { chromium } from 'playwright';

async function testBallVisibility() {
  console.log('🎯 Testing ball visibility...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });

  try {
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    // Navigate to app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('✅ App loaded');

    // Wait for start button and click it
    await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 10000 });
    await page.click('button:has-text("Drop Ball")');
    console.log('🎲 Dropped ball');

    // Wait a moment for state to update
    await page.waitForTimeout(500);

    // Wait for ball to start dropping (countdown is 3 seconds)
    await page.waitForTimeout(4000);

    // Check what's actually rendering
    const debugInfo = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="plinko-board"]');
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      const launcher = document.querySelector('[data-testid="ball-launcher"]');
      const pegs = document.querySelectorAll('[data-testid^="peg-"]');

      return {
        boardExists: !!board,
        ballExists: !!ball,
        launcherExists: !!launcher,
        ballHTML: ball ? ball.outerHTML.substring(0, 200) : null,
        boardChildren: board ? board.children.length : 0,
        pegCount: pegs.length,
        ballState: ball ? ball.dataset.state : 'no ball element',
      };
    });

    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('Console errors:', errors.map(e => e.text));
    }

    console.log('\nAll console messages:');
    consoleMessages.forEach((msg, i) => {
      console.log(`  [${i}] ${msg.type}: ${msg.text}`);
    });

    console.log('\nDebug info:', debugInfo);

    if (!debugInfo.ballExists) {
      console.error('❌ Ball element never appeared');
      console.error('   This means OptimizedBallRenderer returned null');
      console.error('   Likely causes:');
      console.error('   1. getBallPosition() returned null');
      console.error('   2. ballState is idle/ready');
      console.error('   3. isSelectingPosition is true');
      process.exit(1);
    }

    // Wait for ball to appear and be in dropping state
    await page.waitForSelector('[data-testid="plinko-ball"]', { timeout: 1000 });

    // Check if ball is visible
    const ballVisible = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return { exists: false };

      const style = window.getComputedStyle(ball);
      const rect = ball.getBoundingClientRect();

      return {
        exists: true,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        transform: style.transform,
        hasPosition: rect.x !== 0 || rect.y !== 0,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        state: ball.dataset.state
      };
    });

    console.log('Ball status:', ballVisible);

    // Verify ball is actually visible
    if (!ballVisible.exists) {
      console.error('❌ FAIL: Ball element does not exist');
      process.exit(1);
    }

    if (ballVisible.display === 'none') {
      console.error('❌ FAIL: Ball has display: none');
      process.exit(1);
    }

    if (ballVisible.visibility === 'hidden') {
      console.error('❌ FAIL: Ball has visibility: hidden');
      process.exit(1);
    }

    if (parseFloat(ballVisible.opacity) === 0) {
      console.error('❌ FAIL: Ball has opacity: 0');
      process.exit(1);
    }

    if (ballVisible.transform === 'none') {
      console.error('❌ FAIL: Ball has no transform (likely at 0,0)');
      process.exit(1);
    }

    if (!ballVisible.hasPosition) {
      console.error('❌ FAIL: Ball is at position (0,0)');
      process.exit(1);
    }

    if (ballVisible.rect.width === 0 || ballVisible.rect.height === 0) {
      console.error('❌ FAIL: Ball has zero dimensions');
      process.exit(1);
    }

    console.log('✅ PASS: Ball is visible and positioned correctly');
    console.log(`   Position: (${ballVisible.rect.x.toFixed(1)}, ${ballVisible.rect.y.toFixed(1)})`);
    console.log(`   Size: ${ballVisible.rect.width}x${ballVisible.rect.height}`);
    console.log(`   State: ${ballVisible.state}`);

    // Verify animation driver is being used
    const animationDriverCheck = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return { driverInUse: false };

      // Check if ball is using animation driver (Framer Motion or direct transforms)
      const hasFramerMotion = ball.hasAttribute('data-framer-motion');
      const hasDirectTransform = ball.style.transform && ball.style.transform !== '';

      return {
        driverInUse: hasFramerMotion || hasDirectTransform,
        hasFramerMotion,
        hasDirectTransform,
      };
    });

    if (animationDriverCheck.driverInUse) {
      console.log('✅ Animation driver is being used for ball animation');
      if (animationDriverCheck.hasFramerMotion) {
        console.log('   - Using Framer Motion (animation driver)');
      }
      if (animationDriverCheck.hasDirectTransform) {
        console.log('   - Using direct transform manipulation');
      }
    } else {
      console.log('⚠️  WARNING: Animation driver may not be in use');
    }

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await browser.close();
    process.exit(1);
  }
}

testBallVisibility();
