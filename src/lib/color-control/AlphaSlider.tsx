// @ts-nocheck
import * as m from 'motion/react-m';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { logger } from './shared-utils';
import styles from './AlphaSlider.module.css';

interface AlphaSliderProps {
  alpha: number; // 0-1
  color: string; // The color to show in the slider (without alpha)
  onChange: (alpha: number) => void;
  disabled?: boolean;
}

/**
 * AlphaSlider - A draggable slider for selecting alpha/opacity (0-1)
 * Uses native pointer events for precise control, Motion for animations only
 */
export const AlphaSlider = memo(function AlphaSlider({
  alpha,
  color,
  onChange,
  disabled = false
}: AlphaSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update alpha from position
  const updateAlphaFromPosition = useCallback(
    (clientX: number) => {
      if (disabled) return;

      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newAlpha = Math.round((x / rect.width) * 100) / 100; // Round to 2 decimal places

      logger.debug('ALPHA_CHANGE', {
        timestamp: Date.now(),
        oldAlpha: alpha,
        newAlpha,
        position: { x, width: rect.width },
        percentage: (x / rect.width) * 100,
      });

      onChange(newAlpha);
    },
    [alpha, onChange, disabled]
  );

  // Handle track click
  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.stopPropagation(); // Prevent modal from closing
      updateAlphaFromPosition(event.clientX);
    },
    [disabled, updateAlphaFromPosition]
  );

  // Handle thumb drag start
  const handleThumbPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);

      logger.debug('ALPHA_DRAG_START', {
        timestamp: Date.now(),
        currentAlpha: alpha,
      });
    },
    [disabled, alpha]
  );

  // Handle dragging via useEffect
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (disabled) return;
      updateAlphaFromPosition(event.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      logger.debug('ALPHA_DRAG_END', {
        timestamp: Date.now(),
        finalAlpha: alpha,
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, disabled, updateAlphaFromPosition, alpha]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      const step = event.shiftKey ? 0.1 : 0.01;
      let newAlpha = alpha;
      let handled = false;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newAlpha = Math.max(0, alpha - step);
          handled = true;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newAlpha = Math.min(1, alpha + step);
          handled = true;
          break;
        case 'Home':
          newAlpha = 0;
          handled = true;
          break;
        case 'End':
          newAlpha = 1;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        logger.debug('ALPHA_KEYBOARD', {
          timestamp: Date.now(),
          key: event.key,
          shift: event.shiftKey,
          oldAlpha: alpha,
          newAlpha,
        });
        onChange(newAlpha);
      }
    },
    [alpha, onChange, disabled]
  );

  // Calculate thumb position
  const thumbPosition = alpha * 100; // percentage

  return (
    <div className={styles.container}>
      <label htmlFor="alpha-slider" className={styles.label}>
        Alpha
      </label>
      <div
        ref={trackRef}
        className={`${styles.track} ${disabled ? styles.disabled : ''}`}
        onClick={handleTrackClick}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Alpha selector"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={alpha}
        aria-valuetext={`${Math.round(alpha * 100)}%`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-testid="alpha-slider"
        data-alpha={alpha}
      >
        {/* Checkerboard background */}
        <div className={styles.checkerboard} />

        {/* Color gradient overlay */}
        <div
          className={styles.gradient}
          style={{
            background: `linear-gradient(to right, transparent 0%, ${color} 100%)`
          }}
        />

        <m.div
          className={styles.thumb}
          onPointerDown={handleThumbPointerDown}
          whileHover={{ scale: 1.1 }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            left: `${thumbPosition}%`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          data-testid="alpha-thumb"
        >
          <div className={styles.thumbRing} />
        </m.div>
      </div>
      <div className={styles.valueDisplay}>
        {Math.round(alpha * 100)}%
      </div>
    </div>
  );
});

export default AlphaSlider;
