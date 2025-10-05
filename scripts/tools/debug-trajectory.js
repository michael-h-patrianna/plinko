import { generateTrajectory } from '../../src/game/trajectory.ts';

const trajectory = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  selectedIndex: 0,
  seed: 12345,
});

console.log(`Total frames: ${trajectory.length}`);
console.log(`\nLast 20 frames:`);

for (let i = Math.max(0, trajectory.length - 20); i < trajectory.length; i++) {
  const p = trajectory[i];
  console.log(
    `Frame ${p.frame}: y=${p.y.toFixed(1)}px, vx=${p.vx?.toFixed(2)}, vy=${p.vy?.toFixed(2)}, speed=${Math.sqrt((p.vx || 0) ** 2 + (p.vy || 0) ** 2).toFixed(2)}`
  );
}

console.log(
  `\nFinal position: x=${trajectory[trajectory.length - 1].x.toFixed(1)}, y=${trajectory[trajectory.length - 1].y.toFixed(1)}`
);
console.log(
  `Final velocity: vx=${trajectory[trajectory.length - 1].vx}, vy=${trajectory[trajectory.length - 1].vy}`
);
