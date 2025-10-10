/**
 * PegField component - renders all pegs with memoization
 * Pegs are static components with flash animations controlled imperatively by BallAnimationDriver
 */

import { memo, useMemo } from 'react';
import { generatePegLayout, BOARD } from '@game/boardGeometry';
import { Peg } from '../Peg';

interface PegFieldProps {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  isSelectingPosition: boolean;
}

export const PegField = memo(function PegField({
  boardWidth,
  boardHeight,
  pegRows,
  isSelectingPosition,
}: PegFieldProps) {
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
        const pegKey = `${peg.row}-${peg.col}`;

        return (
          <Peg
            key={pegKey}
            row={peg.row}
            col={peg.col}
            x={peg.x}
            y={peg.y}
          />
        );
      })}
    </div>
  );
});
