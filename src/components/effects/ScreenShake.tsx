/**
 * Screen shake effect component
 * Applies shake animation to container on ball landing
 */

import { useEffect, useState } from 'react';
import './ScreenShake.css';

interface ScreenShakeProps {
  /** Trigger shake effect */
  active: boolean;
  /** Shake intensity (low/medium/high) */
  intensity?: 'low' | 'medium' | 'high';
  /** Duration in ms (default: 400) */
  duration?: number;
  /** Callback when shake completes */
  onComplete?: () => void;
  children: React.ReactNode;
}

export function ScreenShake({
  active,
  intensity = 'medium',
  duration = 400,
  onComplete,
  children,
}: ScreenShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

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

  const shakeClass = isShaking ? `screen-shake screen-shake--${intensity}` : '';

  return (
    <div
      className={shakeClass}
      style={{
        animationDuration: `${duration}ms`,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
