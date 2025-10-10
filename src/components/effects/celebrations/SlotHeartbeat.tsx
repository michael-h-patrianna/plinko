/**
 * Heartbeat celebration animation for winning slots
 * Adapted from animations library StandardEffectsHeartbeat
 * Wraps content with layered scale, rotate, y-translation, and opacity
 * Cross-platform safe: uses only transforms and opacity
 */

import { useAnimationDriver } from '@theme/animationDrivers';
import type { ReactNode } from 'react';

interface SlotHeartbeatProps {
  children: ReactNode;
  /** Duration of heartbeat animation in seconds (default: 1.3) */
  duration?: number;
}

export function SlotHeartbeat({ children, duration = 1.3 }: SlotHeartbeatProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      style={{
        width: '100%',
        height: '100%',
      }}
      animate={{
        scale: [1, 1.3, 1, 1.3, 1.05, 1, 0.98],
        rotate: [0, -5, 2, 5, -1, 0, 0.5],
        y: [0, -2, 0, -3, -1, 0, 0],
        opacity: [1, 0.9, 0.95, 0.9, 0.97, 1, 1],
      }}
      transition={{
        duration,
        ease: [0.4, 0, 0.6, 1],
        times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.85],
      }}
    >
      {children}
    </AnimatedDiv>
  );
}
