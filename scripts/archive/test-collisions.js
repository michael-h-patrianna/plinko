const { generateTrajectory } = require('../../dist/game/trajectory.js');

const { trajectory, landedSlot } = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: 12345,
});

// Count peg hits
const pegHits = trajectory.filter((frame) => frame.pegHit);
console.log(`Total frames: ${trajectory.length}`);
console.log(`Peg hits: ${pegHits.length}`);
console.log(
  'Peg hit frames:',
  pegHits.map((f) => `Frame ${f.frame}: Row ${f.pegHitRow}, Col ${f.pegHitCol}`).slice(0, 10)
);

// Check if ball is passing through pegs
const pegs = [];
const BORDER_WIDTH = 12;
const playableWidth = 375 - BORDER_WIDTH * 2;
const playableHeight = 500 * 0.65;
const verticalSpacing = playableHeight / 11;
const horizontalSpacing = playableWidth / 6;

for (let row = 0; row < 10; row++) {
  const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20;
  const isOffsetRow = row % 2 === 1;
  const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
  const numPegs = isOffsetRow ? 6 : 7;

  for (let col = 0; col < numPegs; col++) {
    const x = BORDER_WIDTH + horizontalSpacing * col + offset;
    pegs.push({ x, y, row, col });
  }
}

// Check for tunneling
let tunneling = 0;
for (let i = 1; i < trajectory.length; i++) {
  const frame = trajectory[i];
  for (const peg of pegs) {
    const dist = Math.sqrt(Math.pow(frame.x - peg.x, 2) + Math.pow(frame.y - peg.y, 2));
    if (dist < 16 && !frame.pegHit) {
      // Ball+peg radius = 16
      tunneling++;
      if (tunneling <= 3) {
        console.log(
          `TUNNELING at frame ${i}: Ball at (${frame.x.toFixed(1)}, ${frame.y.toFixed(1)}) passes through peg at (${peg.x.toFixed(1)}, ${peg.y.toFixed(1)}), dist=${dist.toFixed(1)}`
        );
      }
    }
  }
}
console.log(`Total tunneling instances: ${tunneling}`);
