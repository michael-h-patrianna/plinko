/**
 * PegField component - renders all pegs with memoization
 * Handles peg layout, hit detection, and reset state
 */

import { memo, useMemo } from 'react';
import type { GameState, TrajectoryPoint } from '../../../../game/types';
import { generatePegLayout, BOARD } from '../../../../game/boardGeometry';
import { Peg } from '../Peg';

interface PegFieldProps {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  getCurrentTrajectoryPoint?: () => TrajectoryPoint | null;
  ballState: GameState;
  isSelectingPosition: boolean;
}

export const PegField = memo(function PegField({
  boardWidth,
  boardHeight,
  pegRows,
  getCurrentTrajectoryPoint,
  ballState,
  isSelectingPosition,
}: PegFieldProps) {
  // Get current trajectory point only when needed for rendering
  const currentTrajectoryPoint = getCurrentTrajectoryPoint?.();
  // Generate peg layout - staggered pattern like real Plinko
  const pegs = useMemo(() => {
    return generatePegLayout({
      boardWidth,
      boardHeight,
      pegRows,
      cssBorder: BOARD.CSS_BORDER,
    });
  }, [boardHeight, boardWidth, pegRows]);

  return (
    <div
      style={{
        opacity: isSelectingPosition ? 0.1 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {pegs.map((peg) => {
        // Check if this peg is in the pegsHit array
        const isActive =
          currentTrajectoryPoint?.pegsHit?.some(
            (hit) => hit.row === peg.row && hit.col === peg.col
          ) ?? false;

        return (
          <Peg
            key={`peg-${peg.row}-${peg.col}`}
            row={peg.row}
            col={peg.col}
            x={peg.x}
            y={peg.y}
            isActive={isActive}
            shouldReset={ballState === 'idle'}
          />
        );
      })}
    </div>
  );
});
