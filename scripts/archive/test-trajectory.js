const { generateTrajectory } = require('../../dist/game/trajectory.js');

// Test different seeds
const tests = [
  { seed: 12345 },
  { seed: 12346 },
  { seed: 12347 },
  { seed: 12348 },
];

for (const test of tests) {
  const { trajectory, landedSlot } = generateTrajectory({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
    seed: test.seed,
  });

  const lastFrame = trajectory[trajectory.length - 1];

  console.log(
    `Seed: ${test.seed}, Landed slot: ${landedSlot}, X: ${lastFrame.x.toFixed(1)} ✅`
  );
}
