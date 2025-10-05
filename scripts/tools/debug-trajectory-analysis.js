import { generateTrajectory } from '../../src/game/trajectory.ts';

/**
 * Detailed trajectory analysis to detect physics issues
 * This helps identify problems that visual inspection might miss
 */

const params = {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  selectedIndex: 3,
  seed: 12345,
  dropDurationMs: 2500,
  settleDurationMs: 200,
};

console.log('Generating trajectory with params:', params);
const trajectory = generateTrajectory(params);

console.log('\n=== TRAJECTORY ANALYSIS ===\n');

// 1. Frame count and timing
console.log(`Total frames: ${trajectory.length}`);
console.log(`Expected duration: ${params.dropDurationMs + params.settleDurationMs}ms`);
console.log(`Actual duration at 60fps: ${((trajectory.length / 60) * 1000).toFixed(0)}ms`);

// 2. Y-position progression (should be generally increasing)
console.log('\n--- Y Position Progression (every 20 frames) ---');
for (let i = 0; i < Math.min(trajectory.length, 160); i += 20) {
  const point = trajectory[i];
  console.log(
    `Frame ${i.toString().padStart(3)}: y=${point.y.toFixed(1).padStart(6)}, x=${point.x.toFixed(1).padStart(6)}, pegHit=${point.pegHit}`
  );
}

// 3. Detect suspicious patterns
console.log('\n--- Physics Health Checks ---');

// Check for teleporting (large y jumps)
let maxYJump = 0;
let teleportCount = 0;
for (let i = 1; i < trajectory.length - 20; i++) {
  // Exclude settle phase
  const yDiff = Math.abs(trajectory[i].y - trajectory[i - 1].y);
  if (yDiff > 50) {
    teleportCount++;
    if (yDiff > maxYJump) maxYJump = yDiff;
  }
}
console.log(
  `Max Y jump between frames: ${maxYJump.toFixed(1)}px ${maxYJump > 30 ? '❌ SUSPICIOUS' : '✓'}`
);
console.log(
  `Teleport count (>50px jumps): ${teleportCount} ${teleportCount > 0 ? '❌ BROKEN' : '✓'}`
);

// Check for stalling (ball not moving down)
let stallCount = 0;
for (let i = 10; i < trajectory.length - 20; i++) {
  const yDiff = trajectory[i].y - trajectory[i - 10].y;
  if (yDiff < 5 && trajectory[i].y < params.boardHeight * 0.7) {
    stallCount++;
  }
}
console.log(`Stall frames (not moving down): ${stallCount} ${stallCount > 20 ? '❌ BROKEN' : '✓'}`);

// Check peg hit distribution
const pegHits = trajectory.filter((p) => p.pegHit).length;
console.log(
  `Total peg hits: ${pegHits} ${pegHits < 5 ? '❌ TOO FEW' : pegHits > 50 ? '❌ TOO MANY' : '✓'}`
);

// Check if ball actually descends smoothly
const startY = trajectory[0].y;
const midY = trajectory[Math.floor(trajectory.length / 2)].y;
const endY = trajectory[trajectory.length - 20].y; // Before settle

console.log(
  `\nY progression: start=${startY.toFixed(1)}, mid=${midY.toFixed(1)}, end=${endY.toFixed(1)}`
);
console.log(`Should be: start < mid < end (increasing)`);
console.log(`Actual: ${startY < midY && midY < endY ? '✓ CORRECT' : '❌ BROKEN'}`);

// Velocity analysis
console.log('\n--- Velocity Analysis (sample points) ---');
for (let i = 20; i < Math.min(trajectory.length - 20, 140); i += 40) {
  const dy = trajectory[i].y - trajectory[i - 1].y;
  const dx = trajectory[i].x - trajectory[i - 1].x;
  const speed = Math.sqrt(dx * dx + dy * dy) * 60; // px/s
  console.log(
    `Frame ${i.toString().padStart(3)}: speed=${speed.toFixed(1).padStart(6)}px/s, dy=${dy.toFixed(2).padStart(6)}`
  );
}

// Final position check
const finalPoint = trajectory[trajectory.length - 1];
const targetSlotX = (params.selectedIndex + 0.5) * (params.boardWidth / params.slotCount);
const xError = Math.abs(finalPoint.x - targetSlotX);
console.log(`\n--- Final Position ---`);
console.log(`Target slot X: ${targetSlotX.toFixed(1)}`);
console.log(`Final X: ${finalPoint.x.toFixed(1)}`);
console.log(`X error: ${xError.toFixed(1)}px ${xError < 10 ? '✓' : '❌'}`);
console.log(`Final Y: ${finalPoint.y.toFixed(1)} (expected ~${params.boardHeight * 0.8})`);

// Overall verdict
console.log('\n=== VERDICT ===');
if (teleportCount > 0 || stallCount > 20 || pegHits < 5 || !(startY < midY && midY < endY)) {
  console.log('❌ PHYSICS ARE BROKEN');
  console.log('Issues detected:');
  if (teleportCount > 0) console.log('  - Ball is teleporting between frames');
  if (stallCount > 20) console.log('  - Ball is stalling/hovering instead of falling');
  if (pegHits < 5) console.log('  - Ball is not hitting enough pegs');
  if (!(startY < midY && midY < endY)) console.log('  - Ball is not descending properly');
} else {
  console.log('✓ Physics appear to be working correctly');
}
