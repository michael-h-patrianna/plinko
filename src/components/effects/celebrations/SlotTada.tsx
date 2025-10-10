/**
 * Tada celebration animation for winning slots (purchase offers)
 * Adapted from animations library StandardEffectsTada
 * Wraps content with layered scale, rotate, skew, and opacity
 * Cross-platform safe: uses only transforms and opacity
 */

import { useAnimationDriver } from '@theme/animationDrivers';
import type { ReactNode } from 'react';

interface SlotTadaProps {
  children: ReactNode;
  /** Duration of tada animation in seconds (default: 1.0) */
  duration?: number;
}

export function SlotTada({ children, duration = 1.0 }: SlotTadaProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      style={{
        width: '100%',
        height: '100%',
      }}
      animate={{
        scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
        rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 3, 0],
        skewX: [0, -2, -2, 1, -1, 1, -1, 1, -1, 1, 0],
        opacity: [1, 0.95, 0.95, 1, 0.98, 1, 0.98, 1, 0.98, 1, 1],
      }}
      transition={{
        duration,
        ease: [0.4, 0, 0.6, 1],
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }}
    >
      {children}
    </AnimatedDiv>
  );
}
