// Quick test to see what the trajectory looks like
import { generateTrajectory } from '../../src/game/trajectory.ts';

const { trajectory, landedSlot } = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: 42,
});

console.log('Total frames:', trajectory.length);
console.log('\nFirst 10 frames:');
for (let i = 0; i < Math.min(10, trajectory.length); i++) {
  const p = trajectory[i];
  console.log(`Frame ${p.frame}: x=${p.x.toFixed(1)}, y=${p.y.toFixed(1)}, pegHit=${p.pegHit}`);
}

console.log('\nLast 10 frames:');
for (let i = Math.max(0, trajectory.length - 10); i < trajectory.length; i++) {
  const p = trajectory[i];
  console.log(`Frame ${p.frame}: x=${p.x.toFixed(1)}, y=${p.y.toFixed(1)}, pegHit=${p.pegHit}`);
}

console.log('\nFrames with pegHit:');
const pegHits = trajectory.filter((p) => p.pegHit);
console.log('Total peg hits:', pegHits.length);
pegHits.slice(0, 5).forEach((p) => {
  console.log(`Frame ${p.frame}: x=${p.x.toFixed(1)}, y=${p.y.toFixed(1)}`);
});

console.log(`\nLanded in slot: ${landedSlot}`);
