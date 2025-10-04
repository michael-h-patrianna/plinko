/**
 * Comprehensive trajectory test - 10,000 runs with physics validation
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';

const PHYSICS = {
  BALL_RADIUS: 7,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 14, // Ball + Peg
  BORDER_WIDTH: 8
};

function generatePegLayout(boardWidth: number, boardHeight: number, pegRows: number, slotCount: number) {
  const pegs: Array<{x: number, y: number, row: number, col: number}> = [];
  const pegPadding = PHYSICS.PEG_RADIUS + 10;
  const playableWidth = boardWidth - (PHYSICS.BORDER_WIDTH * 2) - (pegPadding * 2);
  const playableHeight = boardHeight * 0.65;
  const verticalSpacing = playableHeight / (pegRows + 1);
  const horizontalSpacing = playableWidth / slotCount;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + 20;
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? slotCount : slotCount + 1;

    for (let col = 0; col < numPegs; col++) {
      const x = PHYSICS.BORDER_WIDTH + pegPadding + horizontalSpacing * col + offset;
      pegs.push({ row, col, x, y });
    }
  }
  return pegs;
}

describe('Comprehensive Trajectory Test - 10,000 runs', () => {
  it('should successfully generate valid trajectories for 10,000 random targets with NO OVERLAPS', () => {
    const boardWidth = 375;
    const boardHeight = 500;
    const pegRows = 10;
    const slotCount = 7;
    const totalRuns = 10000;

    // Generate pegs once for consistency
    const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

    let successes = 0;
    let failures = 0;
    let overlapViolations = 0;
    let maxOverlapDetected = 0;
    let unnaturalMovements = 0;

    console.log('Starting 10,000 trajectory tests...');

    for (let run = 0; run < totalRuns; run++) {
      // Random slot selection
      const selectedIndex = Math.floor(Math.random() * slotCount);
      const seed = Date.now() + run;

      try {
        const trajectory = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount,
          selectedIndex,
          seed
        });

        // Validate trajectory
        let trajectoryValid = true;
        let hasOverlap = false;
        let hasUnnaturalMovement = false;

        // Check each frame for physics violations
        for (let i = 0; i < trajectory.length; i++) {
          const point = trajectory[i];
          if (!point) continue;

          // 1. Check for ball/peg overlap (MOST CRITICAL)
          for (const peg of pegs) {
            const dx = point.x - peg.x;
            const dy = point.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if ball overlaps peg (NO TOLERANCE - must be completely separate)
            const overlap = PHYSICS.COLLISION_RADIUS - distance;
            if (overlap > 0.5) { // Allow only 0.5px tolerance for numerical precision
              hasOverlap = true;
              overlapViolations++;
              maxOverlapDetected = Math.max(maxOverlapDetected, overlap);

              if (run < 10) { // Log first 10 violations for debugging
                console.log(`  Run ${run}: Overlap at frame ${i} - Ball at (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) overlaps peg at (${peg.x}, ${peg.y}) by ${overlap.toFixed(2)}px`);
              }
            }
          }

          // 2. Check for unnatural movements (teleportation, sudden jumps)
          if (i > 0) {
            const prevPoint = trajectory[i - 1];
            if (prevPoint) {
              const dx = point.x - prevPoint.x;
              const dy = point.y - prevPoint.y;
              const frameDistance = Math.sqrt(dx * dx + dy * dy);

              // Maximum reasonable movement per frame (based on max velocity)
              // Allow slightly more for collision responses
              const MAX_FRAME_DISTANCE = 20; // pixels per frame at 60fps with collision response

              if (frameDistance > MAX_FRAME_DISTANCE) {
                hasUnnaturalMovement = true;
                unnaturalMovements++;

                if (run < 10) {
                  console.log(`  Run ${run}: Unnatural movement at frame ${i} - Moved ${frameDistance.toFixed(1)}px in one frame`);
                }
              }
            }
          }
        }

        // 3. Verify ball landed in correct slot
        const finalPoint = trajectory[trajectory.length - 1];
        if (finalPoint) {
          const slotWidth = boardWidth / slotCount;
          const landedSlot = Math.floor(finalPoint.x / slotWidth);

          if (landedSlot !== selectedIndex) {
            trajectoryValid = false;
            if (run < 10) {
              console.log(`  Run ${run}: Ball landed in slot ${landedSlot} instead of target ${selectedIndex}`);
            }
          }
        }

        if (trajectoryValid && !hasOverlap && !hasUnnaturalMovement) {
          successes++;
        } else {
          failures++;
        }

        // Progress update
        if ((run + 1) % 1000 === 0) {
          console.log(`Progress: ${run + 1}/${totalRuns} completed...`);
        }

      } catch (error) {
        failures++;
        console.log(`  Run ${run}: Error generating trajectory for slot ${selectedIndex}: ${error}`);
      }
    }

    // Final report
    console.log('\n=== COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total runs: ${totalRuns}`);
    console.log(`Successes: ${successes}`);
    console.log(`Failures: ${failures}`);
    console.log(`Success rate: ${((successes / totalRuns) * 100).toFixed(2)}%`);
    console.log(`Overlap violations: ${overlapViolations}`);
    console.log(`Max overlap detected: ${maxOverlapDetected.toFixed(2)}px`);
    console.log(`Unnatural movements: ${unnaturalMovements}`);

    // Assertions
    expect(successes).toBe(totalRuns); // MUST be 100% success
    expect(overlapViolations).toBe(0); // NO overlaps allowed
    expect(unnaturalMovements).toBe(0); // NO teleportation allowed
    expect(maxOverlapDetected).toBeLessThanOrEqual(0.5); // Max 0.5px tolerance
  }, 60000); // 60 second timeout for this test

  it('should never have ball overlapping with pegs', () => {
    const boardWidth = 375;
    const boardHeight = 500;
    const pegRows = 10;
    const slotCount = 7;

    const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

    // Test 100 trajectories in detail
    for (let slot = 0; slot < slotCount; slot++) {
      for (let run = 0; run < 100 / slotCount; run++) {
        const trajectory = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount,
          selectedIndex: slot,
          seed: Date.now() + run * 1000 + slot
        });

        // Check every single frame
        for (const point of trajectory) {
          for (const peg of pegs) {
            const dx = point.x - peg.x;
            const dy = point.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Ball edge should never overlap peg edge
            expect(distance).toBeGreaterThanOrEqual(PHYSICS.COLLISION_RADIUS - 0.5);
          }
        }
      }
    }
  });

  it('should have smooth, continuous motion without teleportation', () => {
    const trajectory = generateTrajectory({
      boardWidth: 375,
      boardHeight: 500,
      pegRows: 10,
      slotCount: 7,
      selectedIndex: 3,
      seed: 12345
    });

    // Check frame-to-frame continuity
    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1];
      const curr = trajectory[i];

      if (!prev || !curr) continue;

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Movement per frame should be reasonable (max ~15px at high speed)
      expect(distance).toBeLessThanOrEqual(15);
    }
  });
});