/**
 * Comprehensive 1000-trajectory validation test
 * Verifies that ball physics work correctly across all scenarios
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';
import { selectPrize } from '../game/rng';
import { MOCK_PRIZES } from '../config/prizeTable';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

interface ValidationResult {
  testNumber: number;
  seed: number;
  targetSlot: number;
  passed: boolean;
  errors: string[];
  warnings: string[];
  finalY: number;
  finalX: number;
  maxStuckFrames: number;
  maxJumpDistance: number;
  reachedBucketZone: boolean;
}

describe('Comprehensive 1000-Trajectory Validation', () => {
  it('should validate 1000 random trajectories with correct physics', () => {
    const results: ValidationResult[] = [];
    let totalPassed = 0;
    let totalFailed = 0;

    console.log('\n🎯 Starting 1000-Trajectory Validation Test\n');
    console.log('='.repeat(80));

    for (let testNum = 0; testNum < 1000; testNum++) {
      // Generate random seed
      const seed = Math.floor(Math.random() * 1000000);

      // Select prize using same logic as game
      const { selectedIndex: targetSlot } = selectPrize(MOCK_PRIZES, seed);

      const errors: string[] = [];
      const warnings: string[] = [];

      // Generate trajectory
      const trajectory = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        selectedIndex: targetSlot,
        seed,
      });

      const finalFrame = trajectory[trajectory.length - 1];
      if (!finalFrame) {
        errors.push('Trajectory is empty');
        results.push({
          testNumber: testNum,
          seed,
          targetSlot,
          passed: false,
          errors,
          warnings,
          finalY: 0,
          finalX: 0,
          maxStuckFrames: 0,
          maxJumpDistance: 0,
          reachedBucketZone: false,
        });
        totalFailed++;
        continue;
      }

      // Calculate slot boundaries
      const slotWidth = BOARD_WIDTH / SLOT_COUNT;
      const slotLeftX = targetSlot * slotWidth;
      const slotRightX = (targetSlot + 1) * slotWidth;

      // Bucket zone is bottom 30% of board (slots are at bottom)
      const bucketZoneY = BOARD_HEIGHT * 0.7;
      const slotHeight = 90;
      const slotTopY = BOARD_HEIGHT - slotHeight; // 410px

      // Validation 1: Ball must traverse the whole playing field (reach bucket zone)
      let reachedBucketZone = false;
      let maxY = 0;
      for (const point of trajectory) {
        if (point.y >= bucketZoneY) {
          reachedBucketZone = true;
        }
        if (point.y > maxY) {
          maxY = point.y;
        }
      }

      if (!reachedBucketZone) {
        errors.push(
          `Ball never reached bucket zone (y >= ${bucketZoneY}px). Max Y reached: ${maxY.toFixed(1)}px`
        );
      }

      // Validation 2: Ball must land in correct slot (horizontally)
      const finalX = finalFrame.x;
      const isInCorrectSlot = finalX >= slotLeftX && finalX <= slotRightX;

      if (!isInCorrectSlot) {
        errors.push(
          `Ball landed in wrong slot. Final X: ${finalX.toFixed(1)}px, Target slot X range: [${slotLeftX.toFixed(1)}, ${slotRightX.toFixed(1)}]`
        );
      }

      // Validation 3: Detect stuck behavior (no movement for extended period)
      let consecutiveStuckFrames = 0;
      let maxStuckFrames = 0;
      const REST_FRAMES = 15; // Initial rest period is expected

      for (let i = REST_FRAMES + 1; i < trajectory.length; i++) {
        const prev = trajectory[i - 1];
        const curr = trajectory[i];

        // Skip if in bucket zone (settling is expected)
        if (curr.y >= slotTopY) continue;

        // Check if ball moved
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const totalMovement = Math.sqrt(dx * dx + dy * dy);

        if (totalMovement < 0.5) {
          consecutiveStuckFrames++;
          if (consecutiveStuckFrames > maxStuckFrames) {
            maxStuckFrames = consecutiveStuckFrames;
          }
        } else {
          consecutiveStuckFrames = 0;
        }
      }

      // Allow up to 30 frames (0.5 seconds) of stuck before flagging
      if (maxStuckFrames > 30) {
        errors.push(
          `Ball got stuck for ${maxStuckFrames} frames (${(maxStuckFrames / 60).toFixed(2)}s)`
        );
      } else if (maxStuckFrames > 15) {
        warnings.push(
          `Ball paused for ${maxStuckFrames} frames (${(maxStuckFrames / 60).toFixed(2)}s) - borderline`
        );
      }

      // Validation 4: Detect unnatural jumps and unrealistic speeds
      let maxJumpDistance = 0;
      let maxSpeed = 0;
      let framesWithoutCollision = 0;
      let maxFramesWithoutCollision = 0;

      for (let i = 1; i < trajectory.length; i++) {
        const prev = trajectory[i - 1];
        const curr = trajectory[i];

        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const jumpDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate speed (at 60 FPS, dt = 1/60)
        const speed = jumpDistance * 60; // Convert to px/second

        if (jumpDistance > maxJumpDistance) {
          maxJumpDistance = jumpDistance;
        }
        if (speed > maxSpeed) {
          maxSpeed = speed;
        }

        // Track frames without collision in peg zone
        if (curr.y > 50 && curr.y < slotTopY && !curr.pegHit) {
          framesWithoutCollision++;
          if (framesWithoutCollision > maxFramesWithoutCollision) {
            maxFramesWithoutCollision = framesWithoutCollision;
          }
        } else if (curr.pegHit) {
          framesWithoutCollision = 0;
        }

        // REALISTIC PHYSICS CHECKS:

        // 1. Speed limit: Terminal velocity for small objects is ~200-300px/s in game physics
        // With gravity boost, max realistic speed should be ~800px/s
        if (speed > 800) {
          errors.push(
            `Unrealistic speed at frame ${i}: ${speed.toFixed(0)}px/s (max realistic: 800px/s)`
          );
        }

        // 2. Distance per frame: At 60 FPS, max realistic jump is ~13px (800px/s / 60)
        // Allow 20px for collision bounces
        if (jumpDistance > 20) {
          errors.push(
            `Unrealistic movement at frame ${i}: ${jumpDistance.toFixed(1)}px in one frame (from [${prev.x.toFixed(1)}, ${prev.y.toFixed(1)}] to [${curr.x.toFixed(1)}, ${curr.y.toFixed(1)}])`
          );
        }

        // 3. Diagonal racing detection: Ball should not travel far distances without hitting pegs
        // In peg zone (y > 50 && y < bucket), ball should hit pegs regularly
        if (maxFramesWithoutCollision > 40 && curr.y > 100 && curr.y < slotTopY - 50) {
          errors.push(
            `Ball racing through grid without collisions: ${maxFramesWithoutCollision} consecutive frames without hitting peg at y=${curr.y.toFixed(1)}px`
          );
        }
      }

      // Validation 5: Ball must end in bucket (vertically)
      const finalY = finalFrame.y;
      if (finalY < slotTopY - 20) {
        // Allow 20px tolerance above slot for settling
        errors.push(
          `Ball did not reach bucket. Final Y: ${finalY.toFixed(1)}px, Expected Y >= ${slotTopY - 20}px`
        );
      }

      // Validation 6: Trajectory should be reasonably long (not too short)
      const expectedMinFrames = 120; // At least 2 seconds of animation
      if (trajectory.length < expectedMinFrames) {
        warnings.push(
          `Trajectory seems short: ${trajectory.length} frames (expected >= ${expectedMinFrames})`
        );
      }

      // Validation 7: Ball should not go outside board bounds
      for (let i = 0; i < trajectory.length; i++) {
        const point = trajectory[i];
        if (point.x < 0 || point.x > BOARD_WIDTH) {
          errors.push(
            `Ball went outside board horizontally at frame ${i}: x=${point.x.toFixed(1)}px`
          );
        }
        if (point.y < 0 || point.y > BOARD_HEIGHT + 5) {
          // Allow 5px tolerance for rounding
          errors.push(
            `Ball went outside board vertically at frame ${i}: y=${point.y.toFixed(1)}px`
          );
        }
      }

      const passed = errors.length === 0;
      if (passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }

      results.push({
        testNumber: testNum,
        seed,
        targetSlot,
        passed,
        errors,
        warnings,
        finalY,
        finalX,
        maxStuckFrames,
        maxJumpDistance,
        reachedBucketZone,
      });

      // Print progress every 100 tests
      if ((testNum + 1) % 100 === 0) {
        const progressPercent = (((testNum + 1) / 1000) * 100).toFixed(0);
        console.log(
          `Progress: ${testNum + 1}/1000 (${progressPercent}%) - Passed: ${totalPassed}, Failed: ${totalFailed}`
        );
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log(`Total tests: 1000`);
    console.log(`✅ Passed: ${totalPassed} (${((totalPassed / 1000) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${((totalFailed / 1000) * 100).toFixed(1)}%)`);

    // Analyze failure patterns
    if (totalFailed > 0) {
      console.log(`\n⚠️  FAILURE ANALYSIS:\n`);

      const errorTypes: { [key: string]: number } = {};
      const failedTests = results.filter((r) => !r.passed);

      failedTests.forEach((result) => {
        result.errors.forEach((error) => {
          const errorType = error.split(':')[0] || error.substring(0, 50);
          errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
        });
      });

      console.log('Error breakdown:');
      Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([errorType, count]) => {
          console.log(`  - ${errorType}: ${count} occurrences`);
        });

      // Show first 10 failures in detail
      console.log(`\n🔍 First 10 Failures (detailed):\n`);
      failedTests.slice(0, 10).forEach((result) => {
        console.log(
          `Test #${result.testNumber} (seed: ${result.seed}, target slot: ${result.targetSlot}):`
        );
        result.errors.forEach((err) => console.log(`  ❌ ${err}`));
        result.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
        console.log(
          `  Final position: x=${result.finalX.toFixed(1)}px, y=${result.finalY.toFixed(1)}px`
        );
        console.log(
          `  Max stuck: ${result.maxStuckFrames} frames, Max jump: ${result.maxJumpDistance.toFixed(1)}px`
        );
        console.log(`  Reached bucket zone: ${result.reachedBucketZone ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // Warning summary
    const testsWithWarnings = results.filter((r) => r.warnings.length > 0);
    if (testsWithWarnings.length > 0) {
      console.log(`\n⚠️  ${testsWithWarnings.length} tests had warnings (but passed validation)\n`);
    }

    console.log('='.repeat(80) + '\n');

    // Assert that at least 98% of tests passed (allowing for rare edge cases)
    const passRate = totalPassed / 1000;
    expect(passRate).toBeGreaterThanOrEqual(0.98);
    expect(totalPassed).toBeGreaterThanOrEqual(980);
  }, 60000); // 60 second timeout for 1000 tests
});
