/**
 * Confetti Spiral celebration animation
 * Adapted from animations library for Plinko game celebrations
 * Cross-platform safe: uses only transforms (rotate, x, y, scale) and opacity
 */

import { useMemo } from 'react';
import { useAnimationDriver } from '@theme/animationDrivers';
import './ConfettiSpiral.css';

const confettiColors = ['#ff5981', '#c6ff77', '#47fff4', '#ffce1a', '#ecc3ff'];

// Utility function to generate random number between min and max
const randBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

interface ConfettiSpiralProps {
  /** Origin point for confetti burst (default: center) */
  originX?: string;
  originY?: string;
  /** Number of particles (default: 26) */
  particleCount?: number;
  /** Custom colors (optional) */
  colors?: string[];
}

export function ConfettiSpiral({
  originX = '50%',
  originY = '50%',
  particleCount = 26,
  colors = confettiColors,
}: ConfettiSpiralProps) {
  const driver = useAnimationDriver();
  const AnimatedSpan = driver.createAnimatedComponent('span');

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const angle = randBetween(0, 360);
        const spin = randBetween(360, 540);
        const radius = randBetween(150, 250); // Increased from 90-140 to 150-250
        const delay = i * 0.018;
        const duration = 1.2; // Slightly longer for bigger burst

        // Calculate the spiral path coordinates
        const endAngleRad = ((angle + spin) * Math.PI) / 180;
        const x = Math.cos(endAngleRad) * radius;
        const y = Math.sin(endAngleRad) * radius;

        return {
          id: i,
          color: colors[i % colors.length],
          angle,
          spin,
          radius,
          delay,
          duration,
          x,
          y,
        };
      }),
    [particleCount, colors]
  );

  return (
    <div className="pf-celebration">
      <div className="pf-celebration__layer">
        {particles.map((particle) => (
          <AnimatedSpan
            key={particle.id}
            className="pf-celebration__confetti"
            style={{
              left: originX,
              top: originY,
              background: particle.color,
            }}
            initial={{
              rotate: 0,
              x: 0,
              y: 0,
              scale: 0.4,
              opacity: 0,
            }}
            animate={{
              rotate: particle.spin,
              x: particle.x,
              y: particle.y,
              scale: 1,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              times: [0, 0.2, 1],
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
