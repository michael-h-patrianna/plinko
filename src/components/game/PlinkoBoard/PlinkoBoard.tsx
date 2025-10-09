/**
 * Main Plinko board component - orchestrates game layout and physics
 * Delegates rendering to focused sub-components with memoization
 * @param prizes - Array of prize configurations for slots
 * @param selectedIndex - Index of the winning slot
 * @param boardWidth - Width of the board in pixels (default: 375)
 * @param boardHeight - Height of the board in pixels (default: 500)
 * @param pegRows - Number of peg rows (default: 10)
 * @param ballPosition - Current ball position {x, y, rotation}
 * @param ballState - Current game state (idle, countdown, dropping, landed, etc.)
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { GameState, PrizeConfig, TrajectoryPoint } from '../../../game/types';
import { useTheme } from '../../../theme';
import { calculateBucketZoneY } from '../../../utils/slotDimensions';
import { PHYSICS, BOARD, type DropZone } from '../../../game/boardGeometry';
import { useAnimationDriver } from '../../../theme/animationDrivers';
import { useAppConfig } from '../../../config/AppConfigContext';
import { getPerformanceSetting } from '../../../config/appConfig';
import { ANIMATION_DURATION, VIEWPORT, LAYOUT } from '../../../constants';
import { BorderWall } from './BorderWall';
import { ComboLegend } from './ComboLegend';
import { PegField, SlotList, WinAnimations, DropPositionUI, BallRenderer } from './components';
import { calculateSlots } from './utils/calculateSlots';

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
  const CSS_BORDER = BOARD.CSS_BORDER;
  const internalWidth = boardWidth - CSS_BORDER * 2;

  // Subscribe to frame updates for production (or use dummy for tests)
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

  // Calculate slot positions and combo badge numbers
  const slots = useMemo(() => {
    return calculateSlots(prizes, BORDER_WIDTH, dimensions.slotWidth);
  }, [prizes, BORDER_WIDTH, dimensions.slotWidth]);

  // Calculate bucket zone Y position based on slot width
  const bucketZoneY = useMemo(() => {
    return calculateBucketZoneY(boardHeight, dimensions.slotWidth);
  }, [boardHeight, dimensions.slotWidth]);

  // Get winning slot data for animations
  const winningSlot = slots[selectedIndex] ?? null;

  // Animation state for win reveal and landing effects
  const [showWinReveal, setShowWinReveal] = useState(false);
  const [showLandingImpact, setShowLandingImpact] = useState(false);
  const [showAnticipation, setShowAnticipation] = useState(false);

  // Drop position selection state
  const [selectedDropIndex, setSelectedDropIndex] = useState(2); // Center by default

  // Trigger landing impact and anticipation, then win reveal when ball lands
  useEffect(() => {
    if (ballState === 'landed' && currentTrajectoryPoint) {
      setShowLandingImpact(true);
      setShowAnticipation(true);

      const revealTimer = setTimeout(() => {
        setShowWinReveal(true);
        setShowAnticipation(false);
      }, ANIMATION_DURATION.WIN_REVEAL_DELAY);

      return () => clearTimeout(revealTimer);
    } else {
      setShowWinReveal(false);
      setShowLandingImpact(false);
      setShowAnticipation(false);
    }
  }, [ballState, currentTrajectoryPoint]);

  return (
    <div style={{ width: '100%', maxWidth: `${boardWidth}px`, margin: '0 auto' }}>
      <AnimatedDiv
        className="relative"
        style={{
          width: '100%',
          height: `${boardHeight}px`,
          overflow: 'visible',
          background: theme.colors.game.board.background || theme.gradients.backgroundCard,
          border:
            theme.colors.game.board.border || `1px solid ${theme.colors.border.default}`,
          borderRadius:
            boardWidth <= VIEWPORT.DEFAULT_MOBILE
              ? `0 0 ${LAYOUT.SMALL_BORDER_RADIUS}px ${LAYOUT.SMALL_BORDER_RADIUS}px`
              : theme.colors.game.board.borderRadius || theme.borderRadius.card,
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

        {/* Pegs - memoized field component */}
        <PegField
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          pegRows={pegRows}
          currentTrajectoryPoint={currentTrajectoryPoint}
          ballState={ballState}
          isSelectingPosition={isSelectingPosition}
        />

        {/* Slots - memoized list component */}
        <SlotList
          slots={slots}
          selectedIndex={selectedIndex}
          currentTrajectoryPoint={currentTrajectoryPoint}
          ballState={ballState}
          boardWidth={boardWidth}
          bucketZoneY={bucketZoneY}
        />

        {/* Drop Position Selection UI */}
        <DropPositionUI
          isSelectingPosition={isSelectingPosition}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          selectedDropIndex={selectedDropIndex}
          onDropIndexChange={setSelectedDropIndex}
          onPositionSelected={onPositionSelected}
        />

        {/* Ball and Launcher Rendering */}
        <BallRenderer
          isSelectingPosition={isSelectingPosition}
          ballState={ballState}
          ballPosition={ballPosition}
          currentTrajectoryPoint={currentTrajectoryPoint}
          showTrail={showTrail}
        />

        {/* Win Animations - impact, anticipation, reveal */}
        <WinAnimations
          showLandingImpact={showLandingImpact}
          showAnticipation={showAnticipation}
          showWinReveal={showWinReveal}
          ballPosition={ballPosition}
          selectedIndex={selectedIndex}
          winningSlot={winningSlot}
          bucketZoneY={bucketZoneY}
          boardHeight={boardHeight}
        />
      </AnimatedDiv>

      {/* Combo legend - shows below board */}
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
