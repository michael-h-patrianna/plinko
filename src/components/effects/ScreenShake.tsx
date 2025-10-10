/**
 * Screen shake effect component
 * Applies shake animation to container on ball landing
 * Uses animation driver for cross-platform compatibility
 */

import { useEffect, useState } from 'react';
import { UI_DELAY } from '../../constants';
import { useAnimationDriver } from '@theme/animationDrivers';

interface ScreenShakeProps {
  /** Trigger shake effect */
  active: boolean;
  /** Shake intensity (low/medium/high) or custom amplitude in pixels */
  intensity?: 'low' | 'medium' | 'high' | number;
  /** Duration in ms (default: 400) */
  duration?: number;
  /** Callback when shake completes */
  onComplete?: () => void;
  children: React.ReactNode;
}

export function ScreenShake({
  active,
  intensity = 'medium',
  duration = UI_DELAY.SCREEN_SHAKE_DURATION,
  onComplete,
  children,
}: ScreenShakeProps) {
  const [isShaking, setIsShaking] = useState(false);
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  useEffect(() => {
    if (active) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  // Shake intensity configurations (cross-platform compatible)
  // Uses translateX and translateY only (GPU accelerated)
  const getShakeKeyframes = (intensityValue: 'low' | 'medium' | 'high' | number) => {
    // If numeric intensity provided, use it directly as amplitude
    if (typeof intensityValue === 'number') {
      const amplitude = intensityValue;
      return {
        x: [0, -amplitude, amplitude, -amplitude, amplitude, -amplitude, amplitude, -amplitude * 0.7, amplitude * 0.7, -amplitude * 0.3, 0],
        y: [0, -amplitude * 0.5, amplitude * 0.5, amplitude * 0.5, -amplitude * 0.5, -amplitude * 0.5, amplitude * 0.5, amplitude * 0.3, -amplitude * 0.3, 0, 0],
      };
    }

    // Preset intensity levels
    const presets = {
      low: {
        x: [0, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
        y: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      medium: {
        x: [0, -2, 2, -2, 2, -2, 2, -2, 2, -2, 0],
        y: [0, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
      },
      high: {
        x: [0, -3, 3, -3, 3, -3, 3, -2, 2, -1, 0],
        y: [0, -2, 2, 2, -2, -2, 2, 1, -1, 0, 0],
      },
    };

    return presets[intensityValue];
  };

  const currentShake = getShakeKeyframes(intensity);
  const durationInSeconds = duration / 1000;

  return (
    <AnimatedDiv
      style={{
        width: '100%',
      }}
      animate={
        isShaking
          ? {
              x: currentShake.x,
              y: currentShake.y,
            }
          : {
              x: 0,
              y: 0,
            }
      }
      transition={{
        duration: durationInSeconds,
        ease: [0.36, 0.07, 0.19, 0.97], // cubic-bezier for natural shake
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }}
    >
      {children}
    </AnimatedDiv>
  );
}
