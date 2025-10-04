const { generateTrajectory } = require('./dist/game/trajectory.js');

// Test edge slots specifically
const tests = [
  { slot: 0, seed: 12345 },
  { slot: 5, seed: 12346 },
  { slot: 2, seed: 12347 },
  { slot: 3, seed: 12348 }
];

for (const test of tests) {
  const trajectory = generateTrajectory({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
    selectedIndex: test.slot,
    seed: test.seed
  });

  const lastFrame = trajectory[trajectory.length - 1];
  const slotWidth = 375 / 6;
  const actualSlot = Math.floor(lastFrame.x / slotWidth);

  console.log(`Target: ${test.slot}, Actual: ${actualSlot}, X: ${lastFrame.x.toFixed(1)}, Success: ${actualSlot === test.slot ? '✅' : '❌'}`);
}
