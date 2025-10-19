// @ts-nocheck
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from './shared-utils';
import ColorSpaceCanvas from './ColorSpaceCanvas.tsx';
import GradientBar from './GradientBar.tsx';
import styles from './GradientModal.module.css';
import HueSlider from './HueSlider.tsx';
import StopsList from './StopsList.tsx';
import type { ColorFormat, ColorStop, GradientData } from './types';
import { generateStopId, getColorAtPosition, hsvToRgb, parseColor, rgbToHex, rgbToHsv, sortStops } from './utils';

interface GradientModalProps {
  gradient: GradientData;
  selectedStopId: string | null;
  onGradientChange: (gradient: GradientData) => void;
  onSelectedStopChange: (stopId: string | null) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  maxStops: number;
  minStops: number;
  colorFormat: ColorFormat;
}

export const GradientModal = memo(function GradientModal({
  gradient,
  selectedStopId,
  onGradientChange,
  onSelectedStopChange,
  onClose,
  anchorRef,
  maxStops = 10,
  minStops = 2,
  colorFormat = 'hex',
}: GradientModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [colorSpace, setColorSpace] = useState<'hsv' | 'hsl'>('hsv');
  const [activeTab, setActiveTab] = useState<'color' | 'stops'>('color');

  // Auto-select first stop if none selected
  useEffect(() => {
    if (!selectedStopId && gradient.stops.length > 0) {
      const firstStop = gradient.stops[0];
      logger.debug('AUTO_SELECT_FIRST_STOP', {
        timestamp: Date.now(),
        stopId: firstStop.id,
        color: firstStop.color,
        position: firstStop.position,
      });
      onSelectedStopChange(firstStop.id);
    }
  }, [selectedStopId, gradient.stops, onSelectedStopChange]);

  // Wrapped stop selection with logging
  const handleSelectStop = useCallback(
    (stopId: string | null) => {
      const stop = stopId ? gradient.stops.find((s) => s.id === stopId) : null;

      logger.debug('STOP_SELECT', {
        timestamp: Date.now(),
        stopId,
        color: stop?.color,
        position: stop?.position,
        totalStops: gradient.stops.length,
        wasNull: stopId === null,
      });

      onSelectedStopChange(stopId);
    },
    [gradient.stops, onSelectedStopChange]
  );

  // Position modal relative to anchor
  useEffect(() => {
    if (!modalRef.current || !anchorRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const modal = modalRef.current;
    const modalHeight = 600; // Increased to account for full content
    const modalWidth = 320;

    // Calculate position - default to below the button
    let top = anchor.bottom + 8;
    let left = anchor.left;

    // Check if modal would go off bottom of screen
    if (top + modalHeight > window.innerHeight) {
      // Try positioning above
      top = anchor.top - modalHeight - 8;
      // If still off screen, center vertically
      if (top < 16) {
        top = Math.max(16, (window.innerHeight - modalHeight) / 2);
      }
    }

    // Check if modal would go off right of screen
    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - 16;
    }

    // Ensure not off left
    left = Math.max(16, left);

    // Ensure not off top
    top = Math.max(16, top);

    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;

    // Ensure modal is scrolled into view (critical for headless browsers)
    requestAnimationFrame(() => {
      modal.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
    });
  }, [anchorRef]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not its children
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleModalClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Get selected stop
  const selectedStop = gradient.stops.find((stop) => stop.id === selectedStopId) || null;

  // Parse selected stop color to HSV for hue slider
  const currentHsv = useMemo(() => {
    if (!selectedStop) return { h: 0, s: 0, v: 100 };
    const rgb = parseColor(selectedStop.color);
    return rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 100 };
  }, [selectedStop]);

  // Handle hue change from hue slider
  const handleHueChange = useCallback(
    (newHue: number) => {
      if (!selectedStopId || !selectedStop) {
        logger.warn('HUE_CHANGE_NO_STOP', {
          timestamp: Date.now(),
          attemptedHue: newHue,
          selectedStopId: null,
        });
        return;
      }

      // Keep current saturation and value, only change hue
      const newHsv = { ...currentHsv, h: newHue };
      const newRgb = hsvToRgb(newHsv);
      const newColor = rgbToHex(newRgb);

      logger.debug('STOP_HUE_CHANGE', {
        timestamp: Date.now(),
        stopId: selectedStopId,
        oldColor: selectedStop.color,
        newColor,
        oldHsv: currentHsv,
        newHsv,
      });

      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === selectedStopId ? { ...stop, color: newColor } : stop
        ),
      };
      onGradientChange(newGradient);
    },
    [selectedStopId, selectedStop, currentHsv, gradient, onGradientChange]
  );

  // Handle color change from color space canvas
  const handleColorChange = useCallback(
    (color: string) => {
      if (!selectedStopId) {
        logger.warn('COLOR_CHANGE_NO_STOP', {
          timestamp: Date.now(),
          attemptedColor: color,
          selectedStopId: null,
        });
        return;
      }

      const oldStop = gradient.stops.find((stop) => stop.id === selectedStopId);

      logger.debug('STOP_COLOR_CHANGE', {
        timestamp: Date.now(),
        stopId: selectedStopId,
        oldColor: oldStop?.color,
        newColor: color,
        position: oldStop?.position,
      });

      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === selectedStopId ? { ...stop, color } : stop
        ),
      };

      onGradientChange(newGradient);
    },
    [gradient, selectedStopId, onGradientChange]
  );

  // Handle stop position change
  const handleStopMove = useCallback(
    (id: string, newPosition: number) => {
      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === id ? { ...stop, position: newPosition } : stop
        ),
      };

      onGradientChange(newGradient);
    },
    [gradient, onGradientChange]
  );

  // Handle add stop
  const handleAddStop = useCallback(
    (position: number) => {
      if (gradient.stops.length >= maxStops) {
        logger.warn('STOP_ADD_MAX_REACHED', {
          timestamp: Date.now(),
          currentCount: gradient.stops.length,
          maxStops,
        });
        return;
      }

      const color = getColorAtPosition(gradient.stops, position);
      const newStop: ColorStop = {
        id: generateStopId(),
        color,
        position,
      };

      logger.debug('STOP_ADD', {
        timestamp: Date.now(),
        position,
        interpolatedColor: color,
        totalStops: gradient.stops.length + 1,
        newStopId: newStop.id,
      });

      const newGradient = {
        ...gradient,
        stops: sortStops([...gradient.stops, newStop]),
      };

      onGradientChange(newGradient);
      handleSelectStop(newStop.id);
    },
    [gradient, maxStops, onGradientChange, handleSelectStop]
  );

  // Handle delete stop
  const handleDeleteStop = useCallback(
    (id: string) => {
      if (gradient.stops.length <= minStops) return;

      const newGradient = {
        ...gradient,
        stops: gradient.stops.filter((stop) => stop.id !== id),
      };

      onGradientChange(newGradient);

      if (selectedStopId === id) {
        handleSelectStop(newGradient.stops[0]?.id || null);
      }
    },
    [gradient, minStops, selectedStopId, onGradientChange, handleSelectStop]
  );

  // Handle angle change
  const handleAngleChange = useCallback(
    (angle: number) => {
      const newGradient = {
        ...gradient,
        angle,
      };
      onGradientChange(newGradient);
    },
    [gradient, onGradientChange]
  );

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} data-testid="gradient-modal-backdrop">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-label="Gradient editor"
        data-testid="gradient-modal"
      >
        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'color' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('color')}
          >
            Color
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'stops' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('stops')}
          >
            Stops
          </button>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Color Tab Content */}
        {activeTab === 'color' && (
          <>
            {/* Color space selector */}
            <div className={styles.colorSpaceSelector}>
              <button
                type="button"
                className={`${styles.colorSpaceTab} ${colorSpace === 'hsv' ? styles.active : ''}`}
                onClick={() => setColorSpace('hsv')}
              >
                HSV
              </button>
              <button
                type="button"
                className={`${styles.colorSpaceTab} ${colorSpace === 'hsl' ? styles.active : ''}`}
                onClick={() => setColorSpace('hsl')}
              >
                HSL
              </button>
            </div>

            {/* Color space canvas */}
            <div className={styles.canvasContainer}>
              <ColorSpaceCanvas
                color={selectedStop?.color || '#ffffff'}
                colorSpace={colorSpace}
                onChange={handleColorChange}
                disabled={false}
              />
            </div>

            {/* Hue slider */}
            <div className={styles.hueSliderContainer}>
              <HueSlider
                hue={currentHsv.h}
                onChange={handleHueChange}
                disabled={!selectedStop}
              />
            </div>

            {/* Gradient bar */}
            <div className={styles.gradientBarContainer}>
              <GradientBar
                gradient={gradient}
                selectedStopId={selectedStopId}
                onSelectStop={handleSelectStop}
                onMoveStop={handleStopMove}
                onAddStop={handleAddStop}
                onDeleteStop={handleDeleteStop}
                canAddStop={gradient.stops.length < maxStops}
                canDeleteStop={gradient.stops.length > minStops}
              />
            </div>

            {/* Angle control */}
            <div className={styles.angleControl}>
              <label htmlFor="gradient-angle">Angle</label>
              <div className={styles.angleInputGroup}>
                <input
                  id="gradient-angle"
                  type="number"
                  min="0"
                  max="360"
                  value={Math.round(gradient.angle)}
                  onChange={(e) => handleAngleChange(parseFloat(e.target.value) || 0)}
                  className={styles.angleInput}
                />
                <span>°</span>
              </div>
            </div>
          </>
        )}

        {/* Stops Tab Content */}
        {activeTab === 'stops' && (
          <div className={styles.stopsContainer}>
            <StopsList
              stops={gradient.stops}
              selectedStopId={selectedStopId}
              onSelectStop={handleSelectStop}
              onUpdateStop={(id: string, updates: Partial<ColorStop>) => {
                const newGradient = {
                  ...gradient,
                  stops: gradient.stops.map((stop) =>
                    stop.id === id ? { ...stop, ...updates } : stop
                  ),
                };
                onGradientChange(newGradient);
              }}
              onDeleteStop={handleDeleteStop}
              canDelete={gradient.stops.length > minStops}
              colorFormat={colorFormat}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default GradientModal;
