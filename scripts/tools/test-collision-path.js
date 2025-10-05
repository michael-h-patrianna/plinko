import { generateTrajectory } from '../../src/game/trajectory.js';

// We need to expose the internal functions for testing
// For now, let's just test the full trajectory to understand what's happening

const params = {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: 12345,
};

console.log('Testing trajectory generation with params:');
console.log(JSON.stringify(params, null, 2));

const { trajectory, landedSlot } = generateTrajectory(params);

// Analyze the trajectory
console.log('\n=== TRAJECTORY ANALYSIS ===');
console.log(`Total frames: ${trajectory.length}`);

// Count peg hits
let pegHits = 0;
let lastHitFrame = -100;
const hitsByRow = new Map();

for (let i = 0; i < trajectory.length; i++) {
  const point = trajectory[i];
  if (point.pegHit) {
    pegHits++;
    const timeSinceLastHit = i - lastHitFrame;
    lastHitFrame = i;

    // Estimate which row based on y position
    const rowEstimate = Math.floor((point.y - 32) / 31);
    if (!hitsByRow.has(rowEstimate)) {
      hitsByRow.set(rowEstimate, 0);
    }
    hitsByRow.set(rowEstimate, hitsByRow.get(rowEstimate) + 1);

    console.log(
      `Peg hit #${pegHits} at frame ${i}: x=${point.x.toFixed(1)}, y=${point.y.toFixed(1)} (${timeSinceLastHit} frames since last hit)`
    );
  }
}

console.log(`\nTotal peg hits: ${pegHits}`);
console.log('Expected: 10 (one per row)');

// Check final position
const finalFrame = trajectory[trajectory.length - 1];

console.log('\n=== FINAL RESULT ===');
console.log(`Final position: x=${finalFrame.x.toFixed(1)}, y=${finalFrame.y.toFixed(1)}`);
console.log(`Landed in slot: ${landedSlot}`);
