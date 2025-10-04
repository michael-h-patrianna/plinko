/**
 * Simple physics test - check for overlaps and proper bouncing
 */

import { generateTrajectory } from './src/game/trajectory.js';

const PHYSICS = {
  BALL_RADIUS: 7,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 14,
  BORDER_WIDTH: 8
};

function generatePegLayout(boardWidth, boardHeight, pegRows, slotCount) {
  const pegs = [];
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

console.log('Testing physics engine...\n');

const boardWidth = 375;
const boardHeight = 500;
const pegRows = 10;
const slotCount = 7;

const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

// Test 10 trajectories in detail
let totalOverlaps = 0;
let maxOverlap = 0;
let successCount = 0;
let bouncesDetected = 0;

for (let testRun = 0; testRun < 10; testRun++) {
  const selectedIndex = testRun % slotCount;
  console.log(`\n=== Test ${testRun + 1}: Target slot ${selectedIndex} ===`);

  try {
    const trajectory = generateTrajectory({
      boardWidth,
      boardHeight,
      pegRows,
      slotCount,
      selectedIndex,
      seed: Date.now() + testRun * 1000
    });

    console.log(`Trajectory length: ${trajectory.length} frames`);

    // Check for overlaps
    let overlapCount = 0;
    let pegHits = 0;
    let lastY = trajectory[0].y;
    let downwardFrames = 0;

    for (let i = 0; i < trajectory.length; i++) {
      const point = trajectory[i];

      // Count peg hits
      if (point.pegHit) {
        pegHits++;
        bouncesDetected++;
      }

      // Check if ball is generally moving downward
      if (i > 0 && point.y > lastY) {
        downwardFrames++;
      }
      lastY = point.y;

      // Check for overlaps with pegs
      for (const peg of pegs) {
        const dx = point.x - peg.x;
        const dy = point.y - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = PHYSICS.COLLISION_RADIUS - distance;

        if (overlap > 0.5) { // Allow 0.5px tolerance
          overlapCount++;
          totalOverlaps++;
          maxOverlap = Math.max(maxOverlap, overlap);

          if (overlapCount <= 3) { // Only log first 3 overlaps
            console.log(`  Overlap at frame ${i}: ${overlap.toFixed(2)}px`);
          }
        }
      }
    }

    // Check if ball landed in correct slot
    const finalPoint = trajectory[trajectory.length - 1];
    const slotWidth = boardWidth / slotCount;
    const landedSlot = Math.floor(finalPoint.x / slotWidth);
    const correct = landedSlot === selectedIndex;

    if (correct) successCount++;

    console.log(`  Peg hits: ${pegHits}`);
    console.log(`  Overlaps: ${overlapCount}`);
    console.log(`  Downward movement: ${((downwardFrames / trajectory.length) * 100).toFixed(1)}%`);
    console.log(`  Final position: (${finalPoint.x.toFixed(1)}, ${finalPoint.y.toFixed(1)})`);
    console.log(`  Landed in slot: ${landedSlot} (${correct ? '✅ CORRECT' : '❌ WRONG'})`);

  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Success rate: ${successCount}/10 (${(successCount * 10)}%)`);
console.log(`Total overlaps: ${totalOverlaps}`);
console.log(`Max overlap: ${maxOverlap.toFixed(2)}px`);
console.log(`Total bounces: ${bouncesDetected}`);
console.log(`Avg bounces per run: ${(bouncesDetected / 10).toFixed(1)}`);

if (totalOverlaps === 0 && successCount === 10) {
  console.log('\n✅ PERFECT! No overlaps and 100% success rate!');
} else {
  console.log('\n❌ ISSUES DETECTED - Physics needs more work');
}