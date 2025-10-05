import { generateTrajectory } from '../../src/game/trajectory.js';

const trajectory = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  selectedIndex: 0,
  seed: 12345,
});

console.log(`Total frames: ${trajectory.length}`);
console.log('\nFrames 70-100 speed analysis:');

for (let i = 70; i <= 100 && i < trajectory.length; i++) {
  const curr = trajectory[i];
  const prev = trajectory[i - 1];
  if (prev) {
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = dist * 60; // px/s at 60 FPS

    if (speed > 800) {
      console.log(`Frame ${i}: UNREALISTIC SPEED ${speed.toFixed(0)}px/s`);
      console.log(`  From: x=${prev.x.toFixed(1)}, y=${prev.y.toFixed(1)}`);
      console.log(`  To:   x=${curr.x.toFixed(1)}, y=${curr.y.toFixed(1)}`);
      console.log(`  Jump: dx=${dx.toFixed(1)}, dy=${dy.toFixed(1)}, dist=${dist.toFixed(1)}px`);
    }
  }
}

// Check if ball lands in correct slot
const finalFrame = trajectory[trajectory.length - 1];
const slotWidth = 375 / 6;
const targetSlotLeft = 0 * slotWidth;
const targetSlotRight = 1 * slotWidth;
const inCorrectSlot = finalFrame.x >= targetSlotLeft && finalFrame.x <= targetSlotRight;

console.log(`\nFinal position: x=${finalFrame.x.toFixed(1)}, y=${finalFrame.y.toFixed(1)}`);
console.log(`Target slot 0: x=[${targetSlotLeft.toFixed(1)}, ${targetSlotRight.toFixed(1)}]`);
console.log(`Landed in correct slot: ${inCorrectSlot ? '✅ YES' : '❌ NO'}`);
