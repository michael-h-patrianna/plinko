/**
 * Test 100 trajectories for physics validation
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../../game/trajectory';

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
  const OPTIMAL_PEG_COLUMNS = 6;
  const CSS_BORDER = 2;
  const PLAYABLE_HEIGHT_RATIO = 0.65;
  const PEG_TOP_OFFSET = 20;

  const internalWidth = boardWidth - CSS_BORDER * 2;

  // Determine responsive sizing (matching boardGeometry.ts)
  const SMALL_VIEWPORT_WIDTH = 360;
  const isSmallViewport = internalWidth <= SMALL_VIEWPORT_WIDTH;
  const pegRadius = isSmallViewport ? 6 : 7;
  const ballRadius = isSmallViewport ? 6 : 7;
  const extraClearance = isSmallViewport ? 8 : 10;

  const minClearance = pegRadius + ballRadius + extraClearance;
  const playableHeight = boardHeight * PLAYABLE_HEIGHT_RATIO;
  const verticalSpacing = playableHeight / (pegRows + 1);

  const leftEdge = PHYSICS.BORDER_WIDTH + minClearance;
  const rightEdge = internalWidth - PHYSICS.BORDER_WIDTH - minClearance;
  const pegSpanWidth = rightEdge - leftEdge;
  const horizontalSpacing = pegSpanWidth / OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + PEG_TOP_OFFSET;
    const isOffsetRow = row % 2 === 1;
    const pegsInRow = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

    for (let col = 0; col < pegsInRow; col++) {
      const x = isOffsetRow
        ? leftEdge + horizontalSpacing * (col + 0.5)
        : leftEdge + horizontalSpacing * col;

      pegs.push({ row, col, x, y });
    }
  }
  return pegs;
}

describe('100 Trajectory Physics Test', () => {
  it('should generate 100 valid trajectories with no overlaps', () => {
    const boardWidth = 375;
    const boardHeight = 500;
    const pegRows = 10;
    const slotCount = 7;
    const totalRuns = 100;

    const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

    let successes = 0;
    let failures = 0;
    let overlapViolations = 0;
    let maxOverlapDetected = 0;

    console.log('Testing 100 trajectories...');

    for (let run = 0; run < totalRuns; run++) {
      // Use deterministic seed based on run index for repeatability
      const seed = 10_000_000 + (run * 1234);

      try {
        const { trajectory, landedSlot } = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount,
          seed,
        });

        let hasOverlap = false;
        let runOverlaps = 0;

        // Check each frame for overlaps
        for (let i = 0; i < trajectory.length; i++) {
          const point = trajectory[i];
          if (!point) continue;

          // Check for ball/peg overlap
          for (const peg of pegs) {
            const dx = point.x - peg.x;
            const dy = point.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const overlap = PHYSICS.COLLISION_RADIUS - distance;

            if (overlap > 0.1) {
              // Allow 0.1px tolerance for numerical precision
              hasOverlap = true;
              runOverlaps++;
              overlapViolations++;
              maxOverlapDetected = Math.max(maxOverlapDetected, overlap);

              if (run < 5 && runOverlaps <= 3) {
                console.log(`  Run ${run}: Overlap at frame ${i} - ${overlap.toFixed(2)}px`);
              }
            }
          }
        }

        // Verify ball landed in a valid slot
        const finalPoint = trajectory[trajectory.length - 1];
        if (finalPoint) {
          if (landedSlot >= 0 && landedSlot < slotCount && !hasOverlap) {
            successes++;
          } else {
            failures++;
            if (run < 5) {
              console.log(
                `  Run ${run}: Failed - landed in slot ${landedSlot} (valid range: 0-${slotCount - 1}), overlaps: ${runOverlaps}`
              );
            }
          }
        }
      } catch (error) {
        failures++;
        console.log(`  Run ${run}: Error - ${error instanceof Error ? error.message : String(error)}`);
      }

      if ((run + 1) % 20 === 0) {
        console.log(`Progress: ${run + 1}/${totalRuns}`);
      }
    }

    console.log('\n=== TEST RESULTS ===');
    console.log(`Successes: ${successes}/${totalRuns}`);
    console.log(`Failures: ${failures}`);
    console.log(`Success rate: ${((successes / totalRuns) * 100).toFixed(1)}%`);
    console.log(`Overlap violations: ${overlapViolations}`);
    console.log(`Max overlap: ${maxOverlapDetected.toFixed(2)}px`);

    // Assertions
    expect(overlapViolations).toBe(0);
    expect(maxOverlapDetected).toBeLessThanOrEqual(0.1);
    expect(successes).toBe(totalRuns);
  }, 30000); // 30 second timeout
});
