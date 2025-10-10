/**
 * Ball landing impact animation with shockwave ring and glow pulse
 * Subtle, polished effect triggered when ball lands in winning slot
 * @param x - X position of impact
 * @param y - Y position of impact
 * @param color - Color for the impact effect
 * @param trigger - Whether to trigger the animation
 */

import { useEffect, useState } from 'react';
import { useAnimationDriver } from '@theme/animationDrivers';

interface BallLandingImpactProps {
  x: number;
  y: number;
  color: string;
  trigger: boolean;
}

export function BallLandingImpact({ x, y, color, trigger }: BallLandingImpactProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setKey((prev) => prev + 1);
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div key={key} className="absolute pointer-events-none" style={{ left: 0, top: 0, zIndex: 30 }}>
      {/* Single clean shockwave ring */}
      <AnimatedDiv
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          border: `2px solid ${color}`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{
          scale: [0.8, 3],
          opacity: [0.7, 0],
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Subtle glow pulse - Cross-platform: linear gradient approximation of radial glow */}
      <AnimatedDiv
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}88 0%, ${color}44 50%, transparent 100%)`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{
          scale: [0.5, 1.5],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  );
}
