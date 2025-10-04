/**
 * Main Plinko board with pegs and slots
 */

import { useMemo } from 'react';
import type { PrizeConfig, TrajectoryPoint, BallPosition, GameState } from '../../game/types';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { Ball } from '../Ball';

interface PlinkoBoardProps {
  prizes: PrizeConfig[];
  selectedIndex: number;
  currentTrajectoryPoint: TrajectoryPoint | null;
  boardWidth?: number;
  boardHeight?: number;
  pegRows?: number;
  ballPosition: BallPosition | null;
  ballState: GameState;
}

export function PlinkoBoard({
  prizes,
  selectedIndex,
  currentTrajectoryPoint,
  boardWidth = 375,
  boardHeight = 500,
  pegRows = 10,
  ballPosition,
  ballState
}: PlinkoBoardProps) {
  const slotCount = prizes.length;

  // Generate peg layout - staggered pattern like real Plinko
  const pegs = useMemo(() => {
    const pegList: { row: number; col: number; x: number; y: number }[] = [];
    const verticalSpacing = (boardHeight * 0.65) / (pegRows + 1);
    const horizontalSpacing = boardWidth / (slotCount + 1);

    for (let row = 0; row < pegRows; row++) {
      const pegsInRow = slotCount + 1;
      const y = verticalSpacing * (row + 1) + 20; // Start 20px from top

      // Offset every other row for staggered pattern
      const offset = row % 2 === 0 ? 0 : horizontalSpacing / 2;

      for (let col = 0; col < pegsInRow; col++) {
        const x = horizontalSpacing * col + horizontalSpacing / 2 + offset;
        pegList.push({ row, col, x, y });
      }
    }

    return pegList;
  }, [boardHeight, boardWidth, pegRows, slotCount]);

  // Generate slot positions
  const slots = useMemo(() => {
    const slotWidth = boardWidth / slotCount;
    return prizes.map((prize, index) => ({
      index,
      prize,
      x: index * slotWidth,
      width: slotWidth
    }));
  }, [prizes, slotCount, boardWidth]);

  return (
    <div
      className="relative bg-slate-700"
      style={{
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
        overflow: 'visible'
      }}
      data-testid="plinko-board"
    >
      {/* Pegs */}
      {pegs.map((peg) => (
        <Peg
          key={`peg-${peg.row}-${peg.col}`}
          row={peg.row}
          col={peg.col}
          x={peg.x}
          y={peg.y}
          isActive={currentTrajectoryPoint?.pegHit === true}
        />
      ))}

      {/* Slots */}
      {slots.map((slot) => (
        <Slot
          key={`slot-${slot.index}`}
          index={slot.index}
          prize={slot.prize}
          x={slot.x}
          width={slot.width}
          isWinning={slot.index === selectedIndex}
        />
      ))}

      {/* Ball - positioned within board coordinate system */}
      <Ball
        position={ballPosition}
        state={ballState}
        currentFrame={currentTrajectoryPoint?.frame ?? 0}
      />
    </div>
  );
}
