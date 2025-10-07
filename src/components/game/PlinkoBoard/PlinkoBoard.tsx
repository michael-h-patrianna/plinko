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

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { GameState, PrizeConfig, TrajectoryPoint } from '../../../game/types';
import { useTheme } from '../../../theme';
import { getPrizeThemeColor } from '../../../theme/prizeColorMapper';
import { calculateBucketZoneY } from '../../../utils/slotDimensions';
import {
  PHYSICS,
  BOARD,
  DROP_ZONE_POSITIONS,
  generatePegLayout,
  type DropZone,
} from '../../../game/boardGeometry';
import { useAnimationDriver } from '../../../theme/animationDrivers';
import { Ball } from '../Ball';
import { BallLauncher } from '../BallLauncher';
import { DropPositionControls } from '../../controls/DropPositionSelector';
import { BallLandingImpact } from '../../effects/WinAnimations/BallLandingImpact';
import { SlotAnticipation } from '../../effects/WinAnimations/SlotAnticipation';
import { SlotWinReveal } from '../../effects/WinAnimations/SlotWinReveal';
import { BorderWall } from './BorderWall';
import { ComboLegend } from './ComboLegend';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { useAppConfig } from '../../../config/AppConfigContext';
import { getPerformanceSetting } from '../../../config/appConfig';

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
  onPositionSelected?: (zone: DropZone) => void;
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
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const { theme } = useTheme();
  const { performance } = useAppConfig();
  const showTrail = useMemo(() => {
    return getPerformanceSetting(performance, 'showTrail') ?? true;
  }, [performance]);
  const slotCount = prizes.length;
  const BORDER_WIDTH = PHYSICS.BORDER_WIDTH;
  // Board has box-sizing: border-box, so the 2px CSS border is INSIDE the width
  const CSS_BORDER = BOARD.CSS_BORDER;
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

  const DROP_ZONES: Array<{ zone: DropZone; position: number }> = [
    { zone: 'left', position: DROP_ZONE_POSITIONS.left },
    { zone: 'left-center', position: DROP_ZONE_POSITIONS['left-center'] },
    { zone: 'center', position: DROP_ZONE_POSITIONS.center },
    { zone: 'right-center', position: DROP_ZONE_POSITIONS['right-center'] },
    { zone: 'right', position: DROP_ZONE_POSITIONS.right },
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
    return generatePegLayout({
      boardWidth,
      boardHeight,
      pegRows,
      cssBorder: CSS_BORDER,
    });
  }, [boardHeight, boardWidth, pegRows, CSS_BORDER]);

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
      <AnimatedDiv
        className="relative"
        style={{
          width: '100%',
          height: `${boardHeight}px`,
          overflow: 'visible',
          background: theme.colors.game.board.background || theme.gradients.backgroundCard,
          /* RN-compatible: removed boxShadow, using border for definition */
          border: theme.colors.game.board.border || `1px solid ${theme.colors.border.default}`,
          borderRadius: boardWidth <= 375 ? '0 0 12px 12px' : (theme.colors.game.board.borderRadius || theme.borderRadius.card),
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
          boardWidth={boardWidth}
        />
        <BorderWall
          side="right"
          width={BORDER_WIDTH}
          hasImpact={currentTrajectoryPoint?.wallHit === 'right'}
          boardWidth={boardWidth}
        />
        <BorderWall side="top" width={BORDER_WIDTH} hasImpact={false} boardWidth={boardWidth} />


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

        {/* Ball - positioned within board coordinate system, hidden during selection AND frame 0 to prevent overlap with BallLauncher */}
        {!isSelectingPosition &&
         !(ballState === 'dropping' && currentTrajectoryPoint?.frame === 0) && (
          <Ball
            key={`ball-${showTrail ? 'trail' : 'no-trail'}`}
            position={ballPosition}
            state={ballState}
            currentFrame={currentTrajectoryPoint?.frame ?? 0}
            trajectoryPoint={currentTrajectoryPoint}
            showTrail={showTrail}
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
              color={getPrizeThemeColor(slots[selectedIndex].prize, theme)}
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
              color={getPrizeThemeColor(slots[selectedIndex].prize, theme)}
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
              color={getPrizeThemeColor(slots[selectedIndex].prize, theme)}
              label={slots[selectedIndex].prize.label || ''}
              isActive={showWinReveal}
            />
          )}

      </AnimatedDiv>

      {/* Combo legend - shows below board, part of board so it animates with it */}
      <AnimatedDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ComboLegend slots={slots} />
      </AnimatedDiv>
    </div>
  );
}
