/**
 * Main Plinko board component that orchestrates the game layout and physics
 * Renders pegs in staggered pattern, prize slots, border walls, and ball with animations
 * Fully themeable with responsive dimensions based on viewport
 * @param prizes - Array of prize configurations for slots
 * @param selectedIndex - Index of the winning slot
 * @param currentTrajectoryPoint - Current point in ball's trajectory with physics data
 * @param boardWidth - Width of the board in pixels (default: 375)
 * @param boardHeight - Height of the board in pixels (default: 500)
 * @param pegRows - Number of peg rows (default: 10)
 * @param ballPosition - Current ball position {x, y, rotation}
 * @param ballState - Current game state (idle, countdown, dropping, landed, etc.)
 */

import { useMemo, useState, useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import type { PrizeConfig, TrajectoryPoint, GameState } from '../../game/types';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { BorderWall } from './BorderWall';
import { Ball } from '../Ball';
import { BallLauncher } from '../BallLauncher';
import { SlotWinReveal } from '../WinAnimations/SlotWinReveal';
import { BallLandingImpact } from '../WinAnimations/BallLandingImpact';
import { SlotAnticipation } from '../WinAnimations/SlotAnticipation';
import { ComboLegend } from './ComboLegend';
import { calculateBucketZoneY } from '../../utils/slotDimensions';
import { useTheme } from '../../theme';
import { DropPositionControls } from '../DropPositionSelector';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface PlinkoBoardProps {
  prizes: PrizeConfig[];
  selectedIndex: number;
  trajectory?: TrajectoryPoint[];
  frameStore?: FrameStore;
  getBallPosition?: () => { x: number; y: number; rotation: number } | null;
  getCurrentTrajectoryPoint?: () => TrajectoryPoint | null;
  // Legacy props for backwards compatibility with tests
  ballPosition?: { x: number; y: number; rotation: number } | null;
  currentTrajectoryPoint?: TrajectoryPoint | null;
  boardWidth?: number;
  boardHeight?: number;
  pegRows?: number;
  ballState: GameState;
  isSelectingPosition?: boolean;
  onPositionSelected?: (zone: import('../../game/types').DropZone) => void;
}

export function PlinkoBoard({
  prizes,
  selectedIndex,
  frameStore,
  getBallPosition,
  getCurrentTrajectoryPoint,
  ballPosition: ballPositionProp,
  currentTrajectoryPoint: currentTrajectoryPointProp,
  boardWidth = 375,
  boardHeight = 500,
  pegRows = 10,
  ballState,
  isSelectingPosition = false,
  onPositionSelected,
}: PlinkoBoardProps) {
  const { theme } = useTheme();
  const slotCount = prizes.length;
  const BORDER_WIDTH = 8;
  // Board has box-sizing: border-box, so the 2px CSS border is INSIDE the width
  const CSS_BORDER = 2;
  // Internal content width = declared width - CSS borders on both sides
  const internalWidth = boardWidth - CSS_BORDER * 2;

  // Subscribe to frame updates if frameStore is provided (production)
  // Otherwise use null (tests provide ballPosition/currentTrajectoryPoint directly)
  // Note: We must always call the hook unconditionally, but use dummy values when frameStore is undefined
  const dummySubscribe = () => () => {};
  const dummyGetSnapshot = () => 0;
  useSyncExternalStore(
    frameStore?.subscribe ?? dummySubscribe,
    frameStore?.getSnapshot ?? dummyGetSnapshot,
    frameStore?.getSnapshot ?? dummyGetSnapshot
  );

  // Get current values - either from functions (production) or props (tests)
  const currentTrajectoryPoint = getCurrentTrajectoryPoint
    ? getCurrentTrajectoryPoint()
    : currentTrajectoryPointProp ?? null;
  const ballPosition = getBallPosition ? getBallPosition() : ballPositionProp ?? null;

  // Consolidated dimension calculations - single source of truth
  const dimensions = useMemo(() => {
    const playableWidth = internalWidth - BORDER_WIDTH * 2;
    const slotWidth = playableWidth / slotCount;
    return { playableWidth, slotWidth };
  }, [internalWidth, slotCount, BORDER_WIDTH]);

  // Animation state for win reveal and landing effects
  const [showWinReveal, setShowWinReveal] = useState(false);
  const [showLandingImpact, setShowLandingImpact] = useState(false);
  const [showAnticipation, setShowAnticipation] = useState(false);

  // Drop position selection state
  const [selectedDropIndex, setSelectedDropIndex] = useState(2); // Center by default

  const DROP_ZONES: Array<{ zone: import('../../game/types').DropZone; position: number }> = [
    { zone: 'left', position: 0.1 },
    { zone: 'left-center', position: 0.3 },
    { zone: 'center', position: 0.5 },
    { zone: 'right-center', position: 0.7 },
    { zone: 'right', position: 0.9 },
  ];

  // Trigger landing impact and anticipation, then win reveal when ball lands
  useEffect(() => {
    if (ballState === 'landed' && currentTrajectoryPoint) {
      // Immediately show landing impact and anticipation
      setShowLandingImpact(true);
      setShowAnticipation(true);

      // Show win reveal after short delay (to let anticipation build)
      const revealTimer = setTimeout(() => {
        setShowWinReveal(true);
        setShowAnticipation(false); // Stop anticipation when reveal starts
      }, 600);

      return () => {
        clearTimeout(revealTimer);
      };
    } else {
      setShowWinReveal(false);
      setShowLandingImpact(false);
      setShowAnticipation(false);
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
    const { slotWidth } = dimensions;
    let comboBadgeCounter = 1;

    return prizes.map((prize, index) => {
      // Check if prize has multiple rewards (combo)
      // Only free rewards with multiple prizes get badges, not purchase offers
      const prizeType = prize.type;
      const isPurchaseOffer = prizeType === 'purchase';
      const prizeReward = prize.freeReward;
      const rewardCount = prizeReward
        ? [
            prizeReward.sc,
            prizeReward.gc,
            prizeReward.spins,
            prizeReward.xp,
            prizeReward.randomReward,
          ].filter(Boolean).length
        : 0;

      const isCombo = rewardCount >= 2 && !isPurchaseOffer;
      const comboBadgeNumber = isCombo ? comboBadgeCounter++ : undefined;

      return {
        index,
        prize,
        x: BORDER_WIDTH + index * slotWidth,
        width: slotWidth,
        comboBadgeNumber,
      };
    });
  }, [prizes, dimensions, BORDER_WIDTH]);

  // Calculate bucket zone Y position based on slot width
  const bucketZoneY = useMemo(() => {
    return calculateBucketZoneY(boardHeight, dimensions.slotWidth);
  }, [boardHeight, dimensions.slotWidth]);

  return (
    <div style={{ width: '100%', maxWidth: `${boardWidth}px`, margin: '0 auto' }}>
      <motion.div
        className="relative"
        style={{
          width: '100%',
          height: `${boardHeight}px`,
          overflow: 'visible',
          background: theme.colors.game.board.background || theme.gradients.backgroundCard,
          boxShadow: theme.colors.game.board.shadow || theme.effects.shadows.card,
          border: theme.colors.game.board.border || `1px solid ${theme.colors.border.default}`,
          borderRadius: theme.colors.game.board.borderRadius || theme.borderRadius.card,
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
        <BorderWall side="top" width={BORDER_WIDTH} hasImpact={false} />

        {/* Pegs */}
        <div style={{ opacity: isSelectingPosition ? 0.1 : 1, transition: 'opacity 0.3s ease' }}>
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

        {/* Slots */}
        {slots.map((slot) => {
          // Check if ball is directly above this slot (tighter detection for snappy lighting)
          const isApproaching =
            ballState === 'dropping' && currentTrajectoryPoint
              ? Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width / 2
              : false;

          // Only show winning state during drop and end phase, not when idle
          const isWinning = ballState !== 'idle' && slot.index === selectedIndex;

          // Determine if ball is in this slot (bucket zone)
          const isInThisSlot =
            currentTrajectoryPoint && currentTrajectoryPoint.y >= bucketZoneY
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

        {/* SELECTION MODE: Drop position launchers - 5 options when selecting */}
        {isSelectingPosition && DROP_ZONES.map((dropZone, index) => (
          <BallLauncher
            key={dropZone.zone}
            x={boardWidth * dropZone.position}
            y={BORDER_WIDTH + 10}
            isLaunching={false}
            isSelected={index === selectedDropIndex}
            onClick={() => setSelectedDropIndex(index)}
          />
        ))}

        {/* SELECTION MODE: Controls - title, arrows, START button */}
        {isSelectingPosition && (
          <DropPositionControls
            boardWidth={boardWidth}
            boardHeight={boardHeight}
            onPrevious={() => setSelectedDropIndex((prev) => (prev === 0 ? DROP_ZONES.length - 1 : prev - 1))}
            onNext={() => setSelectedDropIndex((prev) => (prev === DROP_ZONES.length - 1 ? 0 : prev + 1))}
            onConfirm={() => onPositionSelected?.(DROP_ZONES[selectedDropIndex]!.zone)}
          />
        )}

        {/* NORMAL MODE: Ball launcher - visible during countdown only */}
        {!isSelectingPosition && ballState === 'countdown' && ballPosition && (
          <BallLauncher x={ballPosition.x} y={ballPosition.y} isLaunching={false} isSelected={false} />
        )}

        {/* NORMAL MODE: Ball launcher launching animation - brief moment when dropping starts */}
        {!isSelectingPosition && ballState === 'dropping' && currentTrajectoryPoint?.frame === 0 && ballPosition && (
          <BallLauncher x={ballPosition.x} y={ballPosition.y} isLaunching={true} isSelected={false} />
        )}

        {/* Ball - positioned within board coordinate system, hidden during selection */}
        {!isSelectingPosition && (
          <Ball
            position={ballPosition}
            state={ballState}
            currentFrame={currentTrajectoryPoint?.frame ?? 0}
            trajectoryPoint={currentTrajectoryPoint}
          />
        )}

        {/* Ball Landing Impact - triggers when ball lands */}
        {showLandingImpact &&
          ballPosition &&
          selectedIndex >= 0 &&
          selectedIndex < slots.length &&
          slots[selectedIndex] && (
            <BallLandingImpact
              x={ballPosition.x}
              y={ballPosition.y}
              color={slots[selectedIndex].prize.color || '#64748B'}
              trigger={showLandingImpact}
            />
          )}

        {/* Slot Anticipation - rising particles during landed state */}
        {showAnticipation &&
          selectedIndex >= 0 &&
          selectedIndex < slots.length &&
          slots[selectedIndex] && (
            <SlotAnticipation
              x={slots[selectedIndex].x}
              width={slots[selectedIndex].width}
              color={slots[selectedIndex].prize.color || '#64748B'}
              isActive={showAnticipation}
            />
          )}

        {/* Win Reveal Animation */}
        {showWinReveal &&
          selectedIndex >= 0 &&
          selectedIndex < slots.length &&
          slots[selectedIndex] && (
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
