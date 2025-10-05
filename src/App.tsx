/**
 * Main Plinko game application
 * With smooth state transitions using AnimatePresence
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PopupContainer } from './components/PopupContainer';
import { PlinkoBoard } from './components/PlinkoBoard/PlinkoBoard';
import { StartScreen } from './components/StartScreen';
import { Countdown } from './components/Countdown';
import { PrizeReveal } from './components/PrizeReveal';
import { PrizeClaimed } from './components/PrizeClaimed';
import { ViewportSelector } from './components/ViewportSelector';
import { ThemeSelector } from './components/ThemeSelector';
import { usePlinkoGame } from './hooks/usePlinkoGame';
import { ThemeProvider, themes, useTheme } from './theme';

/**
 * Main application content component
 * Manages game state, viewport sizing, and renders game screens based on current state
 */
function AppContent() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [lockedBoardWidth, setLockedBoardWidth] = useState(375);

  // Use game hook with the locked board width
  const {
    state,
    prizes,
    selectedPrize,
    selectedIndex,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    completeCountdown,
    claimPrize,
    resetGame,
    canClaim,
  } = usePlinkoGame({
    boardWidth: lockedBoardWidth,
    boardHeight: 500,
    pegRows: 10,
  });

  // Inline viewport management instead of broken hook
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isMobileUA || (isTouchDevice && window.innerWidth <= 768);
    };
    setIsMobile(checkMobile());
  }, []);

  useEffect(() => {
    if (isMobile) {
      const updateMobileWidth = () => {
        const width = Math.min(window.innerWidth, 414);
        setViewportWidth(width);
        setLockedBoardWidth(width);
      };
      updateMobileWidth();
      window.addEventListener('resize', updateMobileWidth);
      return () => window.removeEventListener('resize', updateMobileWidth);
    }
  }, [isMobile]);

  useEffect(() => {
    if (state === 'dropping') {
      setLockedBoardWidth(viewportWidth);
    }
  }, [state, viewportWidth]);

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
      {/* Theme and Viewport selectors - hidden on actual mobile devices */}
      {!isMobile && (
        <>
          <ThemeSelector />
          <ViewportSelector
            selectedWidth={viewportWidth}
            onWidthChange={handleViewportChange}
            disabled={isViewportLocked}
          />
        </>
      )}

      {/* Game container */}
      <div
        style={{
          width: isMobile ? '100%' : `${lockedBoardWidth}px`,
          maxWidth: isMobile ? '414px' : undefined,
          height: isMobile ? '100vh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'center' : undefined,
          transition: isViewportLocked ? 'none' : 'width 0.3s ease-in-out',
        }}
      >
        <PopupContainer isMobileOverlay={isMobile}>
          {/* Start screen overlay with smooth exit */}
          <AnimatePresence mode="wait">
            {(state === 'idle' || state === 'ready') && (
              <StartScreen
                key="start-screen"
                prizes={prizes}
                onStart={startGame}
                disabled={state === 'idle'}
              />
            )}
          </AnimatePresence>

          {/* Main game board with ball - animated entrance when countdown starts */}
          <AnimatePresence mode="wait">
            {state !== 'idle' &&
              state !== 'ready' &&
              state !== 'revealed' &&
              state !== 'claimed' && (
                <PlinkoBoard
                  key="board"
                  prizes={prizes}
                  selectedIndex={selectedIndex}
                  currentTrajectoryPoint={currentTrajectoryPoint}
                  boardWidth={lockedBoardWidth}
                  boardHeight={500}
                  pegRows={10}
                  ballPosition={ballPosition}
                  ballState={state}
                />
              )}
          </AnimatePresence>

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
          <AnimatePresence mode="wait">
            {state === 'revealed' && selectedPrize && (
              <PrizeReveal
                key="prize-reveal"
                prize={selectedPrize}
                onClaim={claimPrize}
                canClaim={canClaim}
              />
            )}
          </AnimatePresence>

          {/* Prize claimed confirmation with smooth entrance */}
          <AnimatePresence mode="wait">
            {state === 'claimed' && selectedPrize && (
              <PrizeClaimed key="prize-claimed" prize={selectedPrize} onClose={resetGame} />
            )}
          </AnimatePresence>
        </PopupContainer>
      </div>

      {/* Info text - only show on desktop */}
      {!isMobile && (
        <div
          className="mt-4 text-xs text-center max-w-md"
          style={{ color: theme.colors.text.tertiary }}
        >
          Select a viewport size to test different mobile devices. The viewport is locked during
          gameplay to ensure physics accuracy.
        </div>
      )}
    </div>
  );
}

/**
 * Root application component
 * Wraps the app in ThemeProvider to enable theme switching
 */
export function App() {
  return (
    <ThemeProvider themes={themes}>
      <AppContent />
    </ThemeProvider>
  );
}
