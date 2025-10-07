/**
 * Slot anticipation animation with ascending light particles
 * Implements Disney anticipation principle - preparatory animation signaling the win
 * @param x - X position of the slot
 * @param width - Width of the slot
 * @param color - Color for the particle effects
 * @param isActive - Whether the animation should be shown
 */

import { useMemo } from 'react';
import { useAnimationDriver } from '../../../theme/animationDrivers';
import { useAppConfig } from '../../../config/AppConfigContext';
import { getPerformanceSetting } from '../../../config/appConfig';

interface SlotAnticipationProps {
  x: number;
  width: number;
  color: string;
  isActive: boolean;
}

export function SlotAnticipation({ x, width, color, isActive }: SlotAnticipationProps) {
  // Memoize particle positions and delays to avoid Math.random() on every render
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const { performance } = useAppConfig();

  // PERFORMANCE: Control particle count and infinite animations based on mode
  const particleMultiplier = getPerformanceSetting(performance, 'particleMultiplier') ?? 1.0;
  const enableInfiniteAnimations = getPerformanceSetting(performance, 'enableInfiniteAnimations') ?? true;

  // Calculate particle count based on particle multiplier (5 high-quality, 3-4 balanced, 2-3 power-saving)
  const particleCount = Math.max(2, Math.round(5 * particleMultiplier));

  // Note: particleCount is NOT in dependencies to prevent particles from jumping when performance mode changes
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => ({
        x: x + width * (0.3 + Math.random() * 0.4),
        delay: i * 0.2 + Math.random() * 0.3,
      })),
    [x, width]
  );

  if (!isActive) return null;

  return (
    <>
      {/* Ascending light particles - APPEAL & ANTICIPATION - Cross-platform: linear gradient - PERFORMANCE: disabled in power-saving */}
      {enableInfiniteAnimations && particles.map((particle, i) => (
        <AnimatedDiv
          key={`particle-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${particle.x}px`,
            bottom: '0px',
            width: '6px',
            height: '6px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}aa 50%, transparent 100%)`,
            /* RN-compatible: removed boxShadow glow */
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -80,
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1], // Ease-out cubic
          }}
        />
      ))}
    </>
  );
}
