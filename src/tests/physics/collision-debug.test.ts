/**
 * Debug test to verify line-circle intersection logic
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../../game/trajectory';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS;

function doesLineIntersectCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  // Vector from start to end
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Vector from start to circle center
  const fx = cx - x1;
  const fy = cy - y1;

  // Project circle center onto line
  const a = dx * dx + dy * dy;
  if (a === 0) return false;

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  // Check discriminant
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  // Calculate intersection points
  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);

  // Check if intersection is within line segment
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1); // Line passes through circle
}

describe('Collision Detection Debug', () => {
  it('should detect line-circle intersections correctly', () => {
    // Test 1: Line passes through circle
    const result1 = doesLineIntersectCircle(0, 0, 100, 0, 50, 0, 10);
    console.log('\nTest 1: Line (0,0) to (100,0), Circle at (50,0) r=10');
    console.log('Result:', result1, 'Expected: true');

    // Manual calculation
    const dx = 100, dy = 0;
    const fx = 50, fy = 0;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - 10 * 10;
    const disc = b * b - 4 * a * c;
    const sqrt = Math.sqrt(disc);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);
    console.log(`  a=${a}, b=${b}, c=${c}, disc=${disc}`);
    console.log(`  t1=${t1}, t2=${t2}`);
    console.log(`  Check: t1 in [0,1]? ${t1 >= 0 && t1 <= 1}`);
    console.log(`  Check: t2 in [0,1]? ${t2 >= 0 && t2 <= 1}`);
    console.log(`  Check: t1<0 && t2>1? ${t1 < 0 && t2 > 1}`);

    expect(result1).toBe(true);

    // Test 2: Line misses circle
    expect(doesLineIntersectCircle(0, 0, 100, 0, 50, 20, 10)).toBe(false);

    // Test 3: Line starts inside circle
    expect(doesLineIntersectCircle(50, 5, 100, 0, 50, 0, 10)).toBe(true);

    // Test 4: Line ends inside circle
    expect(doesLineIntersectCircle(0, 0, 50, 5, 50, 0, 10)).toBe(true);
  });

  it('should print actual tunneling cases for analysis', () => {
    function generatePegLayout() {
      const pegs: { x: number; y: number; row: number; col: number }[] = [];
      const OPTIMAL_PEG_COLUMNS = 6;
      const BORDER_WIDTH = 12;
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

    const pegs = generatePegLayout();
    const { trajectory } = generateTrajectory({
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      pegRows: PEG_ROWS,
      slotCount: SLOT_COUNT,
      seed: 5000,
    });

    let violationCount = 0;
    const maxPrint = 5;

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
              violationCount++;

              if (violationCount <= maxPrint) {
                console.log(`\nViolation ${violationCount}:`);
                console.log(`  Frame ${i}: Ball moved from (${prev.x.toFixed(2)}, ${prev.y.toFixed(2)}) to (${curr.x.toFixed(2)}, ${curr.y.toFixed(2)})`);
                console.log(`  Peg at (${peg.x.toFixed(2)}, ${peg.y.toFixed(2)}) row=${peg.row} col=${peg.col}`);
                console.log(`  Distance to peg: ${dist.toFixed(2)} (threshold: ${(COLLISION_RADIUS * 0.9).toFixed(2)})`);
                console.log(`  curr.pegHit: ${curr.pegHit}, curr.pegHitRow: ${curr.pegHitRow}, curr.pegHitCol: ${curr.pegHitCol}`);
                console.log(`  Movement distance: ${Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)).toFixed(2)}`);
              }
            }
          }
        }
      }
    }

    console.log(`\nTotal violations: ${violationCount}`);

    // This test is for debugging only - we expect violations to exist
    // The actual fix will be in the collision.ts file
  });
});
