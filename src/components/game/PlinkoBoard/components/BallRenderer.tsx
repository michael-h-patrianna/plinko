/**
 * BallRenderer component - handles ball rendering with performance optimization
 * Subscribes to frameStore directly to avoid PlinkoBoard re-renders
 *
 * PERFORMANCE STRATEGY:
 * - This component subscribes to frameStore independently
 * - Calculates ball position on each frame
 * - Passes position to Ball component which handles visual rendering
 * - Keeps PlinkoBoard from re-rendering 60 FPS
 * - Ball component stays unchanged (preserves all visual logic)
 */

import { memo, useSyncExternalStore } from 'react';
import type { GameState, TrajectoryPoint, BallPosition } from '../../../../game/types';
import { Ball } from '../../Ball';
import { BallLauncher } from '../../BallLauncher';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface BallRendererProps {
  isSelectingPosition: boolean;
  ballState: GameState;
  showTrail: boolean;
  frameStore?: FrameStore;
  getBallPosition?: () => BallPosition | null;
  getCurrentTrajectoryPoint?: () => TrajectoryPoint | null;
}

export const BallRenderer = memo(function BallRenderer({
  isSelectingPosition,
  ballState,
  showTrail,
  frameStore,
  getBallPosition,
  getCurrentTrajectoryPoint,
}: BallRendererProps) {
  // Don't render anything during position selection
  if (isSelectingPosition) {
    return null;
  }

  // Subscribe to frameStore to get updates (this is the key optimization)
  // This component re-renders 60 FPS, but PlinkoBoard does NOT
  const dummySubscribe = () => () => {};
  const dummyGetSnapshot = () => 0;
  const currentFrame = useSyncExternalStore(
    frameStore?.subscribe ?? dummySubscribe,
    frameStore?.getSnapshot ?? dummyGetSnapshot,
    frameStore?.getSnapshot ?? dummyGetSnapshot
  );

  // Get current ball position and trajectory point
  const ballPosition = getBallPosition?.() ?? null;
  const currentTrajectoryPoint = getCurrentTrajectoryPoint?.() ?? null;

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

  // Render Ball component with calculated position
  // Ball handles all visual rendering (trail, glow, squash/stretch)
  return (
    <Ball
      key={`ball-${showTrail ? 'trail' : 'no-trail'}`}
      position={ballPosition}
      state={ballState}
      currentFrame={currentFrame}
      trajectoryPoint={currentTrajectoryPoint}
      showTrail={showTrail}
    />
  );
});
