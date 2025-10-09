/**
 * PegField component - renders all pegs with memoization
 * Pre-calculates hit frames from trajectory for frame-drop-safe animations
 */

import { memo, useMemo } from 'react';
import type { GameState, TrajectoryPoint } from '../../../../game/types';
import { generatePegLayout, BOARD } from '../../../../game/boardGeometry';
import { Peg } from '../Peg';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface PegFieldProps {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  trajectory?: TrajectoryPoint[];
  frameStore?: FrameStore;
  ballState: GameState;
  isSelectingPosition: boolean;
}

export const PegField = memo(function PegField({
  boardWidth,
  boardHeight,
  pegRows,
  trajectory,
  frameStore,
  ballState,
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

  // Pre-calculate hit frames for each peg from trajectory
  const pegHitFrames = useMemo(() => {
    if (!trajectory || trajectory.length === 0) return new Map<string, number[]>();

    const hitMap = new Map<string, number[]>();

    trajectory.forEach((point, frameIndex) => {
      if (point.pegsHit && point.pegsHit.length > 0) {
        point.pegsHit.forEach((pegHit) => {
          const key = `${pegHit.row}-${pegHit.col}`;
          const frames = hitMap.get(key) || [];
          frames.push(frameIndex);
          hitMap.set(key, frames);
        });
      }
    });

    return hitMap;
  }, [trajectory]);

  return (
    <div
      style={{
        opacity: isSelectingPosition ? 0.1 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {pegs.map((peg) => {
        const pegKey = `${peg.row}-${peg.col}`;
        const hitFrames = pegHitFrames.get(pegKey);

        return (
          <Peg
            key={pegKey}
            row={peg.row}
            col={peg.col}
            x={peg.x}
            y={peg.y}
            hitFrames={hitFrames}
            frameStore={frameStore}
            shouldReset={ballState === 'idle'}
          />
        );
      })}
    </div>
  );
});
