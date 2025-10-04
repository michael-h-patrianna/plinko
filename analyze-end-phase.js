import { generateTrajectory } from './src/game/trajectory.ts';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

// Analyze multiple trajectories for different target slots
console.log('🔍 Analyzing End Phase Trajectory (After Last Peg Row)\n');
console.log('='.repeat(80));

for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
  const seed = 12345 + targetSlot;

  const trajectory = generateTrajectory({
    boardWidth: BOARD_WIDTH,
    boardHeight: BOARD_HEIGHT,
    pegRows: PEG_ROWS,
    slotCount: SLOT_COUNT,
    selectedIndex: targetSlot,
    seed
  });

  // Last peg row is at approximately 70% of board height
  const lastPegRowY = BOARD_HEIGHT * 0.65;
  const slotY = BOARD_HEIGHT * 0.8;

  // Find frames after last peg row
  const endPhaseFrames = trajectory.filter(p => p.y >= lastPegRowY);
  const afterLastPeg = endPhaseFrames[0];
  const finalFrame = trajectory[trajectory.length - 1];

  // Calculate target slot position
  const slotWidth = BOARD_WIDTH / SLOT_COUNT;
  const targetSlotX = (targetSlot + 0.5) * slotWidth;

  console.log(`\nTarget Slot ${targetSlot} (seed: ${seed}):`);
  console.log(`  Target X: ${targetSlotX.toFixed(1)}px`);
  console.log(`  After last peg (y=${lastPegRowY}px):`);
  console.log(`    - Position: x=${afterLastPeg.x.toFixed(1)}px`);
  console.log(`    - Distance from target: ${Math.abs(afterLastPeg.x - targetSlotX).toFixed(1)}px`);
  console.log(`  Final landing:`);
  console.log(`    - Position: x=${finalFrame.x.toFixed(1)}px, y=${finalFrame.y.toFixed(1)}px`);
  console.log(`    - Distance from target: ${Math.abs(finalFrame.x - targetSlotX).toFixed(1)}px`);
  console.log(`    - Landed in correct slot: ${Math.abs(finalFrame.x - targetSlotX) < slotWidth / 2 ? '✅ YES' : '❌ NO'}`);

  // Analyze movement in end phase
  const endPhaseMovement = [];
  for (let i = 1; i < endPhaseFrames.length; i++) {
    const dx = endPhaseFrames[i].x - endPhaseFrames[i - 1].x;
    const dy = endPhaseFrames[i].y - endPhaseFrames[i - 1].y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    endPhaseMovement.push({ dx, dy, speed });
  }

  const avgSpeed = endPhaseMovement.reduce((sum, m) => sum + m.speed, 0) / endPhaseMovement.length;
  const maxXJump = Math.max(...endPhaseMovement.map(m => Math.abs(m.dx)));

  console.log(`  End phase motion:`);
  console.log(`    - Frames after last peg: ${endPhaseFrames.length}`);
  console.log(`    - Average speed: ${avgSpeed.toFixed(2)}px/frame`);
  console.log(`    - Max horizontal jump: ${maxXJump.toFixed(2)}px/frame`);
  console.log(`    - Suspicious jump: ${maxXJump > 5 ? '⚠️  YES - may be teleporting' : '✅ No - looks natural'}`);
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ Analysis complete. Check for:');
console.log('  1. Ball lands in correct slot (distance < slot width/2)');
console.log('  2. No suspicious horizontal jumps in end phase (max < 5px/frame)');
console.log('  3. Smooth continuous movement after last peg row\n');
