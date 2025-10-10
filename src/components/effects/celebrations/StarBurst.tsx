/**
 * Star burst particle effect for premium celebrations
 * Creates 8-12 star-shaped particles bursting outward with rotation
 * Cross-platform safe: uses only transforms and opacity
 */

import { useMemo } from 'react';
import { useAnimationDriver } from '@theme/animationDrivers';

const randBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

interface StarBurstProps {
  /** Origin point for star burst */
  originX?: string;
  originY?: string;
  /** Number of star particles (default: 10) */
  particleCount?: number;
  /** Star color */
  color?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
}

export function StarBurst({
  originX = '50%',
  originY = '50%',
  particleCount = 10,
  color = '#FFD700',
  delay = 0,
}: StarBurstProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const angle = (360 / particleCount) * i + randBetween(-15, 15);
        const distance = randBetween(100, 180);
        const rotation = randBetween(0, 720);
        const size = randBetween(8, 16);

        // Calculate end position
        const angleRad = (angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * distance;
        const y = Math.sin(angleRad) * distance;

        return {
          id: i,
          x,
          y,
          rotation,
          size,
          delay: delay + i * 0.03, // Stagger stars slightly
        };
      }),
    [particleCount, delay]
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <AnimatedDiv
          key={particle.id}
          style={{
            position: 'absolute',
            left: originX,
            top: originY,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1.2, 1, 0],
            rotate: particle.rotation,
            opacity: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: 0.8,
            delay: particle.delay / 1000,
            times: [0, 0.2, 0.6, 1],
            ease: 'easeOut',
          }}
        >
          {/* Star shape using rotated square (diamond) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: color,
              transform: 'rotate(45deg)',
              borderRadius: '2px',
            }}
          />
        </AnimatedDiv>
      ))}
    </div>
  );
}
