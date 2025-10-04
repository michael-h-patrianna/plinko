/**
 * Main Plinko game application
 */

import { PopupContainer } from './components/PopupContainer';
import { PlinkoBoard } from './components/PlinkoBoard/PlinkoBoard';
import { StartScreen } from './components/StartScreen';
import { PrizeReveal } from './components/PrizeReveal';
import { usePlinkoGame } from './hooks/usePlinkoGame';

export function App() {
  const {
    state,
    prizes,
    selectedPrize,
    selectedIndex,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    claimPrize,
    canClaim
  } = usePlinkoGame();

  return (
    <PopupContainer>
      {/* Start screen overlay */}
      {state === 'ready' && (
        <StartScreen
          prizes={prizes}
          onStart={startGame}
          disabled={false}
        />
      )}

      {/* Main game board with ball */}
      <PlinkoBoard
        prizes={prizes}
        selectedIndex={selectedIndex}
        currentTrajectoryPoint={currentTrajectoryPoint}
        boardWidth={375}
        boardHeight={500}
        pegRows={10}
        ballPosition={ballPosition}
        ballState={state}
      />

      {/* Prize reveal overlay */}
      {state === 'revealed' && selectedPrize && (
        <PrizeReveal
          prize={selectedPrize}
          onClaim={claimPrize}
          canClaim={canClaim}
        />
      )}
    </PopupContainer>
  );
}
