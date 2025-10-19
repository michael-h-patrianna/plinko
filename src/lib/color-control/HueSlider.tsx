// @ts-nocheck
import * as m from 'motion/react-m';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { logger } from './shared-utils';
import styles from './HueSlider.module.css';

interface HueSliderProps {
  hue: number; // 0-360
  onChange: (hue: number) => void;
  disabled?: boolean;
}

/**
 * HueSlider - A draggable slider for selecting hue (0-360 degrees)
 * Uses native pointer events for precise control, Motion for animations only
 */
export const HueSlider = memo(function HueSlider({ hue, onChange, disabled = false }: HueSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update hue from position
  const updateHueFromPosition = useCallback(
    (clientX: number) => {
      if (disabled) return;

      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newHue = Math.round((x / rect.width) * 360);

      logger.debug('HUE_CHANGE', {
        timestamp: Date.now(),
        oldHue: hue,
        newHue,
        position: { x, width: rect.width },
        percentage: (x / rect.width) * 100,
      });

      onChange(newHue);
    },
    [hue, onChange, disabled]
  );

  // Handle track click
  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.stopPropagation(); // Prevent modal from closing
      updateHueFromPosition(event.clientX);
    },
    [disabled, updateHueFromPosition]
  );

  // Handle thumb drag start
  const handleThumbPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);

      logger.debug('HUE_DRAG_START', {
        timestamp: Date.now(),
        currentHue: hue,
      });
    },
    [disabled, hue]
  );

  // Handle dragging via useEffect
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (disabled) return;
      updateHueFromPosition(event.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      logger.debug('HUE_DRAG_END', {
        timestamp: Date.now(),
        finalHue: hue,
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
  }, [isDragging, disabled, updateHueFromPosition, hue]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      const step = event.shiftKey ? 10 : 1;
      let newHue = hue;
      let handled = false;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newHue = (hue - step + 360) % 360;
          handled = true;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newHue = (hue + step) % 360;
          handled = true;
          break;
        case 'Home':
          newHue = 0;
          handled = true;
          break;
        case 'End':
          newHue = 360;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        logger.debug('HUE_KEYBOARD', {
          timestamp: Date.now(),
          key: event.key,
          shift: event.shiftKey,
          oldHue: hue,
          newHue,
        });
        onChange(newHue);
      }
    },
    [hue, onChange, disabled]
  );

  // Calculate thumb position
  const thumbPosition = (hue / 360) * 100; // percentage

  return (
    <div className={styles.container}>
      <label htmlFor="hue-slider" className={styles.label}>
        Hue
      </label>
      <div
        ref={trackRef}
        className={`${styles.track} ${disabled ? styles.disabled : ''}`}
        onClick={handleTrackClick}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Hue selector"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hue)}
        aria-valuetext={`${Math.round(hue)} degrees`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-testid="hue-slider"
        data-hue={hue}
      >
        <m.div
          className={styles.thumb}
          onPointerDown={handleThumbPointerDown}
          whileHover={{ scale: 1.1 }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            left: `${thumbPosition}%`,
            backgroundColor: `hsl(${hue}, 100%, 50%)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          data-testid="hue-thumb"
        >
          <div className={styles.thumbRing} />
        </m.div>
      </div>
      <div className={styles.valueDisplay}>
        {Math.round(hue)}°
      </div>
    </div>
  );
});

export default HueSlider;
