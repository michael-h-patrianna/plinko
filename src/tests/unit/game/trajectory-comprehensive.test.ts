/**
 * Comprehensive trajectory test - 10,000 runs with physics validation
 */

import { describe, expect, it } from 'vitest';
import { generateTrajectory } from '@game/trajectory';
import type { DeterministicTrajectoryPayload } from '@game/types';

const PHYSICS = {
  BALL_RADIUS: 9,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 16, // Ball + Peg (9 + 7)
  BORDER_WIDTH: 12,
};

function generatePegLayout(
  boardWidth: number,
  boardHeight: number,
  pegRows: number,
  _slotCount: number
) {
  const pegs: Array<{ x: number; y: number; row: number; col: number }> = [];
  const OPTIMAL_PEG_COLUMNS = 6; // Fixed peg count for optimal spacing
  const pegPadding = PHYSICS.PEG_RADIUS + 10;
  const playableWidth = boardWidth - PHYSICS.BORDER_WIDTH * 2 - pegPadding * 2;
  const playableHeight = boardHeight * 0.65;
  const verticalSpacing = playableHeight / (pegRows + 1);
  const horizontalSpacing = playableWidth / OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + 20;
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

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
      // Use deterministic seed based on run index for repeatability
      const seed = 30_000_000 + (run * 1234);

      try {
        const { trajectory, landedSlot } = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount,
          seed,
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
            if (overlap > 0.5) {
              // Allow only 0.5px tolerance for numerical precision
              hasOverlap = true;
              overlapViolations++;
              maxOverlapDetected = Math.max(maxOverlapDetected, overlap);

              if (run < 10) {
                // Log first 10 violations for debugging
                console.log(
                  `  Run ${run}: Overlap at frame ${i} - Ball at (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) overlaps peg at (${peg.x}, ${peg.y}) by ${overlap.toFixed(2)}px`
                );
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
                  console.log(
                    `  Run ${run}: Unnatural movement at frame ${i} - Moved ${frameDistance.toFixed(1)}px in one frame`
                  );
                }
              }
            }
          }
        }

        // 3. Verify ball landed in valid slot
        const finalPoint = trajectory[trajectory.length - 1];
        if (finalPoint) {
          if (landedSlot < 0 || landedSlot >= slotCount) {
            trajectoryValid = false;
            if (run < 10) {
              console.log(
                `  Run ${run}: Ball landed in invalid slot ${landedSlot} (valid: 0-${slotCount - 1})`
              );
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
        console.log(
          `  Run ${run}: Error generating trajectory: ${error instanceof Error ? error.message : String(error)}`
        );
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
    expect(successes).toBeGreaterThanOrEqual(totalRuns * 0.999); // 99.9%+ success rate
    expect(overlapViolations).toBe(0); // NO overlaps allowed
    expect(unnaturalMovements).toBe(0); // NO teleportation allowed
    expect(maxOverlapDetected).toBeLessThanOrEqual(0.5); // Max 0.5px tolerance
  }, 60000); // 60 second timeout for this test

  it('aligns trajectory with requested target slot when seed is consistent', () => {
    const baseParams = {
      boardWidth: 375,
      boardHeight: 500,
      pegRows: 10,
      slotCount: 6,
      seed: 98765,
    };

    const baseline = generateTrajectory(baseParams);
    const targeted = generateTrajectory({ ...baseParams, targetSlot: baseline.landedSlot });

    expect(targeted.matchedTarget).toBe(true);
    expect(targeted.landedSlot).toBe(baseline.landedSlot);
    expect(targeted.source).toBe('simulated');
    expect(targeted.attempts).toBeGreaterThanOrEqual(1);
  });

  it('uses precomputed trajectory payload when provided', () => {
    const payload: DeterministicTrajectoryPayload = {
      points: [
        { frame: 0, x: 35, y: 60, rotation: 0 },
        { frame: 1, x: 40, y: 140, rotation: 0 },
        { frame: 2, x: 45, y: 260, rotation: 0 },
        { frame: 3, x: 48, y: 420, rotation: 0 },
        { frame: 4, x: 50, y: 480, rotation: 0 },
      ],
      landingSlot: 0,
      seed: 1111,
      provider: 'test-suite',
    };

    const result = generateTrajectory({
      boardWidth: 375,
      boardHeight: 500,
      pegRows: 10,
      slotCount: 6,
      targetSlot: 0,
      precomputedTrajectory: payload,
    });

    expect(result.source).toBe('precomputed');
    expect(result.matchedTarget).toBe(true);
    expect(result.landedSlot).toBe(0);
    expect(result.slotHistogram[0]).toBe(1);
  });

  it('computes landing slot indices consistent with board layout math', () => {
    const boardWidth = 375;
    const slotCount = 6;
    const playableWidth = boardWidth - 24; // border width * 2
    const slotWidth = playableWidth / slotCount;
    const expectedSlot = 3;
    const xPosition = 12 + slotWidth * expectedSlot + slotWidth / 2;

    const payload: DeterministicTrajectoryPayload = {
      points: [
        { frame: 0, x: xPosition, y: 470, rotation: 0 },
        { frame: 1, x: xPosition, y: 480, rotation: 0 },
      ],
    };

    const result = generateTrajectory({
      boardWidth,
      boardHeight: 500,
      pegRows: 10,
      slotCount,
      precomputedTrajectory: payload,
      targetSlot: expectedSlot,
    });

    const boardComputedSlot = Math.floor((xPosition - 12) / slotWidth);

    expect(result.landedSlot).toBe(boardComputedSlot);
    expect(result.matchedTarget).toBe(true);
  });

  it('should never have ball overlapping with pegs', () => {
    const boardWidth = 375;
    const boardHeight = 500;
    const pegRows = 10;
    const slotCount = 7;

    const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

    // Test 100 trajectories in detail
    for (let slot = 0; slot < slotCount; slot++) {
      for (let run = 0; run < 100 / slotCount; run++) {
        // Use deterministic seed based on slot and run for repeatability
        const seed = 40_000_000 + (slot * 10000) + (run * 1234);
        const { trajectory } = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount,
          seed,
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
  }, 60000); // 60 second timeout for this test

  it('should have smooth, continuous motion without teleportation', () => {
    const { trajectory } = generateTrajectory({
      boardWidth: 375,
      boardHeight: 500,
      pegRows: 10,
      slotCount: 7,
      seed: 12345,
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
