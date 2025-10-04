/**
 * Main Plinko board with pegs and slots
 * Enhanced with triple-A win animations
 */

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PrizeConfig, TrajectoryPoint, BallPosition, GameState } from '../../game/types';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { BorderWall } from './BorderWall';
import { Ball } from '../Ball';
import { BallLauncher } from '../BallLauncher';
import { SlotAnticipation } from '../WinAnimations/SlotAnticipation';
import { SlotWinReveal } from '../WinAnimations/SlotWinReveal';

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
  const BORDER_WIDTH = 8;
  // Board has box-sizing: border-box, so the 2px CSS border is INSIDE the width
  const CSS_BORDER = 2;
  // Internal content width = declared width - CSS borders on both sides
  const internalWidth = boardWidth - (CSS_BORDER * 2);

  // Animation states
  const [showAnticipation, setShowAnticipation] = useState(false);
  const [showWinReveal, setShowWinReveal] = useState(false);

  // Trigger anticipation when ball is approaching (in bottom 30% of board)
  useEffect(() => {
    if (ballState === 'dropping' && currentTrajectoryPoint) {
      const isInLowerThird = currentTrajectoryPoint.y > boardHeight * 0.7;
      setShowAnticipation(isInLowerThird);
    } else {
      setShowAnticipation(false);
    }
  }, [ballState, currentTrajectoryPoint, boardHeight]);

  // Trigger win reveal when ball lands
  useEffect(() => {
    if (ballState === 'landed' && currentTrajectoryPoint) {
      // Show win reveal after short delay
      const revealTimer = setTimeout(() => {
        setShowWinReveal(true);
      }, 600);

      return () => {
        clearTimeout(revealTimer);
      };
    } else {
      setShowWinReveal(false);
    }
  }, [ballState, currentTrajectoryPoint]);

  // Responsive sizing: smaller ball/peg for narrow viewports
  const pegRadius = internalWidth <= 360 ? 6 : 7;
  const ballRadius = internalWidth <= 360 ? 6 : 7;

  // Generate peg layout - staggered pattern like real Plinko
  const pegs = useMemo(() => {
    const pegList: { row: number; col: number; x: number; y: number }[] = [];

    // Responsive sizing: smaller ball/peg for narrow viewports
    const PEG_RADIUS = internalWidth <= 360 ? 6 : 7;
    const BALL_RADIUS = internalWidth <= 360 ? 6 : 7;
    // Reduce clearance on smaller viewports for better spacing
    const extraClearance = internalWidth <= 360 ? 8 : 10;
    const minClearance = PEG_RADIUS + BALL_RADIUS + extraClearance;
    const playableHeight = boardHeight * 0.65;

    const verticalSpacing = playableHeight / (pegRows + 1);

    // The leftmost and rightmost pegs should be minClearance away from the walls
    // Use internalWidth (371px) instead of boardWidth (375px) due to box-sizing: border-box
    const leftEdge = BORDER_WIDTH + minClearance;
    const rightEdge = internalWidth - BORDER_WIDTH - minClearance;
    const pegSpanWidth = rightEdge - leftEdge;

    // Non-offset rows have slotCount + 1 pegs
    // These pegs should be evenly distributed from leftEdge to rightEdge
    // So spacing = pegSpanWidth / slotCount (which creates slotCount gaps between slotCount + 1 pegs)
    const horizontalSpacing = pegSpanWidth / slotCount;

    for (let row = 0; row < pegRows; row++) {
      const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20; // Account for top border

      // Offset every other row for staggered pattern
      const isOffsetRow = row % 2 === 1;
      const pegsInRow = isOffsetRow ? slotCount : slotCount + 1;

      for (let col = 0; col < pegsInRow; col++) {
        if (isOffsetRow) {
          // Offset rows: center pegs between the non-offset pegs
          const x = leftEdge + horizontalSpacing * (col + 0.5);
          pegList.push({ row, col, x, y });
        } else {
          // Non-offset rows: first peg at leftEdge, last peg at rightEdge
          const x = leftEdge + horizontalSpacing * col;
          pegList.push({ row, col, x, y });
        }
      }
    }

    return pegList;
  }, [boardHeight, internalWidth, pegRows, slotCount, BORDER_WIDTH]);

  // Generate slot positions - account for border walls
  const slots = useMemo(() => {
    // Use internalWidth due to box-sizing: border-box
    const playableWidth = internalWidth - (BORDER_WIDTH * 2);
    const slotWidth = playableWidth / slotCount;
    return prizes.map((prize, index) => ({
      index,
      prize,
      x: BORDER_WIDTH + (index * slotWidth),
      width: slotWidth
    }));
  }, [prizes, slotCount, internalWidth, BORDER_WIDTH]);

  return (
    <motion.div
      className="relative"
      style={{
        width: '100%',
        maxWidth: `${boardWidth}px`,
        height: `${boardHeight}px`,
        margin: '0 auto', // Center the board when it doesn't fill full width
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
        border: '2px solid rgba(71,85,105,0.3)',
      }}
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      data-testid="plinko-board"
    >
      {/* Border Walls with impact animation */}
      <BorderWall
        side="left"
        width={BORDER_WIDTH}
        hasImpact={currentTrajectoryPoint?.wallHit === 'left'}
      />
      <BorderWall
        side="right"
        width={BORDER_WIDTH}
        hasImpact={currentTrajectoryPoint?.wallHit === 'right'}
      />
      <BorderWall
        side="top"
        width={BORDER_WIDTH}
        hasImpact={false}
      />

      {/* Pegs */}
      {pegs.map((peg) => {
        // Check if this peg is in the pegsHit array
        const isActive = currentTrajectoryPoint?.pegsHit?.some(
          hit => hit.row === peg.row && hit.col === peg.col
        ) ?? false;

        // Log when we detect a peg hit in trajectory data
        if (isActive) {
          console.log(`📍 PlinkoBoard: Peg (${peg.row}, ${peg.col}) should be active (frame ${currentTrajectoryPoint?.frame})`);
        }

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

      {/* Slots */}
      {slots.map((slot) => {
        // Check if ball is approaching this slot (in lower 40% of board and horizontally close)
        const isApproaching = ballState === 'dropping' && currentTrajectoryPoint
          ? currentTrajectoryPoint.y > boardHeight * 0.6 &&
            Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width * 1.5
          : false;

        // Only show winning state during drop and end phase, not when idle
        const isWinning = ballState !== 'idle' && slot.index === selectedIndex;

        // Determine if ball is in this slot (bucket zone)
        const bucketZoneY = boardHeight - 70;
        const isInThisSlot = currentTrajectoryPoint && currentTrajectoryPoint.y >= bucketZoneY
          ? Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width / 2
          : false;

        // Pass collision data if ball is in this slot
        const wallImpact = isInThisSlot ? currentTrajectoryPoint?.bucketWallHit : null;
        const floorImpact = isInThisSlot && currentTrajectoryPoint?.bucketFloorHit;

        return (
          <Slot
            key={`slot-${slot.index}`}
            index={slot.index}
            prize={slot.prize}
            x={slot.x}
            width={slot.width}
            isWinning={isWinning}
            isApproaching={isApproaching}
            wallImpact={wallImpact}
            floorImpact={floorImpact}
          />
        );
      })}

      {/* Ball launcher - visible during countdown */}
      {ballState === 'countdown' && ballPosition && (
        <BallLauncher
          x={ballPosition.x}
          y={ballPosition.y}
          isLaunching={false}
        />
      )}

      {/* Ball launcher launching animation - brief moment when dropping starts */}
      {ballState === 'dropping' && currentTrajectoryPoint?.frame === 0 && ballPosition && (
        <BallLauncher
          x={ballPosition.x}
          y={ballPosition.y}
          isLaunching={true}
        />
      )}

      {/* Ball - positioned within board coordinate system */}
      <Ball
        position={ballPosition}
        state={ballState}
        currentFrame={currentTrajectoryPoint?.frame ?? 0}
        trajectoryPoint={currentTrajectoryPoint}
      />

      {/* Win Animations */}
      {showAnticipation && selectedIndex >= 0 && selectedIndex < slots.length && (
        <SlotAnticipation
          x={slots[selectedIndex].x}
          width={slots[selectedIndex].width}
          color={slots[selectedIndex].prize.color}
          isActive={showAnticipation}
        />
      )}

      {showWinReveal && selectedIndex >= 0 && selectedIndex < slots.length && (
        <SlotWinReveal
          x={slots[selectedIndex].x}
          y={boardHeight - 70}
          width={slots[selectedIndex].width}
          height={70}
          color={slots[selectedIndex].prize.color}
          label={slots[selectedIndex].prize.label}
          isActive={showWinReveal}
        />
      )}
    </motion.div>
  );
}
