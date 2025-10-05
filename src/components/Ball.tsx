/**
 * Premium animated ball component with AAA-quality materials and trail effect
 * Implements Disney animation principles: squash/stretch based on velocity and follow-through with trail
 * @param position - Current ball position {x, y, rotation}
 * @param state - Current game state
 * @param currentFrame - Current animation frame number
 * @param trajectoryPoint - Full trajectory data including velocity for squash/stretch effect
 */

import type { BallPosition, GameState, TrajectoryPoint } from '../game/types';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../theme';

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
  const { theme } = useTheme();

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
        scaleY: 1 - squashAmount, // Compress vertically
      };
    }

    // Stretch when falling fast
    if (vy > 200 && !trajectoryPoint.pegHit) {
      const stretchAmount = Math.min(vy / 1000, 0.3); // Max 30% stretch
      return {
        scaleX: 1 - stretchAmount * 0.4, // Narrow horizontally
        scaleY: 1 + stretchAmount, // Elongate vertically
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

  // Track if we just launched (for launch animation)
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (state === 'dropping' && currentFrame === 0) {
      setIsLaunching(true);
      const timer = setTimeout(() => setIsLaunching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [state, currentFrame]);

  // Update trail as ball moves
  useEffect(() => {
    if (position && (state === 'dropping' || state === 'landed')) {
      setTrail((prevTrail) => {
        const newTrail = [{ x: position.x, y: position.y, id: Date.now() }, ...prevTrail];
        return newTrail.slice(0, trailLength);
      });
    } else if (state === 'idle' || state === 'ready' || state === 'countdown') {
      setTrail([]);
    }
  }, [position, state, currentFrame, trailLength]);

  // Hide ball during countdown - it's shown in the launcher
  // Keep ball visible during 'revealed' state to prevent reset to top
  if (!position || state === 'idle' || state === 'ready' || state === 'countdown') return null;

  return (
    <>
      {/* Motion trail effect - using linear gradient instead of radial, no animated blur */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '16px',
            height: '16px',
            background: theme.gradients.ballGlow,
            transform: `translate(${point.x - 8}px, ${point.y - 8}px) scale(${1 - index * 0.1})`,
            opacity: 0.6 - index * 0.08,
            willChange: 'transform, opacity',
            zIndex: 18,
            transition: 'all 50ms linear',
          }}
        />
      ))}

      {/* Outer glow (largest) - squashes with ball - linear gradient */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '36px',
          height: '36px',
          background: theme.gradients.ballGlow,
          transform: `translate(${position.x - 18}px, ${position.y - 18}px) scaleX(${scaleX}) scaleY(${scaleY}) scale(${isLaunching ? 0.7 : 1})`,
          opacity: 0.3,
          willChange: 'transform',
          zIndex: 19,
          borderRadius: '50%',
          transition: isLaunching
            ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 100ms ease-out',
        }}
      />

      {/* Middle glow - squashes with ball - linear gradient */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '24px',
          height: '24px',
          background: theme.gradients.ballGlow,
          transform: `translate(${position.x - 12}px, ${position.y - 12}px) scaleX(${scaleX}) scaleY(${scaleY}) scale(${isLaunching ? 0.7 : 1})`,
          opacity: 0.5,
          willChange: 'transform',
          zIndex: 20,
          borderRadius: '50%',
          transition: isLaunching
            ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 100ms ease-out',
        }}
      />

      {/* Premium golden ball - AAA quality with SQUASH AND STRETCH - SMALLER SIZE */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '14px',
          height: '14px',
          background: theme.gradients.ballMain,
          boxShadow: `
            0 6px 16px ${theme.colors.shadows.default},
            0 0 20px ${theme.colors.shadows.colored},
            0 2px 6px ${theme.colors.shadows.colored},
            inset -3px -3px 6px ${theme.colors.shadows.default}66,
            inset 2px 2px 4px ${theme.colors.text.inverse}e6,
            inset -1px -1px 2px ${theme.colors.game.ball.secondary}cc
          `,
          border: `1px solid ${theme.colors.game.ball.secondary}`,
          transform: `translate(${position.x - 7}px, ${position.y - 7}px) rotate(${position.rotation}deg) scaleX(${scaleX}) scaleY(${scaleY}) scale(${isLaunching ? 0.7 : 1})`,
          willChange: 'transform',
          zIndex: 21,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '50%',
          transition: isLaunching
            ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 100ms ease-out',
        }}
        data-state={state}
        data-frame={currentFrame}
        data-testid="plinko-ball"
      >
        {/* Glossy highlight overlay - using linear gradient, static blur is OK in React Native */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '45%',
            height: '45%',
            background: theme.gradients.shine,
            borderRadius: '50%',
            filter: 'blur(2px)', // Static blur is OK
            opacity: 0.9,
          }}
        />

        {/* Subtle texture pattern - using simple linear gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, transparent 48%, ${theme.colors.shadows.default}03 50%, transparent 52%)`,
            borderRadius: '50%',
            opacity: 0.3,
          }}
        />
      </div>
    </>
  );
}
