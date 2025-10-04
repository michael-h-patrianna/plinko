/**
 * Premium animated ball component with AAA-quality materials and trail effect
 */

import type { BallPosition, GameState, TrajectoryPoint } from '../game/types';
import { useState, useEffect, useMemo } from 'react';

interface BallProps {
  position: BallPosition | null;
  state: GameState;
  currentFrame: number;
  trajectoryPoint?: TrajectoryPoint | null; // For velocity-based squash/stretch
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export function Ball({ position, state, currentFrame, trajectoryPoint }: BallProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  // Calculate squash/stretch based on velocity (Disney principle)
  const { scaleX, scaleY } = useMemo(() => {
    if (!trajectoryPoint || !trajectoryPoint.vx || !trajectoryPoint.vy) {
      return { scaleX: 1, scaleY: 1 };
    }

    const vx = trajectoryPoint.vx;
    const vy = trajectoryPoint.vy;
    const speed = Math.sqrt(vx * vx + vy * vy);

    // Squash on impact (when hitting peg)
    if (trajectoryPoint.pegHit && speed > 50) {
      const squashAmount = Math.min(speed / 800, 0.4); // Max 40% squash
      return {
        scaleX: 1 + squashAmount * 0.5, // Widen horizontally
        scaleY: 1 - squashAmount         // Compress vertically
      };
    }

    // Stretch when falling fast
    if (vy > 200 && !trajectoryPoint.pegHit) {
      const stretchAmount = Math.min(vy / 1000, 0.3); // Max 30% stretch
      return {
        scaleX: 1 - stretchAmount * 0.4, // Narrow horizontally
        scaleY: 1 + stretchAmount         // Elongate vertically
      };
    }

    return { scaleX: 1, scaleY: 1 };
  }, [trajectoryPoint]);

  // Calculate trail length based on speed (Disney principle: follow-through)
  const trailLength = useMemo(() => {
    if (!trajectoryPoint || !trajectoryPoint.vx || !trajectoryPoint.vy) {
      return 4; // Minimum trail
    }
    const vx = trajectoryPoint.vx;
    const vy = trajectoryPoint.vy;
    const speed = Math.sqrt(vx * vx + vy * vy);

    // Slow: 3-4 points, Medium: 6-8 points, Fast: 10-12 points
    if (speed < 100) return 4;
    if (speed < 300) return 8;
    return 12;
  }, [trajectoryPoint]);

  // Update trail as ball moves
  useEffect(() => {
    if (position && (state === 'dropping' || state === 'landed')) {
      setTrail(prev => {
        const newTrail = [{ x: position.x, y: position.y, id: Date.now() }, ...prev];
        // Keep dynamic trail length based on speed
        return newTrail.slice(0, trailLength);
      });
    } else if (state === 'idle' || state === 'ready') {
      setTrail([]);
    }
  }, [position?.x, position?.y, state, currentFrame, trailLength]);

  if (!position || state === 'idle' || state === 'ready') return null;

  return (
    <>
      {/* Motion trail effect */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '16px',
            height: '16px',
            background: `radial-gradient(circle, rgba(251,191,36,${0.6 - index * 0.08}) 0%, rgba(251,146,60,${0.4 - index * 0.06}) 50%, transparent 70%)`,
            transform: `translate(${point.x - 8}px, ${point.y - 8}px) scale(${1 - index * 0.1})`,
            filter: 'blur(2px)',
            opacity: 1 - index * 0.12,
            willChange: 'transform, opacity',
            zIndex: 18,
            transition: 'all 50ms linear'
          }}
        />
      ))}

      {/* Outer glow (largest) - squashes with ball */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '36px',
          height: '36px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,146,60,0.15) 30%, transparent 60%)',
          transform: `translate(${position.x - 18}px, ${position.y - 18}px) scaleX(${scaleX}) scaleY(${scaleY})`,
          filter: 'blur(6px)',
          willChange: 'transform',
          zIndex: 19,
          borderRadius: '50%',
          transition: 'transform 100ms ease-out'
        }}
      />

      {/* Middle glow - squashes with ball */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '24px',
          height: '24px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 40%, transparent 70%)',
          transform: `translate(${position.x - 12}px, ${position.y - 12}px) scaleX(${scaleX}) scaleY(${scaleY})`,
          filter: 'blur(3px)',
          willChange: 'transform',
          zIndex: 20,
          borderRadius: '50%',
          transition: 'transform 100ms ease-out'
        }}
      />

      {/* Premium golden ball - AAA quality with SQUASH AND STRETCH - SMALLER SIZE */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '14px',
          height: '14px',
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
          border: '1px solid rgba(217,119,6,0.9)',
          transform: `translate(${position.x - 7}px, ${position.y - 7}px) rotate(${position.rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
          willChange: 'transform',
          zIndex: 21,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '50%',
          transition: 'transform 100ms ease-out'
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
