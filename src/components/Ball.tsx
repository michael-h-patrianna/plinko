/**
 * Premium animated ball component with AAA-quality materials and trail effect
 */

import type { BallPosition, GameState } from '../game/types';
import { useState, useEffect } from 'react';

interface BallProps {
  position: BallPosition | null;
  state: GameState;
  currentFrame: number;
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export function Ball({ position, state, currentFrame }: BallProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  // Update trail as ball moves
  useEffect(() => {
    if (position && (state === 'dropping' || state === 'landed')) {
      setTrail(prev => {
        const newTrail = [{ x: position.x, y: position.y, id: Date.now() }, ...prev];
        // Keep only last 8 trail points for performance
        return newTrail.slice(0, 8);
      });
    } else if (state === 'idle' || state === 'ready') {
      setTrail([]);
    }
  }, [position?.x, position?.y, state, currentFrame]);

  if (!position || state === 'idle' || state === 'ready') return null;

  return (
    <>
      {/* Motion trail effect */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '24px',
            height: '24px',
            background: `radial-gradient(circle, rgba(251,191,36,${0.6 - index * 0.08}) 0%, rgba(251,146,60,${0.4 - index * 0.06}) 50%, transparent 70%)`,
            transform: `translate(${point.x - 12}px, ${point.y - 12}px) scale(${1 - index * 0.1})`,
            filter: 'blur(2px)',
            opacity: 1 - index * 0.12,
            willChange: 'transform, opacity',
            zIndex: 18,
            transition: 'all 50ms linear'
          }}
        />
      ))}

      {/* Outer glow (largest) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '50px',
          height: '50px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,146,60,0.15) 30%, transparent 60%)',
          transform: `translate(${position.x - 25}px, ${position.y - 25}px)`,
          filter: 'blur(8px)',
          willChange: 'transform',
          zIndex: 19
        }}
      />

      {/* Middle glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '36px',
          height: '36px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 40%, transparent 70%)',
          transform: `translate(${position.x - 18}px, ${position.y - 18}px)`,
          filter: 'blur(4px)',
          willChange: 'transform',
          zIndex: 20
        }}
      />

      {/* Premium golden ball - AAA quality */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '26px',
          height: '26px',
          background: `
            radial-gradient(
              circle at 28% 25%,
              #fffbeb 0%,
              #fef3c7 15%,
              #fde047 30%,
              #facc15 45%,
              #f59e0b 65%,
              #d97706 80%,
              #b45309 95%
            )
          `,
          boxShadow: `
            0 6px 16px rgba(0,0,0,0.6),
            0 0 20px rgba(251,191,36,0.7),
            0 2px 6px rgba(251,191,36,0.9),
            inset -3px -3px 6px rgba(0,0,0,0.4),
            inset 2px 2px 4px rgba(255,255,255,0.9),
            inset -1px -1px 2px rgba(180,83,9,0.8)
          `,
          border: '1.5px solid rgba(217,119,6,0.9)',
          transform: `translate(${position.x - 13}px, ${position.y - 13}px) rotate(${position.rotation}deg)`,
          willChange: 'transform',
          zIndex: 21,
          position: 'relative',
          overflow: 'hidden'
        }}
        data-state={state}
        data-frame={currentFrame}
        data-testid="plinko-ball"
      >
        {/* Glossy highlight overlay */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '45%',
            height: '45%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(2px)'
          }}
        />

        {/* Subtle texture pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.03) 2px,
                rgba(0,0,0,0.03) 4px
              )
            `,
            borderRadius: '50%',
            opacity: 0.3
          }}
        />
      </div>
    </>
  );
}
