/**
 * Main Plinko game application
 * With smooth state transitions using AnimatePresence
 */

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Countdown } from './components/Countdown';
import { ScreenShake } from './components/effects/ScreenShake';
import { PlinkoBoard } from './components/PlinkoBoard/PlinkoBoard';
import { PopupContainer } from './components/PopupContainer';
import { PrizeClaimed } from './components/PrizeClaimed';
import { PrizeReveal } from './components/PrizeReveal';
import { StartScreen } from './components/StartScreen';
import { DevToolsMenu, type ChoiceMechanic } from './dev-tools';
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
  const [shakeActive, setShakeActive] = useState(false);
  const [choiceMechanic, setChoiceMechanic] = useState<ChoiceMechanic>('none');

  // Use game hook with the locked board width
  const {
    state,
    prizes,
    selectedPrize,
    selectedIndex,
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
  } = usePlinkoGame({
    boardWidth: lockedBoardWidth,
    boardHeight: 500,
    pegRows: 10,
    choiceMechanic,
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

  // Trigger screen shake when ball lands, reset when returning to idle
  useEffect(() => {
    const isLanded = state === 'landed';
    const isIdle = state === 'idle';

    if (isLanded) {
      setShakeActive(true);
      const timer = setTimeout(() => setShakeActive(false), 500);
      return () => clearTimeout(timer);
    } else if (isIdle) {
      // Reset shake state when returning to start screen
      setShakeActive(false);
    }
  }, [state]);

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
      {/* DEV TOOLS - Not part of production game */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 9999,
          maxWidth: isMobile ? undefined : `calc(50vw + 400px)`,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <DevToolsMenu
            viewportWidth={viewportWidth}
            onViewportChange={handleViewportChange}
            viewportDisabled={isViewportLocked}
            choiceMechanic={choiceMechanic}
            onChoiceMechanicChange={setChoiceMechanic}
          />
        </div>
      </div>

      {/* Game container with screen shake */}
      <ScreenShake active={shakeActive} intensity="medium" duration={400}>
        <div
          style={{
            width: isMobile ? '100%' : `${lockedBoardWidth}px`,
            margin: '0 auto',
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
                onReset={resetGame}
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
      </ScreenShake>
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
