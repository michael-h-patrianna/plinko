import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '../game/trajectory';

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const SLOT_COUNT = 6;

describe('End Phase Trajectory Analysis', () => {
  it('should analyze trajectory after last peg row for all slots', () => {
    console.log('\n🔍 Analyzing End Phase Trajectory (After Last Peg Row)\n');
    console.log('='.repeat(80));

    for (let targetSlot = 0; targetSlot < SLOT_COUNT; targetSlot++) {
      const seed = 12345 + targetSlot;

      const { trajectory, landedSlot } = generateTrajectory({
        boardWidth: BOARD_WIDTH,
        boardHeight: BOARD_HEIGHT,
        pegRows: PEG_ROWS,
        slotCount: SLOT_COUNT,
        seed,
      });

      // Last peg row is at approximately 70% of board height
      const lastPegRowY = BOARD_HEIGHT * 0.65;

      // Find frames after last peg row
      const endPhaseFrames = trajectory.filter((p) => p.y >= lastPegRowY);
      const afterLastPeg = endPhaseFrames[0];
      const finalFrame = trajectory[trajectory.length - 1]!;

      // Calculate landed slot position
      const slotWidth = BOARD_WIDTH / SLOT_COUNT;
      const landedSlotX = (landedSlot + 0.5) * slotWidth;

      console.log(`\nLanded Slot ${landedSlot} (seed: ${seed}):`);
      console.log(`  Landed Slot X: ${landedSlotX.toFixed(1)}px`);
      if (afterLastPeg) {
        console.log(`  After last peg (y=${lastPegRowY}px):`);
        console.log(`    - Position: x=${afterLastPeg.x.toFixed(1)}px`);
        console.log(
          `    - Distance from landed slot: ${Math.abs(afterLastPeg.x - landedSlotX).toFixed(1)}px`
        );
      } else {
        console.log(`  After last peg (y=${lastPegRowY}px): No frames (ball stopped early)`);
      }
      console.log(`  Final landing:`);
      console.log(`    - Position: x=${finalFrame.x.toFixed(1)}px, y=${finalFrame.y.toFixed(1)}px`);
      console.log(
        `    - Distance from landed slot: ${Math.abs(finalFrame.x - landedSlotX).toFixed(1)}px`
      );
      console.log(
        `    - Landed in valid slot: ${landedSlot >= 0 && landedSlot < SLOT_COUNT ? '✅ YES' : '❌ NO'}`
      );

      // Analyze movement in end phase
      if (endPhaseFrames.length > 1) {
        const endPhaseMovement = [];
        for (let i = 1; i < endPhaseFrames.length; i++) {
          const dx = endPhaseFrames[i]!.x - endPhaseFrames[i - 1]!.x;
          const dy = endPhaseFrames[i]!.y - endPhaseFrames[i - 1]!.y;
          const speed = Math.sqrt(dx * dx + dy * dy);
          endPhaseMovement.push({ dx, dy, speed });
        }

        const avgSpeed =
          endPhaseMovement.reduce((sum, m) => sum + m.speed, 0) / endPhaseMovement.length;
        const maxXJump = Math.max(...endPhaseMovement.map((m) => Math.abs(m.dx)));

        console.log(`  End phase motion:`);
        console.log(`    - Frames after last peg: ${endPhaseFrames.length}`);
        console.log(`    - Average speed: ${avgSpeed.toFixed(2)}px/frame`);
        console.log(`    - Max horizontal jump: ${maxXJump.toFixed(2)}px/frame`);
        console.log(
          `    - Suspicious jump: ${maxXJump > 5 ? '⚠️  YES - may be teleporting' : '✅ No - looks natural'}`
        );

        // Assertions - verify ball landed in valid slot
        expect(landedSlot).toBeGreaterThanOrEqual(0);
        expect(landedSlot).toBeLessThan(SLOT_COUNT);
        expect(maxXJump).toBeLessThan(40); // Allow bucket wall bounces - ball bounces off bucket walls
      } else {
        console.log(`  End phase motion: No end phase frames (ball stopped at slot immediately)`);

        // Still verify valid slot landing
        expect(landedSlot).toBeGreaterThanOrEqual(0);
        expect(landedSlot).toBeLessThan(SLOT_COUNT);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Analysis complete\n');
  });
});
