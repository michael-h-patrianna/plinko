/**
 * BallRenderer component - handles ball and launcher rendering logic
 * Shows appropriate launcher states during countdown and dropping
 * Renders ball during active gameplay
 */

import { memo } from 'react';
import type { GameState, TrajectoryPoint } from '../../../../game/types';
import { Ball } from '../../Ball';
import { BallLauncher } from '../../BallLauncher';

interface BallRendererProps {
  isSelectingPosition: boolean;
  ballState: GameState;
  ballPosition: { x: number; y: number; rotation: number } | null;
  currentTrajectoryPoint: TrajectoryPoint | null;
  showTrail: boolean;
}

export const BallRenderer = memo(function BallRenderer({
  isSelectingPosition,
  ballState,
  ballPosition,
  currentTrajectoryPoint,
  showTrail,
}: BallRendererProps) {
  // Don't render anything during position selection
  if (isSelectingPosition) {
    return null;
  }

  // Render launcher during countdown
  if (ballState === 'countdown' && ballPosition) {
    return (
      <BallLauncher
        x={ballPosition.x}
        y={ballPosition.y}
        isLaunching={false}
        isSelected={false}
      />
    );
  }

  // Render launching animation at frame 0
  if (ballState === 'dropping' && currentTrajectoryPoint?.frame === 0 && ballPosition) {
    return (
      <BallLauncher
        x={ballPosition.x}
        y={ballPosition.y}
        isLaunching={true}
        isSelected={false}
      />
    );
  }

  // Hide ball at frame 0 to prevent overlap with BallLauncher
  if (ballState === 'dropping' && currentTrajectoryPoint?.frame === 0) {
    return null;
  }

  // Render ball for all other states
  return (
    <Ball
      key={`ball-${showTrail ? 'trail' : 'no-trail'}`}
      position={ballPosition}
      state={ballState}
      currentFrame={currentTrajectoryPoint?.frame ?? 0}
      trajectoryPoint={currentTrajectoryPoint}
      showTrail={showTrail}
    />
  );
});
