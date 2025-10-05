/**
 * Visual quality testing script
 * Opens the game and captures screenshots + behavior analysis
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testVisualQuality() {
  console.log('🎯 Starting AAA Quality Visual Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  try {
    // Navigate to game
    console.log('📱 Opening game at http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, '../../screenshots/quality-test');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log('\n📸 Taking initial screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-initial-state.png'),
      fullPage: true,
    });

    // Wait for game to be ready
    await page.waitForSelector('[data-testid="plinko-board"]', { timeout: 5000 });
    console.log('✅ Game board loaded\n');

    // Test Issue 1: Check if pegs overflow borders
    console.log('🔍 TEST 1: Checking peg overflow...');
    const pegOverflow = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="plinko-board"]');
      const boardRect = board.getBoundingClientRect();
      const pegs = Array.from(document.querySelectorAll('[data-testid^="peg-"]'));

      let overflowCount = 0;
      let maxOverflow = 0;

      pegs.forEach((peg) => {
        const pegRect = peg.getBoundingClientRect();
        const pegCenterX = pegRect.left + pegRect.width / 2;
        const pegCenterY = pegRect.top + pegRect.height / 2;

        // Check if peg center is outside board (accounting for 12px borders)
        const BORDER = 12;
        if (pegCenterX < boardRect.left + BORDER || pegCenterX > boardRect.right - BORDER) {
          overflowCount++;
          const overflow = Math.max(
            boardRect.left + BORDER - pegCenterX,
            pegCenterX - (boardRect.right - BORDER)
          );
          maxOverflow = Math.max(maxOverflow, overflow);
        }
      });

      return {
        totalPegs: pegs.length,
        overflowCount,
        maxOverflow: Math.round(maxOverflow),
        passed: overflowCount === 0,
      };
    });

    console.log(`   Total pegs: ${pegOverflow.totalPegs}`);
    console.log(`   Pegs overflowing: ${pegOverflow.overflowCount}`);
    if (pegOverflow.maxOverflow > 0) {
      console.log(`   Max overflow: ${pegOverflow.maxOverflow}px`);
    }
    console.log(`   ${pegOverflow.passed ? '✅ PASS' : '❌ FAIL'}: Peg positioning\n`);

    // Test Issue 2: Check ball visual quality
    console.log('🔍 TEST 2: Ball visual quality...');
    await page.screenshot({
      path: path.join(screenshotsDir, '02-before-drop.png'),
    });

    // Click to start game
    const startButton = await page.$('button');
    if (startButton) {
      await startButton.click();
      console.log('   Started game...');
      await page.waitForTimeout(500);
    }

    // Wait for ball to appear
    await page.waitForSelector('[data-testid="plinko-ball"]', { timeout: 3000 });
    console.log('   Ball appeared');

    // Take screenshot during drop
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-ball-dropping.png'),
    });

    // Analyze ball during motion
    const ballQuality = await page.evaluate(() => {
      const ball = document.querySelector('[data-testid="plinko-ball"]');
      if (!ball) return { found: false };

      const styles = window.getComputedStyle(ball);
      const transform = styles.transform;
      const background = styles.background;

      return {
        found: true,
        hasRotation: transform !== 'none' && transform.includes('rotate'),
        hasGradient: background.includes('gradient'),
        hasShadow: styles.boxShadow !== 'none',
        width: styles.width,
        height: styles.height,
      };
    });

    console.log(`   Ball found: ${ballQuality.found ? 'Yes' : 'No'}`);
    if (ballQuality.found) {
      console.log(`   Has rotation: ${ballQuality.hasRotation ? '✅' : '❌'}`);
      console.log(`   Has gradient: ${ballQuality.hasGradient ? '✅' : '❌'}`);
      console.log(`   Has shadow: ${ballQuality.hasShadow ? '✅' : '❌'}`);
      console.log(`   Size: ${ballQuality.width} x ${ballQuality.height}`);
    }

    // Test Issue 3: Physics realism
    console.log('\n🔍 TEST 3: Physics realism (analyzing motion)...');

    const physicsData = [];
    const startTime = Date.now();

    // Sample ball position over time
    while (Date.now() - startTime < 3000) {
      const position = await page.evaluate(() => {
        const ball = document.querySelector('[data-testid="plinko-ball"]');
        if (!ball) return null;

        const rect = ball.getBoundingClientRect();
        const transform = window.getComputedStyle(ball).transform;

        return {
          x: rect.left,
          y: rect.top,
          rotation: transform,
          timestamp: Date.now(),
        };
      });

      if (position) {
        physicsData.push(position);
      }

      await page.waitForTimeout(16); // ~60fps sampling
    }

    console.log(`   Captured ${physicsData.length} position samples`);

    // Analyze for sliding vs bouncing
    let slidingFrames = 0;
    let bouncingFrames = 0;

    for (let i = 2; i < physicsData.length; i++) {
      const prev2 = physicsData[i - 2];
      const prev1 = physicsData[i - 1];
      const curr = physicsData[i];

      if (!prev2 || !prev1 || !curr) continue;

      const vy1 = curr.y - prev1.y;
      const vy2 = prev1.y - prev2.y;

      // If velocity direction changes (bounce)
      if (Math.sign(vy1) !== Math.sign(vy2) && Math.abs(vy1) > 1) {
        bouncingFrames++;
      }

      // If moving horizontally with constant vertical (sliding)
      const vx = Math.abs(curr.x - prev1.x);
      if (vx > 2 && Math.abs(vy1 - vy2) < 0.5) {
        slidingFrames++;
      }
    }

    const slidingPercent = ((slidingFrames / physicsData.length) * 100).toFixed(1);
    const bouncingPercent = ((bouncingFrames / physicsData.length) * 100).toFixed(1);

    console.log(`   Sliding behavior: ${slidingPercent}% of frames`);
    console.log(`   Bouncing behavior: ${bouncingPercent}% of frames`);
    console.log(
      `   ${parseFloat(slidingPercent) < 10 ? '✅' : '❌'}: Physics feels natural (< 10% sliding)\n`
    );

    // Take final screenshot
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '04-final-state.png'),
    });

    // Test Issue 4: Peg animations
    console.log('🔍 TEST 4: Peg hit animations...');

    const pegAnimations = await page.evaluate(() => {
      const pegs = Array.from(document.querySelectorAll('[data-testid^="peg-"]'));
      let animatedCount = 0;

      pegs.forEach((peg) => {
        const styles = window.getComputedStyle(peg);
        if (styles.animation !== 'none' && styles.animation !== '') {
          animatedCount++;
        }
      });

      return {
        totalPegs: pegs.length,
        animatedCount,
      };
    });

    console.log(
      `   Pegs with animations: ${pegAnimations.animatedCount}/${pegAnimations.totalPegs}`
    );
    console.log(`   ${pegAnimations.animatedCount > 0 ? '✅' : '❌'}: Peg animations working\n`);

    console.log('📊 SUMMARY:');
    console.log('─'.repeat(50));
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    console.log('\nPlease manually review:');
    console.log('1. Peg positioning (no overflow beyond borders)');
    console.log('2. Ball visual quality (premium golden appearance)');
    console.log('3. Physics realism (bouncing not sliding)');
    console.log('4. Peg animations (glow + shake on hit)');
    console.log('5. Overall AAA quality standards\n');

    // Keep browser open for manual inspection
    console.log('Browser will stay open for manual inspection...');
    console.log('Press Ctrl+C when done.\n');

    await new Promise(() => {}); // Keep alive
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testVisualQuality().catch(console.error);
