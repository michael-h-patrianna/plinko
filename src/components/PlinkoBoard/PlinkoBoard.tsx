/**
 * Main Plinko board with pegs and slots
 */

import { useMemo } from 'react';
import type { PrizeConfig, TrajectoryPoint, BallPosition, GameState } from '../../game/types';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { Ball } from '../Ball';
import { ImpactParticles } from '../ImpactParticles';

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
  const BORDER_WIDTH = 12;

  // Generate peg layout - staggered pattern like real Plinko
  const pegs = useMemo(() => {
    const pegList: { row: number; col: number; x: number; y: number }[] = [];
    // Account for border walls in calculations
    const playableWidth = boardWidth - (BORDER_WIDTH * 2);
    const playableHeight = boardHeight * 0.65;

    const verticalSpacing = playableHeight / (pegRows + 1);
    const horizontalSpacing = playableWidth / slotCount;

    for (let row = 0; row < pegRows; row++) {
      const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20; // Account for top border

      // Offset every other row for staggered pattern
      const isOffsetRow = row % 2 === 1;
      const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
      const pegsInRow = isOffsetRow ? slotCount : slotCount + 1;

      for (let col = 0; col < pegsInRow; col++) {
        const x = BORDER_WIDTH + horizontalSpacing * col + offset;
        pegList.push({ row, col, x, y });
      }
    }

    return pegList;
  }, [boardHeight, boardWidth, pegRows, slotCount, BORDER_WIDTH]);

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
      className="relative"
      style={{
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
        overflow: 'visible',
        background: `
          radial-gradient(circle at 50% 30%, rgba(30,41,59,0.9) 0%, rgba(15,23,42,1) 60%),
          linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)
        `,
        borderRadius: '16px',
        boxShadow: `
          inset 0 6px 30px rgba(0,0,0,0.7),
          inset 0 -3px 15px rgba(71,85,105,0.2),
          0 12px 40px rgba(0,0,0,0.5),
          0 6px 20px rgba(0,0,0,0.3)
        `,
        border: '2px solid rgba(71,85,105,0.3)'
      }}
      data-testid="plinko-board"
    >
      {/* Left Border Wall */}
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{
          width: `${BORDER_WIDTH}px`,
          background: 'linear-gradient(90deg, #475569 0%, #334155 50%, #1e293b 100%)',
          boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.1)',
          borderRadius: '12px 0 0 12px'
        }}
      />

      {/* Right Border Wall */}
      <div
        className="absolute top-0 right-0 bottom-0"
        style={{
          width: `${BORDER_WIDTH}px`,
          background: 'linear-gradient(270deg, #475569 0%, #334155 50%, #1e293b 100%)',
          boxShadow: 'inset 2px 0 8px rgba(0,0,0,0.5), inset -2px 0 4px rgba(255,255,255,0.1)',
          borderRadius: '0 12px 12px 0'
        }}
      />

      {/* Top Border Wall */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${BORDER_WIDTH}px`,
          background: 'linear-gradient(180deg, #475569 0%, #334155 50%, #1e293b 100%)',
          boxShadow: 'inset 0 -2px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
          borderRadius: '12px 12px 0 0'
        }}
      />

      {/* Pegs */}
      {pegs.map((peg) => (
        <Peg
          key={`peg-${peg.row}-${peg.col}`}
          row={peg.row}
          col={peg.col}
          x={peg.x}
          y={peg.y}
          isActive={
            currentTrajectoryPoint?.pegHit === true &&
            currentTrajectoryPoint?.pegHitRow === peg.row &&
            currentTrajectoryPoint?.pegHitCol === peg.col
          }
          shouldReset={ballState === 'idle'}
        />
      ))}

      {/* Slots */}
      {slots.map((slot) => {
        // Check if ball is approaching this slot (in lower 40% of board and horizontally close)
        const isApproaching = ballState === 'dropping' && currentTrajectoryPoint
          ? currentTrajectoryPoint.y > boardHeight * 0.6 &&
            Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width * 1.5
          : false;

        // Only show winning state during drop and end phase, not when idle
        const isWinning = ballState !== 'idle' && slot.index === selectedIndex;

        return (
          <Slot
            key={`slot-${slot.index}`}
            index={slot.index}
            prize={slot.prize}
            x={slot.x}
            width={slot.width}
            isWinning={isWinning}
            isApproaching={isApproaching}
          />
        );
      })}

      {/* Impact particles on peg hits */}
      {currentTrajectoryPoint?.pegHit && currentTrajectoryPoint.pegHitRow !== undefined && currentTrajectoryPoint.pegHitCol !== undefined && (() => {
        // Find the peg that was hit
        const hitPeg = pegs.find(p => p.row === currentTrajectoryPoint.pegHitRow && p.col === currentTrajectoryPoint.pegHitCol);
        return hitPeg ? (
          <ImpactParticles
            pegHit={true}
            pegX={hitPeg.x}
            pegY={hitPeg.y}
            reset={ballState === 'idle'}
          />
        ) : null;
      })()}

      {/* Ball - positioned within board coordinate system */}
      <Ball
        position={ballPosition}
        state={ballState}
        currentFrame={currentTrajectoryPoint?.frame ?? 0}
        trajectoryPoint={currentTrajectoryPoint}
      />
    </div>
  );
}
