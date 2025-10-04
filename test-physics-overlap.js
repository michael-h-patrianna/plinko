/**
 * Test that physics engine prevents ball/peg overlap
 */

import { generateTrajectory } from './src/game/trajectory.ts';

const PHYSICS = {
  BALL_RADIUS: 7,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 14, // Ball + Peg
  BORDER_WIDTH: 8
};

function generatePegLayout(boardWidth, boardHeight, pegRows, slotCount) {
  const pegs = [];
  const pegPadding = PHYSICS.PEG_RADIUS + 2;
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

console.log('Testing physics engine for ball/peg overlap...\n');

const boardWidth = 375;
const boardHeight = 500;
const pegRows = 10;
const slotCount = 7;

// Generate pegs
const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

// Test multiple trajectories
let overlapViolations = 0;
let totalFramesChecked = 0;
let maxOverlap = 0;

for (let slot = 0; slot < slotCount; slot++) {
  console.log(`Testing slot ${slot}...`);

  try {
    const trajectory = generateTrajectory({
      boardWidth,
      boardHeight,
      pegRows,
      slotCount,
      selectedIndex: slot,
      seed: Date.now() + slot
    });

    // Check each frame for overlaps
    for (const point of trajectory) {
      if (!point.x || !point.y) continue;
      totalFramesChecked++;

      // Check distance to each peg
      for (const peg of pegs) {
        const dx = point.x - peg.x;
        const dy = point.y - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if ball overlaps peg (allowing 1px tolerance)
        const overlap = PHYSICS.COLLISION_RADIUS - distance;
        if (overlap > 1) { // More than 1px overlap
          overlapViolations++;
          maxOverlap = Math.max(maxOverlap, overlap);
          console.log(`  WARNING: Frame ${point.frame} - Ball overlaps peg at (${peg.x}, ${peg.y}) by ${overlap.toFixed(2)}px`);
        }
      }
    }
  } catch (error) {
    console.log(`  Error generating trajectory for slot ${slot}: ${error.message}`);
  }
}

console.log('\n=== Physics Overlap Test Results ===');
console.log(`Total frames checked: ${totalFramesChecked}`);
console.log(`Overlap violations: ${overlapViolations}`);
console.log(`Max overlap detected: ${maxOverlap.toFixed(2)}px`);
console.log(`Violation rate: ${((overlapViolations / totalFramesChecked) * 100).toFixed(2)}%`);

if (overlapViolations === 0) {
  console.log('\n✅ PASS: No ball/peg overlaps detected!');
} else {
  console.log('\n❌ FAIL: Ball/peg overlaps detected. Physics need adjustment.');
}

// Also check wall boundaries
console.log('\n=== Wall Boundary Test ===');
let wallViolations = 0;

for (const peg of pegs) {
  const leftDistance = peg.x - PHYSICS.PEG_RADIUS;
  const rightDistance = boardWidth - peg.x - PHYSICS.PEG_RADIUS;

  if (leftDistance < PHYSICS.BORDER_WIDTH) {
    wallViolations++;
    console.log(`Peg at (${peg.x}, ${peg.y}) too close to left wall: ${leftDistance}px < ${PHYSICS.BORDER_WIDTH}px`);
  }
  if (rightDistance < PHYSICS.BORDER_WIDTH) {
    wallViolations++;
    console.log(`Peg at (${peg.x}, ${peg.y}) too close to right wall: ${rightDistance}px < ${PHYSICS.BORDER_WIDTH}px`);
  }
}

if (wallViolations === 0) {
  console.log('✅ PASS: All pegs properly spaced from walls');
} else {
  console.log(`❌ FAIL: ${wallViolations} pegs too close to walls`);
}