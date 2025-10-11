/**
 * CCD Coverage Validation Test
 *
 * Purpose: Verify that CCD (Continuous Collision Detection) catches all collisions
 * that should trigger visual/audio feedback.
 *
 * This test runs BEFORE we remove the visual feedback pass to ensure CCD is sufficient.
 */

import { describe, it, expect, vi } from 'vitest';
import { runSimulation } from '../../game/trajectory/simulation';

// Mock platform storage to avoid web dependencies in Node environment
vi.mock('../../utils/platform/storage', () => ({
  getStorageAdapter: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Inline PHYSICS constants to avoid import chain that requires web features
const PHYSICS = {
  BALL_RADIUS: 9,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 16,
  BORDER_WIDTH: 12,
};

// Inline peg layout generation to avoid import dependencies
function generatePegLayoutSimple(
  boardWidth: number,
  boardHeight: number,
  pegRows: number
): Array<{ row: number; col: number; x: number; y: number }> {
  const pegs: Array<{ row: number; col: number; x: number; y: number }> = [];
  const OPTIMAL_PEG_COLUMNS = 6;
  const CSS_BORDER = 2;
  const PLAYABLE_HEIGHT_RATIO = 0.65;
  const PEG_TOP_OFFSET = 20;

  const internalWidth = boardWidth - CSS_BORDER * 2;
  const isSmallViewport = internalWidth <= 360;
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

describe('CCD Coverage Validation', () => {
  const BOARD_WIDTH = 375;
  const BOARD_HEIGHT = 667;
  const PEG_ROWS = 12;
  const SLOT_COUNT = 8;

  it('should detect all collisions that cause significant velocity changes', () => {
    // Generate board layout
    const pegs = generatePegLayoutSimple(BOARD_WIDTH, BOARD_HEIGHT, PEG_ROWS);

    // Test 100 different trajectories
    const missedCollisions: Array<{
      seed: number;
      frame: number;
      nearestPeg: string;
      distance: number;
      velocityChange: number;
    }> = [];

    for (let seed = 1000; seed < 1100; seed++) {
      const result = runSimulation({
        params: {
          startX: BOARD_WIDTH / 2,
          startVx: 0,
          bounceRandomness: 0.3,
        },
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegs,
        slotCount: SLOT_COUNT,
        rngSeed: seed,
      });

      // Calculate bucket zone Y to exclude bucket floor bounces from peg collision analysis
      const playableWidth = BOARD_WIDTH - PHYSICS.BORDER_WIDTH * 2;
      const slotWidth = playableWidth / SLOT_COUNT;
      const bucketHeight = slotWidth < 40 ? 120 : slotWidth < 46 ? 110 : 90;
      const bucketZoneY = BOARD_HEIGHT - bucketHeight;

      // Analyze trajectory for missed collisions
      for (let i = 1; i < result.trajectory.length; i++) {
        const prev = result.trajectory[i - 1]!;
        const curr = result.trajectory[i]!;

        // Skip frames in bucket zone - bucket physics causes velocity changes without peg hits
        if (curr.y >= bucketZoneY) {
          continue;
        }

        // Calculate velocity change
        const prevSpeed = Math.sqrt((prev.vx ?? 0) ** 2 + (prev.vy ?? 0) ** 2);
        const currSpeed = Math.sqrt((curr.vx ?? 0) ** 2 + (curr.vy ?? 0) ** 2);
        const velocityChange = Math.abs(currSpeed - prevSpeed);

        // Significant velocity change indicates collision
        const SIGNIFICANT_CHANGE = 50; // px/s

        if (velocityChange > SIGNIFICANT_CHANGE) {
          // There was a velocity change - was it detected?
          const ccdDetected = curr.pegHit === true || (curr.pegsHit && curr.pegsHit.length > 0);

          if (!ccdDetected) {
            // Check if this might be a wall bounce (also causes velocity change without peg hit)
            const isWallBounce = curr.wallHit !== undefined;

            if (!isWallBounce) {
              // CCD missed a collision! Find nearest peg
              let nearestPeg = '';
              let minDist = Infinity;

              for (const peg of pegs) {
                const dx = curr.x - peg.x;
                const dy = curr.y - peg.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                  minDist = dist;
                  nearestPeg = `${peg.row}-${peg.col}`;
                }
              }

              // Only record as missed if ball was actually close to a peg (< 50px)
              // Large distances indicate other physics effects (gravity, air resistance accumulation)
              if (minDist < 50) {
                missedCollisions.push({
                  seed,
                  frame: curr.frame,
                  nearestPeg,
                  distance: minDist,
                  velocityChange,
                });
              }
            }
          }
        }
      }
    }

    // Report results
    if (missedCollisions.length > 0) {
      console.error('CCD MISSED COLLISIONS:');
      console.error(JSON.stringify(missedCollisions, null, 2));
    }

    // CRITICAL ASSERTION: CCD must catch all significant collisions
    expect(missedCollisions).toHaveLength(0);
  });

  it('should detect collisions near all pegs in the layout', () => {
    // This test ensures every peg can be detected by CCD
    const pegs = generatePegLayoutSimple(BOARD_WIDTH, BOARD_HEIGHT, PEG_ROWS);

    const hitPegs = new Set<string>();

    // Run 500 trajectories to get good coverage
    for (let seed = 2000; seed < 2500; seed++) {
      const result = runSimulation({
        params: {
          startX: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 100,
          startVx: (Math.random() - 0.5) * 50,
          bounceRandomness: 0.3,
        },
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegs,
        slotCount: SLOT_COUNT,
        rngSeed: seed,
      });

      // Track which pegs got hit
      for (const point of result.trajectory) {
        if (point.pegsHit) {
          for (const peg of point.pegsHit) {
            hitPegs.add(`${peg.row}-${peg.col}`);
          }
        }
      }
    }

    // We should hit at least 80% of pegs across 500 trajectories
    const coveragePercent = (hitPegs.size / pegs.length) * 100;
    console.log(`CCD Peg Coverage: ${hitPegs.size}/${pegs.length} (${coveragePercent.toFixed(1)}%)`);

    expect(coveragePercent).toBeGreaterThan(80);
  });
});
