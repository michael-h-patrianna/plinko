/**
 * Debug test to understand why collisions are still being missed
 */

import { describe, it } from 'vitest';
import { generateTrajectory } from '../../game/trajectory';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS;
const BORDER_WIDTH = 12;

function generatePegLayout() {
  const pegs: { x: number; y: number; row: number; col: number }[] = [];
  const OPTIMAL_PEG_COLUMNS = 6;
  const CSS_BORDER = 2;
  const PLAYABLE_HEIGHT_RATIO = 0.65;
  const PEG_TOP_OFFSET = 20;

  const internalWidth = BOARD_WIDTH - CSS_BORDER * 2;

  // Determine responsive sizing (matching boardGeometry.ts)
  const SMALL_VIEWPORT_WIDTH = 360;
  const isSmallViewport = internalWidth <= SMALL_VIEWPORT_WIDTH;
  const pegRadius = isSmallViewport ? 6 : 7;
  const ballRadius = isSmallViewport ? 6 : 7;
  const extraClearance = isSmallViewport ? 8 : 10;

  const minClearance = pegRadius + ballRadius + extraClearance;
  const playableHeight = BOARD_HEIGHT * PLAYABLE_HEIGHT_RATIO;
  const verticalSpacing = playableHeight / (PEG_ROWS + 1);

  const leftEdge = BORDER_WIDTH + minClearance;
  const rightEdge = internalWidth - BORDER_WIDTH - minClearance;
  const pegSpanWidth = rightEdge - leftEdge;
  const horizontalSpacing = pegSpanWidth / OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < PEG_ROWS; row++) {
    const y = verticalSpacing * (row + 1) + BORDER_WIDTH + PEG_TOP_OFFSET;
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

function doesLineIntersectCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, radius: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = cx - x1;
  const fy = cy - y1;

  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    const distSq = fx * fx + fy * fy;
    return distSq < radius * radius;
  }

  let t = (fx * dx + fy * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  const distX = cx - closestX;
  const distY = cy - closestY;
  const distSq = distX * distX + distY * distY;

  return distSq < radius * radius;
}

describe('Tunneling Debug', () => {
  it('should show what happens with first violation', () => {
    const pegs = generatePegLayout();
    const { trajectory } = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      seed: 5000, // First seed from test
    });

    let violationNum = 0;
    const maxPrint = 3;

    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1]!;
      const curr = trajectory[i]!;

      for (const peg of pegs) {
        if (Math.abs(peg.y - curr.y) > 50) continue;

        const linePassesThroughPeg = doesLineIntersectCircle(
          prev.x,
          prev.y,
          curr.x,
          curr.y,
          peg.x,
          peg.y,
          COLLISION_RADIUS
        );

        if (linePassesThroughPeg) {
          const hadCollision =
            curr.pegHit && curr.pegHitRow === peg.row && curr.pegHitCol === peg.col;

          if (!hadCollision) {
            const dist = Math.sqrt(Math.pow(curr.x - peg.x, 2) + Math.pow(curr.y - peg.y, 2));

            if (dist < COLLISION_RADIUS * 0.9) {
              violationNum++;

              if (violationNum <= maxPrint) {
                console.log(`\n=== Violation ${violationNum} ===`);
                console.log(`Frame ${i}:`);
                console.log(`  prev: (${prev.x.toFixed(2)}, ${prev.y.toFixed(2)})`);
                console.log(`  curr: (${curr.x.toFixed(2)}, ${curr.y.toFixed(2)})`);
                console.log(`  peg: (${peg.x.toFixed(2)}, ${peg.y.toFixed(2)}) row=${peg.row} col=${peg.col}`);
                console.log(`  Distance to peg: ${dist.toFixed(2)} (collision radius: ${COLLISION_RADIUS.toFixed(2)})`);
                console.log(`  curr.pegHit: ${curr.pegHit}`);
                console.log(`  curr.pegHitRow: ${curr.pegHitRow}`);
                console.log(`  curr.pegHitCol: ${curr.pegHitCol}`);
                if (curr.pegsHit) {
                  console.log(`  curr.pegsHit:`, curr.pegsHit);
                }

                // Check previous frame
                const prevDist = Math.sqrt(Math.pow(prev.x - peg.x, 2) + Math.pow(prev.y - peg.y, 2));
                console.log(`  prev distance to peg: ${prevDist.toFixed(2)}`);
                console.log(`  prev.pegHit: ${prev.pegHit}`);
                if (prev.pegHit) {
                  console.log(`  prev.pegHitRow: ${prev.pegHitRow}, prev.pegHitCol: ${prev.pegHitCol}`);
                }

                // Look for the collision frame
                if (prev.pegHit && prev.pegHitRow === peg.row && prev.pegHitCol === peg.col) {
                  console.log(`  >>> Collision happened in PREVIOUS frame (${i-1})`);
                  console.log(`  >>> After collision, ball was at dist=${prevDist.toFixed(2)} (should be > ${COLLISION_RADIUS})`);
                }
              }
            }
          }
        }
      }
    }

    console.log(`\nTotal violations: ${violationNum}`);
  });
});
