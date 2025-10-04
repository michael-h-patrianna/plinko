/**
 * Main Plinko board with pegs and slots
 * Enhanced with triple-A win animations
 * FULLY THEMEABLE - No hard-coded styles
 */

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PrizeConfig, TrajectoryPoint, BallPosition, GameState } from '../../game/types';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { BorderWall } from './BorderWall';
import { Ball } from '../Ball';
import { BallLauncher } from '../BallLauncher';
import { SlotWinReveal } from '../WinAnimations/SlotWinReveal';
import { ComboLegend } from './ComboLegend';
import { calculateBucketZoneY } from '../../utils/slotDimensions';
import { useTheme } from '../../theme';

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
  const { theme } = useTheme();
  const slotCount = prizes.length;
  const BORDER_WIDTH = 8;
  // Board has box-sizing: border-box, so the 2px CSS border is INSIDE the width
  const CSS_BORDER = 2;
  // Internal content width = declared width - CSS borders on both sides
  const internalWidth = boardWidth - (CSS_BORDER * 2);

  // Animation state for win reveal
  const [showWinReveal, setShowWinReveal] = useState(false);

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

    // Use a FIXED optimal peg count (what worked for 6 prizes)
    // This keeps peg spacing consistent regardless of prize count
    const OPTIMAL_PEG_COLUMNS = 6;

    // The leftmost and rightmost pegs should be minClearance away from the walls
    // Use internalWidth (371px) instead of boardWidth (375px) due to box-sizing: border-box
    const leftEdge = BORDER_WIDTH + minClearance;
    const rightEdge = internalWidth - BORDER_WIDTH - minClearance;
    const pegSpanWidth = rightEdge - leftEdge;

    // Non-offset rows have OPTIMAL_PEG_COLUMNS + 1 pegs
    // These pegs should be evenly distributed from leftEdge to rightEdge
    const horizontalSpacing = pegSpanWidth / OPTIMAL_PEG_COLUMNS;

    for (let row = 0; row < pegRows; row++) {
      const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20; // Account for top border

      // Offset every other row for staggered pattern
      const isOffsetRow = row % 2 === 1;
      const pegsInRow = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

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
  }, [boardHeight, internalWidth, pegRows, BORDER_WIDTH]);

  // Generate slot positions and assign combo badge numbers
  const slots = useMemo(() => {
    // Use internalWidth due to box-sizing: border-box
    const playableWidth = internalWidth - (BORDER_WIDTH * 2);
    const slotWidth = playableWidth / slotCount;
    let comboBadgeCounter = 1;

    return prizes.map((prize, index) => {
      // Check if prize has multiple rewards (combo)
      // Only free rewards with multiple prizes get badges, not purchase offers
      const prizeType = (prize as any).type;
      const isPurchaseOffer = prizeType === 'purchase';
      const prizeReward = (prize as any).freeReward;
      const rewardCount = prizeReward ? [
        prizeReward.sc,
        prizeReward.gc,
        prizeReward.spins,
        prizeReward.xp,
        prizeReward.randomReward
      ].filter(Boolean).length : 0;

      const isCombo = rewardCount >= 2 && !isPurchaseOffer;
      const comboBadgeNumber = isCombo ? comboBadgeCounter++ : undefined;

      return {
        index,
        prize,
        x: BORDER_WIDTH + (index * slotWidth),
        width: slotWidth,
        comboBadgeNumber
      };
    });
  }, [prizes, slotCount, internalWidth, BORDER_WIDTH]);

  // Calculate bucket zone Y position based on slot width
  const bucketZoneY = useMemo(() => {
    const playableWidth = internalWidth - (BORDER_WIDTH * 2);
    const slotWidth = playableWidth / slotCount;
    return calculateBucketZoneY(boardHeight, slotWidth);
  }, [boardHeight, internalWidth, slotCount, BORDER_WIDTH]);

  return (
    <div style={{ width: '100%', maxWidth: `${boardWidth}px`, margin: '0 auto' }}>
      <motion.div
        className="relative"
        style={{
          width: '100%',
          height: `${boardHeight}px`,
          overflow: 'visible',
          background: theme.colors.game?.board?.background || theme.gradients.backgroundCard,
          boxShadow: theme.colors.game?.board?.shadow || theme.effects.shadows.card,
          border: theme.colors.game?.board?.border || `1px solid ${theme.colors.border.default}`,
          borderRadius: theme.colors.game?.board?.borderRadius || theme.borderRadius.card,
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
        // Check if ball is directly above this slot (tighter detection for snappy lighting)
        const isApproaching = ballState === 'dropping' && currentTrajectoryPoint
          ? Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width / 2
          : false;

        // Only show winning state during drop and end phase, not when idle
        const isWinning = ballState !== 'idle' && slot.index === selectedIndex;

        // Determine if ball is in this slot (bucket zone)
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
            prizeCount={slotCount}
            boardWidth={boardWidth}
            comboBadgeNumber={slot.comboBadgeNumber}
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

      {/* Win Reveal Animation */}
      {showWinReveal && selectedIndex >= 0 && selectedIndex < slots.length && (
        <SlotWinReveal
          x={slots[selectedIndex].x}
          y={bucketZoneY}
          width={slots[selectedIndex].width}
          height={boardHeight - bucketZoneY}
          color={slots[selectedIndex].prize.color || '#64748B'}
          label={slots[selectedIndex].prize.label || ''}
          isActive={showWinReveal}
        />
      )}
      </motion.div>

      {/* Combo legend - shows below board, part of board so it animates with it */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ComboLegend slots={slots} />
      </motion.div>
    </div>
  );
}
