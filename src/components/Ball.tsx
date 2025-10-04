/**
 * Animated ball component
 */

import type { BallPosition, GameState } from '../game/types';

interface BallProps {
  position: BallPosition | null;
  state: GameState;
  currentFrame: number;
}

export function Ball({ position, state, currentFrame }: BallProps) {
  if (!position || state === 'idle' || state === 'ready') return null;

  return (
    <div
      className="absolute w-5 h-5 rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0 40%, #d0d0d0)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.8)',
        transform: `translate(${position.x - 10}px, ${position.y - 10}px) rotate(${position.rotation}deg)`,
        willChange: 'transform',
        zIndex: 20
      }}
      data-state={state}
      data-frame={currentFrame}
      data-testid="plinko-ball"
    />
  );
}
