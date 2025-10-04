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
import { usePlinkoGame } from './hooks/usePlinkoGame';

export function App() {
  // Viewport width state - can only change when game is idle or revealed
  const [viewportWidth, setViewportWidth] = useState(375);
  // Locked board width during active game
  const [lockedBoardWidth, setLockedBoardWidth] = useState(375);

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
    canClaim
  } = usePlinkoGame({
    boardWidth: lockedBoardWidth,
    boardHeight: 500,
    pegRows: 10
  });

  // Lock viewport when ball starts dropping (not during ready or revealed states)
  useEffect(() => {
    if (state === 'dropping') {
      // Lock the board size when ball starts dropping
      setLockedBoardWidth(viewportWidth);
    }
  }, [state, viewportWidth]);

  // Handle viewport width change (only allowed when ready, idle, revealed, or claimed)
  const handleViewportChange = (newWidth: number) => {
    // Allow changes in ready, idle, revealed, and claimed states (not during countdown, dropping, landed, etc.)
    const canChange = state === 'idle' || state === 'ready' || state === 'revealed' || state === 'claimed';

    if (canChange) {
      setViewportWidth(newWidth);

      // If we're in ready, revealed, or claimed state, we need to regenerate the game
      if (state === 'ready' || state === 'revealed' || state === 'claimed') {
        setLockedBoardWidth(newWidth);
        resetGame();
      } else {
        // In idle state, just update directly
        setLockedBoardWidth(newWidth);
      }
    }
  };

  // Determine if viewport selector should be disabled (only during active gameplay)
  const isViewportLocked = state === 'countdown' || state === 'dropping' || state === 'landed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Viewport selector above the game */}
      <ViewportSelector
        selectedWidth={viewportWidth}
        onWidthChange={handleViewportChange}
        disabled={isViewportLocked}
      />

      {/* Game container with dynamic width */}
      <div
        style={{
          width: `${lockedBoardWidth}px`,
          transition: isViewportLocked ? 'none' : 'width 0.3s ease-in-out'
        }}
      >
        <PopupContainer>
          {/* Start screen overlay with smooth exit */}
          <AnimatePresence mode="wait">
            {state === 'ready' && (
              <StartScreen
                key="start-screen"
                prizes={prizes}
                onStart={startGame}
                disabled={false}
              />
            )}
          </AnimatePresence>

          {/* Main game board with ball - animated entrance when countdown starts */}
          <AnimatePresence>
            {state !== 'ready' && state !== 'revealed' && state !== 'claimed' && (
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
              <PrizeClaimed
                key="prize-claimed"
                prize={selectedPrize}
                onClose={resetGame}
              />
            )}
          </AnimatePresence>
        </PopupContainer>
      </div>

      {/* Info text */}
      <div className="mt-4 text-slate-400 text-xs text-center max-w-md">
        Select a viewport size to test different mobile devices.
        The viewport is locked during gameplay to ensure physics accuracy.
      </div>
    </div>
  );
}
