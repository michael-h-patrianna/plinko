/**
 * Diagnostic script to identify stuck ball and speed edge cases
 * Runs simulations and reports statistics
 */

import { generateTrajectory } from '../../dist/game/trajectory.js';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;
const MAX_REALISTIC_SPEED = 800;
const TERMINAL_VELOCITY = 600;

console.log('🔬 Diagnosing Edge Cases...\n');

let totalTests = 0;
let stuckBalls = 0;
let speedViolations = 0;
let distanceViolations = 0;
let maxSpeedSeen = 0;
let maxDistanceSeen = 0;
let totalGenerationTime = 0;

const numTests = 100;

for (let seed = 0; seed < numTests; seed++) {
  totalTests++;

  const startTime = Date.now();
  let result;
  try {
    result = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      seed: seed * 7919,
    });
  } catch (error) {
    console.error(`❌ Test ${seed} failed to generate trajectory:`, error.message);
    stuckBalls++;
    continue;
  }
  const generationTime = Date.now() - startTime;
  totalGenerationTime += generationTime;

  const { trajectory, landedSlot } = result;
  const bucketZoneY = BOARD_HEIGHT * 0.7;
  const lastFrame = trajectory[trajectory.length - 1];

  // Check if ball reached bucket
  if (lastFrame.y < bucketZoneY - 10) {
    console.log(`⚠️  Test ${seed}: Ball stuck at y=${lastFrame.y.toFixed(2)} (bucket at ${bucketZoneY})`);
    stuckBalls++;
  }

  // Check for speed violations
  for (let i = 0; i < trajectory.length; i++) {
    const frame = trajectory[i];
    const speed = Math.sqrt((frame.vx ?? 0) ** 2 + (frame.vy ?? 0) ** 2);

    if (speed > maxSpeedSeen) {
      maxSpeedSeen = speed;
    }

    if (speed > MAX_REALISTIC_SPEED) {
      console.log(
        `⚠️  Test ${seed}, Frame ${i}: Speed violation ${speed.toFixed(2)}px/s at (${frame.x.toFixed(2)}, ${frame.y.toFixed(2)})`
      );
      speedViolations++;
      break;
    }

    // Check frame-to-frame distance
    if (i > 0) {
      const prevFrame = trajectory[i - 1];
      const dx = frame.x - prevFrame.x;
      const dy = frame.y - prevFrame.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 13.33 + 0.5;

      if (distance > maxDistanceSeen) {
        maxDistanceSeen = distance;
      }

      if (distance > maxDist) {
        console.log(
          `⚠️  Test ${seed}, Frame ${i}: Distance violation ${distance.toFixed(2)}px (max ${maxDist.toFixed(2)}px)`
        );
        distanceViolations++;
        break;
      }
    }
  }

  if ((seed + 1) % 25 === 0) {
    console.log(`✓ Completed ${seed + 1}/${numTests} tests...`);
  }
}

console.log('\n📊 Results:');
console.log(`Total tests: ${totalTests}`);
console.log(`Stuck balls: ${stuckBalls} (${((stuckBalls / totalTests) * 100).toFixed(2)}%)`);
console.log(`Speed violations: ${speedViolations} (${((speedViolations / totalTests) * 100).toFixed(2)}%)`);
console.log(`Distance violations: ${distanceViolations} (${((distanceViolations / totalTests) * 100).toFixed(2)}%)`);
console.log(`Max speed seen: ${maxSpeedSeen.toFixed(2)}px/s (limit: ${MAX_REALISTIC_SPEED}px/s)`);
console.log(`Max distance seen: ${maxDistanceSeen.toFixed(2)}px (limit: 13.83px)`);
console.log(`Avg generation time: ${(totalGenerationTime / totalTests).toFixed(0)}ms`);

if (stuckBalls > 0 || speedViolations > 0 || distanceViolations > 0) {
  console.log('\n❌ FAILURES DETECTED');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED');
}
