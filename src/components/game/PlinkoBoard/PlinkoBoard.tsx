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

import type { ValueRef } from '@/types/ref';
import { useAppConfig } from '@config/AppConfigContext';
import { getPerformanceSetting } from '@config/appConfig';
import {
  BOARD,
  DROP_ZONE_POSITIONS,
  generatePegLayout,
  PHYSICS,
  type DropZone,
} from '@game/boardGeometry';
import type { GameState, PrizeConfig, TrajectoryCache, TrajectoryPoint } from '@game/types';
import { useWinAnimationState } from '@hooks/useWinAnimationState';
import { useAnimationDriver } from '@theme/animationDrivers';
import { getPrizeThemeColor } from '@theme/prizeColorMapper';
import { calculateBucketZoneY } from '@utils/slotDimensions';
import { hexToRgba } from '@utils/formatting/colorUtils';
import { useMemo, useState } from 'react';
import { useTheme } from '../../../theme';
import { DropPositionControls } from '../../controls/DropPositionSelector';
import { BallLandingImpact } from '../../effects/WinAnimations/BallLandingImpact';
import { SlotAnticipation } from '../../effects/WinAnimations/SlotAnticipation';
import { SlotWinReveal } from '../../effects/WinAnimations/SlotWinReveal';
import { BallLauncher } from '../BallLauncher';
import { BorderWall } from './BorderWall';
import { ComboLegend } from './ComboLegend';
import { Peg } from './Peg';
import { Slot } from './Slot';
import { OptimizedBallRenderer } from './components/OptimizedBallRenderer';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
  notifyListeners: () => void;
}

interface PlinkoBoardProps {
  prizes: PrizeConfig[];
  selectedIndex: number;
  trajectory?: TrajectoryPoint[];
  trajectoryCache?: TrajectoryCache | null;
  frameStore?: FrameStore;
  currentFrameRef?: ValueRef<number>;
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
  onLandingComplete?: () => void;
  showWinner?: boolean;
}

export function PlinkoBoard({
  prizes,
  selectedIndex,
  trajectory,
  trajectoryCache,
  frameStore,
  currentFrameRef,
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
  onLandingComplete,
  showWinner = false,
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

  // PERFORMANCE OPTIMIZATION: No frameStore subscription needed in PlinkoBoard
  // - BallRenderer subscribes for ball position updates (60 FPS)
  // - Pegs subscribe individually and only affected pegs animate (see Peg component)
  // This eliminates 60 FPS re-renders of PlinkoBoard and non-affected pegs

  // Get current values for slots - only used for initial rendering, not frame updates
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

  // Win animation state machine - manages landing-impact -> anticipation -> win-reveal sequence
  const { showLandingImpact, showAnticipation, showWinReveal } = useWinAnimationState(ballState);

  // Drop position selection state (separate concern from animations)
  const [selectedDropIndex, setSelectedDropIndex] = useState(2); // Center by default

  const DROP_ZONES: Array<{ zone: DropZone; position: number }> = [
    { zone: 'left', position: DROP_ZONE_POSITIONS.left },
    { zone: 'left-center', position: DROP_ZONE_POSITIONS['left-center'] },
    { zone: 'center', position: DROP_ZONE_POSITIONS.center },
    { zone: 'right-center', position: DROP_ZONE_POSITIONS['right-center'] },
    { zone: 'right', position: DROP_ZONE_POSITIONS.right },
  ];

  // Generate peg layout - staggered pattern like real Plinko
  const pegs = useMemo(() => {
    return generatePegLayout({
      boardWidth,
      boardHeight,
      pegRows,
      cssBorder: CSS_BORDER,
    });
  }, [boardHeight, boardWidth, pegRows, CSS_BORDER]);

  // Pre-calculate hit frames for each peg from trajectory
  // Maps "row-col" to array of frame numbers when hit occurs
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

  // Pre-calculate wall hit frames from trajectory
  // Maps 'left' or 'right' to array of frame numbers when hit occurs
  const wallHitFrames = useMemo(() => {
    if (!trajectory || trajectory.length === 0) {
      return { left: [], right: [] };
    }

    const leftHits: number[] = [];
    const rightHits: number[] = [];

    trajectory.forEach((point, frameIndex) => {
      if (point.wallHit === 'left') {
        leftHits.push(frameIndex);
      } else if (point.wallHit === 'right') {
        rightHits.push(frameIndex);
      }
    });

    return { left: leftHits, right: rightHits };
  }, [trajectory]);

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

  // Calculate winning slot color for peg flash theming
  // TODO: Use this for peg flash color theming in future iteration
  // const pegFlashColor = useMemo(() => {
  //   if (selectedIndex >= 0 && selectedIndex < slots.length && slots[selectedIndex]) {
  //     return getPrizeThemeColor(slots[selectedIndex].prize, theme);
  //   }
  //   return theme.colors.game.peg.highlight; // Fallback to default
  // }, [selectedIndex, slots, theme]);

  // PERFORMANCE: Memoize mapped slot elements to prevent Slot re-renders
  // Slots are now static - collision detection moved to OptimizedBallRenderer (imperative updates)
  // This eliminates 60 FPS re-renders of PlinkoBoard and Slots during ball drop
  const slotElements = useMemo(() => {
    return slots.map((slot) => {
      // Only show winning state during drop and end phase, not when idle
      // Also respect showWinner flag from devtools
      const isWinning = showWinner && ballState !== 'idle' && slot.index === selectedIndex;

      return (
        <Slot
          key={`slot-${slot.index}`}
          index={slot.index}
          prize={slot.prize}
          x={slot.x}
          width={slot.width}
          isWinning={isWinning}
          prizeCount={slotCount}
          boardWidth={boardWidth}
          comboBadgeNumber={slot.comboBadgeNumber}
          ballState={ballState}
        />
      );
    });
  }, [slots, slotCount, ballState, selectedIndex, boardWidth, showWinner]);

  // Calculate ambient background color shift during landed state
  // Blends board background with winning slot color for subtle anticipation effect
  // TODO: Use this for background color theming in future iteration
  // const backgroundStyle = useMemo(() => {
  //   const baseBackground = theme.colors.game.board.background || theme.gradients.backgroundCard;

  //   // During 'landed' state, blend in winning slot color
  //   if (ballState === 'landed' && selectedIndex >= 0 && selectedIndex < slots.length && slots[selectedIndex]) {
  //     const slotColorRgba = getPrizeThemeColorWithOpacity(slots[selectedIndex].prize, theme, 0.2);

  //     // Check if base is gradient or solid
  //     if (baseBackground.includes('gradient')) {
  //       // Overlay transparent slot color on gradient
  //       return `${baseBackground}, ${slotColorRgba}`;
  //     } else {
  //       // Create gradient blend for solid colors
  //       return `linear-gradient(180deg, ${baseBackground} 0%, ${slotColorRgba} 100%)`;
  //     }
  //   }

  //   return baseBackground;
  // }, [ballState, selectedIndex, slots, theme]);

  return (
    <div style={{ width: '100%', maxWidth: `${boardWidth}px`, margin: '0 auto' }}>
      <AnimatedDiv
        className="relative"
        style={{
          width: '100%',
          height: `${boardHeight}px`,
          overflow: 'visible',
          /* RN-compatible: removed boxShadow, using border for definition */
          border: theme.colors.game.board.border || `1px solid ${theme.colors.border.default}`,
          borderRadius: boardWidth <= 375 ? '0 0 12px 12px' : (theme.colors.game.board.borderRadius || theme.borderRadius.card),
        }}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        data-testid="plinko-board"
      >
        {/* Background Overlay - Fades in on board open, gradually reduces to 30%, disappears on ball drop */}
        <AnimatedDiv
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.surface.primary}80 0%, ${theme.colors.surface.secondary}60 100%)`,
            borderRadius: 'inherit',
            zIndex: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              ballState === 'dropping' || ballState === 'landed' || ballState === 'revealed'
                ? 0
                : ballState === 'countdown'
                  ? 0.3
                  : 1,
          }}
          transition={{
            duration: ballState === 'dropping' ? 0.2 : ballState === 'countdown' ? 2 : 1,
            ease: ballState === 'countdown' ? 'easeInOut' : 'easeOut',
          }}
        />
        {/* Border Walls with impact animation - z-index: 5 (above parallax) */}
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


        {/* Pegs - static rendering, flash state controlled imperatively by BallAnimationDriver */}
        <div style={{ opacity: isSelectingPosition ? 0.1 : 1, transition: 'opacity 0.3s ease' }}>
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

        {/* Slots - memoized to prevent unnecessary re-renders */}
        {slotElements}

        {/* Combo Badges Layer - rendered AFTER slots to ensure proper z-index stacking */}
        {/* Badges positioned absolutely based on slot positions */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            zIndex: 25, // Above slots (15) and slot anticipation overlay (20)
          }}
        >
          {slots.map((slot) => {
            if (slot.comboBadgeNumber === undefined) return null;

            const badgeColor = getPrizeThemeColor(slot.prize, theme);

            return (
              <div
                key={`combo-badge-${slot.index}`}
                className="absolute font-bold text-white text-xs leading-none"
                style={{
                  bottom: `${-10 - 10}px`, // Slot bottom is at -10px, badge center aligned with floor (bottom edge) means badge center at -10px, so top of badge at -10px - 10px (half of 20px height)
                  left: `${slot.x + slot.width / 2 - 10}px`, // Center horizontally: slot x + half width - half badge width (10px)
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${badgeColor} 0%, ${hexToRgba(badgeColor, 0.87)} 100%)`,
                  /* RN-compatible: removed boxShadow, using border for definition */
                  border: `2px solid ${hexToRgba(theme.colors.text.inverse, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {slot.comboBadgeNumber}
              </div>
            );
          })}
        </div>

        {/* Slot Anticipation Overlay - positioned and animated by driver */}
        {/* Shows highlighted border on slot under ball during drop */}
        {/* Driver handles positioning (left, width) and floor impact animation (translateY) */}
        <div
          data-testid="slot-anticipation-overlay"
          className="absolute pointer-events-none"
          style={{
            display: 'none', // Hidden by default, shown by driver
            bottom: '-10px',
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderTop: 'none',
            borderRadius: theme.colors.game.slot.borderRadius || '0 0 8px 8px',
            zIndex: 20, // Above slots but below ball
            transition: 'left 0.1s ease-out, width 0.1s ease-out, border-color 0.1s ease-out',
          }}
        />

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

        {/* SELECTION MODE: Animated chevron indicators above selected drop zone */}
        {isSelectingPosition && DROP_ZONES.map((dropZone, index) => {
          const isSelected = index === selectedDropIndex;
          return (
            <AnimatedDiv
              key={`chevron-${dropZone.zone}`}
              className="absolute pointer-events-none"
              style={{
                left: `${boardWidth * dropZone.position}px`,
                top: `${BORDER_WIDTH - 15}px`,
                zIndex: 25,
                opacity: isSelected ? 1 : 0,
              }}
              animate={{
                y: isSelected ? [-5, -15, -5] : -5,
                opacity: isSelected ? 1 : 0,
              }}
              transition={{
                y: isSelected
                  ? {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { duration: 0 },
                opacity: { duration: 0.3 },
              }}
            >
              {/* Chevron/arrow SVG - Cross-platform compatible, tip centered at x=8 */}
              <svg
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: 'translateX(-50%)', // Center the SVG so tip (x=8) aligns with left position
                }}
              >
                <path
                  d="M8 10L0 0H16L8 10Z"
                  fill={theme.colors.game.ball.primary}
                  opacity="0.9"
                />
              </svg>
            </AnimatedDiv>
          );
        })}

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

        {/* Optimized Ball Renderer - uses driver for direct DOM manipulation */}
        {/* PERFORMANCE: Bypasses React reconciliation + drives imperative peg/slot updates */}
        <OptimizedBallRenderer
          isSelectingPosition={isSelectingPosition}
          ballState={ballState}
          showTrail={showTrail}
          frameStore={frameStore}
          currentFrameRef={currentFrameRef}
          getBallPosition={getBallPosition}
          trajectoryCache={trajectoryCache}
          trajectoryLength={trajectory?.length}
          onLandingComplete={onLandingComplete}
          pegHitFrames={pegHitFrames}
          wallHitFrames={wallHitFrames}
          slots={slots.map((slot) => ({ x: slot.x, width: slot.width }))}
          slotHighlightColor={theme.colors.game.ball.primary}
          bucketZoneY={bucketZoneY}
          getCurrentTrajectoryPoint={getCurrentTrajectoryPoint}
        />

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
              label={slots[selectedIndex].prize.title || ''}
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
