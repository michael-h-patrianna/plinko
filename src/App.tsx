/**
 * Main Plinko game application
 * With smooth state transitions using AnimatePresence
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { AppConfigProvider } from './config/AppConfigContext';
import type { PerformanceMode } from './config/appConfig';
import { Countdown } from './components/game/Countdown';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { GameBoardErrorBoundary } from './components/layout/GameBoardErrorBoundary';
import { PrizeErrorBoundary } from './components/layout/PrizeErrorBoundary';
import { ToastProvider, useToast } from './components/feedback';
import { ScreenShake } from './components/effects/ScreenShake';
import { PlinkoBoard } from './components/game/PlinkoBoard/PlinkoBoard';
import { PopupContainer } from './components/layout/PopupContainer';
import { PrizeClaimed } from './components/screens/PrizeClaimed';
import { PrizeReveal } from './components/screens/PrizeReveal';
import { StartScreen } from './components/screens/StartScreen';
import { DevToolsLoader, type ChoiceMechanic } from './dev-tools';
import { usePlinkoGame } from './hooks/usePlinkoGame';
import { ThemeProvider, themes, useTheme } from './theme';
import { dimensionsAdapter, deviceInfoAdapter } from './utils/platform';
import { useAnimationDriver } from './theme/animationDrivers';
import { ANIMATION_DURATION, VIEWPORT, LAYOUT } from './constants';

/**
 * Main application content component
 * Manages game state, viewport sizing, and renders game screens based on current state
 */
function AppContent({
  performanceMode,
  setPerformanceMode,
}: {
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
}) {
  const driver = useAnimationDriver();
  const { AnimatePresence } = driver;

  const { theme } = useTheme();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [lockedBoardWidth, setLockedBoardWidth] = useState(375);
  const [shakeActive, setShakeActive] = useState(false);
  const [choiceMechanic, setChoiceMechanic] = useState<ChoiceMechanic>('none');

  // Error handlers for toast notifications
  const handleGameBoardError = useCallback(() => {
    showToast({
      message: 'Game board error. Please reset the game.',
      severity: 'error',
      duration: 6000,
    });
  }, [showToast]);

  const handlePrizeError = useCallback(() => {
    showToast({
      message: 'Unable to load prizes. Please refresh the page.',
      severity: 'error',
      duration: 6000,
    });
  }, [showToast]);

  // Use game hook with the locked board width
  const gameState = usePlinkoGame({
    boardWidth: lockedBoardWidth,
    boardHeight: 500,
    pegRows: 10,
    choiceMechanic,
  });

  const {
    state,
    prizes,
    selectedPrize,
    selectedIndex,
    winningIndex,
    trajectory,
    frameStore,
    getBallPosition,
    getCurrentTrajectoryPoint,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    resetGame,
    canClaim,
    isLoadingPrizes,
    prizeLoadError,
  } = gameState;

  // Inline viewport management using platform adapters
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = deviceInfoAdapter.isMobileDevice();
      const isTouchDevice = deviceInfoAdapter.isTouchDevice();
      const width = dimensionsAdapter.getWidth();
      return isMobileUA || (isTouchDevice && width <= 768);
    };
    setIsMobile(checkMobile());
  }, []);

  useEffect(() => {
    if (isMobile) {
      const updateMobileWidth = () => {
        const width = Math.min(dimensionsAdapter.getWidth(), VIEWPORT.MAX_MOBILE);
        setViewportWidth(width);
        setLockedBoardWidth(width);
      };
      updateMobileWidth();
      const cleanup = dimensionsAdapter.addChangeListener(() => {
        updateMobileWidth();
      });
      return cleanup;
    }
  }, [isMobile]);

  useEffect(() => {
    if (state === 'dropping') {
      setLockedBoardWidth(viewportWidth);
    }
  }, [state, viewportWidth]);

  // Trigger screen shake when ball lands on a winning prize (not no_win)
  useEffect(() => {
    const isLanded = state === 'landed';
    const isIdle = state === 'idle';
    const isWin = selectedPrize && selectedPrize.type !== 'no_win';

    if (isLanded && isWin) {
      setShakeActive(true);
      const timer = setTimeout(() => setShakeActive(false), ANIMATION_DURATION.SLOW);
      return () => clearTimeout(timer);
    } else if (isIdle) {
      // Reset shake state when returning to start screen
      setShakeActive(false);
    }
  }, [state, selectedPrize]);

  const isViewportLocked = state === 'countdown' || state === 'dropping' || state === 'landed';

  /**
   * Handles viewport width changes when user selects different device size
   * Resets game if viewport changes during certain states to ensure physics accuracy
   * @param newWidth - The new viewport width in pixels
   */
  const handleViewportChange = (newWidth: number) => {
    const canChange =
      state === 'idle' || state === 'ready' || state === 'revealed' || state === 'claimed';
    if (canChange) {
      setViewportWidth(newWidth);
      if (state === 'ready' || state === 'revealed' || state === 'claimed') {
        setLockedBoardWidth(newWidth);
        resetGame();
      } else {
        setLockedBoardWidth(newWidth);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: theme.gradients.backgroundMain,
        padding: isMobile ? '0' : '1rem',
      }}
    >
      {/* DEV TOOLS - Lazy loaded and conditionally rendered based on feature flag */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 9999,
          maxWidth: isMobile ? undefined : `calc(50vw + ${LAYOUT.DESKTOP_MAX_WIDTH_BASE}px)`,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <DevToolsLoader
            viewportWidth={viewportWidth}
            onViewportChange={handleViewportChange}
            viewportDisabled={isViewportLocked}
            choiceMechanic={choiceMechanic}
            onChoiceMechanicChange={setChoiceMechanic}
            performanceMode={performanceMode}
            onPerformanceModeChange={setPerformanceMode}
            gameState={gameState}
            isStartScreen={state === 'idle' || state === 'ready'}
          />
        </div>
      </div>

      {/* Game container with screen shake */}
  <ScreenShake active={shakeActive} intensity="high" duration={400}>
        <div
          style={{
            width: isMobile ? '100%' : `${lockedBoardWidth}px`,
            margin: '0 auto',
            maxWidth: isMobile ? `${VIEWPORT.MAX_MOBILE}px` : undefined,
            height: isMobile ? '100vh' : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'center' : undefined,
            transition: isViewportLocked ? 'none' : 'width 0.3s ease-in-out',
          }}
        >
          <PopupContainer isMobileOverlay={isMobile}>
            {/* Start screen overlay with smooth exit */}
            <PrizeErrorBoundary onError={handlePrizeError}>
              <AnimatePresence mode="wait">
                {(state === 'idle' || state === 'ready') && (
                  <StartScreen
                    key="start-screen"
                    prizes={prizes}
                    onStart={startGame}
                    disabled={isLoadingPrizes || Boolean(prizeLoadError) || prizes.length === 0}
                    winningIndex={winningIndex}
                  />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>

            {/* Main game board with ball - animated entrance when countdown starts */}
            <GameBoardErrorBoundary onReset={resetGame} onError={handleGameBoardError}>
              <AnimatePresence mode="wait">
                {state !== 'idle' &&
                  state !== 'ready' &&
                  state !== 'revealed' &&
                  state !== 'claimed' && (
                    <PlinkoBoard
                      key="board"
                      prizes={prizes}
                      selectedIndex={selectedIndex}
                      trajectory={trajectory}
                      frameStore={frameStore}
                      getBallPosition={getBallPosition}
                      getCurrentTrajectoryPoint={getCurrentTrajectoryPoint}
                      boardWidth={lockedBoardWidth}
                      boardHeight={500}
                      pegRows={10}
                      ballState={state}
                      isSelectingPosition={state === 'selecting-position'}
                      onPositionSelected={selectDropPosition}
                    />
                  )}
              </AnimatePresence>
            </GameBoardErrorBoundary>

          {/* Countdown overlay */}
          <AnimatePresence mode="wait">
            {state === 'countdown' && (
              <Countdown
                key="countdown"
                onComplete={completeCountdown}
                boardHeight={500}
                pegRows={10}
              />
            )}
          </AnimatePresence>

            {/* Prize reveal overlay with smooth entrance */}
            <PrizeErrorBoundary onError={handlePrizeError}>
              <AnimatePresence mode="wait">
                {state === 'revealed' && selectedPrize && (
                  <PrizeReveal
                    key="prize-reveal"
                    prize={selectedPrize}
                    onClaim={claimPrize}
                    onReset={resetGame}
                    canClaim={canClaim}
                  />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>

            {/* Prize claimed confirmation with smooth entrance */}
            <PrizeErrorBoundary onError={handlePrizeError}>
              <AnimatePresence mode="wait">
                {state === 'claimed' && selectedPrize && (
                  <PrizeClaimed key="prize-claimed" prize={selectedPrize} onClose={resetGame} />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>
          </PopupContainer>
        </div>
      </ScreenShake>
    </div>
  );
}

/**
 * Root application component
 * Wraps the app in AppConfigProvider, ThemeProvider, and ToastProvider
 */
export function App() {
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('high-quality');

  // Memoize config object to prevent unnecessary re-renders when performanceMode hasn't changed
  const config = useMemo(() => ({ performance: { mode: performanceMode } }), [performanceMode]);

  return (
    <ErrorBoundary>
      <AppConfigProvider value={config}>
        <ThemeProvider themes={themes}>
          <ToastProvider position="top-right" maxToasts={3}>
            <AppContent performanceMode={performanceMode} setPerformanceMode={setPerformanceMode} />
          </ToastProvider>
        </ThemeProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  );
}
