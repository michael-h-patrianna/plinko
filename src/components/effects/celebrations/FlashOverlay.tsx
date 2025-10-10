/**
 * Flash overlay effect for impactful burst moments
 * Quick white flash that scales from center with opacity fade
 * Cross-platform safe: uses only transforms and opacity
 */

import { useAnimationDriver } from '@theme/animationDrivers';

interface FlashOverlayProps {
  /** Delay before flash starts (ms) */
  delay?: number;
  /** Flash color (default: white) */
  color?: string;
  /** Flash intensity (0-1, default: 0.6) */
  intensity?: number;
}

export function FlashOverlay({
  delay = 0,
  color = '#FFFFFF',
  intensity = 0.6,
}: FlashOverlayProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color} 100%)`,
        zIndex: 100,
      }}
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: [0, intensity, 0],
        scale: [0.8, 1.2, 1],
      }}
      transition={{
        duration: 0.25,
        delay: delay / 1000,
        times: [0, 0.3, 1],
        ease: 'easeOut',
      }}
    />
  );
}
