/**
 * Main Plinko game application
 * With smooth state transitions using AnimatePresence
 *
 * BUNDLE SIZE OPTIMIZATION:
 * - Uses LazyMotion for reduced initial bundle size
 * - Motion features are lazy-loaded from motion-features.ts
 * - Initial bundle: ~4.6kb (vs 34kb without optimization)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LazyMotion } from 'motion/react';
import { prewarmTrailCache } from './animation/trailOptimization';
import { AudioProvider, useAudio } from './audio/context/AudioProvider';
import { useAudioPreloader } from './audio/hooks/useAudioPreloader';
import { useMusicManager } from './audio/hooks/useMusicManager';
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
import { PauseProvider } from './contexts/PauseContext';
import { DevToolsLoader, type ChoiceMechanic } from './dev-tools';
import { useAppUIState } from './hooks/useAppUIState';
import { usePlinkoGame } from './hooks/usePlinkoGame';
import { ThemeProvider, themes, useTheme } from './theme';
import { useAnimationDriver } from './theme/animationDrivers';
import { getContainerPadding, getDevToolsStyles, getGameContainerStyles } from './theme/tokens';
import { loadDevSettings, saveDevSettings } from '@utils/devToolsPersistence';

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

  // Load persisted dev settings on mount
  const persistedSettings = useMemo(() => loadDevSettings(), []);

  const [choiceMechanic, setChoiceMechanic] = useState<ChoiceMechanic>(persistedSettings.choiceMechanic);
  const [showWinner, setShowWinner] = useState(persistedSettings.showWinner);
  const [musicEnabled, setMusicEnabled] = useState(persistedSettings.musicEnabled);

  // Animation lifecycle fix: Increment gameId on each reset to force Motion to treat
  // each remount as a fresh animation cycle (prevents animation state caching issues)
  const [gameId, setGameId] = useState(0);

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
        setGameId((prev) => prev + 1);
      }
    },
  });

  const { isMobile, viewportWidth, lockedBoardWidth, isViewportLocked, shakeActive } = uiState;

  // Restore persisted viewport width on mount (desktop only)
  useEffect(() => {
    if (!isMobile && viewportWidth !== persistedSettings.viewportWidth) {
      // Only restore if we're in a state where viewport can change
      if (state === 'idle' || state === 'ready') {
        uiState.handleViewportChange(persistedSettings.viewportWidth, false);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap resetGame to increment gameId for animation lifecycle management
  const handleResetGame = useCallback(() => {
    resetGame();
    setGameId((prev) => prev + 1);
  }, [resetGame]);

  // Manage background music playback based on game state
  useMusicManager({
    musicController,
    gameState: state,
    musicEnabled,
  });

  // Sync board width with locked board width
  useEffect(() => {
    setBoardWidthForGame(lockedBoardWidth);
  }, [lockedBoardWidth]);

  // Save dev settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      choiceMechanic,
      showWinner,
      musicEnabled,
      performanceMode,
      viewportWidth,
      themeName: theme.name,
    };
    saveDevSettings(settings);
  }, [choiceMechanic, showWinner, musicEnabled, performanceMode, viewportWidth, theme.name]);

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
      if (shouldReset) {
        setGameId((prev) => prev + 1);
      }
    },
    [state, uiState]
  );


  // Handle result SFX based on game state and prize type
  useEffect(() => {
    if (!sfxController || !selectedPrize) return;

    if (state === 'celebrating') {
      // Ball has landed and celebration animation starts
      // Play appropriate sound based on prize type
      if (selectedPrize.type === 'no_win') {
        // No win - play sad/neutral sound
        console.log('Playing nowin sound for no_win prize');
        sfxController.play('result-nowin');
      } else {
        // Win (free or purchase) - play cheers
        console.log('Playing cheers sound for win prize');
        sfxController.play('result-cheers');
      }
    }
  }, [state, selectedPrize, sfxController]);

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
                    key={`start-screen-${gameId}`}
                    prizes={prizes}
                    onStart={startGame}
                    disabled={isLoadingPrizes || Boolean(prizeLoadError) || prizes.length === 0}
                    winningIndex={winningIndex}
                    showWinner={showWinner}
                  />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>

            {/* Main game board with ball - stays visible during celebrating state */}
            <GameBoardErrorBoundary onReset={handleResetGame} onError={handleGameBoardError}>
              {/* NO mode="wait" - board should stay mounted across state transitions */}
              <AnimatePresence>
                {(state === 'selecting-position' ||
                  state === 'countdown' ||
                  state === 'dropping' ||
                  state === 'landed' ||
                  state === 'celebrating') && (
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
                    key={`prize-reveal-${gameId}`}
                    prize={selectedPrize}
                    onClaim={claimPrize}
                    onReset={handleResetGame}
                    canClaim={canClaim}
                  />
                )}
              </AnimatePresence>
            </PrizeErrorBoundary>

            {/* Prize claimed confirmation with smooth entrance */}
            <PrizeErrorBoundary onError={handlePrizeError}>
              <AnimatePresence mode="wait">
                {state === 'claimed' && selectedPrize && (
                  <PrizeClaimed key={`prize-claimed-${gameId}`} prize={selectedPrize} onClose={handleResetGame} />
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
  // Load persisted performance mode on mount
  const persistedSettings = useMemo(() => loadDevSettings(), []);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(persistedSettings.performanceMode);

  // Pre-warm trail optimization cache on app initialization
  // This eliminates first-frame computation cost by pre-computing all trail lookup tables (1-20 points)
  useEffect(() => {
    prewarmTrailCache(20);
  }, []);

  // Memoize config object to prevent unnecessary re-renders when performanceMode hasn't changed
  const config = useMemo(() => ({ performance: { mode: performanceMode } }), [performanceMode]);

  // Lazy load motion features for reduced initial bundle size
  const loadFeatures = () => import('./motion-features').then((res) => res.default);

  return (
    <ErrorBoundary>
      <LazyMotion features={loadFeatures} strict>
        <PauseProvider>
          <AppConfigProvider value={config}>
            <ThemeProvider themes={themes}>
              <AudioProvider>
                <ToastProvider position="top-right" maxToasts={3}>
                  <AppContent performanceMode={performanceMode} setPerformanceMode={setPerformanceMode} />
                </ToastProvider>
              </AudioProvider>
            </ThemeProvider>
          </AppConfigProvider>
        </PauseProvider>
      </LazyMotion>
    </ErrorBoundary>
  );
}
