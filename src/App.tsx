/**
 * Main Plinko game application
 * With smooth state transitions using AnimatePresence
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { prewarmTrailCache } from './animation/trailOptimization';
import { AudioProvider, useAudio } from './audio/context/AudioProvider';
import { useAudioPreloader } from './audio/hooks/useAudioPreloader';
import { ScreenShake } from './components/effects/ScreenShake';
import { CelebrationOverlay } from './components/effects/celebrations';
import { ToastProvider, useToast } from './components/feedback';
import { Countdown } from './components/game/Countdown';
import { PlinkoBoard } from './components/game/PlinkoBoard/PlinkoBoard';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { GameBoardErrorBoundary } from './components/layout/GameBoardErrorBoundary';
import { PopupContainer } from './components/layout/PopupContainer';
import { PrizeErrorBoundary } from './components/layout/PrizeErrorBoundary';
import { PrizeClaimed } from './components/screens/PrizeClaimed';
import { PrizeReveal } from './components/screens/PrizeReveal';
import { StartScreen } from './components/screens/StartScreen';
import { AppConfigProvider } from './config/AppConfigContext';
import type { PerformanceMode } from './config/appConfig';
import { LAYOUT } from './constants';
import { DevToolsLoader, type ChoiceMechanic } from './dev-tools';
import { useAppUIState } from './hooks/useAppUIState';
import { usePlinkoGame } from './hooks/usePlinkoGame';
import { ThemeProvider, themes, useTheme } from './theme';
import { useAnimationDriver } from './theme/animationDrivers';
import { getContainerPadding, getDevToolsStyles, getGameContainerStyles } from './theme/tokens';

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

  // Initialize and preload audio
  const { sfxController, musicController, isInitialized } = useAudio();
  const { isLoaded: audioLoaded, errors: audioErrors } = useAudioPreloader({
    sfxController,
    musicController,
    enabled: isInitialized,
  });

  // Log audio preload errors
  useEffect(() => {
    if (audioErrors.length > 0) {
      console.warn('Audio preload errors:', audioErrors);
    }
  }, [audioErrors]);

  // Log when audio is ready
  useEffect(() => {
    if (audioLoaded) {
      console.log('Audio system ready');
    }
  }, [audioLoaded]);

  const [choiceMechanic, setChoiceMechanic] = useState<ChoiceMechanic>('drop-position');
  const [showWinner, setShowWinner] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false); // Default: music off

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

  // Track board width for game initialization
  const [boardWidthForGame, setBoardWidthForGame] = useState(375);

  // Use game hook
  const gameState = usePlinkoGame({
    boardWidth: boardWidthForGame,
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
    trajectoryCache,
    frameStore,
    currentFrameRef,
    getBallPosition,
    getCurrentTrajectoryPoint,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    resetGame,
    onLandingComplete,
    canClaim,
    isLoadingPrizes,
    prizeLoadError,
  } = gameState;

  // Initialize UI state with viewport and shake management
  const uiState = useAppUIState({
    gameState: state,
    selectedPrize,
    onViewportChangeRequiresReset: (newWidth) => {
      setBoardWidthForGame(newWidth);
      if (
        state === 'ready' ||
        state === 'revealed' ||
        state === 'claimed'
      ) {
        resetGame();
      }
    },
  });

  const { isMobile, viewportWidth, lockedBoardWidth, isViewportLocked, shakeActive } = uiState;

  // Sync board width with locked board width
  useEffect(() => {
    setBoardWidthForGame(lockedBoardWidth);
  }, [lockedBoardWidth]);

  // Memoize computed style objects to prevent recreation on every render
  const devToolsContainerStyle = useMemo(
    () => getDevToolsStyles(isMobile, LAYOUT.DESKTOP_MAX_WIDTH_BASE),
    [isMobile]
  );

  const gameContainerStyle = useMemo(
    () => getGameContainerStyles(isMobile, lockedBoardWidth, isViewportLocked),
    [isMobile, lockedBoardWidth, isViewportLocked]
  );

  const containerPadding = useMemo(() => getContainerPadding(isMobile), [isMobile]);

  /**
   * Handles viewport width changes when user selects different device size
   * Resets game if viewport changes during certain states to ensure physics accuracy
   * PERFORMANCE: Memoized to prevent DevToolsLoader re-renders on every App render
   * @param newWidth - The new viewport width in pixels
   */
  const handleViewportChange = useCallback(
    (newWidth: number) => {
      const shouldReset =
        state === 'ready' || state === 'revealed' || state === 'claimed';
      uiState.handleViewportChange(newWidth, shouldReset);
    },
    [state, uiState]
  );

  // Handle music transitions based on game state
  useEffect(() => {
    if (!musicController) return;

    let cleanupTransition: (() => void) | undefined;

    // Stop all music when returning to start screen (reset)
    if (state === 'idle' || state === 'ready') {
      console.log('Returned to start screen - stopping all music');
      musicController.stopAllLayers(1000);
      return;
    }

    // Only play music if enabled
    if (!musicEnabled) {
      return;
    }

    if (state === 'countdown') {
      // Countdown started - transition to game-loop at next loop boundary
      if (musicController.isLayerPlaying('music-start-loop') && musicController.isLoaded('music-game-loop')) {
        console.log('Countdown started - scheduling transition to game-loop at loop boundary');

        cleanupTransition = musicController.transitionAtLoopBoundary(
          'music-start-loop',
          'music-game-loop',
          {
            fadeOutFrom: 500, // Short fade out for smooth transition
            fadeInTo: 0, // Instant start to maintain rhythm
            volumeTo: 0.5, // Start at 50% volume
          }
        );
      }
    } else if (state === 'dropping') {
      // Ball is dropping - ensure start-loop is stopped and game-loop is at correct volume

      // Failsafe: Stop start-loop if it's somehow still playing
      if (musicController.isLayerPlaying('music-start-loop')) {
        console.log('Ball dropping - force stopping start-loop (failsafe)');
        musicController.stopLayer('music-start-loop', 500);
      }

      // Fade game-loop to 36%
      if (musicController.isLayerPlaying('music-game-loop')) {
        console.log('Ball dropping - fading game-loop to 36%');
        musicController.fadeLayerVolume('music-game-loop', 0.36, 1000);
      }
    } else if (state === 'landed') {
      // Ball has landed - fade out and stop all music
      console.log('Ball landed - fading out and stopping all music');
      musicController.stopAllLayers(1000);
    }

    // Cleanup transition if state changes before it happens
    return () => {
      if (cleanupTransition) {
        cleanupTransition();
      }
    };
  }, [state, musicController, musicEnabled]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: theme.gradients.backgroundMain,
        padding: containerPadding,
      }}
    >
      {/* DEV TOOLS - Lazy loaded and conditionally rendered based on feature flag */}
      <div style={devToolsContainerStyle}>
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
            showWinner={showWinner}
            onShowWinnerChange={setShowWinner}
            musicEnabled={musicEnabled}
            onMusicEnabledChange={setMusicEnabled}
          />
        </div>
      </div>

      {/* Game container with screen shake */}
      <ScreenShake active={shakeActive} intensity="high" duration={400}>
        <div style={gameContainerStyle}>
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
                    showWinner={showWinner}
                    musicEnabled={musicEnabled}
                  />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>

            {/* Main game board with ball - stays visible during celebrating state */}
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
                      trajectoryCache={trajectoryCache}
                      frameStore={frameStore}
                      currentFrameRef={currentFrameRef}
                      getBallPosition={getBallPosition}
                      getCurrentTrajectoryPoint={getCurrentTrajectoryPoint}
                      boardWidth={lockedBoardWidth}
                      boardHeight={500}
                      pegRows={10}
                      ballState={state}
                      isSelectingPosition={state === 'selecting-position'}
                      onPositionSelected={selectDropPosition}
                      onLandingComplete={onLandingComplete}
                      showWinner={showWinner}
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

          {/* Celebration overlay - AFTER PopupContainer to render above everything */}
          <AnimatePresence mode="wait">
            {state === 'celebrating' && selectedPrize && (
              <CelebrationOverlay
                key="celebration"
                prize={selectedPrize}
                onComplete={() => {
                  // Celebration overlay manages its own timing
                  // Auto-advance is handled by useGameState effect
                }}
              />
            )}
          </AnimatePresence>
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

  // Pre-warm trail optimization cache on app initialization
  // This eliminates first-frame computation cost by pre-computing all trail lookup tables (1-20 points)
  useEffect(() => {
    prewarmTrailCache(20);
  }, []);

  // Memoize config object to prevent unnecessary re-renders when performanceMode hasn't changed
  const config = useMemo(() => ({ performance: { mode: performanceMode } }), [performanceMode]);

  return (
    <ErrorBoundary>
      <AppConfigProvider value={config}>
        <ThemeProvider themes={themes}>
          <AudioProvider>
            <ToastProvider position="top-right" maxToasts={3}>
              <AppContent performanceMode={performanceMode} setPerformanceMode={setPerformanceMode} />
            </ToastProvider>
          </AudioProvider>
        </ThemeProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  );
}
