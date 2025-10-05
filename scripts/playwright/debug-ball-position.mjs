#!/usr/bin/env node
/**
 * Playwright script to debug ball position issue before prize reveal
 * Captures screenshots at key moments to understand the ball reset problem
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, '../../screenshots/ball-debug');

async function debugBallPosition() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();

  console.log('🎯 Starting ball position debug...');

  // Navigate to game
  await page.goto('http://localhost:5173');

  // Wait for ready state (drop ball button appears)
  await page.waitForSelector('button:has-text("Drop Ball")', { timeout: 10000 });
  console.log('✅ Game ready');

  // Click drop ball
  await page.click('button:has-text("Drop Ball")');
  console.log('🎲 Ball dropped');

  // Wait for ball element to appear
  await page.waitForSelector('[data-testid="plinko-ball"]', { timeout: 5000 });

  // Wait for ball to be in dropping state
  await page.waitForFunction(
    () => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      return ball && ball.dataset.state === 'dropping';
    },
    { timeout: 5000 }
  );

  // Wait for animation to complete (ball in landed state)
  await page.waitForFunction(
    () => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      return ball && ball.dataset.state === 'landed';
    },
    { timeout: 15000 }
  );

  // Get ball position when landed
  const landedPosition = await page.evaluate(() => {
    const ball = document.querySelector('[data-testid="plinko-ball"]');
    if (!ball) return null;
    const transform = window.getComputedStyle(ball).transform;
    const matrix = new DOMMatrix(transform);
    return { x: matrix.m41, y: matrix.m42, state: ball.dataset.state };
  });

  console.log('⚽ Ball landed at:', landedPosition);
  await page.screenshot({
    path: path.join(screenshotDir, '1-landed.png'),
    fullPage: false
  });

  // Wait a moment to see if ball moves
  await page.waitForTimeout(100);

  const positionBeforeReveal = await page.evaluate(() => {
    const ball = document.querySelector('[data-testid="plinko-ball"]');
    if (!ball) return { exists: false };
    const transform = window.getComputedStyle(ball).transform;
    const matrix = new DOMMatrix(transform);
    return {
      exists: true,
      x: matrix.m41,
      y: matrix.m42,
      state: ball.dataset.state,
      visible: window.getComputedStyle(ball).display !== 'none'
    };
  });

  console.log('⚽ Ball position just before reveal:', positionBeforeReveal);
  await page.screenshot({
    path: path.join(screenshotDir, '2-before-reveal.png'),
    fullPage: false
  });

  // Wait for prize reveal to appear
  await page.waitForFunction(
    () => {
      return document.querySelector('[role="status"]') !== null;
    },
    { timeout: 2000 }
  );

  console.log('🎁 Prize reveal appeared');

  const positionDuringReveal = await page.evaluate(() => {
    const ball = document.querySelector('[data-testid="plinko-ball"]');
    if (!ball) return { exists: false };
    const transform = window.getComputedStyle(ball).transform;
    const matrix = new DOMMatrix(transform);
    return {
      exists: true,
      x: matrix.m41,
      y: matrix.m42,
      state: ball.dataset.state,
      visible: window.getComputedStyle(ball).display !== 'none'
    };
  });

  console.log('⚽ Ball position during reveal:', positionDuringReveal);
  await page.screenshot({
    path: path.join(screenshotDir, '3-during-reveal.png'),
    fullPage: false
  });

  console.log('\n📊 Analysis:');
  if (!positionDuringReveal.exists) {
    console.log('❌ Ball removed from DOM during reveal');
  } else if (!positionDuringReveal.visible) {
    console.log('❌ Ball hidden (display: none) during reveal');
  } else if (landedPosition && positionDuringReveal.exists) {
    const xDiff = Math.abs(landedPosition.x - positionDuringReveal.x);
    const yDiff = Math.abs(landedPosition.y - positionDuringReveal.y);
    if (xDiff > 5 || yDiff > 5) {
      console.log(`❌ Ball moved! Δx: ${xDiff.toFixed(2)}px, Δy: ${yDiff.toFixed(2)}px`);
    } else {
      console.log('✅ Ball stayed in position');
    }
  }

  console.log('\n📸 Screenshots saved to:', screenshotDir);

  await browser.close();
}

// Create screenshot directory
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

debugBallPosition().catch(console.error);
