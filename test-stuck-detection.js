/**
 * Test script to detect if ball gets stuck in trajectory simulation
 */

import { generateTrajectory } from './src/game/trajectory.ts';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

console.log('🔍 Testing Anti-Stuck Mechanism\n');
console.log('='.repeat(80));

let totalStuckFrames = 0;
let totalTests = 0;
let failedTests = [];

// Test all slots with multiple seeds
for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
  for (let seedOffset = 0; seedOffset < 5; seedOffset++) {
    const seed = 12345 + targetSlot * 100 + seedOffset;
    totalTests++;

    const trajectory = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      selectedIndex: targetSlot,
      seed
    });

    // Analyze trajectory for stuck behavior
    let consecutiveStuckFrames = 0;
    let maxStuckDuration = 0;
    let stuckEvents = [];

    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1];
      const curr = trajectory[i];

      // Skip rest frames at start (first 15 frames)
      if (i < 15) continue;

      // Skip bucket settling phase (y > 70% of board)
      if (curr.y > BOARD_HEIGHT * 0.7) continue;

      // Check if ball is making progress (moved >0.5px)
      const yProgress = Math.abs(curr.y - prev.y);
      const xProgress = Math.abs(curr.x - prev.x);
      const totalMovement = Math.sqrt(yProgress * yProgress + xProgress * xProgress);

      if (totalMovement < 0.5) {
        consecutiveStuckFrames++;
        if (consecutiveStuckFrames > maxStuckDuration) {
          maxStuckDuration = consecutiveStuckFrames;
        }
      } else {
        if (consecutiveStuckFrames > 10) { // More than 10 frames stuck
          stuckEvents.push({
            frame: i - consecutiveStuckFrames,
            duration: consecutiveStuckFrames,
            y: prev.y
          });
        }
        consecutiveStuckFrames = 0;
      }
    }

    // Report findings
    if (maxStuckDuration > 30) {
      console.log(`❌ Slot ${targetSlot}, Seed ${seed}:`);
      console.log(`   Max stuck duration: ${maxStuckDuration} frames (${(maxStuckDuration / 60).toFixed(2)}s)`);
      console.log(`   Stuck events: ${stuckEvents.length}`);
      stuckEvents.forEach(event => {
        console.log(`     - Frame ${event.frame}: stuck for ${event.duration} frames at y=${event.y.toFixed(1)}px`);
      });
      failedTests.push({ targetSlot, seed, maxStuckDuration, stuckEvents });
      totalStuckFrames += maxStuckDuration;
    } else if (maxStuckDuration > 10) {
      console.log(`⚠️  Slot ${targetSlot}, Seed ${seed}: Brief pause (${maxStuckDuration} frames) - acceptable`);
    } else {
      console.log(`✅ Slot ${targetSlot}, Seed ${seed}: No stuck behavior detected`);
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Summary:`);
console.log(`   Total tests: ${totalTests}`);
console.log(`   Passed: ${totalTests - failedTests.length}`);
console.log(`   Failed: ${failedTests.length}`);
console.log(`   Success rate: ${((totalTests - failedTests.length) / totalTests * 100).toFixed(1)}%`);

if (failedTests.length > 0) {
  console.log(`\n❌ FAILED: ${failedTests.length} trajectories had stuck ball behavior`);
  process.exit(1);
} else {
  console.log(`\n✅ SUCCESS: All trajectories completed without stuck ball behavior`);
  process.exit(0);
}
